import React, { useEffect, useState } from 'react';
import { dark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import '../styles/Dashboard.css';
import axios from 'axios';
import { useUser } from '../context/userContext';
import SyntaxHighlighter from 'react-syntax-highlighter';

const CodingTips: React.FC = () => {
    const { user, setUserData } = useUser();
    const [tips, setTips] = useState<string[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [repoCodes, setRepoCodes] = useState<{ repoName: string; code: string }[]>([]);

    const fetchOrgRepos = async() => {
        const token = localStorage.getItem("token")
        
        if (!user?.login) {
            setError('Please enter a GitHub username');
            return;
        }
        try {
            setError(null)
            setLoading(true)
            const response = await axios.get(`http://localhost:5000/api/org-repos/${user.login}`);
            setTips(response.data.tips);
            setRepoCodes(response.data.repoCodes);
            setUserData({...user, skills: response.data.skills, repos: response.data.repoCodes.filter((x: any)=> x.repoName)})
        } catch (err) {
            setError('Failed to fetch org repos. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchOrgRepos()
    }, [])

    return (
        <div className="daily-tip">
            {loading && 'Loading...'}
            {error && <p className="error">{error}</p>}
            <h2>Daily Coding Tip</h2>
            {tips.length > 0 && (
                <div className="tips">
                    <h2>Coding Tips for {user?.login}</h2>
                    <ul>
                        {tips.map((tip, index) => (
                            <li key={index}>{tip}</li>
                        ))}
                    </ul>
                </div>
            )}
            {repoCodes.length > 0 && (
                <div className="repo-codes">
                    <h2>Sample Code from Repositories</h2>
                    {repoCodes.map((repo, index) => (
                        <div key={index} className="code-block">
                            <h3>{repo.repoName}</h3>
                            <SyntaxHighlighter language="markdown" style={dark}>
                                {repo.code}
                            </SyntaxHighlighter>
                        </div>
                    ))}
                </div>
            )}
            <p>Remember to write clean, readable code. Aim for simplicity!</p>
            <button className="save-later">Save to Learn Later</button>
        </div>
    );
}

export default CodingTips;
