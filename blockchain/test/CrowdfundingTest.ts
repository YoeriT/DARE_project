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


  //Tests for claimFunds function
  it("Should allow owner to claim funds when goal is met and deadline passed", async function () {
    const [owner, donor1, donor2] = await viem.getWalletClients();
    const crowdfunding = await viem.deployContract("Crowdfunding", [1n, 1000n]); // 1 day, 1000 wei goal
    
    // Get initial owner balance
    const initialOwnerBalance = await publicClient.getBalance({ address: owner.account.address });
    
    // Make donations to meet the goal
    await crowdfunding.write.donate({ value: 600n, account: donor1.account });
    await crowdfunding.write.donate({ value: 500n, account: donor2.account });
    
    // Fast forward past deadline
    await networkHelpers.time.increase(86401); // 1 day + 1 second

    const balanceBefore = await publicClient.getBalance({ address: owner.account.address });
    
    // Check that FundsClaimed event was emitted
    await viem.assertions.emitWithArgs(
      crowdfunding.write.claimFunds({ account: owner.account }),
      crowdfunding,
      "FundsClaimed",
      [getAddress(owner.account.address), 1100n]
    );

    const contractBalance = await publicClient.getBalance({ 
      address: crowdfunding.address 
    });
    assert.equal(contractBalance, 0n, "Contract should be empty");

  });

  it("Should revert when non-owner tries to claim funds", async function () {
    const [owner, donor, nonOwner] = await viem.getWalletClients();
    const crowdfunding = await viem.deployContract("Crowdfunding", [1n, 1000n]);
    
    // Make donation to meet goal
    await crowdfunding.write.donate({ value: 1200n, account: donor.account });
    
    // Fast forward past deadline
    await networkHelpers.time.increase(86401);
    
    // Non-owner should not be able to claim
    await assert.rejects(
      crowdfunding.write.claimFunds({ account: nonOwner.account }),
      /revert/
    );
  });

  it("Should revert when trying to claim funds before deadline", async function () {
    const [owner, donor] = await viem.getWalletClients();
    const crowdfunding = await viem.deployContract("Crowdfunding", [1n, 1000n]);
    
    // Make donation to meet goal
    await crowdfunding.write.donate({ value: 1200n, account: donor.account });
    
    // Try to claim before deadline (should fail)
    await assert.rejects(
      crowdfunding.write.claimFunds({ account: owner.account }),
      /revert/
    );
  });

  it("Should revert when trying to claim funds without meeting goal", async function () {
    const [owner, donor] = await viem.getWalletClients();
    const crowdfunding = await viem.deployContract("Crowdfunding", [1n, 1000n]);
    
    // Make donation below goal
    await crowdfunding.write.donate({ value: 500n, account: donor.account });
    
    // Fast forward past deadline
    await networkHelpers.time.increase(86401);
    
    // Should not be able to claim (goal not met)
    await assert.rejects(
      crowdfunding.write.claimFunds({ account: owner.account }),
      /revert/
    );
  });

  //Tests for getRefund function
  it("Should allow backer to get refund when goal not met and deadline passed", async function () {
    const [owner, donor1, donor2] = await viem.getWalletClients();
    const crowdfunding = await viem.deployContract("Crowdfunding", [1n, 2000n]); // Higher goal that won't be met
    
    const donerAddress = getAddress(donor1.account.address);
    // Get initial donor balance
    const initialDonor1Balance = await publicClient.getBalance({ address: donerAddress });
    
    // Make donations that don't meet the goal
    await crowdfunding.write.donate({ value: 400n, account: donor1.account });
    await crowdfunding.write.donate({ value: 300n, account: donor2.account });
    
    // Fast forward past deadline
    await networkHelpers.time.increase(86401);
    
    
    // Check that RefundIssued event was emitted
    await viem.assertions.emitWithArgs(
      crowdfunding.write.getRefund({ account: donor1.account }),
      crowdfunding,
      "RefundIssued",
      [donerAddress, 400n]
    );
    
    // Check that backer balance is reset to 0
    const backerBalance = await crowdfunding.read.backers([donor1.account.address]);
    assert.equal(backerBalance, 0n);
    
    // Check that contract balance decreased
    const contractBalance = await publicClient.getBalance({ address: crowdfunding.address });
    assert.equal(contractBalance, 300n); // Only donor2's contribution remains
  });

  it("Should handle multiple donations from same donor in refund", async function () {
    const [owner, donor] = await viem.getWalletClients();
    const crowdfunding = await viem.deployContract("Crowdfunding", [1n, 5000n]); // High goal
    const donerAddress = getAddress(donor.account.address);

    // Multiple donations from same donor
    await crowdfunding.write.donate({ value: 500n, account: donor.account });
    await crowdfunding.write.donate({ value: 300n, account: donor.account });
    await crowdfunding.write.donate({ value: 200n, account: donor.account });
    
    // Fast forward past deadline
    await networkHelpers.time.increase(86401);
    
    
    await viem.assertions.emitWithArgs(
      crowdfunding.write.getRefund({ account: donor.account }),
      crowdfunding,
      "RefundIssued",
      [donerAddress, 1000n] // Total of all donations
    );
    
    // Backer balance should be 0
    const backerBalance = await crowdfunding.read.backers([donerAddress]);
    assert.equal(backerBalance, 0n);
  });

  it("Should revert when trying to get refund before deadline", async function () {
    const [owner, donor] = await viem.getWalletClients();
    const crowdfunding = await viem.deployContract("Crowdfunding", [1n, 2000n]);
    
    // Make donation
    await crowdfunding.write.donate({ value: 500n, account: donor.account });
    
    // Try to get refund before deadline (should fail)
    await assert.rejects(
      crowdfunding.write.getRefund({ account: donor.account }),
      /revert/
    );
  });

  it("Should revert when trying to get refund after goal is met", async function () {
    const [owner, donor1, donor2] = await viem.getWalletClients();
    const crowdfunding = await viem.deployContract("Crowdfunding", [1n, 1000n]);
    
    // Make donations to meet goal
    await crowdfunding.write.donate({ value: 600n, account: donor1.account });
    await crowdfunding.write.donate({ value: 500n, account: donor2.account });
    
    // Fast forward past deadline
    await networkHelpers.time.increase(86401);
    
    // Should not be able to get refund (goal was met)
    await assert.rejects(
      crowdfunding.write.getRefund({ account: donor1.account }),
      /revert/
    );
  });

  //Edge case tests
  it("Should handle exact goal amount", async function () {
    const [owner, donor] = await viem.getWalletClients();
    const crowdfunding = await viem.deployContract("Crowdfunding", [1n, 1000n]);
    
    // Donate exactly the goal amount
    await crowdfunding.write.donate({ value: 1000n, account: donor.account });
    
    // Fast forward past deadline
    await networkHelpers.time.increase(86401);
    
    // Owner should be able to claim (goal exactly met)
    await crowdfunding.write.claimFunds({ account: owner.account });
    
    // Contract should have 0 balance
    const contractBalance = await publicClient.getBalance({ address: crowdfunding.address });
    assert.equal(contractBalance, 0n);
  });
  
});
