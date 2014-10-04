(function (){

var parseTSV = function (text){
  var content;
  var rows;
  var header;

  if (text!=""){
    rows = _.escape(text).split("\n");
    header = rows.shift().split("\t");
    content = _.map(rows, function (rowstr) {
      return _.object(header, rowstr.split("\t"));
    });
  } else {
    content = [];
  }

  return content;
};

var parseTSV = function (text){
  var content;
  var rows;
  var header;

  if (text!=""){
    rows = _.escape(text).split("\n");
    header = rows.shift().split("\t");
    content = _.map(rows, function (rowstr) {
      return _.object(header, rowstr.split("\t"));
    });
  } else {
    content = [];
  }

  return content;
};

var loadSourceData = function (callback){
  var port = chrome.extension.connect();
  port.postMessage();
  port.onMessage.addListener(function (res){
    callback.call(this, res);
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

var convert_isbn10to13 = function(_isbn10) {
  var weights = [1,3,1,3,1,3,1,3,1,3,1,3];
  var isbn10 = _isbn10.replace(/-/g, "");
  var numbers;
  var check_digit;

  if(isbn10.length!=10){
    throw isbn10 + "is not ISBN10";
  }

  numbers = ("978"+isbn10).split("");
  numbers.pop();
 
  check_digit = 10 - ( _.chain(numbers)
                        .clone()
                        .zip(weights)
                        .reduce(function (memo, pair){ return memo+(parseInt(pair[0]) * pair[1]) }, 0)
                        .value() % 10 );

  numbers.push(check_digit);
  return numbers.join("");
};

var getYoutubeID = function (res, target_isbn){
  var youtube_id;
  var row = _.find(res, function (row){
    var isbn = row["book:isbn"].replace(/-/g,"");

    if (target_isbn.length==10){
      target_isbn = convert_isbn10to13(target_isbn)
    }
    if (isbn.length==10){
      isbn = convert_isbn10to13(isbn);
    }

    return isbn == target_isbn;
  });

  if (_.isObject(row)){
    youtube_id = row["movie:youtube_id"];
  }

  return youtube_id;
};

var extractPageContext = function (){
  var url = location.href;
  var isbn;
  var context;

  if (url.match(/http[s]{0,1}:\/\/www.amazon.co.jp\/.*$/)) {
    isbn    = url.match(/[0-9X]{10,13}/)[0];
    context = {service:"amazon", isbn:isbn};
  } else if (url.match(/^http[s]{0,1}:\/\/www.kinokuniya.co.jp\/.*$/)){
    isbn    = url.match(/[0-9X]{10,13}/)[0];
    context = {service:"kinokuniya", isbn:isbn};
  } else if (url.match(/^http[s]{0,1}:\/\/www.honyaclub.com\/.*$/)) {
    isbn    = /[0-9]{10,13}/.exec(document.querySelectorAll(".item-price")[0].innerHTML);
    context = {service:"honyaclub", isbn:isbn};
  }else {
    context = null;
  }

  return context;
};

var insertMovieByService = function (service_name, youtube_id){
  var result;
  var template;

  switch(service_name){
    case "amazon":
      template = _.template('<hr class="bucketDivider" /><div class="bucket"><h2>ビブリオバトル動画</h2><iframe width="560" height="315" src="//www.youtube.com/embed/<%= youtube_id %>" frameborder="0" allowfullscreen></iframe></div>');
      document.querySelectorAll(".bucketDivider")[0].insertAdjacentHTML("beforebegin", template({youtube_id: youtube_id}));
      result = true;
      break;
    case "kinokuniya":
      template = _.template('<div class="career_box"><h3>ビブリオバトル動画</h3><iframe width="560" height="315" src="//www.youtube.com/embed/<%= youtube_id %>" frameborder="0" allowfullscreen></iframe></div><hr class="ymt_dlBtmBorder mb15" noshade />');
      document.querySelectorAll(".career_box")[0].insertAdjacentHTML("beforebegin", template({youtube_id: youtube_id}));
      result = true;
      break;
    case "honyaclub":
      template = _.template('<div class="detail-comment02"><b>ビブリオバトル動画</b><br><iframe width="560" height="315" src="//www.youtube.com/embed/<%= youtube_id %>" frameborder="0" allowfullscreen></iframe></div>');
      document.querySelectorAll(".detail-block01")[0].insertAdjacentHTML("beforeend", template({youtube_id: youtube_id}));
      result = true;
      break;
  }

  return result;
};

// main block
loadSourceData(function (res){
  var context     = extractPageContext();
  var database    = parseTSV(res);

  if(_.isObject(context)){
    var target_isbn = context.isbn;
    var youtube_id = getYoutubeID(database, target_isbn);

    if (_.isString(youtube_id)){
      insertMovieByService(context.service, youtube_id);
    }

  }
  
});


})();
