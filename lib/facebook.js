var https = require('https');
var request = require('request');

var kProductionHost = 'https://graph.facebook.com/';

function IAPVerifier(conf) {
    this.access_token = conf.access_token;
    this.host = kProductionHost;
    this.port = 443;
    this.path = '';
    this.method = 'GET';
}

/**
 * verifyReceipt
 * Verifies an In App Purchase paymentid string against Apple's servers
 * params:
 *  paymentid     - the paymentid string
 *  cb            - callback function that will return the status code and results for the verification call
 */
IAPVerifier.prototype.verifyReceipt = function(paymentid, cb) {
    var data = {
        'receipt-data' : ""
    };
    return this.verifyWithRetry(data, paymentid, cb);
};

/**
 * verifyWithRetry
 * Verify with retry will automatically call the Apple Sandbox verification server in the event that a 21007 error code is returned.
 * This error code is an indication that the app may be receiving app store review requests.
 */
IAPVerifier.prototype.verifyWithRetry = function(receiptData, paymentid, cb) {
    var self = this;
    return this.verify(receiptData, paymentid, this.requestOptions(), function(valid, msg, data) {
        cb(valid, msg, data);
    });
};

/**
 * verify the paymentid data
 */
IAPVerifier.prototype.verify = function(data, paymentid, options, cb) {
    var access_token = this.access_token || options.access_token;           //必须是token
    
    request(
        {
            method : 'GET',
            uri : (kProductionHost + paymentid),
            qs : {
                "access_token" : access_token
            },
            timeout : 12000,
            json : true
        },
        function(err, res, body) {
            
            if (err) {
                if (body && body.error) {
                    return cb(false, body.error.code, body.error.message);
                } else {
                    return cb(false, err, err);
                }
            } else {
                if (body.error) {
                    return cb(false, body.error.code, body.error.message);
                } else {
                    return cb(true, "ok", body);
                }
            }
        }
    );
};

IAPVerifier.prototype.requestOptions = function() {
    var options = {
        host : this.host,
        port : this.port,
        path : this.path,
        access_token : this.access_token,
        method : this.method
    };
    return options;
};

module.exports = IAPVerifier;
