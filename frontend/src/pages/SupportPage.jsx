import React from "react";
import { Link } from "react-router-dom";
import Header from "../components/header/Header";
import "../styles/SupportPage.css";
import "bootstrap/dist/css/bootstrap.min.css";

export default function SupportPage() {
    return (
        <>
            <div className="support-page">
                <Header />
                <div>
                    <h1>Support Page</h1>
                    <h2>Get a ticket and our support team will help you as soon as possible</h2>
                    <form className="support-form">
                        <label>
                            Email:
                            <input type="email" name="email" required />
                        </label>
                        <br />
                        <label>
                            Issue:
                            <input name="issue" required></input>
                        </label>
                        <br />
                        <button type="submit">Submit Ticket</button>
                    </form>
                </div>
            </div>  
        </>
    );
}