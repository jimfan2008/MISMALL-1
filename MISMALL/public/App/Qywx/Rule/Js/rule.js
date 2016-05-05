$(function(){
	var setHeight = $(window).height() - 32;
	$(".mainLeft,.mainRight").height(setHeight);
	
	$(".inputField").val("");		
	
	$("#save").click(function(){
		$(".dataSetModal").modal("show");
		if(rule.ruleId){
			$(".ruleName").val(rule.ruleName).select();
		}
	});
	
	$("#exit").click(function(){
		if(confirm("数据尚未保存，确定退出？")){
			$(window.parent.document).find("#panelWin").remove();				
		}
	});
	
	rule.formJsonData = rule.getSearchFieldData();
	
	$(".inputField").each(function(){
		var _this = this;
		$(this).click(function(){
			$(this).select();
		});
		onValueChange(_this,function(){
			var keyWord = $(_this).val();
			$(_this).css("border","1px solid #ccc");
			$(".searchPanel").hide();
			
			if($.trim(keyWord).length){
				var searchResult_li = rule.showSearchResult(keyWord);
				$("ul",$(_this).next()).empty().append(searchResult_li);
				$(_this).next().show();
			}else{
				$("ul",$(_this).next()).empty();
				$(_this).next().hide();
			}
		});
	});
	
	var searchIdx = -1;
	$(".inputField").keydown(function(e){
		var kc = e.keyCode;
		if($(this).next().is(":visible")){
			var searchResult = $(this).next().find("li"),
				resultCount = searchResult.length;
			 if(kc == 38){
				searchIdx--;
				searchIdx = searchIdx < 0 ? resultCount - 1 : searchIdx;
			}else if(kc == 40){
				searchIdx++;
				searchIdx = searchIdx > resultCount - 1 ? 0 : searchIdx; 
			}else if(kc == 13){
				var $searchItem = searchResult.eq(searchIdx);
				rule.setSearchResult($searchItem);
			}
			searchResult.removeClass("selectResultItem");
			searchResult.eq(searchIdx).addClass("selectResultItem");
		}
	});
	
	$("body").on("click",".searchPanel li",function(e){
		rule.setSearchResult($(this));
	});
	
	rule.filterTextEvent();
	
	rule.setDataFilterWhere();
	
});

