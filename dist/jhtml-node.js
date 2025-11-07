'use strict';

var jsdom = require('jsdom');

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


// GENERIC JSON/JS CONSTRUCTOR

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
class SAJJ {
  ret = '';

  /* eslint-disable jsdoc/require-returns-check -- Abstract */
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
  ignoreHandler(
  // eslint-disable-next-line no-unused-vars -- Signature
  obj, parentObj, parentKey, parentObjectArrayBool) {
    throw new Error('Abstract');
  }

  /**
   * @param {string} value
   * @param {object|undefined} parentObject
   * @param {string|undefined} parentKey
   * @param {boolean|undefined} parentObjectArrayBool
   * @returns {string}
   */
  stringHandler(
  // eslint-disable-next-line no-unused-vars -- Signature
  value, parentObject, parentKey, parentObjectArrayBool) {
    throw new Error('Abstract');
  }

  /**
   * @param {number} value
   * @param {object|undefined} parentObject
   * @param {string|undefined} parentKey
   * @param {boolean|undefined} parentObjectArrayBool
   * @returns {string}
   */
  numberHandler(
  // eslint-disable-next-line no-unused-vars -- Signature
  value, parentObject, parentKey, parentObjectArrayBool) {
    throw new Error('Abstract');
  }

  /**
   * @param {bigint} value
   * @param {object|undefined} parentObject
   * @param {string|undefined} parentKey
   * @param {boolean|undefined} parentObjectArrayBool
   * @returns {string}
   */
  bigintHandler(
  // eslint-disable-next-line no-unused-vars -- Signature
  value, parentObject, parentKey, parentObjectArrayBool) {
    throw new Error('Abstract');
  }

  /**
   * @param {boolean} value
   * @param {object|undefined} parentObject
   * @param {string|undefined} parentKey
   * @param {boolean|undefined} parentObjectArrayBool
   * @returns {string}
   */
  booleanHandler(
  // eslint-disable-next-line no-unused-vars -- Signature
  value, parentObject, parentKey, parentObjectArrayBool) {
    throw new Error('Abstract');
  }

  /**
   * @param {symbol} value
   * @param {object|undefined} parentObject
   * @param {string|undefined} parentKey
   * @param {boolean|undefined} parentObjectArrayBool
   * @returns {string}
   */
  symbolHandler(
  // eslint-disable-next-line no-unused-vars -- Signature
  value, parentObject, parentKey, parentObjectArrayBool) {
    throw new Error('Abstract');
  }

  /**
   * @param {undefined} value
   * @param {object|undefined} parentObject
   * @param {string|undefined} parentKey
   * @param {boolean|undefined} parentObjectArrayBool
   * @returns {string}
   */
  undefinedHandler(
  // eslint-disable-next-line no-unused-vars -- Signature
  value, parentObject, parentKey, parentObjectArrayBool) {
    throw new Error('Abstract');
  }

  /**
   * @param {AnyValue} value
   * @param {object|undefined} parentObject
   * @param {string|undefined} parentKey
   * @param {boolean|undefined} parentObjectArrayBool
   * @returns {string}
   */
  objectHandler(
  // eslint-disable-next-line no-unused-vars -- Signature
  value, parentObject, parentKey, parentObjectArrayBool) {
    throw new Error('Abstract');
  }

  /**
   * @param {null} obj
   * @param {object|undefined} parentObject
   * @param {string|undefined} parentKey
   * @param {boolean|undefined} parentObjectArrayBool
   * @returns {string}
   */
  nullHandler(
  // eslint-disable-next-line no-unused-vars -- Signature
  obj, parentObject, parentKey, parentObjectArrayBool) {
    throw new Error('Abstract');
  }

  /**
   * @param {number} value
   * @param {object|undefined} parentObject
   * @param {string|undefined} parentKey
   * @param {boolean|undefined} parentObjectArrayBool
   * @returns {string}
   */
  nonfiniteNumberHandler(
  // eslint-disable-next-line no-unused-vars -- Signature
  value, parentObject, parentKey, parentObjectArrayBool) {
    throw new Error('Abstract');
  }

  /**
   * @param {AnyValue[]} value
   * @param {object|undefined} parentObject
   * @param {string|undefined} parentKey
   * @param {boolean|undefined} parentObjectArrayBool
   * @returns {string}
   */
  arrayHandler(
  // eslint-disable-next-line no-unused-vars -- Signature
  value, parentObject, parentKey, parentObjectArrayBool) {
    throw new Error('Abstract');
  }

  /**
   * @param {GenericFunction} value
   * @param {object|undefined} parentObject
   * @param {string|undefined} parentKey
   * @param {boolean|undefined} parentObjectArrayBool
   * @returns {string}
   */
  functionHandler(
  // eslint-disable-next-line no-unused-vars -- Signature
  value, parentObject, parentKey, parentObjectArrayBool) {
    throw new Error('Abstract');
  }

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
  keyValueDistinguishedHandler(
  // eslint-disable-next-line no-unused-vars -- Signature
  value, key, parentObject, parentKey,
  // eslint-disable-next-line no-unused-vars -- Signature
  parentObjectArrayBool, arrayBool, iterCt) {
    throw new Error('Abstract');
  }

  /**
   * @returns {string}
   */
  arrayKeyValueJoinerHandler() {
    throw new Error('Abstract');
  }

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
  keyValueHandler(
  // eslint-disable-next-line no-unused-vars -- Signature
  value, key, parentObject, parentKey,
  // eslint-disable-next-line no-unused-vars -- Signature
  parentObjectArrayBool, arrayBool, iterCt) {
    throw new Error('Abstract');
  }

