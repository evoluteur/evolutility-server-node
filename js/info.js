/*!
 * evolutility-server-node :: info.js
 *
 * https://github.com/evoluteur/evolutility-server-node
 * (c) 2019 Olivier Giulieri
 */

const path = require('path'),
    { fieldInCharts, fieldTypes } = require('./utils/dico'),
    ft = fieldTypes,
    logger = require('./utils/logger'),
    pkg = require('../package.json'),
    models = require('../models/all_models'),
    config = require('../config.js')

function getFieldsAPIs(protocol, baseUrl, model) {
    const apis = {
        charts: [],
        lovs: [],
    }
    model.fields.forEach(function(f){
        if(fieldInCharts(f)){
            apis.charts.push(protocol+path.join(baseUrl, model.id, 'chart', f.id))
        }
        if(f.type===ft.lov){
            apis.lovs.push(protocol+path.join(baseUrl, model.id, 'lov', f.id))
        }
    })
    return apis
}

function baseURL(req){
    return req.headers.host+req.url
    //return req.headers.host+req.url.replace('/rest_api', '')
}

const entityAPIs = (protocol, baseUrl, model) => {
    const pathToModel = protocol+path.join(baseUrl, model.id)
    const { charts, lovs } = getFieldsAPIs(protocol, baseUrl, model)
    return {
        id: model.id,
        list: pathToModel,
        lovs: lovs,
        charts: charts,
        stats: pathToModel + '/stats',
        csv: pathToModel+'?format=csv',
        //rest_api: pathToModel+'/api'
    }
}

// - returns list endpoints URLs for all active models
function apis(req, res) {
    logger.logReq('GET APIs', req);
    const baseUrl = baseURL(req)
    const ms = [];
    const protocol = req.protocol+'://'

    if(config.apiInfo){
        for (let mid in models){
            const model = models[mid]
            if(model.active){
                ms.push(entityAPIs(protocol, baseUrl, model))
            }
        }
    }
    return res.json(ms);
}

// - returns version number (from package.json)
function version(req, res) {
    logger.logReq('GET VERSION', req);
    return res.json({
        name: pkg.name,
        version: pkg.version
    });
}

// --------------------------------------------------------------------------------------

module.exports = {
	version: version,
    apis: apis,
}