// call block model
const blockchainModel = require('../models/blocksmodel');

//const uuid = require('uuid');
const { v4: uuidv4 } = require('uuid');
const sha256 = require('sha256');
const currentNodeUrl = process.argv[3];
function Blockchain(){
    this.chain = [];
    this.pendingTransactions = [];
    this.currentNodeUrl = currentNodeUrl;
    this.networkNodes = [];
    // genesis block
  //  this.createNewBlock(100, '0', '0'); 
}

Blockchain.prototype.createNewBlock = function (nonce, previousBlockHash, hash, index){
    
    const newBlock = {
        index : index,//this.chain.length + 1,
        timestamp : Date.now(),
        previousBlockHash : previousBlockHash,
                transactions : this.pendingTransactions,

        hash : hash,
        nonce : nonce 
    };
     let addBlock = new blockchainModel(newBlock)
    addBlock.save((err) =>{if (err) console.log(err);
    console.log('saved succefully')}); 
    this.pendingTransactions = [];
    this.chain.push(newBlock);
    return newBlock;
}

Blockchain.prototype.getLastBlock = function (callback) { 
    // get last block from database
  return blockchainModel.findOne({},null,{sort : {_id : -1}, limit : 1}, (err,block)=>{
      if(err){return console.log('can not find the last block')}
      else{
    return callback(block);
}
  })
 //return this.chain[this.chain.length - 1];
}

Blockchain.prototype.createNewTransaction = function (amount, sender, recipient) {
 const newTransaction = {
 amount: amount,
 sender: sender,
 recipient: recipient,
 transactionId: uuidv4().split('-').join()
 };
  return newTransaction;
};
 Blockchain.prototype.addTransactionToPendingTransaction = function(transactionObj){
      	this.pendingTransactions.push(transactionObj);
    return console.log('yo');//console.log(this.getLastBlock((lastBlock) =>{lastBlock.index +1}));
 }

Blockchain.prototype.hashBlock = function(previousBlockHash, currentBlockData, nonce) {
    const dataAsString = previousBlockHash + nonce.toString()+ JSON.stringify( currentBlockData);
    const hash = sha256(dataAsString);
    return hash;
}

Blockchain.prototype.proofOfWork = function( previousBlockHash, currentBlockData) { 
 let nonce = 0;
 let hash = this.hashBlock(previousBlockHash, currentBlockData, nonce); 
 while (hash.substring(0, 4) !== '0000') {
 nonce++;
 hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
 } 
 return nonce;
}


Blockchain.prototype.chainIsValid = function(blockchain) {
	let validChain = true;

	for (var i = 1; i < blockchain.length; i++) {
		const currentBlock = blockchain[i];
		const prevBlock = blockchain[i - 1];
		const blockHash = this.hashBlock(prevBlock['hash'], { transactions: currentBlock['transactions'], index: currentBlock['index'] }, currentBlock['nonce']);
		if (blockHash.substring(0, 4) !== '0000') validChain = false;
		if (currentBlock['previousBlockHash'] !== prevBlock['hash']) validChain = false;
	};

	const genesisBlock = blockchain[0];
	const correctNonce = genesisBlock['nonce'] === 100;
	const correctPreviousBlockHash = genesisBlock['previousBlockHash'] === '0';
	const correctHash = genesisBlock['hash'] === '0';
	const correctTransactions = genesisBlock['transactions'].length === 0;

	if (!correctNonce || !correctPreviousBlockHash || !correctHash || !correctTransactions) validChain = false;

	return validChain;
};
const bitcoin = new Blockchain();

module.exports = bitcoin;