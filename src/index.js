const http = require("http")
const express = require("express")
const morgan = require("morgan")
const cors = require("cors")
const path = require('path');
const mongoose = require("mongoose")
const socketio = require("socket.io")

const Message = require('./models/Message');
const chatRoute = require('./routes/chatRoute');

require('dotenv').config();

const app = express();

const port = process.env.PORT || "3000";
const corsOptions = {
    origin: 'http://localhost:8080',
    credentials: true,
    optionsSuccessStatus: 200 
}

// Setting variables and middlewares
app.set("port", port);
app.use(morgan("dev"));
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({extended:true}));

// Defining routes
app.use("/", chatRoute);

// Defining public front build
app.use(express.static(decodeURIComponent(path.join(__dirname, 'public'))));

// Creating the server
const server = http.createServer(app);

// Setting up socketio
const io = socketio(server,{
    cors: {
      origin: "http://localhost:8080"
    }
}); 

// Setting MongoDB connection (MongoDB Atlas)
const mongoDB = process.env.MONGODB_STRING;

mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => console.log('DB connected')).catch(err => console.log(err))

io.on('connection', (socket) => {
    console.log("User connected " + socket.id);
    socket.on('sendMessage', (message) => {
        const msgToStore = {
            username: message.username,
            text: message.text,
            sessionID: message.sessionID
        }
        const msg = new Message(msgToStore);
        msg.save().then(result => {
            io.emit('message', result);
        })

    })
});

// Listening on port
server.listen(port);
server.on("listening", () => {
    console.log(`Listening on port ${port}`)
})