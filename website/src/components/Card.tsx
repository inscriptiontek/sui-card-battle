import React, { ReactElement } from "react";

import styles from "../styles";
import { allCards } from "../assets/index.js";

const generateRandomCardImage = () =>
  allCards[Math.floor(Math.random() * (allCards.length - 1))];

const img1 = generateRandomCardImage();
const img2 = generateRandomCardImage();

type CardProps = {
  card: {
    att: number;
    def: number;
  };
  restStyles?: string;
  title?: string;
  playerTwo?: boolean;

  handleClick?: () => void;
};
const Card = ({ card, title, restStyles, playerTwo }: CardProps) => {
  return (
    <div className={`${styles.cardContainer} ${restStyles}`}>
      <img
        src={playerTwo ? img2 : img1}
        alt="ace_card"
        className={styles.cardImg}
      />
      <div
        className={`${styles.cardPointContainer} sm:left-[21.2%] left-[22%] ${styles.flexCenter}`}
      >
        <p className={`${styles.cardPoint} text-yellow-400`}>{card.att}</p>
      </div>
      <div
        className={`${styles.cardPointContainer} sm:right-[14.2%] right-[15%] ${styles.flexCenter}`}
      >
        <p className={`${styles.cardPoint} text-red-700`}>{card.def}</p>
      </div>

      <div className={`${styles.cardTextContainer} ${styles.flexCenter}`}>
        <p className={styles.cardText}>{title}</p>
      </div>
    </div>
  );
};

export default Card;
