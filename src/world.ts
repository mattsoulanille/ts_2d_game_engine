import { Pointy, Vec, mod } from "./physics";
import { thickLine } from "./rasterIters";

//tile based

type TV = { t: Tile, c: Vec };

class TileMap implements Tile {
    map: Array<Array<Tile>>;
    tileSize: number;
    constructor() {
        this.map = [];
        this.tileSize = 16;
    }

    tileCoord(p: Pointy): Vec { return new Vec(Math.floor(p.x / this.tileSize), Math.floor(p.y / this.tileSize)); }
    tileUV(p: Pointy): Vec { return new Vec(mod(p.x / this.tileSize, 1), mod(p.y / this.tileSize, 1)); }

    getTile(x: Pointy | number, y: number | undefined = undefined): Tile | undefined {
        if (typeof x !== "number") {
            return this.getTile(x.x, x.y);
        } else {
            if (y == undefined)
                return y;
            if (this.map[y] == undefined)
                return undefined;
            return this.map[y][x];
        }
    }
    collide(p: Pointy): number {
        let t = this.getTile(p);
        if (t == undefined)
            return 0;
        return t.collide(this.tileUV(p));
    }

    *tilesOfRect(low: Pointy, high: Pointy): IterableIterator<TV> {
        low = this.tileCoord(low);
        high = this.tileCoord(high);
        for (let y = low.y; y <= high.y; y++) {
            if (this.map[y] != undefined)
                for (let x = low.x; x <= high.x; x++) {
                    if (this.map[y][x] != undefined)
                        yield { t: this.map[y][x], c: new Vec(x, y).scale(this.tileSize) };
                }
        }
    }

    *tilesOfLine(a: Pointy, b: Pointy): IterableIterator<TV> {
        for (let v of thickLine(a, b, this.tileSize))
            if (this.map[v.y] != undefined && this.map[v.y][v.x] != undefined)
                yield { t: this.map[v.y][v.x], c: v.scale(this.tileSize) };
    }


}


interface Tile {
    collide(p: Pointy): number;


}





export {
    Tile, TileMap,
}
