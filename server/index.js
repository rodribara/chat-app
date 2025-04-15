const ws = require("ws");
const server = new ws.Server({ port: 8080 });

server.on("connection", (socket) => {
  socket.on("message", (message) => {
    const b = Buffer.from(message);
    // console.log("Received: %s", message);
    console.log("Received: ", b.toString());
    socket.send(`Echo: ${message}`);
  });
});
