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

        // *************************************************************************************
        //      JSHINT
        // *************************************************************************************
        jshint: {
            main: [

                // --- tools ---
                'Gruntfile.js',
                'package.json',
                'bower.json',

                // --- dist ---
                'server/models/database.js',
                'server/routes/index.js'

            ]
        },


    });

    grunt.registerTask('build-ui', function () {
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
    grunt.loadNpmTasks('grunt-contrib-jshint');


    // *************************************************************************************
    //      BUILD TASKS : dev prod
    // *************************************************************************************
    // Default task(s).
    grunt.registerTask('default', ['copy']);

    // Rebuild from local client code
    grunt.registerTask('evol', ['build-ui', 'copy', 'jshint']);

};

