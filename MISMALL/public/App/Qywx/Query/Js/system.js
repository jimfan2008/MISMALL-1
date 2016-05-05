/**
 * @author CC
 * 系统变量的操作
 */
var $getXml;
var system = {
	//获取当前操作的表单数据存储表的表名
	initGetTname : function() {
		var formid = _getUrlParas('formid') ? _getUrlParas('formid') : '';
		var type = _getUrlParas('type') ? _getUrlParas('type') : '';

		if (type == "") {
			var $getXml = window.parent.$xmlFormDesign ? window.parent.$xmlFormDesign : window.parent.parent.$xmlFormDesign;
		} else {
			$.ajax({
				type : "post",
				url : GROUPPATH + '/FormDesign/getFormXml',
				data : {
					id : formid
				},
				async : false,
				dataType : 'text',
				success : function(r) {
					$getXml = r.ToXml();
				}
			});
		}
		var editTname;
		// 全局变量当前操作的表单的存贮的数据表名
		if ($getXml != "") {
			var editFname = $getXml.children("control[type='CCForm']").attr("name");
			//获取当前操作的表单的在数据库中的数据表
		}
		_commonAjax({
			processData : false,
			url : GROUPPATH + "/Query/getEditTname",
			data : {
				editFname : editFname
			},
			dataType : "text",
			async : false,
			success : function(result) {
				editTname = result;
			}
		});
		return editTname;
	},

	/*
	 * 初始化过滤条件
	 * 条件值文件框的dataFrom属性用于存储数据来源类型：input:输入值(默认)，form:表单控件，sysVer:系统变量等
	 */
	initFiltCodition : function(cid, valueId, vatType, ctxt, sign, loadVal, fieldId, fieldData) {
		var _this = this;
		var li = "";
		if (cid.indexOf("CCTime") > 0) {

		}
	},
	/*
	 * 条件中的右键菜单
	 */
	filterMenu : function() {
		var $this = this;
		$(".right_where_column").find("input[class=normal]").click(function() {
			$("#mm").menu({
				onClick : function(item) {
					var type = $("#" + item.id).parent().attr("type");
					if (type == undefined) {

						type = $("#" + item.id).attr("type");
						$(this).attr("value", item.text);
					} else {
						//alert(type);

					}
				}
			});
		});
	},

	changeDataFromType : function($input) {

		$input.attr("dataFrom", "input");
	},

	getKeyCode : function(e) {// 获取按键码
		var currKey = 0, e = e || event;
		currKey = e.keyCode || e.which || e.charCode;
		return currKey;
	},
	//增加系统变量插件
	_addSysFields : function() {
		var editTname = system.initGetTname();

		$(".right_where_column").find("input.normal").on("keydown", function(e) {
			$(this).parent();
			//判断首行是否为空
			$("#mm").menu("hide");
			var kc = system.getKeyCode(e);
			if ((kc == 8 || kc == 46) && $(this).attr("immark") != "true") {
				$(this).val("");
				$(this).attr("immark", "true");
			}
		});

		$(".right_where_column").find("input.normal").on("keyup", function(e) {
			var kc = system.getKeyCode(e);
			if (kc == 13) {
				system._initGetSql();
			}
			$(this).attr("value", $(this).val()).attr("field", $(this).val());
		});

		$(".right_where_column").find("input.normal").on("click", function(e) {

			var obj = $(this);
			if (obj.attr("immark") == "false") {
				obj.nextAll().blur();
				obj.val(obj.val()).select();
			}

			obj.focus();

			$('#mm').menu({
				onClick : function(item) {
					obj.attr("immark", "false");
					var type = $("#" + item.id).parent().attr("type");
					if (type == undefined) {
						type = $("#" + item.id).attr("type");
						if (item.id == "null") {

							obj.val('');
							obj.attr({
								"datafrom" : "null",
								"field" : "",
								"value" : ""
							});
						}

					} else {

						switch(type) {
							case "sysParam":
								obj.val(item.text);
								obj.attr({
									"datafrom" : type,
									"field" : item.id,
									"value" : obj.val()
								});
								break;
							case "form":
								obj.val("表单中【" + item.text + "】的值");
								obj.attr({
									"datafrom" : type,
									"field" : item.id,
									"value" : obj.val()
								});

								break;
							case "table":
								obj.val("表格中【" + item.text + "】的值");
								obj.attr({
									"datafrom" : type,
									"field" : item.id,
									"value" : obj.val()
								});
								break;
						}
						system._initGetSql();
					}

					//输出两次是因为失去焦点的时候又查询了一次
					//system._initGetSql();

				}
			});
			$('#mm').menu('show', {
				left : $(this).offset().left + 80,
				top : $(this).offset().top + 30
			});

		});

		$(".right_where_column").undelegate("input.validatebox-text", "click").delegate("input.validatebox-text", "click", function(e) {
			$.each($(this), function() {

				var obj = $(this);
				//e.stopPropagation();
				//e.preventDefault();
				
				var objs = obj.parent().prev();
				
				if ($("body").find(".datebox-button:visible").size() == 1) {
					$("body").find(".datebox-button:visible").find("a:lt(2)").on("click", function(e) {
						
						objs.parent().attr("set", "value");
						if (objs.parent().find(".addnum").size() != 0) {
							objs.parent().find(".addnum").remove();
							objs.parent().next().remove();
						}
					});
				}
			
				
				$("#dateselected").menu({
					onClick : function(item) {
						//			alert(obj.parent().html());
						
						
						objs.parent().attr("set", "text");
						if (item.id == "notany") {

							objs.datetimebox('setValue', '');
							objs.parent().attr("set", "");
							objs.parent().attr("tp", "");
						}

						var thisDate = new Date();
						var $time = Array(31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31);
						var Year = thisDate.getFullYear();
						if (Year % 4 == 0 && Year % 100 != 0) {
							$time[1] = 29;
						}
						

						
							switch(item.id) {
								case "thistime" :
								
									objs.datetimebox('setValue', '');

									objs.datetimebox('setText', "当前时间("+thisDate.FormatTime("yyyy-MM-dd HH:mm:ss")+")");
									if(objs.parent().next().attr("timeadd")=="timeadd"){
										objs.parent().next().remove();
									}
									objs.parent().attr("tp", "thistime");
									if (objs.parent().find(".addnum").size() != 0) {
										objs.parent().find(".addnum").remove();
									}
									break;
								case "thisday"://当天
									objs.datetimebox('setValue', '');

									objs.datetimebox('setText', "当天(" + thisDate.FormatTime("yyyy-MM-dd") + " 00:00:00)");
									if(objs.parent().next().attr("timeadd")=="timeadd"){
										objs.parent().next().remove();
									}
									objs.parent().attr("tp", "thisday");
									if (objs.parent().find(".addnum").size() != 0) {
										objs.parent().find(".addnum").remove();
									}
									break;
								case "thismouthfirstday"://当月第一天
									var $month = thisDate.getMonth();
									objs.datetimebox('setText', '当月第一天(' + thisDate.FormatTime('yyyy-MM') + '-01 00:00:00)');
									if(objs.parent().next().attr("timeadd")=="timeadd"){
										objs.parent().next().remove();
									}
									objs.parent().attr("tp", "thismouthfirstday");
									if (objs.parent().find(".addnum").size() != 0) {
										objs.parent().find(".addnum").remove();
									}
									break;
								case "thismouthlastday"://当月最后一天
									var $month = thisDate.getMonth();
									//objs.datetimebox('setText', '当月最后一天');
									var m = $time[$month];

									objs.datetimebox('setText', '当月最后一天(' + thisDate.FormatTime('yyyy-MM') + '-' + m + ' 23:59:59)');
									if(objs.parent().next().attr("timeadd")=="timeadd"){
										objs.parent().next().remove();
									}
									objs.parent().attr("tp", "thismouthlastday");
									if (objs.parent().find(".addnum").size() != 0) {
										objs.parent().find(".addnum").remove();
									}

									break;
								case "preday"://当天前几天
									if(objs.parent().attr("timeadd")!="timeadd"){
										objs.datetimebox('setText', '当天小n天');
										objs.parent().attr("tp", "preday");
										if (objs.parent().find(".addnum").size() == 0) {
											objs.next().after('<input type="text" class="addnum"  />');
										}
										if(objs.parent().attr("add")=="add"){
											if(objs.parent().next().attr("timeadd")=="timeadd"){
												objs.parent().next().remove();
											}
											var fname = objs.parent().attr("fname");
											var firstobj = $(".right_where_column").find("li[fname="+fname+"][add=no]");
											firstobj.find(".addCondition").click();
											objs.parent().next().find(".delCondition").css("display","none");
											objs.parent().find("select:eq(1)").find("option[value=4]").attr("selected",true);//
											objs.parent().next().find("select:eq(0)").find("option[value=and]").attr("selected", true);
										    objs.parent().next().attr("timeadd","timeadd");//mark add
										    objs.parent().next().find("select:eq(1)").find("option[value=5]").attr("selected", true);
										}else if(objs.parent().attr("add")=="no"){
											if(objs.parent().next().attr("timeadd")=="timeadd"){
												objs.parent().next().remove();
											}
											objs.parent().find(".addCondition").click();
											objs.parent().next().find(".delCondition").css("display","none");
											objs.parent().find("select:first").find("option[value=4]").attr("selected",true);
											 
										    objs.parent().next().attr("timeadd","timeadd");

										    objs.parent().next().find("select:eq(0)").find("option[value=and]").attr("selected",true);
										    objs.parent().next().find("select:eq(1)").find("option[value=5]").attr("selected",true);

										}
									}
									
									system.checknum(objs, "preday");
									break;

								case "nextday"://当天后几天

									if(objs.parent().attr("timeadd")!="timeadd"){
										objs.datetimebox('setText', '当天大n天');
										objs.parent().attr("tp", "nextday");
										if (objs.parent().find(".addnum").size() == 0) {
											objs.next().after('<input type="text" class="addnum"  />');
										}
										if(objs.parent().attr("add")=="add"){
											if(objs.parent().next().attr("timeadd")=="timeadd"){
												objs.parent().next().remove();
											}
											var fname = objs.parent().attr("fname");
											var firstobj = $(".right_where_column").find("li[fname="+fname+"][add=no]");
											firstobj.find(".addCondition").click();
											objs.parent().find("select:eq(1)").find("option[value=4]").attr("selected",true);//
											objs.parent().next().find("select:eq(0)").find("option[value=and]").attr("selected", true);
											objs.parent().next().find(".delCondition").css("display","none");
										    objs.parent().next().attr("timeadd","timeadd");//mark add
										   objs.parent().next().find("select:eq(1)").find("option[value=5]").attr("selected", true);
										}else if(objs.parent().attr("add")=="no" ){
											if(objs.parent().next().attr("timeadd")=="timeadd"){
												objs.parent().next().remove();
											}
											
											objs.parent().find(".addCondition").click();
											objs.parent().next().find(".delCondition").css("display","none");
											objs.parent().find("select:first").find("option[value=4]").attr("selected",true);
											 
										    objs.parent().next().attr("timeadd","timeadd");
										  
										    objs.parent().next().find("select:eq(0)").find("option[value=and]").attr("selected",true);
										    objs.parent().next().find("select:eq(1)").find("option[value=5]").attr("selected",true);

										}


									}
										
									
									
									system.checknum(objs, "nextday");
									break;
								case "premonth":
									if(objs.parent().attr("timeadd")!="timeadd"){
										objs.parent().attr("tp", "premonth");
										objs.datetimebox('setText', '比本月小n月');
										if (objs.parent().find(".addnum").size() == 0) {
											objs.next().after('<input type="text" class="addnum"  />');
										}
										if(objs.parent().attr("add")=="add" ){
											if(objs.parent().next().attr("timeadd")=="timeadd"){
												objs.parent().next().remove();
											}
											var fname = objs.parent().attr("fname");
											var firstobj = $(".right_where_column").find("li[fname="+fname+"][add=no]");
											firstobj.find(".addCondition").click();
											objs.parent().find("select:eq(1)").find("option[value=4]").attr("selected",true);//
											objs.parent().next().find("select:eq(0)").find("option[value=and]").attr("selected", true);
											objs.parent().next().find(".delCondition").css("display","none");
										    objs.parent().next().attr("timeadd","timeadd");//mark add
										   objs.parent().next().find("select:eq(1)").find("option[value=5]").attr("selected", true);
										}else if(objs.parent().attr("add")=="no"){
											if(objs.parent().next().attr("timeadd")=="timeadd"){
												objs.parent().next().remove();
											}
											objs.next().next().next().click();
											objs.parent().next().find(".delCondition").css("display","none");
											objs.parent().find("select:first").find("option[value=4]").attr("selected",true);
											 
										    objs.parent().next().attr("timeadd","timeadd");
										    objs.parent().next().find("select:eq(0)").find("option[value=and]").attr("selected",true);
										    objs.parent().next().find(".delCondition").css("display","none");
										    objs.parent().next().find("select:eq(1)").find("option[value=5]").attr("selected",true);
										}
									}
									


									system.checknum(objs, "premonth");
									break;
								case "notany":
									//选择空的时候
									if (objs.parent().find(".addnum").size() != 0) {
										objs.parent().find(".addnum").remove();
									}
									objs.datetimebox('setText', '');

									objs.datetimebox('setValue', '');

									break;
							}
						
						//objs.datetimebox('setValue', '6/1/2012 12:30:56');
						//$('#dt').datetimebox('setValue', '6/1/2012 12:30:56');
						//	var type = $("#" + item.id).parent().attr("type");
					}
				});
				$('#dateselected').menu('show', {
					left : $(this).offset().left + 80,
					top : $(this).offset().top + 30,
				});

			});

		});
		$(".right_where_column").find("input.validatebox-text").on("click", function(e) {
			//alert(1);
			return;
			var obj = $(this);
			//e.preventDefault();
			obj.attr("immark", "false");
			obj.nextAll().blur();
			obj.focus();
			obj.val(obj.val()).select();

			$('#mm').menu({
				onClick : function(item) {

					var type = $("#" + item.id).parent().attr("type");
					if (type == undefined) {
						type = $("#" + item.id).attr("type");
						if (item.id == "null") {
							obj.val("");
							obj.attr({
								"datafrom" : "null",
								"field" : "",
								"value" : ""
							});
						}

					} else {
						switch(type) {
							case "sysParam":
								obj.val(item.text);
								obj.attr({
									"datafrom" : type,
									"field" : item.id,
									"value" : obj.val()
								});
								break;
							case "form":
								obj.val("表单中【" + item.text + "】的值");
								obj.attr({
									"datafrom" : type,
									"field" : item.id,
									"value" : obj.val()
								});
							case "table":
								obj.val("表格中【" + item.text + "】的值");
								obj.attr({
									"datafrom" : type,
									"field" : item.id,
									"value" : obj.val()
								});

								break;
						}
						system._initGetSql();
					}

					//输出两次是因为失去焦点的时候又查询了一次
					//system._initGetSql();

				}
			});
			$('#mm').menu('show', {
				left : $(this).offset().left + 80,
				top : $(this).offset().top + 30
			});

		});
	},
	/*
	 检查时间插件中后几天和前几天的等的value值是否是整数
	 */

	checknum : function(obj, type) {

		var $time = Array(31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31);
		//var Year = thisDate.getFullYear();
		
		obj.next().next().on("keyup", function() {
			var $this = $(this);

			if ($this.val().length == 1) {
				$this.val($this.val().replace(/[^1-9]/g, ''));
			} else {
				$this.val($this.val().replace(/\D/g, ''));
			}
			var newdate = new Date();
			console.log(newdate.getFullYear() + "-" + newdate.getMonth() + "-" + newdate.getDate());
			if (type == "preday" && $this.val().length > 0 && obj.parent().attr("timeadd")!="timeadd") {
				var newdate = new Date();
				var newtime = newdate;
				//newdate.setDate(newdate.getDate() - $this.val());
				var MM = newdate.getMonth();
				MM++;
				var MM = MM > 9 ? MM : ("0" + MM);
				var DD = newdate.getDate();
				var DD = DD > 9 ? DD : ("0" + DD);

				var re = newdate.getFullYear() + "-" + MM + "-" + (DD-1)+ " 23:59:59";
				newdate.setDate(newdate.getDate()-1);
				obj.parent().next().find(".easyui-datetimebox").datetimebox("setText",newdate.FormatTime("yyyy-MM-dd 00:00:00"));
				obj.parent().next().attr("num",$this.val());
				obj.parent().next().attr("tp","preday");
				
				newdate.setDate(newdate.getDate()-$this.val()+1*1);
				//var nYY = newdate.getFullYear();
				var nMM = newdate.getMonth();
				nMM++;
				var nMM = nMM > 9 ? nMM : ("0" + nMM);
				var nDD = newdate.getDate();
				var nDD = nDD > 9 ? nDD : ("0" + nDD);
				console.log(re);
				var newre =  newdate.getFullYear()+ "-" + nMM + "-" + nDD + " 00:00:00";
				obj.datetimebox("setText", "当天小" + $this.val() + "天(" + newre+")");

				
				console.log(obj.datetimebox("getText"));
				console.log($this.next().attr("src"));
			} else if (type == "nextday" && $this.val().length > 0 && obj.parent().attr("timeadd")!="timeadd") {

				var newdate = new Date();
				var YYLeft = newdate.getFullYear();
				var MMLeft = (newdate.getMonth()+1)>9 ? (newdate.getMonth()+1): '0'+(newdate.getMonth()+1);

				var DDLeft = newdate.getDate()>9 ? newdate.getDate(): '0'+newdate.getDate(); 
				var reLeft =  YYLeft+"-"+MMLeft+"-"+DDLeft+ " 23:59:59";
				obj.datetimebox("setText", "");
				obj.datetimebox("setText", "当天大" + $this.val() + "天(" + reLeft+")");
				newdate.setDate(newdate.getDate() + $this.val() * 1);
				var MM = newdate.getMonth();
				MM++;
				var MM = MM > 9 ? MM : ("0" + MM);
				var DD = newdate.getDate();
				var DD = DD > 9 ? DD : ("0" + DD);

				//得到最终结果
				var re = newdate.getFullYear() + "-" + MM + "-" + DD+" 23:59:59";
				obj.parent().next().find(".easyui-datetimebox").datetimebox("setText",re);
				
				obj.parent().next().attr("num",$this.val());
				obj.parent().next().attr("tp","nextday");

			} else if (type == "premonth" && $this.val().length > 0 && obj.parent().attr("timeadd")!="timeadd") {
				var newdate = new Date();
				var newtime = newdate;
				newtime.setMonth(newtime.getMonth()-1);
				var YYRight = newtime.getFullYear();
				var MMRight = (newtime.getMonth()+1*1)>9?(newtime.getMonth()+1*1):'0'+(newtime.getMonth()+1*1);;
				var tM = MMRight-1;
				

				//var DDRight = newtime.getDate()>9?newtime.getDate() : "0"+newtime.getDate();
				if (YYRight % 4 == 0 && YYRight % 100 != 0) {
					$time[1] = 29;
				}else{
					$time[1] = 28;
				}
				var DD = $time[tM];
				var reRight = YYRight+"-"+MMRight+"-"+DD+" 23:59:59";
				obj.parent().next().find(".easyui-datetimebox").datetimebox("setText",reRight);
				
				obj.parent().next().attr("num",$this.val());
				obj.parent().next().attr("tp","premonth");
				newdate.setMonth(newdate.getMonth()+1*1 - $this.val());
				var YY  = newdate.getFullYear();
				
				var MM = newdate.getMonth();
				
				
				//alert(MMRight+"--"+MM+"--"+DD);
				MM++;
				var MM = MM > 9 ? MM : ("0" + MM);
				//var DD = newdate.getDate();
				//var DD = DD > 9 ? DD : ("0" + DD);
				//得到最终结果

				var re = YY + "-" + MM +"-01 00:00:00";

				obj.datetimebox("setText", "");
				obj.datetimebox("setText", "比当月小" + $this.val() + "月(" + re+")");
			} else if ($this.val() == "") {
				$this.poshytip("destroy");
				$this.poshytip({
					className : 'tip-violet',
					content : '这里不能为空哦！',
					showOn : 'none',
					alignTo : 'target',
					alignX : 'inner-left',
					offsetX : 22,
					offsetY : 5,

				});
				$this.poshytip('show');
				setTimeout(function() {
					$this.poshytip('hide');
				}, 2000);
			}

		});

	},

	/*
	 * 获取条件判断的
	 * */
	getConditionValue : function(str) {
		var v;
		switch(str) {
			case '1':
				v = "=";
				break;
			case '2':
				v = ">=";
				break;
			case '3':
				v = "<=";
				break;
			case '4':
				v = ">";
				break;
			case '5':
				v = "<";
				break;
			case '6':
				v = "!=";
				break;
			case '7':
				v = "like";
				break;
		}
		return v;
	},
	/*
	 * 获取当前选中的表单或表格的sql语句
	 *
	 * */
	_initGetSql : function() {
		
		//var editTname = system.initGetTname();
		//判断是多表还是单表
		if ($("#searchByForm").css("display") == "none") {//此时是单表

			var strTname = $(".left_formlist").find("li[class='current']").attr("tname");
			var strResult = '';
			//需要查找获取的字段
			var strWhere = "(1 = 1 ";
			if ($("#searchByForm").css("display") == "none") {//此时是单表

				//循环获取条件
				$(".right_where_column").find("li").each(function() {
					//判断是否隐藏了
					if ($(this).css("display") != "none") {

						//需要判断是否是带时间插件的

						//alert($(this).attr("add"));
						if ($(this).attr("fname").substring(0, 6) != "CCTime" && $(this).find("input").val() != '' && $(this).attr("add") != "add") {//不为空 第一条 不是时间
							strResult += strTname + "." + $(this).attr("fname") + ' , ';
							var link_str = system.getConditionValue($(this).find("select").val());
							if (link_str != "like") {
								switch($(this).find("input").attr("datafrom")) {
									case "input":
										strWhere += ") and (" + system.gettrueCon(strTname, $(this).attr("fname"), $(this).attr("ftype")) + " " + link_str + " '" + $(this).find("input").val() + "' ";
										break;
									case "sysParam":
										strWhere += ") and (" + system.gettrueCon(strTname, $(this).attr("fname"), $(this).attr("ftype")) + " " + link_str + " #" + $(this).find("input").attr("field") + "# ";
										break;
									case "form":
										strWhere += ") and (" + system.gettrueCon(strTname, $(this).attr("fname"), $(this).attr("ftype")) + " " + link_str + "  $" + $(this).find("input").attr("field") + "$";
										break;
									case "table":
										strWhere += ") and (" + system.gettrueCon(strTname, $(this).attr("fname"), $(this).attr("ftype")) + " " + link_str + "  $" + $(this).find("input").attr("field") + "$";
										break;
									case "null":
										break;
								}
							} else {//相似的时候
								switch($(this).find("input").attr("datafrom")) {
									case "input":
										strWhere += ") and (" + system.gettrueCon(strTname, $(this).attr("fname"), $(this).attr("ftype")) + " " + link_str + " '%" + $(this).find("input").val() + "%' ";
										break;
									case "sysParam":
										strWhere += ") and (" + system.gettrueCon(strTname, $(this).attr("fname"), $(this).attr("ftype")) + " " + link_str + " %#" + $(this).find("input").attr("field") + "#% ";
										break;
									case "form":
										strWhere += ") and (" + system.gettrueCon(strTname, $(this).attr("fname"), $(this).attr("ftype")) + " " + link_str + " %$" + $(this).find("input").attr("field") + "$% ";
										break;
									case "table":
										strWhere += ") and (" + system.gettrueCon(strTname, $(this).attr("fname"), $(this).attr("ftype")) + " " + link_str + " %$" + $(this).find("input").attr("field") + "$% ";
										break;
									case "null":
										break;

								}
							}

						} else if ($(this).attr("fname").substring(0, 6) != "CCTime" && $(this).find("input").val() != '' && $(this).attr("add") == "add") {//不是时间 不为空 且为增加的条件

							if ($(this).prevAll("li[add=no]").eq(0).find("input.easyui-datetimebox").datetimebox("getValue") == "" && $(this).prevAll("li[add=no]").eq(0).find("input.easyui-datetimebox").datetimebox("getText") == "") {
								//alert($(this).prev("li[add=no]").eq(0).find(".addCuo").val());
								//var errorObj = $(this).prevAll("li[add=no]").eq(0).find(".addCuo");
								//errorObj.fadeIn().text("第一行不能为空！");
								/*setTimeout(function(){
								 errorObj.fadeOut();
								 },1500);*/

							}
							var strlianjie = $(this).find("select:first").val();
							var link_str = system.getConditionValue($(this).find("select:last").val());
							if (link_str != "like") {
								switch($(this).find("input").attr("datafrom")) {
									case "input":
										strWhere += " " + strlianjie + " " + system.gettrueCon(strTname, $(this).attr("fname"), $(this).attr("ftype")) + link_str + "'" + $(this).find("input").val() + "'";
										break;
									case "sysParam":
										strWhere += " " + strlianjie + " " + system.gettrueCon(strTname, $(this).attr("fname"), $(this).attr("ftype")) + link_str + "#" + $(this).find("input").attr("field") + "#";
										break;
									case "form":
										strWhere += " " + strlianjie + " " + system.gettrueCon(strTname, $(this).attr("fname"), $(this).attr("ftype")) + link_str + " $" + $(this).find("input").attr("field") + "$ ";
										break;
									case "table":
										strWhere += " " + strlianjie + " " + system.gettrueCon(strTname, $(this).attr("fname"), $(this).attr("ftype")) + link_str + " $" + $(this).find("input").attr("field") + "$ ";
										break;
									case "null":
										break;

								}
							} else {//相似的时候
								switch($(this).find("input").attr("datafrom")) {
									case "input":
										strWhere += " " + strlianjie + " " + system.gettrueCon(strTname, $(this).attr("fname"), $(this).attr("ftype")) + link_str + "'%" + $(this).find("input").val() + "%'";
										break;
									case "sysParam":
										strWhere += " " + strlianjie + " " + system.gettrueCon(strTname, $(this).attr("fname"), $(this).attr("ftype")) + link_str + "'%#" + $(this).find("input").attr("field") + "#%'";
										break;
									case "form":
										strWhere += " " + strlianjie + " " + system.gettrueCon(strTname, $(this).attr("fname"), $(this).attr("ftype")) + link_str + " %$" + $(this).find("input").attr("field") + "$% ";
										break;
									case "table":
										strWhere += " " + strlianjie + " " + system.gettrueCon(strTname, $(this).attr("fname"), $(this).attr("ftype")) + link_str + " %$" + $(this).find("input").attr("field") + "$% ";
										break;
									case "null":
										break;

								}
							}

						} else if ($(this).attr("fname").substring(0, 6) == "CCTime" && ($(this).find(".easyui-datetimebox").datetimebox("getValue") != '' || $(this).find(".easyui-datetimebox").datetimebox("getText") != '') && $(this).attr("add") != "add") {
							//时间 非增加  不为空 
							//alert($(this).find(".easyui-datetimebox").datetimebox("getValue") +"-------"+ $(this).find(".easyui-datetimebox").datetimebox("getText"));
							strResult += strTname + "." + $(this).attr("fname") + ' , ';
							if ($(this).attr("set") == "value") {
								var $val = $(this).find(".easyui-datetimebox").datetimebox("getValue");
								switch($(this).find("select").val()) {
									case '1':
										strWhere += ") and (" + system.gettrueCon(strTname, $(this).attr("fname"), $(this).attr("ftype")) + " = '" + $val + "' ";
										break;
									case '2':
										strWhere += ") and (" + system.gettrueCon(strTname, $(this).attr("fname"), $(this).attr("ftype")) + " >= '" + $val + "' ";
										break;
									case '3':
										strWhere += ") and (" + system.gettrueCon(strTname, $(this).attr("fname"), $(this).attr("ftype")) + " <= '" + $val + "' ";
										break;
									case '4':
										strWhere += ") and (" + system.gettrueCon(strTname, $(this).attr("fname"), $(this).attr("ftype")) + " > '" + $val + "' ";
										break;
									case '5':
										strWhere += ") and (" + system.gettrueCon(strTname, $(this).attr("fname"), $(this).attr("ftype")) + " < '" + $val + "' ";
										break;
									case '6':
										strWhere += ") and (" + system.gettrueCon(strTname, $(this).attr("fname"), $(this).attr("ftype")) + " != '" + $val + "' ";
										break;
									case '7':
										strWhere += ") and (" + system.gettrueCon(strTname, $(this).attr("fname"), $(this).attr("ftype")) + " like '%" + $val + "%' ";
										break;
								}
							} else if ($(this).attr("set") == "text") {
								var objs = $(this);
								var $val = system.getTimeVal($(this).attr("fname"),$(this).attr("tp"), $(this).find(".addnum").val(),$(this));
								var arr  = Array("0","=",">=","<=",">","<","!=","%");
								var sval=$(this).find("select").val()*1;
								if(sval<7){
									strWhere += ") and (" + system.gettrueCon(strTname, $(this).attr("fname"), $(this).attr("ftype")) + arr[sval]+" '" + $val + "' ";
								}else{
									strWhere += ") and (" + system.gettrueCon(strTname, $(this).attr("fname"), $(this).attr("ftype")) + " like '%" + $val + "%' ";
								}
									


							}
							
						} else if ($(this).attr("fname").substring(0, 6) == "CCTime" && ($(this).find(".easyui-datetimebox").datetimebox("getValue") != '' || $(this).find(".easyui-datetimebox").datetimebox("getText") != '') && $(this).attr("add") == "add") {//时间 非空 增加

							if ($(this).prevAll("li[add=no]").eq(0).find("input.easyui-datetimebox").datetimebox("getValue") == "" && $(this).prevAll("li[add=no]").eq(0).find("input.easyui-datetimebox").datetimebox("getText") == "") {
								//alert($(this).prev("li[add=no]").eq(0).find(".addCuo").val());
								var errorObj = $(this).prevAll("li[add=no]").eq(0).find(".addCuo");
								errorObj.fadeIn().text("第一行不能为空！");
								/*setTimeout(function(){
								 errorObj.fadeOut();
								 },1500);*/

							}
							var strlianjie = $(this).find("select:first").val();

							if($(this).attr("set") == "value"){
								var  $val =  $(this).find(".easyui-datetimebox").datetimebox("getValue");
								switch($(this).find("select:last").val()) {
								case '1':
									strWhere += " " + strlianjie + " " + system.gettrueCon(strTname, $(this).attr("fname"), $(this).attr("ftype")) + " = '" + $(this).find('input[type=hidden]').val() + "' ";
									break;
								case '2':
									strWhere += " " + strlianjie + " " + system.gettrueCon(strTname, $(this).attr("fname"), $(this).attr("ftype")) + " >= '" + $(this).find('input[type=hidden]').val() + "' ";
									break;
								case '3':
									strWhere += " " + strlianjie + " " + system.gettrueCon(strTname, $(this).attr("fname"), $(this).attr("ftype")) + " <= '" + $(this).find('input[type=hidden]').val() + "' ";
									break;
								case '4':
									strWhere += " " + strlianjie + " " + system.gettrueCon(strTname, $(this).attr("fname"), $(this).attr("ftype")) + " > '" + $(this).find('input[type=hidden]').val() + "' ";
									break;
								case '5':
									strWhere += " " + strlianjie + " " + system.gettrueCon(strTname, $(this).attr("fname"), $(this).attr("ftype")) + " < '" + $(this).find('input[type=hidden]').val() + "' ";
									break;
								case '6':
									strWhere += " " + strlianjie + " " + system.gettrueCon(strTname, $(this).attr("fname"), $(this).attr("ftype")) + " != '" + $(this).find('input[type=hidden]').val() + "' ";
									break;
								case '7':
									strWhere += " " + strlianjie + ' ' + system.gettrueCon(strTname, $(this).attr("fname"), $(this).attr("ftype")) + " like '%" + $(this).find('input[type=hidden]').val() + "%' ";
									break;
							}
							}else{
								var objs = $(this);
								if($(this).find(".addnum").val()*1>0){
									var num = $(this).find(".addnum").val()*1;
								}else{
									var num = $(this).attr("num");
								}
								var $val = system.getTimeVal($(this).attr("fname"),$(this).attr("tp"), num,$(this));
								var arr  = Array("0","=",">=","<=",">","<","!=","%");
								var sval=$(this).find("select:last").val()*1;
								
								if(sval<7){
									strWhere += " " + strlianjie + " " + system.gettrueCon(strTname, $(this).attr("fname"), $(this).attr("ftype")) +arr[sval]+ " '" + $val + "' ";
									//strWhere += " " + system.gettrueCon(strTname, $(this).attr("fname"), $(this).attr("ftype")) + arr[sval]+" '" + $val + "' ";
								}else{
									strWhere += " " + strlianjie + " " + system.gettrueCon(strTname, $(this).attr("fname"), $(this).attr("ftype")) +arr[sval]+ "like '%" + $val + "%' ";
									//strWhere += " " + system.gettrueCon(strTname, $(this).attr("fname"), $(this).attr("ftype")) + " like '%" + $val + "%' ";
								}


							}
							//var  $(this).find("input.easyui-datetimebox");
							
						} else if ($(this).attr("add") != "add") {
							strResult += strTname + "." + $(this).attr("fname") + ' , ';

						}

					}
				});
			} else {

			}

			strWhere += ')';
			var orders = "";

			var orderObj = $(".right_data_header").find("span.curr:visible");

			orderObj.each(function() {
				orders += $(this).parent().attr("fieldname") + " " + $(this).attr("order") + ", ";
			});
			var strDataResult = '';
			var $order = "";
			//排序的
			//需要显示的表单或表格的数据
			$(".right_data_header").find("li").each(function() {

				if ($(this).css("display") != "none") {
					if ($(this).attr("sum")) {
						strDataResult += "SUM(" + strTname + "." + $(this).attr("fieldname") + ") AS " + $(this).attr("fieldname") + " , ";
					} else if ($(this).attr("max")) {
						strDataResult += "MAX(" + strTname + "." + $(this).attr("fieldname") + ") AS " + $(this).attr("fieldname") + " , ";
					} else if ($(this).attr("min")) {
						strDataResult += "MIN(" + strTname + "." + $(this).attr("fieldname") + ") AS " + $(this).attr("fieldname") + " , ";
					} else if ($(this).attr("avg")) {
						strDataResult += "AVG(" + strTname + "." + $(this).attr("fieldname") + ") AS " + $(this).attr("fieldname") + " , ";
					} else {
						strDataResult += strTname + "." + $(this).attr("fieldname") + " , ";
					}
					if ($(this).attr("sorted")) {
						$order += strTname + "." + $(this).attr("fieldname") + " " + $(this).attr("sorted") + ", ";
					}
				}
				/*if($(this).css("display") != "none") {
				 var $fieldgroup = $(this).find("span.fieldgroup").attr("type");
				 var $fieldsum = $(this).find("span.fieldsum").attr("type");
				 var $fieldmax = $(this).find("span.fieldmax").attr("type");
				 var $fieldmin = $(this).find("span.fieldmin").attr("type");
				 var $fieldavg = $(this).find("span.fieldavg").attr("type");
				 //strDataResult += strTname+"."+$(this).attr("fieldname") + " , ";

				 if ($fieldsum == "fieldsum") {
				 strDataResult += "SUM("+strTname+"."+$(this).attr("fieldname") + ") AS "+$(this).attr("fieldname") + " , ";
				 } else {
				 if ($fieldmax == "fieldmax") {
				 strDataResult += "MAX("+strTname+"."+$(this).attr("fieldname") + ") AS "+$(this).attr("fieldname") + " , ";
				 } else {
				 if ($fieldmin == "fieldmin") {
				 strDataResult += "MIN("+strTname+"."+$(this).attr("fieldname") + ") AS "+$(this).attr("fieldname") + " , ";
				 } else {
				 if ($fieldavg == "fieldavg") {
				 strDataResult += "AVG("+strTname+"."+$(this).attr("fieldname") + ") AS "+$(this).attr("fieldname") + " , ";
				 } else {
				 strDataResult += strTname+"."+$(this).attr("fieldname") + " , ";
				 }
				 }
				 }
				 }
				 }*/

			});

			strDataResult = strDataResult.substr(0, strDataResult.length - 2);

			//alert(strDataResult+'--test');

			var condition = strDataResult + ' && ' + strWhere;
			if ($order != "") {
				$order = $order.substr(0, $order.length - 2);
				condition += ' && ' + $order;
			}

			if (orderObj.size() != 0) {
				orders = orders.substr(0, orders.length - 2);
				//condition += ' && ' + $order;
			}

			$.ajax({
				type : "post",
				cache : true,
				data : {
					table_name : strTname,
					condition_str : condition,
					tname : $getTname
				},
				url : GROUPPATH + "/Query/getDataTableDataInfo",
				dataType : 'text',
				beforeSend : function(XHR) {
					//alert($(document.body).loadmessager);
					//$(document.body).loadmessager();
					//if(opts && opts)
					return true;
				},
				error : function(XMLHttpRequest, textStatus, errorThrown) {
					$(document.body).loadmessager('destroy');
				},
				success : function(result) {

					//return;
					var json_dataobj = jQuery.parseJSON(result);
					var strData = '';
					//结果集
					var strConditionTitle = '';

					$(json_dataobj).each(function(index) {
						strData += '<ul class="right_data_content">';

						$(".right_data_header").find("li").each(function() {
							var $fieldname = $(this).attr("fieldname");
							if ($(this).css("display") != "none") {

								strData += '<li fieldname="' + $fieldname + '">' + json_dataobj[index][$fieldname] + '</li>';

							} else {
								strData += '<li fieldname="' + $fieldname + ' " style="display:none;">' + json_dataobj[index][$fieldname] + '</li>';
							}

						});
						strData += '</ul>';

					});
					//alert(strData);
					$(".right_data").find("ul:not(:first)").remove();
					$(".right_data").find("ul:first").after(strData);

				}
			});

			//var strSql = "select " + strResult.substr(0, strResult.length - 2) + "from " + strTname + " where " + strWhere;
			//已作废

			if (orderObj.size() != 0)
				strWhere += " order by " + orders;

			//alert("test111" + $fieldgroup);
			//return strSql;
			//打印sql信息

			//var strResults=strResult.substr(0, strResult.length - 2);
			//$("#sqlresult").text("");

			var sResult = "";
			//要显示的那些字段
			$(".right_data_header").find("li:visible").each(function() {
				var $fieldgroup = $(this).find("span.fieldgroup").attr("type");
				var $fieldsum = $(this).find("span.fieldsum").attr("type");
				var $fieldmax = $(this).find("span.fieldmax").attr("type");
				var $fieldmin = $(this).find("span.fieldmin").attr("type");
				var $fieldavg = $(this).find("span.fieldavg").attr("type");

				//alert($fieldmax);

				if ($fieldsum == "fieldsum") {
					sResult += "SUM(" + strTname + "." + $(this).attr("fieldname") + ") AS " + $(this).attr("fieldname") + " , ";
				} else {
					if ($fieldmax == "fieldmax") {
						sResult += "MAX(" + strTname + "." + $(this).attr("fieldname") + ") AS " + $(this).attr("fieldname") + " , ";
					} else {
						if ($fieldmin == "fieldmin") {
							sResult += "MIN(" + strTname + "." + $(this).attr("fieldname") + ") AS " + $(this).attr("fieldname") + " , ";
						} else {
							if ($fieldavg == "fieldavg") {
								sResult += "AVG(" + strTname + "." + $(this).attr("fieldname") + ") AS " + $(this).attr("fieldname") + " , ";
							} else {
								sResult += strTname + "." + $(this).attr("fieldname") + ", ";
							}
						}
					}
				}
				//sResult += strTname+"."+$(this).attr("fieldname")+", ";

			});
			sResult = sResult.substr(0, sResult.length - 2);

			sResult = "SELECT " + sResult + " FROM ";
			//strResults = "select "+strResults +" from ";
			strWhere = " WHERE " + strWhere;
			if ($order) {
				strWhere += " ORDER by " + $order;
			}
			$("#sqlresult").text("SELECT " + strDataResult + " FROM ");

			$("#sqltable").empty();
			$("#sqltable").append(strTname);
			$("#sqlwhere").empty();
			$("#sqlwhere").append(strWhere);

			//$(".right_sql_content").empty();
			//$('.right_sql_content').append(strSql);
		} else {

			byFields._initGetSql();
		}
	},

	//获取真实的条件
	gettrueCon : function(tname, fname, ftype) {
		var fi = tname + "." + fname;
		if ($.inArray(ftype, Array("CCDropDown", "CCCheckBox", "CCRadio")) != -1) {
			return "SUBSTR(" + fi + ", INSTR(" + fi + ", 'name')+7, INSTR(" + fi + ", '}')-INSTR(" + fi + ", 'name')-8)";
		} else {
			return tname + "." + fname;
		}
	},
	_printSql : function() {
		$(".right_where_column").find("input").bind("focus", function() {
			$(".addCuo").fadeOut();
		});

		$(".right_where_column").find("select").bind("change", function() {
			system._initGetSql();
		});
		//离开打印变换sql
		$(".right_where_column").find("input.normal").on("blur", function() {
			system._initGetSql();
		});
		//回车打印sql
		$(".right_where_column").find("input").on("keydown", function(e) {
			var ev = document.all ? window.event : e;
			if (ev.keyCode == 13) {
				system._initGetSql();
			}

		});
	},
	getTimeVal : function(name,type, num, obj) {
		
		
		var thisDate = new Date();
		var $YY = thisDate.getFullYear();
		//var $MM=thisDate.getMonth();
		//var $DD = thisDate.getDate(); 
		//var $YY = thisDate.getFullYear();
		var $MM=(thisDate.getMonth()+1*1)<10 ? '0'+(thisDate.getMonth()+1*1):(thisDate.getMonth()+1*1);
		var $DD = thisDate.getDate()<10 ? '0'+thisDate.getDate():thisDate.getDate(); 
		
		var $arr = Array(0,31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31);
		
		if ($YY % 4 == 0 && $YY % 100 != 0) {
			$time[2] = 29;
		}
		switch(type) {
			case "thistime":
				var HH=thisDate.getHours()<10 ? '0'+thisDate.getHours():thisDate.getHours();       //获取当前小时数(0-23)
				var II=thisDate.getMinutes()<10? '0'+thisDate.getMinutes():thisDate.getMinutes();     //获取当前分钟数(0-59)
				var SS =thisDate.getSeconds() <10 ? '0'+thisDate.getSeconds():thisDate.getSeconds();     //获取当前秒数(0-59)
			
				//return $YY+"-"+$MM+"-"+$DD+ " "+HH+":"+II+":"+SS;
				return "@ThisTime@";

				break;
			case "thisday":
				//return "("+name + " > '" + $YY+"-"+($MM)+"-"+$DD+ " 00:00:00' AND "
						
						//
				return "@ThisDayL@";
				break;
			case "thismouthfirstday":
					
					//return "'"+$YY+"-"+$MM+"-01'";
					return "@ThisMonthFirstDay@";
				break;
			case "thismouthlastday":
					//var d = thisDate.getMonth();
					//return "'"+$YY+"-"+$MM+"-"+$arr[$MM]+"'";
					return "@ThisMonthLastDay@";
				break;
			case "preday":
				if(obj.attr("timeadd")=="timeadd"){


					return "@ThisDayL@";
				}else{
					/*var R = $YY+"-"+$MM+"-"+$DD+ " 00:00:00' ";
					thisDate.setDate(thisDate.getDate()-num);
					var $DDS = thisDate.getDate()<10?'0'+thisDate.getDate():thisDate.getDate();
					var $YYS = thisDate.getFullYear();
					var $MMS = (thisDate.getMonth()+1*1)<10 ? '0'+(thisDate.getMonth()+1*1) :(thisDate.getMonth()+1*1);*/
					
					return "@ThisDayL-"+num+"@";

				}
				
				break;
			case "nextday":
				if(obj.attr("timeadd")=="timeadd"){
					return "@ThisDayR+"+num+"@";
				}else{
					return "@ThisDayR@";
				}
				/*var R = $YY+"-"+($MM)+"-"+$DD+ " 00:00:00' ";
				thisDate.setDate(thisDate.getDate()+num);
				var $DDS = thisDate.getDate()<10?'0'+thisDate.getDate():thisDate.getDate();
				var $YYS = thisDate.getFullYear();
				var $MMS = (thisDate.getMonth()+1*1)<10 ? '0'+(thisDate.getMonth()+1*1) :(thisDate.getMonth()+1*1);
				return "("+name + " > '" + $YY+"-"+($MM)+"-"+$DD+ " 00:00:00' AND "
						+ name +" <= " +$YYS+"-"+$MMS+"-"+$DDS+ " 23:59:59' )";*/

				return "@ThisDayR@";
				break;
			case "premonth":
				thisDate.setMonth(thisDate.getMonth()-num);
				var $YYS = thisDate.getFullYear();
				var $MMS = (thisDate.getMonth()+1*1)<10 ? '0'+(thisDate.getMonth()+1*1) :(thisDate.getMonth()+1*1);
				if(obj.attr("timeadd")=="timeadd"){
					return "@PrevMonthLastDay@";
				}else{
					return "@ThisMonthFirstDay-"+num+"@";
				}
				break;

		}
	}
};
