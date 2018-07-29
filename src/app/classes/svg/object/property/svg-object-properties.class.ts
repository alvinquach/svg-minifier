import { SvgObjectProperty } from "./svg-object-property.class";

export class SvgObjectProperties {

    private readonly _propertyMap: {[key: string]: SvgObjectProperty} = {};

    /** Contents should be in the format of: property1="value1" property2="value 2" */
    constructor(contents?: string) {

        this.parse(contents);

    }

    parse(contents: string): void {

        if (!contents) {
            return;
        }

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
            this._propertyMap[key] = new SvgObjectProperty(value);
        }

    }

    get propertyMap(): {[key: string]: SvgObjectProperty} {
        return this._propertyMap;
    }

    get hasProperties(): boolean {
        return !!Object.keys(this._propertyMap).length;
    }

}

