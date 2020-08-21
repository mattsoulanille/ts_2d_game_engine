enum InputType {
    KeyDown,
    KeyUp,
    MouseDown,
    MouseUp,
    MouseMove,
    MouseWheel
}
interface Input {
    t: InputType;
    d: any;
}
class EventInput implements Input {
    constructor(public t: InputType, public d: UIEvent) { }
}

class InputListener {
    doc: Document | undefined;
    inputs: Array<Input>;
    constructor() {
        this.inputs = [];
        this.boundKeyDown = this.keyDownCallback.bind(this);
        this.boundKeyUp = this.keyUpCallback.bind(this);
        this.boundMouseDown = this.mouseDownCallback.bind(this);
        this.boundMouseMove = this.mouseMoveCallback.bind(this);
        this.boundMouseUp = this.mouseUpCallback.bind(this);
        this.boundMouseWheel = this.mouseWheelCallback.bind(this);
    }
    clear() {
        this.inputs = [];
    }
    boundKeyDown: (ke: KeyboardEvent) => void;
    boundKeyUp: (ke: KeyboardEvent) => void;
    boundMouseDown: (me: MouseEvent) => void;
    boundMouseMove: (me: MouseEvent) => void;
    boundMouseUp: (me: MouseEvent) => void;
    boundMouseWheel: (me: MouseEvent) => void;
    keyDownCallback(ke: KeyboardEvent): void {
        this.inputs.push(new EventInput(InputType.KeyDown, ke))
    }
    keyUpCallback(ke: KeyboardEvent): void {
        this.inputs.push(new EventInput(InputType.KeyUp, ke))
    }
    mouseDownCallback(me: MouseEvent): void {
        this.inputs.push(new EventInput(InputType.MouseDown, me));
    }
    mouseUpCallback(me: MouseEvent): void {
        this.inputs.push(new EventInput(InputType.MouseUp, me));
    }
    mouseMoveCallback(me: MouseEvent): void {
        this.inputs.push(new EventInput(InputType.MouseMove, me));
    }
    mouseWheelCallback(me: MouseEvent): void {
        this.inputs.push(new EventInput(InputType.MouseWheel, me));
    }
    attach(d: Document) {
        this.doc = d;
        d.addEventListener("keydown", this.boundKeyDown);
        d.addEventListener("keyup", this.boundKeyUp);
        d.addEventListener("mousemove", this.boundMouseMove);
        d.addEventListener("mousedown", this.boundMouseDown);
        d.addEventListener("mouseup", this.boundMouseUp);
        d.addEventListener("wheel", this.boundMouseWheel);
    }
    detach() {
        const d = this.doc;
        this.doc = undefined;
        if (d != undefined) {
            d.removeEventListener("keydown", this.boundKeyDown);
            d.removeEventListener("keyup", this.boundKeyUp);
            d.removeEventListener("mousemove", this.boundMouseMove);
            d.removeEventListener("mousedown", this.boundMouseDown);
            d.removeEventListener("mouseup", this.boundMouseUp);
            d.removeEventListener("wheel", this.boundMouseWheel);
        }
        return d;
    }

}
export { Input, InputListener, InputType }
