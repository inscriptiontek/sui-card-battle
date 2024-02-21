import { getFullnodeUrl } from "@mysten/sui.js/client";
import { TESTNET_CARD_PACKAGE_ID } from "./constants.ts";
import { createNetworkConfig } from "@mysten/dapp-kit";

const { networkConfig, useNetworkVariable, useNetworkVariables } =
  createNetworkConfig({
    // devnet: {
    //   url: getFullnodeUrl("devnet"),
    //   variables: {
    //     counterPackageId: DEVNET_COUNTER_PACKAGE_ID,
    //   },
    // },
    testnet: {
      url: getFullnodeUrl("testnet"),
      variables: {
        cardPackageId: TESTNET_CARD_PACKAGE_ID,
      },
    },
    // mainnet: {
    //   url: getFullnodeUrl("mainnet"),
    //   variables: {
    //     counterPackageId: MAINNET_COUNTER_PACKAGE_ID,
    //   },
    // },
  });

export { useNetworkVariable, useNetworkVariables, networkConfig };
