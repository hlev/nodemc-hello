'use strict';

const {NotFound} = require('./util');

class Router {
    constructor() {
        this._resources = new Map();
    }

    /**
     * Add a resource to be routed
     * @param {Resource} resource
     * @returns {Router}
     */
    add(resource) {
        let pathMap = this._resources;
        let path    = resource.path;

        if (!pathMap.has(path)) {
            pathMap.set(path, resource);
        } else {
            console.error(`A resource is already routed at path '${path}'.`);
        }

        return this;
    }

    /**
     * Routes requests to registered resources based on the URI
     * @param {string} path The parsed request URI
     * @returns {Promise<Resource|Error>}
     */
    route(path) {
        return new Promise((resolve, reject) => {
            let resource = this._resources.get(path);

            if (resource) {
                resolve(resource);
            } else {
                reject(new NotFound(`No resource found at path '${path}'.`));
            }
        });

    }
}

module.exports = Router;