export function clamp01(x: number) {
  if (Number.isNaN(x)) return 0
  return Math.min(1, Math.max(0, x))
}

export function clampNonNegative(x: number) {
  if (Number.isNaN(x)) return 0
  return Math.max(0, x)
}

/**
 * Standard amortizing loan payment (monthly).
 * monthlyRate is expressed as a decimal (e.g. 0.0025 for 0.25%/month).
 */
export function monthlyPayment(principal: number, monthlyRate: number, months: number) {
  const p = clampNonNegative(principal)
  const m = Math.max(0, Math.floor(months))
  if (m <= 0) return 0
  if (p <= 0) return 0
  const r = monthlyRate
  if (r <= 0) return p / m
  const pow = Math.pow(1 + r, m)
  return (p * r * pow) / (pow - 1)
}

export function totalLoanPayments(monthly: number, months: number) {
  const m = Math.max(0, Math.floor(months))
  return clampNonNegative(monthly) * m
}
