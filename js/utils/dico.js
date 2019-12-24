/*!
 * evolutility :: utils/dico.js
 * Helper functions for metadata
 *
 * https://github.com/evoluteur/evolutility
 * (c) 2019 Olivier Giulieri
 */

const models = require('../../models/all_models'),
	config = require('../../config.js'),
	modelIds = Object.keys(models),
	schema = '"'+(config.schema || 'evolutility')+'"';

// - Field Types
const ft = {
	text: 'text',
	textml: 'textmultiline',
	bool: 'boolean',
	int: 'integer',
	dec: 'decimal',
	money: 'money',
	date: 'date',
	datetime: 'datetime',
	time: 'time',
	lov: 'lov',
	list: 'list', // multiple values for one field (behave like tags - return an array of strings)
	html: 'html',
	formula:'formula', // soon to be a field attribute rather than a field type
	email: 'email',
	image: 'image',
	//geoloc: 'geolocation',
	//doc:'document',
	url: 'url',
	color: 'color',
	hidden: 'hidden',
	json: 'json',
	//rating: 'rating',
	//widget: 'widget'
}

// - fields for comments, ratings...
let systemFields = [] 		// system fields to track records creation date, comments...
let f

if(config.wTimestamp){
    systemFields.push({
    	// - record creation date
    	type: 'datetime',
    	column: config.createdDateColumn,
    },
    {
    	// - record last update date
    	type: 'datetime',
    	column: config.updatedDateColumn,
    })
}
if(config.wWhoIs){
    systemFields.push({
    	// - record creator (user.id)
    	type: 'integer',
    	column:'c_uid',
    },
    {
    	// - record last editor (user.id)
    	type: 'integer',
    	column:'u_uid',
    })
}
if(config.wComments){
	f = {
    	// - number of comments about the record
    	type: 'integer',
    	column:'nb_comments',
    }
    systemFields.push(f)
}
// - tracking ratings.
if(config.wRating){
	f = {
    	type: 'integer',
    	column:'nb_ratings',
    }
    systemFields.push(f)
	f = {
    	type: 'integer',
    	column:'avg_ratings',
    }
    systemFields.push(f)
}

const fieldIsNumber = f => f.type===ft.int || f.type===ft.dec || f.type===ft.money
const fieldIsText = f => [ft.text, ft.textml, ft.url, ft.html, ft.email].indexOf(f.type)>-1
const fieldIsDateOrTime = f => f.type===ft.date || f.type===ft.datetime || f.type===ft.time
const fieldIsNumeric = f => fieldIsNumber(f) || fieldIsDateOrTime(f)

const fieldChartable = f => f.type===ft.lov || f.type===ft.bool || fieldIsNumber(f)
const fieldInCharts = f => fieldChartable(f) && !f.noCharts

function prepModel(m){
	if(m){
		if(!m._prepared){
			// - Model
			m.schemaTable = schema+'."'+(m.table || m.id)+'"';
			if(!m.pKey){
				m.pKey = 'id';
			}
			// - Fields
			m.fieldsH = {}
			m.fields.forEach(function(f, idx){
				if(f.type==='lov'){
					f.t2 = 't_'+idx
				}
				if(f.id!==m.table+'_id'){ // TODO: should not need the if
					m.fieldsH[f.id] = f; 
				}
			})
			// - Search
			if(m.searchFields){
				if(!Array.isArray(m.searchFields)){
					m.searchFields = [m.searchFields]
				}
			}else{
				m.searchFields = m.fields.filter(f => f.inSearch).map(f => f.id)
				if(m.searchFields.length<1){
					m.searchFields = m.fields.filter(f => f.inMany && fieldIsText(f)).map(f => f.id)
				}
			}
			m._prepared = true;
		}
		return m;
	}
	console.error('Error: undefined model.')
	return null;
}

function prepModelCollecs(m, models){
	if(m){
		if(m.collections){
			// - make collection map
			m.collecsH = {}
			m.collections.forEach(c => {
				if(c.object){
					const collecModel = models[c.object]
					if(collecModel){
						// - if table is not specified get it from collec object
						if(!c.table){
							c.table = collecModel.table
						}
						// - lookup fields by id
						const fsh = collecModel.fieldsH
						c.fields.forEach((f, idx) => {
							if(typeof(f) === 'string'){
								c.fields[idx] = JSON.parse(JSON.stringify(fsh[f]||{}))
							}
							if(f.type==='lov'){
								f.t2 = 't_'+idx
							}
						})
					}else{
						console.log('Model "'+c.object+'" not found in model "'+m.id+'".')
					}
				}
				m.collecsH[c.id] = c
			})
		}
		return m;
	}
	return null;
}

const ms = Object.keys(models)
console.log(ms)
// need 2 passes for field map to be populated first, then collecs
ms.forEach(m => { models[m] = prepModel(models[m]) })
ms.forEach(m => { models[m] = prepModelCollecs(models[m], models) })

module.exports = {

	fieldTypes: ft,

	modelIds: modelIds,

	getModel: mId => prepModel(models[mId]),

	prepModel: prepModel,

	fieldInMany: f =>  f.inList || f.inMany,

	fieldIsText: fieldIsText,

	fieldIsNumber: fieldIsNumber,
	fieldIsNumeric: fieldIsNumeric,
	fieldIsDateOrTime: fieldIsDateOrTime,

	fieldInCharts: fieldInCharts,
	fieldChartable: fieldChartable,

	systemFields: systemFields,
}
