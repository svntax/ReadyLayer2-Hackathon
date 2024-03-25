"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';

import { Button } from '@mantine/core';

import { useConnect } from "@stacks/connect-react";
import { StacksTestnet } from "@stacks/network";
import {
    AnchorMode,
    PostConditionMode,
    uintCV,
    contractPrincipalCV
} from "@stacks/transactions";

const ContractCallRemoveProduct = ({ productId, closeModal }) => {
    const router = useRouter();

    const { doContractCall } = useConnect();

    const removeProduct = async () => {
        await doContractCall({
            network: new StacksTestnet(),
            anchorMode: AnchorMode.Any,
            contractAddress: "STSN2NQMWNYSZ2373C1MD96QJVFNNKV8F033JAJ4",
            contractName: "creators-platform",
            functionName: "remove-product",
            functionArgs: [uintCV(productId), contractPrincipalCV("STSN2NQMWNYSZ2373C1MD96QJVFNNKV8F033JAJ4", "creators-data-storage")],
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
                
                
                // TODO: delete the product from offchain storage
                // Refresh the page
                router.refresh();
                closeModal();
            },
            onCancel: () => {
                console.log("onCancel:", "Transaction was canceled");
            },
        });
    }

    const cancelRemove = () => {
        close();
        selectProductToDelete(0);
    }

    return (
        <Button variant="filled" color="red" onClick={removeProduct}>Delete</Button>
    );
};

export default ContractCallRemoveProduct;