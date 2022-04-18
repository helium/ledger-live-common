import network from "../../../network";

const submit = async (txn: string): Promise<{ hash: string }> => {
  const url = "https://api.helium.io/v1/pending_transactions";

  const {
    data: { hash },
  } = await network({ method: "POST", url, data: { txn } });

  return { hash };
};

export default submit;
