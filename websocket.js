var connection;
var gameId;
var playerId;
var typeAttr = "c";

function websocket() {
    connection = new WebSocket('wss://wetron.tk/websocket/');
    connection.onopen = function () {
        console.log('Connection is open');
        wsIsOpen();
    };

    // Log errors
    connection.onerror = function (error) {
        console.log('WebSocket Error ' + error);
    };

    connection.onmessage = function (e) {
        var response = JSON.parse(e.data);
        console.log('Server: ' + response);
        if (checkGameData(response.g, response.p)){
            switch (response.e){
                case 4:
                    gameWillStart(response.v.countdown-ms);
                    break;
                case 5:
                    if (response.v.win){
                        endgame("win");
                    }
                    else {
                        endgame("lost");
                    }
                    break;
                case 8: 
                    if (response.v.success){
                        isConnected(gameId, playerId);
                    }
                    else{
                        connectionFails(gameId, playerId);
                    }
                    break;
            }
        }
    };
}

function checkGameData(gId, pId){
    return (gId === gameId && pId === playerId);
}

function setGameData(gId, pId){
    gameId = gId;
    playerId = pId;
}

function connectToGame(){
    var myObj = { "g":gameId, "p":playerId, "t":typeAttr, "e":0 };
    console.log(JSON.stringify(myObj));
    connection.send(JSON.stringify(myObj));
}

function connectionLost(){
    var myObj = { "g":gameId, "p":playerId, "t":typeAttr, "e":9 };
    connection.send(JSON.stringify(myObj));
}

function changeDirection(direction){
    var directionJSON = {"d":direction};
    var myObj = { "g":gameId, "p":playerId, "t":typeAttr, "e":6, "v": direction};
    connection.send(JSON.stringify(myObj));
}

function changeDirectionFake(direction){
    var directionJSON = {"d":direction};
    var myObj = { "g":gameId, "p":playerId, "t":typeAttr, "e":6, "v": direction};
    console.log(JSON.stringify(myObj));
} 

function btnClicked (){
    console.log("onClick");
    var gId = $('#gId').val();
    var pId = $('#pId').val();
    if (!isNaN(gId) && !isNaN(pId)){
        setGameData(gId, pId);
        connectToGame();
    }
}

websocket();