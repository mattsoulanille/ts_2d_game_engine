import { Vec, Pointy, Line } from "./physics";
//colision stuff
// All colisions will be built off the primitive:
//      moving line segment collide with moving point
//        (essentially, find the intersection between a quad and a line in 3-space)
//     
// colision between moving lines is thus simply the min
//   of the collide of each endpoint agains the other line
var COLISION_EPSILON = 0;
function collide_w_origin(a: Vec, b: Vec, c: Vec, d: Vec): Vec | undefined {
    //returns s,t coords of the earlier colision if exists
    //if (a.isZero()) return new Vec(0,0);
    //if (b.isZero()) return new Vec(1,0);
    //if (c.isZero()) return new Vec(0,1);
    //if (d.isZero()) return new Vec(1,1);
	/*
	  the math:
	  s,t such that (a+(c-a)t) + ((b+(d-b)t)-(a+(c-a)t))s = 0
	  and s,t in [0,1]^2
	  
	  a + ct - at + bs + dts - bts - as - cts + ats = 0
	  let A,B,C,D = a,b-a,c-a,d-b-(c-a)
	  
	  (A+Ct) + (B+Dt)s = 0
	  A + Bs + Ct + Dst = 0
	  
	  Ax + Bx s + Cx t + Dx st = 0
	  Ay + By s + Cy t + Dy st = 0
	  
	  Ax + Bx s + Cx t + Dx st = Ay + By s + Cy t + Dy st = 0
	  
	  eh...
	  another approach:
	  
	  let P,Q = a+(c-a)t,(b+(d-b)t) - (a+(c-a)t)
	          = A+Ct    ,B+Dt
	   the line becomes P+Qs = 0
	   solution exists iff PxQ = 0
			solution is s = -P•P/(Q•P)
			condition is  PxQy = QxPy
		
		(Ax+tCx)(By+tDy) = (Bx+tDx)(Ay+tCy)
		(AxBy-BxAy) + t((CxBy+AxDy)-(CyBx+AyDx))+t^2(CxDy-DxCy) = 0
	*/
    const A = a;
    const B = b.minus(a);
    const C = c.minus(a);
    const dmb = d.minus(b);
    const D = dmb.minus(C);
    const qA = C.cross(D);
    const qB = C.cross(B) - A.cross(D);
    const qC = A.cross(B);

    if (Math.abs(qA) <= COLISION_EPSILON) { //linear
        if (Math.abs(qB) <= COLISION_EPSILON) { //constant
            if (Math.abs(qC) <= COLISION_EPSILON) { //zero
                //we are already on the line
                if (A.dot(A) <= COLISION_EPSILON) return new Vec(0, 0);
                if (B.dot(B) <= COLISION_EPSILON) return new Vec(1, 0);
                const d = B.dot(A);
                const n = A.dot(A);
                const s = -n / d;
                if (s < 0 || s > 1) {
                    //find first intersection with zero of a->c or b->d
                    const qAC = A.cross(C);
                    const qD = b.cross(dmb);

                    const asd = C.dot(A);
                    const bsd = dmb.dot(b);
                    if (Math.abs(qAC) > COLISION_EPSILON || Math.abs(asd) <= COLISION_EPSILON) {
                        //b->d or nothing
                        if (Math.abs(qD) > COLISION_EPSILON || Math.abs(bsd) <= COLISION_EPSILON) {
                            return undefined;
                        }
                        const bsn = b.dot(b);
                        const t = -bsn / bsd;
                        if (t < 0 || t > 1) {
                            return undefined;
                        }
                        return new Vec(1, t);
                    }
                    if (Math.abs(qD) > COLISION_EPSILON || Math.abs(bsd) <= COLISION_EPSILON) {
                        //a->c
                        const asn = A.dot(A);
                        const t = -asn / asd;
                        if (t < 0 || t > 1) {
                            return undefined;
                        }
                        return new Vec(0, t);
                    }
                    const bsn = b.dot(b);
                    const tb = -bsn / bsd;
                    const asn = A.dot(A);
                    const ta = -asn / asd;
                    if (tb < 0 || tb > 1) {
                        if (ta < 0 || ta > 1) {
                            return undefined;
                        }
                        return new Vec(0, ta);
                    }
                    if (ta < 0 || ta > tb) {
                        return new Vec(1, tb);
                    }
                    return new Vec(0, ta);
                }
                return new Vec(s, 0);
            }
            return undefined;
        }
        //linear
        //means one chance to get colision
        // qC+qBt = 0
        const t = -qC / qB;
        if (t < 0 || t > 1) {
            return undefined;
        }
        const lA = A.plus(C.times(t));
        const lB = B.plus(D.times(t));
        const n = lA.dot(lA);
        if (Math.abs(n) <= COLISION_EPSILON) {
            return new Vec(0, t);
        }
        const d = lB.dot(lA);
        if (Math.abs(d) <= COLISION_EPSILON) {
            return undefined;
        }
        const s = -n / d;
        if (s < 0 || s > 1) {
            return undefined;
        }
        return new Vec(s, t);
    }
    //quadratic, up to 2 chances for colision
    const det = qB * qB - 4 * qA * qC;
    if (det < 0) {
        return undefined;
    }
    const rd = Math.abs(Math.sqrt(det) / 2 / qA);
    const m = -qB / qA;

    if (m - rd > 1) {
        return undefined;
    }
    if (m - rd < 0) {
        const t = m + rd;
        if (t < 0 || t > 1) {
            return undefined;
        }
        const lA = A.plus(C.times(t));
        const lB = B.plus(D.times(t));
        const n = lA.dot(lA);
        if (Math.abs(n) <= COLISION_EPSILON) {
            return new Vec(0, t);
        }
        const d = lB.dot(lA);
        if (Math.abs(d) <= COLISION_EPSILON) {
            return undefined;
        }
        const s = -n / d;
        if (s < 0 || s > 1) {
            return undefined;
        }
        return new Vec(s, t);
    }
    let t = m - rd;
    const lA = A.plus(C.times(t));
    const lB = B.plus(D.times(t));
    const n = lA.dot(lA);
    if (Math.abs(n) <= COLISION_EPSILON) {
        return new Vec(0, t);
    }
    const den = lB.dot(lA);
    if (Math.abs(den) <= COLISION_EPSILON) {
        t = m + rd;
        const lA = A.plus(C.times(t));
        const lB = B.plus(D.times(t));
        const n = lA.dot(lA);
        if (Math.abs(n) <= COLISION_EPSILON) {
            return new Vec(0, t);
        }
        const d = lB.dot(lA);
        if (Math.abs(d) <= COLISION_EPSILON) {
            return undefined;
        }
        const s = -n / d;
        if (s < 0 || s > 1) {
            return undefined;
        }
        return new Vec(s, t);
    }
    const s = -n / den;
    if (s < 0 || s > 1) {
        t = m + rd;
        const lA = A.plus(C.times(t));
        const lB = B.plus(D.times(t));
        const n = lA.dot(lA);
        if (Math.abs(n) <= COLISION_EPSILON) {
            return new Vec(0, t);
        }
        const d = lB.dot(lA);
        if (Math.abs(d) <= COLISION_EPSILON) {
            return undefined;
        }
        const s = -n / d;
        if (s < 0 || s > 1) {
            return undefined;
        }
        return new Vec(s, t);
    }
    return new Vec(s, t);
}
function collide(l1: Vec, l2: Vec, l1n: Vec, l2n: Vec, p: Vec, pn: Vec): Vec | undefined {
    //adjust coordinate system to put point as 0
    return collide_w_origin(l1.minus(p), l2.minus(p), l1n.minus(pn), l2n.minus(pn));
}
function collideLines(l1: Vec, l2: Vec, l1n: Vec, l2n: Vec, l3: Vec, l4: Vec, l3n: Vec, l4n: Vec): number[] | undefined {
    //adjust coordinate system to put point as 0
    const c1 = collide(l1, l2, l1n, l2n, l3, l3n);
    const c2 = collide(l1, l2, l1n, l2n, l4, l4n);
    const c3 = collide(l3, l4, l3n, l4n, l1, l1n);
    const c4 = collide(l3, l4, l3n, l4n, l2, l2n);
    let best: Vec | undefined = undefined;
    for (let c of [c1, c2, c3, c4]) {
        if (c != undefined && (best == undefined || best.y > c.y))
            best = c;
    }
    if (best == undefined)
        return best;
    if (best == c1)
        return [best.y, best.x, 0];
    if (best == c2)
        return [best.y, best.x, 1];
    if (best == c3)
        return [best.y, 0, best.x];
    return [best.y, 1, best.x];
}


