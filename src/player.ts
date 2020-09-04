import * as PIXI from "pixi.js";
import { Input, InputType } from "./input";
import { Line, Physical, Vec } from "./physics";
import { Gamestate } from "./game";

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
        this.groundLine = new Line(new Vec(900, 400), new Vec(0, 500));

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
    step(state: Gamestate) {
        if (this.onGround == undefined) {//ballistic
            const nextPos = this.pos.plus(this.vel);
            //this.pos.increment(this.vel);
            //const c = collide(this.groundLine.a, this.groundLine.b, this.groundLine.a, this.groundLine.b, this.pos, nextPos);
            state;
            //const collide: { line: Line | undefined } = { line: undefined }; //state.world.checkCollide(this, nextPos);
            //if (collide != undefined) {//c != undefined) {
            if (this.groundLine.side(nextPos)) {
                this.onGround = this.groundLine;
                if (this.onGround != undefined) {//why does the typechecker bad
                    //this.pos.lerpEq(nextPos, c.y);
                    this.pos.setFrom(this.onGround.xy({ x: this.onGround.uv(nextPos).x, y: 0 }));
                    const vc = this.onGround.uv(this.vel)
                    this.vel.setFrom(this.onGround.xy({ x: vc.x, y: 0 }));
                } else
                    this.pos.setFrom(nextPos);
            } else
                this.pos.setFrom(nextPos);



            this.vel.increment(this.accel);
            this.vel.increment(new Vec((this.rightPressed ? 1 : 0) - (this.leftPressed ? 1 : 0), 0).scale(.01));
            if (this.jumping)
                this.vel.decrement(new Vec(0, .02));
            this.sprite.tint = 0xFFFFFF;

        } else {
            this.pos.increment(this.vel);
            //check if we leave the line
            const uv = this.onGround.uv(this.pos);
            //snap to line
            this.pos.setFrom(this.onGround.xy({ x: uv.x, y: 0 }));
            //this.vel.increment(this.accel);
            this.vel.increment(new Vec((this.rightPressed ? 1 : 0) - (this.leftPressed ? 1 : 0), 0).scale(1));;
            this.vel.scale(.8);

            if (uv.y > 1 || uv.y < 0) {
                this.onGround = undefined;
            }
            if (this.jumping) {
                this.onGround = undefined;
                this.vel.decrement(new Vec(0, 3));
            }
            this.sprite.tint = 0xAAFFAA;


        }
        this.pos.setFrom(this.pos.mod(1000));

        this.sprite.position.set(Math.floor(this.pos.x), Math.floor(this.pos.y));
    }

}

export { Player, TestPlayer };
