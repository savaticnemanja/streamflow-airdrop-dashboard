const numberFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 4,
});

const trimTrailingZeros = (value: string) => value.replace(/\.?0+$/, '');

export const formatTokenAmount = (
  amount: string | number,
  decimals = 9,
): string => {
  const raw = typeof amount === 'string' ? Number(amount) : amount;
  if (!Number.isFinite(raw) || raw === 0) return '0';

  const divisor = Math.pow(10, decimals);
  const normalized = raw / divisor;

  if (normalized < 0.0001) {
    return trimTrailingZeros(normalized.toFixed(9));
  }
  if (normalized < 1) {
    return trimTrailingZeros(normalized.toFixed(6));
  }
  if (normalized < 1000) {
    return trimTrailingZeros(normalized.toFixed(4));
  }

  return numberFormatter.format(normalized);
};

export const formatLamports = (lamports: string | number): string =>
  formatTokenAmount(lamports, 9);

export const formatNumber = (num: number | string): string => {
  const value = typeof num === 'string' ? Number(num) : num;
  if (!Number.isFinite(value)) return '0';
  return numberFormatter.format(value);
};

export const cleanString = (value?: string) =>
  value ? value.replace(/\0/g, '').trim() : '';

export const truncateAddress = (
  address: string,
  start = 4,
  end = 4,
): string => {
  if (address.length <= start + end) return address;
  return `${address.slice(0, start)}...${address.slice(-end)}`;
};
