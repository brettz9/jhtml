# JHTML

The JHTML format is a strict subset of HTML used to encode arbitrary JSON (or full JavaScript objects) within HTML. This library seeks to provide conversions while simultaneously validating the indicated JHTML structure(s).

Possible use cases include:

1. Hierarchical data storage in a faithful, readily portable and readily viewable format.
1. Allow building of data files within (schema-constrained) WYSIWYG editors
1. Transforming JSON to XHTML for applying XSL, running XPath, CSS Selector, or DOM queries, etc.

JHTML ought to be round-trippable with canonical JSON except in the case when converting *from* object-containing JSON to JHTML when the ECMAScript/JSON interpreter does not iterate the properties in definition order (as ECMAScript interpreters are not obliged to do).

Note that when script tags of custom type are available (e.g., &lt;script type="application/json"&gt;) it is probably easier to use them with JSON directly.

For representing XML as HTML, see [hxml](https://github.com/brettz9/hxml).

See a **[demo here](http://brettz9.github.io/jhtml/)**.

# Rules

Currently, comment (and processing instructions) and whitespace text nodes are allowed throughout, but any elements must be constrained to the expected types. For canonicalization, attributes beyond those explicitly allowed should not be present. Microdata might not care about hierarchy, but this specification adds such constraints.

1. A top-level JSON string primitive will be encoded by the presence of `<span>` whose contents will be stringified into JSON upon serialization.
1. Other JSON primitives (`null`, boolean, or number) will be encoded within `<i>`, whether at the top-level or elsewhere, with the exact type determined by the contained value (i.e., "null", "true", "false", and any of the allowable formats for a JSON number are the possible values).
1. JSON arrays (in whatever context) will be encoded as `<ol start="0">` whose individual child items (if any) will be represented by `<li>`. Pure text content will indicate a string, whereas a single `<i>` child will indicate `null` or a boolean or number type (as per the previous rule). A single `<dl>` or `<ol start="0">` child will indicate a child object or array respectively (see the next rule for object rules).
1. JSON objects (in whatever context) will be encoded as `<dl>` whose individual child items (if any) will be represented by alternating `<dt>`/`<dd>` pairs (only single instances are allowed for each within a pair). `<dt>` will represent the keys of the object, whereas `<dd>` will represent the values. Pure text content within `<dd>` will indicate a string, whereas a single `<i>` child of `<dd>` will indicate `null` or a boolean or number type (as per the second rule). A single `<dl>` or `<ol>` child will indicate a child object or array respectively (see the previous rule for array rules).
1. The top-level element SHOULD include an XHTML namespace declaration (` xmlns="http://www.w3.org/1999/xhtml"`) for polyglot compatibility and MUST contain the attributes, `itemscope="" itemtype="http://brett-zamir.me/ns/microdata/json-as-html/2"`.

# Design considerations

1. Be as simple as possible while distinguishing types and be round-trippable (when using the valid subset of HTML) without picking up false positives (HTML markup which was not intended to represent JSON).
1. Use mark-up which is as semantically clear as possible (e.g., ordered list well represents the concept of arrays, etc.).
1. Be unambiguous in markup choice (e.g., while [json2html](https://github.com/tifroz/json2html) offers display of "tabular" arrays in a manner distinct from other nested arrays, this would add ambiguity and complexity for a round-trippable format; we instead stick to always requiring nested ordered lists to represent tables).
1. Minimize use of invisible mark-up which, if say used in a WYSIWYG editor would not be readily discovered and thus could suffer from undetected maintenance problems).
1. Distinguish types visually without need for CSS: Requiring `null`, boolean, and numbers (if not object keys) to be within `<i>` visually distinguishes them from strings of the same value. Although this adds some verbosity, and it would technically be possible with CSS to overcome this need, without it, bare HTML would not allow distinguishment between primitive types. Should ideally allow them to be distinguishable from each other as well, though this is not provided for in the current spec.
1. It should potentially be able to accommodate other JavaScript objects (e.g., `undefined`, function (via `toString()`, non-finite numbers, date objects, and regular expression objects ought to appear within &lt;i&gt; without ambiguity).
1. Visually distinguish depth of nesting.

# Node usage

```shell
npm install jhtml
```

```js
var JHTML = require('jhtml');
```

# Brower usage

```html
<script src="jhtml.js"></script>
```

```javascript
// The following code will look for all elements within the document
// belonging to the JHTML itemtype namespace (currently:
// http://brett-zamir.me/ns/microdata/json-as-html/1 ).
// Alternatively, one may supply the items as the first (and only)
// argument (there is no validation for namespace currently
// in such a case).
// These return a JSON array if multiple elements are found or a single object otherwise
JHTML.toJSONObject(); // returns a JSON object
JHTML.toJSONString(); // returns a JSON string
```

Note that if you wish to store the JHTML without displaying it,
you can enclose it within a `<script type="jhtml">` element and
obtain the content via script (though you could also obtain
regular JSON in a similar manner or simply use JSON within
your JavaScript). Do not merely add the style `display:none` as
this will still cause your JHTML content to display for users
who have disabled CSS.

If you intend to support older browsers, you will need polyfills for:

1. `Array.prototype.map`
1. `Array.prototype.reduce`
1. `Element.prototype.textContent`
1. `Element.prototype.itemProp`
1. `HTMLDocument.prototype.getItems`
1. `Element.firstElementChild`

# Possible future todos

1. Reimplement JHTML.toJHTMLDOM() using [JTLT](https://github.com/brettz9/jtlt/) (when ready))
1. Reimplement JHTML.toJHTMLString() using [JTLT](https://github.com/brettz9/jtlt/) (when ready))
1. Define as ECMAScript 6 Module with polyfill plug-in
1. Allow equivalents to JSON.parse's reviver or JSON.stringify's replacer and space arguments?

# Possible future spec additions

The following might perhaps be allowed in conjunction with [JSON Schema](http://json-schema.org/), although I would also like to allow optional encoding of non-JSON JavaScript objects as well.

1. This could be expanded to support types like: URL, Date, etc.
1. Support a special HTML-aware string type to allow arbitrary nested HTML where JSON strings are expected (which might be encapsulated say by a `<a>`). This could still convert to JSON, but as a string.
1. Could use itemid/itemref to encode linked references

# Possible future spec modifications

The following may loosen requirements, but may not be desirable as they would allow expansion of the size of JHTML files.

1. Loosen requirements to allow dropping the start attribute in `<ol start="0">`? For portable proper structural readability, however, this seems like it should stay, even though CSS can mimic the correct 0-indexed display.
1. Loosen requirements to allow `<span>` on string primitives (for parity with a string at the root) within object keys or object or array keys or values. Currently, the shortest possible expression is required behavior.
1. Allow `<table>` to be used in place of nested `<ol>` arrays especially when there are only two dimensions and the arrays are known to be of equal length at each level (any `<thead>` for visual purposes only but not converted to JSON?).

The following are possible tightening or other breaking changes:

1. Disallow comment and processing instruction nodes? Despite the precedent with JSON disallowing comments, I am partial to allowing comment nodes in JHTML, despite the burden on implementers, as it is extremely convenient to be able to include such information within data files. Of course, they will not be round-trippable with JSON (unless encoded as a legitimate part of the JSON object) since JSON disallows comments.
1. Require primitives to be within `<data>` elements (but the HTML spec currently requires a `value` attribute which would be redundant with the human-readable value).
1. Change the Microdata attributes on the root to "data-\*" attributes since the information is not necessarily semantic (and if it is, it is semantic to the specific JSON format). Although the "data-\*" attributes are supposed to only have meaning within the application (e.g., not to be interpreted in a special way by search engines perhaps), their use would not imply that tools could not parse them in a similar manner.
1. Move the `itemtype` properties to a container element such as `<a>` to avoid the need for an inconsistency with string requiring `<span>` at the top level.
1. For `null`, booleans, and numbers, change `<i>` to `<code>` (or optionally to `<code class="language-javascript">` as specifically allowed by the [spec](https://html.spec.whatwg.org/multipage/semantics.html#the-code-element:classes)) for
greater semantic accuracy (but at a cost of simplicity and slightly different presentation).
1. Allow styling hooks to allow distinguishing between `null`, booleans, and numbers (or `undefined`, non-finite numbers, and functions)

The following are other possible changes:

1. Change the itemtype namespace if standardized
1. Allow multiple `<dd>`'s if taken to mean array children? (Probably more confusing even if more succinct than requiring a child `<ol>`).
1. Anything else that comes up out of consultation with others (although I intend to change the namespace upon any breaking changes).

# Development

```shell
npm install

npm test
```

or, with `nodeunit` installed globally:

```shell
npm install

nodeunit test
```

For browser testing, open [test/test.html](test/test.html).

# Inspiration

JHTML was inspired by Netscape bookmark files as used when exporting bookmarks in Firefox. They brought to my attention that `<dl>` could be used to represent nestable key-value data hierarchies as also found in JSON objects.
