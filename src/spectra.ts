import * as PIXI from "pixi.js";


type Trivectorish = {
    x: number; y: number; z: number
}

function loggyExpeyDist(x: number, m = 1): number {
    if (x <= 0) return 0;
    const l = Math.log(x)
    return Math.exp(-m * l * l);
}
function square(d: number) { return d * d; }
function gaussian(x: number, a: number, m: number, s1: number, s2: number) {
    return a * Math.exp(-square((x - m) / (x < m ? s1 : s2)) / 2);
}
function XYZofWavelength(nm: number) {
    const a = nm * 10;//angstroms
    return new Trivector(
        gaussian(a, 1.056, 5998, 379, 310) +
        gaussian(a, 0.362, 4420, 160, 267) +
        gaussian(a, -0.065, 5011, 204, 262),
        gaussian(a, 0.821, 5688, 469, 405) +
        gaussian(a, 0.286, 5309, 163, 311),
        gaussian(a, 1.217, 4370, 118, 360) +
        gaussian(a, 0.681, 4590, 260, 138)
    );

}
function CIETristimulus(nm: number): Trivector {
    return new Trivector(
        0.398 * loggyExpeyDist((nm + 570.1) / 1014, 1250) +
        1.132 * loggyExpeyDist((1338 - nm) / 743.5, 234),
        1.011 * Math.exp(-.5 * square((nm - 556.1) / 46.14)),
        2.060 * loggyExpeyDist((nm - 265.8) / 180.4, 32));
}
function linear_to_byte_gamma2_4(c: number) {
    return c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1. / 2.4) - 0.055;
}

const h = 6.62607015e-34;  // J s
const c = 299792458;       // m      / s
const kb = 1.38064852e-23; // m^2 kg / s^2 K

function blackbody_wl(t: number, m: number) {
    const k = (2 * h * c * c / (m * m * m * m * m));
    return k / Math.expm1(h * c / (m * kb * t));
}
function blackbody_f(t: number, v: number) {
    const k = (2 * h * v * v * v) / (c * c);
    return k / Math.expm1(h * v / (kb * t));
}

function labGammaForward(t: number) {
    const d = 6 / 29;
    return t > (d * d * d) ? Math.cbrt(t) : 4 / 29 + t / (3 * d * d);
}
function labGammaInverse(t: number) {
    const d = 6 / 29;
    return t > d ? t * t * t : 3 * d * d * (t - 4 / 29);
}



class Trivector {
    //3d vector for things like tristimulus values
    constructor(public x: number, public y: number, public z: number) { }

    times(o: number | Trivectorish) {
        if (typeof (o) !== "number") {
            return new Trivector(this.x * o.x, this.y * o.y, this.z * o.z);
        }
        return new Trivector(this.x * o, this.y * o, this.z * o);
    }
    plus(o: number | Trivectorish) {
        if (typeof (o) !== "number") {
            return new Trivector(this.x + o.x, this.y + o.y, this.z + o.z);
        }
        return new Trivector(this.x + o, this.y + o, this.z + o);
    }
    divide(o: number | Trivectorish) {
        if (typeof (o) !== "number") {
            return new Trivector(this.x / o.x, this.y / o.y, this.z / o.z);
        }
        return new Trivector(this.x / o, this.y / o, this.z / o);
    }
    minus(o: number | Trivectorish) {
        if (typeof (o) !== "number") {
            return new Trivector(this.x - o.x, this.y - o.y, this.z - o.z);
        }
        return new Trivector(this.x - o, this.y - o, this.z - o);
    }
    max(o: number | Trivectorish) {
        if (typeof (o) !== "number") {
            return new Trivector(Math.max(this.x, o.x), Math.max(this.y, o.y), Math.max(this.z, o.z));
        }
        return new Trivector(Math.max(this.x, o), Math.max(this.y, o), Math.max(this.z, o));
    }
    min(o: number | Trivectorish) {
        if (typeof (o) !== "number") {
            return new Trivector(Math.min(this.x, o.x), Math.min(this.y, o.y), Math.min(this.z, o.z));
        }
        return new Trivector(Math.min(this.x, o), Math.min(this.y, o), Math.min(this.z, o));
    }
    bound(l: number | Trivectorish, h: number | Trivectorish) {
        return this.max(l).min(h);
    }
    func(f: (a: number, b: number) => number, o: number | Trivectorish) {
        if (typeof (o) !== "number") {
            return new Trivector(f(this.x, o.x), f(this.y, o.y), f(this.z, o.z));
        }
        return new Trivector(f(this.x, o), f(this.y, o), f(this.z, o));
    }
    map(f: (a: number) => number) {
        return new Trivector(f(this.x), f(this.y), f(this.z));
    }
    dot(o: Trivectorish) {
        return this.x * o.x + this.y * o.y + this.z * o.z;
    }
    tridot(a: Trivectorish, b: Trivectorish, c: Trivectorish) {
        return new Trivector(this.dot(a), this.dot(b), this.dot(c));
    }
    matrix(m: Trivectorish[]) {
        return this.tridot(m[0], m[1], m[2]);
    }
    static XYZtoRGB: Trivectorish[] = [
        new Trivector(.41847, -.15866, -.082835),
        new Trivector(-.091169, .25243, .015708),
        new Trivector(.00092090, -.0025498, .17860)];
    static RGBtoXYZ: Trivectorish[] = [
        new Trivector(.49000, .31000, .20000).divide(.17697),
        new Trivector(.17697, .81240, .01063).divide(.17697),
        new Trivector(.00000, .01000, .99000).divide(.17697)];
    static tri_to_rgb: Trivectorish[] = [
        new Trivector(3.2406255, -1.537208, -0.4986286),
        new Trivector(-0.9689307, 1.8757561, 0.0415175),
        new Trivector(0.0557101, -0.2040211, 1.0569959)];
    color() {
        return PIXI.utils.rgb2hex([this.x, this.y, this.z]);
    }
    normalize() {
        return this.divide(Math.sqrt(this.dot(this)));
    }

}

