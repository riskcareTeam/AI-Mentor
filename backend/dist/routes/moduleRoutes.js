"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const moduleController_1 = require("../controllers/moduleController");
const router = express_1.default.Router();
router.get('/modules', authMiddleware_1.authenticateJWT, moduleController_1.getModules);
router.post('/modules/:moduleId/complete', authMiddleware_1.authenticateJWT, moduleController_1.completeModule);
exports.default = router;
