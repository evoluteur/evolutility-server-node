/*
  Evolutility DB model for Artists
  https://github.com/evoluteur/evolutility-server-node
*/

module.exports = {
	"id": "artist",
	"title": "Artists",
	"world": "music",
	"pKey": "id",
	"table": "music_artist",
	"active": true,
	"titleField": "name",
	"fields": [
		{
			"id": "name",
			"type": "text",
			"label": "Name",
			"required": true,
			"inMany": true,
			"column": "name"
		},
		{
			"id": "url",
			"type": "url",
			"label": "Web site",
			"column": "url"
		},
		{
			"id": "bdate",
			"type": "date",
			"label": "Birth date",
			"column": "bdate"
		},
		{
			"id": "photo",
			"type": "image",
			"label": "Photo",
			"inMany": true,
			"column": "photo"
		},
		{
			"id": "description",
			"type": "textmultiline",
			"label": "Description",
			"column": "description"
		}
	],
	"collections": [
		{
			"id": "music_album",
			"table": "music_album",
			"column": "artist_id",
			"object": "album",
			"orderBy": "title",
			"fields": [
				{
					"id": "title",
					"type": "text",
					"label": "Title",
					"column": "title"
				},
				{
					"id": "cover",
					"type": "image",
					"label": "Cover",
					"column": "cover"
				}
			]
		}
	],
	"noCharts": true,
	"noStats": true
}