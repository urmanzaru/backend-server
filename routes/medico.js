var express = require('express');
var app = express();
var Medico = require('../models/medico');
var bcrypt = require('bcryptjs');
var middlware = require('../middlewares/auth');


app.get('/', (req, res, next) => {
    Medico.find({}).populate('usuario', 'nombre email').populate('hospital').exec((err, medicos) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error cargando medicos',
                errors: err
            })
        }
        res.status(200).json({
            ok: true,
            data: medicos
        });
    });
});

app.post('/', middlware.checkToken, (req, res) => {
    var body = req.body;
    var medico = new Medico({
        nombre: body.nombre,
        img: body.img,
        usuario: req.user._id,
        hospital: body.hospital
    });
    medico.save((err, medicoGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear medico',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            data: medicoGuardado,
            userToken: req.user
        });
    });
});

app.put('/:id', middlware.checkToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;
    Medico.findById(id, (err, medicoEncontrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar medico',
                errors: err
            });
        }
        if (!medicoEncontrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El medico con el id' + id + ' no existe',
                errors: { message: 'No existe un medico con ese id' }
            });
        }

        medicoEncontrado.nombre = body.nombre;

        medicoEncontrado.save((err, medicoActualizado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar medico',
                    errors: err
                });
            }
            res.status(200).json({
                ok: true,
                data: medicoActualizado,
                user: req.user
            });
        });
    });
});


app.delete('/:id', middlware.checkToken, (req, res) => {
    var id = req.params.id;
    Medico.findByIdAndRemove(id, (err, medico) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar el medico',
                errors: err
            });
        }

        if (!medico) {
            return res.status(400).json({
                ok: false,
                message: 'No hay medico con ese identificador',
                errors: { message: 'identificador no existe' }
            });
        }

        res.status(200).json({
            ok: true,
            data: medico
        });
    });
})


module.exports = app;