class ColorMatrix {
    public m: number[];
    constructor(a: number[] | undefined) {
        if (a == undefined) {
            this.m = [
                1, 0, 0, 0, 0,
                0, 1, 0, 0, 0,
                0, 0, 1, 0, 0,
                0, 0, 0, 1, 0];
        } else {
            this.m = a;
        }
    }
    e(r: number, c: number) {
        return this.m[5 * r + c];
    }
    s(r: number, c: number, v: number) {
        const t = this.m[5 * r + c];
        this.m[5 * r + c] = v;
        return t;
    }
    get r() {
        return [this.m[0], this.m[5], this.m[10], this.m[15]];
    }
    set r(v: number[]) {
        this.m[0] = v[0]; this.m[5] = v[1]; this.m[10] = v[2]; this.m[15] = v[3];
    }
    get g() {
        return [this.m[1], this.m[6], this.m[11], this.m[16]];
    }
    set g(v: number[]) {
        this.m[1] = v[0]; this.m[6] = v[1]; this.m[11] = v[2]; this.m[16] = v[3];
    }
    get b() {
        return [this.m[2], this.m[7], this.m[12], this.m[17]];
    }
    set b(v: number[]) {
        this.m[2] = v[0]; this.m[7] = v[1]; this.m[12] = v[2]; this.m[17] = v[3];
    }
    get a() {
        return [this.m[3], this.m[8], this.m[13], this.m[18]];
    }
    set a(v: number[]) {
        this.m[3] = v[0]; this.m[8] = v[1]; this.m[13] = v[2]; this.m[18] = v[3];
    }
    get c() {
        return [this.m[4], this.m[9], this.m[14], this.m[19]];
    }
    set c(v: number[]) {
        this.m[4] = v[0]; this.m[9] = v[1]; this.m[14] = v[2]; this.m[19] = v[3];
    }
    mul(o: ColorMatrix) {
        //add an imaginary fifth row that is [0,0,0,0,1]

        //             r g b a c
        //             r g b a c
        //       other r g b a c 
        //             r g b a c
        //  this       0 0 0 0 1
        //   R G B A C|. . . . t
        //   R G B A C|. . . . t
        //   R G B A C|. . . . t
        //   R G B A C|. . . . t
        //   0 0 0 0 1|0 0 0 0 1
        // . is normal mat mult
        // t is (this.4x4)*c+C
        const res = new Array<number>(20);
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                res[r * 5 + c] = 0;
                for (let i = 0; i < 4; i++) {
                    res[r * 5 + c] += this.e(r, i) * o.e(i, c);
                }
            }
            //fifth col
            res[r * 5 + 4] = this.m[r * 5 + 4];
            for (let i = 0; i < 4; i++) {
                res[r * 5 + 4] += this.e(r, i) * o.e(i, 4);
            }
        }
        return new ColorMatrix(res);
    }
    premul(o: ColorMatrix) {
        return o.mul(this);
    }
    apply(rgba: number[]) {
        const res = new Array<number>(4);
        for (let r = 0; r < 4; r++) {
            res[r] = this.e(r, 4);
            for (let c = 0; c < 4; c++) {
                res[r] += this.e(r, c) * rgba[c];
            }
        }
        return res;
    }
    scale3x3(n: number) {
        for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 3; c++) {
                this.m[r * 5 + c] *= n;
            }
        }
        return this;
    }
}
function wlsToXYZColorMatrix(rwl: number, gwl: number, bwl: number) {
    const rhat = XYZofWavelength(rwl);
    const ghat = XYZofWavelength(gwl);
    const bhat = XYZofWavelength(bwl);
    return new ColorMatrix([
        rhat.x, ghat.x, bhat.x, 0, 0,
        rhat.y, ghat.y, bhat.y, 0, 0,
        rhat.z, ghat.z, bhat.z, 0, 0,
        0, 0, 0, 1, 0]);
}

const CM_XYZ_to_RGB = new ColorMatrix([
    .41847, -.15866, -.082835, 0, 0,
    -.091169, .25243, .015708, 0, 0,
    .00092090, -.0025498, .17860, 0, 0,
    0, 0, 0, 1, 0
]);

function wlsToRGBColorMatrix(rwl: number, gwl: number, bwl: number) {
    return CM_XYZ_to_RGB.mul(wlsToXYZColorMatrix(rwl, gwl, bwl));
}


const D65_xyz = new Trivector(95.0489, 100, 108.8840);
const D50_xyz = new Trivector(96.4212, 100, 82.5188);
function xyzToLAB(i: Trivector, wp = D65_xyz) {
    const t = i.divide(wp).map(labGammaForward)
    return new Trivector(116 * t.y - 16, 500 * (t.x - t.y), 200 * (t.y - t.z));
}
function LABToxyz(i: Trivector, wp = D65_xyz) {
    return wp.times(new Trivector(i.y / 500, 0, -i.z / 200).plus((i.x + 16) / 116).map(labGammaInverse))
}

export {
    Trivector,
    CIETristimulus,
    XYZofWavelength,
    linear_to_byte_gamma2_4,
    blackbody_wl,
    blackbody_f,
    D65_xyz, D50_xyz, xyzToLAB, LABToxyz,

    ColorMatrix, wlsToXYZColorMatrix, CM_XYZ_to_RGB, wlsToRGBColorMatrix
}
