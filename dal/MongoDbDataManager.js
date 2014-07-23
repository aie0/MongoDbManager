(function () {
    'use strict';
    var db = null, SETTINGS, ERRORS,
        /*
        Connects to the db according to set connection string
         */
        connect = function connect(callback, logger) {
            if (db) {
                callback(null, db);
                return;
            }
            var start = logger.start("connect to db"), isSent = false,
                connectionString = SETTINGS.CONNECTION_STRING;
            setTimeout(function connectTimeoutHanlder() {
                if (isSent) {
                    return;
                }
                isSent = true;
                callback(ERRORS.TIMEOUT);
            }, SETTINGS.INIT_TIMEOUT);
            require('mongodb').MongoClient.connect(connectionString, function (err, mongodb) {
                logger.end(start);
                if (isSent) {
                    return;
                }
                isSent = true;
                if (err) {
                    callback(err);
                } else {
                    db = mongodb;
                    callback(null, db);
                }
            });
        },
        /*
        Returns entities according to the data in 'obj' and calling callback on finish
        obj: {
            name - name of retrieved collection
            filter - 'filter' parameter of 'find' operation
            isOne - true to return only one entity, false - return all the entities satisfying the criteria
            limit - number of entities to return
            isRetrieveId - return 'id' attribute of the mongo entity
            projection - projection parameter of 'find' operation
        }
         */
        find = function find(obj, callback, logger) {
            var filter = obj.filter, name = obj.name, isOne = obj.isOne, isRetrieveId = obj.isRetrieveId,
                limit = obj.limit, projection = obj.projection || {};
            if (!isRetrieveId) {
                projection._id = 0;
            }
            connect(function (err1, db) {
                if (err1) {
                    callback(err1);
                    return;
                }
                var start = logger.start("get " + name), isSent = false,
                    findCallback = function (err, items) {
                        logger.end(start);
                        if (isSent) {
                            return;
                        }
                        isSent = true;
                        if (err) {
                            callback(err);
                        } else {
                            callback(null, items);
                        }
                    };
                setTimeout(function findTimeoutHanlder() {
                    if (isSent) {
                        return;
                    }
                    isSent = true;
                    callback(ERRORS.TIMEOUT);
                }, SETTINGS.TIMEOUT);
                if (isRetrieveId) {
                    if (isOne) {
                        db.collection(name).findOne(filter, projection, findCallback);
                    } else {
                        if (limit) {
                            db.collection(name).find(filter, projection).limit(limit).toArray(findCallback);
                        } else {
                            db.collection(name).find(filter, projection).toArray(findCallback);
                        }
                    }
                } else {
                    if (isOne) {
                        db.collection(name).findOne(filter, projection, findCallback);
                    } else {
                        if (limit) {
                            db.collection(name).find(filter, projection).limit(limit).toArray(findCallback);
                        } else {
                            db.collection(name).find(filter, projection).toArray(findCallback);
                        }
                    }
                }
            }, logger);
        },
        /*
         Inserts an entity according to the data in 'obj' and calling callback on finish
         obj: {
             name - name of updated collection
             entity - new entity to insert
             idField - auto-generated field inserted automaticaly upon insert
         }
         */
        insert = function insert(obj, callback, logger) {
            var idField = obj.idField, entity = obj.entity, name = obj.name;
            if (idField) {
                entity[idField] = require('node-uuid').v4(); // holds newly created id
            }
            connect(function (err1, db) {
                if (err1) {
                    callback(err1);
                    return;
                }
                var start = logger.start("insert " + name), isSent = false;
                setTimeout(function insertTimeoutHanlder() {
                    if (isSent) {
                        return;
                    }
                    isSent = true;
                    callback(ERRORS.TIMEOUT);
                }, SETTINGS.TIMEOUT);
                db.collection(name).insert(entity, function (err, inserted) {
                    logger.end(start);
                    if (isSent) {
                        return;
                    }
                    isSent = true;
                    if (err) {
                        callback(err);
                    } else {
                        callback(null, inserted);
                    }
                });
            }, logger);
        },
        /*
        Updates db according to the data in 'obj' and calling callback on finish
        obj: {
            name - name of updated collection
            filter - 'filter' parameter of 'update' operation
            attributes - attributes parameter of 'update' operation
            options - options parameter of 'update' operation
        }
         */
        update = function update(obj, callback, logger) {
            connect(function (err1, db) {
                if (err1) {
                    callback(err1);
                    return;
                }
                var start = logger.start("update " + obj.name), isSent = false,
                    innerCallback = function innerCallback(err, updated) {
                        logger.end(start);
                        if (isSent) {
                            return;
                        }
                        isSent = true;
                        if (err) {
                            callback(err);
                        } else {
                            callback(null, updated);
                        }
                    };

                setTimeout(function updateTimeoutHanlder() {
                    if (isSent) {
                        return;
                    }
                    isSent = true;
                    callback(ERRORS.TIMEOUT);
                }, SETTINGS.TIMEOUT);

                if (obj.options) {
                    db.collection(obj.name).update(obj.filter, obj.attributes, obj.options, innerCallback);
                } else {
                    db.collection(obj.name).update(obj.filter, obj.attributes, innerCallback);
                }
            }, logger);
        };

    /*
    Creates a new MongoDb Manager
     */
    function MongoDbDataManager(dalSettings, errorSettings) {
        SETTINGS = dalSettings;
        ERRORS = errorSettings;
    }

    ///---------------examples------------------

    MongoDbDataManager.prototype.getPersons = function getPersons(callback, logger) {
        find({
            name: "persons"
        }, callback, logger);
    };

    MongoDbDataManager.prototype.findPerson = function getPerson(fname, callback, logger) {
        find({
            name: "persons",
            filter: {first: fname},
            isOne: true
        }, callback, logger);
    };

    MongoDbDataManager.prototype.findPersons = function getPersons(fname, callback, logger) {
        find({
            name: "persons",
            filter: {first: fname}
        }, callback, logger);
    };

    MongoDbDataManager.prototype.updatePersonAge = function updatePersonAge(fname, age, callback, logger) {
        update({
            name: "persons",
            filter: {first: fname},
            attributes: {$set: {age: age}}
        }, callback, logger);
    };
    MongoDbDataManager.prototype.updatePersonsAge = function updatePersonsAge(fname, age, callback, logger) {
        update({
            name: "persons",
            filter: {first: fname},
            attributes: {$set: {age: age}},
            options: {multi: true}
        }, callback, logger);
    };

    MongoDbDataManager.prototype.addPerson = function addPerson(person, callback, logger) {
        insert({
            entity: person,
            name: "persons"
        }, callback, logger);
    };

    MongoDbDataManager.prototype.addPersonWithGeneratedId = function addPersonWithGeneratedId(person, callback, logger) {
        insert({
            idField: 'personId',
            entity: person,
            name: "persons"
        }, callback, logger);
    };

    module.exports = MongoDbDataManager;
}());