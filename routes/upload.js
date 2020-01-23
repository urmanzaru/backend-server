var express = require('express');
var fileUpload = require('express-fileupload');
var fs = require('fs');
var app = express();
var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');
app.use(fileUpload());
//rutas
app.put('/:tipo/:id', (req, res, next) => {
    var tipo = req.params.tipo;
    var id = req.params.id;

    // tipos de colección
    var tiposValidos = ['hospitales', 'medicos', 'usuarios'];
    if (tiposValidos.indexOf(tipo) < 0) {
        res.status(400).json({
            ok: true,
            mensaje: 'Tipo de colección no valido',
            errors: { message: 'Los tipos validos son ' + tiposValidos.join(',') }
        });
    }
    if (!req.files) {
        res.status(400).json({
            ok: true,
            mensaje: 'No incluye archivo',
            errors: { message: 'Debe subir la imagen' }
        });
    }
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado[nombreCortado.length - 1];

    // extensiones validas
    var extensionesvalidas = ['png', 'jpg', 'gif', 'jpeg'];
    if (extensionesvalidas.indexOf(extensionArchivo) < 0) {
        res.status(400).json({
            ok: true,
            mensaje: 'Extensión no valdida',
            errors: { message: 'Las extensiones validas son ' + extensionesvalidas.join(',') }
        });
    }

    // nombre de archivo personalizado
    var nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extensionArchivo}`;
    // mover el archivo de temporal a un path
    var path = `./uploads/${tipo}/${nombreArchivo}`;
    archivo.mv(path, (err) => {
        if (err) {
            res.status(400).json({
                ok: true,
                mensaje: 'error al mover el archivo',
                errors: { message: err }
            });
        }
        subirPorTipo(tipo, id, nombreArchivo, res);
        // res.status(200).json({
        //     ok: true,
        //     mensaje: 'Archivo movido',
        //     nombreCortado: nombreCortado
        // });
    });

});

function subirPorTipo(tipo, id, nombreArchivo, res) {
    if (tipo === 'usuarios') {
        Usuario.findById(id, (err, usuario) => {
            if (!usuario) {
                res.status(500).json({
                    ok: false,
                    error: 'Usuario no existe'
                });
            }
            var pathOld = './uploads/usuarios/' + usuario.img;
            // si existe elimina la imagen anterior
            if (fs.existsSync(pathOld)) {
                fs.unlink(pathOld);
            }
            usuario.password = ':)';
            usuario.img = nombreArchivo;
            usuario.save((err, usuarioActualizado) => {
                res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de usuario actualizado',
                    data: usuarioActualizado
                });
            });

        });
    }
    if (tipo === 'medicos') {
        Medico.findById(id, (err, medico) => {
            if (!medico) {
                res.status(500).json({
                    ok: false,
                    error: 'Medico no existe'
                });
            }
            if (err) {
                res.status(500).json({
                    ok: false,
                    mensaje: 'error al mover el archivo',
                    errors: { message: err }
                });
            }
            var pathOld = './uploads/medicos/' + medico.img;
            // si existe elimina la imagen anterior
            if (fs.existsSync(pathOld)) {
                fs.unlink(pathOld);
            }
            medico.img = nombreArchivo;
            medico.save((err, medicoActualizado) => {
                if (err) {
                    res.status(500).json({
                        ok: true,
                        mensaje: 'error al actualizar el médico',
                        error: err
                    });
                }
                res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de medico actualizado',
                    data: medicoActualizado
                });
            });
        });
    }
    if (tipo === 'hospitales') {
        Hospital.findById(id, (err, hospital) => {
            if (!hospital) {
                res.status(500).json({
                    ok: false,
                    error: 'Hospital no existe'
                });
            }
            var pathOld = './uploads/hospitales/' + hospital.img;
            // si existe elimina la imagen anterior
            if (fs.existsSync(pathOld)) {
                fs.unlink(pathOld);
            }
            hospital.img = nombreArchivo;
            hospital.save((err, hospitalActualizado) => {
                res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de hospital actualizado',
                    data: hospitalActualizado
                });
            });
        });
    }
}

module.exports = app;