  /**
   * @param {string|number} key
   * @param {object|undefined} parentObject
   * @param {string|undefined} parentKey
   * @param {boolean|undefined} parentObjectArrayBool
   * @returns {AnyValue}
   */
  arrayKeyHandler(
  // eslint-disable-next-line no-unused-vars -- Signature
  key, parentObject, parentKey, parentObjectArrayBool) {
    throw new Error('Abstract');
  }

  /**
   * @param {string|number} key
   * @param {object|undefined} parentObject
   * @param {string|undefined} parentKey
   * @param {boolean|undefined} parentObjectArrayBool
   * @param {number} [iterCt]
   * @returns {AnyValue}
   */
  objectKeyHandler(
  // eslint-disable-next-line no-unused-vars -- Signature
  key, parentObject, parentKey, parentObjectArrayBool, iterCt) {
    throw new Error('Abstract');
  }
  /* eslint-enable jsdoc/require-returns-check -- Abstract */

  /**
   * @param {SAJJOptions} options See setDefaultOptions() function body for
   *   some possibilities
   */
  constructor(options) {
    /** @type {SAJJOptions} */
    // eslint-disable-next-line no-unused-expressions -- TS
    this.options;
    this.setDefaultOptions(options);
  }

  // OPTIONS
  /**
   * @param {SAJJOptions} [options]
   * @returns {void}
   */
  setDefaultOptions(options) {
    const newOptions = options || {};
    this.options = newOptions;

    // Todo: to make properties read-only, etc., use https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Object/defineProperties

    // CUSTOM PROPERTIES
    // Whether to support full JavaScript objects (with functions,
    //   undefined, nonfiniteNumbers) or JSON; will not distinguish
    //   object literals from other objects, but neither does JSON.stringify
    //   which ignores prototype and drops functions/undefined and
    //   converts nonfinite to null
    this.mode = newOptions.mode || 'JSON';
    this.distinguishKeysValues = newOptions.distinguishKeysValues || false;
    this.iterateArrays = newOptions.iterateArrays !== undefined ? newOptions.iterateArrays : true;
    this.iterateObjects = newOptions.iterateObjects !== undefined ? newOptions.iterateObjects : true;
    this.iterateObjectPrototype = newOptions.iterateObjectPrototype || false;
    this.iterateArrayPrototype = newOptions.iterateArrayPrototype || false;

    // This must be called after options are set
    this.alterDefaultHandlers(newOptions);
  }

  /**
  * Rather than use the strategy design pattern, we'll override our prototype
  *   selectively.
  * @param {SAJJOptions} options
  * @returns {void}
  */
  alterDefaultHandlers(options) {
    if (this.distinguishKeysValues) {
      this.keyValueHandler = this.keyValueDistinguishedHandler;
    }
    if (options.delegateHandlers) {
      this.delegateHandlers = options.delegateHandlers;
    }
  }

  // PUBLIC METHODS TO INITIATE PARSING

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
  walkJSONString(str, parentObject, parentKey, parentObjectArrayBool) {
    return this.walkJSONObject(JSON.parse(str), parentObject, parentKey, parentObjectArrayBool);
  }

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
  walkJSONObject(obj, parentObject, parentKey, parentObjectArrayBool) {
    this.root = obj;
    const parObj = parentObject || this.options.parentObject,
      parKey = parentKey || this.options.parentKey,
      parObjArrBool = parentObjectArrayBool || this.options.parentObjectArrayBool || parObj && this.isArrayType(parObj);
    this.ret = this.beginHandler(obj, parObj, parKey, parObjArrBool);
    this.ret += this.delegateHandlersByType(obj, parObj, parKey, parObjArrBool);
    this.ret += this.endHandler(obj, parObj, parKey, parObjArrBool);
    return this.ret;
  }

  // BEGIN AND END HANDLERS

  /**
   * @param {AnyValue} value
   * @param {object|undefined} parentObject
   * @param {string|undefined} parentKey
   * @param {boolean} [parentObjectArrayBool]
   * @returns {string}
   */
  beginHandler(
  // eslint-disable-next-line no-unused-vars -- Signature
  value, parentObject, parentKey, parentObjectArrayBool) {
    return '';
  }

  /**
   * We just make available the passed in arguments.
   * @param {AnyValue} obj
   * @param {AnyValue} parObj
   * @param {string|undefined} parKey
   * @param {boolean} [parObjArrBool]
   * @returns {string}
   */
  endHandler(
  // eslint-disable-next-line no-unused-vars -- Signature
  obj, parObj, parKey, parObjArrBool) {
    return '';
  }

  // HANDLER DELEGATION BY TYPE

  // Todo: override this (or separate out and override secondary method)
  //     to delegate objects/arrays separately but for others, pass type
  //     as arg, not within method name

  /**
   * @param {import('../jhtml.js').JSONObject} obj
   * @param {object|undefined} parentObject
   * @param {string|undefined} parentKey
   * @param {boolean} [parentObjectArrayBool]
   * @returns {string}
   */
  delegateHandlersByType(obj, parentObject, parentKey, parentObjectArrayBool) {
    const suffix = 'Handler',
      type = this.detectBasicType(obj, parentObject, parentKey, parentObjectArrayBool);
    switch (type) {
      case 'null':
      case 'undefined':
      case 'array':
      case 'object':
      case 'ignore': // Will delegate by default so that handler can log, etc.
      // Fallthrough
      default:
        return this.delegateHandlers(
        /**
         * @type {`${SAJJType}Handler`}
         */
        type + suffix, parentObject, parentKey, parentObjectArrayBool, obj);
    }
  }

