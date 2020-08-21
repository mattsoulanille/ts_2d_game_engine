import * as PIXI from "pixi.js";
import { Input, InputType } from "./input";
import { Physical, Vec } from "./physics";
import { Line, collide } from "./collision";

interface Player {
    control: (i: Input) => void;
}

class TestPlayer implements Player, Physical {
    groundLine: Line;
    sprite: PIXI.Graphics;
    pos: Vec;
    vel: Vec;
    accel: Vec;
    onGround: Line | undefined = undefined;
    leftPressed = false;
    rightPressed = false;
    jumping = false;
    constructor() {
        this.sprite = new PIXI.Graphics();
        this.sprite.beginFill(0xffffff).drawCircle(0, 0, 8).endFill();
        this.pos = new Vec(50, 50);
        this.vel = new Vec(0, 0);
        this.accel = new Vec(0, .05);
        this.groundLine = new Line(new Vec(1000, 400), new Vec(0, 500));
    }

    control(i: Input) {
        if (i.t == InputType.KeyDown) {
            const ke = (i.d as KeyboardEvent);
            if (ke.code == "KeyW") {
                this.jumping = true;
            }
            if (ke.code == "KeyS") {
                this.vel.increment(new Vec(0, 0.1));
            }
            if (ke.code == "KeyA") {
                this.leftPressed = true;
            }
            if (ke.code == "KeyD") {
                this.rightPressed = true;
            }
        }
        if (i.t == InputType.KeyUp) {
            const ke = (i.d as KeyboardEvent);
            if (ke.code == "KeyW") {
                this.jumping = false;
            }
            if (ke.code == "KeyA") {
                this.leftPressed = false;
            }
            if (ke.code == "KeyD") {
                this.rightPressed = false;
            }
        }
    }
    step() {
        debugger;
        if (this.onGround == undefined) {//ballistic
            const nextPos = this.pos.plus(this.vel);
            //this.pos.increment(this.vel);
            //const c = collide(this.groundLine.a, this.groundLine.b, this.groundLine.a, this.groundLine.b, this.pos, nextPos);
            if (this.groundLine.side(nextPos)) {//c != undefined) {
                this.onGround = this.groundLine;
                //this.pos.lerpEq(nextPos, c.y);
                this.pos.setFrom(this.groundLine.xy({ x: this.groundLine.uv(nextPos).x, y: 0 }));
                this.vel.setFrom(this.vel.scaleComponent(this.groundLine.d.ccw().normalized(), -.4));
            } else {
                this.pos.setFrom(nextPos);
            }


            this.vel.increment(this.accel);
            this.vel.increment(new Vec((this.rightPressed ? 1 : 0) - (this.leftPressed ? 1 : 0), 0).scale(.01));
            if (this.jumping)
                this.vel.decrement(new Vec(0, .02));

        } else {
            this.pos.increment(this.vel);
            //snap to line
            this.pos.setFrom(this.groundLine.xy({ x: this.groundLine.uv(this.pos).x, y: 0 }));
            //this.vel.increment(this.accel);
            this.vel.increment(new Vec((this.rightPressed ? 1 : 0) - (this.leftPressed ? 1 : 0), 0).scale(0.1));;
            if (this.jumping) {
                this.onGround = undefined;
                this.vel.decrement(new Vec(0, 3));
            }



        }

        this.sprite.position.set(Math.floor(this.pos.x), Math.floor(this.pos.y));
    }

}

export {
    Player, TestPlayer
}
