//
import * as PIXI from "pixi.js";



interface Physical {
    step: () => void;
}

class Ballistic implements Physical {
    pos: Vec;
    vel: Vec;
    acc: Vec;
    constructor() {
        this.pos = new Vec();
        this.vel = new Vec();
        this.acc = new Vec();
    }
    step() {
        this.pos.increment(this.vel);
        this.vel.increment(this.acc);
    }

}


type Pointy = {
    x: number;
    y: number;
}


var rz = 1;
while (rz * rz != 0) {
    rz /= 2;
}


const ROOT_ZERO = rz;


function pseudoCosine(n: number) {
    n = (((n % 4) + 4) % 4) - 2;
    return Math.abs(n) - 1;
}
function pseudoSine(n: number) {
    return pseudoCosine(n - 1);
}

function mod(a: number, b: number) {
    return ((a % b) + b) % b;
}

class Vec extends PIXI.Point {
    constructor(x: number | undefined = undefined, y: number | undefined = undefined) { super(x, y); }
    clone() {
        return new Vec(this.x, this.y);
    }
    copy() {
        return this.clone();
    }
    setFrom(o: Pointy) {
        this.x = o.x;
        this.y = o.y;
    }
    //nicies
    get mag2(): number {
        return this.dot(this);
    }
    set mag2(n: number) {
        this.normalize(Math.sqrt(n));
    }
    get mag(): number {
        return Math.sqrt(this.mag2);
    }
    set mag(n: number) {
        this.normalize(n);
    }
    get angle(): number {
        return Math.atan2(this.y, this.x);
    }
    set angle(a: number) {
        this.rotate(a - this.angle);
    }
    get pseudoAngle(): number {
        const d = Math.abs(this.x) + Math.abs(this.y);
        if (d == 0) {
            return 0;
        }
        const p = 1 - this.x / d;
        if (this.y > 0) return p;
        return -p;
    }
    set pseudoAngle(pa: number) {
        const s = pseudoSine(pa);
        const c = pseudoCosine(pa);
        const m = this.mag;
        this.x = c;
        this.y = s;
        this.normalize(m);
    }

