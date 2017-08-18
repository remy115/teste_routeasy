const mongoose=require('mongoose')

let schemaStr={
    type:String,
    required:false,
    trim:true
}

const Delivery=mongoose.model('Delivery',{
    nome:schemaStr,
    peso:{
        type:Number,
        required:true,
        trim:true
    },
    endereco:{
        logradouro:schemaStr,
        numero:{
            type:Number
        },
        bairro:schemaStr,
        complemento:String,
        cidade:schemaStr,
        estado:schemaStr,
        pais:schemaStr,
        geolocalizacao:{
            latitude:{
                type:Number,
                required:false
            },
            longitude:{
                type:Number,
                required:false
            }
        }
    }
});

module.exports={Delivery}