/**
 * @author 柯斌
 * @desc 控件显示隐藏
 * @date 2015-06-29
 */
define(function(require, exports, module) {
	var ctrlHideOrShow = {
			/**
			 * 控件显示隐藏
			 */
			ctrlHideOrShow : function($ctrlObj, cJson) {
				$.each(cJson["ctrl"], function(key, value) {
					var $obj = $("[ctrlid='" + key + "']");
					if (key == $ctrlObj.attr("name")) {
						$obj = $ctrlObj.closest(".formCtrl");
					}
					var query = null;
					if (value["dataType"]) {
						var queryId = value["queryId"], dataType = value["dataType"], valueType = value["valueType"], queryField = value["queryField"], queryValue = value["queryValue"];
						var jsonParam = {
							"type" : "select",
							"queryId" : queryId,
							"form" : ezCommon.getCurrFormValueList(),
							"where" : "",
							"mark" : false
						};
						if (dataType == "systemParam") {
							queryValue = ezCommon.getSysParam(valueType);
						}
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
								if (value["css"] == "hide") {
									$obj.slideUp("slow");
								} else if (value["css"] == "show") {
									$obj.slideDown("slow");
								}
							} else {
								if (value["css"] == "hide") {
									$obj.slideDown("slow");
								} else if (value["css"] == "show") {
									$obj.slideUp("slow");
								}
							}
						} else {
							if (dataQuery.length > 0) {
								var data = dataQuery[0][queryField];
								if (value["css"] == "hide") {
									$obj.slideUp("slow");
								} else {
									$obj.slideDown("slow");
								}
							} else if (dataQuery.length <= 0) {
								if (value["css"] == "hide") {
									$obj.slideDown("slow");
								} else if (value["css"] == "show") {
									$obj.slideUp("slow");
								}

							}
						}

					} else {
						// 在此处做滑动现实隐藏的效果
						if (value["css"] == "hide") {
							if($obj.is(":visible")){
								$obj.slideUp("slow");
							}else{
								$obj.slideDown("slow");
							}
							
							//hide
						} else {
							if($obj.is(":visible")){
								$obj.slideUp("slow");
							}else{
								$obj.slideDown("slow");
							}
						}
					}
					// TODO 如果当容易大于某个高度时则需要判断滑动的速度是否加快 暂时未处理
				});
				return true;
			},

	};
	module.exports =  ctrlHideOrShow;
});