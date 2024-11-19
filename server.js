const express = require('express');
const path = require('path');
const app = express();
const io = require('socket.io')(app.listen(3000));
const PORT = 3000;

//can either get with sockets or http request, sockets might be better for real time
let detectorArray = [
  ["white", "blank"],
  ["cyan", "triBR"],
  ["magenta", "square"],
  
  ["cyan", "square"],
  ["yellow", "square"],
  ["yellow", "square"],
  
  
  ["cyan", "triBL"],
  ["yellow", "square"],
  ["magenta", "square"]
];

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.emit('detectorArray', detectorArray);
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

// Serve static files (JavaScript, CSS, etc.)
app.use(express.static(path.join(__dirname, '/')));

// Serve index.html on the root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/projection', (req, res) => {
  res.sendFile(path.join(__dirname, 'projection.html'));
});

app.get('/image-rec', (req, res) => {
  res.sendFile(path.join(__dirname, 'recognizer.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
