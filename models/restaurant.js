var lov_cuisines = [
    {id: '1', text: 'French'},
    {id: '2', text: 'Vietnamese'},
    {id: '3', text: 'Chinese'},
    {id: '4', text: 'Fusion'},
    {id: '5', text: 'Japanese'},
    {id: '6', text: 'Thai'},
    {id: '7', text: 'Mexican'},
    {id: '8', text: 'Mediterranean'},
    {id: '9', text: 'American'},
    {id: '10', text: 'Indian'},
    {id: '11', text: 'Korean'},
    {id: '12', text: 'Italian'},
    {id: '13', text: 'Spanish'}, 
    {id: '14', text: 'Others'}, 
];
var lov_prices = [
    {id: '1', text: '$'},
    {id: '2', text: '$$'},
    {id: '3', text: '$$$'},
    {id: '4', text: '$$$$'},
    {id: '5', text: '$$$$$'},
];

module.exports = {
    
    id: 'restaurant',
    active: true,
    table: 'restaurant',
    label: 'Restaurants',
    icon: 'resto.gif',
    name: 'restaurant', 
    namePlural: 'restaurants',
    searchFields: ['name'],

    fields:[
        {
            type: 'text', id: 'name',
            column: 'name',
            label: 'Name',
            required: true, width: 62, inMany: true
        }, 
        {
            type: 'lov', id: 'cuisine',
            column: 'cuisine_id',
            label: 'Cuisine', width: 38,
            list: lov_cuisines,
            lovtable: 'restaurant_cuisine',
            inMany: true
        },
        {
            type: 'lov', id: 'price',
            column: 'price_id',
            label: 'Price', width: 30,
            list: lov_prices,
            lovtable: 'restaurant_price',
            inMany: true
        },
        {
            type: 'url', id: 'web',
            column: 'web',
            label: 'web', width: 32
        },
        {
            type: 'url', id: 'yelp',
            column: 'yelp',
            label: 'yelp', width: 38, 
        },
        {
            type: 'text', id: 'schedule',
            column: 'schedule',
            label: 'Schedule', maxLength: 1000
        },
        {
            type: 'textmultiline', id: 'notes',
            column: 'notes',
            label: 'Notes', maxLength: 2000, 
        },
        {
            type: 'textmultiline', id: 'favorite',
            column: 'favorite',
            label: 'Favorite dish', maxLength: 2000, 
        },
 
        {
            type: 'text', id: 'phone',
            column: 'phone',
            label: 'Phone', maxLength: 20, 
        },
        {
            type: 'textmultiline', id: 'address',
            column: 'address',
            label: 'Address', maxLength: 150, 
             height: 2
        },
        {
            type: 'text', id: 'city',
            column: 'city',
            label: 'City', maxLength: 200, 
            inMany: true
        },
        {
            type: 'text', id: 'state',
            column: 'state',
            label: 'State',
        },
        {
            type: 'text', id: 'zip',
            column: 'zip',
            label: 'Zip', maxLength: 12,
        },
    ],

}

