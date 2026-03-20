const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const authMiddleware = require('../middleware/auth');

const USERS_PATH = path.join(__dirname, '../db/users.json');
const CHAT_PATH = path.join(__dirname, '../db/livechat.json');

// Helpers
function readUsers() {
  try { return JSON.parse(fs.readFileSync(USERS_PATH, 'utf-8')); } catch { return []; }
}
function writeUsers(data) {
  fs.writeFileSync(USERS_PATH, JSON.stringify(data, null, 2));
}
function readChat() {
  try {
    if (!fs.existsSync(CHAT_PATH)) fs.writeFileSync(CHAT_PATH, '[]');
    return JSON.parse(fs.readFileSync(CHAT_PATH, 'utf-8'));
  } catch { return []; }
}
function writeChat(data) {
  fs.writeFileSync(CHAT_PATH, JSON.stringify(data, null, 2));
}

// SSE clients
const sseClients = new Map();

function broadcastToUser(userId, event, data) {
  sseClients.forEach((client) => {
    if (client.userId === userId) {
      try { client.res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`); } catch {}
    }
  });
}

function broadcastToAll(event, data) {
  sseClients.forEach((client) => {
    try { client.res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`); } catch {}
  });
}

// =====================
// SSE Endpoint
// =====================
router.get('/events', (req, res) => {
  res.status(200);
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();

  req.socket?.setKeepAlive?.(true, 15000);
  req.socket?.setNoDelay?.(true);

  const clientId = `lc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const userId = req.query.userId || null;

  sseClients.set(clientId, { res, userId });

  // Set user online
  if (userId) {
    const users = readUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx !== -1) {
      users[idx].live = 'true';
      writeUsers(users);
      broadcastToAll('user_status', { userId, live: 'true' });
    }
  }

  const heartbeat = setInterval(() => {
    try { res.write(':heartbeat\n\n'); } catch { clearInterval(heartbeat); }
  }, 15000);

  res.write(`event: connected\ndata: ${JSON.stringify({ clientId })}\n\n`);

  req.on('close', () => {
    clearInterval(heartbeat);
    sseClients.delete(clientId);

    // Check if user has any other connections
    if (userId) {
      let stillConnected = false;
      sseClients.forEach((c) => {
        if (c.userId === userId) stillConnected = true;
      });
      if (!stillConnected) {
        const users = readUsers();
        const idx = users.findIndex(u => u.id === userId);
        if (idx !== -1) {
          users[idx].live = 'false';
          writeUsers(users);
          broadcastToAll('user_status', { userId, live: 'false' });
        }
      }
    }
  });
});

// =====================
// Get all users (for contact list) - requires auth
// =====================
router.get('/users', authMiddleware, (req, res) => {
  try {
    const users = readUsers();
    const currentUserId = req.user.id;
    const messages = readChat();

    // Return all users except current, without passwords
    const userList = users
      .filter(u => u.id !== currentUserId)
      .map(u => {
        const { password, ...safe } = u;
        // Count unread messages FROM this user TO current user
        const unread = messages.filter(
          m => m.senderId === u.id && m.receiverId === currentUserId && !m.lu
        ).length;
        // Get last message between the two
        const convMessages = messages.filter(
          m => (m.senderId === u.id && m.receiverId === currentUserId) ||
               (m.senderId === currentUserId && m.receiverId === u.id)
        ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        return {
          ...safe,
          live: u.live || 'false',
          unreadCount: unread,
          lastMessage: convMessages[0] || null
        };
      });

    res.json(userList);
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// =====================
// Get messages between two users
// =====================
router.get('/messages/:otherUserId', authMiddleware, (req, res) => {
  try {
    const currentUserId = req.user.id;
    const { otherUserId } = req.params;
    const messages = readChat();

    const conv = messages.filter(
      m => (m.senderId === currentUserId && m.receiverId === otherUserId) ||
           (m.senderId === otherUserId && m.receiverId === currentUserId)
    ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Mark messages from other user as read
    let updated = false;
    messages.forEach(m => {
      if (m.senderId === otherUserId && m.receiverId === currentUserId && !m.lu) {
        m.lu = true;
        updated = true;
      }
    });
    if (updated) {
      writeChat(messages);
      // Notify the other user that messages were read
      broadcastToUser(otherUserId, 'messages_read', { readBy: currentUserId });
    }

    res.json(conv);
  } catch (error) {
    console.error('Error getting messages:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// =====================
// Send message
// =====================
router.post('/send', authMiddleware, (req, res) => {
  try {
    const { receiverId, contenu } = req.body;
    const senderId = req.user.id;

    if (!receiverId || !contenu?.trim()) {
      return res.status(400).json({ message: 'receiverId et contenu requis' });
    }

    // Get sender info
    const users = readUsers();
    const sender = users.find(u => u.id === senderId);
    const receiver = users.find(u => u.id === receiverId);
    if (!sender || !receiver) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    const messages = readChat();
    const newMsg = {
      id: `lc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      senderId,
      senderNom: `${sender.firstName} ${sender.lastName}`,
      senderRole: sender.role || '',
      receiverId,
      receiverNom: `${receiver.firstName} ${receiver.lastName}`,
      receiverRole: receiver.role || '',
      contenu: contenu.trim(),
      date: new Date().toISOString(),
      lu: false
    };

    messages.push(newMsg);
    writeChat(messages);

    // Broadcast to both users
    broadcastToUser(senderId, 'new_livechat_message', newMsg);
    broadcastToUser(receiverId, 'new_livechat_message', newMsg);

    // Send unread notification to receiver
    const unreadCount = messages.filter(m => m.receiverId === receiverId && !m.lu).length;
    broadcastToUser(receiverId, 'unread_update', { totalUnread: unreadCount });

    res.status(201).json(newMsg);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// =====================
// Edit message
// =====================
router.put('/edit/:messageId', authMiddleware, (req, res) => {
  try {
    const { messageId } = req.params;
    const { contenu } = req.body;
    const userId = req.user.id;

    if (!contenu?.trim()) return res.status(400).json({ message: 'Contenu requis' });

    const messages = readChat();
    const idx = messages.findIndex(m => m.id === messageId);
    if (idx === -1) return res.status(404).json({ message: 'Message non trouvé' });
    if (messages[idx].senderId !== userId) return res.status(403).json({ message: 'Non autorisé' });

    messages[idx].contenu = contenu.trim();
    messages[idx].edited = true;
    messages[idx].editedAt = new Date().toISOString();
    writeChat(messages);

    broadcastToUser(messages[idx].senderId, 'livechat_message_edited', messages[idx]);
    broadcastToUser(messages[idx].receiverId, 'livechat_message_edited', messages[idx]);

    res.json(messages[idx]);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// =====================
// Delete message
// =====================
router.delete('/delete/:messageId', authMiddleware, (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    const messages = readChat();
    const idx = messages.findIndex(m => m.id === messageId);
    if (idx === -1) return res.status(404).json({ message: 'Message non trouvé' });
    if (messages[idx].senderId !== userId) return res.status(403).json({ message: 'Non autorisé' });

    messages[idx].contenu = '';
    messages[idx].deleted = true;
    messages[idx].deletedAt = new Date().toISOString();
    writeChat(messages);

    broadcastToUser(messages[idx].senderId, 'livechat_message_deleted', messages[idx]);
    broadcastToUser(messages[idx].receiverId, 'livechat_message_deleted', messages[idx]);

    res.json(messages[idx]);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// =====================
// Typing indicator
// =====================
router.post('/typing', authMiddleware, (req, res) => {
  const { receiverId, isTyping } = req.body;
  const senderId = req.user.id;
  broadcastToUser(receiverId, 'livechat_typing', { senderId, isTyping });
  res.json({ ok: true });
});

// =====================
// Total unread for current user
// =====================
router.get('/unread', authMiddleware, (req, res) => {
  try {
    const messages = readChat();
    const count = messages.filter(m => m.receiverId === req.user.id && !m.lu).length;
    res.json({ count });
  } catch { res.json({ count: 0 }); }
});

// =====================
// Set user online/offline manually
// =====================
router.post('/status', authMiddleware, (req, res) => {
  try {
    const { live } = req.body;
    const userId = req.user.id;
    const users = readUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx !== -1) {
      users[idx].live = live ? 'true' : 'false';
      writeUsers(users);
      broadcastToAll('user_status', { userId, live: users[idx].live });
    }
    res.json({ ok: true });
  } catch { res.status(500).json({ message: 'Erreur' }); }
});

module.exports = router;
