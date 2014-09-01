  
  var gm_mandantvalues = new Object();
  var pf_mandantvalues = new Object();
  var mandant_id;
  var url;
  var db;
  var selectGraveValues = {};
  var PATH = "solena";
  var FULLPATH = "/sdcard/"+PATH+"/";


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
 
   function sql_error(tx,error) {
       alert("Error: "+error.message);
  }  
  
  
  function is_not_null(str) {
      
      return str!="" && str!=null && str!="null" && str!="undefinded" && str!=undefined;
  }


  

 function create_ol_ghaupt_small() {
	 
	  
	 $.get(url, {ol_ghaupt : 1, mandant_id : mandant_id }, function(obj){
		var ghvalues = new Array();
     	var i = 0;        
     	for(i = 0; i < (obj.length-1); i++) {
        	var val = '('+obj[i]['kindex']+",'"+obj[i]['friedhof']+"','"+obj[i]['abteil']+"','"+obj[i]['reihe']+"','"+obj[i]['stelle']+"','"+obj[i]['gtext']+"','"+obj[i]['gname']+"')";
         	ghvalues.push(val);
     	}
     	db.transaction(function(tx) {
     		tx.executeSql("Drop table if exists ol_ghaupt_small",[],function(tx,rs) {
            	tx.executeSql('CREATE TABLE IF NOT EXISTS ol_ghaupt_small (kindex integer primary key, friedhof text, abteil text, reihe text, stelle text, gtext text, gname text)',[],function(tx,rs){
                	var i = 0;
                	for(i=0;i<(ghvalues.length);i++) {
                    	var val = ghvalues[i];
                    	tx.executeSql("insert into ol_ghaupt_small values "+val);
                	}
                	$("#lfd").append("Tabelle ol_ghaupt_small erfolgreich synchronisiert<br/>.");    
                    create_ol_gmangel();
            	},sql_error);
         	},sql_error);
     	});
		 
	 }, "json");
 }
 
 	
 
  function create_ol_gmangel() {
	 
	  
	 $.get(url, {ol_gmangel : 1, mandant_id : mandant_id }, function(obj){
		 
		var gmvalues = new Array();
     	var i = 0;        
     	for(i = 0; i < (obj.length-1); i++) {
        	gmzustand = is_not_null(obj[i]['gmzustand']) ? "'"+obj[i]['gmzustand']+"'" : "null";
            pfzustand = is_not_null(obj[i]['pfzustand']) ? "'"+obj[i]['pfzustand']+"'" : "null";
			gmdatum = is_not_null(obj[i]['gmdatum']) ? "'"+obj[i]['gmdatum']+"'" : "null";
			pfdatum = is_not_null(obj[i]['pfdatum']) ? "'"+obj[i]['pfdatum']+"'" : "null";
			gmstinfo = is_not_null(obj[i]['gmstinfo']) ? "'"+obj[i]['gmstinfo']+"'" : "null";
			zustinfo = is_not_null(obj[i]['zustinfo']) ? "'"+obj[i]['zustinfo']+"'" : "null";
            
         	var val = '('+obj[i]['kindex']+","+gmzustand+","+pfzustand+","+gmdatum+","+pfdatum+","+gmstinfo+","+zustinfo+", 0)";
         	gmvalues.push(val);
     	}
     	db.transaction(function(tx) {
     		tx.executeSql("Drop table if exists ol_gmangel",[],function(tx,rs) {
            	tx.executeSql('CREATE TABLE IF NOT EXISTS ol_gmangel (kindex integer primary key, gmzustand text, pfzustand text, gmdatum text, pfdatum text, gmstinfo text,zustinfo text,ischanged integer)',[],function(tx,rs){
                
                	 var i = 0;
                 	 for(i=0;i<(gmvalues.length);i++) {
                    	var val = gmvalues[i];
                    	tx.executeSql("insert into ol_gmangel values "+val);
                 	  }
         
                 	$("#lfd").append("Tabelle ol_gmangel erfolgreich synchronisiert.<br/>"); 
                 	create_mandant_values();
                
            	},sql_error);
         	});
     		
     	},sql_error);
		 
	 }, "json");
 }
  
  function create_mandant_values() {
	 
	  
	 
	 $.get(url, {mandant_values : 1, mandant_id : mandant_id }, function(obj){
		var mandantvalues = new Array();
     	var i = 0;        
     	for(i = 0; i < (obj.length-1); i++) {
        	 group = is_not_null(obj[i]['group_name']) ? "'"+obj[i]['group_name']+"'" : "null";
             key =   is_not_null(obj[i]['value_name']) ? "'"+obj[i]['value_name']+"'" : "null";
             value = is_not_null(obj[i]['value_text']) ? "'"+obj[i]['value_text']+"'" : "null";   
         	 var val = '('+group+","+key+","+value+")";
         	 mandantvalues.push(val);
     	}
     	db.transaction(function(tx) {
     		tx.executeSql("Drop table if exists mandant_values",[],function(tx,rs) {
            	tx.executeSql('CREATE TABLE IF NOT EXISTS mandant_values (mvgroup text, key text, value text)',[],function(tx,rs){
                
                	var i = 0;
                	for(i=0;i<(mandantvalues.length);i++) {
                    	var val = mandantvalues[i];
                    	tx.executeSql("insert into mandant_values values "+val,[],function(tx,rs){},sql_error);
                	}
         
                	$("#lfd").append("Tabelle mandant_values erfolgreich synchronisiert.<br/>");
					init();

            	},sql_error);   
         	},sql_error);
     		
     	});
		 
	 }, "json");
 }
 
 function fillDatabase() {
	 $("#content").load("reset_database.html", function() {
		 alert("Erzeuge neue Datenbank");
	 	 create_ol_ghaupt_small(); // anders folgt in callback functions
     });
	 
 }
 
 function random() {
	 return "?v="+(new Date()).getTime();
 }
 
 
 function init() {
     
	db = window.sqlitePlugin.openDatabase({name: "grabliste"});
	        
        if (!(is_not_null(mandant_id) && is_not_null(url))) {        
        	db.transaction(function(tx) {
            	tx.executeSql('select key, value from settings',[],function(tx,rs) {
            	    var i = 0;
                	for (i=0; i < rs.rows.length; i++) {
                		if (rs.rows.item(i)['key']=='mandant_id') { 
                				mandant_id = rs.rows.item(i)["value"];
                		} else 
                		if (rs.rows.item(i)['key']=='url') {
                				url = rs.rows.item(i)["value"];
                		}
                	}
                    if (is_not_null(mandant_id) && is_not_null(url)) {
                			loadStartPage();
                    } else {
                			systemSettings();
                    }
        
            	},function(){
            	    systemSettings();
            	});       
            
         	});
        } else {
        	loadStartPage();
        }

 }
 
 
     function fillSelectBox(name,where) {
    	 
    	 
	
    	 
    	 if (typeof(where) == "undefined")
    		 where = "";
    	 else
    		 where = "WHERE "+where;
    	 
		 db.transaction(function(tx) {

         tx.executeSql('select distinct '+name+' from ol_ghaupt_small '+where+' order by '+name,[],function(tx,rs) {

                 var select = $('#'+name); 
                 select.empty();
                 select.append("<option value=''> </option>");
                 var i = 0;
                 var sel;
                 for (i=0; i < rs.rows.length; i++) {
                     v = rs.rows.item(i)[name];
                     sel = (typeof(selectGraveValues) != "undefined" && selectGraveValues[name]==v) ? "selected" : "";
                     if (is_not_null(v))
                     	select.append('<option value="'+v+'" '+sel+' >'+v+'</option>');
                 }
                 
                 if( where.length==0) {
                 	select.change(function(){
                	 	if(typeof(selectGraveValues) == "undefined")
                			 selectGraveValues = {};
                	 
                		 selectGraveValues[name] = $(this).val();
                		 
                		 var fh = selectGraveValues["friedhof"] ? "friedhof='"+selectGraveValues["friedhof"]+"'" : "1=1";
                		 var at = selectGraveValues["abteil"] ? "abteil='"+selectGraveValues["abteil"]+"' ": "1=1";
                		 var rh = selectGraveValues["reihe"] ? "reihe='"+selectGraveValues["reihe"]+"' " : "1=1";	 
                	 
                		 if(name=="friedhof") {
                			 fwhere = fh;
                			 fillSelectBox("abteil",fwhere);
                			 fillSelectBox("reihe",fwhere);
                			 fillSelectBox("stelle",fwhere);
                			 fillSelectBox("gtext",fwhere);
                	 	 } else
                	  	if(name=="abteil") {
                		 	fwhere = fh+" AND "+at;
                		 	fillSelectBox("reihe",fwhere);
                		 	fillSelectBox("stelle",fwhere);
                			fillSelectBox("gtext",fwhere);
                	 	 } else
                	  	if(name=="reihe") {
                		 	fwhere = fh+" AND "+at+" AND "+rh;
                			 fillSelectBox("stelle",fwhere);
                		  } 	  
                	 
                	 
                 	});
                 }
                 
             },sql_error);
         
		 });
         
     }
 
     
     function loadMenu() { 
    	 
    	$("#header").load("menu_header.html", function() {
			$("#content").load("menu.html", function() {
    		});
    	});

     }
     
     function onPhotoDataSuccess(imageURI) {
  		var gotFileEntry = function(fileEntry) {
    
    		var gotFileSystem = function(fileSystem) {

        		fileSystem.root.getDirectory("MyAppFolder", {
            		create : true
        		}, function(dataDir) {
          			var d = new Date();
          			var n = d.getTime();
          			var newFileName = n + ".jpg";
            		fileEntry.moveTo(dataDir, newFileName, null, fsFail);

        		}, dirFail);

    		};
    
    		window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFileSystem,fsFail);
		};
		
		//resolve file system for image
		window.resolveLocalFileSystemURI(imageURI, gotFileEntry, fsFail);

		var fsFail = function(error) {
    		alert("failed with error code: " + error.code);

		};

		var dirFail = function(error) {
    		alert("Directory error code: " + error.code);

		};
	}
     
     
     
     function takePicture(kindex) {
    	 
    	 var error = function(e) {
    		 alert(error.code+"!!");
    	 }
    	
    	  navigator.camera.getPicture(function(imageURI) {
			   document.addEventListener("deviceready", function(){
    		   		window.resolveLocalFileSystemURI(imageURI, function(fileEntry) {
    			   		window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem) {
    				   		fileSystem.root.getDirectory(PATH, {create : true}, function(dataDir) {
          						var d = new Date();
          						var n = d.getTime();
          						var newFileName = kindex + ".jpg";
            					fileEntry.moveTo(dataDir, newFileName, null);

								  var image = $('#grabimage');
    		   					  image.css("display","inline");
    		   					  image.attr("src",FULLPATH+newFileName+random());

        					},error);
    					},error);
    			   	},error);
    		   	}, false);
    	  }, function(message) {
    		   alert('Fehler: ' + message);
    	  },
    	   { quality: 50, 
    		 destinationType: Camera.DestinationType.FILE_URI 
    		});
    	
    	  
    	  return false;
     }
     
     function goBack() {
    	 if ($("#goback").length===0) {
    		navigator.app.exitApp();
    	 } else {
    	 	$("#goback").click();
    	 }
     }
     
     function resetMainList() {
		 selectGraveValues = {};
    	 loadStartPage();
    	 return false;
     }
  
 function loadStartPage(){
     
	 
	  $("#header").load("main_header.html", function() {

        $("#content").load("main.html", function() {
        	
                fillSelectBox('friedhof');
                fillSelectBox('abteil');
                fillSelectBox('reihe');
                fillSelectBox('stelle');
                fillSelectBox('gtext');
         
            
             $("#mainform").submit(function() {
            	 
            	 var inputs = $('#mainform :input');
    			 var values = {};
    		     inputs.each(function() {
    		    	if (this.name != "submit")
        			  values[this.name] = $(this).val();
    			 });
    		     selectGraveValues = values;
        	     showGrablist(selectGraveValues);
        		 return false;
    		});
        
        });
        
	  });

        
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
 
 function getFullName(str) {
	 if(str=='abteil')
		 return 'Abteilung';
	 if (str=='gtext')
		 return 'Grabart';
	 if (str=='gname')
		 return 'Grabname';
	 else
		return str.charAt(0).toUpperCase() + str.slice(1);
 }

 
 function showGrablist(values) {
	  var limit = 1000;
	  var where = "1=1 ";
	  var searchcriteria = "";
	  
	  for(key in values) {
		 if (values[key].length) {
			 if (key=="gname") {
				 where += "AND "+key+" LIKE '%"+values[key]+"%' ";
			 } else {
				where += "AND "+key+"='"+values[key]+"' ";
			 }
			//searchcriteria += getFullName(key)+"="+values[key]+"<br/>";
			 searchcriteria += values[key]+"/";
		 }
		 
	  }
	  
	 $("#header").load("grablist_header.html", function() {
	  $("#content").load("grablist.html", function() {
		
		
		 $("#searchcriteria").append(searchcriteria);
         
         db.transaction(function(tx) {
        	 
        	 tx.executeSql('select count(*) from ol_ghaupt_small where '+where,[],function(tx,rs) {
        		 var count = rs.rows.item(0)['count(*)'];
            	 $("#treffer").append("<b>"+count+" Gräber</b><br/>");
            	 if (count > limit) {
            		 $("#warnung").append("<b class='error'>Zu viele Gräber - es werden nur "+limit+" angezeigt. Schränken Sie möglichst die Suchkriterien ein</b>");
            	 }
            	 var orderby = " ORDER BY friedhof, abteil, reihe, stelle ";	 
            	 tx.executeSql('select ol_ghaupt_small.kindex as kindex, friedhof, gtext, gname, abteil, reihe, stelle, gmzustand, pfzustand from ol_ghaupt_small left outer join ol_gmangel on (ol_ghaupt_small.kindex=ol_gmangel.kindex) where '+where+orderby+" LIMIT "+limit,[],function(tx,rs) {
            	  	var i = 0;
            	  	var inordnung = "In Ordnung";
                  	for (i=0; i < rs.rows.length; i++) {
                  		var friedhof = is_not_null(rs.rows.item(i)['friedhof']) ? rs.rows.item(i)['friedhof'] : '';
                    	var gtext = is_not_null(rs.rows.item(i)['gtext']) ? rs.rows.item(i)['gtext'] : '';
                    	var gname = is_not_null(rs.rows.item(i)['gname']) ? rs.rows.item(i)['gname'] : '';
                     	var abteil = is_not_null(rs.rows.item(i)['abteil']) ? rs.rows.item(i)['abteil'] : '';
                     	var reihe = is_not_null(rs.rows.item(i)['reihe']) ? rs.rows.item(i)['reihe'] : '';
                     	var stelle = is_not_null(rs.rows.item(i)['stelle']) ? rs.rows.item(i)['stelle'] : '';
                     	var kindex = rs.rows.item(i)['kindex'];
                     	var gmzustand =  is_not_null(rs.rows.item(i)['gmzustand']) ? gm_mandantvalues[rs.rows.item(i)['gmzustand']] : inordnung;
                     	var pfzustand =  is_not_null(rs.rows.item(i)['pfzustand']) ? pf_mandantvalues[rs.rows.item(i)['pfzustand']] : inordnung;
                     	var gmclass = gmzustand==inordnung ? "ok" : "notok";
                     	var pfclass = pfzustand==inordnung ? "ok" : "notok";
                     	var block = '<b>'+friedhof+'</b><br/>';
                     	block += '<b>'+gname+'</b><br/>';
                     	block += '<b>'+gtext+'</b><br/>';
                     	block += abteil+'|'+reihe+'|'+stelle;
                     	var block1 = '<div class="block" >'+block+'</div>';
                     	var block2 = '<div class="block '+gmclass+'">Grabmalzustand:<br/>'+gmzustand+'</div>';
                     	var block3 = '<div class="block '+pfclass+'">Pflegezustand:<br/>'+pfzustand+'</div>';
                     	var content = '<td class="grabliste">'+block1+'</td>';
                     	content += '<td class="grabliste">'+block2+'</td>';
                     	content += '<td class="grabliste">'+block3+'</td>';
                     	$('#table').append('<tr class="grabliste_row" onclick="showSingleGrave('+kindex+')">'+content+'</tr>');
                  	}
                  	$("#spinner").empty();
	                 
             	},sql_error);
            	 
        	 },sql_error);
              
         });
         
         
     });
	});  
   return false;
 }

 
 function showSingleGrave(kindex) {
	$("#header").load("einzelgrab_header.html", function() {

	   $("#content").load("einzelgrab.html", function() {
		     
		   	 where = "ol_ghaupt_small.kindex="+kindex;
		   	 
		     
		     
             db.transaction(function(tx) {
            	 tx.executeSql('select ol_ghaupt_small.kindex as kindex, gtext, gname, friedhof, abteil, reihe, stelle, gmzustand, pfzustand, gmstinfo, zustinfo from ol_ghaupt_small left outer join ol_gmangel on (ol_ghaupt_small.kindex=ol_gmangel.kindex) where '+where,[],function(tx,rs) {
            	   
            		var fri = '<b>Friedhof:'+(is_not_null(rs.rows.item(0)['friedhof']) ?  rs.rows.item(0)['friedhof'] : '')+"</b>";
            		var abt = 'Abt:'+(is_not_null(rs.rows.item(0)['abteil']) ?  rs.rows.item(0)['abteil'] : '')+"|";
            		var rei = 'Reihe:'+(is_not_null(rs.rows.item(0)['reihe']) ?  rs.rows.item(0)['reihe'] : '')+"|";
            		var ste = 'Stelle:'+(is_not_null(rs.rows.item(0)['stelle']) ? rs.rows.item(0)['stelle'] : ''); 
            		var gra = "Grabart:"+(is_not_null(rs.rows.item(0)['gtext']) ?  rs.rows.item(0)['gtext'] : '');
            		var gna = "Grabname:"+(is_not_null(rs.rows.item(0)['gname']) ?  rs.rows.item(0)['gname'] : '');
            		var kindex =  rs.rows.item(0)['kindex'];
            		var gmzustand = rs.rows.item(0)['gmzustand'];
            		var pfzustand = rs.rows.item(0)['pfzustand'];
            		$("#subheader").append(fri+"/");
//            		$("#subheader").append(abt+rei+ste+"/");
//            		$("#subheader").append(gra+"/");
//            		$("#subheader").append(gna);
					$("#kindex").val(kindex);            		
            		var gmselect = $('#gmzustand');
                    var pfselect = $('#pfzustand'); 
                    var gmsel = is_not_null(rs.rows.item(0)['gmzustand']) ? "" : "selected";
                    var pfsel = is_not_null(rs.rows.item(0)['pfzustand']) ? "" : "selected";
                    $("#gmstinfo").val(rs.rows.item(0)['gmstinfo']);
                    $("#zustinfo").val(rs.rows.item(0)['zustinfo']);
                    gmselect.append("<option "+gmsel+" value='' >In Ordnung</option>");
                    pfselect.append("<option "+pfsel+" value='' >In Ordnung</option>");

                    for (gkey in  gm_mandantvalues) {
                        var sel = gkey==rs.rows.item(0)['gmzustand'] ? "selected" : "";
                        gmselect.append('<option '+sel+' value="'+gkey+'" >'+gm_mandantvalues[gkey]+'</option>');
                    }
                    for (pkey in  pf_mandantvalues) {
                        var sel = pkey==rs.rows.item(0)['pfzustand'] ? "selected" : "";
                        pfselect.append('<option '+sel+' value="'+pkey+'" >'+pf_mandantvalues[pkey]+'</option>');
                    }
                    
                    $("#grabimage").attr("src",FULLPATH+kindex+".jpg"+random());
                    $("#grabimage").error(function(){
  						$(this).hide();
					});
                    $("#takepicture").click(function() {
                    	takePicture(kindex);
                    });
            	 
            	 }, sql_error);
            	 
            	 
             });
             
             $("#savesinglegrave").submit(function() {
                 var values = {};
                 var inputs = $('#savesinglegrave :input');
                 inputs.each(function() {
                    if (this.name != "submit") {
                      values[this.name] = $(this).val();
                    }
                 });
                 if (confirm("wirklich speichern?") == true) {
                    saveZustand(values);
                 } 
                 

                 return false;
            });
             

		   
	   });
	});
  }

  
   function saveZustand(values) {
	   	 var today = new Date();
	   	 var tdString = "'"+today.toISOString().split("T")[0]+"'";
	   	 var gmdatum = "null";
	   	 var pfdatum = "null";
	     if (is_not_null(values['gmzustand']) || is_not_null(values['gmstinfo']))
	    	 gmdatum = tdString;
	     if (is_not_null(values['pfzustand']) || is_not_null(values['zustinfo']))
	    	 pfdatum = tdString;
	     var gmstinfo = is_not_null(values['gmstinfo']) ? "'"+values['gmstinfo']+"'" : "null";
	     var zustinfo = is_not_null(values['zustinfo']) ? "'"+values['zustinfo']+"'" : "null";
	     
		   
         
         db.transaction(function(tx) {
                           
               tx.executeSql('replace into ol_gmangel (kindex, gmzustand, pfzustand, gmdatum, pfdatum, gmstinfo, zustinfo, ischanged) values ('+values['kindex']+',"'+values['gmzustand']+'","'+values['pfzustand']+'",'+gmdatum+','+pfdatum+','+gmstinfo+','+zustinfo+', 1)',[],function(tx,rs) {

					showGrablist(selectGraveValues); //
            	   		

               }, sql_error);
             
         });
         
   }
   
   function reset_ol_gmangel() {
	     
         db.transaction(function(tx) {
        	   tx.executeSql("Update ol_gmangel set ischanged=0",[],function(txx,rs){
				  alert("Update erfolgreich");	
				},sql_error);
         });
   }
   
   function  writeAndConfirm(zustaende,j) {
	   if (j>=zustaende.length) {
		   reset_ol_gmangel();
		   return;
	   }
	   var zustand = zustaende[j];
	   $.post(
			url+"?setData=1&mandant_id="+mandant_id,
			{ kindex : zustand[0], gmzustand : zustand[1], pfzustand : zustand[2], gmdatum : zustand[3], pfdatum : zustand[4], gmstinfo : zustand[5], zustinfo : zustand[6] },
			function(data) {
				alert(data);
				writeAndConfirm(zustaende,j+1);
			 },
		     "text");	
   }
   
   
   
   
   
   
   function writeToServer() {
	   
       
         
         db.transaction(function(tx) {
             
               var zustaende = new Array();
              
               tx.executeSql('select kindex, gmzustand, pfzustand, gmdatum, pfdatum, gmstinfo, zustinfo from ol_gmangel where ischanged=1',[],function(tx,rs) {
                  var i = 0;
                  for (i=0; i < rs.rows.length; i++) {
                	var gmdatum = is_not_null(rs.rows.item(i)['gmdatum']) ? rs.rows.item(i)['gmdatum'] : '';
                	var pfdatum = is_not_null(rs.rows.item(i)['pfdatum']) ? rs.rows.item(i)['pfdatum'] : '';
                    var zustand = [rs.rows.item(i)['kindex'],rs.rows.item(i)['gmzustand'],rs.rows.item(i)['pfzustand'],gmdatum,pfdatum,rs.rows.item(i)['gmstinfo'],rs.rows.item(i)['zustinfo']];
                    zustaende.push(zustand);
                  }
                  
			   writeAndConfirm(zustaende,0);

         	   },sql_error);
       
       
   		}); 
         
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

 
