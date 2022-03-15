import { CryptoCurrency } from "@ledgerhq/cryptoassets";
import { ChainAPI } from "./api";
import { SolanaPreloadData, SolanaPreloadDataV1 } from "./types";
import { assertUnreachable, clusterByCurrencyId } from "./utils";
import { setSolanaPreloadData as setPreloadData } from "./js-preload-data";
import { getValidators, ValidatorAppValidator } from "./validator-app";

export async function preloadWithAPI(
  currency: CryptoCurrency,
  getAPI: () => Promise<ChainAPI>
): Promise<Record<string, any>> {
  const api = await getAPI();

  const cluster = clusterByCurrencyId(currency.id);

  const validators: ValidatorAppValidator[] =
    cluster === "devnet"
      ? await loadDevnetValidators(api)
      : await getValidators(cluster);

  const data: SolanaPreloadData = {
    version: "1",
    validatorsWithMeta: [],
    validators,
  };

  setPreloadData(data, currency);

  return data;
}

async function loadDevnetValidators(api: ChainAPI) {
  const voteAccs = await api.getVoteAccounts();
  const validators: ValidatorAppValidator[] = voteAccs.current.map((acc) => ({
    active_stake: acc.activatedStake,
    commission: acc.commission,
    delinquent: false,
    total_score: 0,
    vote_account: acc.votePubkey,
  }));
  return validators;
}

export function hydrate(
  data: SolanaPreloadData,
  currency: CryptoCurrency
): void {
  switch (data.version) {
    case "1":
      hydrateV1(data, currency);
      return;
    case "2":
      throw new Error(
        "version 2 for now exists only to support discriminated union"
      );
    default:
      return assertUnreachable(data);
  }
}

function hydrateV1(data: SolanaPreloadDataV1, currency: CryptoCurrency) {
  setPreloadData(data, currency);
}
