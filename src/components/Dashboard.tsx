import React, { useEffect } from 'react';
import '../styles/Dashboard.css';
import { useUser } from '../context/userContext';
import { useNavigate } from 'react-router-dom';
import CodingTips from './CodingTips';
import RepoSelector from './RepoSelector';
import DocumentationGenerator from './DocumentationGenerator';

const Dashboard: React.FC = () => {
  const { user, logout } = useUser();
  const skills = user?.skills ?? [];
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if user is not logged in
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');  // Redirect to login page after logout
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Welcome, {user?.login}</h1>
        <button className="logout-button" onClick={handleLogout}>Logout</button>
      </header>
      <div className="user-skills">
        <RepoSelector />
        <DocumentationGenerator/>
      </div>

      <div className="learning-paths">
        <h2>Suggested Learning Paths</h2>
        <div className="path-cards">
          <div className="learning-path-card">
            <h3>Frontend (React)</h3>
            <p>60% completed</p>
          </div>
          <div className="learning-path-card">
            <h3>Python Basics</h3>
            <p>45% completed</p>
          </div>
          <div className="learning-path-card">
            <h3>DevOps Mastery</h3>
            <p>30% completed</p>
          </div>
        </div>
      </div>
      <div className="user-skills">
        <h2>Skills</h2>
        {skills.join(", ")}
      </div>

      <CodingTips />
    </div>
  );
}

export default Dashboard;
