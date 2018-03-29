module.exports = function(grunt) {
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            all: ['app/**/*.js'],
            options : {
                esversion: 6,
            }
        },
        yuidoc: {
            all: {
                name: '<%= pkg.name %>',
                description: '<%= pkg.description %>',
                version: '<%= pkg.version %>',
                url: '<%= pkg.homepage %>',
                options: {
                    paths: ['app'],
                    outdir: '../../../VKdocs/'
                }
            }
        },
        watch: {
            files: ['Gruntfile.js', './app/**/*.js'],
            tasks: ['jshint']
        }
    });

    grunt.loadNpmTasks("grunt-contrib-yuidoc");

    grunt.registerTask("docs", ["yuidoc"]);
};