/*
  Evolutility DB model for Address book
  https://github.com/evoluteur/evolutility-server-node
*/

module.exports = {
	"id": "contact",
	"title": "Address book",
	"world": "organizer",
	"pKey": "id",
	"table": "contact",
	"active": true,
	"titleField": "fistname",
	"fields": [
		{
			"id": "lastname",
			"type": "text",
			"label": "Lastname",
			"required": true,
			"maxLength": 50,
			"inMany": true,
			"column": "lastname",
			"inSearch": true
		},
		{
			"id": "firstname",
			"type": "text",
			"label": "Firstname",
			"required": true,
			"maxLength": 50,
			"inMany": true,
			"column": "firstname",
			"inSearch": true
		},
		{
			"id": "jobtitle",
			"type": "text",
			"label": "Title",
			"maxLength": 50,
			"column": "jobtitle",
			"inSearch": true
		},
		{
			"id": "company",
			"type": "text",
			"label": "Company",
			"maxLength": 50,
			"inMany": true,
			"column": "company",
			"inSearch": true
		},
		{
			"id": "email",
			"type": "email",
			"label": "email",
			"maxLength": 100,
			"inMany": true,
			"column": "email",
			"inSearch": true
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
			"id": "phonework",
			"type": "text",
			"label": "Work Phone",
			"maxLength": 20,
			"column": "phone",
			"inSearch": true
		},
		{
			"id": "phonecell",
			"type": "text",
			"label": "Cell.",
			"maxLength": 20,
			"column": "phonecell",
			"inSearch": true
		},
		{
			"id": "phonehome",
			"type": "text",
			"label": "Home Phone",
			"maxLength": 20,
			"column": "phonehome"
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
			"column": "city",
			"inSearch": true
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
	"collections": [],
	"noStats": true
}