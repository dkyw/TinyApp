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

app.post('/urls', (req, res) => {
  let randomString = generateRandomString();
  let longURL = req.body.longURL;
  urlDatabase[randomString] = longURL;
  // console.log(urlDatabase);
  res.redirect(`http://localhost:8080/urls/${randomString}`);
})

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/urls/new", (req, res) => {
  res.render('urls_new');
});

app.post("/urls/:id/delete", (req, res) => {
  //delete urlDatabase[req.params.id];
  // let shortURL = req.params.id
  // console.log(urlDatabase[req.params.id]);
  delete urlDatabase[req.params.id];
  res.redirect('/urls')
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




