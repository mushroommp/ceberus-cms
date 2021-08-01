const mongoose = require('mongoose');
const Schema = mongoose.Schema

//Create Schema
const UserAccountSchema = new Schema({
    username: {
        type: String
    },
    email: {
        type: String,
        required: true
    },
    hederaPublicKey: String,
    hederaPrivateKey: String,
    hederaAccountId: String,
    accountBalance: String,
    date: {
        type: Date,
        default: Date.now()
    }
}, {timestamps: true});

module.exports = Users = mongoose.model('user_account', UserAccountSchema);