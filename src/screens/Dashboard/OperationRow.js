/* @flow */
import React, { PureComponent } from "react";
import { View, StyleSheet } from "react-native";
import type { Account, Operation } from "@ledgerhq/wallet-common/lib/types";
import LText from "../../components/LText";
import CurrencyIcon from "../../components/CurrencyIcon";
import OperationRowAmount from "../../components/OperationRowAmount";

class OperationRow extends PureComponent<{
  operation: Operation,
  account: Account
}> {
  render() {
    const { operation, account } = this.props;
    const { currency } = account;
    return (
      <View style={styles.root}>
        <CurrencyIcon size={32} currency={currency} />
        <View style={styles.body}>
          <LText
            numberOfLines={1}
            semiBold
            ellipsizeMode="middle"
            style={styles.operationsAccountName}
          >
            {account.name}
          </LText>
          <LText
            numberOfLines={1}
            ellipsizeMode="middle"
            style={styles.address}
          >
            {operation.address}
          </LText>
        </View>
        <OperationRowAmount operation={operation} account={account} />
      </View>
    );
  }
}

export default OperationRow;

const styles = StyleSheet.create({
  root: {
    paddingVertical: 20,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "white",
    alignItems: "center",
    flexDirection: "row"
  },
  body: {
    flexDirection: "column",
    flex: 1,
    marginHorizontal: 10
  },
  address: {
    fontSize: 12,
    opacity: 0.5
  },
  operationsAccountName: {
    marginLeft: 6,
    fontSize: 12
  }
});
