import { ColorUtils } from "../../utils/color.utils";

export class Color {
    private _red: number;
    private _green: number;
    private _blue: number;
    private _alpha: number;

    consturctor(red: number = 1, green: number = 1, blue: number = 1, alpha: number = 1) {
        this._red = red;
        this._green = green;
        this._blue = blue;
        this._alpha = alpha;
    }

    get red(): number {
        return this._red;
    }

    set red(red: number) {
        this._red = this._capIntensityValue(red);
    }

    get green(): number {
        return this._green;
    }

    set green(green: number) {
        this._green = this._capIntensityValue(green);
    }

    get blue(): number {
        return this._blue;
    }

    set blue(blue: number) {
        this._blue = this._capIntensityValue(blue);
    }

    get alpha(): number {
        return this._alpha;
    }

    set alpha(alpha: number) {
        this._alpha = this._capIntensityValue(alpha);
    }

    /** Updates the color with RGB values ranging form 0 - 255. */
    setRGB(R: number, G: number, B: number): Color {
        this.red = R / 255;
        this.green = G / 255;
        this.blue = B / 255;
        return this;
    }

    /** Updates the color with a hex color string. */
    setFromHex(hex: string): Color {
        if (ColorUtils.isHexColor(hex)) {
            this.red = parseInt(hex.substr(1, 2), 16) / 255;
            this.green = parseInt(hex.substr(3, 2), 16) / 255;
            this.blue = parseInt(hex.substr(5, 2), 16) / 255;
        }
        return this;
    }

    /**
     * Outputs the color as a hex string.
     * @param allowShort Allows short hex form to be output when possible.
     * @param includePoundSign Adds the "#" symbol before the hexidecimal string.
     */
    toHexString(allowShort: boolean = true, includePoundSign: boolean = true): string {
        let hex = (includePoundSign ? "#" : "")
            + this._intensityDecimalToInt(this._red).toString(16)
            + this._intensityDecimalToInt(this._green).toString(16)
            + this._intensityDecimalToInt(this._blue).toString(16);

        if (allowShort) {
            hex = ColorUtils.hexToShortHex(hex);
        }

        return hex;
    }

    /**
     * Outputs the color as a rgb() or rgba() value.
     * @param includeAlpha If not defined, then the function will only output the alpha value if it is not 1
     *                     If set to true, then the ouput will always be in rgba() format.
     *                     If set to false, then the output will always be in rgb() format.
     * @param addSpace Adds a space after each comma that separates the color values.
     */
    toRGBAString(includeAlpha?: boolean, addSpace?: boolean): string {
        if (includeAlpha == undefined && this._alpha < 1) {
            includeAlpha = true;
        }
        if (includeAlpha) {
            return "rgba("
                + this._intensityDecimalToInt(this._red)
                + (addSpace ? ", " : ",")
                + this._intensityDecimalToInt(this._green)
                + (addSpace ? ", " : ",")
                + this._intensityDecimalToInt(this._blue)
                + (addSpace ? ", " : ",")
                + this._alpha
                + ")";
        }
        else {
            return "rgb("
                + this._intensityDecimalToInt(this._red)
                + (addSpace ? ", " : ",")
                + this._intensityDecimalToInt(this._green)
                + (addSpace ? ", " : ",")
                + this._intensityDecimalToInt(this._blue)
                + ")";
        }
    }

    private _capIntensityValue(value: number): number {
        return value < 0 ? 0 : value > 1 ? 1 : value;
    }

    private _intensityDecimalToInt(double: number): number {
        return Math.round(double * 255);
    }

}