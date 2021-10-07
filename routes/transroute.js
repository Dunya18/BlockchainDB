const express = require('express')
const app = express();
const router = express.Router()
const Try = require('../models/blocksmodel')
// call bitcoin
const bitcoin = require('../dev/blockchain');
const rp = require('request-promise');
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
// call models
const Trans = require('../models/transmodel')

router.post('/', async function(req, res) {
  const newTransaction = bitcoin.createNewTransaction(req.body.amount, req.body.sender, req.body.recipient);
   try{
     const transs = await Trans(newTransaction);
     const newtransactions = transs.save();

 }catch(err){console.log(err);}
  bitcoin.addTransactionToPendingTransaction(newTransaction);
  const requestPromises = [];
  bitcoin.networkNodes.forEach(networkNodeUrl =>{
   const requestOptions = {
       uri: networkNodeUrl + '/transaction',
       method : 'POST',
       body: newTransaction,
       json: true
   };
   requestPromises.push(rp(requestOptions));
  });
  Promise.all(requestPromises).then(data =>{
       res.json({note : 'Transaction created and broadcast successfully'});
  });
});


  

module.exports = router