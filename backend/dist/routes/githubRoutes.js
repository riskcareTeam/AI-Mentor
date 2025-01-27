"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const githubController_1 = require("../controllers/githubController");
const router = express_1.default.Router();
router.get('/auth/github', githubController_1.authenticateUser);
router.get('/api/org-repos/:username', githubController_1.fetchOrganisationRepos);
router.get('/get-coding-tips/:username', githubController_1.fetchCodingTips);
router.post('/generate-docs', githubController_1.generateDocs);
router.post('/repo-content', githubController_1.getContent);
exports.default = router;
