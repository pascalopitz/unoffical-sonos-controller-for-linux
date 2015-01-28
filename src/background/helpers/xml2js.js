import xml2json from 'jquery-xml2json';

var xml2js = {
	Parser: function () {
		return {
			parseString: function (str, callback) {
				var json = xml2json(str, {
					explicitArray: true
				});
				callback(null, json);
			}
		}
	}
}

export default xml2js;