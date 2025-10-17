import React from "react";
import { formatAddress } from "../utils/helperFunctions";

interface NavbarProps {
  walletConnected: boolean;
  walletAddress: string;
  balance: string;
  onConnectWallet: () => void;
  onDisconnectWallet: () => void;
  onNavigate: (page: "Explore" | "HowItWorks" | "About") => void;
  activePage: string;
}

const Navbar: React.FC<NavbarProps> = ({
  walletConnected,
  walletAddress,
  balance,
  onConnectWallet,
  onDisconnectWallet,
  onNavigate,
  activePage,
}) => {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary sticky-top">
      <div className="container">
        <a className="navbar-brand fw-bold fs-3" href="#">
          <i className="bi bi-currency-ethereum me-2"></i>
          DareFund
        </a>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <a
                className={`nav-link ${
                  activePage === "Explore" ? "active" : ""
                }`}
                href="#"
                onClick={() => onNavigate("Explore")}
              >
                Explore
              </a>
            </li>
            <li className="nav-item">
              <a
                className={`nav-link ${
                  activePage === "HowItWorks" ? "active" : ""
                }`}
                href="#"
                onClick={() => onNavigate("HowItWorks")}
              >
                How it Works
              </a>
            </li>
            <li className="nav-item">
              <a
                className={`nav-link ${activePage === "About" ? "active" : ""}`}
                href="#"
                onClick={() => onNavigate("About")}
              >
                About
              </a>
            </li>
          </ul>

          <div className="d-flex gap-2">
            {walletConnected ? (
              <div className="d-flex gap-2">
                <span className="text-light">
                  {formatAddress(walletAddress)} ({balance} ETH)
                </span>
                <button
                  className="btn btn-outline-danger btn-sm"
                  onClick={onDisconnectWallet}
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button className="btn btn-warning" onClick={onConnectWallet}>
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
