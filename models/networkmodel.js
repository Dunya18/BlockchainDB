mongoose = require('mongoose');


var networkSchema = new mongoose.Schema({
    newNodeUrl : {
       required : true,
       type : String
    }
});
 
module.exports = mongoose.model('node',networkSchema);    