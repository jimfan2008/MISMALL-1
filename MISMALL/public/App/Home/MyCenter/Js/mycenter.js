 var order_status;
 var page_index;
    
$(function() {
   
  //加载订单信息
    //loadAllOrder(0);
	getUserInfo();

    //点击订单状态显示订单信息;
    $(".nav").click(function() {
        $(".nav").removeClass("current");
        $(this).addClass("current");
        $(".nav a").css({
            color : "#fff"
        });
        $(this).find("a").css({
            color : "#000000"
        });
        order_status = $(this).index();
        loadAllOrder(order_status);
    });

    //返回项目logo图片
    function loadimg() {
        $(".rodertab").find(".tr_info").each(function() {
            var imgId = $(this).children().find("img").attr("id");
            //加载应用logo图片
            $path =  + "/Appsup/showImg?id=" + imgId;
            $(this).children().find("img").attr("src", $path);
        });
    }

    //个人信息里  个人中心和修改密码 点击效果
    $(".userpwd a").click(function() {
        $(".userpwd").removeClass("ab");
        $(this).parent().addClass("ab");
        var $_this = $(this);
        $(".userpwd a").css({
            "background" : "#0E9ED0",
            "color" : "#fff"
        });
        $_this.css({
            "background" : "#fff",
            "color" : "#000"
        });
    });

    //我的订单  我发布的项目  个人信息  点击和悬浮事件
    $(".type a").mouseenter(function() {
        $(this).css("background", "#705ef0");
    }).mouseleave(function() {
        if ($(this).attr("selMark") != "true") {
            $(this).css({
                "background" : "#fff",
                "color" : "#000"
            });
        }
    }).click(function() {
    	if($(this).attr('selmark') == 'true') {
    		return;
    	}
    	$('#user_main >div.czcenter').slideUp();
    	var curr_id = $(this).parent().attr("id");
    	switch( curr_id ) {
	    	case "myproject" : //我发布的项目
	    		{
	    			$("#projectInfo").slideDown();
	    			if( $('#projectlist').html().length == 0 ) {
	    				getProjectList();
	    			}
	    			break;
	    		}
			case "myapps" : // 我部署的应用
				{
					$("#appdetails").slideDown();
	    			if( $('#applist').html().length == 0 ) {
	    				getAllAppsList();
	    			}
	    			break;
				}
	    	case "myinfo" : //个人信息
	    		{
	    			$("#myMessage").slideDown();
	    			getUserInfo();
	    			break;
	    		}
	    	case "mytemplate" : //分享的模板
	    		{
	    			$("#templateInfo").slideDown();
	    			if($('#templateList').html().length == 0) {
	    				getShareTemplateList();
	    			}
	    			break;
	    		}
	    	case "mycompany" : //公司信息
	    		{
	    			$("#companyInfo").slideDown();
	    			break;
	    		}
	    	case "mysite" : //站点列表
    		{
    			$("#siteInfo").slideDown();
    			getSiteList();
    			break;
    		}
	    	case 'myorders' : //我的订单
				{
					$("#orderInfo").slideDown();
					loadAllOrder(0);
					break;
				}
	    	default :
	    		{
	    			$("#myMessage").slideDown();
	    		}
    	}
        

        var $_this = $(this);
        $(".type a").css({
            "background" : "#fff",
            "color" : "#000"
        });
        $(".type a").attr("selMark", "false");
        $_this.attr("selMark", "true").css({
            "background" : "#705ef0",
            "color" : "#fff"
        });
    });

    //点击修改注册邮箱
    $("#btnrevise").click(function() {
        $("#giveup").show();
        $("#confrim").show();
        $("#emailBtn").show();
        $("#emailtext").css({
            "border-style" : "",
            "border" : "solid 1px #cc66cc"
        });
        $("#emailtext").removeAttr("disabled");
        myfocus("emailtext");
        $("#btnrevise").css("display", "none");
        $("#btnsave").css("display", "block");
    });
    
    var uid = $("#username").attr("userId");

    //上传头像
    $("#userimg").click(function() {
       art.dialog.open(GROUPPATH + "/MyCenter/uploadAvatar", {
            title : "上传头像",
            //width : 475,
            //height : 442,
            opacity : 0.3,
            lock : true,
            drag : false,
            close : function() {
            }
        });
    });

    //个人中心                  点击事件
    $("#myMessageli").click(function() {
        $("#myMessagediv").show();
        $("#updatepawddiv").hide();
    });
    //修改密码                  点击事件
    $("#updatepwdli").click(function() {
        $("#myMessagediv").css("display", "none");
        $("#updatepawddiv").css("display", "block");
        $("#bfpassword").focus();
    });

    //修改密码
    $("#newpassword2").blur(function() {
        var newpwd = $("#newpassword").val();
        var newpwd2 = $("#newpassword2").val();
        if (newpwd != newpwd2 && newpwd != "") {
            var pwderrorno = "两次输入的密码不一致";
            $("#newtips2").text(pwderrorno);
            $("#newtips2").css("display", "block");
            $("#betips").css("display", "none");
            $("#newtips").css("display", "none");
        } else {
            $("#newtips2").css("display", "none");
        }
    }).keyup(function(){
        $("#newtips2").hide();
    });

    //保存修改点击事件
    $("#savepassword").click(function() {
        var bfpwd = $("#bfpassword").val();
        var newpwd = $("#newpassword").val();
        var newpwd2 = $("#newpassword2").val();
        
        $("#betips").hide();
        $("#newtips").hide();
        $("#newtips2").hide();
        var pwdlengerror = "密码不能为空";
       if(bfpwd == ""){
           $("#betips").text(pwdlengerror).show();
           return;
       }else if(newpwd == ""){
            $("#newtips").text(pwdlengerror).show();
            return;
       }else if(newpwd2 == ""){
           $("#newtips2").text(pwdlengerror).show();
            return;
       }else if(newpwd == bfpwd){
           pwdlengerror = "新密码不能和旧密码相同！";
           $("#newtips").text(pwdlengerror).show();
           return;
       }
       
        var chkPwd = /^[0-9a-zA-Z]*$/g.test(newpwd);
        if (!chkPwd || newpwd.length < 5 || newpwd.length > 15) {
            pwdlengerror = "密码只能是5~15个字符长度的数字和字母";
            $("#newtips").text(pwdlengerror);
            $("#newtips").show();
            return;
        } else if (newpwd != newpwd2 && newpwd != "") {
            var pwderrorno = "两次输入密码不一致！";
            $("#newtips2").text(pwderrorno);
            $("#newtips2").show();
            return;
        }
        $.ajax({
            type : "POST",
            url : GROUPPATH + "/MyCenter/updUserPwd",
            data : {
                oldpwd : bfpwd,
                newpwd : newpwd
            },
            success : function(data) {
                if (data == "0") {
                    var pwderror = "旧密码输入错误";
                    $("#betips").text(pwderror);
                    $("#betips").show();
                }else{
                     var secs = 3;//倒计时秒数;
                     for(var i=secs;i>=0;i--){
                        window.setTimeout('doUpdate(' + i + ')', (secs-i) * 1000);  
                     }              
                }
            }
        });
    });
});

