$(function() {
	var helpTitleObj = {}, leftMenuHtml = [];
	var ajaxGetHelpData = {
		//========
		//获取左边一二级菜单数据
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
		//获取文档标题数据
		//========
		getHelpTitle : function(scid) {
			var helpTitle;
			$.ajax({
				type : "POST",
				url : APPPATH + "/Help/getHelpTitle",
				data : {
					cid : scid,
				},
				async : false,
				dataType : 'JSON',
				success : function(data1) {
					if (data1) {
						helpTitle = data1;
					} else {
						helpTitle = "获取数据失败，请稍后在试";
					}
				}
			});

			return helpTitle;

		},
		//========
		//处理
		//========
		getDetail : function(aid) {
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
			return detailHtml;

		},
	};

	var GetHelpHtmlData = {
		getHelpTitleHtml : function(getHelpTitle) {
			var helpTitleHtml = '';
			$.each(getHelpTitle, function(i, v) {
				helpTitleHtml += '<li class="titleList" titleid="' + v.id + '"><a href="#">' + v.title + '</a></li>';
			});
			return helpTitleHtml;
		},

		getTitleListByDataId : function(scid, title) {
			if ($.data(helpTitleObj, scid)) {
				getHelpTitle = $.data(helpTitleObj, scid);
			} else {
				$.data(helpTitleObj, scid, ajaxGetHelpData.getHelpTitle(scid));
				getHelpTitle = $.data(helpTitleObj, scid);
			}
			helpTitleHtml = GetHelpHtmlData.getHelpTitleHtml(getHelpTitle.list);
			$("#flieList").append(helpTitleHtml);
			$("#flieList").find("li").each(function(n) {
				var obj = $(this);
				if ((n + 1) % 2 != 0) {
					obj.css("float", "left");
				} else {
					obj.css("float", "right");
				}
			});
			$("#title_list").text(title).css({
				"font-size" : "18px",
				"line-height" : "36px"
			});

		},
		/*	getContentBytitleId : function($this) {
		 var aid = $this.attr("titleid");
		 var getDetailData = ajaxGetHelpData.getDetail(aid);
		 var $html = '<div class="detail_title"><p><strong>' + getDetailData.title + '</strong></p><p class="time">时间：' + getDetailData.update_time + '</p></div><div class="detail_cont">' + getDetailData.description + '</div>';

		 $(".title_content").hide();
		 $(".main_content").show();
		 $(".main_content").empty();
		 $(".main_content").append($html);

		 } */
	};
	//左边菜单
	var leftMenuData = ajaxGetHelpData.getLeftMenuData();
	$.each(leftMenuData, function(k, v) {
		leftMenuHtml.push('<div class="name_tit" name="');
		leftMenuHtml.push(v['name']);
		leftMenuHtml.push('" dataid="');
		leftMenuHtml.push(v['id']);
		leftMenuHtml.push('"><a href="#">');
		leftMenuHtml.push(v['title']);
		leftMenuHtml.push('</a></div><div class="son_name"><ul class="menu-two">');
		$.each(v["subMenu"], function(key, value) {
			leftMenuHtml.push('<li dataid="');
			leftMenuHtml.push(value['id']);
			leftMenuHtml.push('" title="');
			leftMenuHtml.push(value["title"]);
			leftMenuHtml.push('"><a href="#">');
			leftMenuHtml.push(value["title"]);
			leftMenuHtml.push('</a></li>');

		});
		leftMenuHtml.push('</ul></div>');
	});
	$("#content").find(".help_nav ").append(leftMenuHtml.join(""));

	//默认展示第一个帮文档列表
	var firstDataId = $("#content").find(".menu-two:first >li :first").attr('dataid');
	var firstTitle = $("#content").find(".menu-two:first >li :first").text();
	GetHelpHtmlData.getTitleListByDataId(firstDataId, firstTitle);
	$("#content").find(".menu-two:first >li :first").css("background", "#e8e8e8");

	// 左边菜单单击事件
	$("#content").find(".menu-two > li").on('click', function() {
		var scid = $(this).attr('dataid');
		var title = $(this).attr('title'), getHelpTitle;
		$(this).parents('.help_nav').find(".menu-two>li").removeAttr("style");
		$(this).css("background", "#e8e8e8");

		$("#flieList").empty();
		$(".main_content").hide();
		$(".title_content").show();

		GetHelpHtmlData.getTitleListByDataId(scid, title);

	});

	$("#content").undelegate(".titleList", "click").delegate(".titleList", "click", function() {
		var aid = $(this).attr("titleid");
		var getDetailData = ajaxGetHelpData.getDetail(aid);
		var $html = '<div class="detail_title"><p><strong>' + getDetailData.title + '</strong></p><p class="time">时间：' + new Date(parseInt(getDetailData.update_time) * 1000).toLocaleString().substr(0, 17) + '</p></div><div class="detail_cont">' + getDetailData.description + '</div>';

		$(".title_content").hide();
		$(".main_content").show();
		$(".main_content").empty();
		$(".main_content").append($html);

	});

	$(window).scroll(function() {//注册滑动条滑动时的动作
		var scrTop = $(window).scrollTop();
		var myWidth = ($(window).width() > $(".midfix").width()) ? (($(window).width() - $(".midfix").width()) / 10 - 80) : 0;
		var windowTop = $(window).height();
		if ((windowTop - 300) < scrTop) {
			$(".goTop").css("top", (scrTop + windowTop - 100)).css("right", myWidth).fadeIn("slow");
		} else {
			$(".goTop").css("top", (scrTop + windowTop - 100)).css("right", myWidth).fadeOut("slow");
		}
	});
	//按钮被点击后，滑动到顶部。
	$('#goToTop').click(function() {
		$('html,body').animate({
			scrollTop : '0px'
		}, 800);
	});

	/*
	 //分页
	 var curPage = 1;
	 var total,pageSize,totalPage;
	 function getData(page){
	 $.ajax({
	 type: 'POST',
	 url: APPPATH + "/ArticleModel/getArticleList",
	 data: {'pageNum':page-1},
	 dataType:'json',
	 success:function(data){
	 $("#pageSite").empty();
	 total = data.total;
	 pageSize = data.pageSize;
	 curPage = page;
	 totalPage = data.totalPage;
	 var li = "";
	 var list = data.list;
	 $.each(list,function(index,array){
	 li += "<li><a href='#'>"+"</a></li>";
	 }
	 $("#pageSite").append(li);
	 });
	 }
	 */
});

