import type {
  Direction,
  Phase,
  PhaseKind,
  PhasePlan,
  TimerState,
  TimerStatus,
} from '@comptimer/timer-core'
import { z } from 'zod'

// Every schema is pinned to the timer-core type with `satisfies`, so a change
// in either place fails typecheck instead of silently drifting.

export const PhaseKindSchema = z.enum([
  'work',
  'rest',
]) satisfies z.ZodType<PhaseKind>

export const PhaseSchema = z.object({
  kind: PhaseKindSchema,
  label: z.string(),
  durationMs: z.number().int().positive(),
}) satisfies z.ZodType<Phase>

export const DirectionSchema = z.enum([
  'down',
  'up',
]) satisfies z.ZodType<Direction>

export const PhasePlanSchema = z.object({
  title: z.string().optional(),
  direction: DirectionSchema,
  phases: z.array(PhaseSchema),
}) satisfies z.ZodType<PhasePlan>

export const TimerStatusSchema = z.enum([
  'idle',
  'running',
  'paused',
  'finished',
]) satisfies z.ZodType<TimerStatus>

export const TimerStateSchema = z.object({
  plan: PhasePlanSchema,
  status: TimerStatusSchema,
  phaseIndex: z.number().int().nonnegative(),
  phaseAnchorMs: z.number().nullable(),
  pausedRemainingMs: z.number().nullable(),
}) satisfies z.ZodType<TimerState>
