var webSocket = require("ws").Server;
var wss = new webSocket({port:2000});
var games = {},data = {},start = [];
setInterval(() => {
    for(let [user,friend] of Object.entries(games)){
        if(!wss.clients.has(data[user])){
            data[friend].send(JSON.stringify(["dc"]));
            delete games[user];
            delete data[user];
        }
    }
},3000);
setInterval(() => {
    Object.keys(games).forEach((val) => {
        if(wss.clients.has(data[val]) && wss.clients.has(data[games[val]]) && start.indexOf(val) != -1 && start.indexOf(games[val]) != -1){
            data[val].send(JSON.stringify(["burst"]));
            data[games[val]].send(JSON.stringify(["burst"]));
            start.splice(start.indexOf(val),1);
            start.splice(start.indexOf(games[val]),1);
        }
    });
},1000);
wss.on("connection",(socket) => {
    socket.on("message",(dt) => {
        for(let [user,game] of Object.entries(games)){
            if(!wss.clients.has(data[user])){
                delete games[user];
                delete data[user];
            }
        }
        let val = JSON.parse(dt.toString("utf-8"));
        if(val[0] == 0){
            data[val[1]] = socket;
            games[val[1]] = val[2];
            if(start.indexOf(val[1]) == -1){
                start.push(val[1]);
            }
        }
        else if(val[0] == 1){
            data[val[1][4]].send(JSON.stringify(val[1]));
        }
    });
});