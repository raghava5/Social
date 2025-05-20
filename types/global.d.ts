import { Server as SocketIOServer } from 'socket.io';

declare global {
  var io: SocketIOServer | undefined;
  
  namespace NodeJS {
    interface Global {
      io: SocketIOServer | undefined;
    }
  }
} 