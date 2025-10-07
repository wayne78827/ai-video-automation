import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import monitor from './middleware/monitor.js';
import generateAndPublish from './routes/generate-and-publish.js';

// ES Module 路徑處理
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 載入環境變數
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 中間件設置
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(monitor);

// 檔案上傳設置
const upload = multer({ dest: '../uploads/' });

// 路由設置
app.use('/api/generate-and-publish', generateAndPublish);

// 健康檢查端點
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 啟動服務器
app.listen(PORT, () => {
  console.log(`🚀 AI Video Automation API running on port ${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
});

export default app;
