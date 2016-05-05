/**
 * 数据还原
 * @author  唐苗
 */
var dataRestore = {
	//过滤条件结构
	filterhtml : function() {
		var liHtml = '<li class="with_1"><span class="setAndOr r1"><select class="orWhere"><option value="and">并且</option><option value="or">或者</option></select></span><span class="fieldTit r1"></span><span class="setRelation r1"> <select class="relation"><option value="0">等于 </option><option value="1">不等于 </option><option value="2">大于</option><option value="3">小于 </option><option value="4">包含</option><option value="5">不包含</option><option value="6">小于等于 </option> <option value="7">大于等于</option> <option value="8">匹配</option></select></span><span class="setVal r1"><input class="form-control input-sm condVal" type="text" style="" dataType="INPUT"></span><span class="glyphicon glyphicon-plus add-condition"></span><ul class="withFieldFilter"></ul></li>';
		return liHtml;
	},
	//获取左边数据源JSON数据
	getDataSourcesJson : function() {
		var dataSourcesJson = dataFilterNew.dataSourcesJson;
		if (dataSourcesJson.length > 0) {
			return dataSourcesJson;
		} else {
			return filterDataOperation.getAllQueryDataSources();
		}
	},
	//点击左侧菜单还原第一步
	firstStep : function($selectedForm, $selectData) {
		var dataSources = dataRestore.getDataSourcesJson();
		var id = $selectData.attr("querierId");
		$selectedForm.find(".formItem").removeClass("selectedForm");
		$.each(dataSources, function(key, val) {
			var querierId = val["id"];
			if (querierId == id) {
				$.each(val["querierConfig"], function(key, val) {
					$selectedForm.find(".formList button[formId=" + val["formId"] + "]").addClass("selectedForm");
				});
			}
		});

	},
	//下一步还原第二步
	twoStep : function($selectedField, $selectData) {
		var dataSources = dataRestore.getDataSourcesJson();
		var id = $selectData.attr("querierId");
		$.each(dataSources, function(key, val) {
			var querierId = val["id"];
			if (querierId == id) {
				$.each(val["querierConfig"], function(key, val) {
					$.each(val["selectedField"], function(key, val) {
						$selectedField.find(".formFields button[fieldId=" + val["fieldId"] + "]").addClass("selectedField");
					});
				});
			}
		});
	},
	//下一步还原第五步
	fiveStep : function($selectFieldWhere, $selectData) {
		var dataSources = dataRestore.getDataSourcesJson();
		var id = $selectData.attr("querierId");
		$.each(dataSources, function(key, val) {
			var querierId = val["id"];
			if (querierId == id) {
				$.each(val["querierConfig"], function(key, val) {
					$.each(val["where"], function(key, val) {
						$selectFieldWhere.find(".formFields button[fieldId=" + val["fieldId"] + "]").addClass("selectedField");
					});
				});
			}
		});
	},
	//下一步还原第六步
	sixStep : function($selectFieldWhere, $selectData) {
		var dataSources = dataRestore.getDataSourcesJson();
		var id = $selectData.attr("querierId");
		$.each(dataSources, function(key, val) {
			var querierId = val["id"];
			if (querierId == id) {
				$.each(val["querierConfig"], function(key, val) {
					$.each(val["where"], function(key, val) {
						if (val["minus"] == "true") {
							var $parLi = $(".setWhere").find("li[fieldId=" + val["fieldId"] + "]:last");
							var liFormId = $parLi.attr("formid"), liFieldid = $parLi.attr("fieldid");
							var liHtml = dataRestore.filterhtml();
							$addselect = $(liHtml);
							$addselect.attr("formid", liFormId);
							$addselect.attr("fieldid", liFieldid);
							$addselect.attr("minus", true);
							$parLi.after($addselect);
							$addselect.removeClass("with_1").addClass("setField");
							$addselect.find(".withFieldFilter").remove();
							$addselect.find(".add-condition").removeClass("add-condition glyphicon-plus").addClass("min-condition glyphicon-minus");
							var fieldTitName = $parLi.find(".fieldTit:first").text();
							$addselect.find(".fieldTit").text(fieldTitName);
							var $that = $addselect;
							var $condVal = $that.find(".condVal");
							$condVal.attr("dataType", val["dataType"]);
							$condVal.val(val["value"]);
							$that.find(".orWhere option[value=" + val["orWhere"] + "]").attr("selected", "selected");
							var relationVal = dataRestore.getRelationVal(val["relation"]);
							$that.find(".relation option[value=" + relationVal + "]").attr("selected", "selected");
							$that.attr("minus", val["minus"]);
						} else {
							var $that = $(".setWhere").find("li[fieldId=" + val["fieldId"] + "]");
							var $condVal = $that.find(".condVal");
							$condVal.attr("dataType", val["dataType"]);
							$condVal.val(val["value"]);
							$that.find(".orWhere option[value=" + val["orWhere"] + "]").attr("selected", "selected");
							var relationVal = dataRestore.getRelationVal(val["relation"]);
							$that.find(".relation option[value=" + relationVal + "]").attr("selected", "selected");
							$that.attr("minus", val["minus"]);
						}
					});
				});

			}
		});
		setDataWhere.seeEffectEvent();
		setDataWhere.addDelWhere();
		setDataWhere.selectWhereVal();
		setDataWhere.getPageParam();
	},
	getRelationVal : function(key) {
		var val = "=";
		switch(key) {
			case "=":
				val = "0";
				break;
			case "<>":
				val = "1";
				break;
			case ">":
				val = "2";
				break;
			case "<":
				val = "3";
				break;
			case "IN":
				val = "4";
				break;
			case "NOTIN":
				val = "5";
				break;
			case "<=":
				val = "6";
				break;
			case ">=":
				val = "7";
				break;
			case "like":
				val = "8";
				break;

		}
		return val;
	},
};
