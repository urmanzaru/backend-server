var express = require('express');
var app = express();
var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;
var Usuario = require('../models/usuario');
var bcrypt = require('bcryptjs');

/*=========== 
middleware check token
============*/
exports.checkToken = function(req, res, next) {
    var token = req.query.token;
    jwt.verify(token, SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                message: 'Unauthorized',
                errors: err
            });
        }
        req.user = decoded.user;
        next();
    });
}