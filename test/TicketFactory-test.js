const { expect, use } = require("chai");
const { expectRevert } = require('@openzeppelin/test-helpers');
const { ethers } = require("hardhat");
const {deployMockContract, MockProvider, solidity, deployContract} = require('ethereum-waffle');
const Token = require('../src/artifacts/contracts/MyUSDToken.sol/MyUSDToken.json');
const Tickets = require('../src/artifacts/contracts/ArmenianLeagueTickets.sol/ArmenianLeagueTickets.json');

use(solidity);

describe("Tickets Contract", function () {
  let mockERC20, ERC20, contract;
  const [owner, address1] = new MockProvider().getWallets();

  beforeEach(async () => {
    mockERC20 = await deployMockContract(owner, Token.abi);
    ERC20 = await deployContract(owner, Token);
    contract = await deployContract(owner, Tickets, [mockERC20.address]);
  });

  describe("Deployment with mock Token contract", async () => {
    it("TotalSupply supply should be equal owner balance", async () => {
      await mockERC20.mock.balanceOf.returns(10000000000);
      expect(await mockERC20.balanceOf(owner.address)).to.equal(10000000000)
    });

    it("should fail for Max tokens amount is exceeded for same tokenId", async () => {
      const tokenId = 0
      const amount = 500;
      const options = {
        value: ethers.utils.parseEther((parseInt(amount) * 0.01).toString()),
      };

      await contract.mint(owner.address, tokenId, amount, options);
      await contract.mint(address1.address, tokenId, amount, options);
      await expectRevert(
        contract.mint(owner.address, tokenId, amount, options),
        'The amount of tickets is not available'
      );
    });

    it("should fail for wrong tokenId", async () => {
      const tokenId = 13
      const amount = 500;
      const options = {
        value: ethers.utils.parseEther((parseInt(amount) * 0.01).toString()),
      };

      await expectRevert(
        contract.mint(owner.address, tokenId, amount, options),
        'Wrong team parameter',
      );
    });
  });

  describe("Deployment with Token contract", () => {
    beforeEach(async () => {
      contract = await deployContract(owner, Tickets, [ERC20.address]);
    });

    it("Should change sold amount, balance and owner ticket count after mintByUSDT", async () => {
      const amounts = [1, 2, 3, 10];
      const ticketNumber = 3;

      for (let i = 0; i< amounts.length; i++) {
        const amount = amounts[i];
        const costUSDC = parseInt(await contract.USDCCost(), 10);

        const startBalanceOfOwner = parseInt(await ERC20.balanceOf(owner.address), 10);
        const startOwnerTicketAmount = parseInt(await contract.balanceOfBatch([owner.address], [ticketNumber]), 10);
        const startSoldTickets = await contract.balanceOfTickets();

        const transactionApprove = await ERC20.connect(owner)
          .approve(contract.address, amount * costUSDC)
        await transactionApprove.wait();
        const transactionMint = await contract.connect(owner).mintByUSDC(owner.address, ticketNumber, amount);
        await transactionMint.wait();

        const balanceOfOwner = parseInt(await ERC20.balanceOf(owner.address), 10);
        const ownerTicketAmount = parseInt(await contract.balanceOfBatch([owner.address], [ticketNumber]), 10);
        const soldTickets = await contract.balanceOfTickets();

        expect(ownerTicketAmount).to.equal(startOwnerTicketAmount + amount);
        expect(balanceOfOwner).to.equal(startBalanceOfOwner - amount * costUSDC);
        expect(parseInt(soldTickets[ticketNumber], 10)).to.equal(parseInt(startSoldTickets[ticketNumber], 10) + amount);
      }
    });
  })
});
