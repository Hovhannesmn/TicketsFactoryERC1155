const { expect } = require("chai");
const { expectRevert, expectEvent, constants } = require('@openzeppelin/test-helpers');
const { ethers } = require("hardhat");

describe("Tickets Contract", function () {
  let Token, token, singer, Tickets, tickets, owner, address1, address2;

  beforeEach(async () => {
    Token = await ethers.getContractFactory('MyUSDToken');
    token = await Token.deploy();
    Tickets = await ethers.getContractFactory('ArmenianLeagueTickets');
    tickets = await Tickets.deploy(token.address);

    singer = await ethers.getSigners();
    [owner, address1, address2] = await ethers.getSigners();
  });

  describe("Deployment", async () => {
      it("TotalSupply supply should be equal owner balance", async () => {
        const ownerBalance = await token.balanceOf(owner.address);
        expect(await token.totalSupply()).to.equal(ownerBalance)
      });

      it("should fail for Max tokens amount is exceeded for same tokenId", async () => {
        const tokenId = 0
        const amount = 500;
        const options = {
          value: ethers.utils.parseEther((parseInt(amount) * 0.01).toString()),
        };

        await tickets.mint(owner.address, tokenId, amount, options);
        await tickets.mint(owner.address, tokenId, amount, options);
        await expectRevert(
          tickets.mint(owner.address, tokenId, amount, options),
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
          tickets.mint(owner.address, tokenId, amount, options),
          'Wrong team parameter',
        );
      });

      it("Should change sold amount, balance and owner ticket count after mintByUSDT", async () => {
        const amounts = [1, 2, 3, 10];
        const ticketNumber = 3;

        for (let i = 0; i< amounts.length; i++) {
          const amount = amounts[i];
          const costUSDC = parseInt(await tickets.USDCCost(), 10);

          const startBalanceOfOwner = parseInt(await token.balanceOf(owner.address), 10);
          const startOwnerTicketAmount = parseInt(await tickets.balanceOfBatch([owner.address], [ticketNumber]), 10);
          const startSoldTickets = await tickets.balanceOfTickets();

          const transactionApprove = await token.connect(owner)
            .approve(tickets.address, amount * costUSDC)
          await transactionApprove.wait();
          const transactionMint = await tickets.connect(owner).mintByUSDC(owner.address, ticketNumber, amount);
          await transactionMint.wait();

          const balanceOfOwner = parseInt(await token.balanceOf(owner.address), 10);
          const ownerTicketAmount = parseInt(await tickets.balanceOfBatch([owner.address], [ticketNumber]), 10);
          const soldTickets = await tickets.balanceOfTickets();

          expect(ownerTicketAmount).to.equal(startOwnerTicketAmount + amount);
          expect(balanceOfOwner).to.equal(startBalanceOfOwner - amount * costUSDC);
          expect(parseInt(soldTickets[ticketNumber], 10)).to.equal(parseInt(startSoldTickets[ticketNumber], 10) + amount);
      }
    });
  });
});
