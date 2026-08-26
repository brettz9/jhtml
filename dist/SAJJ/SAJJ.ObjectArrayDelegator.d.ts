import SAJJ from './SAJJ.js';
export type AnyDelegated = any;
/**
 * @typedef {any} AnyDelegated
 */
/**
 * @abstract
 * @class
 * @todo Might add an add() method which defines how to combine result values
 *  (so as to allow for other means besides string concatenation)
 */
declare class ObjectArrayDelegator extends SAJJ {
    currentKey: string | number | undefined;
    currentObject: any;
    /**
     * @returns {AnyDelegated}
     */
    objectKeyValueJoinerHandler(): AnyDelegated;
    /**
     * @param {object} value
     * @param {object|undefined} parentObject
     * @param {string|undefined} parentKey
     * @param {boolean|undefined} parentObjectArrayBool
     * @returns {AnyDelegated}
     */
    beginObjectHandler(value: object, parentObject: object | undefined, parentKey: string | undefined, parentObjectArrayBool: boolean | undefined): AnyDelegated;
    /**
     * @param {object} value
     * @param {object|undefined} parentObject
     * @param {string|undefined} parentKey
     * @param {boolean|undefined} parentObjectArrayBool
     * @returns {AnyDelegated}
     */
    endObjectHandler(value: object, parentObject: object | undefined, parentKey: string | undefined, parentObjectArrayBool: boolean | undefined): AnyDelegated;
    /**
     * @param {AnyDelegated[]} value
     * @param {object|undefined} parentObject
     * @param {string|undefined} parentKey
     * @param {boolean|undefined} parentObjectArrayBool
     * @param {number} arrLength
     * @returns {AnyDelegated}
     */
    beginArrayHandler(value: AnyDelegated[], parentObject: object | undefined, parentKey: string | undefined, parentObjectArrayBool: boolean | undefined, arrLength: number): AnyDelegated;
    /**
     * @param {AnyDelegated[]} value
     * @param {object|undefined} parentObject
     * @param {string|undefined} parentKey
     * @param {boolean|undefined} parentObjectArrayBool
     * @param {number} arrLength
     * @returns {AnyDelegated}
     */
    endArrayHandler(value: AnyDelegated[], parentObject: object | undefined, parentKey: string | undefined, parentObjectArrayBool: boolean | undefined, arrLength: number): AnyDelegated;
    /**
     * @param {AnyDelegated} value
     * @param {object|undefined} parentObject
     * @param {string|undefined} parentKey
     * @param {boolean|undefined} parentObjectArrayBool
     * @returns {string}
     */
    objectHandler(value: AnyDelegated, parentObject: object | undefined, parentKey: string | undefined, parentObjectArrayBool: boolean | undefined): string;
    /**
     * @param {AnyDelegated[]} value
     * @param {object|undefined} parentObject
     * @param {string|undefined} parentKey
     * @param {boolean|undefined} parentObjectArrayBool
     * @returns {string}
     */
    arrayHandler(value: AnyDelegated[], parentObject: object | undefined, parentKey: string | undefined, parentObjectArrayBool: boolean | undefined): string;
    /**
     * Can override to avoid delegating to separate array/object handlers; see
     *   `isArrayType` notes for a means to treat `objectHandler`/`arrayHandler`
     *   as the same; overridden optionally in constructor by
     *   `keyValueDistinguishedHandler`.
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
     * @param {AnyDelegated} value
     * @param {string|number} key
     * @param {object|undefined} parentObject
     * @param {string|undefined} parentKey
     * @param {boolean|undefined} parentObjectArrayBool
     * @returns {AnyDelegated}
     */
    arrayKeyValueHandler(value: AnyDelegated, key: string | number, parentObject: object | undefined, parentKey: string | undefined, parentObjectArrayBool: boolean | undefined): AnyDelegated;
    /**
     * @param {AnyDelegated} value
     * @param {string|number} key
     * @param {object|undefined} parentObject
     * @param {string|undefined} parentKey
     * @param {boolean|undefined} parentObjectArrayBool
     * @param {number} [iterCt]
     * @returns {AnyDelegated}
     */
    objectKeyValueHandler(value: AnyDelegated, key: string | number, parentObject: object | undefined, parentKey: string | undefined, parentObjectArrayBool: boolean | undefined, iterCt?: number): AnyDelegated;
    /**
     * Constructor may use this to override `keyValueHandler`.
     * @param {AnyDelegated} value
     * @param {string} key
     * @param {object|undefined} parentObject
     * @param {string|undefined} parentKey
     * @param {boolean|undefined} parentObjectArrayBool
     * @param {boolean} arrayBool
     * @param {number} iterCt
     * @returns {string}
     */
    keyValueDistinguishedHandler(value: AnyDelegated, key: string, parentObject: object | undefined, parentKey: string | undefined, parentObjectArrayBool: boolean | undefined, arrayBool: boolean, iterCt: number): string;
    /**
     * @param {string|number} key
     * @param {object|undefined} parentObject
     * @param {string|undefined} parentKey
     * @param {boolean|undefined} parentObjectArrayBool
     * @param {boolean} arrayBool
     * @param {number} [iterCt]
     * @returns {AnyDelegated}
     */
    keyHandler(key: string | number, parentObject: object | undefined, parentKey: string | undefined, parentObjectArrayBool: boolean | undefined, arrayBool: boolean, iterCt?: number): AnyDelegated;
    /**
     * @param {AnyDelegated} value
     * @param {string} key
     * @param {object|undefined} parentObject
     * @param {string|undefined} parentKey
     * @param {boolean|undefined} parentObjectArrayBool
     * @param {boolean} arrayBool
     * @param {number} iterCt
     * @returns {AnyDelegated}
     */
    valueHandler(value: AnyDelegated, key: string, parentObject: object | undefined, parentKey: string | undefined, parentObjectArrayBool: boolean | undefined, arrayBool: boolean, iterCt: number): AnyDelegated;
    /**
     * @param {AnyDelegated} value
     * @param {string} key
     * @param {object|undefined} parentObject
     * @param {string|undefined} parentKey
     * @param {boolean|undefined} parentObjectArrayBool
     * @param {number} [iterCt]
     * @returns {AnyDelegated}
     */
    objectValueHandler(value: AnyDelegated, key: string, parentObject: object | undefined, parentKey: string | undefined, parentObjectArrayBool: boolean | undefined, iterCt?: number): AnyDelegated;
    /**
     * @param {AnyDelegated[]} value
     * @param {string} key
     * @param {object|undefined} parentObject
     * @param {string|undefined} parentKey
     * @param {boolean|undefined} parentObjectArrayBool
     * @returns {AnyDelegated}
     */
    arrayValueHandler(value: AnyDelegated[], key: string, parentObject: object | undefined, parentKey: string | undefined, parentObjectArrayBool: boolean | undefined): AnyDelegated;
}
export default ObjectArrayDelegator;
//# sourceMappingURL=SAJJ.ObjectArrayDelegator.d.ts.map