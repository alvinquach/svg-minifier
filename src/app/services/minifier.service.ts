import { Injectable } from "@angular/core";
import { SvgObject } from "../classes/svg/svg-object.class";
import { SvgParserService } from "./svg-parser.service";
import { SvgWriterService } from "./svg-writer.service";
import { SvgObjectType } from "../classes/svg/svg-object-type.class";
import { ColorUtils } from "../utils/color.utils";
import { TransformMatrix } from "../classes/matrix/transform-matrix.class";
import { MathUtils } from "../utils/math.utils";


@Injectable()
export class MinifierService {

    constructor(private _svgParser: SvgParserService, private _svgWriter: SvgWriterService) {

    }

    minify(data: string): string {
        
        // Remove all tabs and line breaks.
        let result: string = data.replace(/\r?\n|\r|\t/g, "");

        // Remove whitespace between consecutive closing and opening tags.
        // This is typically not needed if the file was saved directly from Illustrator.
        result = result.replace(/\>\s+\</g, "><");
        
        // Data can now be parsed once all the unnecessary whitespaces have been removed.
        const parsed: SvgObject = this._svgParser.parse(result);

        // Remove elements that will not be displayed in GT Sport.
        this._removeNoDisplay(parsed);

        // Gather the defs elements and move it to the top of the SVG.
        const defs: SvgObject = this._gatherDefs(parsed);
        if (defs) {
            parsed.children.unshift(defs);
        }

        // Collect the properties from all the SVG elements;
        const propertiesFlatMap: {[key: string]: string}[] = this._getPropertiesFlatMap(parsed);

        // Replace IDs and references with minified versions.
        this._idSubstitution(propertiesFlatMap);

        // Shorten color hex codes (ie #DDFF00 --> #DF0).
        this._shortenHexCodes(propertiesFlatMap);

        // Removes properties that have no effect on an element.
        this._removeUnusedProperties(propertiesFlatMap);

        // Ungroup groups
        this._explodeGroups(parsed);
        
        // Console log
        parsed.printContents();

        return this._svgWriter.writeAsString(parsed);

        // TODO Remove "px".

    }

    /**
     * Remove groups and other elements that have display property "none".
     * Also removes elements that can't be displayed by GT Sport, such as embedded images.
     */
    private _removeNoDisplay(svgObject: SvgObject): void {
        svgObject.children.forEach((child, index, children) => {
            // TODO Add other element types that are not supported by GT Sport.
            if (child.properties["display"] == "none" || !child.type.display) {
                children.splice(index, 1);
            }
            this._removeNoDisplay(child);
        });
    }

    /**
     * Removes any definition elements that are children of the given element,
     * and then returns an element containing the removed elements.
     * Operation also applies to nested child elements.
     */
    private _gatherDefs(svgObject: SvgObject): SvgObject {
        const defs: SvgObject[] = this._gatherDefsHelper(svgObject);

        // Consolidate results into the first def element.
        if (defs.length) {
            const result: SvgObject = defs[0];
            for (let i = 1; i < defs.length; i++) {
                result.children.push(...defs[i].children);
            }
            return result;
        }

        return null;
    }

