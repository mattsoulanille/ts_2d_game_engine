import { Pointy, Vec, mod, Line, Physical } from "./physics";
import { thickLine } from "./rasterIters";
import { Collision } from "./collision_detection";
import { Player } from "./player";

//tile based

type World = {
    tileMap: TileMap;
}


/*function testworld(): World {

    //return new World(tilemapFromExpression(function (x,y) { if (y < 16) return 1; return 0;}));
    const floorTile = new StaticTile([new Line(new Vec(1, .5), new Vec(0, .5))]);
    const w = new World();
    w.tileMap.tiles[16] = [floorTile, floorTile, floorTile, floorTile];
    return w;

    //    return new World(tilemapFromExpression((x:number, y:number) =>
    //										   y < 16? 1 : 0,[undefined,floorTile]));

}
/*
function tilemapFromExpression(f:(x:number,y:number)=>number,tiles:Array<Tile>):TileMap{
	function gen(x:number,y:number):Tile|undefined {
		return tiles[f(x,y)];
	}
	return TileMap(gen);
}

	class DebugTile implements Tile{


	}

	
* /

class StaticTile implements Tile {
    /*collide(p: Pointy): undefined | Collision {
        for (const l of this.lines) {
            if (l.side(p)) {
                return { line: l };
            }
        }

        return undefined;
		}* /
    graphics = new PIXI.Container();
    draw() { }
    constructor(public lines: Line[]) { };

}
*/


type TileMap = {
    tiles: Array<Array<Tile>>;
}
type Tile = number;
/*
type TV = { t: Tile, c: Vec };
class TileMapc implements Tile {
    tiles: Array<Array<Tile>>;
    tileSize: number;
    graphics = new PIXI.Container();
    draw() { }
    constructor(/*public genFunc: (x:number,y:number) => Tile|undefined* /) {
        this.tiles = [];
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
            if (this.tiles[y] == undefined)
                return undefined;
            return this.tiles[y][x];
        }
    }
    /*collide(p: Pointy) {
        let t = this.getTile(p);
        if (t == undefined)
            return t;
        return t.collide(this.tileUV(p));
    }* /

    *tilesOfRect(low: Pointy, high: Pointy): IterableIterator<TV> {
        low = this.tileCoord(low);
        high = this.tileCoord(high);
        for (let y = low.y; y <= high.y; y++) {
            if (this.tiles[y] != undefined)
                for (let x = low.x; x <= high.x; x++) {
                    if (this.tiles[y][x] != undefined)
                        yield { t: this.tiles[y][x], c: new Vec(x, y).scale(this.tileSize) };
                }
        }
    }

    *tilesOfLine(a: Pointy, b: Pointy): IterableIterator<TV> {
        for (let v of thickLine(a, b, this.tileSize))
            if (this.tiles[v.y] != undefined && this.tiles[v.y][v.x] != undefined)
                yield { t: this.tiles[v.y][v.x], c: v.scale(this.tileSize) };
    }



}


interface Tile {
    //collide(p: Pointy): undefined | Collision;
    graphics: PIXI.DisplayObject;
    draw(): void;
}

*/



export {
    Tile, TileMap, World
}
