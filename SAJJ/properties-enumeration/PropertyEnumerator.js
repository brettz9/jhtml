(function () {

// Dependencies: Object.keys, Object.getOwnPropertyNames, Object.hasOwnProperty

/**
// Obtaining Keys/Properties as Array

Object.keys:                                direct enumerable
getOwnPropertyNames:                        direct enumerable and nonenumerable
?:                                          direct nonenumerable

use for-in:                                 direct and indirect enumerable
getAllPropertyNames (custom function):      direct and indirect enumerable and nonenumerable
?:                                          direct and indirect nonenumerable

?:                                          indirect enumerable
?:                                          indirect enumerable and nonenumerable
?:                                          indirect nonenumerable

*/
function PropertyRetriever (obj) {
    this.obj = obj;
}
PropertyRetriever.prototype.getOwnEnumerables = function () {
    var obj = this.obj;
    return Object.keys(obj); // Could also use for-in with hasOwnProperty
};
PropertyRetriever.prototype.getOwnNonenumerables = function () {
    var obj = this.obj;

    return Object.getOwnPropertyNames(obj).reduce(function (prev, prop) {
        if (prev.indexOf(prop) === -1 && !obj.propertyIsEnumerable(prop)) {
            prev.push(prop);
        }
    }, []);
};
PropertyRetriever.prototype.getOwnEnumerablesAndNonenumerables = function () {
    var obj = this.obj;
    return Object.getOwnPropertyNames(obj);
};

PropertyRetriever.prototype.getPrototypeEnumerables = function () {
    var obj = this.obj;
    
};
PropertyRetriever.prototype.getPrototypeNonenumerables = function () {
    var obj = this.obj;
    
};
PropertyRetriever.prototype.getPrototypeEnumerablesAndNonenumerables = function () {
    var obj = this.obj;

};

PropertyRetriever.prototype.getOwnAndPrototypeEnumerables = function () {
    var obj = this.obj;
    
};
PropertyRetriever.prototype.getOwnAndPrototypeNonenumerables = function () {
    var obj = this.obj;

};
PropertyRetriever.prototype.getOwnAndPrototypeEnumerablesAndNonenumerables = function () {
    var obj = this.obj;

};



/*
// Enumeration

use Object.keys:                            direct enumerable
use getOwnPropertyNames:                    direct enumerable and nonenumerable
?:                                          direct nonenumerable

for-in:                                     direct and indirect enumerable
use getAllPropertyNames (custom function):  direct and indirect enumerable and nonenumerable
?:                                          direct and indirect nonenumerable

?:                                          indirect enumerable
?:                                          indirect enumerable and nonenumerable
?:                                          indirect nonenumerable
*/
function PropertyEnumerator () {

}
PropertyRetriever.prototype.enumerateOwnEnumerables = function (cb) {
    var obj = this.obj;
    for (var prop in obj) {
        if (obj.hasOwnProperty(prop)) {
            cb(obj[prop], prop, obj);
        }
    }
};
PropertyRetriever.prototype.enumerateOwnNonenumerables = function (cb) {

};
PropertyRetriever.prototype.enumerateOwnEnumerablesAndNonenumerables = function (cb) {

};

PropertyRetriever.prototype.enumeratePrototypeEnumerables = function (cb) {
    var obj = this.obj;
    for (var prop in obj) {
        if (!obj.hasOwnProperty(prop)) {
            cb(obj[prop], prop, obj);
        }
    }
};
PropertyRetriever.prototype.enumeratePrototypeNonenumerables = function (cb) {

};
PropertyRetriever.prototype.enumeratePrototypeEnumerablesAndNonenumerables = function (cb) {

};

PropertyRetriever.prototype.enumerateOwnAndPrototypeEnumerables = function (cb) {
    var obj = this.obj;
    for (var prop in obj) {
        cb(obj[prop], prop, obj);
    }
};
PropertyRetriever.prototype.enumerateOwnAndPrototypeNonenumerables = function (cb) {

};
PropertyRetriever.prototype.enumerateOwnAndPrototypeEnumerablesAndNonenumerables = function (cb) {

};



// MULTIPLE-INHERITING CLASS (PropertyEnumerator AND PropertyRetriever)

function PropertyEnumeratorRetriever () {
}
PropertyEnumeratorRetriever.prototype = new PropertyEnumerator;


for (var method in PropertyRetriever.prototype) {
    PropertyEnumeratorRetriever.prototype[method] = PropertyRetriever.prototype[method];
}

// EXPORTS
this.PropertyRetriever = PropertyRetriever;
this.PropertyEnumerator = PropertyEnumerator;
this.PropertyEnumeratorRetriever = PropertyEnumeratorRetriever;

}());
