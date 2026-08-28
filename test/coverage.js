/* eslint-disable sonarjs/no-trivial-assertions,
  sonarjs/assertions-in-tests -- Tests */
// @ts-nocheck
import {assert} from 'chai';
import * as JHTML from '../src/jhtml.js';
import SAJJ, {SAJJ_JS as sajjjs, _copyObject} from '../src/SAJJ/SAJJ.js';
import Delegator from '../src/SAJJ/SAJJ.ObjectArrayDelegator.js';

describe('Coverage tests', function () {
  it('iterateObjectPrototype', () => {
    const obj = Object.create({a: 1});
    obj.b = 2;
    const str = JHTML.toJHTMLString(
      obj, {iterateObjectPrototype: true, mode: 'JavaScript'}
    );
    assert.include(str, '<dt>a</dt>');
    assert.include(str, '<dt>b</dt>');
  });

  it('iterateObjectPrototype false', () => {
    const obj = Object.create({a: 1});
    obj.b = 2;
    const str = JHTML.toJHTMLString(
      obj, {iterateObjectPrototype: false, mode: 'JavaScript'}
    );
    assert.notInclude(str, '<dt>a</dt>');
    assert.include(str, '<dt>b</dt>');
  });

  it('iterateArrayPrototype', () => {
    const arr = [1, 2];
    Object.setPrototypeOf(arr, {a: 3});
    const str = JHTML.toJHTMLString(
      arr, {iterateArrayPrototype: true, mode: 'JavaScript'}
    );
    assert.include(str, '<li><i>3</i></li>');
  });

  it('SAJJ abstract methods', () => {
    const sajj = new SAJJ();
    assert.throws(() => sajj.ignoreHandler(), Error, 'Abstract');
    assert.throws(() => sajj.stringHandler(), Error, 'Abstract');
    assert.throws(() => sajj.numberHandler(), Error, 'Abstract');
    assert.throws(() => sajj.bigintHandler(), Error, 'Abstract');
    assert.throws(() => sajj.booleanHandler(), Error, 'Abstract');
    assert.throws(() => sajj.symbolHandler(), Error, 'Abstract');
    assert.throws(() => sajj.undefinedHandler(), Error, 'Abstract');
    assert.throws(() => sajj.objectHandler(), Error, 'Abstract');
    assert.throws(() => sajj.nullHandler(), Error, 'Abstract');
    assert.throws(() => sajj.nonfiniteNumberHandler(), Error, 'Abstract');
    assert.throws(() => sajj.arrayHandler(), Error, 'Abstract');
    assert.throws(() => sajj.functionHandler(), Error, 'Abstract');
    assert.throws(() => sajj.keyValueDistinguishedHandler(), Error, 'Abstract');
    assert.throws(() => sajj.arrayKeyValueJoinerHandler(), Error, 'Abstract');
    assert.throws(() => sajj.keyValueHandler(), Error, 'Abstract');
    assert.throws(() => sajj.arrayKeyHandler(), Error, 'Abstract');
    assert.throws(() => sajj.objectKeyHandler(), Error, 'Abstract');
  });

  it('Delegator abstract methods', () => {
    const d = new Delegator();
    assert.throws(() => d.objectKeyValueJoinerHandler(), Error, 'Abstract');
    assert.throws(() => d.beginObjectHandler(), Error, 'Abstract');
    assert.throws(() => d.endObjectHandler(), Error, 'Abstract');
    assert.throws(() => d.beginArrayHandler(), Error, 'Abstract');
    assert.throws(() => d.endArrayHandler(), Error, 'Abstract');
  });

  it(
    'Stringifier JSON mode array/object detection ' +
    '(SAJJ designed as base class)',
    () => {
      const sajj = new SAJJ({mode: 'JSON'});
      assert.throws(() => sajj.walkJSONObject({a: [1]}), Error, 'Abstract');
      assert.throws(() => sajj.walkJSONString('{"a":[1]}'), Error, 'Abstract');
    }
  );

  it('walkJSONString fails (SAJJ designed as base class)', () => {
    const sajj = new SAJJ();
    assert.throws(() => sajj.walkJSONString('{"a":[1]}'), Error, 'Abstract');
    assert.throws(() => sajj.walkJSONString('[1, 2]'), Error, 'Abstract');
    assert.throws(() => sajj.walkJSONString('"test"'), Error, 'Abstract');
  });

  it('SAJJ_JS and options', () => {
    const sajj = sajjjs({delegateHandlers: true});
    assert.strictEqual(sajj.options.mode, 'JavaScript');
    assert.isTrue(sajj.options.delegateHandlers);
  });

  it('typeErrorHandler throws', () => {
    const sajj = new SAJJ({mode: 'JSON'});

    assert.throws(
      () => sajj.typeErrorHandler(
        'symbol', Symbol(''), {}, 'key', false
      ),
      Error,
      'Values of type "symbol" are only allowed in JavaScript mode, not JSON.'
    );
    assert.throws(
      () => sajj.typeErrorHandler(
        'bigint', 1n, {}, 'key', false
      ),
      Error,
      'Values of type "bigint" are only allowed in JavaScript mode, not JSON.'
    );
    assert.strictEqual(sajj.typeErrorHandler(
      'nonfiniteNumber', Infinity, {}, 'key', false
    ), 'null');

    assert.throws(
      () => sajj.walkJSONObject(
        Symbol('')
      ),
      Error,
      'Values of type "symbol" are only allowed in JavaScript mode, not JSON.'
    );
    assert.throws(
      () => sajj.walkJSONObject(1n),
      Error,
      'Values of type "bigint" are only allowed in JavaScript mode, not JSON.'
    );
  });

  it('typeErrorHandler returns null for nonfiniteNumber if ignored', () => {
    const sajj = new SAJJ();
    assert.strictEqual(sajj.typeErrorHandler('nonfiniteNumber'), 'null');
  });

  it('detectObjectType JSMode false for function/undefined', () => {
    const sajj = new SAJJ({mode: 'JSON'});
    assert.throws(
      () => sajj.detectBasicType(undefined),
      Error,
      'Values of type "undefined" are only allowed ' +
      'in JavaScript mode, not JSON.'
    );
    assert.throws(
      () => sajj.detectBasicType(() => {}),
      Error,
      'Values of type "function" are only allowed in JavaScript mode, not JSON.'
    );
  });
});

