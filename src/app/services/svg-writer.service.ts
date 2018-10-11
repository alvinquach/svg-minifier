import { Injectable } from "@angular/core";
import { SvgObjectProperties } from "../classes/svg/object/property/svg-object-properties.class";
import { SvgObjectProperty } from "../classes/svg/object/property/svg-object-property.class";
import { SvgObject } from "../classes/svg/object/svg-object.class";

@Injectable()
export class SvgWriterService {

    /**
     * Converts the SvgObject into an SVG markup string.
     * @param svgObject The object containing the SVG data.
     * @param indent (optional) A string used for indentation. If this is not provided,
     *               then the output will also be on a single line (no line breaks).
     * @param level For internal use only. Leave this empty when calling the function externally.
     * @returns A string containing the SVG markup generated from the SvgObject.
     */
    writeAsString(svgObject: SvgObject, indent?: string, level: number = 0): string {

        // Get the properties and its keys from the SVG element.
        const properties: SvgObjectProperties = svgObject.properties;

        // If the SVG element has no properties or children, then it can be ignored.
        if (!properties.hasProperties() && !svgObject.children.length) {
            return "";
        }

        let result: string = "";

        // Write opening tag.
        result += this.generateIndent(level, indent) + "<" + svgObject.tag;

        // Write properties, if any.
        result += ` ${properties.toString()}`

        // Write children, if any.
        const children: SvgObject[] = svgObject.children;
        let childrenResult: string[] = [];
        for (const child of children) {
            childrenResult.push(this.writeAsString(child, indent, level + 1));
        }

        // Write closing tag. We check using the string generated from the children
        // just in case the children had all empty tags, and thus an empty string.
        if (childrenResult.length) {
            if (indent === undefined) {
                result += ">" + childrenResult.join("") + "</" + svgObject.tag + ">";
            }
            else {
                result += ">\n" + childrenResult.join("\n") + "\n" + this.generateIndent(level, indent) + "</" + svgObject.tag + ">"
            }
        }
        else {
            result += "/>";
        }

        return result;

    }

    private generateIndent(level: number, indent?: string): string {
        let result: string = "";
        if (indent !== undefined) {
            for (let i = 0; i < level; i++) {
                result += indent;
            }
        }
        return result;
    }

}