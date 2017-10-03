var hasGP = false;
var repGP;
var btnLeft;
var btnRight;
var state = 0;
var gameRuns = false;
var gameId;
var playerId;
var typeAttr = "c";

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
            else html += " other<br/>";
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
            await sleep(100);
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
        
        

        connection.onclose = function (){
            console.log("WS is closed");
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
    setInterval(function () {
        seconds = parseInt(waitTime / 1000);
        seconds = seconds < 10 ? "0" + seconds : seconds;
        $("#gamepadDisplay").html("THE GAME WILL START IN " + seconds + " SECONDS!!!");
        waitTime -= 1000;
        if (waitTime <= 0) {
            gameRuns = true;
            return;
        }
    }, 1000);
}

function endGame(result){
    hide(false);
    $("#gamepadPrompt").html("You have " + result + " the game, you can join another Game!!!");
    gameRuns = false;
}

function checkGameData(gId, pId){
    return (gId === gameId && pId === playerId);
}

function setGameData(gId, pId){
    gameId = gId;
    playerId = pId;
}

function connectToGame(connection){
    var myObj = { "g":gameId, "p":playerId, "t":typeAttr, "e":0 };
    console.log(JSON.stringify(myObj));
    connection.onmessage = function (e) {
            console.log('Server: ' + e.data);
    };
    connection.send(JSON.stringify(myObj));
}

function changeDirection(direction, connection){
    var directionJSON = {"d":direction};
    var myObj = { "g":gameId, "p":playerId, "t":typeAttr, "e":6, "v": directionJSON};
    connection.send(JSON.stringify(myObj));
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