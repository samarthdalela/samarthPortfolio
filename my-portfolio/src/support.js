// Tools call promptSupport() (e.g. after a QR download) to suggest the "buy me a coffee" popup.
export const SUPPORT_EVENT = 'support:prompt'
export const promptSupport = () => window.dispatchEvent(new Event(SUPPORT_EVENT))
