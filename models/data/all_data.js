/*
  ___         _      _   _ _ _ _         
 | __|_ _____| |_  _| |_(_) (_) |_ _  _  
 | _|\ V / _ \ | || |  _| | | |  _| || | 
 |___|\_/\___/_|\_,_|\__|_|_|_|\__|\_, | 
                                   |__/  
https://github.com/evoluteur/evolutility-models
*/

module.exports = {
	todo: require('./organizer/todo-data'),
	contact: require('./organizer/contact-data'),
	comics: require('./organizer/comics-data'),
	winecellar: require('./organizer/winecellar-data'),
	winetasting: require('./organizer/winetasting-data'),
	restaurant: require('./organizer/restaurant-data'),
	
	album: require('./music/album-data'),
	artist: require('./music/artist-data'),
	track: require('./music/track-data'),

	test: require('./tests/test-data'),

	world: require('./designer/world-data'),
	object: require('./designer/object-data'),
	field: require('./designer/field-data'),
};
