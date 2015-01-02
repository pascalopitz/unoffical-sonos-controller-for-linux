var xml2js = {
	Parser: function () {
		return {
			parseString: function (str, callback) {
				var json = xml2json(str, {
					explicitArray: true
				});
				console.log('xml', str, json);
				callback(null, json);
			}
		}
	}
}

export default xml2js;