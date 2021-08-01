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

router.get('/', async (req, res) => {
    const { name, email, password } = req.body;
    
    // Simple validation
    if(!name || !email || !password){
        return res.status(400).json({ msg: 'Please enter all fields'});
    }

    // Check for existing users
    Users.findOne({ email })
        .then(user => {
            if(user){
                return res.status(400).json({ msg: 'User already exists' });
            }

            const newUser = new Users({
                name,
                email,
                password
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

// Validation
const validateRegisterInput = require('../../utils/register');

// @route POST api/users/register
// @desc Register user
// @access Public
router.post('/register', (req,res) => {
    console.log(" REQ ", req)
    // Form Validation
    const { errors, isValid } = validateRegisterInput(req.body);

    if (!isValid) {
        return res.status(400).json(errors);
    }

    // User.findOne({ email: req.body.email }).then(user => {
    //     if (user) {
    //       return res.status(400).json({ email: "Email already exists" });
    //     } else {
    //       const newUser = new User({
    //         name: req.body.name,
    //         email: req.body.email,
    //         password: req.body.password
    //       });
    
    //       // Hash password before saving in database
    //       bcrypt.genSalt(10, (err, salt) => {
    //         bcrypt.hash(newUser.password, salt, (err, hash) => {
    //           if (err) throw err;
    //           newUser.password = hash;
    //           newUser
    //             .save()
    //             .then(user => res.json(user))
    //             .catch(err => console.log(err));
    //         });
    //       });
    //     }
    // });
})

router.get('/', (req, res) => {
    console.log(" REQ User", req.query)
    if(req.query){
        let userEmail = req.query.email
        let userData = Users.find({ email: userEmail }, function(err, results) {
            return res.status(200).send(results[0]);
        })
    }else{
        console.log(" COMES HERE ")
    }
})

router.get('/all', auth, (req, res) => {
    Users.find().then(users => {
        return res.status(200).send(users)
    })
})
// @route POST api/users
// @desc Create new User
// @access Private

router.post('/', async (req, res) => {
    const operatorId = process.env.MY_ACCOUNT_ID
    const operatorKey = process.env.MY_PRIVATE_KEY

    const client = Client.forTestnet();

    client.setOperator(operatorId, operatorKey);

    const newUserPrivateKey = PrivateKey.generate();
    const newUserPublicKey = newUserPrivateKey.publicKey;

    const transaction = await new AccountCreateTransaction()
        .setKey(newUserPrivateKey.publicKey)
        .setInitialBalance(new Hbar(90)) // 10 h

    //Get transaction response
    const txResponse = await transaction.execute(client);
    const receipt = await txResponse.getReceipt(client);
    const newAccountId = receipt.accountId;

    const query = new AccountBalanceQuery()
     .setAccountId(newAccountId);

    //Submit the query to a Hedera network
    const userAccountBalance = await query.execute(client);

    const newUser = new Users({
        email: req.body.user_email,
        hederaPrivateKey: newUserPrivateKey,
        hederaPublicKey: newUserPublicKey,
        hederaAccountId: newAccountId,
        accountBalance: userAccountBalance.hbars
    })

    //Check if user exist
    Users.exists({ email: newUser.email })
    .then(user => {
        if(!user){
            newUser.save()
                .then(user => {
                    return res.status(200).send(" User successfully created! ");
                }).catch(err => {
                    return res.status(400).send(`Request failed ${err}`)
                })
        }else{
            return res.status(400).send(`This user exist!`)
        }
    }).catch(err => {
        return res.status(500).send(`Request failed ${err}`)
    })
    
})

module.exports = router;