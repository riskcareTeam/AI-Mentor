// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import GitHubCallback from "./components/GitHubCallback"
import { UserProvider } from './context/userContext';

// import dotenv from "dotenv";

// dotenv.config();



const App: React.FC = () => {
  return (
    <UserProvider>
      <div className='App'>
        <Router>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/auth/github/callback" element={<GitHubCallback />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </Router>
      </div>
    </UserProvider>
  );
}

export default App;
