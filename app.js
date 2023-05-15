const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const databasePath = path.join(__dirname, "moviesData.db");

const app = express();
app.use(express.json());

let database = null;

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

app.get("/movies/", async (request, response) => {
  const getMovieNamesQuery = `
     SELECT 
       * 
    FROM 
      movie;`;
  const moviesNames = await database.all(getMovieNamesQuery);
  response.send(
    moviesNames.map((eachMovie) => {
      return { MovieName: eachMovie.movie_name };
    })
  );
});

app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const addMovieQuery = `
    INSERT INTO 
     movie(director_id, movie_name, lead_actor)
    VALUES('${directorId}','${movieName}','${leadActor}');`;
  await database.run(addMovieQuery);
  response.send("Movie Successfully Added");
});

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
    SELECT 
      * 
    FROM 
     movie 
    WHERE movie_id = ${movieId};`;

  const movie = await database.get(getMovieQuery);
  response.send(movie);
});

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;

  const updateMovieQuery = `
    UPDATE 
      movie 
    SET 
      director_id = '${directorId}',
      movie_name =  '${movieName}',
      lead_actor = '${leadActor}' 
    WHERE 
     movie_id = '${movieId}';`;

  await database.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
    DELETE 
      FROM 
    movie 
    WHERE 
     movie_id = '${movieId}';`;

  await database.run(deleteMovieQuery);
  response.send("Movie Removed");
});

app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `
    SELECT 
      * 
    FROM 
      director;`;
  const director = await database.all(getDirectorsQuery);
  response.send(director);
});

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorMovies = `
    SELECT 
      * 
    FROM 
     movie 
    WHERE 
     director_id = '${directorId}';`;
  const directorMovie = await database.all(getDirectorMovies);
  response.send(directorMovie);
});

module.exports = app;
