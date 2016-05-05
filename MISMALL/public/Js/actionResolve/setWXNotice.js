/**
 * @author 柯斌
 * @desc 微信通知
 * @date 2015-06-29
 */
define(function(require, exports, module) {
	var setWXNotice = {
		/**
		 *微信通知
		 */
		setWXNotice : function($ctrlObj, cJson) {
			if (cJson) {
				var ctrl = cJson["ctrl"];
				var ctrlId = $ctrlObj.attr("name");
				if (ctrlId) {
					var proJson = ctrl[ctrlId];
					var proType = proJson["proType"];
					if (proType) {
						var proJsonData = proJson["proJson"];
						var paramItem = proJson["paramItem"];
						$.each(proJsonData, function(k, v) {
							var dataType = v["dataType"];
							var inputVal = v["inputVal"];
							if (dataType == "form") {
								var valueType = v["valueType"];
								var val = $("form").find("[name='" + valueType + "']").val();
								proJsonData[k]["inputVal"] = val;
							}
						});

						//参数
						var paramIem = "";
						$.each(paramItem, function(key, value) {
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
										paramIem += "/" + paramName + "/" + val;
									}

								}
							}
						});
						var pageId = proJson["pageId"];
						var data = {};

							data["siteId"] = SITECONFIG.SITEID ;
							if (pageId == "0") {
								proJsonData["proRemark"] = "";
							} else {
								proJsonData["proRemark"] = "/Site/Wechat/index/siteId/" + SITECONFIG.SITEID + "/pageId/" + pageId + paramIem + "/ctrlId/" + ctrlId;
							}

							data["proJsonData"] = JSON.stringify(proJson);
							$.ajax({
								type : "POST",
								url : SITECONFIG.ROOTPATH + "/Qywx/Project/sendWechatPushMessage",
								data : data,
								success : function(result) {
									console.log(result);
								}
							});
					}
				}
			}
			return true;
		},
	};
	module.exports = setWXNotice;
});
