/*
  Evolutility DB model for Collection
  https://github.com/evoluteur/evolutility-server-node
*/

module.exports = {
	"id": "collection",
	"title": "Collection",
	"world": "designer",
	"pKey": "id",
	"table": "evol_object_collec",
	"titleField": "label",
	"fields": [
		{
			"id": "label",
			"type": "text",
			"label": "Label",
			"maxLength": 200,
			"inMany": true,
			"column": "label",
			"inSearch": true
		},
		{
			"id": "cid",
			"type": "text",
			"label": "Collection Id",
			"required": true,
			"maxLength": 50,
			"inMany": true,
			"column": "cid",
			"inSearch": true
		},
		{
			"id": "position",
			"type": "integer",
			"label": "Position",
			"inMany": true,
			"column": "position"
		},
		{
			"id": "table",
			"type": "text",
			"label": "DB Table name",
			"required": true,
			"maxLength": 63,
			"inMany": true,
			"column": "table",
			"inSearch": true
		},
		{
			"id": "column",
			"type": "text",
			"label": "DB Column",
			"required": true,
			"maxLength": 63,
			"inMany": true,
			"column": "dbcolumn",
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
			"id": "fields",
			"type": "json",
			"label": "Fields",
			"required": true,
			"column": "fields"
		},
		{
			"id": "description",
			"type": "textmultiline",
			"label": "Description",
			"maxLength": 250,
			"column": "description",
			"inSearch": true
		}
	],
	"collections": []
}