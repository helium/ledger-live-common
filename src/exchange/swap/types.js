// @flow

import { BigNumber } from "bignumber.js";
import type { Account, AccountLike } from "../../types/account";
import type {
  AccountRawLike,
  AccountRaw,
  Operation,
  Transaction,
  CryptoCurrency,
  TokenCurrency,
  TransactionRaw,
} from "../../types";

export type Exchange = {
  fromParentAccount: ?Account,
  fromAccount: AccountLike,
  toParentAccount: ?Account,
  toAccount: AccountLike,
};

export type ExchangeRaw = {
  fromParentAccount: ?AccountRaw,
  fromAccount: AccountRawLike,
  toParentAccount: ?AccountRaw,
  toAccount: AccountRawLike,
};

export type ExchangeRate = {
  rate: BigNumber, // NB Raw rate, for display
  magnitudeAwareRate: BigNumber, // NB rate between satoshi units
  rateId: string,
  provider: string,
  tradeMethod: "fixed" | "float",
  error?: Error,
  providerURL?: ?string,
};

export type ExchangeRateRaw = {
  rate: string,
  magnitudeAwareRate: string,
  rateId: string,
  provider: string,
  tradeMethod: "fixed" | "float",
  error?: string,
  providerURL?: ?string,
};

export type AvailableProvider = {
  provider: string,
  supportedCurrencies: string[],
};

export type GetExchangeRates = (
  Exchange,
  Transaction
) => Promise<ExchangeRate[]>;
export type GetProviders = () => Promise<AvailableProvider[]>;

export type InitSwapResult = {
  transaction: Transaction,
  swapId: string,
};

type ValidSwapStatus =
  | "confirming"
  | "finished"
  | "exchanging"
  | "hold"
  | "sending"
  | "waiting"
  | "overdue"
  | "refunded"
  | "new"
  | "expired"
  | "failed";

export type SwapStatusRequest = {
  provider: string,
  swapId: string,
};

export type SwapStatus = {
  provider: string,
  swapId: string,
  status: ValidSwapStatus,
};

export type GetStatus = (SwapStatusRequest) => Promise<SwapStatus>;
export type UpdateAccountSwapStatus = (Account) => Promise<?Account>;
export type GetMultipleStatus = (SwapStatusRequest[]) => Promise<SwapStatus[]>;

export type SwapRequestEvent =
  | { type: "init-swap-requested" }
  | { type: "init-swap-error", error: Error }
  | { type: "init-swap-result", initSwapResult: InitSwapResult };

export type SwapHistorySection = {
  day: Date,
  data: MappedSwapOperation[],
};

export type MappedSwapOperation = {
  fromAccount: AccountLike,
  fromParentAccount?: Account,
  toAccount: AccountLike,
  toParentAccount?: Account,

  toExists: boolean,
  operation: Operation,
  provider: string,
  swapId: string,
  status: string,
  fromAmount: BigNumber,
  toAmount: BigNumber,
};

export type SwapOperation = {
  provider: string,
  swapId: string,
  status: string,

  receiverAccountId: string,
  tokenId?: string,
  operationId: string,

  fromAmount: BigNumber,
  toAmount: BigNumber,
};

export type SwapOperationRaw = {
  provider: string,
  swapId: string,
  status: string,

  receiverAccountId: string,
  tokenId?: string,
  operationId: string,

  fromAmount: string,
  toAmount: string,
};

export type SwapState = {
  swap: {
    exchange: $Shape<Exchange>,
    exchangeRate?: ?ExchangeRate,
  },
  error?: ?Error,
  ratesTimestamp?: Date,
  okCurrencies: (CryptoCurrency | TokenCurrency)[],
  fromCurrency: ?(CryptoCurrency | TokenCurrency),
  toCurrency: ?(CryptoCurrency | TokenCurrency),
  useAllAmount: boolean,
  fromAmount: BigNumber,
};

export type InitSwapInput = {
  exchange: Exchange,
  exchangeRate: ExchangeRate,
  transaction: Transaction,
  deviceId: string,
};

export type InitSwapInputRaw = {
  exchange: ExchangeRaw,
  exchangeRate: ExchangeRateRaw,
  transaction: TransactionRaw,
  deviceId: string,
};
