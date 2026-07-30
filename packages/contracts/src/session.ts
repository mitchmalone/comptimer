import { z } from 'zod'
import { TimerStateSchema } from './timer'

/**
 * One timed block — the atomic unit a display renders. Owned and written by
 * the phone; the display only ever reads it.
 */
export const SessionStateSchema = z.object({
  id: z.uuid(),
  title: z.string().optional(),
  timer: TimerStateSchema,
  /** Server-stamped ms of the last transition, for clock-offset correction. */
  updatedAtMs: z.number(),
  /** Sponsor logos rendered as a strip on the display. Upload flow TBD. */
  logos: z
    .array(z.object({ url: z.url(), alt: z.string().optional() }))
    .optional(),
  /** Organizer logo shown beside the session title. */
  organizerLogoUrl: z.url().optional(),
})

export type SessionState = z.infer<typeof SessionStateSchema>
