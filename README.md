# Stacks Creator Platform
A creator platform dApp made for the Ready Layer 2 hackathon.

## Setup
Clone the repository, then run `npm install` from within both the `frontend` folder and `backend` folder.

## Local testing
From inside the `frontend` folder, run `npm run dev`. This will start up the Next.js frontend at http://localhost:3000, where you can interact with the app and smart contracts.

## Contracts
The app's backend uses two Clarity contracts to manage the platform. They are currently deployed to testnet.

The `creators-platform` contract can be found here: https://explorer.hiro.so/txid/STSN2NQMWNYSZ2373C1MD96QJVFNNKV8F033JAJ4.creators-platform?chain=testnet

The `creators-data-storage` contract can be found here: https://explorer.hiro.so/txid/STSN2NQMWNYSZ2373C1MD96QJVFNNKV8F033JAJ4.creators-data-storage?chain=testnet

You can deploy the contracts yourself and change the contract addresses used throughout the frontend.

### Contract functions for `creators-platform`

| Function | Use |
| ------ | ------ |
| create-profile | Creates a new profile for the tx sender, with a display name, and a hash of all other profile data. |
| update-profile | Updates the tx sender's profile with a new display name and hash of all other profile data. |
| create-product | Creates a new product belonging to the tx sender, with a price, and a hash of all other product data. |
| update-product | Updates a product belonging to the tx sender, with a new price and hash of all other product data. |
| remove-product | Removes a product belonging to the tx sender. |

### Contract functions for `creators-data-storage`

| Function | Use |
| ------ | ------ |
| get-contract-owner | Gets the current owner of the contract. |
| is-contract-owner | Checks if the tx sender is the contract owner. |
| set-contract-owner | Changes the contract owner. Only the contract owner can use this. |
| create-profile | Creates a new profile for a specific principal, with a display name, and a hash of all other profile data. Only the contract owner can use this. |
| update-profile | Updates a specific principal's profile with a new display name and hash of all other profile data. Only the contract owner can use this. |
| create-product | Creates a new product for a specified principal, with a price, and a hash of all other product data. Only the contract owner can use this. |
| update-product | Updates a product for a specified principal, with a new price and hash of all other product data. Only the contract owner can use this. |
| remove-product | Removes a product for a specified principal. Only the contract owner can use this. |
| get-creator | Gets the profile data for a specific principal. |
| get-creator-tier | Gets the current tier level for a specific principal. |
| get-creator-products | Gets a list of product id's for a specific principal. |
| get-product | Gets the product data for a specific product id. |

## Frontend
![Home page of the creator platform](https://d112y698adiu2z.cloudfront.net/photos/production/software_photos/002/826/399/datas/gallery.jpg)

In the home page, you can search for a user by address, connect your wallet, or, once connected, create a profile or view it if it already exists.

![User profile for John Doe](https://d112y698adiu2z.cloudfront.net/photos/production/software_photos/002/826/400/datas/gallery.jpg)

A user's profile can be found in `/users/<address>`, where `<address>` is the user's Stacks address. You can view a user's profile data this way, including their display name, a list of products they've created, and (for now) a hash of their bio and product descriptions. The app currently does not store the original data for a user's products, so you'll see hash buffers instead of actual info.

When viewing your own profile page, you can add, edit, or remove products, which will make calls to the smart contracts. Due to the slow block times at the time of this writing, it will take some time before you see a new product added/updated/deleted.

If you're viewing another user's profile page, you'll see Buy buttons that, right now, don't do anything. The idea was to make them call the smart contracts in order to create a buy request, which, if the creator accepts, moves your STX to the smart contract's funds, and if both the creator and the buyer confirm that the request was fulfilled (done in another page or component), sends the held STX to the creator's wallet.