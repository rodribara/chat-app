import express from "express";
import { Server } from "socket.io";
import path from "path";

const PORT = process.env.PORT || 3500;
const ADMIN = "Admin";

const app = express();

app.use(express.static(path.join(path.resolve(), "public")));

const expressServer = app.listen(PORT, () => {
  console.log(`listening to ${PORT}`);
});

// state
const UsersState = {
  users: [],
  setUsers: function (newsUsersArray) {
    this.users = newsUsersArray;
  },
};

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
  socket.emit("message", buildMSG(ADMIN, "Welcome to the Chat App!"));
  socket.emit("message", "Welcome to the chat!");

  socket.on("enterRoom", ({ name, room }) => {
    // leave previos room
    const prevRoom = getUser(socket.id)?.room;
    if (prevRoom) {
      socket.leave(prevRoom);
      io.to(prevRoom).emit("message", buildMSG(ADMIN, `${name} left the room`));
    }

    const user = activateUser(socket.id, name, room);

    // cannot update previous room users list until after the state update in activate user
    if (prevRoom) {
      io.to(prevRoom),
        emit("userList", {
          users: getUsersInRoom(prevRoom),
        });
    }
    // join room
    socket.join(user.room);

    // to the user joining
    socket.emit("message", buildMSG(ADMIN, `joined to ${user.room}`));

    //tell room users a new user joined

    socket.broadcast
      .to(user.room)
      .emit("message", buildMSG(ADMIN, `${user.name} joined the room`));
    //update user list for room
    io.to(user.room).emit("userList", {
      users: getUsersInRoom(user.room),
    });

    //update room list for everyone
    io.emit("roomList", {
      rooms: getAllActiveRooms(),
    });
  });

  // listening for a message event
  socket.on("message", ({ name, text }) => {
    const room = getUser(socket.id)?.room;
    if (room) {
      io.to(room).emit("message", buildMSG(name, text));
    }
  });

  // listen for activity
  socket.on("activity", (name) => {
    const room = getUser(socket.id)?.room;
    if (room) {
      socket.broadcast.to(room).emit("activity", name);
    }
  });
});

//when user disconnects - to all others
socket.on("disconnect", () => {
  const user = getUser(socket.id);
  userLeavesApp(socket.id);
  if (user) {
    io.to(user.room).emit(
      "message",
      buildMSG(ADMIN, `${user.name} left the room`)
    );
    io.to(user.room).emit("userList", {
      users: getUsersInRoom(user.room),
    });
    io.emit("roomList", {
      rooms: getAllActiveRooms(),
    });
  }
  console.log(`User ${socket.id} disconnected`);
});

function buildMSG(name, text) {
  return {
    name,
    text,
    time: new Intl.DateTimeFormat("default", {
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    }).format(new Date()),
  };
}

//User Functions

function activateUser(id, name, room) {
  const user = { id, name, room };
  UsersState.setUsers([
    ...UsersState.users.filter((user) => user, id !== id),
    user,
  ]);
  return user;
}

function userLeavesApp(id) {
  UsersState.setUsers(UsersState.users.filter((user) => user.id !== id));
}

function getUser(id) {
  return UsersState.users.find((user) => user.id === id);
}

function getUsersInRoom(room) {
  return UsersState.users.filter((user) => user.room === room);
}

function getAllActiveRooms() {
  return Array.from(new Set(UsersState.users.map((user) => user.room)));
}
