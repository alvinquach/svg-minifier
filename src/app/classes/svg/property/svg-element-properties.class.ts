import { SvgElementProperty } from "./svg-element-property.class";

export class SvgElementProperties {

    private readonly _properties: {[key: string]: SvgElementProperty} = {};

    /** Contents should be in the format of: property1="value1" property2="value 2" */
    constructor(contents: string) {

        const properties: string[] = contents.split("\" ");

        // Remove end quote from last property.
        const lastProperty: string = properties[properties.length - 1];
        if (lastProperty.lastIndexOf("\"") == lastProperty.length - 1) {
            properties[properties.length - 1] = lastProperty.substr(0, lastProperty.length - 1);
        }

        for (const property of properties) {
            const separatorIndex: number = property.indexOf("=\"");
            if (separatorIndex < 0) {
                continue;
            }
            const key: string = property.substring(0, separatorIndex).trim();
            const value: string = property.substring(separatorIndex + 2);
            this._properties[key] = new SvgElementProperty(value);
        }

    }

    get properties(): {[key: string]: SvgElementProperty} {
        return this._properties;
    }

}

