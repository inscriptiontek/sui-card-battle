
import styles from "../styles";

const healthPoints = 25;

const healthLevel = (points: number) =>
  points >= 12 ? "bg-green-500" : points >= 6 ? "bg-orange-500" : "bg-red-500";
const marginIndexing = (index: number) =>
  index !== healthPoints - 1 ? "mr-1" : "mr-0";

interface PlayerInfoProps {
  player: {
    health: number;
    mana: number;
    account: string;
  };
  playerIcon: any;
  mt: boolean;
}
const PlayerInfo = ({ player, playerIcon, mt }: PlayerInfoProps) => (
  <div className={`${styles.flexCenter} ${mt ? "mt-4" : "mb-4"}`}>
    <img
      data-for={`Player-${mt ? "1" : "2"}`}
      data-tip
      src={playerIcon}
      alt="player02"
      className="w-14 h-14 object-contain rounded-full"
    />

    <div
      data-for={`Health-${mt ? "1" : "2"}`}
      data-tip={`Health: ${player.health}`}
      className={styles.playerHealth}
    >
      {[...Array(player.health - 0).keys()].map((item, index) => (
        <div
          key={`player-item-${item}`}
          className={`${styles.playerHealthBar} ${healthLevel(player.health)} ${marginIndexing(index)}`}
        />
      ))}
    </div>

    <div
      data-for={`Mana-${mt ? "1" : "2"}`}
      data-tip="Mana"
      className={`${styles.flexCenter} ${styles.glassEffect} ${styles.playerMana}`}
    >
      {player.mana || 0}
    </div>

    <p className={styles.playerInfo}>
      <span className={styles.playerInfoSpan}>Address:</span>{" "}
      {player?.account?.slice(0, 10)}
    </p>
  </div>
);

export default PlayerInfo;
