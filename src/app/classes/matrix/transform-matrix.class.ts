
/** SVG Transformation Matrix */
export class TransformMatrix {

    private _a: number;
    private _b: number;
    private _c: number;
    private _d: number;
    private _e: number;
    private _f: number;

    constructor(...values: number[]) {
        this.a = values[0];
        this.b = values[1];
        this.c = values[2];
        this.d = values[3];
        this.e = values[4];
        this.f = values[5];
    }

    get a(): number {
        return this._a;
    }

    set a(a: number) {
        this._a = a || 1;
    }

    get b(): number {
        return this._b;
    }

    set b(b: number) {
        this._b = b || 0;
    }

    get c(): number {
        return this._c;
    }

    set c(c: number) {
        this._c = c || 0;
    }

    get d(): number {
        return this._d;
    }

    set d(d: number) {
        this._d = d || 1;
    }

    get e(): number {
        return this._e;
    }

    set e(e: number) {
        this._e = e || 0;
    }

    get f(): number {
        return this._f;
    }

    set f(f: number) {
        this._f = f || 0;
    }

    toArray(): number[][] {
        return [
            [this._a, this._c, this._e],
            [this._b, this._d, this._f],
            [   0   ,    0   ,    1   ]
        ];
    }


}