const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080; // default port 8080
const cookieParser = require('cookie-parser');

//allows access POST request parameters
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");
app.use(cookieParser());

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

app.post('/login', (req, res) => {
  //set cookie to username
  res.cookie('username', req.body.username);
  res.redirect('/urls');
})

app.get('/register', (req, res) => {
  res.render('urls_register', {user: req.cookies.username});
});


app.post('/register', (req, res) => {

  //dummy code ----------------------------------------------
  let password = req.body.password;
  let email = req.body.email;
  console.log('password', password, 'email', email);
});



//index page with all links
app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    user: req.cookies.username
  };
  res.render("urls_index", templateVars);
});


//submit new links
app.get("/urls/new", (req, res) => {
  res.render('urls_new', {user: req.cookies.username});
});

//add submitted links to database
app.post('/urls', (req, res) => {
  let randomString = generateRandomString();
  let longURL = req.body.longURL;
  urlDatabase[randomString] = longURL;
  res.redirect('/urls');
})

//redirect short links to original url
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});


//endpoint to render update links page
app.get("/urls/:id", (req, res) => {
  let templateVars = {
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id],
    user: req.cookies.username
  };
  res.render("urls_show", templateVars);
});

//updating existing links
app.post('/urls/:id', (req, res) => {
  let shortURL = req.params.id
  let longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect('/urls');
});

//delete existing links
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls')
});


//clear cookie on logout
app.post('/logout', (req, res) => {
  res.clearCookie('username',req.cookies.username);
  res.redirect('/urls');
})



//-------------------------------------------------------//
app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});




