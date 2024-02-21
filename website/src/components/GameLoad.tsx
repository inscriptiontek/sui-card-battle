
import { player01, player02 } from "../assets/index.js";
import styles from "../styles";
import { useNavigate } from "react-router-dom";
import { CustomButton } from "../components/index.js";
import { useCurrentAccount } from "@mysten/dapp-kit";
const GameLoad = () => {
  const navigate = useNavigate();
  const currentAccount = useCurrentAccount();
  return (
    <div className={`${styles.flexBetween} ${styles.gameLoadContainer}`}>
      <div className={`flex-1 ${styles.flexCenter} flex-col`}>
        <h1 className={`${styles.headText} text-center`}>
          Waiting for a <br /> worthy opponent...
        </h1>

        <div className={styles.gameLoadPlayersBox}>
          <div className={`${styles.flexCenter} flex-col`}>
            <img src={player01} className={styles.gameLoadPlayerImg} />
            <p className={styles.gameLoadPlayerText}>
              {currentAccount?.address.slice(0, 20)}
            </p>
          </div>

          <h2 className={styles.gameLoadVS}>Vs</h2>

          <div className={`${styles.flexCenter} flex-col`}>
            <img src={player02} className={styles.gameLoadPlayerImg} />
            <p className={styles.gameLoadPlayerText}>??????????</p>
          </div>
        </div>

        <div className="mt-10">
          <p className={`${styles.infoText} text-center mb-5`}>OR</p>

          <CustomButton
            title="Join other battles"
            handleClick={() => {
              navigate("/join-battle");
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default GameLoad;
