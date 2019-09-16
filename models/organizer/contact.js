/*
  Evolutility DB model for Address book
  https://github.com/evoluteur/evolutility-server-node
*/

module.exports = {
	"id": "contact",
	"title": "Address book",
	"pKey": "id",
	"table": "contact",
	"titleField": "fistname",
	"searchFields": [
		"lastname",
		"firstname",
		"jobtitle",
		"company"
	],
	"fields": [
		{
			"id": "lastname",
			"type": "text",
			"label": "Lastname",
			"required": true,
			"maxLength": 50,
			"inMany": true,
			"column": "lastname"
		},
		{
			"id": "firstname",
			"type": "text",
			"label": "Firstname",
			"required": true,
			"maxLength": 50,
			"inMany": true,
			"column": "firstname"
		},
		{
			"id": "jobtitle",
			"type": "text",
			"label": "Title",
			"maxLength": 50,
			"column": "jobtitle"
		},
		{
			"id": "company",
			"type": "text",
			"label": "Company",
			"maxLength": 50,
			"inMany": true,
			"column": "company"
		},
		{
			"id": "email",
			"type": "email",
			"label": "email",
			"maxLength": 100,
			"inMany": true,
			"column": "email"
		},
		{
			"id": "web",
			"type": "url",
			"label": "web",
			"maxLength": 255,
			"column": "web"
		},
		{
			"id": "category",
			"type": "lov",
			"label": "Category",
			"list": [
				{
					"id": 1,
					"text": "Friends"
				},
				{
					"id": 2,
					"text": "Family"
				},
				{
					"id": 3,
					"text": "Work"
				},
				{
					"id": 4,
					"text": "Meditation"
				},
				{
					"id": 5,
					"text": "Travel"
				},
				{
					"id": 6,
					"text": "Business"
				},
				{
					"id": 7,
					"text": "Sport"
				},
				{
					"id": 8,
					"text": "Restaurants"
				},
				{
					"id": 9,
					"text": "Misc."
				}
			],
			"lovIcon": false,
			"inMany": true,
			"column": "category_id",
			"lovTable": "contact_category"
		},
		{
			"id": "phone",
			"type": "text",
			"label": "Work Phone",
			"maxLength": 20,
			"column": "phone"
		},
		{
			"id": "phonehome",
			"type": "text",
			"label": "Home Phone",
			"maxLength": 20,
			"column": "phonehome"
		},
		{
			"id": "phonecell",
			"type": "text",
			"label": "Cell.",
			"maxLength": 20,
			"column": "phonecell"
		},
		{
			"id": "fax",
			"type": "text",
			"label": "Fax",
			"maxLength": 20,
			"column": "fax"
		},
		{
			"id": "address",
			"type": "textmultiline",
			"label": "Address",
			"column": "address"
		},
		{
			"id": "city",
			"type": "text",
			"label": "City",
			"maxLength": 100,
			"column": "city"
		},
		{
			"id": "state",
			"type": "text",
			"label": "State",
			"column": "state"
		},
		{
			"id": "zip",
			"type": "text",
			"label": "Zip",
			"maxLength": 12,
			"column": "zip"
		},
		{
			"id": "country",
			"type": "text",
			"label": "Country",
			"maxLength": 60,
			"column": "country"
		},
		{
			"id": "notes",
			"type": "textmultiline",
			"label": "Notes",
			"maxLength": 1000,
			"column": "notes"
		}
	],
	"collections": []
}