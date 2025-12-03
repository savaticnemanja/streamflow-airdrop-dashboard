import axios from 'axios';
import { apiClient } from './axios';
import type { Airdrop, ClaimableAirdrop, AirdropListResponse, ClaimantInfo } from '@/types';
import { DEFAULT_CHAIN, DEFAULT_LIMIT } from '@/constants';

const parseApiError = (error: unknown, fallback: string): string => {
  if (!axios.isAxiosError(error)) return fallback;

  const data = error.response?.data;
  const asObject =
    typeof data === 'object' && data !== null ? (data as Record<string, string | undefined>) : null;
  const message =
    (asObject?.detail && typeof asObject.detail === 'string' && asObject.detail) ||
    (asObject?.message && typeof asObject.message === 'string' && asObject.message) ||
    (typeof error.response?.statusText === 'string' ? error.response.statusText : undefined) ||
    (typeof error.message === 'string' ? error.message : undefined) ||
    fallback;

  return typeof message === 'string' && message.length > 0 ? message : fallback;
};

const request = async <T>(promise: Promise<{ data: T }>, fallback: string): Promise<T> => {
  try {
    const { data } = await promise;
    return data;
  } catch (error) {
    const message = parseApiError(error, fallback);
    throw new Error(message || fallback);
  }
};

function buildQueryString(params: Record<string, string | number | boolean | undefined>): string {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });
  
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

export const fetchClaimableAirdrops = async (
  address: string,
  limit: number = DEFAULT_LIMIT,
  skimZeroValued: boolean = false
): Promise<ClaimableAirdrop[]> => {
  const queryString = buildQueryString({ limit, skimZeroValued });
  const url = `/airdrops/claimable/${address}/${queryString}`;

  const data = await request<AirdropListResponse>(
    apiClient.get<AirdropListResponse>(url),
    'Failed to fetch claimable airdrops'
  );

  return data.items;
};

export const fetchAirdropsByAddresses = async (
  addresses: string[],
  chain: string = DEFAULT_CHAIN
): Promise<Airdrop[]> => {
  if (addresses.length === 0) {
    return [];
  }
  const addressesParam = addresses.join(',');
  const queryString = buildQueryString({ chain, addresses: addressesParam });
  const url = `/airdrops/${queryString}`;

  return request<Airdrop[]>(apiClient.get<Airdrop[]>(url), 'Failed to fetch airdrops');
};

export const fetchAirdropById = async (id: string): Promise<Airdrop | null> => {
  try {
    const { data } = await apiClient.get<Airdrop>(`/airdrops/${id}`);
    return data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null;
    }
    throw new Error(parseApiError(error, 'Failed to fetch airdrop'));
  }
};

export const checkEligibility = async (
  claimantAddresses: string[]
): Promise<ClaimableAirdrop[]> => {
  if (claimantAddresses.length === 0) {
    return [];
  }

  return request<ClaimableAirdrop[]>(
    apiClient.post<ClaimableAirdrop[]>('/airdrops/check-eligibility', { claimantAddresses }),
    'Failed to check eligibility'
  );
};

export const fetchClaimant = async (
  distributorAddress: string,
  claimantAddress: string
): Promise<ClaimantInfo> => {
  const url = `/airdrops/${distributorAddress}/claimants/${claimantAddress}`;

  return request<ClaimantInfo>(apiClient.get<ClaimantInfo>(url), 'Failed to fetch claimant');
};