    private _gatherDefsHelper(svgObject: SvgObject): SvgObject[] {
        const defs: SvgObject[] = [];
        const children: SvgObject[] = svgObject.children;
        
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

    private _getPropertiesFlatMap(svgObject: SvgObject): {[key: string]: string}[] {
        const result: {[key: string]: string}[] = [];
        result.push(svgObject.properties)
        for (const child of svgObject.children) {
            result.push(...this._getPropertiesFlatMap(child));
        }
        return result;
    }

    private _idSubstitution(propertiesFlatMap: {[key: string]: string}[]): void {
        const map: {[key: string]: IdProperties} = {};
        
        // Find all IDs and references
        this._findIdReferences(propertiesFlatMap, map);

        // Generate minified replacement values for the IDs.
        this._generateReplacementIds(map);

        // Replace the IDs with the minified versions.
        this._replaceIdReferences(propertiesFlatMap, map);
    }

    /** Helper function for _idSubstitution(). */
    private _parseReference(value: string): string {
        const hashIndex: number = value.indexOf("#");


        if (hashIndex > -1) {
            // This assumes IDs cannot be in the form of a hex color code.
            if (!hashIndex && !ColorUtils.isHexColor(value)) {
                return value.substring(1);
            }
            else if (hashIndex > 0 && !value.indexOf("url(#")) {
                return value.substring(5, value.length - 1);
            }
            // TODO Find other cases where an ID reference can be used.
        }
        return null;
    }

    /** Helper function for _idSubstitution(). */
    private _findIdReferences(propertiesFlatMap: {[key: string]: string}[], map: {[key: string]: IdProperties}): void {
        for (const properties of propertiesFlatMap) {
            for (const key of Object.keys(properties)) {
                let value: string = properties[key];
                if (key == "id") {
                    if (map[value]) {
                        map[value].defFound = true;
                    }
                    else {
                        map[value] = {
                            useCount: 0,
                            defFound: true
                        }
                    }
                }
                else {
                    value = this._parseReference(value);
                    if (value) {
                        if (map[value]) {
                            map[value].useCount += 1;
                        }
                        else {
                            map[value] = {
                                useCount: 1,
                                defFound: false
                            }
                        }
                    }
                }
            }
        }
    }

    /** Helper function for _idSubstitution(). */    
    private _generateReplacementIds(map: {[key: string]: IdProperties}): void {
        const currentId: number[] = [65];

        const incrementId = (o: number[]) => {
            if (o[o.length - 1] < 90) {
                o[o.length - 1] += 1;
            }
            else {
                for (let i = 0; i < o.length; i++) {
                    o[i] = 65;
                }
                o.push(65);
            }
        };

        for (const key of Object.keys(map)) {
            const id: IdProperties = map[key];
            if (!id.useCount || !id.defFound) {
                continue;
            }
            id.replacement = String.fromCharCode(...currentId);
            incrementId(currentId);
        }

    }

    /** Helper function for _idSubstitution(). */
    private _replaceIdReferences(propertiesFlatMap: {[key: string]: string}[], map: {[key: string]: IdProperties}): void {
        for (const properties of propertiesFlatMap) {
            for (const key of Object.keys(properties)) {
                const value: string = properties[key];
                if (key == "id") {
                    const id: IdProperties = map[value];
                    if (id) {
                        if (id.replacement) {
                            properties[key] = id.replacement;
                        }
                        else {
                            delete properties[key];
                        }
                    }
                }
                else {
                    const oldId: string = this._parseReference(value);
                    if (oldId) {
                        const id: IdProperties = map[oldId];
                        if (id) {
                            if (id.replacement) {
                                properties[key] = value.replace(oldId, id.replacement);
                            }
                            else {
                                delete properties[key];
                            }
                        }
                    }
                }
            }
        }
    }

    /** Shortens color hex codes (ie #DDFF00 --> #DF0). */
    private _shortenHexCodes(propertiesFlatMap: {[key: string]: string}[]): void {

        for (const properties of propertiesFlatMap) {
            for (const key of Object.keys(properties)) {

                let value: string = properties[key];
                let changed: boolean = false;

                // Find all hex color codes in the value.
                const hexColors: string[] = value.match(/#[0-9a-f]{6}/gi);

                // Move on if no match.
                if (!hexColors || !hexColors.length) {
                    continue;
                }

                // Replace the hex color codes with the shorthand form, if any.
                for (let i = 0; i < hexColors.length; i++) {
                    const hex: string = hexColors[i];
                    const shortHex: string = ColorUtils.hexToShortHex(hex);
                    if (shortHex) {
                        value = value.replace(hex, shortHex);
                        changed = true;
                    }
                }

                // Update the value of the property.
                if (changed) {
                    properties[key] = value;
                }
            }
        }

    }

    /** Removes properties that have no effect on an element. */
    private _removeUnusedProperties(propertiesFlatMap: {[key: string]: string}[]): void {
        for (const properties of propertiesFlatMap) {
            
            // Remove miterlimit for non-miter linejoins.
            // TODO Move this to a service or utility for paths.
            const strokeLinejoin: string = properties['stroke-linejoin'];
            if (strokeLinejoin && strokeLinejoin != "miter") {
                delete properties['stroke-miterlimit'];
            }

            // FIXME Add check to see if this is really a linearGradient.
            // Also add sanity checks.
            //
            // TODO Move this to a service or utility for linearGradients.
            const gradientTransform: string = properties['gradientTransform'];
            if (gradientTransform && 'x1' in properties && 'y1' in properties && 'x2' in properties && 'y2' in properties) {
                
                // Assumes that the property starts with "matrix(" and ends with ")".
                const values: string[] = gradientTransform.substring(7, gradientTransform.length - 1).split(" ");
                
                // Assumes that all values are valid numbers.
                const matrix: TransformMatrix = new TransformMatrix(...values.map(v => Number(v)));
                const start: number[] = MathUtils.transformPoint(Number(properties['x1']), Number(properties['y1']), matrix.toArray());
                const end: number[] = MathUtils.transformPoint(Number(properties['x2']), Number(properties['y2']), matrix.toArray());

                // TODO Determine the required precision.
                properties['x1'] = start[0].toFixed(4);
                properties['y1'] = start[1].toFixed(4);
                properties['x2'] = end[0].toFixed(4);
                properties['y2'] = end[1].toFixed(4);
                delete properties['gradientTransform'];
            }

        }
    }

    /** Ungroups the groups that have no special properties. */
    private _explodeGroups(svgObject: SvgObject): void {
        const children: SvgObject[] = svgObject.children;
        const newChildren: SvgObject[] = [];
        let changed: boolean = false;
        for (const child of children) {
            this._explodeGroups(child);
            if (child.type == SvgObjectType.Group && !Object.keys(child.properties).length) {
                newChildren.push(...child.children);
                changed = true;
            }
            else {
                newChildren.push(child);
            }
        }
        if (changed) {
            children.splice(0, children.length);
            children.push(...newChildren);
        }
    }

}

interface IdProperties {

    replacement?: string;

    defFound: boolean;

    useCount: number;

}