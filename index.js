import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import dotenv from "dotenv"

const app = express();
const port = 3000;

dotenv.config()

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "world",
  password: process.env.DB_pass,
  port: 5432,
});

db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

async function checkVisisted () {
  const result = await db.query ("Select country_code FROM visited_countries");
  let countries = [];
  result.rows.forEach((country) => {
    countries.push(country.country_code)
  });
  return countries;
}

app.get("/", async (req, res) => {

  const countries = await checkVisisted();
  res.render("index.ejs", {countries: countries, total: countries.length});
  // db.end();
  //Write your code here.
});

app.post("/add", async (req, res) => {
  const countryName = req.body["country"];
  
  try {
    const result = await db.query(
    "SELECT country_code FROM countries WHERE country_name ILIKE '%' || $1 || '%'; ",[countryName.toLowerCase()]

  ); 
  // whatever value you have to pass to query add $1 then array corresponding to that number of objects 

  const data  = result.rows[0];
  const countryCode = data.country_code;
    try  {
      await db.query(
        "INSERT INTO visited_countries (country_code) VALUES ($1)", [countryCode]
      );
      res.redirect("/");

    } catch (err) {
      console.log (err);
      const countries = await checkVisisted()
      res.render("index.ejs", {countries: countries, total: countries.length, error :"Country has already been added, Try again"});
    }

  } catch(err) {
  console.log (err);
      const countries = await checkVisisted()
      res.render("index.ejs", {countries: countries, total: countries.length, error :"Country name not found, Try again"});

  }

  
});


app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
