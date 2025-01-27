"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const githubRoutes_1 = __importDefault(require("./routes/githubRoutes"));
const compression_1 = __importDefault(require("compression"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)()); // Allow cross-origin requests from frontend
app.use(express_1.default.json({ limit: '50mb' }));
app.use(express_1.default.urlencoded({ limit: '50mb', extended: true })); // for URL encoded payloads
app.use((0, compression_1.default)()); // Enable response compression for better performance and smaller payloads
const PORT = process.env.PORT || 5000;
app.use(githubRoutes_1.default);
app.get('/auth/logout', (req, res) => {
    res.clearCookie('session'); // Clear session cookie if set
    res.status(200).send({ message: 'Logged out successfully' });
});
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
