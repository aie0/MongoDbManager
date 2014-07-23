(function () {
    'use strict';
    var logger, nconf = require('nconf'), LogManager = require("./common/LogManager.js"), dataManager = null,
		init = function init() {
			var path = require('path');
			nconf.file({
				file : path.resolve(__dirname,  'config.json')
			});

            LogManager.init(nconf.get("logger"));
			logger = LogManager.getInstance();

            // init datamanager
			dataManager = new (require('./dal/MongoDbDataManager.js'))(nconf.get("dal"), nconf.get("errors"));

            // get all persons
            dataManager.getPersons(function getPersonsHandler(err,data) {
                if (err) {
                    logger.error(err);
                } else {
                    logger.info(data);
                }
            }, logger);

            // get a person by fname
            dataManager.findPerson('Michael', function findPersonHandler(err,data) {
                if (err) {
                    logger.error(err);
                } else {
                    logger.info(data);
                }
            }, logger);

            // get a person by fname
            dataManager.findPersons('Michael', function findPersonsHandler(err,data) {
                if (err) {
                    logger.error(err);
                } else {
                    logger.info(data);
                }
            }, logger);

            // update person's age by fname
            dataManager.updatePersonAge('Michael', 15, function updatePersonAgeHandler(err,data) {
                if (err) {
                    logger.error(err);
                } else {
                    logger.info("update succeeded");
                }
            }, logger);

            // update persons age by fname
            dataManager.updatePersonsAge('Michael', 16, function updatePersonsAgeHandler(err,data) {
                if (err) {
                    logger.error(err);
                } else {
                    logger.info("update succeeded");
                }
            }, logger);

            var person = {
                first: 'James',
                last: 'Allan',
                age: 30
            };

            // adds a person
            dataManager.addPerson(person, function addPersonHandler(err,data) {
                if (err) {
                    logger.error(err);
                } else {
                    logger.info("insert succeeded");
                }
            }, logger);

            // adds a person and generates auto-id for it
            dataManager.addPersonWithGeneratedId(person, function addPersonWithGeneratedIdHandler(err,data) {
                if (err) {
                    logger.error(err);
                } else {
                    logger.info("insert succeeded");
                }
            }, logger);
 		};
    init();
}());