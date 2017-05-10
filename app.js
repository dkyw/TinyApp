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

//check if user email exists
function checkEmail (inputEmail) {
  for (let user in userDatabase) {
    if (userDatabase[user].email === inputEmail)
      return false;
  }
};


//-----------------------------------------------------------//

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const userDatabase = {
  "b2xVn2": {
    id: "b2xVn2",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "9sm5xK": {
    id: "9sm5xK",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}


//-----------------------------------------------------------//

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
  let userId = generateRandomString();
  let userPassword = req.body.password;
  let userEmail = req.body.email;

  //if the e-mail or password are empty strings, send 404
  if (!userEmail || !userPassword) {
    res.status(404);
    res.send('Email or password field cannot be empty')
    return;
  }
  //If someone tries to register with an existing user's email, send 400 status
  if (checkEmail(userEmail) === false) {
    res.status(400);
    res.send('Email already in use');
    return
  } else {
    //append user to userDatabase
    userDatabase[userId] = {
      id: userId,
      email: userEmail,
      password: userPassword
    }
  //set cookie for new user
  res.cookie('user_id', userId);
  res.redirect('/urls');
  }
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




