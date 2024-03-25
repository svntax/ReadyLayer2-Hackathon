"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "./page.module.css";
import { useRouter } from 'next/navigation';
import { IconX } from "@tabler/icons-react";

import { Container, Notification, Paper, Text, TextInput, Button, Stack, rem } from '@mantine/core';

import { StacksTestnet } from '@stacks/network';
import { cvToValue, callReadOnlyFunction, Cl } from '@stacks/transactions';
import { Connect } from "@stacks/connect-react";

import ConnectWallet, { userSession } from "../components/ConnectWallet";

export default function Home() {
  const [isClient, setIsClient] = useState(false);
  const [userFound, setUserFound] = useState(false);
  const [userAddress, setUserAddress] = useState("");
  const [addressToSearch, setAddressToSearch] = useState("");
  const [searchErrorVisibility, setSearchErrorVisibility] = useState(false);

  const router = useRouter();
  const xIcon = <IconX style={{ width: rem(20), height: rem(20) }} />;

  const searchUser = (e) => {
    e.preventDefault();
    if(addressToSearch){
      setSearchErrorVisibility(false);
      // Redirect to the creator's profile page
      router.push(`/users/${addressToSearch}`);
    }
    else{
      setSearchErrorVisibility(true);
    }
  };

  useEffect(() => {
    setIsClient(true);

    if(userSession.isUserSignedIn()){
      const contractAddress = 'STSN2NQMWNYSZ2373C1MD96QJVFNNKV8F033JAJ4';
      const contractName = 'creators-data-storage';
      const functionName = 'get-creator';
      const network = new StacksTestnet();
      const senderAddress = userSession.loadUserData().profile.stxAddress.testnet;
  
      const options = {
          contractAddress,
          contractName,
          functionName,
          functionArgs: [Cl.standardPrincipal(senderAddress)],
          network,
          senderAddress,
      };
  
      const result = callReadOnlyFunction(options).then((data) => {
          const userData = cvToValue(data);
          if(userData){
              setUserFound(true);
              setUserAddress(senderAddress);
          }
          else{
              setUserFound(false);
              setUserAddress("");
          }
      });
    }
  }, []);

  if (!isClient) return null;

  return (
    <Connect
      authOptions={{
        appDetails: {
          name: "Stacks Creator Platform",
          icon: window.location.origin + "/logo.png",
        },
        redirectTo: "/",
        onFinish: () => {
          window.location.reload();
        },
        userSession,
      }}
    >
      <main className={styles.main}>

        <div>
          <h2>Stacks Creator Platform</h2>
        </div>

        <Container w="100%">
            <TextInput
              label="Search User"
              placeholder="Enter an address..."
              value={addressToSearch}
              maxLength="64"
              onChange={(e) => setAddressToSearch(e.target.value)}
              mb="16px"
            />
            <Button onClick={searchUser}>Search</Button>
            <Notification maw="300px" style={{display: searchErrorVisibility ? "" : "none"}} icon={xIcon} color="red" title="Error!" onClose={() => setSearchErrorVisibility(false)}>
              Search cannot be empty.
            </Notification>
        </Container>

        <div>
          <ConnectWallet />

          {userSession.isUserSignedIn() ?
            <Paper p="md" shadow="xs" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '320px' }}>
              {userFound ? 
                <Stack>

                  <Text align="center" size="xl" mb="16px">Welcome back!</Text>
                  <Link href={`/users/${userAddress}`} style={{textAlign: "center"}}>
                    <Button>View Profile</Button>
                  </Link>
                </Stack>
                :
                <Stack>
                  <Text align="center" size="xl" mb="16px">Become a creator</Text>
                  <Link href="/create-profile" style={{textAlign: "center"}}>
                    <Button>Create Profile</Button>
                  </Link>
                </Stack>
                
              }
            </Paper>
            :
            <div>
              <p>Sign in to create a profile</p>
            </div>
          }
        </div>

        <div className={styles.grid}>
          
        </div>
      </main>
    </Connect>
  );
}
