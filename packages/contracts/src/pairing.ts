import { z } from 'zod'

// Ephemeral code a display shows as a QR; the phone claims it to pair.
// 6 chars, unambiguous alphabet (no 0/O, 1/I) so it can be typed as a fallback.
export const DisplayCodeSchema = z
  .string()
  .length(6)
  .regex(/^[A-HJ-NP-Z2-9]+$/)

export type DisplayCode = z.infer<typeof DisplayCodeSchema>
