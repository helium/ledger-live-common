import { encodeAccountId } from "../../../account";
import { GetAccountShape } from "../../../bridge/jsHelpers";
import { getAccount, getOperations } from "../api";

export const getAccountShape: GetAccountShape = async (info) => {
  const { balance, blockHeight } = await getAccount(info.address);
  const operations = await getOperations(info.address);

  const accountId = encodeAccountId({
    type: "js",
    version: "2",
    currencyId: info.currency.id,
    xpubOrAddress: info.address,
    derivationMode: info.derivationMode,
  });

  return {
    id: accountId,
    balance,
    operations,
    operationsCount: operations.length,
    blockHeight,
  };
};
