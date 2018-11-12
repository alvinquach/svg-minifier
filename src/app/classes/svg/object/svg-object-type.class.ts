import { fixGTSportRaidalGradient, removeDefaultStopColor, removeDefaultStrokeMiter, removeGradientUnits, shiftDecimal } from "../../../defs/svg-object-type-functions";
import { ProcessFunctions } from "../../../defs/type/process-function.type";

export class SvgObjectType {

    /** circle */
    static readonly Circle: SvgObjectType = {
        tag: 'circle',
        isPathItem: true,
        display: true,
        postProcessFunctions: [
            shiftDecimal
        ],
        decimalShiftProperites: [
            'cx', 'cy', 'r', 'stroke-width'
        ]
    }

    /** clipPath */
    static readonly ClipPath: SvgObjectType = {
        tag: 'clipPath',
        display: true
    }

    /** ellipse */
    static readonly Ellipse: SvgObjectType = {
        tag: 'ellipse',
        isPathItem: true,
        display: true,
        postProcessFunctions: [
            shiftDecimal
        ],
        decimalShiftProperites: [
            'cx', 'cy', 'rx', 'ry', 'stroke-width'
        ]
    }

    /** defs */
    static readonly Definitions: SvgObjectType = {
        tag: 'defs',
        display: true
    }

    /** filter */
    static readonly Filter: SvgObjectType = {
        tag: 'filter',
        display: true,
        postProcessFunctions: [
            shiftDecimal
        ],
        decimalShiftProperites: [
            // TODO Ignore depending on filterUnits
            'x', 'y', 'width', 'height'
        ]
    }

    /** g */
    static readonly Group: SvgObjectType = {
        tag: 'g',
        display: true
    }

    /** image */
    static readonly Image: SvgObjectType = {
        tag: 'image',
        display: false
    }

    /** line */
    static readonly Line: SvgObjectType = {
        tag: 'line',
        isPathItem: true,
        display: true,
        postProcessFunctions: [
            removeDefaultStrokeMiter,
            shiftDecimal
        ],
        decimalShiftProperites: [
            'x1', 'x2', 'y1', 'y2', 'stroke-width'
        ]
    }

    /** linearGradient */
    static readonly LinearGradient: SvgObjectType = {
        tag: 'linearGradient',
        display: true,
        idRequired: true,
        postProcessFunctions: [
            removeGradientUnits,
            shiftDecimal
        ],
        decimalShiftProperites: [
            'x1', 'x2', 'y1', 'y2'
        ]
    }

    /** mask */
    static readonly Mask: SvgObjectType = {
        tag: 'mask',
        display: true,
        postProcessFunctions: [
            shiftDecimal
        ],
        decimalShiftProperites: [
            // TODO Ignore depending on maskContentUnits/maskUnits
            'x', 'y', 'width', 'height'
        ]
    }

    /** path */
    static readonly Path: SvgObjectType = {
        tag: 'path',
        isPathItem: true,
        display: true,
        postProcessFunctions: [
            removeDefaultStrokeMiter,
            shiftDecimal
        ],
        decimalShiftProperites: [
            'stroke-width'
        ]
    }

    /** polygon */
    static readonly Polygon: SvgObjectType = {
        tag: 'polygon',
        isPathItem: true,
        display: true,
        postProcessFunctions: [
            removeDefaultStrokeMiter,
            shiftDecimal
        ],
        decimalShiftProperites: [
            'stroke-width'
        ]
    }

    /** polyline */
    static readonly Polyline: SvgObjectType = {
        tag: 'polyline',
        isPathItem: true,
        display: true,
        postProcessFunctions: [
            removeDefaultStrokeMiter,
            shiftDecimal
        ],
        decimalShiftProperites: [
            'stroke-width'
        ]
    }

    /** radialGradient */
    static readonly RadialGradient: SvgObjectType = {
        tag: 'radialGradient',
        display: true,
        idRequired: true,
        postProcessFunctions: [
            fixGTSportRaidalGradient,
            removeGradientUnits,
            shiftDecimal
        ],
        decimalShiftProperites: [
            'cx', 'cy', 'r'
        ]
    }
    
    /** rect */
    static readonly Rectangle: SvgObjectType = {
        tag: 'rect',
        isPathItem: true,
        display: true,
        postProcessFunctions: [
            removeDefaultStrokeMiter,
            shiftDecimal
        ],
        decimalShiftProperites: [
            'x', 'y', 'width', 'height', 'rx', 'ry', 'stroke-width'
        ]
    }

    /** stop */
    static readonly Stop: SvgObjectType = {
        tag: 'stop',
        display: true,
        preProcessFunctions: [
            removeDefaultStopColor
        ]
    }

    /** svg */
    static readonly Svg: SvgObjectType = {
        tag: 'svg',
        display: true,
        postProcessFunctions: [
            shiftDecimal
        ]
    }

    /** use */
    static readonly Use: SvgObjectType = {
        tag: 'use',
        display: true
    }

    /** Inner contents of an element. Not an actual element. */ 
    static readonly ElementInnerContent: SvgObjectType = { 
        tag: null,
        display: false
    }; 

    /** Default tag for unrecognized tags. */ 
    static readonly Default: SvgObjectType = { 
        tag: 'default',
        display: true
    }; 

    private static _tagMap: {[key: string]: SvgObjectType};

    readonly tag: string;

    readonly isPathItem?: boolean;

    readonly display: boolean;

    readonly idRequired?: boolean;

    /** 
     * A list of functions to be executed on the SVG object before the global processing operations
     * (except for defs consolidation, style explosion, and ID minfication which are always performed first).
     */
    readonly preProcessFunctions?: ProcessFunctions;

    /** A list of functions to be executed on the SVG object after the global processing operations. */
    readonly postProcessFunctions?: ProcessFunctions;

    /** A list of properties that should be affected when applying decimal shift. */
    readonly decimalShiftProperites?: string[];

    static findByTag(tag: string): SvgObjectType {
        if (!this._tagMap) {
            this._generateTagMap();
        }
        return this._tagMap[tag];
    }

    private static _generateTagMap(): void {
        if (this._tagMap) {
            return;
        }
        this._tagMap = {};
        for (const key of Object.keys(SvgObjectType)) {
            const object: any = SvgObjectType[key];
            if (object.tag) {
                this._tagMap[object.tag] = object;
            }
        }
    }

}