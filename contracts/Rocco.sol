// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Rocco is ERC20("Rocco Token", "RCO") {
    address public owner;
    address public allowedContract;

    constructor() {
        owner = msg.sender;
        _mint(msg.sender, 100000000e18);
    }

    function mint(address _claimer, uint256 _amount) external {
        require(msg.sender != address(0), "Address zero detected");
        require(_claimer != address(0), "Address zero detected");
        require(_amount > 0, "Zero amount detected");
        require(
            msg.sender == owner || msg.sender == allowedContract,
            "Contract not Allowed"
        );
        _mint(_claimer, _amount * 1e18);
    }

    function setAirdropContract(address _contract) external {
        require(msg.sender == owner, "you are not owner");
        allowedContract = _contract;
    }
}
