export class SvgObjectProperty {

    private _value: string;
    // private _value: string | number | Color;

    private _format: SvgObjectPropertyFormat;

    private _enabled: boolean;

    constructor(
        value: string,
        // value: string | number | Color,
        format: SvgObjectPropertyFormat = SvgObjectPropertyFormat.DEFAULT,
        enabled: boolean = true) {

            this.value = value;
            // this._format = format;
            this.enabled = enabled;
    }
    
    get value(): string {
        return this._value;
    }
    
    set value(value: string) {
        this._value = value;
    }

    // get value(): string | number | Color {
    //     return this._value;
    // }

    // set value(value: string | number | Color) {
    //     this._value = value;
    // }

    get format(): SvgObjectPropertyFormat {
        return this._format;
    }

    get enabled(): boolean {
        return this._enabled;
    }

    set enabled(enabled: boolean) {
        this._enabled = enabled;
    }

}

export enum SvgObjectPropertyFormat {
    DEFAULT,
    NUMBER,
    COLOR,
    PERCENTAGE
}