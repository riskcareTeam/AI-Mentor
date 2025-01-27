import express from 'express';
import { authenticateUser, fetchOrganisationRepos, fetchCodingTips, getContent, generateDocs } from '../controllers/githubController';

const router = express.Router();

router.get('/auth/github', authenticateUser);
router.get('/api/org-repos/:username', fetchOrganisationRepos);
router.get('/get-coding-tips/:username', fetchCodingTips);
router.post('/generate-docs', generateDocs)
router.post('/repo-content', getContent);

export default router;
