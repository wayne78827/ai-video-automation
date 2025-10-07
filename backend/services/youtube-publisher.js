import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

const YOUTUBE_CONFIG = {
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:8080/oauth2callback'
};

/**
 * 建立 OAuth2 客戶端
 * @returns {Object} OAuth2 客戶端
 */
function createOAuth2Client() {
  const { OAuth2 } = google.auth;
  return new OAuth2(
    YOUTUBE_CONFIG.clientId,
    YOUTUBE_CONFIG.clientSecret,
    YOUTUBE_CONFIG.redirectUri
  );
}

/**
 * 上傳影片到 YouTube
 * @param {string} videoPath - 影片檔案路徑或URL
 * @param {string} title - 影片標題
 * @param {string} description - 影片描述
 * @param {Object} oauth2Client - 已認證的 OAuth2 客戶端
 * @returns {Promise<Object>} 上傳結果
 */
export async function publishToYouTube(videoPath, title, description, oauth2Client) {
  try {
    const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

    // 如果是URL，先下載影片
    let videoStream;
    if (videoPath.startsWith('http')) {
      const response = await fetch(videoPath);
      videoStream = response.body;
    } else {
      videoStream = fs.createReadStream(videoPath);
    }

    const requestParameters = {
      part: 'snippet,status',
      requestBody: {
        snippet: {
          title: title.substring(0, 100), // YouTube 標題限制
          description: description.substring(0, 5000), // YouTube 描述限制
          categoryId: '22', // People & Blogs
          defaultLanguage: 'zh-TW',
          tags: extractTagsFromDescription(description)
        },
        status: {
          privacyStatus: 'public', // public, private, unlisted
          madeForKids: false,
          selfDeclaredMadeForKids: false
        }
      },
      media: {
        body: videoStream
      }
    };

    const response = await youtube.videos.insert(requestParameters);

    return {
      success: true,
      platform: 'youtube',
      video_id: response.data.id,
      title: response.data.snippet.title,
      description: response.data.snippet.description,
      published_at: response.data.snippet.publishedAt,
      url: `https://www.youtube.com/watch?v=${response.data.id}`,
      thumbnail_url: response.data.snippet.thumbnails?.default?.url
    };

  } catch (error) {
    console.error('YouTube 上傳錯誤:', error);
    return {
      success: false,
      platform: 'youtube',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * 從描述中提取標籤
 * @param {string} description - 描述文字
 * @returns {Array<string>} 標籤陣列
 */
function extractTagsFromDescription(description) {
  const commonTags = ['AI', 'automation', 'shorts', 'tutorial'];
  const extractedTags = [];

  // 簡單的關鍵字提取邏輯
  if (description.includes('教學') || description.includes('tutorial')) {
    extractedTags.push('教學', 'tutorial');
  }
  if (description.includes('自動化') || description.includes('automation')) {
    extractedTags.push('自動化', 'automation');
  }

  return [...new Set([...commonTags, ...extractedTags])].slice(0, 10);
}

/**
 * 獲取 OAuth2 授權 URL
 * @returns {string} 授權 URL
 */
export function getAuthUrl() {
  const oauth2Client = createOAuth2Client();
  const scopes = [
    'https://www.googleapis.com/auth/youtube.upload',
    'https://www.googleapis.com/auth/youtube'
  ];

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent'
  });
}

/**
 * 使用授權碼獲取存取權杖
 * @param {string} code - 授權碼
 * @returns {Promise<Object>} OAuth2 客戶端
 */
export async function getAccessToken(code) {
  const oauth2Client = createOAuth2Client();
  const { tokens } = await oauth2Client.getAccessToken(code);
  oauth2Client.setCredentials(tokens);
  return oauth2Client;
}
