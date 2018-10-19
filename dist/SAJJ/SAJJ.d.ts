export default SAJJ;
export type AnyValue = any;
export type GenericFunction = Function;
export type NonObject = undefined | null | boolean | number | string | GenericFunction;
export type NestedObject = {
    [key: string]: NonObject | NestedObject | NestedObject[];
};
export type SAJJType = "undefined" | "null" | "boolean" | "symbol" | "number" | "nonfiniteNumber" | "bigint" | "string" | "function" | "array" | "object" | "ignore";
export type SAJJOptions = {
    mode?: "JSON" | "JavaScript";
    distinguishKeysValues?: boolean;
    iterateArrays?: boolean;
    iterateObjects?: boolean;
    iterateObjectPrototype?: boolean;
    iterateArrayPrototype?: boolean;
    delegateHandlers?: (type: `${SAJJType}Handler`, parentObj: object | undefined, parentKey: string | undefined, parentObjectArrayBool?: boolean | undefined, obj?: AnyValue) => string;
    parentKey?: string;
    parentObject?: object;
    parentObjectArrayBool?: boolean;
};
/**
 * @class
 * @param {SAJJOptions} options
 */
export function SAJJ_JS(options: SAJJOptions): SAJJ;
export class SAJJ_JS {
    /**
     * @class
     * @param {SAJJOptions} options
     */
    constructor(options: SAJJOptions);
}
/**
 * @typedef {{
 *   mode?: "JSON"|"JavaScript",
 *   distinguishKeysValues?: boolean,
 *   iterateArrays?: boolean,
 *   iterateObjects?: boolean,
 *   iterateObjectPrototype?: boolean,
 *   iterateArrayPrototype?: boolean,
 *   delegateHandlers?: DelegateHandlers
 *   parentKey?: string,
 *   parentObject?: object,
 *   parentObjectArrayBool?: boolean,
 * }} SAJJOptions
 */
/**
 * @todo Support object + JSONPath as first argument for iteration within
 *   a larger tree
 */
