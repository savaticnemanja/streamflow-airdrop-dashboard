import axios from 'axios';
import { apiClient } from './axios';
import { parseApiError, request } from './apiUtils';
import type {
  Airdrop,
  ClaimableAirdrop,
  AirdropListResponse,
  ClaimantInfo,
} from '@/types';
import { DEFAULT_CHAIN, DEFAULT_LIMIT } from '@/constants';

function buildQueryString(
  params: Record<string, string | number | boolean | undefined>,
): string {
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
  skimZeroValued: boolean = false,
): Promise<ClaimableAirdrop[]> => {
  const queryString = buildQueryString({ limit, skimZeroValued });
  const url = `/airdrops/claimable/${address}/${queryString}`;

  const data = await request<AirdropListResponse>(
    apiClient.get<AirdropListResponse>(url),
    'Failed to fetch claimable airdrops',
  );

  return data.items;
};

export const fetchAirdropsByAddresses = async (
  addresses: string[],
  chain: string = DEFAULT_CHAIN,
): Promise<Airdrop[]> => {
  if (addresses.length === 0) {
    return [];
  }
  const addressesParam = addresses.join(',');
  const queryString = buildQueryString({ chain, addresses: addressesParam });
  const url = `/airdrops/${queryString}`;

  return request<Airdrop[]>(
    apiClient.get<Airdrop[]>(url),
    'Failed to fetch airdrops',
  );
};

export const fetchAirdropById = async (id: string): Promise<Airdrop | null> => {
  try {
    const { data } = await apiClient.get<Airdrop>(`/airdrops/${id}`);
    return data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null;
    }
    throw new Error(parseApiError(error, 'Failed to fetch airdrop'));
  }
};

export const checkEligibility = async (
  claimantAddresses: string[],
): Promise<ClaimableAirdrop[]> => {
  if (claimantAddresses.length === 0) {
    return [];
  }

  return request<ClaimableAirdrop[]>(
    apiClient.post<ClaimableAirdrop[]>('/airdrops/check-eligibility', {
      claimantAddresses,
    }),
    'Failed to check eligibility',
  );
};

export const fetchClaimant = async (
  distributorAddress: string,
  claimantAddress: string,
): Promise<ClaimantInfo> => {
  const url = `/airdrops/${distributorAddress}/claimants/${claimantAddress}`;

  return request<ClaimantInfo>(
    apiClient.get<ClaimantInfo>(url),
    'Failed to fetch claimant',
  );
};
