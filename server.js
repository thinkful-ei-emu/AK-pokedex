
require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const validTypes = require('./types');
const POKEDEX = require('./pokedex.json');//As JSON is a subset of JavaScript, we can require this file
// // directly into our application and use it like a JavaScript object.
const cors = require('cors');//npm i cors
const helmet = require('helmet');//npm i helmet


const app = express();

const morganSetting = process.env.NODE_ENV === 'production' ? 'tiny' : 'common';
app.use(morgan(morganSetting));
app.use(helmet());
app.use(cors());

//~~~~~~~~COMPOSING the VALIDATION MIDDLEWARE~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
app.use(function validateBearerToken(req, res, next) {
  if (!req.get('Authorization')) {
    return res.status(401).json({ error: 'Unauthorized request' });
  }
  const bearerToken = req.get('Authorization').split(' ')[1];
  const apiToken = process.env.API_TOKEN;

  if (bearerToken !== apiToken) {
    return res.status(401).json({ error: 'Unauthorized request' });
  }
  next(); //callback at the end of the middleware to move to the next middleware in the pipeline. 
  //   If we were to not invoke this next callback, the request would hang and we wouldn't see a response until there was a timeout.
});

//~~~~~function to get the types of pokemon~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
app.get('/types', function handleGetTypes(req, res) {
  res.json(validTypes);
});
  
app.get('/pokemon', function handleGetPokemon(req, res) {
  let response = POKEDEX.pokemon;
  
  // filter our pokemon by name if name query param is present
  if (req.query.name) {
    response = response.filter(pokemon =>
    // case insensitive searching
      pokemon.name.toLowerCase().includes(req.query.name.toLowerCase())
    );
  }
  
  // filter our pokemon by type if type query param is present
  if (req.query.type) {
    response = response.filter(pokemon =>
      pokemon.type.includes(req.query.type)
    );
  }
  
  res.json(response);
});
////~~~~~~~~COMPOSING the VALIDATION MIDDLEWARE~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//hide sensitive error messages using below middleware . should be the LAST middleware in pipeline
// // 4 parameters in middleware, express knows to treat this as error handler
app.use((error, req, res, next) => {
  let response;
  if (process.env.NODE_ENV === 'production') {
    response = { error: { message: 'server error' }};
  } else {
    response = { error };
  }
  res.status(500).json(response);
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => { // code runs the app.listen method to connect it to a port number on the host machine
  (`Server listening at http://localhost:${PORT}`
  );
});