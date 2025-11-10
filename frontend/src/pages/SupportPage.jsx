import React from "react";
import "../styles/SupportPage.css";
import Navbar from "../components/header/Header";
function SupportPage() {
  return (
    <div className="sb-page support-page">
      <Navbar />
      {/* Support content */}
      <main className="support-main">
        <h2 className="support-title">Support Page</h2>
        <p className="support-subtitle">
          Get a ticket and our support team will help you as soon as possible
        </p>

        <form className="support-form">
          <div className="support-field">
            <label htmlFor="email">email:</label>
            <input
              id="email"
              type="email"
              placeholder="example@gmail.com"
              required
            />
          </div>

          <div className="support-field">
            <label htmlFor="desc">describe here:</label>
            <textarea
              id="desc"
              placeholder="describe your issues or problems here..."
              rows="6"
              required
            />
          </div>

          <button type="submit" className="support-submit">
            Submit
          </button>
        </form>
      </main>
    </div>
  );
};

export default SupportPage;
