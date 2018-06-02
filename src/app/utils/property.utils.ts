/** Utility class specifically for property keys. */
export class PropertyUtils {

    /** List of all the properties that should have a color value. */
    private static readonly _ColorPropertyKeys: string[] = [
        "stroke",
        "fill",
        "stop-color"
    ];

    /** Check if a property (key) should contain a color value. */
    static isColorProperty(property: string): boolean {
        return this._ColorPropertyKeys.indexOf(property) >= 0;
    }

}