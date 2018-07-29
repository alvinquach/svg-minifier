import { Injectable } from "@angular/core";
import { DecimalPipe } from "@angular/common";
import { SvgObject } from "../classes/svg/element/svg-element.class";
import { SvgParserService } from "./svg-parser.service";
import { SvgWriterService } from "./svg-writer.service";
import { SvgObjectType } from "../classes/svg/element/svg-element-type.class";
import { ColorUtils } from "../utils/color.utils";
import { TransformMatrix } from "../classes/matrix/transform-matrix.class";
import { MathUtils } from "../utils/math.utils";
import { SvgElementProperty } from "../classes/svg/property/svg-element-property.class";
import { SvgOutputOptions } from "../classes/svg/options/svg-output-options.class";
import { SvgElementProperties } from "../classes/svg/property/svg-element-properties.class";
import { PropertyUtils } from "../utils/property.utils";
import { StyleUtils } from "../utils/style.utils";
import { Color } from "../classes/style/color.class";


@Injectable()
export class MinifierService {

    private _decimalPipe: DecimalPipe = new DecimalPipe("en-US");

    constructor(private _svgParser: SvgParserService, private _svgWriter: SvgWriterService) {

    }

    minify(data: string, svgOutputOptions?: SvgOutputOptions): string {
        
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
        const propertiesFlatMap: SvgElementProperties[] = this._getPropertiesFlatMap(parsed);

        // Explode the style properites into separate properites.
        this._explodeStyles(propertiesFlatMap);

        // Replace IDs and references with minified versions.
        this._idSubstitution(propertiesFlatMap);

        // Removes properties that have no effect on an element.
        this._removeUnusedProperties(propertiesFlatMap, svgOutputOptions);

        // Shorten color hex codes (ie #DDFF00 --> #DF0).
        // This should be called after removing un-needed black color properties.
        this._shortenHexCodes(propertiesFlatMap);

        // Combine color and opacity properties into a single color property.
        // This should be called after removing un-needed black color properties.
        //
        // THIS HAS BEEN REMOVED, as it is not supported in GT Sport.
        //
        // this._mergeColorOpacity(propertiesFlatMap);

        // GT Sport specific fixes.
        this._fixForGTSport(parsed, svgOutputOptions.gtSportRadialGradientFix);

        // Ungroup groups
        this._explodeGroups(parsed);
        
        // Console log
        parsed.printContents();

        return this._svgWriter.writeAsString(parsed, svgOutputOptions && svgOutputOptions.outputSingleLine ? undefined : '\t');

        // TODO Remove "px".

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
            const display: SvgElementProperty = child.properties.propertyMap['display'];
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

    private _getPropertiesFlatMap(svgObject: SvgObject): SvgElementProperties[] {
        const result: SvgElementProperties[] = [];
        result.push(svgObject.properties)
        for (const child of svgObject.children) {
            result.push(...this._getPropertiesFlatMap(child));
        }
        return result;
    }

    private _idSubstitution(propertiesFlatMap: SvgElementProperties[]): void {
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
    private _findIdReferences(propertiesFlatMap: SvgElementProperties[], map: {[key: string]: IdProperties}): void {
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
    private _replaceIdReferences(propertiesFlatMap: SvgElementProperties[], map: {[key: string]: IdProperties}): void {
        propertiesFlatMap.map(p  => p.propertyMap).forEach(properties => {
            for (const key in properties) {
                const value: string = properties[key].value;
                if (key == "id") {
                    const id: IdProperties = map[value];
                    if (id) {
                        if (id.replacement) {
                            properties[key].value = id.replacement;
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
                                properties[key].value = value.replace(oldId, id.replacement);
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

    /**
     * Merges color and opacity properties into an rgba value.
     * Example: <... stroke="#FAD9CF" stroke-opacity=".25" ...> will become
     * <... stroke="rgba(250,217,207,.25)" ...> after the merge.
     * 
     * Currently unused, as it is not supported by GT Sport.
     */
    private _mergeColorOpacity(propertiesFlatMap: SvgElementProperties[]): void {

        // TODO Move this somewhere else?
        const colorOpacityPairs: {colorKey: string, opacityKey: string}[] = [
            { colorKey: 'fill', opacityKey: 'fill-opacity' },
            { colorKey: 'stroke', opacityKey: 'stroke-opacity' },
            { colorKey: 'stop-color', opacityKey: 'stop-opacity' },
        ];

        propertiesFlatMap.map(p  => p.propertyMap).forEach(properties => {

            colorOpacityPairs.forEach(keyPair => {
                if (keyPair.colorKey in properties && keyPair.opacityKey in properties) {
                    const colorValue = properties[keyPair.colorKey].value;
                    
                    // TODO Handle non hex color values.
                    if (!ColorUtils.isHexColor(colorValue)) {
                        return;
                    }
                    
                    const color: Color = new Color();
                    color.setFromHex(colorValue);
                    color.alpha = Number.parseFloat(properties[keyPair.opacityKey].value);

                    properties[keyPair.colorKey].value = color.toRGBAString(true);
                    delete properties[keyPair.opacityKey];
                }
            });

        });
    }

    /** Shortens color hex codes (ie #DDFF00 --> #DF0). */
    private _shortenHexCodes(propertiesFlatMap: SvgElementProperties[]): void {

        propertiesFlatMap.map(p  => p.propertyMap).forEach(properties => {
            for (const key in properties) {

                let value: string = properties[key].value;
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
                    properties[key].value = value;
                }
            }
        });
    }

    /** Explodes style properties into separate properties. */
    private _explodeStyles(propertiesFlatMap: SvgElementProperties[]): void {
        propertiesFlatMap.map(p  => p.propertyMap).forEach(properties => {
            if ('style' in properties) {
                const style: {[key: string]: string} = StyleUtils.parseStyle(properties['style'].value);
                let changed: boolean = false;

                // TODO Find out which other styles can be exploded.
                // Only the stop-color and stop-opacity are exploded for now.
                if ('stop-color' in style) {
                    properties['stop-color'] = new SvgElementProperty(style['stop-color']);
                    delete style['stop-color'];
                    changed = true;
                }
                if ('stop-opacity' in style) {
                    properties['stop-opacity'] = new SvgElementProperty(style['stop-opacity']);
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

    /** Removes properties that have no effect on an element. */
    private _removeUnusedProperties(propertiesFlatMap: SvgElementProperties[], options: SvgOutputOptions): void {

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

                // Removes black colors for fill and stop-color, since no color defined will result in black anyways.
                if ((key == 'fill' || key == 'stop-color') && ColorUtils.isBlack(value)) {
                    delete properties[key];
                }

                // Removes stroke-miterlimit="4", since the value is 4 by default.
                // TODO Move this to a service or utility for paths.
                if (key == 'stroke-miterlimit' && value == "4") {
                    delete properties[key];
                }

                // Remove miterlimit for non-miter linejoins.
                // TODO Move this to a service or utility for paths.
                if (key == 'stroke-linejoin' && value != "miter") {
                    delete properties['stroke-miterlimit'];
                }

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

    /** Attempts to fix various issues that GT Sport has with the SVG standards. */
    private _fixForGTSport(svgObject: SvgObject, fixRadialGradients: boolean, aspectRatio?: number): void {

        // Get properties map for current SVG element.
        const properties: {[key: string]: SvgElementProperty} = svgObject.properties.propertyMap;        

        // Check the root svgObject (which should be the 'svg' tagged element) for a viewBox property.
        // If the aspect ratio of the view box is portrait (height > width), then there is a bug in
        // GT Sport that renders radialGradients with incorrect radius. If this is the case, then the
        // radius of every radial gradient will have to be multiplied by the aspect ratio to be displayed
        // correctly. This code assumes that the first two values of the viewBox property are both zeros.
        //
        // TODO Figure out what happens if the first two values are non-zero.
        if (fixRadialGradients && !aspectRatio && svgObject.type == SvgObjectType.Svg) {

            if ('viewBox' in properties) {
                const viewBox: string[] = properties['viewBox'].value.split(" ");
                const width: number = Number.parseFloat(viewBox[2]);
                const height: number  = Number.parseFloat(viewBox[3]);

                // Radial gradients should work propertly in this case and does not need to be fixed.
                if (width >= height) {
                    fixRadialGradients = false; 
                }

                // Calculate the aspect ratio and apply it to the radii later.
                else {
                    aspectRatio = width / height;
                }
            }
        }

        // Apply aspect ratio correction to the radius of radial gradients if needed.
        if (fixRadialGradients && aspectRatio && svgObject.type == SvgObjectType.RadialGradient && 'r' in properties) {
            const radius: number = Number.parseFloat(properties['r'].value);

            // TODO Determine the required precision.
            properties['r'].value = this._decimalPipe.transform(aspectRatio * radius, "1.0-2");
        }

        // Applies the gradientTransform matrix to the gradient itself,
        // since GT Sport does not support tranformation matrices on gradients.
        //
        // FIXME Add sanity checks.
        // TODO Move this to a service or utility for gradients.
        if ('gradientTransform' in properties) {
            const gradientTransform: string = properties['gradientTransform'].value;

            // Assumes that the property starts with "matrix(" and ends with ")".
            const values: string[] = gradientTransform.substring(7, gradientTransform.length - 1).split(" ");

            // Assumes that all values are valid numbers.
            const matrix: TransformMatrix = new TransformMatrix(...values.map(v => Number(v)));

            // FIXME The above two opertaion are a waste if the if-statements below all evaluate to false.

            // linearGradient
            if ('x1' in properties && 'y1' in properties && 'x2' in properties && 'y2' in properties) {
                
                // Assumes that all values are valid numbers.
                const start: number[] = MathUtils.transformPoint(Number(properties['x1'].value), Number(properties['y1'].value), matrix.toArray());
                const end: number[] = MathUtils.transformPoint(Number(properties['x2'].value), Number(properties['y2'].value), matrix.toArray());

                // TODO Determine the required precision.
                properties['x1'].value = this._decimalPipe.transform(start[0], "1.0-3");
                properties['y1'].value = this._decimalPipe.transform(start[1], "1.0-3");
                properties['x2'].value = this._decimalPipe.transform(end[0], "1.0-3");
                properties['y2'].value = this._decimalPipe.transform(end[1], "1.0-3");
                delete properties['gradientTransform'];
            }

            // radialGradients
            else if ('cx' in properties && 'cy' in properties && 'r' in properties) {

                // Assumes that all values are valid numbers.
                const center: number[] = MathUtils.transformPoint(Number(properties['cx'].value), Number(properties['cy'].value), matrix.toArray());

                // TODO Determine the required precision.
                properties['cx'].value = this._decimalPipe.transform(center[0], "1.0-2");
                properties['cy'].value = this._decimalPipe.transform(center[1], "1.0-2");
                properties['r'].value = this._decimalPipe.transform(MathUtils.transformVector(Number(properties['r'].value), undefined, matrix.toArray())[0], "1.0-3");
                delete properties['gradientTransform'];
            }
        }

        // Call recursively to traverse through children.
        svgObject.children.forEach(child => {
            this._fixForGTSport(child, fixRadialGradients, aspectRatio);
        });

    }

    /** Ungroups the groups that have no special properties. */
    private _explodeGroups(svgObject: SvgObject): void {
        const children: SvgObject[] = svgObject.children;
        const newChildren: SvgObject[] = [];
        let changed: boolean = false;
        for (const child of children) {
            this._explodeGroups(child);
            if (child.type == SvgObjectType.Group && !child.properties.hasProperties) {
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