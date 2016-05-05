/**
 * @author 柯斌
 * @desc 自动填充
 * @date 2015-06-29
 */
define(function(require, exports, module) {
	var autoFill = {
			autoFill : function($ctrlObj, cJson) {
				var ctrl = cJson["ctrl"];
				//判断该控件是否在组建内
				$.each(ctrl, function(k, v) {
					$formObj = $("[name='" + k + "']");
					if ($ctrlObj.attr("name") == k) {
						$formObj = $ctrlObj;
					}
					var dataType = v["dataType"], filed = v["filed"];
					if (dataType == "constant") {
						if (k.indexOf("TEXTBOX") == 0) {
							$formObj.val(v["value"]);
						} else if (k.indexOf("BUTTON") == 0) {
							$formObj.text(v["value"]);
						} else if (k.indexOf("DROPDOWN") == 0) {
							if (!$formObj.find("option[value=" + v['value'] + "]").text())
								$formObj.append('<option value="' + v["value"] + '" selected = "selected">' + v["value"] + '</option>');
						} else if (k.indexOf("REMARK") == 0) {
							$formObj.val(v["value"]);
						}
					} else if (dataType == "dataSource") {
						var queryId = v["queryId"], queryData = null;
						console.log(v);
						var jsonParam = {
							"type" : "select",
							"queryId" : queryId,
							"form" : ezCommon.getCurrFormValueList(),
							"where" : "",
							"mark" : false
						};
						queryData = ezCommon.curd(jsonParam);
						if (objIsnull(queryData)) {
							if (k.indexOf("DROPDOWN") >= 0) {
								var $select = $formObj.empty();
								$.each(queryData, function(q_k, q_val) {
									$.each(q_val, function(q_k2, q_val2) {
										if (q_k2 == filed) {
											$select.append('<option value="' + q_val2 + '" field="' + filed + '">' + q_val2 + '</option>');
										}
									});
								});
							} else {

								if (queryData[0]) {
									var data = queryData[0];
									$formObj.val(data[filed]);
									if ($formObj.find("REMARK").size()) {
										$formObj.val(data[filed]);
									}
								}
							}
						}

					} else if (dataType == "systemParam") {
						var sys = ezCommon.getSysParam(v["valueType"]);
						$formObj.val(sys);
					}else if(dataType == "randomNum"){
						$formObj.val(new Date().getTime() + numRand("", true));
					}
				});
				return true;
			},
	};
	
	module.exports =  autoFill;
});