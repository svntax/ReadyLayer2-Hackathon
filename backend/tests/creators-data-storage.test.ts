import { Cl, cvToValue } from "@stacks/transactions";
import { describe, expect, it } from "vitest";

const creatorsDataStorageContract = "creators-data-storage";
const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const address1 = accounts.get("wallet_1")!;
const address2 = accounts.get("wallet_2")!;

describe("Tests for creators data storage", () => {
  it("ensures simnet is well initalised", () => {
    expect(simnet.blockHeight).toBeDefined();
  });

  it("Ensure initial contract owner is deployer", () => {
    const getContractOwnerResponse = simnet.callReadOnlyFn(creatorsDataStorageContract, "get-contract-owner", [], deployer);
    const contractPrincipal = cvToValue(getContractOwnerResponse.result);
    expect(contractPrincipal.value).toEqual(deployer);
  });

  it("Get a creator that does not exist.", () => {
    const { result } = simnet.callReadOnlyFn(creatorsDataStorageContract, "get-creator", [Cl.standardPrincipal(address1)], address1);
    expect(result).toBeNone();
  });

  it("Get the tier of a creator that does not exist.", () => {
    const { result } = simnet.callReadOnlyFn(creatorsDataStorageContract, "get-creator-tier", [Cl.standardPrincipal(address1)], address1);
    expect(result).toBeNone();
  });

  it("Get the products of a creator that does not exist.", () => {
    const { result } = simnet.callReadOnlyFn(creatorsDataStorageContract, "get-creator-products", [Cl.standardPrincipal(address1)], address1);
    expect(result).toBeNone();
  });

  it("Create a profile for a creator.", () => {
    const createProfileResponse = simnet.callPublicFn(creatorsDataStorageContract, "create-profile", [Cl.standardPrincipal(address1), Cl.stringUtf8("Alice A"), Cl.bufferFromUtf8("Description for Alice A")], deployer);
    expect(createProfileResponse.result).toBeOk(Cl.bool(true));

    const getCreatorResponse = simnet.callReadOnlyFn(creatorsDataStorageContract, "get-creator", [Cl.standardPrincipal(address1)], deployer);
    expect(getCreatorResponse.result).toBeSome(Cl.tuple({
      name: Cl.stringUtf8("Alice A"),
      products: Cl.list([]),
      tier: Cl.uint(1),
      "description-hash": Cl.bufferFromUtf8("Description for Alice A")
    }));

    const getTierResponse = simnet.callReadOnlyFn(creatorsDataStorageContract, "get-creator-tier", [Cl.standardPrincipal(address1)], address1);
    expect(getTierResponse.result).toBeSome(Cl.uint(1));
  });

  it("Create and update a profile for a creator.", () => {
    const createProfileResponse = simnet.callPublicFn(creatorsDataStorageContract, "create-profile", [Cl.standardPrincipal(address1), Cl.stringUtf8("Alice A"), Cl.bufferFromUtf8("Description for Alice A")], deployer);
    expect(createProfileResponse.result).toBeOk(Cl.bool(true));

    let getCreatorResponse = simnet.callReadOnlyFn(creatorsDataStorageContract, "get-creator", [Cl.standardPrincipal(address1)], deployer);
    expect(getCreatorResponse.result).toBeSome(Cl.tuple({
      name: Cl.stringUtf8("Alice A"),
      products: Cl.list([]),
      tier: Cl.uint(1),
      "description-hash": Cl.bufferFromUtf8("Description for Alice A")
    }));

    const updateProfileResponse = simnet.callPublicFn(creatorsDataStorageContract, "update-profile", [Cl.standardPrincipal(address1), Cl.stringUtf8("Alice B"), Cl.bufferFromUtf8("Description for Alice B")], deployer);
    expect(updateProfileResponse.result).toBeOk(Cl.bool(true));
    
    getCreatorResponse = simnet.callReadOnlyFn(creatorsDataStorageContract, "get-creator", [Cl.standardPrincipal(address1)], deployer);
    expect(getCreatorResponse.result).toBeSome(Cl.tuple({
      name: Cl.stringUtf8("Alice B"),
      products: Cl.list([]),
      tier: Cl.uint(1),
      "description-hash": Cl.bufferFromUtf8("Description for Alice B")
    }));
  });

  it("Update a profile that does not exist.", () => {
    const updateProfileResponse = simnet.callPublicFn(creatorsDataStorageContract, "update-profile", [Cl.standardPrincipal(address1), Cl.stringUtf8("Alice B"), Cl.bufferFromUtf8("Description for Alice B")], deployer);
    expect(updateProfileResponse.result).toBeErr(Cl.uint(102));
  });

  it("Non-contract owner attempts and fails to create a profile.", () => {
    const createProfileResponse = simnet.callPublicFn(creatorsDataStorageContract, "create-profile", [Cl.standardPrincipal(address1), Cl.stringUtf8("Alice A"), Cl.bufferFromUtf8("Description for Alice A")], address1);
    expect(createProfileResponse.result).toBeErr(Cl.uint(100));
  });

  it("Create a profile that already exists.", () => {
    let createProfileResponse = simnet.callPublicFn(creatorsDataStorageContract, "create-profile", [Cl.standardPrincipal(address1), Cl.stringUtf8("Alice A"), Cl.bufferFromUtf8("Description for Alice A")], deployer);
    expect(createProfileResponse.result).toBeOk(Cl.bool(true));

    createProfileResponse = simnet.callPublicFn(creatorsDataStorageContract, "create-profile", [Cl.standardPrincipal(address1), Cl.stringUtf8("Alice A"), Cl.bufferFromUtf8("Description for Alice A")], deployer);
    expect(createProfileResponse.result).toBeErr(Cl.uint(101));
  });

  it("Create multiple profiles.", () => {
    // Create profile for Alice A
    let createProfileResponse = simnet.callPublicFn(creatorsDataStorageContract, "create-profile", [Cl.standardPrincipal(address1), Cl.stringUtf8("Alice A"), Cl.bufferFromUtf8("Description for Alice A")], deployer);
    expect(createProfileResponse.result).toBeOk(Cl.bool(true));

    let getCreatorResponse = simnet.callReadOnlyFn(creatorsDataStorageContract, "get-creator", [Cl.standardPrincipal(address1)], address1);
    expect(getCreatorResponse.result).toBeSome(Cl.tuple({
      name: Cl.stringUtf8("Alice A"),
      products: Cl.list([]),
      tier: Cl.uint(1),
      "description-hash": Cl.bufferFromUtf8("Description for Alice A")
    }));

    // Create profile for Bob B
    createProfileResponse = simnet.callPublicFn(creatorsDataStorageContract, "create-profile", [Cl.standardPrincipal(address2), Cl.stringUtf8("Bob B"), Cl.bufferFromUtf8("Description for Bob B")], deployer);
    expect(createProfileResponse.result).toBeOk(Cl.bool(true));

    getCreatorResponse = simnet.callReadOnlyFn(creatorsDataStorageContract, "get-creator", [Cl.standardPrincipal(address2)], address2);
    expect(getCreatorResponse.result).toBeSome(Cl.tuple({
      name: Cl.stringUtf8("Bob B"),
      products: Cl.list([]),
      tier: Cl.uint(1),
      "description-hash": Cl.bufferFromUtf8("Description for Bob B")
    }));

    // Alice gets profile data of Bob
    getCreatorResponse = simnet.callReadOnlyFn(creatorsDataStorageContract, "get-creator", [Cl.standardPrincipal(address2)], address1);
    expect(getCreatorResponse.result).toBeSome(Cl.tuple({
      name: Cl.stringUtf8("Bob B"),
      products: Cl.list([]),
      tier: Cl.uint(1),
      "description-hash": Cl.bufferFromUtf8("Description for Bob B")
    }));
  });

  it("Create a product for a creator that does not exist.", () => {
    const addProductResponse = simnet.callPublicFn(creatorsDataStorageContract, "create-product", [Cl.standardPrincipal(address2), Cl.uint(99), Cl.bufferFromUtf8("Description for product 1")], deployer);
    expect(addProductResponse.result).toBeErr(Cl.uint(102));
  });

  it("Delete a non-existent product for a creator.", () => {
    const createProfileResponse = simnet.callPublicFn(creatorsDataStorageContract, "create-profile", [Cl.standardPrincipal(address1), Cl.stringUtf8("Alice A"), Cl.bufferFromUtf8("Description for Alice A")], deployer);
    expect(createProfileResponse.result).toBeOk(Cl.bool(true));

    const removeProductResponse = simnet.callPublicFn(creatorsDataStorageContract, "remove-product", [Cl.standardPrincipal(address1), Cl.uint(123)], deployer);
    expect(removeProductResponse.result).toBeErr(Cl.uint(105));
  });

  it("Create a product for two creators. Then try and fail to update & delete a product for the wrong creator.", () => {
    // Create profiles
    let createProfileResponse = simnet.callPublicFn(creatorsDataStorageContract, "create-profile", [Cl.standardPrincipal(address1), Cl.stringUtf8("Alice A"), Cl.bufferFromUtf8("Description for Alice A")], deployer);
    expect(createProfileResponse.result).toBeOk(Cl.bool(true));

    createProfileResponse = simnet.callPublicFn(creatorsDataStorageContract, "create-profile", [Cl.standardPrincipal(address2), Cl.stringUtf8("Bob B"), Cl.bufferFromUtf8("Description for Bob B")], deployer);
    expect(createProfileResponse.result).toBeOk(Cl.bool(true));

    // Add product for Alice A
    let addProductResponse = simnet.callPublicFn(creatorsDataStorageContract, "create-product", [Cl.standardPrincipal(address1), Cl.uint(50), Cl.bufferFromUtf8("Alice's product 1")], deployer);
    expect(addProductResponse.result).toBeOk(Cl.uint(1));
    // Add product for Bob B
    addProductResponse = simnet.callPublicFn(creatorsDataStorageContract, "create-product", [Cl.standardPrincipal(address2), Cl.uint(75), Cl.bufferFromUtf8("Bob's product 1")], deployer);
    expect(addProductResponse.result).toBeOk(Cl.uint(2));

    const removeProductResponse = simnet.callPublicFn(creatorsDataStorageContract, "remove-product", [Cl.standardPrincipal(address1), Cl.uint(2)], deployer);
    expect(removeProductResponse.result).toBeErr(Cl.uint(106));

    const updateProductResponse = simnet.callPublicFn(creatorsDataStorageContract, "update-product", [Cl.standardPrincipal(address1), Cl.uint(2), Cl.uint(123), Cl.bufferFromUtf8("Bad description")], deployer);
    expect(updateProductResponse.result).toBeErr(Cl.uint(106));
  });

  it("Add products for a creator, fetch products data, fail to add 1 beyond capacity, then delete a product to make space.", () => {
    const createProfileResponse = simnet.callPublicFn(creatorsDataStorageContract, "create-profile", [Cl.standardPrincipal(address1), Cl.stringUtf8("Alice A"), Cl.bufferFromUtf8("Description for Alice A")], deployer);
    expect(createProfileResponse.result).toBeOk(Cl.bool(true));

    const productsLimit = 10;
    for(let i = 0; i < productsLimit; i++){
      let addProductResponse = simnet.callPublicFn(creatorsDataStorageContract, "create-product", [Cl.standardPrincipal(address1), Cl.uint(i+101), Cl.bufferFromUtf8("Description for product " + (i+1))], deployer);
      expect(addProductResponse.result).toBeOk(Cl.uint(i+1));
    }

    // Get the first product
    let getProductResponse = simnet.callReadOnlyFn(creatorsDataStorageContract, "get-product", [Cl.uint(1)], deployer);
    expect(getProductResponse.result).toBeSome(Cl.tuple({
      creator: Cl.standardPrincipal(address1),
      price: Cl.uint(101),
      "amount-sold": Cl.uint(0),
      "data-hash": Cl.bufferFromUtf8("Description for product 1")
    }));

    // Get a product that doesn't exist
    getProductResponse = simnet.callReadOnlyFn(creatorsDataStorageContract, "get-product", [Cl.uint(11)], deployer);
    expect(getProductResponse.result).toBeNone();

    // Get all products from address1
    let getCreatorProductsResponse = simnet.callReadOnlyFn(creatorsDataStorageContract, "get-creator-products", [Cl.standardPrincipal(address1)], deployer);
    expect(getCreatorProductsResponse.result).toBeSome(Cl.list([Cl.uint(1), Cl.uint(2), Cl.uint(3), Cl.uint(4), Cl.uint(5), Cl.uint(6), Cl.uint(7), Cl.uint(8), Cl.uint(9), Cl.uint(10)]));
    
    // Try to add one more product
    let addProductResponse = simnet.callPublicFn(creatorsDataStorageContract, "create-product", [Cl.standardPrincipal(address1), Cl.uint(999), Cl.bufferFromUtf8("Description for product 11")], deployer);
    expect(addProductResponse.result).toBeErr(Cl.uint(103));

    // Delete the 5th product
    const removeProductResponse = simnet.callPublicFn(creatorsDataStorageContract, "remove-product", [Cl.standardPrincipal(address1), Cl.uint(5)], deployer);
    expect(removeProductResponse.result).toBeOk(Cl.bool(true));

    // Get all products from address1 and confirm the 5th product id is now u0
    getCreatorProductsResponse = simnet.callReadOnlyFn(creatorsDataStorageContract, "get-creator-products", [Cl.standardPrincipal(address1)], deployer);
    expect(getCreatorProductsResponse.result).toBeSome(Cl.list([Cl.uint(1), Cl.uint(2), Cl.uint(3), Cl.uint(4), Cl.uint(6), Cl.uint(7), Cl.uint(8), Cl.uint(9), Cl.uint(10)]));
    
    // Add a new product
    addProductResponse = simnet.callPublicFn(creatorsDataStorageContract, "create-product", [Cl.standardPrincipal(address1), Cl.uint(999), Cl.bufferFromUtf8("Description for product 11")], deployer);
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

  it("Create a product for a creator, update it, and then delete it.", () => {
    const createProfileResponse = simnet.callPublicFn(creatorsDataStorageContract, "create-profile", [Cl.standardPrincipal(address1), Cl.stringUtf8("Alice A"), Cl.bufferFromUtf8("Description for Alice A")], deployer);
    expect(createProfileResponse.result).toBeOk(Cl.bool(true));

    const originalPrice = 50;
    const newPrice = 25;
    const originalDescription = "Description for product 1.";
    const newDescription = "Product 1 (On sale!)";

    const addProductResponse = simnet.callPublicFn(creatorsDataStorageContract, "create-product", [Cl.standardPrincipal(address1), Cl.uint(originalPrice), Cl.bufferFromUtf8(originalDescription)], deployer);
    expect(addProductResponse.result).toBeOk(Cl.uint(1));

    let getProductResponse = simnet.callReadOnlyFn(creatorsDataStorageContract, "get-product", [Cl.uint(1)], deployer);
    expect(getProductResponse.result).toBeSome(Cl.tuple({
      creator: Cl.standardPrincipal(address1),
      price: Cl.uint(originalPrice),
      "amount-sold": Cl.uint(0),
      "data-hash": Cl.bufferFromUtf8(originalDescription)
    }));

    const updateProductResponse = simnet.callPublicFn(creatorsDataStorageContract, "update-product", [Cl.standardPrincipal(address1), Cl.uint(1), Cl.uint(newPrice), Cl.bufferFromUtf8(newDescription)], deployer);
    expect(updateProductResponse.result).toBeOk(Cl.bool(true));

    getProductResponse = simnet.callReadOnlyFn(creatorsDataStorageContract, "get-product", [Cl.uint(1)], deployer);
    expect(getProductResponse.result).toBeSome(Cl.tuple({
      creator: Cl.standardPrincipal(address1),
      price: Cl.uint(newPrice), // Price changed
      "amount-sold": Cl.uint(0),
      "data-hash": Cl.bufferFromUtf8(newDescription) // Description changed
    }));

    const removeProductResponse = simnet.callPublicFn(creatorsDataStorageContract, "remove-product", [Cl.standardPrincipal(address1), Cl.uint(1)], deployer);
    expect(removeProductResponse.result).toBeOk(Cl.bool(true));

    getProductResponse = simnet.callReadOnlyFn(creatorsDataStorageContract, "get-product", [Cl.uint(1)], deployer);
    expect(getProductResponse.result).toBeNone();
  });
});
