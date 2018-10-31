/*! *******************************************************
 *
 * evolutility-server-node :: utils/upload.js
 *
 * https://github.com/evoluteur/evolutility-server-node
 * (c) 2018 Olivier Giulieri
 ********************************************************* */

const path = require('path'),
    formidable = require('formidable'),
    shortid = require('shortid'),
    fs = require('fs'),
    dico = require('./dico'),
    logger = require('./logger'),
    config = require('../../config.js');

module.exports = {  

    // - save uploaded file to server (no DB involved)
    uploadOne: function uploadOne(req, res){
        logger.logReq('UPLOAD ONE', req);

        const m = dico.getModel(req.params.entity),
            id = req.params.id,
            form = new formidable.IncomingForm()
        let fname,
            ffname,
            dup = false;

        form.multiples = false;
        form.uploadDir = path.join(config.uploadPath, '/'+m.id);

        form.on('file', function(field, file) {
            fname = file.name;
            ffname = form.uploadDir+'/'+fname;

            if(fs.existsSync(ffname)){
                // - if duplicate name do not overwrite file but postfix name
                let idx = ffname.lastIndexOf('.')
                const xtra = '_'+shortid.generate(),
                    originalName = fname;

                dup = true;
                ffname = idx ? (ffname.slice(0, idx)+xtra+ffname.slice(idx)) : (ffname+xtra);
                idx = ffname.lastIndexOf('/');
                fname = ffname.slice(idx+1);
                logger.logSuccess('New file name: "'+originalName+'" -> "'+fname+'".')
            }
            fs.rename(file.path, ffname, function (err) {
                if (err) throw err;
            });
        })
        .on('end', function(){
            logger.logSuccess('Saved file: "'+ffname+'".')
            res.json({
                duplicate: dup,
                fileName: fname,
                id: id,
                model: m.id
            });
        })
        .on('error', function(err) {
            logger.logError(err);
            res.json({
                error: true,
                uploaded: false
            });
        });

        form.parse(req);
    }

}

