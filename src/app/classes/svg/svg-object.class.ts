import { SvgObjectType } from "./svg-object-type.class";

/** Reprents an SVG element. */
export class SvgObject {

    private _type: SvgObjectType = SvgObjectType.Default;

    private _tag: string;

    private _properties: {[key: string]: string} = {};

    private _children: SvgObject[] = [];

    constructor(contents: string, nextElements: string[]) {

        let hasChildren = true;

        // Determine whether this SVG element has any children elements.
        if (contents.lastIndexOf("/") == contents.length - 1) {
            contents = contents.substr(0, contents.length - 1);
            hasChildren = false;
        }

        this._parseProperties(contents);

        while (hasChildren) {
            
            // Stop if there are no more elements.
            if (!nextElements.length) {
                break;
            }

            // Skip over xml declarators, DOCTYPE declarators, and comments.
            if (!nextElements[0].indexOf("?") || !nextElements[0].indexOf("!")) {
                nextElements.shift();
                continue;
            }

            // If the next element is a closing tag for this element, then we can stop here.
            if (!nextElements[0].indexOf("/") && nextElements[0].substring(1) == this._tag) {
                nextElements.shift();
                break;
            }

            this._children.push(new SvgObject(nextElements.shift(), nextElements));
        }
    }
    
    get type(): SvgObjectType {
        return this._type;
    }
    
    get tag(): string {
        return this._tag;
    }

    get properties(): {[key: string]: string} {
        return this._properties;
    }

    get children(): SvgObject[] {
        return this._children;
    }

    // Prints the contents of this SVG element to the console.
    printContents(): void {
        console.log(this._generateSimplifiedNode());
    }

    protected _generateSimplifiedNode(): any {
        let result: any = {
            tag: this._tag,
            properties: this._properties,
            children: this._children.map(c => c._generateSimplifiedNode())
        }
        return result;
    }

    private _parseProperties(contents: string): void {

        let tagEndIndex: number = contents.indexOf(" ");
        
        // If there is only the tag in the element contents, then we can stop here.
        if (tagEndIndex < 0) {
            this._tag = contents;
            this._type = SvgObjectType.findByTag(this._tag) || SvgObjectType.Default;
            return;
        }

        // Parse the tag and then remove it from element contents.
        this._tag = contents.substring(0, tagEndIndex);
        this._type = SvgObjectType.findByTag(this._tag) || SvgObjectType.Default;
        contents = contents.substring(tagEndIndex + 1);

        let properties: string[] = contents.split("\" ");

        // Remove end quote from last property.
        let lastProperty: string = properties[properties.length - 1];
        if (lastProperty.lastIndexOf("\"") == lastProperty.length - 1) {
            properties[properties.length - 1] = lastProperty.substr(0, lastProperty.length - 1);
        }

        for (let property of properties) {
            let separatorIndex: number = property.indexOf("=\"");
            if (separatorIndex < 0) {
                continue;
            }
            let key: string = property.substring(0, separatorIndex).trim();
            let value: string = property.substring(separatorIndex + 2);
            this._properties[key] = value;
        }

    }

}