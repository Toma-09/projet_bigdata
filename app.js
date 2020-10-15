const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const NodeCouchDb = require('node-couchdb');

const couch = new NodeCouchDb({
    auth: {
        user:'admin',
        password: 'admin'
    }
});

const dbName = 'custommers';
const viewUrl = '_design/all_customers/_view/allcust';

couch.listDatabases().then(function(dbs){
    console.log(dbs);
});

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.get('/', function(req, res){
    couch.get(dbName, viewUrl).then(
        function(data, headers, status){
            console.log(data.data.rows);
            res.render('index',{
               customers:data.data.rows
            });
        },
        function(err){
            res.send(err);
        });
});

app.post('/customer/add', function(req, res){
    const nom = req.body.nom;
    const email = req.body.email;
    if(req.body.rue!=null || req.body.rue!=""){
        const rue = req.body.rue;
    }
    else{
        const rue="";
    }
    if(req.body.ville!=null || req.body.ville!=""){
        const ville = req.body.ville;
    }
    else{
        const ville="";
    }
    if(req.body.département!=null || req.body.département!=""){
        const département = req.body.département;
    }
    else{
        const département="";
    }

    couch.uniqid().then(function(ids){
        const id = ids[0];

        couch.insert('custommers', {
            _id: id,
            nom: nom,
            email: email,
            adresse: {
                rue: rue,
                ville: ville,
                département: département
            }
        }).then(function(data, headers, status){
            res.redirect('/');
        },
        function(err){
            res.send(err);
        });
    });
});

app.listen(3000, function(){
    console.log('Serveur lancé sur le port 3000'); 
});