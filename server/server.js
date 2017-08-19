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



    /* var geocode;
    getGeoCode(endereco).then(function(resp) {
        // console.log('resp geocoding',JSON.stringify(resp));
        const arrRet=convertGeoResult(resp);
        const delivObj={
            nome:cliente,
            peso:peso,
            endereco:arrRet[0]
        };
        geocode=arrRet[0];
        const delivery=new Delivery(delivObj);
        return delivery.save();
        // res.send(arrRet);
    }).then((ret)=>{
        return Delivery.find();
    }).then((ret)=>{
        res.status(200).send({
            delivs:ret,
            geocode:geocode
        });
    }).catch((err)=>{
        console.warn(err);
        res.status(400).send(err);
    }); */


}); // POST /deliveries

app.delete('/delivery/:id',function(req,res) {
    const id=req.params.id;
    if(id) {
        return Delivery.findByIdAndRemove(id).then((ret)=>{
            var msg={}
            if(!ret._id == id) {
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

app.get('/test1',function(req,res) {
    var str='[{"address_components":[{"long_name":"2650","short_name":"2650","types":["street_number"]},{"long_name":"Rua São Benedito","short_name":"Rua São Benedito","types":["route"]},{"long_name":"Santo Amaro","short_name":"Santo Amaro","types":["political","sublocality","sublocality_level_1"]},{"long_name":"São Paulo","short_name":"São Paulo","types":["administrative_area_level_2","political"]},{"long_name":"São Paulo","short_name":"SP","types":["administrative_area_level_1","political"]},{"long_name":"Brazil","short_name":"BR","types":["country","political"]},{"long_name":"04735-004","short_name":"04735-004","types":["postal_code"]}],"formatted_address":"Rua São Benedito, 2650 - Santo Amaro, São Paulo - SP, 04735-004, Brazil","geometry":{"bounds":{"northeast":{"lat":-23.6366321,"lng":-46.69314809999999},"southwest":{"lat":-23.6366418,"lng":-46.6931636}},"location":{"lat":-23.6366321,"lng":-46.6931636},"location_type":"RANGE_INTERPOLATED","viewport":{"northeast":{"lat":-23.6352879697085,"lng":-46.6918068697085},"southwest":{"lat":-23.6379859302915,"lng":-46.6945048302915}}},"partial_match":true,"place_id":"EklSdWEgU8OjbyBCZW5lZGl0bywgMjY1MCAtIFNhbnRvIEFtYXJvLCBTw6NvIFBhdWxvIC0gU1AsIDA0NzM1LTAwNCwgQnJhc2ls","types":["street_address"]}]';
    var obj=JSON.parse(str);
    arrRet=convertGeoResult(obj);
    res.send(arrRet);
}); // test1

app.listen(port,function() {
    console.log(`Listening on port ${port}`);
});