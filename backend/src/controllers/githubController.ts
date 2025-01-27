import axios from 'axios';
import dotenv from 'dotenv';
import { Request, Response } from "express";
import OpenAI from "openai";
import fs from 'fs';
import PromisePool from '@supercharge/promise-pool';


dotenv.config();
// GitHub OAuth credentials
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID as string;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET as string;
const GITHUB_REDIRECT_URI = process.env.GITHUB_REDIRECT_URI as string;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY as string;



export const authenticateUser = async (req: Request, res: Response): Promise<any> => {
  const code = req.query.code as string;

  try {
    const response = await axios.post(
      'https://github.com/login/oauth/access_token',
      null,
      {
        params: {
          client_id: GITHUB_CLIENT_ID,
          client_secret: GITHUB_CLIENT_SECRET,
          code: code,
          redirect_uri: GITHUB_REDIRECT_URI,
        },
        headers: {
          'Accept': 'application/json',
          'X-GitHub-Api-Version': '2022-11-28',
          Authorization: `Bearer ${process.env.ACESS_TOKEN}`,
        },
      }
    );

    const accessToken = response.data.access_token;
    res.send({ accessToken });
  } catch (error) {
    console.error('GitHub OAuth error:', error);
    res.status(500).send('GitHub authentication failed');
  }
}

export const fetchOrganisationRepos = async (req: Request, res: Response): Promise<any> => {
  const { username } = req.params;
  try {
    const response = await axios.get(`https://api.github.com/orgs/${process.env.GITHUB_ORG}/repos`,
      {
        headers: {
          Authorization: `Bearer ${process.env.ACESS_TOKEN}`,
          Accept: "application/vnd.github.v3+json",
        }
      });
    const repos = response.data;

    let tips: string[] = [];
    let repoCodes: any[] = [];
    const languageSet = new Set<string>();

    for (const repo of repos) {
      if (repo.language) {
        languageSet.add(repo.language);
      }
      // Analyze repo language and generate tips
      if (repo.language === 'JavaScript') {
        tips.push(`Consider using TypeScript for better maintainability in ${repo.name}`);
      } else if (repo.language === 'Python') {
        tips.push(`Optimize performance using NumPy for data processing in ${repo.name}`);
      }

      // Fetch README or sample code from the repo
      try {
        const contentResponse = await axios.get(
          `https://api.github.com/repos/${username}/${repo.name}/contents/README.md`
        );
        repoCodes.push({
          repoName: repo.name,
          code: Buffer.from(contentResponse.data.content, 'base64').toString('utf-8')
        });
      } catch (error) {
        repoCodes.push({
          repoName: repo.name,
          code: 'README.md not found'
        });
      }
    }

    const skills = languageSet ? Array.from(languageSet) : []

    res.json({ username, tips, repoCodes, skills });
    //res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch repositories" });
  }
}

export const fetchCodingTips = async (req: Request, res: Response): Promise<any> => {
  const { username } = req.params;

  try {
    const reposResponse = await axios.get(`https://api.github.com/users/${username}/repos`);
    const repos = reposResponse.data;

    let tips: string[] = [];
    let repoCodes: any[] = [];
    const languageSet: any[] = [];

    for (const repo of repos) {
      if (repo.language) {
        languageSet.push(repo.language);
      }
      // Analyze repo language and generate tips
      if (repo.language === 'JavaScript') {
        tips.push(`Consider using TypeScript for better maintainability in ${repo.name}`);
      } else if (repo.language === 'Python') {
        tips.push(`Optimize performance using NumPy for data processing in ${repo.name}`);
      }

      // Fetch README or sample code from the repo
      try {
        const contentResponse = await axios.get(
          `https://api.github.com/repos/${username}/${repo.name}/contents/README.md`
        );
        repoCodes.push({
          repoName: repo.name,
          code: Buffer.from(contentResponse.data.content, 'base64').toString('utf-8')
        });
      } catch (error) {
        repoCodes.push({
          repoName: repo.name,
          code: 'README.md not found'
        });
      }
    }

    res.json({ username, tips, repoCodes, skills: languageSet });
  } catch (error) {
    res.status(500).json({ error });
  }
}

// export const getContent = async (req: Request, res: Response): Promise<any> => {
//   const { orgName, repoName, accessToken } = req.body;

//   // Validate required fields
//   if (!orgName || !repoName || !accessToken) {
//     return res.status(400).json({ error: 'Missing required fields: orgName, repoName, accessToken' });
//   }

//   try {
//     const response = await axios.get(
//       `https://api.github.com/repos/${orgName}/${repoName}/contents`,
//       {
//         headers: { Authorization: `Bearer ${accessToken}` },
//       }
//     );

//     res.json(response.data);
//   } catch (error) {
//     console.error('Error fetching repo content:', error);
//     res.status(500).json({ error: 'Failed to fetch repo content' });
//   }
// };