  /**
   * @callback DelegateHandlers
   * Allows override to allow for immediate or delayed execution; should handle
   *   both null/undefined types (which require no first value argument since
   *   only one is possible) and other types.
   * @param {`${SAJJType}Handler`} type
   * @param {object|undefined} parentObj
   * @param {string|undefined} parentKey
   * @param {boolean} [parentObjectArrayBool]
   * @param {AnyValue} [obj]
   * @returns {string}
   */

  /** @type {DelegateHandlers} */
  delegateHandlers(type, parentObj, parentKey, parentObjectArrayBool, obj) {
    return this[type](
    // @ts-ignore Ok
    obj, parentObj, parentKey, parentObjectArrayBool);
  }

  // DETECT TYPES
  /**
   * @param {AnyValue} obj
   * @param {object|undefined} parentObject
   * @param {string|undefined} parentKey
   * @param {boolean} [parentObjectArrayBool]
   * @returns {SAJJType}
   */
  detectBasicType(obj, parentObject, parentKey, parentObjectArrayBool) {
    const type = typeof obj,
      JSMode = this.mode === 'JavaScript';
    switch (type) {
      // JavaScript-only
      case 'symbol':
        if (JSMode) {
          return type;
        }
        return this.typeErrorHandler('symbol', obj, parentObject, parentKey, parentObjectArrayBool);
      case 'bigint':
        if (JSMode) {
          return type;
        }
        return this.typeErrorHandler('bigint', obj, parentObject, parentKey, parentObjectArrayBool);
      case 'number':
        if (!Number.isFinite(obj)) {
          if (JSMode) {
            return 'nonfiniteNumber';
            // Can return a custom type and add that handler to the object to
            //  convert to JSON
          }
          return this.typeErrorHandler('nonfiniteNumber', obj, parentObject, parentKey, parentObjectArrayBool);
        }
        return type;
      case 'function':
      case 'undefined':
        if (!JSMode) {
          // Can return a custom type and add that handler to the object to
          //   convert to JSON
          return this.typeErrorHandler(type, obj, parentObject, parentKey, parentObjectArrayBool);
        }
      // Fallthrough
      case 'boolean':
      case 'string':
        return type;
      case 'object':
        return obj ? this.isArrayType(obj) ? 'array' : JSMode ? this.detectObjectType(obj) : 'object' : 'null';
    }
    throw new Error('Unexpected type');
  }

  /**
  * Could override to always return false if one wished to merge
  *   arrayHandler/objectHandler or, if in JSMode, to merge detectObjectType
  *   and this isArrayType method. To merge arrayKeyValueHandler and
  *   objectKeyValueHandler, see keyValueHandler.
  * @param {AnyValue} obj
  * @returns {boolean}
  */
  isArrayType(obj) {
    return Object.prototype.toString.call(obj) === '[object Array]';
  }

  /**
  * Allow overriding to detect `Date`, `RegExp`, or other types (which will in
  *   turn route to corresponding names).
  * @param {AnyValue} obj
  * @returns {"object"}
  */
  detectObjectType(
  // eslint-disable-next-line no-unused-vars -- Signature
  obj) {
    return 'object';
  }

  // ERROR HANDLING
  /**
   * May throw or return type string (can be custom type if handler present).
   * @param {SAJJType} type
   * @param {AnyValue} obj
   * @param {object|undefined} parentObject
   * @param {string|undefined} parentKey
   * @param {boolean} [parentObjectArrayBool]
   * @returns {"null"}
   */
  typeErrorHandler(type,
  // eslint-disable-next-line no-unused-vars -- Signature
  obj, parentObject, parentKey, parentObjectArrayBool) {
    switch (type) {
      // Could utilize commented out portions as below to allow JSON mode to
      //   still handle certain non-JSON types (though may be better to use JS
      //   mode in such a case)
      /*
      case 'function':
        return 'ignore';
        // return type;
      case 'undefined':
        return 'ignore';
        // return type;
        // Or maybe this:
        // return 'null';
      */
      case 'nonfiniteNumber':
        // We'll behave by default as does JSON.stringify
        return 'null';
      default:
        throw new Error('Values of type "' + type + '" are only allowed in JavaScript mode, not JSON.');
    }
  }
}

/* eslint-disable jsdoc/reject-any-type -- Arbitrary */
/**
 * @typedef {any} AnyDelegated
 */
/* eslint-enable jsdoc/reject-any-type -- Arbitrary */

/**
* @abstract
* @class
* @todo Might add an add() method which defines how to combine result values
*  (so as to allow for other means besides string concatenation)
*/
class ObjectArrayDelegator extends SAJJ {
  /* eslint-disable jsdoc/require-returns-check -- Abstract */
  /**
   * @returns {AnyDelegated}
   */
  objectKeyValueJoinerHandler() {
    throw new Error('Abstract');
  }
  /**
   * @param {object} value
   * @param {object|undefined} parentObject
   * @param {string|undefined} parentKey
   * @param {boolean|undefined} parentObjectArrayBool
   * @returns {AnyDelegated}
   */
  beginObjectHandler(
  // eslint-disable-next-line no-unused-vars -- Not used here
  value, parentObject, parentKey, parentObjectArrayBool) {
    throw new Error('Abstract');
  }
  /**
   * @param {object} value
   * @param {object|undefined} parentObject
   * @param {string|undefined} parentKey
   * @param {boolean|undefined} parentObjectArrayBool
   * @returns {AnyDelegated}
   */
  endObjectHandler(
  // eslint-disable-next-line no-unused-vars -- Not used here
  value, parentObject, parentKey, parentObjectArrayBool) {
    throw new Error('Abstract');
  }

  /**
   * @param {AnyDelegated[]} value
   * @param {object|undefined} parentObject
   * @param {string|undefined} parentKey
   * @param {boolean|undefined} parentObjectArrayBool
   * @param {number} arrLength
   * @returns {AnyDelegated}
   */
  beginArrayHandler(
  // eslint-disable-next-line no-unused-vars -- Not used here
  value, parentObject, parentKey, parentObjectArrayBool, arrLength) {
    throw new Error('Abstract');
  }

