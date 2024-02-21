import React, { useEffect, useState } from "react";
import { CustomButton, PageHOC } from "../components";
import { ConnectButton, useCurrentAccount } from "@mysten/dapp-kit";
import { useNavigate } from "react-router-dom";
import { useSuiClientQuery, useSuiClientQueries } from "@mysten/dapp-kit";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import { useSignAndExecuteTransactionBlock } from "@mysten/dapp-kit";
import { getFullnodeUrl, SuiClient } from "@mysten/sui.js/client";
import { Space, Table, Tag } from "antd";
import type { TableProps } from "antd";
import {
  BATTLE_RECORD,
  TESTNET_CARD_PACKAGE_ID,
  CARD_RECORD,
} from "../context/constants.ts";
import styles from "../styles";
import { string } from "superstruct";

interface gameDataType {
  battleId: string;
  battleName: string;
  players: string[];
  status: number;
}

interface JoinBattleProps {
  refresh: boolean;
}
const JoinBattle = ({ refresh }: JoinBattleProps) => {
  const navigate = useNavigate();
  const account = useCurrentAccount();
  const [cards, setCards] = useState<any[]>([]);
  const { mutate: signAndExecute } = useSignAndExecuteTransactionBlock();
  // 获取battle Record
  const {
    data: battleData,
    isPending,
    error,
    refetch,
  } = useSuiClientQuery("getObject", {
    id: BATTLE_RECORD,
    options: {
      showContent: true,
      showOwner: true,
    },
  });
  useEffect(() => {
    refetch();
  }, [refresh]);
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

  // 根据battleRecord中记录的对局id获取对局具体信息
  let { data: gameData } = useSuiClientQueries({
    queries: isPending
      ? []
      : (battleData as any)?.data.content.fields.battles.map((val: any) => {
          return {
            method: "getObject",
            params: {
              id: val,
              options: {
                showContent: true,
                showOwner: true,
              },
            },
          };
        }),

    combine: (result) => {
      return {
        // 过滤掉其他状态，只保留待开始的
        data: result
          .map((res, idx) => {
            console.log("====================================");
            console.log(res);
            console.log("====================================");
            let status = (res as any)?.data?.data?.content.fields.status;
            if (status == 0 || status == 1 || status == 2) {
              return {
                key: idx,
                battleId: (res as any)?.data.data.objectId,
                battleName: (res as any)?.data.data.content.fields.name,
                players: (res as any)?.data.data.content.fields.players,
                status: (res as any)?.data.data.content.fields.status,
              };
            }
          })
          .filter((item2) => item2 !== undefined),
        isSuccess: result.every((res) => res.isSuccess),
        isPending: result.some((res) => res.isPending),
        isError: result.some((res) => res.isError),
      };
    },
  });
  console.log("🚀 ~ JoinBattle ~ gameData:", gameData);

  const handleJoin = async (battleId: string) => {
    // 先看看玩家目前是否在本场战斗中
    const client = new SuiClient({ url: getFullnodeUrl("testnet") });
    const res = await client.getObject({
      id: battleId,
      options: {
        showContent: true,
        showOwner: true,
      },
    });

    // 如果是自己创建的对局，直接加入
    if (
      res.data &&
      ((res as any).data?.content.fields.players[0] == account?.address ||
        (res as any).data?.content.fields.players[1] == account?.address)
    ) {
      navigate(`/battle/${battleId}`);
      return;
    }

    // 账户下没有卡牌，需要先铸造
    if (cards.length == 0) {
      alert("你还没有卡牌，先去铸造一张");
      navigate("/");
      return;
    }

    // 加入对局
    const txb = new TransactionBlock();
    txb.moveCall({
      arguments: [txb.object(cards[0].data.objectId), txb.object(battleId)],
      target: `${TESTNET_CARD_PACKAGE_ID}::card::join_battle`,
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
          navigate(`/battle/${battleId}`);
        },
        onError: (err) => {
          console.log("====================================");
          console.log("🚀 ~ handleJoin ~ tx:", err);
          console.log("====================================");
        },
      },
    );
  };

  const columns: TableProps<gameDataType>["columns"] = [
    {
      title: "ID",
      dataIndex: "battleId",
      key: "battleId",
      render: (_, battle) => (
        <>
          {battle.battleId.substring(0, 6) + "..." + battle.battleId.slice(-4)}
        </>
      ),
    },
    {
      title: "BattleName",
      dataIndex: "battleName",
      key: "battleName",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (_, battle) =>
        battle.status == 0 ? <>waiting for join</> : <>in progress</>,
    },
    {
      title: "Players",
      dataIndex: "players",
      key: "players",
      render: (_, { players }) => (
        <>
          <>{players[0].substring(0, 6) + "..." + players[0].slice(-4)}</>
          <br></br>
          <>
            {players[1]
              ? players[1].substring(0, 6) + "..." + players[1].slice(-4)
              : ""}
          </>
        </>
      ),
    },
    {
      title: "",
      dataIndex: "",
      key: "joinButton",
      render: (_, battle) => (
        <CustomButton
          title="Join"
          handleClick={() => {
            handleJoin(battle?.battleId);
          }}
          restStyles={""}
        />
      ),
    },
  ];

  return (
    <div>
      <h2 className={styles.joinHeadText}>Available Battles:</h2>

      <div className={styles.joinContainer}>
        {gameData.length ? (
          gameData.map((battle, index) => (
            <div key={index} className={styles.flexBetween}>
              <p className={styles.joinBattleTitle}>
                {index + 1}. {battle?.battleName}
              </p>
              <CustomButton
                title="Join"
                handleClick={() => {
                  handleJoin(battle?.battleId);
                }}
                restStyles={""}
              />
            </div>
          ))
        ) : (
          <p className={styles.joinLoading}>
            Reload the page to see new battles
          </p>
        )}

        {gameData ? (
          <Table
            rowClassName={() => {
              return "even-row";
            }}
            columns={columns}
            dataSource={gameData as any}
            pagination={false}
          />
        ) : (
          ""
        )}
      </div>

      {/* <p className={styles.infoText} onClick={() => navigate("/create-battle")}>
        Or create a new battle
      </p> */}
    </div>
  );
};
// export default PageHOC(
//   JoinBattle,
//   <>
//     Join <br /> a Battle
//   </>,
//   <>Join already existing battles</>,
// );

export default JoinBattle;
