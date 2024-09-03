// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract TokenAirdrop {
    IERC20 public immutable token;
    bytes32 public immutable merkleRoot;
    address owner;

    mapping(address => bool) public claimed;

    event ClaimSucceful(address indexed claimer, uint256 amount);

    constructor(IERC20 _token, bytes32 _merkleRoot) {
        owner = msg.sender;
        token = _token;
        merkleRoot = _merkleRoot;
    }

    function claim(bytes32[] calldata _merkleProof, uint256 _amount) external {
        require(!claimed[msg.sender], "You have already claimed");
        require(
            canClaim(msg.sender, _amount, _merkleProof),
            "TokenAirdrop: Address or amount are invalid for claim"
        );
        uint256 contractBalance = token.balanceOf(address(this));
        require(contractBalance >= _amount, "insufficient contract balance");
        claimed[msg.sender] = true;
        token.transfer(msg.sender, _amount);
        emit ClaimSucceful(msg.sender, _amount);
    }

    function canClaim(
        address _claimer,
        uint256 _amount,
        bytes32[] calldata merkleProof
    ) public view returns (bool) {
        return
            !claimed[_claimer] &&
            MerkleProof.verify(
                merkleProof,
                merkleRoot,
                keccak256(abi.encodePacked(_claimer, _amount))
            );
    }

    function checkContractBalance()
        external
        view
        returns (uint256 contractBalance_)
    {
        require(msg.sender != address(0), "Zero address detected");
        require(msg.sender == owner, "Only owner can perform this action");
        contractBalance_ = token.balanceOf(address(this));
    }

    function withdrawLeftOver() external {
        require(msg.sender == owner, "Only owner can perform this action");
        require(msg.sender != address(0), "Zero address detected");
        uint256 contractBalance = token.balanceOf(address(this));
        require(contractBalance > 0, "insufficient amount");
        token.transfer(owner, contractBalance);
    }
}
