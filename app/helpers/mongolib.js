//=============================================================================
// mongolib.js v1.1  Created by Gururaj B Shetty on 01/06/22.
//=============================================================================

const DB = require('../../config/database')

class MongoHelper {
    createCollection(collection_name) {
        return new Promise(async (resolve, reject) => {
            try {
                let data = DB.createCollection(collection_name)
                resolve(data)
            }
            catch (err) {
                reject(err)
            }
        })
    }
    find(collection_name, query, projection = {}, sortObj, skip = 0, limit = 0) {

        let collection = DB.collection(collection_name)
        return new Promise(async (resolve, reject) => {
            try {
                let data = collection.find(query, projection).sort(sortObj).skip(skip).limit(limit).toArray()
                resolve(data)
            }
            catch (err) {
                console.log("err", err)
                reject(err)
            }
        })
    }

    findOne(collection_name, query = {}, projection = {}) {
        let collection = DB.collection(collection_name)
        return new Promise(async (resolve, reject) => {
            try {
                let data = await collection.findOne(query);
                resolve(data)
            } catch (err) {
                reject(err)
            }
        })
    }

    insert(collection_name, params, projection) {
        let collection = DB.collection(collection_name);
        return new Promise(async (resolve, reject) => {
            if (params) {
                try {
                    let data = collection.insertOne(params)
                    resolve(data);
                } catch (err) {
                    reject(err)
                }
            } else {
                resolve("params not found")
            }
        })
    }

    save(collection_name, body = {}) {
        let collection = DB.collection(collection_name)
        return new Promise(async (resolve, reject) => {
            try {
                let data = await collection.save({ ...body })
                resolve(data)
            } catch (err) {
                reject(err)
            }
        })
    }

    async findAndModify(collection_name, query = {}, update = {}, arrayFilters = {}, $options = { new: true }) {
        let collection = DB.collection(collection_name)
        return new Promise((resolve, reject) => {
            try {
                console.log("asdf",query,update,arrayFilters)
                let data = collection.findOneAndUpdate(query, update, arrayFilters)
                resolve(data)
            } catch (err) {
                reject(err)
            }
        })
    }

    update(collection_name, query = {}, $update = {}, $options = {}) {
        let collection = DB.collection(collection_name)
        return new Promise(async (resolve, reject) => {
            try {
                let data = collection.update(query, $update, $options)
                resolve(data)
            } catch (err) {
                reject(err)
            }
        })
    }
    aggregate(collection_name, match, group) {
        let collection = DB.collection(collection_name)
        return new Promise(async (resolve, reject) => {
            try {
                let data = await collection.aggregate([{ $match: match }, { $group: group }])
                resolve(data);
            } catch (err) {
                reject(err)
            }
        })
    }
    count(collection_name, query) {
        let collection = DB.collection(collection_name)
        return new Promise(async (resolve, reject) => {
            try {
                let data = await collection.count(query)
                resolve(data);
            } catch (err) {
                reject(err)
            }
        })
    }
    join(collection_name, from_collection, local_field, foreign_field, new_field) {
        let collection = DB.collection(collection_name)
        return new Promise(async (resolve, reject) => {
            try {
                let data = collection.aggregate([
                    {
                        $lookup:
                        {
                            from: from_collection,
                            localField: local_field,
                            foreignField: foreign_field,
                            as: new_field
                        }
                    }
                ])
                resolve(data)
            } catch (err) {
                reject(err)
            }
        })
    }
}
module.exports = new MongoHelper();