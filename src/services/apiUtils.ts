import axios from 'axios';

export const parseApiError = (error: unknown, fallback: string): string => {
  if (!axios.isAxiosError(error)) return fallback;

  const data = error.response?.data;
  const asObject =
    typeof data === 'object' && data !== null
      ? (data as Record<string, string | undefined>)
      : null;
  const message =
    (asObject?.detail &&
      typeof asObject.detail === 'string' &&
      asObject.detail) ||
    (asObject?.message &&
      typeof asObject.message === 'string' &&
      asObject.message) ||
    (typeof error.response?.statusText === 'string'
      ? error.response.statusText
      : undefined) ||
    (typeof error.message === 'string' ? error.message : undefined) ||
    fallback;

  return typeof message === 'string' && message.length > 0 ? message : fallback;
};

export const request = async <T>(
  promise: Promise<{ data: T }>,
  fallback: string,
): Promise<T> => {
  try {
    const { data } = await promise;
    return data;
  } catch (error) {
    const message = parseApiError(error, fallback);
    throw new Error(message || fallback);
  }
};
