import React, { useState } from "react";
import { ethers } from "ethers";
import CrowdFundingArtifact from "../../../blockchain/artifacts/contracts/CrowdFunding.sol/Crowdfunding.json";
import { supabase } from "../utils/supabase";
import { notify } from "../Toasts/Toasts";

interface Campaign {
  title: string;
  description: string;
  goal: number;
  daysLeft: number;
  category: string;
  image: string;
  creator: string;
  contractAddress?: string;
}

//ABI and Bytecode from the compiled contract
const CROWDFUNDING_ABI = CrowdFundingArtifact.abi;
const CROWDFUNDING_BYTECODE = CrowdFundingArtifact.bytecode;

interface CreateCampaignFormProps {
  onSubmit: (campaign: Campaign) => void;
  onCancel: () => void;
  walletAddress: string;
}

const CreateCampaignForm: React.FC<CreateCampaignFormProps> = ({
  onSubmit,
  onCancel,
  walletAddress,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    goal: "",
    daysLeft: "",
    category: "Technology",
    image:
      "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=250&fit=crop",
  });

  const categories = [
    "Environment",
    "Education",
    "Technology",
    "Health",
    "Art",
    "Social",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.title ||
      !formData.description ||
      !formData.goal ||
      !formData.daysLeft
    ) {
      notify("Please fill in all fields", "warning");
      return;
    }

    try {
      // Check if MetaMask is available
      if (!window.ethereum) {
        notify("Please install MetaMask to create a campaign!", "error");
        return;
      }

      // Request account access
      await window.ethereum.request({ method: "eth_requestAccounts" });

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // Convert goal to Wei (smallest ETH unit)
      const goalInWei = ethers.parseEther(formData.goal);
      const daysAsNumber = parseInt(formData.daysLeft);

      // Create contract factory (you'll need to add the ABI and bytecode)
      const contractFactory = new ethers.ContractFactory(
        CROWDFUNDING_ABI,
        CROWDFUNDING_BYTECODE,
        signer
      );

      console.log("Deploying contract...");

      // Deploy the contract with constructor parameters
      const contract = await contractFactory.deploy(daysAsNumber, goalInWei);

      // Wait for the contract to be mined
      await contract.waitForDeployment();

      // Get the deployed contract address
      const contractAddress = await contract.getAddress();

      console.log("Contract deployed at:", contractAddress);

      onSubmit({
        title: formData.title,
        description: formData.description,
        goal: parseFloat(formData.goal),
        daysLeft: daysAsNumber,
        category: formData.category,
        image: formData.image,
        creator: walletAddress,
        contractAddress: contractAddress,
      });

      // Submit the campaign data including the contract address
      const { error } = await supabase.from("campaigns").insert([
        {
          title: formData.title,
          description: formData.description,
          category: formData.category,
          image_url: formData.image,
          goal_eth: parseFloat(formData.goal),
          duration_days: daysAsNumber,
          contract_address: contractAddress,
          creator_address: walletAddress,
        },
      ]);

      if (error) {
        console.error("Error saving campaign:", error);
      } else {
        console.log("Campaign saved to database");
      }

      // Reset form after successful deployment
      setFormData({
        title: "",
        description: "",
        goal: "",
        daysLeft: "",
        category: "Technology",
        image:
          "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=250&fit=crop",
      });
    } catch (error: any) {
      console.error("Deployment failed:", error);

      // Handle different types of errors
      if (error.code === 4001) {
        notify("Transaction rejected by user", "error");
      } else if (error.message.includes("insufficient funds")) {
        notify("Insufficient funds to deploy contract", "error");
      } else {
        notify("Failed to deploy contract", "error");
      }
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div
      className="modal show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Create New Campaign</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onCancel}
            ></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">Campaign Title</label>
                <input
                  type="text"
                  className="form-control"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter your campaign title"
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe your project and why people should fund it"
                />
              </div>

              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">Funding Goal (ETH)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="form-control"
                      name="goal"
                      value={formData.goal}
                      onChange={handleChange}
                      placeholder="e.g. 10.5"
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">
                      Campaign Duration (Days)
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      name="daysLeft"
                      value={formData.daysLeft}
                      onChange={handleChange}
                      placeholder="e.g. 30"
                    />
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Category</label>
                <select
                  className="form-control"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">Image URL</label>
                <input
                  type="url"
                  className="form-control"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onCancel}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Create Campaign
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateCampaignForm;
