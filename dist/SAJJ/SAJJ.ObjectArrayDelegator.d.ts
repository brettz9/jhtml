export default ObjectArrayDelegator;
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
    currentKey: string | number | undefined;
    currentObject: any;
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
import SAJJ from './SAJJ.js';
//# sourceMappingURL=SAJJ.ObjectArrayDelegator.d.ts.map