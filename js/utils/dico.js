/*! ***************************************************************************
 *
 * evolutility :: utils/dico.js
 * Helper functions for metadata
 *
 * https://github.com/evoluteur/evolutility
 * (c) 2019 Olivier Giulieri
 *************************************************************************** */

var models = require('../../models/all_models'),
	config = require('../../config.js');

var schema = '"'+(config.schema || 'evolutility')+'"';

// - Field Types
var ft = {
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
};

// - fields for comments, ratings...
var systemFields = [] 		// all system fields
var systemManyFields = []	// system fields in list and cards views
var f

if(config.wTimestamp){
    systemFields.push({
    	// record creation date
    	type: 'datetime',
    	column:'c_date',
    },
    {
    	// record last update date
    	type: 'datetime',
    	column:'u_date',
    })
}
if(config.wWhoIs){
    systemFields.push({
    	// record creator (user.id)
    	type: 'integer',
    	column:'c_uid',
    },
    {
    	// record last editor (user.id)
    	type: 'integer',
    	column:'u_uid',
    })
}
if(config.wComments){
	f = {
    	// number of comments about the record
    	type: 'integer',
    	column:'nb_comments',
    }
    systemManyFields.push(f)
    systemFields.push(f)
}
// - tracking ratings.
if(config.wRating){
	f = {
    	type: 'integer',
    	column:'nb_ratings',
    }
    systemManyFields.push(f)
    systemFields.push(f)
	f = {
    	type: 'integer',
    	column:'avg_ratings',
    }
    systemManyFields.push(f)
    systemFields.push(f)
}

const fieldIsNumber = f => f.type===ft.int || f.type===ft.dec || f.type===ft.money

const fieldIsText = f => [ft.text, ft.textml, ft.url, ft.html, ft.email].indexOf(f.type)>-1

const fieldIsDateOrTime = f => f.type===ft.date || f.type===ft.datetime || f.type===ft.time

const fieldIsNumeric = f => fieldIsNumber(f) || fieldIsDateOrTime(f)

const fieldInCharts = f => fieldChartable(f) && !f.noCharts

const fieldChartable = f => f.type===ft.lov || f.type===ft.list || f.type===ft.bool || fieldIsNumber(f)

function hById(arr){
	var objH={};
	if(arr){
		arr.forEach(function(o){
			objH[o.id] = o; 
		});
	}
	return objH;
}

function prepModel(m){
	if(m){
		if(!m.prepared){
			m.schemaTable = schema+'."'+(m.table || m.id)+'"';
			m.fieldsH = {}
			m.fields.forEach(function(f, idx){
				if(f.type==='lov'){
					f.t2 = 't_'+idx
				}
				if(f.id!==m.table+'_id'){ // TODO: should not need the if
					m.fieldsH[f.id] = f; 
				}
			})
			if(m.searchFields){
				if(!Array.isArray(m.searchFields)){
					m.searchFields = [m.searchFields]
				}
			}else{
				m.searchFields = m.fields.filter(f => {
					return f.inMany && fieldIsText(f.type)
				}).map(f => f.id)
			}
			if(m.collections && !m.collecsH){
				m.collecsH = hById(m.collections);
			}
			m.prepared = true;
		}
		return m;
	}else{
		console.log('Error in "prepModel": model ="'+m+'".')
		return null;
	}
}

module.exports = {

	fieldTypes: ft,

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
    systemManyFields: systemManyFields,
}
