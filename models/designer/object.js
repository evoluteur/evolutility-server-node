/*
  Evolutility DB model for Objects
  https://github.com/evoluteur/evolutility-server-node
*/

module.exports = {
	"id": "object",
	"title": "Objects",
	"world": "designer",
	"pKey": "id",
	"table": "evol_object",
	"titleField": "title",
	"searchFields": [
		"title",
		"name",
		"table",
		"description"
	],
	"fields": [
		{
			"id": "title",
			"type": "text",
			"label": "Title",
			"required": true,
			"maxLength": 200,
			"inMany": true,
			"column": "title"
		},
		{
			"id": "active",
			"type": "boolean",
			"label": "Active",
			"inMany": true,
			"column": "active"
		},
		{
			"id": "world",
			"type": "lov",
			"label": "World",
			"object": "world",
			"lovIcon": false,
			"inMany": true,
			"column": "world_id",
			"lovTable": "evol_world"
		},
		{
			"id": "noCharts",
			"type": "boolean",
			"label": "No Charts",
			"column": "nocharts"
		},
		{
			"id": "noStats",
			"type": "boolean",
			"label": "No Stats",
			"column": "nostats"
		},
		{
			"id": "table",
			"type": "text",
			"label": "DB Table name",
			"required": true,
			"maxLength": 63,
			"inMany": true,
			"column": "table"
		},
		{
			"id": "pKey",
			"type": "text",
			"label": "Primary key column",
			"column": "pkey"
		},
		{
			"id": "entity",
			"type": "text",
			"label": "Object Id",
			"required": true,
			"maxLength": 100,
			"inMany": true,
			"column": "entity"
		},
		{
			"id": "name",
			"type": "text",
			"label": "Object name (singular)",
			"required": true,
			"maxLength": 50,
			"inMany": true,
			"column": "name"
		},
		{
			"id": "namePlural",
			"type": "text",
			"label": "name (plural)",
			"required": true,
			"maxLength": 50,
			"column": "nameplural"
		},
		{
			"id": "icon",
			"type": "image",
			"label": "Icon",
			"readOnly": true,
			"maxLength": "50",
			"inMany": true,
			"column": "icon"
		},
		{
			"id": "titleField",
			"type": "text",
			"label": "Title field",
			"column": "titlefield"
		},
		{
			"id": "searchFields",
			"type": "textmultiline",
			"label": "Search fields",
			"column": "searchfields"
		},
		{
			"id": "description",
			"type": "textmultiline",
			"label": "Description",
			"maxLength": 250,
			"column": "description"
		},
		{
			"id": "groups",
			"type": "json",
			"label": "Fields groups",
			"column": "groups"
		}
	],
	"collections": [
		{
			"id": "collec-fields",
			"table": "evol_field",
			"column": "object_id",
			"object": "field",
			"orderBy": "position, t1.id",
			"fields": [
				{
					"id": "label",
					"type": "text",
					"label": "Label",
					"column": "label"
				},
				{
					"id": "column",
					"label": "Column",
					"column": "dbcolumn"
				},
				{
					"id": "type",
					"type": "lov",
					"label": "Type",
					"lovIcon": true,
					"column": "type_id",
					"lovTable": "evol_field_type",
					"lovColumn": "name"
				},
				{
					"id": "inMany",
					"type": "boolean",
					"label": "List",
					"column": "inmany"
				},
				{
					"id": "width",
					"type": "integer",
					"label": "Width",
					"defaultValue": 100,
					"column": "width"
				},
				{
					"id": "height",
					"type": "integer",
					"label": "Height",
					"column": "height"
				},
				{
					"id": "required",
					"type": "boolean",
					"label": "Required",
					"column": "required"
				}
			]
		}
	]
}