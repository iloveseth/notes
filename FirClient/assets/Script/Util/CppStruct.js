module.exports = struct;

function struct(name, schema, count, bytes) {
	this.name = name;
	this.schema = schema;
	this.bytes = bytes || 0;
	for (var i = 1; i < schema.length; i += 2) {
		this.bytes += schema[i].size();
	}
	this.count = count || 1;
	this.encoder = struct.encoder;
	this.decoder = struct.decoder;
}

// instance members
struct.prototype.setEncoder = function (f) {
	return this.encoder = f, this;
}

struct.prototype.setDecoder = function (f) {
	return this.decoder = f, this;
}

struct.prototype.setIsNoArray = function (noArray) {
	return this.isNoArray = noArray, this;
}

struct.prototype.forEachInSchema = function (f) {
	for (var i = 0; i < this.schema.length; i += 2) {
		var name = this.schema[i];
		var type = this.schema[i + 1];
		f(name, type);
	}
}

struct.prototype.size = function () {
	return this.bytes * this.count;
};

struct.prototype.toString = function () {
	var out = ["struct " + this.name + " {"]
	this.forEachInSchema((name, type) => {
		var arr = type.count > 1 ? "[" + type.count + "]" : "";
		out.push("  " + type.name + " " + name + arr + "; // Size: " + type.size());
	});
	out.push("}; // Size: " + this.size());
	return out.join("\n");
};

struct.prototype.encode = function (buffer, pos, data, opt) {
	this.encoder(buffer, pos || 0, data, opt);
};

struct.prototype.decode = function (buffer, pos, opt) {
	return this.decoder(buffer, pos || 0, opt);
};

// class members
struct.encoder = function (buffer, pos, data, opt) {
	this.forEachInSchema((name, type) => {
		var dval = data && data[name]
		//console.log(pos,this.name+"."+name,type.name,type.size(),type.schema);
		for (var j = 0; j < type.count; j += 1) {
			var el = dval && dval.join ? dval[j] : dval;
			type.encode(buffer, pos, el, opt);
			if (type.isNoArray) {
				pos += type.size();
				break;
			} else {
				pos += type.bytes;
			}
		}
	});
}

struct.decoder = function (buffer, pos, opt) {
	var data = {}
	this.forEachInSchema((name, type) => {
		if (type.count == 1 || type.isNoArray) {
			data[name] = type.decode(buffer, pos, opt);
			pos += type.size();
		} else {
			var arr = [];
			data[name] = arr;
			for (var i = 0; i < type.count; i += 1) {
				arr[i] = type.decode(buffer, pos, opt);
				//console.log(pos,arr[i],type)
				pos += type.bytes;
			}
		}
	});
	return data;
}

struct.type = function (type, size, count) {
	if (type.size && count === undefined) {
		count = size;
		size = type.size();
	}
	return new struct(type.name || type, [], count, size)
		.setEncoder(
			(buffer, pos, data, opt) => {
				type.encode(buffer, pos, data, opt)
			}
		)
		.setDecoder(
			(buffer, pos, opt) => {
				return type.decode(buffer, pos, opt);
			}
		)
}
struct.char = function (n) {
	return this.type("char", 1, n)
		.setIsNoArray(true)
		.setEncoder(
			(buffer, pos, data, opt) => {
				var str = data ? data.toString() : "";
				for (var i = 0; i < n; i += 1) {
					buffer.write(i < str.length ? str[i] : "\0", pos + i)
				}
			}
		)
		.setDecoder(
			(buffer, pos, opt) => {
				var s = buffer.toString("ASCII", pos, pos + n);
				var cutAt = s.indexOf("\0");
				if (cutAt < 0) return s;
				return s.substr(0, cutAt);
			}
		)
};

struct.toHeaderString = function (list) {
	var d = new Date();
	var date = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate() + " " + d.getHours() + ":" + d.getMinutes();
	var out = ["// AUTOGENERATED CODE BY cpp-struct.js @ " + date];
	for (var i = 0; i < list.length; i += 1) {
		out.push("struct " + list[i].name + ";")
	}
	out.push("")
	for (var i = 0; i < list.length; i += 1) {
		out.push(list[i].toString());
		out.push("")
	}
	out.push("// check if sizes are as expected - if the compiler errors here")
	out.push("// with a negative array size complaint, it means that the javascript")
	out.push("// struct definitions are not matching the memory alignment of your")
	out.push("// compiler. Insert placeholder elements to match the sizes.")
	out.push("// Don't deactivate the tests! As long as the sizes differ, ")
	out.push("// encoding and decoding will give wrong results!")
	out.push("");
	for (var i = 0; i < list.length; i += 1) {
		var s = list[i];
		out.push("typedef char _CheckSizeOf" + s.name
			+ "_[sizeof(" + s.name + ") == " + s.size() + " ? 1 : -1];")
	}
	return out.join("\n");
}

function addNumberType(jsName, bytes, aliasCPP) {
	var writeName = "write" + jsName;
	var readName = "read" + jsName;
	var writeAccess = [
		bytes > 1 ? writeName + "BE" : writeName,
		bytes > 1 ? writeName + "LE" : writeName
	];
	var readAccess = [
		bytes > 1 ? readName + "BE" : readName,
		bytes > 1 ? readName + "LE" : readName
	];

	let ret = function (n) {
		return struct.type(aliasCPP || (jsName.toLowerCase() + "_t"), bytes, n)
			.setEncoder(
				(buffer, pos, data, opt) => {
					buffer[writeAccess[isLittleEndian(opt)]](data || 0, pos);
				}
			)
			.setDecoder(
				(buffer, pos, opt) => {
					return buffer[readAccess[isLittleEndian(opt)]](pos);
				}
			)
	}
	return ret;
}

struct.uint8 = addNumberType("UInt8", 1);
struct.uint16 = addNumberType("UInt16", 2);
struct.uint32 = addNumberType("UInt32", 4);
struct.uint64 = addNumberType("UInt64", 8);
struct.int8 = addNumberType("Int8", 1);
struct.int16 = addNumberType("Int16", 2);
struct.int32 = addNumberType("Int32", 4);
struct.int64 = addNumberType("Int64", 8);
struct.float = addNumberType("Float", 4, "float");
struct.double = addNumberType("Double", 8, "double");

function isLittleEndian(opt) {
	return opt && opt.endian == "LE" ? 1 : 0;
}