const fs = require("fs");
const path = require('path');

class xmlDocument {
    constructor(){
        const me = this;
        this.declaration = true;
        this.version = '1.0';
        this.encoding = 'UTF-8';
        this.standalone = 'no';
        this.root = [];

        var content = '';

        this.createElement = function(tag){
            let elm = new xmlElement(tag);
            return elm;
        }

        this.appendChild = function(elm){
            me.root.push(elm);
        }

        this.removeChild = function(index){
            root.splice(index, 1);
        }

        this.xmlContent = function(){

            if(me.declaration == true){
                content += '<?xml version="'+ me.version + '" encoding="' + me.encoding + '" standalone="' + me.standalone + '"?>';
                //console.log(content);
            }

            if(me.root.length > 0){
                me.root.forEach(elm => {
                    writeContent(elm);
                });
            }
            else {
                //console.log('xml empty');
            }
    
            return content;
            //.replace(/(\r\n|\n|\r)/gm, "")
        }

        const writeContent = function(elm){

            if(elm && String(elm.tag).trim() != ''){
                content += '<'+ elm.tag;
                if(elm.attributes){
                    if(elm.attributes.length > 0){
                        elm.attributes.forEach(attr => {
                            content += ' ' + attr.attrName + '="' + attr.attrValue + '"';
                        })
                    }
                }

                if(elm.childs){
                    if(elm.childs.length > 0){
                        content += '>';
                        elm.childs.forEach(child => {
                            writeContent(child);
                        })
                        content += '</' + elm.tag + '>';
                    }
                    else {
                        content += '/>';
                    }
                }
                else{
                    content += '/>';
                }

            }   
            //console.log(content);
        }

        this.xmlNodes = function(){
            return this.root;
        }

    }
}

class xmlElement {
    constructor(tag){
        const me = this;
        this.tag = tag;
        this.attributes = [];
        this.childs = [];

        this.appendChild = function(elm){
            me.childs.push(elm);
        }

        this.removeChild = function(index){
            me.childs.splice(index, 1);
        }

        this.setAttribute = function(name, value){
            var attr = {
                attrName: name,
                attrValue: value
            }
            me.attributes.push(attr);
        }

        this.getAttribute = function(name){
            var param = String(name).toLowerCase().trim();
            var exists = me.attributes.find(a => { return String(a.attrName).toLowerCase().trim() == param });
            if(exists != undefined){
                //console.log('existe: ' + exists.attrValue);
                return exists.attrValue;
            }
            else {
                //console.log('não existe! ');
                return '';
            }
        }

    }
}

