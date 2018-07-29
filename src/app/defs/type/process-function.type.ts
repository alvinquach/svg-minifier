import { SvgObject } from "../../classes/svg/object/svg-object.class";
import { SvgOutputOptions } from "../../classes/svg/options/svg-output-options.class";

export type ProcessFunctions = ReadonlyArray<ProcessFunction>;

export type ProcessFunction = (object: SvgObject, options: SvgOutputOptions, extras: any) => void;