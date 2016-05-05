/**
 * @author 柯斌
 * @desc 数据更新
 * @date 2015-06-29
 */
define(function(require, exports, module) {
	var componentUpdateData = {
		/**
		 *数据更新
		 *
		 * */
		componentUpdateData : function($ctrlObj, cJson) {
			var rowId = $ctrlObj.closest("[rowId]").attr("rowId");
			$.each(cJson["ctrl"], function(key, value) {
				var sql = "", where = "", whereJson = [];
				$.each(value["whereJson"], function(k, v) {
					var whereFieldValue = "";
					if (v["whereDataType"] == "currDataID") {
						whereFieldValue = rowId;
						whereJson.push({
							"fieldName" : v["whereField"],
							"fieldValue" : whereFieldValue,
							"logic" : "",
							"arith" : "eq"
						});
					} else if (v["whereDataType"] == "form") {
						var inputCtrlType = v["inputCtrlType"], inputCtrlId = v["inputCtrlId"];
						if (inputCtrlType == "DROPDOWN") {
							whereFieldValue = $("[ctrlid='" + inputCtrlId + "']").find("select option:selected").html();
						} else if (inputCtrlType == "TEXTBOX") {
							whereFieldValue = $("[ctrlid='" + inputCtrlId + "']").find("input").val();
						} else if (inputCtrlType == "TEXTAREA") {
							whereFieldValue = $("[ctrlid='" + inputCtrlId + "']").find("textarea").val();
						}
						whereJson.push({
							"fieldName" : v["whereField"],
							"fieldValue" : whereFieldValue,
							"logic" : "",
							"arith" : "eq"
						});
					} else if (v["whereDataType"] == "systemParam") {
						if (valueType == "USERNAME") {
							whereFieldValue = ezCommon.getSysParam(valueType);
						} else if (valueType == "SysDBDateTime") {
							whereFieldValue = new Date().format("yyyy-mm-dd hh:ii:ss");
						}
						whereJson.push({
							"fieldName" : v["whereField"],
							"fieldValue" : whereFieldValue,
							"logic" : "",
							"arith" : "eq"
						});
					} else if (v["whereDataType"] == "constant") {
						whereFieldValue = v["whereValue"];
						whereJson.push({
							"fieldName" : v["whereField"],
							"fieldValue" : whereFieldValue,
							"logic" : "",
							"arith" : "eq"
						});
					} else if (v["whereDataType"].match(/compLogic/g)) {
						whereFieldValue = $ctrlObj.closest("[rowId]").find("[fieldname='" + v['whereValueType'] + "'] .fieldContent").text();
						whereJson.push({
							"fieldName" : v["whereField"],
							"fieldValue" : whereFieldValue,
							"logic" : "",
							"arith" : "eq"
						});
					}
				});
				var autoType = "", updataFieldValue = "";
				if (value["valueType"] == "zizeng") {
					autoType = "add";
					updataFieldValue = value["updataFieldValue"];
				} else if (value["valueType"] == "zijian") {
					autoType = "dec";
					updataFieldValue = value["updataFieldValue"];
				} else if (value["valueType"] == "form") {
					var inputCtrlType = value["inputCtrlType"], inputCtrlId = value["inputCtrlId"], updataFieldValue = "";
					if (inputCtrlType == "DROPDOWN") {
						updataFieldValue = $("[ctrlid='" + inputCtrlId + "']").find("select option:selected").val();
					} else if (inputCtrlType == "TEXTBOX") {
						updataFieldValue = $("[ctrlid='" + inputCtrlId + "']").find("input").val();
					} else if (inputCtrlType == "TEXTAREA") {
						updataFieldValue = $("[ctrlid='" + inputCtrlId + "']").find("textarea").val();
					}
				} else {
					var updataFieldValue = value["updataFieldValue"];
				}
				var updateP = {
					"type" : "update",
					"tableName" : value["tableName"],
					"field" : [{
						fieldName : value["updataField"],
						"fieldValue" : updataFieldValue
					}],
					"autoType" : autoType,
					"where" : whereJson
				};
				ezCommon.curd(updateP);
			});
			return true;
		},
	};
	module.exports = componentUpdateData;
});
