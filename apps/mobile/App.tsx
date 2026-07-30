import type { SessionState } from '@comptimer/contracts'
import {
  adjust,
  createTimer,
  derive,
  formatClock,
  makeIntervalPlan,
  pause,
  reset,
  resume,
  skip,
  start,
  workPhaseProgress,
  type TimerState,
} from '@comptimer/timer-core'
import { StatusBar } from 'expo-status-bar'
import * as Crypto from 'expo-crypto'
import { useEffect, useRef, useState } from 'react'
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { getControllerTransport } from './src/transport'

const MIN = 60_000

/** One timed block a judge configures. Becomes a PhasePlan when it runs. */
type SessionConfig = {
  title: string
  workMin: number
  restMin: number
  cycles: number
}

/** Phone-local. The display never learns competitions exist — it just
 * renders whatever session state arrives under the paired id. */
type Competition = {
  sessions: SessionConfig[]
  organizerLogoUrl: string
  sponsorLogoUrls: string
}

const defaultSession = (): SessionConfig => ({
  title: '',
  workMin: 5,
  restMin: 5,
  cycles: 4,
})

type Step =
  | { name: 'setup' }
  | { name: 'connect'; comp: Competition }
  | { name: 'control'; comp: Competition; sessionId: string }

export default function App() {
  const [step, setStep] = useState<Step>({ name: 'setup' })
  const [offsetMs, setOffsetMs] = useState(0)
  const transport = getControllerTransport()

  useEffect(() => {
    transport?.estimateServerOffsetMs().then(setOffsetMs, () => {})
  }, [transport])

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar style='light' />
      {!transport ? (
        <View style={styles.center}>
          <Text style={styles.dim}>
            Missing EXPO_PUBLIC_SUPABASE_* env — see apps/mobile/.env.example
          </Text>
        </View>
      ) : step.name === 'setup' ? (
        <SetupScreen onDone={(comp) => setStep({ name: 'connect', comp })} />
      ) : step.name === 'connect' ? (
        <ConnectScreen
          comp={step.comp}
          offsetMs={offsetMs}
          onConnected={(sessionId) =>
            setStep({ name: 'control', comp: step.comp, sessionId })
          }
          onBack={() => setStep({ name: 'setup' })}
        />
      ) : (
        <ControlScreen
          comp={step.comp}
          sessionId={step.sessionId}
          offsetMs={offsetMs}
          onEnd={() => setStep({ name: 'setup' })}
        />
      )}
    </SafeAreaView>
  )
}

function toPlan(config: SessionConfig) {
  return makeIntervalPlan({
    workMs: config.workMin * MIN,
    restMs: config.restMin * MIN,
    cycles: config.cycles,
    title: config.title || undefined,
  })
}

function toSessionState(
  comp: Competition,
  index: number,
  sessionId: string,
  timer: TimerState,
  updatedAtMs: number
): SessionState {
  const config = comp.sessions[index]
  const sponsors = comp.sponsorLogoUrls
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.startsWith('http'))
  return {
    id: sessionId,
    title: config?.title || undefined,
    timer,
    updatedAtMs,
    logos: sponsors.length ? sponsors.map((url) => ({ url })) : undefined,
    organizerLogoUrl: comp.organizerLogoUrl.startsWith('http')
      ? comp.organizerLogoUrl
      : undefined,
  }
}

function SetupScreen({ onDone }: { onDone: (comp: Competition) => void }) {
  const [sessions, setSessions] = useState<SessionConfig[]>([defaultSession()])
  const [organizerLogoUrl, setOrganizerLogoUrl] = useState('')
  const [sponsorLogoUrls, setSponsorLogoUrls] = useState('')

  const update = (i: number, patch: Partial<SessionConfig>) =>
    setSessions((all) => all.map((s, j) => (i === j ? { ...s, ...patch } : s)))

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.screenScroll}
    >
      <Text style={styles.h1}>
        {sessions.length > 1 ? 'New competition' : 'New session'}
      </Text>

      {sessions.map((s, i) => (
        <View key={i} style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Session {i + 1}</Text>
            {sessions.length > 1 && (
              <Pressable
                onPress={() =>
                  setSessions((all) => all.filter((_, j) => j !== i))
                }
              >
                <Text style={styles.remove}>remove</Text>
              </Pressable>
            )}
          </View>
          <TextInput
            style={styles.input}
            placeholder={`e.g. ${i === 0 ? 'Qualifiers A' : 'Finals'}`}
            placeholderTextColor='#666'
            value={s.title}
            onChangeText={(title) => update(i, { title })}
          />
          <Stepper
            label='Climb (min)'
            value={s.workMin}
            onChange={(workMin) => update(i, { workMin })}
          />
          <Stepper
            label='Rest (min)'
            value={s.restMin}
            onChange={(restMin) => update(i, { restMin })}
          />
          <Stepper
            label='Boulders'
            value={s.cycles}
            onChange={(cycles) => update(i, { cycles })}
          />
          <Text style={styles.dim}>
            {s.workMin} on / {s.restMin} off × {s.cycles}
          </Text>
        </View>
      ))}

      <Pressable
        onPress={() => setSessions((all) => [...all, defaultSession()])}
      >
        <Text style={styles.link}>+ Add session</Text>
      </Pressable>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Logos (optional)</Text>
        <Text style={styles.label}>Organizer logo URL</Text>
        <TextInput
          style={styles.input}
          placeholder='https://…'
          placeholderTextColor='#666'
          autoCapitalize='none'
          value={organizerLogoUrl}
          onChangeText={setOrganizerLogoUrl}
        />
        <Text style={styles.label}>Sponsor logo URLs (comma separated)</Text>
        <TextInput
          style={styles.input}
          placeholder='https://…, https://…'
          placeholderTextColor='#666'
          autoCapitalize='none'
          value={sponsorLogoUrls}
          onChangeText={setSponsorLogoUrls}
        />
      </View>

      <SkeuButton
        label='Continue'
        kind='primary'
        onPress={() => onDone({ sessions, organizerLogoUrl, sponsorLogoUrls })}
      />
    </ScrollView>
  )
}

