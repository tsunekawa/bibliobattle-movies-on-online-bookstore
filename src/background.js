var parseTSV = function (text){
  var content = [];

  if (text!=""){
    var rows = text.split("\n");
    var header = rows.shift().split("\t");
    for(var i=0, len=rows.length;i < len;i++){
      var row = rows[i].split("\t");
      var obj = {};
      for(var j=0, jlen=header.length;j < jlen; j++){
        obj[header[j]] = row[j];
      }
      content.push(obj);
    }
  }

  return content;
};

chrome.extension.onConnect.addListener(function(port) {
  port.onMessage.addListener(function (msg){
    var url = "https://raw.githubusercontent.com/tsunekawa/bibliobattle-opendata/master/books_movies.tsv";

    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4) {
        var res = parseTSV(xhr.responseText);
        port.postMessage(res);
      }
    }
    xhr.send();
  });
});

chrome.runtime.sendMessage(function(request, sender, sendResponse) {
});
