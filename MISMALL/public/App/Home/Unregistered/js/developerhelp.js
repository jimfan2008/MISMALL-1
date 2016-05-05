/**
 * @author fwb
 */
jQuery(function($) {
	'use strict';
	//Initiat WOW JS
	//new WOW().init();

	//helpcenter data JS
	var helpTitleObj = {}, leftMenuHtml = [];
	var ajaxGetHelpData = {
		//========
		//获取菜单数据
		//========
		getLeftMenuData : function() {
			var leftMenuData;
			$.ajax({
				type : "POST",
				url : APPPATH + "/Help/getCategary",
				async : false,
				dataType : 'JSON',
				success : function(data) {
					if (data) {
						leftMenuData = data;
					} else {
						leftMenuData = "获取数据失败，请稍后在试";
					}
				}
			});
			return leftMenuData;

		},

		//========
		//根据文章标题获取文章
		//========
		getIdbyArticle : function(aid) {
			var detailHtml = "";
			$.ajax({
				type : "POST",
				url : APPPATH + "/Help/getDetail",
				data : {
					aid : aid,
				},
				dataType : 'JSON',
				async : false,
				success : function(data2) {
					if (data2) {
						detailHtml = data2;
					} else {
						detailHtml = "获取数据失败，请稍后在试";
					}
				}
			});
			$(".article_title").append(detailHtml["title"]);
			$(".article_content").append(detailHtml["description"]);

		},
	};

	//获取左边菜单
	var leftMenuData = ajaxGetHelpData.getLeftMenuData();
	$.each(leftMenuData, function(k, v) {
		leftMenuHtml.push('<li class="nav-header no-radius"><b>');
		leftMenuHtml.push(v["title"]);
		leftMenuHtml.push('</b></li>');
		if (v["article"]) {
			$.each(v["article"], function(key, value) {
				leftMenuHtml.push('<li class=" no-radius">');
				leftMenuHtml.push('<a href="#" article_id="');
				leftMenuHtml.push(value["id"]);
				leftMenuHtml.push('">');
				leftMenuHtml.push(value["title"]);
				leftMenuHtml.push('</a></li>');
			});
		}
	});
	$("#helpMenu").append(leftMenuHtml.join(""));

	//默认获取第一篇文章
	var firstDataId = $("#helpMenu").find("a:first").attr('article_id');
	ajaxGetHelpData.getIdbyArticle(firstDataId);

	// 左边菜单单击事件
	$("#helpMenu").find('a').on("click", function() {
		$(".article_title").empty();
		$(".article_content").empty();
		firstDataId = $(this).attr("article_id");
		ajaxGetHelpData.getIdbyArticle(firstDataId);
	});
});
