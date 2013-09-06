function write (txt) {'use strict';
    document.body.appendChild(document.createTextNode(txt));
    document.body.appendChild(document.createElement('br'));
}
function validate (txt) {'use strict';
    try {
        var xml = new DOMParser().parseFromString(txt, 'application/xml');
        // Should be well-formed XML (as well as HTML)
        if (xml.documentElement.nodeName === 'parsererror') {
            throw xml.documentElement.textContent;
        }
        if (new DOMParser().parseFromString(txt, 'text/html').body.firstChild.nodeType  !== 1) {
            throw 'An element is expected at root';
        }
    }
    catch(e) {
        write('error validating DOM:' + e);
        return;
    }
}
function validateAndWrite (txt) {'use strict';
    validate(txt);
    write(txt);
}
