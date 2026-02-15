const passport = require('passport');
const { Strategy: JwtStrategy } = require('passport-jwt');
const { Strategy: LocalStrategy } = require('passport-local');
const bcrypt = require('bcrypt-nodejs');

const config = require('./config');
const db = require('./models');

var TokenExtractor = function(req){
    var token = null;
    if (req && req.cookies){
        token = req.cookies['XSRF-token'];
    }
    if(!token && req.headers['authorization']){
        token = req.headers['authorization'];
    }
    return token;
}

passport.use('user-jwt', new JwtStrategy({
    jwtFromRequest: TokenExtractor,
    secretOrKey: config.app.secret,
}, async (payload, done) => {
    try {
        if (new Date(payload.exp) < new Date()) {
            return done('expired', false);
        }

        // Check if it's a sub-user (check payload for isSubUser flag or try subUser table first)
        // For now, try user table first, then subUser
        var user = await db.user.findOne({ where: { id: payload.sub }});
        let isSubUser = false;

        if (!user) {
            user = await db.subUser.findOne({ where: { id: payload.sub }});
            isSubUser = true;
        }

        if (!user) {
            return done('user', false);
        }

        // For sub-users, check status and load menu permissions
        if (isSubUser) {
            if (user.status !== 'approved') {
                return done('user', false);
            }
            user.dataValues.isSubUser = true;
            // Get menu permissions
            const permissions = await db.subUserMenuPermission.findAll({
                where: { subUserId: user.id }
            });
            const menuPermissions = {};
            permissions.forEach(perm => {
                menuPermissions[perm.menuKey] = perm.enabled;
            });
            user.dataValues.menuPermissions = menuPermissions;
            // Set role based on vendorId or storeId
            user.dataValues.role = user.vendorId ? '2' : '3';
        } else {
            user.dataValues.isSubUser = false;
        }

        done(null, user);
    } catch (error) {
        done(error, false);
    }
}));


passport.use('user-local', new LocalStrategy({
    usernameField: 'email',
    passReqToCallback: true
}, async (req, email, password, done) => {
    try {
        // Check regular users first
        let user = await db.user.findOne({ where: { email: email } });
        let isSubUser = false;

        // If not found, check sub-users
        if (!user) {
            user = await db.subUser.findOne({ where: { email: email } });
            isSubUser = true;
        }

        if (!user) {
            return done(null, false);
        }

        // For sub-users, check status
        if (isSubUser) {
            if (user.status === 'pending') {
                return done('pending', false);
            }
            if (user.status === 'rejected') {
                return done('rejected', false);
            }
        } else {
            // Regular user status check
            if (user.status == 'inactive') {
                return done('invalid', false);
            }

            if (user.attempt == 5) {
                return done('attempt', false);
            }
        }
        
        var isMatch = bcrypt.compareSync(password, user.password);

        if (!isMatch) {
            if (!isSubUser && user.attempt !== undefined) {
                user.update({
                    attempt: user.attempt + 1
                });
                return done('attempt:' + (5 - user.attempt), false);
            }
            return done(null, false);
        } else {
            if (!isSubUser && user.attempt !== undefined) {
                user.update({ attempt: 0 });
            }
        }

        // Add sub-user flag and menu permissions to user object
        if (isSubUser) {
            user.dataValues.isSubUser = true;
            // Get menu permissions
            const permissions = await db.subUserMenuPermission.findAll({
                where: { subUserId: user.id }
            });
            const menuPermissions = {};
            permissions.forEach(perm => {
                menuPermissions[perm.menuKey] = perm.enabled;
            });
            user.dataValues.menuPermissions = menuPermissions;
            // Set role based on vendorId or storeId
            user.dataValues.role = user.vendorId ? '2' : '3';
        } else {
            user.dataValues.isSubUser = false;
        }

        done(null, user);
    } catch (error) {
        console.log(error);
        done(error, false);
    }
}));

passport.use('customer-local', new LocalStrategy({
    usernameField: 'email',
    passReqToCallback: true
}, async (req, email, password, done) => {
    try {
        const user = await db.customer.findOne({ where: { email: email } });
        if (!user) {
            return done(null, false);
        }

        if(user.status == 'inactive'){
            return done('invalid', false);
        }

        if (user.attempt == 5) {
            return done('attempt', false);
        }
        
        var isMatch=  bcrypt.compareSync(password, user.password);

        if (!isMatch) {
            user.update({
                attempt: user.attempt + 1
            })
            return done('attempt:' + (5 - user.attempt), false);
        } else {
            user.update({ attempt: 0 })
        }
        done(null, user);
    } catch (error) {
        console.log(error)
        done(error, false);
    }
}));
