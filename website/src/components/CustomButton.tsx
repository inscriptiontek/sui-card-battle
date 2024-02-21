import React from "react";
import styles from "../styles";

type CustomButtonProps = {
  title: string;
  restStyles?: string;
  handleClick: () => void;
};
const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  handleClick,
  restStyles,
}) => (
  <button
    type="button"
    className={`${styles.btn} ${restStyles}`}
    onClick={handleClick}
  >
    {title}
  </button>
);

export default CustomButton;
