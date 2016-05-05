/**
 * 前端APP登录
 */
$(function() {
	//获取cookie的值
	var username = $.cookie("username");
	var password = $.cookie("password");

	//将获取的值填充入输入框中
	$(".l_user").val(username);
	$(".l_password").val(password);

	if(username != null && username != '' && password != null && password != ''){//选中保存秘密的复选框
		$(".l_remember").attr('checked',true);
	}

	function _userLogin() {
		var userName = $.trim($(".l_user").val());
		var userPass = $(".l_password").val();

		if(userName == '' || userPass == '') {
			return;
		}

		if($(".l_remember").prop('checked') == true){//保存密码
			$.cookie('username',userName, {expires:7,path:'/'});
			$.cookie('password',userPass, {expires:7,path:'/'});
		}else{//删除cookie
			$.cookie('username', null, { expires: -1, path: '/' });
			$.cookie('password', null, { expires: -1, path: '/' });
		}

		// 提交表单的操作
		$.ajax({
			type : "post",
			url : APPPATH + '/Home/Passport/ajaxLogin',
			data : {
				"email" : userName,
				"password" : userPass,
				"checked" : 0
			},
			dataType: "json",
			success : function(r) {
				if (r.status) {
					// 设置当前应用项目				
					var appid = _getUrlParas('url') ? _getUrlParas('url') : 0;
					$.ajax({
						type : "post",
						url : APPPATH + "/Home/MyCenter/useAApp",
						data : {
							appid : appid
						},
						success : function(result) {
							_setCookie('pageFrom', 'userlogin');
							if(result==1) {
								window.location.href = APPPATH + '/Apps/FormMobile/index';
							} else {
								window.location.href = APPPATH + '/Apps/Index/index';
							}
						}
					});
				} else {
					alert(r.message);
				}
			}
		});
	};

	$(".input_l").on("keyup", function(e) {
		if (e.keyCode != 13)
			return;
		_userLogin();
	});

	$(".sign_bot").on("click", function() {
		_userLogin();
	});

	

});