  /**
   * @param {AnyDelegated[]} value
   * @param {object|undefined} parentObject
   * @param {string|undefined} parentKey
   * @param {boolean|undefined} parentObjectArrayBool
   * @param {number} arrLength
   * @returns {AnyDelegated}
   */
  endArrayHandler(
  // eslint-disable-next-line no-unused-vars -- Not used here
  value, parentObject, parentKey, parentObjectArrayBool, arrLength) {
    throw new Error('Abstract');
  }
  /* eslint-enable jsdoc/require-returns-check -- Abstract */

  // It is probably not necessary to override the defaults for the following
  //   two methods and perhaps not any of the others either
  /**
   * @param {AnyDelegated} value
   * @param {object|undefined} parentObject
   * @param {string|undefined} parentKey
   * @param {boolean|undefined} parentObjectArrayBool
   * @returns {string}
   */
  objectHandler(value, parentObject, parentKey, parentObjectArrayBool) {
    const ret = this.beginObjectHandler(value, parentObject, parentKey, parentObjectArrayBool),
      keyVals = [];
    if (this.iterateObjects) {
      let i = 0;
      if (this.iterateObjectPrototype) {
        // eslint-disable-next-line @stylistic/max-len -- Long
        // eslint-disable-next-line guard-for-in -- Deliberately iterating prototype
        for (const key in value) {
          this.currentKey = key;
          this.currentObject = value[key];
          keyVals.push(this.keyValueHandler(value[key], key, value, parentKey, parentObjectArrayBool, false, i));
          i++;
        }
      } else {
        for (const key in value) {
          if (Object.hasOwn(value, key)) {
            this.currentKey = key;
            this.currentObject = value[key];
            keyVals.push(this.keyValueHandler(value[key], key, value, parentKey, parentObjectArrayBool, false, i));
            i++;
          }
        }
      }
    }
    return ret + keyVals.join(this.objectKeyValueJoinerHandler()) + this.endObjectHandler(value, parentObject, parentKey, parentObjectArrayBool);
  }

  /**
   * @param {AnyDelegated[]} value
   * @param {object|undefined} parentObject
   * @param {string|undefined} parentKey
   * @param {boolean|undefined} parentObjectArrayBool
   * @returns {string}
   */
  arrayHandler(value, parentObject, parentKey, parentObjectArrayBool) {
    const arrLength = value.length,
      ret = this.beginArrayHandler(value, parentObject, parentKey, parentObjectArrayBool, arrLength),
      keyVals = [];
    if (this.iterateArrays) {
      if (this.iterateArrayPrototype) {
        // eslint-disable-next-line @stylistic/max-len -- Long
        // eslint-disable-next-line guard-for-in -- Deliberately iterating prototype
        for (const key in value) {
          this.currentKey = key;
          this.currentObject = value[key];
          // Ambiguous about whether array value is being iterated or
          //   array object value
          keyVals.push(this.keyValueHandler(value[key], key, value, parentKey, parentObjectArrayBool, true));
        }
      } else {
        const arrl = value.length;
        for (let key = 0; key < arrl; key++) {
          this.currentKey = key;
          this.currentObject = value[key];
          keyVals.push(this.keyValueHandler(value[key], key, value, parentKey, parentObjectArrayBool, true));
        }
      }
    }
    return ret + keyVals.join(this.arrayKeyValueJoinerHandler()) + this.endArrayHandler(value, parentObject, parentKey, parentObjectArrayBool, arrLength);
  }

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
  keyValueHandler(value, key, parentObject, parentKey, parentObjectArrayBool, arrayBool, iterCt) {
    const objectRet = this.keyHandler(key, parentObject, parentKey, parentObjectArrayBool, arrayBool, iterCt);
    if (arrayBool) {
      return this.arrayKeyValueHandler(value, key, parentObject, parentKey, parentObjectArrayBool);
    }
    return objectRet + this.objectKeyValueHandler(value, key, parentObject, parentKey, parentObjectArrayBool, iterCt);
  }

  /**
   * @param {AnyDelegated} value
   * @param {string|number} key
   * @param {object|undefined} parentObject
   * @param {string|undefined} parentKey
   * @param {boolean|undefined} parentObjectArrayBool
   * @returns {AnyDelegated}
   */
  arrayKeyValueHandler(value, key, parentObject, parentKey, parentObjectArrayBool) {
    return this.delegateHandlersByType(value, parentObject, parentKey, parentObjectArrayBool);
  }

  /**
   * @param {AnyDelegated} value
   * @param {string|number} key
   * @param {object|undefined} parentObject
   * @param {string|undefined} parentKey
   * @param {boolean|undefined} parentObjectArrayBool
   * @param {number} [iterCt]
   * @returns {AnyDelegated}
   */
  objectKeyValueHandler(value, key, parentObject, parentKey, parentObjectArrayBool,
  // eslint-disable-next-line no-unused-vars -- Signature
  iterCt) {
    return this.delegateHandlersByType(value, parentObject, parentKey, parentObjectArrayBool);
  }

  // OPTIONAL DISTINGUISHING OF KEY AND VALUE HANDLERS

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
  keyValueDistinguishedHandler(value, key, parentObject, parentKey, parentObjectArrayBool, arrayBool, iterCt) {
    const ret = this.keyHandler(key, parentObject, parentKey, parentObjectArrayBool, arrayBool, iterCt);
    return ret + this.valueHandler(value, key, parentObject, parentKey, parentObjectArrayBool, arrayBool, iterCt);
  }

