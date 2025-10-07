import express from 'express';
import { enhanceContentForPlatform } from '../services/perplexity.js';
import { generateVideo } from '../services/runway.js';
import { publishToInstagram } from '../services/instagram-publisher.js';
import { publishToYouTube } from '../services/youtube-publisher.js';

const router = express.Router();

/**
 * 主要處理端點：生成並發布內容
 */
router.post('/', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { content, platforms = [], enhance = true } = req.body;

    // 輸入驗證
    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: '請提供內容文字'
      });
    }

    if (!platforms.length) {
      return res.status(400).json({
        success: false,
        error: '請至少選擇一個發布平台'
      });
    }

    const results = {};
    const errors = [];

    // 為每個平台處理內容
    for (const platform of platforms) {
      try {
        console.log(`開始處理 ${platform} 平台...`);

        // 1. 使用 Perplexity Pro 優化內容
        let processedContent = content;
        if (enhance) {
          console.log(`使用 Perplexity Pro 優化 ${platform} 內容...`);
          processedContent = await enhanceContentForPlatform(content, platform);
        }

        // 2. 使用 Runway ML 生成影片
        console.log(`使用 Runway ML 生成 ${platform} 影片...`);
        const videoOptions = {
          duration: platform === 'instagram' ? 30 : 60,
          format: platform === 'instagram' ? '9:16' : '16:9',
          platform: platform
        };
        
        const videoResult = await generateVideo(processedContent, videoOptions);

        // 3. 發布到對應平台
        console.log(`發布到 ${platform}...`);
        let publishResult;

        if (platform === 'instagram') {
          publishResult = await publishToInstagram(
            videoResult.video_url,
            processedContent.substring(0, 2200)
          );
        } else if (platform === 'youtube') {
          // 注意：需要預先設定好的 OAuth2 客戶端
          publishResult = await publishToYouTube(
            videoResult.video_url,
            processedContent.substring(0, 100),
            processedContent,
            req.oauth2Client // 假設已通過中間件設定
          );
        }

        results[platform] = {
          enhanced_content: processedContent,
          video: videoResult,
          publish: publishResult,
          processing_time: Date.now() - startTime
        };

      } catch (platformError) {
        console.error(`${platform} 處理錯誤:`, platformError);
        errors.push({
          platform,
          error: platformError.message,
          timestamp: new Date().toISOString()
        });
      }
    }

    // 回應結果
    const totalTime = Date.now() - startTime;
    res.json({
      success: errors.length === 0,
      results,
      errors: errors.length > 0 ? errors : undefined,
      processing_time: `${totalTime}ms`,
      processed_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('處理請求時發生錯誤:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      processing_time: `${Date.now() - startTime}ms`,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * 獲取支援的平台列表
 */
router.get('/platforms', (req, res) => {
  res.json({
    platforms: [
      {
        id: 'instagram',
        name: 'Instagram Reels',
        max_duration: 30,
        aspect_ratio: '9:16',
        caption_limit: 2200
      },
      {
        id: 'youtube',
        name: 'YouTube Shorts',
        max_duration: 60,
        aspect_ratio: '16:9',
        title_limit: 100,
        description_limit: 5000
      }
    ]
  });
});

/**
 * 健康檢查端點
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    services: {
      perplexity: !!process.env.PERPLEXITY_API_KEY,
      runway: !!process.env.RUNWAY_API_KEY,
      instagram: !!process.env.INSTAGRAM_ACCESS_TOKEN,
      youtube: !!process.env.GOOGLE_CLIENT_ID
    },
    timestamp: new Date().toISOString()
  });
});

export default router;
