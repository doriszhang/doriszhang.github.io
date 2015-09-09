var nd = {};
nd.application = {};
nd.utils = {};

nd.utils.cmdLineHandler = function(args, option, defValue){
	if(arguments.length == 3) {
		for(var i = 0; i < args.length; i++) {
			if(args[i] === option){
				return args[++i] || defValue;
			}
		}
		return defValue;
	} else {
		for(var i = 0; i < args.length; i++) {
			if(args[i] === option){
				return true;
			}
		}
		return false
	}
};

nd.application.setArgs = function(args){
	this.args = args;
	this.coreprops = new Properties();
	this.coreprops.load(new FileInputStream(nd.utils.cmdLineHandler(this.args, "-core", "lib-carve/js/core.properties")));
};

nd.application.interpretThemeProperties = function(themeName, themePropertiesFile){
	var files = nd.utils.readFileListFile(new File(themePropertiesFile)),
		path = this.coreprops.getProperty("JS_PATH");
	
	for(x in files) {
		files[x].filename = path.replaceAll("%THEME%", themeName) + files[x].filename 
	}
	
	return files;
};

nd.application.getThemes = function() {
	var themes = [];	
	var themesFolder = new java.io.File(this.coreprops.getProperty("THEMES_PATH"));
	var folders = themesFolder.listFiles() 
	for(var i = 0; i < folders.length; i++) {
		
		if(folders[i].isDirectory()) {
			var themeName = folders[i].getName()+"";
			if(!(/^[\.]/g).test(themeName)) {

				//JS
				var jsThemePropertiesFilename = this.coreprops.getProperty("JS_PROPERTIES").replaceAll("%THEME%", themeName);
				var jsDevel = this.coreprops.getProperty("JS_LIVE_PATH").replaceAll("%THEME%", themeName);
				var jsProd = this.coreprops.getProperty("JS_LIVE_PATH").replaceAll("%THEME%", themeName);
				jsDevel += this.coreprops.getProperty("JS_LIVE_DEV");
				jsProd += this.coreprops.getProperty("JS_LIVE_PROD");

				//CSS
				var cssOptions = {
					screenIn: this.coreprops.getProperty("CSS_LIVE_SCREENIN").replaceAll("%THEME%", themeName),
					screenOut: this.coreprops.getProperty("CSS_LIVE_SCREENOUT").replaceAll("%THEME%", themeName),
					printIn: this.coreprops.getProperty("CSS_LIVE_PRINTIN").replaceAll("%THEME%", themeName),
					printOut: this.coreprops.getProperty("CSS_LIVE_PRINTOUT").replaceAll("%THEME%", themeName)
				};
				
				if((new File(jsThemePropertiesFilename)).exists()) {
					var theme = new nd.application.Theme(themeName,
														jsDevel,
														jsProd,
														jsThemePropertiesFilename,
														cssOptions
														)
					themes.push(theme);
				} else {
					log("Theme \"" + themeName + "\" not configured.")
				}
			}
		}
	}
	return themes;
};

nd.application.intervalMessage = function(intervals){
	if(intervals % 10 === 0) {
		if(intervals % 1000 === 0) {
			log("I'm off for morning tea...");
		} else if(intervals % 700 === 0) {
			log("Get some Tunes goin!");
		} else if(intervals % 600 === 0) {
			log("I'm ok, thank's for asking.");
		} else if(intervals % 500 === 0) {
			log("What up?");
		} else if(intervals % 400 === 0) {
			log("Wake me up in 15 mins, me haz a power nap!");
		} else if(intervals % 300 === 0) {
			log("Ok, anytime you wanna code up some changes, I'll fix'em up");
		} else if(intervals % 200 === 0) {
			log("OMG I'm bored... zzzzzzz!");
		} else if(intervals % 100 === 0) {
			log("I'm bored...");
		} else {
			log("Watching for changes...");
		}			
	}
};

nd.utils.stringToArray = function(str){
	var st = new java.util.StringTokenizer(str, ",");
    var arr = [];
	while (st.hasMoreTokens()) {
		var token = st.nextToken();
		if(token.length() > 0) {
			arr.push(token);
		}
    }
	return arr;
};

nd.utils.FileChecker = function(filenames){
	this.files = [];
	for(i in filenames) {
		var file = new java.io.File(filenames[i]);
		this.files.push({file:file,lastModified:file.lastModified()});
	}
};

