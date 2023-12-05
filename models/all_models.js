/*
  ___         _      _   _ _ _ _
 | __|_ _____| |_  _| |_(_) (_) |_ _  _
 | _|\ V / _ \ | || |  _| | | |  _| || |
 |___|\_/\___/_|\_,_|\__|_|_|_|\__|\_, |
                                   |__/
https://github.com/evoluteur/evolutility-models
*/

// --- Organizer
import todo from "./organizer/todo.js";
import contact from "./organizer/contact.js";
import comics from "./organizer/comics.js";
import restaurant from "./organizer/restaurant.js";
import winecellar from "./organizer/winecellar.js";
import winetasting from "./organizer/winetasting.js";
// --- Music
import album from "./music/album.js";
import artist from "./music/artist.js";
import track from "./music/track.js";
// --- Tests
import test from "./tests/test.js";
// -- Designer
import world from "./designer/world.js";
import object from "./designer/object.js";
import field from "./designer/field.js";
import group from "./designer/group.js";
import collection from "./designer/collection.js";

const models = {
  // --- Organizer
  todo,
  contact,
  comics,
  restaurant,
  winecellar,
  winetasting,
  // --- Music
  album,
  artist,
  track,
  // --- Tests
  test,
  // -- Designer
  world,
  object,
  field,
  group,
  collection,
};

export default models;
