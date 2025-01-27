import React from 'react';
import '../styles/Login.css';
import logo from "../assets/react.svg"

const GITHUB_CLIENT_ID = "Ov23ctfsfEgCGTl15BMh"
const REDIRECT_URI = "http://localhost:5173/auth/github/callback"

const  Login : React.FC = () => {
const handleGitHubLogin = () => {
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&scope=read:riskcare user:email&redirect_uri=${REDIRECT_URI}`;
}

  return (
    <div className="login-container">
      <div className="login-header">
        <img src={logo} alt="React" className="logo" />
        <h1>AI Dev Mentor</h1>
      </div>

      <div className="login-buttons">
        <button className="auth-button github" onClick={handleGitHubLogin}>Sign up with GitHub</button>
        <button className="auth-button google">Sign up with Google</button>
      </div>

      <div className="login-footer">
        <p>Already have an account? <a href="/">Log in</a></p>
      </div>
    </div>
  );
}

export default Login;
