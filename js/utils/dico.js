/*! ***************************************************************************
 *
 * evolutility :: utils/dico.js
 *
 * https://github.com/evoluteur/evolutility
 * Copyright (c) 2016 Olivier Giulieri
 *************************************************************************** */

var models = require('../../models/all_models'),
	config = require('../../config.js');

var schema = '"'+(config.schema || 'evol_demo')+'"';

var fTypes = {
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
	list: 'list', // many values for one field (behave like tags - return an array of strings)
	html: 'html',
	formula:'formula', // soon to be a field attribute rather than a field type
	email: 'email',
	pix: 'image',
	//geoloc: 'geolocation',
	//doc:'document',
	url: 'url',
	color: 'color',
	hidden: 'hidden',
	json: 'json'
	//rating: 'rating',
	//widget: 'widget'
};

function fieldIsNumber(f){
	return [fTypes.int, fTypes.dec, fTypes.money].indexOf(f.type)>-1;
}

function fieldInCharts(f) {
	return fieldChartable(f) && !f.noCharts;
}

function fieldChartable(f) { 
	return  (f.type===fTypes.lov || f.type===fTypes.list || 
				f.type===fTypes.bool || fieldIsNumber(f));
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
	if(!m.prepared){
		m.fieldsH = {}
		m.fields.forEach(function(f, idx){
			if(f.type==='lov'){
				f.t2 = 't_'+idx
			}
			m.fieldsH[f.id] = f; 
		})
		m.schemaTable = schema+'."'+(m.table || m.id)+'"';
		if(m.collecs && !m.collecsH){
			m.collecsH = hById(m.collecs);
		}
		m.prepared = true;
	}
	return m;
}


module.exports = {

	fieldTypes: fTypes,

	getModel: function(mId){ 
	// - return a model enhanced w/ hashs
		return prepModel(models[mId]);
	},

	prepModel: prepModel,

	fieldInMany:function(f){
		return f.inList || f.inMany
	},

	fieldIsText: function(f){
		return [fTypes.text, fTypes.textml, fTypes.url, fTypes.html, fTypes.email].indexOf(f.type)>-1;
	},

	fieldIsNumber: fieldIsNumber,

	fieldInCharts: fieldInCharts,

	fieldChartable: fieldChartable

}
