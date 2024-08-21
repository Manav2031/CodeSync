import express, { Response, Request } from "express";
import dotenv from "dotenv";
import http from "http";
import cors from "cors";
import { SocketEvent, SocketId } from "./types/socket";
import { USER_CONNECTION_STATUS, User } from "./types/user";
import { Server } from "socket.io";
import path from "path";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, "public"))); // Serve static files

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins, customize as needed
  },
  maxHttpBufferSize: 1e8,
  pingTimeout: 60000,
});

let userSocketMap: User[] = [];

// Function to get all users in a room
function getUsersInRoom(roomId: string): User[] {
  return userSocketMap.filter((user) => user.roomId === roomId);
}

// Function to get room id by socket id
function getRoomId(socketId: SocketId): string | null {
  const user = userSocketMap.find((user) => user.socketId === socketId);
  if (!user) {
    console.error("Room ID is undefined for socket ID:", socketId);
    return null;
  }
  return user.roomId;
}

// Function to get user by socket id
function getUserBySocketId(socketId: SocketId): User | null {
  const user = userSocketMap.find((user) => user.socketId === socketId);
  if (!user) {
    console.error("User not found for socket ID:", socketId);
    return null;
  }
  return user;
}

io.on("connection", (socket) => {
  // Handle user joining a room
  socket.on(SocketEvent.JOIN_REQUEST, ({ roomId, username }) => {
    const isUsernameExist = getUsersInRoom(roomId).some(
      (user) => user.username === username
    );

    if (isUsernameExist) {
      io.to(socket.id).emit(SocketEvent.USERNAME_EXISTS);
      return;
    }

    const newUser: User = {
      username,
      roomId,
      status: USER_CONNECTION_STATUS.ONLINE,
      cursorPosition: 0,
      typing: false,
      socketId: socket.id,
      currentFile: null,
    };

    userSocketMap.push(newUser);
    socket.join(roomId);

    // Notify room about the new user
    socket.broadcast.to(roomId).emit(SocketEvent.USER_JOINED, { user: newUser });

    // Send updated user list to the newly joined user
    const users = getUsersInRoom(roomId);
    io.to(socket.id).emit(SocketEvent.JOIN_ACCEPTED, { user: newUser, users });
  });

  socket.on("disconnecting", () => {
    const user = getUserBySocketId(socket.id);
    if (!user) return;

    const roomId = user.roomId;

    // Notify others in the room that the user has disconnected
    socket.broadcast.to(roomId).emit(SocketEvent.USER_DISCONNECTED, { user });

    // Remove the user from the userSocketMap
    userSocketMap = userSocketMap.filter((u) => u.socketId !== socket.id);

    socket.leave(roomId);
  });

  // WebRTC signaling events
  socket.on(SocketEvent.SIGNAL_ICE_CANDIDATE, ({ candidate, roomId }) => {
    socket.broadcast.to(roomId).emit(SocketEvent.SIGNAL_ICE_CANDIDATE, {
      candidate,
      socketId: socket.id,
    });
  });

  socket.on(SocketEvent.SIGNAL_OFFER, ({ offer, roomId }) => {
    socket.broadcast.to(roomId).emit(SocketEvent.SIGNAL_OFFER, {
      offer,
      socketId: socket.id,
    });
  });

  socket.on(SocketEvent.SIGNAL_ANSWER, ({ answer, roomId }) => {
    socket.broadcast.to(roomId).emit(SocketEvent.SIGNAL_ANSWER, {
      answer,
      socketId: socket.id,
    });
  });

  // Sync file structure (additional features)
  socket.on(SocketEvent.SYNC_FILE_STRUCTURE, ({ fileStructure, openFiles, activeFile }) => {
    io.to(socket.id).emit(SocketEvent.SYNC_FILE_STRUCTURE, { fileStructure, openFiles, activeFile });
  });

  // Directory and file operations
  socket.on(SocketEvent.DIRECTORY_CREATED, ({ parentDirId, newDirectory }) => {
    const roomId = getRoomId(socket.id);
    if (!roomId) return;
    socket.broadcast.to(roomId).emit(SocketEvent.DIRECTORY_CREATED, { parentDirId, newDirectory });
  });

  socket.on(SocketEvent.DIRECTORY_UPDATED, ({ dirId, children }) => {
    const roomId = getRoomId(socket.id);
    if (!roomId) return;
    socket.broadcast.to(roomId).emit(SocketEvent.DIRECTORY_UPDATED, { dirId, children });
  });

  socket.on(SocketEvent.DIRECTORY_RENAMED, ({ dirId, newName }) => {
    const roomId = getRoomId(socket.id);
    if (!roomId) return;
    socket.broadcast.to(roomId).emit(SocketEvent.DIRECTORY_RENAMED, { dirId, newName });
  });

  socket.on(SocketEvent.DIRECTORY_DELETED, ({ dirId }) => {
    const roomId = getRoomId(socket.id);
    if (!roomId) return;
    socket.broadcast.to(roomId).emit(SocketEvent.DIRECTORY_DELETED, { dirId });
  });

  socket.on(SocketEvent.FILE_CREATED, ({ parentDirId, newFile }) => {
    const roomId = getRoomId(socket.id);
    if (!roomId) return;
    socket.broadcast.to(roomId).emit(SocketEvent.FILE_CREATED, { parentDirId, newFile });
  });

  socket.on(SocketEvent.FILE_UPDATED, ({ fileId, newContent }) => {
    const roomId = getRoomId(socket.id);
    if (!roomId) return;
    socket.broadcast.to(roomId).emit(SocketEvent.FILE_UPDATED, { fileId, newContent });
  });

  socket.on(SocketEvent.FILE_RENAMED, ({ fileId, newName }) => {
    const roomId = getRoomId(socket.id);
    if (!roomId) return;
    socket.broadcast.to(roomId).emit(SocketEvent.FILE_RENAMED, { fileId, newName });
  });

  socket.on(SocketEvent.FILE_DELETED, ({ fileId }) => {
    const roomId = getRoomId(socket.id);
    if (!roomId) return;
    socket.broadcast.to(roomId).emit(SocketEvent.FILE_DELETED, { fileId });
  });

  // Handle user status (online/offline)
  socket.on(SocketEvent.USER_OFFLINE, ({ socketId }) => {
    userSocketMap = userSocketMap.map((user) => {
      if (user.socketId === socketId) {
        return { ...user, status: USER_CONNECTION_STATUS.OFFLINE };
      }
      return user;
    });

    const roomId = getRoomId(socketId);
    if (!roomId) return;

    socket.broadcast.to(roomId).emit(SocketEvent.USER_OFFLINE, { socketId });
  });

  socket.on(SocketEvent.USER_ONLINE, ({ socketId }) => {
    userSocketMap = userSocketMap.map((user) => {
      if (user.socketId === socketId) {
        return { ...user, status: USER_CONNECTION_STATUS.ONLINE };
      }
      return user;
    });

    const roomId = getRoomId(socketId);
    if (!roomId) return;

    socket.broadcast.to(roomId).emit(SocketEvent.USER_ONLINE, { socketId });
  });

  // Handle chat actions
  socket.on(SocketEvent.SEND_MESSAGE, ({ message }) => {
    const roomId = getRoomId(socket.id);
    if (!roomId) return;
    socket.broadcast.to(roomId).emit(SocketEvent.RECEIVE_MESSAGE, { message });
  });

  // Handle cursor position and typing indicators
  socket.on(SocketEvent.TYPING_START, ({ cursorPosition }) => {
    userSocketMap = userSocketMap.map((user) => {
      if (user.socketId === socket.id) {
        return { ...user, typing: true, cursorPosition };
      }
      return user;
    });

    const user = getUserBySocketId(socket.id);
    if (!user) return;

    socket.broadcast.to(user.roomId).emit(SocketEvent.TYPING_START, { user });
  });

  socket.on(SocketEvent.TYPING_PAUSE, () => {
    userSocketMap = userSocketMap.map((user) => {
      if (user.socketId === socket.id) {
        return { ...user, typing: false };
      }
      return user;
    });

    const user = getUserBySocketId(socket.id);
    if (!user) return;

    socket.broadcast.to(user.roomId).emit(SocketEvent.TYPING_PAUSE, { user });
  });

  // Handle drawing sync and updates
  socket.on(SocketEvent.REQUEST_DRAWING, () => {
    const roomId = getRoomId(socket.id);
    if (!roomId) return;
    socket.broadcast.to(roomId).emit(SocketEvent.REQUEST_DRAWING, { socketId: socket.id });
  });

  socket.on(SocketEvent.SYNC_DRAWING, ({ drawingData, socketId }) => {
    socket.broadcast.to(socketId).emit(SocketEvent.SYNC_DRAWING, { drawingData });
  });
});

server.listen(process.env.PORT, () => {
  console.log(`Server listening on port ${process.env.PORT}`);
});