//colision shapes are polylines
interface Collidable {

}

// for static shapes, they can be stored as sets of convexhulls for speed

class Colmesh {
    hulls: Array<Convexhull>;
    constructor() { this.hulls = []; }






}

function vecify(p: Pointy) { return new Vec(p.x, p.y); }
class Convexhull {
    points: Array<Pointy>;
    constructor(p: Array<Pointy>, wound = false) { this.points = p; if (!wound) this.wind(); }

    get length(): number {
        return this.points.length;
    }

    line(i: number) {
        return new Line(vecify(this.points[i]), vecify(this.points[(i + 1) % this.points.length]));
    }
    delta(i: number) {
        return vecify(this.points[(i + 1) % this.points.length]).minus(this.points[i]);
    }
    contains(p: Pointy) {
        for (let i = 0; i < this.length; i++) {
            if (!this.line(i).side(p)) {
                return false;
            }
        }
        return true;
    }
    intersections(l: Line) {
        const ixs: Array<Vec> = [];
        for (let i = 0; i < this.length; i++) {
            const x = this.line(i).st(l)
            if (x.x >= 0 && x.x < 1 && x.y >= 0 && x.y < 1) {
                ixs.push(x);
            }
        }
        return ixs;
    }
    plus(o: Convexhull): Convexhull {//minkowsky sum
        if (o.length == 0 || this.length == 0) {
            return new Convexhull([]);
        }
        const r: Array<Vec> = [vecify(this.points[0]).increment(o.points[0])];
        let i = 0;//todo: verify me
        let j = 0;

        while (i < this.length && j < o.length) {
            const d1 = this.delta(i);
            const d2 = o.delta(j);
            const c = d1.pseudoAngle - d2.pseudoAngle;
            if (c < 0) {
                //add d1
                r.push(r[r.length - 1].plus(d1));
                i++;
            } else {
                if (c > 0) {
                    r.push(r[r.length - 1].plus(d2));
                    j++;
                } else {
                    r.push(r[r.length - 1].plus(d1).increment(d2));
                    i++;
                    j++;
                }
            }
        }
        while (i < this.length) {
            r.push(r[r.length - 1].plus(this.delta(i)));
            i++;
        }
        while (j < o.length) {
            r.push(r[r.length - 1].plus(o.delta(j)));
            j++;
        }
        return new Convexhull(r, true);
    }
    addPoint(p: Pointy) {
        this.points.push(p);
        this.wind();
    }
    wind() {
        //winds the hull
        if (this.points.length > 1) {
            this.points = this.points.sort((a: Pointy, b: Pointy) => a.y - b.y);
            const h: Array<Pointy> = [this.points[0]];
            let i = 1;
            const p = [-3];
            while (i < this.points.length) {
                let a = new Vec(h[h.length - 1].x, h[h.length - 1].y).rminus(this.points[i]).pseudoAngle;
                while (a <= p[p.length - 1]) {
                    h.pop();
                    a = new Vec(h[h.length - 1].x, h[h.length - 1].y).rminus(this.points[i]).pseudoAngle;
                    p.pop();
                }
                h.push(this.points[i]);
                p.push(a);
                i++;
            }
            while (i > 0) {
                i--;
                let a = new Vec(h[h.length - 1].x, h[h.length - 1].y).rminus(this.points[i]).pseudoAngle;
                while (a <= p[p.length - 1]) {
                    h.pop();
                    a = new Vec(h[h.length - 1].x, h[h.length - 1].y).rminus(this.points[i]).pseudoAngle;
                    p.pop();
                }
                h.push(this.points[i]);
                p.push(a);
            }
            this.points = h;
        }
    }
}




export {
    collideLines, collide, Collidable

}
