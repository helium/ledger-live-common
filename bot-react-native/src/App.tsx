import {botProxy} from '@ledgerhq/live-common/lib/botProxy';
import {listen} from '@ledgerhq/logs';
import React, {useCallback, useEffect, useReducer, useRef} from 'react';
import {
  Button,
  LogBox,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from 'react-native';
import {Observable} from 'rxjs';
import {getEnv} from "@ledgerhq/live-common/lib/env";

// Ignore all log notifications:
LogBox.ignoreAllLogs();

let id = 0;
let resultBox: any = [];

const log = console.log;
console.log = (...args) => {
  resultBox.push({type: 'log', text: args, id: ++id});
  log(...args);
};

const eventObservable = new Observable(o =>
  listen(log => {
    switch (log.type) {
      case 'hw':
        return o.next({type: 'hw', text: log.message});
      case 'apdu':
        return o.next({type: 'apdu', text: log.message});
      case 'engine':
        return o.next({type: 'engine', text: log.message});
      case 'network':
        return o.next({type: 'network', text: log.message, color: 'orange'});
      case 'network-success':
        return o.next({
          type: 'network-success',
          text: log.message,
          color: 'green',
        });
      case 'scanAccounts':
        return o.next({type: 'scanAccounts', text: log.message});
      case 'debug':
        return o.next({type: 'debug', text: log.message, color: 'yellow'});
      case 'bot/flow':
        return o.next({type: 'bot/flow', text: log.message, color: '#719FB0'});
      case 'bot':
        return o.next({type: 'bot', text: log.message, color: '#A0C1B8'});
      case 'bot/result':
        return o.next({type: 'result', text: log.message});
    }
    console.log(`(unhandled) ${log.type}: ${log.message}`);
  }),
);

interface Log {
  type: string;
  text: string;
  id?: number;
  color?: string;
}

type Action =
  | {
      type: 'ADD';
      payload: Log;
    }
  | {type: 'CLEAR'}
  | {type: string; payload: Log};

const App = () => {
  const scrollLogViewRef = useRef<any>();
  const scrollResultViewRef = useRef<any>();

  const [logs, dispatch] = useReducer(
    (logs: Log[], action: Action) => {
      switch (action.type) {
        case 'ADD':
          if (action.payload.type === 'result') {
            return logs;
          }
          return [...logs, {date: new Date(), ...action.payload, id: ++id}];
        case 'CLEAR':
          resultBox = [];
          return [];
        default:
          return logs;
      }
    },
    [
      {
        id: 0,
        date: new Date(),
        type: 'announcement',
        text: 'Ledger bot spec',
      },
    ],
  );

  const addLog = useCallback(
    (log: Log) => dispatch({type: 'ADD', payload: log}),
    [dispatch],
  );
  const clearLogs = useCallback(() => dispatch({type: 'CLEAR'}), [dispatch]);
  const addLogError = (error: Error) =>
    addLog({
      type: 'error',
      text:
        (error && error.name && error.name !== 'Error'
          ? error.name + ': '
          : '') + String((error && error.message) || error),
    });

  useEffect(() => {
    const sub = eventObservable.subscribe((e: any) => addLog(e));
    return () => sub.unsubscribe();
  }, []);

  const launchBot = async () => {
    try {
      await botProxy({currency: 'algorand'});
    } catch (e: any) {
      addLogError(e);
    }
  };

  return (
    <SafeAreaView style={{backgroundColor: 'black'}}>
      <View  style={{backgroundColor: '#A0C1B8'}}>
        <Button title="Run bot" onPress={() => launchBot()} />
      </View>
      <View style={{backgroundColor: '#A0C1B8'}}>
        <Button title="Clear" onPress={() => clearLogs()} />
      </View>
      <View>
        <Text style={{color: 'white', textAlign: 'center', fontSize: 20}}>
          LOG :
        </Text>
      </View>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={[{backgroundColor: 'dimgray'}, {height: '40%'}]}
        ref={scrollLogViewRef}
        onContentSizeChange={() =>
          scrollLogViewRef.current.scrollToEnd({animated: true})
        }>
        <View
          style={{
            backgroundColor: 'black',
          }}>
          {logs.map(log => {
            return (
              <Text
                style={{color: log.color ?? 'white', padding: 5}}
                key={log.id}>
                [{log.id}] - {log.type} {log.text}
              </Text>
            );
          })}
        </View>
      </ScrollView>
      <View>
        <Text style={{color: 'white', textAlign: 'center', fontSize: 20}}>
          RESULT :
        </Text>
      </View>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={[{backgroundColor: 'dimgray'}, {height: '40%'}]}
        ref={scrollResultViewRef}
        onContentSizeChange={() =>
          scrollResultViewRef.current.scrollToEnd({animated: true})
        }>
        <View
          style={{
            backgroundColor: 'black',
          }}>
          {resultBox.map((log: Log) => {
            return (
              <Text
                style={{color: log.color ?? 'white', padding: 5}}
                key={log.id}>
                [{log.id}] - {log.type} {log.text}
              </Text>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default App;
