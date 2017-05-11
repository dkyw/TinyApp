const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session')
const bcrypt = require('bcrypt');
const app = express();
const PORT = process.env.PORT || 8080; // default port 8080

app.use(bodyParser.urlencoded({extended: true}));

app.use(cookieSession({
  name: 'session',
  keys: ['yahooo'],
}));

app.set("view engine", "ejs");

//-----------------------------------------------------------//

const userDatabase = {};
const urlDatabase = {};

//-----------------------------------------------------------//

//generate alphanumeric string
function generateRandomString() {
  return Math.random().toString(36).substr(2,6);
};

//check if user email exists
function checkEmail (inputEmail) {
  for (let user in userDatabase) {
    if (userDatabase[user].email === inputEmail) {
      return true;
    }
  }
  return false;
};

//check if passwords match
function checkPassword (user, inputPass) {
  return bcrypt.compareSync (inputPass, userDatabase[user].password);
};

//return user if email matches, used to set cookie
function checkUser(inputEmail) {
  for (let user in userDatabase) {
    if (inputEmail === userDatabase[user].email);
      return user;
  }
};

//return only the links created by the user
function filteredURL(userId) {
  let filtered = {};
  for (let url in urlDatabase) {
    let shorturl = urlDatabase[url].shortURL;
    if (urlDatabase[url].userID === userId)
      filtered[shorturl] = urlDatabase[url];
  }
  return filtered;
};

//-----------------------------------------------------------//
app.use(function(req, res, next){
  res.locals.user = userDatabase[req.session.user_id];
  next();
});

app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});

//-----------------------------------------------------------//


app.get('/', (req, res) => {
  res.render('urls_login');
});

app.get('/register', (req, res) => {
  res.render('urls_register');
});


app.post('/register', (req, res) => {
  let userId = generateRandomString();
  let userPassword = bcrypt.hashSync(req.body.password,10);
  let userEmail = req.body.email;

  //if the e-mail or password are empty strings, send 404
  if (!userEmail || !userPassword) {
    res.status(404);
    res.send('Email or password field cannot be empty');
  //If someone tries to register with an existing user's email, send 400 status
  } else if (checkEmail(userEmail) === true) {
    res.status(400);
    res.send('Email already in use');
  } else {
    //append user to userDatabase
    userDatabase[userId] = {
      id: userId,
      email: userEmail,
      password: userPassword
    }
    //set cookie for new user
    req.session.user_id = userId;
    res.redirect('/urls');
  }
});

app.get("/login", (req, res) => {
  res.render("urls_login");
});

app.post('/login', (req, res) => {
  let userPassword = req.body.password;
  let userEmail = req.body.email;
  let userId = checkUser(userEmail);

  if (checkEmail(userEmail) && checkPassword(userId, userPassword)) {
    req.session.user_id = userId;
    res.redirect('/urls');
  } else {
    res.status(403);
    res.send('Incorrect Credentials')
  }
});

//index page with all links
app.get("/urls", (req, res) => {
  if (!res.locals.user) {
    res.redirect('/');
    return;
  }
  let filteredDb = filteredURL(res.locals.user.id);

  let templateVars = {
    urls: filteredDb,
    user: res.locals.user.email
  };
  res.render("urls_index", templateVars);
});


//submit new links
app.get("/urls/new", (req, res) => {
  if (!res.locals.user) {
    res.redirect ('/');
    return;
  }
  res.render('urls_new', {user: res.locals.user.email});
});

//add submitted links to database
app.post('/urls', (req, res) => {
  let randomString = generateRandomString();
  let longURL = req.body.longURL;

  urlDatabase[randomString] = {
    userID: res.locals.user.id,
    shortURL: randomString,
    longURL: longURL
  }
  res.redirect('/urls');
});


//redirect short links to original url
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

//endpoint to render update links page
app.get("/urls/:id", (req, res) => {
  if (!res.locals.user) {
    res.redirect('/');
    return;
  }
  if(urlDatabase[req.params.id].userID !== res.locals.user.id) {
    //res.status(404);
    res.send('You do not own that url');
  } else {
    let templateVars = {
      shortURL: req.params.id,
      longURL: urlDatabase[req.params.id].longURL,
      user: res.locals.user.email
    };
    res.render("urls_show", templateVars);
  }
});

//updating existing links
app.post('/urls/:id', (req, res) => {
  let shortURL = req.params.id
  let longURL = req.body.longURL;
  urlDatabase[shortURL].longURL = longURL;
  res.redirect('/urls');
});

//delete existing links
app.post("/urls/:id/delete", (req, res) => {
  if (!res.locals.user) {
    res.redirect('/')
    return
  }
  if(urlDatabase[req.params.id].userID !== res.locals.user.id) {
    //res.status(404);
    res.send('You do not own that url');
  } else {
    delete urlDatabase[req.params.id];
    res.redirect('/urls');
  }
});

//clear cookie on logout
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
})





