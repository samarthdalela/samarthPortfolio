// Builds a UPI deep link: keeps "@" readable and encodes spaces as %20, which UPI apps expect.
export const upiUrl = (params) =>
  'upi://pay?' +
  Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== '')
    .map(([k, v]) => `${k}=${encodeURIComponent(String(v)).replace(/%40/g, '@')}`)
    .join('&')