export const getContent = async (req: Request, res: Response): Promise<any> => {
  const { orgName, repoName, accessToken } = req.body;

  // Validate required fields
  if (!orgName || !repoName || !accessToken) {
    return res.status(400).json({ error: 'Missing required fields: orgName, repoName, accessToken' });
  }

  try {
    const repoContent = await fetchRepoContents(orgName, repoName, accessToken);
    res.json(repoContent);
  } catch (error) {
    console.error('Error fetching repo content:', error);
    res.status(500).json({ error: 'Failed to fetch repo content' });
  }
};

// const generateDocumentation = async (code: string) => {
//   const prompt = `
//     Generate concise and structured documentation for the following code:
//     ${code}
//   `;

//   const response = await axios.post(
//     'https://api.openai.com/v1/chat/completions',
//     {
//       model: 'gpt-4',
//       messages: [{ role: 'system', content: prompt }],
//       max_tokens: 500,
//     },
//     {
//       headers: {
//         Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
//       },
//     }
//   );

//   return response.data.choices[0].message.content;
// };


// export const generateDocs = async (req: Request, res: Response): Promise<any> => {
//   const { code } = req.body;
//   try {
//     const documentation = await generateDocumentation(code);
//     res.json({ documentation });
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to generate documentation' });
//   }
// };

// Helper function to filter code files
const filterCodeFiles = (files: any[]) => {
  // Filter files based on extensions (.js, .ts, .py, etc.)
  return files.filter(file =>
    file.name.endsWith('.js') ||
    file.name.endsWith('.ts') ||
    file.name.endsWith('.py')  ||
    file.name.endsWith('.jsx') ||
    file.name.endsWith('.tsx') 
  );
};

// Recursive function to fetch repo contents
const fetchRepoContents = async (
  orgName: string, 
  repoName: string, 
  token: string, 
  path = '', 
  page = 1,
  allFiles: any[] = []
): Promise<any> => {

  try{
    const url = `https://api.github.com/repos/${orgName}/${repoName}/contents/${path}`;
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log(response.data)


  const filePromises = response.data.map(async (item: any) => {
    if (item.type === 'dir') {
      return fetchRepoContents(orgName, repoName, token, item.path, 1);
    }
    return [item.path];
  });
  
  const results = await Promise.all(filePromises);
  allFiles.push(...results.flat());
  // If there's another page, recurse and fetch more files
  if (response.headers.link && response.headers.link.includes('rel="next"')) {
    return await fetchRepoContents(orgName, repoName, token, path, page + 1, allFiles);
  }
  console.log(allFiles)
  return allFiles;
  } catch(error) {
    console.error(`Error fetching contents for ${orgName}/${repoName}:`, error);
    throw new Error('Failed to fetch repository contents');
  }
 
};


// Format Markdown for the documentation
const formatMarkdown = (file: string, doc: string) => {
  return `## Documentation for ${file}\n\n${doc}\n\n`;
};

// Save documentation to file
const saveDocumentationToFile = (documentation: string, fileName: string) => {
  fs.writeFileSync(fileName, documentation);
};

export const generateDocs = async (req: Request, res: Response): Promise<any> => {
  const { repoFiles, accessToken, orgName, repoName } = req.body;
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  let downloadDocumentation = '';
  try {
    let documentation = '';

    // Use PromisePool to limit concurrency for parallel execution
    const { results, errors } = await PromisePool
      .for(repoFiles) // Loop through the files in parallel
      .withConcurrency(5) // Limit concurrency to avoid overloading the server or OpenAI
      .process(async (filePath: any) => {
        const fileContent = await fetchFileContent(orgName, repoName, filePath, accessToken);
        const doc = await generateDocumentation(openai, fileContent);

        // Add documentation for this file
        documentation += `### Documentation for ${filePath}\n${doc}\n\n`;

        // Prepare markdown for download
        downloadDocumentation += formatMarkdown(filePath, doc);
      });

    // Handle any errors in parallel processing
    if (errors.length > 0) {
      console.error('Error generating documentation:', errors);
      res.status(500).json({ error: 'Failed to generate documentation' });
      return;
    }

    // Save the generated documentation to file
    saveDocumentationToFile(downloadDocumentation, `./${repoName}_documentation.md`);

    // Return the generated documentation to the client
    res.json({ documentation });
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to generate documentation' });
  }
};

// Helper function to fetch file content
const fetchFileContent = async (orgName: string, repoName: string, path: string, token: string) => {
  const url = `https://api.github.com/repos/${orgName}/${repoName}/contents/${path}`;
  const response = await axios.get(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return Buffer.from(response.data.content, 'base64').toString('utf-8');
};

// Helper function to generate documentation using OpenAI
const generateDocumentation = async (openai: OpenAI, code: string) => {
  const prompt = `Generate documentation for the following code:\n\n${code}`;
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: `Document this code:\n\n${code}` }],
    max_tokens: 1000,
  });
  console.log(response.choices[0].message.content);
  return response.choices[0].message.content || '';
};


