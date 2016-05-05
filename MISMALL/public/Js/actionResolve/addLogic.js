/**
 * @author 柯斌
 */

define(function(require, exports, module) {
	var addLogic = {
		addLogic : function($ctrlObj, cJson) {
			new Logic().run({
				initExe : function(actionType, json) {
					json = JSON.parse(json);
					$.each(json, function(k, v) {
						json = v;
					});
					require.async(SITECONFIG.PUBLICPATH + "/Js/actionResolve/" + actionType + ".js", function(e) {
						e[actionType]($ctrlObj, json);
					});
				},

				getLogicRelust : function(json) {
					var actionType = json["actionType"], actionJson = JSON.stringify(json["json"]);
					return ["initExe('", actionType, "','", actionJson, "');"].join("");
				},

				getConditionResult : function(json) {
					var value = json["value"], type = json["type"], valueType = json["valueType"];
					if (type == "systemParam") {
						value = ezCommon.getSysParam(valueType);
					} else if (type == "form") {
						value = $("[name='" + valueType + "']").val();

					} else if (type == "dataSource") {
						var queryId = valueType, field = null, sql = '';
						var url = decodeURI(location.href);
						var urlParamArray = url.split("/"), layId = "";
						for (var i = 0; i < urlParamArray.length; i++) {
							if (urlParamArray[i] == "layId") {
								layId = urlParamArray[i + 1];
							}
						}
						var jsonParam = {
							"type" : "select",
							"queryId" : queryId,
							"form" : ezCommon.getCurrFormValueList(),
							"layId" : layId,
							"where" : "",
							"mark" : false
						};
						var filedList = null;
						if (ezCommon.recordQueryId[queryId]) {
							filedList = ezCommon.recordQueryId[queryId];
						} else {
							filedList = ezCommon.curd(jsonParam);
							ezCommon.recordQueryId[queryId] = filedList;
						}
						if (objIsnull(filedList)) {
							value = filedList[0][json["field"]];
						}
					}
					if (isNaN(value)) {
						value = '"' + value + '"';
					} else {
						value = parseFloat(value);
					}

					return value;
				}
			}, cJson["ctrl"]["logicJson"]);

			return true;
		}
	};

	


	module.exports = addLogic;
});