    ccw(): Vec {
        return new Vec(-this.y, this.x);
    }
    cw(): Vec {
        return new Vec(this.y, -this.x);
    }
    //math stuff
    isZero(): boolean {
        return this.x == 0 && this.y == 0;
    }
    dot(o: Pointy) {
        return this.x * o.x + this.y * o.y;
    }
    cross(o: Pointy) {
        return this.x * o.y - this.y * o.x;
    }
    normalize(m = 1): Vec {
        if ((this.x == 0 && this.y == 0) || m == 0) {
            this.x = m;
            return this;
        }
        const mag2 = this.dot(this);
        if (mag2 == 0) {
            return this.scale(1 / ROOT_ZERO).normalize(m);
        }
        if (mag2 == Infinity) {
            if (Math.abs(this.x) == Infinity) {
                if (Math.abs(this.y) == Infinity) {
                    this.x = Math.sign(this.x);
                    this.y = Math.sign(this.y);
                    return this.normalize(m);
                }
                this.y = 0;
                this.x = Math.sign(this.x) * m;
                return this;
            }
            if (Math.abs(this.y) == Infinity) {
                this.x = 0;
                this.y = Math.sign(this.y) * m;
                return this;
            }
            return this.scale(ROOT_ZERO).normalize(m);
        }
        return this.scale(m / Math.sqrt(mag2));
    }
    normalized(m = 1) {
        return this.clone().normalize(m);
    }
    rotate(a: number) {
        const s = Math.sin(a);
        const c = Math.cos(a);
        const tmp = this.x * c - this.y * s;
        this.y = this.x * s + this.y * c;
        this.x = tmp;
        return this;
    }
    rotated(a: number) {
        return this.clone().rotate(a);
    }
    increment(o: Pointy) {
        this.x += o.x;
        this.y += o.y;
        return this;
    }
    plus(o: Pointy) {
        return new Vec(this.x + o.x, this.y + o.y);
    }
    decrement(o: Pointy) {
        this.x -= o.x;
        this.y -= o.y;
        return this;
    }
    minus(o: Pointy) {
        return new Vec(this.x - o.x, this.y - o.y);
    }
    rminus(o: Pointy) {
        return new Vec(o.x - this.x, o.y - this.y);
    }
    chs() {
        return new Vec(-this.x, -this.y);
    }
    //negative() { return this.chs(); }
    negate() {
        this.x = -this.x; this.y = -this.y;
        return this;
    }
    scale(n: number) {
        this.x *= n;
        this.y *= n;
        return this;
    }
    times(n: number) {
        return new Vec(this.x * n, this.y * n);
    }
    vscale(o: Pointy) {
        this.x *= o.x;
        this.y *= o.y;
        return this;
    }
    vtimes(o: Pointy) {
        return new Vec(this.x * o.x, this.y * o.y);
    }
    unscale(n: number) {
        this.x /= n;
        this.y /= n;
        return this;
    }
    divide(n: number) {
        return new Vec(this.x / n, this.y / n);
    }
    vunscale(o: Pointy) {
        this.x /= o.x;
        this.y /= o.y;
        return this;
    }
    vdivide(o: Pointy) {
        return new Vec(this.x / o.x, this.y / o.y);
    }
    vmax(o: Pointy) {
        return new Vec(Math.max(this.x, o.x), Math.max(this.y, o.y));
    }
    vmin(o: Pointy) {
        return new Vec(Math.min(this.x, o.x), Math.min(this.y, o.y));
    }
    max(o: number) {
        return new Vec(Math.max(this.x, o), Math.max(this.y, o));
    }
    min(o: number) {
        return new Vec(Math.min(this.x, o), Math.min(this.y, o));
    }
    func(f: (a: number, b: number) => number, o: Pointy) {
        return new Vec(f(this.x, o.x), f(this.y, o.y));
    }
    map(f: (a: number) => number) {
        return new Vec(f(this.x), f(this.y));
    }
    floor() {
        return new Vec(Math.floor(this.x), Math.floor(this.y));
    }
    round() {
        return new Vec(Math.round(this.x), Math.round(this.y));
    }
    ceil() {
        return new Vec(Math.ceil(this.x), Math.ceil(this.y));
    }

    vmod(o: Pointy) {
        return this.func(mod, o);
    }
    mod(o: number) {
        return this.map((a: number) => mod(a, o));
    }
    vrem(o: Pointy) {
        return new Vec(this.x % o.x, this.y % o.y);
    }
    rem(o: number) {
        return new Vec(this.x % o, this.y % o);
    }

    //fancier vector thingies
    uv(o: Pointy) {
        return new Vec(this.dot(o), this.cross(o)).unscale(this.mag2);
    }
    xy(o: Pointy) {
        return this.times(o.x).increment(this.ccw().scale(o.y));
    }
    reflectNormal(o: Pointy) {
        const u = this.dot(o) / this.mag2;
        return this.times(-2 * u).plus(o);
    }
    reflectAlong(o: Pointy) {
        return this.ccw().reflectNormal(o);
    }

    lerp(o: Pointy, t: number) {
        return new Vec(this.x * (1 - t) + o.x * t, this.y * (1 - t) + o.y * t);
    }
    lerpEq(o: Pointy, t: number) {
        this.x = this.x * (1 - t) + o.x * t;
        this.y = this.y * (1 - t) + o.y * t;
    }


    scaleComponent(dir: Pointy, scale: number) {
        const comp = this.scale(this.dot(dir) / this.mag2)
        return this.plus(comp.scale(scale - 1));
    }


}








export {
    Physical,
    Vec, mod, pseudoSine, pseudoCosine,
    Pointy,
}
