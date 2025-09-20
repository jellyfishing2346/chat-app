// src/socket.js
import { io } from 'socket.io-client';

const socket = io('ws://localhost:3001'); // Update with your server URL/port

export default socket;