nd.utils.FileChecker.prototype.check = function(){
	for(var i = 0; i < this.files.length; i++) {
		var f = this.files[i];
	
		var timeStamp = f.file.lastModified();
		if( f.lastModified != timeStamp ) {
			f.lastModified = timeStamp;
			return true;
		}		
	}
	return false;
};

nd.application.Theme = function(){this.init.apply(this, arguments)};
nd.application.Theme.prototype = {
	
	init:function(name, devel, prod, propertiesFilename, cssOptions ){
		this.name = name;
		//JS
		this.filenameDev = devel;
		this.filenameProd = prod;
		this.propertiesFilename = propertiesFilename;
		this.propertiesFileChecker = new nd.utils.FileChecker([propertiesFilename]);
		//CSS
		cssOptions = this.checkForLess( cssOptions );
		this.filenameScreen = cssOptions.screenOut;
		this.filenamePrint = cssOptions.printOut;
		this.filenameScreenChecker = new nd.utils.FileChecker([ cssOptions.screenIn ]);
		this.filenamePrintChecker = new nd.utils.FileChecker([ cssOptions.printIn ]);
		this.cssEngine = new nd.application.EngineCSS( cssOptions );
		
		//done
		this.loadProperties();
	}

	,getEngine:function(){
		return this.appEngine;
	}
	
	,getCSSEngine:function(){
		return this.cssEngine;
	}
	
	,checkForLess:function( options ){
		var screenInLess = (options.screenIn+"").replace( /\.css/, ".less" );
		var printInLess = (options.printIn+"").replace( /\.css/, ".less" );

		if( new File( screenInLess ).exists() && new File( printInLess ).exists() ) {
			options.screenIn = screenInLess;
			options.printIn = printInLess;
			options.less = true;
		}
		return options;
	}

	
	,loadProperties:function(){
		var files = nd.application.interpretThemeProperties(this.name, this.propertiesFilename);
		this.appEngine = new nd.application.EngineJavaScript(files);
	}
	
	,hasPropertiesChanged:function(){
		return this.propertiesFileChecker.check();
	}
	
	,hasCSSChanged:function(){
		return this.filenameScreenChecker.check() || this.filenamePrintChecker.check();
	}
		
};

nd.application.EngineJavaScript = function(){this.init.apply(this, arguments)};
var appfn = nd.application.EngineJavaScript.prototype;

appfn.init = function(filenames){
	this.files = filenames;
	for(i in this.files) {
		js = this.loadJsFile({file:new java.io.File(this.files[i].filename)});
		this.files[i].js = js;
	}
}

appfn.whichFileHasChanged = function(){
	for(var i = 0; i < this.files.length; i++) {
		var js = this.files[i].js;	
		if( js.timeStamp != js.file.lastModified() ) {
			js.timeStamp = js.file.lastModified();
			this.files[i].js = this.loadJsFile(js);
			return js.file.getPath();
		}		
	}
	return null;
}

appfn.getFilesStatus = function(filename, productionVersion){
	var allStatus = [],
		status,
		file,
		scriptObj,
		scriptContent,
		i = 0;

		for(i = 0; i < this.files.length; i++) {
			
			file = this.files[i];
			
			if( productionVersion && thisFile.prod || !productionVersion && thisFile.dev) {
			
				scriptObj = thisFile.js;

				file.status = {filename:file.filename, jslint:0, jslintErrors:""};
				
				//var content = new java.lang.String(prod ? js.compression.content : js.raw.content);
				
				//Choose the content to 
				//scriptContent = this.chew( scriptObj.file.getName(), prod, scriptObj.compression.content, scriptObj.raw.content );
				
				if(content.trim().length() > 0) {
					
					if( !(/\.min\.js$/i).test(status.filename+"") ) { 
						if(!JSLINT(js.raw.content+'',{
								//	Allow one var statement per function
								onevar:true,   
								//  Disallow bitwise operators  
								bitwise:true,
								//  Disallow dangling _ in identifiers  
								nomen:true,
								//  Disallow == and !=  
								eqeqeq:true,
								//  Require parens around immediate invocations
								immed:true,
								//  Require Initial Caps for constructors  
								newcap:true,
								//  Disallow ++ and --  
								plusplus:true,
								//  Disallow insecure . and [^...] in /RegExp/  
								regexp:true,
								// Is rhino
								rhino:false,
								// Disallow undefined variables
								undef:true,
								// Strict white space  
								white:false,
								// Assume console, aler
								devel:true,
								// Assume a browser  
								browser: true,
								// Assume Windows
								windows: true
							})) {
							status.jslint = JSLINT.errors.length
							
							for(k=0;k<JSLINT.errors.length;k+=1) {
								var e=JSLINT.errors[k];
								if(e){
									status.jslintErrors += ('<p class="error">Lint at line <strong>'+e.line+'</strong> character '+
											e.character+': '+e.reason + "</p>");
									status.jslintErrors += '<p class="error-detail">' + (e.evidence||'').replace(/^\s*(\S*(\s+\S+)*)\s*$/,"$1") + "</p>";								 
								}
							}
							
							
						}
					}
					
					status.success = true;
				} else {
					status.success = false;
				}
			
				allStatus.push(status);
			} else {
				allStatus.push({filename:"Other",jslint:0,jslintErrors:"",success:false});
			}
			
		}
	return allStatus;
}


