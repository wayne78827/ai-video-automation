# AI 自動化影片發布系統

使用 AI 技術將文字內容轉換為影片，並自動發布到 Instagram 和 YouTube 平台。

## 🚀 功能特色

- **智慧內容優化**：使用 Perplexity Pro 針對不同平台優化文字腳本
- **AI 影片生成**：通過 Runway ML Gen-3 將文字轉換為高品質影片
- **自動社群發布**：支援 Instagram Reels 和 YouTube Shorts 自動發布
- **響應式介面**：使用 React 和 Tailwind CSS 建立直觀的用戶介面

## 🛠 技術架構

### 後端
- **Node.js + Express**：RESTful API 服務
- **Perplexity Pro API**：內容智慧增強
- **Runway ML API**：文字轉影片生成
- **Instagram Graph API**：Instagram 自動發布
- **YouTube Data API v3**：YouTube 影片上傳

### 前端
- **React 18**：用戶介面框架
- **Tailwind CSS**：UI 樣式設計
- **Axios**：HTTP 請求處理

## 📋 環境需求

1. **Node.js** 16.x 或更高版本
2. **API 金鑰**：
   - Perplexity Pro API Key
   - Runway ML API Key
   - Meta Developer App (Instagram)
   - Google Cloud Console (YouTube)

## ⚙️ 快速開始

### 1. 複製儲存庫

\`\`\`bash
git clone https://github.com/your-username/ai-video-automation.git
cd ai-video-automation
\`\`\`

### 2. 環境設定

複製 \`.env.example\` 為 \`.env\`：

\`\`\`bash
cp .env.example .env
\`\`\`

填入您的 API 金鑰：

\`\`\`env
PERPLEXITY_API_KEY=your_perplexity_pro_api_key
RUNWAY_API_KEY=your_runway_ml_api_key
META_APP_ID=your_meta_app_id
META_APP_SECRET=your_meta_app_secret
INSTAGRAM_ACCESS_TOKEN=your_instagram_access_token
IG_BUSINESS_ID=your_instagram_business_id
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
\`\`\`

### 3. 安裝依賴

\`\`\`bash
# 後端依賴
npm install

# 前端依賴
cd frontend
npm install
\`\`\`

### 4. 啟動應用程式

\`\`\`bash
# 啟動後端 (在根目錄)
npm start

# 啟動前端 (在 frontend 目錄)
cd frontend
npm start
\`\`\`

應用程式將在以下地址運行：
- 後端 API：http://localhost:3000
- 前端介面：http://localhost:3001

## 🔧 API 端點

### POST /api/generate-and-publish
生成並發布內容到選定的平台

**請求範例：**
\`\`\`json
{
  "content": "分享3個提升效率的方法",
  "platforms": ["instagram", "youtube"],
  "enhance": true
}
\`\`\`

### GET /api/generate-and-publish/platforms
獲取支援的平台資訊

### GET /api/generate-and-publish/health
API 健康檢查

## 📱 支援平台

| 平台 | 格式 | 時長 | 說明限制 |
|------|------|------|----------|
| Instagram Reels | 9:16 | 30秒 | 2200字 |
| YouTube Shorts | 16:9 | 60秒 | 5000字 |

## 🔒 安全說明

- 所有 API 金鑰都存儲在環境變數中
- \`.env\` 檔案已加入 \`.gitignore\`，不會被提交到版本控制
- 建議在生產環境中使用 HTTPS
- 定期輪換 API 金鑰

## 📄 授權

MIT License - 詳見 [LICENSE](LICENSE) 檔案

## 🤝 貢獻指南

歡迎提交 Pull Request 或回報 Issues！

1. Fork 本專案
2. 建立功能分支 (\`git checkout -b feature/AmazingFeature\`)
3. 提交更改 (\`git commit -m 'Add some AmazingFeature'\`)
4. 推送到分支 (\`git push origin feature/AmazingFeature\`)
5. 開啟 Pull Request

## 📞 支援

如有問題，請開啟 [Issue](https://github.com/your-username/ai-video-automation/issues)。
