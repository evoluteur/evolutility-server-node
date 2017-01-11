/*! *******************************************************
 *
 * evolutility-server-node :: utils/upload.js
 *
 * https://github.com/evoluteur/evolutility-server-node
 * (c) 2017 Olivier Giulieri
 ********************************************************* */

var path = require('path'),
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

        var m = dico.getModel(req.params.entity),
            id = req.params.id,
            form = new formidable.IncomingForm(),
            fname,
            dup = false;

        form.multiples = false;
        form.uploadDir = path.join(config.uploadPath, '/'+m.id);

        form.on('file', function(field, file) {
            fname = file.name;
            ffname = form.uploadDir+'/'+fname;

            if (fs.existsSync(ffname)) {
                // - if duplicate do not overwrite file but postfix name
                var idx = ffname.lastIndexOf('.'),
                    xtra = '_'+shortid.generate(),
                    originalName = fname;

                dup = true;
                ffname = idx ? (ffname.slice(0, idx)+xtra+ffname.slice(idx)) : (ffname+xtra);
                idx = ffname.lastIndexOf('/');
                fname = ffname.slice(idx+1);
                console.log('No Dup: "'+originalName+'" -> "'+fname+'".')
            }
            fs.rename(file.path, ffname);
        })
        .on('end', function(){
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

