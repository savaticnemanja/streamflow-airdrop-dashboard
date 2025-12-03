import type { Connection, PublicKey } from '@solana/web3.js';
import type { Metadata as MetadataType } from '@metaplex-foundation/mpl-token-metadata';

export interface MetadataAccountData {
  name?: string;
  symbol?: string;
  uri?: string;
  data?: {
    name?: string;
    symbol?: string;
    uri?: string;
  };
}

export type MetadataLoader = {
  fromAccountAddress?: (connection: Connection, address: PublicKey) => Promise<MetadataType>;
  getPDA?: (mint: PublicKey) => Promise<PublicKey>;
  load?: (connection: Connection, address: PublicKey) => Promise<MetadataType>;
} & typeof import('@metaplex-foundation/mpl-token-metadata').Metadata;
