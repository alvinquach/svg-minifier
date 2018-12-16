import { DecimalPipe } from "@angular/common";
import { Injectable } from "@angular/core";
import { SvgObjectProperties } from "../classes/svg/object/property/svg-object-properties.class";
import { SvgObjectProperty } from "../classes/svg/object/property/svg-object-property.class";
import { SvgObjectType } from "../classes/svg/object/svg-object-type.class";
import { SvgObject } from "../classes/svg/object/svg-object.class";
import { SvgMinifyOptions } from "../classes/svg/options/svg-minify-options.class";
import { ProcessFunctions } from "../defs/type/process-function.type";
import { VariableNames } from "../defs/variable-names";
import { ColorUtils } from "../utils/color.utils";
import { IdUtils } from "../utils/id.utils";
import { StyleUtils } from "../utils/style.utils";
import { DevFeatureService } from "./dev-feature.service";
import { SvgParserService } from "./svg-parser.service";
import { SvgWriterService } from "./svg-writer.service";
import { MinifierUtils } from "../utils/minifier.utils";


@Injectable()
export class MinifierService {

    private _decimalPipe: DecimalPipe = new DecimalPipe("en-US");

    constructor(private _svgParser: SvgParserService,
                private _svgWriter: SvgWriterService,
                private _devFeatures: DevFeatureService) {

    }

    minify(data: string, svgMinifyOptions?: SvgMinifyOptions): string {
        
        // Remove all tabs and line breaks.
        let result: string = data.replace(/\r?\n|\r|\t/g, "");

        // Remove whitespace between consecutive closing and opening tags.
        // This is typically not needed if the file was saved directly from Illustrator.
        result = result.replace(/\>\s+\</g, "><");
        
        // Data can now be parsed once all the unnecessary whitespaces have been removed.
        const parsed: SvgObject = this._svgParser.parse(result);

        // Aspect ratio of the view box.
        const viewBoxAspectRatio: number = this._calculateAspectRatio(parsed);

        // Apply the "Group Gradient" dev feature.
        if (svgMinifyOptions.groupGradients) {
            this._devFeatures.groupGradients(parsed, svgMinifyOptions);
        }
        
        // Remove elements that will not be displayed in GT Sport.
        this._removeNoDisplay(parsed);

        // Gather the defs elements and move it to the top of the SVG.
        const defs: SvgObject = this._gatherDefs(parsed);
        if (defs) {
            parsed.children.unshift(defs);
        }

        // Collect the properties from all the SVG elements;
        const propertiesFlatMap: SvgObjectProperties[] = this._getPropertiesFlatMap(parsed);

        // Explode the style properites into separate properites.
        this._explodeStyles(propertiesFlatMap);

        // Replace IDs and references with minified version, if the option was selected.
        if (svgMinifyOptions.minifyElementIds) {
            this._idSubstitution(propertiesFlatMap);
        }

        // Apply the pre-process functions for each element as defined by its type in SvgObjectType.
        this._processIndividualElements('pre', parsed, svgMinifyOptions, {
            [VariableNames.ViewBoxAspectRatio]: viewBoxAspectRatio
        });
        
        // Removes properties that have no effect on an element.
        this._removeUnusedProperties(propertiesFlatMap, svgMinifyOptions);

        // Shorten color hex codes (ie #DDFF00 --> #DF0).
        // This should be called after removing un-needed black color properties.
        this._shortenHexCodes(propertiesFlatMap);

        // Ungroup groups
        MinifierUtils.explodeGroups(parsed, svgMinifyOptions);

        // Apply the post-process functions for each element as defined by its type in SvgObjectType.
        this._processIndividualElements('post', parsed, svgMinifyOptions, {
            [VariableNames.ViewBoxAspectRatio]: viewBoxAspectRatio
        });
        
        // Console log
        parsed.printContents();

        return this._svgWriter.writeAsString(parsed, svgMinifyOptions && svgMinifyOptions.outputSingleLine ? undefined : '\t');

        // TODO Remove "px".

    }

    private _calculateAspectRatio(svgRootObject: SvgObject): number {
        const properties: {[key: string]: SvgObjectProperty} = svgRootObject.properties.propertyMap;        

        // Check the root svgObject (which should be the 'svg' tagged element) for a viewBox property.
        // This code assumes that the first two values of the viewBox property are both zeros.
        //
        // TODO Figure out what happens if the first two values are non-zero.
        if (svgRootObject.type == SvgObjectType.Svg && 'viewBox' in properties) {
            const viewBox: string[] = properties['viewBox'].value.split(" ");
            const width: number = Number.parseFloat(viewBox[2]);
            const height: number  = Number.parseFloat(viewBox[3]);
            return width / height;
        }

        return null; // Should this return something else?
    }

