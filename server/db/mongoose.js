// configuração centralizada do mongoose
const mongoose=require('mongoose')

const url='mongodb://localhost:27017/Routeasy_Remy';

mongoose.Promise=global.Promise;

mongoose.connect(url);

module.exports={mongoose}