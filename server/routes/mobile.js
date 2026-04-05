const express = require('express');
const QRCode = require('qrcode');

const router = express.Router();

const config = {
  maxMobileConnections: 1,
};

const sessions = new Map();
const sseClients = new Map();

router.get('/qrcode', async (req, res) => {
  const sessionId = 'test-session-001';
  const host = req.get('host');
  const protocol = req.protocol;
  const mobileUrl = `${protocol}://${host}/#/mobile/${sessionId}`;
  
  try {
    const qrDataUrl = await QRCode.toDataURL(mobileUrl, {
      width: 200,
      margin: 2,
    });
    
    sessions.set(sessionId, {
      createdAt: Date.now(),
      connected: false,
      mobileConnections: 0,
    });
    
    setTimeout(() => {
      if (sessions.has(sessionId) && !sessions.get(sessionId).connected) {
        sessions.delete(sessionId);
        sseClients.delete(sessionId);
      }
    }, 5 * 60 * 1000);
    
    res.json({
      ok: true,
      sessionId,
      qrDataUrl,
      mobileUrl,
    });
  } catch (err) {
    res.status(500).json({ ok: false, message: 'Failed to generate QR code' });
  }
});

router.get('/sse/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, {
      createdAt: Date.now(),
      connected: false,
      mobileConnections: 0,
    });
  }
  
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();
  
  sseClients.set(sessionId, res);
  
  res.write(`data: ${JSON.stringify({ type: 'connected' })}\n\n`);
  
  req.on('close', () => {
    sseClients.delete(sessionId);
  });
});

router.post('/connect/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, {
      createdAt: Date.now(),
      connected: true,
      mobileConnections: 1,
    });
  } else {
    const session = sessions.get(sessionId);
    
    if (config.maxMobileConnections > 0 && session.mobileConnections >= config.maxMobileConnections) {
      return res.status(403).json({ 
        ok: false, 
        message: '已有移动端连接，请稍后再试' 
      });
    }
    
    session.connected = true;
    session.mobileConnections = (session.mobileConnections || 0) + 1;
  }
  
  const sseClient = sseClients.get(sessionId);
  if (sseClient) {
    sseClient.write(`data: ${JSON.stringify({ type: 'mobile_connected' })}\n\n`);
  }
  
  res.json({ ok: true, message: 'Connected successfully' });
});

router.post('/disconnect/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  
  if (sessions.has(sessionId)) {
    const session = sessions.get(sessionId);
    session.mobileConnections = Math.max(0, (session.mobileConnections || 0) - 1);
  }
  
  res.json({ ok: true, message: 'Disconnected successfully' });
});

router.post('/message/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const { message } = req.body;
  
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ ok: false, message: 'Message is required' });
  }
  
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, {
      createdAt: Date.now(),
      connected: true,
      mobileConnections: 1,
    });
  }
  
  const sseClient = sseClients.get(sessionId);
  if (sseClient) {
    sseClient.write(`data: ${JSON.stringify({ type: 'message', content: message })}\n\n`);
    res.json({ ok: true, message: 'Message sent' });
  } else {
    res.status(404).json({ ok: false, message: 'No active SSE connection' });
  }
});

router.get('/status/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  
  if (!sessions.has(sessionId)) {
    return res.json({ ok: true, exists: false });
  }
  
  const session = sessions.get(sessionId);
  res.json({ 
    ok: true, 
    exists: true, 
    connected: session.connected,
    mobileConnections: session.mobileConnections || 0,
  });
});

module.exports = router;
