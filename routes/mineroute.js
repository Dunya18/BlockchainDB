 const express = require('express')
const app = express();
const router = express.Router()
const Try = require('../models/blocksmodel')
const bitcoin = require('../dev/blockchain');
const rp = require('request-promise');
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

router.get('/', async function(req, res) {
    console.log('we are here on first');
   bitcoin.getLastBlock((lastBlock) =>{
  //  if(lastBlock){
    console.log('we are here');
    if(lastBlock){
    var previousBlockHash = lastBlock.hash;
    var index = lastBlock.index + 1;
  }
    else{
      var previousBlockHash = 0;
      var index = 0;
    }
    //console.log(previousBlockHash);
    const currentBlockData ={
    transactions : bitcoin.pendingTransactions,
        index : lastBlock.index + 1
    };
    const nonce = bitcoin.proofOfWork(previousBlockHash, currentBlockData);
    const blockHash = bitcoin.hashBlock(previousBlockHash, currentBlockData, nonce);
    const newBlock = bitcoin.createNewBlock(nonce, previousBlockHash,blockHash,index);
    
    const requestPromises = [];
    bitcoin.networkNodes.forEach(networkNodeUrl => {
       const requestOptions = {
         uri : networkNodeUrl +'/receive-new-block',
         method : 'POST',
         body : {newBlock : newBlock},
         json : true
       };
       requestPromises.push(rp(requestOptions));
    });
    Promise.all(requestPromises).then(data => {
 res.json({
        note : "New block mined succefully",
        block : newBlock
    }); 
     });
   // }
    });
  
    
 /* try{
     const blocks = await Try(newBlock);
     const newblocks = blocks.save();
 }catch(err){console.log(err);} */
    
});




module.exports = router
