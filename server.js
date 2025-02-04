const express = require('express');
const path = require('path');
const app = express();
const PORT = 3001;

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

function arraysEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length !== b.length) return false;

  // If you don't care about the order of the elements inside
  // the array, you should sort both arrays here.
  // Please note that calling sort on an array will modify that array.
  // you might want to clone your array first.

  for (var i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

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

const Server = app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

const io = require('socket.io')(Server);

//a container for the previously sent array
let prevData;

io.on('connection', (socket) => {
  console.log('a user connected');
  //socket.emit('detectorArray', detectorArray);
  //when an update for the paper is recieved, send it to the projecter
  //might be called a lot based on the image-rec.js code
  socket.on('newData', (data)=>{
    if (!arraysEqual(data, prevData)) {
      console.log(data);
      io.emit('detectorArray', data);
      prevData = data;
    };
  });
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});