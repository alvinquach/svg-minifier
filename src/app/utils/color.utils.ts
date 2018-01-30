/** Utility class for parsing, converting, generating, and performing other operations on CSS related strings. */
export class ColorUtils {

    /** Converts a hex color code (either in short or long form) into rgb notation. */
    static hexToRgb(hex: string): string {
        if (!hex) {
            return hex;
        }
        if (!!hex.match(/#[0-9a-fA-F]{3}/).length) {
            
        }
        return hex;
    }

    /** Checks whether a string is a hex color code. */
    static isHexColor(value: string, ignoreShort: boolean = false): boolean {
        if (!value) {
            return false;
        }
        if (!ignoreShort && value.length == 4) {
            return !!value.match(/#[0-9a-fA-F]{3}/).length;
        }
        else if (value.length == 7) {
            return !!value.match(/#[0-9a-fA-F]{6}/).length;            
        }
        return false;
    }

    /**
     * Converts a long form hex color code into a short hex code.
     * @returns Shortened hex color code, or the input value if it could not be shortened.
     */
    static hexToShortHex(hex: string): string {
        if (this.isHexColor(hex, true) &&
            hex.charAt(1) == hex.charAt(2) &&
            hex.charAt(3) == hex.charAt(4) &&
            hex.charAt(5) == hex.charAt(6)
        ) {
            return "#" + hex.charAt(1) + hex.charAt(3) + hex.charAt(5);
        }
        return hex;
    }

}