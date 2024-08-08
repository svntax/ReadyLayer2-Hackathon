"use client";

import React, { useEffect, useState } from "react";
import { AppConfig, showConnect, UserSession } from "@stacks/connect";
import { Container, Title, Text, Button } from '@mantine/core';

const appConfig = new AppConfig(["store_write", "publish_data"]);

export const userSession = new UserSession({ appConfig });

function authenticate() {
  showConnect({
    appDetails: {
      name: "Stacks Creator Platform",
      icon: window.location.origin + "/logo512.png",
    },
    redirectTo: "/",
    onFinish: () => {
      window.location.reload();
    },
    userSession,
  });
}

function disconnect() {
  userSession.signUserOut("/");
}

const ConnectWallet = () => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (mounted && userSession.isUserSignedIn()) {
    return (
      <Container my="md">
        <Title order={4}>User Info:</Title>
        <Text>mainnet: {userSession.loadUserData().profile.stxAddress.mainnet}</Text>
        <Text>testnet: {userSession.loadUserData().profile.stxAddress.testnet}</Text>
        <Button mt="sm"onClick={disconnect} variant="outline">Sign Out</Button>
      </Container>
    );
  }

  return (
    <Button onClick={authenticate} >Connect Wallet</Button>
  );
};

export default ConnectWallet;
