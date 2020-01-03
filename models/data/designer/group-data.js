module.exports = [
	{
		object: 1,
		"gid": "title",
		"type": 1,
		"label": "Task",
		"width": 62,
		position: 10,
		"fields": [
			"title",
			"duedate",
			"category"
		]
	},
	{
		object: 1,
		"gid": "status",
		"type": 1,
		"label": "Status",
		"width": 38,
		position: 20,
		"fields": [
			"priority",
			"complete"
		]
	},
	{
		object: 1,
		"gid": "desc",
		"type": 1,
		"label": "Task description",
		"width": 100,
		position: 30,
		"fields": [
			"description"
		]
	},

	{
		object: 2,
		"gid": "identity",
		"type": 1,
		"label": "Identity",
		"width": 62,
		position: 10,
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
		object: 2,
		"gid": "contact",
		"type": 1,
		"label": "Contact info",
		"width": 38,
		position: 20,
		"fields": [
			"phone",
			"phonehome",
			"phonecell",
			"fax"
		]
	},
	{
		object: 2,
		"gid": "address",
		"type": 1,
		"label": "Address",
		"width": 62,
		position: 30,
		"fields": [
			"address",
			"city",
			"state",
			"zip",
			"country"
		]
	},
	{
		object: 2,
		"gid": "misc",
		"type": 1,
		"label": "Misc.",
		"width": 38,
		position: 40,
		"fields": [
			"category",
			"notes"
		]
	},


	{
		object: 3,
		"gid": "serie",
		"type": 1,
		"label": "Serie",
		"width": 70,
		position: 10,
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
		object: 3,
		"gid": "pix",
		"type": 1,
		"label": "Cover",
		"width": 30,
		position: 20,
		"fields": [
			"pix"
		]
	},

	{
		object: 4, 
		"gid:": "resto", 
		type:1, 
		label: "Restaurant", 
		width: 62,
		position: 10,
		fields: ['name','cuisine','schedule','yelp','price','favorite','notes','hours']
	},
	{
		object: 4, 
		"gid:": "contact", 
		type:1, 
		label: "Contact", 
		width: 38,
		position: 20,
		fields: ['phone','web','address','city','state','zip',]
	},


	{
		object: 5,
		"gid:": "wine", 
		"type": 1,
		"label": "Wine",
		"width": 80,
		position: 10,
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
		object: 5,
		"gid:": "label", 
		"type": 1,
		"label": "Bottle label",
		"width": 20,
		position: 20,
		"fields": [
			"label_img"
		]
	},
	{
		object: 5,
		"gid:": "purchase", 
		"type": 1,
		"label": "Purchase",
		"width": 100,
		position: 30,
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
		object: 5,
		"gid:": "drink", 
		"type": 1,
		"label": "Drinking",
		"width": 62,
		position: 40,
		"fields": [
			"drink_from",
			"drink_to",
			"peak_from",
			"peak_to",
			"meal"
		]
	},
	{
		object: 5,
		"gid:": "score", 
		"type": 1,
		"label": "Score",
		"width": 38,
		position: 50,
		"fields": [
			"score",
			"score_parker",
			"score_winespectator"
		]
	},
	{
		object: 5,
		"gid:": "comments", 
		"type": 1,
		"label": "Comments",
		"width": 100,
		position: 60,
		"fields": [
			"comments"
		]
	},
	
	{
		object: 6,
		"gid": "g1",
		"type": 1,
		"label": "Degustation",
		"width": 62,
		position: 10,
		"fields": [
			"drink_date",
			"wine",
			"notes"
		]
	},
	{
		object: 6,
		"gid": "g2",
		"type": 1,
		"label": "Evaluation",
		"width": 38,
		position: 20,
		"fields": [
			"taste",
			"robe",
			"nose"
		]
	},

	{
		object: 7,
		"gid": "p-album",
		"type": 1,
		"label": "Album",
		"width": 70,
		position: 10,
		"fields": [
			"title",
			"artist",
			"url",
			'description'
		]
	},
	{
		object: 7,
		"gid": "p-cover",
		"type": 1,
		"label": "Cover",
		"width": 30,
		position: 20,
		"fields": [
			"cover"
		]
	},

	{
		object: 8,
		"gid": "g1",
		"type": 1,
		"label": "Artist",
		"width": 70,
		position: 10,
		"fields": [
			"name",
			"url",
			"bdate",
			'description'
		]
	},
	{
		object: 8,
		"gid": "g2",
		"type": 1,
		"label": "Photo",
		"width": 30,
		position: 20,
		"fields": [
			"photo"
		]
	},

  ]