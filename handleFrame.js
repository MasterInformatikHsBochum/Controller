function hideFrameElements() {
    $("#c3").css("display", "none");
    $("#c2").css("display", "none");
    $("#c1").css("display", "none");
    $("#left").css("display", "none");
    $("#straight").css("display", "none");
    $("#right").css("display", "none");
    $("#back").css("display", "none");
}

function driveLeft(){
    hideFrameElements();
    $("#left").css("display", "inherit");
}

function driveStraight(){
    hideFrameElements();
    $("#straight").css("display", "inherit");
}

function driveRight(){
    hideFrameElements();
    $("#right").css("display", "inherit");
}

function driveBack(){
    hideFrameElements();
    $("#back").css("display", "inherit");
}

function countdown3(){
    hideFrameElements();
    $("#c3").css("display", "inherit");
}

function countdown2(){
    hideFrameElements();
    $("#c2").css("display", "inherit");
}

function countdown1(){
    hideFrameElements();
    $("#c1").css("display", "inherit");
}