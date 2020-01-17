var express = require('express');
var app = express();
var Usuario = require('../models/usuario');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var middlware = require('../middlewares/auth');

/*===========
get all users
============*/
app.get('/', (req, res, next) => {

    Usuario.find({}, 'nombre email img role').exec((err, usuarios) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error cargando usuario',
                errors: err
            });
        }
        res.status(200).json({
            ok: true,
            usuario: usuarios,
        });
    });

});


/*===========
create user
============*/

app.post('/', middlware.checkToken, (req, res) => {
    var body = req.body;
    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    usuario.save((err, savedUser) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear usuarios',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            user: savedUser,
            userToken: req.user
        });
    });

});

/*===========
update user
============*/
app.put('/:id', middlware.checkToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;
    Usuario.findById(id, (err, userFound) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }
        if (!userFound) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El usuario con el id' + id + ' no existe',
                errors: { message: 'No existe un usuario con ese id' }
            });
        }

        userFound.nombre = body.nombre;
        userFound.email = body.email;
        userFound.role = body.role;

        userFound.save((err, updatedUser) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar usuario',
                    errors: err
                });
            }
            updatedUser.password = ':)';
            res.status(200).json({
                ok: true,
                user: updatedUser
            });
        });
    });

});

/*===========
delete user by id
============*/

app.delete('/:id', middlware.checkToken, (req, res) => {
    var id = req.params.id;
    Usuario.findByIdAndRemove(id, (err, deletedUser) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar usuario',
                errors: err
            });
        }

        if (!deletedUser) {
            return res.status(400).json({
                ok: false,
                message: 'There is no user with the id',
                errors: { message: 'There is no user with the id' }
            });
        }

        res.status(200).json({
            ok: true,
            user: deletedUser
        });
    });
})

module.exports = app;