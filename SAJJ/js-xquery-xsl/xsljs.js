/* 
Design goals:
1) able to instantiate for use as template group
2) Easy to read and create by hand
3) Expressiveness of XSL
4) Work with JSON, HTML strings, DOM, or other desired input and output types (even create JS objects with methods)
5) Work with JSON, strings, numbers, DOM, or other structures, applying matches (e.g., as regexes for each string line or JSONPath, CSS selectors, etc.)
6) Able to call templates independently to start at any context or function for dynamic JS template needs (as well
as whole document transforms)

//Todos: Do same for Schematron-like validation and XQuery? Entities passed in as global?

// Not constrained as with Knockout.js to utilize multiple syntaxes

What if your designers weren't so clueless on JavaScript because they had to use it every day?

Discuss relative merits of "declarative" as far as XSL vs. JS. Usually think of limited vocabulary, secure, not requiring tracking implementation details (e.g., for (var i; i < len; i++))

Related work: 
1) XSL
2) XUL (Recursive) Templates: https://developer.mozilla.org/en-US/docs/XUL/Template_Guide/Using_Recursive_Templates
3) XBL

XBL as XJSON (implement specific XUL)

*/

// JSON equivalent (e.g., matching strings?), or is that just SAJJ? (or XJSON using real SAX API)

// Use CoffeeScript to avoid function() and return?

/*
Syntax approaches (in order of desirability):

1) Support following syntax: ' /  mode=Hello priority=5 name=Root'; 
    clear, compatible with prototype though not perfectly structured
2) Clear and structured but not compatibility with prototype
'/' : {
    mode: 'something', 
    priority: 7, 
    template: function () {
    }
}
3) Compatible with prototype but not clear or well structured
Order precedence of template rules, treating '$' as named; then store so can be accessed by applyTemplates
mode ($m_)
priority (precede matching by number or ${number} or $p{number}_?)
name ($n_)

*/

function ProcessTemplates (ts) {
    this.templates = ts;
    this.templateParams = {};
    var unsortedMatches = [];
    for (var template in ts) { // Don't filter with hasOwnProperty() as may wish to inherit
        var matchPattern = template;
        if (template.charAt(0) === '$') {
            // We could also disallow if one of reserved properties or functions like $applyTemplates()
            continue;
        }
        if (template.match(/^\s/)) { // ' /  mode=Hello priority=5 name=Root'
            var pattern = template.match(/\s*(\S*)\s*(.*)/);
            var params = pattern[2].split(/\s+/);
            matchPattern = pattern[1];
            for (var i=0, pl = params.length; i < pl; i++) {
                var keyValuePair = params[i].split('=');
                if (!this.templateParams[matchPattern]) {
                    this.templateParams[matchPattern] = {};
                }
                if (keyValuePair[1].match(/^\d+$/)) {
                    keyValuePair[1] = parseInt(keyValuePair[1], 10);
                }
                this.templateParams[matchPattern][keyValuePair[0]] = keyValuePair[1]; // {'/':{mode:'Hello',priority:5,name:'Root'}}
            }
        }
        unsortedMatches.push(matchPattern);
        
        
        var treeWalker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_ELEMENT,
            {
                acceptNode: function (node) {
                    // Check node matches here to route to templates
                    
                    return NodeFilter.FILTER_ACCEPT;
                }
            },
            false
        );
        while (treeWalker.nextNode()) {
            treeWalker.currentNode; // use it
        }
    }
    ts.$apply = function () {
        
    };
    ts.$call = function () { // Call templates by name (although one could directly call templates, this allows naming of templates along with other parameters)
        
    };
}

var jsonHTMLTemplates = {
    '/' : function ($ctx, $this) { // Pass in 'that'-like obj reference as 2nd argument for convenience 
                               //    in working within functions
        return ['html', [
                    ['head'], 
                    ['body', 
                        [
                            $this.$call('$customTemplate', 'http://example.com', 'Sample link'),
                            $this.$forEach('.someClass', function (node) {
                                return ['b', [node]];
                            }) +
                            $this.$applyTemplates($ctx)
                        ]
                    ]
               ]];
    },
    ' p mode=Hello priority=5 name=Special_pars' : function ($ctx) {
        return '';
    },
    i : function ($ctx) {
        return ['em', $ctx.children()];
    },
    $customTemplate : function (param1, param2) {
        return ['a', {href:param1}, [param2]];
    }
};

var htmlStringTemplates = {
    '/' : function ($ctx) {
        return '<html><body>'+
            this.$customTemplate('http://example.com', 'Sample link') +
            $X.forEach('.someClass', function (node) {
                // Finds nodes for selector, passes to function, and builds string
                return '<b>' + node + '</b>';
            }) +
            this.$applyTemplates($ctx) + // $ctx arg necessary?
        '</body></html>';
    },
    p : function ($ctx) {
        return '<p class="special">' + string($ctx) + '</p>';
    },
    /*
    div : function ($ctx) // Shortened syntax in JS1.8 for readability
        '<p class="special">' + string($ctx) + '</p>',
    */
    i : function ($ctx) {
        return '<em>' + $ctx.children().html() + '</em>';
    },
    $customTemplate : function (param1, param2) {
        return '<a href="' + param1 '">' +  param2 + '</a>';
    }
};
