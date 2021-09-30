
mongoose = require('mongoose')

var transSchema = new mongoose.Schema({
    amount: {
        required:true,
        type: Number
    },
   
     sender: {
        required:true,
        type: String
    },
     recipient: {
        required:false,
        type: String
     }
});

module.exports = mongoose.model('transaction', transSchema)