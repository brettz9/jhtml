var JHTML;

var jhtmlTests = {
    'basic test' (test) {
        test.expect(1);

        var expected = '<ol start="0" itemscope="" itemtype="http://brett-zamir.me/ns/microdata/json-as-html/2">'+
                        '<li>arrayItem1</li></ol>';
        var result = JHTML.toJHTMLString(['arrayItem1']);
        test.deepEqual(expected, result);
        test.done();
    }
};

if (typeof exports !== 'undefined') {
    JHTML = require('../jhtml');
    module.exports = jhtmlTests;
}
