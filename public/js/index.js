var app=angular.module('reasy',[]);

app.controller('Controller1',['$scope',function($scope) {
    $scope.obj={oi1:'oi'};
}]);

app.component('formDelivery',{
    templateUrl:'templates/form-delivery.template.html',
    controller:['$http','configObj',function($http,configObj) {
        var ctrl=this;

        
        ctrl.cover1=0;
        ctrl.delivery={
            cliente:'José do Site',
            peso:'109',
            endereco:'Rua Itapira, 114 - São Paulo/SP',
            geocode:null 
        }
        ctrl.display={
            lat:'',
            lng:''
        }

        function zerarForm() {
            ctrl.delivery.cliente='';
            ctrl.delivery.peso='';
            ctrl.delivery.endereco='';
            ctrl.delivery.geocode=null;
            ctrl.display.lat='';
            ctrl.display.lng='';
        }

        // preenche Latitude / Longitude extraindo do resultado
        function latLng(geocode) {
            var lat='',lng='';
            if(geocode && geocode.geolocalizacao && geocode.geolocalizacao.latitude) {
                lat=geocode.geolocalizacao.latitude;
                lng=geocode.geolocalizacao.longitude;
                lat=parseFloat(lat).toFixed(6);
                lng=parseFloat(lng).toFixed(6);
            }
            ctrl.display.lat=lat;
            ctrl.display.lng=lng;
        }

        ctrl.saveDelivery=function() {
            /* var cliente=ctrl.delivery.cliente;
            var peso=ctrl.delivery.peso;
            var endereco=ctrl.delivery.endereco; */

            ctrl.cover1=1;
            $http({
                method:'POST',
                url:'/deliveries',
                data:ctrl.delivery
                /* data:{
                    endereco,
                    cliente,
                    peso
                } */
            }).then((resp)=>{
                ctrl.cover1=0;
                var data=resp.data;
                if(data.delivs) {
                    var geocode=data.geocode;
                    latLng(geocode);
                    configObj.displayDelivs(data.delivs);
                    zerarForm();
                } else {
                    configObj.displayError(data.error);
                }
            }).catch((err)=>{
                ctrl.cover1=0;
                return configObj.displayError(err);
            });
        }

        ctrl.getGeocode=function() {
            var endereco=ctrl.delivery.endereco;
            ctrl.cover1=1;
            $http({
                method:'GET',
                url:'/geocode',
                params:{
                    endereco:endereco
                }
            }).then(function(ret) {
                ctrl.cover1=0;
                var data=ret.data;
                ctrl.delivery.geocode=data;
                return latLng(data);
            }).catch(function(err) {
                ctrl.cover1=0;
                return configObj.displayError(err);
            });
        }

        ctrl.deleteAll=function() {
            ctrl.cover1=1;
            $http({
                url:'/deliveries',
                method:'DELETE'
            }).then(function(ret) {
                ctrl.cover1=0;
                var array=[];
                configObj.displayDelivs(array);
                zerarForm();

            }).catch(function(err) {
                ctrl.cover1=0;
                return configObj.displayError(err);

            });

        }
        ctrl.$onInit=()=>{}
        
    }]
});

