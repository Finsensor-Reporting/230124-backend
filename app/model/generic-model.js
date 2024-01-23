//=============================================================================
// base-model.js v1.0 Created by Arjun V on 05/08/22.
//=============================================================================

const database = require('../helpers/mongolib');
var mongo = require('mongodb');

class GenericModel {
    //Initialize the Object using the collection name to make use of the methods.
    constructor(collection_name) {
        this.collection_name = collection_name;
    }
    async getInfo(params) {
        let query = { ...params }
        if (params._id) {
            query._id = mongo.ObjectId(params._id)
        }
        if (params.id) {
            query._id = mongo.ObjectId(params.id)
        }
        query.is_deleted = { $ne: true }
        return new Promise(async (resolve, reject) => {
            try {
                let record = await database.findOne(this.collection_name, query);
                resolve(record)
            } catch (err) {
                reject(err)
            }
        })
    }
    async getInfoById(params) {
        let query = {}
        if (params._id) {
            query._id = mongo.ObjectId(params._id)
        }
        if (params.id) {
            query._id = mongo.ObjectId(params.id)
        }
        query.is_deleted = { $ne: true }
        return new Promise(async (resolve, reject) => {
            try {
                let record = await database.findOne(this.collection_name, query);
                resolve(record)
            } catch (err) {
                reject(err)
            }
        })
    }
    async getList(params) {
        let query = { ...params }
        query.is_deleted = { $ne: true }
        return new Promise(async (resolve, reject) => {
            try {
                let record = await database.find(this.collection_name, query);
                resolve(record)
            } catch (err) {
                reject(err)
            }
        })
    }
    async getDynamic(params) {
        let query = { ...params }
        return new Promise(async (resolve, reject) => {
            try {
                let record = await database.find(this.collection_name, query);
                resolve(record)
            } catch (err) {
                reject(err)
            }
        })
    }
    async updateById(params) {
        let query = {}
        let update = { $set: params.dataToSet } //keeping update object to $set by default
        let arrayFilters
        if (params._id) {
            query._id = mongo.ObjectId(params._id)
        }
        if (params.id) {
            query._id = mongo.ObjectId(params.id)
        }
        query.is_deleted = { $ne: true };
        if (params.dataToSet) {
            update["$set"] = params.dataToSet
        }
        if (params.dataToPush) {
            update["$push"] = params.dataToPush
        }
        if(params.arrayFilters) {
            // query = { ...query, ...params.query }
            query = params.query
            update = params.update
            arrayFilters = {arrayFilters:params.arrayFilters}
        }
        return new Promise(async (resolve, reject) => {
            try {
                // if(query._id && (Object.keys(update).includes('$set' || '$push'))){
                let record = await database.findAndModify(this.collection_name, query, update, arrayFilters);
                resolve(record)
                // }
            } catch (err) {
                reject(err)
            }
        })
    }
    async updateMany(params, dataToUpdate) {
        let query = {}
        let update = {}
        if (params._id) {
            delete params._id
        }
        query = { ...params }
        query.is_deleted = { $ne: true };
        if (dataToUpdate.dataToset) {
            update[$set] = dataToUpdate.dataToset
        }
        if (dataToUpdate.dataToPush) {
            update[$push] = dataToUpdate.dataToPush
        }

        return new Promise(async (resolve, reject) => {
            try {
                if (query._id && (Object.keys(update).includes('$set' || '$push'))) {
                    let record = await database.findAndModify(this.collection_name, query, update);
                    resolve(record)
                }
            } catch (err) {
                reject(err)
            }
        })
    }
    async updateDynamic(params, dataToUpdate) {
        let query = { ...params };
        let update = { ...dataToUpdate };
        return new Promise(async (resolve, reject) => {
            try {
                if (Object.keys(update).includes("$set" || "$push")) {
                    let record = await database.findAndModify(
                        this.collection_name,
                        query,
                        update
                    );
                    resolve(record);
                }
            } catch (err) {
                reject(err);
            }
        });
    }
    async insertOne(params) {
        let query = { ...params }
        return new Promise(async (resolve, reject) => {
            try {
                let record = await database.insert(this.collection_name, query);
                resolve(record)
            } catch (err) {
                reject(err)
            }
        })
    }
    async insertMany(params) {
        let query = { ...params }
        return new Promise(async (resolve, reject) => {
            try {
                let record = await database.insertMany(this.collection_name, query);
                resolve(record)
            } catch (err) {
                reject(err)
            }
        })
    }
    async deleteOne(params) {
        let query = {}
        let update = {}
        if (params._id) {
            params._id = mongo.ObjectId(params._id)
        }
        if (params.id) {
            query._id = mongo.ObjectId(params.id)
        }
        update[$set] = { is_deleted: true }

        return new Promise(async (resolve, reject) => {
            try {
                if (query._id && Object.keys(update[$set])) {
                    let record = await database.findAndModify(this.collection_name, query, update);
                    resolve(record)
                }
            } catch (err) {
                reject(err)
            }
        })
    }
    async deleteMany(params) {
        let query = {}
        let update = {}
        query = { ...params }
        update[$set] = { is_deleted: true }

        return new Promise(async (resolve, reject) => {
            try {
                if (query._id && Object.keys(update[$set])) {
                    let record = await database.findAndModify(this.collection_name, query, update);
                    resolve(record)
                }
            } catch (err) {
                reject(err)
            }
        })
    }
    async findSortLimit(params, sortObj, limitValue) {
        let query = { ...params }
        return new Promise(async (resolve, reject) => {
            try {
                let record = await database.find(this.collection_name, query, {}, sortObj, 0, limitValue);
                resolve(record)
            } catch (err) {
                reject(err)
            }
        })
    }
    async increment(param, dataToInc) {
        let query = { ...param }
        let update = { "$inc": dataToInc }
        return new Promise(async (resolve, reject) => {
            try {
                let record = await database.update(this.collection_name, query, update)
                resolve(record)
            } catch (err) {
                reject(err)
            }
        })
    }
}

module.exports = GenericModel;