  /**
   * @param {string|number} key
   * @param {object|undefined} parentObject
   * @param {string|undefined} parentKey
   * @param {boolean|undefined} parentObjectArrayBool
   * @param {boolean} arrayBool
   * @param {number} [iterCt]
   * @returns {AnyDelegated}
   */
  keyHandler(key, parentObject, parentKey, parentObjectArrayBool, arrayBool, iterCt) {
    if (arrayBool) {
      return this.arrayKeyHandler(key, parentObject, parentKey, parentObjectArrayBool);
    }
    return this.objectKeyHandler(key, parentObject, parentKey, parentObjectArrayBool, iterCt);
  }
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
  valueHandler(value, key, parentObject, parentKey, parentObjectArrayBool, arrayBool, iterCt) {
    if (arrayBool) {
      return this.arrayValueHandler(value, key, parentObject, parentKey, parentObjectArrayBool);
    }
    return this.objectValueHandler(value, key, parentObject, parentKey, parentObjectArrayBool, iterCt);
  }

  /**
   * @param {AnyDelegated} value
   * @param {string} key
   * @param {object|undefined} parentObject
   * @param {string|undefined} parentKey
   * @param {boolean|undefined} parentObjectArrayBool
   * @param {number} [iterCt]
   * @returns {AnyDelegated}
   */
  objectValueHandler(value, key, parentObject, parentKey, parentObjectArrayBool,
  // eslint-disable-next-line no-unused-vars -- Placeholder?
  iterCt) {
    return this.delegateHandlersByType(value, parentObject, parentKey, parentObjectArrayBool);
  }

  /**
   * @param {AnyDelegated[]} value
   * @param {string} key
   * @param {object|undefined} parentObject
   * @param {string|undefined} parentKey
   * @param {boolean|undefined} parentObjectArrayBool
   * @returns {AnyDelegated}
   */
  arrayValueHandler(value, key, parentObject, parentKey, parentObjectArrayBool) {
    return this.delegateHandlersByType(value, parentObject, parentKey, parentObjectArrayBool);
  }
}

/**
 * Provides JSON.stringifier()-like functionality (no replacer or space
 * arguments currently, however).
 * This class uses the abstract `ObjectArrayDelegator` for
 *   object/array delegating so the stringification can occur solely on
 *   the terminal methods here.
 * @todo Could implement our own stringifier for strings rather than using
 *   `JSON.stringify`
 */

/**
 *
 */
class Stringifier extends ObjectArrayDelegator {
  // JSON terminal handler methods

  // These four methods can be overridden without affecting the logic of
  //   the objectHandler and arrayHandler to utilize reporting of the
  //   object as a whole
  /**
   * @returns {string}
   */
  beginObjectHandler(
    /* value, parentObject, parentKey, parentObjectArrayBool */
  ) {
    return '{';
  }
  /**
   * @returns {string}
   */
  endObjectHandler(
    /* value, parentObject, parentKey, parentObjectArrayBool */
  ) {
    return '}';
  }
  /**
   * @returns {string}
   */
  beginArrayHandler(
    /* value, parentObject, parentKey, parentObjectArrayBool */
  ) {
    return '[';
  }
  /**
   * @returns {string}
   */
  endArrayHandler(
    /* value, parentObject, parentKey, parentObjectArrayBool */
  ) {
    return ']';
  }

  // JSON terminal key handler methods

  /**
   * @param {string} key
   * @returns {string}
   */
  objectKeyHandler(key /* , parentObject, parentKey, parentObjectArrayBool, iterCt */) {
    return '"' + key.replaceAll('\\', '\\\\').replaceAll('"', String.raw`\"`) + '":';
  }

  /**
   * @returns {string}
   */
  arrayKeyHandler(/* key, parentObject, parentKey, parentObjectArrayBool */
  ) {
    return '';
  }

  // JSON terminal joiner handler methods

  /**
   * @returns {string}
   */
  objectKeyValueJoinerHandler() {
    return ',';
  }
  /**
   * @returns {string}
   */
  arrayKeyValueJoinerHandler() {
    return ',';
  }

  // JSON terminal primitive handler methods

  /**
   * @returns {string}
   */
  nullHandler(/* parentObject, parentKey, parentObjectArrayBool */
  ) {
    return 'null';
  }

  /**
   * @param {boolean} value
   * @returns {string}
   */
  // eslint-disable-next-line @stylistic/max-len -- Long
  // eslint-disable-next-line unicorn/prefer-native-coercion-functions -- Clearer
  booleanHandler(value /* , parentObject, parentKey, parentObjectArrayBool */) {
    return String(value);
  }

  /**
   * @param {number} value
   * @returns {string}
   */
  // eslint-disable-next-line @stylistic/max-len -- Long
  // eslint-disable-next-line unicorn/prefer-native-coercion-functions -- Clearer
  numberHandler(value /* , parentObject, parentKey, parentObjectArrayBool */) {
    return String(value);
  }

  /**
   * @param {string} value
   * @returns {string}
   */
  stringHandler(value /* , parentObject, parentKey, parentObjectArrayBool */) {
    return JSON.stringify(value);
  }

  /* eslint-disable jsdoc/reject-function-type -- Generic */
  /**
   * @typedef {Function} GenericFunction
   */
  /* eslint-enable jsdoc/reject-function-type -- Generic */

  // JavaScript-only (non-JSON) (terminal) handler methods (not used or
  //   required for JSON mode)
  /**
   * @param {GenericFunction} value
   * @returns {string}
   */
  functionHandler(value /* , parentObject, parentKey, parentObjectArrayBool */) {
    return value.toString(); // May not be supported everywhere
  }

  /**
   * @returns {string}
   */
  undefinedHandler(/* parentObject, parentKey, parentObjectArrayBool */
  ) {
    return 'undefined';
  }

