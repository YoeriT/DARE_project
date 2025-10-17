import React from "react";

const HowItWorksPage: React.FC = () => {
  return (
    <div className="container py-5">
      <header className="text-center mb-3 pb-2">
        <h1 className="fw-bolder display-5 text-primary">
          Starting and Backing Projects on DareFund
        </h1>
        <p className="lead text-muted mx-auto" style={{ maxWidth: "700px" }}>
          DareFund offers a secure, decentralized way to fund creative and
          innovative projects using cryptocurrency ETH.
        </p>
      </header>

      <div className="bg-white  p-4 p-md-5 rounded-4 shadow-sm mb-5">
        <h2 className="text-center mb-5 text-warning fw-bolder">
          For Creators: Launch Your Project
        </h2>

        <div className="row g-4 justify-content-center">
          <div className="col-md-4">
            <div className="text-center p-3 h-100 border-start border-3 border-primary">
              <i className="bi bi-wallet2 display-3 text-primary mb-3"></i>
              <h4 className="fw-bold">1. Connect & Prepare</h4>
              <p className="text-muted">
                Connect your Web3 wallet (e.g., MetaMask). Ensure you have
                enough ETH to cover the small network gas fee for contract
                deployment.
              </p>
            </div>
          </div>

          <div className="col-md-4">
            <div className="text-center p-3 h-100 border-start border-3 border-primary">
              <i className="bi bi-clipboard-check display-3 text-primary mb-3"></i>
              <h4 className="fw-bold">2. Define Your Goal</h4>
              <p className="text-muted">
                Navigate to the "Start a Campaign." button define your funding
                goal (in ETH) and the deadline. These details are locked into
                the contract.
              </p>
            </div>
          </div>

          <div className="col-md-4">
            <div className="text-center p-3 h-100 border-start border-3 border-primary">
              <i className="bi bi-rocket-takeoff display-3 text-primary mb-3"></i>
              <h4 className="fw-bold">3. Deploy & Share</h4>
              <p className="text-muted">
                Confirm the transaction. Your unique, smart contract is now live
                and ready to receive decentralized funding.
              </p>
            </div>
          </div>
        </div>

        <div className="border-0 mt-5 mx-auto" style={{ maxWidth: "800px" }}>
          <div className="card-body p-4 text-center">
            <h4 className="text-primary fw-bold mb-3">Goal Met?</h4>
            <p className="mb-0">
              If your funding goal is reached by the deadline, you gain the
              exclusive ability to claim all the funds directly from the
              contract.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 p-md-5 rounded-4 shadow-lg">
        <h2 className="text-center mb-5 pt-4 text-warning fw-bolder">
          For Backers: Donate with Confidence
        </h2>

        <div className="row g-4 mb-4 justify-content-center">
          <div className="col-md-4">
            <div className="text-center p-3 h-100 border-start border-3 border-primary">
              <i className="bi bi-search display-3 text-success mb-3"></i>
              <h4 className="fw-bold">1. Find a Project</h4>
              <p className="text-muted">
                Browse the "Explore" page to find campaigns. Look for clear
                goals, realistic deadlines, and a project narrative you support.
              </p>
            </div>
          </div>

          <div className="col-md-4">
            <div className="text-center p-3 h-100 border-start border-3 border-primary">
              <i className="bi bi-currency-bitcoin display-3 text-success mb-3"></i>
              <h4 className="fw-bold">2. Make a Donation</h4>
              <p className="text-muted">
                Enter your desired ETH amount. Your donation goes straight into
                the campaign's smart contract.
              </p>
            </div>
          </div>

          <div className="col-md-4">
            <div className="text-center p-3 h-100 border-start border-3 border-primary">
              <i className="bi bi-hourglass-split display-3 text-success mb-3"></i>
              <h4 className="fw-bold">3. Wait for Resolution</h4>
              <p className="text-muted">
                Follow the campaign until the deadline. Your investment decision
                is protected by immutable, on-chain logic.
              </p>
            </div>
          </div>
        </div>

        <div className="border-0 mt-5 mx-auto" style={{ maxWidth: "800px" }}>
          <div className="card-body p-4 text-center">
            <div className="d-flex align-items-center">
              <div>
                <h4 className="text-primary fw-bold mb-3">
                  Your Backer's Refund Guarantee
                </h4>
                <p className="mb-0">
                  If the campaign fails to meet its ETH goal by the deadline,
                  the creator receives zero. The contract automatically unlocks
                  the refund function, allowing you to withdraw your full
                  contribution safely.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorksPage;
