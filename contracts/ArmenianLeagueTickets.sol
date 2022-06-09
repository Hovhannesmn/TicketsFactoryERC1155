// SPDX-License-Identifier: MIT
pragma solidity ^0.8.14;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./MyUSDToken.sol";
import "hardhat/console.sol";

contract ArmenianLeagueTickets is ERC1155, Ownable {
    string public name;
    string public symbol;
    uint256 public cost = 0.01 ether;
    uint256 public USDCCost = 30;
    uint private constant MAX_TEAM_ID = 9;
    uint public rate = 100;
    MyUSDToken public mysUSDToken;

    event TokenPurchased(
        address account,
        address token,
        uint amount,
        uint rate
    );

    mapping(uint => string) public tokenURI;

    constructor(MyUSDToken _mysUSDToken) ERC1155("") {
        name = "ArmenianPremierLeague";
        symbol = "ArmenianPremierLeague";
        mysUSDToken = _mysUSDToken;
    }

    modifier checkCost() {
        require(msg.value == cost, "amount should be equal cost");
        _;
    }

    modifier checkCostUSDC(uint256 amount) {
        require(amount == USDCCost, "amount should be equal the cost");

        _;
    }

    modifier checkTeamAvailability(uint64 id) {
        if (id < 0 || id > MAX_TEAM_ID) {
            require(false, "Wrong team parameter");
        }

        _;
    }

    function mint(address _to, uint64 _id, uint256 _amount) external payable checkCost checkTeamAvailability(_id)  {
        _mint(_to, _id, _amount, "");
    }

    function mintByUSDC(address _to, uint _id, uint _amount) external payable checkCostUSDC(_amount) {
        console.log("Sender address is %s tokens", address(this));

        mysUSDToken.transferFrom(msg.sender, address(this), _amount);

        _mint(_to, _id, 1, "");
    }

    function mintBatch(address _to, uint[] memory _ids, uint[] memory _amounts) external onlyOwner {
        _mintBatch(_to, _ids, _amounts, "");
    }

    function burn(uint _id, uint _amount) external {
        _burn(msg.sender, _id, _amount);
    }

    function burnBatch(uint[] memory _ids, uint[] memory _amounts) external {
        _burnBatch(msg.sender, _ids, _amounts);
    }


    function burnForMint(address _from, uint[] memory _burnIds, uint[] memory _burnAmounts, uint[] memory _mintIds, uint[] memory _mintAmounts) external onlyOwner {
        _burnBatch(_from, _burnIds, _burnAmounts);
        _mintBatch(_from, _mintIds, _mintAmounts, "");
    }

    function setURI(uint _id, string memory _uri) external onlyOwner {
        tokenURI[_id] = _uri;
        emit URI(_uri, _id);
    }

    function uri(uint _id) public override view returns (string memory) {
        return tokenURI[_id];
    }

    function withdraw() external {
        require(address(this).balance > 0, "address balance should be greater 0");
        (bool success, ) = payable(owner()).call{value: address(this).balance}("");
        require(success, "Failed withdraw money");
    }
}
