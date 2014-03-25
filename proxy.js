
var http = require('http'),
    fs = require('fs'),
    mkdirp = require('mkdirp');


var PORT = 8081;

console.log('Listening on port', PORT, '...');

///////////////////////////////////////
// parseUri 1.2.2
// (c) Steven Levithan <stevenlevithan.com>
// MIT License

function parseUri (str) {
    var o   = parseUri.options,
        m   = o.parser[o.strictMode ? "strict" : "loose"].exec(str),
        uri = {},
        i   = 14;

    while (i--) uri[o.key[i]] = m[i] || "";

    uri[o.q.name] = {};
    uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
        if ($1) uri[o.q.name][$1] = $2;
    });

    return uri;
}

parseUri.options = {
    strictMode: false,
    key: ["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],
    q:   {
        name:   "queryKey",
        parser: /(?:^|&)([^&=]*)=?([^&]*)/g
    },
    parser: {
        strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
        loose:  /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
    }
};

//////////////////////////////////////////




http.createServer(function(request, response) {


  var proxy = http.createClient(80, request.headers['host']);

  var proxy_request = proxy.request(request.method, request.url, request.headers);

  proxy_request.addListener('response', function (proxy_response) {

    var parsed = parseUri(request.url);
    var dir_path = 'sites/' + parsed.host + parsed.directory;
    var file_path = dir_path + (parsed.file || 'index.html');

    console.log('Now proxying:', file_path);
    //console.log('- Directory:', parsed.directory, '; File:', parsed.file);
    mkdirp.sync(dir_path);

    var writeStream = fs.createWriteStream(file_path);

    proxy_response.pipe(writeStream);



    proxy_response.addListener('data', function(chunk) {
      response.write(chunk, 'binary');
      // fs.writeSync(file, chunk);
    });
    proxy_response.addListener('end', function() {
      response.end();
      // fs.closeSync(file);
    });
    response.writeHead(proxy_response.statusCode, proxy_response.headers);
  });
  request.addListener('data', function(chunk) {
    proxy_request.write(chunk, 'binary');
  });
  request.addListener('end', function() {
    proxy_request.end();
  });
}).listen(PORT);
