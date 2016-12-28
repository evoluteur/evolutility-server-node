var contact_LOVs = {

    categories: [
        {id: 1, text: 'Work'},
        {id: 2, text: 'Fun'},
        {id: 3, text: 'Travel'},
        {id: 4, text: 'Business'},
        {id: 5, text: 'Cars'},
        {id: 6, text: 'Sport'},
        {id: 7, text: 'Misc.'}
    ]
};

module.exports = {
    id: 'contact',
    label: 'Address Book',
    titleField: 'fistname',
    searchFields: ['lastname', 'firstname', 'jobtitle', 'company'],
    fields: [
        {
            type: 'text', id: 'lastname', column: 'lastname', 
            label: 'Lastname', maxLength: 50,
            required: true, inMany: true
        },
        {
            type: 'text', id: 'firstname', column: 'firstname', 
            label: 'Firstname', maxLength: 50,
            required: true, inMany: true
        },
        {
            type: 'text', id: 'jobtitle', column: 'jobtitle', 
            label: 'Title'
        },
        {
            type: 'text', id: 'company', column: 'company', 
            label: 'Company',
            inMany: true
        },
        {
            type: 'email', id: 'email', column: 'email', 
            label: 'email', maxLength: 100,
            inMany: true
        },
        {
            type: 'url', id: 'web', column: 'web', 
            label: 'web'
        },
        {
            type: 'text', id: 'phone', column: 'phone', 
            label: 'Work Phone', maxLength: 20
        },
        {
            type: 'text', id: 'phonehome', column: 'phonehome', 
            label: 'Home Phone', maxLength: 20
        },
        {
            type: 'text', id: 'phonecell', column: 'phonecell', 
            label: 'Cell.', maxLength: 20
        },
        {
            type: 'text', id: 'fax', column: 'fax', 
            label: 'Fax', maxLength: 20
        },
        {
            type: 'text', id: 'address1', column: 'address1', 
             label: 'Address'
        },
        {
            type: 'text', id: 'address2', column: 'address2', 
             label: '', labelMany: 'Address 2'
        },
        {
            type: 'text', id: 'city', column: 'city', 
             label: 'City'
        },
        {
            type: 'text', //type: 'lov', 
            id: 'state', column: 'state', 
            label: 'State'
            //list: contact_LOVs.states
        },
        {
            type: 'text', id: 'zip', column: 'zip', 
             label: 'Zip', maxLength: 12
        },
        {
            type: 'text',
            id: 'country', column: 'country', 
            label: 'Country'
        },
        {
            type: 'lov', 
            id: 'category', column: 'category_id', 
            label: 'Category',
            inMany: true,
            list: contact_LOVs.categories,
            lovtable: 'contact_category'
        },
        {
            type: 'textmultiline', 
            id: 'notes', column: 'notes', 
            label: 'Notes'
        }
    ]
};
