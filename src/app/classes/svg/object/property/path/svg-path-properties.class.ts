import { SvgObjectProperties } from "../svg-object-properties.class";
import { SvgPathCommand } from "./svg-path-command.class";
import { SvgObjectProperty } from "../svg-object-property.class";

const ValidCommands: string[] = [
    'M', 'm', 'L', 'l', 'H', 'h', 'V', 'v', 'Z', 'z',   // Line Commands
    'C', 'c', 'S', 's', 'Q', 'q', 'T', 't',             // Curve Commands
    'A', 'a'                                            // Arcs
];

// TODO Conform to the pattern/chars/regex as outline here https://www.w3.org/TR/SVG/paths.html#PathDataBNF.
const CoordSeparator = new RegExp(/,\s*/);

export class SvgPathProperties extends SvgObjectProperties {

    private _d: SvgPathCommand[];

    get d(): SvgPathCommand[] {
        return this._d;
    }

    constructor(contents?: string) {
        super(contents);
    }

    hasProperties(): boolean {
        return super.hasProperties() || !!(this._d && this._d.length);
    }

    parse(contents: string): void {
        super.parse(contents);
        if ('d' in this._propertyMap) {
            this._d = this.parseLineCommands(this._propertyMap['d'].value);
            delete this._propertyMap['d'];
        }
    }

    private parseLineCommands(d: string): SvgPathCommand[] {
        const lineCommands: SvgPathCommand[] = [];
        let startIndex = 0;
        let cursor = 0;
        let currentCommand: SvgPathCommand;
        while (true) {
            const currentChar = d.charAt(cursor);
            if (!currentChar) {
                if (!this.isEndCommand(currentCommand)) {
                    this.parseAndPush(d, startIndex, cursor, currentCommand);
                }
                break;
            }

            if (ValidCommands.indexOf(currentChar) != -1) {
                if (currentCommand && !this.isEndCommand(currentCommand)) {
                    this.parseAndPush(d, startIndex, cursor, currentCommand);
                }
                currentCommand = {
                    command: currentChar,
                    coords: []
                };
                lineCommands.push(currentCommand);
                startIndex = cursor + 1;
            }

            else if (currentChar === '-' && cursor != startIndex) {
                this.parseAndPush(d, startIndex, cursor, currentCommand);
                startIndex = cursor;
            }

            else if (CoordSeparator.test(currentChar)) {
                this.parseAndPush(d, startIndex, cursor, currentCommand);
                startIndex = cursor + 1;
            }

            cursor++;
        }

        return lineCommands;
    }

    /** Helper function */
    private parseAndPush(d, startIndex, cursor, currentCommand): void {
        const value = parseFloat(d.substring(startIndex, cursor));
        if (isNaN(value)) {
            console.log(`Error: "${d.substring(startIndex, cursor)}" is NaN.}`);
        }
        else {
            currentCommand.coords.push(value);
        }
    }

    /** Helper function */
    private isEndCommand(command: SvgPathCommand): boolean {
        return command.command === 'z' || command.command === 'Z';
    }

    toString(): string {
        let result = `${super.toString()} d="`;
        this._d.forEach(command => {
            result += command.command;
            for (let i = 0; i < command.coords.length; i++) {
                const coord = command.coords[i];
                if (i > 0 && coord >= 0) {
                    result += ',';
                }
                result += coord;
            }
        })
        return result + `"`;
    }

}