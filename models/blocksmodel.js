
mongoose = require('mongoose')

var blockSchema = new mongoose.Schema({
    index: {
        required:true,
        type: Number
    },
   
     transaction: {
        required:true,
        type: String
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