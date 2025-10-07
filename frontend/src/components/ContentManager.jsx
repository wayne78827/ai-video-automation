import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

export default function ContentManager() {
  const [content, setContent] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState(['instagram', 'youtube']);
  const [status, setStatus] = useState('idle');
  const [results, setResults] = useState(null);
  const [errors, setErrors] = useState(null);
  const [availablePlatforms, setAvailablePlatforms] = useState([]);

  // 載入可用平台
  useEffect(() => {
    const loadPlatforms = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/generate-and-publish/platforms`);
        setAvailablePlatforms(response.data.platforms);
      } catch (error) {
        console.error('載入平台清單失敗:', error);
      }
    };

    loadPlatforms();
  }, []);

  // 處理平台選擇
  const handlePlatformChange = (platformId, checked) => {
    if (checked) {
      setSelectedPlatforms([...selectedPlatforms, platformId]);
    } else {
      setSelectedPlatforms(selectedPlatforms.filter(p => p !== platformId));
    }
  };

  // 生成並發布內容
  const generateAndPublish = async () => {
    if (!content.trim()) {
      alert('請輸入內容文字');
      return;
    }

    if (selectedPlatforms.length === 0) {
      alert('請至少選擇一個平台');
      return;
    }

    setStatus('processing');
    setResults(null);
    setErrors(null);

    try {
      const response = await axios.post(`${API_BASE_URL}/generate-and-publish`, {
        content: content,
        platforms: selectedPlatforms,
        enhance: true
      });

      setResults(response.data.results);
      if (response.data.errors && response.data.errors.length > 0) {
        setErrors(response.data.errors);
      }
      setStatus('completed');

    } catch (error) {
      console.error('處理失敗:', error);
      setErrors([{
        platform: 'system',
        error: error.response?.data?.error || error.message,
        timestamp: new Date().toISOString()
      }]);
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* 標題 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            AI 內容自動發布系統
          </h1>
          <p className="text-gray-600">
            將文字轉換為影片並自動發布到 Instagram 和 YouTube
          </p>
        </div>

        {/* 主要表單 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          {/* 內容輸入 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              內容腳本 *
            </label>
            <textarea
              className="w-full h-40 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="輸入您想要轉換成影片的文字內容...&#10;&#10;範例：&#10;今天分享3個提升工作效率的小技巧：&#10;1. 使用番茄工作法管理時間&#10;2. 建立每日待辦清單&#10;3. 定期整理工作環境"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={status === 'processing'}
            />
            <div className="text-sm text-gray-500 mt-1">
              建議：150-300字，描述清晰且有吸引力的內容效果更好
            </div>
          </div>

          {/* 平台選擇 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              發布平台 *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availablePlatforms.map(platform => (
                <div key={platform.id} 
                     className={`p-4 border rounded-lg cursor-pointer transition-all ${
                       selectedPlatforms.includes(platform.id) 
                         ? 'border-blue-500 bg-blue-50' 
                         : 'border-gray-300 hover:border-gray-400'
                     }`}
                     onClick={() => handlePlatformChange(platform.id, !selectedPlatforms.includes(platform.id))}>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedPlatforms.includes(platform.id)}
                      onChange={(e) => handlePlatformChange(platform.id, e.target.checked)}
                      className="mr-3"
                      disabled={status === 'processing'}
                    />
                    <div>
                      <div className="font-medium text-gray-900">{platform.name}</div>
                      <div className="text-sm text-gray-500">
                        最長 {platform.max_duration} 秒 • {platform.aspect_ratio}
                      </div>
                    </div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* 生成按鈕 */}
          <button
            onClick={generateAndPublish}
            disabled={status === 'processing' || !content.trim() || selectedPlatforms.length === 0}
            className={`w-full py-4 px-6 rounded-lg font-medium text-white transition-all ${
              status === 'processing'
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
            }`}
          >
            {status === 'processing' ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                處理中...（可能需要 2-5 分鐘）
              </div>
            ) : (
              '🚀 生成並發布影片'
            )}
          </button>
        </div>

        {/* 處理結果 */}
        {status === 'completed' && results && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">📋 處理結果</h2>
            
            {Object.entries(results).map(([platform, result]) => (
              <div key={platform} className="mb-6 p-4 border border-gray-200 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2 capitalize">
                  {platform === 'instagram' ? 'Instagram Reels' : 'YouTube Shorts'}
                </h3>
                
                {result.publish?.success ? (
                  <div className="text-green-600 mb-2">
                    ✅ 發布成功！
                    <a href={result.publish.url} target="_blank" rel="noopener noreferrer" 
                       className="ml-2 text-blue-600 underline">
                      查看內容
                    </a>
                  </div>
                ) : (
                  <div className="text-red-600 mb-2">
                    ❌ 發布失敗：{result.publish?.error || '未知錯誤'}
                  </div>
                )}

                <div className="text-sm text-gray-600">
                  處理時間：{result.processing_time}
                </div>

                {/* 顯示優化後的內容（前100字） */}
                <details className="mt-2">
                  <summary className="text-sm text-blue-600 cursor-pointer">
                    查看優化後的腳本
                  </summary>
                  <div className="mt-2 p-3 bg-gray-50 rounded text-sm">
                    {result.enhanced_content?.substring(0, 200)}...
                  </div>
                </details>
              </div>
            ))}
          </div>
        )}

        {/* 錯誤顯示 */}
        {errors && errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-red-800 mb-4">⚠️ 發生錯誤</h2>
            {errors.map((error, index) => (
              <div key={index} className="mb-2 text-red-700">
                <strong>{error.platform}:</strong> {error.error}
              </div>
            ))}
          </div>
        )}

        {/* 使用說明 */}
        <div className="bg-blue-50 rounded-lg p-6">
          <h2 className="text-lg font-medium text-blue-900 mb-3">💡 使用說明</h2>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• 輸入清晰、有趣的文字內容，AI 會自動優化並生成適合的影片腳本</li>
            <li>• Instagram Reels：30秒以內，適合快節奏的短內容</li>
            <li>• YouTube Shorts：60秒以內，適合詳細解說型內容</li>
            <li>• 處理時間通常為 2-5 分鐘，請耐心等待</li>
            <li>• 確保已正確設定各平台的 API 權限</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
