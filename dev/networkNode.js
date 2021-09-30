// multiple port
const process = require('process');
const portt = process.argv[2];
const Try = require('../models/blocksmodel')
const Trans = require('../models/transmodel')


// import request promise library that allows us to make requests to all the other nodes in our network
const rp = require('request-promise');

// import our blockchain
/* const Blockchain = require('./blockchain');
const bitcoin = new Blockchain(); */

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

// get blockchain from db
const blockRouter = require('../routes/blocksroute')
app.use('/blockchain',blockRouter)

// add transaction to db
const transRouter = require('../routes/transroute');
app.use('/transaction/broadcast',transRouter);

app.post('/transaction', async function (req,res){
  const newTransaction = bitcoin.createNewTransaction(req.body.amount, req.body.sender, req.body.recipient);
    try{
     const transs = await Trans(newTransaction);
     const newtransactions = transs.save();
    }catch(err){console.log(err);}
  bitcoin.addTransactionToPendingTransaction(newTransaction);
})

// add new block to db 
const mineRouter = require('../routes/mineroute');
app.use('/mine',mineRouter);

app.post('/receive-new-block',async function(req,res){
  const newBlock = req.body.newBlock;
   try{
     const blocks = await Try(newBlock);
     const newblocks = blocks.save();
 }catch(err){console.log(err);}
  const lastBlock = bitcoin.getLastBlock();
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
}
});
 
/****************************************************************************************************************/

 app.post('/register-and-broadcast-node', function(req,res){
const newNodeUrl = req.body.newNodeUrl;
if(bitcoin.networkNodes.indexOf(newNodeUrl) == -1)
bitcoin.networkNodes.push(newNodeUrl);

const regNodesPromises =[];
bitcoin.networkNodes.forEach(networkNodeUrl =>{
  const requestOptions = {
      uri: networkNodeUrl + '/register-node',
      method: 'POST',
      body: { newNodeUrl: newNodeUrl},
      json: true
  }
  regNodesPromises.push(rp(requestOptions));
});

Promise.all(regNodesPromises).then(data =>{
   const bulkRegisterOptions = {
     uri: newNodeUrl+ '/register-nodes-bulk',
      method: 'POST',
      body: {allNetworksNodes:[...bitcoin.networkNodes,bitcoin.currentNodeUrl]},
      json: true  
   } ; 
   return rp(bulkRegisterOptions);
}).then(data =>{
  res.json({note : 'New node registred with network successfully'});
});

 });

 app.post('/register-node',function(req,res){
  const newNodeUrl = req.body.newNodeUrl;

  const nodeNotAlreadyPresent = 
          bitcoin.networkNodes.indexOf(newNodeUrl) == -1;
  const notCurrentNode = 
          bitcoin.currentNodeUrl !== newNodeUrl;

  if(nodeNotAlreadyPresent && notCurrentNode ) bitcoin.networkNodes.push(newNodeUrl);

  res.json({note : 'New node registred with network successfully'});

  

 });
 
 app.post('/register-nodes-bulk',function(req,res){
  const allNetworksNodes = req.body.allNetworksNodes;
  allNetworksNodes.forEach(networkNodeUrl =>{
      const nodeNotAlreadyPresent = 
          bitcoin.networkNodes.indexOf(networkNodeUrl) == -1;
  const notCurrentNode = 
          bitcoin.currentNodeUrl !== networkNodeUrl;
          if(nodeNotAlreadyPresent && notCurrentNode )
    bitcoin.networkNodes.push(networkNodeUrl);
  });
    res.json({note : 'Bulk registration successful.'});

 });
 /**************************************************************************************************** */

 app.get('/consensus', function(req, res) {
	const requestPromises = [];
	bitcoin.networkNodes.forEach(networkNodeUrl => {
		const requestOptions = {
			uri: networkNodeUrl + '/blockchain',
			method: 'GET',
			json: true
		};

		requestPromises.push(rp(requestOptions));
	});

	Promise.all(requestPromises)
	.then(blockchains => {
		const currentChainLength = bitcoin.chain.length;
		let maxChainLength = currentChainLength;
		let newLongestChain = null;
		let newPendingTransactions = null;

		blockchains.forEach(blockchain => {
			if (blockchain.chain.length > maxChainLength) {
				maxChainLength = blockchain.chain.length;
				newLongestChain = blockchain.chain;
				newPendingTransactions = blockchain.pendingTransactions;
			};
		});


		if (!newLongestChain || (newLongestChain && !bitcoin.chainIsValid(newLongestChain))) {
			res.json({
				note: 'Current chain has not been replaced.',
				chain: bitcoin.chain
			});
		}
		else {
			bitcoin.chain = newLongestChain;
			bitcoin.pendingTransactions = newPendingTransactions;
			res.json({
				note: 'This chain has been replaced.',
				chain: bitcoin.chain
			});
		}
	});
});



app.listen(portt,()=>{
    console.log(` server is running at port ${portt}`);
});