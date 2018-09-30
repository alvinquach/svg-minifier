/** Utility methods for generating unique IDs. */
export class IdUtils {

    /** Contains the ASCII values of all the characters that are used for the ID string. */
    private static _asciiArray: number[];

    private static get asciiArray(): number[] {
        if (!this._asciiArray) {
            this._asciiArray = this.generateAsciiArray();
        }
        return this._asciiArray;
    }

    static newId(): number[] {
        return [0];
    }

    static incrementId(o: number[]): void {
        for (let i = o.length - 1; i >= 0; i--) {

            // If digit can be incremented, then stop here.
            if (o[i] < this.asciiArray.length - 1) {
                o[i] += 1;
                break;
            }

            // Else reset digit to lowest value, and carry over.
            else {
                o[i] = 0;

                // If cannot carry over anymore, then add a new digit in front.
                if (i == 0) {
                    o.unshift(0);
                }
            }

        }
    }

    static asString(o: number[]): string {
        return String.fromCharCode(...o.map(v => this.asciiArray[v]));
    }

    private static generateAsciiArray(): number[] {
        return [
            ...this.generateRange(97, 122), // a-z
            ...this.generateRange(65, 90),  // A-Z
            ...this.generateRange(48, 57)   // 0-9
        ];
    }

    /** Generates an array containing a range of numbers, inclusively. */
    private static generateRange(start: number, end: number): number[] {
        // TODO Add input validation

        return Array(end - start + 1).fill(0).map((v, i) => start + i);
    }

}