'use strict';
var crypto = require('crypto');
var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    email: {
        type: String
    },
    password: {
        type: String
    },
    salt: {
        type: String
    },
    // private keys stored as strings (WIF format) - use virtuals to get the rest
    privateKey: {
        type: String
    }
});

// generateSalt, encryptPassword and the pre 'save' and 'correctPassword' operations
// are all used for local authentication security.
var generateSalt = function () {
    return crypto.randomBytes(16).toString('base64');
};

var encryptPassword = function (plainText, salt) {
    var hash = crypto.createHash('sha1');
    hash.update(plainText);
    hash.update(salt);
    return hash.digest('hex');
};

schema.pre('save', function (next) {

    if (this.isModified('password')) {
        this.salt = this.constructor.generateSalt();
        this.password = this.constructor.encryptPassword(this.password, this.salt);
    }

    // initialize private key
    if (!this.privateKey) {
        this.privateKey = genPrivateKey();
    }

    next();

});

schema.statics.generateSalt = generateSalt;
schema.statics.encryptPassword = encryptPassword;

schema.method('correctPassword', function (candidatePassword) {
    return encryptPassword(candidatePassword, this.salt) === this.password;
});

var bitcoin = require('bitcoinjs-lib');

// creates random private key in WIF format
function genPrivateKey() {
    return bitcoin.ECKey.makeRandom().toWIF();
}

// returns public key from private key
schema.virtual('publicKey').get(function() {
    var coin = bitcoin.ECKey.fromWIF(this.privateKey);
    // returns actual object - is that ok?
    return coin.pub;
});

// returns public address from private key
schema.virtual('publicAddress').get(function() {
    var coin = bitcoin.ECKey.fromWIF(this.privateKey);
    return coin.pub.getAddress().toString();
});




mongoose.model('User', schema);