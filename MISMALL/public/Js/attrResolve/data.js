/**
 * @author 柯斌
 * @desc 数据属性解析
 */

define(function(require, exports, module) {
	var data = {
		/**
		 * 数据
		 * @param     json     dataAttr       数据属性json对象
		 * @param     object   $ctrlHtml      控件基本结构
		 */
		data : function(dataAttr, $ctrlHtml) {
			var ctrlType = $ctrlHtml.attr("ctrl-type");
			$.each(dataAttr, function(key, value) {
				if (value["type"] == "systemParam") {
					var sysType = value["value"]["id"];
					var sysVal = ezCommon.getSysParam(sysType);
					if (sysType == "USERNAME") {
						if (sysVal == "" && typeof (userName) != "undefined") {
							sysVal = userName;
						}
					}
					value["value"]["value"] = sysVal;
					$("input,textarea", $ctrlHtml).val(value["value"]["value"]);
				} else if (value["type"] == "date") {
					var now = new Date();
					var timeValue = "";
					if (!value["value"]["value"])
						return;
					if (!value["value"]["dataformat"]) {
						value["value"]["dataformat"] = "yyyy-mm-dd hh:ii:ss";
					}
					switch (value["value"]["id"]) {

						case "assignDate":
							timeValue = value["value"]["value"];
							break;
						case "currDate":
							timeValue = new Date().format(value["value"]["dataformat"]);
							break;
						case "beforeDate":
							timeValue = Date.parse(now) - parseInt(value["value"]["value"]) * 24 * 60 * 60 * 1000;
							timeValue = new Date(timeValue).format(value["value"]["dataformat"]);
							break;
						case "afterDate":
							timeValue = Date.parse(now) + parseInt(value["value"]["value"]) * 24 * 60 * 60 * 1000;
							timeValue = new Date(timeValue).format(value["value"]["dataformat"]);
							break;
						case "user-defined":
							timeValue = value["value"]["value"];
							break;
					}
					$("input,textarea", $ctrlHtml).val(timeValue);

				} else if (value["type"] == "dataSource") {
						var queryId = value["value"]["id"], field = null, sql = '';
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
						var val = "";
						if (objIsnull(filedList)) {
							if(ctrlType == "DROPDOWN"){
								var temp = [];
								$.each(filedList,function(k,v){
										temp.push("<option filed='");	
										temp.push(value["value"]["queryField"]);	
										temp.push("' value='");	
										temp.push(v[value["value"]["queryField"]]);	
										temp.push("'>");	
										temp.push(v[value["value"]["queryField"]]);	
										temp.push("</option>");	
								});
								
								val = temp.join("");
								$("select", $ctrlHtml).empty().append(html_decode(val));
							}else{
								val = filedList[0][value["value"]["queryField"]];
								$("input,textarea", $ctrlHtml).val(html_decode(val));
							}
							
						}
						
				} else if (value["type"] == "pageParam") {
					var url = decodeURI(location.href);
					var urlParamArray = url.split("/"), ctrlId = "";
					for (var i = 0; i < urlParamArray.length; i++) {
						if (urlParamArray[i] == "ctrlId") {
							ctrlId = urlParamArray[i + 1];
						}
					}
					var toPageId = value["value"]["toPageId"], formPageId = value["value"]["formPageId"];
					if ( typeof (pageId) == "undefined") {
						pageId = $(".selectedForm").parent().attr("id");
					}
					var paramJson = ezCommon.getLinkParam(toPageId, formPageId);
					$.each(paramJson, function(keys, values) {
						$.each(values["linkData"], function(k, v) {
							if (v["paramName"] == value["value"]["id"]) {
								if (v["paramValue"]) {
									if (v["paramValue"][ctrlId]) {
										var paramType = v["paramValue"][ctrlId]["paramType"], paramCtrl = v["paramValue"][ctrlId]["ctrl"], val = "";
										if (paramType == "constant") {
											val = v["paramValue"][ctrlId]["paramVal"];
										} else if (paramType == "form") {

											if (paramCtrl.indexOf("DROPDOWN") > 0) {
												val = $("[name='" + paramCtrl + "']").find("option:selected").val();
											} else if (paramCtrl.indexOf("TEXTBOX") > 0 || paramCtrl.indexOf("TEXTAREA")) {
												val = $("[name='" + paramCtrl + "']").val();
											}
											for (var i = 0; i < urlParamArray.length; i++) {
												if (urlParamArray[i] == v["paramName"]) {
													val = URLDecode(urlParamArray[i + 1]);
												}
											}

										} else if (paramType == "controls") {
											var $obj = $("[ctrlid='" + paramCtrl + "']", $(".selectedForm"));
											val = $obj.find("div:first").text();
											for (var i = 0; i < urlParamArray.length; i++) {
												if (urlParamArray[i] == v["paramName"]) {
													val = URLDecode(urlParamArray[i + 1]);
												}
											}
										} else if (paramType == "currDataID") {
											var rowId = $ctrlHtml.closest("[rowid]").attr("rowid"), val = 0;
											if (rowId) {
												val = rowId;
											}
											for (var i = 0; i < urlParamArray.length; i++) {
												if (urlParamArray[i] == v["paramName"]) {
													val = URLDecode(urlParamArray[i + 1]);
												}
											}
										} else if (paramType.match(/compLogic/g) || paramType.match(/customComponent/)) {
											for (var i = 0; i < urlParamArray.length; i++) {
												if (urlParamArray[i] == v["paramName"]) {
													val = URLDecode(urlParamArray[i + 1]);
												}
											}
											
										}
									}
								}
								
								if (ctrlType == "TEXTBOX") {
									$("input", $ctrlHtml).val(val);
								} else if (ctrlType == "DROPDOWN") {
									$("select", $ctrlHtml).empty().append('<option value="' + val + '">' + val + '</option>');
								}
							}
						});
					});

				} else if (value["type"] == "randomNum") {
					$("input,textarea", $ctrlHtml).val(new Date().getTime() + numRand("", true));
				} else {
					$("input,textarea", $ctrlHtml).val(value["value"]["value"]);
				}

				$("input", $ctrlHtml).attr({
					"valueType" : value["value"]["id"],
					"dataType" : value["type"]
				});
				if (value["type"] == "dataSource") {
					$("input", $ctrlHtml).attr("filed", value["value"]["queryField"]);
				}
			});
		},
	};

	/**
	 * 
     * @param String key 
     * @desc 根据key值在URL上查找所对应的值
	 */
	function getUrlValue(key) {
		var urlParamArray = url.split("/");
		for (var i = 0; i < urlParamArray.length; i++) {
			if (urlParamArray[i] == key) {
				return  URLDecode(urlParamArray[i + 1]);
			}
		}
		
		return false;
	}


	module.exports = data;
});
