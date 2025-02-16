import * as icons from "./data/icons/reactNative";
import * as flags from "./data/flags/reactNative";
import type { CryptoCurrency, TokenCurrency } from "./types";
type Icon = React.ComponentType<{
  size: number;
  color: string;
}>;

function getIconId({ ticker }: CryptoCurrency | TokenCurrency) {
  let id = ticker.toLowerCase();
  if (!isNaN(parseInt(id.charAt(0), 10))) id = `_${id}`; // fix variable name leading with a numerical value

  return id;
}

export function getCryptoCurrencyIcon(
  currency: CryptoCurrency
): Icon | null | undefined {
  return icons[getIconId(currency)];
}
export function getTokenCurrencyIcon(
  token: TokenCurrency
): Icon | null | undefined {
  return icons[getIconId(token)];
}
export function getFlag(countryCode: string): Icon | undefined {
  return flags[`${countryCode.toLowerCase()}Flag`];
}
