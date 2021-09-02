const express = require('express');
const router = express.Router();
const {
    Client, 
    PrivateKey,
    TokenCreateTransaction
} = require("@hashgraph/sdk");
const config = require('config');

/**
 * @route   GET api/users
 * @desc    Get all users
 * @access  Public
*/
const operatorId = config.get("hederaAccountId")
const operatorKey = config.get("hederaPrivateKey")
const operatorPublicKey = config.get("hederaPublicKey")

const client = Client.forTestnet();
client.setOperator(operatorId, operatorKey);

router.post('/create-token', async (req, res) => {
    const { token_name, token_symbol, initial_supply } = req.body
    console.log(" ", token_name)
    console.log(" ", token_symbol)
    console.log(" ", initial_supply)
    try {
        const CreateTokenTransaction = await new TokenCreateTransaction()
            .setTokenName(token_name)
            .setTokenSymbol(token_symbol)
            .setDecimals(0)
            .setKycKey(operatorPublicKey)
            .setFreezeKey(operatorPublicKey)
            .setSupplyKey(operatorPublicKey)
            .setTreasuryAccountId(operatorId)
            .setInitialSupply(initial_supply)
            .setAdminKey(operatorPublicKey)
            .setWipeKey(operatorPublicKey)
            .freezeWith(client);

        const txResponse = await CreateTokenTransaction.execute(client);
        //Get the receipt of the the transaction    
        const receipt = await txResponse.getReceipt(client);
        const tokenId = receipt.tokenId;
        console.log("The new token ID is " + tokenId);
    }catch(e){
        res.status(400).json({ message: e.message })
    }
})

module.exports = router