//读取个人信息
function getUserInfo() {
	$.ajax({
	    type : "post",
	    url : GROUPPATH + "/MyCenter/getUserDetailInfo",
	    data : null,
	    success : function(data) {
	        var json_data = JSON.parse(data);
	        $("#username").find("strong").text(json_data.userName);
	        $("#username").attr("userId", json_data.ID);
	        $("#emailtext").val(json_data.userEmail);
	        $("#emailtext").attr("oldemail",json_data.userEmail);
	        if(json_data.userPhoto)
	        	$('#upload_user_photo').attr('src', json_data.userPhoto);
	    }
	});
}

//读取已发布的项目
function getProjectList() {
	$.ajax({
	    type : "POST",
	    url : GROUPPATH + "/MyCenter/getUserProjectsReleaseNum",
	    data : null,
	    success : function(data) {
	        if (data == 0) {
	            $("#projectlist").text("");
	            $("#projectlist").append(' <div class="point">您还没有发布任何应用哦,<a href="../Qywx/Editor/index" >点击这里</a>创作您所需应用吧！</div>');
	        } else {
	            $(".d-page").css("display", "block");
	            var p = new Page('pageProject');
	            p.numericButtonCount = 5;
	            p.pageSize = 9;
	            p.recordCount = data;
	            p.addListener('pageChanged', function() {
	                var pageIndex = (p.pageIndex - 1) * 9;
	                $.ajax({
	                    type : "POST",
	                    url : GROUPPATH + "/MyCenter/getUserProjectsReleaseInfo",
	                    data : {
	                        page_index : pageIndex
	                    },
	                    success : function(data) {
	                        var json_data = JSON.parse(data);
	                        $("#projectlist").text("");
	                        $.each(json_data, function(i, v) {
	                            var html = "<li><p><a><img width='72' height='72' class='ddpic' id='pimg" + v.ID + "' src=''/></a></p>";
	                            html += "<p class='name'><a class='xmname'>" + v.projectName + "</a></p><p></p>";
	                            html += "<div class='botn xiugai fl'><a projectid=" + v.ID + ">修改</a></div>";
	                            html += "<div class='botn delPub fl'><a projectid=" + v.ID + ">删 除</a></div><p></p></li>";
	                            $("#projectlist").append(html);
	
								// 显示项目LOGO
								$.ajax({
									type : "post",
									url : GROUPPATH + "/AppStore/getAReleaseImageDetailInfo",
									data : {id : v.projectImage},
									success : function(data1) {
										var json_data1 = JSON.parse(data1);
										if (typeof(json_data1) != "undefined")
											var img_src = PUBLICPATH + json_data1.imgPath + json_data1.imgName + '.' + json_data1.imgType;
										else
											var img_src = UPLOAD_URL + 'Images/ReleaseProject/nopic.png';
										$("#pimg" + v.ID).attr("src", img_src);
									}
								});
	                        });
	
	                        //加载所有已经发布好的应用logo图片
	                        //$(".mydingdan").find("#projectlist li").each(function() {
	                        // var imgId = $(this).find("img").attr("id");
	                        //$path = GROUPPATH + "/Appsup/showImg?id=" + imgId;
	                        //$(this).children().find("img").attr("src", $path);
	                        // });
	
	                        //修改已发布的项目
	                        $(".xiugai a").click(function() {
	                            var data = $(this).parent().parent().find(".name").text();
	                            var id = $(this).attr("projectid");
	                            art.dialog.open(APPPATH + "/Qywx/ReleaseProject/index?id=" + id, {
	                                title : "项目修改",
	                                width : "96%",
	                                height : "94%",
	                                opacity : 0.3,
	                                lock : true,
	                                drag : true,
	                                close : function() {
	                                }
	                            });
	                        });
	
	                        //删除已发布的项目
	                        $(".delPub a").click(function() {
	                            var id = $(this).attr("projectid");
	                            //var pubNum = $(this).
	                            var li = $(this).parent().parent();
	
	                            if (confirm("是否确认要删除该项目！")) {
	                                $.ajax({
	                                    type : "POST",
	                                    url : GROUPPATH + "/MyCenter/delAReleaseProject",
	                                    data : {
	                                        id : id
	                                    },
	                                    success : function(data) {
	                                        if (data) {
	                                            li.remove();
	                                        }
	                                    }
	                                });
	                            }
	                        });
	                    }
	                });
	                p.render();
	            });
	            p.initialize();
	        }
	    }
	});
}

