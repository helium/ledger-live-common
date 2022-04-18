import { Address } from "@helium/crypto";
import { getAccount } from "./api";

export const isValidAddress = (address: string): boolean => {
  return Address.isValid(address);
};

export const getNonce = async (address: string): Promise<number> => {
  const account = await getAccount(address);
  return account.speculativeNonce + 1;
};
