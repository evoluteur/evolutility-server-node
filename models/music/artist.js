/*
  Evolutility DB Model for Artists
  https://github.com/evoluteur/evolutility-server-node
*/

module.exports = {
	"id": "artist",
    "active": true,
	"table": "music_artist",
	"titleField": "name",
	"fields": [
		{
			"id": "name",
			"type": "text",
			"label": "Name",
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
			"id": "url_wiki",
			"type": "url_wiki",
			"label": "Wikipedia",
			"column": "url"
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
			"order": "title",
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
	]
}