class xmlParser {
    constructor()
    {
        var me = this; // stores the object instantce

        // Removes '\t\r\n', rows with multiples '""', multiple empty rows, '  "",', and "  ",; replace empty [] with ""
        var jsontoStr = function(js_obj) {
            var rejsn = JSON.stringify(js_obj, undefined, 2).replace(/(\\t|\\r|\\n)/g, '').replace(/"",[\n\t\r\s]+""[,]*/g, '').replace(/(\n[\t\s\r]*\n)/g, '').replace(/[\s\t]{2,}""[,]{0,1}/g, '').replace(/"[\s\t]{1,}"[,]{0,1}/g, '').replace(/\[[\t\s]*\]/g, '""');
            return (rejsn.indexOf('"parsererror": {') == -1) ? rejsn : 'Invalid XML format';
        }
        
        me.loadFromText = function(content){
            let portion = String(content).replace(/\n/g, '').replace(/\t/g, '').replace(/  /g, '').replace(/> /g, '>').replace(/ </g, '<');
            var eof = false;
            //console.log('inicio: ' + portion);

            let elm = new xmlDocument();
            elm.declaration = false;

            if(portion.includes('<?xml')){
                let i = portion.indexOf('?>') + 1;
                portion = portion.substring(i);
            }

            let element = '';
            let start, end;
            var attrs = [];

            while (eof == false){
                element = '';

                if(portion.includes('<')){
                    //console.log('loadFromText: ' + portion);

                    start = portion.indexOf('<');
                    end = portion.indexOf('>') + 1;
                    element = portion.substring(start + 1, portion.indexOf(' '));
                    
                    //console.log(element);
                    var child = elm.createElement(element);

                    var elmpart = portion.substring(start + element.length + 2, end);
                    //console.log('get attr: ' + elmpart);
                    attrs = elmpart.split('=');
                    var name = '';
                    var value = '';

                    for(var i = 0; i < attrs.length; i++){
                        
                        if(i == 0)
                        {
                            name = attrs[i];
                        }
                        else if(i == attrs.length - 1)
                        {
                            value = attrs[i].substring(1, attrs[i].lastIndexOf('"'));
                            child.setAttribute(name, value);
                        }
                        else 
                        {
                            value = attrs[i].substring(1, attrs[i].lastIndexOf('"'));
                            child.setAttribute(name, value);
                            
                            name = '';
                            value = '';
                            name = attrs[i].substring(attrs[i].lastIndexOf('" ') + 1);
                        }

                    }

                    var endNode = '</' + element + '>';
                    var before = portion.substring(end + 1);
                    var elmall = portion.substring(start, end);
                    //console.log(elmall);
                    if(elmall.substring(end - 2, end - 1) != '/'){
                        //console.log('main has childs: ' + elmall.substring(end - 2, end - 1));
                        let inner = before.substring(0, before.indexOf(endNode));
                        writeNodes(inner, child);
                        portion = before.substring(before.indexOf(endNode) + endNode.length + 1);
                        //console.log('before: ' + portion);
                    }
                    else {
                        endNode = '/>';
                        portion = portion.substring(end + 1);
                    }

                    if(portion.length == 0){
                        eof = true;
                    }

                    elm.appendChild(child);              
                }
                else {
                    eof = true;
                }
            }

            //console.log(elm.xmlContent());

            return elm.xmlNodes();

        }

        const writeNodes = function(content, elm){
            let portion = String(content);
            let element = '';
            var eof = false;

            let start, end;
            var attrs = [];
 
            while(eof == false){
                element = '';

                if(portion.includes('<')){
                    //console.log('writeNodes: ' + portion);

                    start = portion.indexOf('<');
                    end = portion.indexOf('>') + 1;
                    element = portion.substring(start + 1, portion.indexOf(' '));
                    
                    //console.log(element);
                    var child = new xmlElement(element);

                    var elmpart = portion.substring(start + element.length + 2, end);
                    //console.log('get attr: ' + elmpart);
                    attrs = elmpart.split('=');
                    var name = '';
                    var value = '';

                    for(var i = 0; i < attrs.length; i++){
                        
                        if(i == 0)
                        {
                            name = attrs[i];
                        }
                        else if(i == attrs.length - 1)
                        {
                            value = attrs[i].substring(1, attrs[i].lastIndexOf('"'));
                            child.setAttribute(name, value);
                        }
                        else 
                        {
                            value = attrs[i].substring(1, attrs[i].lastIndexOf('"'));
                            child.setAttribute(name, value);
                            
                            name = '';
                            value = '';
                            name = attrs[i].substring(attrs[i].lastIndexOf('" ') + 1);
                        }

                    }

                    var endNode = '</' + element + '>';
                    var before = portion.substring(end + 1);
                    var elmall = portion.substring(start, end);
                    if(elmall.substring(end - 2, end - 1) != '/'){
                        //console.log('has childs: ' + elmall.substring(end - 2, end - 1));
                        let inner = before.substring(0, before.indexOf(endNode));
                        writeNodes(inner, child); 
                        portion = before.substring(before.indexOf(endNode) + endNode.length + 1);
                    }
                    else {
                        //console.log('has not childs');
                        endNode = '/>';
                        portion = portion.substring(end + 1);
                    }

                    //console.log('next: ' + portion);

                    if(portion.length == 0){
                        eof = true;
                    }

                    elm.appendChild(child); 
                }
                else {
                    eof = true;
                }

            }                                      
        }

    }
}

module.exports = {
    xmlDocument,
    xmlElement,
    xmlParser
}