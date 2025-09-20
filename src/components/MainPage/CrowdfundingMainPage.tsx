import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import "bootstrap/dist/css/bootstrap.min.css";
import Navbar from "../NavBar/Navbar";
import Footer from "../Footer/Footer";
import CreateCampaignForm from "../Forum/CreateCampaignForm";
import CampaignDetail from "../Campaign/CampaignDetail";
import { formatAddress, calculateProgress } from "../utils/helperFunctions";
import CrowdFundingArtifact from "../../../blockchain/artifacts/contracts/CrowdFunding.sol/Crowdfunding.json";

//ABI from the compiled contract
const CROWDFUNDING_ABI = CrowdFundingArtifact.abi;

//  Structure of data for campaigns
interface Campaign {
  id: number;
  title: string;
  description: string;
  goal: number;
  raised: number;
  daysLeft: number;
  category: string;
  image: string;
  creator: string;
  contractAddress?: string;
}

//campaigns
const mockCampaigns: Campaign[] = [
  {
    id: 1,
    title: "Sustainable Ocean Cleanup Device",
    description:
      "Revolutionary device to remove plastic waste from our oceans using solar power and AI navigation.",
    goal: 50,
    raised: 32.5,
    daysLeft: 15,
    category: "Environment",
    image:
      "https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=400&h=250&fit=crop",
    creator: "0x1234...5678",
  },
  {
    id: 2,
    title: "Decentralized Learning Platform",
    description:
      "Building a blockchain-based platform for peer-to-peer education and skill sharing.",
    goal: 25,
    raised: 18.7,
    daysLeft: 8,
    category: "Education",
    image:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=250&fit=crop",
    creator: "0xabcd...efgh",
  },
  {
    id: 3,
    title: "Smart Urban Farming System",
    description:
      "IoT-enabled vertical farming solution for urban communities to grow fresh produce locally.",
    goal: 75,
    raised: 41.2,
    daysLeft: 22,
    category: "Technology",
    image:
      "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&h=250&fit=crop",
    creator: "0x9876...5432",
  },
  {
    id: 4,
    title: "Open Source Medical Research",
    description:
      "Funding transparent medical research for rare diseases with all findings published openly.",
    goal: 100,
    raised: 67.8,
    daysLeft: 12,
    category: "Health",
    image:
      "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=250&fit=crop",
    creator: "0xdef0...1234",
  },
];

declare global {
  interface Window {
    ethereum?: any;
  }
}

const CrowdfundingMainPage: React.FC = () => {
  //Filters and Search
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  //Campaigns
  const [campaigns, setCampaigns] = useState<Campaign[]>(mockCampaigns);
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
    const matchesCategory =
      selectedCategory === "All" || campaign.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  //Categories for filtering
  const categories = [
    "All",
    "Environment",
    "Education",
    "Technology",
    "Health",
    "Art",
    "Social",
  ];

  //Campaign creation

  const handleCreateCampaign = (
    newCampaign: Omit<Campaign, "id" | "raised">
  ) => {
    const campaign: Campaign = {
      ...newCampaign,
      id: campaigns.length + 1,
      raised: 0, // New campaigns start with 0 funding
    };

    setCampaigns([campaign, ...campaigns]); // Add to beginning of list
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

  const handleBackToCampaigns = () => {
    setSelectedCampaign(null);
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

      alert("Donation successful!");
    } catch (error: any) {
      console.error("Donation failed:", error);
      if (error.code === 4001) {
        alert("Transaction rejected by user");
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

      // Refresh campaign data and user balance
      await refreshCampaignData();
      await getBalance(walletAddress);

      alert("Funds claimed successfully!");
    } catch (error: any) {
      console.error("Claim failed:", error);
      if (error.code === 4001) {
        alert("Transaction rejected by user");
      } else if (error.message.includes("funding goal not met")) {
        alert("Cannot claim funds: Goal not reached yet");
      } else if (error.message.includes("not the owner")) {
        alert("Only the campaign owner can claim funds");
      } else {
        alert("Claim failed");
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

      // Update the selected campaign data
      const updatedCampaign = {
        ...selectedCampaign,
        raised: raisedAmount,
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

    const interval = setInterval(() => {
      getBalance(walletAddress);
    }, 3000);

    return () => clearInterval(interval);
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
                <div className="col-lg-6">
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
                        <h4 className="text-warning">1,234</h4>
                        <small>Projects Funded</small>
                      </div>
                      <div className="col-4">
                        <h4 className="text-warning">5,678 ETH</h4>
                        <small>Total Raised</small>
                      </div>
                      <div className="col-4">
                        <h4 className="text-warning">89%</h4>
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
                <div className="col-md-6">
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
                <div className="col-md-6">
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
                            {campaign.daysLeft} days left
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
                  <h4 className="text-muted">No campaigns found</h4>
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
