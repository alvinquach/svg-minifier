import { Injectable } from "@angular/core";
import { SvgObject } from "../classes/svg/object/svg-object.class";

@Injectable()
export class SvgParserService {

    constructor() {

    }

    parse(svg: string): SvgObject {

        const svgSegments: string[] = svg.split(/(?=>|<)/).filter(e => !!e);

        if (!svgSegments.length) {
            return;
        }

        // Parse and store the SVG data in the temporary "root" element.
        const root: SvgObject = new SvgObject("root", svgSegments);

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