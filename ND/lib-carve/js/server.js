WorkerServer = function(){this.init.apply(this, arguments)};
WorkerServer.prototype = {
	
	init:function(resBody){
		
	  
		this.resBody = resBody;
		
		var self = this;
		var HandlerImpl = {
				handle: function(exchange){
					var requestMethod = exchange.getRequestMethod();
				    if (requestMethod.equalsIgnoreCase("GET")) {
						log("oooooh, did someone just walk on my grave?")
				      
				    	var responseHeaders = exchange.getResponseHeaders();
				      
				      responseHeaders.set("Content-Type", "text/html");
				      
				      exchange.sendResponseHeaders(200, 0);
		
				      var responseBody = exchange.getResponseBody();
				      
				      responseBody.write(self.resBody.getBytes());			      
				      responseBody.close();
				 }
			}
		};
		
		this.myHandler = new HttpHandler(HandlerImpl);
		
		var otherPorts = [8080,4444,4445,4446,4447],
			iPort = 0,
			myServer;

		while(iPort < otherPorts.length) {
			try {
				myServer = HttpServer.create(new InetSocketAddress(otherPorts[iPort]), 0);
		    } catch(e) {
		    	myServer = null;
		    	iPort++
		    }
		    if(myServer) {
		    	break;
		    }
		}   
	
		if(myServer) {
			myServer.createContext("/", this.myHandler);
			myServer.setExecutor(Executors.newCachedThreadPool());
		 	myServer.start();
		 	this.myServer = myServer;
		 	log("Check http://localhost:" + otherPorts[iPort] + "/ for detailed JSLint report");
		} else {
			log("Got Ports? You must be running too many web servers")
		}
		
	}			
};


ResponseBody = function(){this.init.apply(this, arguments)};
ResponseBody.prototype = {
		
	init:function(){
		this.reset();
		this.baseHtml = nd.utils.readFile(new File('lib-carve/js/report.html'));
		this.baseHtmlArr = this.baseHtml.split('<!--GUTS-->');
	},
	
	append:function(value){
		this.body.append(value);
		this.body.append("\n");
	},
	
	reset:function(){
		this.body = new StringBuffer();
	},
	
	toString:function(){
		var str = new StringBuffer();
		str.append(this.baseHtmlArr[0])
		str.append(this.body)
		str.append(this.baseHtmlArr[1])
		return str.toString();
	},
	
	getBytes:function(){
		return this.toString().getBytes();	
	}
	
	
};

