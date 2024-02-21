import React from "react";
import { useNavigate } from "react-router-dom";
import { logo, heroImg } from "../assets/index.js";
import styles from "../styles/index.js";
import { JSX } from "react/jsx-runtime";
import { Box, Container, Flex, Heading } from "@radix-ui/themes";
import { ConnectButton } from "@mysten/dapp-kit";
const PageHOC =
  (
    Component: React.ComponentType,
    title: JSX.Element,
    description: JSX.Element,
  ) =>
  () => {
    const navigate = useNavigate();
    return (
      <div className={styles.hocContainer}>
        <div className="absolute right-20 top-10">
          <Box>
            <ConnectButton></ConnectButton>
          </Box>
        </div>
        <div className={styles.hocContentBox}>
          <img
            src={logo}
            alt="logo"
            className={styles.hocLogo}
            onClick={() => navigate("/")}
          />

          <div className={styles.hocBodyWrapper}>
            <div className="flex flex-row w-full">
              <h1 className={`flex ${styles.headText} head-text`}>{title}</h1>
            </div>
            <p className={`${styles.normalText} my-10`}>{description}</p>
            <Component></Component>
          </div>

          <p className={styles.footerText}>Made with ppnnssy</p>
        </div>
        <div className="flex flex-1">
          <img
            src={heroImg}
            alt="hero-img"
            className="w-full xl:h-full object-cover"
          />
        </div>
      </div>
    );
  };

export default PageHOC;
