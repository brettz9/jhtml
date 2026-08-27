/**
 * SAJJ Simple API for JSON/JavaScript objects
 * This is not intended as a streaming string parser, though `walkJSONString()`
 * is provided for whole strings;
 *  Clarinet (https://github.com/dscape/clarinet ) is more likely the better choice for such cases.
 *  SAJJ, as with SAX, could be adapted to allow DOM TreeWalker-style parsing
 *   (pull or automatic cycling: todo) along with
 *  XSL-style iteration (though optional whether to ultimately replace original
 *   content), e.g., for use with Jamilih or JsonML style (see JTLT project)
 *   templates (or enhanced via full JS with event handlers).
 * SampleUseCases
 * 1) Converting JavaScript structures to JSON
 * 2) Implementing a SAX-like parser over XML-as-JSON solutions like Jamilih
 *     or JsonML
 * 3) XSL-like transformations of JSON (or XML-as-JSON), e.g., to JHTML
 * SampleImplementations
 * 1. Conversion of JSON to JHTML
 * 2. JSON.stringify() (Todo: support replacer and space arguments)
 * DesignGoals
 * 1. Accurate, easy to use, small, fast, memory-efficient, universal in
 *     coverage, clean code
 * 2. Convenient (e.g., with overridable methods) but not auto-creating
 *    likely useful polyfills like Object.keys(), Object.getOwnPropertyNames(),
 *    JSON, etc. Might reconsider
 *   optionally auto-exporting them, or adding as handler arguments, in the
 *    future, but not planning for now.
 * 3. Context-aware (handlers to include parent objects as well as values
 *     or JSONPaths)
 * 4. Customizable: Ability to override/customize any functionality and allow
 *     custom types but without need for reimplementing iteration routines
 * 5. Offer optional support of regular JavaScript objects (including those
 *     potentially representing XML/HTML with events)
 * 6. Allow pull or auto-push reporting
 * 7. Configuration vis-a-vis Clarinet/sax-js options:
 *   a) Decided for now against trim/normalize options as in Clarinet as
 *     seemed not very useful, though could be allowed easily in stringHandler
 *   b) lowercase and xmlns seem too XML-specific
 *   c) position has analogue in JSONPath goal
 * 8. Decided against causing conversion to string and feeding into Clarinet
 *    (or `JSON.parse(obj, reviver);`) as use cases of beginning with JSON
 *    rather than merely converting to it were too great (toward JS as main
 *    environment or even content-type).
 * 9. Decided against Clarinet handler names as considered ugly relative to
 *     CamelCase (despite JS-event-style-familiarity) though
 * I may provide adapters later (todo)
 * 10. Decided against passing Object.keys (or other exports of Object
 *    properties like getOwnPropertyNames) to
 *    beginObjectHandler/beginArrayHandler (and corresponding end methods) as
 *    auto-iteration of keys/values ought to address most use cases for
 *    obtaining all keys and user can do it themselves if needed. We did pass
 *    length of array to begin and endArrayHandler, however.
 * 11. Have module support standard export formats
 * 12. Demonstrate functionality by implementing JSON.stringify though provide
 *      empty version
 *
 * PossibleFutureTodos
 * 1. Add references to jml() in docs along with JsonML references
 * 2. Integrate with allowing stream input as in Clarinet?
 * 3. TreeWalker/NodeIterator equivalents?
 * 4. Add array-extra methods along with functional join?
 *
 * @todo
 *
 * 1. Infinity, NaN, String, Number, Date, etc.
 * 2. Add depth level `@property` (which could be used, e.g., by a
 *     JSON.stringify implementation)
 *   a) Implement JSON.stringify (without calling JSON.stringify!); if
 *      not, fix SampleImplementations above
 *     i) Finish array/object (call delegateHandlersByType inside
 *         keyValueHandler or in object/arrayHandler?; change keyValueHandlers
 *         to return commas, etc.)
 *     ii) avoid functions/undefined/prototype completely, and converting
 *          nonfinite to null
 * 3. Add JSONPaths (or implement JSONPath reporting in SAJJ as in
 *     jsonPath())? XPath to string SAX XML? .getXPath on DOM node prototype?
 */
export type AnyValue = any;
export type GenericFunction = Function;
export type NonObject = undefined | null | boolean | number | string | GenericFunction;
export type NestedObject = {
    [key: string]: NonObject | NestedObject | NestedObject[];
};
export type SAJJType = "undefined" | "null" | "boolean" | "symbol" | "number" | "nonfiniteNumber" | "bigint" | "string" | "function" | "array" | "object" | "ignore";
export type DelegateHandlers = (type: `${SAJJType}Handler`, parentObj: object | undefined, parentKey: string | undefined, parentObjectArrayBool?: boolean, obj?: AnyValue) => string;
export type SAJJOptions = {
    mode?: "JSON" | "JavaScript";
    distinguishKeysValues?: boolean;
    iterateArrays?: boolean;
    iterateObjects?: boolean;
    iterateObjectPrototype?: boolean;
    iterateArrayPrototype?: boolean;
    delegateHandlers?: DelegateHandlers;
    parentKey?: string;
    parentObject?: object;
    parentObjectArrayBool?: boolean;
};
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
    mode: "JSON" | "JavaScript" | undefined;
    distinguishKeysValues: boolean | undefined;
    iterateArrays: boolean | undefined;
    iterateObjects: boolean | undefined;
    iterateObjectPrototype: boolean | undefined;
    iterateArrayPrototype: boolean | undefined;
    root: import("../jhtml.js").JSONObject;
    ret: string;
    /** @type {SAJJOptions|undefined} */
    options: SAJJOptions | undefined;
    /**
     * @param {SAJJOptions} [options] See setDefaultOptions() function body for
     *   some possibilities
     */
    constructor(options?: SAJJOptions);
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
    /**
     * @param {SAJJOptions} [options]
     * @returns {void}
     */
    setDefaultOptions(options?: SAJJOptions): void;
    /**
     * Rather than use the strategy design pattern, we'll override our prototype
     *   selectively.
     * @param {SAJJOptions} options
     * @returns {void}
     */
    alterDefaultHandlers(options: SAJJOptions): void;
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
    walkJSONObject(obj: import('../jhtml.js').JSONObject, parentObject?: object | object[], parentKey?: string, parentObjectArrayBool?: boolean): string;
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
    delegateHandlersByType(obj: import('../jhtml.js').JSONObject, parentObject: object | undefined, parentKey: string | undefined, parentObjectArrayBool?: boolean): string;
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
/**
 * @class
 * @param {SAJJOptions} options
 */
declare function SAJJ_JS(options: SAJJOptions): SAJJ;
export { SAJJ_JS };
export default SAJJ;
//# sourceMappingURL=SAJJ.d.ts.map