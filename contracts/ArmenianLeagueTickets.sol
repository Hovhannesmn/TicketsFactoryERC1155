// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./MyUSDToken.sol";

contract ArmenianLeagueTickets is ERC1155, Ownable {
    string public name;
    string public symbol;
    uint256 public cost = 0.01 ether;
    uint256 public USDCCost = 0.00052 ether;
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

    modifier checkCostUSD() {
        require(msg.value == USDCCost, "amount should be equal the cost");

        _;
    }

    function mint(address _to, uint _id, uint _amount) external payable checkCost  {
        if (_id < 0 || _id > MAX_TEAM_ID) {
            require(false, "Wrong team parameter");
        }
        _mint(_to, _id, _amount, "");
    }

    function mintByUSDC(address _to, uint _id, uint _amount) external payable checkCostUSD {
        if (_id < 0 || _id > MAX_TEAM_ID) {
            require(false, "Wrong team parameter");
        }

        uint tokenAmount = msg.value * rate;

//        require(myUSDToken.balanceOf(address (this)) >= tokenAmount, "address (this)) >= tokenAmount which is wrong");
//        myUSDToken.transfer(msg.sender, tokenAmount);

        emit TokenPurchased(msg.sender, address(mysUSDToken), tokenAmount, rate);


        _mint(_to, _id, _amount, "");
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
