'use strict';
const fs = require('fs');
let config;

class Config {
    constructor(config) {
        let env      = process.env.NODE_ENV || 'development';
        this._config = new Proxy(config, {
            /**
             *  Expects a dot notation path to the value in the configuration object
             * @param {object} target
             * @param {string} name
             * @returns {*}
             */
            get(target, name) {
                // Split `name` on dots and prepend the environment to the keys
                let keys   = name.split('.');
                let length = keys.unshift(env);

                // Iterate the keys and traverse the configuration object
                for (let i = 0; i < length; i++) {
                    const key = keys[i];

                    try {
                        if (key in target) {
                            target = target[key];
                        } else {
                            // Key does not exist in target.
                            console.log(`Config property '${name}' does not exist in environment '${env}'`);

                            return undefined;
                        }
                    } catch (err) {
                        // Key exists but we could not drill deeper (e.g. value is a scalar) and "in" throws an error
                        console.log(`Config property '${name}' does not exist in environment '${env}'`);

                        return undefined;
                    }
                }

                return target;
            }
        });
    }

    raw(accessor) {
        return this._config[accessor];
    }

    /**
     *
     * @param {string} type
     * @param {string} accessor
     * @returns {*}
     */
    expect(type, accessor) {
        let value = this.raw(accessor);

        if (type) {
            return typeof value === type ? value : undefined;
        }

        return value;
    }
}

module.exports = path => {
    // If path is passed, attempt to read and parse a JSON
    if (path && typeof path === 'string' && path.length > 0) {

        try {
            config = fs.readFileSync(path, {encoding: 'utf8'});

            try {
                // Parse the JSON configuration file and spin up a Config with its contents
                config = new Config(JSON.parse(config));
            } catch (err) {
                console.error(`Failed parsing file: ${err}`);
                config = new Config({});
            }
        } catch (err) {
            console.error(`Failed reading file at path '${path}'`);
            config = new Config({});
        }
    } else {
        config = new Config({});
    }

    return {
        /**
         * Read a raw config value, or return a default if missing
         * @param {string} accessor A path to the config value in dot notation e.g. https.tls.key
         * @param {*} defaultValue
         * @returns {*}
         */
        raw(accessor, defaultValue = null) {
            let value = config.raw(accessor);

            return typeof value === 'undefined' ? defaultValue : value;
        },
        /**
         * Read a string config value or if missing/type-mismatch then return a default
         * @param {string} accessor A path to the config value in dot notation e.g. https.tls.key
         * @param {*} defaultValue
         * @returns {*}
         */
        string(accessor, defaultValue = null) {
            return config.expect('string', accessor) || defaultValue;
        },
        /**
         * Read a numeric config value or if missing/type-mismatch then return a default
         * @param {string} accessor A path to the config value in dot notation e.g. https.port
         * @param {*} defaultValue
         * @returns {*}
         */
        number(accessor, defaultValue = null) {
            return config.expect('number', accessor) || defaultValue;
        },
        /**
         * Read a boolean config value or if missing/type-mismatch then return a default
         * @param {string} accessor A path to the config value in dot notation, e.g. https.startServer
         * @param {*} defaultValue
         * @returns {*}
         */
        bool(accessor, defaultValue = null) {
            return config.expect('boolean', accessor) || defaultValue;
        }
    };
};
