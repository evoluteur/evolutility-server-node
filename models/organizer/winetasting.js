/*
  Evolutility DB model for Wine tastings
  https://github.com/evoluteur/evolutility-server-node
*/

module.exports = {
	"id": "winetasting",
	"title": "Wine tastings",
	"world": "organizer",
	"pKey": "id",
	"table": "wine_tasting",
	"active": true,
	"titleField": "drink_date",
	"fields": [
		{
			"id": "drink_date",
			"type": "date",
			"label": "Date",
			"required": true,
			"inMany": true,
			"column": "drink_date"
		},
		{
			"id": "wine",
			"type": "lov",
			"label": "Wine",
			"object": "winecellar",
			"required": true,
			"lovIcon": false,
			"inMany": true,
			"column": "wine_id",
			"lovTable": "wine",
			"deleteTrigger": true
		},
		{
			"id": "taste",
			"type": "text",
			"label": "Taste",
			"maxLength": 100,
			"inMany": true,
			"inSearch": true,
			"column": "taste"
		},
		{
			"id": "robe",
			"type": "text",
			"label": "Robe",
			"maxLength": 100,
			"inMany": true,
			"inSearch": true,
			"column": "robe"
		},
		{
			"id": "nose",
			"type": "text",
			"label": "Nose",
			"maxLength": 100,
			"inMany": true,
			"inSearch": true,
			"column": "nose"
		},
		{
			"id": "notes",
			"type": "textmultiline",
			"label": "Note",
			"inMany": true,
			"inSearch": true,
			"column": "notes"
		}
	],
	"collections": [],
	"noStats": true
}