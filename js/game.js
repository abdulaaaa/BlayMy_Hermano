const cvs = document.getElementById("gameCanvas");
const ctx = cvs.getContext("2d");

const canWidth = window.innerWidth;
cvs.width = canWidth;
const canHeight = window.innerHeight;
cvs.height = canHeight;

let frames = 0;
const deg = Math.PI/180;

const sprite = new Image();
sprite.src = "media/sheet.png";

const state = {
    current : 0,
    getReady : 0,
    game : 1,
    over : 2
}

const startBtn = {
    x : (canWidth / 2) - (83 / 2),
    y : (1 / 6 * canHeight) + 157,
    w : 83,
    h : 29
}

window.onresize = function(){ location.reload(); }

cvs.addEventListener("click", function(evt){
    switch(state.current){
        case state.getReady:
            state.current = state.game;
            break;
        case state.game:
            if(player.y - player.radius <= 0) return;
            player.flap();
            break;
        case state.over:
            let rect = cvs.getBoundingClientRect();
            let clickX = evt.clientX - rect.left;
            let clickY = evt.clientY - rect.top;
            
            // CHECK IF WE CLICK ON THE START BUTTON
            console.log(startBtn.x);
            console.log(startBtn.y);
            if(clickX >= startBtn.x && clickX <= startBtn.x + startBtn.w && clickY >= startBtn.y && clickY <= startBtn.y + startBtn.h){
                pipes.reset();
                player.speedReset();
                score.reset();
                state.current = state.getReady;
            }
            break;
    }
});


const background = {
    sX : 0,
    sY : 0,
    w : 275,
    h : 226,
    x : 0,
    y : cvs.height - 226,

    imgIdx : Math.ceil(canWidth / 275),
    
    draw : function() {
        for(i = 0; i < this.imgIdx; i++) {
            ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x + (i * this.w), this.y, this.w, this.h);
        }
        
        
    }
    
}

const foreground = {
    sX: 276,
    sY: 0,
    w: 224,
    h: 112,
    x: 0,
    y: canHeight - 112,
    
    dx : 2,

    imgIdx : Math.ceil(canWidth / 224),

    draw : function(){
        for(i = 0; i < this.imgIdx; i++) {
            ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x + (i * this.w), this.y, this.w, this.h);
            ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x + (i * this.w) + (i * this.w), this.y, this.w, this.h);
        }
    },
    
    update: function(){
        if(state.current == state.game) {
            this.x = (this.x - this.dx) % (this.w/2);
        }
    }
}

// player
const player = {
    animation : [
        {sX: 276, sY : 112},
        {sX: 276, sY : 139},
        {sX: 276, sY : 164},
        {sX: 276, sY : 139}
    ],
    x : 5 / 32 * canWidth,
    y : 15 / 48 * canHeight,
    w : 34,
    h : 26,
    
    radius : 12,
    
    frame : 0,
    
    gravity : 0.25,
    jump : 4.6,
    speed : 0,
    rotation : 0,
    
    draw : function(){
        let player = this.animation[this.frame];
        
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.drawImage(sprite, player.sX, player.sY, this.w, this.h,- this.w/2, - this.h/2, this.w, this.h);
        
        ctx.restore();
    },
    
    flap : function(){
        this.speed = - this.jump;
    },
    
    update: function(){

        this.period = state.current == state.getReady ? 10 : 5;

        this.frame += frames%this.period == 0 ? 1 : 0;

        this.frame = this.frame%this.animation.length;
        
        if(state.current == state.getReady){
            this.y = 15 / 48 * canHeight; 
            this.rotation = 0 * deg;
        }else{
            this.speed += this.gravity;
            this.y += this.speed;
            
            if(this.y + this.h/2 >= cvs.height - foreground.h) {
                this.y = cvs.height - foreground.h - this.h/2;
                if(state.current == state.game){
                    state.current = state.over;
                }
            }
            
            //falling
            if(this.speed >= this.jump) {
                this.rotation = 90 * deg;
                this.frame = 1;
            }else {
                this.rotation = -25 * deg;
            }
        }
        
    },
    speedReset : function() {
        this.speed = 0;
    }
}

