/*
  Evolutility DB Model for Albums
  https://github.com/evoluteur/evolutility-server-node
*/

module.exports = {
	"id": "album",
    "active": true,
	"table": "music_album",
	"titleField": "name",
	"fields": [
		{
			"id": "title",
			"type": "text",
			"label": "Title",
			"required": true,
			"inMany": true,
			"column": "title"
		},
		{
			"id": "url",
			"type": "url",
			"label": "Amazon",
			"column": "url"
		},
		{
			"id": "artist",
			"type": "lov",
			"label": "Artist",
			"object": "artist",
			"required": true,
			"inMany": true,
			"column": "artist_id",
			"lovTable": "music_artist",
			"lovColumn": "name"
		},
		{
			"id": "description",
			"type": "textmultiline",
			"label": "Description",
			"maxLength": 1000,
			"inMany": false,
			"column": "description"
		},
		{
			"id": "cover",
			"type": "image",
			"label": "Album Cover",
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
			"order": "name",
			"fields": [
				{
					"id": "name",
					"type": "text",
					"label": "Track",
					"inMany": true,
					"column": "name"
				},
				{
					"id": "genre",
					"type": "lov",
					"label": "Genre",
					"column": "genre_id",
					"lovTable": "music_genre"
				},
				{
					"id": "length",
					"type": "text",
					"label": "Length",
					"inMany": true,
					"column": "length"
				}
			]
		}
	]
}