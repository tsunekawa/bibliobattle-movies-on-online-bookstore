function isbn13to10(isbn13) {
  isbn13 += "";
  var digits = [];
  digits = isbn13.substr(3,9).split("") ;
  var sum = 0; var chk_tmp, chk_digit;
  for(var i = 0; i < 9; i++) {
    sum += digits[i] * (10 - i);
  }
  chk_tmp= 11 - (sum % 11);
  if (chk_tmp == 10) {
    chk_digit = 'x';
  } else if (chk_tmp == 11) {
    chk_digit = 0;
  } else {
    chk_digit = chk_tmp;
  }
  digits.push(chk_digit);
  return digits.join("");
}

var getYoutubeID = function (res, target_isbn){
  var youtube_id;

  for (var i=0, len=res.length; i < len;i++){
    var row = res[i], isbn10, isbn13;
    var isbn = row["book:isbn"].replace(/-/g,"");
    if (isbn.length==13){
      isbn = isbn13to10(isbn)
    }

    if (isbn==target_isbn){
      youtube_id = row["movie:youtube_id"];
      break;
    }
  }

  return youtube_id;
}

$(function (){
  var target_isbn = location.href.match(/[0-9X]{10,13}/)[0];
  var port = chrome.extension.connect();
  port.postMessage();
  port.onMessage.addListener(function (res){
    var youtube_id = getYoutubeID(res, target_isbn);
    if (!!youtube_id){
      $(".bucketDivider:first").before(
          $('<hr class="bucketDivider" /><div class="bucket"><h2>ビブリオバトル動画</h2><iframe width="560" height="315" src="//www.youtube.com/embed/<<id>>" frameborder="0" allowfullscreen></iframe></p>'.replace("<<id>>", youtube_id))
      );
    }
  });
});
