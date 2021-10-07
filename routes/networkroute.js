const express = require('express')
const app = express();
const router = express.Router()
const Net = require('../models/networkmodel')
const bitcoin = require('../dev/blockchain');
const rp = require('request-promise');
const bodyParser = require('body-parser');
const { model } = require('mongoose');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

router.post('/', async function(req,res){
const newNodeUrl = req.body.newNodeUrl;
if(bitcoin.networkNodes.indexOf(newNodeUrl) == -1){
bitcoin.networkNodes.push(newNodeUrl);
/* try{
   const nodeUrl = await Net({newNodeUrl});
   const newNode = nodeUrl.save();
  }catch(err){
     console.log(err);
   } */
   }
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

module.exports = router;