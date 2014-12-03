// Could implement other Array methods, like some(), filter(), etc.

function PropertyMapper () {

}
PropertyMapper.prototype.mapOwnEnumerables = function (cb) {

};
PropertyMapper.prototype.mapOwnNonenumerables = function (cb) {

};
PropertyMapper.prototype.mapOwnEnumerablesAndNonenumerables = function (cb) {

};

PropertyMapper.prototype.mapPrototypeEnumerables = function (cb) {

};
PropertyMapper.prototype.mapPrototypeNonenumerables = function (cb) {

};
PropertyMapper.prototype.mapPrototypeEnumerablesAndNonenumerables = function (cb) {

};

PropertyMapper.prototype.mapOwnAndPrototypeEnumerables = function (cb) {
    var obj = this.obj;

    var ret = [];
    for (var prop in obj) {
        ret.push(cb(obj[prop], prop, obj));
    }
    return ret;
};
PropertyMapper.prototype.mapOwnAndPrototypeNonenumerables = function (cb) {

};
PropertyMapper.prototype.mapOwnAndPrototypeEnumerablesAndNonenumerables = function (cb) {

};