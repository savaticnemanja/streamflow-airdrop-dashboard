import type { Airdrop, ClaimableAirdrop, AirdropListResponse, ClaimantInfo } from '@/types';
import { API_BASE_URL, DEFAULT_CHAIN, DEFAULT_LIMIT } from '@/constants';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `API request failed: ${response.statusText}`;
    
    try {
      const errorData = JSON.parse(errorText);
      errorMessage = errorData.detail || errorData.message || errorMessage;
    } catch {
      errorMessage = errorText || errorMessage;
    }
    
    throw new Error(errorMessage);
  }
  
  return response.json();
}

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
  const url = `${API_BASE_URL}/airdrops/claimable/${address}/${queryString}`;
  
  const response = await fetch(url);
  const data: AirdropListResponse = await handleResponse(response);
  
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
  const url = `${API_BASE_URL}/airdrops/${queryString}`;
  
  const response = await fetch(url);
  return handleResponse<Airdrop[]>(response);
};

export const fetchAirdropById = async (id: string): Promise<Airdrop | null> => {
  const url = `${API_BASE_URL}/airdrops/${id}`;
  
  try {
    const response = await fetch(url);
    
    if (response.status === 404) {
      return null;
    }
    
    return handleResponse<Airdrop>(response);
  } catch (error) {
    if (error instanceof Error && error.message.includes('404')) {
      return null;
    }
    throw error;
  }
};

export const checkEligibility = async (
  claimantAddresses: string[]
): Promise<ClaimableAirdrop[]> => {
  if (claimantAddresses.length === 0) {
    return [];
  }
  
  const url = `${API_BASE_URL}/airdrops/check-eligibility`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ claimantAddresses }),
  });
  
  return handleResponse<ClaimableAirdrop[]>(response);
};

export const fetchClaimant = async (
  distributorAddress: string,
  claimantAddress: string
): Promise<ClaimantInfo> => {
  const url = `${API_BASE_URL}/airdrops/${distributorAddress}/claimants/${claimantAddress}`;
  
  const response = await fetch(url);
  return handleResponse<ClaimantInfo>(response);
};
