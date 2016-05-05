 /*!
 * 应用超市首页操作
 */
$(function() {
	//应用类型
	var type = "";
	//排序方式
	var order = "";
	//当前页
	var index = "";
	//应用名称
	var name = "";

	load(1);	// 首次加载

/*
	//下拉框加载数据
	$.ajax({
		type : "POST",
		url : GROUPPATH + "/AppStore/getAllReleaseProjectsType",
		success : function(data) {
			//防止页面重新加载时排序选项卡不更新选项
			var order = '<option value="1"  ccname="asc" id="pice" >按价格</option><option value="2"  ccname="asc" id="sell" >按销量</option><option value="3"  ccname="asc" id="comments">按评论数</option><option value="4"  ccname="asc" id="time">按发布时间</option> ';
			$("#order").append(order);
			var dataObj = JSON.parse(data);
			//转换为json对象
			$.each(dataObj, function(i, v) {
				$("#apptype").append("<option value='" + v.ID + "'>" + v.cateName + "</option>");
			});
			load(1);
		}
	});
*/
	//首次默认加载数据
	function load(index) {
		var index = index ? index : 0;
		$.ajax({
			type : "POST",
			url : GROUPPATH + "/AppStore/getReleaseProjectsNum",
			data : {
				//order_field : order,
				search_text : name,
				app_type : type,
				//	page_index : index
			},
			success : function(data) {
				var p = new Page('page');
				p.recordCount = data;
				//总记录数
				p.numericButtonCount = 5;
				//显示几个按钮
				p.pageSize = 15;
				//每页显示多少条记录
				p.addListener('pageChanged', function() {
					var pageIndex = (p.pageIndex - 1) * 15;
					$.ajax({
						type : "POST",
						url : GROUPPATH + "/AppStore/getReleaseProjectsInfo",
						data : {
							search_type : type,
							search_text : name,
							page_index : pageIndex
						},
						success : function(data) {
							var json_data = JSON.parse(data);
							$(".shop_applist").empty();
							$.each(json_data, function(i, v) {
								var innerHtml = '<li id="' + v.ID + '">';	// 给每个li添加点击事件。
								innerHtml += '<p class="shop_img"><a href="shop_detail.html?id=' + v.ID + '"><img src="' + UPLOAD_URL + v.imgPath + '" width="90" height="90" /></a></p>';
								innerHtml += '<p class="name"><a href="shop_detail.html?id=' + v.ID + '">' + v.projectName + '</a></p>';
								innerHtml += '<p class="pre">' + v.projectPrice + '元/天</p>';
								//innerHtml += '<p class="btn"><a href="shop_detail.html?id=' + v.ID + '">查看</a></p>';
								innerHtml += '</li>';
								$(".shop_applist").append(innerHtml);
							});
						}
					});
					p.render();
				});
				p.initialize();
			}
		});
	}

	$("#order").change(function() {
		order = $(this).val();
		name = '';
		load();
	});
	$("#apptype").change(function() {
		type = $(this).val();
		name = '';
		load();
	});
	$("#searchtext").keyup(function() {
		name = $(this).val();
	});

	//按钮提交事件
	$("#action").on("click", function() {
		name = $("#searchtext").val();
		load();
	});
	//回车查询事件
	$("#searchtext").on("keydown", function(event) {
		var e = event || window.event || arguments.callee.caller.arguments[0];
		if (e && e.keyCode == 13) {
			name = $("#searchtext").val();
			load();
		}
	});

	// 搜索提示
	/**********鼠标移动事件 start********/
	$("#searchtext").keydown(function(e) {
		var $input = $(this);
		var hlist = $("#historylist").find(".history");
		var index = $("#historylist").find(".on").index();

		hlist.removeClass("on");
		$(".history").css("background", "#FFF");
		//up
		if (e.keyCode == 38) {

			index = index == -1 || index == 0 ? hlist.size() - 1 : index - 1;
			var on = hlist.eq(index).addClass("on");
			on.css("background", "#74B9F0");
			$("#searchtext").val(hlist.eq(index).text());
			return false;

		} else if (e.keyCode == 40) {
			index = index == -1 || (index == hlist.size() - 1) ? 0 : index + 1;
			var on = hlist.eq(index).addClass("on");
			hlist.eq(index).css("background", "#74B9F0");
			$("#searchtext").val(hlist.eq(index).text());
			return false;
			//回车事件，下拉清空然后获取到焦点
		} else if (e.keyCode == 13) {
			if (index == -1) {
				$(".input_history").text("");
				return;
			}
			$(".input_history").text("");
			$(this).blur();
		}
	});
	/***************end****************/
	$("#searchtext").keyup(function(e) {
		name = $("#searchtext").val();
		type = $("#apptype").val();
		//返回鼠标事件
		if (e.keyCode == 38 || e.keyCode == 40)
			return;
		$.ajax({
			type : "POST",
			url : GROUPPATH + "/AppStore/getSearchTextAutoComplete",
			data : {
				search_text : name,
				app_type : type
			},
			success : function(data) {
				var json_data = JSON.parse(data);
				if (json_data == "") {
					$(".input_history").text("");
					//清空下拉层数据
					$("#searchtext").attr("cValue", "");
					return;
				}
				$(".input_history").text("");
				//清空下拉层数据
				if (navigator.userAgent.indexOf("MSIE") > 0) {
					$history = $('<div  class="historylist" id="historylist" style="margin-left:178px;"></div>');
				} else if (navigator.userAgent.indexOf("Chrome") > 0) {
					$history = $('<div  class="historylist" id="historylist" style="margin-left:172px;"></div>');
				} else {
					$history = $('<div  class="historylist" id="historylist" style="margin-left:184px;"></div>');
				}
				$(".input_history").append($history);
				//把数据添加到列表信息中
				$.each(json_data, function(i, v) {
					$history.append("<div style='color:#000;padding:0 15px; line-height:20px;'class='history' id='" + v.ID + "' >" + v.projectName + "</div>");
				});
				$("#searchtext").blur(function() {
					$("#historylist").hide();
					$(this).focus();
				});
				//增加滑动样式
				$(".history").hover(function() {
					$(this).css("background", "#74B9F0");
					$("#searchtext").val($(this).text());

				}, function() {
					$(this).css("background", "#fff");
				});
			}
		});
	});
	
});
