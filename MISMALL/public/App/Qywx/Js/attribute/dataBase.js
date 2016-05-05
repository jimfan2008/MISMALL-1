/**
 * @author kb228
 */

define(function(require, exports, module) {
	var ajaxData = require("../ajaxData");
	var $removePanle = $("#defaultList,.dataSet"), isGetDataSource = 1, flag = false, html = '', queryStr = '', childBiaoDan = '', childShuChu = '', pageParamHtml = '', ctrlDynamicStr = '', offset = 0, offsetTop = 0, offsetLeft = 0, apiResultStr = '', apiId = '', attrList = {
		attrBase : "",
		attrCtrl : "",
		attrParam : "",
		attrDataSource : ""
	}, dataBase = {

		init : function(dataType, $data, status) {
			flag = status;
			$("#defaultList").remove();
			html = '';
			if (dataType != "undefined" && dataType != "" && dataType != null) {
				$.each(ctrlData[dataType], function(key, value) {
					if (value == "ctrlDynamic") {
						ctrlDynamicStr = '';
						$(".selectedForm").find("[ctrl-type='compLogic']").each(function() {
							var ctrlName = ezCommon.Obj.attr("ctrlId");
							//if ($(this).attr("checkeddata")) {
							var ctrlId = $(this).attr("ctrlId"), ctrlType = $(this).attr("ctrl-type"), ctrlName = $(this).find(".dynamicName:first").html();
							ctrlDynamicStr += '<li id = "' + ctrlId + '" ctrlType ="' + ctrlType + '">' + ctrlName + '<ul class="menuChild" style="display:none;">';
							$(this).find("[colunit]:first").find("[fieldname]").each(function() {
								ctrlDynamicStr += '<li dataAttr="ctrlDynamic" filedName="' + $(this).attr("fieldname") + '">' + $(this).attr("fieldtitle") + '</li>';
							});

							ctrlDynamicStr += '</ul></li>';
							//}

						});

						html += ctrlDynamicStr;
					} else {
						html += dataSetHtml[value];
					}

				});
			}

			if (html != "") {
				html = '<div id="defaultList"><ul class="menu-item">' + html + '</ul></div>';
			}
			dataClick($data, flag);
		},

		dataEvent : function() {
			$(".right-menu").on("click", ".commonData ul li,.data .remove,.data .commonData .add-new-dynamic-data", function(e) {
				flag = true;
				e.stopPropagation();
				var $this = $(this), ctrlType = ezCommon.Obj.attr("ctrl-type");
				require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/controls/" + ctrlType + ".js", function(e) {
					var dataType = e.get()["attrs"]["Data"][0], $data = $("#" + dataType);
					funName = $this.attr("dataAttr");
					if (funList[funName]) {
						funList[funName]($this, $data);
					}
				});

			});
		},

		/**
		 * @desc 面板单击事件处理
		 */
		panalEvent : function($data) {
			$("#defaultList").unbind("click").on("click", "li", function(e) {
				flag = false;
				//e.stopPropagation();
				var $this = $(this), ctrlType = ezCommon.Obj.attr("ctrl-type");
				//dataType用于确认当前是默认值，还是数据绑定(cy)
				dataType = "", parentsId = $this.parent().parent().attr("id");
				var offset = $data.offset(), offsetTop = offset.top, offsetLeft = offset.left, scrollTop = $("#container").scrollTop();
				//滚动条到左边对距离
				var $removePanle = $("#defaultList,.dataSet");
				var dataValue = null;
				//时间 、自定义文本框定位 Strat
				var dataTop, dataLeft;
				var funName = $this.attr("dataAttr");
				scrollLeft = $(document).scrollLeft();
				//dataTop = offsetTop + $data.height() +scrollTop;

				if ($("#main").width() > $(window).width()) {
					dataLeft = offsetLeft - 5;
				} else {
					dataLeft = offsetLeft + 1;
				}
				$(".dataSet").css({
					"position" : "absolute",
					"left" : dataLeft + "px",
					"top" : dataTop + "px",
					"width" : ($data.width() + 10) + "px"
				});
				if (funList[funName]) {
					funList[funName]($this, $data);
					$removePanle.remove();
				}
				$(".dataSet input").blur(function() {
					$(".dataSet").remove();
				});
			});
		}
	}, funList = {

		/**
		 * @desc 获取系统参数
		 */
		systemParam : function($this, $data) {
			var sysParamType = $this.attr("id");
			var sys = ezCommon.getSysParam(sysParamType);
			var dataValue = {
				"type" : "systemParam",
				"value" : {
					"id" : sysParamType,
					"value" : sys
				}
			};
			$data.attr({
				"dataType" : "systemParam",
				"valueType" : sysParamType
			});
			$data.removeAttr("queryId field ctrlId ctrlType");
			setDataValue(dataValue, $data, flag);
			return dataValue;
		},

		/**
		 * 绑定api结果到表单控件
		 * $this 当前单击的li(api结果别名)
		 * $data fillVal文本框
		 */
		apiResult : function($this, $data) {
			$data.attr({
				"dataType" : "apiResult", //数据类型
				"nodePath" : $this.attr("nodePath"), //节点路径
				"desc" : "api结果." + $this.attr("title") //用于动作还原
			});
			$data.val("api结果." + $this.attr("title"));

		},

		/**
		 * @desc 数据源设置
		 */
		dataSource : function($this, $data) {
			var ctrlName = ezCommon.Obj.attr("ctrlId");
			$data.attr("dataType", "dataSource");
			if ($this.attr("childId") == "addDataSource") {//新增数据集
				$("#parentBody").css("overflow", "hidden");
				var url = SITECONFIG.ROOTPATH + "/Qywx/Query/dataFilter?flowid=1" + "&attrSet='data'&from=1&siteId=" + SITECONFIG.SITEID;
				htmWindowForNewForm("新增数据源", url);
				ezCommon.dataObj = $data;
				ezCommon.data = {
					"dataObj" : $data,
					"selectObj" : ezCommon.Obj,
					"ctrlName" : ctrlName,
					"callback" : function($selectObj, $data, ctrlName, data) {
						return changeDropDownValue($selectObj, $data, ctrlName, data);
					}
				};
			} else {
				var queryId = $this.attr("queryId");
				var sql = '', filedStr = '<ul class="queryItem "  queryName="' + $this.attr("title") + '" queryId="' + queryId + '"><li>请选择</li>';
				//var sql = '', filedStr = '<ul class="queryItem form-control" style="width:' + ($data.width() + 10) + 'px" queryName="' + $this.attr("title") + '" queryId="' + queryId + '"><li>请选择</li>';

				//查询数据源字段
				//var r = ezCommon.getQueryField(queryId);
				var r = ajaxData.getFormFieldInfo(queryId);
				if (r.length > 0) {
					//sql = r["querierData"]["sql"];
					for(var m = 0; m < r.length; m++) {
						var filed = r[m]["selectedField"];
						for (var i = 0; i < filed.length; i++) {
							if (filed[i]["tableName"]) {
								filedStr += '<li filed="' + filed[i]["fieldName"] + '.' + filed[i]["fieldId"] + '" queryTable="' + queryId + '" queryId="' +queryId+ '">' + filed[i]["fieldName"] + '</li>';
							} else {
								filedStr += '<li filed="' + filed[i]["fieldId"] + '" queryTable="' + queryId + '" queryId="' + queryId + '">' + filed[i]["fieldName"] + '</li>';
							}
						}
					}
					filedStr += '</ul>';
					//$data.after(filedStr);
					var $parent = $this.closest("#defaultList"), $filedStr = $(filedStr);
					if($parent.size()){
						$parent.after($filedStr.attr("style", $parent.attr("style")));
						$filedStr.css({
							"position" : "absolute",
							"margin-top" : "2px",
							"margin-left" : "15px",
							"z-index" : "1000",
							"background" : "#ffffff",
							"box-shadow" : "0 6px 12px rgba(0, 0, 0, 0.176)"
						}).find("li").css({
							"border" : "1px solid #F3f3f3",
							"cursor" : "pointer",
							"height" : "30px",
							"line-height" : 2,
							"padding-left" : "20px",
							"position" : "relative",
							"z-index" : 98
						});
						$parent.hide();
					}else{
						$(".DataAttr .attrDataSource ").append($filedStr);
						$filedStr.css({
							"position" : "absolute",
							"width" : "100%",
							"top" :"30px",
							"background" : "#fffff",
							"box-shadow" : "0 6px 12px rgba(0, 0, 0, 0.176)"
						}).find("li").css({
							"background":"#ffffff",
							"float" : "none",
							"margin" : "0",
							"padding" : "0",
							"width" : "100%",
							"border" : "1px solid #F3f3f3",
							"cursor" : "pointer",
							"height" : "30px",
							"line-height" : 2,
							"padding-left" : "20px",
							"position" : "relative",
							"z-index" : 98
						});
					}
					var jsonParam = {
						"type" : "select",
						"queryId" : queryId,
						"form" : ezCommon.getCurrFormValueList(),
						"where" : "",
						"mask" : false,
						"delLimit" : 1
					};
					var query = ezCommon.curd(jsonParam);
					if (ezCommon.Obj.attr("ctrl-type") == "TEXTBOX") {
						ezCommon.Obj.find("input").val();
					}
					
					$(".queryItem li").hover(function(ev){
						$(this).css("background","#f5f5f5");
					},function(ev){
						$(this).css("background","#ffffff");
					});
					$(".queryItem li").click(function() {
						var $option = $(this), queryName = $(this).parent().attr("queryName");
						var selectedFields = $option.attr("filed").replace(".", "_");
						var optionStr = '', queryId = $(this).attr("queryId");
						$.each(query, function(key, value) {
							optionStr += '<option value="' + value[selectedFields] + '" filed="' + selectedFields + '">' + value[selectedFields] + '</option>';
						});
						var queryField = selectedFields;
						var queryTable = $option.attr("queryTable");
						var queryId = $option.attr("queryId");
						dataValue = {
							"type" : "dataSource",
							"value" : {
								"id" : queryId,
								"value" : queryName + ": " + $option.html(),
								"queryField" : queryField,
							}
						};
						$data.attr({
							"filed" : queryField,
							"valueType" : queryId
						});
						//$(this).remove();
						setDataValue(dataValue, $data, flag);
						if (flag && ezCommon.Obj.attr("ctrl-type") == "DROPDOWN") {
							var chooseOption = '';
							var balnkLength = ezCommon.Obj.find("select option[value='__blank']").length;
							if (balnkLength == 1) {
								chooseOption = '<option value="__blank" selected = "selected">---请选择---</option>';
							}
							ezCommon.Obj.find("select").empty().append(chooseOption + optionStr);
							ezCommon.controlLists[ezCommon.formId][ctrlName]["attrs"]["item"] = {
								"items" : {
								},
							};
						}
						$(this).parent().remove();
					});

				}

			}

		},

		/**
		 * 当前数据Id
		 */
		currDataID : function($this, $data) {
			$data.attr({
				"dataType" : "currDataID",
				"valueType" : ""
			});
			$data.val("当前数据ID");
			$removePanle.remove();
		},

		/**
		 * @desc 当数据为空时
		 */
		rowDataNull : function($this, $data) {
			$data.attr({
				"dataType" : "rowDataNull",
				"valueType" : ""
			});
			$data.val("当数据为空时");
			$removePanle.remove();
		},

		/**
		 * @desc 清除
		 */
		clear : function($this, $data) {
			$removePanle.remove();
			$data.removeAttr("dataType filed valueType");
			ezCommon.Obj.find("[isbasectrl]").val("");
			dataValue = {
				"type" : "clear",
				"value" : {
					"id" : "",
					"value" : ""
				}
			};
			setDataValue(dataValue, $data);
		},

		/**
		 * @desc 随机数
		 */
		randomNum : function($this, $data) {
			$data.attr({
				"dataType" : "randomNum",
				"valueType" : "randomNum"
			});
			var randNum = new Date().getTime() + numRand("", true);
			dataValue = {
				"type" : "randomNum",
				"value" : {
					"id" : "randomNum",
					"value" : randNum,
				}
			};
			setDataValue(dataValue, $data, flag);
			$data.val(randNum);
		},

		/**
		 * @desc 表单控件值
		 */
		biaodankongjian : function($this, $data) {
			$data.attr({
				"valueType" : $this.attr("ctrlId"),
				"dataType" : "form",
				"value" : $this.html() //$data.val($this.html()); 这样设置后value不变?????待查 tlj
			});
			$removePanle.remove();
			$data.val($this.html());
		},

		/**
		 * @desc 输出控件值
		 */
		shuchukongjian : function($this, $data) {
			$data.attr({
				"valueType" : $this.attr("ctrlId"),
				"dataType" : "controls",
				"value": $this.html()  //这里不写还会出现问题?????待查 tlj
			});
			$removePanle.remove();
			$data.val($this.html());
		},

		/**
		 * @desc 页面参数
		 */
		pageParamItem : function($this, $data) {
			$data.attr({
				"valueType" : $this.attr("paramName"),
				"dataType" : "pageParam",
				"toPageId" : $this.attr("toPageId"),
				"formPageId" : $this.attr("fromPageID")
			});
			dataValue = {
				"type" : "pageParam",
				"value" : {
					"id" : $this.attr("paramName"),
					"value" : "页面参数:" + $this.html(),
					"toPageId" : $this.attr("toPageId"),
					"formPageId" : $this.attr("fromPageID")
				}
			};
			if (ezCommon.Obj.attr("ctrlType") == "DROPDOWN") {
				ezCommon.Obj.find("select").empty();
			}
			setDataValue(dataValue, $data);
			$data.val("页面参数:" + $this.html());
		},

		/**
		 * 组件
		 */
		ctrlDynamic : function($this, $data) {
			$data.attr({
				"valueType" : $this.attr("filedname"),
				"dataType" : $this.parent().parent().attr("id")

			});
			dataValue = {
				"type" : "pageParam",
				"value" : {
					"id" : $this.attr("ctrlid"),
					"value" : $this.html()
				}
			};
			$removePanle.remove();
			setDataValue(dataValue, $data);
		},

		/**
		 * @desc   指定日期
		 */
		assignDate : function($this, $data) {
			$(".setAttrs .dataSet").remove();
			var dataformat = $("#dateFormat").find("option:selected").val() || "yyyy-MM-dd HH:mm:ss", dataTime = '<div class = "dataSet" style="margin-top:5px;width:162px"><div id="dataTime" class="input-group date" ><input type="text"  size="12" class="form-control input-sm" readonly ="readonly"><span class="input-group-addon"><span class="glyphicon glyphicon-calendar"></span></span></div></div>';
			$data.after(dataTime);
			dataformat = dataformat;
			var param = {
				language : "zh-CN",
				weekStart : 1,
				todayBtn : 1,
				autoclose : 1,
				todayHighlight : 1,
				format : dataformat
			};
			$("#dataTime").datetimepicker(param).on("changeDate", function() {
				var timeVal = $("#dataTime").find("input").val();
				dataValue = timeVal;
				dataValue = {
					"type" : "date",
					"value" : {
						"id" : "assignDate",
						"value" : dataValue,
						"dataformat" : dataformat,
					}
				};
				setDataValue(dataValue, $data);
			});
		},

		/**
		 * @desc 但前日期
		 */
		currDate : function($this, $data) {
			$(".setAttrs .dataSet").remove();
			var dataformat = $("#dateFormat").find("option:selected").val() || "yyyy-MM-dd HH:mm:ss";
			var date = new Date().format(dataformat);
			dataValue = date;
			dataValue = {
				"type" : "date",
				"value" : {
					"id" : "currDate",
					"value" : dataValue,
					"dataformat" : dataformat,
				}
			};
			setDataValue(dataValue, $data);
		},

		/**
		 * @desc 前几天
		 */
		beforeDate : function($this, $data) {
			$(".setAttrs .dataSet").remove();
			var dataformat = $("#dateFormat").find("option:selected").val() || "yyyy-MM-dd HH:mm:ss";
			var dataTime = $('<div class="dataSet" style="margin-top:5px;width:162px"><div class="input-group"><input type="text" class="form-control" dataType="beforeDate" maxlength="2"><span class="input-group-addon">天</span></div></div>');
			$data.after(dataTime);
			dataTime.find("input").numeral();
			onValueChange($("input[dataType='beforeDate']")[0], function() {
				//dataValue = "当前系统时间前 " + setDataObj.find("input[dataType='beforeDate']").val() + " 天";
				dataValue = dataTime.find("input[dataType='beforeDate']").val();
				dataValue = {
					"type" : "date",
					"value" : {
						"id" : "beforeDate",
						"value" : dataValue,
						"dataformat" : dataformat,
					}
				};
				setDataValue(dataValue, $data);
			});

		},

		/**
		 * @desc 后几天
		 */
		afterDate : function($this, $data) {
			$(".setAttrs .dataSet").remove();
			var dataformat = $("#dateFormat").find("option:selected").val() || "yyyy-MM-dd HH:mm:ss";
			var dataTime = $('<div class="dataSet" style="margin-top:5px;width:162px"><div class="input-group"><input type="text" class="form-control" dataType="afterDate" maxlength="2"><span class="input-group-addon" >天</span></div></div>');
			$data.after(dataTime);
			dataTime.find("input").numeral();
			onValueChange($("input[dataType='afterDate']")[0], function() {
				//dataValue = "当前系统时间后 " + setDataObj.find("input[dataType='afterDate']").val() + " 天";
				dataValue = dataTime.find("input[dataType='afterDate']").val();
				dataValue = {
					"type" : "date",
					"value" : {
						"id" : "afterDate",
						"value" : dataValue,
						"dataformat" : dataformat,
					}
				};
				setDataValue(dataValue, $data);
			});
		},

		/**
		 * @desc 自增
		 */
		zizeng : function($this, $data) {
			$removePanle.remove();
			$data.attr({
				"dataType" : "zizeng",
				"valueType" : "+"
			});
			$data.val("+1");
			$data.focus();
		},

		/**
		 * @desc 自减
		 */
		zijian : function($this, $data) {
			$removePanle.remove();
			$data.attr({
				"dataType" : "zijian",
				"valueType" : "-"
			});
			$data.val("-1");
			$data.focus();
		}
	};

	/**
	 * @desc 属性面板跟随定位
	 */
	function dataSetEvent($data, $obj) {
		$("#defaultList").remove();
		var $html = $(html);
		if (!objIsnull(ezCommon.Obj.closest("[ctrl-type='compLogic']"))) {
			$html.find("#currDataID").hide();
		}
		$(".right-menu").append($html);
		setLocation($data, $obj);
		var $panle = null, ch = 0, cw = 0;
		$(".menu-item >li").hover(function() {
			$panle = $(this).find("ul");
			if ($(this).attr("id") == "dataSource") {
				$panle.find("li:not(:first)").remove();
				$("#dataSource [childId='addDataSource']").after(queryStr);
			} else if ($(this).attr("id") == "interface") {
			} else if ($(this).attr("id") == "biaodankongjian") {
				$(this).find(".menuChild").empty().append(childBiaoDan);
			} else if ($(this).attr("id") == "shuchukongjian") {
				$(this).find(".menuChild").empty().append(childShuChu);
			} else if ($(this).attr("id") == "TPshuchukongjian") {
				$(this).find(".menuChild").empty().append(childShuChu);
			} else if ($(this).attr("id") == "pageParamItem") {
				$(this).find(".menuChild").empty().append(pageParamHtml);
			} else if ($(this).attr("id") == "apiResult") {
				$(this).find(".menuChild").empty().append(apiResultStr);
			}
			//面板高度
			ch = $panle.height();
			//面板宽度
			cw = 120;
			// 面板到浏览器底部的距离
			var bh = $(window).height() - $(this).offset().top, panleTop = 0, maxHeight = bh + 50;
			if (bh < ch && ch > maxHeight) {
				ch = maxHeight;
			}

			if (bh < ch) {
				panleTop = bh - ch - 10;
			}

			$panle.css({
				"margin-top" : "-1px",
				"width" : cw + "px",
				"left" : -(cw + 2) + "px",
				"top" : panleTop + "px",
				"height" : ch + "px",
				"overflow-y" : "auto",
			});
			$panle.show();

			if ($("#defaultList").find(".menuChild:visible").size() > 0) {
				$("#defaultList .menuChild").hide();
				$panle.show();
			}

		}, function() {
			$("#defaultList .menuChild").hide();
			$(this).find("ul").show();
		});

		document.onmousemove = function(event) {
			if ($("#defaultList").size() == 1) {
				var ev = event || window.event;
				var add = 50, offset = $("#defaultList").offset(), t = offset.top, l = offset.left, h = $("#defaultList .menu-item").height(), w = $("#defaultList").width();
				if (ch > h) {
					h = ch;
				}
				if ($("#defaultList").find(".menuChild:visible").size() > 0) {
					if ((ev.pageX < (l - cw - add) || ev.pageX > (l + w ) || ev.pageY < (t - add) || ev.pageY > (t + h + add))) {
						$("#defaultList .menuChild").hide();
					}

				} else {
					if ((ev.pageX < (l - cw - add) || ev.pageX > (l + w + add) || ev.pageY < (t - add) || ev.pageY > (t + h + add))) {
						$("#defaultList").hide();
						document.onmousemove = null;
					}

				}
			} else {
				document.onmousemove = null;
			}

		};

	}

	/**
	 * 把设置的值放到控件上和更新控件JSON
	 */
	function setDataValue(dataValue, $data) {
		$data.val(dataValue.value.value);

		if (flag) {
			if ((ezCommon.Obj.attr("ctrl-type") == "DROPDOWN" || ezCommon.Obj.attr("ctrl-type") == "DROPDOWN") && dataValue.type == "dataSource") {
			} else {
				var now = new Date();
				var timeValue = "";
				var inputValue = "";
				if (dataValue.value.value) {
					if (dataValue.value.dataformat == "") {
						dataValue.value.dataformat = "yyyy-mm-dd hh:ii:ss";
					}
					switch(dataValue.value.id) {
						case "assignDate":
							var timeVal = $("#dataTime").find("input").val();
							ezCommon.Obj.find("input").val(timeVal);
							break;
						case "currDate":
							timeValue = new Date().format(dataValue.value.dataformat);
							ezCommon.Obj.find("input").val(timeValue);
							break;

						case "beforeDate":
							timeValue = Date.parse(now) - parseInt(dataValue.value.value) * 24 * 60 * 60 * 1000;
							$data.val("当前系统时间前" + dataValue.value.value + "天");
							inputValue = new Date(timeValue).format(dataValue.value.dataformat);
							ezCommon.Obj.find("input").val(inputValue);
							break;
						case "afterDate":
							timeValue = Date.parse(now) + parseInt(dataValue.value.value) * 24 * 60 * 60 * 1000;
							$data.val("当前系统时间后" + dataValue.value.value + "天");
							timeValue = new Date(timeValue).format(dataValue.value.dataformat);
							ezCommon.Obj.find("input").val(timeValue);
							break;
						case "user-defined":
							ezCommon.Obj.find("[isbasectrl]").val(dataValue.value.value);
							break;
					}
				}

			}

			if (ezCommon.Obj && flag) {
				if (ezCommon.Obj.attr("ctrl-type") != "TIME") {
					ezCommon.Obj.find("[isbasectrl]").val(dataValue.value.value);
				}
				require.async("../formJson.js", function(formJson) {
					formJson.update(ezCommon.Obj.attr("ctrlId"), "data", "defaultValue", dataValue);
				});
			}

		}
	}

	/**
	 * 获取二级面板对应的html结构
	 */
	var getChinaHtml = {

		biaodankongjian : function(flag) {
			var tempHtml = [];
			var ctrlName = ezCommon.Obj.attr("ctrlId");
			$(".selectedForm").find("[ctrl-type='TEXTBOX'],[ctrl-type='REMARK'],[ctrl-type='DROPDOWN'],[ctrl-type='TIME'],[ctrl-type='CHECKBOX'],[ctrl-type='IMAGE']").each(function() {
				var ctrlId = $(this).attr("ctrlId"), ctrlType = $(this).attr("ctrl-type"), ctrlName = $(this).find(".fieldTitle").text();
				tempHtml.push('<li dataAttr="biaodankongjian" ctrlId = "' + ctrlId + '" ctrlType ="' + ctrlType + '">' + ctrlName + '</li>');
			});

			attrList["attrCtrl"] = childBiaoDan = tempHtml.join("");
		},

		shuchukongjian : function(flag) {
			var tempHtml = [];
			var ctrlName = ezCommon.Obj.attr("ctrlId");
			$(".selectedForm").find("[ctrl-type='IMAGEBOX'],[ctrl-type='TEXT'],.editor-layer-switch").each(function() {
				var ctrlId = $(this).attr("ctrlid"), ctrlType = $(this).attr("ctrl-type"), ctrlName = $(this).find(".fieldTitle").text() || $(this).attr("fieldtitle");
				if (ctrlId) {
					tempHtml.push('<li dataAttr="shuchukongjian" ctrlId = "' + ctrlId + '" ctrlType ="' + ctrlType + '">' + ctrlName + '</li>');
				}
			});
			attrList["attrCtrl"] = childShuChu = tempHtml.join("");
		},
		//处理api执行结果
		apiResult : function(flag) {
			//如果不存在缓存则获取
			if (ezCommon.apiManageJsonCache.data == undefined) {

				//alert("apiResult undefined");
				/*
				 _commonAjax({
				 url:SITECONFIG.APPPATH+"/ApiManage/getApiResult",
				 data:{
				 'apiId':apiId,
				 'siteId':SITECONFIG.SITEID
				 },
				 async:false,
				 //dataType:"json",
				 success:function(result){
				 //console.log(result);
				 alert(result);
				 }
				 }); */
			} else {
				var aliasJson = "", aliasName = "", nodePath = "";
				var apiResultArray = [];
				$.each(ezCommon.apiManageJsonCache.data, function(k, v) {
					if (v.id == apiId) {
						aliasJson = eval("(" + v.alias + ")");
						$.each(aliasJson, function(k1, v1) {
							$.each(v1, function(k2, v2) {
								aliasName = v2.aliasName;
								nodePath = v2.nodePath;
								apiResultArray.push('<li dataAttr="apiResult" nodePath="' + nodePath + '" title="' + aliasName + '">' + aliasName + '<span class="delete"></span><span class="modify"></span></li>');
							});
						});
					}
				});
				apiResultStr = apiResultArray.join("");
			}
		},

		dataSource : function(flag) {
			//isGetDataSource 判断 getAllFlowQuerier返回的数据是否为空
			if (ezCommon.cacheDataSource.length == 0 && isGetDataSource == 1) {
				_commonAjax({
					//url : SITECONFIG.ROOTPATH + "/FormData/getAllFlowQuerier",
					url : SITECONFIG.ROOTPATH+"/Qywx/Query/getAllQueryDataSources",
					data : {
						'flowId' : 1,
						'siteId' : SITECONFIG.SITEID
					},
					async : false,
					dataType : "json",
					success : function(r) {
						if (r) {
							isGetDataSource = 1;
							tempHtml = getChinaHtml.getTempHtml(r);
							ezCommon.cacheDataSource = ezCommon.cacheDataSource.concat(r);
						} else {
							isGetDataSource = 0;
							queryStr = '';
						}
					}
				});
			} else {
				getChinaHtml.getTempHtml(ezCommon.cacheDataSource);
			}
		},

		getTempHtml : function(r) {
			var tempHtml = [];
			$.each(r, function(key, value) {
				tempHtml.push('<li dataAttr="dataSource" queryId="');
				tempHtml.push(value["id"]);
				tempHtml.push('" title="');
				tempHtml.push(value["querierName"]);

				tempHtml.push('">');
				tempHtml.push(value["querierName"]);
				tempHtml.push('<label><span class="delete"></span><span class="modify"></span></li>');
			});
			attrList["attrDataSource"] = queryStr = tempHtml.join("");
		},

		pageParamItem : function(flag) {
			pageParamHtml = '';
			var tempHtml = [];
			var formId = ezCommon.formId, pageId = "";
			if (formId) {
				pageId = $("#" + formId).parent().attr("id");
				if (pageId) {
					var paramJson = ezCommon.getLinkParam(pageId, null);
					if (paramJson[0]) {
						$("#paramItem").empty();
						$.each(paramJson, function(k, val) {
							var linkData = val["linkData"];
							if (linkData) {
								$.each(linkData, function(key, item) {
									tempHtml.push('<li  dataAttr="pageParamItem" class="menu-item param-item"  toPageId ="' + val["toPageID"] + '" fromPageID="' + val["fromPageID"] + '" paramName="' + item["paramName"] + '">' + item["paramKey"] + '</li>');
								});
							}
						});
					}
				}
			}

			attrList["attrParam"] = pageParamHtml = tempHtml.join('');
		},

		TPshuchukongjian : function(flag) {
			var tempHtml = [];
			var ctrlName = ezCommon.Obj.attr("ctrlId");
			$(".selectedForm").find("[ctrl-type='ctrl-image']").each(function() {
				var ctrlId = $(this).attr("ctrlid"), ctrlType = $(this).attr("ctrl-type"), ctrlName = $(this).attr("mycompname");
				if (ctrlId) {
					tempHtml.push('<li  dataAttr="TPshuchukongjian" ctrlId = "' + ctrlId + '" ctrlType ="' + ctrlType + '">' + ctrlName + '</li>');
				}
			});
			childShuChu = tempHtml.join("");
		},
	};

	/**
	 * 属性面板定位设置
	 */
	function setLocation($data, $obj) {
		var wm = Math.abs($(window).width() - $("#container").width()),
		//主容器宽度与浏览器窗口宽度之差
		mw = $("#container").width() - $(window).width(),
		//滚动条到顶部的距离
		scrollTop = $("#container").scrollTop(),
		//滚动条到左边对距离
		scrollLeft = $(document).scrollLeft(),
		//属性面板对默认高度和宽度
		defaultListHeight = $("#defaultList .menu-item").height(), defaultListWidth = $("#defaultList .menu-item").width(),
		//浏览器窗口宽度
		winHeight = $(window).height(), top = 0, left = 0;
		//头部高度
		headerH = $("#header").height();

		if ((offsetTop + defaultListHeight) > winHeight) {
			top = offsetTop - defaultListHeight - scrollTop;
		} else {
			top = offsetTop + $data[0].offsetHeight + scrollTop;
		}
		if ($("#container").width() > $(window).width()) {
			left = offsetLeft + mw - wm - 5;
		} else {
			left = offsetLeft - 5;
		}

		var dataWidth = $data[0].offsetWidth;
		if ($data.hasClass("arithmeticRight") || $data.hasClass("arithmeticLeft")) {
			dataWidth = dataWidth * 1.5;
		}
		$("#defaultList").css({
			"top" : top + "px",
			"left" : (left - 10) + "px",
			"width" : dataWidth + "px"
		});
	}

	/**
	 * @desc 要设置的面板跟随的点击事件
	 * @param $data Object 被设置对对象
	 */
	function dataClick($data, flag) {
		//默认值 绑定数据
		if (flag) {
			var fTemp = [];
			attrList = {
				attrBase : "",
				attrCtrl : "",
				attrParam : "",
				attrDataSource : ""
			};
			$.each($(html).find(">ul>li"), function() {
				var id = $(this).attr("id");
				if (getChinaHtml[id]) {
					getChinaHtml[id](true);
				} else if (id == "ctrl-dynamic") {
				} else if (id == "systemParam") {
					attrList["attrBase"] = $(this).find("ul").html();
				} else {
					fTemp.push($(this)[0].outerHTML);
				}

			});

			//自定义默认值
			onValueChange($data[0], function() {
				var dataValue = {
					"type" : "defined",
					"value" : {
						"id" : "user-defined",
						"value" : $data.val()
					}
				};
				$data.removeAttr("filed valueType");
				$data.attr("dataType", "constant");
				setDataValue(dataValue, $data);
			});
			if (ezCommon.Obj.attr("ctrl-type") != "TIME") {
				attrList["attrBase"] += fTemp.join("");
			} else {
				attrList["attrBase"] = fTemp;
			}
			$.each(attrList, function(key, value) {
				if (value != "") {
					$(".set-ctrl-data .default-content .DataAttr ." + key).show().find("ul").empty().append(value);
				}
			});

		} else {
			//上一个版本的数据绑定方式可以删除这部分代码
			$data.unbind("click").on("click", function(e) {
				var event = e || window.event;
				var $obj = $(this);
				offset = $(this).offset(), offsetTop = offset.top, offsetLeft = offset.left;
				apiId = $(this).closest(".actionPanel").attr("actionid");
				onValueChange($obj[0], function() {
					$data.removeAttr("filed valueType");
					$data.attr("dataType", "constant");
					var dataValue = {
						"type" : "defined",
						"value" : {
							"id" : "user-defined",
							"value" : $obj.val()
						}
					};
					setDataValue(dataValue, $data);
				});
				dataSetEvent($data, $obj);
				$.each($("#defaultList").find(">ul>li"), function() {
					var id = $(this).attr("id");
					if (getChinaHtml[id]) {
						getChinaHtml[id](false);
					}
				});

				dataBase.panalEvent($obj);

			});

		}
	}

	/**
	 * @desc 创建iframe
	 */
	function htmWindowForNewForm(windowName, windowUrl) {
		$("#panelWin").remove();
		var $htmWindowForNewForm = $('<div id="panelWin"><iframe class="iframe-responsive-item" src="' + windowUrl + '" style="width:100%;height:100%;"></iframe></div>');
		$htmWindowForNewForm.appendTo($(document.body));
	};

	/*
	 *下拉框值改变
	 *
	 **/
	function changeDropDownValue($selectObj, $data, ctrlName, data) {
		var ctrlName = ezCommon.Obj.attr("ctrlId");
		$(".queryItem").change(function() {
			var $option = $(this).find("option:selected"), queryName = $(this).attr("queryName");
			var selectedFields = $option.attr("filed").replace(".", "_");
			var optionStr = '', queryId = $(this).attr("queryId");
			var jsonParam = {
				"type" : "select",
				"queryId" : queryId,
				"form" : ezCommon.getCurrFormValueList(),
				"where" : "",
				"mask" : false,
				"delLimit" : 1
			};
			var DataList = ezCommon.curd(jsonParam);
			//fdCtrl.DataList[queryId] = ezCommon.querySqlData(ezCommon.getQueryField(queryId)["querierData"]["sql"].split("limit")[0]);
			$.each(DataList, function(key, value) {
				optionStr += '<option value="' + value[selectedFields] + '" filed="' + selectedFields + '">' + value[selectedFields] + '</option>';
			});
			var queryField = selectedFields;
			var queryTable = $option.attr("queryTable");
			var queryId = $option.attr("queryId");
			var dataValue = {
				"type" : "dataSource",
				"value" : {
					"id" : queryId,
					"value" : queryName + ": " + $option.html(),
					"queryField" : queryField,
				}
			};
			$data.attr({
				"filed" : queryField,
				"queryId" : queryId
			});
			$(this).remove();
			setDataValue(dataValue, $data);
			if (data) {
				$selectObj.find("select").empty().append(optionStr);
				ezCommon.controlLists[ezCommon.formId][ctrlName]["attrs"]["item"] = {
					"items" : {
					},
				};
			}
		});
	}

	/**
	 *属性设置一级结构
	 */
	var dataSetHtml = {
		"dataSource" : '<li id="dataSource" class="menu"><span class="menu-text">数据源</span><span class="caretL"></span><ul class="menuChild"><li childId="addDataSource" dataAttr="dataSource">新增数据源</li></ul></li>',
		"systemParam" : '<li id="systemParam" class="menu"><span class="menu-text">系统变量</span><span class="caretL"></span><ul class="menuChild"><li id="STAFFID" dataAttr="systemParam">当前用户ID</li><li id="USERNAME" dataAttr="systemParam">当前用户名称</li><li id="SysDBDateTime" dataAttr="systemParam">当前系统时间</li></ul></li>',
		"dataTime" : '<li id="assignDate" dataAttr="assignDate" class="menu-date">指定日期</li><li id="currDate" dataAttr="currDate" class="menu-date">填写当前系统日期</li><li id="beforeDate" dataAttr="beforeDate" class="menu-date">填写当天的前几天</li><li id="afterDate"  dataAttr="afterDate"  class="menu-date">填写当天的后几天</li>',
		"randomNum" : '<li id="randomNum" dataAttr="randomNum">随机数</li>',
		"biaodankongjian" : '<li id="biaodankongjian">表单控件<ul class="menuChild" style="display:none;"></ul></li>',
		"shuchukongjian" : '<li id="shuchukongjian">输出控件<ul class="menuChild" style="display:none;"></ul></li>',
		"TPshuchukongjian" : '<li id="TPshuchukongjian">输出控件<ul class="menuChild" style="display:none;"></ul></li>',
		"ctrlDynamic" : '<li id="ctrlDynamic">组件控件<ul class="menuChild" style="display:none;"></ul></li>',
		"pageParamItem" : '<li id="pageParamItem"><span>页面参数</span><span class="caretL"></span><ul class="menuChild" style="display:none;"></ul></li>',
		"currDataID" : '<li id="currDataID" dataAttr="currDataID">当前数据ID</li>',
		"zizeng" : '<li id="zizeng" dataAttr="zizeng">自增</li>',
		"zijian" : '<li id="zijian" dataAttr="zijian">自减</li>',
		"rowDataNull" : '<li id="rowDataNull" dataAttr="rowDataNull">当数据为空时</li>',
		"clear" : '<li id="clear" dataAttr="clear">清除</li>',
		"apiResult" : '<li id="apiResult" class="menu"><span class="menu-text">API结果</span><span class="caretL"></span><ul class="menuChild"></ul></li>'
	},

	/**
	 * 控件属性设置配置,
	 */
	ctrlData = {
		BUTTON : ["dataSource", "systemParam"],
		CHECKbOX : ["dataSource", "systemParam"],
		COLBOX : ["dataSource", "systemParam"],
		DROPDOWN : ["dataSource", "systemParam"],
		IMAGE : ["dataSource", "systemParam"],
		IMAGEBOX : ["dataSource", "systemParam"],
		RADIO : ["dataSource", "systemParam"],
		REMARK : ["dataSource", "systemParam"],
		TEXT : ["dataSource", "systemParam"],
		TEXTAREA : ["dataSource", "systemParam"],
		TEXTBOX : ["dataSource", "systemParam", "randomNum", "pageParamItem", "apiResult"],
		TIME : ["dataTime"],
		compLogic : ["dataSource", "systemParam"],
		ACTION1 : ["systemParam", "biaodankongjian", "shuchukongjian", "ctrlDynamic", "clear"],
		ACTION2 : ["systemParam", "biaodankongjian", "shuchukongjian", "ctrlDynamic", "currDataID"],
		ACTION3 : ["biaodankongjian", "shuchukongjian", "ctrlDynamic", "currDataID"],
		ACTION4 : ["biaodankongjian", "shuchukongjian", "ctrlDynamic", "currDataID"],
		ACTION5 : [],
		ACTION6 : [],
		ACTION7 : [],
		ACTION8 : [],
		ACTION9 : [],
		LOGIC :["systemParam","biaodankongjian","dataSource"],
		LOGICFOR:["dataSource"],
		APIINPUTPARAM: ["biaodankongjian"]
 	};

	module.exports = dataBase;
});
