import '../sass/main.scss';
import '../font/ubuntu.css'
import {createWS} from './modules/ws';
import templateMessage from '../views/message.hbs';
import templateUserList from '../templates/userList.hbs'

var container = document.querySelector('.messages');
var auth_btn = document.querySelector('.auth_btn');
var auth_name = document.querySelector('#auth_name');
var auth_nickname = document.querySelector('#auth_nickname');
var userlist = document.querySelector('.userlist');

window.onload = function () {
    auth_btn.addEventListener('click', () => {
        if(auth_name.value !== '' && auth_nickname.value !== '') {
            chat._name = auth_name.value;
            chat._nickname = auth_nickname.value;

            chat.connect(auth_name.value, auth_nickname.value);
            document.querySelector('.auth').classList.add('hide');
            document.querySelector('.chat_main').classList.remove('hide');
            document.querySelector('.username').innerHTML = chat._name;
        }

        auth_name.value = '';
        auth_nickname.value = '';
    })
}

const chat = {
    _name: '',
    _nickname: '',
    _url: 'ws://localhost:8081',
    _ws: {},
    auth: (name, nickname) => {
        chat._ws.send(JSON.stringify({
            payload: 'newAuth',
            data: {
                user: {
                    name: name,
                    nickname: nickname
                }
            }
        }));
    },
    sendMessage: (text) => {
        chat._ws.send(JSON.stringify({
            payload: 'newMessage',
            data: {
                message: {
                    nickname: chat._nickname,
                    text: text
                }
            }
        }));
    },
    connect: (name, nickname) => {
        chat._ws = createWS(chat._url, {
            'newMessage': (data, ws) => {
                container.innerHTML += templateMessage(data.message);
            },
            'getMessages': (data, ws) => {
               data.messages.forEach(message => {
                container.innerHTML += templateMessage(message);
               });
            },
            'newUser': (data, ws) => {
                console.log('newUser: ', data);
             },
             'refreshUsers': (data, ws) => {
                console.log('refreshUsers: ', data);
                userlist.innerHTML = '';
                data.forEach(user => {
                    userlist.innerHTML += templateUserList({name: user.name, last_message: user.last_message});
                });
                document.querySelector('#user_num').innerHTML = `${data.length} ${data.length === 1 || data.length%10 === 1 ? 'участник' : data.length === 0 || data.length%10 >= 5 ? 'участников' : 'участника'}`;
             }
        });

        chat._ws.onopen = function() {
            console.log("Соединение установлено.");
            chat.auth(chat._name, chat._nickname);
            var msg_btn = document.querySelector('#send');
            var input = document.querySelector('#input');
        
            msg_btn.addEventListener('click', () => {
                if(input.value !== '')
                    chat.sendMessage(input.value);
        
               input.value = '';
            })
        };
    },
};