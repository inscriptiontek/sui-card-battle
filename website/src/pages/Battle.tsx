import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import styles from "../styles";
import { useSuiClientQuery } from "@mysten/dapp-kit";
import ActionButton from "../components/ActionButton.tsx";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import { TESTNET_CARD_PACKAGE_ID } from "../context/constants.ts";
import { useNavigate } from "react-router-dom";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { logo } from "../assets/index.js";
import {
  attack,
  defense,
  player01 as player01Icon,
  player02 as player02Icon,
} from "../assets/index.js";
import { useSignAndExecuteTransactionBlock } from "@mysten/dapp-kit";
import { Card, PlayerInfo } from "../components";
import { getDynamicFields, getObjects } from "../utils";

interface PlayerStatus {
  health: any;
  mana: any;
  account: string;
}
interface CardsInfo {
  id: number;
  attack: number;
  defense: number;
  owner: string;
}

let Battle = () => {
  const params = useParams();
  const [battleId] = useState(params.id);
  const [battleData, setBattleData] = useState({});
  const [playerStatusTableId, setPlayerStatusTableId] = useState("");
  const [playersStatuId, setPlayersStatuId] = useState<string[]>([]);
  const [playerStatuses, setPlayerStatuses] = useState<PlayerStatus[]>([]);

  const [cardsTableId, setCardsTableId] = useState("");
  const [cardsInfoId, setCardsInfoId] = useState<string[]>([]);
  const [cardsInfos, setCardsInfos] = useState<CardsInfo[]>([]);
  const { mutate: signAndExecute } = useSignAndExecuteTransactionBlock();
  const navigate = useNavigate();
  const myAccount = useCurrentAccount();
  // 获取对局信息
  const { data } = useSuiClientQuery("getObject", {
    id: battleId ? battleId : "",
    options: {
      showContent: true,
      showOwner: true,
    },
  });

  // const client = new SuiClient({
  //   url: getFullnodeUrl("testnet"),
  // });
  // const client = new SuiClient({
  //   transport: new SuiHTTPTransport({
  //     url: "https://fullnode.testnet.sui.io:443",
  //     // The typescript definitions may not match perfectly, casting to never avoids these minor incompatibilities
  //     // WebSocketConstructor: WebSocket as never,
  //     websocket: {
  //       url: "wss://fullnode.testnet.sui.io",
  //     },
  //   }),
  // });

  useEffect(() => {
    if (!data?.data) return;
    // 获取battleInfo
    setBattleData((data as any)?.data?.content.fields);
  }, [data]);

  useEffect(() => {
    // 从中读取playerStatusTableId
    setPlayerStatusTableId((battleData as any)?.player_status?.fields.id.id);
    setCardsTableId((battleData as any)?.cards?.fields.id.id);
  }, [battleData]);

  useEffect(() => {
    const getPlayers = async () => {
      if (!playerStatusTableId) return;
      const { data } = await getDynamicFields(playerStatusTableId);
      setPlayersStatuId(data.map((val) => val.objectId));
    };

    getPlayers();
  }, [playerStatusTableId, battleData]);

  useEffect(() => {
    const getCards = async () => {
      if (!cardsTableId) return;
      const { data } = await getDynamicFields(cardsTableId);
      setCardsInfoId(data.map((val) => val.objectId));
    };
    getCards();
  }, [cardsTableId, battleData]);

  // 最终请求，playersStatuId中是两个玩家（也可能只有一个）的状态值
  useEffect(() => {
    const getStatus = async () => {
      const res = await getObjects(playersStatuId);
      if (res.length == 0) return;
      console.log("🚀 ~ getStatus ~ res:", res);
      const temp = res.map((v) => {
        return {
          health: (v as any).data?.content.fields.value.fields.health,
          mana: (v as any).data?.content.fields.value.fields.mana,
          account: (v as any).data?.content.fields.name,
        };
      });
      setPlayerStatuses(temp);
    };

    getStatus();
  }, [playersStatuId]);

  useEffect(() => {
    const getCards = async () => {
      const res = await getObjects(cardsInfoId);
      // 组件加载时会同时发出多次请求，有的请求时cardsInfoId没有数据，如果这个请求比较晚的返回
      // 则setCardsInfos会覆盖有数据的返回值，所以当返回值为空时，函数需要中断
      if (res.length == 0) return;
      console.log("🚀 ~ getCards ~ res:", res);
      const temp = res.map((v) => {
        return {
          attack: (v as any).data?.content.fields.value.fields.attack,
          defense: (v as any).data?.content.fields.value.fields.defense,
          id: (v as any).data?.content.fields.value.fields.id,
          owner: (v as any).data?.content.fields.name,
        };
      });

      setCardsInfos(temp);
    };
    getCards();
  }, [cardsInfoId]);

  // 攻击
  const handleAttackOrDef = (moveType: string) => {
    const txb = new TransactionBlock();
    let movechoice = 1;
    if (moveType == "attack") {
      // 攻击
      movechoice = 1;
    } else {
      // 防御
      movechoice = 2;
    }
    txb.moveCall({
      arguments: [
        txb.pure.u64(movechoice),
        txb.object(battleId ? battleId : ""),
      ],

      target: `${TESTNET_CARD_PACKAGE_ID}::card::move_choice`,
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
        },
        onError: (err) => {
          console.log("====================================");
          console.log("🚀 ~ handleCreateBattle ~ err:", err.name);
          console.log("====================================");
        },
      },
    );
  };

  // 订阅事件
  useEffect(() => {
    const subMoveChoice = async () => {
      // naming the function unsubscribe may seem counterintuitive here, but you call it later to unsubscribe from the event
    };

    const subEndGame = async () => {
      // naming the function unsubscribe may seem counterintuitive here, but you call it later to unsubscribe from the event
    };
    subMoveChoice();
    subEndGame();
  }, []);
  return (
    <div className={`${styles.flexBetween} ${styles.gameContainer} bg-astral `}>
      <img
        src={logo}
        alt="logo"
        className={
          "w-[160px] h-[52px] object-contain cursor-pointer absolute left-0 top-0"
        }
        onClick={() => navigate("/")}
      />
      {/* 根据playerStatuses的长度判断有一个还是两个玩家加入游戏。
      只有一个玩家时上面的对手应该是空的 */}
      {playerStatuses.length == 1 ? (
        <PlayerInfo
          player={{ health: 0, mana: 0, account: "0x0" }}
          playerIcon={player02Icon}
          mt={true}
        />
      ) : (
        // 判断 playerStatuses[0]是否存在，应对数据尚未请求到的情况
        <PlayerInfo
          player={
            playerStatuses[0]
              ? playerStatuses[0].account == myAccount?.address
                ? playerStatuses[1]
                : playerStatuses[0]
              : { health: 0, mana: 0, account: "0x0" }
          }
          playerIcon={player02Icon}
          mt={true}
        />
      )}

      <div className={`${styles.flexCenter} flex-col my-10`}>
        {playerStatuses.length == 1 ? (
          ""
        ) : (
          <Card
            card={{
              att: cardsInfos[0]
                ? cardsInfos[0].owner == myAccount?.address
                  ? cardsInfos[1]?.attack
                  : cardsInfos[0].attack
                : 0,
              def: cardsInfos[0]
                ? cardsInfos[0].owner == myAccount?.address
                  ? cardsInfos[1]?.defense
                  : cardsInfos[0].defense
                : 0,
            }}
            playerTwo={true}
          />
        )}

        <div className="flex items-center flex-row">
          <ActionButton
            imgUrl={attack}
            handleClick={() => {
              handleAttackOrDef("attack");
            }}
            restStyles="mr-2 hover:border-yellow-400"
          />
          <Card
            card={{
              att: cardsInfos[0]
                ? cardsInfos[0].owner == myAccount?.address
                  ? cardsInfos[0].attack
                  : cardsInfos[1]?.attack
                : 0,
              def: cardsInfos[0]
                ? cardsInfos[0].owner == myAccount?.address
                  ? cardsInfos[0].defense
                  : cardsInfos[1]?.defense
                : 0,
            }}
            playerTwo={false}
          />

          <ActionButton
            imgUrl={defense}
            handleClick={() => {
              handleAttackOrDef("defense");
            }}
            restStyles="ml-6 hover:border-red-600"
          />
        </div>
      </div>

      {playerStatuses.length == 1 ? (
        <PlayerInfo
          player={playerStatuses[0]}
          playerIcon={player01Icon}
          mt={false}
        />
      ) : (
        <PlayerInfo
          player={
            playerStatuses[0]
              ? playerStatuses[0].account == myAccount?.address
                ? playerStatuses[0]
                : playerStatuses[1]
              : { health: 0, mana: 0, account: "0x0" }
          }
          playerIcon={player01Icon}
          mt={true}
        />
      )}
    </div>
  );
};

export default Battle;
