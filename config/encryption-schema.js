const config = require("./config")
const { Binary } = require("mongodb")
const db_name = config.database_name + '.signdesk_verification_requests'

module.exports = {
    [db_name]: {
        bsonType: "object",
        encryptMetadata: {
            algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic",
            keyId: [new Binary(Buffer.from(config.key_base64, "base64"), 4)],
        },
        properties: {
            verification_info: {
                bsonType: 'object',
                properties: {
                    verification_data: {
                        bsonType: 'object',
                        properties: {
                            rc_number: {
                                encrypt: {
                                    bsonType: 'string'
                                }
                            },
                            owner_name: {
                                encrypt: {
                                    bsonType: 'string'
                                }
                            },
                            owner_number: {
                                encrypt: {
                                    bsonType: 'string'
                                }
                            },
                            father_name: {
                                encrypt: {
                                    bsonType: 'string'
                                }
                            },
                            present_address: {
                                bsonType: 'object',
                                properties: {
                                    district: {
                                        encrypt: {
                                            bsonType: 'array',
                                            algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Random",
                                            keyId: [new Binary(Buffer.from(config.key_base64, "base64"), 4)]
                                        }
                                    },
                                    state: {
                                        encrypt: {
                                            bsonType: 'array',
                                            algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Random",
                                            keyId: [new Binary(Buffer.from(config.key_base64, "base64"), 4)]
                                        }
                                    },
                                    country: {
                                        encrypt: {
                                            bsonType: 'array',
                                            algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Random",
                                            keyId: [new Binary(Buffer.from(config.key_base64, "base64"), 4)]
                                        }
                                    },
                                    pincode: {
                                        encrypt: {
                                            bsonType: 'string'
                                        }
                                    }
                                }
                            },
                            permanent_address: {
                                bsonType: 'object',
                                properties: {
                                    district: {
                                        encrypt: {
                                            bsonType: 'array',
                                            algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Random",
                                            keyId: [new Binary(Buffer.from(config.key_base64, "base64"), 4)]
                                        }
                                    },
                                    state: {
                                        encrypt: {
                                            bsonType: 'array',
                                            algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Random",
                                            keyId: [new Binary(Buffer.from(config.key_base64, "base64"), 4)]
                                        }
                                    },
                                    country: {
                                        encrypt: {
                                            bsonType: 'array',
                                            algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Random",
                                            keyId: [new Binary(Buffer.from(config.key_base64, "base64"), 4)]
                                        }
                                    },
                                    pincode: {
                                        encrypt: {
                                            bsonType: 'string'
                                        }
                                    }
                                }
                            },
                            mobile_number: {
                                encrypt: {
                                    bsonType: 'string'
                                }
                            },
                            vehicle_chasi_number: {
                                encrypt: {
                                    bsonType: 'string'
                                }
                            },
                            vehicle_engine_number: {
                                encrypt: {
                                    bsonType: 'string'
                                }
                            },
                            financer: {
                                encrypt: {
                                    bsonType: 'string'
                                }
                            },
                            financed: {
                                encrypt: {
                                    bsonType: 'bool',
                                    algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Random"
                                }
                            },
                            insurance_company: {
                                encrypt: {
                                    bsonType: 'string'
                                }
                            },
                            insurance_policy_number: {
                                encrypt: {
                                    bsonType: 'string'
                                }
                            },
                            pucc_number: {
                                encrypt: {
                                    bsonType: 'string'
                                }
                            },
                            permit_number: {
                                encrypt: {
                                    bsonType: 'string'
                                }
                            },
                            permit_type: {

                            },
                            national_permit_number: {
                                encrypt: {
                                    bsonType: 'string'
                                }
                            },
                            blacklist_status: {
                                encrypt: {
                                    bsonType: 'string'
                                }
                            },
                            noc_details: {
                                encrypt: {
                                    bsonType: 'string'
                                }
                            },
                            owner_number: {
                                encrypt: {
                                    bsonType: 'string'
                                }
                            },
                            challan_details: {
                                encrypt: {
                                    bsonType: 'array',
                                    algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Random",
                                    keyId: [new Binary(Buffer.from(config.key_base64, "base64"), 4)]
                                }
                            }
                        }
                    }
                }
            },
            callback_logs: {
                bsonType: 'object',
                properties: {
                    request: {
                        bsonType: 'object',
                        properties: {
                            body: {
                                bsonType: 'object',
                                properties: {
                                    result: {
                                        bsonType: 'object',
                                        properties: {
                                            validated_data: {
                                                bsonType: 'object',
                                                properties: {
                                                    rc_number: {
                                                        encrypt: {
                                                            bsonType: 'string'
                                                        }
                                                    },
                                                    owner_name: {
                                                        encrypt: {
                                                            bsonType: 'string'
                                                        }
                                                    },
                                                    owner_number: {
                                                        encrypt: {
                                                            bsonType: 'string'
                                                        }
                                                    },
                                                    father_name: {
                                                        encrypt: {
                                                            bsonType: 'string'
                                                        }
                                                    },
                                                    present_address: {
                                                        bsonType: 'object',
                                                        properties: {
                                                            district: {
                                                                encrypt: {
                                                                    bsonType: 'array',
                                                                    algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Random",
                                                                    keyId: [new Binary(Buffer.from(config.key_base64, "base64"), 4)]
                                                                }
                                                            },
                                                            state: {
                                                                encrypt: {
                                                                    bsonType: 'array',
                                                                    algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Random",
                                                                    keyId: [new Binary(Buffer.from(config.key_base64, "base64"), 4)]
                                                                }
                                                            },
                                                            country: {
                                                                encrypt: {
                                                                    bsonType: 'array',
                                                                    algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Random",
                                                                    keyId: [new Binary(Buffer.from(config.key_base64, "base64"), 4)]
                                                                }
                                                            },
                                                            pincode: {
                                                                encrypt: {
                                                                    bsonType: 'string'
                                                                }
                                                            }
                                                        }
                                                    },
                                                    permanent_address: {
                                                        bsonType: 'object',
                                                        properties: {
                                                            district: {
                                                                encrypt: {
                                                                    bsonType: 'array',
                                                                    algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Random",
                                                                    keyId: [new Binary(Buffer.from(config.key_base64, "base64"), 4)]
                                                                }
                                                            },
                                                            state: {
                                                                encrypt: {
                                                                    bsonType: 'array',
                                                                    algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Random",
                                                                    keyId: [new Binary(Buffer.from(config.key_base64, "base64"), 4)]
                                                                }
                                                            },
                                                            country: {
                                                                encrypt: {
                                                                    bsonType: 'array',
                                                                    algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Random",
                                                                    keyId: [new Binary(Buffer.from(config.key_base64, "base64"), 4)]
                                                                }
                                                            },
                                                            pincode: {
                                                                encrypt: {
                                                                    bsonType: 'string'
                                                                }
                                                            }
                                                        }
                                                    },
                                                    mobile_number: {
                                                        encrypt: {
                                                            bsonType: 'string'
                                                        }
                                                    },
                                                    vehicle_chasi_number: {
                                                        encrypt: {
                                                            bsonType: 'string'
                                                        }
                                                    },
                                                    vehicle_engine_number: {
                                                        encrypt: {
                                                            bsonType: 'string'
                                                        }
                                                    },
                                                    financer: {
                                                        encrypt: {
                                                            bsonType: 'string'
                                                        }
                                                    },
                                                    financed: {
                                                        encrypt: {
                                                            bsonType: 'bool',
                                                            algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Random"
                                                        }
                                                    },
                                                    insurance_company: {
                                                        encrypt: {
                                                            bsonType: 'string'
                                                        }
                                                    },
                                                    insurance_policy_number: {
                                                        encrypt: {
                                                            bsonType: 'string'
                                                        }
                                                    },
                                                    pucc_number: {
                                                        encrypt: {
                                                            bsonType: 'string'
                                                        }
                                                    },
                                                    permit_number: {
                                                        encrypt: {
                                                            bsonType: 'string'
                                                        }
                                                    },
                                                    permit_type: {

                                                    },
                                                    national_permit_number: {
                                                        encrypt: {
                                                            bsonType: 'string'
                                                        }
                                                    },
                                                    blacklist_status: {
                                                        encrypt: {
                                                            bsonType: 'string'
                                                        }
                                                    },
                                                    noc_details: {
                                                        encrypt: {
                                                            bsonType: 'string'
                                                        }
                                                    },
                                                    owner_number: {
                                                        encrypt: {
                                                            bsonType: 'string'
                                                        }
                                                    },
                                                    challan_details: {
                                                        encrypt: {
                                                            bsonType: 'array',
                                                            algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Random",
                                                            keyId: [new Binary(Buffer.from(config.key_base64, "base64"), 4)]
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
