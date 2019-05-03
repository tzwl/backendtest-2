if (process.env.NODE_ENV !== "production") {
  require('dotenv').config();
}

const express = require('express')
const app = express()
const expressLayouts = require('express-ejs-layouts')
const bodyParser = require('body-parser')

const indexRouter = require('./routes/index')
// const authorRouter = require('./routes/authors')
var session = require('express-session');
// var MongoStore = require('connect-mongo')(session);

app.set('view engine', 'ejs')
app.set('views', __dirname + '/views')
app.set('layout', 'layouts/layout')
// app.set('layout', 'layouts/signup')
app.use(expressLayouts)
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ limit: '10mb', extended: false }))
app.use(session({
    secret: 'work hard',
    resave: true,
    saveUninitialized: false,
    
  }));

const mongoose = require('mongoose')
mongoose.set('runValidators', true);  //do validation when update
mongoose.set("useFindAndModify", false);
mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true });
const db = mongoose.connection
db.on('error', error => console.error(error))
db.once('open', () => console.log('Connected to Mongoose'))

app.use('/', indexRouter)
app.use('/signup', indexRouter)
// app.use('/authors', authorRouter)

app.listen(process.env.PORT || 3000)
