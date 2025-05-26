const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  // Initialize Socket.IO server
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  // Store connected users
  const connectedUsers = new Map();

  io.on('connection', (socket) => {
    console.log(`🔌 User connected: ${socket.id}`);

    // Handle user authentication
    socket.on('authenticate', (data) => {
      const { token, userId } = data;
      // TODO: Validate token properly
      
      if (userId) {
        connectedUsers.set(socket.id, { userId, socket });
        socket.userId = userId;
        console.log(`✅ User authenticated: ${userId}`);
        
        socket.emit('authenticated', { status: 'success', userId });
      }
    });

    // 🚀 FACEBOOK-STYLE: Handle new post broadcasts (from user to others)
    socket.on('broadcast_new_post', async (data) => {
      try {
        const { post, action } = data;
        console.log(`📡 Broadcasting new post to other users: ${post.id}`);

        // Broadcast ONLY to other users (not the creator)
        socket.broadcast.emit('new_post', {
          post,
          action: action || 'prepend'
        });

        console.log(`🎊 Broadcasted post ${post.id} to ${connectedUsers.size - 1} other users`);

      } catch (error) {
        console.error('❌ New post broadcast failed:', error);
      }
    });

    // Handle legacy new post creation (backward compatibility)
    socket.on('new_post_created', async (data) => {
      try {
        const { post } = data;
        console.log(`📝 Legacy new post created: ${post.id}`);

        // Broadcast to all connected users (Facebook-style)
        socket.broadcast.emit('new_post', {
          post,
          action: 'prepend'
        });

      } catch (error) {
        console.error('Legacy new post broadcast failed:', error);
      }
    });

    // Handle real-time interactions
    socket.on('post_liked', (data) => {
      console.log(`❤️ Post liked: ${data.postId} by user ${socket.userId}`);
      
      // Broadcast like update to all users
      io.emit('post_liked', {
        postId: data.postId,
        likeCount: data.likeCount,
        userId: socket.userId
      });
    });

    socket.on('post_commented', (data) => {
      console.log(`💬 Post commented: ${data.postId} by user ${socket.userId}`);
      
      // Broadcast comment update to all users
      io.emit('post_commented', {
        postId: data.postId,
        comment: data.comment,
        userId: socket.userId
      });
    });

    socket.on('post_saved', (data) => {
      console.log(`💾 Post saved: ${data.postId} by user ${socket.userId}`);
      
      // Notify the user who saved the post
      socket.emit('post_saved_confirmed', {
        postId: data.postId,
        saved: data.saved
      });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`🔌 User disconnected: ${socket.id}`);
      connectedUsers.delete(socket.id);
    });
  });

  // Make io available globally for API routes
  global.io = io;

  server
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`🚀 Server ready on http://${hostname}:${port}`);
      console.log(`🔌 WebSocket server ready for real-time updates`);
    });
}); 