function ConnectScreen({
  comp,
  offsetMs,
  onConnected,
  onBack,
}: {
  comp: Competition
  offsetMs: number
  onConnected: (sessionId: string) => void
  onBack: () => void
}) {
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const transport = getControllerTransport()

  const connect = async () => {
    if (!transport || code.length !== 6) return
    setBusy(true)
    setError(null)
    try {
      const sessionId = Crypto.randomUUID()
      const plan = toPlan(comp.sessions[0] ?? defaultSession())
      // Row first so the display's initial fetch finds it, then the claim.
      await transport.publishSession(
        toSessionState(
          comp,
          0,
          sessionId,
          createTimer(plan),
          Date.now() + offsetMs
        )
      )
      await transport.claimDisplay(code.toUpperCase(), sessionId)
      onConnected(sessionId)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Connection failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.h1}>Connect a display</Text>
      <Text style={styles.dim}>
        Open app.comptimer.com on the venue screen and enter its code
      </Text>
      <TextInput
        style={[styles.input, styles.codeInput]}
        placeholder='ABC123'
        placeholderTextColor='#666'
        autoCapitalize='characters'
        autoCorrect={false}
        maxLength={6}
        value={code}
        onChangeText={(t) => setCode(t.toUpperCase())}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <SkeuButton
        label={busy ? 'Connecting…' : 'Connect'}
        kind='primary'
        onPress={connect}
        disabled={busy || code.length !== 6}
      />
      <Pressable onPress={onBack}>
        <Text style={styles.link}>Back</Text>
      </Pressable>
    </View>
  )
}

function ControlScreen({
  comp,
  sessionId,
  offsetMs,
  onEnd,
}: {
  comp: Competition
  sessionId: string
  offsetMs: number
  onEnd: () => void
}) {
  const [index, setIndex] = useState(0)
  const [timer, setTimer] = useState<TimerState>(() =>
    createTimer(toPlan(comp.sessions[0] ?? defaultSession()))
  )
  const [now, setNow] = useState(() => Date.now() + offsetMs)
  const [publishError, setPublishError] = useState(false)
  const transport = getControllerTransport()
  const timerRef = useRef(timer)
  timerRef.current = timer

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now() + offsetMs), 250)
    return () => clearInterval(id)
  }, [offsetMs])

  const publish = (next: TimerState, atIndex: number, at: number) => {
    setTimer(next)
    transport
      ?.publishSession(toSessionState(comp, atIndex, sessionId, next, at))
      .then(
        () => setPublishError(false),
        () => setPublishError(true)
      )
  }

  const apply = (fn: (s: TimerState, now: number) => TimerState) => {
    const at = Date.now() + offsetMs
    publish(fn(timerRef.current, at), index, at)
  }

  const nextSession = () => {
    const nextIndex = index + 1
    const config = comp.sessions[nextIndex]
    if (!config) return
    const at = Date.now() + offsetMs
    setIndex(nextIndex)
    publish(createTimer(toPlan(config)), nextIndex, at)
  }

  const view = derive(timer, now)
  const progress = workPhaseProgress(timer.plan, view.phaseIndex)
  const running = view.status === 'running'
  const finished = view.status === 'finished'
  const hasNext = index + 1 < comp.sessions.length
  const accent = view.phase?.kind === 'rest' ? '#ff7847' : '#3ddc84'
  const title = comp.sessions[index]?.title || `Session ${index + 1}`

  return (
    <View style={styles.screen}>
      {/* Top half: mirror of what the crowd sees */}
      <View style={[styles.mirror, { borderColor: accent }]}>
        <Text style={styles.dim}>
          {comp.sessions.length > 1
            ? `${title} · ${index + 1} / ${comp.sessions.length}`
            : title}
        </Text>
        <Text style={[styles.mirrorPhase, { color: accent }]}>
          {finished ? 'FINISHED' : (view.phase?.label ?? '')}
        </Text>
        <Text style={styles.mirrorClock}>
          {formatClock(view.phaseRemainingMs)}
        </Text>
        <Text style={styles.dim}>
          BOULDER {progress.current} / {progress.total}
          {publishError ? '  ·  ⚠︎ not syncing' : ''}
        </Text>
      </View>

      {/* Bottom half: controls */}
      <View style={styles.controls}>
        {finished && hasNext ? (
          <SkeuButton
            label={`Next: ${comp.sessions[index + 1]?.title || `Session ${index + 2}`}`}
            kind='primary'
            onPress={nextSession}
          />
        ) : (
          <SkeuButton
            label={
              running ? 'Pause' : timer.status === 'paused' ? 'Resume' : 'Start'
            }
            kind={running ? 'caution' : 'primary'}
            onPress={() =>
              apply(
                running ? pause : timer.status === 'paused' ? resume : start
              )
            }
          />
        )}
        <View style={styles.row}>
          <SkeuButton
            small
            label='−30s'
            onPress={() => apply((s, at) => adjust(s, -30_000, at))}
          />
          <SkeuButton
            small
            label='+30s'
            onPress={() => apply((s, at) => adjust(s, 30_000, at))}
          />
          <SkeuButton small label='Skip' onPress={() => apply(skip)} />
          <SkeuButton
            small
            kind='danger'
            label='Reset'
            onPress={() => apply((s) => reset(s))}
          />
        </View>
        {!finished && hasNext ? (
          <Pressable onPress={nextSession}>
            <Text style={styles.link}>
              Skip to {comp.sessions[index + 1]?.title || 'next session'} →
            </Text>
          </Pressable>
        ) : null}
        <Pressable onPress={onEnd}>
          <Text style={styles.link}>
            End {comp.sessions.length > 1 ? 'competition' : 'session'}
          </Text>
        </Pressable>
      </View>
    </View>
  )
}

