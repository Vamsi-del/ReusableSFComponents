const parseXml = (xml) => {
    var dom = null;
        if (window.DOMParser) {
           try { 
              dom = (new DOMParser()).parseFromString(xml, "text/xml");
           } 
           catch (e) { dom = null; console.log(e);}
        }
        return dom?.getElementsByTagName('sf:VersionData')[0]?.textContent;
};
  
export { parseXml };