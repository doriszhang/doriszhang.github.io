var version = "0.5.1";
/*	
 * Next Digital - Blank Carve Worker
 * @author: Glenn Baker
 * 
 * What does it do?
 * 	- It Watches for changes in your files and automatically Creates the new concatinated and minified version
 * 	  of your JavaScript
 * 
 * Still TODO
 * -	handle proper encoding problems.
 * - 	make a package that is easy to utilise the compression on projects that don't follow themes.
 * - 	Path flexibility
 */

importPackage(java.io);
importPackage(java.lang);
importPackage(java.util);

importPackage(java.util.concurrent);
importPackage(java.net);
importPackage(com.sun.net.httpserver);

load("./lib-carve/js/cssmin.js");
load("./lib-carve/js/jslint.js");
load("./lib-carve/js/utils.js");
load("./lib-carve/js/server.js");
load("./lib-carve/js/less-rhino-1.2.1.js");

(function (args) {
	
	nd.application.setArgs(args);

	log("## \n Next Digital - Blank Carve Worker (Version " + version + ")\n - JS Compression by Google Closure\n - CSS Compression by YUI Compressor\n##\n");	
	log("NOTE: If a file is already minified (compressed), make sure its filename ends in '.min.js'\n");
	
	
	var occurs = 1000;
	var exitStatus = 0;
	var themes = nd.application.getThemes();
	var webbody = new ResponseBody();
	
	for(i in themes) {
		if(  themes.hasOwnProperty(i) ) {
		
			themes[i].execute = function(theme, themeEngine, fileStatus, fileErrors) {
				
				webbody.reset();
				var start = new Date();

				webbody.append('<h2>'+start.toString()+'</h2>');
				
				theme = this;
				log("# JS #\n");
				log(" ---> Theme \"" + theme.name + "\"");
				
				themeEngine = theme.getEngine();
				
				//Create the develop version regardless of errors
				fileStatus = themeEngine.writeFile(theme.filenameDev, false);
				for(p in fileStatus) {
					if(fileStatus[p].success) {
						var msg = " -----> " + fileStatus[p].filename;
						if(fileStatus[p].jslint > 0) {
							msg += " (JSLint:" + fileStatus[p].jslint + ")";
							
						}
						log(msg);
						webbody.append('<p class="fileadd">Added file to sequence: '+fileStatus[p].filename+"</p>");
						if(fileStatus[p].jslint > 0) {
							webbody.append(fileStatus[p].jslintErrors)
						}
					} else {
						log(" -----> Can't find - " + fileStatus[p].filename);
						webbody.append('<p class="filenotadd">Can\'t add file (exists?: '+fileStatus[p].filename+"</p>");
						
					}				
				}
				log(" ---> Created development file (Debug) : " + theme.filenameDev);
				
				if(!themeEngine.hasErrors()) {
				
					//Create the production version
					themeEngine.writeFile(theme.filenameProd, true);
					log(" ---> Created production file (Minified) : " + theme.filenameProd);
					
				} else {
					
					fileErrors = themeEngine.getErrors()
					for(j in fileErrors) {
						exitStatus = 1;
						log(" ## Errors in file " + fileErrors[j].filename); 
						
						for(l in fileErrors[j].errors) {
							log(" - " + fileErrors[j].errors[l].toString());
						}
						
					}	
					
				}
				
				var total = (new Date() - start)/1000;
				log(" ---> Compiled that in "+total+" seconds \n");
				
			}

			//CSS
			themes[i].executeCSS = function( theme ) {
				var start = new Date();
				theme = this;
				var engine = theme.getCSSEngine();
				
				log( engine.options.less ? "# LESS #\n" : "# CSS #\n");
				log(" Theme \"" + theme.name + "\"");
				engine.writeFiles();
				
				log(" ---> Created css files:");			
				log(" -----> Screen : " + theme.filenameScreen );			
				log(" -----> Print : " + theme.filenamePrint);			
				var total = (new Date() - start)/1000;
				log(" ---> Compiled that in "+total+" seconds\n");

			};
			
			themes[i].execute();
			themes[i].executeCSS();
		}
		
	}
	
	
	//Watcher
	if(nd.utils.cmdLineHandler(args, "-watch")) {

		log("Watching for changes...");
		
		var intervals = 0;
		
		nd.utils.timer.setInterval(function(){
			
			exitStatus = 0;
			
			nd.application.intervalMessage(++intervals);
			
			for(f in themes) {
				 if( themes.hasOwnProperty(f) ) {
		
					//JS
					if( themes[f].hasPropertiesChanged() ) {
						
						log("JS File sequence changed");
						
						themes[f].loadProperties();
						themes[f].execute();
					
					} else {
						
						var c = themes[f].getEngine().whichFileHasChanged();
						if(c) {
							
							log("JS File changed " + c);
							themes[f].execute();
							
							log("Watching for changes...");
												
						}
						
					}
					
					//CSS
					if( themes[f].hasCSSChanged() ) {
						
						log( "CSS changed");
						themes[f].executeCSS();
						log("Watching for changes...");
					}
				}
				
			}
			
			//Quit after 12 Hours
			if(intervals > 43200) {
				log("\n .. No Changes - Quit!");
				System.exit(exitStatus);
			}
			
		}, occurs);
		
		new WorkerServer(webbody);		
		
	
	} else {
		System.exit(exitStatus);
	}
	
	
	
}(arguments));

