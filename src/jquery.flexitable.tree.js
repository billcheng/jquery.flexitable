var TreeNode = (function () {
    function TreeNode(parent, value) {
        this.parent = parent;
        this.count = 0;
        this.level = parent ? parent.level + 1 : 0;
        this.children = [];
        this.childLookUp = [];
        this.value = value;
    }
    TreeNode.prototype.addChild = function (value) {
        var childNode = this.childLookUp[value];
        if (childNode)
            return childNode;
        var newNode = new TreeNode(this, value);
        this.children.push(newNode);
        this.childLookUp[value] = newNode;
        //newNode.increment();
        return newNode;
    };
    TreeNode.prototype.increment = function () {
        var node = this.parent;
        while (node) {
            node.count++;
            node = node.parent;
        }
    };
    TreeNode.prototype.updateCount = function () {
        var count = 0;
        this.children.forEach(function (child) {
            count += child.updateCount();
        });
        this.count = (count == 0) ? 1 : count;
        return this.count;
    };
    TreeNode.prototype.getLevels = function () {
        var result = [];
        this.getLevelRecursive(result, this.children);
        return result;
    };
    TreeNode.prototype.getLevelRecursive = function (result, children) {
        children.forEach(function (child) {
            if (!result[child.level])
                result[child.level] = new Array();
            result[child.level].push(child);
            child.getLevelRecursive(result, child.children);
        });
    };
    TreeNode.prototype.getDeepFirst = function () {
        var result = [];
        result[0] = [];
        this.getDeepFirstRecursive(result, 0, this.children);
        result.splice(result.length - 1);
        return result;
    };
    TreeNode.prototype.getDeepFirstRecursive = function (result, n, children) {
        if (children.length == 0) {
            n++;
            result[n] = [];
            return n;
        }
        children.forEach(function (child) {
            result[n].push(child);
            n = child.getDeepFirstRecursive(result, n, child.children);
        });
        return n;
    };
    return TreeNode;
}());
