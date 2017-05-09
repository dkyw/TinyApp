const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080; // default port 8080


//allows access POST request parameters
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

//generate alphanumeric string
function generateRandomString() {
  return Math.random().toString(36).substr(2,6);
};

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.end("Hello!");
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.post('/urls', (req,res) => {
  console.log(req.body);
  res.send('ok');
})


app.get("/urls/new", (req,res) => {
  res.render('urls_new');
});


app.get("/urls/:id", (req, res) => {
  let templateVars = {
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id],
  };
  res.render("urls_show", templateVars);
});


app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});




