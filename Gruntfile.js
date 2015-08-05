module.exports = function (grunt) {

    grunt.initConfig({

        // *************************************************************************************
        //      CONFIG OPTIONS
        // *************************************************************************************

        pkg: grunt.file.readJSON('package.json'),

        // *************************************************************************************
        //      COPY
        // *************************************************************************************
        copy: {
          main: {
            files: [ 
                {
                    expand: true,
                    //cwd: 'bower_components/evolutility/dist/',
                    cwd: '../evolutility/dist/',
                    src: '**',
                    dest: 'client/public/dist/',
                    flatten: false,
                    filter: 'isFile'
                },
                {
                    expand: true,
                    //cwd: 'bower_components/evolutility/js/ui-models/',
                    cwd: '../evolutility/js/ui-models/',
                    src: '**',
                    dest: 'client/public/ui-models/',
                    flatten: false,
                    filter: 'isFile'
                },
                {
                    expand: true,
                    //cwd: 'bower_components/evolutility/demo/pix/',
                    cwd: '../evolutility/demo/pix/',
                    src: '**',
                    dest: 'client/public/pix/',
                    flatten: false,
                    filter: 'isFile'
                }
            ]
          }
        },

    });

    grunt.registerTask('evo-build', function () {
        var done = this.async();
        grunt.util.spawn({
            grunt: true,
            args: ['prod'],
            opts: {
                cwd: '../evolutility'
            }
        }, function (err, result, code) {
            done();
        });
    });

    // *************************************************************************************
    //      GRUNT PLUGIN : tasks
    // *************************************************************************************
    grunt.loadNpmTasks('grunt-contrib-copy');


    // *************************************************************************************
    //      BUILD TASKS : dev prod
    // *************************************************************************************
    // Default task(s).
    grunt.registerTask('default', ['copy']);

    // Rebuild from local client code
    grunt.registerTask('evol', ['evo-build', 'copy']);

};

