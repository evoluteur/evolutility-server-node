/*! ***************************************************************************
 *
 * evolutility :: utils/dico.js
 *
 * https://github.com/evoluteur/evolutility
 * Copyright (c) 2016 Olivier Giulieri
 *************************************************************************** */

var _ = require('underscore')

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
	_.forEach(arr, function(o){
		objH[o.id] = o; 
	});
	return objH;
}

function getFields(uiModel) {
	var fs = [];

	function collectFields(te) {
		if (te && te.elements && te.elements.length > 0) {
			te.elements.forEach(function(te) {
				if (te.type != 'panel-list') {
					collectFields(te);
				}
			});
		} else { 
			if(te.type && te.type!== 'formula'){
				fs.push(te);
			}
		}
	}

	if(uiModel.fields){
		return uiModel.fields;
	}else{
		collectFields(uiModel);
		uiModel.fields=fs;
		return fs;
	}
}


module.exports = {  

	fieldTypes: fTypes,

	getFields: getFields,

	prepModel: function(m){
		if(!m.fields){
			m.fields = getFields(m);
		}
		if(!m.fieldsH){
			m.fieldsH = hById(m.fields);
		}
		if(m.collecs && !m.collecsH){
			m.collecsH = hById(m.collecs);
		}
		return m;
	},

	isFieldMany:function(f){
		return f.inList || f.inMany
	},

	fieldIsText: function(f){
		return [fTypes.text, fTypes.textml, fTypes.url, fTypes.html, fTypes.email].indexOf(f.type)>-1;
	},

	fieldIsNumber: fieldIsNumber,

	fieldInCharts: fieldInCharts,

	fieldChartable: fieldChartable,

	hById: hById

}
