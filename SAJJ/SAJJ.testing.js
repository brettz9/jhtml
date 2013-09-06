function write (txt) {'use strict';
    document.body.appendChild(document.createTextNode(txt));
    document.body.appendChild(document.createElement('br'));
}
function validate (txt) {'use strict';
    try {
        JSON.parse(txt);
    }
    catch(e) {
        write('error validating JSON:' + e);
        return;
    }
}
function validateAndWrite (txt) {'use strict';
    validate(txt);
    write(txt);
}
