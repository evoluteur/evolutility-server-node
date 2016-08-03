var dico = require('./dico');

module.exports = {
	todo: dico.prepModel(require('./todo')),
	contact: dico.prepModel(require('./contact')),
	comics: dico.prepModel(require('./comics')),
	//test: require('./test')
};