const getReady = {
    sX : 0,
    sY : 228,
    w : 173,
    h : 152,
    x : (canWidth/2) - (185/2),
    y : 1 / 6 * canHeight,
    
    draw: function() {
        if(state.current == state.getReady){
            ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);
        }
    }
    
}

const gameOver = {
    sX : 175,
    sY : 228,
    w : 225,
    h : 202,
    x : (canWidth/2) - (250/2),
    y : 90,
    
    draw: function() {
        if(state.current == state.over){
            ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);   
        }
    }
    
}

const pipes = {
    position : [],
    
    top : {
        sX : 553,
        sY : 0
    },
    bottom:{
        sX : 502,
        sY : 0
    },
    
    w : 53,
    h : 400,
    gap : 85,
    maxYPos : -150,
    dx : 2,
    
    draw : function(){
        for(let i  = 0; i < this.position.length; i++){
            let p = this.position[i];
            
            let topYPos = p.y;
            let bottomYPos = p.y + this.h + this.gap;
            
            //top pipe
            ctx.drawImage(sprite, this.top.sX, this.top.sY, this.w, this.h, p.x, topYPos, this.w, this.h);  
            
            //bottom pipe
            ctx.drawImage(sprite, this.bottom.sX, this.bottom.sY, this.w, this.h, p.x, bottomYPos, this.w, this.h);  
        }
    },
    
    update: function(){
        if(state.current !== state.game) return;
        
        if(frames%100 == 0){
            this.position.push({
                x : cvs.width,
                y : this.maxYPos * ( Math.random() + 1)
            });
        }
        for(let i = 0; i < this.position.length; i++){
            let p = this.position[i];
            
            let bottomPipeYPos = p.y + this.h + this.gap;
            
            //collision
            if(player.x + player.radius > p.x && player.x - player.radius < p.x + this.w && player.y + player.radius > p.y && player.y - player.radius < p.y + this.h){
                state.current = state.over;
            }

            if(player.x + player.radius > p.x && player.x - player.radius < p.x + this.w && player.y + player.radius > bottomPipeYPos && player.y - player.radius < bottomPipeYPos + this.h){
                state.current = state.over;
            }
            
            p.x -= this.dx;
            
            // delete if outside screen
            if(p.x + this.w <= 0){
                this.position.shift();
                score.value += 1;
                score.best = Math.max(score.value, score.best);
                //localStorage.setItem("best", score.best);
            }
        }
    },
    
    reset : function(){
        this.position = [];
    }
    
}

const score = {
    best : 0, //parseInt(localStorage.getItem("best")) || 0,
    value : 0,
    
    draw : function(){
        ctx.fillStyle = "#FFF";
        ctx.strokeStyle = "#000";
        
        if(state.current == state.game){
            ctx.lineWidth = 2;
            ctx.font = "35px Teko";
            x = canWidth/2 - 20
            ctx.fillText(this.value, x, 50);
            ctx.strokeText(this.value, x, 50);
            
        }else if(state.current == state.over){
            x = (canWidth/2) + (225/4),

            ctx.font = "25px Teko";
            ctx.fillText(this.value, x, 186);
            ctx.strokeText(this.value, x, 186);

            ctx.fillText(this.best, x, 228);
            ctx.strokeText(this.best, x, 228);

        }
    },
    
    reset : function(){
        this.value = 0;
    }
}

function draw(){
    ctx.fillStyle = "#70c5ce";
    ctx.fillRect(0, 0, cvs.width, cvs.height);
    
    background.draw();
    pipes.draw();
    foreground.draw();
    player.draw();
    getReady.draw();
    gameOver.draw();
    score.draw();
}

function update(){
    player.update();
    foreground.update();
    pipes.update();
}

function loop(){
    update();
    draw();
    frames++;
    
    requestAnimationFrame(loop);
}
loop();
