import { PaymentV1 } from "@helium/transactions";
import type { Transaction } from "./types";
import type { Account } from "../../types";

import { getNonce } from "./logic";
import { Address } from "@helium/crypto";
import { getFees } from "./api";

// const getTransactionParams = (a: Account, t: Transaction) => {
//   switch (t.mode) {
//     case "send":
//       return {
//         amount: t.amount,
//         fee: t.fees,
//         payeeAddress: t.recipient,
//       };
//     // return t.useAllAmount
//     //   ? {
//     //       method: "transferAll",
//     //       args: {
//     //         dest: t.recipient,
//     //       },
//     //     }
//     //   : {
//     //       method: "transfer",
//     //       args: {
//     //         dest: t.recipient,
//     //         value: t.amount.toString(),
//     //       },
//     //     };
//     default:
//       throw new Error("Unknown mode in transaction");
//   }
// };

// export const buildTransaction = async (
//   a: Account,
//   t: Transaction
// ): Promise<any> => {
//   // const address = a.freshAddress;
//   const params = getTransactionParams(a, t);
//   const nonce = await getNonce(a.freshAddress);

//   return {
//     nonce,
//     ...params,
//   };
// };

export const buildPaymentV1Txn = async (
  a: Account,
  t: Transaction
): Promise<PaymentV1> => {
  const nonce = await getNonce(a.freshAddress);
  const { dc } = await getFees("payment_v1");

  return new PaymentV1({
    payer: Address.fromB58(a.freshAddress),
    payee: Address.fromB58(t.recipient),
    amount: t.amount.toNumber(),
    nonce,
    fee: dc.toNumber(),
  });
};
