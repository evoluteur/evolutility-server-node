/*!
 * evolutility-server-node :: utils/upload.ts
 *
 * https://github.com/evoluteur/evolutility-server-node
 * (c) 2026 Olivier Giulieri
 */

import path from "path";
import fs from "fs";
import { randomUUID } from "crypto";
import formidable, { errors as formidableErrors } from "formidable";
import type { Request, Response } from "express";
import { getModel } from "./model-manager.ts";
import logger from "./logger.ts";
import config from "../../config.ts";

export const defaultUploadMaxSize = 2 * 1024 * 1024; // 2MB
export const defaultUploadExtensions = [
  // - images (no .svg: it can carry scripts and files are served publicly)
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  // - documents
  ".pdf",
  ".txt",
  ".csv",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".ppt",
  ".pptx",
];

const allowedExtensions = () =>
  (config.uploadExtensions || defaultUploadExtensions).map((x) =>
    x.toLowerCase(),
  );

// - lowercase extension of a file name, including the dot (ex: ".png")
export const fileExtension = (name?: string | null) =>
  path.extname(name || "").toLowerCase();

export const isAllowedFile = (name?: string | null) => {
  const ext = fileExtension(name);
  return ext !== "" && allowedExtensions().includes(ext);
};

// - turn the name sent by the client into a safe file name:
// - no directories (blocks "../" path traversal), only safe characters, no leading dot
export function safeFileName(name?: string | null) {
  const base = path.basename(String(name || "").replace(/\\/g, "/"));
  const ext = fileExtension(base);
  const stem = base
    .slice(0, base.length - ext.length)
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/^[.]+/, "")
    .slice(0, 100);
  return (stem || "file") + ext.replace(/[^a-z0-9.]/g, "");
}

// - add a random suffix before the extension (ex: "a.png" -> "a_1b2c3d4e.png")
export function dedupFileName(name: string) {
  const ext = fileExtension(name);
  return (
    name.slice(0, name.length - ext.length) +
    "_" +
    randomUUID().slice(0, 8) +
    ext
  );
}

const uploadError = (res: Response, status: number, message: string) =>
  res.status(status).json({
    error: true,
    uploaded: false,
    message,
  });

// - save uploaded file to server (no DB involved)
export async function uploadOne(req: Request, res: Response) {
  logger.logReq("UPLOAD ONE", req);

  const m = getModel(req.params.entity as string);
  if (!m) {
    return uploadError(res, 404, "Model not found.");
  }
  const id = req.params.id as string;
  const uploadDir = path.resolve(config.uploadPath, safeFileName(m.id));
  let rejectedName: string | null = null;

  try {
    await fs.promises.mkdir(uploadDir, { recursive: true });

    const form = formidable({
      uploadDir,
      maxFiles: 1,
      maxFileSize: config.uploadMaxSize || defaultUploadMaxSize,
      filter: (part) => {
        if (!part.originalFilename) {
          return false; // - not a file
        }
        if (!isAllowedFile(part.originalFilename)) {
          rejectedName = part.originalFilename;
          return false;
        }
        return true;
      },
    });

    const [, files] = await form.parse(req);
    const file = Object.values(files).flat()[0];

    if (!file) {
      return rejectedName
        ? uploadError(
            res,
            415,
            `File type not allowed: "${fileExtension(rejectedName)}".`,
          )
        : uploadError(res, 400, "No file received.");
    }

    let fileName = safeFileName(file.originalFilename);
    let fullPath = path.join(uploadDir, fileName);
    let duplicate = false;

    // - belt and braces: the final path must stay inside the upload directory
    if (path.dirname(fullPath) !== uploadDir) {
      await fs.promises.rm(file.filepath, { force: true });
      return uploadError(res, 400, "Invalid file name.");
    }

    if (fs.existsSync(fullPath)) {
      // - if duplicate name do not overwrite file but postfix name
      const originalName = fileName;
      duplicate = true;
      fileName = dedupFileName(fileName);
      fullPath = path.join(uploadDir, fileName);
      logger.logSuccess(`New file name: "${originalName}" -> "${fileName}".`);
    }

    await fs.promises.rename(file.filepath, fullPath);
    logger.logSuccess(`Saved file: "${fullPath}".`);

    return res.json({
      duplicate,
      fileName,
      id,
      model: m.id,
    });
  } catch (err) {
    logger.logError(err);
    const code = (err as { code?: number }).code;
    if (
      code === formidableErrors.biggerThanMaxFileSize ||
      code === formidableErrors.biggerThanTotalMaxFileSize
    ) {
      return uploadError(res, 413, "File too large.");
    }
    if (code === formidableErrors.maxFilesExceeded) {
      return uploadError(res, 400, "Only one file can be uploaded at a time.");
    }
    return uploadError(res, 500, "Upload failed.");
  }
}

export default {
  uploadOne,
};
