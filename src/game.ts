import * as PIXI from "pixi.js";

import { Input, InputListener, InputType } from "./input";
import { Player, TestPlayer } from "./player";
import { Physical, Vec, Pointy } from "./physics";
import { Collideable } from "./collision_detection";
import { World, } from "./world";
import { toggleTile } from "./browser";
import { Sprite } from "./sprite";



type Ptype = Sprite & {
    vel: Vec,

};


type Gamestate = {
    player: Ptype;
    cam: { pos: { x: number, y: number }, smooth: Pointy[] };
    world: World;
}


function tileAt(v: Vec, s: Gamestate) {
    const c = v.floor();
    const r = s.world.tileMap.tiles[c.y];
    return r == undefined ? -1 : r[c.x] == undefined ? -1 : r[c.x];
}


export function step(state: Gamestate) {
    state.player.pos.increment(state.player.vel);
    state.player.vel.increment(new Vec(0, 0.01));
    if (tileAt(state.player.pos, state)) {
        state.player.vel.scale(0);
    }
}


export function applyInputs(state: Gamestate, inputs: InputListener) {
    for (let inp of inputs.inputs) {
        if (inp.t == InputType.KeyDown) {
            const ke = (inp.d as KeyboardEvent);
            if (ke.keyCode == 37) //left
                state.player.vel.x -= 1;
            if (ke.keyCode == 38) //up
                state.player.vel.y -= 1;
            if (ke.keyCode == 39) //right
                state.player.vel.x += 1;
            if (ke.keyCode == 40) //down
                state.player.vel.y += 1;

            if (ke.keyCode == 65) //a
                state.player.vel.x -= .1;
            if (ke.keyCode == 87) //w
                state.player.vel.y -= .1;
            if (ke.keyCode == 68) //d
                state.player.vel.x += .1;
            if (ke.keyCode == 83) //s
                state.player.vel.y += .1;


        }
        if (inp.t == InputType.MouseClick) {
            const me = (inp.d as MouseEvent);
            const pos = new Vec(me.offsetX, me.offsetY);
            toggleTile(pos);
        }
    }

    inputs.clear();
}




/*class Gamestate {
    time = 0;
    inputs = new InputListener();
    past: Array<Array<Input>> = [];
    players: Array<Player>;
    physicsObjects: Array<Physical>;

    colisionObjects: Array<Collideable>;

    display = new PIXI.Container();

    world: World;


    debugText: PIXI.Text;
    constructor() {
        this.players = [];
        this.physicsObjects = [];
        this.colisionObjects = [];


        //test world
        this.world = testworld();


        //debuginfo
        this.debugText = new PIXI.Text("Debug text.", new PIXI.TextStyle({ fill: 0xffffff }));
        this.display.addChild(this.debugText);
    }

    attach(d: Document) {
        this.inputs.attach(d)
    }
    detach() {
        return this.inputs.detach();
    }
    step(dt: number = -1) {
        if (this.inputs.inputs.length != 0) {
            this.past[this.time] = this.inputs.inputs;
            for (var inp of this.inputs.inputs) {
                this.control(inp);
            }
            this.inputs.clear();
        }
        this.physics();
        this.time += 1;


        this.debugText.text = "Debug\nTime:" + this.time + "\nrate:" + 1 / dt;
    }
    control(i: Input) {
        for (var p of this.players) {
            p.control(i);
        }
    }
    physics() {
        for (var po of this.physicsObjects) {
            po.step(this);
        }
    }
}

function testState(): Gamestate {
    const g = new Gamestate();
    const t = new TestPlayer();
    g.players.push(t);
    g.physicsObjects.push(t);
    g.display.addChild(t.sprite);
    return g;
}
*/
export { Gamestate }
