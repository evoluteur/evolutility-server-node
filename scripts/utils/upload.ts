/*!
 * evolutility-server-node :: utils/upload.ts
 *
 * https://github.com/evoluteur/evolutility-server-node
 * (c) 2026 Olivier Giulieri
 */

import path from "path";
import formidable from "formidable";
import fs from "fs";
import type { Request, Response } from "express";
import { getModel } from "./model-manager.ts";
import logger from "./logger.ts";
import config from "../../config.ts";

// - save uploaded file to server (no DB involved)
export function uploadOne(req: Request, res: Response) {
  logger.logReq("UPLOAD ONE", req);

  const m = getModel(req.params.entity as string);
  const id = req.params.id as string;
  const uploadDir = path.join(config.uploadPath, "/" + m!.id);
  const form = new formidable.IncomingForm({
    multiples: false,
    uploadDir,
  });
  let fname: string,
    ffname: string,
    dup = false;

  form
    .on("file", function (field, file) {
      fname = file.originalFilename || file.newFilename;
      ffname = uploadDir + "/" + fname;

      if (fs.existsSync(ffname)) {
        // - if duplicate name do not overwrite file but postfix name
        let idx = ffname.lastIndexOf(".");
        const xtra = "_" + crypto.randomUUID().slice(0, 8),
          originalName = fname;

        dup = true;
        ffname = idx
          ? ffname.slice(0, idx) + xtra + ffname.slice(idx)
          : ffname + xtra;
        idx = ffname.lastIndexOf("/");
        fname = ffname.slice(idx + 1);
        logger.logSuccess(
          'New file name: "' + originalName + '" -> "' + fname + '".',
        );
      }
      fs.rename(file.filepath, ffname, function (err) {
        if (err) throw err;
      });
    })
    .on("end", function () {
      logger.logSuccess('Saved file: "' + ffname + '".');
      res.json({
        duplicate: dup,
        fileName: fname,
        id: id,
        model: m!.id,
      });
    })
    .on("error", function (err) {
      logger.logError(err);
      res.json({
        error: true,
        uploaded: false,
      });
    });

  form.parse(req);
}

export default {
  uploadOne,
};
