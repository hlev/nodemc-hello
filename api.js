'use strict';
const Resource                                            = require('./resource');
const {URL}                                               = require('url');
const {trimPath, strMapToObj, NotFound, MethodNotAllowed} = require('./util');

class Api {
    constructor(router) {
        this._router         = router;
        this._errorResponses = {
            404: 'Not found',
            405: 'This method has no power here',
            406: 'Not acceptable',
            500: 'Internal server error'
        };
    }

    /**
     * @private
     * @param {int} statusCode
     * @param {ServerResponse} res
     */
    errorResponse(statusCode, res) {
        res.writeHead(statusCode, {'Content-Type': 'application/json'});
        res.end(JSON.stringify(this._errorResponses[statusCode]));
    }

    /**
     * Getter for an entry point to the API
     * @returns {function}
     */
    get entryPoint() {
        return this.in.bind(this);
    }

    /**
     * Adds a new Resource (URI) to the API
     * @param {Resource} resource
     * @returns {Api}
     */
    add(resource) {
        this._router.add(resource);

        return this;
    }

    /**
     * @private
     * @param {IncomingMessage} req
     * @param {ServerResponse} res
     */
    in(req, res) {
        let url    = new URL(req.url, `${req.connection.encrypted ? 'https' : 'http'}://${req.headers.host}`);
        let path   = trimPath(url.pathname);
        let method = req.method.toLowerCase();

        // Ask the router to route this request
        this._router.route(path, method)
            .then(resource => {
                let body = [];

                req.on('data', (chunk) => {
                    body.push(chunk);
                }).on('end', () => {
                    body = Buffer.concat(body).toString();

                    // FIXME searchParams conversion does not handle multi-value search params, e.g. ?foo=bar&foo=baz
                    let data = {
                        headers: req.headers,
                        searchParams: strMapToObj(url.searchParams),
                        hash: url.hash,
                        body: body
                    };

                    try {
                        resource.handle(method, data, req, res);
                    } catch (err) {
                        console.error(err.message);
                        switch (true) {
                            case err instanceof MethodNotAllowed:
                                this.errorResponse(405, res);
                                break;
                            default:
                                this.errorResponse(500, res);
                                break;
                        }
                    }

                });
            })
            .catch(err => {
                console.error(err.message);
                switch (true) {
                    case err instanceof NotFound:
                        this.errorResponse(404, res);
                        break;
                }
            });
    }
}

module.exports = router => new Api(router);
