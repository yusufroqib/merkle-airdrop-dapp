import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const RoccoModule = buildModule("RoccoModule", (m) => {
	const rocco = m.contract("Rocco");

	return { rocco };
});

export default RoccoModule;

// Deployed Rocco: 0x93532eB8DA4B43BC9E88b1f11eDbc295607ab693
