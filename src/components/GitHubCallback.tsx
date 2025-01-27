// src/components/GitHubCallback.tsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../context/userContext';

const GitHubCallback: React.FC = () => {
  const navigate = useNavigate();
  const { setUserData } = useUser(); // Get the function to update the user state

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('code');
    
    if (code) {
      axios.get(`http://localhost:5000/auth/github?code=${code}`)
        .then(response => {
          const { accessToken } = response.data;
          localStorage.setItem("token", accessToken)

          // Use the access token to fetch user data from GitHub
          axios.get('https://api.github.com/user', {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            }
          })
          .then(userResponse => {
            const userData = userResponse.data;
            
            // Save the user data in the context
            setUserData(userData);

            // Optionally, redirect to dashboard after successful login
            navigate('/dashboard');
          })
          .catch(err => console.error("Failed to fetch user data", err));
        })
        .catch(error => {
          console.error('GitHub OAuth failed', error);
        });
    }
  }, [navigate, setUserData]);

  return <div>Loading...</div>;
}

export default GitHubCallback;
