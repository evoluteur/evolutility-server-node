module.exports = [ 
    {
        "object": 5,
        "cid": "wine_tasting",
        "label": 'Degustations',
        "table": "wine_tasting",
        "column": "wine_id",
        "orderBy": "drink_date",
        "order": "desc",
        "fields": [
            "drink_date",
            "robe",
            "nose",
            "taste",
            "notes",
        ]
    },

    {
        "object": 7,
        "cid": "music_track",
        "label": "Tracks",
        "icon": "music.png",
        "table": "music_track",
        "column": "album_id",
        "orderBy": "name", 
        "fields": [
            "name",
            "genre",
            "length",
        ]
    },
    {
        "object": 8,
        "cid": "music_album",
        "label": "Albums",
        "icon": "cd.png",
        "table": "music_album", 
        "column": "artist_id",
        "orderBy": "title",
        "fields": [
            "title",
            "cover", 
        ]
    }
]