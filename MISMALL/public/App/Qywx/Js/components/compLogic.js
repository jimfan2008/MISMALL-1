/**
 * @author 陈毅
 * @desc 自定义组件逻辑处理（从组件事件文件compEvent.js中分离出来的）
 * @time 2015-09-02
 */
define(function(require, exports, module) {

	var ajaxData = require("../ajaxData");

	var compLogic = {

		get : function() {
			return component;
		},

		set : function($obj) {
			$obj.show();
		},

		init : function($obj) {
			$obj.find(".colInner").each(function() {
				compLogic.colInnerSortable($(this));
			});
		},

		/**
		 *  加载自定义组件属性
		 */
		loadAttrs : function() {
			require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/ctrlCommon.js", function(e) {
				e.loadAttrs(component);
			});
		},

		/**
		 * 设置自定义组件属性
		 */
		setAttrs : function($compLogic) {
			require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/ctrlCommon.js", function(e) {
				e.setAttrs(component);
			});
		},

		/**
		 * 加载组件动作设置的HTML结构（操作交互中的内容）
		 */
		loadAction : function(ctrlType) {
			require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/ctrlCommon.js", function(e) {
				e.loadAction(ctrlType, "components");
			});
		},

		/**
		 * 获取数据集列表
		 */
		getDataSourseList : function() {
			if (ezCommon.cacheDataSource.length == 0) {
				var formInfoData = ajaxData.getProjectFormInfo(SITECONFIG.FLOWID);
				if (formInfoData) {
					ezCommon.cacheDataSource = ezCommon.cacheDataSource.concat(formInfoData);
				}
			}
			var formInfoDataHtml = [], fieldData = {};
			$(".data-list :not(div)").empty();
			if (ezCommon.cacheDataSource.length != 0) {
				formInfoDataHtml.push('<ul class="formInfoList">');
				$.each(ezCommon.cacheDataSource, function(key, value) {
					formInfoDataHtml.push('<li dsid="' + value["id"] + '">' + value["querierName"] + '</li>');
				});
				formInfoDataHtml.push('</ul>');
				return formInfoDataHtml.join("");
			}

		},

		/**
		 * 当数据集列表中的数据集被单击时：获取对应字段列表 （cy）
		 */
		onDataSetListClick : function($dataSetItem) {
			if (!$dataSetItem.hasClass("fieldSelect")) {
				$dataSetItem.parent().find("li").removeClass("fieldSelect");
				$dataSetItem.addClass("fieldSelect");
			}
			var isFormInfoList = $dataSetItem.parent().find("li").hasClass("fieldSelect");
			$(".fieldlist").empty();
			var newDsId = $dataSetItem.attr("dsId"), formName = $dataSetItem.text();
			fieldHtml = [], fieldsList = [];

			fieldData = ajaxData.getFormFieldInfo(newDsId);
			fieldsList = fieldData["selectFields"];

			if ($dataSetItem.parent().find("li").hasClass("fieldSelect")) {
				$dataSetItem.parents(".formcontent").animate({
					"margin-left" : "-950px"
				});
			}

			$(".fieldcontent").find(".filed-name").text(formName + "字段列表").attr({
				"dsId" : newDsId
			});

			fieldHtml.push('<ul class="item-ul">');
			$.each(fieldsList, function(key, value) {
				fieldHtml.push('<li  fieldname="' + value["tableName"] + '_' + value["fieldId"] + '">' + value["fieldTitle"] + '</li>');
			});
			fieldHtml.push('<ul/>');
			fieldHtml = fieldHtml.join("");
			$(".fieldlist").append(fieldHtml);
		},

		/**
		 * 组件生成完毕后，添加到页面，赋予新的ID号，并加载属性等相关处理（cy）
		 */
		onComponentCompleted : function(customHtml, dsId) {
			$customComponent = $(compLogic.get().html);
			$customComponent.find(".colInner").append(customHtml);
			$(".selectedForm").append($customComponent);

			onCtrlDroped("customComponent", $customComponent);

			//更新控件序号
			ezCommon.updateCtrlIndex();

			var index = ezCommon.ctrlNameNum[ezCommon.formId], title = compLogic.get().cName + index, ctrlId = "compLogic" + index;

			$customComponent.attr("ctrlId", ctrlId).find(".fieldTitle").html(title);
			//每个控件（.ctrl）中的表单控件（如input select等）都有一个共同的属性:isbasectrl
			$customComponent.find("[isbasectrl]").attr("name", ctrlId);

			//初始化当前组件属性
			compLogic.loadAttrs();
			//设置当前组件属性
			compLogic.setAttrs($customComponent);
			//设置当前组件为选中状态
			$customComponent.click();
		},

		/**
		 * 初始化页面上的动态组件
		 */
		initComponent : function($comp, row) {
			if ($comp.attr("ishiden") != "true") {
				var $this = $comp;
				$this.hide();
				var colUnit = $this.find("[colUnit]:first");
				$this.find("[colUnit]:first");
				var loadDataFlag = $this.attr("firstloaddata");
				loadDataFlag = (loadDataFlag == "false" ? false : true) || $("body").find("#siteContent").length <= 0;
				var dynaHtml = "";
				if (loadDataFlag) {
					dynaHtml = compLogic.loadPageComponentsData($this, null, null, null, row);
					if (!dynaHtml)
						return false;
					//加载页面上的动态组件数据
					$this.replaceWith(dynaHtml);
					var $vgPage = dynaHtml.find(".vgPage:first");
					var vgPageH = $vgPage.height();
					var colCount = $vgPage.closest("[colunit]").attr("colunit");
					var newH = vgPageH / parseInt(colCount);
					dynaHtml.find(".vgPage").css({
						height : newH,
						width : "100%",
						"min-height" : 0
					}).find(".editImgBtn").remove();
					dynaHtml.fadeIn("fast");
				} else {
					$this.hide();
				}
			}
		},

		/**
		 * 设置组件Id号
		 */
		setComponentId : function(ctrlType, $customComponent) {
			//更新控件序号
			ezCommon.updateCtrlIndex();
			var index = ezCommon.ctrlNameNum[ezCommon.formId], title = compLogic.get().cName + index, ctrlId = ctrlType + index;
			$customComponent.attr("ctrlId", ctrlId).find(".fieldTitle").html(title);
		},

		/**
		 * 设置组件内部各字段控件的ID,并存入JSON
		 */
		setCompFieldId : function(ctrlType, title) {
			//更新控件序号
			ezCommon.updateCtrlIndex();
			var index = ezCommon.ctrlNameNum[ezCommon.formId], ctrlId = ctrlType + index;
			//添加控件JSON节点
			require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/formJson.js", function(e) {
				var title = title + index, ctrlId = ctrlType + index;
				e.add(ctrlType, ctrlId, title);
			});
			return ctrlId;
		},

		/**
		 * 新创建组件时，组装组件HTML
		 * @param selectFieldInfo 当前选中数据源的数据信息
		 * @return  customHtml 返回组装好的组件HTML
		 */
		getComponentHtml : function(selectFieldInfo) {
			// 自定义组件主体HTML
			var customHtml = [];
			$.each(selectFieldInfo, function(key, value) {
				var fieldName = value["fieldName"].toLowerCase();
				(fieldName.indexOf("image") != -1 || fieldName.indexOf("photo") != -1) ? isImgField = true : isImgField = false;
				//判断当前选择的字段是否为图片
				if (isImgField) {
					var ctrlId = compLogic.setCompFieldId("IMAGE", "图片");
					customHtml.push('<div class = "thisisField ctrl" fieldtype="ccimage" ctrl-type="IMAGEBOX" ctrlId = "' + ctrlId + '" fieldname="');
					customHtml.push(value["fieldName"]);
					customHtml.push('" fieldtitle="');
					customHtml.push(value["fieldTitle"]);
					customHtml.push('"> <span class="fieldDataTitle">');
					customHtml.push(value["fieldTitle"]);
					customHtml.push(':</span><img class="img-responsive"');
					if (value["data"] !== "没有任何数据") {
						customHtml.push('');
						customHtml.push(' src="' + value["data"] + '"/></div>');
					} else {
						customHtml.push(' src="' + SITECONFIG.PUBLICPATH + "/App/Qywx/Images/upimg.png" + '"/></div>');
					}

				} else {
					var ctrlId = compLogic.setCompFieldId("TEXT", "文本");
					customHtml.push('<div class = "thisisField ctrl" ctrl-type="TEXT" ctrlId = "' + ctrlId + '" fieldType = "cctext" fieldtitle="');
					customHtml.push(value["fieldTitle"]);
					customHtml.push('"  fieldName = "');
					customHtml.push(value["fieldName"]);
					customHtml.push('"><span class="fieldDataTitle">');
					customHtml.push(value["fieldTitle"]);
					customHtml.push(': </span><span class="fieldContent">');
					customHtml.push(html_decode(value["data"]));
					customHtml.push('</div>');
				}
			});
			return customHtml.join("");
		},

		/**
		 * 根据页面中的动态组件，获取组件模版html及其中包含的字段,用于组件的数据更新和组件的保存时
		 */
		getDynaTpl : function($dynaComp, changedColUnit) {
			var $tempDynaComp = $dynaComp.clone();
			var $subDynaComp = $dynaComp.find("[colunit]:first [ctrl-type='compLogic']");
			$tempDynaComp.find(">[rowUnit]:not(:first)").remove();
			if (changedColUnit) {
				$tempDynaComp.find("[colUnit]").not(changedColUnit).remove();
			} else {
				$tempDynaComp.find(" > [colUnit]:not(:first)").remove();

			}

			$tempDynaComp.find("[fieldname]").each(function() {
				if ($(this).attr("src")) {
					$(this).attr("src", "");
				} else {
					$(this).find(".fieldContent").empty();
				};
			});

			var componentTplHtml = $tempDynaComp[0].outerHTML;
			return componentTplHtml;
		},

		/**
		 * 页面加载时，页面上动态组件重新拉取数据
		 * @para $dynaComp 动态组件对象
		 */
		loadPageComponentsData : function($dynaComp, colUnit, fieldArray, where, row, pageSize, queryId) {
			var dsId = $dynaComp.attr("formId") || $dynaComp.parent().attr("formId"), componentTplHtml = compLogic.getDynaTpl($dynaComp), componentData = [];
			var query = $dynaComp.attr("query") || $dynaComp.parent().attr("query");
			row = row == 0 ? 0 : 1;
			if (queryId) {
				dsId = queryId;
			}
			if ($dynaComp.hasClass("newTpl")) {
				ctrlHtml = $dynaComp;
			} else {
				/*
				 var cominfo = compLogic.getFormFieldInfo(dsId);
				 var sql = cominfo["sql"];
				 var condJson = cominfo["condJson"];
				 if (!sql)
				 return false*/
				;
				if (!colUnit) {
					colUnit = $dynaComp.clone().find("[colUnit]:first");
				}
				/*
				 if (condJson) {
				 $.each(condJson, function(key, item) {
				 $.each(item, function(i_k, i_v) {
				 var dataType = i_v["dataType"];
				 if (dataType == "form") {
				 var nodeType = i_v["nodeType"], sCtrl = nodeType.split(".");
				 var ctrl = sCtrl[1], val = "";
				 if (ctrl.indexOf("CCDropDown") >= 0) {//下拉框
				 val = $("select[name='" + ctrl + "']").val();
				 if (val == '__blank') {
				 query = val;
				 }
				 } else if (ctrl.indexOf("CCTextBox") >= 0) {//文本框
				 val = $("input[name='" + ctrl + "']").val();
				 }
				 sql = sql.replace('$' + nodeType + '$', val);
				 }
				 });
				 });
				 }*/

				colUnit.find('[ctrl-type="ctrl-dynamic"]').remove();
				fieldEle = colUnit.find("[fieldname]");
				// if (!fieldArray) {
				// var fieldArray = "";
				// var sqlcond = " where 0";
				// fieldEle.each(function() {
				// var fieldname = $(this).attr("fieldname");
				// var as = fieldname.replace(/_/g, ".").replace("cc.", "cc_");
				// sqlcond += " OR " + fieldname + " like '%" + where + "%'";
				// fieldname = as + " as " + fieldname;
				// fieldArray += fieldname + ",";
				//
				// });
				// fieldArray = fieldArray.substring(0, fieldArray.length - 1);
				// }

				//组件数据精确查询
				var arrayWhere = [];
				if (where) {
					//arrayWhere = where.split("$$##!!@@**^^%%");
				}
				if (arrayWhere.length) {
					//var sqlcond = "where " + arrayWhere[1] + " = '" + arrayWhere[0] + "'";
				}
				var limit = "";
				/*
				if (sql.split("limit").length > 1) {
				//limit = " limit " + sql.split("limit")[1];
				}*/

				//sql = where ? "select * from ( " + sql + ") as dataTable " + sqlcond + limit : sql;
				if ( typeof (dataSetId) != "undefined") {
					//	sql = parseInt(dataSetId) ? "select * from (" + sql + ") as temp where  ID=" + rowId : sql;
				}
				if (dataSetId == '' || typeof (dataSetId) == "undefined") {
					var dataSetId = $dynaComp.attr("formid");
				}
				//暂时只显示一条数据*******************************
				//此处不要去删除,修改问小皮

				//if(pageSize && sql.split("limit").length > 1) {
				//	var sqls = sql.split("limit");
				//	sql = sqls[0] + "limit " + pageSize + ",1";
				//}
				//************************************************
				var ctrlHtml = null;
				if (query == "__blank" && $("body").find("#siteContent").length > 0) {
					componentData = "";
				} else {
					var sortData = $dynaComp.attr("sortData");
					/*
					 if (sortData == "ASC") {
					 sql = sql.replace(/DESC/g, "ASC");
					 } else {
					 sql = sql.replace(/ASC/g, "DESC");
					 }*/

					var praiseComp = "";
					$dynaComp.find('[syscomtype="some-praise"]').each(function() {
						var ctrlId = $(this).attr("ctrlId");
						if (ctrlId) {
							praiseComp += ctrlId + ",";
						}
					});
					if (praiseComp != "") {
						praiseComp = praiseComp.substring(0, praiseComp.length - 1);
					}
					//praiseComp 这个参数为了满足点赞组件加进去
					var jsonParam = {
						"type" : "select",
						"queryId" : dsId,
						"form" : ezCommon.getCurrFormValueList(),
						"where" : "",
						"mask" : false,
						"sort" : sortData
					};
					componentData = ezCommon.curd(jsonParam, 1, 0, praiseComp);

					//componentData = ezCommon.querySqlData(sql, 1, 0, praiseComp);

					ctrlHtml = compLogic.loadComponentData(false, componentTplHtml, componentData, row, null, query);
				}
				var ctrlHtmlCountSize = 0;
				if (objIsnull(ctrlHtml)) {
					if (componentData.length <= 0) {
						if ($("body").find("#siteContent").size() > 0) {
							if (pageSize) {
								if (ctrlHtml.find(".dataNull").length <= 0) {
									//if(ctrlHtml.find(".formCtrl").length<=0){
									ctrlHtml.find(".col-md-12:first").hide();
									ctrlHtml.append("<p class='dataNull' style='width:100%;height:50px;line-height:50px;text-align:center;'>没有你想要的信息 !<p/>");
									//}
								}
							}
							if (row == 0) {
								if (ctrlHtml.find(".dataNull").length <= 0) {
									ctrlHtml.append("<p class='dataNull' style='width:100%;height:50px;line-height:50px;text-align:center;background:#f5f5f5'>没有你想要的信息 !<p/>");
									ctrlHtml.find(".col-md-12:first").hide();
								}
							}
						}
					} else {
						ctrlHtml.attr("display", "block");
						ctrlHtml.find(".col-md-12:first").show();
						ctrlHtml.find(".dataNull").remove();
					}
					ctrlHtmlCountSize = ctrlHtml.find("[colUnit]").length;

					if (ctrlHtml.attr("autorefresh") && typeof (weId) != "undefined") {//组件数据自动更新 陈毅
						var dsId = ctrlHtml.attr("formId");
						$rowUnit = ctrlHtml.find("[rowid]:first");
						if ($rowUnit) {
							$rowUnit = ctrlHtml.find("[rowunit='n']");
						}
						//ctrlHtml.find("[rowId]").remove();
						compLogic.getNewMessage(dsId, ctrlHtml, $rowUnit);
					}
				}

				var $subDyna = $dynaComp.find('[colUnit]:first [ctrl-type="ctrl-dynamic"]'), subLen = $subDyna.length;
				if (subLen > 0) {
					var i = 0, len = componentData['sql'].length;
					for (; i < len; i++) {

						var parentId = componentData['sql'][i]["ID"];
						$.each($subDyna, function(j, value) {
							var subSql = $(value).attr("sql"), subDsId = $(value).attr("formId"),
							//connInfo = compLogic.getDataSetRelation(dsId, subDsId);
							subcomponentTplHtml = compLogic.getDynaTpl($(value));
							/*
							 var subLimit = "";
							 if (subSql.split("limit").length > 1) {
							 subLimit = " limit " + subSql.split("limit")[1];
							 }
							 newSql = subSql.split("limit")[0] + " and " + connInfo + "" + parentId + subLimit;*/

							var jsonParam = {
								"type" : "select",
								"queryId" : subDsId,
								"form" : ezCommon.getCurrFormValueList(),
								"where" : "",
								"mask" : false,
								"relation" : {
									"dsId" : dsId,
									"subId" : subDsId,
									"parentId" : parentId
								}
							};
							subComponentData[queryId] = ezCommon.curd(jsonParam);
							//subComponentData = ezCommon.querySqlData(newSql);
							var index = j + i * subLen;
							subCtrlHtml = compLogic.loadComponentData(false, subcomponentTplHtml, subComponentData, row, null, query);
							if (subComponentData.length) {
								$(ctrlHtml).find('[ctrl-type="ctrl-dynamic"]:eq(' + index + ')').replaceWith(subCtrlHtml);
							} else {
								$(ctrlHtml).find('[ctrl-type="ctrl-dynamic"]:eq(' + index + ')').css("display", "none");
							}
						});
						if (i == ctrlHtmlCountSize - 1) {
							break;
						}
					}
				}
			}
			//模版和数据融合
			//将原位置的组件替换成包含最新数据的组件
			if ($dynaComp.attr("ishiden") == "true") {
				ctrlHtml.css("display", "none");
			}

			return ctrlHtml;
		},

		/**
		 * 获取数据集最新数据 （可用于定时更新动态组件数据）
		 */
		getNewMessage : function(dsId, $obj, $rowUnit) {
			var from = $obj.find("[rowId]").length, firstOpen = 0, timer = parseInt($obj.attr("autorefresh"));
			var sortData = $obj.attr("sortData");
			var isAppendData = $obj.attr("isAppendData");
			isAppendData = isAppendData ? true : false;
			//刷新间隔时间
			$obj.attr("from", from);

			//获取消息
			var getNewMsgData = function() {
				var from = $obj.attr("from");
				var newMsgData = "";
				var formCtrls = {};
				$("[name]").each(function() {
					var name = $(this).attr("name"), val = $(this).val();
					if (val) {
						formCtrls[name] = val;
					}
				});
				var linkParaJson = 0;
				if ( typeof (linkParas) != "undefined") {
					linkParaJson = linkParas ? linkParas : 0;
				}
				$.ajax({
					type : "post",
					url : APPPATH + "/FormData/getNewMessage",
					data : {
						"max_id" : from,
						"we_id" : weId,
						"dataset_id" : dsId,
						"formCtrlJson" : JSON.stringify(formCtrls),
						"linkParas" : linkParaJson,
						"sort" : sortData,
						"isAppendData" : isAppendData,
						"siteId" : SITEID
					},
					dataType : "json",
					async : false,
					success : function(msg) {
						$obj.attr("from", msg["maxID"]);
						if (msg) {
							newMsgData = msg;
						}
					}
				});
				return newMsgData;
			};
			clearInterval(compLogic.ctrlid);
			compLogic.ctrlid = setInterval(function() {
				var newMsgData = null;
				if (isAppendData) {
					ezCommon.isLoadShow = false;
					var dynaHtml = compLogic.loadPageComponentsData($obj, null, null, null, 0);
					$obj.replaceWith(dynaHtml);
					compLogic.reSetHeight(dynaHtml);
				} else {
					newMsgData = getNewMsgData()["lists"];
					if (!newMsgData)
						return;
					var i = 0, len = newMsgData.length;
					var newRows = "";
					for (; i < len; i++) {
						var rowHtml = '<div rowunit="n" class="row" rowid="' + newMsgData[i]["ID"] + '">';
						var $rowObj = $rowUnit.clone();
						for (var j in newMsgData[i]) {
							var fieldObj = $rowObj.find("[fieldname = '" + j + "']");
							if (fieldObj.length) {
								var fieldType = fieldObj.attr("fieldtype");
								if (fieldType == "cctext") {
									fieldObj.find(".fieldContent").html(newMsgData[i][j]);
								} else {
									fieldObj.find(".fieldContent").attr("src", newMsgData[i][j]);
								}
							}
						}
						newRows += rowHtml + "" + $rowObj.html() + "" + "</div>";
					}

					if (!rowHtml) {
						return false;
					}

					var sortData = $obj.attr("sortData");
					if (sortData == "ASC") {
						$obj.find(".col-md-12:first").append(newRows);
						var wHeight = $(window).height();
						var height = $(document.body).height();
						if (top >= (height - 150)) {
							$("html,body").scrollTop($(document.body)[0].scrollHeight);
						}
						if (firstOpen == 0) {
							$("html,body").scrollTop($(document.body)[0].scrollHeight);
						}
					} else {
						$obj.prepend(newRows);
						//新消息添加到头部
					}
					$obj.find(".dataNull").remove();
				}
			}, timer * 1000);
		},

		/**
		 * 加载组件模版和字段数据
		 * @param {bool} isInit 是否为新建模块
		 * @param {String} tpl 组件模版html
		 * @param {Json} queryData 组件数据
		 * @param {int} rowLength 显示多少行
		 * @param {object} sField 勾选的字段名和title健值对对象(可选)
		 * @param {bool} query 是否添加查詢功能(可选)
		 */
		loadComponentData : function(isInit, tpl, queryData, rowLength, sField, query) {
			var $rowUnit = $(tpl).find("[rowUnit]");
			//行循环体
			var $colUnit = $rowUnit.find("[colUnit]");
			//列循环体
			var $parent = $(tpl);

			var data = queryData['sql'] || queryData;
			var total = data.length;
			var checkeddata = $parent.attr("checkeddata");
			//总记录数
			if (total > 0) {
				$parent.find("[rowUnit]").remove();
				var html = "";
				var f = {
					"1" : 'col-md-12',
					"2" : 'col-md-6',
					"3" : 'col-md-4',
					"4" : 'col-md-3',
					"6" : 'col-md-2',
					"12" : 'col-md-1'
				};
				var cols = parseInt($colUnit.attr("colUnit")), //每行多少列
				rows = 0, //在页面上要显示多少行（每行cols = 3列）
				//标识最后一行是否有空余
				isIntRows = false;

				//标识最后一行是否有空余
				if (total % cols > 0) {//最后一行有空余
					rows = Math.floor(total / cols) + 1;
					isIntRows = true;
				} else {//最后一行刚好填满
					rows = Math.floor(total / cols);
				}
				for (var i = 0; i < rows; i++) {
					var rowId = data[i]["ID"];
					$colUnit.attr("rowId", rowId);
					var rowStar = $rowUnit.empty()[0].outerHTML;
					html += rowStar.substring(0, rowStar.length - 6);
					var len = 0;
					if (isIntRows)
						len = i == rows - 1 ? i * cols + total % cols : cols * (i + 1);
					else
						len = cols * (i + 1);

					for (var j = i * cols; j < len; j++) {
						var $cu = $colUnit.clone();
						var $fieldEle = $cu.find("[fieldtype]");
						rowId = data[j]["ID"];
						$cu.attr("rowId", rowId);
						//点赞信息遍历 start
						var zanObj = $cu.find("div[btn_tp='zan']");

						$cu.removeClass($cu.attr("cols")).addClass(f[cols]).attr("cols", f[cols]);
						//为组件模版中的字段标识的元素填充字段内容
						if (isInit) {//动态组件初始化时，所选字段按顺序为组件赋值
							//第一次循环，只选出图片字段并赋值，
							$fieldEle.each(function() {
								var fieldtype = $(this).attr("fieldtype");
								if (fieldtype == "image") {//模版中某个元素是需要放图片的
									for (var field in data[j]) {
										if (field.toLowerCase().indexOf("image") >= 0) {
											var fieldValue = data[j][field];
											$(this).attr({
												"src" : fieldValue,
												"fieldname" : field,
												"fieldTitle" : sField[field]
											});

											$(this).parent().find(".fieldDataTitle").html(sField[field] + ": ");
										}
									}
								}
							});
							var fields = [];
							//临时存放所有非图片字段，用于后面的顺序赋值
							$.each(data[j], function(f, item) {
								if (f.toLowerCase().indexOf("ccimage") == -1 && f != "ID") {
									var field = {
										name : f,
										value : item,
									};
									fields.push(field);
								};
							});
							//第二次循环，为非图片字段赋值
							$fieldEle.not("[fieldtype = 'ccimage']").each(function(idx) {
								if (idx == 0) {
									zanText = zanObj.find("button").text();
								}
								if (fields[idx].name.toLowerCase().indexOf("ccimage") == -1) {

									var fieldValue = fields[idx].value;
									$(this).attr({
										"fieldname" : fields[idx].name,
										"fieldTitle" : sField[fields[idx].name]
									});

									var $fieldContent = $(this).find(".fieldContent");
									if (fields[idx].name.toLowerCase().indexOf("userphoto") != -1) {
										$fieldContent.replaceWith('<img src="' + fieldValue + '" fieldname="' + fields[idx].name + '" fieldtitle="' + sField[fields[idx].name] + '" fieldtype="ccimage" ctrl-type="ctrl-image" data-type="controls" class="img-responsive editCtrl" style="border-color: rgb(204, 204, 204);">');
									} else {
										$fieldContent.html(fieldValue);
									}
									$(this).find(".fieldDataTitle").html(sField[fields[idx].name] + ": ");
								}

							});
						} else {//页面中的动态组件数据更新时，根据组件中指定的字段加载数据
							$fieldEle.each(function(i) {
								var fieldname = $(this).attr("fieldname");
								var fieldValue = data[j][fieldname];
								var $img = $(this).find("img");
								if ($img.length) {
									$img.attr("src", fieldValue);
									//$(this).find(".fieldDataTitle").html($(this).attr("fieldTitle") + ": ");
								} else {
									$(this).find(".fieldContent").html(html_decode(fieldValue));
									$(this).find(".fieldDataTitle").html($(this).attr("fieldTitle") + ": ");
								}
							});
						}
						var isZan = data[j]["isZan"] ? data[j]["isZan"] : 0;
						$cu.find('[syscomtype="some-praise"]').each(function() {
							var ctrlId = $(this).attr("ctrlId");
							$(this).find(".praiseNum").text(data[j][ctrlId]);
						});
						if (isZan) {
							$cu.find('[syscomtype="some-praise"]').find(".click_praise").addClass("isZan");
						} else {
							$cu.find('[syscomtype="some-praise"]').find(".click_praise").removeClass("isZan");
						}
						html += $cu[0].outerHTML;
					}
					html += '</div>';
					//编辑状态下，动态组件只加载一行数据
					if (rowLength > 0 && i == (rowLength - 1)) {
						break;
					}
				}
				$parent.append(html);
			}
			$parent.find(".queryWhere").remove();
			if (query == "true") {
				$parent.find(".col-md-12:first").before($('<div class="col-md-12 queryWhere"><div class="col-md-9 "><input type="text" class="form-control "></div><div class="col-md-3"><input type="button" class="btn queryBtn" value="查詢"></div></div>'));
			}
			if (!$parent.attr("ctrlId") || $parent.find(".dynamicName").size() <= 0) {
				$parent.find(".dynamicName").remove();
				var dynamicSize = ezCommon.controlLists[ezCommon.formId], ctrlId = $parent.attr("ctrlId");
				if (!dynamicSize) {
					ezCommon.controlLists[ezCommon.formId] = 1;
					ezCommon.controlLists[ezCommon.formId]++;
					dynamicSize = 1;
				}
				var dynamicName = "组件" + dynamicSize;
				if (ctrlId) {
					dynamicName = "组件" + ctrlId.replace(/compLogic/, '');
					$parent.attr({
						"mycompname" : dynamicName
					});
				} else {
					$parent.attr({
						"mycompname" : dynamicName,
						"ctrlId" : "compLogic" + dynamicSize
					});
				}
				//$parent.find(".col-md-12:first").before($("<div class='dynamicName'>" + dynamicName + "</div>"));
			}

			if (checkeddata == "true") {
				$parent.find(".checked").remove();
				$parent.find("[colunit] >.colInner").addClass("col-md-11 col-xs-11").css("width", "91.6667%").before('<div class="col-md-1 col-xs-1 checked"><input type="checkbox" value=""  name="checke"></div>');
			}
			return $parent;
		},

		/**
		 * 设置组件列数
		 */
		setDynaCols : function(colCount) {
			ezCommon.Obj.find("[colunit]:first").attr("colUnit", colCount);
			var $newDyna = compLogic.loadPageComponentsData(ezCommon.Obj, null, null, 0, 1);
			ezCommon.Obj.replaceWith($newDyna);
			ezCommon.Obj = $newDyna;

			compLogic.queryMyComp();
			compLogic.allColInnerSortAble();
			require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/formJson.js", function(e) {
				e.addNeedSavePage();
			});
		},

		/**
		 * 组件内部数据查询
		 */
		queryMyComp : function() {
			$(".queryBtn").unbind("click").click(function() {
				$(this).parent().parent().remove();
				var query = $(this).parent().parent().find("input").val();
				var ctrlHtml = compLogic.loadPageComponentsData($(".ctrlSelected"), null, null, query);
				$(".ctrlSelected").replaceWith($(ctrlHtml));

				compLogic.allColInnerSortAble();
				compLogic.queryMyComp();
			});
		},

		/**
		 * 组件内部控件可拖动排序,在打开页面，并初始化页面上的控件时调用（见pageManage.js文件中的changePge函数）
		 */
		allColInnerSortAble : function() {
			$(".colInner").each(function() {
				compLogic.colInnerSortable($(this));
			});

		},

		/**
		 *
		 */
		colInnerSortable : function($colInner) {
			$colInner.sortable({
				distance : "10",
				placeholder : "ui-state-highlight",
				tolerance : "pointer",
				connectWith : ".selectedForm , .colInner,.delMainTop",
				cursor : "crosshair",
				//containment : $colInner.closest('[ctrl-type="CTRLDYNAMIC"]'),
				scroll : false,
				axis : "y",
				start : function(e, ui) {
					var $dragger = ui.item;
					//拖动一开始，即设置当前拖动的元素为选中状态
					//ezCommon.setCtrlSelected($dragger);
					// var typeLogo = $dragger[0].tagName;
					// if (typeLogo == "DIV") {
						// $(".delMainTop").show();
						// $(".realMaintop").hide();
					// }
				},
				stop : function(e, ui) {
					var $this = ui.item;
					var thisId = $this.attr("ctrlId");
					var iden = null, method = "";
					if ($this.prev().length) {
						iden = $this.prev().attr("ctrlId");
						method = "after";
					} else if ($this.next().length) {
						iden = $this.next().attr("ctrlId");
						method = "before";
					} else {
						var $parentCol = $("[ctrlid = '" + thisId + "']", $colInner).parent();
						iden = $parentCol.attr("ctrlid") || $parentCol.attr("columnidx");
						method = "append";
					}
					if ($this.parent().hasClass("delMainTop")) {
						var deleteId = $this.attr("ctrlId");
						$this.remove();
						require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/formJson.js", function(e) {
							e.deleteCtrlJson(deleteId);
						});
					}
					$colInner.closest('[ctrl-type="compLogic"]').find(".colInner").not($colInner).not("[columnidx]").each(function() {
						var $temp = $("[ctrlid = '" + thisId + "']", $(this)).clone();
						var $parent = $("[ctrlid = '" + iden + "']", $(this));
						$parent = $parent.length ? $parent : $("[columnidx = '" + iden + "']", $(this));
						//容器对象
						$("[ctrlid = '" + thisId + "']", $(this)).remove();
						$parent[method]($temp);
					});
				}
			});
		},

		/**
		 * 向组件中拖动添加控件（通常是分栏，用于布局）时，相同位置的数据栏位也同时添加。
		 */
		autoAddCtrl : function($ctrl, $colUnit, $comp) {
			var $this = $ctrl;
			var thisId = $this.attr("ctrlId");
			var iden = null, method = "";
			if ($this.prev().length) {
				iden = $this.prev().attr("ctrlId");
				method = "after";
			} else if ($this.next().length) {
				iden = $this.next().attr("ctrlId");
				method = "before";
			} else {
				iden = $ctrl.parent().attr("ctrlid");
				method = "append";
			}
			$comp.find("[colunit]").not($colUnit).each(function() {
				var $temp = $ctrl.clone();
				var $parent = $("[ctrlid = '" + iden + "']", $(this));
				//容器对象
				$parent[method]($temp);
			});
		},

		/**
		 * 从组件中删除控件（通常是分栏，用于布局）时，相同位置的数据栏位也同删除。
		 */
		autoDeleteCtrl : function($ctrl, $colUnit, $comp) {
			var thisId = $ctrl.attr("ctrlId");
			$comp.find("[colunit]").not($colUnit).each(function() {
				var $temp = $("[ctrlid = '" + thisId + "']", $(this));
				$temp.remove();
			});
		}
	};

	var component = {
		html : '<div  class="row ctrl" firstloaddata="true" data-type="componentTpls" ctrl-type="compLogic"   componentTplId="myTpl"><div class="dyna-handle">|||</div><div class="dynamicName">自定义组件模板</div><div class="row" rowunit="n"><div class="col-md-12" cols="col-md-12" colunit="1"><div class = "colInner byCtrlPadding" byCtrlRadius="true" byCtrlBorder="true" byCtrlSize="true" text-color="true" pure-bg-color="true" border-bg-color="true" ><a href="javascript:;" class="ImagePreview"><img class="dataImage" byCtrlRadius="true" isbasectrl="true" byCtrlRadius="true" style="cursor:pointer;width:100%;" data-pictureSize="40" class="img_avatar" src="' + SITECONFIG.PUBLICPATH + '/App/Qywx/Images/componentbg.png" isbasectrl="true" data-radius="0"></a></div></div></div><div class = "ctrlIconWraper"></div></div>',
		cName : '自定义组件',
		attrs : {
			General : ["modifyDataBtn", "title", "setDynaCols", "isHidden", "is_firstloaddata", "checkedData"],
			style : ["isTitleElse", "fourChangeStyle", "borderWidth", "borderSingle", "padding", "paddingSingle", "margin", "marginSingle", "borderRadius", "borderRadiusSingle"]
		},
		event : {
			click : {
				title : "单击",
				action : {
					"base" : {
						"pageJump" : "页面跳转",
						"autoCalc" : "自动运算",
						"autoFill" : "自动填充",
						"callRule" : "调用规则",
						"ctrlHideOrShow" : "控件显示隐藏",
						"oneTouchDial" : "一键拨号",
						"setOperationMsgTip" : "操作提示",
						"unlockOrLocking" : "控件锁定解锁",
					},
					"data" : {
						"addNewData" : "新增数据",
						"componentUpdate" : "数据更新",
						"componentUpdateData" : "组件数据更新",
						"dataSourceUpdate" : "数据源更新",
						"deleteData" : "删除数据",
						"moreLayout" : "绑定制作层",
					},
					"wx" : {
						"attention" : "关注公众号",
						"generatedQrcode" : "生成二维码",
						"getLocation" : "获取地理位置",
						"playRedEnvelope" : "发红包",
						"sendMessage" : "发送消息",
						"setPay" : "微信支付",
						"setWXNotice" : "微信通知"
					}
				}
			}
		}
	};

	module.exports = compLogic;
});
