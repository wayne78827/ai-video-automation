import fetch from 'node-fetch';

const INSTAGRAM_CONFIG = {
  businessAccountId: process.env.IG_BUSINESS_ID,
  accessToken: process.env.INSTAGRAM_ACCESS_TOKEN,
  apiVersion: 'v18.0',
  baseUrl: 'https://graph.instagram.com'
};

/**
 * 發布 Reels 到 Instagram (雙階段流程)
 * @param {string} videoUrl - 影片 URL
 * @param {string} caption - 貼文說明
 * @returns {Promise<Object>} 發布結果
 */
export async function publishToInstagram(videoUrl, caption) {
  try {
    // 階段1: 建立媒體容器
    const containerResponse = await fetch(
      `${INSTAGRAM_CONFIG.baseUrl}/v${INSTAGRAM_CONFIG.apiVersion}/${INSTAGRAM_CONFIG.businessAccountId}/media`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          media_type: 'REELS',
          video_url: videoUrl,
          caption: caption.substring(0, 2200), // Instagram 限制
          share_to_feed: true,
          thumb_offset: 2000, // 縮圖位置（毫秒）
          access_token: INSTAGRAM_CONFIG.accessToken
        })
      }
    );

    if (!containerResponse.ok) {
      const errorData = await containerResponse.json();
      throw new Error(`建立媒體容器失敗: ${errorData.error?.message || '未知錯誤'}`);
    }

    const containerData = await containerResponse.json();
    const containerId = containerData.id;

    console.log(`媒體容器已建立: ${containerId}`);

    // 階段2: 等待影片處理完成
    let processingComplete = false;
    let attempts = 0;
    const maxAttempts = 20; // 最多檢查20次

    while (!processingComplete && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // 等待5秒

      // 檢查容器狀態
      const statusResponse = await fetch(
        `${INSTAGRAM_CONFIG.baseUrl}/v${INSTAGRAM_CONFIG.apiVersion}/${containerId}?fields=status_code&access_token=${INSTAGRAM_CONFIG.accessToken}`
      );

      const statusData = await statusResponse.json();
      
      if (statusData.status_code === 'FINISHED') {
        processingComplete = true;
      } else if (statusData.status_code === 'ERROR') {
        throw new Error('影片處理失敗');
      }

      attempts++;
    }

    if (!processingComplete) {
      throw new Error('影片處理超時');
    }

    // 階段3: 發布媒體
    const publishResponse = await fetch(
      `${INSTAGRAM_CONFIG.baseUrl}/v${INSTAGRAM_CONFIG.apiVersion}/${INSTAGRAM_CONFIG.businessAccountId}/media_publish`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          creation_id: containerId,
          access_token: INSTAGRAM_CONFIG.accessToken
        })
      }
    );

    if (!publishResponse.ok) {
      const errorData = await publishResponse.json();
      throw new Error(`發布失敗: ${errorData.error?.message || '未知錯誤'}`);
    }

    const publishData = await publishResponse.json();

    return {
      success: true,
      platform: 'instagram',
      media_id: publishData.id,
      container_id: containerId,
      published_at: new Date().toISOString(),
      url: `https://www.instagram.com/p/${publishData.id}/`
    };

  } catch (error) {
    console.error('Instagram 發布錯誤:', error);
    return {
      success: false,
      platform: 'instagram',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * 獲取 Instagram 帳號資訊
 * @returns {Promise<Object>} 帳號資訊
 */
export async function getInstagramAccountInfo() {
  try {
    const response = await fetch(
      `${INSTAGRAM_CONFIG.baseUrl}/v${INSTAGRAM_CONFIG.apiVersion}/${INSTAGRAM_CONFIG.businessAccountId}?fields=account_type,username,name,profile_picture_url&access_token=${INSTAGRAM_CONFIG.accessToken}`
    );

    return response.json();
  } catch (error) {
    console.error('獲取 Instagram 帳號資訊錯誤:', error);
    throw error;
  }
}
