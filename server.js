const express = require('express');
const routes = require('./controllers');
const YAML = require('yamljs');
const swaggerUi = require('swagger-ui-express');

const app = express();
const PORT = process.env.PORT || 3001;
const swaggerDocument = YAML.load('./swagger.yml');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// turn on routes
app.use(routes);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// turn on connection to db and server
module.exports = app.listen(PORT, () => {
  console.log('Server started on port: ' + PORT);
});