appfn.writeFile = function(filename, prod){
	var allStatus = [];
	try {
		var completeStreamSequence = null;
		for(var i = 0; i < this.files.length; i++) {
			
			var thisFile = this.files[i];
			
			if( prod && thisFile.prod || !prod && thisFile.dev) {
			
				//TODO rename js prop
				var js = thisFile.js;
				//var status = {filename:js.file.getPath(),jslint:0,jslintErrors:""};
				var status = {filename:thisFile.filename,jslint:0,jslintErrors:""};
				
				//var content = new java.lang.String(prod ? js.compression.content : js.raw.content);
				
				var content = this.chew(js.file.getName(),prod,js.compression.content,js.raw.content)
				
				if(content.trim().length() > 0) {
					//content =  this.commentify(js.file.getName(), content); 
					
					
					if( !(/\.min\.js$/i).test(status.filename+"") ) { 
						if(!JSLINT(js.raw.content+'',{
								//	Allow one var statement per function
								onevar:true,   
								//  Disallow bitwise operators  
								bitwise:true,
								//  Disallow dangling _ in identifiers  
								nomen:true,
								//  Disallow == and !=  
								eqeqeq:true,
								//  Require parens around immediate invocations
								immed:true,
								//  Require Initial Caps for constructors  
								newcap:true,
								//  Disallow ++ and --  
								plusplus:true,
								//  Disallow insecure . and [^...] in /RegExp/  
								regexp:true,
								// Is rhino
								rhino:false,
								// Disallow undefined variables
								undef:true,
								// Strict white space  
								white:false,
								// Assume console, aler
								devel:true,
								// Assume a browser  
								browser: true,
								// Assume Windows
								windows: true
							})) {
							status.jslint = JSLINT.errors.length
							
							for(k=0;k<JSLINT.errors.length;k+=1) {
								var e=JSLINT.errors[k];
								if(e){
									status.jslintErrors += ('<p class="error">Lint at line <strong>'+e.line+'</strong> character '+
											e.character+': '+e.reason + "</p>");
									status.jslintErrors += '<p class="error-detail">' + (e.evidence||'').replace(/^\s*(\S*(\s+\S+)*)\s*$/,"$1") + "</p>";								 
								}
							}
							
							
						}
					}
					
					var contentStream = new ByteArrayInputStream(content.getBytes());
					if(!completeStreamSequence) {
			    		//Start Sequence 
		    			completeStreamSequence = contentStream
		    		} else {
			    		//Append File to Sequence
		    			completeStreamSequence = new SequenceInputStream(completeStreamSequence, contentStream);
		    		}status.success = true;
				} else {
					status.success = false;
				}
			
				allStatus.push(status);
			} else {
				allStatus.push({filename:"missing",jslint:0,jslintErrors:"",success:false});
			}
			
		}
		
		nd.utils.writeFile(filename, completeStreamSequence)            
		//new nd.application.StreamThread(filename, completeStreamSequence);
		
	    	
	} catch (e){
    	System.err.println("Error: " + e);
    	return [{success:false}];
    }
	return allStatus;
}

