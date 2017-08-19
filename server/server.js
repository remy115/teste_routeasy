const path=require('path')
const publicPath=path.join(__dirname,'../','public/');
const express=require('express')
const bodyParser=require('body-parser')
const _=require('lodash')
// AIzaSyDi8Cm6cxXpFaQ-OW4izj-g0N53wJb76G0



const {convertGeoResult,getGeoCode} = require('./util');
const {mongoose}=require('./db/mongoose')
const {Delivery}=require('./models/delivery')

const app=express();
const port=parseInt(process.argv[2]) || 3000;


function geocodeMiddleware(req,res,next) {
    if(req.query.endereco || ! req.body.geocode) {
        var endereco=req.query.endereco || req.body.endereco;
        return getGeoCode(endereco).then(function(resp) {
            const arrRet=convertGeoResult(resp);
            if(arrRet) {
                req.geocode=arrRet[0];
                return next();
                // return res.send(arrRet[0]);
            }
            return res.status(500).send('error!');
        },(rej)=>{
            return res.status(rej.status).send(rej);
        }).catch((err)=>{
            return res.status(err.status).send(err);
        });
    }
    req.geocode=req.body.geocode;
    next();
}

app.use(express.static(publicPath));

app.use(bodyParser.json());

app.get('/geocode',geocodeMiddleware,function(req,res) {
    var geocode=req.geocode;
    res.send(geocode);
    /* var endereco=req.query.endereco;
    getGeoCode(endereco).then(function(resp) {
        const arrRet=convertGeoResult(resp);
        if(arrRet) {
            return res.send(arrRet[0]);
        }
        return res.status(500).send('error!');
    },(rej)=>{
        return res.status(rej.status).send(rej);
    }).catch((err)=>{
        return res.status(err.status).send(err);
    }); */
});


app.get('/deliveries',function(req,res) {
    Delivery.find().then((ret)=>{
        res.send(ret);
    }).catch(err=>res.status(400).send(err));
});

app.post('/deliveries',geocodeMiddleware,function(req,res) {
    const endereco=req.body.endereco;
    const cliente=req.body.cliente;
    const peso=req.body.peso;
    const geocode=req.geocode;

    const delivObj={
        nome:cliente,
        peso:peso,
        endereco:geocode
    };
    const delivery=new Delivery(delivObj);
    delivery.save()
    .then((ret)=>{
        return Delivery.find();
    }).then((ret)=>{
        res.status(200).send({
            delivs:ret,
            geocode:geocode
        });
    }).catch((err)=>{
        console.warn(err);
        res.status(400).send(err);
    });

}); // POST /deliveries


app.delete('/delivery/:id',function(req,res) {
    const id=req.params.id;
    if(id) {
        return Delivery.findByIdAndRemove(id).then((ret)=>{
            var msg={}
            if(!ret || (ret && !ret._id == id)) {
                msg.error='Registro não encontrado!';
            }
            res.send(msg);
        }).catch((err)=>{
            console.warn('erro ao remover delivery',err);
            res.status(500).send({error:'Erro ao remover o registro!'});
        });
    } else {
        res.status(400).send({error:'Id inválido!'});
    }
});

app.delete('/deliveries',function(req,res) {
    // só p/ testar o efeito do "loading" no front-end...
    setTimeout(function() {
        Delivery.deleteMany().then(function(ret) {
            res.send('ok');
        }).catch((err)=>{
            res.status(500).send({error:'Não foi possível remover os cadastros!'});
        });
    },2000);
});

app.listen(port,function() {
    console.log(`Listening on port ${port}`);
});