  /**
   * @param {bigint} value
   * @returns {string}
   */
  bigintHandler(value /* ,  parentObject, parentKey, parentObjectArrayBool */) {
    return String(value) + 'n';
  }

  /**
   * @param {symbol} value
   * @returns {string}
   */
  // eslint-disable-next-line @stylistic/max-len -- Long
  // eslint-disable-next-line unicorn/prefer-native-coercion-functions -- Clearer
  symbolHandler(value /* ,  parentObject, parentKey, parentObjectArrayBool */) {
    return String(value);
  }

  /**
   * @param {number} value
   * @returns {string}
   */
  // eslint-disable-next-line @stylistic/max-len -- Long
  // eslint-disable-next-line unicorn/prefer-native-coercion-functions -- Clearer
  nonfiniteNumberHandler(value /* , parentObject, parentKey, parentObjectArrayBool */) {
    return String(value);
  }
}

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


/* eslint-disable jsdoc/reject-function-type -- Generic */
/**
 * @typedef {Function} GenericFunction
 */
/* eslint-enable jsdoc/reject-function-type -- Generic */

/**
 * @param {Node} node
 * @param {Element} item
 * @throws {Error}
 * @returns {boolean}
 */
function ignoreHarmlessNonelementNodes(node, item) {
  if ((node.nodeType === 3 || node.nodeType === 4) &&
  // Text or CDATA node
  /\S/v.test(/** @type {string} */node.nodeValue)) {
    throw new Error('Non-whitespace text or CDATA nodes are not allowed directly within <' + item.nodeName.toLowerCase() + '>');
  }
  // Todo: also ignore nodes like comments or processing instructions?
  //   (A mistake of JSON?); we might even convert comments into JavaScript
  //   comments if this is used in a non-JSON-restricted JavaScript environment
  // Not an element (ignore comments, whitespace text nodes, etc.)
  return node.nodeType !== 1;
}

/**
 * @typedef {undefined|null|boolean|number|bigint|symbol|string|GenericFunction|
 *   Date|RegExp} NonObject
 */

/**
 * @typedef {{
 *   [key: string]: NonObject | JSONObject | JSONObject[]
 * }} JSONObjectPlain
 */

/**
 * @typedef {(NonObject|JSONObject)[]} JSONObjectArray
 */

/**
 * @typedef {NonObject|JSONObjectPlain|JSONObjectArray} JSONObject
 */

/**
 * @param {Element} item
 * @param {boolean} allowJS
 * @param {boolean} [throwOnSpan]
 * @throws {Error}
 * @returns {JSONObject}
 */
function item2JSONObject(item, allowJS, throwOnSpan) {
  /** @type {JSONObject} */
  let ret;

  /** @type {"dt"|"dd"} */
  let state;
  const {
      textContent
    } = item,
    topLevelJSONElement = item.nodeName.toLowerCase();
  switch (topLevelJSONElement) {
    case 'span':
      if (throwOnSpan) {
        throw new Error('A <span> element is not allowed in this context');
      }
      return textContent;
    // null, boolean, number (or undefined, function, non-finite
    //   number, Date or RegExp object)
    case 'i':
      switch (textContent) {
        case 'null':
          return null;
        case 'true':
          return true;
        case 'false':
          return false;
        // Non-JSON
        case 'undefined':
          ret = undefined;
          break;
        case 'Infinity':
          ret = Infinity;
          break;
        case '-Infinity':
          ret = -Infinity;
          break;
        case 'NaN':
          ret = Number.NaN;
          break;
        default:
          {
            // number
            if (/^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:e(?:[+\-])?\d+)?$/vi.test(textContent)) {
              return Number.parseFloat(textContent);
            }
            // function
            const funcMatch = textContent.match(/^function \w*\s*\(([\w, ]*)\) \{([\s\S]*)\}$/v);
            // Todo: Add config to prevent this
            if (funcMatch) {
              // eslint-disable-next-line no-new-func -- Deliberate
              ret = new Function(...funcMatch[1].split(/, /v).
              // eslint-disable-next-line unicorn/prefer-spread -- Convenient
              concat(funcMatch[2]));
              break;
            }
            // Date
            if (/^(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun) /v.test(textContent)) {
              ret = new Date(Date.parse(textContent));
              break;
            }
            // RegExp
            const regexMatch = textContent.match(/^\/([\s\S]*)\/([gimydsuv]+)?$/v);
            if (regexMatch) {
              const flags = regexMatch[2] ?? '';
              ret = new RegExp(regexMatch[1], flags);
              break;
            }

            // BigInt

            const bigintMatch = textContent.match(/^\d+n$/v);
            if (bigintMatch) {
              ret = BigInt(bigintMatch[0].slice(0, -1));
              break;
            }
            const symbolMatch = textContent.match(/^Symbol\(('\w+')\)$/v);
            if (symbolMatch) {
              ret = Symbol(symbolMatch[1]);
              break;
            }
            throw new Error('Unrecognized type');
          }
      }
      if (!allowJS) {
        throw new Error('The value type (' + String(ret) + ') cannot be used in JSON mode');
      }
      return ret;
    case 'dl':
      {
        // object
        // JSON allows empty objects (and HTML allows empty <dl>'s) so we do also
        state = 'dt';
        ret = {};
        /** @type {string} */
        let key;
        [...item.childNodes].forEach(function (node) {
          if (ignoreHarmlessNonelementNodes(node, item)) {
            return;
          }
          const nodeName = node.nodeName.toLowerCase();
          if (state !== nodeName) {
            throw new Error(`Unexpected element ${nodeName} encountered where ${state} expected`);
          }
          if (nodeName === 'dt') {
            if (/** @type {Element} */node.children.length) {
              throw new Error('<dt> should not have any children');
            }
            state = 'dd';
            key = /** @type {string} */node.textContent;
            return;
          }
          // Can now only be a <dd>
          state = 'dt';
          if (/** @type {Element} */node.children.length > 1) {
            throw new Error('<dd> should not have more than one element ' + 'child (<ol>, <dl>, or <i>)');
          }
          if (!(/** @type {Element} */node).children.length) {
            // String
            /** @type {JSONObjectPlain} */
            ret[key] = node.textContent;
            return;
          }

          /** @type {JSONObjectPlain} */
          ret[key] = item2JSONObject(/** @type {Element} */node.children[0], allowJS, true);
        });
        if (state !== 'dt') {
          throw new Error('Ended a definition list without a final <dd> to ' + 'match the previous <dt>.');
        }
        return ret;
      }
    case 'ol':
      // array
      if (item.getAttribute('start') !== '0') {
        throw new Error('For the sake of readability, <ol> must include a ' + 'start="0" attribute within JHTML.');
      }
      ret = [];
      // JSON allows empty arrays (and HTML allows empty <ol>'s) so we do also
      [...item.childNodes].forEach(function (node) {
        if (ignoreHarmlessNonelementNodes(node, item)) {
          return;
        }
        const nodeName = node.nodeName.toLowerCase();
        if (nodeName !== 'li') {
          throw new Error('Unexpected child of <ol> element: ' + nodeName);
        }
        if (/** @type {Element} */node.children.length > 1) {
          throw new Error('<li> should not have more than a single element ' + 'child (<ol>, <dl>, or <i>)');
        }
        if (!(/** @type {Element} */node).children.length) {
          // String
          /** @type {JSONObjectArray} */
          ret.push(node.textContent);
        } else {
          /** @type {JSONObjectArray} */
          ret.push(item2JSONObject(/** @type {Element} */node.children[0], allowJS, true));
        }
      });
      return ret;
  }
  throw new Error('Unexpected element');
}

