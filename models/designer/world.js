/*
  Evolutility DB model for Worlds
  https://github.com/evoluteur/evolutility-server-node
*/

module.exports = {
	"id": "world",
	"title": "Worlds",
	"world": "designer",
	"pKey": "id",
	"table": "evol_world",
	"titleField": "name",
	"fields": [
		{
			"id": "name",
			"type": "text",
			"label": "Name",
			"required": true,
			"maxLength": 100,
			"inMany": true,
			"column": "name",
			"inSearch": true
		},
		{
			"id": "active",
			"type": "boolean",
			"label": "Active",
			"inMany": true,
			"column": "active"
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
			"id": "position",
			"type": "integer",
			"label": "Position",
			"maxLength": 3,
			"column": "position"
		}
	],
	"collections": [
		{
			"id": "collec_objects",
			"table": "evol_object",
			"column": "world_id",
			"object": "object",
			"fields": [
				"title",
				"icon",
				"active"
			]
		}
	]
}