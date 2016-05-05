/**
 * @author 柯斌
 * @desc 控件解锁
 * @date 2015-06-29
 */
define(function(require, exports, module) {
	var unlockOrLocking = {
			/**
			 * 控件解锁
			 */
			unlockOrLocking : function($ctrlObj, cJson) {
				$.each(cJson["ctrl"], function(key, value) {
					var $obj = $("[name='" + key + "']");
					if (key == $ctrlObj.attr("name")) {
						$obj = $ctrlObj;
					}
					var query = null;
					if (value["dataType"]) {
						var queryId = value["queryId"], dataType = value["dataType"], valueType = value["valueType"], queryField = value["queryField"], queryValue = value["queryValue"];
						if (dataType == "systemParam") {
							queryValue = ezCommon.getSysParam(valueType);
						}

						var jsonParam = {
							"type" : "select",
							"queryId" : queryId,
							"form" : ezCommon.getCurrFormValueList(),
							"where" : "",
							"mark" : false
						};

						var dataQuery = [];
						if (dataType != "rowDataNull") {
							jsonParam.where = [{
								"fieldName" : queryField,
								"fieldValue" : queryValue,
								"arith" : "eq",
								"logic" : ""
							}], jsonParam.mark = true;

						}
						if (query != "__blank") {
							dataQuery = ezCommon.curd(jsonParam);
						}
						if (dataType == "rowDataNull") {
							if (dataQuery.length <= 0) {
								if (value["css"] == "disabled") {
									$obj.attr("disabled", "disabled");
								} else if (value["css"] == "enabled") {
									$obj.removeAttr("disabled");
								}
							} else {
								if (value["css"] == "disabled") {
									$obj.removeAttr("disabled");
								} else if (value["css"] == "enabled") {
									$obj.attr("disabled", "disabled");
								}
							}
						} else {
							if (dataQuery.length > 0) {
								var data = dataQuery[0][queryField];
								if (value["css"] == "disabled") {
									$obj.attr("disabled", value["css"]);
								} else {
									$obj.removeAttr("disabled");
								}
							} else if (dataQuery.length <= 0) {
								if (value["css"] == "disabled") {
									$obj.removeAttr("disabled");
								} else if (value["css"] == "enabled") {
									$obj.attr("disabled", "disabled");
								}

							}
						}

					} else {
						if (value["css"] == "disabled") {
							$obj.attr("disabled", value["css"]);
						} else {
							$obj.removeAttr("disabled");
						}
					}
				});
				return true;
			},

	};
	module.exports =  unlockOrLocking;
});