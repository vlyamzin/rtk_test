const jsonServer = require('json-server')
const crypto = require('crypto');
const cookieParser = require('cookie-parser');
const server = jsonServer.create()
const path = require('path')
const router = jsonServer.router(path.join(__dirname, 'db.json'))
const middlewares = jsonServer.defaults()
const users = require(path.join(__dirname, 'db.json')).users;

const PORT = 3001
const tokens = {}


server.use(middlewares)
server.use(jsonServer.bodyParser)
server.use(cookieParser())

server.post('/api/auth', (req, res) => {
  const {email, password} = req.body;
  if (_authorize(email, password)) { // add your authorization logic here
    const token = crypto.createHash('md5').update(email).digest('hex');
    tokens[token] = email
    res.status(200).cookie('access_token', token, {httpOnly: true, maxAge: 900000}).json({token})
  } else {
    res.sendStatus(401);
  }
})

server.use((req, res, next) => {
  const cookie = req.cookies;
  if (_isAuthorized(cookie.access_token)) { // add your authorization logic here
    next() // continue to JSON Server router
  } else {
    res.sendStatus(401)
  }
})

server.use(router)
server.listen(PORT, () => {
  console.log('JSON Server is running')
})

function _isAuthorized(token) {
  return tokens.hasOwnProperty(token)
}

function _authorize(name, pwd) {
  const user = (users || []).find(u => u.email === name);

  if (!user) {
    return false;
  }

  return user.password === pwd;
}
