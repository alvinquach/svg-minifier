import { SvgObjectProperties } from "./property/svg-object-properties.class";
import { SvgObjectType } from "./svg-object-type.class";
import { SvgPathProperties } from "./property/path/svg-path-properties.class";

/** Reprents an SVG element. */
export class SvgObject {

    private _parent: SvgObject;

    private _type: SvgObjectType = SvgObjectType.Default;

    private _tag: string;

    private _properties: SvgObjectProperties;

    private _children: SvgObject[] = [];

    constructor(segment: string, nextSegments: string[], parent?: SvgObject) {

        this._parent = parent;

        let hasChildren = true;

        // Determine whether this SVG element has any children elements.
        if (!segment.indexOf(">") || segment.lastIndexOf("/") == segment.length - 1) {
            segment = segment.substr(0, segment.length - 1);
            hasChildren = false;
        }

        this._parseProperties(segment);

        while (hasChildren) {
            
            // Stop if there are no more elements.
            if (!nextSegments.length) {
                break;
            }

            const nextSegment: string = nextSegments.shift();

            // Each segment `should` start with either a '>' or a '<'.
            // We can ignore segments that are a single '>' character.
            if (nextSegment == ">") {
                continue;
            }

            // Skip over xml declarators, DOCTYPE declarators, and comments.
            if (!nextSegment.indexOf("<?") || !nextSegment.indexOf("<!")) {
                continue;
            }

            // If the next element is a closing tag for this element, then we can stop here.
            if (!nextSegment.indexOf("</") && nextSegment.substring(2) == this._tag) {
                break;
            }

            this._children.push(new SvgObject(nextSegment, nextSegments, this));
        }
    }

    get parent(): SvgObject {
        return this._parent;
    }

    set parent(value: SvgObject) {
        this._parent = value;
    }
    
    get type(): SvgObjectType {
        return this._type;
    }
    
    get tag(): string {
        return this._tag;
    }

    get properties(): SvgObjectProperties {
        return this._properties;
    }

    get children(): SvgObject[] {
        return this._children;
    }

    // Prints the contents of this SVG code segment to the console.
    printContents(): void {
        console.log(this._generateSimplifiedNode());
    }

    protected _generateSimplifiedNode(): any {
        const result: any = {
            tag: this._tag,
            properties: this._properties,
            children: this._children.map(c => c._generateSimplifiedNode())
        }
        return result;
    }

    private _parseProperties(segment: string): void {

        // Check if the segment starts with '>'.
        if (!segment.indexOf('>')) {

            // If the segment starts with a '>' and is not a single character, 
            // then it is part of the inner contents of the SVG element.
            if (segment.length > 1) {
                this._tag = null;
                this._type = SvgObjectType.ElementInnerContent;
                this._properties = new SvgObjectProperties(this, segment.substring(1));
            }

            // Return here regardless of the segment length.
            // If the segment was a single '<', then nothing was done,
            // but this should not be possible, as such segments should
            // have been filtered out prior to calling this function.
            return;
        }

        // At this point, the first character of the segment should always be '<', which we can remove.
        if (!segment.indexOf('<')) {
            segment = segment.substring(1);
        }

        const tagEndIndex: number = segment.indexOf(" ");
        
        // If there is only the tag in the code segment, then we can stop here.
        if (tagEndIndex < 0) {
            this._tag = segment;
            this._type = SvgObjectType.findByTag(this._tag) || SvgObjectType.Default;
            this._properties = new SvgObjectProperties(this);
            return;
        }

        // Parse the tag and then remove it from the segment.
        this._tag = segment.substring(0, tagEndIndex);
        this._type = SvgObjectType.findByTag(this._tag) || SvgObjectType.Default;
        segment = segment.substring(tagEndIndex + 1);

        if (this._type === SvgObjectType.Path) {
            this._properties = new SvgPathProperties(this, segment);
        }
        else {
            this._properties = new SvgObjectProperties(this, segment);
        }

    }

}