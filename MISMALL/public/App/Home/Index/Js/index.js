$(function() {
	$("#btn_ezform").click(function() {
		$.ajax({
			type : "post",
			url : GROUPPATH + "/Passport/isLogin",
			data : null,
			async : false,
			success : function(result) {
                if(result) {
                	$.ajax({
                		type : "post",
                		url : APPPATH + "/Qywx/Editor/initFactory",
                		data : null,
						async : false,
                		success : function(result) {
							window.location = APPPATH + "/Qywx/Editor/index";
                		}
            		});
                } else {
                	$("#a_show_login").click();
                }
			}
		});
	});

	$("#btn_ezsite").click(function() {
		$.ajax({
			type : "post",
			url : GROUPPATH + "/Passport/isLogin",
			data : null,
			async : false,
			success : function(result) {
                if(result) {
                	window.location = APPPATH + "/Template/index/type/10.html";
                } else {
                	$("#a_show_login").click();
                }
			}
		});
	});
	
	$("#btn_ezq").click(function() {
		$.ajax({
			type : "post",
			url : GROUPPATH + "/Passport/isLogin",
			data : null,
			async : false,
			success : function(result) {
                if(result) {
                	window.location = APPPATH + "/Template/index/type/20.html";///Qywx/Editor/edit";
                } else {
                	$("#a_show_login").click();
                }
			}
		});
	});
	
	$("#btn_ezflow").click(function() {
		$.ajax({
			type : "post",
			url : GROUPPATH + "/Passport/isLogin",
			data : null,
			async : false,
			success : function(result) {
                if(result) {
                	window.location = APPPATH + "/Flow/Project/index";
                } else {
                	$("#a_show_login").click();
                }
			}
		});
	});

    /**
     * ezApp 进入开发
     */
    $("#btn_ezApp").click(function(){
    	$.ajax({
			type : "post",
			url : GROUPPATH + "/Passport/isLogin",
			data : null,
			async : false,
			success : function(result) {
                if(result) {
                	window.location = APPPATH + "/Template/index/type/40.html";///Qywx/Editor/edit";
                } else {
                	$("#a_show_login").click();
                }
			}
		});
    });

	
});