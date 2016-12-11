var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
var gameStatus = false;
var highscore = 0;
var car1, car2, timer, objTimer,
    obstacles = [],
    score = 0;

function Car(type) {
    this.y = 3 * canvas.height / 4;
    this.type = type;
    this.status = 'playing';
    this.width = 30;
    this.height = 60;

    //set image
    var img = document.createElement('img');
    if (type === 'red') img.src = 'car_red.svg';
    else if (type === 'blue') img.src = 'car_blue.png';
    this.image = img;


    //place it in random lane
    var startX;
    if (type === 'blue') startX = 0;
    else startX = canvas.width / 2;
    var r = randBool();
    if (r) {
        this.x = startX;
        this.lane = 'left';
    } else {
        this.x = startX + canvas.width / 4;
        this.lane = 'right';
    }

    var offset = canvas.width / 8 - this.width / 2;
    this.x += offset;

    console.log('const ' + typeof (this.x));

}

Car.prototype.draw = function () {
    ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
}

Car.prototype.swipePos = function () {
    var iX = this.x;
    var fX;
    var finalLane; //final position
    var offset = 0;

    if (this.lane === 'right') {
        fX = iX - canvas.width / 4;
        finalLane = 'left';
        offset = -1;
    } else {
        fX = iX + canvas.width / 4;
        finalLane = 'right';
        offset = 1;
    }

    console.log(this.x + " : " + fX + ' - ' + offset);
    var self = this;

    var swipeTimer = setInterval(function () {
        if (self.x !== fX) {
            self.status = 'moving';
            self.x += offset;
        } else {
            clearInterval(swipeTimer);
            self.lane = finalLane;
            self.status = 'playing';
        }
    }, 1);
}

function Obj() {

    //decide colour
    var r = randBool();
    var startX;

    if (r) {
        this.color = 'red';
        startX = canvas.width / 2;
    } else {
        this.color = 'blue';
        startX = 0;
    }

    //decide lane
    r = randBool();
    if (r) {
        this.lane = 'right';
        this.x = startX + canvas.width / 4;
    } else {
        this.lane = 'left';
        this.x = startX;
    }


    //decide type
    r = randBool();
    if (r) {
        this.type = 'circle';
        this.radius = 25;
        var offset = canvas.width / 8;
        this.x += offset;
    } else {
        this.type = 'rect';
        this.width = 50;
        this.height = 50;
        var offset = canvas.width / 8 - this.width / 2;
        this.x += offset;
    }

    this.y = generateRandom(-50, -300);
    this.speed = 5;
    this.status = 'active';
    obstacles.push(this);
}

Obj.prototype.draw = function () {

    var self = this;
    if (self.status === 'active') {

        if (self.type === 'circle') {

            //shell
            ctx.fillStyle = self.color;
            ctx.beginPath();
            ctx.arc(self.x, self.y, self.radius, 0, 2 * Math.PI);
            ctx.fill();

            //sub-core
            ctx.fillStyle = 'whitesmoke';
            ctx.beginPath();
            ctx.arc(self.x, self.y, self.radius - 5, 0, 2 * Math.PI);
            ctx.fill();

            //core
            ctx.fillStyle = self.color;
            ctx.beginPath();
            ctx.arc(self.x, self.y, self.radius - 15, 0, 2 * Math.PI);
            ctx.fill();

            //destroy
            // if (self.y + self.height > canvas.height) delete self;

            //check collission
            var car;
            if (self.color === 'red') car = car1;
            else car = car2;

            //collission with car
            //if(self.x === car.x && self.y + self.height)       

        } else if (self.type === 'rect') {

            //draw
            //shell
            ctx.fillStyle = self.color;
            ctx.fillRect(self.x, self.y, self.width, self.height);

            //sub-core
            ctx.fillStyle = 'whitesmoke';
            var offset = 5;
            ctx.fillRect(self.x + offset, self.y + offset, self.width - 2 * offset, self.height - 2 * offset);

            //core
            ctx.fillStyle = self.color;
            var offset = 15;
            ctx.fillRect(self.x + offset, self.y + offset, self.width - 2 * offset, self.height - 2 * offset);

            //destroy
            if (self.y > canvas.height) delete self;

            //collission with car
        }
    }
}

