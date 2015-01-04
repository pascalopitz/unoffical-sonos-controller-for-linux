/**
 * Encodes characters not allowed within html/xml tags
 * @param  {String} body
 * @return {String}
 */
var htmlEntities = function (str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
};

export default htmlEntities;