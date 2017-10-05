var hasGP = false;
var repGP;
var btnLeft;
var btnRight;
var state = 0;
var gameRuns = false;
var gameId = 0;
var playerId = 0;
var typeAttr = "c";
var directionSafe = 0;

function canGame() {
    return "getGamepads" in navigator;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function hide(hide) {
    if (hide) $(".gameSettings").css("display", "none");
    else $(".gameSettings").css("display", "inherit");

}

var fakeTimer = 3000;
async function reportOnGamepad(connection) {
    var gp = navigator.getGamepads()[0];
    var html = "";
    if (!gameRuns && state > 4){
        connectToGame(connection);
        state=4;
    }
    for (var i = 0; i < gp.buttons.length; i++) {
        if (gp.buttons[i].pressed) {
            if (gp.buttons[i] === btnLeft) {
                html += " left<br/>";
                if (gameRuns) changeDirection(270, connection);
                else changeDirectionFake(270);
            }
            else if (gp.buttons[i] === btnRight) {
                html += " right<br/>";
                if (gameRuns) changeDirection(90, connection);
                else changeDirectionFake(90);
            }
            else {
                html += " other<br/>";
            }
            switch (state) {
                case 0:
                    $("#gamepadPrompt").html("Please wait for Websocket Connection to be opend");
                    break;
                case 1:
                    $("#gamepadPrompt").html("Please press any Button, to configure turn left");
                    state++;
                    break;
                case 2:
                    btnLeft = gp.buttons[i];
                    $("#gamepadPrompt").html("Please press any Button, to configure turn right");
                    state++;
                    break;
                case 3:
                    btnRight = gp.buttons[i];
                    $("#gamepadPrompt").html("Your Gamepad is configured, now you can join a Game");
                    hide(false);
                    state++;
                    break;
            }
            await sleep(500);
        }
    }
    $("#gamepadDisplay").html(html);
}

$(document).ready(function () {

    if (canGame()) {
    
        var connection = new WebSocket('wss://wetron.tk/websocket/');
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
            console.log('Server: ' + e.data);
            if (checkGameData(response.g, response.p)){
                switch (response.e){
                    case 4:
                        gameWillStart(response.v["countdown-ms"]);
                        break;
                    case 5:
                        if (response.v.win){
                            endGame("win");
                        }
                        else {
                            endGame("lost");
                        }
                        break;
                    case 7:
                        setDirectionArrow(response.v);
                        break;
                    case 8: 
                        if (response.v.success){
                            console.log("connect to game");
                            isConnected(gameId, playerId);
                        }
                        else{
                            connectionFails(gameId, playerId);
                        }
                        break;
                }
            }
        };

        connection.onclose = function (){
            console.log("WS is closed");
            hide(true);
            $("#gamepadPrompt").html("Please Refresh the Page to join a new Game!!!");
        }

        var prompt = "To begin using your gamepad, connect it and press any button!";
        $("#gamepadPrompt").text(prompt);

        $(window).on("gamepadconnected", function () {
            hasGP = true;
            $("#gamepadPrompt").html("Gamepad connected!");
            console.log("connection event");
            repGP = window.setInterval(reportOnGamepad, 100, connection);
        });

        $(window).on("gamepaddisconnected", function () {
            console.log("disconnection event");
            $("#gamepadPrompt").text(prompt);
            window.clearInterval(repGP);
        });

        //setup an interval for Chrome
        var checkGP = window.setInterval(function () {
            console.log('checkGP');
            if (navigator.getGamepads()[0]) {
                if (!hasGP) $(window).trigger("gamepadconnected");
                window.clearInterval(checkGP);
            }
        }, 500);
    }
});

function wsIsOpen(){
    state++
    if (hasGP){
        $("#gamepadPrompt").html("Please press any Button, to configure turn left");
        state++;
    }
    else {
        $("#gamepadPrompt").html("To begin using your gamepad, connect it and press any button!");
    }
}

function isConnected(gId, pId){
    hide(true);
    $("#gamepadPrompt").html("You are Connected to Game " + gId + " as Player " + pId + ".<br />Wait for game to Start");
}

function connectionFails(gId, pId){
    $("#gamepadPrompt").html("The connection to Game " + gId + " as Player " + pId + ".Fails!!!<br />Please try again");
}

function gameWillStart(waitTime){
    var frame = document.getElementById("gameFrame").contentWindow;
    if (waitTime <= 0){
        gameRuns = true;
        $("#timer").html("");
    }
    else {
        seconds = parseInt(waitTime / 1000);
        console.log("THE GAME WILL START IN " + seconds + " SECONDS!!!");
        if (seconds < 2)
            frame.countdown1();
        else if (seconds < 3)
            frame.countdown2();
        else
            frame.countdown3();
        $("#timer").html("THE GAME WILL START IN " + seconds + " SECONDS!!!");
    }
}

function endGame(result){
    hide(false);
    $("#gamepadPrompt").html("You have " + result + " the game, you can join another Game!!!");
    gameRuns = false;
}

function checkGameData(gId, pId){
    console.log("checkGameData");
    return (gId == gameId);// && pId === playerId);
}

function setGameData(gId, pId){
    gameId = parseInt(gId);
    playerId = parseInt(pId);
}

function connectToGame(connection){
    var myObj = { "g":gameId, "p":playerId, "t":typeAttr, "e":0 };
    console.log(JSON.stringify(myObj));
    connection.send(JSON.stringify(myObj));
}

function changeDirection(direction, connection){
    var directionJSON = {"d":direction};
    var myObj = { "g":gameId, "p":playerId, "t":typeAttr, "e":6, "v": directionJSON};
    connection.send(JSON.stringify(myObj));
    setDirectionArrowManule(direction);
}
function changeDirectionFake(direction){
    var directionJSON = {"d":direction};
    var myObj = { "g":gameId, "p":playerId, "t":typeAttr, "e":6, "v": directionJSON};
    console.log(JSON.stringify(myObj));
} 

function btnClicked (){
    console.log("onClick");
    var gId = $('#gId').val();
    var pId = $('#pId').val();
    if (!isNaN(gId) && !isNaN(pId)){
        setGameData(gId, pId);
        state++;
    }
}

function setDirectionArrowManule(add){
    var frame = document.getElementById("gameFrame").contentWindow;
    directionSafe += add;
    directionSafe = directionSafe % 360;
    switch (directionSafe){
        case 0:
            frame.driveStraight()
            break;
        case 90:
            frame.driveRight()
            break;
        case 180:
            frame.driveBack()
            break;
        case 270:
            frame.driveLeft()
            break;
    }
}

function setDirectionArrow(positionArray){
    var frame = document.getElementById("gameFrame").contentWindow;
    for (i in positionArray) {
        var positionElemet = positionArray[i];
        if (positionElemet.p === playerId){
            switch (positionElemet.d){
                case 0:
                    frame.driveStraight()
                    break;
                case 90:
                    frame.driveRight()
                    break;
                case 180:
                    frame.driveBack()
                    break;
                case 270:
                    frame.driveLeft()
                    break;
            }
        }
    }
}