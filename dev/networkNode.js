// multiple port
const process = require('process');
const portt = process.argv[2];
const Theblock = require('../models/blocksmodel')
const Trans = require('../models/transmodel')
const Net = require('../models/networkmodel')



// import request promise library that allows us to make requests to all the other nodes in our network
const rp = require('request-promise')

// import express package
const express = require('express');
const app = express();

// import blockchain
const bitcoin = require('../dev/blockchain');

// import bodyparser ( to recieve json data)
const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

   const mongoose = require('mongoose')

   // import dbs uri 
   const {dbs} = require('./dburi');

    // middleware function to connect to db 
var connDB = function (req, res, next){
    console.log(req.headers.host);
    console.log(dbs[req.headers.host].uri);
    mongoose.connect(dbs[req.headers.host].uri,{useNewUrlParser:true})
    const db = mongoose.connection
    db.on('error',(error)=> console.error(error))
    db.once('open',()=> console.log('Connected to Database'))
    next()}
    // mongo connection  
    app.use(connDB);
    // mongo db conn done 

// create genesis block *****************************************************************************************

app.post('/receive-genesis-block', function(req,res){
    bitcoin.createNewBlock(100, '0', '0','0'); 
    res.json({
        note : "Genesis block added succefully",
    }); 

})



// get blockchain from db ********************************************************************************
const blockRouter = require('../routes/blocksroute')
app.use('/blockchain',blockRouter)




// add transaction to db *************************************************************************************
const transRouter = require('../routes/transroute');
app.use('/transaction/broadcast',transRouter);

app.post('/transaction', async function (req,res){

  const newTransaction = bitcoin.createNewTransaction(req.body.amount, req.body.sender, req.body.recipient);
    try{
     const transs = await Trans(newTransaction);
     const newtransactions = transs.save();
    }catch(err){console.log(err);}
  bitcoin.addTransactionToPendingTransaction(newTransaction);
   res.json({note : 'Transaction created and broadcast successfully'})
})



// add new block to db  *****************************************************************************************
const mineRouter = require('../routes/mineroute');
app.use('/mine',mineRouter);

app.post('/receive-new-block',async function(req,res){
  const newBlock = req.body.newBlock;
   try{
     const blocks = await Theblock(newBlock);
     const newblocks = blocks.save();
 }catch(err){console.log(err);}
    bitcoin.getLastBlock((lastBlock) =>{
  const correctHash = lastBlock.hash === newBlock.previousBlockHash;
  const correctIndex = lastBlock['index'] + 1 === newBlock['index'];
  if (correctHash && correctIndex){
  bitcoin.chain.push(newBlock);
  bitcoin.pendingTransactions = [];
  res.json({
        note : "New block received and accepted.",
        block : newBlock
    });
}
else{
   res.json({
        note : "New block rejected.",
        block : newBlock
    });
}})
});
 
/****************************************************************************************************************/
  const networkRoute = require('../routes/networkroute');
  app.use('/register-and-broadcast-node',networkRoute);

 app.post('/register-node',async function(req,res){
  const newNodeUrl = req.body.newNodeUrl;

  const nodeNotAlreadyPresent = 
          bitcoin.networkNodes.indexOf(newNodeUrl) == -1;
  const notCurrentNode = 
          bitcoin.currentNodeUrl !== newNodeUrl;

  if(nodeNotAlreadyPresent && notCurrentNode ) {
     bitcoin.networkNodes.push(newNodeUrl);

       /*      try{
   const nodeUrl = await Net({newNodeUrl});
   const newNode = nodeUrl.save();
}catch(err){
    console.log(err);
} */
          }
  res.json({note : 'New node registred with network successfully'});

  

 });
 
 app.post('/register-nodes-bulk', async function(req,res){
  const allNetworksNodes = req.body.allNetworksNodes;
 allNetworksNodes.forEach(networkNodeUrl =>{
      const nodeNotAlreadyPresent = 
          bitcoin.networkNodes.indexOf(networkNodeUrl) == -1;
  const notCurrentNode = 
          bitcoin.currentNodeUrl !== networkNodeUrl;
    if(nodeNotAlreadyPresent && notCurrentNode ){
       bitcoin.networkNodes.push(networkNodeUrl);
     /*     try{
   const nodeUrl = Net({networkNodeUrl});
   const newNode = nodeUrl.save();
}catch(err){
    console.log(err);
} */
          }
  });
    res.json({note : 'Bulk registration successful.'});

 });
 /**************************************************************************************************** */

 app.get('/consensus',async function(req, res) {
   console.log(bitcoin.networkNodes);
   var blockchainlength = 0;
	const requestPromises = [];
	bitcoin.networkNodes.forEach(networkNodeUrl => {
		const requestOptions = {
			uri: networkNodeUrl + '/blockchain',
			method: 'GET',
			json: true
		};

		requestPromises.push(rp(requestOptions));
	});
    const blocks = await Theblock.find();
	Promise.all(requestPromises)
	.then(blockchains => {
		let currentChainLength = blocks.length;
		let maxChainLength = currentChainLength;
		let newLongestChain = null;
		let newPendingTransactions = null;

		blockchains.forEach(blockchain => {
       blockchainlength = blockchain.length;
      console.log('here is the blockchain  : ',blockchainlength);
       console.log('here is the blockchain max lenght : ',maxChainLength);
    
		 	if ( blockchainlength > maxChainLength) {
				maxChainLength = blockchainlength;
				newLongestChain = blockchain;
				newPendingTransactions = blockchain['transactions'];
			}; 
		});

    
		if (!newLongestChain || (newLongestChain && !bitcoin.chainIsValid(newLongestChain))) {
			res.json({
				note: 'Current chain has not been replaced.'
			});
		}
		 else {
			bitcoin.chain = newLongestChain;
			bitcoin.pendingTransactions = newPendingTransactions;
      // first we gotta delete the corrupted blockchain
      
    Theblock.remove({},function(err,block){
      if(err){return res.json(err);}
      if(!block){return res.send(404);}
    })
    // replace it with the correct one
      for(var i=0;i<blockchainlength;i++)
      {
        var newblockchain = newLongestChain[i];
      bitcoin.createNewBlock(newblockchain['nonce'],newblockchain['previousBlockHash'],newblockchain['hash'],i);
      };
    
			res.json({
				note: 'This chain has been replaced.'
			});
		}
  
	});

});



app.listen(portt,()=>{
    console.log(` server is running at port ${portt}`);
});