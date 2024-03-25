"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { useDisclosure } from "@mantine/hooks";
import { Modal, Grid, Card, Container, Flex, Stack, Alert, Loader, Notification, rem, Title, Text, Box, GridCol, Button } from "@mantine/core";
import { IconX, IconInfoTriangle } from "@tabler/icons-react";

import { cvToValue, uintCV, callReadOnlyFunction, standardPrincipalCV, validateStacksAddress } from "@stacks/transactions";
import { StacksTestnet } from "@stacks/network";
import { userSession } from "../../../components/ConnectWallet";

const CreatorProfilePage = ({ params }) => {
    const [userWallet, setUserWallet] = useState("");
    const [username, setUsername] = useState("User name not found.");
    const [bio, setBio] = useState("User bio not found.");
    const [userSignedIn, setUserSignedIn] = useState(false);
    const [products, setProducts] = useState([]);
    const [productIdToDelete, selectProductToDelete] = useState(0);
    const [errorVisibility, setErrorVisibility] = useState(false);
    const [userFound, setUserFound] = useState(false);

    const [opened, { open, close }] = useDisclosure(false);

    const router = useRouter();

    const xIcon = <IconX style={{ width: rem(20), height: rem(20) }} />;
    const icon = <IconInfoTriangle />;

    const placeholderProducts = [
        {
            name: "Product 1",
            description: "This is a description for the product.",
            price: 50,
            amountSold: 110,
            id: 1
        },
        {
            name: "Product 2",
            description: "This is a description for the product.",
            price: 50,
            amountSold: 50,
            id: 2
        },
        {
            name: "Product 3",
            description: "This is a description for the product.",
            price: 50,
            amountSold: 30,
            id: 5
        },
        {
            name: "Product 4",
            description: "This is a description for the product.",
            price: 50,
            amountSold: 5,
            id: 23
        },
        {
            name: "Product 5",
            description: "This is a description for the product.",
            price: 50,
            amountSold: 0,
            id: 44
        }
    ];

    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        if(validateStacksAddress(params.useraddress)){
            const contractAddress = "STSN2NQMWNYSZ2373C1MD96QJVFNNKV8F033JAJ4";
            const contractName = "creators-data-storage";
            const functionName = "get-creator";
            const network = new StacksTestnet();
            let senderAddress = "ST2S5QJBSS7GRPDCPG12XW28W8G7TC99WCP27ETJB"; // Default to deployer? Not sure if this is okay.
            //senderAddress = userSession.loadUserData().profile.stxAddress.testnet;
    
            const options = {
                contractAddress,
                contractName,
                functionName,
                functionArgs: [standardPrincipalCV(params.useraddress)],
                network,
                senderAddress,
            };
    
            const result = callReadOnlyFunction(options).then(async (data) => {
                const userData = cvToValue(data);
                if(userData){
                    setUserFound(true);
                    setUsername(userData.value.name.value);
                    const hashedDescription = userData.value["description-hash"].value;
                    // TODO: map hash to data?
                    setBio("Bio: " + userData.value["description-hash"].value);
                    const fetchedProducts = userData.value.products.value;
                    // Fetch product info for each product id
                    const productsParsed = [];
                    for(let i = 0; i < fetchedProducts.length; i++){
                        const productId = fetchedProducts[i].value;
                        const getProductResponse = await callReadOnlyFunction({
                            contractAddress: contractAddress,
                            contractName: contractName,
                            functionName: "get-product",
                            functionArgs: [uintCV(productId)],
                            network: network,
                            senderAddress: senderAddress
                        });
                        const productResult = cvToValue(getProductResponse);
                        productsParsed.push({
                            name: "Product ID #" + productId,
                            description: productResult.value["data-hash"].value,
                            price: productResult.value["price"].value,
                            amountSold: productResult.value["amount-sold"].value,
                            id: productId
                        });
                    }
                    setProducts(productsParsed);
                    //setProducts(placeholderProducts);
                }
                else{
                    setUserFound(false);
                    setProducts([]);
                    setUsername("This user does not have a profile page.");
                    setBio("If you just created a profile, try again later.");
                }
            });
    
            setUsername("No user found.");
            setBio("No bio found.");
            if(userSession.isUserSignedIn()){
                setUserWallet(userSession.loadUserData().profile.stxAddress.testnet);
                setUserSignedIn(true);
            }
            else{
                setUserSignedIn(false);
            }
            setMounted(true);
        }
    }, []);

    if(!mounted){
        if(!validateStacksAddress(params.useraddress)){
            return (
                <Stack mt="2rem" align="center">
                    <Alert variant="light" color="red" title="Invalid user profile!" icon={icon}>
                        This user profile does not have a valid address.
                    </Alert>
                    <Link href="/">
                    <Button variant="default">Go back</Button>
                    </Link>
                </Stack>
            );
        }
        return (
            <Flex w="100vw" h="100vh" align="center" justify="center">
                <Loader color="blue" />
            </Flex>
        );
    }

    const tier1ProductsLimit = 10;
    const addProduct = () => {
        if(products.length < tier1ProductsLimit){
            router.push("/add-product");
        }
        else{
            setErrorVisibility(true);
        }
    }

    const editProduct = (productId) => {
        router.push(`/edit-product/${productId}`);
    }

    const removeProductPrompt = (productId) => {
        selectProductToDelete(productId);
        open();
    }

    const removeProduct = () => {
        selectProductToDelete(0);
        close();
        // TODO: delete product and refresh
        //callcontract productIdToDelete
        router.refresh();
    }

    const cancelRemove = () => {
        close();
        selectProductToDelete(0);
    }

    return (
        <Flex>
            <Modal opened={opened} onClose={close} title="Remove Product">
                <Title order={3}>Are you sure you want to delete this product?</Title>
                <Flex m="xs" gap="xs">
                    <Button variant="subtle" color="gray" onClick={cancelRemove}>Cancel</Button>
                    <Button variant="filled" color="red" onClick={removeProduct}>Delete</Button>
                </Flex>
            </Modal>

            <Container size="lg">
                <Flex gap="md" justify="center" align="flex-start" direction="column" m="lg" style={{wordWrap: "break-word"}}>
                    <Title order={1}>{username}</Title>
                    <Container style={{wordBreak: "break-word"}}>
                        <Text align="left" size="xl">Wallet: {params.useraddress}</Text>
                        <Text align="left" size="md">{bio}</Text>
                    </Container>
                    {userWallet === params.useraddress && userFound ?
                        <Button onClick={addProduct}>Add Product</Button>
                        :
                        <Button onClick={() => router.push("/")}>Home</Button>
                    }
                    <Notification style={{display: errorVisibility ? "" : "none"}} icon={xIcon} color="red" title="You've reached the limit!" onClose={() => setErrorVisibility(false)}>
                        You can't add any more products.
                    </Notification>
                    <Title>{products.length > 0 ? "Products" : "No products found."}</Title>
                    <Grid m="0" gutter="sm">
                        {products.map((product, index) => (
                            <GridCol key={index} span={{base: 12, xs: 12, sm: 6, md: 4, lg: 4, xl: 3}} align="center" miw="262px">
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
                                    <Text size="sm" m="xs" align="left" style={{wordWrap: "break-word"}}>{product.description}</Text>
                                    <Text size="sm" m="xs" align="left">{product.amountSold} sold</Text>
                                    {userWallet === params.useraddress ?
                                    <Flex m="xs" gap="xs">
                                        <Button variant="outline" color="yellow" onClick={() => editProduct(product.id)}>Edit</Button>
                                        <Button variant="subtle" color="red" onClick={() => removeProductPrompt(product.id)}>Remove</Button>
                                    </Flex>
                                    :
                                    <Flex m="xs" gap="xs" style={ { display: userSignedIn ? "flex" : "none" } }>
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