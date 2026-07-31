// Real infra domains. The design mock used `.app` placeholders; the stack is
// comptimer.com (www / app / admin / api). The iOS app is TestFlight-only for
// now, so the App Store CTA is a placeholder anchor until a listing exists.
export const links = {
  display: 'https://app.comptimer.com',
  ios: '#', // TODO: App Store URL once the listing is live
  email: 'hello@comptimer.com', // TODO: confirm support address
  instagram: '#',
} as const
