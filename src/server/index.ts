import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { spawn } from 'child_process';
import cors from 'cors';

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('Client connected');

  socket.on('execute-command', (data) => {
    const sshProcess = spawn('ssh', ['tools.mukuru.com']);

    sshProcess.stdout.on('data', (data) => {
      socket.emit('command-output', data.toString());
    });

    sshProcess.stderr.on('data', (data) => {
      socket.emit('command-output', data.toString());
    });

    sshProcess.on('close', (code) => {
      socket.emit('command-output', `Process exited with code ${code}`);
    });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

const PORT = 3001;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 