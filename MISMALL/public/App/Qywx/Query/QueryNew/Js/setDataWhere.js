/**
 * 设置数据源过滤条件
 * 条件结构的添加，条件操作，事件，验证
 * @author 皮振华
 */
var setDataWhere = {
	//并且或者结构
	setAndOr : function() {
		return '<span class="setAndOr r1"><select class="orWhere"><option value="and">并且</option><option value="or">或者</option> </select></span>';
	},
	//条件结构
	setRelation : function() {
		return ' <span class="setRelation r1"> <select class="relation"><option value="0">等于 </option><option value="1">不等于 </option><option value="2">大于</option><option value="3">小于 </option><option value="4">包含</option><option value="5">不包含</option><option value="6">小于等于 </option> <option value="7">大于等于</option> <option value="8">匹配</option></select> </span>';
	},
	//赋值文本结构
	setVal : function() {
		return '<span class="setVal r1"><input class="form-control input-sm condVal" type="text" style="" dataType="INPUT"></span>';
	},
	//过滤条件结构
	filterhtml : function() {
		var liHtml = '<li class="with_1"><span class="setAndOr r1"><select class="orWhere"><option value="and">并且</option><option value="or">或者</option></select></span><span class="fieldTit r1"></span><span class="setRelation r1"> <select class="relation"><option value="0">等于 </option><option value="1">不等于 </option><option value="2">大于</option><option value="3">小于 </option><option value="4">包含</option><option value="5">不包含</option><option value="6">小于等于 </option> <option value="7">大于等于</option> <option value="8">匹配</option></select></span><span class="setVal r1"><input class="form-control input-sm condVal" type="text" style="" dataType="INPUT"></span><span class="glyphicon glyphicon-plus add-condition"></span><ul class="withFieldFilter"></ul></li>';
		return liHtml;
	},
	//读取过滤条件信息
	readSetWhereInfo : function(setDataJson) {
		console.log(JSON.stringify(setDataJson), 222222);
		if (setDataJson.length > 0) {
			var num = 0;
			var $setWhere = $("#setDataWhere").find(".setWhere").empty();
			var setFieldHTML = '<li class="setField"></li>';
			$.each(setDataJson, function(formK, formV) {
				var selectedField = formV["selectedField"], formId = formV["formId"], formName = formV["formName"];
				$.each(selectedField, function(fieldK, fieldV) {
					var fieldId = fieldV["fieldId"], fieldName = fieldV["fieldName"];
					var $setField = $(setFieldHTML);
					$setField.attr({
						"formId" : formId,
						"fieldId" : fieldId
					});
					if (num > 0) {
						$setField.append(setDataWhere.setAndOr());
					} else {
						$setField.append('<span class="setAndOr r1"> &nbsp;</span>');
					}
					$setField.append('<span class="fieldTit r1">' + formName + '.' + fieldName + '</span>');
					$setField.append(setDataWhere.setRelation());
					$setField.append(setDataWhere.setVal());
					$setField.append('<span class="glyphicon glyphicon-plus add-condition r1"></span>');
					$setField.append('<span class="noValue">*请先填写条件值</span>');
					$setWhere.append($setField);
					num++;
				});
			});
			setDataWhere.seeEffectEvent();
			setDataWhere.addDelWhere();
			setDataWhere.selectWhereVal();
			setDataWhere.getPageParam();
		}

	},
	//继续添加条件 删除条件
	addDelWhere : function() {
		//添加条件
		$("#setDataWhere").undelegate(".add-condition", "click").delegate(".add-condition", "click", function() {
			$control = $(this).parents("li").find("input");
			if ($control.val()) {
				$(this).parents("li").find(".noValue").hide();
				var $parLi = $(this).parents("li");
				var liFormId = $parLi.attr("formid"), liFieldid = $parLi.attr("fieldid");
				var liHtml = setDataWhere.filterhtml();
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
				setDataWhere.seeEffectEvent();
				setDataWhere.addDelWhere();
				setDataWhere.selectWhereVal();
				setDataWhere.getPageParam();
			} else {
				$(this).parents("li").find(".noValue").show();
			}
		});
		//删除条件
		$("#setDataWhere").undelegate(".min-condition", "click").delegate(".min-condition", "click", function() {
			$(this).parents("li.setField").remove();
		});
		//点击文本框隐藏提示
		$("#setDataWhere").undelegate(".setVal", "click").delegate(".setVal", "click", function() {
			$(this).parents("li").find(".noValue").hide();
		});

	},
	//获取网页链接参数
	getPageParam : function() {
		var formId = window.parent.ezCommon.formId;
		//var  formId =ezCommon.formId;
		if (formId) {
			var pageId = $('#' + formId, parent.document).parent().attr("id") ? $('#' + formId, parent.document).parent().attr("id") : null;
			setDataWhere.pageParamJson = ezCommon.getLinkParam(pageId);

		}
	},
	//查看效果事件
	seeEffectEvent : function() {
		$("#setDataWhere").find(".seeEffect").click(function() {
			setDataWhere.getFormFieldWhereJson();
		});
	},
	//获取表单，字段，条件JSON 合并
	getFormFieldWhereJson : function() {
		var selFieldJson = dataFilterNew.stepsJson["selectedField"];
		var jsonData = JSON.parse(JSON.stringify(selFieldJson));
		//为了不影响之前记录的JSON数据
		$.each(jsonData, function(key, val) {
			var formId = val["formId"];
			val["where"] = setDataWhere.getWhereJson(formId);
		});
		console.log(JSON.stringify(jsonData));
		return jsonData;
	},
	//获取对应表单下字段设置条件的JSON数据
	getWhereJson : function(formId) {
		var $setDataWhere = $("#setDataWhere");
		var $fieldWhere = $setDataWhere.find(".setField[formId='" + formId + "']");
		var len = $fieldWhere.length;
		var whereJson = [];
		if (len > 0) {
			$.each($fieldWhere, function() {
				var $that = $(this);
				var fieldId = $that.attr("fieldId");
				var $condVal = $that.find(".condVal");
				var dataType = $condVal.attr("dataType");
				var value = $condVal.val();
				var orWhere = $that.find(".orWhere").length > 0 ? $that.find(".orWhere option:selected").val() : "no";
				var relationVal = $that.find(".relation option:selected").val();
				var minusLogo = $that.attr("minus");
				relationVal = setDataWhere.getRelationVal(relationVal);
				switch(dataType) {
					case "INPUT":
						whereJson.push({
							"fieldId" : fieldId,
							"dataType" : dataType,
							"relation" : relationVal,
							"value" : value,
							"orWhere" : orWhere,
							"minus":minusLogo
						});
						break;
					case "SYSTEM":
						var fieldVal = $condVal.attr("fieldVal");
						whereJson.push({
							"fieldId" : fieldId,
							"dataType" : dataType,
							"relation" : relationVal,
							"value" : value,
							"orWhere" : orWhere,
							"fieldVal" : fieldVal,
							"minus":minusLogo
						});
						break;
					case "null":
						whereJson.push({
							"fieldId" : fieldId,
							"dataType" : dataType,
							"relation" : relationVal,
							"value" : value,
							"orWhere" : orWhere,
							"fieldVal" : fieldVal,
							"minus":minusLogo
						});
						break;
				}
			});
		}
		return whereJson;

	},
	//根据设置的条件查询出最新数据
	queryNewDataByWhere : function() {

	},
	//浮动层-选择过滤字段条件值
	selectWhereVal : function() {
		var $setDataWhere = $("#setDataWhere");
		var obj = "";
		$setDataWhere.find(".setWhere .condVal").unbind("click").click(function() {
			var $that = $(this);
			obj = $that;
			var left = $that.offset().left, top = $that.offset().top;
			var width = $that.width(), height = $that.height();
			$("#setFilterMenu").css({
				"top" : top - height - 10,
				"left" : left + width + height + 10
			}).show();
			setDataWhere.setSystem($that);
		});
		$("#setFilterMenu").hover(function() {
			$(this).show();
		}, function() {
			$(this).hide();
		});
		$("#setFilterMenu").find(".menu-item").hover(function() {
			$that = $(this);
			$that.find(".more-menu").show();

		}, function() {
			$that = $(this);
			$that.find(".more-menu").hide();
		});
		$("#setFilterMenu").find(".more-menu").hover(function() {
			$that = $(this);
			$that.show();

		}, function() {
			$that = $(this);
			$that.hide();
		});
		//页面数据
		$("#pageParamId").hover(function() {
			$("#paramItem").show();
			setDataWhere.showPageParamItem('obj');
			//setDataWhere.test();
		}, function() {
			$("#paramItem").hide();
		});
		
		//获取表单字段		
		$("#setFormCtrl").hover(function() {
			var formId = window.parent.ezCommon.formId;
			var $form =$('#' + formId, parent.document);
			if ($form.length > 0) {
				var ctrl = "", $ctrlid = $form.find(".imFormCtrl");
				if ($ctrlid.length > 0) {
					$ctrlid.each(function() {
						console.log($(this),$(this).text());
					var ctrlidCN = $(this).find(".fieldTitle ").text(), ctrlid = $(this).attr("ctrlid");			
					if(ctrlidCN !="编号"){
					ctrl += '<div class="menu-item" s_ctrlid="' + ctrlid + '" s_tit="' + ctrlidCN + '" >' + ctrlidCN + '</div>';
					}
					
					});
				} 
				
				$("#formCtrlList").empty().append(ctrl);
				$("#formCtrlList").find(".menu-item").unbind("click").click(function() {
					var s_ctrlid = $(this).attr("s_ctrlid"), s_tit = $(this).attr("s_tit");
					obj.attr({
						"ctrlid" : s_ctrlid,
						"dataType" : "form"
					}).val("表单中【" + s_tit + "】的值");
				});
			}
			$("#formCtrlList").show();
		}, function() {
			$("#formCtrlList").hide();
		});
		
		//空值
		$("#setNull").unbind("click").click(function() {
			obj.attr({
				"field" : "null",
				"dataType" : "null"
			}).val($(this).text());
		});

	},
	//系统变量
	setSystem : function($condVal) {
		$("#systemList").find(".menu-item").unbind("click").click(function() {
			var $that = $(this);
			var s_tit = $that.attr("s_tit"), s_type = $that.attr("s_type");
			$condVal.attr({
				"dataType" : "SYSTEM",
				"fieldVal" : s_type
			}).val("[" + s_tit + "]");
		});
	},
	getRelationVal : function(key) {
		var val = "=";
		switch(key) {
			case "0":
				val = "=";
				break;
			case "1":
				val = "<>";
				break;
			case "2":
				val = ">";
				break;
			case "3":
				val = "<";
				break;
			case "4":
				val = "IN";
				break;
			case "5":
				val = "NOTIN";
				break;
			case "6":
				val = "<=";
				break;
			case "7":
				val = ">=";
				break;
			case "8":
				val = "like";
				break;

		}
		return val;
	},
	/**
	 *显示当前页设置的参数
	 */

	showPageParamItem : function($condVal) {
		var paramJson = "";
		if (setDataWhere.pageParamJson) {
			paramJson = setDataWhere.pageParamJson;
		} else {
			var formId = ezCommon.controlLists[ezCommon.formId];
			if (formId) {
				var pageId = $('#' + formId, parent.document).parent().attr("id") ? $('#' + formId, parent.document).parent().attr("id") : null;
				paramJson = ezCommon.getLinkParam(pageId);
				setDataWhere.pageParamJson = paramJson;
			}
		}
		if (paramJson) {
			if (paramJson[0]) {
				$("#paramItem").empty();
				$.each(paramJson, function(k, val) {
					var linkData = val["linkData"];
					$.each(linkData, function(key, item) {
						$("#paramItem").append('<div class="menu-item param-item" fromPageID="' + val["fromPageID"] + '" paramVal="' + item["paramVal"] + '" paramName="' + item["paramName"] + '" paramType="' + item["paramType"] + '">' + item["paramKey"] + '</div>');
					});
				});
				$("#paramItem").find(".param-item").unbind("click").click(function() {
					var paramVal = $(this).attr("paramVal"), paramType = $(this).attr("paramType"), paramname = $(this).attr("paramname");
					$(".condVal").attr({
						"dataType" : "pageParam",
						"paramName" : paramname,
						"paramVal" : paramVal,
						"paramType" : paramType
					}).val($(this).text());
				});
			}
		}
	},
};
