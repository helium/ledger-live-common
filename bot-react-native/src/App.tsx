import Config from 'react-native-config';
import {listen, log} from '@ledgerhq/logs';
import {bot} from '@ledgerhq/live-common/lib/bot';
import React, {useEffect} from 'react';
import {LogBox, Text, View} from 'react-native';

let logger: WebSocket | undefined;
if (Config.BOT_LOG_SERVICE) {
  logger = new WebSocket(Config.BOT_LOG_SERVICE);
}

listen(info => {
  if (logger) {
    logger.send(JSON.stringify(info));
  } else {
    console.log(info);
  }
});

const launchBot = async () => {
  try {
    const arg: {
      currency?: string;
      family?: string;
    } = {};

    if (Config.BOT_FILTER_CURRENCY) {
      arg.currency = Config.BOT_FILTER_CURRENCY;
    }

    if (Config.BOT_FILTER_FAMILY) {
      arg.family = Config.OT_FILTER_FAMILY;
    }
    await bot(arg);
    // TODO inform upstream that it's finished
  } catch (e: any) {
    // TODO inform upstream that critical error happened
    log('critical', String(e));
  }
  logger?.close();
};

// Ignore all log notifications:
LogBox.ignoreAllLogs();

const App = () => {
  useEffect(() => {
    launchBot();
  }, []);
  return (
    <View
      style={{height: '100%', alignItems: 'center', justifyContent: 'center'}}>
      <Text>Bot is running. Check the main console.</Text>
    </View>
  );
};

export default App;
