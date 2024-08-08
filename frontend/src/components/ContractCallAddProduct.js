"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';

import { Alert, Paper, Stack, Flex, Loader, Container, Text, Button, TextInput, Textarea, NumberInput } from '@mantine/core';
import { IconInfoTriangle } from '@tabler/icons-react';

import { useConnect } from "@stacks/connect-react";
import { StacksTestnet } from "@stacks/network";
import {
    AnchorMode,
    PostConditionMode,
    uintCV,
    bufferCV,
    contractPrincipalCV
} from "@stacks/transactions";
import { userSession } from "./ConnectWallet";

import { sha256 } from "js-sha256";
import Link from "next/link";

const ContractCallAddProduct = () => {
    const [productName, setProductName] = useState('');
    const [summary, setSummary] = useState('');
    const [longDescription, setLongDescription] = useState('');
    const [productPrice, setProductPrice] = useState(1);

    const router = useRouter();

    const { doContractCall } = useConnect();

    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    const submitProfileData = (e) => {
        e.preventDefault();
        addProduct();
    };

    function addProduct() {
        const productData = {
            name: productName,
            summary: summary,
            descriptiion: longDescription
        };
        // TODO: need to convert STX price to micro-STX
        // See https://docs.hiro.so/tutorials/sending-tokens#step-3-generating-transaction
        const productDataJsonString = JSON.stringify(productData);
        const productDataHash = sha256(productDataJsonString);
        doContractCall({
            network: new StacksTestnet(),
            anchorMode: AnchorMode.Any,
            contractAddress: "STSN2NQMWNYSZ2373C1MD96QJVFNNKV8F033JAJ4",
            contractName: "creators-platform",
            functionName: "create-product",
            functionArgs: [uintCV(productPrice), bufferCV(Buffer.from(productDataHash)), contractPrincipalCV("STSN2NQMWNYSZ2373C1MD96QJVFNNKV8F033JAJ4", "creators-data-storage")],
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
        if (!mounted) {
            return (
                <Flex w="100vw" h="100vh" align="center" justify="center">
                    <Loader color="blue" />
                </Flex>
            );
        }
        const icon = <IconInfoTriangle />;
        return (
            <Stack mt="2rem" align="center">
                <Text align="center" size="xl">Add a Product!</Text>
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
            <Flex direction="column" align="center" justify="center" style={{}}>
                <Text align="center" size="xl">Add a Product!</Text>
                <form onSubmit={submitProfileData} style={{ width: "100%", maxWidth: "400px" }}>
                    <TextInput
                        label="Product Name"
                        placeholder="Enter product name"
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                        required
                        mb="16px"
                    />
                    <NumberInput
                        label="Price (STX)"
                        placeholder="Enter the price"
                        value={productPrice}
                        min={0}
                        onChange={setProductPrice}
                        required
                        mb="16px"
                    />
                    <TextInput
                        label="Summary"
                        placeholder="Enter a short summary"
                        value={summary}
                        onChange={(e) => setSummary(e.target.value)}
                        required
                        mb="16px"
                    />
                    <Textarea
                        label="Long Description"
                        placeholder="Enter a detailed description"
                        value={longDescription}
                        onChange={(e) => setLongDescription(e.target.value)}
                        required
                        mb="16px"
                        autosize
                        minRows={8}
                        maxRows={8}
                    />

                    <Button type="submit">Save and Publish</Button>
                    <Button ml="4px" color="gray" variant="subtle" onClick={() => router.back()}>Back</Button>
                </form>
            </Flex>
        </Container>
    );
};

export default ContractCallAddProduct;