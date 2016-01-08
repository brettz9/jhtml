/*global require, module*/
/*jslint vars:true*/
(function () {'use strict';

var JHTML = require('../jhtml'),
    testCase = require('nodeunit').testCase;


module.exports = testCase({
    'basic test': function (test) {
        test.expect(1);

        var expected = '';
        var result = JHTML.toJHTMLString(['arrayItem1']);

        test.deepEqual(expected, result);
        test.done();
    }
});

}());
