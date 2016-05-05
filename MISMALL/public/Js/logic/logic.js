/**
 * @author Administrator
 */
function Logic($docElement, dataBase, variable, variableName, result) {

	result = objIsnull(result) ? result : {};
	variableName = objIsnull(variableName) ? variableName : [];
	variable = objIsnull(variable) ? variable : {};
	this.docElement = $docElement;
	this.dataBase = dataBase;
	this.result = result;
	//变量
	this.variable = variable;
	this.variableName = variableName;
	this.logicArray = [];
	this.dataJson = [];
}

Logic.prototype.logic = function($obj) {

};

//Logic.prototype.LogicStruck = '<div class="editorLogicDesign"><div class="top"><span style="display: inline-block;color:#FFFFFF;font-size: 20px;margin:14px">逻辑设计器</span><div class="save" style="display: inline-block;color:#FFFFFF;font-size: 16px;margin:14px 30px 14px 120px"><span class="top-menu-icon glyphicon glyphicon-floppy-disk"></span><span  id="saveLogic"> 保 存 </span></div><div style="display: inline-block;color:#FFFFFF;font-size: 16px;margin:14px"><span id="exitLogic">退出</span></div></div><div class="main"><div class="left"><ul class="logic-menu"><li data-type="control">流程控制</li><li data-type="arithmetic">运算</li><li data-type="dataLogic" style="display:none">数据</li><li data-type="handleLogic">逻辑操作</li></ul><div class="logicConetent"><div class="control tempLogic"><div class="singreBranch logicList"><div class="conditionContent if"><div class="conditionText">如果</div><div class="condition"></div><div class="conditionText">就</div><br style="clear: both" /></div><div class="result"></div></div><div class="doubleBranch logicList"><div class="conditionContent if"><div class="conditionText">如果</div><div class="condition"></div><div class="conditionText">就</div><br style="clear: both" /></div><div class="result" resultType="if"></div><div class="branch"><div class="conditionContent else"><div class="conditionText">否则</div><br style="clear: both" /></div><div class="result" resultType="else"></div></div></div><div class="forLoop logicList"><div class="conditionContent"><div class="conditionText">重复</div><div class="conditionFor"><input type="text" placeholder="请输入数字类型"></div><div class="conditionText">次</div><br style="clear: both"></div><div class="result ui-sortable"></div></div></div><div class="arithmetic tempLogic" style="display: none"><div class="arithmeticOperator operator" value=">"><input class="arithmeticLeft"/><span class="operatorList" >></span><input class="arithmeticRight"/></div><div class="arithmeticOperator operator" value="<"><input class="arithmeticLeft"/><span class="operatorList" > <</span><input class="arithmeticRight"/></div><div class="arithmeticOperator operator" value="=="><input class="arithmeticLeft"/><span class="operatorList" > =</span><input class="arithmeticRight"/></div><div class="arithmeticOperator operator" value="!="><input class="arithmeticLeft"/><span class="operatorList" value="">&ne;</span><input class="arithmeticRight"/></div><div class="arithmeticOperator operator" value="<="><input class="arithmeticLeft"/><span class="operatorList" value="">&le;</span><input class="arithmeticRight"/></div><div class="arithmeticOperator operator" value=">="><input class="arithmeticLeft"/><span class="operatorList" value="">&ge;</span><input class="arithmeticRight"/></div><div class="logicOperator operator" value="&&"><div class="logicLeft logicContent"></div><div class="logicOperatorList"><span>且</span></div><div class="logicRight logicContent"></div><br style="clear: both"></div><div class="logicOperator operator" value="||"><div class="logicLeft logicContent"></div><div class="logicOperatorList"><span>或</span></div><div class="logicRight logicContent"></div><br style="clear: both"></div></div><div class="dataLogic tempLogic" style="display: none"></div><div class="tempLogic handleLogic" style="display: none"></div></div></div><div style="width: 10%; height: 100%; float: left;"><div style="width: 80%; float: left; position: relative; top: 40%; height: 35px; background: rgb(0, 0, 0) none repeat scroll 0px 0px; margin-left: 4px;"><div style="float: left; width: 100%; position: absolute; z-index: 9; height: 100%; color: rgb(255, 255, 255); line-height: 35px; font-size: 16px; padding-left: 6px;">从左往右拖</div><div style="float: right; border-style: solid; border-width: 30px; margin-top: -13px; border-color: transparent transparent transparent rgb(0, 0, 0); margin-right: -47px;"></div> </div><div class="removeLogic" ><span style="color: #ccc;font-size:30px" class="glyphicon glyphicon-trash"> </span></div></div><div class="right"></div></div></div>';
Logic.prototype.LogicStruck = getLogicStruck();

