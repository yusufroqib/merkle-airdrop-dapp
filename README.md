# Merkle Airdrop DApp

This repository contains the implementation of a Merkle-based airdrop DApp. The project allows eligible users to claim tokens from an airdrop if their address is part of a pre-generated Merkle tree. The DApp is built using Solidity for smart contracts and JavaScript (Node.js) for Merkle tree generation and testing.

## Table of Contents

1. [Setup](#setup)
2. [Running the Merkle Script](#running-the-merkle-script)
3. [Configuring the Hardhat](#configuring-the-hardhat)
3. [Deploying the Contracts](#deploying-the-contracts)
4. [Generating Proofs for Airdrop Claims](#generating-proofs-for-airdrop-claims)
5. [Testing](#testing)
6. [Assumptions and Limitations](#assumptions-and-limitations)

## Setup

### Prerequisites

Ensure you have the following installed on your machine:

- [Node.js](https://nodejs.org/en/download/) (v14 or higher)
- [Hardhat](https://hardhat.org/getting-started/) (installed as a dev dependency in this project)
- [TypeScript](https://www.typescriptlang.org/download) (optional, for type safety)
- [Ethers.js](https://docs.ethers.io/v6/) (used for interacting with the Ethereum blockchain)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/4.x/) (for ERC20 token implementation)

### Installation

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/yusufroqib/merkle-airdrop-dapp.git
   cd merkle-airdrop-dapp
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

## Running the Merkle Script

The Merkle script is used to generate a Merkle tree from a list of eligible addresses and their corresponding airdrop amounts stored in a CSV file. This script outputs the Merkle root and proof needed to claim the airdrop.

### Step-by-Step Instructions

1. **Prepare the Airdrop CSV File**:

   - Create a CSV file named `airdrop.csv` under the `airdrop` directory (create the directory if it does not exist).
   - The CSV file should have two columns: `address` and `amount`. Example:
     ```
     address,amount
     0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2,100
     0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db,150
     0x787dDcAF9cC2b1c3C1A095f23297B24F5cF9bE6c,200
     ```

2. **Run the Merkle Script**:
   - Execute the script to generate the Merkle root and proofs:
   ```bash
   npx hardhat run scripts/merkle.ts
   ```
   - The output will display the Merkle root and proofs for each address.

## Configuring the Hardhat
-  Here, I am using Lisk Sepolia. Configure your `hardhat.config.ts` based on the network you are using.

1. **Set ACCOUNT_PRIVATE_KEY**:
    - Run the following command to set account private key for hardhat config.
    ```bash
    npx hardhat vars set ACCOUNT_PRIVATE_KEY 
    ```
    Then follow the prompt and input your private key
2. **Set LISK_RPC_URL**:
    - Run the following command to set rpc url for hardhat config.
    ```bash
    npx hardhat vars set LISK_RPC_URL 
    ```
    Then follow the prompt and input your rpc url

## Deploying the Contracts
   - There two files named `Rocco.ts` and `TokenAirdrop.ts` under the `ignition/modules` directory (create the directory if it does not exist).
### 1. Deploying the Mock ERC20 Token

The mock ERC20 token contract `Rocco` is deployed first. It represents the token to be airdropped.

1. **Deploy Rocco Token**:

   - Run the following Hardhat command to deploy the `Rocco` token:

   ```bash
   npx hardhat ignition deploy ignition/modules/Rocco.ts --network <your-network> --verify
   ```

   Replace `<your-network>` with your desired network (e.g., `localhost`, `ropsten`, `lisk-sepolia`).

2. **Deploy TokenAirdrop Contract**:
   - After deploying the token, deploy the `TokenAirdrop` contract with the Merkle root:
   ```bash
   npx hardhat ignition deploy ignition/modules/TokenAirdrop.ts --network <your-network> --verify
   ```
   Ensure you update the deployment script with the correct constructor arguments (the token contract address and the Merkle root).

### Example Deployment Script (`Rocco.ts`)

```typescript
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const RoccoModule = buildModule("RoccoModule", (m) => {
	const rocco = m.contract("Rocco");

	return { rocco };
});

export default RoccoModule;
```

### Example Deployment Script (`TokenAirdrop.ts`)

```typescript
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
const tokenAddress = "0xYourTokenAddress"; // Replace with actual deployed token address
const merkleRoot = "0xYourMerkleRoot"; // Replace with generated Merkle root

const TokenAirdropModule = buildModule("TokenAirdropModule", (m) => {
	const save = m.contract("TokenAirdrop", [tokenAddress, merkleRoot]);

	return { save };
});

export default TokenAirdropModule;
```

## Generating Proofs for Airdrop Claims

To claim an airdrop, a user must provide a valid Merkle proof that verifies their eligibility.

1. **Run the Merkle Script**: The Merkle script (`merkle.ts`) generates proofs for eligible addresses. To get a proof for a specific address, run:

   ```bash
   npx hardhat run scripts/merkle.ts
   ```

   - The script will output the proof for each address in the CSV file.

2. **Use the Proof in the Claim Function**:
   - Users will use the proof generated to call the `claim` function on the `TokenAirdrop` contract:
   ```solidity
   function claim(bytes32[] calldata _merkleProof, uint256 _amount) external {
       // Function implementation
   }
   ```
   - The `_merkleProof` is the array of hashes that need to be provided to prove the user's claim.

## Testing

### Running Tests

The repository includes a suite of Hardhat tests to verify the functionality of the contracts.

1. **Run Tests**:
   ```bash
   npx hardhat test
   ```

### Explanation of Tests

- **Deployment Tests**: Verifies that contracts are deployed correctly with the expected parameters (token address, Merkle root).
- **Claim Tests**: Tests that eligible addresses can claim the airdrop successfully and ineligible addresses cannot.
- **Double Claim Tests**: Ensures that addresses cannot claim more than once.
- **Admin Functions**: Verifies that only the owner can withdraw leftover tokens.

## Assumptions and Limitations

1. **CSV Input Format**: Assumes that the CSV file is formatted correctly with two columns: `address` and `amount`.
2. **Single Airdrop Per Address**: Each address is limited to a single airdrop claim based on the initial configuration.
3. **Token Supply**: The `Rocco` token supply is assumed to be sufficient to cover all airdrop claims.
4. **Merkle Tree Integrity**: Assumes the Merkle tree is generated and managed correctly without manipulation. The Merkle root should be securely deployed to the contract.
5. **Network Configuration**: Deployment scripts and tests are configured for specific networks. Make sure to set up the correct network configuration in `hardhat.config.ts`.
