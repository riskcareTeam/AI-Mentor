"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const githubAuthController_1 = require("../controllers/githubAuthController");
const router = express_1.default.Router();
router.get('/auth/github', githubAuthController_1.authenticateUser);
router.get('/api/org-repos', githubAuthController_1.fetchOrganisationRepos);
router.get('/get-coding-tips/:username', githubAuthController_1.fetchCodingTips);
exports.default = router;
