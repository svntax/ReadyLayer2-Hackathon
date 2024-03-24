"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';

import { Alert, Paper, Stack, Flex, Loader, Container, Text, Button, TextInput, Textarea } from '@mantine/core';
import { IconInfoTriangle } from '@tabler/icons-react';

import { useConnect } from "@stacks/connect-react";
import { StacksTestnet } from "@stacks/network";
import {
    AnchorMode,
    PostConditionMode,
    stringUtf8CV,
    bufferCVFromString
} from "@stacks/transactions";
import { userSession } from "./ConnectWallet";

import { sha256 } from "js-sha256";
import Link from "next/link";

const ContractCallVote = () => {
    const [displayName, setDisplayName] = useState('');
    const [bio, setBio] = useState('');

    const router = useRouter();

    const { doContractCall } = useConnect();

    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    const submitProfileData = (e) => {
        e.preventDefault();
        //createProfile(displayName, bio); // TODO: call contract
        const profile = userSession.loadUserData().profile.stxAddress;
        router.push(`/users/${profile.testnet}`);
    };

    function createProfile(username, description) {
        const descriptionHash = sha256(description);
        doContractCall({
            network: new StacksTestnet(),
            anchorMode: AnchorMode.Any,
            contractAddress: "ST2S5QJBSS7GRPDCPG12XW28W8G7TC99WCP27ETJB",
            contractName: "creators-platform",
            functionName: "create-profile",
            functionArgs: [stringUtf8CV(username), bufferCVFromString(descriptionHash)],
            postConditionMode: PostConditionMode.Deny,
            postConditions: [],
            onFinish: (data) => {
                console.log("onFinish:", data);
                window
                    .open(
                        `https://explorer.hiro.so/txid/${data.txId}?chain=testnet`,
                        "_blank"
                    )
                    .focus();
                // Redirect to the user's profile page
                const profile = userSession.loadUserData().profile.stxAddress;
                router.push(`/users/${profile.testnet}`);
            },
            onCancel: () => {
                console.log("onCancel:", "Transaction was canceled");
            },
        });
    }

    if (!mounted || !userSession.isUserSignedIn()) {
        if(!mounted){
            return (
                <Flex w="100vw" h="100vh" align="center" justify="center">
                    <Loader color="blue" />
                </Flex>
            );
        }
        const icon = <IconInfoTriangle />;
        return (
            <Stack mt="2rem" align="center">
                <Text align="center" size="xl">Create Your Profile</Text>
                <Alert variant="light" color="red" title="User is not signed in!" icon={icon}>
                    You must be signed in to create a profile.
                </Alert>
                <Link href="/">
                  <Button variant="default">Go back</Button>
                </Link>
            </Stack>
        );
    }

    return (
        <Container mt="6rem">
            <Paper p="md" shadow="xs">
                <Flex direction="column" align="center" justify="center" style={{  }}>
                    <Text align="center" size="xl">Create Your Profile</Text>
                    <form onSubmit={submitProfileData} style={{ width: "100%", maxWidth: "400px" }}>
                        <TextInput
                            label="Display Name"
                            placeholder="Enter your display name"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            required
                            mb="16px"
                        />
                        <Textarea
                            label="Bio"
                            placeholder="Describe yourself and what you create..."
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            required
                            mb="16px"
                            autosize
                            minRows={8}
                            maxRows={8}
                        />
                        <Button type="submit">Create Profile</Button>
                        <Button ml="4px" color="gray" variant="subtle" onClick={() => router.back()}>Back</Button>
                    </form>
                </Flex>
            </Paper>
        </Container>
    );
};

export default ContractCallVote;
