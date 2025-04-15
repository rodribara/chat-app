import express from "express";
import { Server } from "socket.io";
import path from "path";

const PORT = process.env.PORT || 3500;

const app = express();

app.use(express.static(path.join(path.resolve(), "public")));

const expressServer = app.listen(PORT, () => {
  console.log(`listening to ${PORT}`);
});

const io = new Server(expressServer, {
  cors: {
    origin:
      process.env.NODE_ENV === "production"
        ? false
        : ["http://localhost:5500", "http://127.0.0.1:5500"],
  },
});

io.on("connection", (socket) => {
  console.log(`User${socket.id} connected`);

  // Upon connection - only to user
  socket.emit("message", "Welcome to the chat!");

  // Upon connection - to all others

  socket.broadcast.emit("message", `${socket.id.substring(0, 5)} joined`);
  // listening for a message event
  socket.on("message", (data) => {
    console.log(data);
    io.emit("message", `${socket.id.substring(0, 5)}:${data}`);
  });

  //when user disconnects - to all others
  socket.on("disconnect", () => {
    socket.broadcast.emit("message", `${socket.id.substring(0, 5)} left`);
  });

  // listen for activity
  socket.on("activity", (id, data) => {
    socket.broadcast.emit("activity", id, data);
  });
});
