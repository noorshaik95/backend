require('app-module-path').addPath(__dirname);
let express = require('express');
let passport = require('passport');
let config = require('config');
let cookieParser = require('cookie-parser');
let bodyParser = require('body-parser');
let methodOverride = require('method-override');
let cors = require('cors');
let Strategy = require('passport-local').Strategy;
const crypto = require('crypto');
let jwt = require('jsonwebtoken');

let app = express();

app.use(bodyParser.json({limit: '5mb'}));

app.use(bodyParser.urlencoded({limit: '5mb', extended: true}));

app.use(cookieParser());

app.use(methodOverride());

app.use(cors());

app.set('port', config.port || 5000);

app.use(passport.initialize());

passport.use(new Strategy({
        session: false,
        passReqToCallback: true
    }, function (req, username, password, done) {
        if (config.security.username !== username) {
            return done(null, false);
        }
        if (config.security.password !== password) {
            return done(null, false);
        }
        req.token = generateToken();
        return done(null, config.security.username);
    }
));
app.listen(app.get('port'), function () {
    console.log("Server listening on port %d in %s mode", app.get('port'), app.settings.env);
});

app.post('/login', passport.authenticate('local', {session: false}), function(req, res, next) {
    res.json({token: req.token, status: true});
    return res.end();
});


function generateToken() {
    return jwt.sign({username: config.security.username}, config.security.secret, {expiresIn: config.security.tokenLife})
}


