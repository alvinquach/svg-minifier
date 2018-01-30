export class StyleUtils {

    parseStyle(style: string): {[key: string]: string} {
        let result: {[key: string]: string} = {};
        let styles: string[] = style.split(";");
        for (let i = 0; i < styles.length; i++) {
            let _style: string = styles[i].trim();
            if (!_style) {
                continue;
            }
            let keyValue: string[] = _style.split(":");
            if (keyValue.length != 2) {
                continue;
            }
            result[keyValue[0].trim()] = keyValue[1].trim();
        }
        return result;
    }

}