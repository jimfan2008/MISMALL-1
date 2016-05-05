/**
 * @author 柯斌
 * @desc 新增数据
 * @date 2015-06-8-29
 */
define(function(require, exports, module) {
	var addNewData = {
		/**
		 * 新增数据
		 */
		addNewData : function($ctrlObj, cJson) {
			var rowId = $ctrlObj.closest("[rowId]").attr("rowId");
			$.each(cJson["ctrl"], function(key, value) {
				var formId = value["formId"], tableName = value["tableName"], sql = "";
				values = [], fieldList = [], field = [];
				$.each(value["field"], function(k, v) {
					var fieldName = v["fieldName"], valueType = v["valueType"], dataType = v["dataType"], fieldValue = "";
					fieldList.push(fieldName);
					
					if (dataType == "constant") {
						values.push('"' + valueType + '"');
						fieldValue = valueType;

					} else if (dataType == "form") {
						var $obj = $(".myForm [ctrlid = '" + valueType + "']"), 
							ctrlType = $obj.attr("ctrl-type");
						if (ctrlType == "TEXTBOX") {
							var ctrlValue = $obj.find("[isbasectrl = 'true']").val();
							values.push('"' + ctrlValue + '"');
							fieldValue = ctrlValue;
						} else if (ctrlType == "DROPDOWN") {
							values.push('"' + $obj.find("select option:selected").html() + '"');
							fieldValue = $obj.find("select option:selected").val();
						} else if (ctrlType == "TEXTAREA") {
							values.push('"' + $obj.find("textarea").val() + '"');
							fieldValue = $obj.find("textarea").val();
						}

					} else if (dataType == "controls") {
						var $obj = $("[ctrlid='" + valueType + "']", $(".selectedForm"));
						if ($obj.hasClass("editor-layer-switch")) {
							var base64 = new Base64();
							fieldValue = base64.encode($obj.html());
						} else {
							fieldValue = $obj.find("div:first").text();
						}
					} else if (dataType == "systemParam") {
						if (valueType == "USERNAME") {
							values.push('"' + ezCommon.getSysParam(valueType) + '"');
							fieldValue = ezCommon.getSysParam(valueType);
						} else if (valueType == "SysDBDateTime") {
							values.push(new Date().format("yyyy-mm-dd hh:ii:ss"));
							fieldValue = new Date().format("yyyy-mm-dd hh:ii:ss");
						} else if (valueType == "STAFFID") {
							values.push('"' + ezCommon.getSysParam(valueType) + '"');
							fieldValue = ezCommon.getSysParam(valueType);
						}
					} else if (dataType == "currDataID") {
						values.push(rowId);
						fieldValue = rowId;
					} else if (dataType.indexOf("") == 0) {
						var fieldValueArray = [];
						$("[ctrlid = " + v['dataType'] + "]").find(".checked").find("input[type='checkbox']:checked").each(function(m, n) {
							var content = $(this).parents(".checked").next().find("[fieldname = " + v['valueType'] + "]").find(".fieldContent").text();
							fieldValueArray.push(content);
						});

						if (rowId) {
							fieldValueArray.push($ctrlObj.closest("[rowId]").find("[fieldname = " + v['valueType'] + "]").find(".fieldContent").text());
						}
						field.push({
							"fieldName" : fieldName,
							"fieldValue" : fieldValueArray.join(",")
						});
					}
					//if (dataType.indexOf("") != 0) {
						field.push({
							"fieldName" : fieldName,
							"fieldValue" : fieldValue
						});
					//}
				});

				var addParme = {
					"type" : "insert",
					"tableName" : tableName,
					"field" : field,
					"where" : ""
				};
				ezCommon.curd(addParme);
			});

			return true;
		},
	};
	module.exports = addNewData;
}); 