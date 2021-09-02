const express = require('express');
const router = express.Router();

const { 
    TokenCreateTransaction,
    Client,
    AccountInfoQuery,
    Key
} = require("@hashgraph/sdk");

const config = require('config');
const operatorId = config.get("hederaAccountId")
const operatorKey = config.get("hederaPrivateKey")

const client = Client.forTestnet();
client.setOperator(operatorId, operatorKey);

/**
 * @route   POST api/admin
 * @desc    Create new token
 * @access  Public
*/

router.post('/create-token', async (req, res) => {
    const { token_name, token_symbol, initial_supply } = req.body;
    
    const response = await new TokenCreateTransaction()
        .setTokenName(token_name)
        .setTokenSymbol(token_symbol)
        .setInitialSupply(initial_supply)
        .setTreasuryAccountId(operatorId)
        .execute(client);

    const token = (await response.getReceipt(client)).tokenId;

    return res.status(200).json({ token_id: token });
})

router.get('/all-token', async (req, res) => {
    let tokensArray = []
    const query = new AccountInfoQuery()
        .setAccountId(operatorId);

    //Sign with client operator private key and submit the query to a Hedera network
    const accountInfo = await query.execute(client);
    let tokens = accountInfo.tokenRelationships._map
    
    for(let [key, value] of tokens){
        let token_id = key
        let token_symbol = value.symbol
        let token_balance = value.balance.low
        let token_kyc_granted = value.isKycGranted
        let token_is_frozen = value.isFrozen

        let newObj = {
            token_id,
            token_symbol,
            token_balance,
            token_kyc_granted,
            token_is_frozen
        }
        
        tokensArray.push(newObj)
    }

    return res.status(200).json({ tokens: tokensArray });
})

module.exports = router