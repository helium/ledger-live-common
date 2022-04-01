/* eslint-disable no-console */
import { botProxyLog } from "@ledgerhq/live-common/lib/botLogProxy";
import { getEnv } from "@ledgerhq/live-common/lib/env";
import { of } from "rxjs";
export default {
  description:
    "Run a bot test engine with speculos that automatically create accounts and do transactions",
  args: [
    {
      name: "port",
      alias: "p",
      type: String,
      desc: "specify the http port to use (default: 8331)",
    },
  ],
  job: (arg: any) => {
    const BOT_LOG_PROXY_FILE = getEnv("BOT_LOG_PROXY_FILE");

    if (!BOT_LOG_PROXY_FILE) {
      throw new Error("BOT_LOG_PROXY_FILE env is needed to save the logs");
    }

    botProxyLog(arg);
    return of<any>(`Proxy bot log is listening to port ${arg.port || 8331}`);
  },
};
