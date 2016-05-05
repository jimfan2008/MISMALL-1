/**
 * 数据筛选器
 * 基本操作，事件触发，步骤操作，步骤内部操作
 * @author  皮振华
 */
$(function() {
	//初始化页面信息
	dataFilterNew.init();
	//返回
	$("#backToEditor").click(function() {
		if (confirm("确定退出？")) {
			$(window.parent.document).find("#panelWin").remove();
		}
	});
	//点击设置数据源名称文本框隐藏提示
	$("#querierName").click(function() {
		$("#existName").hide();
	});
	//点击左侧菜单右边切换到相应的数据
	$("#dataSourceList .dataItem").click(function() {
		dataFilterNew.stepsJson = {};
		$setDataArea = $("#setDataArea");
		$setDataArea.find(".setArea").removeClass("selectedArea");
		$("#existName").hide();
		$("#selectedForm").addClass("selectedArea");
		var $selectedForm = $("#selectedForm");
		var $this = $(this);
		if ($this.hasClass("liHover")) {
			return;
		}
		$("#dataSourceList li").removeClass("addHover");
		$("#dataSourceList li").removeClass("liHover");
		$this.addClass("liHover");
		dataFilterNew.initselectedForm();
		//dataRestore.firstStep($selectedForm);
	});
	//设置区域上一步下一步事件操作
	$("#setDataArea").find(".btn-operation").click(function() {
		var $that = $(this);
		var layer = $that.attr("layer"), isNext = $that.attr("next") == "next" ? true : false;
		var $selectedLayer = $("#" + layer), isBool = true, isModify = true;
		var layerId = $that.parents(".setArea").attr("id");
		if (layer) {
			//下一步操作
			if (isNext) {
				//调用对应第个步骤方法
				var boolJson = dataFilterNew[layerId]();
				isBool = boolJson["isBool"], isModify = boolJson["isModify"];
				if ((isBool && isModify) || (isBool && layer == "selectFieldWhere")) {
					//初始化下一步骤内容
					var initFunName = "init" + layer;
					isBool = dataFilterNew[initFunName]();
				}
			}
		} else {
			isBool = false;
		}
		if (layerId == "saveDataName") {
			dataFilterNew.saveDataName();
		}
		if ($selectedLayer.length > 0 && isBool) {
			var index = $selectedLayer.index();
			$("#setDataArea").find(".setArea").removeClass("selectedArea");
			$selectedLayer.addClass("selectedArea");
			dataFilterNew.selectedSteps(index);
			var alt = $selectedLayer.attr("alt");
			$("#guideTit").html(alt);
		}

	});
	//步骤数事件操作
	$("#setSteps").find(".stepItem").click(function() {
		var $that = $(this), $setDataArea = $("#setDataArea");
		if ($that.hasClass("complete")) {
			var index = $("#setSteps").find(".stepItem").index($that);
			var num = 2 * index;
			$("#setSteps").find("p:gt(" + num + ")").removeClass("complete");
			$setDataArea.find(".setArea").removeClass("selectedArea");
			var $selectedArea = $setDataArea.find(".setArea:eq(" + index + ")");
			var alt = $selectedArea.attr("alt");
			$selectedArea.addClass("selectedArea");
			$("#guideTit").html(alt);
		}
	});
	//步骤1-初始
	dataFilterNew.initselectedForm();

});
//基本操作
var dataFilterNew = {
	//记录每个步骤JSON数据，方便后期检测每步是否改动过
	stepsJson : {},
	//记录选择表单字段列表
	selFormFieldsJson : {},
	//记录左边数据源JSON数据
	dataSourcesJson : {},
	//左边数据源列表
	init : function() {
		var dataSources = filterDataOperation.getAllQueryDataSources();
		if (dataSources.length > 0) {
			dataFilterNew.dataSourcesJson = dataSources;
			var $dataSourceList = $("#dataSourceList");
			var dataHTML = '<li  class="dataItem"><span></span></li>';
			$.each(dataSources, function(key, val) {
				var $dataHTML = $(dataHTML), querierId = val["id"], querierName = val["querierName"];
				$dataHTML.attr({
					"querierId" : querierId,
					"value" : querierName
				}).find("span").text(querierName);
				$dataSourceList.find("#initNewDataSources").before($dataHTML);
			});
			if (dataSources.length > 10) {
				$dataSourceList.css({
					"overflow" : "scroll",
					"overflow-x" : "hidden"
				});
			}
		}
	},
	//步骤数选中
	selectedSteps : function(index) {
		var num = 2 * (index + 1) - 1;
		$("#setSteps").find("p").removeClass("complete");
		$("#setSteps").find("p:lt(" + num + ")").addClass("complete");
	},
	//提示框
	tipBox : function(content) {
		$("#tipBox").show();
		$("#tipBox .mas_img").text(content);
		setTimeout(function() {
			$("#tipBox").hide();
		}, 2000);
	},
	//步骤1
	initselectedForm : function() {
		var $selectData = $("#dataSourceList").find(".liHover");
		var $selectedForm = $("#selectedForm");
		if ($selectData.length <= 0) {
			var formList = filterDataOperation.getAllFormList();
			var formHTML = '<button class="btnF formItem" type="button" ></button>';
			if (formList.length > 0) {
				$selectedForm.find(".formList").empty();
				$.each(formList, function(key, val) {
					var $formHTML = $(formHTML);
					var formId = val["id"], formName = val["tableTitle"], tableName = val["tableName"];
					$formHTML.attr({
						"formId" : formId,
						"tableName" : tableName,
						"value" : formName
					}).text(formName);
					$selectedForm.find(".formList").append($formHTML);
				});
			}
			//表单列表选中效果
			$selectedForm.find(".formItem").click(function() {
				var $that = $(this);
				if ($that.hasClass("selectedForm")) {
					$that.removeClass("selectedForm");
				} else {
					$that.addClass("selectedForm");
				}
			});
		} else {
			dataRestore.firstStep($selectedForm, $selectData);
		}
		return true;
	},
	selectedForm : function() {
		var isBool = true, isModify = true;
		//用户是否修改
		var $selForm = $("#selectedForm").find(".selectedForm");
		var len = $selForm.length;
		//选中表单项信息
		var getSelectedFormItem = function($selectForms) {
			var formJson = [];
			$.each($selectForms, function(index) {
				var $that = $(this);
				var formId = $that.attr("formId");
				var formName = $that.attr("value");
				var tableName = $that.attr("tableName");
				if (formId) {
					formJson.push({
						"formId" : formId,
						"tableName" : tableName,
						"formName" : formName
					});
				}
			});
			return formJson;
		}
		// var selectedFormRelation = function(formJSON) { }
		if (len > 0) {
			var formJSON = getSelectedFormItem($selForm);
			var stepsJson = dataFilterNew.stepsJson["selectedForm"] ? dataFilterNew.stepsJson["selectedForm"] : [];
			var strFormJson = JSON.stringify(formJSON), strStepsJson = JSON.stringify(stepsJson);
			if (strFormJson != strStepsJson) {
				dataFilterNew.stepsJson["selectedForm"] = formJSON;
			} else {
				//用户返回上一步时没有修改
				isModify = false;
			}
			if (len > 1 && strFormJson != strStepsJson) {
				//选中表单检测是否有关联关系（两张表以上 包含两张表）
				// isBool = filterDataOperation.detectionFormRelation(formJSON);
			}
		} else {
			isBool = false, isModify = true;
			dataFilterNew.tipBox("你还没有选择表单");
		}
		return {
			"isBool" : isBool,
			"isModify" : isModify
		};
	},
	//步骤2
	initselectedField : function() {
		var formJson = dataFilterNew.stepsJson["selectedForm"];
		var $selectedField = $("#selectedField");
		if (formJson) {
			//查询表单对应的字段
			var formFieldJson = filterDataOperation.getFormAllField(formJson);
			if (formFieldJson.length > 0) {
				dataFilterNew.selFormFieldsJson = formFieldJson;
				//遍历字段
				$selectedField.find(".formFields").empty();
				var $formFields = $("#selectedField").find(".formFields");
				dataFilterNew.getFormAllFields(formFieldJson, $formFields);

				$selectedField.find(".formFields .fieldItem").click(function() {
					var $that = $(this);
					if ($that.hasClass("selectedField")) {
						$that.removeClass("selectedField");
					} else {
						$that.addClass("selectedField");
					}
				});
			} else {
				dataFilterNew.stepsJson["selectedForm"] = "";
				return false;
			}
		}
		var $selectData = $("#dataSourceList").find(".liHover");
		if ($selectData.length) {
			dataRestore.twoStep($selectedField, $selectData);
		}

		return true;
	},
	selectedField : function() {
		var isBool = true, isModify = true;
		var $panelFields = $("#selectedField").find(".panel-fields");
		if ($panelFields.length > 0) {
			var selectFieldJson = [];
			$.each($panelFields, function() {
				var $that = $(this);
				$selectedField = $that.find(".selectedField");
				if ($selectedField.length > 0) {
					var $formTitle = $that.find(".formTitle");
					var formId = $formTitle.attr("formId"), formName = $formTitle.attr("value");
					var formJson = {
						"formId" : formId,
						"formName" : formName
					};
					var fieldJson = dataFilterNew.getSelectedFieldItem($selectedField);
					formJson["selectedField"] = fieldJson;
					selectFieldJson.push(formJson)
				} else {
					isBool = false;
				}
			});
			if (isBool) {
				var stepsJson = dataFilterNew.stepsJson["selectedField"] ? dataFilterNew.stepsJson["selectedField"] : [];
				var strStepsJson = JSON.stringify(stepsJson), strFieldJson = JSON.stringify(selectFieldJson);
				if (strFieldJson == strStepsJson) {
					isModify = false;
				} else {
					dataFilterNew.stepsJson["selectedField"] = selectFieldJson;
				}
			} else {
				dataFilterNew.tipBox("每表单中最少选择一项字段！");
			}
		}
		return {
			"isBool" : isBool,
			"isModify" : isModify
		};
	},
	//步骤3
	initselectResults : function() {
		var selFieldJson = dataFilterNew.stepsJson["selectedField"];
		if (selFieldJson.length > 0) {
			//数据标题
			var $fieldTitle = $("#selectResults").find(".fieldTitle").empty();
			dataFilterNew.getTableTitle(selFieldJson, $fieldTitle);
			var fieldData = filterDataOperation.getDataSourcesResult(selFieldJson);
			var $dataContent = $("#selectResults").find(".dataContent").empty();
			var $fieldsTit = $fieldTitle.find(".f-title");
			dataFilterNew.getTableFieldData(fieldData, $fieldsTit, $dataContent);
		}
		return true;
	},
	selectResults : function() {
		var isBool = true, isModify = true;
		var stepsJson = dataFilterNew.stepsJson["selectResults"] ? dataFilterNew.stepsJson["selectResults"] : [];
		var selectResultsJson = [{
			"result" : "结果1"
		}];
		selectResultsJson[0]["formJson"] = dataFilterNew.stepsJson["selectedField"] ? dataFilterNew.stepsJson["selectedField"] : [];
		var strStepsJson = JSON.stringify(stepsJson), strResultsJson = JSON.stringify(selectResultsJson);
		if (strStepsJson == strResultsJson) {
			isModify = false;
		} else {
			dataFilterNew.stepsJson["selectResults"] = selectResultsJson;
		}
		return {
			"isBool" : isBool,
			"isModify" : isModify
		};
	},
	//步骤4
	initdataViewOperation : function() {
		var selFieldJson = dataFilterNew.stepsJson["selectedField"];
		if (selFieldJson.length > 0) {
			//数据标题
			var $fieldTitle = $("#dataViewOperation").find(".fieldTitle").empty();
			dataFilterNew.getTableTitle(selFieldJson, $fieldTitle);
			var fieldData = filterDataOperation.getDataSourcesResult(selFieldJson);
			var $dataContent = $("#dataViewOperation").find(".dataContent").empty();
			var $fieldsTit = $fieldTitle.find(".f-title");
			dataFilterNew.getTableFieldData(fieldData, $fieldsTit, $dataContent);
		}
		return true;
	},
	dataViewOperation : function() {
		var isBool = true, isModify = true;
		var stepsJson = dataFilterNew.stepsJson["dataViewOperation"] ? dataFilterNew.stepsJson["dataViewOperation"] : [];
		var viewJson = [{
			"result" : "记录分组，平均值等JSON"
		}];
		var strStepsJson = JSON.stringify(stepsJson), strViewJson = JSON.stringify(viewJson);
		if (strStepsJson == strViewJson) {
			isModify = false;
		} else {
			dataFilterNew.stepsJson["dataViewOperation"] = viewJson;
		}
		return {
			"isBool" : isBool,
			"isModify" : isModify
		};
	},
	//步骤5
	initselectFieldWhere : function() {
		var formFieldJson = dataFilterNew.selFormFieldsJson;
		var $formFields = $("#selectFieldWhere").find(".formFields").empty();
		var $selectFieldWhere = $("#selectFieldWhere");
		dataFilterNew.getFormAllFields(formFieldJson, $formFields);
		$selectFieldWhere.find(".formFields .fieldItem").click(function() {
			var $that = $(this);
			if ($that.hasClass("selectedField")) {
				$that.removeClass("selectedField");
			} else {
				$that.addClass("selectedField");
			}
		});
		var $selectData = $("#dataSourceList").find(".liHover");
		if ($selectData.length) {
			dataRestore.fiveStep($selectFieldWhere, $selectData);
		}
		return true;
	},
	selectFieldWhere : function() {
		var isBool = true, isModify = true, selectFieldJson = [];
		var $panelFields = $("#selectFieldWhere").find(".panel-fields");
		if ($panelFields.length > 0) {
			$.each($panelFields, function() {
				var $that = $(this);
				$selectedField = $that.find(".selectedField");
				if ($selectedField.length > 0) {
					var $formTitle = $that.find(".formTitle");
					var formId = $formTitle.attr("formId"), formName = $formTitle.attr("value");
					var formJson = {
						"formId" : formId,
						"formName" : formName
					};
					var fieldJson = dataFilterNew.getSelectedFieldItem($selectedField);
					formJson["selectedField"] = fieldJson;
					selectFieldJson.push(formJson);
				}
			});
			var stepsJson = dataFilterNew.stepsJson["selectFieldWhere"] ? dataFilterNew.stepsJson["selectFieldWhere"] : "";
			var strStepsJson = JSON.stringify(stepsJson), strFieldJson = JSON.stringify(selectFieldJson);
			if (strFieldJson == strStepsJson) {
				isModify = false;
			} else {
				dataFilterNew.stepsJson["selectFieldWhere"] = selectFieldJson;
			}
		}
		return {
			"isBool" : isBool,
			"isModify" : isModify
		};
	},
	//步骤6
	initsetDataWhere : function() {
		//选中结果数据
		var selFieldJson = dataFilterNew.stepsJson["selectedField"];
		var $setDataWhere = $("#setDataWhere");
		if (selFieldJson.length > 0) {
			//数据标题
			var $fieldTitle = $("#setDataWhere").find(".fieldTitle").empty();
			dataFilterNew.getTableTitle(selFieldJson, $fieldTitle);
			var fieldData = filterDataOperation.getDataSourcesResult(selFieldJson);
			var $dataContent = $("#setDataWhere").find(".dataContent").empty();
			var $fieldsTit = $fieldTitle.find(".f-title");
			dataFilterNew.getTableFieldData(fieldData, $fieldsTit, $dataContent);
		}
		//条件设置
		var setDataJson = dataFilterNew.stepsJson["selectFieldWhere"] ? dataFilterNew.stepsJson["selectFieldWhere"] : "";
		if (setDataJson.length > 0) {
			setDataWhere.readSetWhereInfo(setDataJson);
		}
		var $selectData = $("#dataSourceList").find(".liHover");
		if ($selectData.length) {
			dataRestore.sixStep($setDataWhere, $selectData);
		}
		return true;
	},
	setDataWhere : function() {
		var isBool = true, isModify = true;
		var stepsJson = dataFilterNew.stepsJson["setDataWhere"] ? dataFilterNew.stepsJson["setDataWhere"] : "";
		/// var strStepsJson = JSON.stringify(stepsJson), strFieldJson = JSON.stringify(selectFieldJson);
		//var setDataJson = dataFilterNew.stepsJson["selectedField"] ? dataFilterNew.stepsJson["selectedField"] : "";

		var setWhereJson = setDataWhere.getFormFieldWhereJson();
		var strStepsJson = JSON.stringify(stepsJson), strWhereJson = JSON.stringify(setWhereJson);
		if (strStepsJson == strWhereJson) {
			isModify = false;
		} else {
			dataFilterNew.stepsJson["setDataWhere"] = setWhereJson;
		}

		return {
			"isBool" : isBool,
			"isModify" : isModify
		};
	},
	//步骤7
	initsaveDataName : function() {
		var titleValue = $(".liHover span").text();
		$("#querierName").val(titleValue);
		return true;
	},
	saveDataName : function() {
		var $selectData = $("#dataSourceList").find(".liHover");
		var $selectDataId = $selectData.attr("querierid");
		var querierName = $.trim($("#querierName").val());
		if (querierName != "") {
			var querierConfig = dataFilterNew.stepsJson["setDataWhere"];
			if ($("#existName").is(":visible")) {
				return;
			}
			if ($selectDataId) {
				
			} else {
				$("#dataSourceList .dataItem").each(function() {
					var dataValue = $(this).attr("value");
					if (querierName == dataValue) {
						$("#existName").show();
					}
				});
				$selectDataId = 0;
			}
			filterDataOperation.saveQuerier(querierName, querierConfig, $selectDataId);
		} else {
			alert("请输入名称！");
		}

	},
	//选中表单里字段信息 返回选中字段json数据
	getSelectedFieldItem : function($selectFields) {
		var fieldJson = [];
		$.each($selectFields, function() {
			var $that = $(this);
			var fieldId = $that.attr("fieldId");
			var fieldName = $that.attr("value");
			if (fieldId) {
				fieldJson.push({
					"fieldId" : fieldId,
					"fieldName" : fieldName
				});
			}
		});
		return fieldJson;
	},
	//获取表格标题
	getTableTitle : function(selFieldJson, $fieldTitle) {
		var fieldTitHTML = '<th class="f-title"></th>';
		$.each(selFieldJson, function(formK, formV) {
			var selectedField = formV["selectedField"];
			$.each(selectedField, function(fieldK, fieldV) {
				var fieldId = fieldV["fieldId"], fieldName = fieldV["fieldName"];
				var $fieldTitHTML = $(fieldTitHTML);
				$fieldTitHTML.attr({
					"fieldId" : fieldId,
					"value" : fieldName
				}).text(fieldName);
				$fieldTitle.append($fieldTitHTML);
			});
		});
	},
	//获取表格内容
	getTableFieldData : function(fieldData, $fieldsTit, $dataContent) {
		if (fieldData.length > 0) {
			var tr = '<tr></tr>', td = '<td></td>';
			$.each(fieldData, function(index, val) {
				var $tr = $(tr);
				$.each($fieldsTit, function() {
					var $td = $(td);
					var fieldId = $(this).attr("fieldId");
					if (fieldId != "" && fieldId) {
						var fieldVal = val[fieldId];
						$td.attr({
							"title" : fieldVal
						}).text(fieldVal);
					}
					$tr.append($td);
				});
				$dataContent.append($tr);
			});
		} else {
			$dataContent.append('<span class="table-message">还没有填写资料</span>');
		}

	},
	//获取表单对应下所有字段内容
	getFormAllFields : function(formFieldJson, $formFields) {
		var panelHTML = '<div class="panel panel-default panel-fields"> <div class="panel-heading formTitle"></div><div class="panel-body"></div></div>';

		var fieldHTML = '<button class="btnF fieldItem" type="button" ></button>';
		$.each(formFieldJson, function(formK, formV) {
			var $panelHTML = $(panelHTML);
			var formName = formV["formName"], formId = formV["formId"], tableName = formV["tableName"], fields = formV["fields"];
			$panelHTML.find(".panel-heading").attr({
				"formId" : formId,
				"value" : formName
			}).text(formName);
			$formFields.append($panelHTML);
			if (fields.length > 0) {
				$panelHTML.find(".panel-body").append(fieldHTML);
				$panelHTML.find(".fieldItem:first").attr({
					"fieldId" : tableName + "_ID",
					"value" : "编号"
				}).text("编号");
				$.each(fields, function(fieldK, fieldV) {
					var $fieldHTML = $(fieldHTML);
					var fieldId = fieldV["fieldId"], fieldName = fieldV["fieldName"];
					$fieldHTML.attr({
						"fieldId" : fieldId,
						"value" : fieldName
					}).text(fieldName);
					$panelHTML.find(".panel-body").append($fieldHTML);
				});
			}
		});
	}
};
