
mongoose = require('mongoose')

var blockSchema = new mongoose.Schema({
    index: {
        required:true,
        type: Number
    },
   
     transactions: {
        required:true,
        type: Array
    },
     prevHash: {
        required:false,
        type: String
    },
     hash: {
        required:true,
        type:String
    },
     nonce: {
        required:true,
        type: Number
    }
});

module.exports = mongoose.model('dou', blockSchema)