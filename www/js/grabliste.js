
 
 var selectboxes = ["friedhof","abteil","reihe","stelle","gtext"];

  
 function init() {
	
		db = window.sqlitePlugin.openDatabase({name: "grabliste"});
	    
		//db = window.openDatabase("grabliste","3.0","grabliste", 1000000);

		
		var settings_dont_exist = !(is_not_null(mandant_id) && is_not_null(url));
		
        if (application_type == "tombejo" && settings_dont_exist) {
        	
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
            
         	}, sql_error);
        } else {
        	loadStartPage();
        }
        
        
	 

 }
 
 
     function fillSelectBox(pos,where,callback,arrange) {
    	 
		var name = selectboxes[pos];

    	 if (typeof(name)=="undefined") {
    		 callback();
    		 return;
    	 }
    	     	 
    	 if (typeof(where) == "undefined" || where.length==0)
    		 where = "1=1";
    	 
		 db.transaction(function(tx) {

         tx.executeSql('select distinct '+name+' from ol_ghaupt_small WHERE '+where+' order by '+name,[],function(tx,rs) {

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
                 
                 if(!arrange) {
                 	select.change(function(){
                	 	if(typeof(selectGraveValues) == "undefined")
                			 selectGraveValues = {};
                	 
                		 selectGraveValues[name] = $(this).val();
                		 
                		 var fh = selectGraveValues["friedhof"] ? "friedhof='"+selectGraveValues["friedhof"]+"'" : "1=1";
                		 var at = selectGraveValues["abteil"] ? "abteil='"+selectGraveValues["abteil"]+"' ": "1=1";
                		 var rh = selectGraveValues["reihe"] ? "reihe='"+selectGraveValues["reihe"]+"' " : "1=1";	 
                	 
                		 if(name=="friedhof") {
                			 fwhere = fh;
                			 fillSelectBox(1,fwhere,function(){},true);
                	 	 } else
                	  	if(name=="abteil") {
                		 	fwhere = fh+" AND "+at;
                		 	fillSelectBox(2,fwhere,function(){},true);
                	 	 } else
                	  	if(name=="reihe") {
                		 	fwhere = fh+" AND "+at+" AND "+rh;
                			 fillSelectBox(3,fwhere,function(){},true);
                		  } 	  
                	 
                	 
                 	});
                 }
                 fillSelectBox(pos+1,where,callback,arrange);
                 
             },sql_error);
         
		 });
         
     }
 
     
     
     
     function getPictureFileName(kindex,i) {
    	 
    	 return "images/"+kindex+"_"+i+".jpg";
     }
     
     
     function takePicture(kindex,i) {
    	 
    	 var error = function(e) {
    		 alert(error.code+"!!");
    	 };
    	
    	  navigator.camera.getPicture(function(imageURI) {
			   document.addEventListener("deviceready", function(){
    		   		window.resolveLocalFileSystemURI(imageURI, function(fileEntry) {
    			   		window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem) {
    				   		fileSystem.root.getDirectory(PATH, {create : true}, function(dataDir) {
          						var d = new Date();
          						var n = d.getTime();
          						var filename = getPictureFileName(kindex,i);
            					fileEntry.moveTo(dataDir, filename, null);
            					
            					localPath = FULLPATH+filename;
        						$("#fotos").append("<div class='grabimage' ><img src="+localPath+random()+" /> </div><div class='center'><i>"+filename+"</i></div>");
        						setCurrentPictureIndex(kindex,i+1)

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
     
    
     function ifPictureExistsDo(kindex,callback, error) {
    	var filename= getPictureFileName(kindex,1);
 	    var localPath = PATH+"/"+filename;
    	window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem){
        	fileSystem.root.getFile(localPath, { create: false }, function(fileEntry) {
        		callback(kindex);
        	}, function(evt) {	
        		error(kindex);
        	});
    	}, function(evt) {
    		error(kindex);
        });
    	 
    	 
     }
     
   function iteratePictureFiles(kindex,i,append,after){
 		
     	var filename= getPictureFileName(kindex,i);
 	    var localPath = PATH+"/"+filename;
    	window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem){
        	fileSystem.root.getFile(localPath, { create: false }, function(fileEntry) {
        		localPath = FULLPATH+filename;
        		append(localPath+random(),filename);
        		
        		iteratePictureFiles(kindex,i+1,append,after);  
        	}, function(evt) {	
        		after(kindex,i);
        	});
    	}, function(evt) {
    		    after(kindex,i);
        	});
    	
	}
   
   function setCurrentPictureIndex(kindex,i) {
	   if (i<=1) {
		    $("#content").append("<div id='nopictures' class='center' > Noch keine Bilder vorhanden </div>");
	   } else {
		   $("#nopictures").remove();
	   }
	    $('#takepicture').unbind('click');
		$("#takepicture").click(function() {
        	takePicture(kindex,i);
		});
   }
     
     
      function showFotoView(kindex,friedhof,abteil,reihe,stelle,gtext,gname) {
	 
	 	$("#header").load("foto_header.html", function() {
		
	 		$("#foto_title").html("<b>"+friedhof+"</b> "+abteil+"|"+reihe+"|"+stelle+" <i>"+gname+"</i>");
	 		 
	   		 $("#content").load("foto.html", function() {

	   			 
	   			 iteratePictureFiles(kindex,1, function(src,bildname) {
	   				 $("#fotos").append("<div class='grabimage' ><img src="+src+" /> </div> <div class='center'><i>"+bildname+"</i></div>");
	   			 }, setCurrentPictureIndex);
		  

		  
		
			
	   		});
	 	});
	 
 }
     
     
     function resetMainList() {
		 selectGraveValues = {};
    	 loadStartPage();
    	 return false;
     }
  
 
 function loadStartPage(){
     	  
	  $("#header").load("main_header.html", function() {

        $("#content").load("main.html", function() {

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
                fillSelectBox(0,'',init_mandant_values);
        });
        
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
	 
	  var limit = 100;
	  var where = "1=1 ";
	  var searchcriteria = "";

	  for(key in values) {
		 if (values[key] && values[key].length) {
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
            	  	pictures_kindex = [];
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
                     	var content = '<td class="grabliste" onclick="showSingleGrave('+kindex+')">'+block1+'</td>';
                     	content += '<td class="grabliste" onclick="showSingleGrave('+kindex+')">'+block2+'</td>';
                     	content += '<td class="grabliste" onclick="showSingleGrave('+kindex+')">'+block3+'</td>';
                     	var params = kindex+",\""+friedhof+"\",\""+abteil+"\",\""+reihe+"\",\""+stelle+"\",\""+gtext+"\",\""+gname+"\"";
                     	content += "<td class='grabliste' onclick='showFotoView("+params+")'><img id='image_"+kindex+"' class='foto' /></td>";
                     	$('#table').append('<tr class="grabliste_row">'+content+'</tr>');
						ifPictureExistsDo(kindex,function(kindex){
                     		$("#image_"+kindex).attr("src","img/foto2.png");
                     	}, function(kindex) {
                     		$("#image_"+kindex).attr("src","img/foto.png");
                     	});
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
            		$("#subheader").append(fri+"<br/>");
            		$("#subheader").append(abt+rei+ste+"<br/>");
            		$("#subheader").append(gra+"<br/>");
            		$("#subheader").append(gna+"<br/>");
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
                    
//                    $("#grabimage").attr("src",FULLPATH+kindex+".jpg"+random());
//                    $("#grabimage").error(function(){
//  						$(this).hide();
//					});
//                    $("#takepicture").click(function() {
//                    	takePicture(kindex);
//                    });
            	 
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
   
   

 
