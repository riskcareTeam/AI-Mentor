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
exports.fetchCodingTips = exports.fetchOrganisationRepos = exports.authenticateUser = void 0;
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// GitHub OAuth credentials
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const GITHUB_REDIRECT_URI = process.env.GITHUB_REDIRECT_URI;
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
    try {
        const response = yield axios_1.default.get(`https://api.github.com/orgs/${process.env.GITHUB_ORG}/repos`);
        res.json(response.data);
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
