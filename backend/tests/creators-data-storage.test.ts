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
});
