var express = require('express');
var app = express();
var Hospital = require('../models/hospital');
var bcrypt = require('bcryptjs');
var middlware = require('../middlewares/auth');

app.get('/', (req, res, next) => {
    var offset = req.query.offset || 0;
    offset = Number(offset);
    var max = req.query.max || 2;
    max = Number(max);
    Hospital.find({}).skip(offset).limit(max).populate('usuario', "nombre email").exec((err, hospitales) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error cargando hospitales',
                errors: err
            })
        }
        Hospital.count({}, (err, conteo) => {
            res.status(200).json({
                ok: true,
                data: hospitales,
                total: conteo
            });
        });

    });
});

app.post('/', middlware.checkToken, (req, res) => {
    var body = req.body;
    var hospital = new Hospital({
        nombre: body.nombre,
        img: body.img,
        usuario: req.user._id
    });
    hospital.save((err, hospitalGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear hospital',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            data: hospitalGuardado,
            userToken: req.user
        });
    });
});

app.put('/:id', middlware.checkToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;
    Hospital.findById(id, (err, hospitalEncontrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar hospital',
                errors: err
            });
        }
        if (!hospitalEncontrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El hospital con el id' + id + ' no existe',
                errors: { message: 'No existe un hospital con ese id' }
            });
        }

        hospitalEncontrado.nombre = body.nombre;

        hospitalEncontrado.save((err, hospitalActualizado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar hospital',
                    errors: err
                });
            }
            res.status(200).json({
                ok: true,
                data: hospitalActualizado,
                user: req.user
            });
        });
    });
});


app.delete('/:id', middlware.checkToken, (req, res) => {
    var id = req.params.id;
    Hospital.findByIdAndRemove(id, (err, hospital) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar el hospital',
                errors: err
            });
        }

        if (!hospital) {
            return res.status(400).json({
                ok: false,
                message: 'No hay hospital con ese identificador',
                errors: { message: 'identificador no existe' }
            });
        }

        res.status(200).json({
            ok: true,
            data: hospital
        });
    });
})


module.exports = app;