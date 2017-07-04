import xml2json from 'jquery-xml2json';

const xml2js = {
    Parser: function() {
        return {
            parseString: function(str, callback) {
                const json = xml2json(str, {
                    explicitArray: true
                });
                callback(null, json);
            }
        };
    }
};

export default xml2js;
