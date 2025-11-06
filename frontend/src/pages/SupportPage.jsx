import React from "react";
import { Link } from "react-router-dom";
import Header from "../components/header/Header";
import "../styles/Home.css";
import "bootstrap/dist/css/bootstrap.min.css";

export default function SupportPage() {
    return (
        <>
            <div className="sb-page">
                <Header />
                <div className="support-content text-center mt-5" id="suppMain">
                    <h1>Support Page</h1>
                    <h2>Get a ticket and our support team will help you as soon as possible</h2>
                    <form className="support-form col-6 mx-auto mt-4">
                        <label>
                            Email:
                            <br />
                            <input type="email" name="email" required id="emailField" placeholder="email@example.com"/>
                        </label>
                        <br />
                        <label>
                            Issue:
                            <br />
                            <textarea name="issue" required id="desrField" placeholder="Describe here"></textarea>
                        </label>
                        <br />
                        <button type="submit" id="subButton">Submit Ticket</button>
                    </form>
                </div>
            </div>  
        </>
    );
}