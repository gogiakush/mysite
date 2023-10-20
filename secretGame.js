window.addEventListener('DOMContentLoaded', () => {
    setUpGame();
});

let enemybullets = [];
let bullets = [];
let enemies = [];
let timer = 0;
let enemytimer = 0;
let timer_limit = 7;
let stars = [];
let score = 0;
let gameOver = false;

var myGameArea = {
    canvas : document.createElement("canvas"),
    start : function() {
        this.canvas.width = 800;
        this.canvas.height = 500;
        this.context = this.canvas.getContext("2d");
        let node = document.querySelector("#terminal");
        node.appendChild(this.canvas);
        this.frameNo = 0;
        this.interval = setInterval(updateGameArea, 20);
        window.addEventListener('keydown', function (e) {
            e.preventDefault();
            myGameArea.keys = (myGameArea.keys || []);
            myGameArea.keys[e.keyCode] = (e.type == "keydown");
        })
        window.addEventListener('keyup', function (e) {
            myGameArea.keys[e.keyCode] = (e.type == "keydown");
        })
    },
    stop : function() {
        clearInterval(this.interval);
    },    
    clear : function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

function spaceship(width, height, color, x, y, type) {
    this.type = type;
    this.image = new Image();
    this.image.src = color;
    this.width = width;
    this.height = height;
    this.speed = 0;
    this.accel = 1.5;
    this.decel = 0.8;
    this.accelSpeed = 0;
    this.angle = 0;
    this.aF = false;
    this.aB = false;
    this.moveAngle = 0;
    this.maxHealth = 10;
    this.health = this.maxHealth;
    this.x = x;
    this.y = y;    
    this.update = function() {
        ctx = myGameArea.context;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.drawImage(this.image, this.width / -2, this.height / -2, this.width, this.height);
        ctx.restore();    
    }
    this.newPos = function() {
        this.angle += this.moveAngle * Math.PI / 180;
        if(this.x > 80 && this.aF) {
            this.accelSpeed -= this.accel;
            this.x += (this.speed + this.accelSpeed);
        } else if (this.x < myGameArea.canvas.width - 80 && this.aB) {
            this.accelSpeed += this.accel;
            this.x += (this.speed + this.accelSpeed);
        } else if (!this.aF && this.accelSpeed < 0 && this.x > 80 && this.x < myGameArea.canvas.width - 80) {
            this.accelSpeed += this.decel;
            this.x += (this.speed + this.accelSpeed);
        } else if(!this.aB && this.accelSpeed > 0 && this.x > 80 && this.x < myGameArea.canvas.width - 80) {
            this.accelSpeed -= this.decel;
            this.x += (this.speed + this.accelSpeed);
        } else {
            this.accelSpeed = 0;
        }

        if(this.accelSpeed >= -0.5 && this.accelSpeed <= 0.5) { //glitch where ship slightly moves back and forth because speed is close to 0 but never 0
            this.accelSpeed = 0;
        }
    }
}

function bullet(radius, x, y, angle, speed, color) {
    this.speed = speed;
    this.angle = angle;
    this.radius = radius;
    this.color = color;
    this.hit = false;
    this.x = x;
    this.y = y;    
    this.update = function() {
        ctx = myGameArea.context;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, 2 * Math.PI);
        ctx.fillStyle = this.color;
        ctx.fill(); 
        ctx.restore();
    }
    this.newPos = function() {
        this.x += this.speed * Math.sin(this.angle);
        this.y -= this.speed * Math.cos(this.angle);
    }
    this.checkCollision = function() {
        if(Math.abs(this.x - myGamePiece.x) < 35 && Math.abs(this.y - myGamePiece.y) < 35 && !this.hit) {
            this.hit = true;
            myGamePiece.health--;
            let num = enemybullets.find(element => element == this);
            enemybullets.splice(num, 1);
            if(myGamePiece.health == 0) {
                gameOver = true;
                clearInterval(myGameArea.interval);
                showGameOver();
            }
        }
    }
    this.hitAsteroid = function() {
        for(var i = 0; i < enemies.length; i++) {
            if(Math.abs(this.x - enemies[i].x) < 30 && Math.abs(this.y - enemies[i].y) < 30) {
                this.hit = true;
                enemies.splice(i, 1);
                i--;
                let num = bullets.find(element => element == this);
                bullets.splice(num, 1);
                score++;
            }
        }
    }
}

function star(radius, x, y) {
    this.x = x;
    this.y = y;
    this.speed = 0.5;
    this.radius = radius;
    this.update = function() {
        ctx = myGameArea.context;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        ctx.fillStyle = "white";
        ctx.fill();     
    }
    this.newPos = function() {
        this.x = (this.x + this.speed) % myGameArea.canvas.width;
        this.y = (this.y + this.speed / 5) % myGameArea.canvas.height;
    }
}