/**
 * @param {string} str
 * @returns {string}
 */
function escapeHTMLText(str) {
  return str.replaceAll('&', '&amp;').replaceAll('<', '&lt;');
}

// eslint-disable-next-line sonarjs/no-clear-text-protocols -- NS
const jhtmlNs = 'http://brett-zamir.me/ns/microdata/json-as-html/2';

/**
 *
 */
class JHTMLStringifier extends ObjectArrayDelegator {
  // JSON terminal handler methods

  // These four methods can be overridden without affecting the logic of the
  //   objectHandler and arrayHandler to utilize reporting of the object
  //   as a whole
  /**
   * @param {object} value
   * @param {object|undefined} parentObject
   * @returns {string}
   */
  beginObjectHandler(value, parentObject /* , parentKey, parentObjectArrayBool */) {
    return '<dl' + (parentObject ? '' : ' itemscope="" itemtype="' + jhtmlNs + '"') + '>';
  }
  /**
   * @returns {string}
   */
  endObjectHandler(
    /* value, parentObject, parentKey, parentObjectArrayBool */
  ) {
    return '</dl>';
  }

  /**
   * @param {JSONObjectArray} value
   * @param {object|undefined} parentObject
   * @returns {string}
   */
  beginArrayHandler(value, parentObject /* , parentKey, parentObjectArrayBool */) {
    return '<ol start="0"' + (parentObject ? '' : ' itemscope="" itemtype="' + jhtmlNs + '"') + '>';
  }

  /**
   * @returns {string}
   */
  endArrayHandler(
    /* value, parentObject, parentKey, parentObjectArrayBool */
  ) {
    return '</ol>';
  }

  // JSON terminal key handler methods

  /**
   * @param {string} key
   * @returns {string}
   */
  objectKeyHandler(key /* , parentObject, parentKey, parentObjectArrayBool, iterCt */) {
    return '<dt>' + escapeHTMLText(key) + '</dt>';
  }

  /**
   * @returns {string}
   */
  arrayKeyHandler(/* key, parentObject, parentKey, parentObjectArrayBool */
  ) {
    return '';
  }

  // JSON terminal joiner handler methods

  /**
   * @returns {string}
   */
  objectKeyValueJoinerHandler() {
    return '';
  }

  /**
   * @returns {string}
   */
  arrayKeyValueJoinerHandler() {
    return '';
  }

  // JSON terminal primitive handler methods

  /**
   * @param {null} obj
   * @param {object|undefined} parentObject
   * @returns {string}
   */
  nullHandler(obj, parentObject /* , parentKey, parentObjectArrayBool */) {
    if (!parentObject) {
      return 'null';
    }
    return '<i>null</i>';
  }

  /**
   * @param {boolean} value
   * @param {object|undefined} parentObject
   * @returns {string}
   */
  booleanHandler(value, parentObject /* , parentKey, parentObjectArrayBool */) {
    if (!parentObject) {
      return String(value);
    }
    return '<i>' + String(value) + '</i>';
  }

  /**
   * @param {number} value
   * @param {object|undefined} parentObject
   * @returns {string}
   */
  numberHandler(value, parentObject /* , parentKey, parentObjectArrayBool */) {
    if (!parentObject) {
      return String(value);
    }
    return '<i>' + String(value) + '</i>';
  }

  /**
   * @param {string} value
   * @param {object|undefined} parentObject
   * @returns {string}
   */
  stringHandler(value, parentObject /* , parentKey, parentObjectArrayBool */) {
    if (!parentObject) {
      return escapeHTMLText(value);
    }
    return escapeHTMLText(value);
  }

  /* eslint-disable jsdoc/reject-function-type -- Generic */
  /**
   * @typedef {Function} GenericFunction
   */
  /* eslint-enable jsdoc/reject-function-type -- Generic */

