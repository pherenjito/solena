function create_retrievalgenerator(object,callback) {
	 
	 return function() {
		$("#lfd").append("Lade Daten für Tabelle `"+object.name+"` von Server <br/>");
	    var params = {};
	    params[object.name] = 1;
	    params['mandant_id'] = mandant_id;
	 	var jqxhr = $.get(url, params, function(result){
			$("#lfd").append("Daten geladen <br/>");
			var values = new Array();
     		if(result)
     			for(var i = 0; i < (result.length-1); i++) {
        			var val = object.getValues(result[i]);
         			values.push(val);
     			}
			object.tablegenerator(values,callback);
			
	 	}, "json");
	 	jqxhr.fail( function() {
	 		alert("Fehler beim senden");
	 	});
	 }
	 
 }

 
 function fillDatabase() {
	 
	 $("#content").load("reset.html", function() {
		 $("#title").html("Erzeuge Datenbank durch Synchronisation mit dem Server:");
		 alert("Erzeuge neue Datenbank und setze Ordner in Ausgangszustand");
		 resetFolderStructure(false,function() {
			 mv = create_retrievalgenerator(mandant_values_object,function() {
				 alert("Datenbank wurde erfolgreich eingerichtet");
				 init();
			 });
			 gm = create_retrievalgenerator(ol_gmangel_object,mv);
			 gh = create_retrievalgenerator(ol_ghaupt_small_object,gm);
			 gh();
		 });
     });
	 
 }
 
 
    
   function  writeToServerAndConfirm(zustaende,j) {
	   if (j>=zustaende.length) {
		   reset_ol_gmangel();
		   transferPicturesToServer();
		   return;
	   }
	   var zustand = zustaende[j];
	   $.post(
			url+"?setData=1&mandant_id="+mandant_id,
			{ kindex : zustand[0], gmzustand : zustand[1], pfzustand : zustand[2], gmdatum : zustand[3], pfdatum : zustand[4], gmstinfo : zustand[5], zustinfo : zustand[6] },
			function(data) {
				$("#lfd").append(data+"<br>");
				writeToServerAndConfirm(zustaende,j+1);
			 },
		     "text");	
   }
   
   
     function transferPicturesToServer() {
	   $("#lfd").append("<b>Transferiere Bilder:</b> <br/>");
	   window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem) {
    				   		fileSystem.root.getDirectory(PATH+"/images", {create : true}, function(dataDir) {
    				   			var directoryReader = dataDir.createReader();


								directoryReader.readEntries(function(entries){
									if (entries.length==0) {
										$("#lfd").append("Synchronisation abgeschlossen -  keine Bilder vorhanden<br/>");
										loadStartPage();
										return;
									}
    								for (var i=0; i<entries.length; i++) {

        								var entry = entries[i];  
        								
        								entry.file(function(file){
        										var reader = new FileReader();
												reader.readAsDataURL(file);
												reader.onload = getShipOff(file.name,entries.length);
        								});
        								
    								}
								},file_error);
    				   			
    				   		},file_error);
	   },file_error);
	  
   }
   
   var count_images = 0;
   
   function getShipOff(fname,count) {
 
   		return function(event) {
    		var result = event.target.result;
    		
    		 $("#lfd").append("Transferiere Datei "+fname+"<br/>");
    		var jqxhr = $.post(url+"?receivePicture=1&mandant_id="+mandant_id, { data: result, filename: fname }, function(data) {  
    			
    			check = function() {
    				count_images++; 
    				if (count_images >= count) {
    					count_images = 0;
    					alert("Synchronisation abgeschlossen");
						loadStartPage();
    				}
    			}
    			
    			var res = JSON.parse(data);
    			try {
    			if (res.success) {
    				deletePicture(fname,check);
    			} else {
    				$("#lfd").append(fname+" konnte nicht übertragen werden. <br/>");
    				check();
    			}
    			} catch(e) { alert(e.message); }

    		});
   			jqxhr.fail(function(){	alert("Schwerwiegender Fehler beim Versenden von Bilddatei");	}	);
   		}
   
   }
   
    function writeToServer() {
	   
	 $("#content").load("reset.html", function() {
		 $("#title").html("Schreibe Daten auf Server zurück:");
	   	 update( function(zustaende,j) {
		   writeToServerAndConfirm(zustaende,j);
	     },transferPicturesToServer);
	 });
             
   }
    
    
    function deletePicture(name,after) {
	   	var filename= "images/"+name;
 	    var localPath = PATH+"/"+filename;
	   	window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem){
        	fileSystem.root.getFile(localPath, { create: false }, function(fileEntry) {
        		fileEntry.remove();
        		$("#lfd").append(fileEntry.name+" wurde erfolreich übertragen und lokal gelöscht <br/>");
        		after();
        	},file_error);
    	},file_error);
   }
    
    
     
   function systemSettings() {
	   
	   //TODO nur für Testversion
	   //*****
	   
	   if(!is_not_null(mandant_id))
		   mandant_id = 612310;
	   
	   if(!is_not_null(url))
		   url = "http://tommysql.ocw2.de/getjson.php";
	   
	   //*****
	   
	   $("#header").load("settings_header.html", function() {

	   $("#content").load("settings.html", function() {
	       
	        $("#mandant_id").val(mandant_id);
	        $("#url").val(url);
            
             $("#settings").submit(function() {
            	 
            	 var inputs = $('#settings :input');
    			 var values = {};
    		     inputs.each(function() {
    		    	if (this.name != "submit")
        			  values[this.name] = $(this).val();
    			 });
        	     saveSettings(values);
        		 return false;
    		});
        
        });
	    });
   }
   
   
    function saveSettings(values) {
         
         db.transaction(function(tx) {
             
                tx.executeSql('CREATE TABLE IF NOT EXISTS settings (key text primary key, value text)',[],function(tx,rs){
                    
                    tx.executeSql('replace into settings (key,value) values ("mandant_id","'+values['mandant_id']+'")',[],function(tx,rs) {
                        
                          tx.executeSql('replace into settings (key,value) values ("url","'+values['url']+'")',[],function(tx,rs) {
                              
                        	  mandant_id = values['mandant_id'];
                        	  url = values['url'];
                              fillDatabase();
                                  
                          },sql_error);
                                  
                    },sql_error);
                  
             
                
                },sql_error);
              
               
             
         });
         
    }
    
    function checkDatensatz() {
    	 db.transaction(function(tx) {
             
                tx.executeSql('CREATE TABLE IF NOT EXISTS settings (key text primary key, value text)',[],function(tx,rs){
                });
    	 });
    }