/*!
 * evolutility :: utils/dico.js
 * Helper functions for metadata
 *
 * https://github.com/evoluteur/evolutility
 * (c) 2021 Olivier Giulieri
 */

const config = require('../../config.js');

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

module.exports = {

	fieldTypes: ft,

	fieldInMany: f =>  f.inList || f.inMany,

	fieldIsText: fieldIsText,
	fieldIsNumber: fieldIsNumber,
	fieldIsNumeric: fieldIsNumeric,
	fieldIsDateOrTime: fieldIsDateOrTime,

	fieldInCharts: fieldInCharts,
	fieldChartable: fieldChartable,

	systemFields: systemFields,
}
