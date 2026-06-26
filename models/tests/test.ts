/*
  Model for Test List (19 fields, 1 collections)
  Generated at 6/25/2026, 12:12:00 AM
  Powered by evolutility-models v.0.3.0 - https://github.com/evoluteur/evolutility-models
*/

import type { ModelDB } from "../types.ts";

export const test = {
	"id": "test",
	"title": "Test List",
	"world": "tests",
	"name": "test",
	"namePlural": "tests",
	"pKey": "id",
	"table": "z_test",
	"titleField": "name",
	"fields": [
		{
			"id": "name",
			"type": "text",
			"label": "Title",
			"required": true,
			"inMany": true,
			"column": "name",
			"inSearch": true
		},
		{
			"id": "text",
			"type": "text",
			"label": "Text",
			"inMany": true,
			"column": "f_text",
			"inSearch": true
		},
		{
			"id": "textmultiline",
			"type": "textmultiline",
			"label": "Text multiline",
			"column": "f_textmultiline",
			"inSearch": true
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
			"lovIcon": false,
			"inMany": true,
			"column": "f_lov",
			"lovTable": "z_test_flavor"
		},
		{
			"id": "parent",
			"type": "lov",
			"label": "Parent",
			"object": "test",
			"required": false,
			"lovIcon": false,
			"inMany": true,
			"column": "parent_id",
			"lovTable": "z_test"
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
			"lovIcon": false,
			"defaultValue": 5,
			"column": "f_lovlc",
			"lovTable": "z_test_flavor"
		},
		{
			"id": "list",
			"type": "list",
			"label": "Flavor(s)",
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
			"column": "f_list"
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
		},
		{
			"id": "json",
			"type": "json",
			"label": "JSON",
			"inMany": true,
			"column": "f_json"
		}
	],
	"collections": [
		{
			"id": "collec1",
			"table": "z_test",
			"column": "parent_id",
			"object": "test",
			"fields": [
				{
					"id": "name",
					"column": "name",
					"label": "Title",
					"type": "text",
					"width": 100,
					"required": true,
					"inMany": true,
					"inSearch": true,
					"help": "Name of the object"
				},
				{
					"id": "text",
					"column": "f_text",
					"label": "Text",
					"type": "text",
					"width": 50,
					"inMany": true,
					"inSearch": true
				},
				{
					"id": "textmultiline",
					"column": "f_textmultiline",
					"type": "textmultiline",
					"label": "Text multiline",
					"height": 3,
					"width": 50,
					"inSearch": true
				},
				{
					"id": "lov",
					"type": "lov",
					"column": "f_lov",
					"label": "List of Values",
					"width": 100,
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
					"lovTable": "z_test_flavor",
					"required": true,
					"inMany": true
				},
				{
					"id": "parent",
					"type": "lov",
					"column": "parent_id",
					"label": "Parent",
					"width": 100,
					"lovTable": "z_test",
					"required": false,
					"inMany": true,
					"help": "LOV ",
					"object": "test",
					"chartType": "Pie"
				}
			]
		}
	]
} satisfies ModelDB;
