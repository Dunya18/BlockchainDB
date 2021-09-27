const express = require('express')
const router = express.Router()
const Try = require('../models/blocksmodel')
// create bitcoin
const Blockchain = require('../dev/blockchain');
const bitcoin = new Blockchain();

router.post('/',function (req,res){
  const newTransaction = req.body;
  bitcoin.addTransactionToPendingTransaction(newTransaction);
})

module.exports = router