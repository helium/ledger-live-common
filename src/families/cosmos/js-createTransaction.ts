import { BigNumber } from "bignumber.js";
import type { Transaction } from "./types";

/**
 * Create an empty transaction
 *
 * @returns {Transaction}
 */
const createTransaction = (): Transaction => ({
  family: "cosmos",
  mode: "send",
  amount: new BigNumber(0),
  fees: null,
  gas: null,
  recipient: "",
  useAllAmount: false,
  networkInfo: null,
  memo: null,
  cosmosSourceValidator: null,
  validators: [],
});

export default createTransaction;
