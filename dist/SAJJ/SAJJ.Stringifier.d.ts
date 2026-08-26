/**
 * Provides JSON.stringifier()-like functionality (no replacer or space
 * arguments currently, however).
 * This class uses the abstract `ObjectArrayDelegator` for
 *   object/array delegating so the stringification can occur solely on
 *   the terminal methods here.
 * @todo Could implement our own stringifier for strings rather than using
 *   `JSON.stringify`
 */
import ObjectArrayDelegator from './SAJJ.ObjectArrayDelegator.js';
export type GenericFunction = Function;
/**
 *
 */
export default class Stringifier extends ObjectArrayDelegator {
    /**
     * @returns {string}
     */
    beginObjectHandler(): string;
    /**
     * @returns {string}
     */
    endObjectHandler(): string;
    /**
     * @returns {string}
     */
    beginArrayHandler(): string;
    /**
     * @returns {string}
     */
    endArrayHandler(): string;
    /**
     * @param {string} key
     * @returns {string}
     */
    objectKeyHandler(key: string): string;
    /**
     * @returns {string}
     */
    arrayKeyHandler(): string;
    /**
     * @returns {string}
     */
    objectKeyValueJoinerHandler(): string;
    /**
     * @returns {string}
     */
    arrayKeyValueJoinerHandler(): string;
    /**
     * @returns {string}
     */
    nullHandler(): string;
    /**
     * @param {boolean} value
     * @returns {string}
     */
    booleanHandler(value: boolean): string;
    /**
     * @param {number} value
     * @returns {string}
     */
    numberHandler(value: number): string;
    /**
     * @param {string} value
     * @returns {string}
     */
    stringHandler(value: string): string;
    /**
     * @typedef {Function} GenericFunction
     */
    /**
     * @param {GenericFunction} value
     * @returns {string}
     */
    functionHandler(value: GenericFunction): string;
    /**
     * @returns {string}
     */
    undefinedHandler(): string;
    /**
     * @param {bigint} value
     * @returns {string}
     */
    bigintHandler(value: bigint): string;
    /**
     * @param {symbol} value
     * @returns {string}
     */
    symbolHandler(value: symbol): string;
    /**
     * @param {number} value
     * @returns {string}
     */
    nonfiniteNumberHandler(value: number): string;
}
//# sourceMappingURL=SAJJ.Stringifier.d.ts.map