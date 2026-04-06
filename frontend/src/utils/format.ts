/**
 * Format a number as USD currency: $1,234,567
 */
export function formatCurrency(value: number | null | undefined): string {
  if (value == null) return '$0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format as compact currency: $1.2M, $345K
 */
export function formatCurrencyCompact(value: number | null | undefined): string {
  if (value == null) return '$0';
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(0)}K`;
  return formatCurrency(value);
}

/**
 * Format a decimal as percentage: 0.07 → "7.0%"
 */
export function formatPercent(value: number | null | undefined, decimals = 1): string {
  if (value == null) return '0%';
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Format a percentage that is already in percent form: 7.0 → "7.0%"
 */
export function formatPercentDirect(value: number | null | undefined, decimals = 1): string {
  if (value == null) return '0%';
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format a number with commas: 1234567 → "1,234,567"
 */
export function formatNumber(value: number | null | undefined): string {
  if (value == null) return '0';
  return new Intl.NumberFormat('en-US').format(value);
}

/**
 * Returns 'positive', 'negative', or 'neutral' classification for styling
 */
export function valueSign(value: number): 'positive' | 'negative' | 'neutral' {
  if (value > 0) return 'positive';
  if (value < 0) return 'negative';
  return 'neutral';
}
