
var models = {
	todo: require('./todo'),
	contact: require('./contact'),
	comics: require('./comics')
};
/*
// adding a hash of fields for faster lookup
for(var mid in models){
    var m = models[mid];
    var h = {};
    if(m.fields){
	    m.fields.forEach(function(f){
	        h[f.id] = f;
	    });
	    m.fieldsH = h;
    }
}
*/
module.exports = models;