function getLogicStruck() {
	var t = [], m = [{
		"type" : "control",
		"name" : "流程控制",
		"class" : "tempLogic"
	}, {
		"type" : "arithmetic",
		"name" : "运算",
		"class" : "tempLogic"
	}, {
		"type" : "dataLogic",
		"name" : "数据",
		"class" : "tempLogic"
	}, {
		"type" : "handleLogic",
		"name" : "逻辑操作",
		"class" : "tempLogic"
	}], len = m.length, f = {

		/**
		 * 流程控制
		 */
		control : function() {
			//if
			t.push('<div class="singreBranch logicList"><div class="conditionContent if"><div class="conditionText">如果</div><div class="condition ui-sortable ui-droppable"></div><div class="conditionText">就</div><br style="clear: both"></div><div class="result"></div></div>');
			//if else
			t.push('<div class="doubleBranch logicList"><div class="conditionContent if"><div class="conditionText">如果</div><div class="condition ui-sortable ui-droppable"></div><div class="conditionText">就</div><br style="clear: both"></div><div resulttype="if" class="result"></div><div class="branch"><div class="conditionContent else"><div class="conditionText">否则</div><br style="clear: both"></div><div resulttype="else" class="result"></div></div></div>');
			//for
			t.push('<div class="forLoop logicList"><div class="conditionContent"><div class="conditionText">重复</div><div class="conditionFor"><input type="text" placeholder="请输入数字类型"></div><div class="conditionText">次</div><br style="clear: both"></div><div class="result ui-sortable"></div></div>');
		},

		/**
		 * 运算
		 */
		arithmetic : function() {
			//大于
			t.push('<div value="&gt;" class="arithmeticOperator operator"><input class="arithmeticLeft"><span class="operatorList">&gt;</span><input class="arithmeticRight"></div>');
			//小于
			t.push('<div value="&lt;" class="arithmeticOperator operator"><input class="arithmeticLeft"><span class="operatorList"> &lt;</span><input class="arithmeticRight"></div>');
			//等于
			t.push('<div value="==" class="arithmeticOperator operator"><input class="arithmeticLeft"><span class="operatorList"> =</span><input class="arithmeticRight"></div>');
			//不等于
			t.push('<div value="!=" class="arithmeticOperator operator"><input class="arithmeticLeft"><span value="" class="operatorList">≠</span><input class="arithmeticRight"></div>');
			//小于等于
			t.push('<div value="&lt;=" class="arithmeticOperator operator"><input class="arithmeticLeft"><span value="" class="operatorList">≤</span><input class="arithmeticRight"></div>');
			//大于等于
			t.push('<div value="&gt;=" class="arithmeticOperator operator"><input class="arithmeticLeft"><span value="" class="operatorList">≥</span><input class="arithmeticRight"></div>');
			//且
			t.push('<div value="&amp;&amp;" class="logicOperator operator"><div class="logicLeft logicContent ui-sortable ui-droppable"></div><div class="logicOperatorList"><span>且</span></div><div class="logicRight logicContent ui-sortable ui-droppable"></div><br style="clear: both"></div>');
			//或
			t.push('<div value="||" class="logicOperator operator"><div class="logicLeft logicContent ui-sortable ui-droppable"></div><div class="logicOperatorList"><span>或</span></div><div class="logicRight logicContent ui-sortable ui-droppable"></div><br style="clear: both"></div>');
		},

		/**
		 * 数据
		 */
		dataLogic : function() {
			t.push('<div class="variableContent"><button class="btn addVariable">新增变量</button><div class="variableList"></div></div>');
			t.push('<div class="creatVariableWin"> <div class="variableTitle"><span class="title">添加变量</span><span class="close">X</span></div> <div class="variableContent row"><span class="col-md-3">变量名 ：</span> <div class="col-md-9"><input class="newVariableName  form-control input-sm" placeholder="请输入变量名"/><p class="prompt"></p></div></div>  <div class="variableFoot"><button class="btn add">新增</button><button class="btn cancel">取消</button></div></div>');
		},

		/**
		 * 逻辑处理
		 */
		handleLogic : function() {

		}
	};

	baseStr();

	function baseStr() {
		t.push('<div class="editorLogicDesign">');
		topStr();
		mainStr();
		t.push('</div>');
	}

	function topStr() {
		t.push('<div class="top">');
		top_name_str();
		top_save_str();
		top_exit_str();
		t.push("</div>");
	}

	function top_name_str() {
		t.push('<span style="display: inline-block;color:#FFFFFF;font-size: 20px;margin:14px">逻辑设计器</span>');
	}

	function top_save_str() {
		t.push('<div class="save" style="display: inline-block;color:#FFFFFF;font-size: 16px;margin:14px 30px 14px 120px"><span class="top-menu-icon glyphicon glyphicon-floppy-disk"></span><span  id="saveLogic"> 保 存 </span></div>');
	}

	function top_exit_str() {
		t.push('<div style="display: inline-block;color:#FFFFFF;font-size: 16px;margin:14px"><span id="exitLogic">退出</span></div>');
	}

	function mainStr() {
		t.push('<div class="main">');
		mian_left();
		main_mid();
		main_right();
		t.push('</div>');

	}

	function mian_left() {
		t.push('<div class="left">');
		main_left_menu();
		main_left_content();
		t.push('</div>');
	}

	function main_left_menu() {
		t.push('<ul class="logic-menu">');
		main_left_menuList();
		t.push('</ul>');
	}

	function main_left_menuList() {
		for (var i = 0; i < len; i++) {
			t.push('<li data-type ="');
			t.push(m[i]["type"]);
			t.push('">');
			t.push(m[i]["name"]);
			t.push('</li>');
		}
	}

	function main_left_content() {
		t.push('<div class="logicConetent">');
		main_left_contentList();
		t.push('</div>');
	}

	function main_left_contentList() {
		for (var i = 0; i < len; i++) {
			var temp = m[i];
			t.push('<div class="');
			t.push(temp["type"]);
			t.push(' ');
			t.push(temp["class"]);
			t.push('">');
			f[temp["type"]]();
			t.push('</div>');
		}

	}

	function main_mid() {
		t.push('<div style="width: 10%; height: 100%; float: left;">');
		t.push('<div style="width: 80%; float: left; position: relative; top: 40%; height: 35px; background: rgb(0, 0, 0) none repeat scroll 0px 0px; margin-left: 4px;">');
		t.push('<div style="float: left; width: 100%; position: absolute; z-index: 9; height: 100%; color: rgb(255, 255, 255); line-height: 35px; font-size: 16px; padding-left: 6px;">从左往右拖</div>');
		t.push('<div style="float: right; border-style: solid; border-width: 30px; margin-top: -13px; border-color: transparent transparent transparent rgb(0, 0, 0); margin-right: -47px;"></div>');
		t.push('</div>');
		t.push('<div class="removeLogic ui-sortable"><span class="glyphicon glyphicon-trash" style="color: #ccc;font-size:30px"> </span></div>');
		t.push('</div>');
	}

	function main_right() {
		t.push('<div class="right"></div>');
	}

	return t.join("");
}

