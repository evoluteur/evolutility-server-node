/*! 
 * evolutility-server-node :: graphql-schema.js
 * Making a GraphQL Schema from evolutility models
 *
 * https://github.com/evoluteur/evolutility-server-node
 * (c) 2019 Olivier Giulieri
*/

const graphql = require('graphql'),
    config = require('../config'),
    pgp = require('pg-promise')(),
    crud = require('./crud'),
    logger = require('./utils/logger'),
    dico = require('./utils/dico'),
    ft = dico.fieldTypes,
    sqls = require('./utils/sql-select'),
    errors = require('./utils/errors')

const mIds = dico.modelIds
const db = {}
db.conn = pgp(config.connectionString);

const {
   GraphQLObjectType,
   GraphQLID,
   GraphQLString,
   GraphQLBoolean,
   GraphQLInt,
   GraphQLFloat,
   GraphQLList,
   GraphQLSchema,
   GraphQLNonNull,
} = graphql;

function fieldType(f){
    let gqlType
    if(f.type===ft.int || f.type===ft.lov){
        gqlType = GraphQLInt
    }else if(f.type===ft.bool){
        gqlType = GraphQLBoolean
    }else if(f.type===ft.dec){
        gqlType = GraphQLFloat
    }else if(f.type===ft.list){
        gqlType = GraphQLList
    }else{
        gqlType = GraphQLString
    }/*
    if(f.required){
        return  new GraphQLNonNull(gqlType)
    }*/
    return gqlType
}

const gqlField = f => ({
    type: new fieldType(f),
    defaultValue: f.defaultValue || null,
    description: f.label + ' - '+f.type+
        (f.help ? ' - '+f.help : '')
})

const gqlFieldLOVText = f => ({
    type: new fieldType({type:'text'}),
    description: f.label + ' - text value (from table "'+f.lovTable+'").'
})

const model2gqlObjectType = m => {
    //console.log(m.id)
    let fields = {
        id: { 
            type: GraphQLID,
            description: 'Primary key' 
        },
    }
    m.fields.forEach(f => {
        fields[f.id] = gqlField(f)
        if(f.type===ft.lov){
            // - add "shadow field" for text value of list/lov item
            fields[f.id+'_txt'] = gqlFieldLOVText(f)
        }
    })
    
    // - "timestamp" columns to track creation and last modification.
    if(config.wTimestamp){
        fields['c_date'] = gqlField({type: ft.datetime})
        fields['u_date'] =  gqlField({type: ft.datetime})
    }
    return new GraphQLObjectType({
        name: m.id,
        fields: fields,
        description: m.name || m.table
    })
}

let gqlObjTypes = {}
mIds.forEach(mid => {
    gqlObjTypes[mid] = model2gqlObjectType(dico.getModel(mid))
})

const gqlOne = m => ({
    type: gqlObjTypes[m.id],
    description: m.name || m.id,
    args: { id: { type: GraphQLID } },
    resolve(parentValue, args) {
        logger.logHeader('GraphQL', 'GET ONE', m.id)
        const { sql, sqlParams} = crud.SQLgetOne(args.id, dico.getModel(m.id), {id: args.id})
        logger.logSQL(sql)
        return db.conn.one(sql, sqlParams)
            .then(data => {
                logger.logSuccess('Sending 1 record.')
                return data;
            })
            .catch(err => {
                logger.logError(err, 'Error in GraphQL request "getOne".')
                // TODO: this doesn't seem to go through
                return {
                    errors: [
                        {
                            message: 'Error in GraphQL request.',
                            locations: [{"function": "gqlOne"}]
                        }
                    ]
                }
            });
    }
})

const getArgsMany = fields => {
    // - return arguments for gqlMany
    let filters = {
        search: { type: GraphQLString }
    }
    if(fields && fields.length){
        fields.forEach(f => {
            filters[f.id] = { type: GraphQLString }
        })
    }
    return filters
}

const gqlMany = m => ({
    type: new GraphQLList(gqlObjTypes[m.id]),
    description: m.namePlural || m.title || m.label || m.id,
    args: getArgsMany(m.fields),
    //args: { search: { type: GraphQLString } },
    resolve(parentValue, args) {
        logger.logHeader('GraphQL', 'GET MANY', m.id)
        const sqlProps = crud.SQLgetMany(m, {query: args}, true, false)
        const sql = sqls.sqlQuery(sqlProps)
        logger.logSQL(sql)
        return db.conn.query(sql, sqlProps.params) //.one(sql)
            .then(data => {
                logger.logSuccess('Sending '+data.length+' record.')
                return data
            })
            .catch(err => {
                // TODO: this doesn't seem to go through
                logger.logError(err, 'Server error in GraphQL request (n).')
                return  errors.badRequest(res, 'Server error in GraphQL request (n).')
            });
    }
})

const makeGQLschema = () => {
    let gqlSoCalledFields = {}
    mIds.forEach(mid => {
        const m = dico.getModel(mid)
        gqlSoCalledFields[mid] = gqlOne(m)
        gqlSoCalledFields[mid+'s'] = gqlMany(m)
    })
    return gqlSoCalledFields
}

const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: makeGQLschema(),
    description: 'Evolutility'
})

module.exports = new GraphQLSchema({
   query: RootQuery
})