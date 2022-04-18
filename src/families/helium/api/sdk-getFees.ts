import { Address } from "@helium/crypto";
import { Transaction, PaymentV1 } from "@helium/transactions";
import BigNumber from "bignumber.js";
import { fetch } from "./sdk";

const EMPTY_ADDRESS = Address.fromB58(
  "13PuqyWXzPYeXcF1B9ZRx7RLkEygeL374ZABiQdwRSNzASdA1sn"
);

const makeFeeTxn = (type = "payment_v1") => {
  switch (type) {
    case "payment_v1":
      return new PaymentV1({
        payer: EMPTY_ADDRESS,
        payee: EMPTY_ADDRESS,
        amount: 100000000,
        nonce: 1,
      });
    default:
      throw "Unsupported type for fees";
  }
};

const TXN_VARS: string[] = [
  "txn_fee_multiplier",
  "dc_payload_size",
  "staking_fee_txn_assert_location_v1",
  "staking_fee_txn_add_gateway_v1",
];

const fetchTransactionConfigChainVars = async () => {
  const { data: vars } = await fetch("/vars", { keys: TXN_VARS.join(",") });
  return {
    txnFeeMultiplier: vars.txn_fee_multiplier,
    stakingFeeTxnAssertLocationV1: vars.staking_fee_txn_assert_location_v1,
    stakingFeeTxnAddGatewayV1: vars.staking_fee_txn_add_gateway_v1,
    dcPayloadSize: vars.dc_payload_size,
  };
};

const dcToHnt = async (dc: BigNumber): Promise<BigNumber> => {
  const dcInUSD = dc.dividedBy(100000);
  const { data: oracle } = await fetch("/oracle/prices/current");
  const oraclePrice = new BigNumber(oracle.price).dividedBy(100000000);
  return dcInUSD.dividedBy(oraclePrice).multipliedBy(100000000);
};

const getFees = async (
  type = "payment_v1"
): Promise<{ dc: BigNumber; estHnt: BigNumber }> => {
  Transaction.config(await fetchTransactionConfigChainVars());
  const txn = makeFeeTxn(type);
  const dc = new BigNumber(txn.fee ?? 0);
  const estHnt = await dcToHnt(dc);
  console.log('estHNT', estHnt.toString())
  console.log('estHNT', estHnt.toNumber())

  return { dc, estHnt };
};

export default getFees;
