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
        let result: string = data.replace(/\r?\n|\r|\t/g, "");

        // Remove whitespace between consecutive closing and opening tags.
        // This is typically not needed if the file was saved directly from Illustrator.
        result = result.replace(/\>\s+\</g, "><");
        
        // Data can now be parsed once all the unnecessary whitespaces have been removed.
        let parsed: SvgObject = this._svgParser.parse(result);

        // Remove elements that will not be displayed in GT Sport.
        this._removeNoDisplay(parsed);

        // Gather the defs elements and move it to the top of the SVG.
        let defs: SvgObject = this._gatherDefs(parsed);
        if (defs) {
            parsed.children.unshift(defs);
        }

        // Collect the properties from all the SVG elements;
        let propertiesFlatMap: {[key: string]: string}[] = this._getPropertiesFlatMap(parsed);

        // Replace IDs and references with minified versions.
        this._idSubstitution(propertiesFlatMap);

        // Shorten color hex codes (ie #DDFF00 --> #DF0).
        this._shortenHexCodes(propertiesFlatMap);

        // Ungroup groups
        this._explodeGroups(parsed);
        
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
        });
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

    private _getPropertiesFlatMap(svgObject: SvgObject): {[key: string]: string}[] {
        let result: {[key: string]: string}[] = [];
        result.push(svgObject.properties)
        for (let child of svgObject.children) {
            result.push(...this._getPropertiesFlatMap(child));
        }
        return result;
    }

    private _idSubstitution(propertiesFlatMap: {[key: string]: string}[]): void {
        let map: {[key: string]: IdProperties} = {};
        
        // Find all IDs and references
        this._findIdReferences(propertiesFlatMap, map);

        // Generate minified replacement values for the IDs.
        this._generateReplacementIds(map);

        // Replace the IDs with the minified versions.
        this._replaceIdReferences(propertiesFlatMap, map);
    }

    /** Helper function for _idSubstitution(). */
    private _parseReference(value: string): string {
        let hashIndex: number = value.indexOf("#");
        if (hashIndex > -1) {
            if (!hashIndex && !this._isHexColor(value)) {
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
        for (let properties of propertiesFlatMap) {
            for (let key of Object.keys(properties)) {
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
        let currentId: number[] = [65];

        let incrementId = (o: number[]) => {
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

        for (let key of Object.keys(map)) {
            let id: IdProperties = map[key];
            if (!id.useCount || !id.defFound) {
                continue;
            }
            id.replacement = String.fromCharCode(...currentId);
            incrementId(currentId);
        }

    }

    /** Helper function for _idSubstitution(). */
    private _replaceIdReferences(propertiesFlatMap: {[key: string]: string}[], map: {[key: string]: IdProperties}): void {
        for (let properties of propertiesFlatMap) {
            for (let key of Object.keys(properties)) {
                let value: string = properties[key];
                if (key == "id") {
                    let id: IdProperties = map[value];
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
                    let oldId: string = this._parseReference(value);
                    if (oldId) {
                        let id: IdProperties = map[oldId];
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

        let getShortHex = (hex: string) => {
            if (hex.charAt(1) == hex.charAt(2) &&
                hex.charAt(3) == hex.charAt(4) &&
                hex.charAt(5) == hex.charAt(6)
            ) {
                return "#" + hex.charAt(1) + hex.charAt(3) + hex.charAt(5);
            }
            return hex;
        }

        for (let properties of propertiesFlatMap) {
            for (let key of Object.keys(properties)) {
                let value: string = properties[key];
                if (!value.indexOf("#") && this._isHexColor(value, true)) {
                    properties[key] = getShortHex(value);
                }
            }
        }

    }

    private _isHexColor(value: string, ignoreShort: boolean = false): boolean {
        if (!ignoreShort && value.length == 4) {
            return !!value.match(/#[0-9a-fA-F]{3}/).length;
        }
        else if (value.length == 7) {
            return !!value.match(/#[0-9a-fA-F]{6}/).length;            
        }
        return false;
    }

    /** Ungroups the groups that have no special properties. */
    private _explodeGroups(svgObject: SvgObject): void {
        let children: SvgObject[] = svgObject.children;
        let newChildren: SvgObject[] = [];
        let changed: boolean = false;
        for (let child of children) {
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