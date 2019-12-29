/*
  Evolutility DB model for Graphic Novels
  https://github.com/evoluteur/evolutility-server-node
*/

module.exports = {
	"id": "comics",
	"title": "Graphic Novels",
	"world": "organizer",
	"pKey": "id",
	"table": "comics",
	"active": true,
	"titleField": "title",
	"fields": [
		{
			"id": "title",
			"type": "text",
			"label": "Title",
			"required": true,
			"maxLength": 255,
			"inMany": true,
			"column": "title",
			"inSearch": true
		},
		{
			"id": "authors",
			"type": "text",
			"label": "Authors",
			"inMany": true,
			"column": "authors",
			"inSearch": true
		},
		{
			"id": "genre",
			"type": "lov",
			"label": "Genre",
			"list": [
				{
					"id": 1,
					"text": "Adventure"
				},
				{
					"id": 3,
					"text": "Erotic"
				},
				{
					"id": 2,
					"text": "Fairy tale"
				},
				{
					"id": 4,
					"text": "Fantastic"
				},
				{
					"id": 14,
					"text": "Graphic novel"
				},
				{
					"id": 5,
					"text": "Heroic Fantasy"
				},
				{
					"id": 6,
					"text": "Historic"
				},
				{
					"id": 7,
					"text": "Humor"
				},
				{
					"id": 8,
					"text": "One of a kind"
				},
				{
					"id": 11,
					"text": "Science-fiction"
				},
				{
					"id": 12,
					"text": "Super Heros"
				},
				{
					"id": 10,
					"text": "Thriller"
				},
				{
					"id": 13,
					"text": "Western"
				},
				{
					"id": 9,
					"text": "Youth"
				}
			],
			"lovIcon": false,
			"inMany": true,
			"column": "genre_id",
			"lovTable": "comics_genre"
		},
		{
			"id": "serie_nb",
			"type": "integer",
			"label": "Albums",
			"noCharts": true,
			"inMany": true,
			"column": "serie_nb"
		},
		{
			"id": "have_nb",
			"type": "integer",
			"label": "Owned",
			"noCharts": true,
			"inMany": true,
			"column": "have_nb"
		},
		{
			"id": "have",
			"type": "text",
			"label": "Have",
			"inMany": false,
			"column": "have"
		},
		{
			"id": "language",
			"type": "lov",
			"label": "Language",
			"list": [
				{
					"id": 2,
					"text": "French",
					"icon": "comics/flags/fr.png"
				},
				{
					"id": 1,
					"text": "American",
					"icon": "comics/flags/us.png"
				}
			],
			"lovIcon": true,
			"inMany": true,
			"column": "language_id",
			"lovTable": "comics_language"
		},
		{
			"id": "complete",
			"type": "boolean",
			"label": "Complete",
			"inMany": true,
			"column": "complete"
		},
		{
			"id": "finished",
			"type": "boolean",
			"label": "Finished",
			"inMany": true,
			"column": "finished"
		},
		{
			"id": "url_bdfugue",
			"type": "url",
			"label": "BDFugue",
			"column": "url_bdfugue"
		},
		{
			"id": "url_amazon",
			"type": "url",
			"label": "Amazon",
			"column": "url_amazon"
		},
		{
			"id": "pix",
			"type": "image",
			"label": "Album Cover",
			"inMany": true,
			"column": "pix"
		},
		{
			"id": "notes",
			"type": "textmultiline",
			"label": "Notes",
			"maxLength": 1000,
			"inMany": false,
			"column": "notes",
			"inSearch": true
		}
	],
	"collections": []
}