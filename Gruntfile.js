module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        dest: (process.platform == 'darwin') ? 'Atom.app/Contents/Resources/' : 'resources/',

        "download-atom-shell": {
            version: "0.15.2",
            outputDir: "bin",
            rebuild: false
        },

        "copy": {
            app: {
                expand: true,
                src: ["main.js", "server.js", "lib/**", "controllers/**",
                      "public/**", "package.json", "settings.json"],
                dest: "bin/<%= dest %>/app/"
            }
        }
    });

    grunt.loadNpmTasks("grunt-download-atom-shell");
    grunt.loadNpmTasks("grunt-contrib-copy");

    grunt.registerTask("default", ["download-atom-shell", "copy"]);
};
