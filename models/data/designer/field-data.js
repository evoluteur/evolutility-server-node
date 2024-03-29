export default [
  {
    id: 1,
    label: "Title",
    type: 1,
    column: "title",
    fid: "title",
    object: 1,
    inMany: true,
    position: 1,
    width: 100,
    required: true,
  },
  {
    id: 2,
    label: "Due Date",
    type: 7,
    column: "duedate",
    fid: "duedate",
    object: 1,
    inMany: true,
    position: 2,
    width: 38,
  },
  {
    id: 3,
    label: "Category",
    type: 11,
    column: "category_id",
    fid: "category",
    object: 1,
    lovTable: "task_category",
    lovColumn: "name",
    lovIcon: "",
    inMany: true,
    position: 3,
    width: 62,
  },
  {
    id: 4,
    label: "Priority",
    type: 11,
    column: "priority_id",
    fid: "priority",
    object: 1,
    lovTable: "task_priority",
    lovColumn: "",
    lovIcon: "",
    inMany: true,
    position: 4,
    width: 100,
  },
  {
    id: 5,
    label: "Complete",
    type: 3,
    column: "complete",
    fid: "complete",
    object: 1,
    inMany: true,
    position: 5,
    width: 100,
  },
  {
    id: 6,
    label: "Description",
    type: 2,
    column: "description",
    fid: "description",
    object: 1,
    inMany: false,
    position: 6,
    width: 100,
  },
  {
    id: 7,
    label: "Lastname",
    type: 1,
    column: "lastname",
    fid: "lastname",
    object: 2,
    inMany: true,
    position: 7,
    width: 62,
    required: true,
  },
  {
    id: 8,
    label: "Firstname",
    type: 1,
    column: "firstname",
    fid: "firstname",
    object: 2,
    inMany: true,
    position: 8,
    width: 38,
    required: true,
  },
  {
    id: 9,
    label: "Title",
    type: 1,
    column: "jobtitle",
    fid: "jobtitle",
    object: 2,
    inMany: false,
    position: 9,
    width: 62,
  },
  {
    id: 10,
    label: "Company",
    type: 1,
    column: "company",
    fid: "company",
    object: 2,
    inMany: true,
    position: 10,
    width: 38,
  },
  {
    id: 11,
    label: "email",
    type: 12,
    column: "email",
    fid: "email",
    object: 2,
    inMany: false,
    position: 11,
    width: 100,
  },
  {
    id: 12,
    label: "web",
    type: 13,
    column: "web",
    fid: "web",
    object: 2,
    inMany: false,
    position: 12,
    width: 100,
  },
  {
    id: 13,
    label: "Category",
    type: 11,
    column: "category_id",
    fid: "category",
    object: 2,
    lovTable: "contact_category",
    lovColumn: "",
    lovIcon: "",
    inMany: true,
    position: 13,
    width: 100,
  },
  {
    id: 14,
    label: "Work Phone",
    type: 1,
    column: "phone",
    fid: "phone",
    object: 2,
    inMany: false,
    position: 14,
    width: 100,
  },
  {
    id: 15,
    label: "Home Phone",
    type: 1,
    column: "phonehome",
    fid: "phonehome",
    object: 2,
    inMany: false,
    position: 15,
    width: 100,
  },
  {
    id: 16,
    label: "Cell.",
    type: 1,
    column: "phonecell",
    fid: "phonecell",
    object: 2,
    inMany: false,
    position: 16,
    width: 100,
  },
  {
    id: 17,
    label: "Fax",
    type: 1,
    column: "fax",
    fid: "fax",
    object: 2,
    inMany: false,
    position: 17,
    width: 100,
  },
  {
    id: 18,
    label: "Address",
    type: 2,
    column: "address",
    fid: "address",
    object: 2,
    inMany: false,
    position: 18,
    width: 100,
  },
  {
    id: 19,
    label: "City",
    type: 1,
    column: "city",
    fid: "city",
    object: 2,
    inMany: false,
    position: 19,
    width: 62,
  },
  {
    id: 20,
    label: "State",
    type: 1,
    column: "state",
    fid: "state",
    object: 2,
    inMany: false,
    position: 20,
    width: 23,
  },
  {
    id: 21,
    label: "Zip",
    type: 1,
    column: "zip",
    fid: "zip",
    object: 2,
    inMany: false,
    position: 21,
    width: 15,
  },
  {
    id: 22,
    label: "Country",
    type: 1,
    column: "country",
    fid: "country",
    object: 2,
    inMany: false,
    position: 22,
    width: 100,
  },
  {
    id: 23,
    label: "Notes",
    type: 2,
    column: "notes",
    fid: "notes",
    object: 2,
    inMany: false,
    position: 23,
    width: 100,
  },
  {
    id: 24,
    label: "Title",
    type: 1,
    column: "title",
    fid: "title",
    object: 3,
    inMany: true,
    position: 24,
    width: 100,
    required: true,
  },
  {
    id: 25,
    label: "Authors",
    type: 1,
    column: "authors",
    fid: "authors",
    object: 3,
    inMany: true,
    position: 25,
    width: 62,
  },
  {
    id: 26,
    label: "Genre",
    type: 11,
    column: "genre_id",
    fid: "genre",
    object: 3,
    lovTable: "comics_genre",
    lovColumn: "name",
    lovIcon: "",
    inMany: true,
    position: 26,
    width: 38,
  },
  {
    id: 27,
    label: "Albums",
    type: 6,
    column: "serie_nb",
    fid: "serie_nb",
    object: 3,
    inMany: true,
    position: 27,
    width: 15,
    noCharts: true,
  },
  {
    id: 28,
    label: "Owned",
    type: 6,
    column: "have_nb",
    fid: "have_nb",
    object: 3,
    inMany: true,
    position: 28,
    width: 15,
    noCharts: true,
  },
  {
    id: 29,
    label: "Have",
    type: 1,
    column: "have",
    fid: "have",
    object: 3,
    inMany: false,
    position: 29,
    width: 15,
  },
  {
    id: 30,
    label: "Language",
    type: 11,
    column: "language_id",
    fid: "language",
    object: 3,
    lovTable: "comics_language",
    lovColumn: "name",
    lovIcon: "",
    inMany: true,
    position: 30,
    width: 17,
  },
  {
    id: 31,
    label: "Complete",
    type: 3,
    column: "complete",
    fid: "complete",
    object: 3,
    inMany: false,
    position: 31,
    width: 19,
  },
  {
    id: 32,
    label: "Finished",
    type: 3,
    column: "finished",
    fid: "finished",
    object: 3,
    inMany: false,
    position: 32,
    width: 19,
  },
  {
    id: 33,
    label: "BDFugue",
    type: 13,
    column: "url_bdfugue",
    fid: "url_bdfugue",
    object: 3,
    inMany: false,
    position: 33,
    width: 62,
  },
  {
    id: 34,
    label: "Amazon",
    type: 13,
    column: "url_amazon",
    fid: "url_amazon",
    object: 3,
    inMany: false,
    position: 34,
    width: 38,
  },
  {
    id: 35,
    label: "Notes",
    type: 2,
    column: "notes",
    fid: "notes",
    object: 3,
    inMany: false,
    position: 35,
    width: 100,
  },
  {
    id: 36,
    label: "Cover",
    type: 10,
    column: "pix",
    fid: "pix",
    object: 3,
    inMany: true,
    position: 36,
    width: 30,
  },
  {
    id: 37,
    label: "Name",
    type: 1,
    column: "name",
    fid: "name",
    object: 4,
    inMany: true,
    position: 37,
    width: 62,
    required: true,
  },
  {
    id: 38,
    label: "Cuisine",
    type: 11,
    column: "cuisine_id",
    fid: "cuisine",
    object: 4,
    lovTable: "restaurant_cuisine",
    lovColumn: "",
    lovIcon: "",
    inMany: true,
    position: 38,
    width: 38,
  },
  {
    id: 39,
    label: "Schedule",
    type: 1,
    column: "schedule",
    fid: "schedule",
    object: 4,
    inMany: false,
    position: 39,
    width: 62,
  },
  {
    id: 40,
    label: "Price",
    type: 11,
    column: "price_id",
    fid: "price",
    object: 4,
    lovTable: "restaurant_price",
    lovColumn: "",
    lovIcon: "",
    inMany: true,
    position: 40,
    width: 38,
  },
  {
    id: 41,
    label: "Favorite dish",
    type: 2,
    column: "favorite",
    fid: "favorite",
    object: 4,
    inMany: false,
    position: 41,
    width: 100,
  },
  {
    id: 42,
    label: "Notes",
    type: 2,
    column: "notes",
    fid: "notes",
    object: 4,
    inMany: false,
    position: 42,
    width: 100,
  },
  {
    id: 43,
    label: "Phone",
    type: 1,
    column: "phone",
    fid: "phone",
    object: 4,
    inMany: false,
    position: 43,
    width: 50,
  },
  {
    id: 44,
    label: "Web site",
    type: 13,
    column: "web",
    fid: "web",
    object: 4,
    inMany: false,
    position: 44,
    width: 100,
  },
  {
    id: 45,
    label: "Yelp",
    type: 13,
    column: "yelp",
    fid: "yelp",
    object: 4,
    inMany: false,
    position: 45,
    width: 100,
  },
  {
    id: 46,
    label: "Address",
    type: 2,
    column: "address",
    fid: "address",
    object: 4,
    inMany: false,
    position: 46,
    width: 100,
  },
  {
    id: 47,
    label: "City",
    type: 1,
    column: "city",
    fid: "city",
    object: 4,
    inMany: true,
    position: 47,
    width: 62,
  },
  {
    id: 48,
    label: "State",
    type: 1,
    column: "state",
    fid: "state",
    object: 4,
    inMany: false,
    position: 48,
    width: 23,
  },
  {
    id: 49,
    label: "Zip",
    type: 1,
    column: "zip",
    fid: "zip",
    object: 4,
    inMany: false,
    position: 49,
    width: 15,
  },
  {
    id: 50,
    label: "Name",
    type: 1,
    column: "name",
    fid: "name",
    object: 5,
    inMany: true,
    position: 50,
    width: 62,
    required: true,
  },
  {
    id: 51,
    label: "Vintage",
    type: 6,
    column: "vintage",
    fid: "vintage",
    object: 5,
    inMany: true,
    position: 51,
    width: 38,
    required: true,
  },
  {
    id: 52,
    label: "Winery",
    type: 1,
    column: "winery",
    fid: "winery",
    object: 5,
    inMany: true,
    position: 52,
    width: 62,
    required: true,
  },
  {
    id: 53,
    label: "Bottle Size",
    type: 11,
    column: "bsize_id",
    fid: "bsize",
    object: 5,
    lovTable: "wine_bsize",
    lovColumn: "",
    lovIcon: "",
    inMany: false,
    position: 53,
    width: 38,
  },
  {
    id: 54,
    label: "Grape",
    type: 11,
    column: "grape_id",
    fid: "grape",
    object: 5,
    lovTable: "wine_grape",
    lovColumn: "",
    lovIcon: "",
    inMany: false,
    position: 54,
    width: 62,
  },
  {
    id: 55,
    label: "Type",
    type: 11,
    column: "type",
    fid: "type",
    object: 5,
    lovTable: "wine_type",
    lovColumn: "",
    lovIcon: "",
    inMany: true,
    position: 55,
    width: 38,
  },
  {
    id: 56,
    label: "Appellation",
    type: 1,
    column: "appellation",
    fid: "appellation",
    object: 5,
    inMany: false,
    position: 56,
    width: 100,
  },
  {
    id: 57,
    label: "Country",
    type: 11,
    column: "country",
    fid: "country",
    object: 5,
    lovTable: "wine_country",
    lovColumn: "",
    lovIcon: "",
    inMany: false,
    position: 57,
    width: 32,
  },
  {
    id: 58,
    label: "Region",
    type: 1,
    column: "region",
    fid: "region",
    object: 5,
    inMany: false,
    position: 58,
    width: 30,
  },
  {
    id: 59,
    label: "Area",
    type: 1,
    column: "area",
    fid: "area",
    object: 5,
    inMany: false,
    position: 59,
    width: 38,
  },
  {
    id: 60,
    label: "Label",
    type: 10,
    column: "label_img",
    fid: "label_img",
    object: 5,
    inMany: true,
    position: 60,
    width: 100,
  },
  {
    id: 61,
    label: "Buying Date",
    type: 7,
    column: "buying_date",
    fid: "buying_date",
    object: 5,
    inMany: false,
    position: 61,
    width: 40,
  },
  {
    id: 62,
    label: "Price",
    type: 5,
    column: "price",
    fid: "price",
    object: 5,
    inMany: true,
    position: 62,
    width: 30,
  },
  {
    id: 63,
    label: "Value",
    type: 5,
    column: "value",
    fid: "value",
    object: 5,
    inMany: false,
    position: 63,
    width: 30,
  },
  {
    id: 64,
    label: "Bottles Purchased",
    type: 6,
    column: "purchased",
    fid: "purchased",
    object: 5,
    inMany: false,
    position: 64,
    width: 40,
  },
  {
    id: 65,
    label: "Remaining",
    type: 6,
    column: "remaining",
    fid: "remaining",
    object: 5,
    inMany: false,
    position: 65,
    width: 60,
  },
  {
    id: 66,
    label: "Notes",
    type: 2,
    column: "notes",
    fid: "notes",
    object: 5,
    inMany: false,
    position: 66,
    width: 100,
  },
  {
    id: 67,
    label: "Drink from (year)",
    type: 6,
    column: "drink_from",
    fid: "drink_from",
    object: 5,
    inMany: false,
    position: 67,
    width: 50,
  },
  {
    id: 68,
    label: "Drink until",
    type: 6,
    column: "drink_to",
    fid: "drink_to",
    object: 5,
    inMany: false,
    position: 68,
    width: 50,
  },
  {
    id: 69,
    label: "Peak from",
    type: 6,
    column: "peak_from",
    fid: "peak_from",
    object: 5,
    inMany: false,
    position: 69,
    width: 50,
  },
  {
    id: 70,
    label: "Peak until",
    type: 6,
    column: "peak_to",
    fid: "peak_to",
    object: 5,
    inMany: false,
    position: 70,
    width: 50,
  },
  {
    id: 71,
    label: "Meal",
    type: 2,
    column: "meal",
    fid: "meal",
    object: 5,
    inMany: false,
    position: 71,
    width: 100,
  },
  {
    id: 72,
    label: "My Score",
    type: 11,
    column: "score_id",
    fid: "score",
    object: 5,
    lovTable: "wine_score",
    lovColumn: "",
    lovIcon: "",
    inMany: false,
    position: 72,
    width: 100,
  },
  {
    id: 73,
    label: "Parker",
    type: 6,
    column: "score_parker",
    fid: "score_parker",
    object: 5,
    inMany: false,
    position: 73,
    width: 100,
  },
  {
    id: 74,
    label: "Wine Spectator",
    type: 6,
    column: "score_winespectator",
    fid: "score_winespectator",
    object: 5,
    inMany: false,
    position: 74,
    width: 100,
  },
  {
    id: 75,
    label: "Comments",
    type: 2,
    column: "comments",
    fid: "comments",
    object: 5,
    inMany: false,
    position: 75,
    width: 100,
  },
  {
    id: 76,
    label: "Date",
    type: 7,
    column: "drink_date",
    fid: "drink_date",
    object: 6,
    inMany: true,
    position: 76,
    width: 38,
    required: true,
  },
  {
    id: 77,
    label: "Wine",
    type: 11,
    column: "wine_id",
    fid: "wine",
    object: 6,
    lovTable: "wine",
    lovColumn: "name",
    lovIcon: "",
    inMany: true,
    position: 77,
    width: 62,
    required: true,
  },
  {
    id: 78,
    label: "Taste",
    type: 1,
    column: "taste",
    fid: "taste",
    object: 6,
    inMany: true,
    position: 78,
    width: 100,
  },
  {
    id: 79,
    label: "Robe",
    type: 1,
    column: "robe",
    fid: "robe",
    object: 6,
    inMany: true,
    position: 79,
    width: 100,
  },
  {
    id: 80,
    label: "Nose",
    type: 1,
    column: "nose",
    fid: "nose",
    object: 6,
    inMany: true,
    position: 80,
    width: 100,
  },
  {
    id: 81,
    label: "Notes",
    type: 2,
    column: "notes",
    fid: "notes",
    object: 6,
    inMany: true,
    position: 81,
    width: 100,
  },
  {
    id: 82,
    label: "Title",
    type: 1,
    column: "title",
    fid: "title",
    object: 7,
    inMany: true,
    position: 82,
    width: 62,
    required: true,
  },
  {
    id: 83,
    label: "Amazon",
    type: 13,
    column: "url",
    fid: "url",
    object: 7,
    inMany: false,
    position: 83,
    width: 100,
  },
  {
    id: 84,
    label: "Artist",
    type: 11,
    column: "artist_id",
    fid: "artist",
    object: 7,
    lovTable: "artist",
    lovColumn: "title",
    lovIcon: "",
    inMany: true,
    position: 84,
    width: 38,
    required: true,
  },
  {
    id: 85,
    label: "Description",
    type: 2,
    column: "description",
    fid: "description",
    object: 7,
    inMany: false,
    position: 85,
    width: 100,
  },
  {
    id: 86,
    label: "Cover",
    type: 10,
    column: "cover",
    fid: "cover",
    object: 7,
    inMany: true,
    position: 86,
    width: 100,
  },
  {
    id: 87,
    label: "Name",
    type: 1,
    column: "name",
    fid: "name",
    object: 8,
    inMany: true,
    position: 87,
    width: 80,
  },
  {
    id: 88,
    label: "Web site",
    type: 13,
    column: "url",
    fid: "url",
    object: 8,
    inMany: false,
    position: 88,
    width: 100,
  },
  {
    id: 89,
    label: "Wikipedia",
    type: 1,
    column: "url_wiki",
    fid: "url_wiki",
    object: 8,
    inMany: false,
    position: 89,
    width: 100,
  },
  {
    id: 90,
    label: "Photo",
    type: 10,
    column: "photo",
    fid: "photo",
    object: 8,
    inMany: true,
    position: 90,
    width: 100,
  },
  {
    id: 91,
    label: "Description",
    type: 2,
    column: "description",
    fid: "description",
    object: 8,
    inMany: false,
    position: 91,
    width: 100,
  },
  {
    id: 92,
    label: "Name",
    type: 1,
    column: "name",
    fid: "name",
    object: 9,
    inMany: true,
    position: 92,
    width: 100,
    required: true,
  },
  {
    id: 93,
    label: "Album",
    type: 11,
    column: "album_id",
    fid: "album",
    object: 9,
    lovTable: "music_album",
    lovColumn: "title",
    lovIcon: "",
    inMany: true,
    position: 93,
    width: 100,
  },
  {
    id: 94,
    label: "Length",
    type: 1,
    column: "length",
    fid: "length",
    object: 9,
    inMany: true,
    position: 94,
    width: 38,
  },
  {
    id: 95,
    label: "Genre",
    type: 11,
    column: "genre",
    fid: "genre",
    object: 9,
    inMany: true,
    position: 95,
    width: 62,
  },
  {
    id: 96,
    label: "Title",
    type: 1,
    column: "name",
    fid: "name",
    object: 10,
    inMany: true,
    position: 96,
    width: 100,
    required: true,
  },
  {
    id: 97,
    label: "Text",
    type: 1,
    column: "text",
    fid: "text",
    object: 10,
    inMany: true,
    position: 97,
    width: 50,
  },
  {
    id: 98,
    label: "Text multiline",
    type: 2,
    column: "textmultiline",
    fid: "textmultiline",
    object: 10,
    inMany: false,
    position: 98,
    width: 50,
  },
  {
    id: 99,
    label: "List of Values",
    type: 11,
    column: "lov",
    fid: "lov",
    object: 10,
    inMany: true,
    position: 99,
    width: 100,
    required: true,
  },
  {
    id: 100,
    label: "Parent",
    type: 11,
    column: "parent",
    fid: "parent",
    object: 10,
    lovTable: "z_test",
    lovColumn: "name",
    lovIcon: "",
    inMany: true,
    position: 100,
    width: 100,
    required: true,
  },
  {
    id: 101,
    label: "Lemon Cookie",
    type: 11,
    column: "lovlc",
    fid: "lovlc",
    object: 10,
    lovTable: "z_test_flavor",
    lovColumn: "",
    lovIcon: "",
    inMany: false,
    position: 101,
    width: 100,
  },
  {
    id: 102,
    label: "Date",
    type: 7,
    column: "date",
    fid: "date",
    object: 10,
    inMany: true,
    position: 102,
    width: 100,
    required: true,
  },
  {
    id: 103,
    label: "Date-Time",
    type: 1,
    column: "datetime",
    fid: "datetime",
    object: 10,
    inMany: true,
    position: 103,
    width: 100,
  },
  {
    id: 104,
    label: "Time",
    type: 8,
    column: "time",
    fid: "time",
    object: 10,
    inMany: true,
    position: 104,
    width: 100,
  },
  {
    id: 105,
    label: "Integer",
    type: 6,
    column: "integer",
    fid: "integer",
    object: 10,
    inMany: true,
    position: 105,
    width: 100,
    required: true,
  },
  {
    id: 106,
    label: "Decimal",
    type: 4,
    column: "decimal",
    fid: "decimal",
    object: 10,
    inMany: false,
    position: 106,
    width: 100,
  },
  {
    id: 107,
    label: "Money",
    type: 5,
    column: "money",
    fid: "money",
    object: 10,
    inMany: false,
    position: 107,
    width: 100,
  },
  {
    id: 108,
    label: "Boolean",
    type: 3,
    column: "boolean",
    fid: "boolean",
    object: 10,
    inMany: true,
    position: 108,
    width: 100,
  },
  {
    id: 109,
    label: "email",
    type: 12,
    column: "email",
    fid: "email",
    object: 10,
    inMany: true,
    position: 109,
    width: 50,
  },
  {
    id: 110,
    label: "url",
    type: 13,
    column: "url",
    fid: "url",
    object: 10,
    inMany: false,
    position: 110,
    width: 50,
  },
  {
    id: 111,
    label: "Document",
    type: 1,
    column: "document",
    fid: "document",
    object: 10,
    inMany: false,
    position: 111,
    width: 100,
  },
  {
    id: 112,
    label: "Image",
    type: 10,
    column: "image",
    fid: "image",
    object: 10,
    inMany: true,
    position: 112,
    width: 100,
  },
  /*	{
		"id": 113,
		"label": "Label",
		"type": 1,
		"column": "label",
		"fid": "label",
		"object": 11,
		"inMany": true,
		"position": 113,
		"width": 62,
		"required": true
	},
	{
		"id": 114,
		"label": "Type",
		"type": 11,
		"column": "type_id",
		"fid": "type",
		"object": 11,
		"lovTable": "evol_field_type",
		"lovColumn": "name",
		"lovIcon": "",
		"inMany": true,
		"position": 114,
		"width": 38,
		"required": true
	},
	{
		"id": 115,
		"label": "Column",
		"type": 1,
		"column": "column",
		"fid": "column",
		"object": 11,
		"inMany": false,
		"position": 115,
		"width": 62,
		"required": true
	},
	{
		"id": 116,
		"label": "Field ID",
		"type": 1,
		"column": "fid",
		"fid": "fid",
		"object": 11,
		"inMany": true,
		"position": 116,
		"width": 38,
		"required": true
	},
	{
		"id": 117,
		"label": "Object",
		"type": 11,
		"column": "object_id",
		"fid": "object",
		"object": 11,
		"lovTable": "evol_object",
		"lovColumn": "title",
		"lovIcon": "",
		"inMany": true,
		"position": 117,
		"width": 32,
		"required": true
	},
	{
		"id": 118,
		"label": "LOV Table",
		"type": 1,
		"column": "lovTable",
		"fid": "lovTable",
		"object": 11,
		"inMany": false,
		"position": 118,
		"width": 32
	},
	{
		"id": 119,
		"label": "LOV column",
		"type": 1,
		"column": "lovColumn",
		"fid": "lovColumn",
		"object": 11,
		"inMany": false,
		"position": 119,
		"width": 38
	},
	{
		"id": 120,
		"label": "LOV Icon",
		"type": 1,
		"column": "lovIcon",
		"fid": "lovIcon",
		"object": 11,
		"inMany": false,
		"position": 120,
		"width": 38
	},
	{
		"id": 121,
		"label": "List",
		"type": 3,
		"column": "inMany",
		"fid": "inMany",
		"object": 11,
		"inMany": true,
		"position": 121,
		"width": 50
	},
	{
		"id": 122,
		"label": "Position",
		"type": 6,
		"column": "position",
		"fid": "position",
		"object": 11,
		"inMany": false,
		"position": 122,
		"width": 50
	},
	{
		"id": 123,
		"label": "Width",
		"type": 6,
		"column": "width",
		"fid": "width",
		"object": 11,
		"inMany": false,
		"position": 123,
		"width": 50
	},
	{
		"id": 124,
		"label": "Height",
		"type": 6,
		"column": "height",
		"fid": "height",
		"object": 11,
		"inMany": false,
		"position": 124,
		"width": 50
	},
	{
		"id": 125,
		"label": "CSS",
		"type": 1,
		"column": "css",
		"fid": "css",
		"object": 11,
		"inMany": false,
		"position": 125,
		"width": 50
	},
	{
		"id": 126,
		"label": "Format",
		"type": 1,
		"column": "format",
		"fid": "format",
		"object": 11,
		"inMany": false,
		"position": 126,
		"width": 50
	},
	{
		"id": 127,
		"label": "Required",
		"type": 3,
		"column": "required",
		"fid": "required",
		"object": 11,
		"inMany": true,
		"position": 127,
		"width": 50
	},
	{
		"id": 128,
		"label": "Read only",
		"type": 3,
		"column": "readonly",
		"fid": "readOnly",
		"object": 11,
		"inMany": false,
		"position": 128,
		"width": 50
	},
	{
		"id": 129,
		"label": "Min. length",
		"type": 6,
		"column": "minLength",
		"fid": "minLength",
		"object": 11,
		"inMany": false,
		"position": 129,
		"width": 50
	},
	{
		"id": 130,
		"label": "Max. length",
		"type": 6,
		"column": "maxLength",
		"fid": "maxLength",
		"object": 11,
		"inMany": false,
		"position": 130,
		"width": 50
	},
	{
		"id": 131,
		"label": "Min. value",
		"type": 6,
		"column": "minvalue",
		"fid": "minvalue",
		"object": 11,
		"inMany": false,
		"position": 131,
		"width": 50
	},
	{
		"id": 132,
		"label": "Max. value",
		"type": 6,
		"column": "maxvalue",
		"fid": "maxvalue",
		"object": 11,
		"inMany": false,
		"position": 132,
		"width": 50
	},
	{
		"id": 133,
		"label": "Regular Expression",
		"type": 1,
		"column": "regExp",
		"fid": "regExp",
		"object": 11,
		"inMany": false,
		"position": 133,
		"width": 50
	},
	{
		"id": 134,
		"label": "Exclude from Charts",
		"type": 3,
		"column": "noCharts",
		"fid": "noCharts",
		"object": 11,
		"inMany": false,
		"position": 134,
		"width": 50
	},
	{
		"id": 135,
		"label": "Default Chart Type",
		"type": 1,
		"column": "chartType",
		"fid": "chartType",
		"object": 11,
		"inMany": false,
		"position": 135,
		"width": 50
	},
	{
		"id": 136,
		"label": "Help",
		"type": 2,
		"column": "help",
		"fid": "help",
		"object": 11,
		"inMany": false,
		"position": 136,
		"width": 100
	},
	{
		"id": 137,
		"label": "Description",
		"type": 2,
		"column": "description",
		"fid": "description",
		"object": 11,
		"inMany": false,
		"position": 137,
		"width": 100
	},
	{
		"id": 138,
		"label": "Default Value",
		"type": 1,
		"column": "defaultValue",
		"fid": "defaultValue",
		"object": 11,
		"inMany": false,
		"position": 138,
		"width": 50
	},
	{
		"id": 139,
		"label": "Delete trigger",
		"type": 3,
		"column": "deleteTrigger",
		"fid": "deleteTrigger",
		"object": 11,
		"inMany": false,
		"position": 139,
		"width": 50
	},
	{
		"id": 140,
		"label": "Title",
		"type": 1,
		"column": "title",
		"fid": "title",
		"object": 12,
		"inMany": true,
		"position": 140,
		"width": 80,
		"required": true
	},
	{
		"id": 141,
		"label": "Active",
		"type": 3,
		"column": "active",
		"fid": "active",
		"object": 12,
		"inMany": true,
		"position": 141,
		"width": 20
	},
	{
		"id": 142,
		"label": "World",
		"type": 11,
		"column": "world_id",
		"fid": "world",
		"object": 12,
		"lovTable": "evol_world",
		"lovColumn": "name",
		"lovIcon": "",
		"inMany": true,
		"position": 142,
		"width": 100
	},
	{
		"id": 143,
		"label": "DB Table name",
		"type": 1,
		"column": "table",
		"fid": "table",
		"object": 12,
		"inMany": true,
		"position": 143,
		"width": 38,
		"required": true
	},
	{
		"id": 144,
		"label": "Entity Id",
		"type": 1,
		"column": "entity",
		"fid": "entity",
		"object": 12,
		"inMany": true,
		"position": 144,
		"width": 75,
		"required": true
	},
	{
		"id": 145,
		"label": "Object name (singular)",
		"type": 1,
		"column": "name",
		"fid": "name",
		"object": 12,
		"inMany": true,
		"position": 145,
		"width": 62,
		"required": true
	},
	{
		"id": 146,
		"label": "name (plural)",
		"type": 1,
		"column": "namePlural",
		"fid": "namePlural",
		"object": 12,
		"inMany": false,
		"position": 146,
		"width": 38,
		"required": true
	},
	{
		"id": 147,
		"label": "Icon",
		"type": 10,
		"column": "icon",
		"fid": "icon",
		"object": 12,
		"inMany": true,
		"position": 147,
		"width": 62
	},
	{
		"id": 148,
		"label": "Description",
		"type": 2,
		"column": "description",
		"fid": "description",
		"object": 12,
		"inMany": false,
		"position": 148,
		"width": 100
	},
	{
		"id": 149,
		"label": "Name",
		"type": 1,
		"column": "name",
		"fid": "name",
		"object": 13,
		"inMany": true,
		"position": 149,
		"width": 85,
		"required": true
	},
	{
		"id": 150,
		"label": "Active",
		"type": 3,
		"column": "active",
		"fid": "active",
		"object": 13,
		"inMany": true,
		"position": 150,
		"width": 15
	},
	{
		"id": 151,
		"label": "Description",
		"type": 2,
		"column": "description",
		"fid": "description",
		"object": 13,
		"inMany": false,
		"position": 151,
		"width": 85
	},
	{
		"id": 152,
		"label": "Position",
		"type": 6,
		"column": "position",
		"fid": "position",
		"object": 13,
		"inMany": false,
		"position": 152,
		"width": 15
	}*/
];
