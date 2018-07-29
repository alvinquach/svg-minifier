export class SvgOutputOptions {

    // TODO Let user specify the indentation type.
    /** Whether to output the entire markup on a single line. */
    outputSingleLine: boolean = false;

    /** Attempt to fix GT Sport's radial gradient radius issue when viewport is portrait aspect ratio. */
    gtSportRadialGradientFix: boolean = false;

    /** GT Sport ignores the stroke-miterlimit property (always uses 4), so it can be removed for optimization. */
    gtSportRemoveMiterLimits: boolean = false;

}