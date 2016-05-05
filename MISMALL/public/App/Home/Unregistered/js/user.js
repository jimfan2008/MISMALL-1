/**
 * 前台登录 注册
 * 2014-05-16 kb
 */

$(function() {
	//回车请求标识
	var keyDown = true;
	//错误次数
	var errorNum = 0;
	//错误提示
	var loginModal = $("#loginmodal");
	var error_login = $("#loginform div.error");
	var userFlag = true;
	var passFlag = true;
	var imgCodeFlag = true;
	var inputUser = $("#lf_uname");
	var inputPass = $("#lf_upass");
	var inputPassName=$("#lf_r_upassname");

	var isActive = $("#isActive").val();

	if (isActive == 1) {
		alert("激活成功");
		$("#loginmodal").hide();
		$("#registerform").hide();
		$('#forget-password').hide();
		$("#active-email").hide();
		$("#resetPass").hide();

	} else if (isActive == 2) {
		$("#resetPass").show();
		$("#loginmodal").show();
		$("#registerform").hide();
		$("#active-email").hide();
		$("#loginform").hide();
		$("#forget-password").hide();

	}

	function ajax(opts) {
		$.ajax({
			url : opts.url,
			type : opts.type ? opts.type : "POST",
			dataType : opts.dataType ? opts.dataType : 'JSON',
			data : opts.data,
			async : opts.async ? opts.async : true,
			success : opts.success ? opts.success : function() {
			}
		});

	};
	function checkLogin(callback) {
		ajax({
			url : ROOTPATH + '/Passport/isLogin',
			dataType : 'text',
			success : function(r) {
				if (callback)
					callback(r);
				if (!r)
					return;
				isLogin(true);
			}
		});
	}

	function isLogin(isLogin) {
		if (isLogin) {
			$("#panel_login").hide();
			$("#panel_logined").show();
		} else {
			$("#panel_login").show();
			$("#panel_logined").hide().find("a:first").empty();
		}
	}

	/**
	 *验证输入的用户名是否存在 合法
	 */
	function checkUserName(flags) {
		var flag = flags == "true" ? true : false;
		var userName = $.trim(inputUser.val());
		if (flag) {
			userName = $.trim($("#lf_r_uname").val());
			error_login = $("#forget-password-send .error");
		} else if (flags == "lf_r_uname") {
			userName = $("#lf_r_uname").val();
			error_login = $("#registerform .error");
		}
		if (!userName) {
			errorNum++;
			keyDown = true;
			error_login.text("请输入账户邮箱");
			$("#submitStatic").text("登录");
			if ($("#active-email:visible").size() > 0) {
				$("#loginform .loginform li").not(":first").next().show();
				$("#registerform").hide();
				$("#active-email").hide();
				$("#forget-password").hide();
				$("#resetPass").hide();
			}
			return;
		} else if (!/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i.test(userName)) {
			errorNum++;
			userFlag = false;
			keyDown = true;
			error_login.text("邮箱格式错误");
			$("#submitStatic").text("登录");
			return;
		} else if (flags == "lf_r_uname") {
			var nameR = true;
			$.ajax({
				url : ROOTPATH + "/Passport/checkUserEmailAt",
				type : 'POST',
				cache : false,
				data : "val=" + userName,
				async : false,
				dataType : 'text',
				success : function(r) {
					nameR = (r == "true" ? true : false);
				}
			});
			if (!nameR) {
				error_login.text("邮箱已存在");
				return;
			} else {
				error_login.text("");
				userFlag = true;
			}
		} else {
			$.ajax({
				url : ROOTPATH + "/Passport/ajaxIsActived",
				data : {
					"email" : userName
				},
				type : "POST",
				dataType : "JSON",
				async : false,
				success : function(result) {
					if (result['status'] == 0) {
						$("#active-email").show();
						$("#loginform .loginform li").not(":first").next().hide();
						sendEmail(userName);
					} else {
						$("#loginform .loginform li").not(":first").next().show();
						if (result['status'] == 2) {
							errorNum++;
							userFlag = false;
							keyDown = true;
							$("#loginform ul li:last div").css("display", "none");
							error_login.text("帐号不存在");
							$("#submitStatic").text("登录");
							if (flag) {
								$("#lf_f_uname").focus();
								$("#forget-password-send button:first").attr("disabled", true);
							}
						} else {
							userFlag = true;
							error_login.text("");
							if (flag) {
								$("#forget-password-send button:first").attr("disabled", false);
							}
						}
					}
				}
			});
		}
	}

	/**
	 *验证密码格式
	 */
	function checkUserPass(fale) {
		//判断注册页面点击密码输入框
		if(fale=="lf_r_upass"){
			inputPass=$("#lf_r_upass");
			error_login=$("#registerform .error");
		}
		var userPass = inputPass.val();
		if (userPass=="" || (!(userPass.length >= 5 && userPass.length <= 20))) {
			error_login.text("密码格式不正确，５－20位任意非空字符");
			$("#submitStatic").text("登录");
			//inputPass.focus();
			keyDown = true;
			errorNum++;
			return;
		} else {
			error_login.text("");
			passFlag = true;
		}
	}
	/*
	 * 注册重复密码验证 
	 */
	   function registUserPass() {
	   	inputPass=$("#lf_r_upass");
		var userPass = inputPass.val();
		var userPassName = inputPassName.val();
		if (userPass!=userPassName) {
			$("#registerform .error").text("重复密码错误");
			//inputPass.focus();
			keyDown = true;
			errorNum++;
			return;
		} else {
			//error_login.text("");
			$("#registerform .error").text("");
			passFlag = true;
		}
	}
     
	/**
	 *验证 验证码正确性
	 */
	function checkImgCode() {
		var code = $("#lf_r_code").val();
		if (!(code && code.length == 4)) {
			errorNum++;
			error_login.text("请输入右图中的验证码");
			$("#submitStatic").text("登录");
			keyDown = true;
			imgCodeFlag = false;
			return;
		} else {
			//$("#loginformul li:last div").css("display", "block");
			//var codeR=true;
			ajax({
				url : ROOTPATH + "/Passport/checkVerifyCode",
				type : 'POST',
				cache : false,
				data : "val=" + code,
				async : false,
				dataType : 'text',
				success : function(r) {
					codeR = r == "true" ? true : false;
				}
			});
			if (!codeR) {
				errorNum++;
				$("#loginformul li:last div").css("display", "none");
				error_login.text("验证码不匹配");
				$("#submitStatic").text("登录");
				keyDown = true;
				return;
			} else {
				//error_login.text("");
				imgCodeFlag = true;
			}
		}
	}

	/**
	 * 发送邮件
	 */
	function sendEmail(userName) {
		var href_email = userName.substring((userName.indexOf("@") + 1), userName.indexOf("."));
		$("#active-email").find(".active-email-href a").attr("href", "http://mail." + href_email + ".com").text(userName);
		$("#active-email button:first").unbind("click").click(function() {
			window.open("http://mail." + href_email + ".com", "_self");
		});

		$("#active-email button:last").unbind("click").click(function() {
			ajax({
				url : ROOTPATH + "/Passport/ajaxSendActive",
				data : {
					"email" : userName
				},
				type : "POST",
				dataType : "JSON",
				success : function(result) {
					if (result['status'] == 1) {
						alert("邮件发送成功");
					}
				}
			});
		});
	}

	/**
	 * 忘记密码发送邮件
	 *
	 */
	function forgetPassSendEmail(userName) {
		if (!userName) {
			var userName = $.trim($("#lf_uname").val());
		}
		ajax({
			url : ROOTPATH + "/Passport/findPassword",
			data : {
				"email" : userName
			},
			type : "POST",
			dataType : "JSON",
			success : function(result) {
				if (result['status'] == 1) {
					var href_email = userName.substring((userName.indexOf("@") + 1), userName.indexOf("."));
					//$("#loginform").find(".loginform").hide();
					$("#login_box").hide();
					$(".login-containter").find(".forget-password-href").show();
					$(".login-containter").find(".forget-password-href a").attr("href", "http://mail." + href_email + ".com").text(userName);
					$(".login-containter .forget-password-href button:first").click(function() {
						window.open("http://mail." + href_email + ".com", "_self");
					});

				}
			}
		});

	}

	/**
	 * 登录方法
	 */
	function login() {
		var userName = inputUser.val();
		var userPass = inputPass.val();
		var isAutoLogin = $("#autologin").get(0).checked;
		//var redirect_url =decodeURIComponent("{$Think.session.redirect_url}");
		//$("#loginform ul li:last div").css("display", "block");
		ajax({
			url : ROOTPATH + '/Passport/ajaxLogin',
			async : false,
			data : {
				"email" : userName,
				"password" : userPass,
				"checked" : isAutoLogin
			},
			success : function(r) {
				$("#loginform ul li:last div").css("display", "none");
					//alert(redirect_url);
					redirect_url = decodeURIComponent(redirect_url);
				if (r['status'] == 1 || r['status'] == 2) {
					if(redirect_url.length){
						window.location.href=redirect_url;
					}else{
						if(r['lastStatus']==1){
							 window.location =APPPATH+ "/Developer/developerCenter.html";	
						}else{
		                    window.location =APPPATH+ "/Client/index.html";			
						}
					}
					
					isLogin(true);
					if ($("#loginmodal").data("url")) {
						errorNum = 0;
						location.href = $("#loginmodal").data("url");
					} else if ($("#loginmodal").attr("url")) {
						errorNum = 0;
						location.href = $("#loginmodal").attr("url");
					}
				} else {
					errorNum++;
					keyDown = true;
					$("#loginform ul li:last div").css("display", "none");
					error_login.text(r["message"]);
					$("#submitStatic").text("登录");
				}
				$("#lf_upass").val("");
				//清空密码框
			}
		});
	}


	

	/*
	 * 点击进入开发者
	 */
	$("body").undelegate("#btn_dev", "click").delegate("#btn_dev", "click", function() {
		window.location.href = APPPATH + "/Index/designer.html";
	});
	/**
	 *  退出登录 begin
	 * */
	function loginOut() {
		$("#loginform ul li:last div").css("display", "none");
		keyDown = true;
		errorNum = 0;
		ajax({
			url : ROOTPATH + '/Passport/logout',
			dataType : 'text',
			success : function(r) {
				location.href = ROOTPATH;
				isLogin();
				$("#lf_upass").val("");
				//清空密码框
			}
		});
	};

	/***
	 * 切换验证码
	 */
	function changeCode() {
		var codeURL = $("#lf_r_codeimg").attr("src");
		var index = codeURL.indexOf("?");
		if (index != -1) {
			codeURL = codeURL.substr(0, index);
		}
		$("#lf_r_codeimg").get(0).src = codeURL + "?r=" + Math.random();
		$("#lf_r_code").val("").focus();
	};

	/**
	 * 失去焦点时验证用户名
	 */
	inputUser.blur(function() {
		checkUserName();
	});

	/**
	 * 失去焦点时验证密码
	 */
	inputPass.blur(function() {
		checkUserPass();
	});
	/**
	 * 切换验证码
	 */
	$("#lf_r_code").blur(function() {
		checkImgCode();
	});

	$("#lf_r_uname").blur(function() {
		checkUserName("lf_r_uname");
	});

	$("#lf_r_upass").blur(function() {
		checkUserPass("lf_r_upass");
	});
	//重复密码验证
	$("#lf_r_upassname").blur(function(){
		registUserPass();
	});

	/**
	 * 点击去到创建项目
	 */
	$("#goFactory").click(function() {
		$.ajax({
			type : "post",
			url : APPPATH + "/Qywx/Editor/initFactory",
			data : null,
			async : false,
			success : function(result1) {
				window.location = ROOTPATH + "/Qywx/Editor/index";
			}
		});
	});

	/**
	 * 点击登录按钮
	 */

	$("#submitStatic").on("click", function() {
		$(this).text($(this).attr('data-ing'));
		if (keyDown) {
			keyDown = false;
			if (errorNum >= 3) {
				$("#codeIMG").css("display", "block");
				checkUserName();
				checkUserPass();
				checkImgCode();
				if (userFlag && passFlag && imgCodeFlag)
				login();
			} else {
				$("#codeIMG").css("display", "none");
				checkUserName();
				checkUserPass();
				if (userFlag && passFlag) {
					login();
				}
			}
		}

	});

	/*
	 * 点击注册按钮
	 */
	$("#registerform").submit(function() {
		var userName = $.trim($("#lf_r_uname").val()),shareNum = $("#shareNum").val();
		var userPass = $("#lf_r_upass").val();
		var repeatPassWord=inputPassName.val();
		checkUserName("lf_r_uname");
		checkUserPass("lf_r_upass");
		registUserPass();
		if (userFlag && passFlag) {
			//$("#registerform ul li:last div").css("display", "block");
			ajax({
				url : ROOTPATH + "/Passport/ajaxRegister",
				data : {
					email : userName,
					password : userPass,
					sharecode : shareNum,
					password_confirm:repeatPassWord,
				},
				success : function(r) {
					if (r["status"] == "0") {
						//$("#registerform ul li:last div").css("display", "none");
						$("#registerform .error").text(r["message"]);
						return;
					}
					$("#login_box").hide();
					$("#active-email").show();
					sendEmail(userName);
				}
			});
		}
	});
	/**
	 * 登录面板切换
	 */
	$("#a_show_login,#footer_btn2,#to_login,#a_show_register,#to_register,#forgetpass").click(function() {
		var idStr = this.id;
		loginModal.css("display", "block");
		$(".usrPanel").hide();
		switch(idStr) {
			case "a_show_login":
			case "footer_btn2":
				$("#loginform").show();
			case "to_login":
				$("#loginform").show();
				$("#loginform li").show();
				$("#lf_uname").focus();
				break;
			case "forgetpass" :
				$("#lf_f_uname").val($("#lf_uname").val());
				checkUserName();
				if (userFlag) {
					forgetPassSendEmail();
					$("#forget-password").show();
				} else {
					$("#forget-password").show();
					$("#lf_f_uname").focus();
				}
				break;
			case "a_show_register" :
			case "to_register" :
				$("#registerform").show();
				$("#lf_r_uname").focus();
				break;
		}
	});

	/**
	 * 关闭登录面板
	 */
	$("#loginmodal a.close,#forget-password #forget-password-send button:last").click(function() {
		var loginform = $("#loginform");
		var registerform = $("#registerform");
		loginform.find("div.error").empty();
		registerform.find("div.error").empty();
		loginform.get(0).reset();
		registerform.get(0).reset();
		loginModal.hide().removeData("url");
	});
	//点击退出登录
	$("#btn_loginout").click(function() {
		loginOut();
	});
	//点击切换验证码
	$("#a_changeCode").click(function() {
		changeCode();
	});

	//忘记密码 失去焦点时 验证用户邮箱
	$("#forget-password #lf_f_uname").blur(function() {
		checkUserName("true");
	});
	//忘记密码点击发送按钮发送邮件
	$(".loginform .backPassword").click(function() {
		if (userFlag) {
			forgetPassSendEmail();
		}
	});
	/* 个人中心(头部) begin */
	function callback(r) {
		var centerURL = ROOTPATH + "/MyCenter/member_center.html";
		//var centerURL = ROOTPATH + "/MyCenter/web_wx.html";
		if (r) {
			location.href = centerURL;
			return;
		}
		loginModal.data("url", centerURL);
		$("#a_show_login").click();
	}

	/* 个人中心(尾部) begin */
	function callback(r) {
		var centerURL = ROOTPATH + "/MyCenter/member_center.html";
		//var centerURL = ROOTPATH + "/MyCenter/web_wx.html";
		if (r) {
			location.href = centerURL;
			return;
		}
		loginModal.data("url", centerURL);
		$("#a_show_login").click();
	}


	$("#userCenter_bottom ,#userCenter,#userCenter2").click(function() {
		checkLogin(callback);
	});

	function saleCenter(r) {
		var centerURL = ROOTPATH + "/MyCenter/web_wx.html";
		if (r) {
			location.href = centerURL;
			return;
		}
		loginModal.data("url", centerURL);
		$("#a_show_login").click();
	}


	$("#saleCenter,#saleCenter2,#saleCenter_bottom").click(function() {
		checkLogin(saleCenter);
	});

	function toTemplete(r) {
		var centerURL = ROOTPATH + "/Template/index/type/20.html";
		if (r) {
			location.href = centerURL;
			return;
		}
		loginModal.data("url", centerURL);
		$("#a_show_login").click();
	}

	/*首页点立即进入图标 begin*/
	$("#toTemp,#intro").click(function() {
		checkLogin(toTemplete);
	});

	/*function toDiy(r) {
	 var centerURL = ROOTPATH + "/Index/toWhich";
	 if (r) {
	 location.href = centerURL;
	 return;
	 }
	 loginModal.data("url", centerURL);
	 $("#a_show_login").click();
	 }
	 $("#DIY,#DIY_bottom").click(function() {
	 checkLogin(toDiy);
	 });*/
	function toNeed(r) {
		var centerURL = ROOTPATH + "/Index/toYourNeed";
		if (r) {
			location.href = centerURL;
			return;
		}
		loginModal.data("url", centerURL);
		$("#a_show_login").click();
	}


	$("#yourNeed,#yourNeed_bottom").click(function() {
		checkLogin(toNeed);
	});
	//进入页面检查用户是否登录
	checkLogin();
	//$("#resetPass").hide();
	/*重置密码*/
	$("#resetPass").find("button").click(function() {

		var newpwd = $("#lf_s_upass").val();
		var newpwd2 = $("#lf_s_rupass").val();
		var email = $(".resetEmail").text();

		var pwdlengerror = "密码不能为空";
		if (newpwd == "") {
			$("#resetPass .error").text(pwdlengerror);
			return;
		} else if (newpwd2 == "") {
			$("#resetPass .error").text(pwdlengerror);
			return;
		}
		var chkPwd = /^[0-9a-zA-Z]*$/g.test(newpwd);

		if (!chkPwd || newpwd.length < 5 || newpwd.length > 15) {
			pwdlengerror = "密码只能是5~15个字符长度的数字和字母";
			$("#resetPass .error").text(pwdlengerror);
			return;
		} else if (newpwd != newpwd2 && newpwd != "") {
			var pwderrorno = "两次输入密码不一致！";
			$("#resetPass .error").text(pwderrorno);

			return;
		}

		$.ajax({
			url : ROOTPATH + "/Passport/resetPwd",
			data : {
				email : email,
				newpwd : newpwd
			},
			dataType : "JSON",
			success : function(result) {
				if (result['status'] == 1) {

					$("#loginform").show();
					$("#registerform").hide();
					$("#active-email").hide();
					$("#resetPass").hide();

				}
			}
		});

	});

});
