import { useEffect, useState } from "react";

import { PageHOC } from "../components";
import { CustomInput, CustomButton } from "../components";
import { useNavigate } from "react-router-dom";
import { ConnectButton, useCurrentAccount } from "@mysten/dapp-kit";
import { useSuiClientQuery, useSuiClientQueries } from "@mysten/dapp-kit";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import styles from "../styles";
import { getFullnodeUrl, SuiClient } from "@mysten/sui.js/client";
import { useSignAndExecuteTransactionBlock } from "@mysten/dapp-kit";
import { CARD_RECORD, TESTNET_CARD_PACKAGE_ID } from "../context/constants";
const Home = () => {
  const [playerName, setPlayerName] = useState("");
  const navigate = useNavigate();
  const { mutate: signAndExecute } = useSignAndExecuteTransactionBlock();
  const client = new SuiClient({ url: getFullnodeUrl("testnet") });
  const [cards, setCards] = useState<any[]>([]);
  const account = useCurrentAccount();
  const { data, isPending, error, refetch } = useSuiClientQuery("getObject", {
    id: CARD_RECORD,
    options: {
      showContent: true,
      showOwner: true,
    },
  });

  // 获得账户拥有的所有卡牌
  const getCards = async () => {
    if (!account) return;
    const res = await client.getOwnedObjects({
      owner: account?.address,
      options: {
        showContent: true,
        showOwner: true,
      },
      filter: {
        MatchAll: [
          {
            StructType: `${TESTNET_CARD_PACKAGE_ID}::card::Card`,
          },
        ],
      },
    });

    if (res.data) setCards(res.data);
  };
  useEffect(() => {
    getCards();
  }, [data, account]);

  // 铸造卡牌
  const mintCard = async () => {
    const txb = new TransactionBlock();
    txb.moveCall({
      arguments: [txb.object(CARD_RECORD), txb.object("0x6")],
      target: `${TESTNET_CARD_PACKAGE_ID}::card::create_card`,
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
          console.log("🚀 ~ handleJoin ~ tx:", tx);
          refetch();
        },
        onError: (err) => {
          console.log("====================================");
          console.log("🚀 ~ handleJoin ~ tx:", err);
          console.log("====================================");
        },
      },
    );
  };
  return (
    <div className="flex flex-col">
      {/* <CustomInput
        label="Name"
        placeHolder="暂时没用的输入框"
        value={playerName}
        handleValueChange={setPlayerName}
      /> */}
      <div>
        <CustomButton
          title="Mint Card For Free"
          handleClick={mintCard}
          restStyles="mt-4 mb-6 mr-10"
        />
        <CustomButton
          title="Begin Game"
          handleClick={() => {
            navigate("/create-battle");
          }}
          restStyles="mt-6 mb-6"
        />
      </div>

      <h2 className={styles.joinHeadText}>All Your Cards:</h2>
      <div className={styles.joinContainer}>
        {cards.length ? (
          cards.map((battle, index) => (
            <div key={index} className={styles.flexBetween}>
              <p className={styles.joinBattleTitle}>
                {index + 1}. {battle.data.objectId.slice(0, 10)}: 攻击-
                {battle.data.content.fields.attack} 防御-
                {battle.data.content.fields.defense}
              </p>
            </div>
          ))
        ) : (
          <p className={styles.joinLoading}>尚未有卡牌，先创建一张吧</p>
        )}
      </div>
    </div>
  );
};

// export default Home;
export default PageHOC(
  Home,
  <>
    Welcome to Avax Gods <br /> a Web3 NFT Card Game
  </>,
  <>
    Connect your wallet to start playing <br /> the ultimate Web3 Battle Card
    Game
  </>,
);
