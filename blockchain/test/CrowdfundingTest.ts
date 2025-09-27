import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";
import { getAddress } from "viem";


describe("Crowdfunding", async function () {
  const { viem, networkHelpers }= await network.connect();
  const publicClient = await viem.getPublicClient();

  //Tests for FUND event

  //Test for Fund event emit
  it("Should emit the Fund event when calling the donate() function", async function () {

    const [deployer] = await viem.getWalletClients();
    const donatorAddress = getAddress(deployer.account.address);
    const crowdfunding = await viem.deployContract("Crowdfunding", [1n, 1000n]);

    await viem.assertions.emitWithArgs(
      crowdfunding.write.donate({ value: 1000n }),
      crowdfunding,
      "Fund",
      [donatorAddress, 1000n],
    );
  });

  //Tests for backer mapping update
  it("Should update backer mapping with single donation", async function () {
    const [deployer, donor] = await viem.getWalletClients();
    const crowdfunding = await viem.deployContract("Crowdfunding", [30n, 2000n]);

    // Make a donation
    await crowdfunding.write.donate({ value: 750n, account: donor.account });

    // Check backer balance
    const backerBalance = await crowdfunding.read.backers([donor.account.address]);
    assert.equal(backerBalance, 750n);
  });

  it("Should accumulate multiple donations from same donor", async function () {
    const [deployer, donor] = await viem.getWalletClients();
    const crowdfunding = await viem.deployContract("Crowdfunding", [30n, 3000n]);

    // First donation
    await crowdfunding.write.donate({ value: 400n, account: donor.account });
    let backerBalance = await crowdfunding.read.backers([donor.account.address]);
    assert.equal(backerBalance, 400n);

    // Second donation - should add to existing balance
    await crowdfunding.write.donate({ value: 600n, account: donor.account });
    backerBalance = await crowdfunding.read.backers([donor.account.address]);
    assert.equal(backerBalance, 1000n); 

    // Third donation - should continue accumulating
    await crowdfunding.write.donate({ value: 300n, account: donor.account });
    backerBalance = await crowdfunding.read.backers([donor.account.address]);
    assert.equal(backerBalance, 1300n); 
  });

  it("Should handle donations from multiple donors", async function () {
    const [deployer, donor1, donor2, donor3] = await viem.getWalletClients();
    const crowdfunding = await viem.deployContract("Crowdfunding", [30n, 5000n]);

    // Donations from different donors
    await crowdfunding.write.donate({ value: 800n, account: donor1.account });
    await crowdfunding.write.donate({ value: 1200n, account: donor2.account });
    await crowdfunding.write.donate({ value: 500n, account: donor3.account });

    // Check each donor's balance
    const donor1Balance = await crowdfunding.read.backers([donor1.account.address]);
    const donor2Balance = await crowdfunding.read.backers([donor2.account.address]);
    const donor3Balance = await crowdfunding.read.backers([donor3.account.address]);

    assert.equal(donor1Balance, 800n);
    assert.equal(donor2Balance, 1200n);
    assert.equal(donor3Balance, 500n);

    // Check total contract balance
    const contractBalance = await publicClient.getBalance({ 
      address: crowdfunding.address 
    });
    assert.equal(contractBalance, 2500n);
  });
  
  //Tests for deadline
  it("Should allow donations up until the deadline", async function () {
    const [deployer, donor] = await viem.getWalletClients();
    const crowdfunding = await viem.deployContract("Crowdfunding", [1n, 1000n]); // 1 day deadline

    // Donation should work immediately after deployment
    await crowdfunding.write.donate({ value: 100n, account: donor.account });

    // Fast forward to just before deadline (23 hours 59 minutes)
    await networkHelpers.time.increase(86340); // 23 hours 59 minutes in seconds

    // Should still be able to donate
    await crowdfunding.write.donate({ value: 200n, account: donor.account });

    // Check total donations
    const backerBalance = await crowdfunding.read.backers([donor.account.address]);
    assert.equal(backerBalance, 300n);
  });

  it("Should revert when donating after the deadline", async function () {
    const [deployer, donor] = await viem.getWalletClients();
    const crowdfunding = await viem.deployContract("Crowdfunding", [1n, 1000n]); // 1 day deadline

    // Fast forward past the deadline (1 day + 1 second)
    await networkHelpers.time.increase(86401);

    // Donation should revert 
    await assert.rejects(
      crowdfunding.write.donate({ value: 500n, account: donor.account }),
      /revert/
    );
  });
  
});
