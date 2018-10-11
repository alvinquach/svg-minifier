export class SvgObjectProperty {

    private _value: string;

    get value(): string {
        return this._value;
    }
    
    set value(value: string) {
        this._value = value;
    }

    private _format: SvgObjectPropertyFormat;

    get format(): SvgObjectPropertyFormat {
        return this._format;
    }

    private _enabled: boolean;

    get enabled(): boolean {
        return this._enabled;
    }

    set enabled(enabled: boolean) {
        this._enabled = enabled;
    }

    constructor(
        value: string,
        // value: string | number | Color,
        format: SvgObjectPropertyFormat = SvgObjectPropertyFormat.Default,
        enabled: boolean = true) {

            this.value = value;
            // this._format = format;
            this.enabled = enabled;
    }
    
}

export enum SvgObjectPropertyFormat {
    Default,
    Number,
    Color,
    Percentage
}