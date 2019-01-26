
module.exports = {
    id: 'winetasting',
    active: true,
    table: 'wine_tasting',
    titleField: 'drink_date',
    name: 'wine tasting',
    namePlural: 'wine tastings',
    label: 'Wine Tasting',
    icon: 'wine.gif', 
    searchFields: ['robe', 'nose', 'taste', 'notes'],
    fields: [
        { 
            id: 'wine_id', column: 'wine_id', type: 'lov', 
            lovtable: 'wine',
            label: 'Wine', inMany: true,
            required: true,
			deletetrigger: true,
        },
        { 
            id: 'drink_date', column: 'drink_date', type: 'date', 
            label: 'Date', inMany: true,
            required:true
        },
        { 
            id: 'robe', column: 'robe', type: 'text', 
            label: 'Robe', maxLength: 100, inMany: true
        },
        { 
            id: 'nose', column: 'nose', type: 'text', 
            label: 'Nose', maxLength: 100, inMany: true
        },
        { 
            id: 'taste', column: 'taste', type: 'text', 
            label: 'Taste', maxLength: 100, inMany: true
        },
        { 
            id: 'notes', column: 'notes', type: 'textmultiline', 
            label: 'Note', inMany: true, width: 100, height: 5
        }
    ]
};
