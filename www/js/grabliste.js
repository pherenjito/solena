function get_url_param( name ){

	var regexS = "[\\?&]"+name+"=([^&#]*)";
	var regex = new RegExp( regexS );
	var results = regex.exec( window.location.href );
	
	var selectGraveValues = {};

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

  
  var gm_mandantvalues = new Object();
  var pf_mandantvalues = new Object();
  var mandant_id;
  var url;
  

 function create_ol_ghaupt_small() {
	 
	 var db = window.sqlitePlugin.openDatabase({name: "grabliste"}); 
	 $.get(url, {ol_ghaupt : 1, mandant_id : mandant_id }, function(obj){
		var ghvalues = new Array();
     	var i = 0;        
     	for(i = 0; i < (obj.length-1); i++) {
        	var val = '('+obj[i]['kindex']+",'"+obj[i]['friedhof']+"','"+obj[i]['abteil']+"','"+obj[i]['reihe']+"','"+obj[i]['stelle']+"','"+obj[i]['gtext']+"')";
         	ghvalues.push(val);
     	}
     	db.transaction(function(tx) {
     		tx.executeSql("Drop table if exists ol_ghaupt_small",[],function(tx,rs) {
            	tx.executeSql('CREATE TABLE IF NOT EXISTS ol_ghaupt_small (kindex integer primary key, friedhof text, abteil text, reihe text, stelle text, gtext text)',[],function(tx,rs){
                	var i = 0;
                	for(i=0;i<(ghvalues.length);i++) {
                    	var val = ghvalues[i];
                    	tx.executeSql("insert into ol_ghaupt_small values "+val);
                	}
                	alert("Tabelle ol_ghaupt_small erfolgreich synchronisiert");    
                    create_ol_gmangel();
            	},sql_error);
         	},sql_error);
     	});
		 
	 }, "json");
 }
 
  function create_ol_gmangel() {
	 
	 var db = window.sqlitePlugin.openDatabase({name: "grabliste"}); 
	 $.get(url, {ol_gmangel : 1, mandant_id : mandant_id }, function(obj){
		 
		var gmvalues = new Array();
     	var i = 0;        
     	for(i = 0; i < (obj.length-1); i++) {
        	gmzustand = is_not_null(obj[i]['gmzustand']) ? "'"+obj[i]['gmzustand']+"'" : "null";
            pfzustand = is_not_null(obj[i]['pfzustand']) ? "'"+obj[i]['pfzustand']+"'" : "null";
			gmdatum = is_not_null(obj[i]['gmdatum']) ? "'"+obj[i]['gmdatum']+"'" : "null";
			pfdatum = is_not_null(obj[i]['pfdatum']) ? "'"+obj[i]['pfdatum']+"'" : "null";
            
         	var val = '('+obj[i]['kindex']+","+gmzustand+","+pfzustand+","+gmdatum+","+pfdatum+", 0)";
         	gmvalues.push(val);
     	}
     	db.transaction(function(tx) {
     		tx.executeSql("Drop table if exists ol_gmangel",[],function(tx,rs) {
            	tx.executeSql('CREATE TABLE IF NOT EXISTS ol_gmangel (kindex integer primary key, gmzustand text, pfzustand text, gmdatum text, pfdatum text, ischanged integer)',[],function(tx,rs){
                
                	 var i = 0;
                 	 for(i=0;i<(gmvalues.length);i++) {
                    	var val = gmvalues[i];
                    	tx.executeSql("insert into ol_gmangel values "+val);
                 	  }
         
                 	alert("Tabelle ol_gmangel erfolgreich synchronisiert"); 
                 	create_mandant_values();
                
            	},sql_error);
         	});
     		
     	},sql_error);
		 
	 }, "json");
 }
  
  function create_mandant_values() {
	 
	 var db = window.sqlitePlugin.openDatabase({name: "grabliste"}); 
	 
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
         
                	alert("Tabelle mandant_values erfolgreich synchronisiert");
					init();

            	},sql_error);   
         	},sql_error);
     		
     	});
		 
	 }, "json");
 }
 
 function fillDatabase() {
	 alert("Erzeuge neue Datenbank");
	 create_ol_ghaupt_small();
 }
 
 
 function init() {
     
	var db = window.sqlitePlugin.openDatabase({name: "grabliste"});
	        
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
    	 
    	 
		var db = window.sqlitePlugin.openDatabase({name: "grabliste"});

    	 
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
		$("#content").load("menu.html", function() {
    	});

     }
  
 function loadStartPage(){
     
		var db = window.sqlitePlugin.openDatabase({name: "grabliste"});


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
	 else
		return str.charAt(0).toUpperCase() + str.slice(1);
 }

 
 function showGrablist(values) {
	  where = "1=1 ";
	  searchcriteria = "";
	  for(key in values) {
		 if (values[key].length) {
			where += "AND "+key+"='"+values[key]+"' ";
			searchcriteria += getFullName(key)+"="+values[key]+"<br/>";
		 }
		 
	  }
	  $("#content").load("grablist.html", function() {
		
		 $("#proceed").load("spinner.html"); 
		 $("#searchcriteria").append(searchcriteria);
         var db = window.sqlitePlugin.openDatabase({name: "grabliste"});
         db.transaction(function(tx) {
             
               tx.executeSql('select ol_ghaupt_small.kindex as kindex, gtext, abteil, reihe, stelle, gmzustand, pfzustand from ol_ghaupt_small left outer join ol_gmangel on (ol_ghaupt_small.kindex=ol_gmangel.kindex) where '+where,[],function(tx,rs) {
            	  var i = 0;
            	  var nr = rs.rows.length;
            	  $("#searchcriteria").append("<b>"+nr+" Gräber gefunden </b>");
                  for (i=0; i < rs.rows.length; i++) {
                     gtext = is_not_null(rs.rows.item(i)['gtext']) ? rs.rows.item(i)['gtext'] : '';
                     abteil = is_not_null(rs.rows.item(i)['abteil']) ? rs.rows.item(i)['abteil'] : '';
                     reihe = is_not_null(rs.rows.item(i)['reihe']) ? rs.rows.item(i)['reihe'] : '';
                     stelle = is_not_null(rs.rows.item(i)['stelle']) ? rs.rows.item(i)['stelle'] : '';
                     kindex = rs.rows.item(i)['kindex'];
                     gmzustand =  is_not_null(rs.rows.item(i)['gmzustand']) ? gm_mandantvalues[rs.rows.item(i)['gmzustand']] : "In Ordnung";
                     pfzustand =  is_not_null(rs.rows.item(i)['pfzustand']) ? pf_mandantvalues[rs.rows.item(i)['pfzustand']] : "In Ordnung";
                     content = '<b>'+gtext+'</b><br/>';
                     content += '<div class="grabliste">'+abteil+'|'+reihe+'|'+stelle+'</div>';
                     content += '<div class="grabliste">'+gmzustand+'</div>';
                     content += '<div class="grabliste">'+pfzustand+'</div>';
                     content = "<div onclick='showSingleGrave("+kindex+")'>"+content+"</div>";
                     $('#table').append('<tr class="grabliste_row" ><td class="grabliste_feld">'+content+'</td></tr>');
                  }
                  $("#proceed").html('<input id="back" class="text button" type="button" value="zurück" onclick="loadStartPage()"  />');
                 
             },sql_error);
             
         },sql_error);
         
         
     });
 
 }

 
 function showSingleGrave(kindex) {
	   $("#content").load("einzelgrab.html", function() {
		     
		   	 where = "ol_ghaupt_small.kindex="+kindex;
		   	 
		     var db = window.sqlitePlugin.openDatabase({name: "grabliste"});
		     
             db.transaction(function(tx) {
            	 tx.executeSql('select ol_ghaupt_small.kindex as kindex, gtext, abteil, reihe, stelle, gmzustand, pfzustand from ol_ghaupt_small left outer join ol_gmangel on (ol_ghaupt_small.kindex=ol_gmangel.kindex) where '+where,[],function(tx,rs) {
            	   
            		abt = 'Abt:'+(is_not_null(rs.rows.item(0)['abteil']) ?  rs.rows.item(0)['abteil'] : '');
            		rei = 'Reihe:'+(is_not_null(rs.rows.item(0)['reihe']) ?  rs.rows.item(0)['reihe'] : '');
            		ste = 'Stelle:'+(is_not_null(rs.rows.item(0)['stelle']) ? rs.rows.item(0)['stelle'] : ''); 
            		gra = "Grabname:"+(is_not_null(rs.rows.item(0)['gtext']) ?  rs.rows.item(0)['gtext'] : '');
            		gmzustand = rs.rows.item(0)['gmzustand'];
            		pfzustand = rs.rows.item(0)['pfzustand'];
            		$("#header").append(abt+rei+ste+"<br/>");
            		$("#header").append(gra);
            		$("#kindex").val( rs.rows.item(0)['kindex']);            		
            		var gmselect = $('#gmzustand');
                    var pfselect = $('#pfzustand'); 
                    var gmsel = is_not_null(rs.rows.item(0)['gmzustand']) ? "" : "selected";
                    var pfsel = is_not_null(rs.rows.item(0)['pfzustand']) ? "" : "selected";
                    gmselect.append("<option "+gmsel+" value=''>In Ordnung</option>");
                    pfselect.append("<option "+pfsel+" value=''>In Ordnung</option>");

                    for (gkey in  gm_mandantvalues) {
                        var sel = gkey==rs.rows.item(0)['gmzustand'] ? "selected" : "";
                        gmselect.append('<option '+sel+' value="'+gkey+'">'+gm_mandantvalues[gkey]+'</option>');
                    }
                    for (pkey in  pf_mandantvalues) {
                        var sel = pkey==rs.rows.item(0)['pfzustand'] ? "selected" : "";
                        pfselect.append('<option '+sel+' value="'+pkey+'">'+pf_mandantvalues[pkey]+'</option>');
                    }                  
            	 
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
  }

  
   function saveZustand(values) {
	   	 var today = new Date();
	   	 var tdString = "'"+today.toISOString().split("T")[0]+"'";
	   	 var gmdatum = "null";
	   	 var pfdatum = "null";
	     if (is_not_null(values['gmzustand']))
	    	 gmdatum = tdString;
	     if (is_not_null(values['pfzustand']))
	    	 pfdatum = tdString;
	     
		   
         var db = window.sqlitePlugin.openDatabase({name: "grabliste"});
         db.transaction(function(tx) {
                           
               tx.executeSql('replace into ol_gmangel (kindex, gmzustand, pfzustand, gmdatum, pfdatum, ischanged) values ('+values['kindex']+',"'+values['gmzustand']+'","'+values['pfzustand']+'",'+gmdatum+','+pfdatum+', 1)',[],function(tx,rs) {

					showGrablist(selectGraveValues); //
            	   		

               }, sql_error);
             
         });
         
   }
   
   function  writeAndConfirm(zustaende,j) {
	   if (j>=zustaende.length) return;
	   zustand = zustaende[j];
	   $.post(
			url+"?setData=1&mandant_id="+mandant_id,
			{ kindex : zustand[0], gmzustand : zustand[1], pfzustand : zustand[2], gmdatum : zustand[3], pfdatum : zustand[4] },
			function(data) {
				writeAndConfirm(zustaende,j+1);
			 },
		     "text");	
   }
   
   function writeToServer() {
	   
       
         var db = window.sqlitePlugin.openDatabase({name: "grabliste"});
         db.transaction(function(tx) {
             
               zustaende = new Array();
              
               tx.executeSql('select kindex, gmzustand, pfzustand, gmdatum, pfdatum from ol_gmangel where ischanged=1',[],function(tx,rs) {
                  var i = 0;
                  for (i=0; i < rs.rows.length; i++) {
                    zustand = [rs.rows.item(i)['kindex'],rs.rows.item(i)['gmzustand'],rs.rows.item(i)['pfzustand'],rs.rows.item(i)['gmdatum'],rs.rows.item(i)['pfdatum']];
                    zustaende.push(zustand);
                  }
                  
			   writeAndConfirm(zustaende,0);
		
			   tx.executeSql("Update ol_gmangel set ischanged=0",[],function(txx,rs){
				 alert("Update erfolgreich");	
				},sql_error);
			  
              
             
         	   },sql_error);
       
       
   		}); 
         
   }
   
   
   function systemSettings() {
	   
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
   }
   
   
    function saveSettings(values) {
         var db = window.sqlitePlugin.openDatabase({name: "grabliste"});
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

 
