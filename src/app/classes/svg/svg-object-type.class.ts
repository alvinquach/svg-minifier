export class SvgObjectType {

    /** circle */
    static readonly Circle: SvgObjectType = {
        tag: "circle",
        display: true
    }

    /** clipPath */
    static readonly ClipPath: SvgObjectType = {
        tag: "clipPath",
        display: true
    }

    /** ellipse */
    static readonly Ellipse: SvgObjectType = {
        tag: "ellipse",
        display: true
    }

    /** defs */
    static readonly Definitions: SvgObjectType = {
        tag: "defs",
        display: true
    }

    /** g */
    static readonly Group: SvgObjectType = {
        tag: "g",
        display: true
    }

    /** image */
    static readonly Image: SvgObjectType = {
        tag: "image",
        display: false
    }

    /** path */
    static readonly Path: SvgObjectType = {
        tag: "path",
        display: true
    }

    /** rect */
    static readonly Rectangle: SvgObjectType = {
        tag: "rect",
        display: true
    }

    /** svg */
    static readonly Svg: SvgObjectType = {
        tag: "svg",
        display: true
    }

    /** use */
    static readonly Use: SvgObjectType = {
        tag: "use",
        display: true
    }

    /** Default tag for unrecognized tags. */ 
    static readonly Default: SvgObjectType = { 
        tag: "default",
        display: true
    }; 

    private static _tagMap: {[key: string]: SvgObjectType};

    readonly tag: string;

    readonly display: boolean;

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