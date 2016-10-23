module.exports = {
    id: 'todo',
    table: 'task',
    titleField: 'title',
    searchFields: ['title', 'description'],
    fields: [
        {
            id: 'title', column: 'title', type: 'text', 
            label: 'Title', required: true,
            maxLength: 255,
            inMany: true
        },
        {
            id: 'duedate', column: 'duedate', type: 'date', 
            label: 'Due Date', inMany: true
        },
        {
            id: 'category', column: 'category_id', type: 'lov', 
            label: 'Category', inMany: true,
            lovtable: 'task_category',
            list: [
                {id: 1, text: 'Home'},
                {id: 2, text: 'Work'},
                {id: 3, text: 'Fun'},
                {id: 4, text: 'Others'},
                {id: 5, text: 'Misc.'}
            ]
        },
        {
            id: 'priority', column: 'priority_id', type: 'lov', 
            label: 'Priority', 
            required: true, inMany: true,
            lovtable: 'task_priority',
            list: [
                {id: 1, text: '1 - ASAP'},
                {id: 2, text: '2 - Urgent'},
                {id: 3, text: '3 - Important'},
                {id: 4, text: '4 - Medium'},
                {id: 5, text: '5 - Low'}
            ]
        },
        {
            id: 'complete', column: 'complete', type: 'boolean', 
            width: 100, inMany: true,
            label: 'Complete'
        },
        {
            id: 'description', column: 'description', 
            type: 'textmultiline', 
            label: 'Description', 
            maxLength: 1000,
            inMany: false
        }
    ]
};
