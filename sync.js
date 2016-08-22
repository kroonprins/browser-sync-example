var program = require("commander");
var colors = require("colors");
var fs = require('fs');

var bank = "<bank>";

program
  .option('-d, --directory <directory>', 'Path to the "internetbankieren" folder of your backbase installation. Attention: this must be an absolute path. For example c:/backbase/internetbankieren.')
  .option('-P, --portal [portal]', 'Portal location. By default this will be localhost:7777.')
  .option('-p, --port [port]', 'Proxy port. The portal server with browser sync activated will be available on this port. By default this is 7778.')
  .option('-s, --statics [statics]', 'Location of the root directory under the internetbankieren directory that is to be watched for file changes. By default this is /statics/bundles/"+bank+"/src/main/webapp/static/alpha/')
  .parse(process.argv);


var portalLocation = program.portal || "localhost:7777";
var proxyPort = program.port || "7778";

if(!program.directory) {
   console.log(colors.red("The directory should be specified"));
   program.outputHelp();
   process.exit(1);
}

try {
    fs.accessSync(program.directory, fs.F_OK);
} catch (e) {
   console.log(colors.red("The specified directory "+program.directory+" does not exist."));
   program.outputHelp();
   process.exit(1);
}

var statics = program.statics || "/statics/bundles/"+bank"+/src/main/webapp/static/alpha/";
var staticsLocation = program.directory + statics;
try {
    fs.accessSync(staticsLocation, fs.F_OK);
} catch (e) {
   console.log(colors.red("Can not find the statics directory in the specified directory "+program.directory+" ["+staticsLocation+"]"));
   program.outputHelp();
   process.exit(1);
}

var filesToWatch = [];
filesToWatch.push(staticsLocation + "**/*.js");
filesToWatch.push(staticsLocation + "**/*.css");
filesToWatch.push(staticsLocation + "**/*.html");
filesToWatch.push(staticsLocation + "**/*.json");

var browserSync = require("browser-sync").create();

browserSync.init({
    proxy: portalLocation,
    port: proxyPort,
    open: false,
    files: filesToWatch
});

console.log(colors.red("Attention: make sure that you have updated the content security policy in backbase properties for this to work:"));
console.log("   "+colors.yellow("be."+bank+".domainsAllowed")+"=default-src 'self' data: "+colors.green("ws://localhost:7778")+ " ... (update port 7778 if has been set to another port with the -p/--port option)");

