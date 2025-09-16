import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-dark text-white py-4 mt-5">
      <div className="container">
        <div className="row">
          <div className="col-md-6">
            <h5>DareFund</h5>
            <p className="text-muted">
              DARE Summer School - Crowdfunding for innovation
            </p>
          </div>
          <div className="col-md-6 text-md-end">
            <div className="d-flex gap-3 justify-content-md-end">
              <a href="#" className="text-white">
                Terms
              </a>
              <a href="#" className="text-white">
                Privacy
              </a>
              <a href="#" className="text-white">
                Help
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
