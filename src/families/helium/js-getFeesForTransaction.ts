import { BigNumber } from "bignumber.js";
import type { Account } from "../../types";
import { getFees } from "./api";
import type { Transaction } from "./types";

const getEstimatedFees = async ({
  a,
  t,
}: {
  a: Account;
  t: Transaction;
}): Promise<BigNumber> => {
  const { estHnt } = await getFees("payment_v1");
  return estHnt;
};

export default getEstimatedFees;
