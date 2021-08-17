const express = require('express');
const router = express.Router();
const { 
    AccountCreateTransaction, 
    AccountId,
    Client, 
    PrivateKey, 
    Hbar,
    AccountBalanceQuery
} = require("@hashgraph/sdk");

const bcrypt = require('bcrypt');
const config = require('config');
const jwt = require('jsonwebtoken');
const auth = require('../../middleware/auth')
// Load User model
// const Users = require('../../models/UserAccount');
const Users = require('../../models/User');

/**
 * @route   GET api/users
 * @desc    Get all users
 * @access  Public
*/
const operatorId = config.get("hederaAccountId")
const operatorKey = config.get("hederaPrivateKey")

const client = Client.forTestnet();
client.setOperator(operatorId, operatorKey);

router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    
    // Simple validation
    if(!name || !email || !password){
        return res.status(400).json({ msg: 'Please enter all fields'});
    }

    // Check for existing users
    Users.findOne({ email })
        .then(async (user) => {
            if(user){
                return res.status(400).json({ msg: 'User already exists' });
            }

            const newUserPrivateKey = PrivateKey.generate();
            const newUserPublicKey = newUserPrivateKey.publicKey;

            const transaction = await new AccountCreateTransaction()
                .setKey(newUserPrivateKey.publicKey)
                .setInitialBalance(new Hbar(5)) // 10 h

            //Get transaction response
            const txResponse = await transaction.execute(client);
            const receipt = await txResponse.getReceipt(client);
            const newAccountId = receipt.accountId;

            const query = new AccountBalanceQuery()
            .setAccountId(newAccountId);

            //Submit the query to a Hedera network
            const userAccountBalance = await query.execute(client);

            const newUser = new Users({
                name,
                email,
                password,
                hederaPrivateKey: newUserPrivateKey,
                hederaPublicKey: newUserPublicKey,
                hederaAccountId: newAccountId
            })

            // Create salt & hash
            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(newUser.password, salt, (err, hash) => {
                    if(err){
                        throw err;
                    }
                    newUser.password = hash;
                    newUser.save()
                        .then(user => {
                            jwt.sign(
                                { id: user.id },
                                config.get("jwtSecret"),
                                { expiresIn: 3600 },
                                (err, token) => {
                                    if(err){
                                        throw err;
                                    }

                                    res.json({
                                        token,
                                        user: {
                                            id: user.id,
                                            username: user.name,
                                            email: user.email
                                        }
                                    })
                                }
                            )
                        })
                })
            })
        })
});

router.get('/token-balance', async (req,res) => {
    const { hederaId } = req.query

    try {
        const accountBalance = await new AccountBalanceQuery()
            .setAccountId(hederaId)
            .execute(client);

        if(accountBalance){
            return res.status(200).json({ account_balance: accountBalance })
        }

    }catch(e){
        return res.status(400).json({ message: 'Something went wrong somewhere' })
    }
    
})

router.get('/all', async (req,res) => {
    try {
        const users = await Users.find();
        if (!users) throw Error('No Users');
    
        res.status(200).json(users);
    } catch (e) {
        res.status(400).json({ msg: e.message });
    }
})

module.exports = router;