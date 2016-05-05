/**
 * @autar 柯斌
 * @desc 属性解析总调度
 * @date 2015-09-18
 */

define(function(require, exports, module){
	var attrResolve = {
		init : function($ctrl,attrJson){
			$.each(attrJson,function(k,value){
				var key = k.toLowerCase();
				if(key != "general"){
					require.async(SITECONFIG.PUBLICPATH + "/Js/attrResolve/"+key+".js"+SITECONFIG.VERSION,function(e){
						e[key](value,$ctrl);
					});
				}
			});
		}
	};
	
	module.exports = attrResolve;
});
