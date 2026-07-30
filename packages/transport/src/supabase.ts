import {
  ClaimMessageSchema,
  displayChannel,
  EVENTS,
  SessionStateSchema,
  sessionChannel,
  type SessionState,
} from '@comptimer/contracts'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { computeOffsetMs } from './offset'
import type {
  ConnectionStatus,
  ControllerTransport,
  DisplayTransport,
} from './types'

export type SupabaseTransportConfig = {
  url: string
  anonKey: string
}

async function estimateOffset(client: SupabaseClient): Promise<number> {
  const before = Date.now()
  const { data, error } = await client.rpc('server_time_ms')
  const after = Date.now()
  if (error || typeof data !== 'number') return 0
  return computeOffsetMs(before, after, data)
}

/**
 * Sends go over Realtime's HTTP broadcast endpoint (channel not joined), so
 * the controller needs no persistent socket — each command is one request.
 */
async function sendBroadcast(
  client: SupabaseClient,
  channelName: string,
  event: string,
  payload: unknown
): Promise<void> {
  const channel = client.channel(channelName)
  try {
    const result = await channel.send({
      type: 'broadcast',
      event,
      payload: payload as Record<string, unknown>,
    })
    if (result !== 'ok') throw new Error(`broadcast ${event}: ${result}`)
  } finally {
    void client.removeChannel(channel)
  }
}

export function createSupabaseTransport(config: SupabaseTransportConfig): {
  display: DisplayTransport
  controller: ControllerTransport
} {
  const client = createClient(config.url, config.anonKey)

  const display: DisplayTransport = {
    waitForClaim(code, onClaim) {
      const channel = client
        .channel(displayChannel(code))
        .on('broadcast', { event: EVENTS.claim }, ({ payload }) => {
          const parsed = ClaimMessageSchema.safeParse(payload)
          if (parsed.success) onClaim(parsed.data.sessionId)
        })
        .subscribe()
      return () => void client.removeChannel(channel)
    },

    subscribeSession(sessionId, onState, onStatus) {
      const channel = client
        .channel(sessionChannel(sessionId))
        .on('broadcast', { event: EVENTS.state }, ({ payload }) => {
          const parsed = SessionStateSchema.safeParse(payload)
          if (parsed.success) onState(parsed.data)
        })
        .subscribe((status) => {
          if (!onStatus) return
          const mapped: ConnectionStatus =
            status === 'SUBSCRIBED'
              ? 'connected'
              : status === 'CHANNEL_ERROR' || status === 'TIMED_OUT'
                ? 'disconnected'
                : 'connecting'
          onStatus(mapped)
        })
      return () => void client.removeChannel(channel)
    },

    async fetchSession(sessionId) {
      const { data, error } = await client
        .from('sessions')
        .select('state')
        .eq('id', sessionId)
        .maybeSingle()
      if (error || !data) return null
      const parsed = SessionStateSchema.safeParse(data.state)
      return parsed.success ? parsed.data : null
    },

    estimateServerOffsetMs: () => estimateOffset(client),
  }

  const controller: ControllerTransport = {
    async claimDisplay(code, sessionId) {
      await sendBroadcast(client, displayChannel(code), EVENTS.claim, {
        sessionId,
      } satisfies { sessionId: string })
    },

    async publishSession(state: SessionState) {
      await sendBroadcast(client, sessionChannel(state.id), EVENTS.state, state)
      const { error } = await client
        .from('sessions')
        .upsert({ id: state.id, state })
      if (error) throw new Error(`session upsert failed: ${error.message}`)
    },

    estimateServerOffsetMs: () => estimateOffset(client),
  }

  return { display, controller }
}
