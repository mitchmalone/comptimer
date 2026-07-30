import type { SessionState } from '@comptimer/contracts'

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected'

/** What a display (TV) needs. Read-only: it never sends a command. */
export type DisplayTransport = {
  /** Listen for a phone claiming this display code. Returns unsubscribe. */
  waitForClaim(code: string, onClaim: (sessionId: string) => void): () => void
  /** Live session state + connection status. Returns unsubscribe. */
  subscribeSession(
    sessionId: string,
    onState: (state: SessionState) => void,
    onStatus?: (status: ConnectionStatus) => void
  ): () => void
  /** Durable state, for rehydration after refresh/reconnect. */
  fetchSession(sessionId: string): Promise<SessionState | null>
  /** serverNow − localNow, added to Date.now() before any derive. */
  estimateServerOffsetMs(): Promise<number>
}

/** What a controller (phone) needs. It owns the session. */
export type ControllerTransport = {
  claimDisplay(code: string, sessionId: string): Promise<void>
  /** Broadcast live + upsert durable row. */
  publishSession(state: SessionState): Promise<void>
  estimateServerOffsetMs(): Promise<number>
}
