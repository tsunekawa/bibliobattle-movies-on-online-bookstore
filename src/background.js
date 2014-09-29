chrome.extension.onConnect.addListener(function(port) {
  port.onMessage.addListener(function (msg){
    var url = "https://raw.githubusercontent.com/tsunekawa/bibliobattle-opendata/master/books_movies.tsv";

    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4) {
        port.postMessage(xhr.responseText);
      }
    }
    xhr.send();
  });
});
