/*
  Evolutility DB model for To-Do List
  https://github.com/evoluteur/evolutility-server-node
*/

module.exports = {
	"id": "todo",
	"title": "To-Do List",
	"pKey": "id",
	"table": "task",
	"titleField": "title",
	"searchFields": [
		"title",
		"description"
	],
	"fields": [
		{
			"id": "title",
			"type": "text",
			"label": "Title",
			"required": true,
			"maxLength": 255,
			"inMany": true,
			"column": "title"
		},
		{
			"id": "duedate",
			"type": "date",
			"label": "Due Date",
			"inMany": true,
			"column": "duedate"
		},
		{
			"id": "category",
			"type": "lov",
			"label": "Category",
			"list": [
				{
					"id": 1,
					"text": "Home"
				},
				{
					"id": 2,
					"text": "Work"
				},
				{
					"id": 3,
					"text": "Fun"
				},
				{
					"id": 4,
					"text": "Others"
				},
				{
					"id": 5,
					"text": "Misc."
				}
			],
			"lovIcon": false,
			"inMany": true,
			"column": "category_id",
			"lovTable": "task_category"
		},
		{
			"id": "priority",
			"type": "lov",
			"label": "Priority",
			"required": true,
			"list": [
				{
					"id": 1,
					"text": "1 - ASAP"
				},
				{
					"id": 2,
					"text": "2 - Urgent"
				},
				{
					"id": 3,
					"text": "3 - Important"
				},
				{
					"id": 4,
					"text": "4 - Medium"
				},
				{
					"id": 5,
					"text": "5 - Low"
				}
			],
			"lovIcon": false,
			"defaultValue": 4,
			"inMany": true,
			"column": "priority_id",
			"lovTable": "task_priority"
		},
		{
			"id": "complete",
			"type": "boolean",
			"label": "Complete",
			"inMany": true,
			"column": "complete"
		},
		{
			"id": "description",
			"type": "textmultiline",
			"label": "Description",
			"maxLength": 1000,
			"inMany": false,
			"column": "description"
		}
	],
	"collections": []
}