"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateDocs = exports.getContent = exports.fetchCodingTips = exports.fetchOrganisationRepos = exports.authenticateUser = void 0;
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
const openai_1 = __importDefault(require("openai"));
const fs_1 = __importDefault(require("fs"));
const promise_pool_1 = __importDefault(require("@supercharge/promise-pool"));
dotenv_1.default.config();
// GitHub OAuth credentials
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const GITHUB_REDIRECT_URI = process.env.GITHUB_REDIRECT_URI;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const authenticateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const code = req.query.code;
    try {
        const response = yield axios_1.default.post('https://github.com/login/oauth/access_token', null, {
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
        });
        const accessToken = response.data.access_token;
        res.send({ accessToken });
    }
    catch (error) {
        console.error('GitHub OAuth error:', error);
        res.status(500).send('GitHub authentication failed');
    }
});
exports.authenticateUser = authenticateUser;
const fetchOrganisationRepos = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username } = req.params;
    try {
        const response = yield axios_1.default.get(`https://api.github.com/orgs/${process.env.GITHUB_ORG}/repos`, {
            headers: {
                Authorization: `Bearer ${process.env.ACESS_TOKEN}`,
                Accept: "application/vnd.github.v3+json",
            }
        });
        const repos = response.data;
        let tips = [];
        let repoCodes = [];
        const languageSet = new Set();
        for (const repo of repos) {
            if (repo.language) {
                languageSet.add(repo.language);
            }
            // Analyze repo language and generate tips
            if (repo.language === 'JavaScript') {
                tips.push(`Consider using TypeScript for better maintainability in ${repo.name}`);
            }
            else if (repo.language === 'Python') {
                tips.push(`Optimize performance using NumPy for data processing in ${repo.name}`);
            }
            // Fetch README or sample code from the repo
            try {
                const contentResponse = yield axios_1.default.get(`https://api.github.com/repos/${username}/${repo.name}/contents/README.md`);
                repoCodes.push({
                    repoName: repo.name,
                    code: Buffer.from(contentResponse.data.content, 'base64').toString('utf-8')
                });
            }
            catch (error) {
                repoCodes.push({
                    repoName: repo.name,
                    code: 'README.md not found'
                });
            }
        }
        const skills = languageSet ? Array.from(languageSet) : [];
        res.json({ username, tips, repoCodes, skills });
        //res.json(response.data);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch repositories" });
    }
});
exports.fetchOrganisationRepos = fetchOrganisationRepos;
const fetchCodingTips = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username } = req.params;
    try {
        const reposResponse = yield axios_1.default.get(`https://api.github.com/users/${username}/repos`);
        const repos = reposResponse.data;
        let tips = [];
        let repoCodes = [];
        const languageSet = [];
        for (const repo of repos) {
            if (repo.language) {
                languageSet.push(repo.language);
            }
            // Analyze repo language and generate tips
            if (repo.language === 'JavaScript') {
                tips.push(`Consider using TypeScript for better maintainability in ${repo.name}`);
            }
            else if (repo.language === 'Python') {
                tips.push(`Optimize performance using NumPy for data processing in ${repo.name}`);
            }
            // Fetch README or sample code from the repo
            try {
                const contentResponse = yield axios_1.default.get(`https://api.github.com/repos/${username}/${repo.name}/contents/README.md`);
                repoCodes.push({
                    repoName: repo.name,
                    code: Buffer.from(contentResponse.data.content, 'base64').toString('utf-8')
                });
            }
            catch (error) {
                repoCodes.push({
                    repoName: repo.name,
                    code: 'README.md not found'
                });
            }
        }
        res.json({ username, tips, repoCodes, skills: languageSet });
    }
    catch (error) {
        res.status(500).json({ error });
    }
});
exports.fetchCodingTips = fetchCodingTips;
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
const getContent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { orgName, repoName, accessToken } = req.body;
    // Validate required fields
    if (!orgName || !repoName || !accessToken) {
        return res.status(400).json({ error: 'Missing required fields: orgName, repoName, accessToken' });
    }
    try {
        const repoContent = yield fetchRepoContents(orgName, repoName, accessToken);
        res.json(repoContent);
    }
    catch (error) {
        console.error('Error fetching repo content:', error);
        res.status(500).json({ error: 'Failed to fetch repo content' });
    }
});
exports.getContent = getContent;
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
const filterCodeFiles = (files) => {
    // Filter files based on extensions (.js, .ts, .py, etc.)
    return files.filter(file => file.name.endsWith('.js') ||
        file.name.endsWith('.ts') ||
        file.name.endsWith('.py') ||
        file.name.endsWith('.jsx') ||
        file.name.endsWith('.tsx'));
};
// Recursive function to fetch repo contents
const fetchRepoContents = (orgName_1, repoName_1, token_1, ...args_1) => __awaiter(void 0, [orgName_1, repoName_1, token_1, ...args_1], void 0, function* (orgName, repoName, token, path = '', page = 1, allFiles = []) {
    try {
        const url = `https://api.github.com/repos/${orgName}/${repoName}/contents/${path}`;
        const response = yield axios_1.default.get(url, {
            headers: { Authorization: `Bearer ${token}` },
        });
        console.log(response.data);
        const filePromises = response.data.map((item) => __awaiter(void 0, void 0, void 0, function* () {
            if (item.type === 'dir') {
                return fetchRepoContents(orgName, repoName, token, item.path, 1);
            }
            return [item.path];
        }));
        const results = yield Promise.all(filePromises);
        allFiles.push(...results.flat());
        // If there's another page, recurse and fetch more files
        if (response.headers.link && response.headers.link.includes('rel="next"')) {
            return yield fetchRepoContents(orgName, repoName, token, path, page + 1, allFiles);
        }
        console.log(allFiles);
        return allFiles;
    }
    catch (error) {
        console.error(`Error fetching contents for ${orgName}/${repoName}:`, error);
        throw new Error('Failed to fetch repository contents');
    }
});
// Format Markdown for the documentation
const formatMarkdown = (file, doc) => {
    return `## Documentation for ${file}\n\n${doc}\n\n`;
};
// Save documentation to file
const saveDocumentationToFile = (documentation, fileName) => {
    fs_1.default.writeFileSync(fileName, documentation);
};
const generateDocs = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { repoFiles, accessToken, orgName, repoName } = req.body;
    const openai = new openai_1.default({
        apiKey: process.env.OPENAI_API_KEY,
    });
    let downloadDocumentation = '';
    try {
        let documentation = '';
        // Use PromisePool to limit concurrency for parallel execution
        const { results, errors } = yield promise_pool_1.default
            .for(repoFiles) // Loop through the files in parallel
            .withConcurrency(5) // Limit concurrency to avoid overloading the server or OpenAI
            .process((filePath) => __awaiter(void 0, void 0, void 0, function* () {
            const fileContent = yield fetchFileContent(orgName, repoName, filePath, accessToken);
            const doc = yield generateDocumentation(openai, fileContent);
            // Add documentation for this file
            documentation += `### Documentation for ${filePath}\n${doc}\n\n`;
            // Prepare markdown for download
            downloadDocumentation += formatMarkdown(filePath, doc);
        }));
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to generate documentation' });
    }
});
exports.generateDocs = generateDocs;
// Helper function to fetch file content
const fetchFileContent = (orgName, repoName, path, token) => __awaiter(void 0, void 0, void 0, function* () {
    const url = `https://api.github.com/repos/${orgName}/${repoName}/contents/${path}`;
    const response = yield axios_1.default.get(url, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return Buffer.from(response.data.content, 'base64').toString('utf-8');
});
// Helper function to generate documentation using OpenAI
const generateDocumentation = (openai, code) => __awaiter(void 0, void 0, void 0, function* () {
    const prompt = `Generate documentation for the following code:\n\n${code}`;
    const response = yield openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: `Document this code:\n\n${code}` }],
        max_tokens: 1000,
    });
    console.log(response.choices[0].message.content);
    return response.choices[0].message.content || '';
});
