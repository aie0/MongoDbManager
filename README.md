MongoDbManager NodeJS library
==============

NodeJS Mongodb library wrapper to ease the work with the Mongodb database
--------------

The library is obsolete as of MongoDb 2.6, with the introduction of [$maxTimeMS][0]

**Main Features:**
- Timeout support for initial db connect and every operation
- Find (limit, one or multiple entities retrieval, filter-out MongoDb ids)
- Update (support for native 'attributes' and 'options' parameters)
- Insert (Auto-generate custom id field with GUID)

**Dependencies:**
- LogManager module, please see: https://github.com/aie0/LogManager

Any contribute and feature requests are welcome

[0]: http://docs.mongodb.org/manual/reference/operator/meta/maxTimeMS/