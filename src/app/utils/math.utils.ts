export class MathUtils {

    static transformPoint(x: number, y: number, transformMatrix: number[][]): number[] {
        return this.transform([x, y, 1], transformMatrix);
    }

    static transformVector(x: number, y: number, transformMatrix: number[][]): number[] {
        return this.transform([x, y, 0], transformMatrix);
    }

    static transform(homoCoordinates: number[], transformMatrix: number[][]): number[] {
        const result: number[] = [];
        for (let i = 0; i < 3; i++) {
            let product: number = 0;
            for (let j = 0; j < 3; j++) {
                product += (transformMatrix[i][j] || (i == j ? 1 : 0)) * (homoCoordinates[j] || 0);  
            }
            result[i] = product;
        }
        return result;
    }

}