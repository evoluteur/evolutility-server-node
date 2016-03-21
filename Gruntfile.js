module.exports = function (grunt) {

    var uiPath = 'node_modules';
    //var uiPath = 'bower_components';
    //var uiPath = '..';

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
                    cwd: uiPath+'/evolutility/dist/',
                    src: '**',
                    dest: 'client/public/dist/',
                    flatten: false,
                    filter: 'isFile'
                },
                {
                    expand: true,
                    cwd: uiPath+'/evolutility/ui-models/',
                    src: '**',
                    dest: 'client/public/ui-models/',
                    flatten: false,
                    filter: 'isFile'
                },
                {
                    expand: true,
                    cwd: uiPath+'/evolutility/demo/pix/',
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

    grunt.registerTask('header', 'Evolutility version', function(arg1) {
        var pkg=grunt.file.readJSON('package.json');
        console.log(
            (new Date()).toString() + '\n\n' + 
            '  ______          _           _ _ _   \n'+
            ' |  ____|        | |      /| (_) (_)/|\n'+
            ' | |____   _____ | |_   _| |_ _| |_| |_ _   _ \n'+
            ' |  __\\ \\ / / _ \\| | | | | __| | | | __| | | |\n'+
            ' | |___\\ V / (_) | | |_| | |_| | | | |_| |_| |\n'+
            ' |______\\_/ \\___/|_|\\__,_|\\__|_|_|_|\\__|\\__, |\n'+
            '         ___  ___ _ ____   _____ _ __    __/ |\n'+
            '  ____  / __|/ _ \\ \'__\\ \\ / / _ \\ \'__|  |___/   \n' + 
            ' |____| \\__ \\  __/ |   \\ V /  __/ |        \n'+
            '        |___/\\___|_|    \\_/ \\___|_|  '+ 
            pkg.version
        );
    });

    // *************************************************************************************
    //      BUILD TASKS : dev prod
    // *************************************************************************************
    // Default task(s).
    grunt.registerTask('default', ['header','copy']);

    // Rebuild from local client code
    grunt.registerTask('evol', ['header', 'build-ui', 'copy', 'jshint']);

};

