const gMaps = require('@google/maps').createClient({
  key: 'AIzaSyDi8Cm6cxXpFaQ-OW4izj-g0N53wJb76G0',
  Promise:Promise
});

var getGeoCode = function(address) {
    return new Promise((res,rej)=>{
        if(!address) {
            return rej({error:'Endereço não fornecido!',status:400});
        }
        gMaps.geocode({address}).asPromise().then(function(resp) {
            var results=resp.json.results;
            var status=resp.json.status;
            // console.log('geocode addr: '+address,results);
            if(status == 'OK') {
                return res(results);
            } else if(status == 'ZERO_RESULTS') {
                return rej({error:'Nenhum resultado encontrado!',status:400});
            } else {
                console.warn(status);
                return rej({error:'Erro Indefinido!',status:500});
            }

        }).catch((err)=>{
            console.warn(err);
            return rej({error:'Erro Indefinido!',status:500});
        });
    });
}

// converte o resultado obtido na API do geocode
var convertGeoResult=function(geoResult) {
 var arrRet=[];
    arrRet=geoResult.map(function(elem) {
        var retObj={}
        elem.address_components.forEach(function(elem2) {
            var types=elem2.types;
            var longName=elem2.long_name;
            if(types.findIndex((subelem1)=>subelem1 === 'street_number') > -1) {
                retObj.numero=longName;
            } else if(types.findIndex((subelem1)=>subelem1 === 'route') > -1) {
                retObj.logradouro=longName;
            } else if(types.findIndex((subelem1)=>subelem1 === 'sublocality') > -1) {
                retObj.bairro=longName;
            } else if(types.findIndex((subelem1)=>subelem1 === 'administrative_area_level_2') > -1) {
                retObj.cidade=longName;
            } else if(types.findIndex((subelem1)=>subelem1 === 'administrative_area_level_1') > -1) {
                retObj.estado=longName;
            } else if(types.findIndex((subelem1)=>subelem1 === 'country') > -1) {
                retObj.pais=longName;
            } else if(types.findIndex((subelem1)=>subelem1 === 'postal_code') > -1) {
                retObj.cep=longName;
            }
        });
        // address_components

        var geometry=elem.geometry;
        retObj.geolocalizacao={
            latitude:geometry.location.lat,
            longitude:geometry.location.lng
        }
        retObj.viewport=geometry.viewport;

        return retObj;
    });
    return arrRet;
}

module.exports={convertGeoResult,getGeoCode}