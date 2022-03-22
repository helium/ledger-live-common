/* eslint-disable no-console */
const fs = require("fs");
const WebSocket = require("ws");

const file = process.env.FILE;
if (!file) {
  console.error("FILE env is needed to save the logs");
  process.exit(1);
}

var stream = fs.createWriteStream(file, { flags: "a" });
const websocketServer = new WebSocket.Server({ port: 8331 });
websocketServer.on("connection", (client) => {
  client.on("message", async (data) => {
    const str = data.toString();
    const message = JSON.parse(str);
    if ((message?.type || "").startsWith("bot")) {
      // we're displaying to the CLI the most important logs which is the log of the bot
      console.log(str.message);
    }
    // we're saving it all
    stream.write(str + "\n");
  });
  client.on("close", () => {
    // as soon as the client close. we assume the work is done and server closes.
    stream.end();
    websocketServer.close();
  });
});
