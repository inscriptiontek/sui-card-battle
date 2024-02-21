import React from "react";
import styles from "../styles";
const regex = /^[A-Za-z0-9]+$/;

type MyComponentProps = {
  label: string;
  placeHolder: string;
  value: string;
  // TODO这里可能有bug
  handleValueChange: React.Dispatch<React.SetStateAction<string>>;
};
const CustomInput: React.FC<MyComponentProps> = ({
  label,
  placeHolder,
  value,
  handleValueChange,
}) => (
  <>
    <label htmlFor="name" className={styles.label}>
      {label}
    </label>
    <input
      type="text"
      placeholder={placeHolder}
      value={value}
      onChange={(e) => {
        if (e.target.value === "" || regex.test(e.target.value))
          handleValueChange(e.target.value);
      }}
      className={styles.input}
    />
  </>
);

export default CustomInput;