Obj.prototype.move = function () {
    var self = this;
    self.y += self.speed;
}

function init() {

    clear();
    score = 0;
    obstacles = [];
    $("#canvas").css('opacity', 1);
    car1 = new Car('blue');
    car2 = new Car('red');

    timer = setInterval(function () {
        clear();
        drawRoad();
        drawObstacles();
        car1.draw();
        car2.draw();
        if (gameStatus) {
            drawScore();
        }
    }, 20);

    objTimer = setInterval(function () {
        if (gameStatus) var o = new Obj();
    }, 1000);

}

function stop() {
    clearInterval(timer);
    clearInterval(objTimer);
    gameStatus = false;

    pre();

    $("#highscore").text("Highscore: " + highscore);
    $("#score").text("Score: " + score);
    $("#board").fadeIn(500);
}

function drawRoad() {

    //draw two road seperator
    ctx.fillStyle = 'black';
    ctx.fillRect(canvas.width / 2, 0, 3, canvas.height);


    //draw sub road seperator
    ctx.fillStyle = 'white';
    // ctx.lineJoin = 'dotted';
    ctx.fillRect(canvas.width / 4, 0, 2, canvas.height);
    ctx.fillRect(3 * canvas.width / 4, 0, 2, canvas.height);
}

function drawObstacles() {
    for (var i = 0; i < obstacles.length; i++) {
        obstacles[i].move();
        obstacles[i].draw();
        checkCollission(obstacles[i]);
    }
}

function drawScore(params) {
    ctx.fillStyle = 'white';
    ctx.font = '50px sans-serif';
    ctx.fillText(score, 50, 50);
}

function checkCollission(obstacle) {

    var col = false;

    //select car
    var car;
    if (obstacle.color === 'red') car = car2;
    else car = car1;

    //check collossion according to type
    if (obstacle.type === 'rect') {

        //up-down collission
        if (car.x > obstacle.x && car.x + car.width < obstacle.x + obstacle.width && car.y > obstacle.y && car.y < obstacle.y + obstacle.height)
            col = true;

        //left collission

        //right collission

    } else if (obstacle.type === 'circle') {
        if (car.x > obstacle.x - obstacle.radius && car.x + car.width < obstacle.x + obstacle.radius && car.y > obstacle.y - obstacle.radius && car.y < obstacle.y + obstacle.radius) {

            if (obstacle.status === 'active')
                score++;
            $("#score").text("Score: " + score);
            obstacle.status = 'dead';
        }

    }

    highscore = (score > highscore) ? score : highscore;
    if (col) stop();
}

function generateRandom(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randBool() {
    return (generateRandom(1, 100) % 2 === 0);
}

function randBinaryNum() {
    if (randBool()) return 1;
    else return 0;
}

function clear() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

$("#canvas").click(function (e) {
    var rect = canvas.getBoundingClientRect();
    var x = e.clientX - rect.left;

    var c;
    if (x < canvas.width / 2) c = car1;
    else c = car2;

    if (c.status === 'playing') {
        c.swipePos();
    }
});

$("#btnStart").click(function (e) {
    gameStatus = true;
    init();
    $("#board").fadeOut(500);
})


function pre() {
    //draw game starting background
    drawRoad();
    car1 = new Car('blue');
    car2 = new Car('red');
    var img = new Image();
    img.src = 'logo.png';
    img.onload = function () {
        ctx.drawImage(img, canvas.width / 2 - img.width / 2, canvas.height / 2 - img.height, img.width, img.height);
        car1.draw();
        car2.draw();
        $("#canvas").css('opacity', 0.9);
    }
}

pre();