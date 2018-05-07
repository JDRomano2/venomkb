process.env.NODE_ENVIRONMENT = 'DEVELOPMENT';
console.log('NODE_ENVIRONMENT: ', process.env.NODE_ENVIRONMENT);
if (process.env.NODE_ENVIRONMENT === 'PRODUCTION') {
    module.exports = require('./Root.prod');
} else {
    module.exports = require('./Root.dev');
}
