/*
  Evolutility DB model for Tracks
  https://github.com/evoluteur/evolutility-server-node
*/

module.exports = {
	"id": "track",
	"title": "Tracks",
	"world": "music",
	"pKey": "id",
	"table": "music_track",
	"active": true,
	"titleField": "name",
	"fields": [
		{
			"id": "name",
			"type": "text",
			"label": "Name",
			"required": true,
			"inMany": true,
			"inSearch": true,
			"column": "name"
		},
		{
			"id": "album",
			"type": "lov",
			"label": "Album",
			"object": "album",
			"lovIcon": false,
			"inMany": true,
			"column": "album_id",
			"lovTable": "music_album",
			"lovColumn": "title"
		},
		{
			"id": "length",
			"type": "text",
			"label": "Length",
			"inMany": true,
			"column": "length"
		},
		{
			"id": "genre",
			"type": "lov",
			"label": "Genre",
			"list": [
				{
					"id": 1,
					"text": "Blues"
				},
				{
					"id": 2,
					"text": "Classical"
				},
				{
					"id": 3,
					"text": "Country"
				},
				{
					"id": 4,
					"text": "Electronic"
				},
				{
					"id": 5,
					"text": "Folk"
				},
				{
					"id": 6,
					"text": "Jazz"
				},
				{
					"id": 7,
					"text": "New age"
				},
				{
					"id": 8,
					"text": "Reggae"
				}
			],
			"lovIcon": false,
			"inMany": true,
			"column": "genre_id",
			"lovTable": "music_genre"
		}
	],
	"collections": [],
	"noStats": true
}