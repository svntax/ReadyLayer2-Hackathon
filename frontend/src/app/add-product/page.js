"use client";

import React from 'react';

import { Connect } from "@stacks/connect-react";

import ContractCallAddProduct from "../../components/ContractCallAddProduct.js";
import { userSession } from "../../components/ConnectWallet";

const AddProductPage = () => {
    return (
        <Connect
            authOptions={{
                appDetails: {
                name: "Stacks Creator Platform",
                },
                redirectTo: "/",
                onFinish: () => {
                    window.location.reload();
                },
                userSession,
            }}
        >
            <ContractCallAddProduct />
        </Connect>
    );
};

export default AddProductPage;