import qs from "qs";
import network from "../../../network";

// const root = "https://helium-api.stakejoy.com/v1";
const root = "https://api.helium.io/v1";

const makeUrl = (path: string, params?: Record<string, string>) => {
  let url = root + path;
  if (params) {
    params = qs.stringify(params);
    url += `?${params}`;
  }
  return url;
};

export async function fetch(
  path: string,
  params?: Record<string, string>
): Promise<any> {
  const url = makeUrl(path, params);
  const { data } = await network({
    method: "GET",
    url,
    headers: { "User-Agent": "LedgerLive" },
  });
  return data;
}

export const fetchAll = async (
  path: string,
  params: Record<string, string>,
  acc: any[] = [],
  cursor?: string
): Promise<any> => {
  const { data, cursor: nextCursor } = await fetch(path, {
    ...params,
    ...(cursor ? { cursor } : undefined),
  });
  const accData = [...acc, ...data];

  if (nextCursor) {
    const nextData = await fetchAll(path, params, accData, nextCursor);
    return nextData;
  }

  return accData;
};