declare class SAJJ {
    /**
     * @param {SAJJOptions} options See setDefaultOptions() function body for
     *   some possibilities
     */
    constructor(options: SAJJOptions);
    ret: string;
    /**
     * Could override for logging; meant for allowing dropping of
     *   properties/methods, e.g., undefined/functions, as done, for
     *   example, by `JSON.stringify`.
     * @param {AnyValue} obj
     * @param {object|undefined} parentObj
     * @param {string|undefined} parentKey
     * @param {boolean|undefined} parentObjectArrayBool
     * @returns {string}
     */
    ignoreHandler(obj: AnyValue, parentObj: object | undefined, parentKey: string | undefined, parentObjectArrayBool: boolean | undefined): string;
    /**
     * @param {string} value
     * @param {object|undefined} parentObject
     * @param {string|undefined} parentKey
     * @param {boolean|undefined} parentObjectArrayBool
     * @returns {string}
     */
    stringHandler(value: string, parentObject: object | undefined, parentKey: string | undefined, parentObjectArrayBool: boolean | undefined): string;
    /**
     * @param {number} value
     * @param {object|undefined} parentObject
     * @param {string|undefined} parentKey
     * @param {boolean|undefined} parentObjectArrayBool
     * @returns {string}
     */
    numberHandler(value: number, parentObject: object | undefined, parentKey: string | undefined, parentObjectArrayBool: boolean | undefined): string;
    /**
     * @param {bigint} value
     * @param {object|undefined} parentObject
     * @param {string|undefined} parentKey
     * @param {boolean|undefined} parentObjectArrayBool
     * @returns {string}
     */
    bigintHandler(value: bigint, parentObject: object | undefined, parentKey: string | undefined, parentObjectArrayBool: boolean | undefined): string;
    /**
     * @param {boolean} value
     * @param {object|undefined} parentObject
     * @param {string|undefined} parentKey
     * @param {boolean|undefined} parentObjectArrayBool
     * @returns {string}
     */
    booleanHandler(value: boolean, parentObject: object | undefined, parentKey: string | undefined, parentObjectArrayBool: boolean | undefined): string;
    /**
     * @param {symbol} value
     * @param {object|undefined} parentObject
     * @param {string|undefined} parentKey
     * @param {boolean|undefined} parentObjectArrayBool
     * @returns {string}
     */
    symbolHandler(value: symbol, parentObject: object | undefined, parentKey: string | undefined, parentObjectArrayBool: boolean | undefined): string;
    /**
     * @param {undefined} value
     * @param {object|undefined} parentObject
     * @param {string|undefined} parentKey
     * @param {boolean|undefined} parentObjectArrayBool
     * @returns {string}
     */
    undefinedHandler(value: undefined, parentObject: object | undefined, parentKey: string | undefined, parentObjectArrayBool: boolean | undefined): string;
    /**
     * @param {AnyValue} value
     * @param {object|undefined} parentObject
     * @param {string|undefined} parentKey
     * @param {boolean|undefined} parentObjectArrayBool
     * @returns {string}
     */
    objectHandler(value: AnyValue, parentObject: object | undefined, parentKey: string | undefined, parentObjectArrayBool: boolean | undefined): string;
    /**
     * @param {null} obj
     * @param {object|undefined} parentObject
     * @param {string|undefined} parentKey
     * @param {boolean|undefined} parentObjectArrayBool
     * @returns {string}
     */
    nullHandler(obj: null, parentObject: object | undefined, parentKey: string | undefined, parentObjectArrayBool: boolean | undefined): string;
    /**
     * @param {number} value
     * @param {object|undefined} parentObject
     * @param {string|undefined} parentKey
     * @param {boolean|undefined} parentObjectArrayBool
     * @returns {string}
     */
    nonfiniteNumberHandler(value: number, parentObject: object | undefined, parentKey: string | undefined, parentObjectArrayBool: boolean | undefined): string;
    /**
     * @param {AnyValue[]} value
     * @param {object|undefined} parentObject
     * @param {string|undefined} parentKey
     * @param {boolean|undefined} parentObjectArrayBool
     * @returns {string}
     */
    arrayHandler(value: AnyValue[], parentObject: object | undefined, parentKey: string | undefined, parentObjectArrayBool: boolean | undefined): string;
    /**
     * @param {GenericFunction} value
     * @param {object|undefined} parentObject
     * @param {string|undefined} parentKey
     * @param {boolean|undefined} parentObjectArrayBool
     * @returns {string}
     */
    functionHandler(value: GenericFunction, parentObject: object | undefined, parentKey: string | undefined, parentObjectArrayBool: boolean | undefined): string;
    /**
     * Constructor may use this to override `keyValueHandler`.
     * @param {AnyValue} value
     * @param {string} key
     * @param {object|undefined} parentObject
     * @param {string|undefined} parentKey
     * @param {boolean|undefined} parentObjectArrayBool
     * @param {boolean} arrayBool
     * @param {number} iterCt
     * @returns {string}
     */
    keyValueDistinguishedHandler(value: AnyValue, key: string, parentObject: object | undefined, parentKey: string | undefined, parentObjectArrayBool: boolean | undefined, arrayBool: boolean, iterCt: number): string;
    /**
     * @returns {string}
     */
    arrayKeyValueJoinerHandler(): string;
    /**
     * @param {object} value
     * @param {string|number} key
     * @param {object|undefined} parentObject
     * @param {string|undefined} parentKey
     * @param {boolean|undefined} parentObjectArrayBool
     * @param {boolean} arrayBool
     * @param {number} [iterCt]
     * @returns {string}
     */
    keyValueHandler(value: object, key: string | number, parentObject: object | undefined, parentKey: string | undefined, parentObjectArrayBool: boolean | undefined, arrayBool: boolean, iterCt?: number): string;
    /**
     * @param {string|number} key
     * @param {object|undefined} parentObject
     * @param {string|undefined} parentKey
     * @param {boolean|undefined} parentObjectArrayBool
     * @returns {AnyValue}
     */
    arrayKeyHandler(key: string | number, parentObject: object | undefined, parentKey: string | undefined, parentObjectArrayBool: boolean | undefined): AnyValue;
    /**
     * @param {string|number} key
     * @param {object|undefined} parentObject
     * @param {string|undefined} parentKey
     * @param {boolean|undefined} parentObjectArrayBool
     * @param {number} [iterCt]
     * @returns {AnyValue}
     */
    objectKeyHandler(key: string | number, parentObject: object | undefined, parentKey: string | undefined, parentObjectArrayBool: boolean | undefined, iterCt?: number): AnyValue;
    /** @type {SAJJOptions} */
    options: SAJJOptions;
    /**
     * @param {SAJJOptions} [options]
     * @returns {void}
     */
    setDefaultOptions(options?: SAJJOptions): void;
    mode: "JSON" | "JavaScript" | undefined;
    distinguishKeysValues: boolean | undefined;
    iterateArrays: boolean | undefined;
    iterateObjects: boolean | undefined;
    iterateObjectPrototype: boolean | undefined;
    iterateArrayPrototype: boolean | undefined;
    /**
    * Rather than use the strategy design pattern, we'll override our prototype
    *   selectively.
    * @param {SAJJOptions} options
    * @returns {void}
    */
    alterDefaultHandlers(options: SAJJOptions): void;
    delegateHandlers(type: `${SAJJType}Handler`, parentObj: object | undefined, parentKey: string | undefined, parentObjectArrayBool?: boolean | undefined, obj?: AnyValue): string;
    /**
    * For strings, one may wish to use Clarinet (<https://github.com/dscape/clarinet>) to
    *   avoid extra overhead or parsing twice.
    * @param {string} str The JSON string to be walked (after complete conversion
    *   to an object)
    * @param {object|object[]} [parentObject] The parent object or array
    *   containing the string
    * @param {string} [parentKey] The parent object or array's key
    * @param {boolean} [parentObjectArrayBool] Whether the parent object is an
    *   array (not another object)
    * @returns {AnyValue}
    */
    walkJSONString(str: string, parentObject?: object | object[], parentKey?: string, parentObjectArrayBool?: boolean): AnyValue;
    /**
    *
    * @param {import('../jhtml.js').JSONObject} obj The JSON object to walk
    * @param {object|object[]} [parentObject] The parent object or array
    *   containing the string
    * @param {string} [parentKey] The parent object or array's key
    * @param {boolean} [parentObjectArrayBool] Whether the parent object is an
    *   array (not another object)
    * @property {string|AnyValue} ret The intermediate return value (if any) from
    *   beginHandler and delegateHandlersByType delegation
    * @returns {string} The final return value including beginHandler and
    *   delegateHandlersByType delegation plus any endHandler additions;
    *   one may build one's own intermediate values, but "ret" should be
    *   set to return the value
    */
    walkJSONObject(obj: import("../jhtml.js").JSONObject, parentObject?: object | object[], parentKey?: string, parentObjectArrayBool?: boolean): string;
    root: import("../jhtml.js").JSONObject;
    /**
     * @param {AnyValue} value
     * @param {object|undefined} parentObject
     * @param {string|undefined} parentKey
     * @param {boolean} [parentObjectArrayBool]
     * @returns {string}
     */
    beginHandler(value: AnyValue, parentObject: object | undefined, parentKey: string | undefined, parentObjectArrayBool?: boolean): string;
    /**
     * We just make available the passed in arguments.
     * @param {AnyValue} obj
     * @param {AnyValue} parObj
     * @param {string|undefined} parKey
     * @param {boolean} [parObjArrBool]
     * @returns {string}
     */
    endHandler(obj: AnyValue, parObj: AnyValue, parKey: string | undefined, parObjArrBool?: boolean): string;
    /**
     * @param {import('../jhtml.js').JSONObject} obj
     * @param {object|undefined} parentObject
     * @param {string|undefined} parentKey
     * @param {boolean} [parentObjectArrayBool]
     * @returns {string}
     */
    delegateHandlersByType(obj: import("../jhtml.js").JSONObject, parentObject: object | undefined, parentKey: string | undefined, parentObjectArrayBool?: boolean): string;
    /**
     * @param {AnyValue} obj
     * @param {object|undefined} parentObject
     * @param {string|undefined} parentKey
     * @param {boolean} [parentObjectArrayBool]
     * @returns {SAJJType}
     */
    detectBasicType(obj: AnyValue, parentObject: object | undefined, parentKey: string | undefined, parentObjectArrayBool?: boolean): SAJJType;
    /**
    * Could override to always return false if one wished to merge
    *   arrayHandler/objectHandler or, if in JSMode, to merge detectObjectType
    *   and this isArrayType method. To merge arrayKeyValueHandler and
    *   objectKeyValueHandler, see keyValueHandler.
    * @param {AnyValue} obj
    * @returns {boolean}
    */
    isArrayType(obj: AnyValue): boolean;
    /**
    * Allow overriding to detect `Date`, `RegExp`, or other types (which will in
    *   turn route to corresponding names).
    * @param {AnyValue} obj
    * @returns {"object"}
    */
    detectObjectType(obj: AnyValue): "object";
    /**
     * May throw or return type string (can be custom type if handler present).
     * @param {SAJJType} type
     * @param {AnyValue} obj
     * @param {object|undefined} parentObject
     * @param {string|undefined} parentKey
     * @param {boolean} [parentObjectArrayBool]
     * @returns {"null"}
     */
    typeErrorHandler(type: SAJJType, obj: AnyValue, parentObject: object | undefined, parentKey: string | undefined, parentObjectArrayBool?: boolean): "null";
}
//# sourceMappingURL=SAJJ.d.ts.map