/**
 * @param JSON json 方法集
 * @param Jqueyr $obj
 * @param String rightStruck
 */
Logic.prototype.init = function(json, $obj, rightStruck) {
	var $struck = $(this.LogicStruck), dataBase = this.dataBase;
	$(".editorLogicDesign").remove();
	if ($("body").find(".editorLogicDesign").size() <= 0) {
		if (this.docElement) {
			this.docElement.append($struck);
		} else {
			$("body").append($struck);
		}
		rightStruck ? $struck.find(".right").empty().append(rightStruck) : $struck.find(".right").empty();
		$struck.find(".handleLogic").empty().append(json.leftStruck($obj));
		//$struck.find(".dataLogic ").empty().append(json.dataStruck());
		if ($struck.find(".removeLogic").size() <= 0) {
			//$struck.find(".right").append('<div class="removeLogic" ><span style="color: #ccc;font-size:30px" class="glyphicon glyphicon-trash"> </span></div>');
		}
		this.editorLogicEvent($struck, json, $obj, dataBase);
	} else {
		$(".editorLogicDesign").show();
	}
	resotoreCondition();
	restoreRresult(json, this.result);
	function restoreRight() {

	}

	function resotoreCondition() {
		$(".editorLogicDesign .right").find(".arithmeticOperator").each(function() {
			var $left = $(this).find(".arithmeticLeft"), $right = $(this).find(".arithmeticRight");
			$left.val($left.attr("restoreValue"));
			$right.val($right.attr("restoreValue"));
			json.setCondition($(this));
		});

		$(".editorLogicDesign .right").find(".forLoop").each(function() {
			var $this = $(this), $i = $this.find(".conditionFor input");
			$i.val($i.attr("restoreValue"));
			$i.numeral();
			json.setCondition($this);
		});
	}

	function restoreRresult(json, result) {
		$(".editorLogicDesign .right").find(".handleLogic-content").each(function() {
			json.restoreResult($(this), result);
		});
	}

	function restoreEvent() {

	}


	$(".main", $(".editorLogicDesign")).css({
		"height" : $(window).height() - 60
	});
	// $(".main .right", $(".editorLogicDesign")).css({
	// "width" : $(window).width() - 250
	// });
};