var rule = {
	ruleId : "",
	ruleName : "",
	pageParamJson : null, //记录当前页接收的参数json数据
	formJsonData : {},
	
	/**
	 * 将检索的结果显示到下拉面板中
	 */
	showSearchResult : function(keyWord){
		var searchJson = rule.formJsonData;
		var  sl = "";
		if(searchJson){
			var i = 0,TabLen = searchJson.length;
			for(; i < TabLen; i++){
				var fieldInfo = searchJson[i]["fieldInfo"],
					tableName = searchJson[i]["tableName"],
					tableTitle = searchJson[i]["tableTitle"];
					
				var fieldLen = fieldInfo.length,j = 0;
				for(; j < fieldLen;j++){
					var fieldTitle = fieldInfo[j]["fieldTitle"],
						fieldName = fieldInfo[j]["fieldName"];
					if(fieldTitle && fieldTitle.indexOf(keyWord) >= 0){
						sl += '<li><div class = "sFieldTitle" fieldName = "' + fieldName + '">' + fieldTitle + '</div><div class = "sTableTitle" tableName = "' + tableName + '" tableTitle = "' + tableTitle + '"><span class = "tti">来自表</span>：' + tableTitle + '</div></li>';
					}
				}
			}
		}else{
			sl += "<li>没有匹配到合适的信息</li>";
		}
		if(!sl)sl += "<li>没有匹配到合适的信息</li>";
		return sl;
	},
	
	/**
	 * 用户输入字段，自动匹配同名字段及所在的表，供用户选择
	 * @para fieldTitle string 用户输入的字段名称
	 * @return searchJson  匹配到的字段及表组成 的json对象
	 */
	getSearchFieldData : function(){
		var searchJson = null,
			tableListJson = rule.getFormListData();
		var i = 0; len = tableListJson.length,tableFieldJson = [];
		for(;i<len; i++){
			var tempJson = {"tableTitle":"","tableName":"","fieldInfo" : {}},
				tableId = tableListJson[i]["ID"];
				fieldJson = rule.getFormFieldsData(tableId);
			tempJson["tableTitle"] = tableListJson[i]["tableTitle"];
			tempJson["tableName"] = tableListJson[i]["tableName"];
			tempJson["fieldInfo"] = fieldJson;
			tableFieldJson.push(tempJson);
		}
		return tableFieldJson;
	},
	
	/**
	 * 获取当前站点或流程下的所有表单
	 */
	getFormListData : function(){
		var flowId = FLOWID ? FLOWID : 1,
			formListJson = null;
		_commonAjax({
			type : "POST",
			url : GROUPPATH + "/Query/getFlowDataTable",
			data : {"flowId" :flowId},
			processData : false,
			dataType : 'json',
			async : false,
			success : function(result) {
				if(result)
				formListJson = result;
			}
		});
		return formListJson;
	},
	
	/**
	 * 根据表单ID获取表单所有字段
	 */
	getFormFieldsData : function(formId){
		var fieldListJson = null;
		_commonAjax({
			type : "POST",
			processData : false,
			data : {
				"formId" : formId
			},
			url : APPPATH + "/FormData/getAFormFiledsInfo",
			dataType : 'json',
			async : false,
			success : function(r) {
				fieldListJson = r;
			}
		});
		return fieldListJson;
	},
	
	/**
	 * 筛选条件设置文本框事件
	 */
	filterTextEvent : function() {
		//表单控件
		var formId = window.parent.Global[window.parent.Global.ezType].formId,
			obj = "";
		$(".condValue").unbind("click").click(function() {
				obj = $(this);
			var position = obj.offset();
			var left = position["left"], top = position["top"],
				ctrlType = obj.attr("ctrlType");
			$("#setFilterMenu").css({
				"left" : left + obj.width(),
				"top" : top - obj.height() / 2 - 15
			}).show();
			if(ctrlType == "CCTime") {
				$("#setTimeList").show();
				$("#setSystem,#setFormCtrl,#setNull").hide();
				$("#setTimeList").find(".editNum").numeral();
				$("#setTimeList").find(".selectTime").unbind("click").click(function() {
					var s_type = $(this).attr("s_type"),
						s_tit = $(this).attr("s_tit");
					obj.attr({"field": 0, "timeNum":0, "dataType":s_type}).val(s_tit);
				});
				$("#setTimeList").find(".btnEditNum").unbind("click").click(function() {
					var parMenu = $(this).parents(".setTimeNum");
					var val = parMenu.find(".editNum").val();
					if(val != "") {
						var s_type = parMenu.attr("s_type"),
						s_tit = parMenu.attr("s_tit");
						s_tit = s_tit.replace(/n/, val);
						obj.attr({"field": 0,"timeNum":val, "dataType":s_type}).val(s_tit);
					}
				});
			}else {
				$("#setTimeList").hide();
				$("#setSystem,#setFormCtrl,#setNull").show();
				$("#setSystem").hover(function(){
					$("#systemList").show();
				},function(){
					$("#systemList").hide();
				});
				$("#setSystem").find(".menu-item").unbind("click").click(function() {
					var s_type = $(this).attr("s_type"),
						s_tit = $(this).attr("s_tit");
					obj.attr({"field": s_type, "dataType":"system"}).val(s_tit);
				});
				
				//单击子查询字段,得到到查询sql语句
				$(".dataSetFiledWrap .dataSetFiled").click(function(){
					var subFieldId = $(this).attr("dsfieldid"),
						subFieldName = $(this).html(),
						dsId = $(this).closest("[datasetid]").attr("datasetid"),
						dsName = $(this).closest("[datasetid]").attr("dataSetName");
					obj.attr({"subField": subFieldId, "dataType":"subQuery", "subQueryId" : dsId}).val(dsName + "_" + subFieldName);
				});
				
				//空值
				$("#setNull").unbind("click").click(function() {
					obj.attr({"field":"null", "dataType":"null"}).val($(this).text());
				});
				$("#opId").unbind("click").click(function() {
					obj.attr({"field":"opId", "dataType":"opId"}).val($(this).text());
				});
				if(formId) {
					$("#setFormCtrl").show();
				} else {
					$("#setFormCtrl").hide();
				}
				//当前页的接收参数
				$("#pageParamId").hover(function(){
					$("#paramItem").show();
					rule.showPageParamItem(obj);
				},function(){
					$("#paramItem").hide();
				});
			}
		});
		var fieldData = "";
		$("#setFormCtrl").hover(function(){
			var $li_form = $(".tableListWrap").find("li[formId="+formId+"]");
			if($li_form.length > 0) {
				var table = $li_form.attr("formName"), li_ctrl = "", 
					$li_field = $li_form.find(".fieldListWrap li");
				if($li_field.length > 0) {
					$li_form.find(".fieldListWrap li").each(function() {
						var fieldCN = $(this).text(),
							fieldName = $(this).attr("fieldname");
						li_ctrl += '<div class="menu-item" s_field="'+table +"."+fieldName+'" s_tit="'+fieldCN+'" >'+fieldCN+'</div>';
					});
				}else {
					if(!fieldData) {
						fieldData = rule.getFormFieldsData(formId);
					}
					if(fieldData){
						var i = 0,len = fieldData.length;
						for(;i < len;i++){
							var fieldName = fieldData[i]["fieldName"],
								fieldCN = fieldData[i]["fieldTitle"];
							li_ctrl += '<div class="menu-item" s_field="'+table +"."+fieldName+'" s_tit="'+fieldCN+'" >'+fieldCN+'</div>';
						}
					}
				}
				$("#formCtrlList").empty().append(li_ctrl);
				$("#formCtrlList").find(".menu-item").unbind("click").click(function() {
					var s_field = $(this).attr("s_field"),
						s_tit = $(this).attr("s_tit");
					obj.attr({"field": s_field, "dataType":"form"}).val("表单中【"+s_tit+"】的值");
				});
			}
			$("#formCtrlList").show();
		},function(){
			$("#formCtrlList").hide();
		});
		
		//子查询
		$("#subQuery").hover(function(){
			$("#fromSubQuery").show();
		},function(){
			$("#fromSubQuery").hide();
		});
		$(".dataSetName").hover(function(){
			$(this).next(".dataSetFiledWrap").show();
		},function(){
			$(this).next(".dataSetFiledWrap").hide();
		});
		
		$(".dataSetFiledWrap").hover(function(){
			$(this).show();
		});
		
		$(".condition-conter").find(".condVal").each(function() {
			var $that = $(this);
			onValueChange($that[0], function() {
				var datatype = $that.attr("dataType");
				if(datatype == "form" || datatype == "system" || datatype == "pageParam") {
					$that.val("");
				}
				var val = $.trim($that.val());
				$that.attr({"dataType":"input","field":val});
				$("#setFilterMenu").hide();
			});
		});
		$(".condition-conter").find(".condVal").hover(function(){
			
		},function(){
			$("#setFilterMenu").hide();
		});
		$("#setFilterMenu").hover(function(){
			$(this).show();
		},function(){
			$(this).hide();
		});
	},
	
	/**
	 *显示当前页设置的参数
	 */
	showPageParamItem : function($condVal) {
		var paramJson = "";
		if(rule.pageParamJson) {
			paramJson = rule.pageParamJson;
		} else {
			var formId = window.parent.Global[window.parent.Global.ezType].formId;
			if(formId) {
				var pageId = $('#'+formId, parent.document).parent().attr("id") ? $('#'+formId, parent.document).parent().attr("id") : null;
				paramJson = ezCommon.getLinkParam(pageId);
				rule.pageParamJson = paramJson;
			}
		}
		if(paramJson ) {
			if(paramJson[0]) {
				$("#paramItem").empty();
				$.each(paramJson, function(k, val){
					var linkData = val["linkData"];
					$.each(linkData,  function(key, item) {
						$("#paramItem").append('<div class="menu-item param-item" fromPageID="'+val["fromPageID"]+'" paramVal="'+item["paramVal"]+'" paramName="'+item["paramName"]+'" paramType="'+item["paramType"]+'">'+item["paramKey"]+'</div>');
					});
				});
				$("#paramItem").find(".param-item").unbind("click").click(function() {
					var paramVal = $(this).attr("paramVal"),
						paramType = $(this).attr("paramType");
						paramname = $(this).attr("paramname");
					$condVal.attr({"dataType":"pageParam","paramName":paramname,"paramVal":paramVal,"paramType":paramType}).val($(this).text());
				});
			}
		}
	},
	
	/**
	 * 为搜索框赋搜索结果的值 
	 */
	setSearchResult : function($searchItem){
		var tId = $searchItem.find(".sTableTitle").attr("tableName"),
			tTitle = $searchItem.find(".sTableTitle").attr("tableTitle"),
			fId = $searchItem.find(".sFieldTitle").attr("fieldname"),
			fTitle = $searchItem.find(".sFieldTitle").html();
		$searchItem.closest(".searchPanel").hide();
		
		$searchItem.closest(".searchPanel").prev().val("【" + tTitle + "】表中的 【" + fTitle + "】").blur();
	},
	
	/**
	 * 设置数据筛选条件
	 */
	setDataFilterWhere : function() {
		//继续添加筛选条件事件
		$(".ruleTable").undelegate(".add-condition", "click").delegate(".add-condition", "click", function() {
			var $newCondition = $(this).parent().clone();
				$(".add-condition",$newCondition).remove();
				$newCondition.children(":first").append('<select class="logic"><option value="and">并且</option><option value="or">或者</option></select>');
				$newCondition.append('<span class="glyphicon min-condition glyphicon-minus"></span>');
			$(this).closest("td").append($newCondition);
			rule.filterTextEvent();
		});
		
		$(".ruleTable").undelegate(".min-condition", "click").delegate(".min-condition", "click", function(){
			$(this).parent().remove();
		});
	},

};
