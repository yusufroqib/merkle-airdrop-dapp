import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const tokenAddress = "0xfc04Cb7392147636162c660c144783763538fe69";
const merkleRoot = "0x6d324e7ee478a907bcdc9c6ef7c88d098ff7600dfcc7c2bd5c7d02a945ec01d7"; 


const TokenAirdropModule = buildModule("TokenAirdropModule", (m) => {

    const token = m.contract("TokenAirdrop", [tokenAddress, merkleRoot]);

    return { token };
});

export default TokenAirdropModule;