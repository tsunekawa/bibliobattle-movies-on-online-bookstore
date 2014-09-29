(function (){

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

var loadSourceData = function (callback){
  var port = chrome.extension.connect();
  port.postMessage();
  port.onMessage.addListener(function (res){
    callback.call(this, parseTSV(res));
  });

  return port;
};

var convert_isbn13to10 = function(isbn13) {
  if(isbn13.length!=13){
    throw isbn13 + " is not ISBN13.";
  }

  var isbn10_ary = isbn13.substr(3,9).split("");
  var sum    = 0;
  var digit_number;
  var check_digit;
  var isbn10;

  for (var i=0, len=isbn10_ary.length; i<len;i++){
    sum+=isbn10_ary[i] * (10 - i);
  }

  digit_number = 11 - (sum % 11);
  switch(digit_number){
    case 10:
      check_digit = 'x';
      break;
    case 11:
      check_digit = '0';
      break;
    default:
      check_digit = digit_number;
      break;
  }

  isbn10_ary.push(check_digit);
  isbn10 = isbn10_ary.join("");
  return isbn10;
};

var getYoutubeID = function (res, target_isbn){
  var youtube_id;

  for (var i=0, len=res.length; i < len;i++){
    var row = res[i], isbn10, isbn13;
    var isbn = row["book:isbn"].replace(/-/g,"");
    if (isbn.length==13){
      isbn = convert_isbn13to10(isbn)
    }

    if (isbn==target_isbn){
      youtube_id = row["movie:youtube_id"];
      break;
    }
  }

  return youtube_id;
};

// main block
loadSourceData(function (res){
  var target_isbn = location.href.match(/[0-9X]{10,13}/)[0];
  var youtube_id = getYoutubeID(res, target_isbn);

  if (!!youtube_id){
    $(".bucketDivider:first").before(
        $('<hr class="bucketDivider" /><div class="bucket"><h2>ビブリオバトル動画</h2><iframe width="560" height="315" src="//www.youtube.com/embed/<<id>>" frameborder="0" allowfullscreen></iframe></p>'.replace("<<id>>", youtube_id))
    );
  }
});


})();
