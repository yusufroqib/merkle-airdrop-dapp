import { expect } from "chai";
// const hre = require("hardhat");
import { MerkleTree }  from "merkletreejs";
import hre, { ethers } from "hardhat";
import keccak256 from "keccak256";
// import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Rocco,Rocco__factory,TokenAirdropWithAmount, TokenAirdropWithAmount__factory } from "../typechain-types"; // Adjust the path according to your typechain output directory
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

// SignerWithAddress
describe("TokenAirdropWithAmount", function () {
  let Token: Rocco__factory;
  let token: Rocco ;
  let TokenAirdropWithAmount: TokenAirdropWithAmount__factory;
  let airdrop: TokenAirdropWithAmount;
  let owner: SignerWithAddress;
  let addr1: SignerWithAddress
  let addr2:  SignerWithAddress
  let addr3:  SignerWithAddress
  let addr4: SignerWithAddress;
  let merkleTree: MerkleTree;
  let rootHash: string;
  let leafNodes: Buffer[];

  before(async function () {
    [owner, addr1, addr2, addr3, addr4] = await ethers.getSigners();

    // Deploy a mock ERC20 token
    Token = await hre.ethers.getContractFactory("Rocco"); // Make sure to create a mock ERC20 token contract.
    token = await Token.deploy();

    // Create a Merkle Tree for airdrop addresses and amounts
    leafNodes = [addr1, addr2, addr3].map((addr) =>
      keccak256(ethers.solidityPacked(["address", "uint256"], [addr.address, ethers.parseUnits("100", 18)]))
    );
    merkleTree = new MerkleTree(leafNodes, keccak256, { sortPairs: true });
    rootHash = merkleTree.getHexRoot();
    // console.log(rootHash)

    
    // Deploy TokenAirdropWithAmount contract
    TokenAirdropWithAmount = await ethers.getContractFactory("TokenAirdropWithAmount");
    airdrop = await TokenAirdropWithAmount.deploy(token, rootHash);

    // Fund the contract with the airdrop amount
    await token.transfer(airdrop, ethers.parseUnits("300", 18));
  });

  it("should deploy with correct token and merkle root", async function () {
    expect(await airdrop.token()).to.equal(token);
    expect(await airdrop.merkleRoot()).to.equal(rootHash);
  });


 

  it("should allow eligible addresses to claim airdrop", async function () {
    const claimingAddress = addr1;
    const amount = ethers.parseUnits("100", 18);
    const leaf = keccak256(ethers.solidityPacked(["address", "uint256"], [claimingAddress.address, amount]));
    const proof = merkleTree.getHexProof(leaf);

    await airdrop.connect(claimingAddress).claim(proof, amount);

    expect(await token.balanceOf(claimingAddress)).to.equal(amount);
    expect(await airdrop.claimed(claimingAddress)).to.equal(true);
  });

  it("should not allow double claiming", async function () {
    const claimingAddress = addr1;
    const amount = ethers.parseUnits("100", 18);
    const leaf = keccak256(ethers.solidityPacked(["address", "uint256"], [claimingAddress.address, amount]));
    const proof = merkleTree.getHexProof(leaf);

    await expect(
      airdrop.connect(claimingAddress).claim(proof, amount)
    ).to.be.revertedWith("You have already claimed");
  });

  it("should not allow ineligible addresses to claim airdrop", async function () {
    const ineligibleAddress = addr4;
    const amount = ethers.parseUnits("100", 18);
    const leaf = keccak256(ethers.solidityPacked(["address", "uint256"], [addr1.address, amount]));
    const proof = merkleTree.getHexProof(leaf);

    await expect(
      airdrop.connect(ineligibleAddress).claim(proof, amount)
    ).to.be.revertedWith("TokenAirdrop: Address or amount are invalid for claim");
  });

  it("should allow owner to withdraw leftover tokens", async function () {
    const initialOwnerBalance = await token.balanceOf(owner);
    const airdropBalance = await token.balanceOf(airdrop);
    await airdrop.withdrawLeftOver();
    expect(await token.balanceOf(owner)).to.equal(initialOwnerBalance + airdropBalance);
  });

  it("should not allow non-owner to withdraw leftover tokens", async function () {
    await expect(
      airdrop.connect(addr1).withdrawLeftOver()
    ).to.be.revertedWith("Only owner can perform this action");
  });
});
