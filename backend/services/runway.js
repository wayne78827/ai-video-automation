import fetch from 'node-fetch';

const RUNWAY_API_KEY = process.env.RUNWAY_API_KEY;
const RUNWAY_BASE_URL = 'https://api.runwayml.com/v1';

/**
 * 使用 Runway Gen-3 生成影片
 * @param {string} script - 影片腳本
 * @param {Object} options - 生成選項
 * @returns {Promise<Object>} 影片資料
 */
export async function generateVideo(script, options = {}) {
  const {
    duration = 30,
    format = '9:16',
    style = 'cinematic',
    platform = 'instagram'
  } = options;

  // 根據平台調整參數
  const platformConfig = {
    instagram: {
      duration: Math.min(duration, 30),
      aspect_ratio: '9:16',
      style: 'dynamic'
    },
    youtube: {
      duration: Math.min(duration, 60),
      aspect_ratio: '16:9',
      style: 'professional'
    }
  };

  const config = platformConfig[platform] || platformConfig.instagram;

  try {
    // 步驟1: 建立影片生成任務
    const createResponse = await fetch(`${RUNWAY_BASE_URL}/gen3/text-to-video`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RUNWAY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        input: {
          prompt: script,
          style: config.style
        },
        config: {
          duration: config.duration,
          aspect_ratio: config.aspect_ratio,
          motion_level: 'medium',
          quality: 'high'
        }
      })
    });

    if (!createResponse.ok) {
      throw new Error(`Runway API 錯誤: ${createResponse.status}`);
    }

    const createData = await createResponse.json();
    const taskId = createData.id;

    // 步驟2: 輪詢檢查生成狀態
    let attempts = 0;
    const maxAttempts = 60; // 最多等待10分鐘
    
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 10000)); // 等待10秒

      const statusResponse = await fetch(`${RUNWAY_BASE_URL}/tasks/${taskId}`, {
        headers: {
          'Authorization': `Bearer ${RUNWAY_API_KEY}`
        }
      });

      const statusData = await statusResponse.json();

      if (statusData.status === 'completed') {
        return {
          id: taskId,
          status: 'completed',
          video_url: statusData.output.video_url,
          thumbnail_url: statusData.output.thumbnail_url,
          duration: statusData.output.duration,
          metadata: {
            platform: platform,
            aspect_ratio: config.aspect_ratio,
            created_at: new Date().toISOString()
          }
        };
      }

      if (statusData.status === 'failed') {
        throw new Error(`影片生成失敗: ${statusData.error}`);
      }

      attempts++;
    }

    throw new Error('影片生成超時');

  } catch (error) {
    console.error('Runway ML 影片生成錯誤:', error);
    throw new Error(`影片生成失敗: ${error.message}`);
  }
}

/**
 * 獲取任務狀態
 * @param {string} taskId - 任務ID
 * @returns {Promise<Object>} 任務狀態
 */
export async function getTaskStatus(taskId) {
  try {
    const response = await fetch(`${RUNWAY_BASE_URL}/tasks/${taskId}`, {
      headers: {
        'Authorization': `Bearer ${RUNWAY_API_KEY}`
      }
    });

    return response.json();
  } catch (error) {
    console.error('獲取任務狀態錯誤:', error);
    throw error;
  }
}
