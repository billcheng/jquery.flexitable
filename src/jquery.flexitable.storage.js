var FlexiTableStorage = (function () {
    function FlexiTableStorage(data) {
        this.keys = [];
        this.keyLookUp = [];
        this.data = data;
        this.classLookUp = [];
        this.classNumber = 1;
    }
    FlexiTableStorage.prototype.addKey = function (key) {
        if (typeof this.keyLookUp[key] == "undefined") {
            this.keyLookUp[key] = true;
            this.keys.push(key);
        }
    };
    FlexiTableStorage.prototype.getClass = function (key, value, autoAdd) {
        var name = key + value;
        if (this.classLookUp[name])
            return this.classLookUp[name];
        if (autoAdd === false)
            return;
        var className = "C" + this.classNumber++;
        this.classLookUp[name] = className;
        return className;
    };
    return FlexiTableStorage;
}());
