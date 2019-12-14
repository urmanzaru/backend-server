// Requires
var express = require('express');
var mongoose = require('mongoose');

// Inicializar variables
var app = express();

//importar rutas
var appRoutes = require('./routes/app');
var appUser = require('./routes/usuario');

//coneccion a la base de datos
mongoose.connection.openUri('mongodb://localhost:27017/hospitaldb', (err, res) => {

    if (err) throw err;
    console.log('base de datos corriendo en el puerto 27017:\x1b[32m%s\x1b[0', 'online');
});

// rutas
app.use('/usuario', appUser);
app.use('/', appRoutes);

//escuchar peticiones
app.listen(3000, () => {
    console.log('Express server corriendo en el puerto 3000:\x1b[32m%s\x1b[0', 'online');
});