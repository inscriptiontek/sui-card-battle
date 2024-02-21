import { useEffect, useState } from "react";
import { CustomButton, CustomInput, PageHOC, GameLoad } from "../components";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useSignAndExecuteTransactionBlock } from "@mysten/dapp-kit";
import { getFullnodeUrl, SuiClient } from "@mysten/sui.js/client";
import JoinBattle from "./JoinBattle.tsx";

import {
  BATTLE_RECORD,
  TESTNET_CARD_PACKAGE_ID,
} from "../context/constants.ts";
const CreateBattle = () => {
  const [battleName, setbattleName] = useState("");
  const [waitBattle] = useState(false);
  const [cards, setCards] = useState<any[]>([]);
  const { mutate: signAndExecute } = useSignAndExecuteTransactionBlock();
  const account = useCurrentAccount();

  const [refresh, setRefresh] = useState(false);

  const client = new SuiClient({ url: getFullnodeUrl("testnet") });
  const getCards = async () => {
    if (!account) return;
    const res = await client.getOwnedObjects({
      owner: account?.address,
      filter: {
        MatchAll: [
          {
            StructType: `${TESTNET_CARD_PACKAGE_ID}::card::Card`,
          },
        ],
      },
    });
    console.log("🚀 ~ handleClick ~ committeeInfo:", res);
    if (res.data) setCards(res.data);
  };
  useEffect(() => {
    getCards();
  }, [account]);

  // 创建对局
  const handleCreateBattle = async () => {
    if (cards.length == 0) {
      alert("你还没有卡牌，先创建一张吧");
      return;
    }
    const txb = new TransactionBlock();
    txb.moveCall({
      arguments: [
        txb.object(BATTLE_RECORD),
        txb.pure.string(battleName),
        txb.object(cards[0].data.objectId),
      ],

      target: `${TESTNET_CARD_PACKAGE_ID}::card::create_battle`,
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
        onSuccess: (tx) => {
          console.log("🚀 ~ handleCreateBattle ~ tx:", tx);
          setRefresh(!refresh);
        },
        onError: (err) => {
          console.log("====================================");
          console.log("🚀 ~ handleCreateBattle ~ err:", err);
          console.log("====================================");
        },
      },
    );
  };
  return (
    <>
      {waitBattle && <GameLoad />}
      <div className="flex flex-col">
        <CustomInput
          label="Battle Name"
          placeHolder="Enter your battle name"
          value={battleName}
          handleValueChange={setbattleName}
        />

        <CustomButton
          title="Create Battle"
          handleClick={handleCreateBattle}
          restStyles="mt-6 mb-6"
        />

        <JoinBattle refresh={refresh}></JoinBattle>
      </div>
    </>
  );
};

// export default Home;
export default PageHOC(
  CreateBattle,
  <>
    Create <br /> a new Battle
  </>,
  <>Create your own battle and wait for other players to join you</>,
);
