# JHTML

The JHTML format is a strict subset of HTML used to encode arbitrary JSON within HTML. This library seeks to provide conversions while simultaneously validating the indicated JHTML structure(s).

Possible use cases include:

1. Hierarchical data storage in a faithful, readily portable and readily viewable format.
1. Allow building of data files within (schema-constrained) WYSIWYG editors

JHTML ought to be round-trippable with canonical JSON except in the case when converting *from* object-containing JSON to JHTML when the ECMAScript/JSON interpreter does not iterate the properties in definition order (as ECMAScript interpreters are not obliged to do).

# Rules

Currently, comment (and processing instructions) and whitespace text nodes are allowed throughout, but any elements must be constrained to the expected types. For canonicalization, attributes beyond those explicitly allowed should not be present. Microdata might not care about hierarchy, but this specification adds such constraints.

1. A top-level JSON string primitive will be encoded by the presence of `<span>` without an `itemprop` attribute, and whose contents will be stringified into JSON upon serialization.
1. Other top-level JSON primitives (null, boolean, or number) will be encoded by `<span itemprop="{type}">` where `{type}` is the case-sensitive value of `null`, `boolean`, or `number`, and whose contents will be valid JSON.
1. JSON arrays (in whatever context) willl be encoded as `<ol start="0">` whose individual child items (if any) will be represented by `<li itemprop="{type}">` where `type` follows the same conventions as with top-level primitives except that the absence of an `itemprop` attribute along with a single `<dl>` or `<ol>` child will indicate a child object or array respectively (a string can still be indicated by the absence of an `itemprop` attribute if the `<li>` has no children).
1. JSON objects (in whatever context) will be encoded as `<dl>` whose individual child items (if any) will be represented by alternating `<dt>`/`<dd>` pairs (only single instances are allowed for each within a pair). `<dt>` will represent the keys of the object, whereas `<dd>` will represent the values. `<dd itemprop="{type}">` where `type` follows the same conventions as with top-level primitives except that the absence of an `itemprop` attribute along with a single `<dl>` or `<ol>` child will indicate a child object or array respectively (a string can still be indicated by the absence of an `itemprop` attribute if the `<dd>` has no children).

# Usage

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

If you intend to support older browsers, you will need polyfills for:

1. Array.prototype.map
1. Array.prototype.reduce
1. Element.prototype.textContent
1. Element.prototype.itemProp
1. HTMLDocument.prototype.getItems

# Possible future todos
1. Implement JHTML.toJHTMLDOM()
1. Implement JHTML.toJHTMLString()
1. Define as ECMAScript 6 Module with polyfill plug-in
1. Allow equivalents to JSON.parse's reviver or JSON.stringify's replacer and space arguments? 

# Possible future spec additions

The following might perhaps be allowed in conjunction with [JSON Schema](http://json-schema.org/), although I would also like to allow optional encoding of non-JSON JavaScript objects as well.

1. This could be expanded to support types like: undefined, function, URL, date, etc.
1. Support a special HTML-aware string type to allow arbitrary nested HTML where JSON strings are expected (which might be encapsulated say by a `<div itemprop="html">`). This could still convert to JSON, but as a string.
1. Could use itemid/itemref to encode linked references

# Possible future spec modifications

The following may loosen requirements, but may not be desirable as they would allow expansion of the size of JHTML files.

1. Loosen requirements to always use `<ol start="0">`? For portable proper structural readability, however, this seems like it should stay, even though CSS can mimic the correct 0-indexed display.
1. Loosen requirements to allow `<span>` on primitives within object keys or object or array keys or values. Currently, the shortest possible expression is required?
1. Loosen requirements to allow an explicit itemprop="string", itemprop="array", and/or itemprop="object"?
1. Require primitives to be within `<data>` elements (but the HTML spec currently requires a `value` attribute which would be redundant with the human-readable value so `<span>` is being used instead)

The following are possible tightening changes:
1. Disallow comment and processing instruction nodes? Despite the precedent with JSON disallowing comments, I am partial to allowing comment nodes in JHTML, despite the burden on implementers, as it is extremely convenient to be able to include such information within data files. Of course, they will not be round-trippable with JSON (unless encoded as a legitimate part of the JSON object) since JSON disallows comments.

The following are other possible changes:

1. Change the itemtype namespace
1. Allow multiple `<dd>`'s if taken to mean array children? (Probably more confusing even if more succinct than requiring a child `<ol>`)
1. Anything else that comes up out of consultation with others (although I intend to change the namespace upon any breaking changes)

# Inspiration

JHTML was inspired by Netscape bookmark files as used when exporting bookmarks in Firefox. They brought to my attention that `<dl>` could be used to represent nestable key-value data hierarchies as also found in JSON objects.
