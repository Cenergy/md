const express = require('express');
const crypto = require('crypto');

const router = express.Router();

// 腾讯云语音识别配置（从环境变量读取）
const TENCENT_APP_ID = process.env.TENCENT_APP_ID || '你的AppId';
const TENCENT_SECRET_ID = process.env.TENCENT_SECRET_ID || '';
const TENCENT_SECRET_KEY = process.env.TENCENT_SECRET_KEY || '';

/**
 * 生成腾讯云实时语音识别签名 URL
 * 前端拿到这个 URL 后直接建立 WebSocket 连接
 */
router.get('/asr/sign', (req, res) => {
  const { engine_model_type = '16k_zh', voice_id } = req.query;

  if (!voice_id) {
    return res.status(400).json({ ok: false, message: 'voice_id is required' });
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const expired = timestamp + 86400; // 签名有效期 24 小时

  const params = {
    secretid: TENCENT_SECRET_ID,
    timestamp: timestamp,
    expired: expired,
    nonce: Math.floor(Math.random() * 100000),
    engine_model_type: engine_model_type,
    voice_id: voice_id,
    voice_format: 1,          // 1=PCM
    needvad: 1,               // 启用 VAD
    hotword_id: '',
    filter_dirty: 1,
    filter_modal: 1,
    filter_punc: 0,
    convert_num_mode: 1,
    word_info: 0,
  };

  // 按字典序拼接参数
  const queryString = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&');

  // 拼接签名原文
  const signStr = `asr.cloud.tencent.com/asr/v2/${TENCENT_APP_ID}?${queryString}`;

  // HMAC-SHA1 签名
  const signature = crypto
    .createHmac('sha1', TENCENT_SECRET_KEY)
    .update(signStr)
    .digest('base64');

  // 构建最终 WebSocket URL
  const wsUrl = `wss://asr.cloud.tencent.com/asr/v2/${TENCENT_APP_ID}?${queryString}&signature=${encodeURIComponent(signature)}`;

  res.json({ ok: true, url: wsUrl });
});

module.exports = router;