function Stepper({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (v: number) => void
}) {
  return (
    <View style={styles.stepperRow}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        <SkeuButton
          small
          label='−'
          onPress={() => onChange(Math.max(1, value - 1))}
        />
        <Text style={styles.stepperValue}>{value}</Text>
        <SkeuButton
          small
          label='+'
          onPress={() => onChange(Math.min(99, value + 1))}
        />
      </View>
    </View>
  )
}

/**
 * Skeuomorphic button, pure RN styles: outer drop shadow, inner top
 * highlight, and a pressed state that sinks the face and kills the shadow.
 */
function SkeuButton({
  label,
  onPress,
  kind = 'neutral',
  small,
  disabled,
}: {
  label: string
  onPress: () => void
  kind?: 'primary' | 'caution' | 'danger' | 'neutral'
  small?: boolean
  disabled?: boolean
}) {
  const face = {
    primary: '#2e7d4f',
    caution: '#8a6d1f',
    danger: '#7d2e2e',
    neutral: '#3a4552',
  }[kind]

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        skeu.base,
        small ? skeu.small : skeu.big,
        { backgroundColor: face },
        pressed ? skeu.pressed : skeu.raised,
        disabled && skeu.disabled,
      ]}
    >
      {({ pressed }) => (
        <>
          <View style={[skeu.highlight, pressed && { opacity: 0.05 }]} />
          <Text style={[skeu.text, small ? skeu.textSmall : null]}>
            {label}
          </Text>
        </>
      )}
    </Pressable>
  )
}

const skeu = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.55)',
  },
  big: { paddingVertical: 18, paddingHorizontal: 24 },
  small: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 11,
    minWidth: 64,
  },
  raised: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.55,
    shadowRadius: 5,
    elevation: 6,
    transform: [{ translateY: 0 }],
  },
  pressed: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.35,
    shadowRadius: 2,
    elevation: 2,
    transform: [{ translateY: 2 }],
  },
  highlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '48%',
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderTopLeftRadius: 13,
    borderTopRightRadius: 13,
  },
  text: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.45)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  textSmall: { fontSize: 16 },
  disabled: { opacity: 0.35 },
})

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0b0b0f' },
  scroll: { flex: 1 },
  screen: { flex: 1, padding: 24, gap: 16, justifyContent: 'center' },
  screenScroll: { padding: 24, gap: 16, paddingBottom: 48 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  h1: { color: '#fff', fontSize: 28, fontWeight: '800' },
  label: { color: '#aaa', fontSize: 16 },
  dim: { color: '#888', fontSize: 14 },
  error: { color: '#ff5a5a', fontSize: 14 },
  link: { color: '#7aa2ff', fontSize: 16, textAlign: 'center', padding: 8 },
  remove: { color: '#ff8080', fontSize: 14 },
  card: {
    backgroundColor: '#12121a',
    borderRadius: 16,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  input: {
    backgroundColor: '#16161d',
    color: '#fff',
    borderRadius: 10,
    padding: 14,
    fontSize: 18,
  },
  codeInput: {
    fontSize: 32,
    letterSpacing: 12,
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
  stepperRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepperValue: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    minWidth: 44,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mirror: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  mirrorPhase: { fontSize: 22, fontWeight: '800', letterSpacing: 4 },
  mirrorClock: {
    color: '#fff',
    fontSize: 88,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  controls: { flex: 1, justifyContent: 'center', gap: 16 },
})