describe('Coverage tests for SAJJ JSMode detectObjectType', function () {
  it('detectObjectType JSMode true', () => {
    const sajj = new SAJJ({mode: 'JavaScript'});
    assert.strictEqual(sajj.detectBasicType(Symbol('')), 'symbol');
    assert.strictEqual(sajj.detectBasicType(1n), 'bigint');
    assert.strictEqual(sajj.detectBasicType(Infinity), 'nonfiniteNumber');
    assert.strictEqual(sajj.detectBasicType(undefined), 'undefined');
    assert.strictEqual(sajj.detectBasicType(() => {}), 'function');
  });

  it('detectObjectType JSMode false for function/undefined', () => {
    const sajj = new SAJJ({mode: 'JSON'});
    assert.throws(
      () => sajj.detectBasicType(undefined),
      Error,
      'Values of type "undefined" are only allowed ' +
      'in JavaScript mode, not JSON.'
    );
    assert.throws(
      () => sajj.detectBasicType(() => {}),
      Error,
      'Values of type "function" are only allowed in JavaScript mode, not JSON.'
    );
  });
});

describe('Coverage tests for SAJJ JSMode nonfiniteNumber', function () {
  it('detectBasicType JSMode false for nonfiniteNumber', () => {
    const sajj = new SAJJ({mode: 'JSON'});
    assert.strictEqual(sajj.detectBasicType(Infinity), 'null');
  });
});

describe('Coverage tests for SAJJ JSMode walkJSONObject options', function () {
  it('walkJSONObject uses options parentObject etc', () => {
    const sajj = new SAJJ({
      mode: 'JSON', parentObject: {}, parentKey: 'key'

    });
    assert.throws(() => sajj.walkJSONObject({}), Error, 'Abstract');
  });
});

describe(
  'Coverage tests for ObjectArrayDelegator distinguishKeysValues',
  function () {
    it('uses objectValueHandler and arrayValueHandler', () => {
      /**
       *
       */
      class MyDelegator extends Delegator {
        /**
         * @returns {string}
         */
        objectKeyValueJoinerHandler () {
          return '';
        }
        /**
         * @returns {string}
         */
        beginObjectHandler () {
          return '';
        }
        /**
         * @returns {string}
         */
        endObjectHandler () {
          return '';
        }
        /**
         * @returns {string}
         */
        beginArrayHandler () {
          return '';
        }
        /**
         * @returns {string}
         */
        endArrayHandler () {
          return '';
        }
        /**
         * @returns {string}
         */
        arrayKeyValueJoinerHandler () {
          return '';
        }
        /**
         * @returns {string}
         */
        keyHandler () {
          return '';
        }
        /**
         * @returns {string}
         */
        stringHandler () {
          return '';
        }
        /**
         * @returns {string}
         */
        numberHandler () {
          return '';
        }
      }
      const d = new MyDelegator({
        distinguishKeysValues: true, mode: 'JavaScript'
      });
      d.walkJSONObject({a: 1});
      d.walkJSONObject([1]);
    });
  }
);

describe('Coverage tests for SAJJ iterate overrides', function () {
  it('respects iterateArrays and iterateObjects', () => {
    const sajj = new SAJJ({iterateArrays: false, iterateObjects: false});
    assert.isFalse(sajj.iterateArrays);
    assert.isFalse(sajj.iterateObjects);
  });
});

describe('Coverage tests for SAJJ parObj array detection', function () {
  it('detects parent object as array', () => {
    /**
     *
     */
    class MySAJJ extends SAJJ {
      /**
       * @returns {string}
       */
      objectHandler () {
        return '';
      }
      /**
       * @returns {string}
       */
      beginHandler () {
        return '';
      }
      /**
       * @returns {string}
       */
      delegateHandlersByType () {
        return '';
      }
      /**
       * @returns {string}
       */
      endHandler () {
        return '';
      }
    }
    const sajj = new MySAJJ();
    sajj.walkJSONObject({}, []);
    assert.isTrue(true);
  });
});

describe('Coverage tests for _copyObject', function () {
  it('deep copies objects', () => {
    const obj = {a: {b: 1}};
    const copy = _copyObject(obj, true);
    assert.notStrictEqual(copy.a, obj.a);
    assert.strictEqual(copy.a.b, 1);
  });
});
