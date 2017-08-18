const express=require('express')
const bodyParser=require('body-parser')
const _=require('lodash')
// AIzaSyDi8Cm6cxXpFaQ-OW4izj-g0N53wJb76G0

const gMaps = require('@google/maps').createClient({
  key: 'AIzaSyDi8Cm6cxXpFaQ-OW4izj-g0N53wJb76G0',
  Promise:Promise
});

const {convertGeoResult} = require('./util');
const {mongoose}=require('./db/mongoose')
const {Delivery}=require('./models/delivery')

const app=express();
const port=parseInt(process.argv[2]) || 3000;

app.use(bodyParser.json());

app.post('/deliveries',function(req,res) {

    gMaps.geocode({
        address:'Rua São Benedito, 2650 - São Paulo/SP'
    },function(err,resp) {
        if(err)
            throw new Error(err);
        
        var resp=resp.json.results;
        console.log('resp geocoding',JSON.stringify(resp));
    });

    var cliente=req.body;
    var deliver=new Delivery(cliente);
    deliver.save()
        .then(()=>{
            res.status(200).send('salvou');
        })
        .catch((e)=>{
            res.status(400).send(e);
        });
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