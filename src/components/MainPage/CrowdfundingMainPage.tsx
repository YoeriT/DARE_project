import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import Navbar from "../NavBar/Navbar";
import Footer from "../Footer/Footer";
import CreateCampaignForm from "../Forum/CreateCampaignForm";
import CampaignDetail from "../Campaign/CampaignDetail";
import {
  formatAddress,
  calculateProgress,
  formatTimeLeft,
} from "../utils/helperFunctions";
import CrowdFundingArtifact from "../../../blockchain/artifacts/contracts/CrowdFunding.sol/Crowdfunding.json";
import { supabase } from "../utils/supabase";

//ABI from the compiled contract
const CROWDFUNDING_ABI = CrowdFundingArtifact.abi;

//  Structure of data for campaigns
interface Campaign {
  id: string;
  title: string;
  description: string;
  goal: number;
  raised: number;
  daysLeft: number;
  timeLeft?: string;
  category: string;
  image: string;
  creator: string;
  contractAddress?: string;
  backers: number;
}

interface PlatformStats {
  totalProjects: number;
  totalRaisedETH: number;
  successRate: number;
}

declare global {
  interface Window {
    ethereum?: any;
  }
}

const CrowdfundingMainPage: React.FC = () => {
  //Status
  const [platformStats, setPlatformStats] = useState<PlatformStats>({
    totalProjects: 0,
    totalRaisedETH: 0,
    successRate: 0,
  });
  //Filters and Search
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  //Campaigns
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [eventListeners, setEventListeners] = useState<any[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(
    null
  );
  //Wallet
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [balance, setBalance] = useState("0");

  // Filter campaigns based on search and category
  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesSearch =
      campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = (() => {
      if (selectedCategory === "All") return true;
      if (selectedCategory === "My Campaigns") {
        // Show only campaigns created by the connected wallet
        return (
          walletConnected &&
          campaign.creator.toLowerCase() === walletAddress.toLowerCase()
        );
      }
      return campaign.category === selectedCategory;
    })();

    return matchesSearch && matchesCategory;
  });

  //Status

  const calculatePlatformStats = (campaigns: Campaign[]): PlatformStats => {
    if (campaigns.length === 0) {
      return {
        totalProjects: 0,
        totalRaisedETH: 0,
        successRate: 0,
      };
    }

    const totalProjects = campaigns.length;
    const totalRaisedETH = campaigns.reduce(
      (sum, campaign) => sum + campaign.raised,
      0
    );

    // Calculate success rate (campaigns that reached their goal)
    const successfulCampaigns = campaigns.filter(
      (campaign) => campaign.raised >= campaign.goal
    ).length;
    const successRate = (successfulCampaigns / totalProjects) * 100;

    return {
      totalProjects,
      totalRaisedETH: Math.round(totalRaisedETH * 1000) / 1000, // Round to 3 decimals
      successRate: Math.round(successRate * 10) / 10, // Round to 1 decimal
    };
  };

  //Categories for filtering
  const categories = [
    "All",
    "My Campaigns",
    "Environment",
    "Education",
    "Technology",
    "Health",
    "Art",
    "Social",
  ];

  //Campaign load
  const loadCampaigns = async () => {
    const { data, error } = await supabase
      .from("campaigns")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading campaigns:", error);
      return;
    }

    // Map metadata and fetch blockchain data
    const mappedCampaigns = await Promise.all(
      (data || []).map(async (campaign) => {
        try {
          // Create provider (make sure window.ethereum is available)
          if (!window.ethereum) {
            console.warn("No ethereum provider found, using database values");
            return {
              id: campaign.id,
              title: campaign.title,
              description: campaign.description,
              goal: parseFloat(campaign.goal_eth || "0"),
              raised: 0, // Default to 0 if no provider
              daysLeft: campaign.duration_days || 0,
              category: campaign.category,
              image: campaign.image_url,
              creator: campaign.creator_address,
              contractAddress: campaign.contract_address,
              backers: 0,
            };
          }

          const provider = new ethers.BrowserProvider(window.ethereum);

          // Connect to the contract
          const contract = new ethers.Contract(
            campaign.contract_address,
            CROWDFUNDING_ABI, // Use the imported ABI
            provider
          );

          // Get on-chain values
          const goal = await contract.goal();
          const deadline = await contract.deadline();

          // Get contract balance (raised amount)
          const contractBalance = await provider.getBalance(
            campaign.contract_address
          );

          // Get number of backers
          const backersCount = await contract.totalBackers();
          console.log("Backers count from contract:", backersCount);

          // Calculate days left from blockchain deadline
          const currentTime = Math.floor(Date.now() / 1000);
          const daysLeft = Math.max(
            0,
            Math.ceil((Number(deadline) - currentTime) / (24 * 60 * 60))
          );
          const timeLeft = formatTimeLeft(deadline);

          return {
            id: campaign.id,
            title: campaign.title,
            description: campaign.description,
            goal: parseFloat(ethers.formatEther(goal)), // Goal from blockchain
            raised: parseFloat(ethers.formatEther(contractBalance)), // Raised amount from contract balance
            daysLeft, // Days left calculated from blockchain deadline
            timeLeft,
            category: campaign.category,
            image: campaign.image_url,
            creator: campaign.creator_address, // Owner address from database
            contractAddress: campaign.contract_address,
            backers: backersCount, // Number of unique backers from events
          };
        } catch (err) {
          console.error(
            `Error loading campaign ${campaign.id} from blockchain`
          );
          // Return campaign with database values as fallback
          return {
            id: campaign.id,
            title: campaign.title,
            description: campaign.description,
            goal: parseFloat(campaign.goal_eth || "0"),
            raised: 0, // Default to 0 on error
            daysLeft: campaign.duration_days || 0,
            category: campaign.category,
            image: campaign.image_url,
            creator: campaign.creator_address,
            contractAddress: campaign.contract_address,
            backers: 0,
          };
        }
      })
    );

    // Filter out null values and set campaigns
    setCampaigns(mappedCampaigns.filter(Boolean));
    const stats = calculatePlatformStats(mappedCampaigns);
    setPlatformStats(stats);
  };

  // Event listeners for blockchain events
  useEffect(() => {
    const setupAllEventListeners = async () => {
      if (!campaigns.length || !walletConnected || !window.ethereum) return;

      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const newListeners: any[] = [];

        for (const campaign of campaigns) {
          if (!campaign.contractAddress) continue;

          const contract = new ethers.Contract(
            campaign.contractAddress,
            CROWDFUNDING_ABI,
            provider
          );

          // Fund event listener
          const handleFundEvent = () => {
            loadCampaigns(); // Refresh campaigns
          };

          // FundsClaimed event listener
          const handleClaimEvent = (amount: bigint) => {
            console.log(
              `Funds claimed: ${ethers.formatEther(amount)} ETH from ${
                campaign.title
              }`
            );
            loadCampaigns();
          };

          // RefundIssued event listener
          const handleRefundEvent = (amount: bigint) => {
            console.log(
              `Refund issued: ${ethers.formatEther(amount)} ETH from ${
                campaign.title
              }`
            );
          };

          // Add all listeners
          contract.on("Fund", handleFundEvent);
          contract.on("FundsClaimed", handleClaimEvent);
          contract.on("RefundIssued", handleRefundEvent);

          newListeners.push({
            contract,
            handlers: {
              Fund: handleFundEvent,
              FundsClaimed: handleClaimEvent,
              RefundIssued: handleRefundEvent,
            },
          });
        }

        setEventListeners(newListeners);
      } catch (error) {
        console.error("Error setting up event listeners:", error);
      }
    };

    // Cleanup function for multiple event types
    const cleanupAllListeners = () => {
      eventListeners.forEach(({ contract, handlers }) => {
        Object.entries(handlers).forEach(
          ([eventName, handler]: [string, any]) => {
            try {
              contract.off(eventName, handler);
            } catch (error) {
              console.error(`Error removing ${eventName} listener:`, error);
            }
          }
        );
      });
      setEventListeners([]);
    };

    cleanupAllListeners();
    setupAllEventListeners();

    return cleanupAllListeners;
  }, [campaigns, walletConnected]);

  useEffect(() => {
    // Initial load
    loadCampaigns();

    // Subscribe to realtime changes in Supabase
    const channel = supabase
      .channel("campaigns-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "campaigns" },
        (payload) => {
          console.log("Change received!", payload);
          loadCampaigns(); // Refresh campaigns when someone adds/updates/deletes
        }
      )
      .subscribe();

    // Clean up on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  //Campaign creation

  const handleCreateCampaign = () => {
    loadCampaigns();
    setShowCreateForm(false);
    alert("Campaign created successfully!");
  };

  const handleStartCampaign = () => {
    if (!walletConnected) {
      alert("Please connect your wallet first to create a campaign");
      return;
    }
    setShowCreateForm(true);
  };

  // Campaign details

  const handleViewDetails = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBackToCampaigns = async () => {
    setSelectedCampaign(null);
    await loadCampaigns();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDonate = async (amount?: number) => {
    if (!selectedCampaign?.contractAddress || !amount) {
      alert("Invalid donation amount or contract address");
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // Connect to the campaign's smart contract
      const contract = new ethers.Contract(
        selectedCampaign.contractAddress,
        CROWDFUNDING_ABI,
        signer
      );

      // Convert donation amount to Wei
      const donationInWei = ethers.parseEther(amount.toString());

      // Call the donate function on the smart contract
      const tx = await contract.donate({ value: donationInWei });

      console.log("Donation transaction sent:", tx.hash);

      // Wait for transaction confirmation
      await tx.wait();

      console.log("Donation confirmed!");

      // Refresh campaign data after successful donation
      await refreshCampaignData();
      await getBalance(walletAddress);

      alert("Donation successful!");
    } catch (error: any) {
      console.error("Donation failed:", error);
      if (error.code === 4001) {
        alert("Transaction rejected by user");
      } else if (error.message.includes("campaign ended")) {
        alert("Campaign ended cannot accept donations");
      } else {
        alert("Donation failed");
      }
    }
  };

  const handleClaimFunds = async () => {
    if (!selectedCampaign?.contractAddress) {
      alert("Invalid contract address");
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // Connect to the campaign's smart contract
      const contract = new ethers.Contract(
        selectedCampaign.contractAddress,
        CROWDFUNDING_ABI,
        signer
      );

      // Call the claimFunds function on the smart contract
      const tx = await contract.claimFunds();

      console.log("Claim funds transaction sent:", tx.hash);

      // Wait for transaction confirmation
      await tx.wait();

      console.log("Funds claimed successfully!");

      await supabase.from("campaigns").delete().eq("id", selectedCampaign.id);
      // Go back to campaigns list
      setSelectedCampaign(null);

      // Refresh campaign data and user balance
      await loadCampaigns();
      await getBalance(walletAddress);

      alert("Funds claimed successfully!");
    } catch (error: any) {
      console.error("Claim failed:", error);
      if (error.code === 4001) {
        alert("Transaction rejected by user");
      } else if (error.message.includes("funding goal not met")) {
        alert("Cannot claim funds: Goal not reached yet");
      } else if (error.message.includes("deadline not passed")) {
        alert("Cannot refund: Campaign is still active");
      } else if (error.message.includes("not the owner")) {
        alert("Only the campaign owner can claim funds");
      } else {
        alert("Claim failed");
      }
    }
  };

  const handleRefund = async () => {
    if (!selectedCampaign?.contractAddress) {
      alert("Invalid contract address");
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // Connect to the campaign's smart contract
      const contract = new ethers.Contract(
        selectedCampaign.contractAddress,
        CROWDFUNDING_ABI,
        signer
      );

      // Call the refund function on the smart contract
      const tx = await contract.getRefund();

      console.log("Refund transaction sent:", tx.hash);

      // Wait for transaction confirmation
      await tx.wait();

      console.log("Refund processed successfully!");

      // Check if contract is now empty
      const contractBalanceAfter = await provider.getBalance(
        selectedCampaign.contractAddress
      );

      // If balance is 0, this was the last refund - delete campaign
      if (contractBalanceAfter === 0n) {
        console.log("Last refund taken, deleting campaign from database");

        await supabase.from("campaigns").delete().eq("id", selectedCampaign.id);

        // Go back to campaigns list
        setSelectedCampaign(null);
        await loadCampaigns();

        alert(
          "Refund processed successfully! Campaign has been removed (all funds refunded)."
        );
      } else {
        // Not the last refund, just refresh data
        await refreshCampaignData();
        await getBalance(walletAddress);

        alert("Refund processed successfully!");
      }

      alert("Refund processed successfully!");
    } catch (error: any) {
      console.error("Refund failed:", error);
      if (error.code === 4001) {
        alert("Transaction rejected by user");
      } else if (error.message.includes("no funds to refund")) {
        alert("You have no (more) funds to refund from this campaign");
      } else if (error.message.includes("deadline not passed")) {
        alert("Cannot refund: Campaign is still active");
      } else if (error.message.includes("goal was met")) {
        alert("Cannot refund: Campaign goal was reached");
      } else {
        alert("Refund failed");
      }
    }
  };

  const refreshCampaignData = async () => {
    if (!selectedCampaign?.contractAddress) return;

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(
        selectedCampaign.contractAddress,
        CROWDFUNDING_ABI,
        provider
      );

      // Get updated contract balance
      const contractBalance = await provider.getBalance(
        selectedCampaign.contractAddress
      );
      const raisedAmount = parseFloat(ethers.formatEther(contractBalance));

      // Get deadline from contract
      const deadline = await contract.deadline();
      const currentTime = Math.floor(Date.now() / 1000);
      const daysLeft = Math.max(
        0,
        Math.ceil((Number(deadline) - currentTime) / (24 * 60 * 60))
      );
      const timeLeft = formatTimeLeft(deadline); // Add this

      // Update the selected campaign data
      const updatedCampaign = {
        ...selectedCampaign,
        raised: raisedAmount,
        daysLeft: daysLeft,
        timeLeft: timeLeft,
      };

      setSelectedCampaign(updatedCampaign);

      // Also update the campaign in the campaigns array
      setCampaigns((prevCampaigns) =>
        prevCampaigns.map((campaign) =>
          campaign.id === selectedCampaign.id
            ? { ...campaign, raised: raisedAmount }
            : campaign
        )
      );
    } catch (error) {
      console.error("Failed to refresh campaign data:", error);
    }
  };

  // Wallet connection

  const isWalletInstalled = () => {
    return typeof window.ethereum !== "undefined";
  };

  const connectWallet = async () => {
    if (!isWalletInstalled()) {
      alert(
        "Wallet is not installed. Please install (for example) MetaMask to continue."
      );
      window.open("https://metamask.io/download/", "_blank");
      return;
    }

    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts.length > 0) {
        const address = accounts[0];
        setWalletAddress(address);
        setWalletConnected(true);

        // Get balance
        await getBalance(address);

        console.log("Wallet connected:", address);
      }
    } catch (error: any) {
      console.error("Failed to connect wallet:", error);
      if (error.code === 4001) {
        alert("Please connect to wallet to continue.");
      } else {
        alert("Failed to connect wallet. Please try again.");
      }
    }
  };

  // Get ETH balance
  const getBalance = async (address: string) => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const balance = await provider.getBalance(address);
      const balanceInEth = ethers.formatEther(balance);
      setBalance(parseFloat(balanceInEth).toFixed(4));
    } catch (error) {
      console.error("Failed to get balance:", error);
      setBalance("0");
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setWalletConnected(false);
    setWalletAddress("");
    setBalance("0");
    console.log("Wallet disconnected");
  };

  // Check if already connected on page load
  useEffect(() => {
    const checkConnection = async () => {
      if (isWalletInstalled()) {
        try {
          const accounts = await window.ethereum.request({
            method: "eth_accounts",
          });

          if (accounts.length > 0) {
            const address = accounts[0];
            setWalletAddress(address);
            setWalletConnected(true);
            await getBalance(address);
          }
        } catch (error) {
          console.error("Failed to check connection:", error);
        }
      }
    };

    checkConnection();
  }, []);

  // Listen for account changes
  useEffect(() => {
    if (isWalletInstalled()) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          getBalance(accounts[0]);
        } else {
          disconnectWallet();
        }
      };

      const handleChainChanged = () => {
        window.location.reload();
      };

      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);

      return () => {
        window.ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged
        );
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      };
    }
  }, []);

  //check for balance updates
  useEffect(() => {
    if (!walletConnected || !walletAddress) return;
    getBalance(walletAddress);
  }, [walletConnected, walletAddress]);

  return (
    <div className="min-vh-100 bg-light">
      <Navbar
        walletConnected={walletConnected}
        walletAddress={walletAddress}
        balance={balance}
        onConnectWallet={connectWallet}
        onDisconnectWallet={disconnectWallet}
      />

      {selectedCampaign ? (
        (console.log("Selected Campaign:", selectedCampaign),
        console.log("Wallet Address:", walletAddress),
        console.log("Wallet creator:", selectedCampaign.creator),
        console.log("Is Owner:", walletAddress === selectedCampaign.creator),
        (
          <CampaignDetail
            campaign={selectedCampaign}
            onBack={handleBackToCampaigns}
            onDonate={(amount) => handleDonate(amount)}
            onClaimFunds={handleClaimFunds}
            onRefund={handleRefund}
            walletConnected={walletConnected}
            isOwner={walletAddress === selectedCampaign.creator}
          />
        ))
      ) : (
        <>
          {/* Hero Section */}
          <section className="bg-primary text-white py-5">
            <div className="container">
              <div className="row align-items-center">
                <div className="col-lg-6 mb-3 mb-md-0">
                  <h1 className="display-4 fw-bold mb-4">
                    Crowdfunding for Innovation
                  </h1>
                  <p className="lead mb-4">
                    Dare to fund the future with blockchain technology. Secure,
                    transparent, and decentralized support for projects
                    worldwide.
                  </p>
                  <div className="d-flex gap-3">
                    <button
                      className="btn btn-warning btn-lg"
                      onClick={handleStartCampaign}
                    >
                      Start a Campaign
                    </button>
                  </div>
                </div>
                <div className="col-lg-6 text-center">
                  <div className="bg-white bg-opacity-10 rounded-4 p-4">
                    {/* Platform Stats with made */}
                    <h3 className="mb-3">Platform Stats</h3>
                    <div className="row">
                      <div className="col-4">
                        <h4 className="text-warning">
                          {" "}
                          {platformStats.totalProjects.toLocaleString()}
                        </h4>
                        <small>Projects Funded</small>
                      </div>
                      <div className="col-4">
                        <h4 className="text-warning">
                          {" "}
                          {platformStats.totalRaisedETH.toLocaleString()} ETH
                        </h4>
                        <small>Total Raised</small>
                      </div>
                      <div className="col-4">
                        <h4 className="text-warning">
                          {platformStats.successRate}%
                        </h4>
                        <small>Success Rate</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Search and Filters */}
          <section className="py-4 bg-white shadow-sm">
            <div className="container">
              <div className="row align-items-center">
                <div className="col-md-5 mb-3 mb-md-0">
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-search"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search campaigns..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-md-7">
                  <div className="d-flex gap-2 flex-wrap justify-content-md-end">
                    {categories.map((category) => (
                      <button
                        key={category}
                        className={`btn btn-sm ${
                          selectedCategory === category
                            ? "btn-primary"
                            : "btn-outline-primary"
                        }`}
                        onClick={() => setSelectedCategory(category)}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Campaigns Grid */}
          <section className="py-5">
            <div className="container">
              <div className="row mb-4">
                <div className="col">
                  <h2 className="fw-bold">Active Campaigns</h2>
                  <p className="text-muted">
                    Discover and support innovative projects
                  </p>
                </div>
              </div>

              <div className="row g-4">
                {filteredCampaigns.map((campaign) => (
                  <div key={campaign.id} className="col-lg-6 col-xl-4">
                    <div className="card h-100 shadow-sm hover-shadow">
                      <img
                        src={campaign.image}
                        className="card-img-top"
                        alt={campaign.title}
                        style={{ height: "200px", objectFit: "cover" }}
                      />
                      <div className="card-body d-flex flex-column">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <span className="badge bg-secondary">
                            {campaign.category}
                          </span>
                          <small className="text-muted">
                            {campaign.timeLeft || `${campaign.daysLeft} days`}{" "}
                            left
                          </small>
                        </div>

                        <h5 className="card-title">{campaign.title}</h5>
                        <p className="card-text text-muted flex-grow-1">
                          {campaign.description}
                        </p>

                        <div className="mb-3">
                          <div className="d-flex justify-content-between mb-1">
                            <small className="text-muted">Progress</small>
                            <small className="text-muted">
                              {campaign.raised} ETH of {campaign.goal} ETH
                            </small>
                          </div>
                          <div className="progress">
                            <div
                              className="progress-bar bg-success"
                              style={{
                                width: `${calculateProgress(
                                  campaign.raised,
                                  campaign.goal
                                )}%`,
                              }}
                            ></div>
                          </div>
                          <small className="text-muted">
                            {calculateProgress(
                              campaign.raised,
                              campaign.goal
                            ).toFixed(1)}
                            % funded
                          </small>
                        </div>

                        <div className="d-flex justify-content-between align-items-center">
                          <small className="text-muted">
                            by {formatAddress(campaign.creator)}
                          </small>
                          <button
                            className="btn btn-primary"
                            onClick={() => handleViewDetails(campaign)}
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredCampaigns.length === 0 && (
                <div className="text-center py-5">
                  <h4 className="text-muted">
                    {selectedCategory === "My Campaigns"
                      ? "You haven't created any campaigns yet"
                      : "No campaigns found"}
                  </h4>
                  <p className="text-muted">
                    Try adjusting your search or filter criteria
                  </p>
                </div>
              )}
            </div>
          </section>
        </>
      )}
      <Footer />

      {showCreateForm && (
        <CreateCampaignForm
          onSubmit={handleCreateCampaign}
          onCancel={() => setShowCreateForm(false)}
          walletAddress={walletAddress}
        />
      )}
    </div>
  );
};

export default CrowdfundingMainPage;
