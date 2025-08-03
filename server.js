const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

console.log("WebSocket server running on ws://localhost:8080");

wss.on('connection', (ws) => {
  console.log("New client connected");

  // Send a welcome message
  ws.send("Connected to ThunderDex console!");

  // You can periodically send messages simulating console output
  const interval = setInterval(() => {
    ws.send("Server time: " + new Date().toLocaleTimeString());
  }, 3000);

  ws.on('close', () => {
    console.log("Client disconnected");
    clearInterval(interval);
  });

  ws.on('message', (message) => {
    console.log("Received from client:", message);
  });
});

