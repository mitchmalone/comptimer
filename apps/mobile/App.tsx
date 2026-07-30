import type { SessionState } from '@comptimer/contracts'
import {
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
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { getControllerTransport } from './src/transport'

const MIN = 60_000

type Step =
  | { name: 'setup' }
  | { name: 'connect'; session: SessionState }
  | { name: 'control'; session: SessionState }

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
        <Center>
          <Text style={styles.dim}>
            Missing EXPO_PUBLIC_SUPABASE_* env — see apps/mobile/.env.example
          </Text>
        </Center>
      ) : step.name === 'setup' ? (
        <SetupScreen
          onDone={(session) => setStep({ name: 'connect', session })}
        />
      ) : step.name === 'connect' ? (
        <ConnectScreen
          session={step.session}
          offsetMs={offsetMs}
          onConnected={(session) => setStep({ name: 'control', session })}
          onBack={() => setStep({ name: 'setup' })}
        />
      ) : (
        <ControlScreen
          session={step.session}
          offsetMs={offsetMs}
          onEnd={() => setStep({ name: 'setup' })}
        />
      )}
    </SafeAreaView>
  )
}

function SetupScreen({ onDone }: { onDone: (s: SessionState) => void }) {
  const [title, setTitle] = useState('')
  const [workMin, setWorkMin] = useState(5)
  const [restMin, setRestMin] = useState(5)
  const [cycles, setCycles] = useState(4)

  const create = () => {
    const plan = makeIntervalPlan({
      workMs: workMin * MIN,
      restMs: restMin * MIN,
      cycles,
      title: title || undefined,
    })
    onDone({
      id: Crypto.randomUUID(),
      title: title || undefined,
      timer: createTimer(plan),
      updatedAtMs: Date.now(),
    })
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.h1}>New session</Text>
      <Text style={styles.label}>Title</Text>
      <TextInput
        style={styles.input}
        placeholder='e.g. Qualifiers A'
        placeholderTextColor='#666'
        value={title}
        onChangeText={setTitle}
      />
      <Stepper label='Climb (min)' value={workMin} onChange={setWorkMin} />
      <Stepper label='Rest (min)' value={restMin} onChange={setRestMin} />
      <Stepper label='Boulders' value={cycles} onChange={setCycles} />
      <Text style={styles.dim}>
        Preset: bouldering {workMin} on / {restMin} off × {cycles}
      </Text>
      <BigButton label='Continue' onPress={create} />
    </View>
  )
}

function ConnectScreen({
  session,
  offsetMs,
  onConnected,
  onBack,
}: {
  session: SessionState
  offsetMs: number
  onConnected: (s: SessionState) => void
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
      // Row first so the display's initial fetch finds it, then the claim.
      const stamped = { ...session, updatedAtMs: Date.now() + offsetMs }
      await transport.publishSession(stamped)
      await transport.claimDisplay(code.toUpperCase(), session.id)
      onConnected(stamped)
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
      <BigButton
        label={busy ? 'Connecting…' : 'Connect'}
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
  session,
  offsetMs,
  onEnd,
}: {
  session: SessionState
  offsetMs: number
  onEnd: () => void
}) {
  const [timer, setTimer] = useState<TimerState>(session.timer)
  const [now, setNow] = useState(() => Date.now() + offsetMs)
  const [publishError, setPublishError] = useState(false)
  const transport = getControllerTransport()
  const timerRef = useRef(timer)
  timerRef.current = timer

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now() + offsetMs), 250)
    return () => clearInterval(id)
  }, [offsetMs])

  const apply = (fn: (s: TimerState, now: number) => TimerState) => {
    const at = Date.now() + offsetMs
    const next = fn(timerRef.current, at)
    setTimer(next)
    transport
      ?.publishSession({ ...session, timer: next, updatedAtMs: at })
      .then(
        () => setPublishError(false),
        () => setPublishError(true)
      )
  }

  const view = derive(timer, now)
  const progress = workPhaseProgress(timer.plan, view.phaseIndex)
  const running = view.status === 'running'
  const accent = view.phase?.kind === 'rest' ? '#ff7847' : '#3ddc84'

  return (
    <View style={styles.screen}>
      {/* Top half: mirror of what the crowd sees */}
      <View style={[styles.mirror, { borderColor: accent }]}>
        <Text style={[styles.mirrorPhase, { color: accent }]}>
          {view.status === 'finished' ? 'FINISHED' : (view.phase?.label ?? '')}
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
        <BigButton
          label={
            running ? 'Pause' : timer.status === 'paused' ? 'Resume' : 'Start'
          }
          onPress={() =>
            apply(running ? pause : timer.status === 'paused' ? resume : start)
          }
        />
        <View style={styles.row}>
          <SmallButton label='Skip' onPress={() => apply(skip)} />
          <SmallButton label='Reset' onPress={() => apply((s) => reset(s))} />
        </View>
        <Pressable onPress={onEnd}>
          <Text style={styles.link}>End session</Text>
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
        <SmallButton
          label='−'
          onPress={() => onChange(Math.max(1, value - 1))}
        />
        <Text style={styles.stepperValue}>{value}</Text>
        <SmallButton
          label='+'
          onPress={() => onChange(Math.min(99, value + 1))}
        />
      </View>
    </View>
  )
}

function BigButton({
  label,
  onPress,
  disabled,
}: {
  label: string
  onPress: () => void
  disabled?: boolean
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.bigButton,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <Text style={styles.bigButtonText}>{label}</Text>
    </Pressable>
  )
}

function SmallButton({
  label,
  onPress,
}: {
  label: string
  onPress: () => void
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.smallButton, pressed && styles.pressed]}
    >
      <Text style={styles.smallButtonText}>{label}</Text>
    </Pressable>
  )
}

function Center({ children }: { children: React.ReactNode }) {
  return <View style={styles.center}>{children}</View>
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0b0b0f' },
  screen: { flex: 1, padding: 24, gap: 16, justifyContent: 'center' },
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
  bigButton: {
    backgroundColor: '#22303f',
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  bigButtonText: { color: '#fff', fontSize: 22, fontWeight: '800' },
  smallButton: {
    backgroundColor: '#1a1a22',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  smallButtonText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  pressed: { opacity: 0.6 },
  disabled: { opacity: 0.35 },
})
