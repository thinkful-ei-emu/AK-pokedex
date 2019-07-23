require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');//npm i cors
const helmet = require('helmet');//npm i helmet

const POKEDEX = require('./pokedex.json');//As JSON is a subset of JavaScript, we can require this file
// directly into our application and use it like a JavaScript object.

const app = express();

app.use(morgan('dev'));
app.use(helmet()); //Make sure to place helmet before cors in the pipeline.
app.use(cors());

const validTypes = ['Bug', 'Dark', 'Dragon', 'Electric', 'Fairy', 'Fighting', 'Fire', 'Flying', 'Ghost', 'Grass', 'Ground', 'Ice', 'Normal', 'Poison', 'Psychic', 'Rock', 'Steel', 'Water'];

//~~~~~~~~COMPOSING the VALIDATION MIDDLEWARE~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
app.use(function validateBearerToken(req, res, next) {
  const apiToken = process.env.API_TOKEN;
  const authToken = req.get('Authorization');

  if (!authToken || authToken.split(' ')[1] !== apiToken) {
    return res.status(401).json({ error: 'Unauthorized request' });
  }

  // move to the next middleware
  next(); //callback at the end of the middleware to move to the next middleware in the pipeline. 
  //If we were to not invoke this next callback, the request would hang and we wouldn't see a response until there was a timeout.
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
    

const PORT = 8000;

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});
