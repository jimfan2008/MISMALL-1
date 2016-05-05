/**
 * @author 柯斌
 * @desc 规则调用
 * @date 2015-06-29
 */
define(function(require,exports,module){
	var callRule = {
		callRule : function($ctrlObj, cJson) {
						_commonAjax({
							url : SITECONFIG .APPPATH + "/Qywx/Rule/execRule",
							data : {
								"siteId" : SITEID,
								'ruleData' : JSON.stringify(cJson),
							},
							async : false,
							dataType : "json",
							success : function(r) {
								if (r) {
									return;
								}
							}
						});
						return true;
					},
		
	};
	module.exports = callRule;
});
