/**
 * @author 柯斌
 * @desc 页面跳转
 * @date 2015-06-29
 */

define(function(require, exports, module) {
	var logicRun = {
		initExe : function(herf) {
			pageJump.pageId = herf;
		},

		getLogicRelust : function(json) {
			return ["obj['initExe'](", json["value"], ")"].join("");
		}
	};
	var pageJump = {
		/* *
		 *页面跳转
		 */
		pageJump : function($ctrlObj, cJson) {
			$ctrlObj = $ctrlObj.length ? $ctrlObj : $("[isSubmit]");
			var pageId = cJson["ctrl"]["pageId"];
			var value = cJson["whereJump"], ctrlId = $ctrlObj.attr("name"), jumpType = cJson["ctrl"]["linkType"];
			var dataQuery = [], jumpFlag = true;
			if (cJson["logic"]) {
				var logicJson = cJson["logic"];
				var logic = new Logic().run(logicRun, logicJson);
				if(pageJump.pageId){
					pageId = pageJump.pageId;
				}
			}

			if (jumpType == "outerLink") {
				if ("undefined" != typeof SITECONFIG.temp_siteId) {
					if (!pageId.match(/http/g)) {
						pageId = "http://" + pageId;
					}
					window.location.href = pageId;
				}
			} else {
				if (value != "norwnere") {
					var queryId = value["queryId"], dataType = value["dataType"], valueType = value["valueType"], queryField = value["queryField"], conditionFlag = value["conditionFlag"], queryValue = value["conValue"];
					var jsonParam = {
						"type" : "select",
						"queryId" : queryId,
						"form" : ezCommon.getCurrFormValueList(),
						"where" : "",
						"mask" : false //是否有子查询 无
					};
					if (dataType == "systemParam") {
						queryValue = ezCommon.getSysParam(valueType);
					} else if (dataType == "rowDataNull") {
						dataQuery = ezCommon.curd(jsonParam);
						if (conditionFlag == "=") {
							if (dataQuery.length > 0) {
								jumpFlag = false;
							}
						} else if (conditionFlag == "!=") {
							if (dataQuery.length <= 0) {
								jumpFlag = false;
							}
						}
					} else if (dataType == "constant") {

					}

					if (dataType == "systemParam") {
						queryValue = ezCommon.getSysParam(valueType);
					}

					if (dataType != "rowDataNull") {
						jsonParam["where"] = {
							"fieldName" : queryField,
							"fieldValue" : queryValue,
							"arith" : "neq",
							"logic" : ""
						}, jsonParam["mask"] = true;
						dataQuery = ezCommon.curd(jsonParam);
					}
					if (dataQuery.length && queryField == "countNum") {
						if (dataQuery[0]["countNum"] != queryValue) {
							jumpFlag = false;
						}
					}

				}

				var paramIem = "";
				$.each(cJson["paramItem"], function(key, value) {
					if (value) {
						var paramType = value["paramValue"][ctrlId]["paramType"], paramVal = value["paramValue"][ctrlId]["paramVal"], paramName = value["paramName"], paramCtrl = value["paramValue"][ctrlId]["ctrl"];
						if (paramType == "constant") {
							paramVal = paramVal ? paramVal : 0;
							paramIem += "/" + paramName + "/" + paramVal;
						} else if (paramType == "form") {
							var val = 0;
							if (paramCtrl.indexOf("DROPDOWN") > 0) {
								val = $("[name='" + paramCtrl + "']").find("option:selected").val();
							} else if (paramCtrl.indexOf("TEXTBOX") > 0 || paramCtrl.indexOf("TEXTAREA")) {
								val = $("[name='" + paramCtrl + "']").val();
							}
							paramIem += "/" + paramName + "/" + val;
						} else if (paramType == "currDataID") {
							var rowId = $ctrlObj.closest("[rowId]").attr("rowId"), val = 0;
							if (rowId) {
								val = rowId;
							}
							paramIem += "/" + paramName + "/" + val;
						} else if (paramType == "controls") {
							var $obj = $("[ctrlid='" + paramCtrl + "']", $(".selectedForm"));
							val = $obj.find("div:first").text();
							paramIem += "/" + paramName + "/" + val;
						} else if (paramType.match(/compLogic/g) || paramType.match(/customComponent/)) {
							var rowH = $ctrlObj.closest("[rowid]");
							val = rowH.find("[fieldname='" + paramCtrl + "'] .fieldContent").html();
							paramIem += "/" + paramName + "/" + val;
						}
					}
				});
				if (pageId && jumpFlag) {
					var pageName = "preview";
					if (isWeiXin()) {
						pageName = "index";
					}
					var shareCodeArry = location.href.split("/"), shareCode = "", layId = "", layParam = "";
					for (var i = 0; i < shareCodeArry.length; i++) {
						if (shareCodeArry[i] == "shareCode") {
							shareCode = shareCodeArry[i + 1];
						}
						if (shareCodeArry[i] == "layId") {
							//layId = shareCodeArry[i + 1];
							layId = typeof (wxMain) != "undefined" ? wxMain.zpID : "";
						}
					}
					if (layId) {
						layParam = "/layId/" + layId;
					}
					if (shareCode) {
						window.location.href = encodeURI(SITECONFIG.URLPATH + "/" + pageName + "/siteId/" + SITECONFIG.temp_siteId + "/pageId/" + pageId + paramIem + "/shareCode/" + shareCode + layParam + "/ctrlId/" + ctrlId);
					} else if ("undefined" != typeof SITECONFIG.temp_siteId) {
						window.location.href = encodeURI(SITECONFIG.URLPATH + "/" + pageName + "/siteId/" + SITECONFIG.temp_siteId + "/pageId/" + pageId + paramIem + "/ctrlId/" + ctrlId);
					}
				}
			}
			return true;
		},
	};
	module.exports = pageJump;
});