/**
 * @desc 执行逻辑表达式
 * @param JSON obj 回掉函数集
 * @param JSON dataJson 逻辑操作的json数据
 */
Logic.prototype.run = function(obj, dataJson) {
	//逻辑表达式结构
	var logicStruck = this.logicArray, forArray = [];
	restoreLogic(dataJson, dataJson[0]["flag"]);
	if (dataJson[0]["flag"] == true) {
		dataJson[0]["flag"] = false;
	} else {
		dataJson[0]["flag"] = true;
	}
	if (this.logicArray.length) {
		console.log(this.logicArray.join(""));
		eval(this.logicArray.join(""));
	}
	/**
	 * @desc 判断数组中是否全是逻辑操作
	 */
	function getFlag(t) {
		var flag = 0, i = 0;
		for ( i = 0; i < t.length; i++) {
			if (t[i]["type"] != "content") {
				flag = 1;
				break;
			}
		};

		return flag;
	}

	/**
	 * @desc 拼接逻辑表达式
	 */
	function restoreLogic(tempJson, flag) {
		$.each(tempJson, function(k, v) {
			var len = tempJson.length;
			if (v.type != "content") {

				if (v.type == "if" || v.type == "elseif") {
					restoreContent(k, 0, tempJson, flag);
					logicStruck.push("if");
					if (v.condition.length) {
						restoreCondition(v.condition);
					} else {
						logicStruck.push("(0)");
					}

					logicStruck.push("{");

					if (v.relust.length) {
						if (getFlag(v.relust)) {
							restoreLogic(v.relust, flag);
						} else {
							restoreContent(-1, 1, v.relust, flag);
						}
					}

					if (v.type == "if") {
						logicStruck.push("}");
						restoreContent(k, 1, tempJson, flag);
					} else if (v.type == "elseif") {
						restoreContent(k, 0, tempJson, flag);
						logicStruck.push("}else{");

						if (v.relusts.length) {
							if (getFlag(v.relusts)) {
								restoreLogic(v.relusts, flag);
							} else {
								restoreContent(-1, 1, v.relusts, flag);
							}
						}

						logicStruck.push("}");
						restoreContent(k, 1, tempJson, flag);

					}
				} else if (v.type == "for") {
					restoreContent(k, 0, tempJson, flag);
					if (objIsnull(v.condition)) {
						forCondition(v.condition);
					} else {
						logicStruck.push("for(var i=0;i>0;i--");
					}
					logicStruck.push("){");
					if (v.relust.length) {
						if (getFlag(v.relust)) {
							restoreLogic(v.relust, flag);
						} else {
							restoreContent(-1, 1, v.relust, flag);
						}
					}
					logicStruck.push("}");
					restoreContent(k, 1, tempJson, flag);
				}
			}
		});

	}

	function forCondition(condition) {
		var d = getConditionResult(condition);
		logicStruck.push("for(var i");
		logicStruck.push(forArray.length);
		logicStruck.push("=0;i");
		logicStruck.push(forArray.length);
		logicStruck.push("<");
		if (condition.type == "dataSource") {
			logicStruck.push(d.length);
		} else {
			logicStruck.push(d);
		}
		logicStruck.push(";i");
		logicStruck.push(forArray.length);
		logicStruck.push("++");
		forArray.push(0);
	}

	/**
	 * @param {Int} k 数组坐标
	 * @param {Int} direction 计算方向 0或1
	 * @param {Array} tempJson 要操作的数组
	 * @desc 拼接逻辑操作表达式
	 */
	function restoreContent(k, direction, tempJson, flag) {
		if (direction) {
			for (var i = k + 1; i < tempJson.length; i++) {
				if (tempJson[i]["type"] == "content") {
					if (tempJson[i]["flag"] != flag) {
						var sturck = obj.getLogicRelust(tempJson[i]);
						logicStruck.push("obj." + sturck);
						tempJson[i]["flag"] = flag;
					}
				} else {
					break;
				}
			}
		} else {
			var t = [];
			for (var i = k - 1; i >= 0; i--) {
				if (tempJson[i]["type"] == "content") {
					if (tempJson[i]["flag"] != flag) {
						var sturck = obj.getLogicRelust(tempJson[i]);
						t.push("obj." + sturck);
						tempJson[i]["flag"] = flag;
					}
				} else {
					break;
				}
			}

			for (var i = t.length - 1; i >= 0; i--) {
				logicStruck.push(t[i]);
			}
		}
	}

	/**
	 * @desc 拼接逻辑表达式条件结构
	 * @param {Object} conditionJson
	 */
	function restoreCondition(conditionJson) {
		$.each(conditionJson, function(k, v) {
			logicStruck.push("(");
			if (v.left instanceof Array) {
				if (v.left.length) {
					restoreCondition(v.left);
				} else {
					logicStruck.push(false);
				}
			} else {
				logicStruck.push(getConditionResult(v.left));
			}
			logicStruck.push(v.type);

			if (v.right instanceof Array) {
				if (v.right.length) {
					restoreCondition(v.right);
				} else {
					logicStruck.push(false);
				}
			} else {
				logicStruck.push(getConditionResult(v.right));
			}
			logicStruck.push(")");
		});
	}

	function getConditionResult(json) {
		if (isFunction(obj.getConditionResult)) {
			return obj.getConditionResult(json);
		}
	}

};

