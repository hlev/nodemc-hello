'use strict';

const http           = require('http');
const https          = require('https');
const Resource       = require('./resource');
const Router         = require('./router');
const {readFileSync} = require('fs');
let httpServer, httpsServer, serverOptions;

// Read configuration
const config      = require('./config')('./config.json');
const httpPort    = config.number('http.port', 3000);
const httpsPort   = config.number('https.port', 3001);
const useHttps    = config.bool('https.startServer', false);
const tlsKeyPath  = config.string('https.tls.key', './tls/key.pem');
const tlsCertPath = config.string('https.tls.cert', './tls/cert.pem');

// Create a router and an API instance
const router = new Router();
const api    = require('./api')(router);

// Add resources to the API, a resource has a URI and can register handlers for one or more HTTP methods
api
    .add(
        new Resource('/ping')
            .get((data, req, res) => {
                res.end('pong\n');
            })
    )
    .add(
        new Resource('/hello')
            .get((data, req, res) => {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify('Hello Stranger!'))
            })
            .post((data, req, res) => {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(`Hello Stranger! Here's your data: ${data.body}`))
            })
    );

// Configure and start servers
try {
    httpServer = http.createServer(api.entryPoint);
    httpServer.on('listening', () => {
        console.log(`HTTP server listening on localhost:${httpPort}`);
    }).listen(httpPort);

    if (useHttps) {
        serverOptions = {
            key: readFileSync(tlsKeyPath),
            cert: readFileSync(tlsCertPath)
        };

        httpsServer = https.createServer(serverOptions, api.entryPoint);
        httpsServer.on('listening', () => {
            console.log(`HTTPS server listening on localhost:${httpsPort}`);
        }).listen(httpsPort);
    }
} catch (err) {
    console.log(`${err}`);
}



