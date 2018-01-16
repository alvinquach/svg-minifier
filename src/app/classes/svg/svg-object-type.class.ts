export class SvgObjectType {

    /** clipPath */
    static readonly ClipPath: SvgObjectType = {
        tag: "clipPath"
    }

    /** defs */
    static readonly Definitions: SvgObjectType = {
        tag: "defs"
    }

    /** g */
    static readonly Group: SvgObjectType = {
        tag: "g"
    }

    /** image */
    static readonly Image: SvgObjectType = {
        tag: "image"
    }

    /** path */
    static readonly Path: SvgObjectType = {
        tag: "path"
    }

    /** rect */
    static readonly Rectangle: SvgObjectType = {
        tag: "rect"
    }

    /** svg */
    static readonly Svg: SvgObjectType = {
        tag: "svg"
    }

    /** use */
    static readonly Use: SvgObjectType = {
        tag: "use"
    }

    /** Default tag for unrecognized tags. */
    static readonly Default: SvgObjectType = {
        tag: "default"
    };

    private static _tagMap: {[key: string]: SvgObjectType};

    readonly tag: string;

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
        for (let key of Object.keys(SvgObjectType)) {
            let object: any = SvgObjectType[key];
            if (object.tag) {
                this._tagMap[object.tag] = object;
            }
        }
    }


}