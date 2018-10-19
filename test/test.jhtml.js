describe('JHTML tests', function () {
  it('basic test', () => {
    const expected = '<ol start="0" itemscope="" itemtype="http://brett-zamir.me/ns/microdata/json-as-html/2">' +
            '<li>arrayItem1</li></ol>';
    const result = JHTML.toJHTMLString(['arrayItem1']);
    assert.deepEqual(expected, result);
  });
});
