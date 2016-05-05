/**
 * @author 柯斌
 * @desc 刪除数据
 * @date 2015-06-29
 */
define(function(require, exports, module) {
	var deleteData = {
		/**
		 * 刪除数据
		 */
		deleteData : function($ctrlObj, cJson) {
			var rowId = $ctrlObj.closest("[rowId]").attr("rowId");
			$.each(cJson["ctrl"], function(key, value) {
				var formId = value["formId"], tableName = value["tableName"], sql = "";
				values = [], fieldList = [], whereJson = [];
				$.each(value["field"], function(k, v) {
					var fieldName = v["fieldName"], valueType = v["valueType"], dataType = v["dataType"], fieldValue = "";
					fieldList.push(fieldName);
					if (dataType == "constant") {

						values.push('"' + valueType + '"');
						fieldValue = valueType;

					} else if (dataType == "form") {

						var $obj = $("[ctrlId='" + valueType + "']", $(".selectedForm")), ctrlType = $obj.attr("ctrlType");
						if (ctrlType == "TEXTBOX") {
							values.push('"' + $obj.find(".TEXTBOX").val() + '"');
							fieldValue = $obj.find(".TEXTBOX").val();
						} else if (ctrlType == "DROPDOWN") {
							values.push('"' + $obj.find("select option:selected").html() + '"');
							fieldValue = $obj.find(".select option:selected").html();
						} else if (ctrlType == "TEXTAREA") {
							values.push('"' + $obj.find("textarea").val() + '"');
							fieldValue = $obj.find("textarea").val();
						}

					} else if (dataType == "systemParam") {

						if (valueType == "USERNAME") {
							values.push('"' + ezCommon.getSysParam(valueType) + '"');
							fieldValue = ezCommon.getSysParam(valueType);
						} else if (valueType == "SysDBDateTime") {
							values.push(new Date().format("yyyy-mm-dd hh:ii:ss"));
							fieldValue = new Date().format("yyyy-mm-dd hh:ii:ss");
						}

					} else if (dataType == "currDataID") {
						values.push(rowId);
						fieldValue = rowId;

					} else if (dataType.match(/compLogic/g)) {
						var fieldValueArray = [];
						var content = $ctrlObj.closest("[rowId]").find("[fieldname='" + valueType + "']").find(".fieldContent").text();
						fieldValueArray.push(content);
						$("[ctrlid = " + v['dataType'] + "]").find(".checked").find("input[type='checkbox']:checked").each(function(m, n) {
							var content = $(this).parents(".checked").next().find("[fieldname = " + v['valueType'] + "]").find(".fieldContent").text();
							fieldValueArray.push(content);
						});
						fieldValue = fieldValueArray.join(",");
					}
					whereJson.push({
						"fieldName" : fieldName,
						"fieldValue" : fieldValue,
						"logic" : "",
						"arith" : "eq"
					});
				});
				var deleteParam = {
					"type" : "delete",
					"tableName" : tableName,
					"field" : {},
					"where" : whereJson
				};
				ezCommon.curd(deleteParam);
			});

			return true;
		},
	};
	module.exports = deleteData;
});
