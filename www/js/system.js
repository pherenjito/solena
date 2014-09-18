  
  var application_type = "tombejo"; //"orlando"; //  

  var gm_mandantvalues = {};
  var pf_mandantvalues = {};
  var mandant_id;
  var url;
  var db;
  var selectGraveValues = {};
  var PATH = "solena";
  var FULLPATH = "/sdcard/"+PATH+"/";
  
   var file_error = function(e) {
    		 alert(JSON.stringify(e));
    	 };

    	 
window.onerror = function (errorMsg, url, lineNumber, column, errorObj) {
    alert('Error: ' + errorMsg + ' Script: ' + url + ' Line: ' + lineNumber
    + ' Column: ' + column + ' StackTrace: ' +  errorObj.stack);
}


     function goBack(event) {
    	 
    	 if ($("#goback").length===0) {
    		navigator.app.clearCache(); 
    		navigator.app.clearHistory();
    		navigator.app.exitApp();
    	 } else {
    	 	$("#goback").click();
    	 }
     }

function get_url_param( name ){

	var regexS = "[\\?&]"+name+"=([^&#]*)";
	var regex = new RegExp( regexS );
	var results = regex.exec( window.location.href );

	if ( results == null ) {
		return "";
	}	
	else {
		return results[1];
	}
}
 
  var sql_error = function (tx,error) {
       alert("Error: "+error.message);
  } 
   
  var error = function(e) {
		 alert(JSON.stringify(e));
  }
   
   
  
  
  function is_not_null(str) {
      
      return str!="" && str!=null && str!="null" && str!="undefinded" && str!=undefined;
  }

 function random() {
	 return "?v="+(new Date()).getTime();
 }
 
 
 function create_tablegenerator(table,structure) {
	 
	 return function(values, follow) {
	     db.transaction(function(tx) {
     		tx.executeSql("Drop table if exists "+table,[],function(tx,rs) {
            	tx.executeSql('CREATE TABLE IF NOT EXISTS '+table+" "+structure,[],function(tx,rs){
                	$("#lfd").append("Erzeuge Tabelle `"+table+"` und fülle diese");
                	$("#lfd").append("<div id='"+table+"_percentage'></div>");
                	var insert = function(tx, i) {
                		var val = values[i];
                		tx.executeSql("insert into "+table+" values "+val,[],function(tx,rs) {
                			percent = Math.round((i*100/(values.length-1)) * 100) / 100;
                			//$("#"+table+"_percentage").html("Fortschritt: ("+i+"/"+values.length+") "+percent+"%");
                			$("#"+table+"_percentage").html('<progress max="'+(values.length-1)+'" value="'+i+'"></progress>');
                    		if (i==values.length-1) {
                    			follow();
                    			return;
                    		} else {
                    			insert(tx,i+1);
                    		}
                    	},function(tx,e) { 
                    		alert(e.message);
                    		alert(val);
                    		insert(tx,i+1);
                    	});
                	}
                	
                		
            		if (values && values.length > 0) {
                		insert(tx,0);
            		} else {
            			follow();
            		}
                	
                	 
                	
            	},sql_error);
         	},sql_error);
     	});
	 }
 }
 
 var ol_ghaupt_small_object =  {
		 name : 'ol_ghaupt_small',
		 getValues : function(obj) {
			 return '('+obj['kindex']+",'"+obj['friedhof']+"','"+obj['abteil']+"','"+obj['reihe']+"','"+obj['stelle']+"','"+obj['gtext']+"','"+obj['gname']+"')";
		 },
		 tablegenerator : create_tablegenerator('ol_ghaupt_small','(kindex integer primary key, friedhof text, abteil text, reihe text, stelle text, gtext text, gname text)')
		 
  };
  var ol_gmangel_object =  {
		 name : 'ol_gmangel',
		 getValues : function(obj) {
			var gmzustand = is_not_null(obj['gmzustand']) ? "'"+obj['gmzustand']+"'" : "null";
            var pfzustand = is_not_null(obj['pfzustand']) ? "'"+obj['pfzustand']+"'" : "null";
			var gmdatum = is_not_null(obj['gmdatum']) ? "'"+obj['gmdatum']+"'" : "null";
			var pfdatum = is_not_null(obj['pfdatum']) ? "'"+obj['pfdatum']+"'" : "null";
			var gmstinfo = is_not_null(obj['gmstinfo']) ? "'"+obj['gmstinfo']+"'" : "null";
			var zustinfo = is_not_null(obj['zustinfo']) ? "'"+obj['zustinfo']+"'" : "null";
            
         	return '('+obj['kindex']+","+gmzustand+","+pfzustand+","+gmdatum+","+pfdatum+","+gmstinfo+","+zustinfo+", 0)";
		 },
		 tablegenerator : create_tablegenerator('ol_gmangel','(kindex integer primary key, gmzustand text, pfzustand text, gmdatum text, pfdatum text, gmstinfo text,zustinfo text,ischanged integer)')
		 
  };
  var mandant_values_object =  {
		 name : 'mandant_values',
		 getValues : function(obj) {
			 var group = is_not_null(obj['group_name']) ? "'"+obj['group_name']+"'" : "null";
             var key =   is_not_null(obj['value_name']) ? "'"+obj['value_name']+"'" : "null";
             var value = is_not_null(obj['value_text']) ? "'"+obj['value_text']+"'" : "null";   
         	 return '('+group+","+key+","+value+")";
		 },
		 tablegenerator : create_tablegenerator('mandant_values','(mvgroup text, key text, value text)')
		 
  };
 
 
 

 

 
 function deleteDirectory(fileSystem,path,proceed) {
	   
	      var after = function() {
	    	  fileSystem.root.getDirectory(path, {create: true}, function(dirEntry) {
	    		  $("#lfd").append("Verzeichnis "+path+" neu angelegt.<br/>");
	    		  proceed(); 
	    	  });
	      }
	      
		  fileSystem.root.getDirectory(path, {create: true}, function(dirEntry) {
			  dirEntry.removeRecursively(function() {
					after();	  
			  });
		  });
 }
 
 function resetFolderStructure(orlando,proceed) {
	 
	  window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem) {
		
		  if (orlando) {
			  deleteDirectory(fileSystem,PATH+"/OUT",function() {
				  deleteDirectory(fileSystem,PATH+"/images",proceed);
			  });
		  } else {
			   deleteDirectory(fileSystem,PATH+"/images",proceed);
		  }
		  
	  });
	 
	 
 }

 
 
 
 function reset_ol_gmangel() {
	     
         db.transaction(function(tx) {
        	   tx.executeSql("Update ol_gmangel set ischanged=0",[],function(txx,rs){
				  alert("Update erfolgreich");	
				},sql_error);
         });
   }
 
 

   
   
   
   function update(proceed,callback) {
	   
	     db.transaction(function(tx) {
             
               var zustaende = new Array();
              
               tx.executeSql('select kindex, gmzustand, pfzustand, gmdatum, pfdatum, gmstinfo, zustinfo from ol_gmangel where ischanged=1',[],function(tx,rs) {
                  var i = 0;
                  if (rs.rows.length==0) {
                	  $("#lfd").append("Da keine Datensätze geändert sind, kann Datebank-Synchronisation nicht durchgeführt werden.<br/>");
                	  callback();
                	  return;
                  }
                  for (i=0; i < rs.rows.length; i++) {
                	var gmdatum = is_not_null(rs.rows.item(i)['gmdatum']) ? rs.rows.item(i)['gmdatum'] : '';
                	var pfdatum = is_not_null(rs.rows.item(i)['pfdatum']) ? rs.rows.item(i)['pfdatum'] : '';
                    var zustand = [rs.rows.item(i)['kindex'],rs.rows.item(i)['gmzustand'],rs.rows.item(i)['pfzustand'],gmdatum,pfdatum,rs.rows.item(i)['gmstinfo'],rs.rows.item(i)['zustinfo']];
                    zustaende.push(zustand);
                  }
               
                  
			   proceed(zustaende,0);

         	   },sql_error);
       
       
   		});
	     
   }
   
   
   
   
   

   
        function loadMenu() { 
    	 
    	$("#header").load("menu_header.html", function() {
			$("#content").load("menu.html", function() {
				
				if (application_type=="tombejo") {
					$(".tombejo").show();
				} else {
					$(".orlando").show();
				}
    		});
    	});

     }
        
   function init_mandant_values() {
	  gm_mandantvalues = {};
	  pf_mandantvalues = {};
	  

        
         db.transaction(function(tx) {
            tx.executeSql('select mvgroup, key, value from mandant_values',[],function(tx,rs) {
                var i = 0;
                for (i=0; i < rs.rows.length; i++) {
                            if (rs.rows.item(i)['mvgroup'].toLowerCase()=='gmzustand') {
                                gm_mandantvalues[rs.rows.item(i)['key']]=rs.rows.item(i)['value'];
                            } else 
                            if (rs.rows.item(i)['mvgroup'].toLowerCase()=='pfzustand') {
                                pf_mandantvalues[rs.rows.item(i)['key']]=rs.rows.item(i)['value'];
                            }  
                            
                }
        
            },sql_error);       
            
         }); 
 }

   
   
   

   
  
         
      
         

