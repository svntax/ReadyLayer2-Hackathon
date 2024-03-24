"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "./page.module.css";

import { Paper, Text, Button } from '@mantine/core';

import { Connect } from "@stacks/connect-react";

import ConnectWallet, { userSession } from "../components/ConnectWallet";

export default function Home() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  return (
    <Connect
      authOptions={{
        appDetails: {
          name: "Stacks Next.js Template",
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

        <div>
          <ConnectWallet />

          {userSession.isUserSignedIn() ?
            <Paper p="md" shadow="xs" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '320px' }}>
                <Text align="center" size="xl" mb="16px">Become a creator</Text>
                <Link href="/create-profile">
                  <Button>Create Profile</Button>
                </Link>
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
