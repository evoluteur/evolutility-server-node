/*
  Evolutility DB Model for Test List
  https://github.com/evoluteur/evolutility-server-node
*/

module.exports = {
	"id": "test",
	"table": "z_test",
	"titleField": "name",
	"fields": [
		{
			"id": "name",
			"type": "text",
			"label": "Title",
			"required": true,
			"inMany": true,
			"column": "name"
		},
		{
			"id": "text",
			"type": "text",
			"label": "Text",
			"inMany": true,
			"column": "f_text"
		},
		{
			"id": "textmultiline",
			"type": "textmultiline",
			"label": "Text multiline",
			"column": "f_textmultiline"
		},
		{
			"id": "lov",
			"type": "lov",
			"label": "List of Values",
			"required": true,
			"list": [
				{
					"id": 1,
					"text": "Vanilla"
				},
				{
					"id": 2,
					"text": "Chocolate"
				},
				{
					"id": 3,
					"text": "Strawberry"
				},
				{
					"id": 4,
					"text": "Green Tea"
				},
				{
					"id": 5,
					"text": "Lemon Cookie"
				}
			],
			"inMany": true,
			"column": "f_lov",
			"lovtable": "z_test_flavor"
		},
		{
			"id": "lovlc",
			"type": "lov",
			"label": "Lemon Cookie",
			"list": [
				{
					"id": 1,
					"text": "Vanilla"
				},
				{
					"id": 2,
					"text": "Chocolate"
				},
				{
					"id": 3,
					"text": "Strawberry"
				},
				{
					"id": 4,
					"text": "Green Tea"
				},
				{
					"id": 5,
					"text": "Lemon Cookie"
				}
			],
			"defaultValue": 5,
			"column": "f_lovlc",
			"lovtable": "z_test_flavor"
		},
		{
			"id": "date",
			"type": "date",
			"label": "Date",
			"required": true,
			"inMany": true,
			"column": "f_date"
		},
		{
			"id": "datetime",
			"type": "datetime",
			"label": "Date-Time",
			"inMany": true,
			"column": "f_datetime"
		},
		{
			"id": "time",
			"type": "time",
			"label": "Time",
			"inMany": true,
			"column": "f_time"
		},
		{
			"id": "integer",
			"type": "integer",
			"label": "Integer",
			"required": true,
			"inMany": true,
			"column": "f_integer"
		},
		{
			"id": "decimal",
			"type": "decimal",
			"label": "Decimal",
			"column": "f_decimal"
		},
		{
			"id": "money",
			"type": "money",
			"label": "Money",
			"column": "f_money"
		},
		{
			"id": "boolean",
			"type": "boolean",
			"label": "Boolean",
			"inMany": true,
			"column": "f_boolean"
		},
		{
			"id": "email",
			"type": "email",
			"label": "email",
			"inMany": true,
			"column": "f_email"
		},
		{
			"id": "url",
			"type": "url",
			"label": "url",
			"column": "f_url"
		},
		{
			"id": "document",
			"type": "document",
			"label": "Document",
			"column": "f_document"
		},
		{
			"id": "image",
			"type": "image",
			"label": "Image",
			"inMany": true,
			"column": "f_image"
		}
	],
	"collections": []
}