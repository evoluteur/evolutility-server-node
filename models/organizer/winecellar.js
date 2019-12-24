/*
  Evolutility DB model for Wine cellar
  https://github.com/evoluteur/evolutility-server-node
*/

module.exports = {
	"id": "winecellar",
	"title": "Wine cellar",
	"world": "organizer",
	"pKey": "id",
	"table": "wine",
	"active": true,
	"titleField": "name",
	"fields": [
		{
			"id": "name",
			"type": "text",
			"label": "Name",
			"required": true,
			"maxLength": 150,
			"inMany": true,
			"inSearch": true,
			"column": "name"
		},
		{
			"id": "vintage",
			"type": "integer",
			"label": "Vintage",
			"required": true,
			"max": 2020,
			"min": 1900,
			"maxLength": 4,
			"inMany": true,
			"column": "vintage"
		},
		{
			"id": "winery",
			"type": "text",
			"label": "Winery",
			"required": true,
			"maxLength": 100,
			"inMany": true,
			"inSearch": true,
			"column": "winery"
		},
		{
			"id": "bsize",
			"type": "lov",
			"label": "Bottle Size",
			"list": [
				{
					"id": 1,
					"text": "750 ml"
				},
				{
					"id": 2,
					"text": "500 ml"
				},
				{
					"id": 3,
					"text": "375 cl"
				},
				{
					"id": 4,
					"text": "1.5 L"
				},
				{
					"id": 5,
					"text": "3.0 L"
				},
				{
					"id": 6,
					"text": "6.0 L"
				},
				{
					"id": 7,
					"text": "8.0 L"
				}
			],
			"lovIcon": false,
			"column": "bottle_size",
			"lovTable": "wine_bsize"
		},
		{
			"id": "grape",
			"type": "lov",
			"label": "Grape",
			"list": [
				{
					"id": 1,
					"text": "Chardonnay"
				},
				{
					"id": 2,
					"text": "Shiraz"
				},
				{
					"id": 3,
					"text": "Merlot"
				},
				{
					"id": 4,
					"text": "Pinot Noir"
				},
				{
					"id": 5,
					"text": "Cabernet"
				},
				{
					"id": 6,
					"text": "Zinfandel"
				},
				{
					"id": 7,
					"text": "Sauvignon"
				},
				{
					"id": 8,
					"text": "Cabernet Sauvignon"
				},
				{
					"id": 9,
					"text": "Aligoté"
				},
				{
					"id": 10,
					"text": "Alvarinho"
				},
				{
					"id": 11,
					"text": "Blanc Fumé"
				},
				{
					"id": 12,
					"text": "Bual"
				},
				{
					"id": 13,
					"text": "Carignan"
				},
				{
					"id": 14,
					"text": "Chasselas"
				},
				{
					"id": 15,
					"text": "Chemin Blanc"
				},
				{
					"id": 16,
					"text": "Cinsault"
				},
				{
					"id": 17,
					"text": "Clairette"
				},
				{
					"id": 18,
					"text": "Colombard"
				},
				{
					"id": 19,
					"text": "Counoise"
				},
				{
					"id": 20,
					"text": "Fendant"
				},
				{
					"id": 21,
					"text": "Folle Blanche"
				},
				{
					"id": 22,
					"text": "Fürmint"
				},
				{
					"id": 23,
					"text": "Gamay"
				},
				{
					"id": 24,
					"text": "Gewürztraminer"
				},
				{
					"id": 25,
					"text": "Grauburgunder"
				},
				{
					"id": 26,
					"text": "Grechetto"
				},
				{
					"id": 27,
					"text": "Grenache Blanc"
				},
				{
					"id": 28,
					"text": "Grenache Noir"
				},
				{
					"id": 29,
					"text": "Gros Plan"
				},
				{
					"id": 30,
					"text": "Grüner Veltliner"
				},
				{
					"id": 31,
					"text": "Italienischer Riestling"
				},
				{
					"id": 32,
					"text": "Kadarka"
				},
				{
					"id": 33,
					"text": "Kerner"
				},
				{
					"id": 34,
					"text": "Macabeo"
				},
				{
					"id": 35,
					"text": "Malmsey"
				},
				{
					"id": 36,
					"text": "Malvasier"
				},
				{
					"id": 37,
					"text": "Marsanne"
				},
				{
					"id": 38,
					"text": "Melon de Bourgogne"
				},
				{
					"id": 39,
					"text": "Mourvèdre"
				},
				{
					"id": 40,
					"text": "Müller-Thurgau"
				},
				{
					"id": 41,
					"text": "Muscadelle"
				},
				{
					"id": 42,
					"text": "Muscadet"
				},
				{
					"id": 43,
					"text": "Musca"
				},
				{
					"id": 44,
					"text": "Musca d'Alsace"
				},
				{
					"id": 45,
					"text": "Muskateller"
				},
				{
					"id": 46,
					"text": "Nebbiolo"
				},
				{
					"id": 47,
					"text": "Palomino"
				},
				{
					"id": 48,
					"text": "Pedro Ximérez"
				},
				{
					"id": 49,
					"text": "Petit Verdot"
				},
				{
					"id": 50,
					"text": "Pinot Blanc"
				},
				{
					"id": 51,
					"text": "Pinot Gris"
				},
				{
					"id": 52,
					"text": "Pinot Noir"
				},
				{
					"id": 53,
					"text": "Pinotage"
				},
				{
					"id": 54,
					"text": "Riesling"
				},
				{
					"id": 55,
					"text": "Ruländer"
				},
				{
					"id": 56,
					"text": "Sangiovese"
				},
				{
					"id": 57,
					"text": "Sauvignon Blanc"
				},
				{
					"id": 58,
					"text": "Scheurebe"
				},
				{
					"id": 59,
					"text": "Sémilion"
				},
				{
					"id": 60,
					"text": "Sercial"
				},
				{
					"id": 61,
					"text": "Seyval Blanc"
				},
				{
					"id": 62,
					"text": "Siegerrebe"
				},
				{
					"id": 63,
					"text": "Silvaner"
				},
				{
					"id": 64,
					"text": "Spätburgunder"
				},
				{
					"id": 65,
					"text": "Steen"
				},
				{
					"id": 66,
					"text": "Syrah"
				},
				{
					"id": 67,
					"text": "Tempranillo"
				},
				{
					"id": 68,
					"text": "Tokay"
				},
				{
					"id": 69,
					"text": "Traminer"
				},
				{
					"id": 70,
					"text": "Trebbiano"
				},
				{
					"id": 71,
					"text": "Ugni Blanc"
				},
				{
					"id": 72,
					"text": "Verdejo"
				},
				{
					"id": 73,
					"text": "Verdelho"
				},
				{
					"id": 74,
					"text": "Vermentino"
				},
				{
					"id": 75,
					"text": "Vernaccia"
				},
				{
					"id": 76,
					"text": "Viognier"
				},
				{
					"id": 77,
					"text": "Viura"
				},
				{
					"id": 78,
					"text": "Weißburgunder"
				}
			],
			"lovIcon": false,
			"inMany": false,
			"column": "grape",
			"lovTable": "wine_grape"
		},
		{
			"id": "type",
			"type": "lov",
			"label": "Type",
			"list": [
				{
					"id": 1,
					"text": "Red",
					"icon": "wine/winered.gif"
				},
				{
					"id": 2,
					"text": "White",
					"icon": "wine/winewhite.gif"
				},
				{
					"id": 3,
					"text": "Sweet",
					"icon": "wine/winesweet.gif"
				},
				{
					"id": 4,
					"text": "Sparkling",
					"icon": "wine/winespark.gif"
				},
				{
					"id": 5,
					"text": "Rose",
					"icon": "wine/winerose.gif"
				}
			],
			"lovIcon": true,
			"inMany": true,
			"column": "type",
			"lovTable": "wine_type"
		},
		{
			"id": "appellation",
			"type": "text",
			"label": "Appellation",
			"inSearch": true,
			"column": "appellation"
		},
		{
			"id": "country",
			"type": "lov",
			"label": "Country",
			"list": [
				{
					"id": 1,
					"icon": "wine/flags/ar.png",
					"text": "Argentina"
				},
				{
					"id": 2,
					"icon": "wine/flags/at.png",
					"text": "Austria"
				},
				{
					"id": 3,
					"icon": "wine/flags/bg.png",
					"text": "Bulgaria"
				},
				{
					"id": 4,
					"icon": "wine/flags/ca.png",
					"text": "Canada"
				},
				{
					"id": 5,
					"icon": "wine/flags/cl.png",
					"text": "Chile"
				},
				{
					"id": 6,
					"icon": "wine/flags/cy.png",
					"text": "Cyprus"
				},
				{
					"id": 7,
					"icon": "wine/flags/fr.png",
					"text": "France"
				},
				{
					"id": 8,
					"icon": "wine/flags/de.png",
					"text": "Germany"
				},
				{
					"id": 9,
					"icon": "wine/flags/gr.png",
					"text": "Greece"
				},
				{
					"id": 10,
					"icon": "wine/flags/hu.png",
					"text": "Hungary"
				},
				{
					"id": 11,
					"icon": "wine/flags/it.png",
					"text": "Italy"
				},
				{
					"id": 12,
					"icon": "wine/flags/lu.png",
					"text": "Luxembourg"
				},
				{
					"id": 13,
					"icon": "wine/flags/nz.png",
					"text": "New Zealand"
				},
				{
					"id": 14,
					"icon": "wine/flags/pt.png",
					"text": "Portugal"
				},
				{
					"id": 15,
					"icon": "wine/flags/za.png",
					"text": "South Africa"
				},
				{
					"id": 16,
					"icon": "wine/flags/es.png",
					"text": "Spain"
				},
				{
					"id": 17,
					"icon": "wine/flags/ch.png",
					"text": "Switzerland"
				},
				{
					"id": 18,
					"icon": "wine/flags/us.png",
					"text": "United States"
				}
			],
			"lovIcon": true,
			"column": "country",
			"lovTable": "wine_country"
		},
		{
			"id": "region",
			"type": "text",
			"label": "Region",
			"maxLength": 100,
			"inSearch": true,
			"column": "region"
		},
		{
			"id": "area",
			"type": "text",
			"label": "Area",
			"maxLength": 100,
			"column": "area"
		},
		{
			"id": "label_img",
			"type": "image",
			"label": "Label",
			"maxLength": 200,
			"inMany": true,
			"column": "label_img"
		},
		{
			"id": "buying_date",
			"type": "date",
			"label": "Buying Date",
			"column": "buying_date"
		},
		{
			"id": "price",
			"type": "money",
			"label": "Price",
			"inMany": true,
			"column": "price"
		},
		{
			"id": "value",
			"type": "money",
			"label": "Value",
			"column": "value"
		},
		{
			"id": "purchased",
			"type": "integer",
			"label": "Bottles Purchased",
			"maxLength": 10,
			"column": "purchased"
		},
		{
			"id": "remaining",
			"type": "integer",
			"label": "Remaining",
			"maxLength": 10,
			"column": "remaining"
		},
		{
			"id": "notes",
			"type": "textmultiline",
			"label": "Notes",
			"maxLength": 150,
			"inSearch": true,
			"column": "notes"
		},
		{
			"id": "drink_from",
			"type": "integer",
			"label": "Drink from (year)",
			"max": 2100,
			"min": 1900,
			"maxLength": 10,
			"column": "drink_from"
		},
		{
			"id": "drink_to",
			"type": "integer",
			"label": "to",
			"max": "2100",
			"min": 1900,
			"maxLength": 4,
			"column": "drink_to"
		},
		{
			"id": "peak_from",
			"type": "integer",
			"label": "Peak from",
			"max": 2100,
			"min": 1900,
			"maxLength": 4,
			"column": "peak_from"
		},
		{
			"id": "peak_to",
			"type": "integer",
			"label": "to",
			"max": 2100,
			"min": 1900,
			"maxLength": 4,
			"column": "peak_to"
		},
		{
			"id": "meal",
			"type": "textmultiline",
			"label": "Meal",
			"maxLength": 200,
			"column": "meal"
		},
		{
			"id": "score",
			"type": "lov",
			"label": "My Score",
			"list": [
				{
					"id": 1,
					"text": "*"
				},
				{
					"id": 2,
					"text": "**"
				},
				{
					"id": 3,
					"text": "***"
				},
				{
					"id": 4,
					"text": "****"
				},
				{
					"id": 5,
					"text": "*****"
				}
			],
			"lovIcon": false,
			"column": "score",
			"lovTable": "wine_score"
		},
		{
			"id": "score_parker",
			"type": "integer",
			"label": "Parker",
			"max": 100,
			"min": 50,
			"maxLength": 3,
			"column": "score_parker"
		},
		{
			"id": "score_winespectator",
			"type": "integer",
			"label": "Wine Spectator",
			"max": 100,
			"min": 0,
			"maxLength": 3,
			"column": "score_winespectator"
		},
		{
			"id": "comments",
			"type": "textmultiline",
			"label": "Comments",
			"maxLength": 500,
			"column": "comments"
		}
	],
	"collections": [
		{
			"id": "wine_tasting",
			"table": "wine_tasting",
			"column": "wine_id",
			"object": "winetasting",
			"fields": [
				{
					"id": "drink_date",
					"type": "date",
					"label": "Date",
					"required": true,
					"column": "drink_date"
				},
				{
					"id": "robe",
					"type": "text",
					"label": "Robe",
					"column": "robe"
				},
				{
					"id": "nose",
					"type": "text",
					"label": "Nose",
					"column": "nose"
				},
				{
					"id": "taste",
					"type": "text",
					"label": "Taste",
					"column": "taste"
				},
				{
					"id": "notes",
					"type": "textmultiline",
					"label": "Note",
					"column": "notes"
				}
			]
		}
	]
}