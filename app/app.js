const socket = new WebSocket("ws://localhost:8080");

function sendMessage(e) {
  e.preventDefault();
  const input = document.querySelector("input");
  if (input.value) {
    socket.send(input.value);
    input.value = "";
  }
  input.focus();
}

document.querySelector("form").addEventListener("submit", sendMessage);

// listen for messages
socket.addEventListener("message", ({ data }) => {
  const li = document.createElement("li");
  li.textContent = data;
  document.querySelector("ul").appendChild(li);
});
window.addEventListener("beforeunload", () => {
  if (socket.readyState === WebSocket.OPEN) {
    socket.close(); // Gracefully close the WebSocket connection
  }
});
