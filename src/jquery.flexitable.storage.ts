class FlexiTableStorage {

	classNumber: number;
	keys: string[];
	keyLookUp: boolean[];
	classLookUp: string[];
	data: any;

	constructor(data: any) {
		this.keys = [];
		this.keyLookUp = [];
		this.data = data;
		this.classLookUp = [];
		this.classNumber = 1;
	}

	addKey(key: string) {
		if (typeof this.keyLookUp[key] == "undefined") {
			this.keyLookUp[key] = true;
			this.keys.push(key);
		}
	}

	getClass(key, value, autoAdd): string {
		var name: string = key + value;
		if (this.classLookUp[name])
			return this.classLookUp[name];

		if (autoAdd === false)
			return;

		var className = "C" + this.classNumber++;
		this.classLookUp[name] = className;
		return className;
	}

}