// 读取部署的应用信息
function getAllAppsList() {
	$.ajax({
		type : "post",
		url : GROUPPATH + "/MyCenter/getUserAllAppNum",
		data : null,
		success : function(data) {
			if (data == 0) {
				$("#applist").text("");
				$("#applist").append("<div class='point'>还没有部署任何应用！<a href='../AppStore/index'>点击这里</a>购买您需要的应用吧！</div>");
				return;
			} else {
				$.ajax({
					type : "post",
					url : GROUPPATH + "/MyCenter/getUserAllAppList",
					data : null,
					success : function(data1) {
						var json_data1 = JSON.parse(data1);
						 $.each(json_data1, function(i, v) {
							var html = '<li class="color2 applist" appid=' + v.appID + '><a href="#"><p class="pic_icon"><img src="' +PUBLICPATH + '/App/Home/MyCenter/Images/icon_list_1.png"></p><p class="name">' + v.appName + '</p></a></li>';
							$("#applist").append(html);
						});
					}
				});
			}
		}
	});
}

//加载订单信息   传入订单状态 0 -所有 1-待付款 2-已付款 3-即将到期
function loadAllOrder(order_status) {
    $.ajax({
        type : "POST",
        url : GROUPPATH + "/MyCenter/getUserAllOrderNum",
        data : {
            order_status : order_status
        },
        success : function(data) {
            if (data == 0) {
                $(".rodertab").hide();
                $(".d-page").hide();
                $(".ts").text("");
                $(".ts").append("<div class='point'>还没有相关订单信息！<a href='../AppStore/index'>点击这里</a>购买您需要的应用吧！</div>");
                return;
            } else {
                var p = new Page('page');
                //总记录数
                p.recordCount = "";
                //分页按扭数
                p.numericButtonCount = 5;
                //每页记录数
                p.pageSize = 5;
                //当点击分页时触发此事件。 一些外加的效果可以放在此处， 如加载数据
                p.addListener('pageChanged', function() {
                    //alert('第' + p.pageIndex + '页');
                    //总记录数
                    p.recordCount = data;
                    //全局变量记录当前页
                   // page_index = p.pageIndex;
                   // var pageIndex = (page_index - 1) * 5;
                    $.ajax({
                        type : "POST",
                        url : GROUPPATH + "/MyCenter/getUserAllOrderInfo",
                        data : {
                            page_index : p.pageIndex, //传开始的页数
                            order_status : order_status
                        },
                        success : function(data) {
                            $(".point").remove();
                            $(".rodertab").show();
                            $(".d-page").show();
                            //$(".tr_info").text("");
                            var json_data = JSON.parse(data);
                            $(".rodertab").find("tr.tr_info").remove();
                            $.each(json_data, function(i, v) {
                                var orderStatus = "未付款";
                                var pay = "支付";
                                var $view_url = '';
                                if (v.orderStatus == 1) {
                                    orderStatus = "已付款";
                                    pay = "续费";
                                }
                                if(v.orderType == 2) {
                                	v['dayNum'] = v['userNum'] = '&mdash;&mdash;';
                                	$view_url = GROUPPATH + "/Template/proView/id/" + v.proID;
                                } else {
                                	$view_url = GROUPPATH + "/AppStore/goodsminute?id=" + v.proID;
                                }
                                
                                var html = "<tr class='tr_info' id = '" + v.ID + "'><td cid=" + v.orderNo + " class='td_info'>" + v.orderNo + "</td>";
                                html += "<td><div style='cursor:pointer' class='div_proimg'>";
                                html += "<a href='" + $view_url + "'><img width='72' height='72' id='oimg" + v.proID + "' src='"+UPLOAD_URL + '/' + v.projectImage+"' /></div>";
                                html += '<div class="proname">' + v.projectName + '</a></div></td>';
                                html += '<td class="td_info font">￥' + v.appPrice + '</td>';
                                
                                html += '<td class="td_info">' + v.dayNum + '</td>';
                                html += '<td class="td_info">' + v.userNum + '</td>';
                                html += '<td class="td_info font">￥' + v.tradeMoney + '</td>';
                                html += '<td class="td_info">&mdash;&mdash;</td>';
                                html += '<td class="td_info">' + orderStatus + '</td>';
                                html += "<td class='td_info'><div class='botn fukuang'>";
                                html += "<a href='../AppStore/confirmbuy?id=" + v.ID + "'>" + pay + "</a></div>";
                                html += '<div class="botn sanqu"><a>删除</a></div></td></tr>';
                                $(".rodertab").append(html);

                            });
                            //loadimg();
                            bindEvent();
                        }
                    });
                    p.render();
                });
                p.initialize();
            }
        }
    });
}

