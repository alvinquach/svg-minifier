import { SvgObject } from "../../classes/svg/object/svg-object.class";
import { SvgMinifyOptions } from "../../classes/svg/options/svg-minify-options.class";

export type ProcessFunctions = ReadonlyArray<ProcessFunction>;

export type ProcessFunction = (object: SvgObject, options: SvgMinifyOptions, extras: any) => void;