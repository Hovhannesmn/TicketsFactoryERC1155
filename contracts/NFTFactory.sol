// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFTFactory is ERC721Enumerable, Ownable {
    string public baseURI;
    uint256 public cost = 0.01 ether;

    mapping(address => uint8) private _accountsNFTCount;

    event Log(address sender, string message);
    event Received(address caller, uint amount, string message);
    event Refunded(address sender, uint amount);

    constructor(
        string memory _name,
        string memory _symbol,
        string memory _baseURI
    ) ERC721(_name, _symbol) {
        baseURI = _baseURI;
        emit Log(msg.sender, "constructor has called");
    }

    function mint(address _to) public payable {
        if (_accountsNFTCount[msg.sender] < 10) {
            require(msg.value == 0, "balance should be 0");
        } else {
            require(msg.value >= cost, "not enough money");
        }
        ++_accountsNFTCount[msg.sender];
        _safeMint(_to, totalSupply() + 1);
    }

    function setBaseURI(string memory _newBaseURI) public onlyOwner {
        baseURI = _newBaseURI;
    }

    function setCost(uint256 _cost) public onlyOwner {
        cost = _cost;
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return baseURI;
    }

    function withdraw() external onlyOwner {
        require(address(this).balance > 0, "balance should be greater 0");
        (bool success, ) = payable(owner()).call{value: address(this).balance}("");
        require(success, "Failed withdraw process");
    }
}
