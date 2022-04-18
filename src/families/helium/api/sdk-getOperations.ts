import BigNumber from "bignumber.js";
import { PaymentV1, PaymentV2 } from "./sdk.types";
import { fetchAll } from "./sdk";
import { Operation } from "../../../types";

const supportedTypes = ["payment_v1", "payment_v2"];

const parseTxn = (txn: any, accountAddress: string) => {
  switch (txn.type) {
    case "payment_v1":
      return parsePaymentV1(txn, accountAddress);

    case "payment_v2":
      return parsePaymentV2(txn, accountAddress);

    default:
      throw new Error("Unknown txn type");
  }
};

const bigNumberSum = (numbers: BigNumber[]) =>
  numbers.reduce((sum, number) => sum.plus(number), new BigNumber(0));

const parsePaymentV1 = (txn: PaymentV1, accountAddress: string) => {
  return {
    id: txn.hash,
    hash: txn.hash,
    type: txn.payer === accountAddress ? "OUT" : "IN",
    value: new BigNumber(txn.amount),
    fee: new BigNumber(txn.fee), // TODO convert DC to HNT
    senders: [txn.payer],
    recipients: [txn.payee],
    blockHeight: txn.height,
    blockHash: txn.height.toString(),
    transactionSequenceNumber: txn.nonce,
    accountId: accountAddress,
    date: new Date(txn.time * 1000),
    extra: {},
  };
};

const parsePaymentV2 = (txn: PaymentV2, accountAddress: string) => {
  const bnPayments = txn.payments.map((p) => ({
    ...p,
    amount: new BigNumber(p.amount),
  }));

  return {
    id: txn.hash,
    hash: txn.hash,
    type: txn.payer === accountAddress ? "OUT" : "IN",
    value:
      txn.payer === accountAddress
        ? bigNumberSum(bnPayments.map((p) => p.amount))
        : bnPayments.find((p) => p.payee === accountAddress)?.amount,
    fee: new BigNumber(txn.fee), // TODO convert DC to HNT
    senders: [txn.payer],
    recipients: txn.payments.map((p) => p.payee),
    blockHeight: txn.height,
    blockHash: txn.height.toString(),
    transactionSequenceNumber: txn.nonce,
    accountId: accountAddress,
    date: new Date(txn.time * 1000),
    extra: {},
  };
};

const getOperations = async (address: string): Promise<Operation[]> => {
  const txns = await fetchAll(`/accounts/${address}/activity`, {
    filter_types: supportedTypes.join(","),
  });

  return txns.map((txn) => parseTxn(txn, address));
};

export default getOperations;