appfn.chew = function(jsfilename, minify, compressed, raw) {
	var content = "";
	if(jsfilename == "intro.js") {
		content = nd.utils.replaceDate(raw);
	} else {
		//If the file ends in .min.js then don't use the compressed version 
		if( (/\.min\.js$/i).test(jsfilename) ) { 
			minify = false;
		}		
		content = new java.lang.String(minify ? compressed : raw);
		if(content.trim().length() > 0) {
			content = "\/* "+jsfilename+" *\/\n" + content + "\n";
		}
	}
	return typeof content != "java.lang.String" ? new java.lang.String(content) : content;
}

/*
appfn.commentify = function(jsfilename, content) {
	if(jsfilename === "intro.js") {
		content = "\/* File Build Date: " +jsfilename+" *\/\n" + content + "\n";
	} else {
		content = "\/* "+jsfilename+" *\/\n" + content + "\n";
	}
	
	return typeof content != "java.lang.String" ? new java.lang.String(content) : content;
}*/
	
appfn.getErrors = function(){
	var errs = [];
	for(var i = 0; i < this.files.length; i++) {
		if(this.files[i].js.compression.hasErrors) {
			errs.push({
				filename:this.files[i].js.file.getPath()
				,errors:this.files[i].js.compression.errors
			});
		}
	}
	return errs;
}

appfn.hasErrors = function(){
	return this.getErrors().length > 0;
}

appfn.loadJsFile = function(js){
	js.timeStamp = js.file.lastModified();
	js.raw = {content:nd.utils.readFile(js.file)};
	
	//If the file ends in .min.js then don't use the compressed version 
	if( ! (/\.min\.js$/i).test(js.file.getName()) ) { 
		js.compression = nd.utils.minifyContent(js.raw.content);
	} else {
		js.compression = js.raw;
		js.compression.hasErrors = false;
		js.compression.content.trim();
	}
	return js;
}

nd.application.EngineCSS = function(){this.init.apply(this, arguments)};
var appCSSfn = nd.application.EngineCSS.prototype;

appCSSfn.init = function( options ){
	this.options = options;
}

appCSSfn.writeFiles = function() {
	
	if( this.options.screenIn &&  new File( this.options.screenIn ).exists() ) {
		var screenCSS = nd.utils.readFile( this.options.screenIn+""  )
		screenCSS = this.compile( screenCSS );
		var screenStream = new ByteArrayInputStream( new java.lang.String(screenCSS).getBytes() );
		nd.utils.writeFile(this.options.screenOut, screenStream);
	}
	
	if( this.options.printIn &&  new File( this.options.printIn ).exists() ) {
		var printCSS = nd.utils.readFile(  this.options.printIn+"" )
		printCSS = this.compile( printCSS );
		var printStream = new ByteArrayInputStream( new java.lang.String(printCSS).getBytes() );
		nd.utils.writeFile(this.options.printOut, printStream);
	}
}

appCSSfn.compile = function( input ) {
	input = new String(input)
	if( this.options.less ) {
		var parser = new less.Parser();
		var result = '';
		parser.parse( input , function (e, root) {
		 	if (e) {
				result = 'body:before { content: "Less '+(e.type || '')+' error:<br/>'+e.message+'"; font-size:20px; color:red; }';
				log( 'Less '+(e.type || '')+' error: '+e.message );
			}
			else {
				result = YAHOO.compressor.cssmin( root.toCSS() );
			}
		});
		return result;
	} else {
		return YAHOO.compressor.cssmin( input );
	}
};

nd.application.StreamThread = function(){this.init.apply(this, arguments)};
nd.application.StreamThread.prototype = {
	
	init:function(filename, stream){
		this.stream = stream;
		this.filename = filename;
		this.run();
	}

	,run:function(){
		var self = this;
		nd.utils.timer.setTimeout(function(){
			nd.utils.writeFile(self.filename, self.stream)            
		},0);
	}

}

nd.utils.writeFile = function( file, stream ) {
	try {
		file = typeof file != "java.io.File" ? new File(file) : file;
		file.getParentFile().mkdir();
		chunk = null;
        var out = new BufferedWriter(new FileWriter(file));
        while ((chunk = stream.read()) != -1)
        	out.write(chunk);
        stream.close();
        out.close();
	} catch(e) {
		log("Can't write file");
		log(e)
	}
}

