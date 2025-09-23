import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";
import { getAddress } from "viem";

describe("Crowdfunding", async function () {
  const { viem } = await network.connect();
  const publicClient = await viem.getPublicClient();
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
});