function enemy(width, height, color, x, y, type) {
    this.type = type;
    this.image = new Image();
    this.image.src = color;
    this.width = width;
    this.height = height;
    this.speed = 0.75;
    this.angle = 0;
    this.x = x;
    this.y = y;    
    this.update = function() {
        ctx = myGameArea.context;
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height); 
    }
    this.newPos = function() {
        this.y += this.speed;
    }
    this.shoot = function() {
        xdir = myGamePiece.x - this.x;
        ydir = myGamePiece.y - this.y;
        tempAngle = Math.atan(ydir / xdir);
        if (xdir < 0) {
            tempAngle += Math.PI / 2;
        } else {
            tempAngle -= Math.PI / 2;
        }
        enemybullets.push(new bullet(5, this.x + 25, this.y + 40, tempAngle, -5, "white"));
    }
}

function updateGameArea() {
    myGameArea.clear();
    myGamePiece.moveAngle = 0;
    myGamePiece.speed = 0;
    myGamePiece.aF = false;
    myGamePiece.aB = false;
    if (myGameArea.keys && myGameArea.keys[37]) {myGamePiece.moveAngle = -1; }
    if (myGameArea.keys && myGameArea.keys[39]) {myGamePiece.moveAngle = 1; }
    if (myGameArea.keys && myGameArea.keys[38]) {myGamePiece.aF=true; } //1
    if (myGameArea.keys && myGameArea.keys[40]) {myGamePiece.aB=true; } //-1
    myGamePiece.newPos();
    myGamePiece.update();

    if (myGameArea.keys && myGameArea.keys[32] && timer % timer_limit == 0) {
        bullets.push(new bullet(5, myGamePiece.x+Math.sin(myGamePiece.angle)*40, myGamePiece.y-Math.cos(myGamePiece.angle)*40, myGamePiece.angle, 5, "red"));
    }

    if(enemytimer % 100 == 0) {
        enemies.push(new enemy(50, 50, "enemyship.png", Math.floor(Math.random() * myGameArea.canvas.width), -100, "image"));
    }

    for(var i = 0; i < bullets.length; i++) {
        piece = bullets[i];
        if(piece.x < 0 || piece.x > myGameArea.canvas.width || piece.y < 0 || piece.y > myGameArea.canvas.height) {
            bullets.splice(i, 1);
            i--;
        } else {
            piece.newPos();
            piece.update();
            piece.hitAsteroid();
        }
    }

    for(var i = 0; i < stars.length; i++) {
        stars[i].update();
        stars[i].newPos();
    }

    for(var i = 0; i < enemies.length; i++) {
        if(enemies[i].y > myGameArea.canvas.height) {
            enemies.splice(i, 1);
            i--;
        } else {
            enemies[i].update();
            enemies[i].newPos();
            var num = Math.floor(Math.random() * 200);
            if(num == 7 && enemies[i].y < myGamePiece.y - 50) {
                enemies[i].shoot();
            }
        }
    }

    for(var i = 0; i < enemybullets.length; i++) {
        piece = enemybullets[i];
        if(piece.x < 0 || piece.x > myGameArea.canvas.width || piece.y < 0 || piece.y > myGameArea.canvas.height) {
            enemybullets.splice(i, 1);
            i--;
        } else {
            piece.newPos();
            piece.update();
            piece.checkCollision();
        }
    }

    displayScore();
    displayHealth();

    if(!(myGameArea.keys && myGameArea.keys[32])) {
        timer = 0;
    } else {
        timer++;
    }

    enemytimer++;
}

function setUpGame() {
    myGameArea.start();
    myGamePiece = new spaceship(150, 150, "spaceship.png", myGameArea.canvas.width / 2, myGameArea.canvas.height-75, "image");
    createStars();
}

function createStars() {
    for(let i = 0; i < 900; i++) 
    {
        stars.push(new star(1, Math.floor(Math.random() * myGameArea.canvas.width), Math.floor(Math.random() * myGameArea.canvas.height)));
    }
}

function displayScore() {
    ctx = myGameArea.context;
    ctx.font = "30px Monaco";
    ctx.fillText(score, 10, 50);
}

function displayHealth() {
    ctx = myGameArea.context;
    ctx.fillStyle = "gray";
    ctx.fillRect(myGameArea.canvas.width - 170, 20, 150, 30);
    ctx.fillStyle = "black";
    ctx.fillRect(myGameArea.canvas.width - 165, 25, 140, 20);
    ctx.fillStyle = "green";
    ctx.fillRect(myGameArea.canvas.width - 165, 25, 140 * (myGamePiece.health / myGamePiece.maxHealth), 20);
}

function showGameOver() {
    ctx = myGameArea.context;
    ctx.font = "70px Monaco";
    var text = "GAME OVER";
    var scoreText = "Score: " + score;
    ctx.fillText("GAME OVER", myGameArea.canvas.width / 2 - ctx.measureText(text).width / 2, myGameArea.canvas.height / 2 - 50);
    ctx.fillText(scoreText, myGameArea.canvas.width / 2 - ctx.measureText(scoreText).width / 2, myGameArea.canvas.height / 2 + 50);
}