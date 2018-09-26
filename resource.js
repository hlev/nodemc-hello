'use strict';
const {trimPath, MethodNotAllowed} = require('./util');

class Resource {
    /**
     * @param {string} path The URI this resource is available at
     */
    constructor(path) {
        this._path     = trimPath(path);
        this._handlers = new Map();
        this._handlers.set('options', (data, req, res) => {
            res.writeHead(200, {
                Allow: this.options.join(', ').toUpperCase()
            });
            res.end();
        });
    }

    /**
     * @returns {string[]} The HTTP methods supported by this resource
     */
    get options() {
        let allowed = this._handlers.keys();

        return [...allowed];
    }

    /**
     * @returns {string} The URI of the resource
     */
    get path() {
        return this._path;
    }

    /**
     * @orivate
     * @returns {Resource}
     */
    setHandler(method, handler) {
        this._handlers.set(method, handler);

        return this;
    }

    /**
     * @orivate
     */
    handle(method, data, req, res) {
        let handler = this._handlers.get(method);

        if (!handler) {
            throw new MethodNotAllowed(`HTTP method '${method.toUpperCase()}' is not implemented at '${this._path}'`);
        }

        handler(data, req, res);
    }

    /**
     * @callback ResponseHandler
     * @param {object} data Parsed request parameters (headers, search parameters, body)
     * @param {IncomingMessage}
     * @param {ServerResponse}
     */

    /**
     * Adds a HEAD handler to the resource
     * @param {ResponseHandler} handler
     * @returns {Resource}
     */
    head(handler) {
        return this.setHandler('head', handler);
    }

    /**
     * Adds a GET handler to the resource
     * @param {ResponseHandler} handler
     * @returns {Resource}
     */
    get(handler) {
        return this.setHandler('get', handler);
    }

    /**
     * Adds a PUT handler to the resource
     * @param {ResponseHandler} handler
     * @returns {Resource}
     */
    put(handler) {
        return this.setHandler('put', handler);
    }

    /**
     * Adds a POST handler to the resource
     * @param {ResponseHandler} handler
     * @returns {Resource}
     */
    post(handler) {
        return this.setHandler('post', handler);
    }

    /**
     * Adds a PATCH handler to the resource
     * @param {ResponseHandler} handler
     * @returns {Resource}
     */
    patch(handler) {
        return this.setHandler('patch', handler);
    }

    /**
     * Adds a DELETE handler to the resource
     * @param {ResponseHandler} handler
     * @returns {Resource}
     */
    delete(handler) {
        return this.setHandler('delete', handler);
    }
}

module.exports = Resource;