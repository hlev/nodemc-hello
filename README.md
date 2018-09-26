# nodemc-hello
### A simple somewhat-RESTful JSON(ish) API
This is submission to The Node.js Master Class, Assignment #1, by Pirple.

Responds to `GET /ping`, `GET /hello`, `POST /hello` and `OPTIONS` sent to these URIs.

Responds with `405 Method Not Allowed` if the resource does not implement the request's otherwise valid HTTP method.
Responds with `404 Not Found` to requests made to unknown resources, `500 Internal Server Error`, you know when...
  
## Resources
Resources represent REST API entities and can be registered with the API with a URI and handlers for different HTTP methods.

```javascript
// Well, `/ping` does not respond with JSON
api.add(
    new Resource('/ping')
        .get((data, req, res) => { res.end('pong\n'); })
        .post((data, req, res) => { /* handler code */ })
);
```

Handlers have full control over the `request` and `response` objects.
`data` passed to every handler contains the request headers, the parsed search parameters, the URL hash and the parsed request body for convenience.

## Configuration
`config.json` may contain configuration for one or more environments.

```text
{
 <env> : <config_object>,
 <another_env>: <config_object>,
 ...
}
```

The app determines environment from the NODE_ENV environment variable and defaults to "development".

Then it attempts to read the specified configuration from `config.json`. In the lack of the file or a matching configuration object/key
it will fallback to defaults.

Configuration in the app can be accessed via the `Config` helper.
A default value can be provided for when the configuration value is missing or is of the wrong type. An example of the
latter is present in the repo as is.

```javascript
const config   = require('./config')('./config.json');
const useHttps = config.bool('https.startServer', false);

if (useHttps) {
    // do stuff...
}
```

This corresponds to a `config.json` scheme as follows:
```text
{
 "<environment>": {
   "https": {
     "startServer": <true/false>
   }
 }
}
```

## TLS
If you want TLS, generate a new private key and self-signed certificate in the `./tls` folder.
```bash
openssl req -newkey rsa:2048 -nodes -x509 -days 999 -out cert.pem -keyout key.pem
```
Then set `https.startServer` to `true` in `config.json` before starting the app.


## Notes
There are a couple of things that can immediately be improved:
- Since it is supposed to be a JSON API, the responsibility of the JSON parsing/serialization and e.g. the setting of
the `Content-Type` response header could be done outside the actual handlers.
- Parsing of the inbound request is far from perfect. There's no validation on request body, for one.
- There are no tests (yet) either
- The handlers' raw access to `request` and `response` is not optimal. And so on...

The submission does not stick to the letter of the assignment specs, but I wanted a refresher-project to try a couple of
ES6 features I've seldom used and play around with alternative care-free approaches to structuring the implementation of
a REST API.

There are a couple of (hopefully interesting) generic JS techniques in there as well that may inspire others, especially
if they are new to JS/Node.js and like to read, explore (and judge) others' code.
