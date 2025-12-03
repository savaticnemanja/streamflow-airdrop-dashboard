export interface ClaimantInfo {
  distributorAddress: string;
  address: string;
  amountUnlocked: string;
  amountLocked: string;
  amountClaimed: string;
  rawAmountUnlocked?: string;
  rawAmountLocked?: string;
  rawAmountClaimed?: string;
  proof?: string[];
  [key: string]: unknown;
}
