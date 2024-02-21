import {
  TransactionBlock,
  TransactionArgument,
} from "@mysten/sui.js/transactions";
import { SerializedBcs } from "@mysten/bcs";
import { getFullnodeUrl, SuiClient } from "@mysten/sui.js/client";
const client = new SuiClient({ url: getFullnodeUrl("testnet") });

export const getObject = (objId: string) => {
  return client.getObject({
    id: objId,
    options: {
      showContent: true,
      showOwner: true,
    },
  });
};

export const getDynamicFields = (id: string) => {
  return client.getDynamicFields({
    parentId: id,
  });
};
// multiGetObjects
export const getObjects = (ids: string[]) => {
  return client.multiGetObjects({
    ids,
    options: {
      showContent: true,
      showOwner: true,
    },
  });
};

interface CallMoveFunProps {
  target: `${string}::${string}::${string}`;
  args: (TransactionArgument | SerializedBcs<any>)[];
}

// signAndExecute是执行函数
export const callMoveFun = (
  { target, args }: CallMoveFunProps,
  signAndExecute: any,
) => {
  const txb = new TransactionBlock();
  txb.moveCall({
    arguments: args,
    target,
  });
  signAndExecute(
    {
      transactionBlock: txb,
      options: {
        showEffects: true,
        showObjectChanges: true,
      },
    },
    {
      onSuccess: (tx: any) => {
        console.log("🚀 ~ handleCreateBattle ~ tx:", tx);
        return tx;
      },
      onError: (err: any) => {
        console.log("====================================");
        console.log("🚀 ~ handleCreateBattle ~ err:", err);
        return err;
        console.log("====================================");
      },
    },
  );
};
