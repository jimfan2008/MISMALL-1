/**
 * @author 柯斌
 * @desc 生成二维码
 * @date 2015-06-29
 */
define(function(require, exports, module) {
	var generatedQrcode = {
		/*
		 *生成二维码
		 */
		generatedQrcode : function($ctrlObj, cJson) {
			$ctrlObj = $ctrlObj.length ? $ctrlObj : $("[isSubmit]");
			var pageId = "";
			var value = cJson["whereJump"], ctrlId = $ctrlObj.attr("name");
			var dataQuery = [], jumpFlag = true;
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
				} else if (dataType == "") {

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
				}
				dataQuery = ezCommon.curd(jsonParam);

			}

			$.each(cJson["ctrl"], function(key, value) {
				if (value) {
					pageId = value;
				}
			});

			var paramIem = "";
			$.each(cJson["paramItem"], function(key, value) {
				if (value) {
					var paramType = value["paramValue"][ctrlId]["paramType"], paramVal = value["paramValue"][ctrlId]["paramVal"], paramName = value["paramName"], paramCtrl = value["paramValue"][ctrlId]["ctrl"];
					if (paramType) {
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
						} else if (paramType.match(/compLogic/g)) {
							var rowH = that.closest("[rowid]") || that;
							val = rowH.find("[fieldname='" + paramCtrl + "'] .fieldContent").html();
						}

					}
				}
			});
			if (pageId && jumpFlag) {
				var pageName = "preview";
				if (isWeiXin()) {
					pageName = "index";
				}
				var url = decodeURI(location.href), shareCodeArry = url.split("/"), shareCode = "", layId = "";
				for (var i = 0; i < shareCodeArry.length; i++) {
					if (shareCodeArry[i] == "shareCode") {
						shareCode = shareCodeArry[i + 1];
					}
					if (shareCodeArry[i] == "layId") {
						//layId = shareCodeArry[i + 1];
						layId = typeof (wxMain) != "undefined" ? wxMain.zpID : "";
					}
				}
				if (shareCode) {
					URL = URLPATH + "/" + pageName + "/siteId/" + temp_siteId + "/pageId/" + pageId + paramIem + "/shareCode/" + shareCode + "/ctrlId/" + ctrlId;
				} else if ("undefined" != typeof temp_siteId) {
					URL = URLPATH + "/" + pageName + "/siteId/" + temp_siteId + "/pageId/" + pageId + paramIem + "/ctrlId/" + ctrlId;
				}

				$(".exist").text("");
				$(".selectedForm .Qrcode").find("img").attr("src", SITECONFIG.APPPATH + "/Index/qrcode?url=" + URL);
			}
			return true;
		},
	};
	module.exports = generatedQrcode;
});
