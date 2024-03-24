"use client";

import React, { useEffect, useState } from "react";

import { Grid, Card, Container, Flex, Loader, Title, Text, Box, GridCol, Button } from '@mantine/core';

import { userSession } from "../../../components/ConnectWallet";

const CreatorProfilePage = ({ params }) => {
    const [userWallet, setUserWallet] = useState('');
    const [username, setUsername] = useState("User name not found.");
    const [bio, setBio] = useState('User bio not found.');
    const [userSignedIn, setUserSignedIn] = useState(false);

    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        // TODO: read data from contracts
        setUsername("Test user");
        setBio("This is a placeholder bio.");
        if(userSession.isUserSignedIn()){
            setUserWallet(userSession.loadUserData().profile.stxAddress.testnet);
            setUserSignedIn(true);
        }
        else{
            setUserSignedIn(false);
        }
        setMounted(true);
    }, []);

    if(!mounted){
        return (
            <Flex w="100vw" h="100vh" align="center" justify="center">
                <Loader color="blue" />
            </Flex>
        );
    }

    const products = [
        {
            name: "Product 1",
            description: "This is a description for the product.",
            price: 50,
            amountSold: 110,
        },
        {
            name: "Product 2",
            description: "This is a description for the product.",
            price: 50,
            amountSold: 50,
        },
        {
            name: "Product 3",
            description: "This is a description for the product.",
            price: 50,
            amountSold: 30,
        },
        {
            name: "Product 4",
            description: "This is a description for the product.",
            price: 50,
            amountSold: 5,
        },
        {
            name: "Product 5",
            description: "This is a description for the product.",
            price: 50,
            amountSold: 0,
        }
    ]

    return (
        <Flex>
            <Container size="lg">
                <Flex gap="md" justify="center" align="flex-start" direction="column" m="lg">
                    <Title order={1}>{username}</Title>
                    <Text align="center" size="xl">Wallet: {params.useraddress}</Text>
                    <Text align="center" size="md">{bio}</Text>
                    <Grid m="0" gutter="sm">
                        {products.map((product, index) => (
                            <GridCol key={index} span={{base: 12, xs: 12, sm: 6, md: 4, lg: 4, xl: 3}} align="center">
                                <Card shadow="xs" p="0" miw="250px" maw="250px">
                                <Box
                                    w="100%"
                                    h="200px"
                                    bg="#ed9b5c"
                                    p="0"
                                >
                                    <Flex justify="flex-end" align="flex-end" h="100%">
                                        <Box m="xs" pl="xs" pr="xs" bg="#5546ff" style={{borderRadius: "3px"}}>
                                        <Text c="#fff" size="md">{product.price} STX</Text>
                                        </Box>
                                    </Flex>
                                </Box>
                                <Text size="md" m="xs" align="left">{product.name}</Text>
                                <Text size="sm" m="xs" align="left">{product.description}</Text>
                                <Text size="sm" m="xs" align="left">{product.amountSold} sold</Text>
                                {userWallet === params.useraddress ?
                                <Flex m="xs" gap="xs">
                                    <Button variant="outline" color="yellow">Edit</Button>
                                    <Button variant="subtle" color="red">Remove</Button>
                                </Flex>
                                :
                                <Flex m="xs" gap="xs" style={ { display: userSignedIn ? 'flex' : 'none' } }>
                                    <Button variant="filled">Buy</Button>
                                </Flex>
                                }
                                </Card>
                            </GridCol>
                        ))}
                    </Grid>
                </Flex>
            </Container>
        </Flex>
    );
};

export default CreatorProfilePage;