function bindEvent() {
    //删除订单
    $(".sanqu").click(function() {
        var id = $(this).parent().parent().attr("id");
        //  点击后闪烁三下载消失;
        /*   var i=0;
         var timer = null;
         clearInterval(timer);
         timer = setInterval(function () {
         i++ % 2 ? tr.hide() : tr.show();
         i > 6 && (clearInterval(timer))
         }, 200)*/
        if (confirm("是否确认要删除信息！")) {
            $.ajax({
                type : "POST",
                url : GROUPPATH + "/MyCenter/delAUserOrderInfo",
                data : {
                    order_id : id
                },
                success : function(data) {
                    loadAllOrder();
                }
            });
        }
    });
}

//获取模板列表
function getShareTemplateList(){
	$.ajax({
		type : "POST",
		url : GROUPPATH + "/MyCenter/getShareTemplateCount",
		data : null,
		dataType : 'JSON',
	    success : function(data) {
	        if (data == 0) {
	            $("#templateList").text("");
	            $("#templateList").append(' <div class="point">您还没有分享模板哦,<span style="color:red">我的站点</span>分享！</div>');
	        } else {
	            $(".d-page").css("display", "block");
	            var p = new Page('pageTemplate');
	            p.numericButtonCount = 5;
	            p.pageSize = 6;
	            p.recordCount = data;
	            p.addListener('pageChanged', function() {
	                $.ajax({
	                    type : "POST",
	                    url : GROUPPATH + "/MyCenter/getShareTemplateList",
	                    data : {
	                        page_index : p.pageIndex
	                    },
	                    dataType : 'JSON',
	                    success : function(data) {
	                        $("#templateList").html("");
	                        $.each(data, function(i, v) {
	                        	var tpl_status = (v.status==1) ? '开启' : '审核中';
	                            var html = "<li id='tpl" + v.id + "'><p><a><img src='"+v.thumbPath+"'/></a></p>";
	                            html += "<p class='name'>名称：<span>" + v.templateName + "</span></p><p></p>";
	                            html += "<p class='price'>价格：<span style='color:#f00'>" + v.priceFormat + "</span></p><p></p>";
	                            html += "<p class='count'>使用站点：<span style='color:#f00'>" + v.siteCount + "</span> 个站点</p><p></p>";
	                            html += "<p class='status'>模板状态：<span style='color:#f00'>" + tpl_status + "</span></p><p></p>";
	                            html += "<div class='botn xiugai fl'><a onclick='javascript:editTemplate(" + v.id + ")'>修改</a></div>";
	                            html += "<div class='botn delPub fl'><a name='"+v.id+"' onclick='javascript:deleteTemplate(" + v.id + ")'>删 除</a></div><p></p></li>";
	                            $("#templateList").append(html);
	
	                        });
	                    }
	                });
	                p.render();
	            });
	            p.initialize();
	        }
	    }
	})
}
//编辑模板
function editTemplate(tpl_id) {
	var li = $('#templateList > li[id=tpl'+tpl_id+']');
	var tpl_html = '';
	$.ajax({
		type : 'POST',
		url	 : GROUPPATH + "/MyCenter/getShareTemplateInfo",
		data : {id : tpl_id},
		dataType : 'JSON',
		async : false,
		success : function( data ){
			console.log(data);
			return;
			if(data == 0) return false;
			
			tpl_html = '<style>input{border: 1px solid #CCCCCC;height: 24px;}</style>';
			tpl_html += '<div style="width: 600px; padding: 0 15px 15px;line-height:40px;">';
			tpl_html += '<p>模板名称：<input id="templateTitle" value="'+data.info.templateName+'" /> <font color="red">*</font></p>';
			tpl_html += '<p>模板类型：<select id="templateTypeId" name="templateTypeId">';
			for(var i in data['cate']){
				tpl_html += '<optgroup label="'+data['cate'][i]['nameCN']+'"></optgroup>';
				if(typeof(data['cate'][i]['child']) == 'object'){
					for(var j in data['cate'][i]['child']){
						var select_cat = data['cate'][i]['child'][j]['id'] == data.info.templateTypeId ? 'selected' : '';
					tpl_html += '<option value="'+data['cate'][i]['child'][j]['id']+'" '+select_cat+'>&nbsp;&nbsp;&nbsp;&nbsp;|--'+data['cate'][i]['child'][j]['nameCN']+'</option>';
					}
				}
			}
			tpl_html += '</select>';
			tpl_html += '</p>';
			tpl_html += '<p>模板颜色：';
			tpl_html += '<select id="templateColor">';
			for(var m in data['color']){
				var select_color = data['color'][m]['id'] == data.info.colorId ? 'selected' : '';
				tpl_html += '	<option value="'+data['color'][m]['id']+'" '+select_color+'>'+data['color'][m]['name']+'</option>';
			}
			tpl_html += '</select>　<span class="check-tips">(模板主色调)</span>';
			tpl_html += '</p>';
			tpl_html += '<p>模板价格：'
			tpl_html += '<input id="templatePrice" value="'+data.info.price+'" />　<span class="check-tips">(0.00默认为免费分享)</span>';
			tpl_html += '</p>';
			//var tpl_status = data.info.status ? 'checked' : '';
			//tpl_html += '<p>模板状态：';
			//tpl_html += '<input type="checkbox" id="templateStatus" value="1" '+tpl_status+' /> 开启';
			//tpl_html += '</p>';
			tpl_html += '</div>';
		}
	})

	var dialog = art.dialog({
	    title: '分享模板',
	    content: tpl_html,
	    width: '400px',
	    ok:function () {
			var title = $('#templateTitle').val();
			var cate = $('#templateTypeId').val();
			var color = $('#templateColor').val();
			var price = $('#templatePrice').val();
			var status = $('#templateStatus').attr('checked') ? 1 : 0;
	
			if(title==''){
				alert('还没有输入模板名称，不能提交');
				return false;
			}
	
			if(price && price !='0.00'){
				var reg = /^(([1-9]\d*)|\d)(\.\d{1,2})?$/;
				if( ! reg.test(price.toString())　){
					alert('价格格式不正确，不能提交!');
					return false;
				}
			}
	    	$.ajax({
		    	url:GROUPPATH + "/MyCenter/editShareTemplate",
		    	data:{id:tpl_id,catid:cate,color:color,price:price,title:title},
		    	type:'POST',
		    	dataType:'JSON',
		    	success:function(data){
			    	if(data.error == 0){
			    		li.find('.name').children('span').html(title);
					}
			    }
		    });
		    dialog.close();
	        return false;
	    },
	    cancel:{}
	});
	
}

