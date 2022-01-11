//Example for Create Xml file using Nodejs for server side
//Author: Rafael Tavares

const fs = require('fs');
const xml = require('./xmlrw');

const Example = function(){
   
    //Create xml stream Document
	var document = new xml.xmlDocument();
	
	//Create new element
	var element = document.createElement('newElement');
	element.setAttribute('attrib1', 'Value1');
	element.setAttribute('attrib2', 'Value2');
	element.setAttribute('attrib3', 'Value3');
	element.setAttribute('attrib4', 'Value4');
	
	//Append element into document
	//For append element into other one, use element object created for append
	//Example: element.appendChild(child);
	document.appendChild(element);
	
	//obtain xml content to text
	var content = document.xmlContent();
	
	//Save Xml file
	document.saveFile('example.xml');
	
}
