/* globals CSS -- Polyfill */
import {assert} from 'chai';
import {JSDOM} from 'jsdom';
import * as JHTML from '../src/jhtml.js';
import 'css.escape';

describe('`JHTML` tests', function () {
  beforeEach(() => {
    const {window} = new JSDOM();
    JHTML.setWindow(window);
    // @ts-ignore Ok
    this.window = window;
  });
  it('basic test', () => {
    const expected = '<ol start="0" itemscope="" itemtype="http://brett-zamir.me/ns/microdata/json-as-html/2">' +
            '<li>arrayItem1</li></ol>';
    const result = JHTML.toJHTMLString(['arrayItem1']);
    assert.deepEqual(result, expected);
  });

  it('basic test (null)', () => {
    const expected = '<i itemscope="" itemtype="http://brett-zamir.me/ns/microdata/json-as-html/2">' +
            'null</i>';
    const result = JHTML.toJHTMLString(null);
    assert.deepEqual(result, expected);
  });

  it('basic test (string)', () => {
    const expected = '<span itemscope="" itemtype="http://brett-zamir.me/ns/microdata/json-as-html/2">' +
            'a string</span>';
    const result = JHTML.toJHTMLString('a string');
    assert.deepEqual(result, expected);
  });

  it('basic test (boolean)', () => {
    const expected = '<i itemscope="" itemtype="http://brett-zamir.me/ns/microdata/json-as-html/2">' +
            'false</i>';
    const result = JHTML.toJHTMLString(false);
    assert.deepEqual(result, expected);
  });

  it('basic test (number)', () => {
    const expected = '<i itemscope="" itemtype="http://brett-zamir.me/ns/microdata/json-as-html/2">' +
            '123.4</i>';
    const result = JHTML.toJHTMLString(123.4);
    assert.deepEqual(result, expected);
  });

  it('mixed test', () => {
    const expected = '<dl itemscope="" itemtype="http://brett-zamir.me/ns/microdata/json-as-html/2">' +
      '<dt>key</dt><dd><ol start="0"><li>arrayItem1</li></ol></dd>' +
      '<dt>keyArrayNull</dt><dd><ol start="0"><li><i>null</i></li></ol></dd>' +
      '<dt>keyNull</dt><dd><i>null</i></dd>' +
      '<dt>keyTrue</dt><dd><i>true</i></dd>' +
      '<dt>keyFalse</dt><dd><i>false</i></dd>' +
      '<dt>keyNumeric</dt><dd><i>55.6</i></dd>' +
      '<dt>keyString</dt><dd>abc</dd>' +
      '<dt>keyObject</dt><dd><dl></dl></dd></dl>';
    const jhtmlObject = {
      key: ['arrayItem1'],
      keyArrayNull: [null],
      keyNull: null,
      keyTrue: true,
      keyFalse: false,
      keyNumeric: 55.6,
      keyString: 'abc',
      keyObject: {}
    };
    const result = JHTML.toJHTMLString(jhtmlObject);
    assert.deepEqual(result, expected);

    const element = JHTML.toJHTMLDOM(jhtmlObject);

    assert.deepEqual(
      element.outerHTML,
      expected
    );

    assert.deepEqual(
      JHTML.toJSONString(element),
      JSON.stringify(jhtmlObject)
    );

    assert.deepEqual(
      JHTML.toJSONObject(element),
      jhtmlObject
    );
  });

  it('mixed test (JS Mode)', () => {
    const expected = '<dl itemscope="" itemtype="http://brett-zamir.me/ns/microdata/json-as-html/2">' +
      '<dt>key</dt><dd><ol start="0"><li>arrayItem1</li></ol></dd>' +
      '<dt>keyNull</dt><dd><i>null</i></dd>' +
      '<dt>keyTrue</dt><dd><i>true</i></dd>' +
      '<dt>keyFalse</dt><dd><i>false</i></dd>' +
      '<dt>keyNumeric</dt><dd><i>55.6</i></dd>' +
      '<dt>keyString</dt><dd>abc</dd>' +
      '<dt>keyNonfinite</dt><dd><i>Infinity</i></dd>' +
      '<dt>keyUndefined</dt><dd><i>undefined</i></dd>' +
      '<dt>keyFunction</dt><dd><i>function keyFunction () {}</i></dd>' +
      '<dt>keyObject</dt><dd><dl></dl></dd></dl>';
    const jhtmlObject = {
      key: ['arrayItem1'],
      keyNull: null,
      keyTrue: true,
      keyFalse: false,
      keyNumeric: 55.6,
      keyString: 'abc',
      keyNonfinite: Infinity,
      keyUndefined: undefined,
      keyFunction: function keyFunction () {},
      keyObject: {}
    };
    const result = JHTML.toJHTMLString(jhtmlObject, {
      mode: 'JavaScript'
    });
    assert.deepEqual(result, expected);

    const element = JHTML.toJHTMLDOM(jhtmlObject, {
      mode: 'JavaScript'
    });

    assert.deepEqual(
      element.outerHTML,
      expected
    );
  });

  it('should throw with non-HTML element', () => {
    assert.throws(() => {
      // @ts-ignore Sometime TS problem with window
      JHTML.toJSONString(this.window.document.createElement('br'));
    }, 'Unexpected element');
  });

  it('should throw with li possessing more than one child', () => {
    const elemStr = '<dl itemscope="" itemtype="http://brett-zamir.me/ns/microdata/json-as-html/2">' +
      '<dt>key</dt><dd>' +
      '<ol start="0"><li><i>null</i><i>null</i></li></ol></dd>' +
      '</dl>';
    const elem = /** @type {Element} */ (
      // @ts-ignore Sometime TS problem with window
      new this.window.DOMParser().parseFromString(elemStr, 'text/html').
        body.firstElementChild
    );
    assert.throws(
      () => {
        JHTML.toJSONString(elem);
      },
      '<li> should not have more than a single ' +
        'element child (<ol>, <dl>, or <i>)'
    );
  });

  it('should throw with ol possessing non-li child', () => {
    const elemStr = '<dl itemscope="" itemtype="http://brett-zamir.me/ns/microdata/json-as-html/2">' +
      '<dt>key</dt><dd>' +
      '<ol start="0"><br></ol></dd>' +
      '</dl>';
    const elem = /** @type {Element} */ (
      // @ts-ignore Sometime TS problem with window
      new this.window.DOMParser().parseFromString(elemStr, 'text/html').
        body.firstElementChild
    );
    assert.throws(
      () => {
        JHTML.toJSONString(elem);
      },
      'Unexpected child of <ol> element: br'
    );
  });

  it('should throw with ol not possessing start attribute', () => {
    const elemStr = '<dl itemscope="" itemtype="http://brett-zamir.me/ns/microdata/json-as-html/2">' +
      '<dt>key</dt><dd>' +
      '<ol start="1"><li><i>null</i></li></ol></dd>' +
      '</dl>';
    const elem = /** @type {Element} */ (
      // @ts-ignore Sometime TS problem with window
      new this.window.DOMParser().parseFromString(elemStr, 'text/html').
        body.firstElementChild
    );
    assert.throws(
      () => {
        JHTML.toJSONString(elem);
      },
      'For the sake of readability, <ol> must include a ' +
        'start="0" attribute within JHTML.'
    );
  });

  it('should throw without a final dd', () => {
    const elemStr = '<dl itemscope="" itemtype="http://brett-zamir.me/ns/microdata/json-as-html/2">' +
      '<dt>key</dt>' +
      '</dl>';
    const elem = /** @type {Element} */ (
      // @ts-ignore Sometime TS problem with window
      new this.window.DOMParser().parseFromString(elemStr, 'text/html').
        body.firstElementChild
    );
    assert.throws(
      () => {
        JHTML.toJSONString(elem);
      },
      'Ended a definition list without a final <dd> to ' +
        'match the previous <dt>.'
    );
  });

  it('should throw with dd possessing more than one child', () => {
    const elemStr = '<dl itemscope="" itemtype="http://brett-zamir.me/ns/microdata/json-as-html/2">' +
      '<dt>key</dt><dd><i>null</i>' +
      '<ol start="0"><li><i>null</i></li></ol></dd>' +
      '</dl>';
    const elem = /** @type {Element} */ (
      // @ts-ignore Sometime TS problem with window
      new this.window.DOMParser().parseFromString(elemStr, 'text/html').
        body.firstElementChild
    );
    assert.throws(
      () => {
        JHTML.toJSONString(elem);
      },
      '<dd> should not have more than one element ' +
        'child (<ol>, <dl>, or <i>)'
    );
  });

  it('should throw with dt possessing a child element', () => {
    const elemStr = '<dl itemscope="" itemtype="http://brett-zamir.me/ns/microdata/json-as-html/2">' +
      '<dt><i>key</i></dt><dd>' +
      '<ol start="0"><li><i>null</i></li></ol></dd>' +
      '</dl>';
    const elem = /** @type {Element} */ (
      // @ts-ignore Sometime TS problem with window
      new this.window.DOMParser().parseFromString(elemStr, 'text/html').
        body.firstElementChild
    );
    assert.throws(
      () => {
        JHTML.toJSONString(elem);
      },
      '<dt> should not have any children'
    );
  });

  it('should throw with dl starting with a non-dt element', () => {
    const elemStr = '<dl itemscope="" itemtype="http://brett-zamir.me/ns/microdata/json-as-html/2">' +
      '<dd>' +
      '<ol start="0"><li><i>null</i></li></ol></dd>' +
      '</dl>';
    const elem = /** @type {Element} */ (
      // @ts-ignore Sometime TS problem with window
      new this.window.DOMParser().parseFromString(elemStr, 'text/html').
        body.firstElementChild
    );
    assert.throws(
      () => {
        JHTML.toJSONString(elem);
      },
      'Unexpected element dd encountered where dt expected'
    );
  });

  it('should throw with a span after dt', () => {
    const elemStr = '<dl itemscope="" itemtype="http://brett-zamir.me/ns/microdata/json-as-html/2">' +
      '<dt>key</dt><dd>' +
      '<span>No good here</span>' +
      '</dl>';
    const elem = /** @type {Element} */ (
      // @ts-ignore Sometime TS problem with window
      new this.window.DOMParser().parseFromString(elemStr, 'text/html').
        body.firstElementChild
    );
    assert.throws(
      () => {
        JHTML.toJSONString(elem);
      },
      'A <span> element is not allowed in this context'
    );
  });

  it('should throw with non-JSON in JSON mode', () => {
    const elemStr = '<dl itemscope="" itemtype="http://brett-zamir.me/ns/microdata/json-as-html/2">' +
      '<dt>key</dt><dd>' +
      '<ol start="0"><li><i>Infinity</i></li></ol></dd>' +
      '</dl>';
    const elem = /** @type {Element} */ (
      // @ts-ignore Sometime TS problem with window
      new this.window.DOMParser().parseFromString(elemStr, 'text/html').
        body.firstElementChild
    );
    assert.throws(
      () => {
        JHTML.toJSONString(elem, {
          mode: 'JSON'
        });
      },
      'The value type (Infinity) cannot be used in JSON mode'
    );
  });

  it('should not throw with non-JSON in JavaScript mode', () => {
    const elemStr = '<dl itemscope="" itemtype="http://brett-zamir.me/ns/microdata/json-as-html/2">' +
      '<dt>key</dt><dd>' +
      '<ol start="0"><li><i>Infinity</i></li></ol></dd>' +
      '<dt>key2</dt><dd>' +
      '<i>function a () {}</i></dd>' +
      '<dt>key3</dt><dd>' +
      '<i>Mon 1999</i></dd>' +
      '<dt>key4</dt><dd>' +
      '<i>/abc/guy</i></dd>' +
      '<dt>key5</dt><dd>' +
      '<i>-Infinity</i></dd>' +
      '<dt>key6</dt><dd>' +
      '<i>NaN</i></dd>' +
      '<dt>key7</dt><dd>' +
      '<i>undefined</i></dd>' +
      '<dt>key8</dt><dd>' +
      '<i>1234n</i></dd>' +
      '<dt>key9</dt><dd>' +
      '<i>Symbol(\'abc\')</i></dd>' +
      '<dt>key10</dt><dd>' +
      '<i>/abc/</i></dd>' +
      '</dl>';
    const elem = /** @type {Element} */ (
      // @ts-ignore Sometime TS problem with window
      new this.window.DOMParser().parseFromString(elemStr, 'text/html').
        body.firstElementChild
    );
    assert.doesNotThrow(
      () => {
        JHTML.toJSONString(elem, {
          mode: 'JavaScript'
        });
      }
    );
  });

  it('should not throw with top-level span', () => {
    const elemStr = '<span itemscope="" itemtype="http://brett-zamir.me/ns/microdata/json-as-html/2">' +
      'Hello</span>';
    const elem = /** @type {Element} */ (
      // @ts-ignore Sometime TS problem with window
      new this.window.DOMParser().parseFromString(elemStr, 'text/html').
        body.firstElementChild
    );
    assert.doesNotThrow(
      () => {
        JHTML.toJSONString(elem);
      }
    );
  });

  it('should throw with bad non-JSON in JavaScript mode', () => {
    const elemStr = '<dl itemscope="" itemtype="http://brett-zamir.me/ns/microdata/json-as-html/2">' +
      '<dt>key</dt><dd>' +
      '<i>abcdefg</i></dd>' +
      '</dl>';
    const elem = /** @type {Element} */ (
      // @ts-ignore Sometime TS problem with window
      new this.window.DOMParser().parseFromString(elemStr, 'text/html').
        body.firstElementChild
    );
    assert.throws(
      () => {
        JHTML.toJSONString(elem, {
          mode: 'JavaScript'
        });
      },
      'Unrecognized type'
    );
  });

  it('should throw with text directly inside dl', () => {
    const elemStr = '<dl itemscope="" itemtype="http://brett-zamir.me/ns/microdata/json-as-html/2">' +
      'key' +
      '</dl>';
    const elem = /** @type {Element} */ (
      // @ts-ignore Sometime TS problem with window
      new this.window.DOMParser().parseFromString(elemStr, 'text/html').
        body.firstElementChild
    );
    assert.throws(
      () => {
        JHTML.toJSONString(elem);
      },
      'Non-whitespace text or CDATA nodes are not allowed directly within <dl>'
    );
  });

  it('should not throw with comment nodes', () => {
    const elemStr = '<dl itemscope="" itemtype="http://brett-zamir.me/ns/microdata/json-as-html/2">' +
      '<!-- Harmless comment -->' +
      '<dt>key</dt><dd>' +
      '<ol start="0"><!-- Harmless comment --><li><i>null</i></li></ol></dd>' +
      '</dl>';
    const elem = /** @type {Element} */ (
      // @ts-ignore Sometime TS problem with window
      new this.window.DOMParser().parseFromString(elemStr, 'text/html').
        body.firstElementChild
    );
    assert.doesNotThrow(
      () => {
        JHTML.toJSONString(elem);
      }
    );
  });

  it('should work with array of elements', () => {
    const elemStr = '<dl itemscope="" itemtype="http://brett-zamir.me/ns/microdata/json-as-html/2">' +
      '<!-- Harmless comment -->' +
      '<dt>key</dt><dd>' +
      '<ol start="0"><!-- Harmless comment --><li><i>null</i></li></ol></dd>' +
      '</dl>';
    const elem1 = /** @type {Element} */ (
      // @ts-ignore Sometime TS problem with window
      new this.window.DOMParser().parseFromString(elemStr, 'text/html').
        body.firstElementChild
    );
    const elem2 = /** @type {Element} */ (
      // @ts-ignore Sometime TS problem with window
      new this.window.DOMParser().parseFromString(elemStr, 'text/html').
        body.firstElementChild
    );
    assert.doesNotThrow(
      () => {
        JHTML.toJSONString([elem1, elem2]);
      }
    );
  });

  describe('toJHTMLDOM with primitives', () => {
    it('should handle null primitive', () => {
      const expected = '<i itemscope="" itemtype="http://brett-zamir.me/ns/microdata/json-as-html/2">null</i>';
      const element = JHTML.toJHTMLDOM(null);
      assert.deepEqual(element.outerHTML, expected);
    });

    it('should handle boolean primitives', () => {
      const expectedTrue = '<i itemscope="" itemtype="http://brett-zamir.me/ns/microdata/json-as-html/2">true</i>';
      const elementTrue = JHTML.toJHTMLDOM(true);
      assert.deepEqual(elementTrue.outerHTML, expectedTrue);

      const expectedFalse = '<i itemscope="" itemtype="http://brett-zamir.me/ns/microdata/json-as-html/2">false</i>';
      const elementFalse = JHTML.toJHTMLDOM(false);
      assert.deepEqual(elementFalse.outerHTML, expectedFalse);
    });

    it('should handle number primitives', () => {
      const expected = '<i itemscope="" itemtype="http://brett-zamir.me/ns/microdata/json-as-html/2">123.45</i>';
      const element = JHTML.toJHTMLDOM(123.45);
      assert.deepEqual(element.outerHTML, expected);
    });

    it('should handle string primitives', () => {
      const expected = '<span itemscope="" itemtype="http://brett-zamir.me/ns/microdata/json-as-html/2">hello world</span>';
      const element = JHTML.toJHTMLDOM('hello world');
      assert.deepEqual(element.outerHTML, expected);
    });

    it('should handle undefined in JavaScript mode', () => {
      const expected = '<i itemscope="" itemtype="http://brett-zamir.me/ns/microdata/json-as-html/2">undefined</i>';
      const element = JHTML.toJHTMLDOM(undefined, {mode: 'JavaScript'});
      assert.deepEqual(element.outerHTML, expected);
    });

    it('should handle Infinity in JavaScript mode', () => {
      const expected = '<i itemscope="" itemtype="http://brett-zamir.me/ns/microdata/json-as-html/2">Infinity</i>';
      const element = JHTML.toJHTMLDOM(Infinity, {mode: 'JavaScript'});
      assert.deepEqual(element.outerHTML, expected);
    });

    it('should handle -Infinity in JavaScript mode', () => {
      const expected = '<i itemscope="" itemtype="http://brett-zamir.me/ns/microdata/json-as-html/2">-Infinity</i>';
      const element = JHTML.toJHTMLDOM(-Infinity, {mode: 'JavaScript'});
      assert.deepEqual(element.outerHTML, expected);
    });

    it('should handle NaN in JavaScript mode', () => {
      const expected = '<i itemscope="" itemtype="http://brett-zamir.me/ns/microdata/json-as-html/2">NaN</i>';
      const element = JHTML.toJHTMLDOM(Number.NaN, {mode: 'JavaScript'});
      assert.deepEqual(element.outerHTML, expected);
    });

    it('should throw for undefined without JavaScript mode', () => {
      assert.throws(
        () => {
          JHTML.toJHTMLDOM(undefined);
        },
        'Values of type "undefined" are only allowed in JavaScript ' +
          'mode, not JSON.'
      );
    });

    it('should handle function in JavaScript mode', () => {
      /**
       * @returns {number}
       */
      // eslint-disable-next-line @stylistic/brace-style -- Serialized
      function testFunc () { return 42; }
      const element = JHTML.toJHTMLDOM(testFunc, {mode: 'JavaScript'});
      assert.match(
        element.outerHTML,
        /<i itemscope="" itemtype="http:\/\/brett-zamir\.me\/ns\/microdata\/json-as-html\/2">function testFunc \(\) \{ return 42; \}<\/i>/v
      );
    });
  });

  describe('toJHTMLString with primitives', () => {
    it('should handle null primitive', () => {
      const expected = '<i itemscope="" itemtype="http://brett-zamir.me/ns/microdata/json-as-html/2">null</i>';
      const result = JHTML.toJHTMLString(null);
      assert.deepEqual(result, expected);
    });

    it('should handle boolean primitives', () => {
      const expectedTrue = '<i itemscope="" itemtype="http://brett-zamir.me/ns/microdata/json-as-html/2">true</i>';
      const resultTrue = JHTML.toJHTMLString(true);
      assert.deepEqual(resultTrue, expectedTrue);

      const expectedFalse = '<i itemscope="" itemtype="http://brett-zamir.me/ns/microdata/json-as-html/2">false</i>';
      const resultFalse = JHTML.toJHTMLString(false);
      assert.deepEqual(resultFalse, expectedFalse);
    });

    it('should handle number primitives', () => {
      const expected = '<i itemscope="" itemtype="http://brett-zamir.me/ns/microdata/json-as-html/2">123.45</i>';
      const result = JHTML.toJHTMLString(123.45);
      assert.deepEqual(result, expected);
    });

    it('should handle string primitives', () => {
      const expected = '<span itemscope="" itemtype="http://brett-zamir.me/ns/microdata/json-as-html/2">hello world</span>';
      const result = JHTML.toJHTMLString('hello world');
      assert.deepEqual(result, expected);
    });

    it('should handle undefined in JavaScript mode', () => {
      const expected = '<i itemscope="" itemtype="http://brett-zamir.me/ns/microdata/json-as-html/2">undefined</i>';
      const result = JHTML.toJHTMLString(undefined, {mode: 'JavaScript'});
      assert.deepEqual(result, expected);
    });

    it('should handle Infinity in JavaScript mode', () => {
      const expected = '<i itemscope="" itemtype="http://brett-zamir.me/ns/microdata/json-as-html/2">Infinity</i>';
      const result = JHTML.toJHTMLString(Infinity, {mode: 'JavaScript'});
      assert.deepEqual(result, expected);
    });

    it('should handle -Infinity in JavaScript mode', () => {
      const expected = '<i itemscope="" itemtype="http://brett-zamir.me/ns/microdata/json-as-html/2">-Infinity</i>';
      const result = JHTML.toJHTMLString(-Infinity, {mode: 'JavaScript'});
      assert.deepEqual(result, expected);
    });

    it('should handle NaN in JavaScript mode', () => {
      const expected = '<i itemscope="" itemtype="http://brett-zamir.me/ns/microdata/json-as-html/2">NaN</i>';
      const result = JHTML.toJHTMLString(Number.NaN, {mode: 'JavaScript'});
      assert.deepEqual(result, expected);
    });

    it('should throw for undefined without JavaScript mode', () => {
      assert.throws(
        () => {
          JHTML.toJHTMLString(undefined);
        },
        'Values of type "undefined" are only allowed in ' +
          'JavaScript mode, not JSON.'
      );
    });

    it('should handle function in JavaScript mode', () => {
      /**
       * @returns {number}
       */
      // eslint-disable-next-line @stylistic/brace-style -- Serialized
      function testFunc () { return 42; }
      const result = JHTML.toJHTMLString(testFunc, {mode: 'JavaScript'});
      assert.match(
        result,
        /<i itemscope="" itemtype="http:\/\/brett-zamir\.me\/ns\/microdata\/json-as-html\/2">function testFunc \(\) \{ return 42; \}<\/i>/v
      );
    });
  });
});

describe('`JHTML` tests with prepopulated HTML', () => {
  beforeEach(function () {
    const elemStr = '<dl itemscope="" itemtype="http://brett-zamir.me/ns/microdata/json-as-html/2">' +
      '<dt>key</dt><dd>' +
      '<ol start="0"><li><i>null</i></li></ol></dd>' +
      '</dl>';
    const {window} = new JSDOM(elemStr);
    window.CSS = CSS;
    JHTML.setWindow(window);
    // @ts-ignore Ok
    this.window = window;
  });

  it('should find itemtype element by default if none provided', () => {
    assert.doesNotThrow(
      () => {
        JHTML.toJSONObject();
      }
    );

    assert.doesNotThrow(
      () => {
        JHTML.toJSONString();
      }
    );
  });
});