/**
 * 删除分享模板
 */
function deleteTemplate(tpl_id) {
	var li = $('#templateList > li[id=tpl'+tpl_id+']');
    if (confirm("是否确认要删除该分享模板！")) {
        $.ajax({
            type : "POST",
            url : GROUPPATH + "/MyCenter/deleteShareTemplate",
            data : {
                id : tpl_id
            },
            success : function(data) {
                if (data) {
                    li.remove();
                }
            }
        });
    }
}

/**
 * 获取用户网站列表
 */
function getSiteList(){
	$.ajax({
		type : "POST",
		url : GROUPPATH + "/MyCenter/getUserSiteList",
		data : null,
		dataType : 'JSON',
	    success : function(data) {
	        if (data.total == 0) {
	            $("#siteList").text("");
	            $("#siteList").append(' <div class="point">您还没有建立站点，<a href="'+GROUPPATH+'/Template/index.html">点击这里</a>创建站点！</div>');
	        } else {
	            $(".d-page").css("display", "block");
	            var p = new Page('pageSite');
	            p.numericButtonCount = 5;
	            p.pageSize = 6;
	            p.recordCount = data.total;
	            p.addListener('pageChanged', function() {
	            	var pageStart = (p.pageIndex-1) * p.pageSize;
	            	var pageEnd = pageStart + p.pageSize;
	            	pageEnd = pageEnd > data.total ? data.total : pageEnd;
	            	$("#siteList").html("");
	                for(var i = pageStart; i < pageEnd; i++){
	                	var html = '<div class="siteList">';
	                		html += '<div class="l_siteImg"><img src="'+data['list'][i]['thumbPath']+'"></div>';
	                		html += '<div id="siteInfo_'+data['list'][i]['id']+'" class="r_siteInfo">';
	                		html += '<div class="box">';
	                		html += '<div length="20" class="site_path">'+data['list'][i]['siteName']+'</div>';
	                		html += '<div title="编辑站点名称" onclick="editSite(';
	                		html += "'site_path', 'sitePath', "+data['list'][i]['id'];
	                		html += ')" class="fl edit_img"></div>';
	                		html += '</div>';
	                		html += '<div class="box">';
	                		html += '<div><span>访问域名：</span><span length="50" class="site_domain"><a href="'+data['list'][i]['system_domain']+'" target="_blank" style="color:red">'+data['list'][i]['system_domain']+'</a></span></div>';
	                		html += '</div>';
	                		html += '<div class="box">';
	                		html += '<div class="fl">到期时间：永久</div>';
	                		html += '<div class="fl delete_site edit">删除</div>';
	                		html += '</div>';
	                		html += '<div class="box">';
	                		html += '<ul value="'+data['list'][i]['id']+'">';
	                		html += '<li class="editSite"><a target="_blank" href="/Qywx/Editor/edit/siteId/'+data['list'][i]['id']+'.html">编辑网站</a></li>';
	                		html += '<!--<li class="updateSite">升级站点</li>';
	                		html += '<li class="editDomain" onclick="editSite(';
	                		html += "'site_domain', 'domain', "+data['list'][i]['id'];
	                		html += ')">绑定域名</li>';
	                		html += '--><li onclick="shareTemplate('+data['list'][i]['id']+')">分享网站模板</li>';
	                		html += '</ul>';
	                		html += '</div>';
	                		html += '</div>';
	                		html += '<div style="display: none;" class="del_dr">';
	                		html += '<div class="confirm_canle">';
	                		html += '<p class="confirm_del">确定</p>';
	                		html += '<p class="cancel_del">取消</p>';
	                		html += '</div>';
	                		html += '</div>';
	                		html += '</div>';
                        $("#siteList").append(html);
	                    }
	                p.render();
	            });
	            p.initialize();
	        }
	      //删除站点--弹出层
	         $(".delete_site").click(function(){
	             
	            $(".del_dr").hide();
	            $(this).parents(".siteList").find(".del_dr").show();
	             
	         });
	         //取消删除
	         $(".cancel_del").click(function(){
	             
	             $(this).parents(".siteList").find(".del_dr").hide();
	         });
	         //确定删除
	         $(".confirm_del").click(function(){
				var thisSite =  $(this).parents(".siteList");
				var tempId = thisSite.find("ul").attr("value");
				if(tempId=="")return;
				thisSite.fadeOut(function(){
					$(this).remove();
					$.ajax({
		                 type:"POST",
		                 url : GROUPPATH + '/MyCenter/deleteUserSiteInfo',
		                 data:{siteId:tempId},
		                 success:function(data){
		                	 getSiteList();
		                 }
		             });
				});
	         });
	    }
	})
}

