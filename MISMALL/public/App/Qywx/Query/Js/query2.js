/*!
 * 查询分析器
 */
var $getJson;
var  $dropDown = $('<ul class="dropdown-menu my-menu" id="menu-right" role="menu" aria-labelledby="dropdownMenu">'
               + '<li class="menu-sysParam-list"><a href="javascript:;">系统变量</a></li><li class="divider"></li>'
                +'<li class="menu-forminfo"><a href="javascript:;">表单控件</a></li>'
                +'<li class="divider"></li>'
                +'<li class="dropdown-submenu menu-tableinfo">'
                +'<a tabindex="-1" href="javascript:;">表格控件</a>'
                +'</li>'
                +'<li class="divider"></li>'
                +'<li class="dropdown-submenu menu-null" >'
                +'<a tabindex="-1" href="javascript:;">清空</a>'
                +'</li></ul>');
//var flowID = _getUrlParas('flowId') ? _getUrlParas('flowId') : '';
var querier_id = _getUrlParas('queryid') ? _getUrlParas('queryid') : '';
var siteId   =  _getUrlParas('siteId') ? _getUrlParas('siteId') : '';
var QueryClass = function() {
	var that = this;
	this._init = function() {
		//var formid = _getUrlParas('formid') ? _getUrlParas('formid') : '';
		
		var type = _getUrlParas('type') ? _getUrlParas('type') : '';
		//var flowid = _getUrlParas('flowid') ? _getUrlParas('flowid') : '';
		//var querier_id = _getUrlParas('queryid') ? _getUrlParas('queryid') : '';//查询ID not querier_ID
		var CCname = _getUrlParas('CCname') ? _getUrlParas('CCname') : '';
		 	
			$.ajax({
				type : "POST",
				url:APPPATH + "/FormData/getFormListTrue",
				data : {"flowId" :flowID},
				success : function(r){
					console.log(r);
				}
			});
		
		
		listChange();//切换单表的事件触发
		
		if (type == "") {//
			var $getJson = window.parent.Global;
		} else if(type=="form"){//从form中来的
			$.ajax({
				type : "post",
				url : GROUPPATH + '/FormDesign/getFormJson',
				data : {
					id : formid
				},
				async : false,
				dataType : 'Json',
				success : function(r) {
					$getJson = r;
				}
			});
		}else if(type=="flow"){
			
		}else if(type=="ezq"){
			
		}
		//解析xml start  Frm201401211531537974
		if ($getJson != "") {
			// var frmID = $getJson.children("control[type='CCForm']").attr("name");
		}

		var $getTname;
		//解析xml end

		// var flowid = _getUrlParas('flowid') ? _getUrlParas('flowid') : '';
		// var querier_id = _getUrlParas('queryid') ? _getUrlParas('queryid') : '';
		// //查询ID not querier_ID
		// var CCname = _getUrlParas('CCname') ? _getUrlParas('CCname') : '';
		//获取tableName 用于添加sys变量的控件判断
		

		//默认加载单表查询模式
		
		byForm();

		//点击事件 用户选择用多表还是单表及其自己的一些效果

/*
		$("#searchByFields").hover(function() {
			$(this).css("color", "#000");

		}, function() {
			$(this).css("color", "#FFFFFF");
		}).on("click", function() {

			$(this).hide();
			$(".right_data .right_data_content").detach();
			$("#right_where_content .right_where_column").empty();
			$(".right_data_header").empty();
			$("#searchByForm").show();
			$("#byForm").hide();
			$("#byFields").show();
			$("#clickTable").show();
			$(".right_data_header").hide();
			$("#delField").hide();

			$("#right_where_content .moreCon").attr("by", "more");

			byFields.initGetTable();
			//鐢ㄥ瓧娈垫煡璇紙澶氳〃妯″紡锛�

		});*/

	
		
		function listChange(){
		//左边菜单效果
			$(".list").unbind("click").on("click", function(){
				if($(this).hasClass("menuSelected")){
					return;	
				}else {
					$(".list").find(".content").slideUp("fast");
					$(".list").removeClass("menuSelected");
					$(this).find(".content").slideDown("fast");
					$(this).addClass("menuSelected");
					if($(this).attr("id")=="byField"){
						$(".right_data .right_data_content").detach();
						$("#right_where_content .right_where_column").empty();
						$(".right_data_header").empty();
						$("#searchByForm").show();
						
						$("#byFields").show();
						//$("#clickTable").show();
						$(".right_data_header").hide();
						$("#delField").hide();
			
						$("#right_where_content .moreCon").attr("by", "more");
						byFields.initGetTable();//多表查询方式
					}else if($(this).attr("id")=="byForm"){
						$(".right_data_header").show();
						//$("#clickTable").hide();
						
						$("#byForm").show();
						$("#searchByFields").show();
						$(".right_data table").remove();
			
						$("#right_where_content .moreCon").attr("by", "single");
						byForm();
					}
				}
				
				
			});
		}
		// 获取表单及表格名称信息，放在左边选择列表
		function byForm() {
			
		
			//查询ID not querier_ID
			
		
		

			if (querier_id != '') {//修改
				getTables();
				var $tname = $("#exist").html();
				$("#exist").remove();
				_commonAjax({
					type : "POST",
					url:APPPATH + "/FormData/getFormListTrue",
					data : {"flowId" :flowID},
					processData : false,
					//data : {
						//flow_id : flowid
				//	},
					//url : GROUPPATH + "/Query/getFlowDataTable",
					dataType : 'text',
					async : false,
					success : function(result) {
						var json_obj = jQuery.parseJSON(result);
						var html_content = '';
						$(json_obj).each(function(index) {

							$form_id = json_obj[index].isMasterTable == 1 ? json_obj[index].ID : json_obj[index].mainFormID;

							if (json_obj[index].tableName == $tname) {
								html_content += '<li class="current" tid="' + json_obj[index].tableID + '" fid="' + $form_id + '" tname="' + json_obj[index].tableName + '">' + json_obj[index].tableTitleName + '</li>';
							} else {
								html_content += '<li tid="' + json_obj[index].tableID + '" fid="' + $form_id + '" tname="' + json_obj[index].tableName + '">' + json_obj[index].tableTitleName + '</li>';
							}
						});

						$(".left_formlist").empty();

						$(".left_formlist").append(html_content);
						if (type == "") {
							var tableID = $("#left .left_formlist li.current").attr("tid");
							var tableName = $("#left .left_formlist li.current").attr("tname");
							addSysFieldsControl(tableName, tableID, $getTname);
							_initEditTitle();
							save();
						} else {
							$(".left_formlist").find("li").removeClass("current");
							$(".left_formlist").find("li[fid=" + formid + "]").addClass("current");
						}

					}
				});
			} else {//新增数据源  单表
				
				_commonAjax({
					processData : false,
					type : "POST",
					url:APPPATH + "/FormData/getFormListTrue",
					data : {"flowId" :flowID},
					
					//url : GROUPPATH + "/Query/getFlowDataTable",
					dataType : 'text',
					async : false,
					success : function(result) {
						var json_obj = jQuery.parseJSON(result);
						console.log(result);
						var html_content = '';
						$(json_obj).each(function(index) {
							$form_id = json_obj[index].isMasterTable == 1 ? json_obj[index].ID : json_obj[index].mainFormID;
							if (index == 0) {
								html_content += '<li tid="' + json_obj[index].ID + '" fid="' + $form_id + '" tname="' + json_obj[index].tableName + '">' + json_obj[index].tableTitle + '</li>';
							} else {
								html_content += '<li tid="' + json_obj[index].ID + '" fid="' + $form_id + '" tname="' + json_obj[index].tableName + '">' + json_obj[index].tableTitle + '</li>';
							}
						});

						$(".left_formlist").empty().append(html_content);//清空单表查询的表单列表并且添加

						var tableID = $("#left .left_formlist li.current").attr("tid");
						var tableName = $("#left .left_formlist li.current").attr("tname");
						addSysFieldsControl(tableName, tableID, $getTname);
						$(".left_formlist").find(">li").on("click", function(){
							$(".left_formlist").find(">li").removeClass("current");
							
							$(this).addClass("current");
							_initTitle();
							$(".right_where").show();
						});
						
						save();
					}
				});
			}
		}

		//用字段查询的方式

		/*
		 * 获取数据源查询的table
		 * */
		function getTables() {
			var querier_id = _getUrlParas('queryid') ? _getUrlParas('queryid') : '';
			_commonAjax({
				processData : false,
				data : {
					querier_id : querier_id
				},
				url : GROUPPATH + "/Query/getExistQuery",
				dataType : 'text',
				async : false,
				success : function(r) {
					var json_obj = jQuery.parseJSON(r);
					var html_content = "";
					for (var key in json_obj) {
						$("#left").after('<div id="exist" style="display:none;">' + json_obj[key] + '</div>');
					}

				}
			});
		}

		/*
		 * 初始化删除的信息
		 *
		 * */
		function _initDel(str) {
			$("#delField").html("").append('<option value="">请选择需要恢复的数据</option>');
			if (str != "") {
				$("#delField").append(str);
			}
			_initDelSelect();
			$(".right_data_header").find("span.order").on("click", function() {
				$(".right_data_header span[type=order]").removeClass("curr").addClass("order");
				// $(".right_data_header span[type=order]").addClass("order");
				$(this).removeClass("order").addClass("curr");
				// $(this).addClass("curr");

				if ($(this).attr("order") == "DESC") {
					$(this).css("background-image", "url(" + PUBLICPATH + "/App/Designer/Query/Images/order_up.png)");
					$(this).attr("order", "ASC");

				} else {
					$(this).css("background-image", "url(" + PUBLICPATH + "/App/Designer/Query//Images/order_down.png)");
					$(this).attr("order", "DESC");
				}
				system._initGetSql();
			});
			$(".right_data_header").find("span.delete").click(function() {
				
				if ($(".right_data_header").find("li:visible").length > 1) {//判断是否全部删除完了
					var fieldName = $(this).prev().html();
					var fieldValue = $(this).parent().attr("fieldname");

					$(".right_data").find('li[fieldname="' + fieldValue + '"]').css("display", "none");
					//隐藏字段
					$("#delField").append('<option value="' + fieldValue + '">' + fieldName + '</option>');
					system._initGetSql();
					_initDelSelect();
				} else {
					alert("亲，至少保留一列数据吧！");
				}

			});
			$("#delField").bind("change", function() {
				if ($(this).val() != "") {
					var $fieldValue = $(this).val();
					//alert($fieldValue);
					$(this).find('option[value=' + $fieldValue + ']').remove();
					$(".right_data").find('li[fieldname="' + $fieldValue + '"]').show();
					//$(".right_data").find('li[fieldname="' + $fieldValue + '"]').css("display", "block");
					//显示字段
					system._initGetSql();
				}

				_initDelSelect();
				//初始化恢复字段的显示和隐藏
			});

		}

		/*
		 * 判断是否隐藏恢复字段的select
		 *
		 * */
		function _initDelSelect() {
			if ($("#delField").find("option").length <= 1) {
				$("#delField").hide();
			} else {
				$("#delField").show();
			}
			var result = "";
			$(".right_data_header").find("li").each(function() {

				if ($(this).css("display") != "none") {
					result += $(this).attr("fieldname") + " ,";
				}
			});
			//$("#sqlresult").empty();
			//$("#sqlresult").append(result.substring(0, result.length - 2));
		}

		/*
		 * 编辑的时候获取右边title信息
		 * @prama xml_str   xml信息
		 * */
		function _initGetEditTitle(xml_str) {
			var $this = this;
			_commonAjax({
				processData : false,
				data : {
					xml_str : xml_str
				},
				url : GROUPPATH + "/Query/getTableTitleExist",
				dataType : 'text',
				async : false,
				success : function(data) {
					var obj = jQuery.parseJSON(data);
					var html_content = "";
					var html_option = "";
					var html_contents = "";
					$(".right_data_header").empty();
					for (var key in obj) {
						if (obj[key]["display"] != "none") {
							html_content = $('<li fieldname="' + obj[key]["value"] + '" type="' + obj[key]["type"] + '"><span class="title">' + obj[key]["name"] + '' + '</span>' + '<span class="delete"></span><div class="opt"><a><img src="' + PUBLICPATH + '/App/Designer/Query/Images/px.png" title="按此列排序" class="orderBythis"/><img src="' + PUBLICPATH + '/App/Designer/Query/Images/fz.png" title="按此列分组" class="cat" />' + '<img src="' + PUBLICPATH + '/App/Designer/Query/Images/qh.png" title="按此列求和" class="sum"/><img src="' + PUBLICPATH + '/App/Designer/Query/Images/max.png" title="求最大值" class="max"/><img src="' + PUBLICPATH + '/App/Designer/Query/Images/min.png" title="求最小值" class="min"/><img src="' + PUBLICPATH + '/App/Designer/Query/Images/pj.png" title="求平均值" class="avg"/></a></div>' + ' </li>');

							if (obj[key]["sorttype"]) {
								html_content.attr(obj[key]["sorttype"], obj[key]["sortvalue"]);
								var $img = html_content.find("img." + obj[key]["sorttype"]);
								$img.css({
									backgroundColor : '#AACCEE',
									border : '1px solid #2692D6'
								});
							}
							if (obj[key]["sorted"] != "undefined") {
								html_content.attr("sorted", obj[key]["sorted"]);
								var $img = html_content.find("img.orderBythis").css({
									backgroundColor : '#AACCEE',
									border : '1px solid #2692D6'
								});
							}
							if (obj[key]["group"] != "undefined") {
								html_content.attr("group", obj[key]["group"]);
								var $img = html_content.find("img.cat").css({
									backgroundColor : '#AACCEE',
									border : '1px solid #2692D6'
								});
							}
							$(".right_data_header").append(html_content);

						} else {
							html_content = $('<li fieldname="' + obj[key]["value"] + '" style="display:none;" type="' + obj[key]["type"] + '"><span class="title">' + obj[key]["name"] + '' + '</span>' + '<span class="delete"></span><div class="opt"><a><img src="' + PUBLICPATH + '/App/Designer/Query/Images/px.png" title="按此列排序" class="orderBythis"/><img src="' + PUBLICPATH + '/App/Designer/Query/Images/fz.png" title="按此列分组" class="cat" />' + '<img src="' + PUBLICPATH + '/App/Designer/Query/Images/qh.png" title="按此列求和" class="sum"/><img src="' + PUBLICPATH + '/App/Designer/Query/Images/max.png" title="求最大值" class="max"/><img src="' + PUBLICPATH + '/App/Designer/Query/Images/min.png" title="求最小值" class="min"/><img src="' + PUBLICPATH + '/App/Designer/Query/Images/pj.png" title="求平均值" class="avg"/></a></div></li>');
							if (obj[key]["sorttype"]) {
								html_content.attr("sorttype", obj[key]["sortvalue"]);
								var src = html_content.find("img." + obj[key]["sortvalue"] + "").attr("src");
							}
							if (obj[key]["sorted"] != undefined) {
								html_content.attr("sorted", obj[key]["sorted"]);
							}
							if (obj[key]["group"] != undefined) {
								html_content.attr("group", obj[key]["group"]);
							}
							$(".right_data_header").append(html_content);
							html_option += '<option value="' + obj[key]["value"] + '">' + obj[key]["name"] + '</option>';
						}
					}
					// $this.getFieldSum();

					// $(".right_data_header").append(html_contents);

					_initDel(html_option);
				}
			});
		}

		/*点击修改数据源的时候加载右边的数据和筛选条件
		 *编辑进去的时候加载右边标题函数以及下面的筛选条件字段
		 *
		 */
		function _initEditTitle() {
		
			var strTid = $(".left_formlist").find("li[class='current']").attr("tid");
			_commonAjax({
				processData : false,
				data : {
					querier_id : querier_id
				},
				url : GROUPPATH + "/Query/getAQuerierData",
				dataType : 'text',
				async : false,
				success : function(r) {
					var json_titleobj = jQuery.parseJSON(r);
					var xml_str = json_titleobj["xmlData"];
					_initGetEditTitle(xml_str);
					//第一行的标题加载(编辑的时候获取右边title信息)
					var strSelect = '';
					var strConditionLast = '<select><option value="1">等于</option>' + '<option value="2">大于等于</option>' + '<option value="3">小于等于</option>' + '<option value="4">大于</option>' + '<option value="5">小于</option>' + '<option value="6">不等于</option>' + '<option value="7">包含</option>' + '</select><input type="text" class="normal" oninput="system.changeDataFromType($(this))" datafrom="" field="" immark="" value="" / ><img class="addCondition" ' + 'style="opacity:1;cursor:pointer;margin-left:10px;margin-top:8px;" ' + 'src="' + IMAGES_URL + 'icon_sjyadd.png" /><a class="addCuo">请先填写筛选条件</a></li>';
					var strConditionLast1 = '<select><option value="1">等于</option>' + '<option value="2">大于等于</option>' + '<option value="3">小于等于</option>' + '<option value="4">大于</option>' + '<option value="5">小于</option>' + '<option value="6">不等于</option>' + '<option value="7">包含</option>' + '</select><input class="easyui-datetimebox"  data-options="editable:false" style="width:210px;height:30px;line-height:30px;font-size:15px;margin-left:0px;"/><img class="addCondition" ' + 'style="opacity:1;cursor:pointer;margin-left:10px;margin-top:8px;" ' + 'src="' + IMAGES_URL + 'icon_sjyadd.png" /><a class="addCuo">请先填写筛选条件</a></li>';
					var strConditionLast2 = '<select><option value="1">等于</option>' + '<option value="2">大于等于</option>' + '<option value="3">小于等于</option>' + '<option value="4">大于</option>' + '<option value="5">小于</option>' + '<option value="6">不等于</option>' + '<option value="7">包含</option>' + '</select><input  data-options="showSeconds:true,editable:false" class="easyui-datetimebox" ' + 'style="width:210px;height:30px;line-height:30px;font-size:15px;margin-left:0px;" />' + '<img class="delCondition" ' + 'style="cursor:pointer;margin-left:10px;margin-top:8px;" src="' + IMAGES_URL + 'icon_sjydel.png" />' + '<a class="addCuo">请先填写筛选条件</a></li>';
					var strConditionLast3 = '<select><option value="1">等于</option>' + '<option value="2">大于等于</option>' + '<option value="3">小于等于</option>' + '<option value="4">大于</option>' + '<option value="5">小于</option>' + '<option value="6">不等于</option>' + '<option value="7">包含</option>' + '</select><input type="text" class="normal" oninput="system.changeDataFromType($(this))" datafrom="" field="" immark="" value="" /><img class="delCondition" ' + 'style="cursor:pointer;margin-left:10px;margin-top:8px;" src="' + IMAGES_URL + 'icon_sjydel.png" />' + '<a class="addCuo">请先填写筛选条件</a></li>';
					var xml_query = xml_str.ToXml();
					$(".right_where_column").empty();
					xml_query.find("fields field").each(function() {
						var xml_cond = $(this).find("conditions condition");
						if (xml_cond.size() == 0) {//判断条件是否为空
							var html_conditions = "";

							if ($(this).find("value").html().substr(0, 6) == "CCTime") {//判断是否是时间字段
								html_conditions += '<li class="dropdown time" add="no" ftype="' + $(this).find("type").html() + '" fname="' + $(this).find("value").html() + '" id="CTime"><span class="tit">' + $(this).find("name").html() + '</span>';
								html_conditions += strConditionLast1;
								$(".right_where_column").append(html_conditions);
								//$.parser.parse($("#CTime"));
								$("#CTime").removeAttr("id");
							} else {
								html_conditions += '<li class="dropdown" add="no" ftype="' + $(this).find("type").html() + '" fname="' + $(this).find("value").html() + '"><span class="tit">' + $(this).find("name").html() + '</span>';
								html_conditions += strConditionLast;
								$(".right_where_column").append(html_conditions);
							}
						} else {//条件不为空的时候遍历
							var $thisValue = $(this).find("value").html();
							var $thisType = $(this).find("type").html();
							var $thisShowName = $(this).find("name").html();
							if ($thisValue.substr(0, 6) == "CCTime") {//字段为时间的时候
								xml_cond.each(function(index) {//条件为空的时候

									if (index == 0) {//第一个条件的显示字段的额名字
										var html_conditions = "";
										html_conditions += '<li class="dropdown time" add="no" ftype="' + $thisType + '" fname="' + $thisValue + '" id="CTime"><span class="tit">' + $thisShowName + '</span>';
										html_conditions += strConditionLast1;
										$(".right_where_column").append(html_conditions);
										//$.parser.parse($("#CTime"));
										$(".right_where_column").find("li:last").find('option[value=' + $(this).find("cvalue").html() + ']').attr("selected", "selected");
										$("#CTime").find("input:first").datebox('setValue', $(this).find("showvalue").html());
										$("#CTime").removeAttr("id");
									} else {
										var html_conditions = "";
										html_conditions += '<li class="dropdown time" add="add" ftype="' + $thisType + '" fname="' + $thisValue + '" id="CTime"><span class="tit" style="background:#FFF;">' + $thisShowName + '</span>';
										html_conditions += '<select style="width:68pt;"><option value="or">或者</option><option value="and">并且</option></select>';
										html_conditions += strConditionLast1;
										$(".right_where_column").append(html_conditions);
										//$.parser.parse($("#CTime"));
										$(".right_where_column").find("li:last").find('option[value=' + $(this).find("linkvalue").html() + ']').attr("selected", "selected");
										$(".right_where_column").find("li:last").find('option[value=' + $(this).find("cvalue").html() + ']').attr("selected", "selected");
										$("#CTime").find("input:first").datebox('setValue', $(this).find("showvalue").html());
										$("#CTime").removeAttr("id");
									}
								});
							} else {
								xml_cond.each(function(index) {//条件不为空字段不是时间的时候
									if (index == 0) {//第一个条件的显示字段的名字
										var html_conditions = "";
										html_conditions += '<li class="dropdown" add="no" ftype="' + $thisType + '" fname="' + $thisValue + '"><span class="tit">' + $thisShowName + '</span>';
										html_conditions += strConditionLast;
										$(".right_where_column").append(html_conditions);
										$(".right_where_column").find("li:last").find("input.normal").attr("value", $(this).find("showvalue").html());
										$(".right_where_column").find("li:last").find('option[value=' + $(this).find("cvalue").html() + ']').attr("selected", "selected");
										$(".right_where_column").find("li:last").find("input.normal").attr("datafrom", $(this).find("datafrom").html());
										$(".right_where_column").find("li:last").find("input.normal").attr("immark", $(this).find("immark").html());
										$(".right_where_column").find("li:last").find("input.normal").attr("field", $(this).find("fieldvalue").html());
									} else {//其他的字段要带上连接or 或and
										var html_conditions = "";
										html_conditions += '<li class="dropdown" add="add" ftype="' + $thisType + '" fname="' + $thisValue + '" ><span class="tit"  style="background:#fff;">' + $thisShowName + '</span>';
										html_conditions += '<select style="width:68pt;"><option value="or">或者</option><option value="and">并且</option></select>';
										html_conditions += strConditionLast3;
										$(".right_where_column").append(html_conditions);
										$(".right_where_column").find("li:last").find('option[value=' + $(this).find("linkvalue").html() + ']').attr("selected", "selected");
										$(".right_where_column").find("li:last").find("input.normal").attr("value", $(this).find("showvalue").html());
										$(".right_where_column").find("li:last").find('option[value=' + $(this).find("cvalue").html() + ']').attr("selected", "selected");
										$(".right_where_column").find("li:last").find("input.normal").attr("datafrom", $(this).find("datafrom").html());
										$(".right_where_column").find("li:last").find("input.normal").attr("immark", $(this).find("immark").html());
										$(".right_where_column").find("li:last").find("input.normal").attr("field", $(this).find("fieldvalue").html());
									}
								});
							}

						}
					});
					//return;
					//增加右键系统变量
					system._addSysFields();
					//获取sql信息并显示在sql面板
					system._initGetSql();
					//select条件变化打印Sql
					system._printSql();
					_initAddSql();
					//排序，分组，求和，最大值，最小值等
					optionResult.sortFields();
					optionResult.groupFields();
					optionResult.getFieldSum();
					optionResult.getFieldMax();
					optionResult.getFieldMin();
					optionResult.getFieldAvg();
					//初始化增加条件和删除条件的方法
					$(".right_where_column").delegate(".delCondition", "click", function() {

						if ($(this).parent().next().attr("timeadd") == "timeadd") {
							$(this).parent().next().remove();
						}//
						$(this).parent().remove();
						system._initGetSql();
					});
				}//外层ajax结果(result)操作结束
			});
			//外层ajax结束
		}

		/*
		 * 增加系统变量
		 * */

		/*
		 *加载右边标题函数以及下面的筛选字段
		 *
		 *
		 */

		function _initTitle() {
			var $this = this;
			var strTid = $(".left_formlist").find("li[class='current']").attr("tid");
			_commonAjax({
				processData : false,
				data : {
					"id" : strTid
				},
				url : APPPATH + "/Home/FormData/getFormFileds",
				dataType : 'text',
				success : function(r) {
					console.log(r);
					var json_titleobj = jQuery.parseJSON(r);
					var strTitle = '';
					var strConditionTitle = '';
					var strConditionLast = '<select><option value="1">等于</option>' + '<option value="2">大于等于</option>' + '<option value="3">小于等于</option>' + '<option value="4">大于</option>' + '<option value="5">小于</option>' + '<option value="6">不等于</option>' + '<option value="7">包含</option>' + '</select><input  data-toggle="dropdown" type="text" class="normal CCTextBox form-control input-sm" oninput="system.changeDataFromType($(this))" datafrom="" ' + 'field="" immark="" value="" /><img class="addCondition" ' + 'style="opacity:1;cursor:pointer;margin-left:10px;margin-top:8px;" ' + 'src="' + IMAGES_URL + 'icon_sjyadd.png" /><a class="addCuo">请先填写筛选条件</a></li>';
					var strConditionLast1 = '<select><option value="1">等于</option>' + '<option value="2">大于等于</option>' + '<option value="3">小于等于</option>' + '<option value="4">大于</option>' + '<option value="5">小于</option>' + '<option value="6">不等于</option>' + '<option value="7">包含</option>' + '</select><input data-toggle="dropdown" class="CCTextBox form-control input-sm"  data-options="editable:false" style="width:210px;height:30px;line-height:30px;font-size:15px;margin-left:0px;"/><img class="addCondition" ' + 'style="opacity:1;cursor:pointer;margin-left:10px;margin-top:8px;" ' + 'src="' + IMAGES_URL + 'icon_sjyadd.png" /><a class="addCuo">请先填写筛选条件</a></li>';
					var strConditionLast2 = '<select><option value="1">等于</option>' + '<option value="2">大于等于</option>' 
					+ '<option value="3">小于等于</option>' + '<option value="4">大于</option>' 
					+ '<option value="5">小于</option>' 
					+ '<option value="6">不等于</option>' 
					+ '<option value="7">包含</option>' 
					+ '</select><div  class="input-group date ">'
					+'<input class="CCTextBox form-control input-sm" data-date-format="yyyy-mm-dd hh:mm:ss" data-toggle="dropdown" type="text" size="12" style="width:100%;height:30px;line-height:30px;font-size:15px;margin-left:0px;">'
					+'<span class="input-group-addon"><span class="glyphicon glyphicon-calendar">'
					+'</span></span><img class="addCondition" ' + 'style="opacity:1;cursor:pointer;margin-left:10px;margin-top:8px;" ' + 'src="' + IMAGES_URL + 'icon_sjyadd.png" /><a class="addCuo">请先填写筛选条件</a>'
					+'</div>'
					+'</li>';
					$(json_titleobj).each(function(index) {
						strConditionTitle += '<li class="dropdown" add="no" ftype="' + json_titleobj[index].controlType + '" fname="' + json_titleobj[index].fieldName + '" style="display:none"><span class="tit" title="' + json_titleobj[index].fieldTitle + '">' + json_titleobj[index].fieldTitle + '</span>';
						if (json_titleobj[index].fieldName.substr(0, 6) == "CCTime") {
							strConditionTitle += strConditionLast2;
						} else {
							strConditionTitle += strConditionLast;
						}
						strTitle += '<li fieldName=' + json_titleobj[index].fieldName + ' type="' + json_titleobj[index].controlType + '"><span class="title" title="'+json_titleobj[index].fieldTitle+'">' + json_titleobj[index].fieldTitle + '</span><span class="delete"></span><div class="opt"><a><img src="' + PUBLICPATH + '/App/Designer/Query/Images/px.png" title="按此列排序" class="orderBythis"/><img src="' + PUBLICPATH + '/App/Designer/Query/Images/fz.png" title="按此列分组" class="cat" />' + '<img src="' + PUBLICPATH + '/App/Designer/Query/Images/qh.png" title="按此列求和" class="sum"/><img src="' + PUBLICPATH + '/App/Designer/Query/Images/max.png" title="求最大值" class="max"/><img src="' + PUBLICPATH + '/App/Designer/Query/Images/min.png" title="求最小值" class="min"/><img src="' + PUBLICPATH + '/App/Designer/Query/Images/pj.png" title="求平均值" class="avg"/></a></div></li>';
					});
					$(".right_data_header").empty().append(strTitle);//
					$(".right_where_column").empty().append(strConditionTitle);
					
					
					$(".date").datetimepicker({
						language : "zh-CN", //汉化
						weekStart : 1,
						todayBtn : 1,
						autoclose : 1,
						format : "yyyy-mm-dd HH:mm:ss",
						todayHighlight : 1,
						startView : 2,
						minView : 2,
						forceParse : 0
					});
					system._addSysFields();
//					$.parser.parse($('.right_where_column'));
					//获取sql

					
					system._initGetSql();
					
					system._printSql();
					//select条件变化打印Sql
					//鼠标获取的时候初始化增加sql函数 不是修改的时候
					_initAddSql();
					//初始化增加条件和删除条件的方法
					_initDel();
					//排序，分组，求和，最大值，最小值等
					optionResult.sortFields();
					optionResult.groupFields();
					optionResult.getFieldSum();
					optionResult.getFieldMax();
					optionResult.getFieldMin();
					optionResult.getFieldAvg();
				}
			});
			_initSelectConditions();

		}
		//初始化筛选的字段的table
		function _initSelectConditions() {
			
			$(".moreCon").click(function() {
				
				if ($(this).attr("by") == "single") {
					var tables = $(".left_formlist li.current").attr("tname");
					var tablenameCN = $(".left_formlist li.current").text();
					if ($("#select_fields").hasClass("window-body")) {
						$("#select_fields table").remove();
					} else {
						$("#select_fields").empty();
					}
					var rtable = $("<table style='border-collapse: none;'></table>");
					var tr = $("<tr><td class='" + tables + "' style='width:100px;color:#0E9E12;font-size:16px;' align='left'><input type='checkbox'  name='" + tables + "' field='main' />" + tablenameCN + "</td><td></td></tr>");
					rtable.append(tr);
					$(".right_where_column>li[add!=add]").each(function() {

						if ($(this).hasClass("table")) {

							var tr = $("<tr></tr>");
							var td = ("<td class='" + $(this).attr("id") + "' style='width:100px;color:#0E9E12;font-size:16px;' align='left'><input type='checkbox'  name='" + $(this).attr("id") + "' field='main' />" + $(this).text() + "</td><td></td>");
							tr.append(td);
							rtable.append(tr);
						} else {
							if ($(this).css("display") != "none") {
								var $names = rtable.find("td:last").prev().attr("class");
								rtable.find("td:last").append("<li><input type='checkbox'   value='" + $(this).attr("fname") + "' field='" + $(this).attr("ftype") + "' name='" + $names + "' checked/> <a>" + $(this).find("span:first").text() + "</a></li>");
							} else {
								var $names = rtable.find("td:last").prev().attr("class");
								rtable.find("td:last").append("<li><input type='checkbox'   value='" + $(this).attr("fname") + "' field='" + $(this).attr("ftype") + "' name='" + $names + "' /> <a>" + $(this).find("span:first").text() + "</a></li>");
							}

						}

					});

					//$("#select_fields").append("<input type='checkbox' id='a' />");
					if ($("#select_fields").hasClass("window-body")) {
						$("#select_fields").find("div.panel>div").append(rtable);
						$("#select_fields").dialog('open');
					} else {
						$("#select_fields").append(rtable);
					
						$("#select_fields").css("overflow", "auto");
					}
					$("#select_fields table").delegate("input[field=main]", "click", function() {

						if ($(this).prop("checked") == true) {
							$(this).parent().next().find("input").prop("checked", true);
						} else {
							$(this).parent().next().find("input").prop("checked", false);
						}
					});
				}

			});
		}

		/*
		 * 初始化增加判断条件的按钮和以及删除
		 * */
		function _initAddSql() {
			
			$(".right_where_column").find(".addCondition").on("mouseenter", function() {
				$(this).css("opacity", "0.5");
			}).bind("mouseleave", function() {
				$(this).css("opacity", "1");
			});

			$(".right_where_column").find(".addCondition").on("click", function() {
				// EventUtil.stopPropagation(e);
				var mark = true;

				var fname = $(this).parents(".dropdown:first").attr("fname");
				var ulObj = $(this).parents("ul.right_where_column");
				ulObj.find("li[fname='" + fname + "']").each(function() {
					//如果不是时间为空
					if ( $(this).find("input.form-control").val() == '') {
						mark = false;
						var obj = $(this).find(".addCuo");
						obj.fadeIn();
						setTimeout(function() {
							obj.fadeOut();
						}, 1000);
					}
				});
				if (mark == true) {
					
					var fname = $(this).parents("li.dropdown").attr("fname");
					var ftype = $(this).parents("li.dropdown").attr("ftype");
					if (ftype == "CCTime") {
						ulObj.find("li[fname='" + fname + "']").last().after('<li class="dropdown" fname="' + fname + '" ftype="' + ftype + '" add="add" id="addConditions">' + '<span style="background:#fff;" class="tit">&nbsp;</span>' + '<select style="width:68pt;"><option value="or">或者</option>' + '<option value="and">并且</option></select>' + '<select><option value="1">等于</option>' + '<option value="2">大于等于</option>' + '<option value="3">小于等于</option>' + '<option value="4">大于</option>' + '<option value="5">小于</option>' + '<option value="6">不等于</option>' + '<option value="7">包含</option>' + '</select><div class="input-group date" id="addConditions"><input type="text" style="width:100%;height:30px;line-height:30px;font-size:15px;margin-left:0px;" size="12" data-toggle="dropdown" data-date-format="yyyy-mm-dd hh:mm:ss" class="CCTextBox form-control input-sm"><span class="input-group-addon"><span class="glyphicon glyphicon-calendar"></span></span>' + '<img class="delCondition" ' + 'style="cursor:pointer;margin-left:10px;margin-top:8px;" src="' + IMAGES_URL + 'icon_sjydel.png" />' + '<a class="addCuo">请先填写筛选条件</a></div></li>');
						$(".date").datetimepicker({
							language : "zh-CN", //汉化
							weekStart : 1,
							todayBtn : 1,
							autoclose : 1,
							format : "yyyy-mm-dd HH:mm:ss",
							todayHighlight : 1,
							startView : 2,
							minView : 2,
							
						});
						$("#addConditions").removeAttr("id");
					} else {
						ulObj.find("li[fname='" + fname + "']").last().after('<li class="dropdown" fname="' + fname + '" ftype="' + ftype + '" add="add" >' + '<span style="background:#fff;" class="tit">&nbsp;</span>' + '<select style="width:68pt;"><option value="or">或者</option>' + '<option value="and">并且</option></select>' + '<select><option value="1">等于</option>' + '<option value="2">大于等于</option>' + '<option value="3">小于等于</option>' + '<option value="4">大于</option>' + '<option value="5">小于</option>' + '<option value="6">不等于</option>' + '<option value="7">包含</option>' + '</select><input type="text" class="normal CCTextBox form-control input-sm" ' + 'oninput="system.changeDataFromType($(this))" datafrom="" field="" immark="" value="" /><img class="delCondition" ' + 'style="cursor:pointer;margin-left:10px;margin-top:8px;" src="' + IMAGES_URL + 'icon_sjydel.png" />' + '<a class="addCuo">请先填写筛选条件</a></li>');
					}

					$(".right_where_column").find(".delCondition").unbind("click").on("click", function(e) {

						if ($(this).parent().next().attr("timeadd") == "timeadd") {
							$(this).parent().next().remove();
						}

						$(this).parent().remove();
						system._initGetSql();

					});

					system._printSql();
					//初始化鼠标和回车打印sql
					system._addSysFields();
					//增加右键系统变量的
				}
			});

		}

		/*
		 * 获取条件判断的
		 * */
		function getConditionValue(str) {
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
		}

		function save() {
	//			$('#dlg').dialog('close');
			$("#sqlSubmitBtn").click(function() {
				var dlgObj = $("#dlg");
				if (dlgObj.length > 0) {

				} else {
					$("#saveDlg").append('<div id="dlg" class="modal fade bs-example-modal-sm" tabindex="-1" role="dialog" aria-labelledby="mySmallModalLabel" aria-hidden="true">'
					+'  <div class="modal-dialog modal-sm">'
					+'    <div class="modal-content">'
					+'<div class="modal-header"><h4 class="modal-title">数据源保存</h4></div>'
					+' <div class="modal-body sourceDataInput">数据源名称:<input type="text" id="submitsourcename" style="width:180px;border: 1px solid #0E9ED0;border-radius: 2px;"/></span>' + '<div id="validTip">请输入数据源名称</div></div>'
					+'<div class="modal-footer">' 
					+'<button type="button" class="btn btn-default" data-dismiss="modal">取消</button>'
       				+'<button type="button" class="btn btn-primary">确定</button></div></div>  </div></div>');
					//$("#saveDlg").append('<div id="dlg" class="easyui-dialog" title="Toolbar and Buttons" style="padding:10px"><br/><span style="margin-left:10px;padding-top:20px;">数据源名称:<input type="text" id="submitsourcename" style="width:180px;border: 1px solid #0E9ED0;border-radius: 2px;"/></span>' + '<div id="validTip">请输入数据源名称</div></div>');
				}
				$("#dlg").modal("show");
				//$.parser.parse($("#dlg"));
				//$("#saveDlg").empty();
				if ($("#right_where_content .moreCon").attr("by") == "single") {

					if (querier_id != "") {
						_commonAjax({
							processData : false,
							data : {
								querier_id : querier_id
							},
							url : GROUPPATH + "/Query/getQueryTableName",
							dataType : 'text',
							success : function(result) {
								var json_obj = jQuery.parseJSON(result);
								for (var key in json_obj) {
									$("#submitsourcename").val(json_obj[key]);
								}
							}
						});
					} else {
						$("#submitsourcename").val("");
					}
					
								if ($("#submitsourcename").val() == '') {
									$("#validTip").css("color", "red");
								} else {
									var d = new Date();
									var vYear = d.getFullYear().toString();
									var vMon = (d.getMonth() + 1).toString();
									var vDay = d.getDate().toString();
									var h = d.getHours().toString();
									var m = d.getMinutes().toString();
									var se = d.getSeconds().toString();
									var datestr = vYear + vMon + vDay + h + m + se;
									var sql = "<querier><sql>";

									var xml_str1 = "";
									//xml
									var main_tablename = $(".left_formlist").find("li.current").attr("tname");
									var main_tableId = $(".left_formlist").find("li.current").attr("tid");
									//var main_name =;//数据保存名称

									xml_str1 += '<querier><sourcesname>' + $("#submitsourcename").val() + '</sourcesname>';
									xml_str1 += '<maintablename>' + main_tablename + '</maintablename><fields>';
									xml_str = "";
									//遍历开始 fields变量
									$(".right_where_column").find("li").each(function() {
										if ($(this).attr("add") != "add") {
											xml_str += "</conditions></field>";
											xml_str += '<field id=" field' + datestr + (Math.ceil(Math.random() * 10000)).toString() + ' ">';
											xml_str += '<tableId>' + main_tableId + '</tableId>';
											xml_str += '<name>' + $(this).find("span:first").text() + '</name>';
											xml_str += '<type>' + $(this).attr("ftype") + '</type>';
											xml_str += '<value>' + $(this).attr("fname") + '</value>';
											var $li = $("ul.right_data_header").find("li[fieldname=" + $(this).attr("fname") + "]");
											xml_str += '<sorted>' + $li.attr("sorted") + '</sorted>';
											xml_str += '<group>' + $li.attr("group") + '</group>';

											if ($li.attr("sum")) {
												xml_str += '<sorttype>sum</sorttype>';
												xml_str += '<sortvalue>' + $li.attr("sum") + '</sortvalue>';
											} else if ($li.attr("max")) {

												xml_str += '<sorttype>max</sorttype>';
												xml_str += '<sortvalue>' + $li.attr("max") + '</sortvalue>';
											} else if ($li.attr("min")) {
												xml_str += '<sorttype>min</sorttype>';
												xml_str += '<sortvalue>' + $li.attr("min") + '</sortvalue>';
											} else if ($li.attr("avg")) {
												xml_str += '<sorttype>avg</sorttype>';
												xml_str += '<sortvalue>' + $li.attr("avg") + '</sortvalue>';
											} else {
												xml_str += '<sorttype></sorttype>';
												xml_str += '<sortvalue></sortvalue>';
											}
											xml_str += '<display>' + $li.css("display") + '</display><conditions>';
											if ($(this).attr("fname").substr(0, 6) != "CCTime") {
												if ($(this).find("input.normal").val() != '') {
													$(this).find("select").val();
													xml_str += '<condition><cvalue>' + $(this).find("select").val() + '</cvalue>' + '<showvalue>' + $(this).find("input.normal").val() + '</showvalue>' + '<fieldvalue>' + $(this).find("input.normal").attr("field") + '</fieldvalue>' + '<datafrom>' + $(this).find("input.normal").attr("datafrom") + '</datafrom>' + '<immark>' + $(this).find("input.normal").attr("immark") + '</immark>' + '</condition>';
												}
											} else {
												if ($(this).find("input[type=hidden]").val() != '') {

													xml_str += '<condition><cvalue>' + $(this).find("select").val() + '</cvalue>' + '<showvalue>' + $(this).find("input[type=hidden]").val() + '</showvalue></condition>';
												}
											}
										} else if ($(this).attr("add") == "add") {
											if ($(this).attr("fname").substr(0, 6) != "CCTime") {
												if ($(this).find("input.normal").val() != '') {

													xml_str += '<condition><linkvalue>' + $(this).find("select:first").val() + '</linkvalue>' + '<cvalue>' + $(this).find("select:last").val() + '</cvalue>' + '<showvalue>' + $(this).find("input.normal").val() + '</showvalue>' + '<fieldvalue>' + $(this).find("input.normal").attr("field") + '</fieldvalue>' + '<datafrom>' + $(this).find("input.normal").attr("datafrom") + '</datafrom>' + '<immark>' + $(this).find("input.normal").attr("immark") + '</immark>' + '</condition>';
												}
											} else {
												if ($(this).find("input[type=hidden]").val() != '') {
													xml_str += '<condition><linkvalue>' + $(this).find("select:first").val() + '</linkvalue>' + '<cvalue>' + $(this).find("select:last").val() + '</cvalue>' + '<showvalue>' + $(this).find("input[type=hidden]").val() + '</showvalue></condition>';
												}
											}
										}

									});
									//遍历结束
									xml_str += '</conditions></field>';

									xml_str += "</fields><sql> " + $("#sqlresult").html() + "  " + $("#sqltable").html() + "  " + $("#sqlwhere").html() + "</sql></querier>";
									xml_str = xml_str1 + xml_str.substring(21);
									sql += " " + $("#sqlresult").html() + "  " + $("#sqltable").html() + "  " + $("#sqlwhere").html();
									sql += "</sql></querier>";
									var tables_name = $(".left_formlist").find("li.current").attr("tname");
									var querier_name = $("#submitsourcename").val();
									var formid = _getUrlParas('formid') ? _getUrlParas('formid') : '';
									if (querier_id != "") {
										_commonAjax({
											processData : false,
											data : {
												flow_id : flowid,
												xml_str : xml_str,
												querier_name : querier_name,
												tables_name : tables_name,
												querier_id : querier_id,
												form_id : formid
											},
											url : GROUPPATH + "/Query/editAQuerierData",
											dataType : 'text',
											async : true,
											success : function(result) {
												if (result) {
													window.parent.bid = result;
													window.parent.qname = querier_name;
													parent.$('#panelWin').remove();
												}
											}
										});
									} else {
										_commonAjax({
											processData : false,
											data : {
												flow_id : flowid,
												xml_str : xml_str,
												querier_name : querier_name,
												tables_name : tables_name,
												form_id : formid
											},
											async : true,
											url : GROUPPATH + "/Query/saveAQuerierData",
											dataType : 'text',
											success : function(result) {
												if (result) {
													//window.parent.bid = result;
													//window.parent.qname = querier_name;
													var data = _getUrlParas("data");
													parent.Global.dataObj.val(querier_name);
													dataValue = {"type" : "dataSource","value" : {"id" : result,"value" : querier_name}};
													if(data.split(",")[1] !="undefined"){
														window.parent.Global.fdCtrl.formCtrlJson.updateJson(data.split(",")[1], "data", data.split(",")[0], dataValue);
													}
													parent.$('#panelWin').remove();
												}
											}
										});
									}
									$('#dlg').dialog('close');
									window.close();
									return false;
								}
					
					
					$("#submitsourcename").focus();

					//加载dialog之后获取焦点
				} else {

					byFields.getSqlAndXml();
				}
			});
		}

		function showSql() {
			$(".right_sql_top").click(function(e) {
				EventUtil.stopPropagation(e);
				if ($("#right_sql").attr("isShowCond") == "true") {
					$(".right_sql_content").css({
						"display" : "block"
					});
					$("#right_sql").animate({
						width : "100%",
						height : "150px"
					}, 500);
					$(".right_sql_content").css({
						"overflow-y" : "scroll",
						"overflow-x" : "hidden",
						"max-height" : "150px",
						"background" : "#4D72D2"
					});
					$("#right_sql").attr("isShowCond", "false");
				} else {
					$("#right_sql").animate({
						width : "60px",
						height : "23px"
					}, 500);
					$("#right_sql").attr("isShowCond", "true");
					$(".right_sql_content").css("display", "none");
				}
			});
		}

		//增加系统变量中的控件
		function addSysFieldsControl($tname, $tid, $getTname) {
			
			if($getTname!=""){
				//系统变量start
				$("#menu-sysParam-list").find("div:not(:first)").remove();
				
				_commonAjax({
					processData : false,
					url : GROUPPATH + "/Query/getSysParams",
					dataType : "text",
					async : false,
					success : function(result) {
						var paras_obj = jQuery.parseJSON(result);
						$(paras_obj).each(function(index) {
						
						});
	
					}
				});
				//系统变量end
			}
			
			// 表单控件 start
			// if ($tname != $getTname) {
			// 	//初始化system变量控件列表
			// 	$("#forminfo-list").find("div:not(:first)").remove();
			// 	_commonAjax({
			// 		processData : false,
			// 		url : GROUPPATH + "/Query/getSysFields",
			// 		data : {
			// 			tid : $tid
			// 		},
			// 		dataType : "text",
			// 		async : false,
			// 		success : function(r) {
			// 			var json_obj = jQuery.parseJSON(r);
			// 			if (json_obj) {
			// 				$(json_obj).each(function(index) {
			// 					$("#mm").menu('appendItem', {
			// 						parent : document.getElementById('menu-forminfo'),
			// 						text : json_obj[index]["fieldTitle"],
			// 						id : json_obj[index]["fieldName"],
			// 						tid : json_obj[index]["tableID"]
			// 					});
			// 				});
			// 			}
			// 		}
			// 	});
			// } else {
			//清空sys变量控件列表
			$("#forminfo-list").find("div:not(:first)").remove();
			$("#tableinfo-list").find("div:not(:first)").remove();

			//解析xml start
			//var frm = formID;
			/*
			window.parent.Global.each()
			$getJson.children("control[type='CCTabs']").each(function() {
			//获取选项卡控件列表节点ID
			var elementId = $(this).children("property[name='CCTabElements']:first").attr("value");
			//alert(elementId);
			//遍历选项卡控件
			//根据选项卡控件列表，遍历对应的选项卡控件
			$getJson.children("#" + elementId).children().each(function() {
			var $controlValue = $(this).attr("value");
			var pdObj = $controlValue.substring(0, 7);
			//var values 		  = editTname+"."+$controlValue;
			//获取表单非表格控件
			if (pdObj != "CCTable" && pdObj != "CCUploa" && pdObj != "CCSearc" && pdObj != "CCButto" && pdObj != "CCLabel" && pdObj != "CCImage") {
			var $controlName = $getJson.children("control[name='" + $controlValue + "']:first").children("property[name=Title]:first").attr("value");
			//添加到sys列表中
			$("#mm").menu('appendItem', {
			parent : document.getElementById('menu-forminfo'),
			text : $controlName,
			id : $controlValue,
			tid : $tid
			});
			} else if (pdObj == "CCTable") {

			var $controlTableObj = $getJson.children("control[name='" + $controlValue + "']:first");
			//拿到table的ID

			var tableId = $controlTableObj.attr("id");

			var tableElements = $controlTableObj.children("property[name=CCTableElements]").attr("value");
			//拿到table的空间集的ID

			//table的控件遍历
			$getJson.children("#" + tableElements).children().each(function() {
			var eId = $(this).attr("value");
			var streId = eId.substring(0, 7);

			if (streId != "CCLabel" && streId != "CCButto" && streId != "CCSearc" && streId != "CCUploa" && streId != "CCTable" && streId != "CCImage") {
			var contTableVal = $getJson.children("control[name=" + eId + "]").children("property[name=Title]").attr("value");
			var tid = frm + "_tab" + tableId;

			$("#mm").menu('appendItem', {
			parent : document.getElementById('menu-tableinfo'),
			text : contTableVal,
			id : eId,
			tid : tid
			});
			};
			});

			}
			;

			});

			//解析xml end
			});*/
			//表单控件 end
		}

		//切换列表的时候变换sys相关的变量
		$("#left .left_formlist").on('click', 'li', function() {
			$("#left .left_formlist li").removeClass("current");
			$(this).addClass("current");
			var $this = $(this);
			var $tid = $(this).attr("tid");
			var $tname = $(this).attr("tname");
			var $formid = $(this).attr("fid");

			//formCommon._getFormXmlData($formid);
			addSysFieldsControl($tname, $tid, $getTname);

			$("#saveMark").empty();
			$("#saveMark").append('<input type="hidden" value="1" id="saveCuo"/>');
			_initTitle();
		});

		// 获取选中表单或是表格的数据字段信息

		showSql();
		$("#right .right_sql").find("i").click(function() {
			$("#right .right_sql_content").slideToggle();
		});

		//同步删除字段

		$("#right .right_where_top").click(function() {
			$("#right_where_content").slideToggle(function() {
				if ($(this).css("display") != "none" && $(this).find("li[fname]:visible").length == 0) {

					$(".moreCon").click();
				}
				//var height1 = $("#whereCondition").css("height");
				//var height2 = $("#right_where_content").css("height");
				//var height = window.document.body.offsetHeight;

			});

		});

	};

	return {
		_init : function() {
			that._init();
		}
	};
};

var query = new QueryClass();
$(function() {
	query._init();
});

var EventUtil = {
	/**
	 * 阻止事件冒泡
	 */
	stopPropagation : function(evt) {
		if (evt.stopPropagation) {
			evt.stopPropagation();
		} else {
			evt.cancelBubble = true;
		}

		if (evt.preventDefault) {
			evt.preventDefault();
		} else {
			evt.returnValue = false;
		}
	}
};
