import { Injectable } from "@angular/core";
import { SvgObject } from "../classes/svg/svg-object.class";

@Injectable()
export class SvgParserService {

    constructor() {

    }

    parse(svg: string): SvgObject {

        const svgElements: string[] = svg.split("><");

        if (!svgElements.length) {
            return;
        }

        // Remove the opening and closing brackets from the first and last elements, respectively.
        const firstElement: string = svgElements[0];
        if (firstElement.indexOf("<") == 0) {
            svgElements[0] = firstElement.substring(1);
        }
        const lastElement: string = svgElements[svgElements.length - 1];
        if (lastElement.indexOf(">") == lastElement.length - 1) {
            svgElements[svgElements.length - 1] = lastElement.substr(0, lastElement.length - 1);
        }

        // Parse and store the SVG data in the temporary "root" element.
        const root: SvgObject = new SvgObject("root", svgElements);

        // If parsed correctly, the "root" element should only contain one child, which is the "svg" element.
        // Use the "svg" element as the root element instead.
        if (!root.children.length) {
            console.error("SVG parse failed (no elements found).");
            return;
        }
        if (root.children.length > 1) {
            console.warn("SVG contains more than one root element. Using first element as root.");
        }

        return root.children[0];

    }

    


}