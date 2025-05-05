const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const passport = require('passport');
const User = require('../models/User');
require('dotenv').config();

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
  algorithms: ['HS256'],
  ignoreExpiration: false,
  passReqToCallback: true
};

passport.use(
  new JwtStrategy(options, async (req, payload, done) => {
    try {
      if (!payload.id || !payload.email) {
        return done(null, false, { message: 'Неверный формат токена' });
      }

      const user = await User.findByPk(payload.id);
      
      if (!user) {
        return done(null, false, { message: 'Пользователь не найден' });
      }

      if (user.email !== payload.email) {
        return done(null, false, { message: 'Неверные данные токена' });
      }

      return done(null, user);
    } catch (error) {
      return done(error, false);
    }
  })
);

module.exports = passport; 