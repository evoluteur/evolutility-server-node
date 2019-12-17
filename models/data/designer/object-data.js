module.exports = [
    {
        "id": 1,
        "title": "To-Do List",
        "active": true,
        "world": 1,
        "table": "todo",
        "entity": "todo",
        "name": "task",
        "namePlural": "tasks",
        "icon": "todo.gif",
        "groups": [
            {
                "id": "p1",
                "type": "panel",
                "label": "Task",
                "width": 62,
                "fields": [
                    "title",
                    "duedate",
                    "category"
                ]
            },
            {
                "id": "p2",
                "type": "panel",
                "label": "Status",
                "width": 38,
                "fields": [
                    "priority",
                    "complete"
                ]
            },
            {
                "id": "p3",
                "type": "panel",
                "label": "Task Description",
                "width": 100,
                "fields": [
                    "description"
                ]
            }
        ]
    },
    {
        "id": 2,
        "title": "Address Book",
        "active": true,
        "world": 1,
        "table": "contact",
        "entity": "contact",
        "name": "contact",
        "namePlural": "contacts",
        "icon": "contact.gif",
        "groups": [
            {
                "type": "panel",
                "label": "Identity",
                "width": 62,
                "fields": [
                    "lastname",
                    "firstname",
                    "jobtitle",
                    "company",
                    "email",
                    "web"
                ]
            },
            {
                "type": "panel",
                "label": "Contact Info",
                "width": 38,
                "fields": [
                    "phone",
                    "phonehome",
                    "phonecell",
                    "fax"
                ]
            },
            {
                "type": "panel",
                "label": "Address",
                "width": 62,
                "fields": [
                    "address",
                    "city",
                    "state",
                    "zip",
                    "country"
                ]
            },
            {
                "type": "panel",
                "label": "Misc.",
                "width": 38,
                "fields": [
                    "category",
                    "notes"
                ]
            }
        ]
    },
    {
        "id": 3,
        "title": "Graphic novels",
        "active": true,
        "world": 1,
        "table": "comics",
        "entity": "comics",
        "name": "serie",
        "namePlural": "series",
        "icon": "comics.png",
        groups: [
            {
                "id": "serie",
                "type": "panel",
                "label": "Serie",
                "width": 70,
                "fields": [
                    "title",
                    "authors",
                    "genre",
                    "serie_nb",
                    "have_nb",
                    "have",
                    "language",
                    "complete",
                    "finished",
                    "url_bdfugue",
                    "url_amazon",
                    "notes"
                ]
            },
            {
                "id": "pix",
                "type": "panel",
                "label": "Album Cover",
                "width": 30,
                "fields": [
                    "pix"
                ]
            }
        ]
    },
    {
        "id": 4,
        "title": "Restaurants",
        "active": true,
        "world": 1,
        "table": "restaurant",
        "entity": "restaurant",
        "name": "restaurant",
        "namePlural": "restaurants",
        "icon": "resto.gif",
        "groups": [
            {
              id:"pResto", type:"panel", 
              label: "Restaurant", width: 62,
              fields: ['name','cuisine','schedule','yelp','price','notes','hours','favorite']
            },
            {
              id:"pContact", type:"panel", 
              label: "Contact", width: 38,
              fields: ['phone','web','address','city','state','zip',]
            },
        ]
    },
    {
        "id": 5,
        "title": "Wine Cellar",
        "active": true,
        "world": 1,
        "table": "wine",
        "entity": "winecellar",
        "name": "wine",
        "namePlural": "wines",
        "icon": "wine-bottle.png",
        "groups": [
            {
                "type": "panel",
                "label": "Wine",
                "width": 80,
                "fields": [
                    "name",
                    "vintage",
                    "winery",
                    "bsize",
                    "grape",
                    "type",
                    "appellation",
                    "country",
                    "region",
                    "area"
                ]
            },
            {
                "type": "panel",
                "label": "Bottle Label",
                "width": 20,
                "fields": [
                    "label_img"
                ]
            },
            {
                "type": "panel",
                "label": "Purchase",
                "width": 100,
                "fields": [
                    "buying_date",
                    "price",
                    "value",
                    "purchased",
                    "remaining",
                    "notes"
                ]
            },
            {
                "type": "panel",
                "label": "Drinking",
                "width": 62,
                "fields": [
                    "drink_from",
                    "drink_to",
                    "peak_from",
                    "peak_to",
                    "meal"
                ]
            },
            {
                "type": "panel",
                "label": "Score",
                "width": 38,
                "fields": [
                    "score",
                    "score_parker",
                    "score_winespectator"
                ]
            },
            {
                "type": "panel",
                "label": "Comments",
                "width": 100,
                "fields": [
                    "comments"
                ]
            }
        ]
    },
    {
        "id": 6,
        "title": "Wine Tasting",
        "active": true,
        "world": 1,
        "table": "wine_tasting",
        "entity": "winetasting",
        "name": "wine tasting",
        "namePlural": "wine tastings",
        "icon": "wine.gif",
        "groups": [
            {
                "id": "p1",
                "type": "panel",
                "label": "Degustation",
                "width": 62,
                "fields": [
                    "drink_date",
                    "wine_id",
                    "notes"
                ]
            },
            {
                "id": "p2",
                "type": "panel",
                "label": "Evaluation",
                "width": 38,
                "fields": [
                    "taste",
                    "robe",
                    "nose"
                ]
            }
        ]
    },
    {
        "id": 7,
        "title": "Albums",
        "active": true,
        "world": 2,
        "table": "album",
        "entity": "album",
        "name": "album",
        "namePlural": "albums",
        "icon": "cd.png",
        "groups": [
            {
                "id": "p-album",
                "type": "panel",
                "label": "Album",
                "table": 'music_album',
                "column": 'album_id',
                "width": 70,
                "fields": [
                    "title",
                    "artist",
                    "url",
                    'description'
                ]
            },
            {
                "id": "p-cover",
                "type": "panel",
                "label": "Cover",
                "width": 30,
                "fields": [
                    "cover"
                ]
            }
        ]
    },
    {
        "id": 8,
        "title": "Artists",
        "active": true,
        "world": 2,
        "table": "artist",
        "entity": "artist",
        "name": "artist",
        "namePlural": "artists",
        "icon": "star.png",
        "groups": [
            {
                "id": "g1",
                "type": "panel",
                "label": "Artist",
                "width": 70,
                "fields": [
                    "name",
                    "url",
                    "bdate",
                    'description'
                ]
            },
            {
                "id": "g2",
                "type": "panel",
                "label": "Photo",
                "width": 30,
                "fields": [
                    "photo"
                ]
            }
        ]
    },
    {
        "id": 9,
        "title": "Tracks",
        "active": true,
        "world": 2,
        "table": "track",
        "entity": "track",
        "name": "track",
        "namePlural": "tracks",
        "icon": "music.png"
    },
    {
        "id": 10,
        "title": "Field types test",
        "active": false,
        "world": 3,
        "table": "test",
        "entity": "test",
        "name": "test",
        "namePlural": "tests",
        "icon": "eye.png",
        "description": "Dummy object with fields of all possible types for easy testing."
    },
    {
        "id": 11,
        "title": "Fields",
        "active": false,
        "world": 5,
        "table": "field",
        "entity": "field",
        "name": "field",
        "namePlural": "fields",
        "icon": ""
    },
    {
        "id": 12,
        "title": "Object",
        "active": false,
        "world": 5,
        "table": "object",
        "entity": "object",
        "name": "object",
        "namePlural": "objects",
        "icon": "cube.gif"
    },
    {
        "id": 13,
        "title": "Apps",
        "active": false,
        "world": 5,
        "table": "world",
        "entity": "world",
        "name": "world",
        "namePlural": "worlds",
        "icon": ""
    }
]