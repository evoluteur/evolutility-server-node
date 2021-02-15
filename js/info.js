/*!
 * evolutility-server-node :: info.js
 *
 * https://github.com/evoluteur/evolutility-server-node
 * (c) 2021 Olivier Giulieri
 */

const path = require('path'),
    { fieldInCharts, fieldTypes } = require('./utils/dico'),
    ft = fieldTypes,
    logger = require('./utils/logger'),
    pkg = require('../package.json'),
    { models } = require('./utils/model-manager'),
    config = require('../config.js')

function getFieldsAPIs(model, protocol, baseUrl) {
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
    //return req.headers.host+req.url
    return req.headers.host+req.url.split('?')[0]
}

const entityAPIs = (model, protocol, baseUrl, fullDescription) => {
    const pathToModel = protocol+path.join(baseUrl, model.id)
    const { charts, lovs } = getFieldsAPIs(model, protocol, baseUrl)
    let mi = {
        id: model.id,
        title: model.title || model.label,
        list: pathToModel,
        lovs: lovs,
        charts: charts,
        stats: pathToModel + '/stats',
        csv: pathToModel+'?format=csv',
    }
    if(fullDescription){
        mi.crud = {
            "create": {
                method: 'POST',
                url: pathToModel+'/',
            },
            "read": {
                method: 'GET',
                url: pathToModel+'/{id}',
            },
            "update": {
                method: 'PUT',
                url: pathToModel+'/{id}',
            },
            "delete": {
                method: 'DELETE',
                url: pathToModel+'/{id}',
            },
        }
    }else{
        mi.apis = protocol+baseUrl+'?id='+model.id
    }
    return mi
}

// - returns list endpoints URLs for all active models
function apis(req, res) {
    logger.logReq('GET APIs', req)
    const baseUrl = baseURL(req)
    const protocol = req.protocol+'://'
    let ms = []

    if(config.apiInfo){
        let mid = req.query.id
        if(mid){
            // - single model (doesn't need to be active)
            const m = models[mid]
            if(m){
                ms = entityAPIs(m, protocol, baseUrl, true);
            }
        }else{
            // - all active models
            for (let mid in models){
                const model = models[mid]
                if(model.active){
                    ms.push(entityAPIs(model, protocol, baseUrl, false))
                }
            }
        }
    }
    return res.json(ms)
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