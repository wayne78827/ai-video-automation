import fetch from 'node-fetch';

const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;
const PERPLEXITY_URL = 'https://api.perplexity.ai/chat/completions';

/**
 * 針對不同平台優化內容
 * @param {string} originalText - 原始文字內容
 * @param {string} platform - 目標平台 (instagram/youtube)
 * @returns {Promise<string>} 優化後的腳本
 */
export async function enhanceContentForPlatform(originalText, platform) {
  const systemPrompts = {
    instagram: `你是一位專業的 Instagram Reels 內容創作專家。請將以下文字轉換為：
1. 吸睛的開場（3-5秒）
2. 核心內容要點（20-25秒）  
3. 強力結尾與 CTA（2-3秒）
4. 加入視覺描述和轉場提示
5. 適合直式影片 (9:16) 格式
6. 總長度控制在30秒內`,

    youtube: `你是一位 YouTube Shorts 內容策略專家。請將以下文字擴展為：
1. 引人入勝的開場鉤子（5-8秒）
2. 詳細的內容說明與範例（40-45秒）
3. 明確的行動呼籲（5-7秒）
4. 包含關鍵字和 SEO 友好描述
5. 適合 YouTube 演算法推薦
6. 總長度60秒內`
  };

  if (!systemPrompts[platform]) {
    throw new Error(`不支援的平台: ${platform}`);
  }

  try {
    const response = await fetch(PERPLEXITY_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
        'User-Agent': 'AI-Video-Automation/1.0'
      },
      body: JSON.stringify({
        model: 'sonar-pro',
        messages: [
          {
            role: 'system',
            content: systemPrompts[platform]
          },
          {
            role: 'user',
            content: originalText
          }
        ],
        max_tokens: 1000,
        temperature: 0.8,
        top_p: 0.9
      })
    });

    if (!response.ok) {
      throw new Error(`Perplexity API 錯誤: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;

  } catch (error) {
    console.error('Perplexity Pro 內容增強錯誤:', error);
    throw new Error(`內容增強失敗: ${error.message}`);
  }
}

/**
 * 生成多平台內容建議
 * @param {string} topic - 主題
 * @returns {Promise<Object>} 平台建議
 */
export async function generateTopicSuggestions(topic) {
  const prompt = `基於主題「${topic}」，提供以下平台的內容策略：
1. Instagram Reels 創意角度
2. YouTube Shorts 內容方向  
3. 熱門標籤建議
4. 最佳發布時機`;

  try {
    const response = await fetch(PERPLEXITY_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'sonar-pro',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 800,
        temperature: 0.7
      })
    });

    const data = await response.json();
    return data.choices[0].message.content;

  } catch (error) {
    console.error('主題建議生成錯誤:', error);
    return null;
  }
}
