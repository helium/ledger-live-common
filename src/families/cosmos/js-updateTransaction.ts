const updateTransaction = (t, patch) => {
  if ("mode" in patch && patch.mode !== t.mode) {
    return { ...t, ...patch, gas: null, fees: null };
  }

  if (
    "validators" in patch &&
    patch.validators.length !== t.validators.length
  ) {
    return { ...t, ...patch, gas: null, fees: null };
  }

  return { ...t, ...patch };
};

export default updateTransaction;
