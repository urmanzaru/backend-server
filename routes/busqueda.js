var express = require('express');
var app = express();
var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');
//rutas

app.get('/:tabla/:busqueda', (req, res, next) => {
    var table = req.params.tabla;
    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i');
    var promesa;
    switch (table) {
        case 'usuarios':
            promesa = buscarUsuarios(regex);
            break;
        case 'medicos':
            promesa = buscarMedicos(regex);
            break;
        case 'hospitales':
            promesa = buscarHospitales(regex);
            break;
        default:
            return res.status(400).json({
                ok: false,
                message: 'Table ' + table + 'no existe',
                error: { message: 'Colección no valido' }
            });
    }
    promesa.then(data => {
        res.status(200).json({
            ok: true,
            [table]: data
        });
    });
});


app.get('/todo/:busqueda', (req, res, next) => {

    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i');

    Promise.all([
        buscarHospitales(regex),
        buscarMedicos(regex),
        buscarUsuarios(regex)
    ]).then((respuestas) => {
        res.status(200).json({
            ok: true,
            hospitales: respuestas[0],
            medicos: respuestas[1],
            usuarios: respuestas[2]
        });
    });
});

function buscarHospitales(regex) {
    return new Promise((resolve, reject) => {
        Hospital.find({ nombre: regex }, (err, hospitales) => {
            if (err) {
                reject('Error al cargar hospitales: ', err);
            } else {
                resolve(hospitales);
            }
        });
    })
}

function buscarMedicos(regex) {
    return new Promise((resolve, reject) => {
        Medico.find({ nombre: regex }, (err, medicos) => {
            if (err) {
                reject('Error al cargar medicos: ', err);
            } else {
                resolve(medicos);
            }
        });
    })
}

function buscarUsuarios(regex) {
    return new Promise((resolve, reject) => {
        Usuario.find({ nombre: regex }, (err, usuarios) => {
            if (err) {
                reject('Error al cargar usuarios: ', err);
            } else {
                resolve(usuarios)
            }
        });
    })
}

module.exports = app;