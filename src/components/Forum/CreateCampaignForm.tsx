import React, { useState } from "react";

interface Campaign {
  title: string;
  description: string;
  goal: number;
  daysLeft: number;
  category: string;
  image: string;
  creator: string;
}

const formatAddress = (address: string): string => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.title ||
      !formData.description ||
      !formData.goal ||
      !formData.daysLeft
    ) {
      alert("Please fill in all fields");
      return;
    }

    onSubmit({
      title: formData.title,
      description: formData.description,
      goal: parseFloat(formData.goal),
      daysLeft: parseInt(formData.daysLeft),
      category: formData.category,
      image: formData.image,
      creator: formatAddress(walletAddress),
    });
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
