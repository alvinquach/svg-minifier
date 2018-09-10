import { fixGTSportRaidalGradient, removeDefaultStopColor, removeDefaultStrokeMiter } from "../../../defs/svg-object-type-functions";
import { ProcessFunctions } from "../../../defs/type/process-function.type";

export class SvgObjectType {

    /** circle */
    static readonly Circle: SvgObjectType = {
        tag: 'circle',
        isPathItem: true,
        display: true
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
        display: true
    }

    /** defs */
    static readonly Definitions: SvgObjectType = {
        tag: 'defs',
        display: true
    }

    /** filter */
    static readonly Filter: SvgObjectType = {
        tag: 'filter',
        display: false
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
            removeDefaultStrokeMiter
        ]
    }

    /** linearGradient */
    static readonly LinearGradient: SvgObjectType = {
        tag: 'linearGradient',
        display: true
    }

    /** mask */
    static readonly Mask: SvgObjectType = {
        tag: 'mask',
        display: false
    }

    /** path */
    static readonly Path: SvgObjectType = {
        tag: 'path',
        isPathItem: true,
        display: true,
        postProcessFunctions: [
            removeDefaultStrokeMiter
        ]
    }

    /** polygon */
    static readonly Polygon: SvgObjectType = {
        tag: 'polygon',
        isPathItem: true,
        display: true,
        postProcessFunctions: [
            removeDefaultStrokeMiter
        ]
    }

    /** polyline */
    static readonly Polyline: SvgObjectType = {
        tag: 'polyline',
        isPathItem: true,
        display: true,
        postProcessFunctions: [
            removeDefaultStrokeMiter
        ]
    }

    /** radialGradient */
    static readonly RadialGradient: SvgObjectType = {
        tag: 'radialGradient',
        display: true,
        postProcessFunctions: [
            fixGTSportRaidalGradient
        ]
    }
    
    /** rect */
    static readonly Rectangle: SvgObjectType = {
        tag: 'rect',
        isPathItem: true,
        display: true,
        postProcessFunctions: [
            removeDefaultStrokeMiter
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
        display: true
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

    /** 
     * A list of functions to be executed on the SVG object before the global processing operations
     * (except for defs consolidation, style explosion, and ID minfication which are always performed first).
     */
    readonly preProcessFunctions?: ProcessFunctions;

    /** A list of functions to be executed on the SVG object after the global processing operations. */
    readonly postProcessFunctions?: ProcessFunctions;

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