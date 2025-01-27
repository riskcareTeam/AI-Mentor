import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { useUser } from '../context/userContext';

const DocumentationGenerator = () => {
   const {  user } = useUser();
  const [error, setError] = useState<string | null>(null);
  const [documentation, setDocumentation] = useState('');
  const [loading, setLoading] = useState(false);


  const relevantExtensions = ['.js', '.ts', '.tsx', '.py', '.java', '.cpp', '.c', '.rb', '.go', '.cs', '.jsx'];

  const filterCodeFiles = (files: string[]) => {
    return files.filter(file => relevantExtensions.some(ext => file.endsWith(ext)));
  };

  const fetchRepoContent = async () => {
    const token = localStorage.getItem("token")
    setLoading(true);
    const requestBody = {
      orgName: 'riskcare',
      repoName: user?.selectedRepo,
      accessToken: "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"
    }
    // console.log(requestBody)
    // const response = await axios.post(`http://localhost:5000/repo-content`, requestBody);
    // const codeFiles = response.data.filter((file: any) => file.name.endsWith('.js') || file.name.endsWith('.ts'));

    // const code = await axios.get(codeFiles[0].download_url);

    const { data } = await axios.post('http://localhost:5000/repo-content', requestBody);

    console.log(data)

    //const docResponse = await axios.post('http://localhost:5000/generate-docs', { code: code.data });
    const docResponse = await axios.post('http://localhost:5000/generate-docs', {
      repoFiles: data,
      ...requestBody
    });

    setDocumentation(docResponse.data.documentation);
    setLoading(false);
  };

  return (
    <div className="document-generator-container">
     <h1>GitHub Documentation Generator</h1>
      
      <button onClick={fetchRepoContent} disabled={loading}>
        {loading ? 'Generating...' : 'Generate Documentation'}
      </button>
      <h2>Generated Documentation</h2>
      {documentation && <ReactMarkdown>{documentation}</ReactMarkdown>}
    </div>
  );
};

export default DocumentationGenerator;
