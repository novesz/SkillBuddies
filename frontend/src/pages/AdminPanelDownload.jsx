import 'bootstrap';
import "../App.css";
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function AdminPanelDownload() {
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        axios.get("/checkAdmin")
            .then((response) => {
                if (response.data === true) setIsAdmin(true);
            })
            .catch((error) => console.log(error));
    }, []); // <-- Important!

    function downloadFile() {
        const link = document.createElement("a");
        link.href = "http://localhost:5173/FullAdminPanel.zip";
        link.download = "FullAdminPanel.zip";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    return (
        <div className='mx-auto col-12 sb-page'>
            {isAdmin ? (
                <div>
                    <h1>Skillbuddies Admin Panel!</h1>
                    <p>Download the admin panel for advanced control over the website!</p>
                    <button className="sb-join" onClick={downloadFile}>Download</button>
                </div>
            ) : (
                <div>
                    <h1>You have to be an admin to access the admin panel</h1>
                </div>
            )}
        </div>
    );
}