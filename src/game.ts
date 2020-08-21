import * as PIXI from "pixi.js";

import { Input, InputListener } from "./input";
import { Player, TestPlayer } from "./player";
import { Physical } from "./physics";


class Gamestate {
    time: number;
    inputs: InputListener;
    past: Array<Array<Input>>;
    players: Array<Player>;
    physicsObjects: Array<Physical>;
    display: PIXI.Container;

    debugText: PIXI.Text;
    constructor() {
        this.time = 0;
        this.past = [];
        this.inputs = new InputListener();
        this.players = [];
        this.physicsObjects = [];
        this.display = new PIXI.Container();

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
            po.step();
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

export { Gamestate, testState }
