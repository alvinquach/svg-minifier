import { Injectable } from "@angular/core";
import { SvgObject } from "../classes/svg/object/svg-object.class";
import { SpecialItemNames } from "../defs/special-item-names";
import { SvgObjectProperties } from "../classes/svg/object/property/svg-object-properties.class";
import { SvgObjectProperty } from "../classes/svg/object/property/svg-object-property.class";
import { SvgObjectType } from "../classes/svg/object/svg-object-type.class";

/** 
 * Service that contains operations that are experimental, under development, and/or 
 * not intended to be used by the general public. Such operations may be poorly
 * documented and may required specific conditions to be met in order to run.
 */
@Injectable()
export class DevFeatureService {

    /**
     * Searches for path items named "_GRAD_MASTER". If such an item exists, then its fill
     * property will be applied to the stroke and/or fill of every adjacent sibling path items,
     * except when the adjacnet item does not have a stroke and/or fill, in which case the
     * stroke and/or fill is unaffected. If the gradient master item does not have a fill,
     * then the adjacent items are unaffected.
     */
    groupGradients(svgObject: SvgObject): SvgObject {
        const children: SvgObject[] = svgObject.children;
        let found;
        children.forEach(child => {

            if (child.children.length) {
                this.groupGradients(child); // Call recursively.
            }

            if (!child.type.isPathItem || found) {
                return;
            }

            const properties = child.properties.propertyMap;
            if (properties['id'] && properties['id'].value.indexOf(SpecialItemNames.GradientGroupMaster) === 0) {
                found = child;
                const fill = properties['fill'] && properties['fill'].value;
                if (!fill || fill === 'none') {
                    return;
                }
                children
                    .filter(s => s.type.isPathItem && s != child)
                    .forEach(s => {
                        this._groupGradientsHelper('stroke', fill, s.properties);
                        this._groupGradientsHelper('fill', fill, s.properties);
                    });
            }
        });

        if (found) {
            
            // Remove the gradient master item from the group.
            children.splice(children.indexOf(found), 1);

            // Rearrange items such that gradients are at top of group.
            children.sort((a, b) => {
                if (b.type == SvgObjectType.LinearGradient || b.type == SvgObjectType.RadialGradient) {
                    return 1;
                }
                return -1;
            });
        }

        return svgObject;
    }

    private _groupGradientsHelper(property: 'stroke' | 'fill', value: string, properties: SvgObjectProperties): void {
        const map = properties.propertyMap;
        const p = map[property];
        if (p && p.value !== 'none') {
            p.value = value;
        }
    }

}