    /**
     * Remove groups and other elements that have display property "none".
     * Also removes elements that can't be displayed by GT Sport, such as embedded images.
     */
    private _removeNoDisplay(svgObject: SvgObject): void {
        const children = svgObject.children;
        for (let i = 0; i < children.length; i++) {
            const child = children[i];
            // TODO Add other element types that are not supported by GT Sport.
            const display: SvgObjectProperty = child.properties.propertyMap['display'];
            if (display && display.value  == "none" || !child.type.display) {
                children.splice(i--, 1);
                continue;
            }
            if (child.children.length) {
                this._removeNoDisplay(child);
            }
        }
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

    private _getPropertiesFlatMap(svgObject: SvgObject): SvgObjectProperties[] {
        const result: SvgObjectProperties[] = [];
        result.push(svgObject.properties)
        for (const child of svgObject.children) {
            result.push(...this._getPropertiesFlatMap(child));
        }
        return result;
    }

    private _idSubstitution(propertiesFlatMap: SvgObjectProperties[]): void {
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
    private _findIdReferences(propertiesFlatMap: SvgObjectProperties[], map: {[key: string]: IdProperties}): void {
        propertiesFlatMap.map(p  => p.propertyMap).forEach(properties => {
            for (const key in properties) {
                let value: string = properties[key].value;
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
        });
    }

    /** Helper function for _idSubstitution(). */    
    private _generateReplacementIds(map: {[key: string]: IdProperties}): void {
        const currentId: number[] = IdUtils.newId();
        for (const key of Object.keys(map)) {
            const id: IdProperties = map[key];
            if (!id.useCount || !id.defFound) {
                continue;
            }
            id.replacement = IdUtils.asString(currentId);
            IdUtils.incrementId(currentId);
        }

    }

    /** Helper function for _idSubstitution(). */
    private _replaceIdReferences(propertiesFlatMap: SvgObjectProperties[], map: {[key: string]: IdProperties}): void {
        propertiesFlatMap.forEach(p => {
            const properties = p.propertyMap;
            for (const key in properties) {
                const value: string = properties[key].value;
                if (key === 'id') {
                    const id:IdProperties = map[value];
                    if (id) {
                        if (id.replacement) {
                            properties[key].value = id.replacement;
                        }
                        else {
                            const svgObject = p.parent;
                            if (svgObject && svgObject.type.idRequired) {
                                const parentObject = svgObject.parent;
                                const index = parentObject.children.indexOf(svgObject);
                                if (index > -1) {
                                    console.log(svgObject)
                                    parentObject.children.splice(index, 1);
                                    // TODO Remove parent reference from object?
                                    continue;
                                }
                            }
                            delete properties['id'];
                        }
                    }
                }
                else {
                    const oldId: string = this._parseReference(value);
                    if (oldId) {
                        const id: IdProperties = map[oldId];
                        if (id) {
                            if (id.replacement) {
                                properties[key].value = value.replace(`#${oldId}`, `#${id.replacement}`);
                            }
                            else {
                                delete properties[key];
                            }
                        }
                    }
                }
            }
        });
    }

    /** Shortens color hex codes (ie #DDFF00 --> #DF0). */
    private _shortenHexCodes(propertiesFlatMap: SvgObjectProperties[]): void {
        const longHexCodePattern = new RegExp(/^#[0-9a-f]{6}/i);
        propertiesFlatMap.map(p  => p.propertyMap).forEach(properties => {
            for (const key in properties) {
                const value: string = properties[key].value;
                if (longHexCodePattern.test(value)) {
                    properties[key].value = ColorUtils.hexToShortHex(value);
                }
            }
        });
    }

    /** Explodes style properties into separate properties. */
    private _explodeStyles(propertiesFlatMap: SvgObjectProperties[]): void {
        propertiesFlatMap.map(p  => p.propertyMap).forEach(properties => {
            if ('style' in properties) {
                const style: {[key: string]: string} = StyleUtils.parseStyle(properties['style'].value);
                let changed: boolean = false;

                // TODO Find out which other styles can be exploded.
                // Only the stop-color and stop-opacity are exploded for now.
                if ('stop-color' in style) {
                    properties['stop-color'] = new SvgObjectProperty(style['stop-color']);
                    delete style['stop-color'];
                    changed = true;
                }
                if ('stop-opacity' in style) {
                    properties['stop-opacity'] = new SvgObjectProperty(style['stop-opacity']);
                    delete style['stop-opacity'];
                    changed = true;
                }

                // TODO Store styles as a map isntead of a string and write as
                // string at the very end when the SVG is writted as string.
                if (changed) {
                    if (Object.keys(style).length) {
                        properties['style'].value = StyleUtils.writeStyleAsString(style);
                    }
                    else {
                        delete properties['style'];
                    }
                }
            }
        });
    }

    /** Checks enitre SVG object tree and removes properties that have no effect on an element. */
    private _removeUnusedProperties(propertiesFlatMap: SvgObjectProperties[], options: SvgMinifyOptions): void {

        // Contains a list of properties that should always be removed.
        // TODO Move this somewhere else.
        // TODO Maybe use a Set for this.
        const unusedProperites: string[] = [
            'enable-background'
        ];

        propertiesFlatMap.map(p  => p.propertyMap).forEach(properties => {

            // Iterate through each property value.
            // TODO Move these operations somewhere else.
            Object.keys(properties).forEach(key => {

                // Need to check if the key still exists, since some keys could
                // have been removed in a previous iteration of the forEach loop.
                if (properties[key] == undefined) {
                    return;
                }

                const value: string = properties[key].value;

                // Removes the leading 0 in decimal values that are less than 1.
                if (!value.indexOf("0.")) {
                    properties[key].value = value.substring(1);
                }

                // Removes rest of unused properties.
                if (unusedProperites.indexOf(key) >= 0) {
                    delete properties[key];
                }

            });

        });
    }

    /** Calls process functions on each individual SVG element, as defined by their SvgObjectType. */
    private _processIndividualElements(op: 'pre' | 'post', svgObject: SvgObject, options: SvgMinifyOptions, extras: any) {
        const functions: ProcessFunctions = op == 'pre' ? svgObject.type.preProcessFunctions : svgObject.type.postProcessFunctions;
        functions && functions.forEach(fn => {
            fn(svgObject, options, extras);
        });
        const children: SvgObject[] = svgObject.children;
        children.forEach(child => {
            this._processIndividualElements(op, child, options, extras);
        });
    }

}

interface IdProperties {

    replacement?: string;

    defFound: boolean;

    useCount: number;

}