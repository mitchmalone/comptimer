import { z } from 'zod'

/** Phone → display on `display:{code}`: attach this session to the display. */
export const ClaimMessageSchema = z.object({
  sessionId: z.uuid(),
})
export type ClaimMessage = z.infer<typeof ClaimMessageSchema>

// Channel names are contracts too — both surfaces must derive them identically.
export const displayChannel = (code: string) => `display:${code}`
export const sessionChannel = (sessionId: string) => `session:${sessionId}`

/** Broadcast event names used on the channels above. */
export const EVENTS = {
  claim: 'claim',
  state: 'state',
} as const
