var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var NodeCouchDb = require('node-couchdb');
const hostname='127.0.0.1';
const port = 3000;

const couch = new NodeCouchDb({
    auth: {
        user:'admin',
        password: 'admin'
    }
});

const dbName = 'clients';
const viewUrl = '_design/clients/_view/vue_client';

//Si aucune base n'existe, on en créé une

/*

if(couch.listDatabases.rows == 0){
    couch.createDatabase(dbName).then(
        console.log("Base créée avec succès !"),
        function(data, headers, status){
            res.redirect('/');
        });
}
//Liste des bases de données sur le CLI
else{
    couch.listDatabases().then(function(dbs){
        console.log(dbs);
    });
}

//Si aucun document n'est présent (suite à la création de la base, on en créé un)

if(dbName.data.rows == 0){
    couch.insert('clients', {
        _id: id,
        nom: "",
        prenom: "",
        email: "",
        adresse: ""
    });
}

*/

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

//On va chercher le contenu des vues de la BDD

app.get('/', function(req, res){
    couch.get(dbName, viewUrl).then(
        function(data, headers, status){
            res.render('index',{
               clients:data.data.rows
            });
        },
        function(err){
            res.send(err);
        });
});

/*

app.post('/clients/del', function(req, res){
    couch.dropDatabase(dbName).then(
        console.log("Base de données supprimée avec succès")
        ,
        function(err){
            res.send(err);
    });
});

*/

//On récupère les informations entrées pour créer un nouveau client dans la base.

app.post('/clients/add', function(req, res){
    const nom = req.body.nom;
    const prenom = req.body.prenom;
    if(req.body.email != null || req.body.email != ""){
        const email = req.body.email;
    }
    else{
        const email = "";
    }
    if(req.body.adresse != null || req.body.adresse != ""){
        const adresse = req.body.adresse;
    }
    else{
        const adresse = "";
    }

//Création d'un id pour le client

    couch.uniqid().then(function(ids){
        const id = ids[0];

//Insertion du client dans la base

        couch.insert('clients', {
            _id: id,
            nom: nom,
            prenom: prenom,
            email: email,
            adresse: adresse
        }).then(function(data, headers, status){
            res.redirect('/');
        },
        function(err){
            res.send(err);
        });
    });
});

var server = app.listen(port, hostname, () => {
    console.log("Serveur lancé à l\'adresse http://%s:%s", hostname, port); 
});