/**修改站点名称**/
function editSite(cls, field, site_id) {
	var obj = $('#siteInfo_'+site_id).find('.'+cls);
	var old_value = obj.html();
	var content_html = '<input id="editContent" value="'+old_value+'" style="margin-top:8px;line-height:25px;border:1px solid #333" maxLength="'+obj.attr('length')+'">';
	obj.html(content_html);
	$('#editContent').focus().select().keydown(function(event){
		var keyEvent=event || window.event;
        var key=keyEvent.keyCode;
		if(key == 13){
			$(this).blur();
		}
	}).blur(function(){
		var new_value = $(this).val().trim();
		//如果内容没变或者为空时不修改
		if(new_value == old_value || new_value.length == 0){
			obj.html(old_value);
			return false;
		}
		
		var reg= new RegExp(/^[a-zA-Z0-9]*$/gi);
		if(! reg.test(new_value)){
			alert('名称只能使用字母和数字');
			obj.html(old_value);
			return false;
		}
		
		$.ajax({
	    	url : GROUPPATH + '/MyCenter/editUserSite',
	    	data:{id:site_id,name:field,value:new_value},
	    	type:'GET',
	    	dataType:'JSON',
	    	success:function(data){
		    	if(data.error == 0){
		    		getSiteList();
				    obj.html(new_value);
				} else {
					alert(data.info);
					obj.html(old_value);
					return false;
				}
		    }
	    });
    });
};
//分享模板
function shareTemplate(site_id) {
	var dialog = {
	    title: '分享模板',
	};
	artDialog.open(GROUPPATH + '/Template/shareTemplate?siteId='+site_id, dialog);
}

