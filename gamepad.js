var hasGP = false;
var repGP;
var btnLeft;
var btnRight;
var state = 0;
var gameRuns = false;

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

async function reportOnGamepad() {
    var gp = navigator.getGamepads()[0];
    var html = "";

    for (var i = 0; i < gp.buttons.length; i++) {
        if (gp.buttons[i].pressed) {
            if (gp.buttons[i] === btnLeft) {
                html += " left<br/>";
                if (gameRuns) changeDirection(270);
                else changeDirectionFake(270);
            }
            else if (gp.buttons[i] === btnRight) {
                html += " right<br/>";
                if (gameRuns) changeDirection(90);
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

        var prompt = "To begin using your gamepad, connect it and press any button!";
        $("#gamepadPrompt").text(prompt);

        $(window).on("gamepadconnected", function () {
            hasGP = true;
            $("#gamepadPrompt").html("Gamepad connected!");
            console.log("connection event");
            repGP = window.setInterval(reportOnGamepad, 100);
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