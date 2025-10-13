import React, { useState } from "react";
import {
  formatAddress,
  formatEth,
  calculateProgress,
} from "../utils/helperFunctions";

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

interface CampaignDetailProps {
  campaign: Campaign;
  onBack: () => void;
  onDonate: (amount: number) => Promise<void>;
  onClaimFunds: () => Promise<void>;
  onRefund: () => Promise<void>;
  walletConnected: boolean;
  isOwner: boolean;
}

const CampaignDetail: React.FC<CampaignDetailProps> = ({
  campaign,
  onBack,
  onDonate,
  onClaimFunds,
  onRefund,
  walletConnected,
  isOwner,
}) => {
  const [showDonationForm, setShowDonationForm] = useState(false);
  const [donationAmount, setDonationAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const progress = calculateProgress(campaign.raised, campaign.goal);
  const remainingAmount = Math.max(campaign.goal - campaign.raised, 0);

  //Donation functions
  const handleDonateClick = () => {
    if (isOwner && progress >= 100) {
      // Owner claiming funds
      handleClaimFunds();
    } else {
      // Regular user donating
      setShowDonationForm(true);
    }
  };

  const handleRefundClick = async () => {
    setIsSubmitting(true);
    try {
      await onRefund();
    } catch (error) {
      console.error("Refund failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClaimFunds = async () => {
    setIsSubmitting(true);
    try {
      await onClaimFunds();
    } catch (error) {
      console.error("Claim failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelDonation = () => {
    setShowDonationForm(false);
    setDonationAmount("");
  };

  const getMaxDonation = (): number => {
    return Math.max(campaign.goal - campaign.raised, 0);
  };

  const handleConfirmDonation = async () => {
    if (!donationAmount || parseFloat(donationAmount) <= 0) return;

    setIsSubmitting(true);
    try {
      // Pass the donation amount to the parent component
      await onDonate(parseFloat(donationAmount));
      setShowDonationForm(false);
      setDonationAmount("");
    } catch (error) {
      console.error("Donation failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-4">
      {/* Back Button */}
      <div className="mb-4">
        <button
          className="btn btn-outline-primary d-inline-flex align-items-center px-4 py-2 rounded-pill shadow-sm"
          onClick={onBack}
          style={{
            border: "2px solid",
            transition: "all 0.3s ease",
            fontWeight: "500",
          }}
        >
          <i className="bi bi-arrow-left me-2"></i>
          Back to Campaigns
        </button>
      </div>

      <div className="row">
        {/* Main Content */}
        <div className="col-lg-8">
          {/* Hero Image with Overlay */}
          <div className="position-relative mb-5">
            <div
              className="rounded-4 overflow-hidden shadow-lg"
              style={{ height: "450px" }}
            >
              <img
                src={campaign.image}
                alt={campaign.title}
                className="img-fluid w-100 h-100"
                style={{ objectFit: "cover" }}
              />
              {/* Gradient Overlay */}
              <div
                className="position-absolute top-0 start-0 w-100 h-100"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.3) 100%)",
                  borderRadius: "inherit",
                }}
              ></div>

              {/* Floating Category Badge */}
              <div className="position-absolute top-0 start-0 m-4">
                <span
                  className="badge px-4 py-2 rounded-pill shadow"
                  style={{
                    background:
                      "linear-gradient(135deg, #0400ffff 0%, #007bff 100%)",
                    fontSize: "0.9rem",
                    fontWeight: "500",
                  }}
                >
                  <i className="bi bi-tag-fill me-2"></i>
                  {campaign.category}
                </span>
              </div>

              {/* Days Left Badge */}
              <div className="position-absolute top-0 end-0 m-4">
                <div
                  className="badge bg-dark bg-opacity-75 px-3 py-2 rounded-pill"
                  style={{ fontSize: "0.85rem" }}
                >
                  <i className="bi bi-clock me-1"></i>
                  {campaign.timeLeft || `${campaign.daysLeft} days`} left
                </div>
              </div>
            </div>
          </div>

          {/* Campaign Title */}
          <div className="mb-5">
            <h1
              className="display-4 fw-bold mb-4"
              style={{
                background: "linear-gradient(135deg, #2c3e50 0%, #007bff 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                lineHeight: "1.2",
              }}
            >
              {campaign.title}
            </h1>
          </div>

          {/* Description */}
          <div className="mb-5">
            <h3 className="mb-4 fw-bold text-dark">About This Campaign</h3>

            <div
              className="p-5 rounded-4 shadow-sm position-relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
                border: "2px solid #e9ecef",
              }}
            >
              {/* Decorative background pattern */}
              <div
                className="position-absolute top-0 end-0 opacity-10"
                style={{
                  width: "200px",
                  height: "200px",
                  transform: "translate(50%, -50%)",
                }}
              ></div>

              <p
                className="lead mb-0 position-relative"
                style={{
                  lineHeight: "1.8",
                  whiteSpace: "pre-line",
                  color: "#2c3e50",
                  fontSize: "1.1rem",
                }}
              >
                {campaign.description}
              </p>
            </div>
          </div>

          {/* Creator Information */}
          <div className="mb-5">
            <h3 className="mb-4 fw-bold text-dark">Campaign Creator</h3>

            <div
              className="p-4 rounded-4 shadow-sm d-flex align-items-center"
              style={{
                background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
                border: "2px solid #e9ecef",
              }}
            >
              <div
                className="rounded-circle d-flex align-items-center justify-content-center me-4 shadow-sm"
                style={{
                  width: "70px",
                  height: "70px",
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                }}
              >
                <i className="bi bi-person-fill text-white fs-4"></i>
              </div>
              <div className="flex-grow-1">
                <h5 className="mb-2 fw-bold">Anonymous Creator</h5>
                <div className="d-flex align-items-center">
                  <i className="bi bi-wallet2 me-2 text-primary"></i>
                  <span
                    className="font-monospace small text-muted"
                    style={{ wordBreak: "break-all" }}
                  >
                    {formatAddress(campaign.creator)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Campaign Updates Section */}
          <div className="mb-5">
            <h3 className="mb-4 fw-bold text-dark">Campaign Updates</h3>

            <div
              className="p-5 rounded-4 text-center shadow-sm position-relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
                border: "2px solid #e9ecef",
              }}
            >
              {/* Decorative icons */}
              <h5 className="mb-3 fw-bold text-dark">Stay Tuned!</h5>
              <p className="text-muted mb-0 lead">
                No updates yet. Check back later for progress updates from the
                creator.
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar - Keeping original functionality */}
        <div className="col-lg-4">
          <div className="sticky-top" style={{ top: "80px" }}>
            {/* Funding Progress Card */}
            <div className="card shadow mb-4">
              <div className="card-body">
                {!showDonationForm ? (
                  <>
                    <h4 className="card-title mb-3">Funding Progress</h4>

                    {/* Funding Amount */}
                    <div className="mb-3">
                      <div className="d-flex justify-content-between mb-2">
                        <span className="fs-2 fw-bold text-success">
                          {formatEth(campaign.raised)}
                        </span>
                        <span className="text-muted">
                          of {formatEth(campaign.goal)}
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="progress mb-2" style={{ height: "10px" }}>
                        <div
                          className="progress-bar bg-success"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>

                      <div className="d-flex justify-content-between text-muted small">
                        <span>{progress.toFixed(1)}% funded</span>
                        <span>{formatEth(remainingAmount)} remaining</span>
                      </div>
                    </div>

                    {/* Campaign Stats */}
                    <div className="row text-center mb-4">
                      <div className="col-6">
                        <div className="border-end">
                          <h5 className="mb-1">{campaign.backers}</h5>
                          <small className="text-muted">Backers</small>
                        </div>
                      </div>
                      <div className="col-6">
                        <h5 className="mb-1">
                          {campaign.timeLeft || `${campaign.daysLeft} days`}
                        </h5>
                        <small className="text-muted">Time Left</small>
                      </div>
                    </div>

                    {/* Campaign Status */}
                    <div className="mb-4">
                      {progress >= 100 ? (
                        <div className="alert alert-success mb-3">
                          <i className="bi bi-check-circle-fill me-2"></i>
                          <strong>Goal Reached!</strong> This campaign has been
                          successfully funded.
                        </div>
                      ) : campaign.daysLeft <= 0 ? (
                        <div className="alert alert-danger mb-3">
                          <i className="bi bi-exclamation-triangle-fill me-2"></i>
                          <strong>Campaign Ended</strong> This campaign has
                          expired.
                        </div>
                      ) : (
                        <div className="alert alert-info mb-3">
                          <i className="bi bi-info-circle-fill me-2"></i>
                          <strong>Campaign Active</strong> You can contribute to
                          this campaign.
                        </div>
                      )}
                    </div>

                    {/* Donate/Claim/Refund Button */}
                    <div className="d-grid gap-2">
                      {walletConnected ? (
                        <>
                          {isOwner ? (
                            // Owner view - show claim funds button
                            progress >= 100 ? (
                              <button
                                className="btn btn-success btn-lg"
                                onClick={handleDonateClick}
                                disabled={isSubmitting}
                              >
                                {isSubmitting ? (
                                  <>
                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                    Claiming...
                                  </>
                                ) : (
                                  <>
                                    <i className="bi bi-wallet-fill me-2"></i>
                                    Claim Funds
                                  </>
                                )}
                              </button>
                            ) : (
                              <button
                                className="btn btn-secondary btn-lg"
                                disabled
                              >
                                <i className="bi bi-wallet2 me-2"></i>
                                Goal Not Met - Cannot Claim
                              </button>
                            )
                          ) : (
                            // Regular user view
                            <>
                              {campaign.daysLeft <= 0 && progress < 100 ? (
                                // Campaign failed - show refund button
                                <button
                                  className="btn btn-warning btn-lg"
                                  onClick={handleRefundClick}
                                  disabled={isSubmitting}
                                >
                                  {isSubmitting ? (
                                    <>
                                      <span className="spinner-border spinner-border-sm me-2"></span>
                                      Processing...
                                    </>
                                  ) : (
                                    <>
                                      <i className="bi bi-arrow-counterclockwise me-2"></i>
                                      Request Refund
                                    </>
                                  )}
                                </button>
                              ) : progress >= 100 ? (
                                <button
                                  className="btn btn-success btn-lg"
                                  disabled
                                >
                                  <i className="bi bi-check-circle-fill me-2"></i>
                                  Goal Achieved
                                </button>
                              ) : campaign.daysLeft <= 0 ? (
                                <button
                                  className="btn btn-secondary btn-lg"
                                  disabled
                                >
                                  <i className="bi bi-clock me-2"></i>
                                  Campaign Ended
                                </button>
                              ) : (
                                <button
                                  className="btn btn-primary btn-lg"
                                  onClick={handleDonateClick}
                                >
                                  <i className="bi bi-heart-fill me-2"></i>
                                  Fund This Campaign
                                </button>
                              )}
                            </>
                          )}
                          <small className="text-muted text-center">
                            Powered by smart contracts on Ethereum
                          </small>
                        </>
                      ) : (
                        <div className="text-center">
                          <button
                            className="btn btn-warning btn-lg mb-2"
                            disabled
                          >
                            <i className="bi bi-wallet2 me-2"></i>
                            Connect Wallet to Contribute
                          </button>
                          <small className="text-muted d-block">
                            You need to connect your wallet to fund this
                            campaign
                          </small>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  // Donation form
                  <>
                    <h4 className="card-title mb-3">
                      <i className="bi bi-heart-fill text-danger me-2"></i>
                      Make a Donation
                    </h4>

                    <div className="mb-4">
                      <label className="form-label fw-bold">
                        Donation Amount (ETH)
                      </label>
                      <div className="input-group input-group-lg">
                        <input
                          type="number"
                          className="form-control"
                          placeholder="0.00"
                          value={donationAmount}
                          onChange={(e) => {
                            const value = e.target.value;

                            // Allow empty
                            if (value === "") {
                              setDonationAmount("");
                              return;
                            }
                            const parts = value.split(".");

                            // If decimal, allow max 3 digits after decimal
                            if (parts[1] && parts[1].length > 3) return;

                            const numValue = parseFloat(value);
                            const maxDonation = parseFloat(
                              getMaxDonation().toFixed(3)
                            );

                            if (numValue > maxDonation) {
                              setDonationAmount(maxDonation.toString());
                            } else {
                              setDonationAmount(value);
                            }
                          }}
                          min="0"
                          max={getMaxDonation()}
                          step="0.001"
                          disabled={isSubmitting}
                        />
                        <span className="input-group-text bg-primary text-white">
                          ETH
                        </span>
                      </div>
                      <div className="d-flex justify-content-between">
                        <small className="text-muted">Minimum: 0.001 ETH</small>
                        <small className="text-muted">
                          Maximum: {getMaxDonation().toFixed(3)} ETH
                        </small>
                      </div>
                    </div>

                    {donationAmount && parseFloat(donationAmount) > 0 && (
                      <div className="alert alert-info mb-4">
                        <div className="d-flex justify-content-between">
                          <span>Your donation:</span>
                          <strong>
                            {parseFloat(donationAmount).toFixed(3)} ETH
                          </strong>
                        </div>
                        <div className="d-flex justify-content-between">
                          <small className="text-muted">+ Gas fee</small>
                        </div>
                        <hr className="my-2" />
                        <div className="d-flex justify-content-between">
                          <strong>Total:</strong>
                          <strong>
                            {parseFloat(donationAmount).toFixed(3)} ETH
                          </strong>
                        </div>
                      </div>
                    )}

                    <div className="d-grid gap-2">
                      <button
                        className="btn btn-success btn-lg"
                        onClick={handleConfirmDonation}
                        disabled={
                          !donationAmount ||
                          parseFloat(donationAmount) <= 0 ||
                          parseFloat(donationAmount) >
                            parseFloat(getMaxDonation().toFixed(3)) ||
                          isSubmitting
                        }
                      >
                        {isSubmitting ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Processing...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-check-circle-fill me-2"></i>
                            Confirm Donation
                          </>
                        )}
                      </button>

                      <button
                        className="btn btn-outline-secondary"
                        onClick={handleCancelDonation}
                        disabled={isSubmitting}
                      >
                        Cancel
                      </button>
                    </div>

                    <small className="text-muted text-center d-block mt-3">
                      <i className="bi bi-shield-check me-1"></i>
                      Your transaction will be processed on the Ethereum
                      blockchain
                    </small>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignDetail;