Logic.prototype.editorLogicEvent = function($struck, json, $action, dataBase) {
	var dataJson = this.dataJson, variable = this.variable, variableName = this.variableName;
	logicLeftEvent();
	logicExit();
	logicSave(this.result);
	dropCon();
	logicDataClick();

	/**
	 * 左边切换
	 */
	function logicLeftEvent() {
		$(".left .logic-menu li", $struck).on("click", function() {
			$(".tempLogic").hide();
			$("." + $(this).attr("data-type")).show();
		});
	}

	/**
	 * 退出逻辑设计
	 */
	function logicExit() {
		$("#exitLogic").on("click", function() {
			$(".editorLogicDesign").hide();
		});
	}

	/**
	 * 保存逻辑设计
	 */
	function logicSave(resultList) {
		$("#saveLogic").click(function() {
			dataJson = [{
				flag : true,
				type : "if",
				relust : [],
				condition : [{
					type : "==",
					left : {
						type : "constant",
						valueType : "",
						value : 1,
						field : ""
					},
					right : {
						type : "constant",
						valueType : "",
						value : 1,
						field : ""
					}
				}]
			}];
			flag = "false";
			findLogic($(".right", $struck), dataJson[0]["relust"], dataJson[0], resultList);
			$("[flag='true']", $(".right")).removeAttr("flag");
			if (isFunction(json["save"])) {
				json["save"](dataJson, resultList);
			}

		});
	}

	/**
	 * @desc 检查数组中是否存在与name值相同的值;flag为true时从数组中删除与name值相同的元素;flag为false时则返回false
	 */
	function checkArray(name, flag) {
		for (var i = 0; i < variableName.length; i++) {
			if (name == variableName[i]) {
				if (flag) {
					variableName.splice(i, 1);
					break;
				} else {
					return false;
				}
			}
		}
		return true;
	}

	/**
	 * @desc 逻辑操作数据的相关事件操作
	 */
	function logicDataClick() {
		//显示创建变量窗口
		$(".addVariable", $struck).unbind("click").click(function() {
			$(".creatVariableWin", $struck).show(300);
			$(".creatVariableWin .newVariableName").focus();
		});

		//关闭 取消创建变量窗口
		$(".creatVariableWin .close,.creatVariableWin .cancel", $struck).unbind("click").click(function() {
			$(".creatVariableWin", $struck).hide(300);
		});

		//新增变量
		$(".creatVariableWin .add").unbind("click").click(function() {
			var name = $(".creatVariableWin .newVariableName").val(), varId = new Date().getTime(), str = [];
			if (name) {
				if (checkArray(name, false)) {
					str.push('<div class="variableItem" varId="');
					str.push(varId);
					str.push('"><span class="variableItemName" title="' + name + '">');
					str.push(name);
					str.push('</span><span class="remove">X</span>');
					$(".creatVariableWin", $struck).hide();
					$(".creatVariableWin .newVariableName").val(null);
					variable[varId] = {
						"varId" : varId,
						"name" : name
					};
					variableName.push(name);
					var $str = $(str.join(""));
					$(".variableContent .variableList", $struck).append($str);
					$str.find(".remove").click(function() {
						$str.remove();
						delete variable[varId];
						checkArray(name, true);
					});
				} else {
					errorPrompt("变量名不能重复");
				}
			} else {
				errorPrompt("变量名不能为空");
			}

		});
	}

	/***
	 * @desc 错误提示
	 */
	function errorPrompt(text) {
		$(".prompt", $struck).show().html(text);
		setTimeout(function() {
			$(".prompt", $struck).hide(300);
		}, 2000);
	}

	function dropCon() {
		$(".left .logicList").draggable({
			handle : '.logicList',
			opacity : 0.8,
			addClasses : false,
			helper : function() {
				var html = this.outerHTML;
				return $(html).css({
				"width" : "200px",
				"font-size" : "10px",

				})[0].outerHTML;
			},
			connectToSortable : ".right",
			distance : "10",
			zIndex : 999,
			start : function(e, ui) {
			},

			stop : function(e, ui) {
			}
		});

		$(".left .operator").draggable({
			handle : ".operator",
			opacity : 0.8,
			addClasses : false,
			helper : function() {
				var html = this.outerHTML;
				return $(html).css({
				"width" : "125px",
				"font-size" : "10px",

				})[0].outerHTML;
			},
			distance : "10",
			zIndex : 999,

			stop : function() {
			}
		});

		$(".left .handleLogic-content").draggable({
			handle : ".handleLogic-content",
			opacity : 0.8,
			addClasses : false,
			helper : function() {
				var html = this.outerHTML;

				return $(html).css({
				"width" : "200px",
				"height" : "30px",
				"font-size" : "10px",

				})[0].outerHTML;
			},
			connectToSortable : ".right",
			distance : "10",
			zIndex : 999,

			stop : function(e, ui) {

			}
		});

		$(".removeLogic").sortable({
			placeholder : "ui-state-highlight",
			tolerance : 'touch',
			tolerance : 'pointer',
			items : ":not('.glyphicon-trash')",
			zIndex : 9999,
			out : function() {
				$(this).css({
					"background" : "rgba(0,0,0,0.1)",

				}).find(".glyphicon-trash").css({
					"color" : "#ccc"
				});
			},

			over : function() {
				$(this).css({
					"background" : "rgba(255,0,0,0.2)",
				}).find(".glyphicon-trash").css({
					"color" : "red"
				});
			}
		});

		$(".right").sortable({
			connectWith : ".logicList,.right .result,.removeLogic,.handleLogic-content",
			tolerance : 'touch',
			tolerance : 'pointer',
			appendTo : "body",
			placeholder : "ui-state-highlight",
			cursor : "move",
			helper : function() {
				return "<div style='position:relative;width:420px;height:40px;background:#ddff11;z-index:9999'></div>";
			},
			start : function(e, ui) {
				$(".removeLogic").show();
			},
			stop : function(ev, ui) {
				var item = ui.item;
				if (item.parent().hasClass("removeLogic")) {
					$(".removeLogic").css({
						"background" : "rgba(0,0,0,0.1)"
					});
					item.remove();
				} else {
					if (item.hasClass("handleLogic-content") && !item.hasClass("actionPanel")) {
						if (isFunction(json["contextStruck"])) {
							json["contextStruck"](item);
						}
					} else {
						childDrop(item);
						if (item.hasClass("forLoop")) {
							$(".conditionFor input", item).numeral();
							json.setCondition(item);
						}
					}
				}
			},
			over : function(ev, ui) {
			},

			out : function() {

			}
		});

		function childDrop($obj) {
			$obj.find(".result").sortable({
				connectWith : ".logicList,.right .result,.removeLogic,.handleLogic-content,.right",
				placeholder : "ui-state-highlight",
				tolerance : 'touch',
				tolerance : 'pointer',
				appendTo : "body",
				helper : function() {
					return "<div style='width:120px;height:20px;background:#ddff11;z-index:9999'></div>";
				},
				start : function() {
					$(".removeLogic").show();
				},
				stop : function(ev, ui) {
					var item = ui.item;
					if (item.parent().hasClass("removeLogic")) {
						item.remove();
					} else {
						if (item.hasClass("handleLogic-content") && item.hasClass("actionPanel")) {
							json["contextStruck"](item);
						}

					}

				},

				over : function(ev, ui) {

				},

				out : function(ev, ui) {
				}
			});

			dropCondition($(".condition", $obj));
		}

		function sortableCon($obj) {
			$obj.sortable({
				connectWith : ".removeLogic,.right .operator",
				placeholder : "ui-state-highlight",
				appendTo : "body",
				stop : function(e, ui) {
					var item = ui.item;
					if (item.parent().hasClass("removeLogic")) {
						item.remove();
						if ($(this).hasClass("ui-state-disabled")) {
							$(this).droppable("enable");
						}
					}

				}
			});
		}

		if ($(".condition,.logicContent").size()) {
			dropCondition($(".condition,.logicContent"));
		}

		function dropCondition($obj) {
			sortableCon($obj);
			$obj.droppable({
				accept : ".left .operator",
				tolerance : "pointer",

				drop : function(event, ui) {
					var drag = $(ui.draggable[0].outerHTML), $this = $(this);
					$this.empty().append(drag).css({
						"box-shadow" : "0px 0px 0px 0px rgba(0, 0, 0, 0.5)",
					});

					if (drag.hasClass("logicOperator")) {
						dropCondition($(".logicContent", drag));
						sortableCon($(".logicContent", drag));
					}
					if ($this.hasClass("condition")) {
						drag.css("background", "rgb(92,183,18)").attr("bgC", "a");
					} else {
						var bg = $this.closest(".operator").attr("bgC");
						if (bg == "a") {
							drag.css("background", "rgba(162, 153, 134,0.8)").attr("bgC", "b");
						} else if (bg == "b") {
							drag.css("background", "rgba(137, 139, 155,0.8)").attr("bgC", "c");
						} else if (bg == "c") {
							drag.css("background", "rgba(92,183,18,0.8)").attr("bgC", "a");
						}
					}

					json.setCondition(drag);
				},

				out : function() {
					$(this).find(".logicHelper").remove();
					$(this).css({
						"box-shadow" : "0px 0px 0px 0px rgba(0, 0, 0, 0.5)",
					});
				},

				over : function() {

					var $this = $(this), p = $this.parent().parent(), logicHelper = '<div class="logicHelper" style="width:100%;height:25px;text-align:center;line-height:25px;color:red;border:1px dashed red">请放在这里</div>';
					$this.css({
						"box-shadow" : "3px 5px 5px 4px rgba(0, 0, 0, 0.5)",
					});
					if ($this.children().size()) {
						$this.children().eq(0).before(logicHelper);
					} else {
						$this.append(logicHelper);
					}
					if (p.hasClass("ui-droppable") && !p.hasClass("ui-state-disabled")) {
						p.css({
							"box-shadow" : "0px 0px 0px 0px rgba(0, 0, 0, 0.5)",
						}).droppable("disable");

						p.find(">.logicHelper").remove();
					}
				}
			});
		}

	}

	/**
	 * @desc 拼接条件JSON
	 */
	function getCondition($condition, jsonTemp) {
		$condition.find(">.operator").each(function() {
			var $this = $(this), temp = {};
			temp.type = $this.attr("value");
			if ($this.hasClass("logicOperator")) {
				temp.left = [];
				temp.right = [];
				var $left = $this.find(">.logicLeft"), $right = $this.find(">.logicRight");
				if ($left.size() > 0) {
					getCondition($left, temp.left);
				}

				if ($right.size() > 0) {
					getCondition($right, temp.right);
				}

			} else {
				var $left = $this.find(".arithmeticLeft"), $right = $this.find(".arithmeticRight");
				temp.left = getObj($left);
				temp.right = getObj($right);

			}
			jsonTemp.push(temp);
		});

		return jsonTemp;
	}

	function getObj($obj) {
		$obj.attr("restoreValue", $obj.val());
		return {
			"type" : $obj.attr("dataType"),
			"valueType" : $obj.attr("valueType"),
			"value" : $obj.val(),
			"field" : $obj.attr("filed")
		};
	}

	/**
	 * @desc 拼接当前对象所有的前后元素的非含有logicList类的json
	 */
	function slinc($obj, name, temp, $this, resultList) {
		//如果name等于prev就找$obj所有兄弟节点的所有前面的兄弟节点  如果name = next就找所有后面的兄弟节点
		if (name == "prev") {
			var preList = $obj.prevAll(), len = preList.length;
			if (len) {
				for (var i = len - 1; i >= 0; i--) {
					var k = $(preList[i]);
					//如果k对象含有logicList类就跳出循环
					if (k.hasClass("logicList")) {
						break;
					};
					if (k.attr("flag") != "true") {
						tempJson($this, temp, k, resultList);
						k.attr("flag", "true");
					}
				}
			}
		} else {
			var preList = $obj.nextAll(), len = preList.length;
			if (len) {
				for (var i = 0; i < len; i++) {
					var k = $(preList[i]);
					if (k.hasClass("logicList")) {
						break;
					};
					if (k.attr("flag") != "true") {
						tempJson($this, temp, k, resultList);
						k.attr("flag", "true");
					}
				}
			}
		}
	}

	/**
	 * @desc 拼接逻辑处理结果数据JSON
	 */
	function tempJson($obj, preTemp, $this, resultList) {
		if ($obj) {
			var relust = "";
			if (isFunction(json["setLogicRelust"])) {
				relust = json["setLogicRelust"]($this, resultList);
			}
			if ($obj.attr("resulttype") == "else") {
				preTemp.relusts.push(relust);
			} else {
				preTemp.relust.push(relust);
			}
		}
	}

	/**
	 * @desc 拼接逻辑表达式数据JSON
	 * @param Jquery $obj
	 * @param Json jsonTemp
	 * @param Json preTemp
	 */
	function findLogic($obj, jsonTemp, preTemp, resultList) {
		if ($obj.find(">.logicList").size()) {
			$obj.find(">.logicList").each(function(k, v) {
				var $this = $(this), temp = {};
				if ($this.hasClass("singreBranch")) {
					temp.type = "if";
					temp.condition = getCondition($this.find(">.conditionContent >.condition "), []);
					temp.relust = [];
				} else if ($this.hasClass("doubleBranch")) {
					temp.type = "elseif";
					temp.condition = getCondition($this.find(">.conditionContent >.condition "), []);
					temp.relust = [];
					temp.relusts = [];
				} else if ($this.hasClass("forLoop")) {
					temp.type = "for";
					temp.relust = [];
					temp.condition = getObj($this.find(".conditionFor input"));
				}
				slinc($this, "prev", preTemp, $obj, resultList);
				jsonTemp.push(temp);
				slinc($this, "next", preTemp, $obj, resultList);
				findLogic($this.find(">.result "), temp.relust, temp, resultList);
				findLogic($this.find(">.branch>.result "), temp.relusts, temp, resultList);

			});
		} else {
			$obj.find(".handleLogic-content").each(function() {
				tempJson($obj, preTemp, $(this), resultList);
			});
		}

	}

};

/**
 * @desc 检测对象是否为方法
 * @param {Object} fun
 */
function isFunction(fun) {
	var flag = false;
	if ( typeof fun == "function") {
		flag = true;
	}
	return flag;
}
