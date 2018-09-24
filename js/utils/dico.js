/*! ***************************************************************************
 *
 * evolutility :: utils/dico.js
 * Helper functions for metadata
 *
 * https://github.com/evoluteur/evolutility
 * (c) 2018 Olivier Giulieri
 *************************************************************************** */

var models = require('../../models/all_models'),
	config = require('../../config.js');

var schema = '"'+(config.schema || 'evolutility')+'"';

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

function fieldIsNumber(f){
	return f.type===ft.int || f.type===ft.dec || f.type===ft.money;
}
function fieldIsDateOrTime(f){
	return f.type===ft.date || f.type===ft.datetime || f.type===ft.time;
}
function fieldIsNumeric(f){
	return fieldIsNumber(f) || fieldIsDateOrTime(f) 
}

function fieldInCharts(f) {
	return fieldChartable(f) && !f.noCharts;
}

function fieldChartable(f) { 
	return  (f.type===ft.lov || f.type===ft.list || 
				f.type===ft.bool || fieldIsNumber(f));
}

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
			m.fieldsH = {}
			m.fields.forEach(function(f, idx){
				if(f.type==='lov'){
					f.t2 = 't_'+idx
				}
				m.fieldsH[f.id] = f; 
			})
			m.schemaTable = schema+'."'+(m.table || m.id)+'"';
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

	getModel: function(mId){ 
	// - return a model enhanced w/ hashs
		return prepModel(models[mId]);
	},

	prepModel: prepModel,

	fieldInMany:function(f){
		return f.inList || f.inMany
	},

	fieldIsText: function(f){
		return [ft.text, ft.textml, ft.url, ft.html, ft.email].indexOf(f.type)>-1;
	},

	fieldIsNumber: fieldIsNumber,
	fieldIsNumeric: fieldIsNumeric,
	fieldIsDateOrTime: fieldIsDateOrTime,

	fieldInCharts: fieldInCharts,

	fieldChartable: fieldChartable,

	systemFields: systemFields,
    systemManyFields: systemManyFields,
}
