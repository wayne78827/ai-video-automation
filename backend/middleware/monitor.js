/**
 * API 監控中間件
 */
export default function monitor(req, res, next) {
  const startTime = Date.now();
  const originalSend = res.send;

  // 記錄請求資訊
  console.log(`📥 ${new Date().toISOString()} ${req.method} ${req.url}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('📋 請求內容:', {
      ...req.body,
      // 隱藏敏感資訊
      content: req.body.content ? `${req.body.content.substring(0, 50)}...` : undefined
    });
  }

  // 攔截回應
  res.send = function(data) {
    const duration = Date.now() - startTime;
    const statusColor = res.statusCode >= 400 ? '🔴' : '🟢';
    
    console.log(`📤 ${statusColor} ${res.statusCode} ${req.method} ${req.url} - ${duration}ms`);
    
    // 記錄錯誤
    if (res.statusCode >= 400) {
      console.error('❌ 錯誤詳情:', {
        url: req.url,
        method: req.method,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString(),
        error: typeof data === 'string' ? data : JSON.stringify(data)
      });
    }

    // 記錄成功但耗時較長的請求
    if (duration > 30000 && res.statusCode < 400) {
      console.warn('⚠️  長時間請求:', {
        url: req.url,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString()
      });
    }

    originalSend.call(this, data);
  };

  next();
}

/**
 * 錯誤處理中間件
 */
export function errorHandler(err, req, res, next) {
  console.error('💥 未處理的錯誤:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  res.status(500).json({
    success: false,
    error: '內部伺服器錯誤',
    timestamp: new Date().toISOString(),
    requestId: Math.random().toString(36).substr(2, 9)
  });
}
