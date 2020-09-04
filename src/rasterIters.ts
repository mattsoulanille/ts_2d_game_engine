import { Pointy, Vec, mod } from "./physics";



export function* thickLine(a: Pointy, b: Pointy, s: number = 1): IterableIterator<Vec> {
    a = new Vec(a.x, a.y).unscale(s);
    b = new Vec(b.x, b.y).unscale(s);
    const diry = a.y > b.y ? -1 : 1;
    const dirx = a.x > b.x ? -1 : 1;
    let intersect = a.x;
    for (let y = Math.floor(a.y); y <= Math.floor(b.y); y += diry) {
        const oldix = intersect;
        if (y * diry + 1 > b.y * diry) //multiplying by diry makes a.y < b.y, so we going up in y
            intersect = b.x;
        else
            //p=(x,y) such that it's on the line and
            //p.y = y+diry
            //so p.x = (p.y/d.y)*d.x+a.x
            intersect = a.x + (b.x - a.x) * (y + diry) / (b.y - a.y);
        for (let x = oldix; x <= intersect; x += dirx) {
            yield new Vec(x, y);
        }
    }
}

export function* thickRect(l: Pointy, h: Pointy, s = 1): IterableIterator<Vec> {
    const lv = new Vec(l.x, l.y).unscale(s).floor();
    const hv = new Vec(h.x, h.y).unscale(s).floor();
    for (let y = lv.y; y <= hv.y; y++)
        for (let x = lv.x; x <= hv.x; x++)
            yield new Vec(x, y);

}
