import styles from "../styles";
type ActionButtonProps = {
  imgUrl: string;
  restStyles?: string;
  handleClick: () => void;
};
const ActionButton = ({
  imgUrl,
  handleClick,
  restStyles,
}: ActionButtonProps) => (
  <div
    className={`${styles.gameMoveBox} ${styles.flexCenter} ${styles.glassEffect} ${restStyles} `}
    onClick={handleClick}
  >
    <img src={imgUrl} alt="action_img" className={styles.gameMoveIcon} />
  </div>
);

export default ActionButton;
