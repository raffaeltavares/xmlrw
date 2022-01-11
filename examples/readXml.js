//Example for Read Xml file content using Nodejs for server side
//Author: Rafael Tavares

const fs = require('fs');
const xml = require('./xmlrw');

const Example = function(){
   
	//Create new instance for xmlParser
	const xmlp = new xml.xmlParser();
   
	//Using fs for reading content file
	const readefile = fs.readFileSync('/example.xml');

	//Load content file to Xml instance
	var content = xmlp.loadFromText(readefile);
	if(content.length > 0){
		
		//Create xml stream Document
		var document = new xml.xmlDocument();
	
		content.forEach(elm => {
			//Iterate from Elements 
			document.appendChild(elm);
		})
		
	}
      

}

