const fs = require('fs');
const http = require('http');
const WebSocket = require('ws');
const db = require('./database');

const server = http.createServer((req, res)=>{
    res.end('hello client')
});

const wss = new WebSocket.Server({ server });

function getDateString() {
    let date = new Date();

    let day = ("0" + date.getDate()).slice(-2);
    let month = ("0" + (date.getMonth() + 1)).slice(-2);
    let year = date.getFullYear();
    let hours = date.getHours();
    let minutes = date.getMinutes();

    return `${day}/${month}/${year} ${hours}:${minutes}`;
}

var payloads = {
    'newMessage': (data, ws)=>{
        data.message.dateString = getDateString();
        data.message.timestamp = Date.now();

        db.get('messages').push(data.message).write();
        db.get('users').find({ nickname: data.message.nickname }).assign({ last_message: data.message.text }).write();

        wss.clients.forEach(client => {
            client.send(JSON.stringify({
                payload: 'newMessage',
                data: data
            }));
            client.send(JSON.stringify({
                payload: 'refreshUsers',
                data: db.get('users').value()
            }));
        });
    },
    'newAuth': (data, ws)=> {
        if(db.get('users').find({ nickname: data.user.nickname }).value() === undefined) {
            db.get('users').push(data.user).write();
        } else {
            db.get('users').find({ nickname: data.user.nickname }).assign(data.user).write();
        }

        wss.clients.forEach(client => {
            client.send(JSON.stringify({
                payload: 'refreshUsers',
                data: db.get('users').value()
            }))
        });
    },
}
 
wss.on('connection', function connection(ws) {
    ws.send(JSON.stringify({
        payload: 'getMessages',
        data: {
            messages: db.get('messages').value()
        }
    }));
    ws.on('message', function incoming(message) {
        var mes = JSON.parse(message);

        payloads[mes.payload](mes.data, ws);
    });
});
 
server.listen(8081, ()=>{
    console.log('Server is running on port 8081')
});