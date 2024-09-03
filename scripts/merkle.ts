import { ethers } from "hardhat";
import fs from "fs";
import csv from "csv-parser";
import { MerkleTree } from "merkletreejs";
import keccak256 from "keccak256";

const CSV_FILE_PATH = "airdrop/airdrop.csv";

const leafNodes: Buffer[] = [];

fs.createReadStream(CSV_FILE_PATH)
	.pipe(csv())
	.on("data", (row: { address: string; amount: number }) => {
		const address = row.address;
		const amount = ethers.parseUnits(row.amount.toString(), 18);

		// Correct hashing to create a leaf node (bytes32)
		const leaf = keccak256(
			ethers.solidityPacked(["address", "uint256"], [address, amount])
		);
		// console.log(leaf.toString('utf-8'))
		leafNodes.push(leaf);

		// Convert buffer to a readable hex string and print it
		//   console.log(`Leaf (Hex): ${leaf.toString('hex')}`);
	})
	.on("end", () => {
		const merkleTree = new MerkleTree(leafNodes, keccak256, {
			sortPairs: true,
		});

		const rootHash = merkleTree.getHexRoot();
		console.log("Merkle Root:", rootHash);

		// Extracting proof for this address
		const address = "0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2";
		const amount = ethers.parseUnits("234", 18);

		// Create leaf for proof
		const leaf = keccak256(
			ethers.solidityPacked(["address", "uint256"], [address, amount])
		);

		console.log("Leaf:", leaf.toString("hex"));

		const proof = merkleTree.getHexProof(leaf);
		console.log("Proof:", proof);
	});

//   ["0xf6af7013547b565f85a1bd3eaee0b341a19ce6450fcba0fb9cdf5a2a03a9bb86","0x307e470a2180409de6a09e3f648cdfcb98ff24d435729b2b90ea6df57db3f337","0x49aec686c9082b0d5f82dbdacbe85a3c713128806525998ffd4d8e009de1ddf5","0x4945bd310ac49a5851b73790be66a37cee1a617f75cd56563e7b92e0004c4971"]