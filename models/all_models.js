/*
  ___         _      _   _ _ _ _         
 | __|_ _____| |_  _| |_(_) (_) |_ _  _  
 | _|\ V / _ \ | || |  _| | | |  _| || | 
 |___|\_/\___/_|\_,_|\__|_|_|_|\__|\_, | 
                                   |__/  
https://github.com/evoluteur/evolutility-models
*/

module.exports = {
  todo: require('./organizer/todo'),
  contact: require('./organizer/contact'),
  comics: require('./organizer/comics'),
  restaurant: require('./organizer/restaurant'),
  winecellar: require('./organizer/winecellar'),
  winetasting: require('./organizer/winetasting'),

  album: require('./music/album'),
  artist: require('./music/artist'),
  track: require('./music/track'),

  test: require('./tests/test'),
  
  
  world: require('./designer/world'),
  object: require('./designer/object'),
  field: require('./designer/field'),
  //fieldgroup: require('./designer/fieldgroup'),
};
