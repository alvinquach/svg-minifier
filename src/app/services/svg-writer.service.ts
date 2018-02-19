import { Injectable } from "@angular/core";
import { SvgObject } from "../classes/svg/svg-object.class";

@Injectable()
export class SvgWriterService {

    writeAsString(svgObject: SvgObject): string {
        
        // Get the properties and its keys from the SVG element.
        const properties: {[key: string]: string} = svgObject.properties
        const propertyKeys: string[] = Object.keys(properties);

        // If the SVG element has no properties or children, then it can be ignored.
        if (!propertyKeys.length && !svgObject.children.length) {
            return "";
        }

        let result: string = "";

        // Write opening tag.
        result += "<" + svgObject.tag;

        // Write properties, if any.
        for (const key of propertyKeys) {
            result += " " + key + "=\"" + properties[key] + "\"";
        }

        // Write children, if any.
        const children: SvgObject[] = svgObject.children;
        let childrenResult: string = "";
        for (const child of children) {
            childrenResult += this.writeAsString(child);
        }

        // Write closing tag. We check using the string generated from the children
        // just in case the children had all empty tags, and thus an empty string.
        if (childrenResult.length) {
            result += ">" + childrenResult + "</" + svgObject.tag + ">";
        }
        else {
            result += "/>";
        }

        return result;

    }

}