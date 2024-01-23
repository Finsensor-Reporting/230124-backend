const fs = require("fs")
const crypto = require("crypto")
const forge = require("node-forge")
const GenericModel = require("../model/generic-model");
const config = require("../../config/config")
const moment = require('moment')



class cryptoServices {
    constructor() {
        this.apiCredentials = new GenericModel("signdesk_api_credentials");
        this.organisationInfo = new GenericModel("signdesk_organisation");
    }

    // enc hash verifier based on settings pending
    async asymmetricDecryptAdvanced(params) {
        return new Promise(async (resolve, reject) => {
            var encryption_settings;
            try {
                if (params.api_id && params.api_key) {
                    var query = { api_id: params.api_id, api_key: params.api_key }
                    let apiData = await this.apiCredentials.findSortLimit(query, { _id: -1 }, 1)
                    if (apiData) var apiCredentialInfo = apiData[0]
                    if (apiCredentialInfo && apiCredentialInfo.encryption_settings) {
                        encryption_settings = apiCredentialInfo.encryption_settings
                    }
                    if (apiCredentialInfo && apiCredentialInfo.organisation_id) {
                        let orgData = await this.organisationInfo.getInfoById({ id: apiCredentialInfo.organisation_id })
                        if (orgData && orgData.encryption_settings) {
                            encryption_settings = orgData.encryption_settings
                        }
                        var deckey;
                        var pem = fs.readFileSync("app/certificates/desk_nine/desk_nine_key.pem")
                        if (encryption_settings && encryption_settings.asymmetric_mode) {
                            if (encryption_settings.asymmetric_mode == "RSA-OAEP") {
                                // enckey = encryptSecretKeyAssymetricOAEP(key, publicKey);
                                deckey = await this.decryptSecretKeyAssymetricOAEP(params.enc_key, pem);
                            } else {

                                deckey = await this.decryptSecretKeyAssymetric(params.enc_key, pem);
                            }
                        } else {
                            deckey = await this.decryptSecretKeyAssymetricOAEP(params.enc_key, pem);
                        }
                        var requestParams;
                        if (encryption_settings && encryption_settings.symmetric_mode) {
                            if (encryption_settings.symmetric_mode == "AES-CBC") {
                                requestParams = await this.aesDecryptCBC(JSON.stringify(params.api_data), deckey);
                            } else {
                                requestParams = await this.createDecipherCommonAssymetric(params.api_data, deckey)
                            }
                        } else {
                            requestParams = await this.aesDecryptCBC(JSON.stringify(params.api_data), deckey)
                        }
                        if (encryption_settings && encryption_settings.hash_mode) {
                            if (encryption_settings.hash_mode == "RSA-SHA256") {
                                var publicKey;
                                if (params.orgData && params.orgData.estamp_settings && params.orgData.estamp_settings.encryption_certificate) {
                                    publicKey = fs.readFileSync("app/certificates/" + params.orgData._id + "/" + params.orgData.estamp_settings.encryption_certificate, "utf8");
                                } else {
                                    console.log("No Certificate available")
                                    publicKey = fs.readFileSync("app/certificates/desk_nine/desk_nine_key.pem", "utf8");
                                    // publicKey = fs.readFileSync("./certificates/idbi/desk_nine_cert.pem", "utf8");
                                }
                                publicKey = publicKey.toString('ascii');
                                const verifier = crypto.createVerify('RSA-SHA256');
                                verifier.update(requestParams, 'ascii');
                                const publicKeyBuf = new Buffer(publicKey, 'ascii')
                                const signatureBuf = new Buffer(params.enc_hash, 'base64')
                                const result = verifier.verify(publicKeyBuf, signatureBuf);
                                if (result) {
                                    var newResponse = {
                                        success: true,
                                        data: JSON.parse(requestParams)
                                    }
                                    resolve(newResponse);
                                } else {
                                    resolve({
                                        success: false
                                    });
                                }
                            }
                        } else {
                            var requestHash = await this.createDecipherCommonAssymetric(params.enc_hash, deckey)
                            var verificationHash = crypto.createHash('sha256').update(requestParams).digest('hex');

                            if (requestHash != null && requestHash == verificationHash) {
                                var newResponse = {
                                    success: true,
                                    data: JSON.parse(requestParams)
                                }
                                resolve(newResponse);
                            } else {
                                resolve({
                                    status: false
                                });
                            }
                        }

                    } else {
                        resolve({
                            status: 'failed',
                            message: 'organisation id not found'
                        })
                    }

                }
                else if (params.organisation_id) {
                    let orgData = await this.organisationInfo.getInfoById({ id: params.organisation_id })
                    if (orgData) {
                        if (orgData && orgData.encryption_settings) {
                            encryption_settings = orgData.encryption_settings
                        }
                        var pem = fs.readFileSync("app/certificates/desk_nine/desk_nine_key.pem")
                        var deckey = await this.decryptSecretKeyAssymetricOAEP(params.enc_key, pem)
                        var requestParams = await this.aesDecryptCBC(JSON.stringify(params.api_data), deckey)
                        var requestHash = await this.createDecipherCommonAssymetric(params.enc_hash, deckey)
                        var verificationHash = crypto.createHash('sha256').update(requestParams).digest('hex');
                        if (requestHash != null && requestHash == verificationHash) {
                            var newResponse = {
                                success: true,
                                data: JSON.parse(requestParams)
                            }
                            resolve(newResponse);
                        } else {
                            resolve({
                                success: false,
                                message: 'invalid hash provided'
                            });
                        }
                    }
                }
            } catch (err) {
                resolve({
                    success: false,
                    message: err
                })
            }
        })
    }

