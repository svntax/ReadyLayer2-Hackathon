"use client";

import React from 'react';

import { Connect } from "@stacks/connect-react";

import ContractCallCreateProfile from "../../components/ContractCallCreateProfile.js";
import { userSession } from "../../components/ConnectWallet";

const CreateProfilePage = () => {
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
            <ContractCallCreateProfile />
        </Connect>
    );
};

export default CreateProfilePage;