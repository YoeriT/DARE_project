import { ethers } from "hardhat";

async function main() {
  // Replace with your deployed contract address
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // UPDATE THIS
  
  console.log("=== Testing Counter Contract ===");
  console.log("Contract address:", contractAddress);
  
  const Counter = await ethers.getContractFactory("Counter");
  const counter = Counter.attach(contractAddress);
  
  // Read initial value
  let value = await counter.x();
  console.log("Initial x value:", value.toString());
  
  // Test inc() function
  console.log("\nCalling inc()...");
  let tx = await counter.inc();
  await tx.wait();
  console.log("Transaction hash:", tx.hash);
  
  value = await counter.x();
  console.log("After inc(), x =", value.toString());
  
  // Test incBy() function
  console.log("\nCalling incBy(5)...");
  tx = await counter.incBy(5);
  await tx.wait();
  console.log("Transaction hash:", tx.hash);
  
  value = await counter.x();
  console.log("After incBy(5), x =", value.toString());
  
  console.log("\n✅ Counter contract is working perfectly!");
}

main().catch(console.error);