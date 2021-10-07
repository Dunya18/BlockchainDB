const express = require('express')
const router = express.Router()
const Try = require('../models/blocksmodel')

// get blockchain

router.get('/',async (req,res)=>{
try{
   const blocks = await Try.find();
   //console.log(blocks)
   res.send(blocks);
}catch(err){
  res.status(500).json({message:err.message})
}
});


/*router.post('/',async(req,res)=>{
    const blocks = new Try ({
     index: req.body.index,
     transaction: req.body.transaction,
     prevHash: req.body.prevHash,
     hash: req.body.hash,
     nonce: req.body.nonce
    })
    try{
        console.log('it works');
   const newblocks = await blocks.save();
           console.log('it works maybe');

}catch(err){
            console.log('it doesnt work');

  res.status(500).json({message:err.message})
}
})*/
module.exports = router