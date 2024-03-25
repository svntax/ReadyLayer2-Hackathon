"use client";

import React from 'react';

import { Connect } from "@stacks/connect-react";

import ContractCallEditProduct from "../../../components/ContractCallEditProduct.js";
import { userSession } from "../../../components/ConnectWallet.js";

const EditProductPage = ({ params }) => {
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
            <ContractCallEditProduct productId={params.productid} />
        </Connect>
    );
};

export default EditProductPage;