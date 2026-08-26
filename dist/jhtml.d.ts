/**
 * JHTML is a format which can represent arbitrary JSON structures in a
 *  faithful, human-readable, and portable manner.
 * It is also round-trippable except in the case when converting *from*
 *   object-containing JSON to JHTML when the
 * ECMAScript/JSON interpreter does not iterate the properties in
 *   definition order (as it is not required to do).
 * @namespace Contains methods for conversions between JSON and
 *   JHTML (as strings or objects)
 * @todo Add polyfills, e.g., https://github.com/termi/Microdata-JS/
 * @todo Add option for stringification (JSON or JHTML) to provide
 *   indentation, etc.
 * @todo Make SAJJ as separate repo and require
 */
import Stringifier from './SAJJ/SAJJ.Stringifier.js';
export type GenericFunction = Function;
export type NonObject = undefined | null | boolean | number | bigint | symbol | string | GenericFunction | Date | RegExp;
export type JSONObjectPlain = {
    [key: string]: NonObject | JSONObject | JSONObject[];
};
export type JSONObjectArray = (NonObject | JSONObject)[];
export type JSONObject = NonObject | JSONObjectPlain | JSONObjectArray;
/**
 * Set the window object for DOM operations.
 * @param {import('jsdom').DOMWindow |
 *   Window & typeof globalThis} win - The window object.
 * @returns {void}
 */
export declare const setWindow: (win: import('jsdom').DOMWindow | (Window & typeof globalThis)) => void;
/**
 * @param {Element|Element[]} [items]
 * @param {{
 *   mode?: "JSON"|"JavaScript"
 * }} [options]
 * @returns {JSONObject}
 */
export declare const toJSONObject: (items?: Element | Element[], options?: {
    mode?: "JSON" | "JavaScript";
}) => JSONObject;
/**
 * We don't validate that other attributes are not present, but they
 *   should not be.
 * @todo Could make more efficient option
 * @param {Element|Element[]} [items]
 * @param {{
 *   mode?: "JSON"|"JavaScript"
 * }} [options]
 * @returns {string|string[]}
 */
export declare const toJSONString: (items?: Element | Element[], options?: {
    mode?: "JSON" | "JavaScript";
}) => string | string[];
/**
 * @param {JSONObject} jsonObj
 * @param {import('./SAJJ/SAJJ.js').SAJJOptions} [options]
 * @returns {string}
 */
export declare const toJHTMLString: (jsonObj: JSONObject, options?: import('./SAJJ/SAJJ.js').SAJJOptions) => string;
/**
 * @param {JSONObject} jsonObj
 * @param {import('./SAJJ/SAJJ.js').SAJJOptions} [options]
 * @returns {Element}
 */
export declare const toJHTMLDOM: (jsonObj: JSONObject, options?: import('./SAJJ/SAJJ.js').SAJJOptions) => Element;
export { Stringifier };
//# sourceMappingURL=jhtml.d.ts.map