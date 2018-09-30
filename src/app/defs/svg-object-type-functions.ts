import { TransformMatrix } from "../classes/matrix/transform-matrix.class";
import { SvgObjectProperty } from "../classes/svg/object/property/svg-object-property.class";
import { SvgObject } from "../classes/svg/object/svg-object.class";
import { SvgMinifyOptions } from "../classes/svg/options/svg-minify-options.class";
import { ColorUtils } from "../utils/color.utils";
import { MathUtils } from "../utils/math.utils";
import { VariableNames } from "./variable-names";
import { DecimalPipe } from "@angular/common";


const _DecimalPipe: DecimalPipe = new DecimalPipe("en-US");

/** 
 * Applies the gradientTransform matrix to the gradient itself, since GT Sport does not
 * support tranformation matrices on gradients.
 */
export const fixGTSportGradientTransform = (object: SvgObject, options: SvgMinifyOptions, extras: any) => {
    const properties = object.properties.propertyMap;
    if (!options.gtSportFixGradientTransform || !('gradientTransform' in properties)) {
        return;
    }
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
        properties['x1'].value = _DecimalPipe.transform(start[0], "1.0-3");
        properties['y1'].value = _DecimalPipe.transform(start[1], "1.0-3");
        properties['x2'].value = _DecimalPipe.transform(end[0], "1.0-3");
        properties['y2'].value = _DecimalPipe.transform(end[1], "1.0-3");
        delete properties['gradientTransform'];
    }

    // radialGradients
    else if ('cx' in properties && 'cy' in properties && 'r' in properties) {

        // Assumes that all values are valid numbers.
        const center: number[] = MathUtils.transformPoint(Number(properties['cx'].value), Number(properties['cy'].value), matrix.toArray());

        // TODO Determine the required precision.
        properties['cx'].value = _DecimalPipe.transform(center[0], "1.0-2");
        properties['cy'].value = _DecimalPipe.transform(center[1], "1.0-2");
        properties['r'].value = _DecimalPipe.transform(MathUtils.transformVector(Number(properties['r'].value), undefined, matrix.toArray())[0], "1.0-3");
        delete properties['gradientTransform'];
    }
}

/**
 * If the aspect ratio of the view box is portrait (height > width), then there is a bug in GT Sport
 * that renders radialGradients with incorrect radius. If this is the case, then the radius of every
 * radial gradient will have to be multiplied by the aspect ratio to be displayed correctly.
 */
export const fixGTSportRaidalGradient = (object: SvgObject, options: SvgMinifyOptions, extras: any) => {
    const aspectRatio: number = extras && extras[VariableNames.ViewBoxAspectRatio]; // TODO type check

    // Radial gradients should work properly if aspect ratio is 1.0 or greater and does not need to be fixed.
    if (!options.gtSportFixRadialGradients || !aspectRatio || aspectRatio >= 1.0) {
        return;
    }

    const properties = object.properties.propertyMap;
    if ('r' in properties) {
        const radius: number = Number.parseFloat(properties['r'].value);

        // TODO Determine the required precision.
        properties['r'].value = _DecimalPipe.transform(aspectRatio * radius, "1.0-2"); 
    }
}

/** Removes fill property if it has a default (black) color value. */
export const removeDefaultFill = (object: SvgObject, options: SvgMinifyOptions, extras: any) => {
    const properties = object.properties.propertyMap;
    if ('fill' in properties && ColorUtils.isBlack(properties['fill'].value)) {
        delete properties['fill'];
    }
};

/** Removes stop-color property if it has a default (black) color value. */
export const removeDefaultStopColor = (object: SvgObject, options: SvgMinifyOptions, extras: any) => {
    const properties = object.properties.propertyMap;
    if ('stop-color' in properties && ColorUtils.isBlack(properties['stop-color'].value)) {
        delete properties['stop-color'];
    }
};

/** 
 * Removes stroke-linejoin and stroke-miterlimit properites with default ('miter' and 4, respectively) values.
 * Also removes the stroke-miterlimit property regardless of value if the stroke-linejoin is not 'miter' or if
 * the option was specified to remove all stroke-miterlimit properites.
 * @see https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-linejoin
 * @see https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-miterlimit
 */
export const removeDefaultStrokeMiter = (object: SvgObject, options: SvgMinifyOptions, extras: any) => {
    const properties = object.properties.propertyMap;
    const strokeLinejoin: SvgObjectProperty = properties['stroke-linejoin'];
    let isMiter: boolean = false;

    if (!strokeLinejoin || strokeLinejoin.value == 'miter') {
        isMiter = true;
        delete properties['stroke-linejoin'];
    }

    // If it is not a miter join, then the miter limit can be removed.
    // Also, GT Sport ignores the stroke-miterlimit property and always
    // uses a miter limit of 4, so optionally, it can be removed altogether.
    if (!isMiter || options.gtSportRemoveMiterLimits) {
        delete properties['stroke-miterlimit'];
    }

    // If it is a miter join, then remove the miter limit if it is already the default value (4).
    else {
        const strokeMiterLimit: SvgObjectProperty = properties['stroke-miterlimit'];
        if (strokeMiterLimit && strokeMiterLimit.value == '4') {
            delete properties['stroke-miterlimit'];
        }
    }
};

/** 
 * Removes the gradientUnits properties on both linear and radial gradients. GT Sport 
 * does not use the gradientUnits property; it will always default to 'userSpaceOnUse'
 * (but not 'objectBoundingBox', which is actually the standard default).
 * @see https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/gradientUnits
 */
export const removeGradientUnits = (object: SvgObject, options: SvgMinifyOptions, extras: any) => {
    if (options.gtSportRemoveGradientUnits) {
        delete object.properties.propertyMap['gradientUnits'];
    }
};