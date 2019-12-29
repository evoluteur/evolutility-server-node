/*
  Evolutility DB model for Albums
  https://github.com/evoluteur/evolutility-server-node
*/

module.exports = {
	"id": "album",
	"title": "Albums",
	"world": "music",
	"pKey": "id",
	"table": "music_album",
	"active": true,
	"titleField": "name",
	"fields": [
		{
			"id": "title",
			"type": "text",
			"label": "Title",
			"required": true,
			"inMany": true,
			"column": "title",
			"inSearch": true
		},
		{
			"id": "artist",
			"type": "lov",
			"label": "Artist",
			"object": "artist",
			"required": true,
			"lovIcon": false,
			"inMany": true,
			"column": "artist_id",
			"lovTable": "music_artist",
			"lovColumn": "name"
		},
		{
			"id": "url",
			"type": "url",
			"label": "Amazon",
			"column": "url"
		},
		{
			"id": "length",
			"type": "text",
			"label": "Length",
			"inMany": true,
			"column": "length"
		},
		{
			"id": "description",
			"type": "textmultiline",
			"label": "Description",
			"maxLength": 1000,
			"inMany": false,
			"column": "description",
			"inSearch": true
		},
		{
			"id": "cover",
			"type": "image",
			"label": "Cover",
			"inMany": true,
			"column": "cover"
		}
	],
	"collections": [
		{
			"id": "music_track",
			"table": "music_track",
			"column": "album_id",
			"object": "track",
			"orderBy": "name",
			"fields": [
				"name",
				"genre",
				"length"
			]
		}
	],
	"noStats": true
}