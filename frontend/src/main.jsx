import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';   // <= DOM!
import App from './App.jsx';
import './index.css';
import { UserProvider } from './context/UserContext.jsx';
import 'bootstrap/dist/css/bootstrap.min.css'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <UserProvider>
      <BrowserRouter>
        <App/>
      </BrowserRouter>
    </UserProvider>
  </React.StrictMode>
);
