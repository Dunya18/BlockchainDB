const express = require('express')
const router = express.Router()
const Try = require('../models/blocksmodel')
// call bitcoin
const bitcoin = require('../dev/blockchain');

router.post('/',function (req,res){
  const newTransaction = bitcoin.createNewTransaction(req.body.amount, req.body.sender, req.body.recipient);
  bitcoin.addTransactionToPendingTransaction(newTransaction);

})


  

module.exports = router