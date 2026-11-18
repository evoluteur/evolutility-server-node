/*
  Models for tests (models are stored in the database when the server runs).
  Importing this file loads them in the model manager.
*/

import { setModels } from "../../../scripts/utils/model-manager.ts";
import type { Model } from "../../../scripts/types.ts";
import { album } from "./album.ts";
import { artist } from "./artist.ts";
import { track } from "./track.ts";
import { todo } from "./todo.ts";
import { test } from "./test.ts";

export const testModels = {
  album,
  artist,
  track,
  todo,
  test,
} as unknown as Record<string, Model>;

setModels(testModels);
