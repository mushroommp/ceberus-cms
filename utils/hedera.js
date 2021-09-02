const { 
    AccountCreateTransaction, 
    AccountId,
    Client, 
    PrivateKey, 
    Hbar,
    AccountBalanceQuery
} = require("@hashgraph/sdk");
const config = require('config');
const operatorId = config.get("hederaAccountId")
const operatorKey = config.get("hederaPrivateKey")

const client = Client.forTestnet();
client.setOperator(operatorId, operatorKey);