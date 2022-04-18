import { makeScanAccounts } from "../../../bridge/jsHelpers";
import { CurrencyBridge } from "../../../types";
import { getAccountShape } from "./utils";

const scanAccounts = makeScanAccounts(getAccountShape);

export const currencyBridge: CurrencyBridge = {
  preload: () => Promise.resolve({}),
  hydrate: () => {},
  scanAccounts,
};
