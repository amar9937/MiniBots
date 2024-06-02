var webSocket = require("ws").Server;
var wss = new webSocket({port:8000});
var conn = [],names = [],tmp = [],interval = null;
setInterval(() => {
    conn.forEach((val) => {
        if(!wss.clients.has(val)){
            if(tmp.indexOf(names[conn.indexOf(val)]) != -1){
                tmp.splice(tmp.indexOf(names[conn.indexOf(val)]),1);
            }
            names.splice(conn.indexOf(val),1);
            conn.splice(conn.indexOf(val),1);
            conn.forEach((val) => {
                val.send(JSON.stringify([0,names]));
            });
        }
    });
},2000);
wss.on("connection",(socket) => {
    socket.on("message",(data) => {
        let pdata = JSON.parse(data.toString("utf-8"));
        if(pdata[0] == 0){
            let name = pdata[1];
            conn.forEach((val) => {
                if(!wss.clients.has(val)){
                    names.splice(conn.indexOf(val),1);
                    conn.splice(conn.indexOf(val),1);
                }
            });
            conn.push(socket);
            names.push(name.toString('utf-8'));
            conn.forEach((val) => {
                val.send(JSON.stringify([0,names]));
            });
        }
        else if(pdata[0] == 1){
            let data = JSON.parse(pdata[1]);
            if(wss.clients.has(conn[names.indexOf(data[1])])){
                conn[names.indexOf(data[1])].send(JSON.stringify([1,data[0],data[2]]));
            }
        }
        else if(pdata[0] == 2){
            tmp.push(pdata[1]);
        }
        else if(pdata[0] == "accept"){
            if(tmp.indexOf(pdata[1]) == -1 && wss.clients.has(conn[names.indexOf(pdata[1])])){
                conn[names.indexOf(pdata[1])].send(JSON.stringify(["accept"]));
            }
            else if(tmp.indexOf(pdata[1]) != -1){
                tmp.splice(tmp.indexOf(pdata[1]),1);
            }
        }
        else if(pdata[0] == "reject"){
            if(tmp.indexOf(pdata[1]) == -1 && wss.clients.has(conn[names.indexOf(pdata[1])])){
                conn[names.indexOf(pdata[1])].send(JSON.stringify(["reject"]));
            }
            else if(tmp.indexOf(pdata[1]) != -1){
                tmp.splice(tmp.indexOf(pdata[1]),1);
            }
        }
        else if(pdata[0] == "mes"){
            socket.send(JSON.stringify([0,names]));
        }
    });
});