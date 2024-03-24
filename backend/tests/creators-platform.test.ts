import { Cl, contractPrincipalCV, contractPrincipalCVFromAddress } from "@stacks/transactions";
import { describe, expect, it } from "vitest";

const creatorsPlatformContract = "creators-platform";
const creatorsDataStorageContract = "creators-data-storage";
const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const address1 = accounts.get("wallet_1")!;
const address2 = accounts.get("wallet_2")!;

describe("Tests for the creator platform smart contract.", () => {
  it("ensures simnet is well initalised", () => {
    expect(simnet.blockHeight).toBeDefined();
  });

  it("Deployer changes the owner of the data storage contract to the creators-platform contract.", () => {
    const setContractOwnerResponse = simnet.callPublicFn(creatorsDataStorageContract, "set-contract-owner", [contractPrincipalCV(deployer, creatorsPlatformContract)], deployer);
    expect(setContractOwnerResponse.result).toBeOk(Cl.bool(true));
  });

  it("Create a profile for the senders. Then senders update their profiles.", () => {
    const setContractOwnerResponse = simnet.callPublicFn(creatorsDataStorageContract, "set-contract-owner", [contractPrincipalCV(deployer, creatorsPlatformContract)], deployer);
    expect(setContractOwnerResponse.result).toBeOk(Cl.bool(true));

    let createProfileResponse = simnet.callPublicFn(creatorsPlatformContract, "create-profile", [Cl.stringUtf8("Alice A"), Cl.bufferFromUtf8("Description for Alice A"), contractPrincipalCV(deployer, creatorsDataStorageContract)], address1);
    expect(createProfileResponse.result).toBeOk(Cl.bool(true));

    let getCreatorResponse = simnet.callReadOnlyFn(creatorsDataStorageContract, "get-creator", [Cl.standardPrincipal(address1)], address1);
    expect(getCreatorResponse.result).toBeSome(Cl.tuple({
      name: Cl.stringUtf8("Alice A"),
      products: Cl.list([]),
      tier: Cl.uint(1),
      "description-hash": Cl.bufferFromUtf8("Description for Alice A")
    }));

    let updateProfileResponse = simnet.callPublicFn(creatorsPlatformContract, "update-profile", [Cl.stringUtf8("Alice B"), Cl.bufferFromUtf8("Description for Alice B"), contractPrincipalCV(deployer, creatorsDataStorageContract)], address1);
    expect(updateProfileResponse.result).toBeOk(Cl.bool(true));
    
    getCreatorResponse = simnet.callReadOnlyFn(creatorsDataStorageContract, "get-creator", [Cl.standardPrincipal(address1)], address1);
    expect(getCreatorResponse.result).toBeSome(Cl.tuple({
      name: Cl.stringUtf8("Alice B"),
      products: Cl.list([]),
      tier: Cl.uint(1),
      "description-hash": Cl.bufferFromUtf8("Description for Alice B")
    }));

    createProfileResponse = simnet.callPublicFn(creatorsPlatformContract, "create-profile", [Cl.stringUtf8("Bob B"), Cl.bufferFromUtf8("Description for Bob B"), contractPrincipalCV(deployer, creatorsDataStorageContract)], address2);
    expect(createProfileResponse.result).toBeOk(Cl.bool(true));
    getCreatorResponse = simnet.callReadOnlyFn(creatorsDataStorageContract, "get-creator", [Cl.standardPrincipal(address2)], address2);
    expect(getCreatorResponse.result).toBeSome(Cl.tuple({
      name: Cl.stringUtf8("Bob B"),
      products: Cl.list([]),
      tier: Cl.uint(1),
      "description-hash": Cl.bufferFromUtf8("Description for Bob B")
    }));

    updateProfileResponse = simnet.callPublicFn(creatorsPlatformContract, "update-profile", [Cl.stringUtf8("Charlie C"), Cl.bufferFromUtf8("Description for Charlie"), contractPrincipalCV(deployer, creatorsDataStorageContract)], address2);
    expect(updateProfileResponse.result).toBeOk(Cl.bool(true));
    getCreatorResponse = simnet.callReadOnlyFn(creatorsDataStorageContract, "get-creator", [Cl.standardPrincipal(address2)], address2);
    expect(getCreatorResponse.result).toBeSome(Cl.tuple({
      name: Cl.stringUtf8("Charlie C"),
      products: Cl.list([]),
      tier: Cl.uint(1),
      "description-hash": Cl.bufferFromUtf8("Description for Charlie")
    }));
  });

  it("Delete a non-existent product the sender does not have.", () => {
    const setContractOwnerResponse = simnet.callPublicFn(creatorsDataStorageContract, "set-contract-owner", [contractPrincipalCV(deployer, creatorsPlatformContract)], deployer);
    expect(setContractOwnerResponse.result).toBeOk(Cl.bool(true));

    const createProfileResponse = simnet.callPublicFn(creatorsPlatformContract, "create-profile", [Cl.stringUtf8("Alice A"), Cl.bufferFromUtf8("Description for Alice A"), contractPrincipalCV(deployer, creatorsDataStorageContract)], address1);
    expect(createProfileResponse.result).toBeOk(Cl.bool(true));

    const removeProductResponse = simnet.callPublicFn(creatorsPlatformContract, "remove-product", [Cl.uint(123), contractPrincipalCV(deployer, creatorsDataStorageContract)], address1);
    expect(removeProductResponse.result).toBeErr(Cl.uint(105));
  });

  it("Update a non-existent product the sender does not have", () => {
    const setContractOwnerResponse = simnet.callPublicFn(creatorsDataStorageContract, "set-contract-owner", [contractPrincipalCV(deployer, creatorsPlatformContract)], deployer);
    expect(setContractOwnerResponse.result).toBeOk(Cl.bool(true));

    const createProfileResponse = simnet.callPublicFn(creatorsPlatformContract, "create-profile", [Cl.stringUtf8("Alice A"), Cl.bufferFromUtf8("Description for Alice A"), contractPrincipalCV(deployer, creatorsDataStorageContract)], address1);
    expect(createProfileResponse.result).toBeOk(Cl.bool(true));

    const updateProductResponse = simnet.callPublicFn(creatorsPlatformContract, "update-product", [Cl.uint(1), Cl.uint(123), Cl.bufferFromUtf8("Bad description"), contractPrincipalCV(deployer, creatorsDataStorageContract)], address1);
    expect(updateProductResponse.result).toBeErr(Cl.uint(105));
  });

  it("Sender creates products, then fails to add 1 beyond capacity, then deletes a product to make space.", () => {
    const setContractOwnerResponse = simnet.callPublicFn(creatorsDataStorageContract, "set-contract-owner", [contractPrincipalCV(deployer, creatorsPlatformContract)], deployer);
    expect(setContractOwnerResponse.result).toBeOk(Cl.bool(true));

    const createProfileResponse = simnet.callPublicFn(creatorsPlatformContract, "create-profile", [Cl.stringUtf8("Alice A"), Cl.bufferFromUtf8("Description for Alice A"), contractPrincipalCV(deployer, creatorsDataStorageContract)], address1);
    expect(createProfileResponse.result).toBeOk(Cl.bool(true));

    const productsLimit = 10;
    for(let i = 0; i < productsLimit; i++){
      let addProductResponse = simnet.callPublicFn(creatorsPlatformContract, "create-product", [Cl.uint(i+101), Cl.bufferFromUtf8("Description for product " + (i+1)), contractPrincipalCV(deployer, creatorsDataStorageContract)], address1);
      expect(addProductResponse.result).toBeOk(Cl.uint(i+1));
    }

    // Get the third product
    let getProductResponse = simnet.callReadOnlyFn(creatorsDataStorageContract, "get-product", [Cl.uint(3)], deployer);
    expect(getProductResponse.result).toBeSome(Cl.tuple({
      creator: Cl.standardPrincipal(address1),
      price: Cl.uint(103),
      "amount-sold": Cl.uint(0),
      "data-hash": Cl.bufferFromUtf8("Description for product 3")
    }));

    // Get all products from address1
    let getCreatorProductsResponse = simnet.callReadOnlyFn(creatorsDataStorageContract, "get-creator-products", [Cl.standardPrincipal(address1)], address1);
    expect(getCreatorProductsResponse.result).toBeSome(Cl.list([Cl.uint(1), Cl.uint(2), Cl.uint(3), Cl.uint(4), Cl.uint(5), Cl.uint(6), Cl.uint(7), Cl.uint(8), Cl.uint(9), Cl.uint(10)]));
    
    // Try to add one more product
    let addProductResponse = simnet.callPublicFn(creatorsPlatformContract, "create-product", [Cl.uint(999), Cl.bufferFromUtf8("Description for product 11"), contractPrincipalCV(deployer, creatorsDataStorageContract)], address1);
    expect(addProductResponse.result).toBeErr(Cl.uint(103));

    // Delete the 10th product
    const removeProductResponse = simnet.callPublicFn(creatorsPlatformContract, "remove-product", [Cl.uint(10), contractPrincipalCV(deployer, creatorsDataStorageContract)], address1);
    expect(removeProductResponse.result).toBeOk(Cl.bool(true));

    // Get all products from address1 and confirm product 10 is gone
    getCreatorProductsResponse = simnet.callReadOnlyFn(creatorsDataStorageContract, "get-creator-products", [Cl.standardPrincipal(address1)], deployer);
    expect(getCreatorProductsResponse.result).toBeSome(Cl.list([Cl.uint(1), Cl.uint(2), Cl.uint(3), Cl.uint(4), Cl.uint(5), Cl.uint(6), Cl.uint(7), Cl.uint(8), Cl.uint(9)]));
    
    // Add a new product
    addProductResponse = simnet.callPublicFn(creatorsPlatformContract, "create-product", [Cl.uint(999), Cl.bufferFromUtf8("Description for product 11"), contractPrincipalCV(deployer, creatorsDataStorageContract)], address1);
    expect(addProductResponse.result).toBeOk(Cl.uint(11));
    // Get the newly added product
    getProductResponse = simnet.callReadOnlyFn(creatorsDataStorageContract, "get-product", [Cl.uint(11)], deployer);
    expect(getProductResponse.result).toBeSome(Cl.tuple({
      creator: Cl.standardPrincipal(address1),
      price: Cl.uint(999),
      "amount-sold": Cl.uint(0),
      "data-hash": Cl.bufferFromUtf8("Description for product 11")
    }));
  });

  it("Create a product for the sender, update it, then remove it.", () => {
    const setContractOwnerResponse = simnet.callPublicFn(creatorsDataStorageContract, "set-contract-owner", [contractPrincipalCV(deployer, creatorsPlatformContract)], deployer);
    expect(setContractOwnerResponse.result).toBeOk(Cl.bool(true));

    const createProfileResponse = simnet.callPublicFn(creatorsPlatformContract, "create-profile", [Cl.stringUtf8("Alice A"), Cl.bufferFromUtf8("Description for Alice A"), contractPrincipalCV(deployer, creatorsDataStorageContract)], address1);
    expect(createProfileResponse.result).toBeOk(Cl.bool(true));

    const originalPrice = 50;
    const newPrice = 25;
    const originalDescription = "Description for product 1.";
    const newDescription = "Product 1 (On sale!)";

    const addProductResponse = simnet.callPublicFn(creatorsPlatformContract, "create-product", [Cl.uint(originalPrice), Cl.bufferFromUtf8(originalDescription), contractPrincipalCV(deployer, creatorsDataStorageContract)], address1);
    expect(addProductResponse.result).toBeOk(Cl.uint(1));

    let getProductResponse = simnet.callReadOnlyFn(creatorsDataStorageContract, "get-product", [Cl.uint(1)], address1);
    expect(getProductResponse.result).toBeSome(Cl.tuple({
      creator: Cl.standardPrincipal(address1),
      price: Cl.uint(originalPrice),
      "amount-sold": Cl.uint(0),
      "data-hash": Cl.bufferFromUtf8(originalDescription)
    }));

    const updateProductResponse = simnet.callPublicFn(creatorsPlatformContract, "update-product", [Cl.uint(1), Cl.uint(newPrice), Cl.bufferFromUtf8(newDescription), contractPrincipalCV(deployer, creatorsDataStorageContract)], address1);
    expect(updateProductResponse.result).toBeOk(Cl.bool(true));

    getProductResponse = simnet.callReadOnlyFn(creatorsDataStorageContract, "get-product", [Cl.uint(1)], address1);
    expect(getProductResponse.result).toBeSome(Cl.tuple({
      creator: Cl.standardPrincipal(address1),
      price: Cl.uint(newPrice), // Price changed
      "amount-sold": Cl.uint(0),
      "data-hash": Cl.bufferFromUtf8(newDescription) // Description changed
    }));

    const removeProductResponse = simnet.callPublicFn(creatorsPlatformContract, "remove-product", [Cl.uint(1), contractPrincipalCV(deployer, creatorsDataStorageContract)], address1);
    expect(removeProductResponse.result).toBeOk(Cl.bool(true));

    getProductResponse = simnet.callReadOnlyFn(creatorsDataStorageContract, "get-product", [Cl.uint(1)], address1);
    expect(getProductResponse.result).toBeNone();
  });
});