    async createDecipherCommonAssymetric(enc, key) {
        try {
            var data = Buffer.from(enc, 'base64');
            var iv = data.slice(0, 12);
            var decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(key, 'utf8'), iv).setAuthTag(Buffer.from(data.slice(data.length - 16, data.length), 'base64'));
            return decipher.update(data.slice(12, data.length - 16).toString('base64'), 'base64', 'utf8') + decipher.final('utf8');
        } catch (err) {
            console.log("error decrypt aes", err);
            return null;
        }
    }
    //Check valid user while sending request body
    async asymmetricEncryptAdvanced(params) {
        return new Promise(async (resolve, reject) => {
            var encryption_settings;
            if (params.api_id && params.api_key) {
                var query = { api_id: params.api_id, api_key: params.api_key }
                let apiData = await this.apiCredentials.findSortLimit(query, { _id: -1 }, 1)
                let apiCredentialInfo = apiData[0]
                if (apiCredentialInfo && apiCredentialInfo.encryption_settings) {
                    encryption_settings = apiCredentialInfo.encryption_settings
                }
                if (apiCredentialInfo && apiCredentialInfo.organisation_id) {
                    let orgData = await this.organisationInfo.getInfoById({ id: apiCredentialInfo.organisation_id })
                    if (orgData && orgData.encryption_settings) {
                        encryption_settings = orgData.encryption_settings
                    }
                    params.orgData = orgData
                    if (encryption_settings) params.encryption_settings = encryption_settings
                    await this.rsaAndAesEncryptionAdvanced(params).then(function (response) {
                        resolve(response)
                    })
                }
            }
            else if (params.organisation_id) {
                let orgData = await this.organisationInfo.getInfoById({ id: params.organisation_id })
                if (orgData && orgData.encryption_settings) {
                    encryption_settings = orgData.encryption_settings
                }
                params.orgData = orgData
                if (encryption_settings) params.encryption_settings = encryption_settings
                await this.rsaAndAesEncryptionAdvanced(params).then(function (response) {
                    resolve(response)
                })
            }
        })
    }

    async rsaAndAesEncryptionAdvanced(params) {
        return new Promise(async (resolve, reject) => {
            try {
                if (params.orgData && params.orgData.dkyc_settings && params.orgData.dkyc_settings.encryption_certificate) {
                    var publicKey = fs.readFileSync("app/certificates/" + params.orgData._id + "/" + params.orgData.dkyc_settings.encryption_certificate, 'utf8');
                    //var publicKey = fs.readFileSync("app/certificates/sample/public_key.cer", 'utf8')
                }
                else {
                    var publicKey = fs.readFileSync("app/certificates/desk_nine/desk_nine_cert.cer", 'utf8')
                }

                if (publicKey) {
                    var key = await this.password_generator(32);
                    var hash = crypto.createHash('sha256').update(JSON.stringify(params.data_to_encrypt)).digest('hex')
                    var enckey = await this.encryptSecretKeyAssymetricOAEP(key, publicKey)
                    // if (params.encryption_settings && params.encryption_settings.asymmetric_mode) {
                    //     if (params.encryption_settings.asymmetric_mode == 'RSA-OAEP') {
                    //         enckey = await this.encryptSecretKeyAssymetricOAEP(key, publicKey)
                    //     }
                    //     else {
                    //         enckey = await this.encryptSecretKeyAssymetric(key, publicKey)
                    //     }
                    // }
                    // else {
                    //     enckey = await this.encryptSecretKeyAssymetric(key, publicKey)
                    // }
                    var enc_hash;
                    var api_data = await this.createCipherCommonAssymetric(JSON.stringify(params.data_to_encrypt), key)
                    // if (params.encryption_settings && params.encryption_settings.symmetric_mode) {
                    //     if (params.encryption_settings.symmetric_mode == "AES-CBC") {
                    //         api_data = await this.aesEncryptCBC(JSON.stringify(params.data_to_encrypt), key)
                    //     }
                    //     else {
                    //         api_data = await this.createCipherCommonAssymetric(JSON.stringify(params.data_to_encrypt), key)
                    //     }
                    // }
                    // else {
                    //     api_data = await this.createCipherCommonAssymetric(JSON.stringify(params.data_to_encrypt), key)
                    // }
                    if (params.encryption_settings && params.encryption_settings.hash_mode) {
                        if (params.encryption_settings.hash_mode == "RSA-SHA256") {
                            var signer = crypto.createSign('RSA-SHA256');
                            var privateKey = fs.readFileSync("app/certificates/desk_nine/desk_nine_key.pem")
                            privateKey = privateKey.toString('ascii')
                            signer.update(JSON.stringify(params.data_to_encrypt))
                            enc_hash = signer.sign(privateKey, 'base64')
                        }
                        else {
                            enc_hash = await this.createCipherCommonAssymetric(hash, key)
                        }
                    }
                    else {
                        enc_hash = await this.createCipherCommonAssymetric(hash, key)
                    }
                    var newObject = {
                        status: "success",
                        encryptedResult: {
                            enc_key: enckey,
                            enc_hash: enc_hash,
                            api_data: api_data
                        }
                    }
                    resolve(newObject)
                }
                else {
                    var newObject = {
                        "status": "failure",
                        "message": "Access key not found."
                    }
                    resolve(newObject)
                }
            } catch (err) {
                if (err.code == 'ENOENT') {
                    resolve({
                        status: "failed",
                        reference_id: params.data_to_encrypt.reference_id ? params.data_to_encrypt.reference_id : null,
                        error: "Encryption certificate does not exist",
                        error_code: "dv-070",
                        response_time_stamp: moment().format()
                    })
                }
                else {
                    resolve({
                        status: "failed",
                        reference_id: params.data_to_encrypt.reference_id ? params.data_to_encrypt.reference_id : null,
                        error: "Unknown error",
                        error_code: "dv-005",
                        response_time_stamp: moment().format()
                    })
                }
            }
        })
    }

    async encryptSecretKeyAssymetricOAEP(key, publicKey) {
        try {
            var encrypted = forge.pki.certificateFromPem(publicKey).publicKey.encrypt(key.toString('utf8'), 'RSAES-OAEP');
            return Buffer.from(encrypted, 'binary').toString('base64')
        } catch (err) {
            resolve({
                status: 'falied',
                message: err
            })
        }
    }

    async aesEncryptCBC(text, key, vector = null) {
        var iv = crypto.randomBytes(16);
        if (vector) iv = Buffer.from(vector);
        var cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
        return Buffer.concat([iv, cipher.update(text, 'utf8'), cipher.final()]).toString('base64')
    }

    async password_generator(len) {
        var length = (len) ? (len) : (16);
        var string = "abcdefghijklmnopqrstuvwxyz";
        var date = new Date();
        var numeric = "0123456789" + date.getMilliseconds();
        var password = "";
        var character = "";

        while (password.length < length) {
            if (password.length < length / 2) {
                var entity1 = Math.ceil(string.length * Math.random());
                var hold = string.charAt(entity1);
                hold = (entity1 % 2 == 0) ? (hold.toUpperCase()) : (hold);
            } else {
                var entity1 = Math.ceil(numeric.length * Math.random());
                var hold = numeric.charAt(entity1);
            }
            character += hold;
            password = character;
        }
        return password;
    }

    async encryptSecretKeyAssymetric(key, publicKey) {
        try {
            var encrypted = forge.pki.certificateFromPem(publicKey).publicKey.encrypt(key.toString('utf8'), 'RSAES-PKCS1-V1_5');
            return Buffer.from(encrypted, 'binary').toString('base64')
        } catch (err) {
            return err
        }
    }

    async createCipherCommonAssymetric(text, key) {
        var iv = crypto.randomBytes(12);
        var cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
        return Buffer.concat([iv, cipher.update(text, 'utf8'), cipher.final(), cipher.getAuthTag()]).toString('base64')
    }

    async decryptSecretKeyAssymetricOAEP(key, privateKey) {
        try {
            var decrypted = forge.pki.privateKeyFromPem(privateKey).decrypt(Buffer.from(key, 'base64').toString('binary'), 'RSA-OAEP');
            // console.log("decrypt------", Buffer.from(decrypted, 'binary').toString('utf8'));
            return Buffer.from(decrypted, 'binary').toString('utf8');
        }
        catch (err) {
            console.log("err---", err);

        }
    }

    async decryptSecretKeyAssymetric(key, privateKey) {
        var decrypted = forge.pki.privateKeyFromPem(privateKey).decrypt(Buffer.from(key, 'base64').toString('binary'), 'RSAES-PKCS1-V1_5');
        return Buffer.from(decrypted, 'binary').toString('utf8')
    }

    async aesDecryptCBC(enc, key, vector = null) {
        try {
            var data = Buffer.from(enc, 'base64');
            var iv = data.slice(0, 16);
            if (vector) iv = Buffer.from(vector);
            var decipher = crypto.createDecipheriv('aes-256-cbc', key, iv)
            let decrypted = decipher.update(data.slice(16, data.length), 'base64', 'utf8')
            decrypted += decipher.final('utf8');
            return decrypted;
        } catch (err) {
            console.log("err---", err);

        }
    }

}

module.exports = new cryptoServices