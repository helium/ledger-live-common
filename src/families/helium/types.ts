import type { BigNumber } from "bignumber.js";
import type {
  TransactionCommon,
  TransactionCommonRaw,
} from "../../types/transaction";

// for legacy reasons export the types
export type CoreStatics = Record<string, never>;
export type CoreAccountSpecifics = Record<string, never>;
export type CoreOperationSpecifics = Record<string, never>;
export type CoreCurrencySpecifics = Record<string, never>;

export type NetworkInfo = {
  family: "helium";
};

export type NetworkInfoRaw = {
  family: "helium";
};

export type TransactionMode = "send";

export type Transaction = TransactionCommon & {
  family: "helium";
  mode: TransactionMode;
  fees?: BigNumber;
  networkInfo?: NetworkInfo;
  memo?: string;
};
export type TransactionRaw = TransactionCommonRaw & {
  family: "helium";
  mode: TransactionMode;
  fees?: string;
  networkInfo?: NetworkInfoRaw;
  memo?: string;
};

export const reflect = (_declare: any): void => {};
