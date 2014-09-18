 var csv_files = ["FRIEDHOF","HANDBASE","ZUSTAND","PFLEGE"];
 var csv = new Array();
 
 function read_file(i) {
	 if (i>3)
		 return processCSV();
	 
	 var filename = "IN/"+csv_files[i]+".CSV";
	 var localPath = PATH+"/"+filename;
	 window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem){
        		fileSystem.root.getFile(localPath, { create: false }, function(fileEntry) {
        			fileEntry.file(function(file) {
        				var reader = new FileReader();
        				reader.onloadend = function(evt) {
        					$("#lfd").append("Datei "+localPath+" gelesen.<br/>"); 
        					var results = Papa.parse(evt.target.result);
        					$("#lfd").append("Datei "+localPath+" geparst.<br/>");
        					csv[i] = results.data;
        					read_file(i+1);
        				}
        				reader.readAsText(file);
        			}, error);

        		},function() {
        			alert("Datei "+localPath+" nicht vorhanden. Bitte Dateien einspielen");
        		});
			},error);	 
 }
 
 

 function processCSV() {

	 var fh = csv[0];
	 var friedhof = {};
	 for(var i=0;i<fh.length;i++) {
		 friedhof[fh[i][0]] = fh[i][1];
	 }
	 
	 var hb = csv[1];
	 var ghaupt = [];
	 var gmangel =  [];
	 for(var j=0;j<hb.length;j++) {
		 var friedhof_name = friedhof[hb[j][0]];
		 ghaupt[j] = "("+hb[j][9]+",'"+friedhof_name+"','"+hb[j][1]+"','"+hb[j][2]+"','"+hb[j][3]+"','"+hb[j][5]+"','"+hb[j][6]+"')";
		 gmangel[j] = "("+hb[j][9]+",'"+hb[j][46]+"','"+hb[j][42]+"','"+hb[j][48]+"','"+hb[j][44]+"','"+hb[j][49]+"','"+hb[j][45]+"',0)";
	 }
	 
	 var csv_mandant_values = [];
	 var gm = csv[2];
	 for(var i=0;i<gm.length;i++) {
		if (gm[i][0].trim().length>0) {
				
		 		csv_mandant_values.push(
		        "( 'GMZUSTAND','"+gm[i][0]+"','"+gm[i][1]+"' )"				
		 		);
	 	}	
	 }
	 
	 var pf = csv[3];
	 for(var j=0;j<pf.length;j++) {
		if (pf[j][0].trim().length>0) {
		 	csv_mandant_values.push(
		 			"( 'PFZUSTAND','"+pf[j][0]+"','"+pf[j][1]+"' )"
		 			);
	 	}
		
	 }
	 
	 
	 var create_gh = ol_ghaupt_small_object.tablegenerator;
	 var create_gm = ol_gmangel_object.tablegenerator;
	 var create_mv = mandant_values_object.tablegenerator;
	 
	 create_gh(ghaupt, function() {
		 create_gm(gmangel,function() {
			 create_mv(csv_mandant_values,function() {
				 init();
			 });
		 });
	 });
	 	 
	
	 
	 

 }
 
 
 	 function  writeToCSVAndConfirm(zustaende) {
 		 var csv = Papa.unparse(zustaende);
 		 
 		 var filename = "OUT/GMANGEL.CSV";
	 	 var localPath = PATH+"/"+filename;
 		 window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem){
        		fileSystem.root.getFile(localPath, { create: true }, function(fileEntry) {
        			fileEntry.createWriter( function(writer) {
        				writer.onwriteend = function(evt) {
        					var b = confirm("Datei "+filename+" erzeugt. Soll die Information, welche Werte zu exportieren sind, zurückgesetzt werden?");
        					if (b) {
        						reset_ol_gmangel();
        					}
            			};
        				writer.write(csv);
        			},file_error);

        		},file_error);
			},file_error);	 
   	 }
 	 
 	 
  function createCSVFromDatabase() {
	   
	   
	   
	 $("#content").load("reset.html", function() {
		 $("#title").html("Schreibe Daten in CSV-Datei:");
	   
	     update( function(zustaende,j) {
		     writeToCSVAndConfirm(zustaende,j);
	     }, function() { loadStartPage(); });
	 });  
   }
 	
 	
 	 
 function createDatabaseFromCSV() {

	 $("#content").load("reset.html", function() {
		  $("#title").html("Erzeuge Datenbank aus CSV-Datei:");
		  resetFolderStructure(true,function() {
	 	 	read_file(0);
		 });
					 	 
     });
 
 }
 