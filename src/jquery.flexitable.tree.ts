class TreeNode {

	count: number;
	level: number;
	parent: TreeNode;
	children: TreeNode[];
	childLookUp: TreeNode[];
	value: any;

	constructor(parent: TreeNode, value: any) {
		this.parent = parent;
		this.count = 0;
		this.level = parent ? parent.level + 1 : 0;
		this.children = [];
		this.childLookUp = [];
		this.value = value;
	}

	addChild(value): TreeNode {
		var childNode = this.childLookUp[value];

		if (childNode)
			return childNode;
			
		var newNode = new TreeNode(this, value);
		this.children.push(newNode);
		this.childLookUp[value] = newNode;

		//newNode.increment();

		return newNode;
	}

	private increment() {
		var node = this.parent;
		while (node) {
			node.count++;
			node = node.parent;
		}
	}

	updateCount() {
		var count: number = 0;
		this.children.forEach(function (child) {
			count += child.updateCount();
		});

		this.count = (count == 0) ? 1 : count;

		return this.count;
	}

	getLevels(): TreeNode[][]{
		var result: TreeNode[][] = [];

		this.getLevelRecursive(result, this.children);

		return result;
	}

	private getLevelRecursive(result: TreeNode[][], children: TreeNode[]) {
		children.forEach(function (child) {
			if (!result[child.level])
				result[child.level] = new Array<TreeNode>();
			result[child.level].push(child);
			child.getLevelRecursive(result, child.children);
		});
	}

	getDeepFirst(): TreeNode[][]{
		var result: TreeNode[][] = [];

		result[0] = [];
		this.getDeepFirstRecursive(result, 0, this.children);

		result.splice(result.length - 1);

		return result;
	}

	private getDeepFirstRecursive(result: TreeNode[][], n: number, children: TreeNode[]): number {
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
	}

}