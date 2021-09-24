window.addEventListener('DOMContentLoaded', () => {
    setUpText();
    setUpBurger();
});
let len = 1;
let index = 0;
let reachEnd = false;
let nex = 70;
words = ["Web Designer", "Software Engineer", "Problem Solver", "Innovator"];
function setUpText() {
    let word = words[index];
    document.querySelector('#diff-text').innerHTML = word.substring(0, len);
    if(!reachEnd) {
        len++;
        if(len > word.length) {
            reachEnd = true;
            nex = 40;
            setTimeout(setUpText, 500);
        }
    } else {
        len--;
        if(len == 0) {
            reachEnd = false;
            index = (index+1)%(words.length);
            nex = 80;
        }
    }
    if(len <= word.length) {
        setTimeout(setUpText, nex);
    }
}

function setUpCanvas() {
    var canvas = document.getElementById("introCanvas");
    var ctx = canvas.getContext("2d");

    canvas.style.width = 1000 + "px";
    canvas.style.height = 400 + "px";

    // Set actual size in memory (scaled to account for extra pixel density).
    var scale = window.devicePixelRatio; // Change to 1 on retina screens to see blurry canvas.
    canvas.width = 1000 * scale;
    canvas.height = 400 * scale;

    // Normalize coordinate system to use css pixels.
    ctx.scale(scale, scale);

    ctx.fillStyle = "#C0C0C0";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#000000";
    ctx.fillRect(20, 20, canvas.width-1800, canvas.height-60);
}

function setUpBurger() {
    document.querySelector('#burger').onclick = () => {
        document.querySelector('#burger').classList.toggle('b-active');
        document.querySelector('header').classList.toggle('h-active');
    }

    document.querySelectorAll('.head-link').forEach((hLink) => {
        hLink.onclick = () => {
            document.querySelector('#burger').classList.remove('b-active');
            document.querySelector('header').classList.remove('h-active');
        }
    });
}