/*end*/
function doUpdate(num){
    $('#updatepawddiv').html('<div id="pwdok"></div><div class="centerpwdok">修改成功，请点击<a href="../Public/login">重新登录</a><br/><br/><strong>'+num+'</strong>秒后自动跳转到登录页面</div>');
   if(num == 0) { 
       window.location= GROUPPATH+"/Public/login"; 
    }  
}

//放弃修改邮箱按钮点击事件
function giveupClick(){
   var oldemail = $("#emailtext").attr("oldemail");
    $("#emailtext").attr("disabled", "disabled").css({
        "border-style" : "",
        "border" : "solid 1px #fff"
    }).val(oldemail);
    $("#btnrevise").css({
        "display" : "block",
        "float" : "right"
    });
   $("#emailerror").css("display", "none");
    $("#giveup").hide();
    $("#confrim").hide();
}

// 修改邮箱失去焦点时
function confrimClick() {
    var uid = $("#username").attr("userId");
    var isemail = /^\w+([-\.]\w+)*@\w+([\.-]\w+)*\.\w{2,4}$/;
    var oldemail = $("#emailtext").attr("oldemail");
    var email = $("#emailtext").val();
    if(email == oldemail){
        $("#emailtext").attr("disabled", "disabled").css({
            "border-style" : "",
            "border" : "solid 1px #fff"
        });
        $("#btnrevise").css({
            "display" : "block",
            "float" : "right"
        });
        $("#giveup").hide();
        $("#confrim").hide();
         return;
    }else if (email == "") {
        var error = "请输入您的邮箱！";
        Emailerror(error);
        return;
    } else if (!isemail.test(email)) {
        var error = "请输入正确的邮箱格式！";
        Emailerror(error);
        return;
    } else {
        $.ajax({
            type : "POST",
            url : GROUPPATH + "/MyCenter/checkUserEmail",
            data : {
                email : email
            },
            success : function(data) {
                if (data == "false") {
                    var error = "该邮箱是已注册邮箱";
                    Emailerror(error);
                    return;
                } else {
                    $.ajax({
                        type : "POST",
                        url : GROUPPATH + "/MyCenter/updUserEmail",
                        data : {
                            email : email
                        },
                        success : function(data) {
                            $("#giveup").hide();
                            $("#confrim").hide();
                            $("#emailtext").val(data);
                            $("#emailerror").css("display", "none");
                            $("#emailtext").attr("disabled", "disabled").css({
                                "border-style" : "",
                                "border" : "solid 1px #fff"
                            });
                            $("#btnrevise").css({
                                "display" : "block",
                                "float" : "right"
                            });
                        }
                    });
                }
            }
        });
    }
}

function Emailerror(error) {
    $("#emailerror a").text(error);
    $("#emailerror").css("display", "block");
    $("#emailtext").focus();
}

//设置文本框中焦点位置在最后
function myfocus(myid) {
    if (isNav) {
        document.getElementById(myid).focus();
        // 获取焦点
    } else {
        setFocus.call(document.getElementById(myid));
    }
}

var isNav = (window.navigator.appName.toLowerCase().indexOf("netscape") >= 0);
var isIE = (window.navigator.appName.toLowerCase().indexOf("microsoft") >= 0);
function setFocus() {
    var range = this.createTextRange();
    //建立文本选区
    range.moveStart('character', this.value.length);
    //选区的起点移到最后去
    range.collapse(true);
    range.select();
}