/*
  Evolutility DB model for Restaurants
  https://github.com/evoluteur/evolutility-server-node
*/

export default {
  id: "restaurant",
  title: "Restaurants",
  world: "organizer",
  pKey: "id",
  table: "restaurant",
  active: true,
  titleField: "name",
  fields: [
    {
      id: "name",
      type: "text",
      label: "Name",
      required: true,
      inMany: true,
      column: "name",
      inSearch: true,
    },
    {
      id: "cuisine",
      type: "lov",
      label: "Cuisine",
      list: [
        {
          id: "1",
          text: "French",
        },
        {
          id: "2",
          text: "Vietnamese",
        },
        {
          id: "3",
          text: "Chinese",
        },
        {
          id: "4",
          text: "Fusion",
        },
        {
          id: "5",
          text: "Japanese",
        },
        {
          id: "6",
          text: "Thai",
        },
        {
          id: "7",
          text: "Mexican",
        },
        {
          id: "8",
          text: "Mediterranean",
        },
        {
          id: "9",
          text: "American",
        },
        {
          id: "10",
          text: "Indian",
        },
        {
          id: "11",
          text: "Korean",
        },
        {
          id: "12",
          text: "Italian",
        },
        {
          id: "13",
          text: "Spanish",
        },
        {
          id: "14",
          text: "Others",
        },
      ],
      lovIcon: false,
      inMany: true,
      column: "cuisine_id",
      lovTable: "restaurant_cuisine",
    },
    {
      id: "price",
      type: "lov",
      label: "Price",
      list: [
        {
          id: "1",
          text: "$",
        },
        {
          id: "2",
          text: "$$",
        },
        {
          id: "3",
          text: "$$$",
        },
        {
          id: "4",
          text: "$$$$",
        },
        {
          id: "5",
          text: "$$$$$",
        },
      ],
      lovIcon: false,
      inMany: true,
      column: "price_id",
      lovTable: "restaurant_price",
    },
    {
      id: "web",
      type: "url",
      label: "web",
      column: "web",
    },
    {
      id: "yelp",
      type: "url",
      label: "Yelp",
      column: "yelp",
    },
    {
      id: "favorite",
      type: "textmultiline",
      label: "Favorite dish",
      maxLength: 2000,
      column: "favorite",
      inSearch: true,
    },
    {
      id: "hours",
      type: "textmultiline",
      label: "Hours",
      column: "hours",
    },
    {
      id: "notes",
      type: "textmultiline",
      label: "Notes",
      maxLength: 2000,
      column: "notes",
      inSearch: true,
    },
    {
      id: "phone",
      type: "text",
      label: "Phone",
      maxLength: 20,
      column: "phone",
    },
    {
      id: "address",
      type: "textmultiline",
      label: "Address",
      maxLength: 150,
      column: "address",
      inSearch: true,
    },
    {
      id: "city",
      type: "text",
      label: "City",
      maxLength: 100,
      inMany: true,
      column: "city",
      inSearch: true,
    },
    {
      id: "state",
      type: "text",
      label: "State",
      column: "state",
    },
    {
      id: "zip",
      type: "text",
      label: "Zip",
      maxLength: 12,
      column: "zip",
    },
  ],
};
