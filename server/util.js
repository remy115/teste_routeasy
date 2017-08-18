// converte o resultado obtido na API do geocode
var convertGeoResult=function(geoResult) {
 var arrRet=[];
    arrRet=geoResult.map(function(elem) {
        var retObj={}
        elem.address_components.forEach(function(elem2) {
            var types=elem2.types;
            var longName=elem2.long_name;
            if(types.findIndex((subelem1)=>subelem1 === 'street_number') > -1) {
                retObj.number=longName;
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

module.exports={convertGeoResult}