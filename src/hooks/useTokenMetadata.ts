import { useCallback, useEffect, useState } from 'react';
import { useConnection } from '@solana/wallet-adapter-react';
import { Connection, PublicKey } from '@solana/web3.js';
import { getMint } from '@solana/spl-token';
import { Metadata } from '@metaplex-foundation/mpl-token-metadata';
import type { TokenMetadata, UseTokenMetadataReturn } from '@/types';
import { METADATA_PROGRAM_ID, METADATA_SEED, SOL_MINT, PRICE_CACHE_TTL } from '@/constants';

const metadataCache = new Map<string, TokenMetadata>();
const priceCache = new Map<string, { value: number | null; timestamp: number }>();
const priceRequests = new Map<string, Promise<number | null>>();

const fetchMintDecimals = async (connection: Connection, mintAddress: string) => {
  const mintPubkey = new PublicKey(mintAddress);
  const mintInfo = await getMint(connection, mintPubkey);
  return mintInfo.decimals ?? 0;
};

type MetadataAccountData = {
  name?: unknown;
  symbol?: unknown;
  uri?: unknown;
  data?: {
    name?: unknown;
    symbol?: unknown;
    uri?: unknown;
  };
};

type MetadataLoader = typeof Metadata & {
  fromAccountAddress?: (connection: Connection, address: PublicKey) => Promise<Metadata>;
  getPDA?: (mint: PublicKey) => Promise<PublicKey>;
  load?: (connection: Connection, address: PublicKey) => Promise<Metadata>;
};

const fetchTokenMetadata = async (connection: Connection, mintAddress: string) => {
  const mintPubkey = new PublicKey(mintAddress);
  const metadataClass = Metadata as MetadataLoader;

  const metadataPda =
    typeof metadataClass?.getPDA === 'function'
      ? await metadataClass.getPDA(mintPubkey)
      : PublicKey.findProgramAddressSync(
          [METADATA_SEED, METADATA_PROGRAM_ID.toBuffer(), mintPubkey.toBuffer()],
          METADATA_PROGRAM_ID
        )[0];

  const metadataAccount =
    typeof metadataClass?.load === 'function'
      ? await metadataClass.load(connection, metadataPda)
      : typeof metadataClass?.fromAccountAddress === 'function'
        ? await metadataClass.fromAccountAddress(connection, metadataPda)
        : null;

  if (!metadataAccount) {
    throw new Error('Metadata account not found');
  }

  const accountData = (metadataAccount as { data?: MetadataAccountData } | null)?.data ?? {};
  const rawData: MetadataAccountData = accountData?.data ?? accountData ?? {};

  const cleanString = (value: unknown) => (typeof value === 'string' ? value : '');

  return {
    name: cleanString(rawData.name ?? '').replace(/\0/g, '').trim(),
    symbol: cleanString(rawData.symbol ?? '').replace(/\0/g, '').trim(),
    uri: cleanString(rawData.uri ?? '').replace(/\0/g, '').trim(),
  };
};

const fetchOffchainMetadata = async (uri?: string) => {
  if (!uri) return {};
  try {
    const json = await fetch(uri).then((r) => r.json());
    return {
      image: json?.image as string | undefined,
      name: json?.name as string | undefined,
      symbol: json?.symbol as string | undefined,
    };
  } catch {
    return {};
  }
};

const fetchPriceUSD = async (mintAddress: string): Promise<number | null> => {
  const cached = priceCache.get(mintAddress);
  if (cached && Date.now() - cached.timestamp < PRICE_CACHE_TTL) {
    return cached.value;
  }

  const ongoing = priceRequests.get(mintAddress);
  if (ongoing) {
    return ongoing;
  }

  const request = (async () => {
    let price: number | null = null;

    try {
      if (mintAddress === SOL_MINT) {
        const res = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd'
        );
        const json = await res.json();
        price = json?.solana?.usd ?? null;
      } else {
        const res = await fetch(
          `https://api.coingecko.com/api/v3/simple/token_price/solana?contract_addresses=${mintAddress}&vs_currencies=usd`
        );
        const json = await res.json();
        const lower = mintAddress.toLowerCase();
        price = json?.[lower]?.usd ?? null;
      }
  } catch {
      price = null;
  }

    priceCache.set(mintAddress, { value: price, timestamp: Date.now() });
    return price;
  })().finally(() => {
    priceRequests.delete(mintAddress);
  });

  priceRequests.set(mintAddress, request);
  return request;
};

export const useTokenMetadata = (
  mintAddress: string | null | undefined
): UseTokenMetadataReturn => {
  const { connection } = useConnection();
  const [metadata, setMetadata] = useState<TokenMetadata | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(
    async (signal?: AbortSignal) => {
      if (!mintAddress) {
        setMetadata(null);
        setError(null);
        setLoading(false);
        return;
      }

      const cached = metadataCache.get(mintAddress);
      if (cached) {
        setMetadata(cached);
        setError(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const decimals = await fetchMintDecimals(connection, mintAddress);
        if (signal?.aborted) return;

        let chainMeta = { name: '', symbol: '', uri: '' };

        try {
          chainMeta = await fetchTokenMetadata(connection, mintAddress);
        } catch (chainErr) {
          console.warn('Failed to fetch token metadata:', chainErr);
        }

        const offchain = await fetchOffchainMetadata(chainMeta.uri);
        const priceUSD = await fetchPriceUSD(mintAddress);
        if (signal?.aborted) return;

        const fallbackSymbol =
          chainMeta.symbol ||
          offchain.symbol ||
          (mintAddress === SOL_MINT ? 'SOL' : mintAddress.slice(0, 4).toUpperCase());
        const finalName = chainMeta.name || offchain.name || fallbackSymbol;

        const finalMetadata: TokenMetadata = {
          name: finalName,
          symbol: fallbackSymbol,
          decimals,
          image: offchain.image,
          uri: chainMeta.uri,
          mint: mintAddress,
          priceUSD,
        };

        if (!signal?.aborted) {
          metadataCache.set(mintAddress, finalMetadata);
          setMetadata(finalMetadata);
        }
      } catch (err) {
        if (!signal?.aborted) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to load token metadata';
          setError(errorMessage);
          setMetadata(null);
        }
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
    },
    [connection, mintAddress]
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchData(controller.signal);
    return () => controller.abort();
  }, [fetchData]);

  return { metadata, loading, error };
};
