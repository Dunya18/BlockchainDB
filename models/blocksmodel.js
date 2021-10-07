
mongoose = require('mongoose')

var blockSchema = new mongoose.Schema({
    index: {
        required:true,
        type: Number
    },
    timestamp : {
        type : Date
    },

     transactions: {
        required:true,
        type: Array
    },
     previousBlockHash: {
        required:true,
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

module.exports = mongoose.model('block', blockSchema)