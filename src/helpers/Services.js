var Services = {
	register : function(name, func) {
		this[name] = func;
	}
};
export default Services;