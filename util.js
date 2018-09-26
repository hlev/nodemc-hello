'use strict';

class NotFound extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, this.constructor);
        } else {
            this.stack = (new Error(message)).stack;
        }
    }
}

class MethodNotAllowed extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, this.constructor);
        } else {
            this.stack = (new Error(message)).stack;
        }
    }
}

function trimPath(path) {
    return path.replace(/^\/+|\/+$/g, '').replace(/\/+/g, '/');
}

function strMapToObj(map) {
    let res = {};
    for (let [k, v] of map) {
        res[k] = v;
    }
    return res;
}

function merge(a, b) {
    if (a && b) {
        for (let key in b) {
            if (b.hasOwnProperty(key)) {
                a[key] = b[key];
            }
        }
    }

    return a;
}

module.exports = {trimPath, NotFound, MethodNotAllowed: MethodNotAllowed, strMapToObj, merge};