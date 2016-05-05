/**
 * 数据筛选器js
 * @author bareman
 * 2014-11-04
 */

$(function() {
	dataFilter.init();
});

var dataFilter = {
	isFromForm : false, //标识是否由表单打开数据查询
	dataSetId : "", //当前数据集ID号 还原或新建保存后返回,
	dataSetName : "", //当前数据集名称
	sql : "",

	selectedTables : {}, //所有待查询的表
	filterWhereJson : {}, //过滤条件json
	connInfo : "", //多表连接信息
	dataCount : 10, //数据条数
	countRecord : "", //记录数
	countSql : "", //统计记录数量的sql
	pageParamJson : null, //记录当前页接收的参数json数据

	/**
	 * 数据筛选器初始化：页面元素绑定事件，调用一些初始化方法
	 */
	init : function() {
		dataFilter.initDataSetId();
		//初始化数据集id
		dataFilter.showFormList();
		dataFilter.showDataSetList();
		dataFilter.getPageParam();
		$("#main").height($(window).height() - 32);

		var searchIdx = 0;
		$(document).keydown(function(e) {
			var kc = e.keycode;
			if ($(".searchPanel").is(":visible")) {
				if (kc == 38) {
					searchIdx++;
				}
			}
			//alert(searchIdx);
		});

		$("body").click(function(e) {
			var target = e.target;
			if ($(target).hasClass("searchPanel") || $(target).closest(".searchPanel").length > 0) {

			} else {
				$(".searchPanel").hide();
			}
		});
		//选择求记录总数的时候
		$("#resultCount").on("change", function() {
			if ($(this).prop("checked")) {
				$(this).parent().find("i:last").text(dataFilter.countRecord);
				$(".fieldDataListWrap").hide();
				$(".fieldDataListWrap").before('<table class="countTable"><tbody><tr class="fieldHead"><th ctrltype="" fieldtitle=".countNum"><div class="fieldTitle countTitleDiv">记录总数</div><input class="countTitleInput" value="记录总数"  style="display:none"/><div class="optEditCount"><i class="dsEdit" title="重命名"></i></div></th></tr><tr><td>' + dataFilter.countRecord + '</td></tr></table>');
				if (dataFilter.sql.indexOf("cc_wechat_member") > -1) {
					var count = "count('cc_wechat_member.id') as countNum ";
				} else if (dataFilter.sql.indexOf("cc_wechat_share") >= 0) {
					var count = "count('cc_wechat_share.id') as countNum ";
				} else {
					var count = "count(" + (dataFilter.sql.substring(7, 35)) + ") as countNum ";
				}
				dataFilter.countSql = "SELECT " + count + " from " + dataFilter.sql.split("from")[1];

				$(".countTable th .optEditCount .dsEdit").click(function() {
					$(".countTable .countTitleDiv").hide();
					$(".countTable .countTitleInput").show();
					onValueChange($(".countTitleInput")[0], function() {
						$(".countTitleDiv").text($(".countTitleInput").val());
					});
					$(".countTitleInput").on("blur", function() {
						$(".countTable .countTitleDiv").show();
						$(".countTable .countTitleInput").hide();
					});

				});

			} else {
				$(this).parent().find("i:last").text("");
				$(".countTable").remove();
				$(".fieldDataListWrap").show();

			}
		});

		$(".myDataSet ul").on("click", "li", function(e) {
			$(".tableListWrap").find(".tableCkBox input[type='checkbox']").prop("checked", false);
			if (!$(e.target).hasClass("dsEdit") && !$(e.target).hasClass("dsDel")) {

				var dsId = $(this).attr("dsid");
				dataFilter.restore(dsId);
				dataFilter.dataSetName = $(this).find(".dsName").html();
				$(".restoreMe").removeClass("restoreMe");
				$(this).addClass("restoreMe");
				$(".dataCondition").show();

				dataFilter.showFilterByJson();
			}
		});

		$(".myDataSet ul").on("click", ".dsEdit", function(e) {
			var $nameWrap = $(this).parent().prev(), dsId = $(this).closest("li").attr("dsId");
			if (!$nameWrap.find("input#editDsName").length) {
				var dsName = $nameWrap.html();
				$nameWrap.empty();
				var $newInput = $('<input type = "text" id = "editDsName" value = "' + dsName + '"/>');
				$newInput.appendTo($nameWrap).select().blur(function() {
					var newName = this.value;
					if (dsName == newName) {
						$nameWrap.empty().html(dsName);
					} else {
						$nameWrap.empty().html(newName);
						dataFilter.changeName(dsId, newName);
						$.each(window.parent.ezCommon.cacheDataSource, function(k, v) {
							if (v["ID"] == dsId) {
								$(this).attr("querierName", newName);
								$(window.parent.document).find(".customcomponent-down-tow").find(".formInfoList>li[dsid=" + dsId + "]").text(newName);
							}
							return;
						});
					}
					dataFilter.dataSetName = newName;
				});
			}
		});
		$(".myDataSet ul").on("click", ".dsDel", function() {
			var $_this = $(this), dsId = $(this).closest("li").attr("dsId");
			if (confirm("是否确定删除当前数据集？")) {
				var isDeled = dataFilter.deleteDataSet(dsId);
				if (isDeled) {
					var $li = $_this.closest("li");
					$li.fadeOut("fast", function() {
						$li.remove();
						$(".fieldTitleList").find("tr").not(".fieldHead").remove();
						$(".fieldTitleList").find("th").not(".fieldHead").remove();
						dataFilter.dataSetId = "";
						//释放dataSetID 不然不能新建
						$(".dataCondition").hide();
					});
					$.each(window.parent.ezCommon.cacheDataSource, function(k, v) {
						if (v["ID"] == dsId) {
							window.parent.ezCommon.cacheDataSource.splice(k, 1);
							$(window.parent.document).find(".customcomponent-down-tow").find(".formInfoList>li[dsid=" + dsId + "]").remove();
							$(window.parent.document).find("#addDataSource").next().find("li[queryid=" + dsId + "]").remove();
						}
						return;
					});
				}
			}
		});

		$("body").on("click", ".searchPanel li", function(e) {
			var tId = $(this).find(".sTableTitle").attr("tableName"), fId = $(this).find(".sFieldTitle").attr("fieldname"), fTitle = $(this).find(".sFieldTitle").html(), connArr = $(this).find(".sFieldTitle").attr("conninfo");
			//connArr =$(this).find(".sFieldTitle").attr("conninfo").split("#");
			if (connArr) {
				dataFilter.connInfo = connArr;
			}

			var tabFieldJson = {};
			$(".fieldHead").append('<th fieldtitle="' + tId + '.' + fId + '"><div class="fieldTitle">' + fTitle + '</div><div class="fieldOption"><span class="caret"></span></div><div class="optionWrap" style="display: none;"><div class="optionArrowWrap"><div class="arrow1"></div><div class="arrow2"></div></div><div class="optionList"><ul><li class="fieldSort" fieldSetType="fieldSort">排序</li><li class="fieldSum" fieldSetType="fieldSum">求和</li><li class="fieldAvg" fieldSetType="fieldAvg">平均值</li><li class="fieldMax" fieldSetType="fieldMax">最大值</li><li class="fieldMin" fieldSetType="fieldMin">最小值</li><li class="fieldGroup" fieldSetType="fieldGroup">分组</li><li class="fieldDel"  fieldSetType="fieldDel">删除</li></ul></div></div></th>');
			$(".inputFieldWrap").remove();

			if (!dataFilter.selectedTables[tId])
				dataFilter.selectedTables[tId] = [];
			dataFilter.selectedTables[tId].push(fId);
			//TODO 调用后台方法，查询到包含新字段的表数据
			var sql = dataFilter.createSql();
			dataFilter.showQueryData(sql);
		});

		//字段头部单击，显示或隐藏排序，分组等的面板
		$(".fieldTitleList").on("click", "th", function() {
			var $fieldObj = $(this);
			$(this).find(".optionWrap").slideToggle("fast");
		});

		//字段菜单操作事件 pzh
		$(".fieldTitleList").on("click", ".optionList ul li", function() {
			var $that = $(this), $selectedTh = $(this).closest("th"), fieldSetType = $that.attr("fieldSetType"), typeList = "fieldsort fieldSum fieldAvg fieldMax fieldMin";
			//$(".optionWrap").hide();
			if (fieldSetType == "fieldDel") {//删除

				$selectedTh.remove();
			} else {
				if (fieldSetType == "fieldSort") {
					var sortType = $selectedTh.attr("fieldSort");
					$selectedTh.attr(fieldSetType, "Desc");
					$that.removeClass("fieldSortAsc").addClass("fieldSortDesc");
					if (sortType == "Desc") {
						$selectedTh.attr(fieldSetType, "Asc");
						$that.removeClass("fieldSortDesc").addClass("fieldSortAsc");
					} else if (sortType == "Asc") {
						$selectedTh.removeAttr(fieldSetType);
						$that.removeClass("fieldSortDesc").removeClass("fieldSortAsc");
					} else {
						$selectedTh.attr(fieldSetType, "Desc");
						$that.removeClass("fieldSortAsc").addClass("fieldSortDesc");
					}
				} else {
					var type = $selectedTh.attr(fieldSetType);

					//$selectedTh.after(th);

					if (fieldSetType == "fieldGroup") {
						$(".optionList").find(".fieldGroup").removeClass("fieldSelected");
						$(".fieldHead th").removeAttr("fieldGroup");
						var th = $selectedTh.clone();
						th.addClass("groupby");
						th.attr("fieldtitle", th.attr('fieldtitle') + "count");
						th.find(".optionWrap,.fieldOption").remove();
						th.find(".fieldTitle").text("分组统计");
						$(".groupby").remove();
					} else {
						$(".fieldHead th").removeAttr(typeList);
						$(".optionList").find("li").not(".fieldGroup").removeClass("fieldSelected");
						$selectedTh.next('li').remove();
					}
					if (type != "true") {
						$selectedTh.attr(fieldSetType, "true");
						$that.addClass("fieldSelected");
						$(".optionList").find("li").removeClass("fieldSortDesc fieldSortAsc");
						$selectedTh.after(th);
					}
				}
			}
			//移除所有数据
			$(".fieldTitleList").find("tr").not(".fieldHead").remove();
			//查询新数据
			var sql = dataFilter.createSql();
			dataFilter.showQueryData(sql);
			dataFilter.sql = sql;
		});

		$(".tableListWrap > ul li").click(function() {
			var $fieldList = $(this).find(".tableWrap:first").next();
			if ($fieldList.is(":visible")) {
				$fieldList.slideUp();
				$(this).find(".isExpand").css("background-position", "0 -108px");
			} else {
				var $formLi = $(this).closest("li");
				var $fieldWrap = $formLi.find(".fieldListWrap ul");
				if (!$fieldWrap.find("li").length) {
					var formId = $formLi.attr("formid");
					var fieldListHtml = dataFilter.showFieldList(formId);
					$formLi.find(".fieldListWrap ul").append(fieldListHtml);
				}
				$fieldList.slideDown();
				$(this).find(".isExpand").css("background-position", "0 -143px");
			}
		});

		var $ckBoxs = $(".tableListWrap > ul input[type = 'checkbox']");
		$ckBoxs.click(function(e) {
			stopEventBubble(e);
			//如果选中了统计总数就释放
			if ($("#resultCount").prop("checked")) {
				$("#resultCount").click();
			}
			dataFilter.selectedTables = {};
			dataFilter.connInfo = "";

			$ckBoxs.each(function() {
				var isChecked = $(this).prop("checked");
				if (isChecked) {
					var $formLi = $(this).closest("li"), tableName = $formLi.attr("formname"), tabId = $formLi.attr("formid"), $fieldWrap = $formLi.find(".fieldListWrap ul");
					if (!$fieldWrap.find("li").length) {
						var fieldListHtml = dataFilter.showFieldList(tabId);
						$formLi.find(".fieldListWrap ul").append(fieldListHtml);
					}
					dataFilter.selectedTables[tableName] = [];
					$formLi.find(".fieldListWrap li").each(function() {
						var fields = {}, fieldName = $(this).attr("fieldName"), fieldTitle = $(this).html();
						fields[fieldName] = fieldTitle;
						dataFilter.selectedTables[tableName].push(fields);
					});
				}
			});
			if ($(".tableListWrap > ul input[type = 'checkbox']:checked").length > 0) {
				$(".dataCondition").show();
			} else {
				$(".dataCondition").hide();
			}
			$(".condition-conter").find(".right_where_column").empty();
			$("#btnFilter").hide();
			dataFilter.filterWhereJson = {};
			$(".fieldTitleList").empty();
			//显示数据前，先清空表格
			dataFilter.getSelectedFormFieldHtml();
			var firstTab = "", tableLen = 0;
			for (var k in dataFilter.selectedTables) {++tableLen;
				if (tableLen == 1) {
					firstTab = k;
				}
			}
			if (tableLen <= 1) {
				dataFilter.connInfo = firstTab;
				var sql = dataFilter.createSql();
				dataFilter.showQueryData(sql);
			} else {
				var checkM = JSON.parse(dataFilter.checkMulTable());
				if (checkM != "" && checkM != null) {
					dataFilter.connInfo = checkM[0]["connInfo"];
				}
				var sql = dataFilter.createSql();
				dataFilter.showQueryData(sql);
			}
			dataFilter.sql = sql;
		});

		$(".addNewFieldWrap").click(function() {
			if ($(".inputFieldWrap").length)
				return;

			var $newField = $("<div class = 'inputFieldWrap'><input type = 'text' id = 'newFieldTitle'/><div class = 'searchPanel'><ul></ul></div></div>");
			$(this).before($newField);

			onValueChange($("#newFieldTitle")[0], function() {
				var keyWord = $("#newFieldTitle").val();
				dataFilter.showSearchResult(keyWord);
			});

			$("#newFieldTitle").blur(function() {
				var keyWord = $("#newFieldTitle").val();

				if (!keyWord) {
					$(this).parent().remove();
				}
			});
		});

		$("#save").click(function() {
			dataFilter.whereGetJson();
			$(".dataSetModal").modal("show");
			if (dataFilter.dataSetId) {
				$(".dataSetName").val(dataFilter.dataSetName);
				$(".dataSetName").select();
			}
		});

		$("#exit,#exitToEditor").click(function() {
			if (confirm("数据尚未保存，确定退出？")) {
				$(window.parent.document).find("#panelWin").remove();
			}
		});
		$(".eImainLeftlist").click(function() {
			$(".eImainLeftlist").css("background","white");
			$(this).css("background","#ccc");
		});

		$(".savaBtn").click(function() {
			if ($(".dataSetName").val()) {
				dataFilter.save();
			} else {
				$(".dataSaveTips").text("请输入名称").show();
			}
		});

		onValueChange($(".dataSetName")[0], function() {
			$(".dataSaveTips").text("");
		});
		/**
		 * 显示数据行数
		 */
		$("#whereCount").blur(function() {
			var val = $(this).val();
			if (val) {
				dataFilter.dataCount = val;
			} else {
				dataFilter.dataCount = 0;
			}
			var sqlStr = dataFilter.createSql();
			dataFilter.showQueryData(sqlStr);
		});
		//设置过滤字段
		$(".setFilterField").click(function() {
			$("#filterField").modal("show");
			//加载选中表单
			var tableList = dataFilter.getExistTables();
			//表格名称
			// alert(JSON.stringify(tableList));
			$("#contentWrap").empty();
			$.each(tableList, function(key, value) {
				var $liForm = $(".tableListWrap").find("li[formname='" + value + "']"), formName = $liForm.find(".tableName").text(), //表单名称

				formId = $liForm.attr("formId");

				var $formWrap = $('<div class="form-Wrap"><div class="form-name"><span>' + formName + '</span></div><div class="form-field"><ul></ul></div><div style="clear:both;"></div></div>');

				$("#contentWrap").append($formWrap);
				if ($liForm.find(".fieldListWrap li").length > 0) {
					$liForm.find(".fieldListWrap li").each(function() {
						var filedNameCN = $(this).text();
						fieldnameEN = $(this).attr("fieldName");
						ctrlType = $(this).attr("fieldtype");
						var liHtml = '<li><label class="checkbox-inline"> <input type="checkbox" ctrlType="' + ctrlType + '" value="' + value + "." + fieldnameEN + '" fName="' + filedNameCN + '">' + filedNameCN + '</label></li>';
						$formWrap.find(".form-field ul").append(liHtml);
					});
				} else {
					var fieldData = dataFilter.getFormFieldsData(formId);
					if (fieldData) {

						var liHtml1 = '<li><label class="checkbox-inline"> <input type="checkbox" fname="ID" value="' + tableList + ".ID" + '" ctrltype="ID">' + "ID" + '</label></li>';
						$formWrap.find(".form-field ul").append(liHtml1);
						var i = 0, len = fieldData.length;
						for (; i < len; i++) {
							var fieldnameEN = fieldData[i]["fieldName"], ctrlType = fieldData[i]["controlType"], filedNameCN = fieldData[i]["fieldTitle"];
							var liHtml = '<li><label class="checkbox-inline"> <input type="checkbox" ctrlType="' + ctrlType + '" value="' + value + "." + fieldnameEN + '" fName="' + filedNameCN + '">' + filedNameCN + '</label></li>';
							$formWrap.find(".form-field ul").append(liHtml);
						}
					}
				}
			});
			var checkField = dataFilter.filterWhereJson["checkField"];
			if (checkField) {
				$.each(checkField, function(key, value) {
					$("#contentWrap").find("input[value='" + value + "']").attr("checked", "checked");
				});
			}
		});
		//取消
		$("#CancleBtn").click(function() {
			$("#filterField").modal("hide");
		});
		//确定--选择字段
		$("#SureBtn").click(function() {
			$("#filterField").modal("hide");
			var num = 0;
			var liHtml = dataFilter.filterhtml();
			var checkField = [];
			var $column = $(".condition-conter").find(".right_where_column"), size = $column.find(".with_1").length;
			//移除过滤字段
			$("#contentWrap").find(".checkbox-inline [type='checkbox']").not(":checked").each(function() {
				var fNameEN = $(this).attr("value"), $with_1 = $column.find(".with_1[f_name='" + fNameEN + "']");
				if ($with_1.length > 0) {
					$with_1.remove();
				}
			});
			//添加新的过滤条件字段
			$("#contentWrap").find(".checkbox-inline [type='checkbox']:checked").each(function() {
				var fName = $(this).attr("fName"), fNameEN = $(this).attr("value"), ctrlType = $(this).attr("ctrltype");
				if (!$column.find(".with_1[f_name='" + fNameEN + "']").length > 0) {
					var count = $column.find(".with_1").length;
					var $liObj = $(liHtml);
					$column.append($liObj);
					if ((num == 0 && size <= 0) || count == 0) {
						$liObj.find(".orWhere").remove();
					}
					if (ctrlType == "CCTime") {
						$liObj.find(".condVal").attr("onfocus", "this.blur();");
					}
					$liObj.find(".condVal").attr("ctrlType", ctrlType);
					$liObj.attr("f_name", fNameEN).find(".tit").text(fName).attr("titName", fName);
				} else {
					if (num == 0) {
						$column.find(".with_1:first .orWhere:first").remove();
					}
				}
				num++;
				checkField.push(fNameEN);
			});
			dataFilter.setDataFilterWhere();
			$("#btnFilter").show();
			dataFilter.filterWhereJson["checkField"] = checkField;

			dataFilter.filterTextEvent();
		});
		//查看--设置条件
		$("#btnFilter").click(function() {
			if ($("#resultCount").prop("checked")) {//点击确定的时候取消求记录总数
				$("#resultCount").click();
			}

			dataFilter.whereGetJson();
		});
	},
	/**
	 * 设置过条件拼接条件json
	 */
	whereGetJson : function() {
		var condJson = {};
		$(".condition-conter").find(".with_1").each(function() {
			var f_name = $(this).attr("f_name");
			condJson[f_name] = [];
			var $condVal = $(this).find(".condVal:first");
			var ctrlType = $condVal.attr("ctrlType"), logic = $(this).find(".w1:first .logic option:selected").val(), //同一个字段 and or
			relation = $(this).find(".relation:first option:selected").val(), fieldName = $(this).find(".tit").attr("titName");
			dataType = $condVal.attr("dataType"), nodeType = $condVal.attr("field");
			var link = $(this).find(".w1 option:selected").val();
			condVal = $condVal.val();
			if (ctrlType == "CCTime") {
				var timeNum = $condVal.attr("timeNum");
				condJson[f_name].push({
					"link" : link,
					"ctrlType" : ctrlType,
					"fieldName" : fieldName,
					"logic" : logic,
					"relation" : relation,
					"condVal" : condVal,
					"dataType" : dataType,
					"timeNum" : timeNum
				});
			} else {
				if (dataType == "subQuery") {
					var subQueryId = $condVal.attr("subQueryId"), subField = $condVal.attr("subField");
					condJson[f_name].push({
						"link" : link,
						"ctrlType" : ctrlType,
						"fieldName" : fieldName,
						"logic" : logic,
						"relation" : relation,
						"condVal" : condVal,
						"dataType" : dataType,
						"nodeType" : nodeType,
						"subField" : subField,
						"subQueryId" : subQueryId
					});
				} else if (dataType == "pageParam") {
					var paramType = $condVal.attr("paramType"), paramName = $condVal.attr("paramName"), paramKey = $condVal.attr("paramKey");
					condJson[f_name].push({
						"ctrlType" : ctrlType,
						"fieldName" : fieldName,
						"logic" : logic,
						"relation" : relation,
						"condVal" : condVal,
						"dataType" : dataType,
						"paramKey" : paramKey,
						"paramType" : paramType,
						"paramName" : paramName
					});
				} else {
					if (ctrlType == "CCTime") {
						var timeNum = $condVal.attr("timeNum");
						condJson[f_name].push({
							"ctrlType" : ctrlType,
							"fieldName" : fieldName,
							"logic" : logic,
							"relation" : relation,
							"condVal" : condVal,
							"dataType" : dataType,
							"timeNum" : timeNum
						});
					} else {
						condJson[f_name].push({
							"ctrlType" : ctrlType,
							"fieldName" : fieldName,
							"logic" : logic,
							"relation" : relation,
							"condVal" : condVal,
							"dataType" : dataType,
							"nodeType" : nodeType
						});
					}
				}
			}
			var $with = $(this).find(".withFieldFilter .with_2");
			if ($with.length > 0) {
				$with.each(function() {
					$condVal = $(this).find(".condVal");
					ctrlType = $condVal.attr("ctrlType"), logic = $(this).find(".logic option:selected").val(), relation = $(this).find(".w_relation option:selected").val(), fieldName = $(this).find(".tit").attr("titName"), dataType = $condVal.attr("dataType"), condVal = $condVal.val();
					if (dataType == "subQuery") {
						var subQueryId = $condVal.attr("subQueryId"), subField = $condVal.attr("subField");
						condJson[f_name].push({
							"ctrlType" : ctrlType,
							"fieldName" : fieldName,
							"logic" : logic,
							"relation" : relation,
							"condVal" : condVal,
							"dataType" : dataType,
							"nodeType" : nodeType,
							"subField" : subField,
							"subQueryId" : subQueryId
						});
					} else if (dataType == "pageParam") {
						var paramType = $condVal.attr("paramType"), paramName = $condVal.attr("paramName"), paramKey = $condVal.attr("paramKey");
						condJson[f_name].push({
							"ctrlType" : ctrlType,
							"fieldName" : fieldName,
							"logic" : logic,
							"relation" : relation,
							"condVal" : condVal,
							"dataType" : dataType,
							"paramKey" : paramKey,
							"paramType" : paramType,
							"paramName" : paramName
						});
					} else {
						var nodeType = $condVal.attr("field");
						if (ctrlType == "CCTime") {
							var timeNum = $condVal.attr("timeNum");
							condJson[f_name].push({
								"ctrlType" : ctrlType,
								"fieldName" : fieldName,
								"logic" : logic,
								"relation" : relation,
								"condVal" : condVal,
								"dataType" : dataType,
								"timeNum" : timeNum
							});
						} else {
							condJson[f_name].push({
								"ctrlType" : ctrlType,
								"fieldName" : fieldName,
								"logic" : logic,
								"relation" : relation,
								"condVal" : condVal,
								"dataType" : dataType,
								"nodeType" : nodeType
							});
						}
					}
				});
			}
		});
		dataFilter.filterWhereJson["condJson"] = condJson;
		var sql = dataFilter.createSql();
		dataFilter.showQueryData(sql);
	},
	/**
	 * 根据过滤条件json显示条件
	 */
	showFilterByJson : function() {
		$(".condition-conter").find(".right_where_column").empty();
		$("#btnFilter").hide();
		var filterJson = dataFilter.filterWhereJson;
		if (filterJson["checkField"]) {
			$("#btnFilter").show();
			var condJson = filterJson["condJson"], liHtml = dataFilter.filterhtml(), num = 0;
			var $column = $(".condition-conter").find(".right_where_column");
			$column.empty();
			$.each(condJson, function(key, item) {
				var i = 0, $sLiOjb = $(liHtml);
				$.each(item, function(k, v) {
					var fName = v["fieldName"], fNameEN = key, condVal = v["condVal"], relation = v["relation"], dataType = v["dataType"] ? v["dataType"] : "", ctrlType = v["ctrlType"], nodeType = 0, obj = "";
					if (i == 0) {
						$column.append($sLiOjb);
						obj = $sLiOjb;
						obj.find(".relation option[value=" + relation + "]").attr("selected", "selected");
					} else {
						var $liObj = $(liHtml);
						$sLiOjb.find(".withFieldFilter").append($liObj);
						obj = $liObj;
						obj.removeClass("with_1").addClass("with_2");
						obj.find(".add-condition").removeClass("add-condition glyphicon-plus").addClass("min-condition glyphicon-minus");
						obj.find(".relation").removeClass("relation").addClass("w_relation");
						obj.find(".logic").removeClass("logic").addClass("w_logic");
						obj.find(".withFieldFilter").remove();
						obj.find(".w_relation option[value=" + relation + "]").attr("selected", "selected");
					}
					if (num == 0) {
						obj.find(".orWhere").remove();
					} else {
						var logic = v["logic"];
						if (i == 0) {
							obj.find(".logic option[value='" + logic + "']").attr("selected", "selected");
						} else {
							obj.find(".w_logic option[value='" + logic + "']").attr("selected", "selected");
						}
					}
					i++, num++;
					obj.attr("f_name", fNameEN).find(".tit").text(fName).attr("titName", fName);
					if (dataType == "pageParam") {
						paramType = v["paramType"];
						paramName = v["paramName"];
						obj.find(".condVal").val(condVal).attr({
							"field" : nodeType,
							"dataType" : dataType,
							"ctrlType" : ctrlType,
							"paramType" : paramType,
							"paramName" : paramName
						});
					} else if (dataType == "subQuery") {
						obj.find(".condVal").val(condVal).attr({
							"subfield" : v["subField"],
							"dataType" : dataType,
							"ctrlType" : ctrlType,
							"subqueryid" : v["subQueryId"]
						});
					} else {
						if (ctrlType == "CCTime") {
							obj.find(".condVal").attr("onfocus", "this.blur();");
							var timeNum = v["timeNum"];
							obj.find(".condVal").val(condVal).attr({
								"field" : nodeType,
								"dataType" : dataType,
								"ctrlType" : ctrlType,
								"timeNum" : timeNum
							});
						} else {
							nodeType = v["nodeType"];
							obj.find(".condVal").val(condVal).attr({
								"field" : nodeType,
								"dataType" : dataType,
								"ctrlType" : ctrlType
							});
						}
					}
					if (dataType == "null") {
						obj.find(".condVal").val("空值");
					}
				});
			});
			dataFilter.filterTextEvent();
			dataFilter.setDataFilterWhere();
		}
	},
	/**
	 * 筛选条件设置文本框事件
	 */
	filterTextEvent : function() {
		//表单控件
		var formId = window.parent.ezCommon.formId, obj = "";
		$(".condition-conter").find(".condVal").unbind("click").click(function() {
			obj = $(this);
			var position = obj.offset();
			var left = position["left"], top = position["top"], ctrlType = obj.attr("ctrlType");
			$("#setFilterMenu").css({
				"left" : left + obj.width(),
				"top" : top - obj.height() / 2 - 15
			}).show();
			if (ctrlType == "TIME") {
				$("#setTimeList").show();
				$("#setSystem,#setFormCtrl,#setNull").hide();
				$("#setTimeList").find(".editNum").numeral();
				$("#setTimeList").find(".selectTime").unbind("click").click(function() {
					var s_type = $(this).attr("s_type"), s_tit = $(this).attr("s_tit");
					obj.attr({
						"field" : 0,
						"timeNum" : 0,
						"dataType" : s_type
					}).val(s_tit);
				});
				$("#setTimeList").find(".btnEditNum").unbind("click").click(function() {
					var parMenu = $(this).parents(".setTimeNum");
					var val = parMenu.find(".editNum").val();
					if (val != "") {
						var s_type = parMenu.attr("s_type"), s_tit = parMenu.attr("s_tit");
						s_tit = s_tit.replace(/n/, val);
						obj.attr({
							"field" : 0,
							"timeNum" : val,
							"dataType" : s_type
						}).val(s_tit);
					}
				});
			} else {
				$("#setTimeList").hide();
				$("#setSystem,#setFormCtrl,#setNull").show();
				$("#setSystem").hover(function() {
					$("#systemList").show();
				}, function() {
					$("#systemList").hide();
				});
				$("#setSystem").find(".menu-item").unbind("click").click(function() {
					var s_type = $(this).attr("s_type"), s_tit = $(this).attr("s_tit");
					obj.attr({
						"field" : s_type,
						"dataType" : "system"
					}).val(s_tit);
				});

				//单击子查询字段,得到到查询sql语句
				$(".dataSetFiledWrap .dataSetFiled").click(function() {
					var subFieldId = $(this).attr("dsfieldid"), subFieldName = $(this).html(), dsId = $(this).closest("[datasetid]").attr("datasetid"), dsName = $(this).closest("[datasetid]").attr("dataSetName");
					obj.attr({
						"subField" : subFieldId,
						"dataType" : "subQuery",
						"subQueryId" : dsId
					}).val(dsName + "_" + subFieldName);
				});
				//制作层ID
				$("#layerId").unbind("click").click(function() {
					obj.attr({
						"field" : "layId",
						"dataType" : "layerId"
					}).val($(this).text());
				});
				//空值
				$("#setNull").unbind("click").click(function() {
					obj.attr({
						"field" : "null",
						"dataType" : "null"
					}).val($(this).text());
				});

				$("#opId").unbind("click").click(function() {
					obj.attr({
						"field" : "opId",
						"dataType" : "opId"
					}).val($(this).text());
				});
				if (formId) {
					$("#setFormCtrl").show();
				} else {
					$("#setFormCtrl").hide();
				}
				//当前页的接收参数
				$("#pageParamId").hover(function() {
					$("#paramItem").show();
					dataFilter.showPageParamItem(obj);
				}, function() {
					$("#paramItem").hide();
				});
			}
		});
		var fieldData = "";
		$("#setFormCtrl").hover(function() {
			var $li_form = $(".tableListWrap").find("li[formId=" + formId + "]");
			if ($li_form.length > 0) {
				var table = $li_form.attr("formName"), li_ctrl = "", $li_field = $li_form.find(".fieldListWrap li");
				if ($li_field.length > 0) {
					$li_form.find(".fieldListWrap li").each(function() {
						var fieldCN = $(this).text(), fieldName = $(this).attr("fieldname");
						li_ctrl += '<div class="menu-item" s_field="' + table + "." + fieldName + '" s_tit="' + fieldCN + '" >' + fieldCN + '</div>';
					});
				} else {
					if (!fieldData) {
						fieldData = dataFilter.getFormFieldsData(formId);
					}
					if (fieldData) {
						var i = 0, len = fieldData.length;
						for (; i < len; i++) {
							var fieldName = fieldData[i]["fieldName"], fieldCN = fieldData[i]["fieldTitle"];
							li_ctrl += '<div class="menu-item" s_field="' + table + "." + fieldName + '" s_tit="' + fieldCN + '" >' + fieldCN + '</div>';
						}
					}
				}
				$("#formCtrlList").empty().append(li_ctrl);
				$("#formCtrlList").find(".menu-item").unbind("click").click(function() {
					var s_field = $(this).attr("s_field"), s_tit = $(this).attr("s_tit");
					obj.attr({
						"field" : s_field,
						"dataType" : "form"
					}).val("表单中【" + s_tit + "】的值");
				});
			}
			$("#formCtrlList").show();
		}, function() {
			$("#formCtrlList").hide();
		});

		//子查询
		$("#subQuery").hover(function() {
			$("#fromSubQuery").show();
		}, function() {
			$("#fromSubQuery").hide();
		});
		$(".dataSetName").hover(function() {
			$(this).next(".dataSetFiledWrap").show();
		}, function() {
			$(this).next(".dataSetFiledWrap").hide();
		});

		$(".dataSetFiledWrap").hover(function() {
			$(this).show();
		});

		$(".condition-conter").find(".condVal").each(function() {
			var $that = $(this);
			onValueChange($that[0], function() {
				var datatype = $that.attr("dataType");
				if (datatype == "form" || datatype == "system" || datatype == "pageParam") {
					$that.val("");
				}
				var val = $.trim($that.val());
				$that.attr({
					"dataType" : "input",
					"field" : val
				});
				$("#setFilterMenu").hide();
			});
		});
		$(".condition-conter").find(".condVal").hover(function() {

		}, function() {
			$("#setFilterMenu").hide();
		});
		$("#setFilterMenu").hover(function() {
			$(this).show();
		}, function() {
			$(this).hide();
		});
	},

	/**
	 * 设置数据筛选条件
	 */
	setDataFilterWhere : function() {
		//继续添加筛选条件事件
		$(".dataCondition").undelegate(".add-condition", "click").delegate(".add-condition", "click", function() {
			$control = $(this).parents("li").find("input");
			if ($control.val()) {
				var $parLi = $(this).parents("li");
				var liHtml = dataFilter.filterhtml();
				$addselect = $(liHtml);
				$parLi.find(".withFieldFilter:first").append($addselect);
				$addselect.removeClass("with_1").addClass("with_2");
				$addselect.find(".relation").removeClass("relation").addClass("w_relation");
				$addselect.find(".withFieldFilter").remove();
				$addselect.find(".add-condition").removeClass("add-condition glyphicon-plus").addClass("min-condition glyphicon-minus");
				var titName = $parLi.find(".tit:first").attr("titName"), ctrlType = $parLi.find(".condVal:first").attr("ctrlType");
				$addselect.find(".condVal").attr("ctrlType", ctrlType);
				$addselect.find(".tit").attr("titName", titName).text(titName);
				$addselect.delegate(".min-condition", "click", function() {
					$(this).parents("li.with_2").remove();
				});
				if (ctrlType == "CCTime") {
					$addselect.find(".condVal").attr("onfocus", "this.blur();");
				}
			} else {

			}

			dataFilter.filterTextEvent();
		});

		$(".dataCondition").undelegate(".min-condition", "click").delegate(".min-condition", "click", function() {
			$(this).parents("li.with_2").remove();
		});
		/**
		 * 根据事件类型添加控件
		 * @param control Object 第一个输入控件
		 **/
		function IsAddCondition($control) {
			//查找在此控件之前的所有的控件是否有为空的
			var result = "";
			if (($control.parents("li").nextAll().size() == 0)) {
				if ($.trim($control.val()) == "")
					result = $control;
				else
					result = true;
			} else {
				if ($.trim($control.val()) == "") {
					return $control;
				} else {
					$control.parents("li").nextAll().each(function() {
						if ($.trim($(this).find("input").val()) == "") {
							result = $(this);
							return false;
						} else {
							result = true;
						}
					});
				}
			}
			return result;
		}

	},

	initDataSetId : function() {
		dataFilter.dataSetId = _getUrlParas('dataSetId') ? _getUrlParas('dataSetId') : '';
		dataFilter.isFromForm = _getUrlParas('from') ? true : false;
	},

	/**
	 * 获取数据集列表json
	 */
	getDataSetList : function() {
		var flowId = SITECONFIG.FLOWID ? SITECONFIG.FLOWID : 1, dsListJson = null;
		_commonAjax({
			type : "POST",
			url : SITECONFIG.ROOTPATH + "/FormData/getAllFlowQuerier",
			data : {
				"flowId" : flowId,
				"siteId" : SITECONFIG.SITEID
			},
			processData : false,
			dataType : 'json',
			async : false,
			success : function(result) {
				if (result)
					dsListJson = result;
			}
		});
		return dsListJson;
	},

	/**
	 * 显示数据集列表
	 */
	showDataSetList : function() {
		var dsListJson = dataFilter.getDataSetList();
		if (dsListJson) {
			var i = 0;
			len = dsListJson.length;
			for (; i < len; i++) {
				$(".myDataSet ul").append('<li dsId = "' + dsListJson[i]["ID"] + '"><span class = "dsName" title = "' + dsListJson[i]["querierName"] + '">' + dsListJson[i]["querierName"] + '</span><div class = "dsOpt"><i class = "dsEdit" title = "重命名"></i><i class = "dsDel" title = "删除"></i></div></li>');
				$("#fromSubQuery").append('<div class = "menu-item dataSetItem" dataSetId = "' + dsListJson[i]["ID"] + '" dataSetName = ' + dsListJson[i]["querierName"] + '><div class = "dataSetName">' + dsListJson[i]["querierName"] + '</div><div class = "dataSetFiledWrap"></div></div>');
			}
			$("#fromSubQuery .dataSetItem").each(function() {
				var dsId = $(this).attr("dataSetId");
				var dataSetJson = dataFilter.getDataSet(dsId);
				var dataJ = dataSetJson['querierData'], dataSetFiled = "";
				$.each(dataJ.selectFields, function(index, value) {
					dataSetFiled += '<div class = "menu-item dataSetFiled" dsFieldId = "' + value['tableName'] + '_' + value['fieldId'] + '">' + value['fieldTitle'] + '</div>';
				});
				$(this).find(".dataSetFiledWrap").empty().append(dataSetFiled);
			});
		}
	},
	/**
	 *获取当前页面 参数数据
	 */
	getPageParam : function() {
		var formId = window.parent.ezCommon.formId;
		//var  formId =ezCommon.formId;
		if (formId) {
			var pageId = $('#' + formId, parent.document).parent().attr("id") ? $('#' + formId, parent.document).parent().attr("id") : null;
			dataFilter.pageParamJson = ezCommon.getLinkParam(pageId);
		}
	},
	/**
	 *显示当前页设置的参数
	 */
	showPageParamItem : function($condVal) {
		var paramJson = "";
		if (dataFilter.pageParamJson) {
			paramJson = dataFilter.pageParamJson;
		} else {
			var formId = ezCommon.controlLists[ezCommon.formId];
			//var formId = window.parent.Global[window.parent.Global.ezType].formId;
			if (formId) {
				var pageId = $('#' + formId, parent.document).parent().attr("id") ? $('#' + formId, parent.document).parent().attr("id") : null;
				paramJson = ezCommon.getLinkParam(pageId);
				dataFilter.pageParamJson = paramJson;
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
					var paramVal = $(this).attr("paramVal"), paramType = $(this).attr("paramType");
					paramname = $(this).attr("paramname");
					$condVal.attr({
						"dataType" : "pageParam",
						"paramName" : paramname,
						"paramVal" : paramVal,
						"paramType" : paramType
					}).val($(this).text());
				});
			}
		}
	},

	/**
	 * 根据数据集ID，获取数据集数据
	 * @param	dsId	integer	数据集id号
	 * @return	object	数据集json对象
	 */
	getDataSet : function(dsId) {
		var dsJson = null;
		_commonAjax({
			type : "POST",
			url : SITECONFIG.ROOTPATH + "/FormData/getAQuerierData",
			data : {
				"dsId" : dsId,
				"siteId" : SITECONFIG.SITEID
			},
			processData : false,
			dataType : 'json',
			async : false,
			success : function(result) {
				if (result)
					dsJson = result;
			},
			error : function(e) {
				console.log(e);
			},
		});
		return dsJson;
	},

	/**
	 * 还原
	 * @param	dsJson	string	数据集json对象
	 */
	restore : function(dsId) {
		var dataSetJson = dataFilter.getDataSet(dsId), dsName = dataSetJson["querierName"];
		dataFilter.connInfo = dataSetJson["querierData"]["connInfo"];
		var queryTables = dataSetJson["queryTables"].split(","), i = 0, len = queryTables.length;

		dataFilter.selectedTables = dataSetJson["queryTables"].split(",");
		dataFilter.dataSetId = dataSetJson["ID"];
		dataFilter.filterWhereJson = dataSetJson["querierData"]["whereJson"];
		var dataJ = dataSetJson['querierData'], tr = "";
		dataFilter.sql = dataJ["sql"];
		$.each(dataJ.selectFields, function(index, value) {
			var order = value["order"] ? 'fieldSort' + value["order"] : "", sum = value["sum"] ? 'fieldSelected' : "", avg = value["avg"] ? 'fieldSelected' : "", max = value["max"] ? 'fieldSelected' : "", min = value["min"] ? 'fieldSelected' : "", group = value["group"] ? 'fieldSelected' : "";
			tr += '<th fieldtitle="' + value['tableName'] + '.' + value['fieldId'] + '"><div class="fieldTitle">' + value['fieldTitle'] + '</div><div class="fieldOption"><span class="caret"></span></div><div class="optionWrap"><div class="optionArrowWrap"><div class="arrow1"></div><div class="arrow2"></div></div><div class="optionList"><ul><li fieldsettype="fieldSort" class="fieldSort ' + order + '">排序</li><li fieldsettype="fieldSum" class="fieldSum ' + sum + '">求和</li><li fieldsettype="fieldAvg" class="fieldAvg ' + avg + '">平均值</li><li fieldsettype="fieldMax" class="fieldMax ' + max + '">最大值</li><li fieldsettype="fieldMin" class="fieldMin ' + min + '">最小值</li><li fieldsettype="fieldGroup" class="fieldGroup ' + group + '">分组</li><li fieldsettype="fieldDel" class="fieldDel">删除</li></ul></div></div></th>';
		});
		$(".fieldHead").empty().append(tr);
		dataFilter.showQueryData(dataFilter.sql);
	},

	/**
	 * 将当前流程下的表单拼接成html,显示到表单列表中并绑定事件
	 */
	showFormList : function() {
		var tableListHtml = "", formData = dataFilter.getFormListData();
		if (formData) {
			var i = 0, len = formData.length;
			for (; i < len; i++) {
				var tbId = formData[i]["ID"], tbName = formData[i]["tableName"], tbTitle = formData[i]["tableTitle"];
				tableListHtml += '<li formid="' + tbId + '" formName = "' + tbName + '"><div class="tableWrap"><div class="tableNameWrap"><div class="isExpand"></div><span class="tableName">' + tbTitle + '</span></div><div class="tableCkBox"><input type="checkbox"></div></div><div class="fieldListWrap"><ul></ul></div></li>';
			}
			$(".tableListWrap > ul").empty().append(tableListHtml);
		}
	},

	showFieldList : function(formId) {
		var fieldListHtml = "", fieldData = dataFilter.getFormFieldsData(formId);
		if (fieldData) {
			i = 0, len = fieldData.length;
			fieldListHtml += '<li fieldName="ID" fieldType="ID">ID</li>';
			for (; i < len; i++) {
				var fName = fieldData[i]["fieldName"], fTitle = fieldData[i]["fieldTitle"], fType = fieldData[i]["controlType"];
				fieldListHtml += '<li fieldName="' + fName + '" fieldType="' + fType + '">' + fTitle + '</li>';
			}
			return fieldListHtml;
		}
	},

	/**
	 * 获取当前站点或流程下的所有表单
	 */
	getFormListData : function() {
		var flowId = SITECONFIG.FLOWID ? SITECONFIG.FLOWID : 1, formListJson = null;
		_commonAjax({
			type : "POST",
			url : SITECONFIG.APPPATH + "/Query/getFlowDataTable",
			data : {
				"flowId" : flowId,
				"siteId" : SITECONFIG.SITEID
			},
			processData : false,
			dataType : 'json',
			async : false,
			success : function(result) {
				if (result)
					formListJson = result;
			}
		});
		return formListJson;
	},
	/**
	 * 根据表单ID获取表单所有字段
	 */
	getFormFieldsData : function(formId) {
		var fieldListJson = null;
		_commonAjax({
			type : "POST",
			processData : false,
			data : {
				"formId" : formId,
				"siteId" : SITECONFIG.SITEID
			},
			url : SITECONFIG.ROOTPATH + "/FormData/getAFormFiledsInfo",
			dataType : 'json',
			async : false,
			success : function(r) {
				fieldListJson = r;
			}
		});
		return fieldListJson;
	},

	/**
	 * 拼接所选表单字段的html,显示到右侧数据表表头部
	 */
	getSelectedFormFieldHtml : function() {
		var tabs = dataFilter.selectedTables, fieldHeadList = '<tr class="fieldHead">';
		//字段标题列表字符串
		$.each(tabs, function(idx, item) {
			$.each(item, function(i, field) {
				for (var k in field) {
					fieldHeadList += '<th fieldTitle = "' + idx + '.' + k + '" ctrlType=""><div class="fieldTitle">' + field[k] + '</div><div class="fieldOption"><span class="caret"></span></div><div class="optionWrap"><div class="optionArrowWrap"><div class="arrow1"></div><div class="arrow2"></div></div><div class="optionList"><ul><li class="fieldSort" fieldSetType="fieldSort">排序</li><li class="fieldSum" fieldSetType="fieldSum">求和</li><li class="fieldAvg" fieldSetType="fieldAvg">平均值</li><li class="fieldMax" fieldSetType="fieldMax">最大值</li><li class="fieldMin" fieldSetType="fieldMin">最小值</li><li class="fieldGroup" fieldSetType="fieldGroup">分组</li><li class="fieldDel" fieldSetType="fieldDel">删除</li></ul></div></div></th>';
				}
			});
		});
		fieldHeadList += '</tr>';
		$(".fieldTitleList").append(fieldHeadList);
	},

	/**
	 * 拼接查询的字段
	 */
	getQueryFields : function() {
		var fields = "";
		$(".fieldHead th").each(function() {
			var fieldTitle = $(this).attr('fieldtitle');
			asField = fieldTitle.replace(".", "_");
			fields += fieldTitle + " as " + asField + ",";
		});
		fields = fields.substring(0, fields.length - 1);
		return fields;
	},

	/**
	 * 拼接查询的表
	 */
	getQueryTable : function() {
		var $ckBox = $(".tableListWrap > ul input:checked");
		if ($ckBox.length == 1) {//单表查询
			var tableName = $ckBox.closest("li").attr("formname");
			return tableName + " as " + tableName;
		} else if ($ckBox.length > 1) {//多表查询
			var tabs = dataFilter.selectedTables;
			$.each(tabs, function(idx, item) {

			});
		}
	},
	/**
	 * 拼接查询的条件
	 */
	getQueryCondition : function() {
		var whereStr = "";
		if (!dataFilter.filterWhereJson["condJson"])
			return whereStr;
		var fJson = dataFilter.filterWhereJson["condJson"];
		$.each(fJson, function(key, item) {
			$.each(item, function(k, v) {
				var ctrlType = v["ctrlType"], logic = v["logic"], relation = v["relation"], dataType = v["dataType"], condVal = v["condVal"], val = "";
				if (condVal) {
					if (ctrlType == "CCTime") {
						var timeNum = v["timeNum"];
						val = "@&" + dataType + "@&";
						if (dataType == "preday" || dataType == "nextday" || dataType == "premonth") {
							val = "@&" + dataType + "=" + timeNum + "@&";
						}
					} else {
						val = nodeType = v["nodeType"];
						if (dataType == "input") {
							val = nodeType;
						} else if (dataType == "system") {
							val = "#" + nodeType + "#";
						} else if (dataType == "null") {
							val = "";
						} else if (dataType == "form") {
							val = "$" + nodeType + "$";
						} else if (dataType == "subQuery") {
							var subField = v["subField"], subQueryId = v["subQueryId"];
							val = "(select " + subField + " from @@" + subQueryId + "@@)";
						} else if (dataType == "pageParam") {
							var paramName = v["paramName"];
							val = "@#" + paramName + "@#";
						}
					}
					if (logic) {
						if (dataType == "null") {
							whereStr += " " + logic + " (" + key;
						} else {
							whereStr += " " + logic + " " + key;
						}
					} else {
						if (dataType == "null") {
							whereStr += " and (" + key;
						} else {
							whereStr += " and " + key;
						}
					}
					if (relation == 0) {
						whereStr += "=";
					} else if (relation == 1) {
						whereStr += "!=";
					} else if (relation == 2) {
						whereStr += ">";
					} else if (relation == 3) {
						whereStr += "<";
					} else if (relation == 4) {
						whereStr += " in ";
					} else if (relation == 5) {
						whereStr += " not in ";
					} else if (relation == 6) {
						whereStr += "<=";
					} else if (relation == 7) {
						whereStr += ">=";
					} else if (relation == 8) {
						whereStr += " like ";
					}
					if (relation == 8) {
						whereStr += "'%" + val + "%'";
					} else if ((relation == 4 || relation == 5) && dataType != "subQuery") {
						whereStr += "('" + val + "')";
					} else {
						if (dataType == "null") {
							if (relation == 1) {
								whereStr += "'" + val + "' and " + key + " is not null)";
							} else {
								whereStr += "'" + val + "' or " + key + " is null)";
							}
						} else {
							if (dataType == "subQuery") {
								whereStr += val;
							} else {
								whereStr += "'" + val + "'";
							}

						}
					}
				}
			});
		});
		return whereStr;
	},
	/**
	 * 排序和分组查询
	 */
	getSortGroupType : function(mainID) {
		var sortGroudStr = "";
		//分组
		var $fieldGroup = $(".fieldHead th[fieldGroup]");
		if ($fieldGroup.size() > 0) {
			var field = $fieldGroup.attr("fieldtitle");
			sortGroudStr += " group by " + field;
		}
		//排序
		var $fieldSort = $(".fieldHead th[fieldSort]");
		if ($fieldSort.size() > 0) {
			var field = $fieldSort.attr("fieldtitle"), sortType = $fieldSort.attr("fieldSort");
			sortGroudStr += " order by " + field + " " + sortType;
		} else {// 默认ID倒序
			sortGroudStr += " order by " + mainID + " DESC ";
		}
		return sortGroudStr;
	},
	/**
	 * 查询类型(总和,最大值,最小值等)
	 */
	getQueryType : function() {
		var queryType = "", field = "";
		var fieldArray = dataFilter.getQueryFields();
		//获取要查询的字段
		//求和
		var $fieldSum = $(".fieldHead th[fieldSum]");
		if ($fieldSum.size() > 0) {
			field = $fieldSum.attr("fieldtitle");
			queryType = "sum(" + field + ")";
		}
		//平均值
		var $fieldAvg = $(".fieldHead th[fieldAvg]");
		if ($fieldAvg.size() > 0) {
			field = $fieldAvg.attr("fieldtitle");
			queryType = "avg(" + field + ")";
		}
		//最大值
		var $fieldMax = $(".fieldHead th[fieldMax]");
		if ($fieldMax.size() > 0) {
			field = $fieldMax.attr("fieldtitle");
			queryType = "max(" + field + ")";
		}
		//最小值
		var $fieldMin = $(".fieldHead th[fieldMin]");
		if ($fieldMin.size() > 0) {
			field = $fieldMin.attr("fieldtitle");
			queryType = "min(" + field + ")";
		}
		fieldArray = fieldArray.replace(field, queryType);
		//分组
		var $fieldGroup = $(".fieldHead th[fieldgroup]");
		if ($fieldGroup.size() > 0) {

			field = $fieldGroup.attr("fieldtitle");
			queryType = "count(" + field + ")";
			queryType = "count(" + field + ") as ";
			//alert(queryType);
			field = field + "count as ";
			fieldArray = fieldArray.replace(field, queryType);
		}

		//alert(fieldArray);

		return fieldArray;
	},
	/**
	 * 产生完整的sql语句
	 */
	createSql : function() {
		var mainTable = "";
		if (dataFilter.connInfo.length) {
			mainTable = dataFilter.connInfo.substring(0, 25);
		} else {
			dataFilter.connInfo = mainTable;
		}
		var condition = dataFilter.getQueryCondition(), //获取 where条件
		sortGroudStr = dataFilter.getSortGroupType(mainTable + ".ID"), //排序
		fieldArray = dataFilter.getQueryType();
		//获取查询类型(排序，分组等)
		var sql = "";
		if (dataFilter.dataCount) {
			sql = "select " + mainTable + ".ID," + fieldArray + " from " + dataFilter.connInfo + " " + " where 1 = 1 " + condition + sortGroudStr + " limit 0," + dataFilter.dataCount;
		} else {
			sql = "select " + mainTable + ".ID," + fieldArray + " from " + dataFilter.connInfo + " " + " where 1 = 1 " + condition + sortGroudStr;
		}
		dataFilter.sql = sql;
		return sql;
	},

	/**
	 * 将sql查询的结果数据显示到表格中
	 */

	showQueryData : function(sql) {
		var queryData = ezCommon.querySqlData(sql, 0, 0, '');
		dataFilter.countRecord = queryData['count'];

		var i = 0, len = queryData['sql'].length, tr;
		for (; i < len; i++) {
			tr += "<tr>";
			for (var f in queryData['sql'][i]) {
				if (f == "ID") {
					continue;
				}
				tr += "<td><span title='" + queryData['sql'][i][f] + "'>" + queryData['sql'][i][f] + "</span></td>";

			};
			tr += "</tr>";
		}
		$(".fieldTitleList tr:not(:first)").remove();
		$(".fieldTitleList").append(tr);
	},

	/**
	 * 用户输入字段，自动匹配同名字段及所在的表，供用户选择
	 * @para fieldTitle string 用户输入的字段名称
	 * @return searchJson  匹配到的字段及表组成 的json对象
	 */
	getSearchFieldData : function(keyword) {
		var searchJson = null, tableFieldJson = dataFilter.getExistTables();
		var flowid = SITECONFIG.FLOWID ? SITECONFIG.FLOWID : 1;
		_commonAjax({
			type : "POST",
			processData : false,
			data : {
				"flowid" : flowid,
				"keyword" : keyword,
				"siteId" : SITECONFIG.SITEID,
				"tableFieldJson" : JSON.stringify(tableFieldJson)
			},
			url : SITECONFIG.GROUPPATH + "/Query/filterQueryFieldInfo",
			dataType : 'json',
			async : false,
			success : function(r) {
				searchJson = r;
			}
		});
		return searchJson;
	},

	/**
	 * 勾选多表时（单表查询直接调ezCommon中的方法）
	 */
	checkMulTable : function() {
		var searchJson = null, tableFieldJson = dataFilter.getExistTables(), flowid = SITECONFIG.FLOWID ? SITECONFIG.FLOWID : 1;
		_commonAjax({
			type : "POST",
			processData : false,
			data : {
				"flowid" : flowid,
				"siteId" : SITECONFIG.SITEID,
				"tableFieldJson" : JSON.stringify(tableFieldJson)
			},
			url : SITECONFIG.GROUPPATH + "/Query/filterQueryFieldInfo",
			dataType : 'json',
			async : false,
			success : function(r) {
				searchJson = r;
			}
		});
		return searchJson;
	},

	/**
	 * 将检索的结果显示到下拉面板中
	 */
	showSearchResult : function(keyWord) {
		if ($.trim(keyWord).length) {
			var searchJson = dataFilter.getSearchFieldData(keyWord);
			var sl = "";
			if (searchJson) {
				var i = 0, len = searchJson.length;
				for (; i < len; i++) {
					var searchStr = searchJson[i]["tableName"] + '.' + searchJson[i]["fieldName"];
					if ($(".fieldHead").find("th[fieldtitle='" + searchStr + "']").length == 0) {
						var conninfo = searchJson[i]["connInfo"];

						//conninfo = conninfo?conninfo:'';
						// var conn="";
						// if(conninfo){
						//
						// $.each(conninfo,function(x,y){
						// conn+=y+"#";
						// });
						// conn= conn.substring(0,conn.length-1);
						// }

						sl += '<li><div class = "sFieldTitle" fieldName = "' + searchJson[i]["fieldName"] + '"  connInfo="' + conninfo + '">' + searchJson[i]["fieldTitle"] + '</div><div class = "sTableTitle" tableName = "' + searchJson[i]["tableName"] + '"><span class = "tti">来自表</span>：' + searchJson[i]["tableTitle"] + '</div></li>';
					}

				}
			} else {
				sl += "<li>没有匹配到合适的信息</li>";
			}
			if (!sl)
				sl += "<li>没有匹配到合适的信息</li>";
			$(".searchPanel ul").empty().append(sl);
			$(".searchPanel").show();
		} else {
			$(".searchPanel ul").empty();
			$(".searchPanel").hide();
		}
	},

	/**
	 * 获取已存在的表及字段组成 JSON对象
	 * @return	object 	tabFieldJson  已存在的表及字段组成 JSON对象
	 */
	getExistTableField : function() {
		var tabFieldJson = {};
		$(".fieldHead th").each(function() {
			var tablFieldArr = $(this).attr("fieldtitle").split("."), tempTabId = tablFieldArr[0], tempFieldId = tablFieldArr[1];
			if (!tabFieldJson[tempTabId]) {
				//tabFieldJson.push(tempTabId);
				tabFieldJson[tempTabId] = [];
			}
			tabFieldJson[tempTabId].push(tempFieldId);
		});
		return tabFieldJson;
	},
	/**
	 * 获取已存在的表及字段组成 JSON对象
	 * @return	object 	tabFieldJson  已存在的表及字段组成 JSON对象
	 */
	getExistTables : function() {
		var tabArr = [];
		$(".fieldHead th").each(function() {
			var tablFieldArr = $(this).attr("fieldtitle").split("."), tempTabId = tablFieldArr[0];
			if (tabArr.indexOf(tempTabId) < 0) {
				tabArr.push(tempTabId);
			}
		});
		return tabArr;
	},

	/**
	 * 创建数据集json,用于保存
	 */

	createSaveJson : function() {
		var json = {
			"selectFields" : []
		};
		$(".fieldHead th").each(function() {
			var tempJson = {}, tablFieldArr = $(this).attr("fieldtitle").split("."), tempTabId = tablFieldArr[0], tempFieldId = tablFieldArr[1];
			tempFieldTitle = $(this).find(".fieldTitle").html();
			//字段标题
			tempJson["fieldId"] = tempFieldId;
			tempJson["fieldTitle"] = tempFieldTitle;
			tempJson["tableName"] = tempTabId;

			if ($(this).attr("fieldsort")) {//order
				tempJson["order"] = $(this).attr("fieldsort");
			}
			if ($(this).attr("fieldgroup")) {//group
				tempJson["group"] = true;
			}
			if ($(this).attr("fieldsum")) {//sum
				tempJson["sum"] = true;
			}
			if ($(this).attr("fieldmax")) {//max
				tempJson["max"] = true;
			}
			if ($(this).attr("fieldmin")) {//min
				tempJson["min"] = true;
			}
			if ($(this).attr("fieldavg")) {//avg
				tempJson["avg"] = true;
			}
			json["selectFields"].push(tempJson);
			//过滤条件json
			json["whereJson"] = dataFilter.filterWhereJson;
			//保存多表关联信息
			if (dataFilter.connInfo.length) {
				json["connInfo"] = dataFilter.connInfo;
			}
			//筛选信息
			if ($(".right_where_column").find(">li").length) {

			}
		});

		json["sql"] = dataFilter.sql;
		if ($("#resultCount").prop("checked")) {
			var tempJson = {};
			tempJson["fieldId"] = "countNum";
			tempJson["fieldTitle"] = $(".countTable .countTitleDiv").text();
			tempJson["tableName"] = "";
			json["selectFields"] = [];
			json["selectFields"].push(tempJson);
			json["sql"] = dataFilter.countSql;
		}
		return json;
	},

	/**
	 * 保存数据集
	 */
	save : function() {
		var dataSetTables = dataFilter.getExistTables(), json = dataFilter.createSaveJson(), dataSetName = $(".dataSetName").val(), flowId = SITECONFIG.FLOWID ? SITECONFIG.FLOWID : 1, dataSetId = dataFilter.dataSetId ? dataFilter.dataSetId : "";

		var b64 = new Base64();
		var newsql = b64.encode(json.sql);
		json["sql"] = newsql;
		console.log(json);
		_commonAjax({
			processData : false,
			data : {
				"flowId" : flowId,
				"json" : JSON.stringify(json),
				"dataSetName" : dataSetName,
				"dataSetId" : dataSetId,
				"dataSetTables" : JSON.stringify(dataSetTables),
				"siteId" : SITECONFIG.SITEID
			},
			async : false,
			url : SITECONFIG.GROUPPATH + "/Query/saveAQuerierData",
			type : "POST",
			success : function(result) {
				if (result) {
					dataFilter.dataSetId = result;
					dataSetId = result;
					$(".dataSaveTips").text("数据查询已保存成功！").css("color", "green").show();
					setTimeout(function() {
						if (dataFilter.isFromForm) {
							// $(window.parent.document).find("#dataBind").val(dataSetName).data("dsData",{
							// "dataSetId" : dataSetId,
							// });
							var $parentData = window.parent.ezCommon.data;
							var $data = $parentData["dataObj"];
							var data = $parentData["data"];
							var $selectObj = $parentData["selectObj"], ctrlName = $parentData["ctrlName"];
							var sql = json["sql"].split("limit")[0];
							var filedList = '<select class="queryItem form-control" style="width:' + ($data.width() + 10) + 'px" queryName="' + dataSetName + '" queryId="' + dataSetId + '"><option>请选择</option>';
							$.each(json["selectFields"], function(key, value) {
								filedList += '<option filed="' + value["tableName"] + '.' + value["fieldId"] + '" queryTable="' + dataSetTables + '" queryId="' + dataSetId + '" querySql="' + sql + '">' + value["fieldTitle"] + '</option>';
							});
							$data.next().remove();
							$data.after(filedList);
							$parentData["callback"]($selectObj, $data, ctrlName, data);
						}
						if (_getUrlParas('attrSet') == "1") {
							$(window.parent.document.body).find(".right-menu .dyna-data").click();
						} else if (_getUrlParas('attrSet') == "111") {
							$(window.parent.document.body).find("#ctrlActionList [actiontype='moreLayout'] .choseData option[value='__blank']").after("<option value='" + dataSetId + "'>" + dataSetName + "</option>");
						}

						formInfoDataHtml = dataFilter.getDataSourseList();
						$(window.parent.document).find(".data-list").append(formInfoDataHtml);

						$(".dataSetModal").modal("hide");
						$(window.parent.document).find("#panelWin").remove();

					}, 600);
					//将新建的数据源存到全局变量中
					window.parent.ezCommon.cacheDataSource.push({
						"ID" : result,
						"querierName" : dataSetName
					});
				} else if (result == 0) {
					$(".dataSaveTips").text("保存失败！").css("color", "red").show();
				} else {
					$(".dataSaveTips").text("名称已存在！").css("color", "red").show();
				}
			}
		});
		$("#submitsourcename").val("");
	},

	/**
	 * 查询当前项目所有数据源
	 * @param string flowId 站点id 或 流程id
	 */
	getProjectFormInfo : function(flowId) {
		var formData = "", formItem = "";
		$.ajax({
			url : SITECONFIG.ROOTPATH + "/FormData/getAllFlowQuerier",
			type : "POST",
			data : {
				"flowId" : flowId,
				"siteId" : SITECONFIG.SITEID
			},
			cache : false,
			async : false,
			dataType : "JSON",
			success : function(formList) {
				if (formList["data"]) {
					formData = formList["data"];
				}
			}
		});
		return formData;
	},

	/**
	 * 获取数据级列表
	 */
	getDataSourseList : function() {
		var formInfoData = dataFilter.getProjectFormInfo(SITECONFIG.FLOWID);
		var formInfoDataHtml = [], fieldData = {};
		$(window.parent.document).find(".data-list").empty();
		formInfoDataHtml.push('<ul class="formInfoList">');

		$.each(formInfoData, function(key, value) {
			formInfoDataHtml.push('<li dsid="' + value["ID"] + '">' + value["querierName"] + '</li>');
		});
		formInfoDataHtml.push('</ul>');

		return formInfoDataHtml.join("");
	},

	/**
	 * 删除数据集
	 */
	deleteDataSet : function(dsId) {
		var isDeleted = "";
		_commonAjax({
			processData : false,
			data : {
				"dataSetId" : dsId,
				"siteId" : SITECONFIG.SITEID
			},
			async : false,
			url : SITECONFIG.GROUPPATH + "/Query/delAQuerier",
			type : "POST",
			success : function(result) {
				isDeleted = result;
			}
		});
		return isDeleted;
	},

	/**
	 * 修改数据集名称
	 */
	changeName : function(dsId, newName) {
		var isChanged = "";
		_commonAjax({
			processData : false,
			data : {
				"dataSetId" : dsId,
				"dataSetName" : newName,
				"siteId" : SITECONFIG.SITEID
			},
			async : false,
			url : SITECONFIG.GROUPPATH + "/Query/updAQuerierName",
			type : "POST",
			success : function(result) {
				isChanged = result;
			}
		});
		return isChanged;
	},
	/**
	 * 过滤条件结构
	 */
	filterhtml : function() {
		var liHtml = '<li class="with_1"><span class="r1 w1"><select class="orWhere selecCon logic"><option value="and">并且</option><option value="or">或者</option></select>' + '</span><span class="tit r1"></span><span class="r1"><select class="relation"><option value="0">等于 </option><option value="1">不等于 </option>' + '<option value="2">大于</option><option value="3">小于 </option><option value="4">包含</option><option value="5">不包含</option><option value="6">小于等于 </option>' + '<option value="7">大于等于</option><option value="8">匹配</option></select></span><span class="r1"><input type="text" class="form-control input-sm condVal" style="width:180px;text-indent: 10px;"/>' + '</span><span class="glyphicon glyphicon-plus add-condition"></span><ul class="withFieldFilter"></ul></li>';
		return liHtml;
	}
};
