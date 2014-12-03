/*
Design requirements
1) Support all of FLWOR
2) Allow hierarchically evaluated but sequentially nested
3) Synchronous or asynchronous loading of URLs?

4) Reference to JSXQueryParser code?

5) Shortcoming: inability of xqueryjs to represent the recursive possibilities of XQueryX or XSL, so make (hopefully easier!) version of XQueryX-as-E()



collection() argument with Mongodb?

*/

// Note: Need function to get variables (unless used some string syntax)

$let('myUls', function ($) {
    return $('ul.myClass', 'http://www.example.com');
}).
$for('ul', function ($) {
    return $('ul.anotherClass');
}).
    $for('li', function ($) {
        return $('li.anotherClass');
    }).
    $let('myLis', function ($) {
        return $('li', this.$myUls);
    }).
    $let('links', 'a'). // 2nd argument string as shorthand for function () {return $('a');}
    $where(function (liWhereMethod) { // Long-hand form (but better to avoid adding too much logic in here)
        return liWhereMethod($('*:contains("hello")', this.$links));
    }).
    $orderBy(function () {
        return [this.$links.children('em'), 'ASC'];
    }).
    $return(function () {
        return $('div', [this.$li, this.$myLis]);
    });


// Other possible approach (if iteration predictable order, could use regular objects instead of array of functions, but ECMAScript does not require for-in iteration order to be same as creation order)
var xqueryTemplates = [
    function $for () {
    
    },
    function $let () {
    
    },
    function $for2 () {
    
    }
];