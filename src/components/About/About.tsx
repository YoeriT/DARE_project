import React from "react";

const AboutPage: React.FC = () => {
  const techStack = [
    {
      category: "Frontend",
      technologies: ["React", "TypeScript", "Bootstrap"],
      description: "Modern, type-safe UI with responsive design",
    },
    {
      category: "Web3 Integration",
      technologies: ["Ethers.js", "MetaMask", "Viem"],
      description: "Seamless blockchain interaction and wallet connectivity",
    },
    {
      category: "Smart Contracts",
      technologies: ["Solidity 0.8.28", "Hardhat", "Slither"],
      description:
        "Secure, tested, and gas-optimized contracts with static analysis",
    },
    {
      category: "Backend & Data",
      technologies: ["Supabase"],
      description: "Campaign metadata storage and real-time updates",
    },
  ];

  return (
    <div className="container py-5">
      <div className="text-center mb-5">
        <h1 className="display-4 fw-bold mb-3">About DareFund</h1>
        <p
          className="lead text-secondary mb-4"
          style={{ maxWidth: "800px", margin: "0 auto" }}
        >
          A decentralized crowdfunding platform developed for the DARE Summer
          School program, showcasing end-to-end smart contract development with
          goal-based fund claiming and refund functionality.
        </p>
      </div>

      {/* Project Information */}
      <div className="row justify-content-center mb-5">
        <div className="col-lg-10">
          <div className="card border shadow-sm rounded-4">
            <div className="card-body p-4 p-md-5">
              <h3 className="mb-4 fw-bold">DARE Summer School Project</h3>

              <p className="mb-4">
                DareFund was developed as an end-to-end decentralized
                application for the DARE Summer School program. The project
                showcases hands-on experience with smart contract development,
                deployment, testing, and integration with a modern web
                interface. The platform demonstrates how blockchain technology
                can be used for a crowdfunding application.
              </p>

              <div className="row mb-4">
                <div className="col-md-6 mb-3">
                  <h5 className="fw-bold mb-3 text-primary">
                    Project Goals Achieved
                  </h5>
                  <ul>
                    <li className="mb-2">
                      Deployed Solidity smart contract on Ethereum testnet
                    </li>
                    <li className="mb-2">
                      Built responsive React frontend with TypeScript
                    </li>
                    <li className="mb-2">
                      Integrated MetaMask wallet connectivity
                    </li>
                    <li className="mb-2">
                      Comprehensive unit testing with Hardhat
                    </li>
                    <li className="mb-2">Static analysis with Slither</li>
                    <li className="mb-2">
                      Supabase integration for campaign metadata
                    </li>
                  </ul>
                </div>
                <div className="col-md-6 mb-3">
                  <h5 className="fw-bold mb-3 text-primary">
                    Smart Contract Features
                  </h5>
                  <ul>
                    <li className="mb-2">Goal based campaign creation</li>
                    <li className="mb-2">
                      Refund mechanism for failed campaigns
                    </li>
                    <li className="mb-2">
                      Deadline enforcement at the blockchain level
                    </li>
                    <li className="mb-2">
                      Backer tracking with accumulated donations
                    </li>
                    <li className="mb-2">
                      Event emission for all major actions
                    </li>
                    <li className="mb-2">Total backer count tracking</li>
                    <li className="mb-2">
                      Owner fund withdrawal for successful campaigns
                    </li>
                    <li className="mb-2">
                      Individual backer refund claims for failed campaigns
                    </li>
                  </ul>
                </div>
              </div>

              <div className="alert alert-light border" role="alert">
                <h6 className="fw-bold mb-2">Security & Testing</h6>
                <p className="mb-0 small">
                  The smart contract has been thoroughly tested with multiple
                  test scenarios covering donations, deadline enforcement, fund
                  claiming, and refund mechanisms. Static analysis using Slither
                  was performed to identify and patch potential vulnerabilities.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Technology Stack */}
      <div className="row justify-content-center mb-5">
        <div className="col-lg-10">
          <h2 className="text-center mb-4 fw-bold">Technology Stack</h2>
          <div className="row">
            {techStack.map((tech, idx) => (
              <div key={idx} className="col-md-6 mb-4">
                <div className="card h-100 border shadow-sm rounded-4">
                  <div className="card-body">
                    <h5 className="card-title fw-bold mb-3">{tech.category}</h5>
                    <div className="mb-3">
                      {tech.technologies.map((t, i) => (
                        <span
                          key={i}
                          className="badge bg-light text-dark border me-2 mb-2 px-3 py-2"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                    <p className="card-text text-muted small mb-0">
                      {tech.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contract Logic Section */}
      <div className="row justify-content-center mb-5">
        <div className="col-lg-10">
          <div className="card border shadow-sm rounded-4">
            <div className="card-body p-4 p-md-5">
              <h3 className="mb-4 fw-bold text-center">Smart Contract Logic</h3>
              <div className="row">
                <div className="col-md-6 mb-4 mb-md-0">
                  <div className="p-4 bg-dark bg-opacity-10 border border-secondary rounded-4">
                    <h5 className="text-bold fw-bold mb-3">
                      Campaign Succeeds
                    </h5>
                    <p className="mb-2">
                      <strong>Conditions:</strong>
                    </p>
                    <ul className="mb-3">
                      <li>Total donations = funding goal</li>
                      <li>Deadline has passed</li>
                    </ul>
                    <p className="mb-2">
                      <strong>Action:</strong>
                    </p>
                    <p className="text-muted mb-0">
                      Campaign creator can claim donated funds to receive all
                      donated funds. Backers cannot request refunds.
                    </p>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="p-4 bg-dark bg-opacity-10 border border-secondary rounded-4">
                    <h5 className="text-bold fw-bold mb-3">Campaign Fails</h5>
                    <p className="mb-2">
                      <strong>Conditions:</strong>
                    </p>
                    <ul className="mb-3">
                      <li>Total donations &lt; funding goal</li>
                      <li>Deadline has passed</li>
                    </ul>
                    <p className="mb-2">
                      <strong>Action:</strong>
                    </p>
                    <p className="text-muted mb-0">
                      Each backer can refund to receive their full contribution
                      back. Creator cannot claim funds.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
