/*
  Evolutility DB model for Fields
  https://github.com/evoluteur/evolutility-server-node
*/

module.exports = {
	"id": "field",
	"title": "Fields",
	"world": "designer",
	"pKey": "id",
	"table": "evol_field",
	"titleField": "label",
	"fields": [
		{
			"id": "label",
			"type": "text",
			"label": "Label",
			"required": true,
			"maxLength": 100,
			"inMany": true,
			"column": "label",
			"inSearch": true
		},
		{
			"id": "type",
			"type": "lov",
			"label": "Type",
			"required": true,
			"list": [
				{
					"id": 1,
					"text": "Text",
					"icon": "designer/ft-txt.gif"
				},
				{
					"id": 2,
					"text": "Text multiline",
					"icon": "designer/ft-txtml.gif"
				},
				{
					"id": 3,
					"text": "Boolean",
					"icon": "designer/ft-bool.gif"
				},
				{
					"id": 4,
					"text": "Decimal",
					"icon": "designer/ft-dec.gif"
				},
				{
					"id": 5,
					"text": "Money",
					"icon": "designer/ft-money.gif"
				},
				{
					"id": 6,
					"text": "Integer",
					"icon": "designer/ft-int.gif"
				},
				{
					"id": 7,
					"text": "Date",
					"icon": "designer/ft-date.gif"
				},
				{
					"id": 8,
					"text": "Time",
					"icon": "designer/ft-time.gif"
				},
				{
					"id": 9,
					"text": "Date-time",
					"icon": "designer/ft-datetime.gif"
				},
				{
					"id": 10,
					"text": "Image",
					"icon": "designer/ft-img.gif"
				},
				{
					"id": 11,
					"text": "Dropdown (lov)",
					"icon": "designer/ft-lov.gif"
				},
				{
					"id": 12,
					"text": "email",
					"icon": "designer/ft-email.gif"
				},
				{
					"id": 13,
					"text": "Link",
					"icon": "designer/ft-url.gif"
				},
				{
					"id": 14,
					"text": "Multiselect (list)",
					"icon": "designer/ft-list.gif"
				},
				{
					"id": 15,
					"text": "JSON",
					"icon": "designer/ft-json.png"
				}
			],
			"lovIcon": true,
			"defaultValue": 1,
			"inMany": true,
			"column": "type_id",
			"lovTable": "evol_field_type",
			"lovColumn": "name"
		},
		{
			"id": "column",
			"type": "text",
			"label": "Column",
			"required": true,
			"maxLength": 63,
			"column": "dbcolumn",
			"inSearch": true
		},
		{
			"id": "fid",
			"type": "text",
			"label": "Field ID",
			"required": true,
			"inMany": true,
			"column": "fid",
			"inSearch": true
		},
		{
			"id": "object",
			"type": "lov",
			"label": "Object",
			"object": "object",
			"required": true,
			"noCharts": true,
			"lovIcon": false,
			"inMany": true,
			"column": "object_id",
			"lovTable": "evol_object",
			"lovColumn": "title",
			"deleteTrigger": true
		},
		{
			"id": "lovTable",
			"type": "text",
			"label": "LOV Table",
			"maxLength": 63,
			"column": "lovtable"
		},
		{
			"id": "lovColumn",
			"type": "text",
			"label": "LOV column",
			"maxLength": 63,
			"column": "lovcolumn"
		},
		{
			"id": "lovIcon",
			"type": "text",
			"label": "LOV Icon",
			"maxLength": 63,
			"column": "lovicon"
		},
		{
			"id": "inMany",
			"type": "boolean",
			"label": "In List",
			"inMany": true,
			"column": "inmany"
		},
		{
			"id": "inSearch",
			"type": "boolean",
			"label": "In Search",
			"inMany": true,
			"column": "insearch"
		},
		{
			"id": "noFilter",
			"type": "boolean",
			"label": "In Filter",
			"inMany": true,
			"column": "nofilter"
		},
		{
			"id": "position",
			"type": "integer",
			"label": "Position",
			"noCharts": true,
			"maxLength": 3,
			"column": "position"
		},
		{
			"id": "width",
			"type": "integer",
			"label": "Width",
			"maxLength": 3,
			"defaultValue": 100,
			"column": "width"
		},
		{
			"id": "height",
			"type": "integer",
			"label": "Height",
			"max": 30,
			"maxLength": 3,
			"defaultValue": 1,
			"column": "height"
		},
		{
			"id": "css",
			"type": "text",
			"label": "CSS",
			"maxLength": 20,
			"column": "css"
		},
		{
			"id": "format",
			"type": "text",
			"label": "Format",
			"maxLength": 30,
			"column": "format"
		},
		{
			"id": "labelShort",
			"type": "text",
			"label": "Short label",
			"column": "labelshort"
		},
		{
			"id": "required",
			"type": "boolean",
			"label": "Required",
			"inMany": true,
			"column": "required"
		},
		{
			"id": "readOnly",
			"type": "boolean",
			"label": "Read only",
			"defaultValue": false,
			"column": "readonly"
		},
		{
			"id": "minLength",
			"type": "integer",
			"label": "Min. length",
			"noCharts": true,
			"column": "minlength"
		},
		{
			"id": "maxLength",
			"type": "integer",
			"label": "Max. length",
			"noCharts": true,
			"maxLength": 7,
			"column": "maxlength"
		},
		{
			"id": "minValue",
			"type": "integer",
			"label": "Min. value",
			"noCharts": true,
			"maxLength": 4,
			"column": "minvalue"
		},
		{
			"id": "maxValue",
			"type": "integer",
			"label": "Max. value",
			"noCharts": true,
			"maxLength": 4,
			"column": "maxvalue"
		},
		{
			"id": "regExp",
			"type": "text",
			"label": "Regular Expression",
			"maxLength": 100,
			"column": "regexp"
		},
		{
			"id": "noCharts",
			"type": "boolean",
			"label": "Exclude from Charts",
			"column": "nocharts"
		},
		{
			"id": "noStats",
			"type": "boolean",
			"label": "Exclude from Stats",
			"column": "nostats"
		},
		{
			"id": "help",
			"type": "textmultiline",
			"label": "Help",
			"maxLength": 500,
			"column": "help",
			"inSearch": true
		},
		{
			"id": "description",
			"type": "textmultiline",
			"label": "Description",
			"maxLength": 500,
			"column": "description",
			"inSearch": true
		},
		{
			"id": "defaultValue",
			"type": "text",
			"label": "Default Value",
			"column": "defaultvalue"
		},
		{
			"id": "deleteTrigger",
			"type": "boolean",
			"label": "Delete trigger",
			"column": "deletetrigger"
		}
	],
	"collections": []
}