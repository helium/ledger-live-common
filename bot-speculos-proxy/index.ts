import express, { json } from "express";
import SpeculosTransport from "@ledgerhq/hw-transport-node-speculos";
import {
  createSpeculosDevice,
  listAppCandidates,
  findAppCandidate,
  releaseSpeculosDevice,
} from "@ledgerhq/live-common/lib/load/speculos";
import WebSocket from "ws";

const PORT = process.env.PORT ?? "4343";
const app = express();
app.use(json());
const seed = process.env.SEED;
if (!seed) {
  throw new Error("SEED is not set");
}
const coinapps = process.env.COINAPPS;
if (!coinapps) {
  throw new Error("COINAPPS is not set");
}

const devicesList: Record<string, SpeculosTransport> = {};
const clientList: Record<string, WebSocket> = {};

const websocketServer = new WebSocket.Server({
  port: 8435,
});

type MessageProxySpeculos =
  | {
      type: "exchange" | "open" | "button" | "apdu";
      data: string;
    }
  | { type: "error"; error: string };

const sendToClient = (client: WebSocket | undefined, data: any) => {
  if (client) {
    console.log("SEND : ", data);
    client.send(data);
  }
};

websocketServer.on("connection", (client, req) => {
  sendToClient(client, JSON.stringify({ message: "connected" }));

  const id = /[^/]*$/.exec(req.url || "")?.[0];
  if (!id) {
    return client.send(
      JSON.stringify({ type: "error", error: "id not found" })
    );
  }

  client.on("message", async (data) => {
    console.log("RECEIVED =>", data.toString());
    const message: MessageProxySpeculos = JSON.parse(data.toString());
    const device = devicesList[id];

    if (!device) {
      sendToClient(
        client,
        JSON.stringify({ type: "error", error: "device not found" })
      );
    }

    try {
      switch (message.type) {
        case "open":
          sendToClient(client, JSON.stringify({ type: "opened" }));
          break;

        case "exchange":
          const res = await device.exchange(Buffer.from(message.data, "hex"));
          sendToClient(client, JSON.stringify({ type: "response", data: res }));
          break;

        case "button":
          device.button(message.data);
          break;
      }
    } catch (e) {
      console.log(e);
      throw e;
    }
  });

  clientList[id] = client;

  client.on("close", () => {
    delete clientList[id];
  });
});

app.post("/app-candidate", async (req, res) => {
  try {
    const appCandidates = await listAppCandidates(coinapps);
    const appCandidate = findAppCandidate(appCandidates, req.body);

    if (!appCandidate) {
      return res.status(404).send("No app candidate found");
    }

    return res.json(appCandidate);
  } catch (e: any) {
    console.log(e.message);
    return res.status(500).json({ error: e.message });
  }
});

app.post("/", async (req, res) => {
  try {
    const device = await createSpeculosDevice({
      ...req.body,
      seed: seed,
      coinapps: coinapps,
    });

    console.log(device.id, "has been created");

    device.transport.automationSocket?.on("data", (data) => {
      console.log("[DATA of AUTOMATION SOCKET]", data.toString("ascii"));

      const split = data.toString("ascii").split("\n");
      split
        .filter((ascii) => !!ascii)
        .forEach((ascii) => {
          const json = JSON.parse(ascii);
          sendToClient(
            clientList[device.id],
            JSON.stringify({ type: "screen", data: json })
          );
        });
    });

    device.transport.automationSocket?.on("error", (e) => {
      console.log("ERROR", e);
    });

    device.transport.apduSocket?.on("data", (data) => {
      console.log("[DATA of APDU SOCKET]", decodeAPDUPayload(data));
    });

    device.transport.apduSocket.on("error", (e) => {
      console.log("[APDU ERROR]", e);
    });

    device.transport.apduSocket.on("end", () => {
      console.log("[APDU END]");
      if (clientList[device.id]) {
        sendToClient(clientList[device.id], JSON.stringify({ type: "close" }));
        clientList[device.id].close();
        delete clientList[device.id];
      }
    });

    device.transport.apduSocket.on("close", () => {
      if (clientList[device.id]) {
        sendToClient(clientList[device.id], JSON.stringify({ type: "close" }));
        clientList[device.id].close();
        delete clientList[device.id];
      }
    });

    devicesList[device.id] = device.transport;

    return res.json({ id: device.id });
  } catch (e: any) {
    console.log(e.message);
    return res.status(500).json({ error: e.message });
  }
});

app.delete("/:id", async (req, res) => {
  try {
    await releaseSpeculosDevice(req.params.id);

    return res.json(`${req.params.id} is destroyed`);
  } catch (e: any) {
    console.log(e.message);
    return res.status(500).json({ error: e.message });
  }
});

app.listen(PORT, () => {
  console.log(`Listen to :${PORT}`);
});

function decodeAPDUPayload(data: Buffer) {
  const dataLength = data.readUIntBE(0, 4); // 4 bytes tells the data length

  const size = dataLength + 2; // size does not include the status code so we add 2

  const payload = data.slice(4);

  if (payload.length !== size) {
    throw new Error(
      `Expected payload of length ${size} but got ${payload.length}`
    );
  }

  return payload;
}
