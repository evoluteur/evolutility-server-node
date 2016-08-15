module.exports =  {
    id: 'comics',
    label: 'Graphic Novels',
    name: 'graphic novel serie',
    namePlural: 'graphic novel series',
    fnSearch: ['title', 'authors', 'notes'],
    fields: [
        {
            id: 'title', attribute: 'title', type: 'text', label: 'Title', required: true, 
            maxLength: 255,
            inMany: true
        },
        {
            id: 'genre', attribute: 'genre_id', type: 'lov', label: 'Genre', inMany: true,
            list: [
                {id: 1, text: 'Adventure'},
                {id: 2, text: 'Fairy tale'},
                {id: 3, text: 'Erotic'},
                {id: 4, text: 'Fantastic'},
                {id: 5, text: 'Heroic Fantasy'},
                {id: 6, text: 'Historic'},
                {id: 7, text: 'Humor'},
                {id: 8, text: 'One of a kind'},
                {id: 9, text: 'Youth'},
                {id: 10, text: 'Thriller'},
                {id: 11, text: 'Science-fiction'},
                {id: 12, text: 'Super Heros'},
                {id: 13, text: 'Western'} 
            ],
            lovtable: 'comics_genre'
        },
        {
            id: 'authors', attribute: 'authors', type: 'text', inMany: true,
            label: 'Authors'
        },
        {
            id: 'language', attribute: 'language_id', type: 'lov', label: 'Language', inMany: true,
            list: [
                {id: 2, text: 'French', icon:'flag_fr.gif'},
                {id: 1, text: 'American', icon:'flag_us.gif'}
            ],
            lovtable: 'comics_language'
        },
        {
            id: 'serie_nb', attribute: 'serie_nb', type: 'integer', inMany: false,
            label: 'Albums', inCharts:false 
        },
        {
            id: 'have_nb', attribute: 'have_nb', type: 'integer', inMany: false,
            label: 'Owned', inCharts:false 
        },
        {
            id: 'have', attribute: 'have', type: 'text', inMany: false,
            label: 'Have' 
        },
        {
            id: 'complete', attribute: 'complete', type: 'boolean', inMany: true,
            label: 'Complete', labelFalse:'Incomplete', labelTrue:'Complete'
        },
        {
            id: 'finished', attribute: 'finished', type: 'boolean', inMany: true,
            label: 'Finished', labelTrue:'Finished', labelFalse:'Not finished', css:'cBlue'
        },
        {
            id: 'notes', attribute: 'notes', type: 'textmultiline', label: 'Notes', maxLength: 1000,
            inMany: false
        },
        {
            id: 'pix', attribute: 'pix', type: 'image', inMany: true,
            label: 'Album Cover'
        }
    ]
};
