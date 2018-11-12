import { SvgObject } from "../classes/svg/object/svg-object.class";
import { SvgMinifyOptions } from "../classes/svg/options/svg-minify-options.class";
import { SvgObjectType } from "../classes/svg/object/svg-object-type.class";
import { SvgObjectProperties } from "../classes/svg/object/property/svg-object-properties.class";

export class MinifierUtils {

    /** Ungroups the groups that have no special properties. */
    static explodeGroups(svgObject: SvgObject, options: SvgMinifyOptions, idCountsAsProperty = false): void {
        const children: SvgObject[] = svgObject.children;
        const newChildren: SvgObject[] = [];
        let changed: boolean = false;
        children.forEach(child => {
            this.explodeGroups(child, options);
            if (child.type === SvgObjectType.Group && 
                (!child.properties.hasProperties() ||
                !options.minifyElementIds && !idCountsAsProperty && this._groupOnlyHasId(child))) {

                newChildren.push(...child.children);
                changed = true;
            }
            else {
                newChildren.push(child);
            }
        });
        if (changed) {
            children.splice(0, children.length);
            children.push(...newChildren);
            children.forEach(c => c.parent = svgObject);
        }
    }

    /** 
     * Helper method for _explodeGroups that determines whether 
     * the only property that the element has is "id". 
     */
    private static _groupOnlyHasId(svgObject: SvgObject): boolean {
        const properties: SvgObjectProperties = svgObject.properties;
        if (!properties.hasProperties()) {
            return false;
        }
        const propertyKeys: string[] = Object.keys(properties.propertyMap);
        if (propertyKeys.length > 1) {
            return false;
        }
        return propertyKeys.indexOf('id') == 0;
    }

}