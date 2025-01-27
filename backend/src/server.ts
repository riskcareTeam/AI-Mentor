import express, { Request, Response } from 'express';
import cors from 'cors';
import githubRoutes from './routes/githubRoutes';
import compression from 'compression';





const app = express();
app.use(cors());  // Allow cross-origin requests from frontend
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true })); // for URL encoded payloads
app.use(compression()); // Enable response compression for better performance and smaller payloads

const PORT = process.env.PORT || 5000;

app.use(githubRoutes);

app.get('/auth/logout', (req: Request, res: Response) => {
  res.clearCookie('session');  // Clear session cookie if set
  res.status(200).send({ message: 'Logged out successfully' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