nd.utils.readFile = function(file) {
	try {
		file = typeof file == "string" ? new File(file) : file;
		if(file.exists()) {
			var filereader = new FileReader(file);
			var reader = new BufferedReader(filereader);
			var line = null;
			var buffer = new java.lang.StringBuffer(file.length());
			var encodingCheck = false;
			while( (line = reader.readLine()) != null) {
				if(!encodingCheck) {
					encodingCheck = true;
					var chars = line.toCharArray();
					if(chars.length > 3 && Integer.valueOf(chars[0]) == 239 && Integer.valueOf(chars[1]) == 187) {
						throw new Error("Encoding issue with " + file);
					}
				}
				buffer.append(line);
				buffer.append("\n");
			}
			return buffer.toString();
		}
	} catch(e) {
		log("Configuration Error! Can't read file");
		log(e);
	}
	return "";
};

nd.utils.readFileListFile = function(file) {
	try {
		file = typeof file == "String" ? new File(file) : file;
		if(file.exists()) {
			var reader = new BufferedReader(new FileReader(file));
			var line = null;
			var buffer = new java.lang.StringBuffer(file.length());
			var list = [];
			while( (line = reader.readLine()) != null) {
				if(!line.startsWith("#") && line.trim().length() > 0) {
					
					var both = !(line.startsWith("P@") || line.startsWith("D@"));
					
					list.push({
						filename: !both ? line.substring(2, new Integer(line.length())) : line,
						prod: both || line.startsWith("P@"),
						dev: both || line.startsWith("D@")
					});
					
				}
			}
			return list;
		}
	} catch(e) {
		log("Configuration Error! Can't read file");
		log(e);
	}
	return [];
};

nd.utils.minifyContent = function(content) {
	return closureOptimize("", content, false)
}

nd.utils.replaceDate = function(str) {
	return new java.lang.String(str).replaceAll("@DATE", new Date());
}

nd.utils.jslintify = function() {
	
}

function log(line) {
	System.out.println(line);	
};



try {
    JSSourceFilefromCode = java.lang.Class.forName('com.google.javascript.jscomp.JSSourceFile').getMethod('fromCode', [java.lang.String, java.lang.String]);
} catch (e) {}


//Helper for closureOptimize, because of weird Java-JavaScript interactions.
function closurefromCode(filename, content) {
    return JSSourceFilefromCode.invoke(null, [filename, content]);
}

function closureOptimize(fileName, fileContents, keepLines) {
    var jscomp = Packages.com.google.javascript.jscomp,
        flags = Packages.com.google.common.flags,
        externSourceFile = closurefromCode("fakeextern.js", " "),
        jsSourceFile = closurefromCode(String(fileName), String(fileContents)),
        options, 
        FLAG_compilation_level, 
        FLAG_warning_level, 
        compiler;

    //Set up options
    options = new com.google.javascript.jscomp.CompilerOptions();
    options.prettyPrint = keepLines;
    
    FLAG_compilation_level = com.google.common.flags.Flag.value(com.google.javascript.jscomp.CompilationLevel.SIMPLE_OPTIMIZATIONS);
    FLAG_compilation_level.get().setOptionsForCompilationLevel(options);

    //Trigger the compiler
    compiler = new Packages.com.google.javascript.jscomp.Compiler();
    compiler.setLoggingLevel(java.util.logging.Level.OFF);
    
    compiler.compile(externSourceFile, jsSourceFile, options);
    
    return {
    	content:compiler.toSource()
    	,hasErrors:compiler.hasErrors()
    	,errors:compiler.getErrors()
    }
}

nd.utils.timer = {
		
		timers:[],
		
		/*
		 * setInterval From env.js by John Resig
		 */
		setInterval:function(fn, time){
			var num = this.timers.length;
		  
			this.timers[num] = new java.lang.Thread(new java.lang.Runnable({
				run: function(){
					while (true){
						java.lang.Thread.currentThread().sleep(time);
						fn();
					}
				}
			}));
		  
			this.timers[num].start();
			return num;
		},

		/*
		 * From env.js by John Resig
		 */
		clearInterval:function(num){
			if ( this.timers[num] ) {
				this.timers[num].stop();
				delete this.timers[num];
			}
		},
		
		/*
		 * From env.js by John Resig
		 */
		setTimeout:function(fn, time){
			var num;
			var self = this;
			return num = self.setInterval(function(){
				fn();
				self.clearInterval(num);
			}, time);
		}
		
		/*
		wait:function(num){
			if ( !this.timers[num] ) { return ;}
			while (this.timers[num]){
				java.lang.Thread.currentThread().sleep(100);
			}			
		}
		*/
};