  // JavaScript-only (non-JSON) (terminal) handler methods (not used or
  //   required for JSON mode)
  /**
   * @param {GenericFunction} value
   * @param {object|undefined} parentObject
   * @returns {string}
   */
  functionHandler(value, parentObject /* , parentKey, parentObjectArrayBool */) {
    // May not be supported everywhere
    const str = escapeHTMLText(value.toString());
    if (!parentObject) {
      return str;
    }
    return '<i>' + str + '</i>';
  }

  /**
   * @param {undefined} value
   * @param {object|undefined} parentObject
   * @returns {string}
   */
  undefinedHandler(value, parentObject /* , parentKey, parentObjectArrayBool */) {
    if (!parentObject) {
      return 'undefined';
    }
    return '<i>undefined</i>';
  }
  /**
   * @param {number} value
   * @param {object|undefined} parentObject
   * @returns {string}
   */
  nonfiniteNumberHandler(value, parentObject /* , parentKey, parentObjectArrayBool */) {
    if (!parentObject) {
      return String(value);
    }
    return '<i>' + String(value) + '</i>';
  }

  /**
   * @param {JSONObject} value
   * @param {string} key
   * @param {object|undefined} parentObject
   * @param {string|undefined} parentKey
   * @param {boolean|undefined} parentObjectArrayBool
   * @returns {string}
   */
  objectValueHandler(value, key, parentObject, parentKey, parentObjectArrayBool /* , iterCt */) {
    return '<dd>' + this.delegateHandlersByType(value, parentObject, parentKey, parentObjectArrayBool) + '</dd>';
  }

  /**
   * @param {JSONObjectArray} value
   * @param {string} key
   * @param {object|undefined} parentObject
   * @param {string|undefined} parentKey
   * @param {boolean|undefined} parentObjectArrayBool
   * @returns {string}
   */
  arrayValueHandler(value, key, parentObject, parentKey, parentObjectArrayBool) {
    return '<li>' + this.delegateHandlersByType(value, parentObject, parentKey, parentObjectArrayBool) + '</li>';
  }

  /**
   * @param {JSONObject} obj
   * @returns {string}
   */
  beginHandler(obj /* , parObj, parKey, parObjArrBool */) {
    const objType = typeof obj;
    return obj && objType === 'object' ? '' : '<' + (['boolean', 'object', 'number', 'function', 'undefined'].includes(objType) ? 'i' : 'span') + ' itemscope="" itemtype="' + jhtmlNs + '">';
  }

  /**
   * @param {JSONObject} obj
   * @returns {string}
   */
  endHandler(obj /* , parObj, parKey, parObjArrBool */) {
    const objType = typeof obj;
    return obj && objType === 'object' ? '' : '</' + (['boolean', 'object', 'number', 'function', 'undefined'].includes(objType) ? 'i' : 'span') + '>';
  }
}

/** @type {import('jsdom').DOMWindow | Window & typeof globalThis} */
let _win;
/**
 * Set the window object for DOM operations.
 * @param {import('jsdom').DOMWindow |
 *   Window & typeof globalThis} win - The window object.
 * @returns {void}
 */
const setWindow = win => {
  _win = win;
};

/**
 * @param {Element|Element[]} [items]
 * @param {{
 *   mode?: "JSON"|"JavaScript"
 * }} [options]
 * @returns {JSONObject}
 */
const toJSONObject = function (items, options) {
  options = options || {};
  const isElement = items && !Array.isArray(items) && items.nodeType === 1;
  const jsonHtml = isElement ? [items] : (/** @type {Element[]} */items || _win.document.querySelectorAll(`[itemtype=${_win.CSS.escape(jhtmlNs)}]`));
  const ret = [...jsonHtml].map(item => {
    return item2JSONObject(item, options.mode === 'JavaScript');
  });
  return isElement ? ret[0] : ret;
};

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
const toJSONString = function (items, options) {
  options = options || {};
  const isElement = items && !Array.isArray(items) && items.nodeType === 1;
  const jsonHtml = isElement ? [items] : (/** @type {Element[]} */items || _win.document.querySelectorAll(`[itemtype=${_win.CSS.escape(jhtmlNs)}]`));
  const ret = [...jsonHtml].map(item => {
    const jsonObj = item2JSONObject(item, options.mode === 'JavaScript');
    const stringifier = new Stringifier(options);
    return stringifier.walkJSONObject(jsonObj);
  });
  return isElement ? ret[0] : ret;
};

/**
 * @param {JSONObject} jsonObj
 * @param {import('./SAJJ/SAJJ.js').SAJJOptions} [options]
 * @returns {string}
 */
const toJHTMLString = function (jsonObj, options) {
  options = options || {};
  options.distinguishKeysValues = true;
  const jhtmlStringifier = new JHTMLStringifier(options);
  return jhtmlStringifier.walkJSONObject(jsonObj);
};

/**
 * @param {JSONObject} jsonObj
 * @param {import('./SAJJ/SAJJ.js').SAJJOptions} [options]
 * @returns {Element}
 */
const toJHTMLDOM = function (jsonObj, options) {
  const jhtmlStr = toJHTMLString(jsonObj, options);
  return /** @type {Element} */new _win.DOMParser().parseFromString(jhtmlStr, 'text/html').body.firstElementChild;
};

const {
  window
} = new jsdom.JSDOM();
setWindow(window);

exports.Stringifier = Stringifier;
exports.setWindow = setWindow;
exports.toJHTMLDOM = toJHTMLDOM;
exports.toJHTMLString = toJHTMLString;
exports.toJSONObject = toJSONObject;
exports.toJSONString = toJSONString;
