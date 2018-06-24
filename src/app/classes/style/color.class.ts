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

    /** Ther intensity of the red component from 0 to 1. */
    get red(): number {
        return this._red;
    }

    set red(red: number) {
        this._red = this._capIntensityValue(red);
    }

    /** Ther intensity of the green component from 0 to 1. */
    get green(): number {
        return this._green;
    }

    set green(green: number) {
        this._green = this._capIntensityValue(green);
    }

    /** Ther intensity of the blue component from 0 to 1. */
    get blue(): number {
        return this._blue;
    }

    set blue(blue: number) {
        this._blue = this._capIntensityValue(blue);
    }

    /** Ther intensity of the alpha value from 0 to 1. */
    get alpha(): number {
        return this._alpha;
    }

    set alpha(alpha: number) {
        this._alpha = this._capIntensityValue(alpha);
    }

    /**
     * Updates the color with RGB values ranging form 0 - 255.
     * The alpha value is unaffected by this operation.
     */
    setRGB(R: number, G: number, B: number): Color {
        this.red = R / 255;
        this.green = G / 255;
        this.blue = B / 255;
        return this;
    }

    /** Updates the color with RGBA values ranging form 0 - 255. */
    setRGBA(R: number, G: number, B: number, A: number): Color {
        this.red = R / 255;
        this.green = G / 255;
        this.blue = B / 255;
        this.alpha = A / 255;
        return this;
    }

    /**
     * Updates the color with a hex color string.
     * The alpha value is unaffected by this operation.
     */
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
     * Ignores the alpha value.
     * @param allowShort Allows short hex form to be output when possible.
     */
    toHexString(allowShort: boolean = true): string {
        let hex = "#"
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
     * @param addSpace Whether to add a space after each comma that separates the color values.
     * @param includingLeadingZero Whether to include leading zero for decimal values less than 1.
     */
    toRGBAString(includeAlpha?: boolean, addSpace?: boolean, includingLeadingZero?: boolean): string {
        if (includeAlpha == undefined && this._alpha < 1) {
            includeAlpha = true;
        }
        if (includeAlpha) {
            let alpha: string = String(this._alpha);
            if (!includingLeadingZero && alpha.length > 1) {
                alpha = alpha.substring(1);
            }
            return "rgba("
                + this._intensityDecimalToInt(this._red)
                + (addSpace ? ", " : ",")
                + this._intensityDecimalToInt(this._green)
                + (addSpace ? ", " : ",")
                + this._intensityDecimalToInt(this._blue)
                + (addSpace ? ", " : ",")
                + alpha
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