app.component('deliveryMap',{
    templateUrl:'templates/delivery-map.template.html',
    controller:['$http','configObj',function($http,configObj) {
        // pk.eyJ1IjoicmVteXBvbnNvIiwiYSI6ImNqNmlneHRnNjBqYXkycXAwZDhndWRuOXAifQ.yECdzgcXZygQ-0qIKsQORg
        const accessToken='pk.eyJ1IjoicmVteXBvbnNvIiwiYSI6ImNqNmlneHRnNjBqYXkycXAwZDhndWRuOXAifQ.yECdzgcXZygQ-0qIKsQORg';
        const ctrl=this;

        ctrl.cover1=0;

        ctrl.mymap=null;


        ctrl.delivery={};
        ctrl.delivery.deliveries=[];
        ctrl.estats={
            totalCli:0,
            totalPeso:0,
            ticketMedio:0,
            recalc:function(array) {
                var totalCli=array.length;
                var peso=0;
                array.forEach(function(elem) {
                    peso+=parseInt(elem.peso) || 0;
                });
                var ticketMedio=(peso/totalCli) || 0;
                this.ticketMedio=configObj.fmtNum(ticketMedio,3);
                this.totalCli=totalCli;
                this.totalPeso=configObj.fmtNum(peso,3);
            }
        }

        function displayError(error) {
            console.warn(error);
        }

        function fmtArrayDeliveries(array,params) {
            if(!params) params={};
            // var delIndex = params.delIndex || params.delIndex === 0 ? parseInt(params.delIndex) : -1;
            var delIndex = isNaN(params.delIndex) ? -1 : parseInt(params.delIndex);
            if(delIndex > -1) {
                array.splice(delIndex,1);
            }
            const arrRet=array.map((elem)=>{
                elem.endereco.geolocalizacao.latitude=parseFloat(elem.endereco.geolocalizacao.latitude).toFixed(3);
                elem.endereco.geolocalizacao.longitude=parseFloat(elem.endereco.geolocalizacao.longitude).toFixed(3);
                return elem;
            });

            // recalculo das estatísticas;
            ctrl.estats.recalc(arrRet);
            return arrRet;
        } // fmtArrayDeliveries

        function setMarkers(map,array) {
            var arrayRet=array.map((elem)=>{
                var lat=elem.endereco.geolocalizacao.latitude;
                var lng=elem.endereco.geolocalizacao.longitude;
                var nome=elem.nome;
                var peso=elem.peso;
                var marker=L.marker([lat,lng]).addTo(map);
                marker.bindPopup(nome+"<br>"+peso+"Kg",{className:'popup1'});
                elem.marker=marker;
                return elem;
            });


            return arrayRet;
        } // setMarkers

        // centralização do display de deliveries já loaded
        function displayDeliv(delivs) {
            ctrl.delivery.deliveries.forEach(function(elem) {
                if(elem.marker)
                    elem.marker.remove();
            });
            delivs=setMarkers(ctrl.mymap,delivs);
            ctrl.delivery.deliveries=fmtArrayDeliveries(delivs);
        } // displayDeliv



        ctrl.getDeliveries=function() {
            var map=ctrl.mymap;
            ctrl.cover1=1;
            $http({
                method:'GET',
                url:'/deliveries'
            }).then((resp)=>{
                ctrl.cover1=0;
                const array=resp.data;
                displayDeliv(array);
            }).catch(function(err) {
                ctrl.cover1=0;

            });
        }

        ctrl.removeDeliv=function(item) {
            var id=item._id;
            var marker=item.marker;
            ctrl.cover1=1;
            $http({
                method:'DELETE',
                url:'/delivery/'+id
            }).then((ret)=>{
                ctrl.cover1=0;
                var data=ret.data;
                if(data.error)
                    return configObj.displayError(data.error);
                
                marker.remove();
                var index=ctrl.delivery.deliveries.findIndex(function(elem) {
                    return elem._id === id;
                });
                ctrl.delivery.deliveries=fmtArrayDeliveries(ctrl.delivery.deliveries,{delIndex:index});
            }).catch((err)=>{
                ctrl.cover1=0;
                configObj.displayError(err);
            });
        }

        ctrl.$onInit=function() {
            ctrl.mymap = L.map('map-delivery',{zoomControl:false}).setView([-23.5525435,-46.6321646], 13);
            L.control.zoom({
                position:'bottomright'
            }).addTo(ctrl.mymap);
            L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
                // attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
                attribution: '',
                maxZoom: 18,
                id: 'mapbox.streets',
                accessToken: accessToken
            }).addTo(ctrl.mymap);

            // var marker = L.marker([-23.553498,-46.634521]).addTo(mymap);
            /* setTimeout(function() {
                marker.setLatLng([-23.56784,-46.64859]);
            },1000);*/

            ctrl.getDeliveries();
            configObj.displayDelivs=displayDeliv;
        }; // $onInit
    }]
});



/* app.controller('MainController',['$scope','$timeout','configObj',function($scope,$timeout,configObj) {
    var ctrl=this;
    // ctrl.cliente='oi22';
    $scope.cliente={var1:'oi22'};
    $timeout(()=>{
        $scope.cliente.var1='jsdkf 3k4j3';
        configObj.prop1='alterado!';
        configObj.prop2('alterado!');
        console.log('oi');
    },3000);
}]); */


app.value('configObj',{
    displayDelivs:null, // realiza o display de delivs fornecidas
    displayError:(error)=>{
        console.warn(error);
        var error2='';
        if(error && error.data && error.data.error) {
            error2=error.data.error;
        } else {
            error2=error;
        }
        alert(error2);
    },
    fmtNum:function(float,decs) {
        if(!decs) decs=2;
        float=parseFloat(float,decs).toFixed(decs);
        float=float+'';
        var index=float.indexOf('.');
        var decs2=float.substr(index+1);
        var num=float.substr(0,index);
        num=num.split('').reverse().join('').replace(/[\d]{#}/g,'$&.').split('').reverse().join('').replace(/^\./,'');
        return num+','+decs2;
    }
});


app.directive('loading',function() {
    return {
        retrict:'E',
        scope:{
            cover:'<'
        },
        template:function(elem,attrs) {
            return '<div class="cover1" ng-show="cover"><span class="icon-spin3 animate-spin"></span></div>';
        },
        link:function(scope,element) {
            element.parent().css({position:'relative'});
        }
    }
});