import { Injectable } from "@angular/core";
import { SvgObject } from "../classes/svg/svg-object.class";
import { SvgParserService } from "./svg-parser.service";
import { SvgWriterService } from "./svg-writer.service";
import { SvgObjectType } from "../classes/svg/svg-object-type.class";


@Injectable()
export class MinifierService {

    constructor(private _svgParser: SvgParserService, private _svgWriter: SvgWriterService) {

    }

    minify(data: string): string {
        
        // Remove all tabs and line breaks.
        let result: string = data.replace(/\r?\n|\r|\t/g,"");

        // Remove whitespace between consecutive closing and opening tags.
        // This is typically not needed if the file was saved directly from Illustrator.
        result = result.replace(/\>\s+\</g,"><");
        
        // Data can now be parsed once all the unnecessary whitespaces have been removed.
        let parsed: SvgObject = this._svgParser.parse(result);

        // Gather the defs elements and move it to the top of the SVG.
        let defs: SvgObject = this._gatherDefs(parsed);
        if (defs) {
            parsed.children.unshift(defs);
        }

        parsed.printContents();

        return this._svgWriter.writeAsString(parsed);

        // Remove all comments, doctype declarations, and xml declarations.
        //result = this._removeComments(result);

        // Shorten color hex codes (ie #DDFF00 --> #DF0).
        //return this._shortenHexCodes(result);

        // TODO Remove empty groups.

    }

    /**
     * Removes any definition elements that are children of the given element,
     * and then returns an element containing the removed elements.
     * Operation also applies to nested child elements.
     */
    private _gatherDefs(svgObject: SvgObject): SvgObject {
        let defs: SvgObject[] = this._gatherDefsHelper(svgObject);

        // Consolidate results into the first def element.
        if (defs.length) {
            let result: SvgObject = defs[0];
            for (let i = 1; i < defs.length; i++) {
                result.children.push(...defs[i].children);
            }
            return result;
        }

        return null;
    }

    private _gatherDefsHelper(svgObject: SvgObject): SvgObject[] {
        let defs: SvgObject[] = [];
        let children: SvgObject[] = svgObject.children;
        
        // Gather defs from children of the given SVG element.
        children.slice(0).forEach(child => {
            if (child.type == SvgObjectType.Definitions) {
                defs.push(...children.splice(children.indexOf(child), 1));
            }
            else {
                defs.push(...this._gatherDefsHelper(child));
            }
        });

        return defs;
    }

    /**
     * Remove all comments, doctype declarations, and xml declarations.
     * Input string should have no white spaces between consecutive closing and opening tags.
     */
    private _removeComments(data: string): string {

        let segments: string[] = data.split("><");

        // Using indexOf() here for fastest performance https://jsperf.com/charat-vs-indexof-vs-startswith.
        segments = segments.filter(s => s.indexOf("!") != 0);

        // Remove first segment if it is the xml declarator.
        console.log(segments[0].trim().indexOf("<?"));
        if (segments[0].trim().indexOf("<?") == 0) {
            segments = segments.slice(1); // Truncate the first element.
            segments[0] = "<" + segments[0]; // Add the opening tag to the new first element.
        }

        return segments.join("><");

    }

    /** Shortens color hex codes (ie #DDFF00 --> #DF0). */
    private _shortenHexCodes(data: string): string {

        let result: string = data;

        // Get all hex colors from the document.
        let hexColors: Set<string> = new Set(result.match(/#[0-9a-f]{6}/gi));

        hexColors.forEach(hex => {
            if (hex.charAt(1) == hex.charAt(2) &&
                hex.charAt(3) == hex.charAt(4) &&
                hex.charAt(5) == hex.charAt(6)
            ) {
                result = result.replace(new RegExp(hex, "gi"), "#" + hex.charAt(1) + hex.charAt(3) + hex.charAt(5));
            }
        });

        return result;
    }

}