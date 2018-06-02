export class StyleUtils {

    static parseStyle(style: string): {[key: string]: string} {
        const result: {[key: string]: string} = {};
        const styles: string[] = style.split(";");
        for (let i = 0; i < styles.length; i++) {
            const _style: string = styles[i].trim();
            if (!_style) {
                continue;
            }
            const keyValue: string[] = _style.split(":");
            if (keyValue.length != 2) {
                continue;
            }
            result[keyValue[0].trim()] = keyValue[1].trim();
        }
        return result;
    }

    static writeStyleAsString(styleMap: {[key: string]: string}): string {
        let result: string = "";
        for (const key of Object.keys(styleMap)) {
            result += `${key}:${styleMap[key]};`
        }
        return result;
    }

}