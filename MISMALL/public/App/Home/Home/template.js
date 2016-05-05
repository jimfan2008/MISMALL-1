var ForceWindow = function(){
		  this.r = document.documentElement;
		  this.f = document.createElement("FORM");
		  this.f.target = "_blank";
		  this.f.method = "post";
		  this.r.insertBefore(this.f, this.r.childNodes[0]);
		};
	var ezPageCommon={
			/**
			 * 设置微信企业应用名
			 */
			setWXSiteName : function(tempType, siteId){
				//微观直接创建应用
				if(tempType == 3) {
					ezPageCommon.editorByTplId(tempType, siteId);
					return;
				}
				// _setCookie("from_page", 'mycenter');
				var $panelObj = $("#siteName");
				if(tempType == 1){
					$panelObj.find(".modal-title").text("应用名设置");
				}else if(tempType == 3){
					$panelObj.find(".modal-title").text("微观名设置");
				}else{
					$panelObj.find(".modal-title").text("网站名设置");
				}

				$panelObj.modal("show");
				$panelObj.find(".ImagePreview").undelegate('#inputFile3','change').delegate('#inputFile3','change', function() {
					$.ajaxFileUpload({
						type:"POST",
						url:ROOTPATH+"/Index/uploadPicture/type/ajax",
						secureuri:false,
						fileElementId:'inputFile3',
						dataType: 'JSON',
						success: function(data){
							var json = eval('('+data+')');
							console.log(data);
							$panelObj.find(".ImagePreview").find("img").attr('src', json.image).attr('data-id', json['id']);
						}
					});
				})
				$("#setNameCancleBtn").click(function(){
					$panelObj.modal("hide");
				});
				onValueChange($("#addName")[0], function(){
					$("#modal_errormessage").hide();
				});
				//下一步
				$("#setNameSureBtn").click(function(){
					var name = $.trim($("#addName").val());
					var imgSrc = $.trim($(".ImagePreview").find("img").attr("data-id"));
				
					if(name) {
						//验证名称是否存在
						var _isName = function(){
							var bool = false;
							var data = {};
							data["siteName"] = name;
							//data["imgData"] = imgData;
							$.ajax({
								type : "POST",
								url : ROOTPATH+"/Template/getUserSiteName",
								data : data,
								async : false,
								success : function(result){
									if(result != 0){
										bool = true;
									}else{
										$("#modal_errormessage").show();
									}
								}
							});
							return bool;
						}
						if(_isName()){
							ezPageCommon.editorByTplId(tempType, siteId, name, imgSrc);
						}
					}
				});
			},
			/**
			 * 根据模板ID编辑站点
			 * ＠param int siteId
			 */
			editorByTplId:function(tempType, siteId, name, imgSrc)
			{
				var url = "";
				var param = '/tplId/'+siteId;
				if (imgSrc == undefined) {
					imgSrc = '';
				}
				if (imgSrc != '') {
					param += '/imgSrc/'+imgSrc;
				}
				if (name != undefined) {
					param += '/siteName/'+name;
				}
				if(ezPageCommon.isLogin()){
					if(tempType == 1){
						url = ROOTPATH + "/Qywx/Editor/index";
					}else if(tempType == 2) {
						url = ROOTPATH + "/ezApp/Index/index";
					}else if(tempType == 3) {
						url = ROOTPATH + "/ViewGet/Editor/index";
					}else{
						url = ROOTPATH + "/Qywx/Editor/index";
					}
					window.location = url+param;
				}else{
					//跳转登录
					$("#a_show_login").click();
				}
			},
			/**
			 * 根据站点ID编辑站点
			 * ＠param int siteId
			 */
			editorBySiteId:function(tempType, siteId)
			{
				_setCookie("from_page", 'template');	// 记录编辑器来路
				
				var url = "";
				var param = '/siteId/'+siteId;
				if(ezPageCommon.isLogin()){
					if(tempType == 1){
						url = ROOTPATH + "/Qywx/Editor/index";
					}else if(tempType == 2) {
						url = ROOTPATH + "/ezApp/Index/index";
					}else if(tempType == 3) {
						url = ROOTPATH + "/ViewGet/Editor/index";
					}else{
						url = ROOTPATH + "/Qywx/Editor/edit";
					}
					window.location = url+param;
				}else{
					//跳转登录
					$("#a_show_login").click();
				}
			},
			/**
			 *是否登录状态 
			 *@return boolean true OR false
			 */
			isLogin:function()
			{
				var status = false;
				$.ajax({
		           type:"POST",
		           url:ROOTPATH+"/Passport/isLogin",
		           data:{},
		           async:false,
		           success:function(data)
		           {
		           	  status = data ? true : false;
		           }
		        });
		        return status;
			}
	};

	var pageButton = {'first':'首页','prev':'上一页','next':'下一页','last':'尾页'};
	
	 function getTemplateList(currPage, varData){
		 $.ajax({
				url: ROOTPATH + '/Template/search',
				type:'POST',
				data:varData,
				datatype:'JSON',
				async : false,
				success:function(data){
					$('#templateList').html('');
					if(data.pageCount){
						$('#TemplateDetail').tmpl(data.list).appendTo("#templateList");
						if(data.pageCount>1){
							$("#pager").pager({ pagenumber: currPage, pagecount: data.pageCount, button : pageButton, buttonClickCallback: PageClick});
						}
						$('.template_no').css('display','none');
					} else {
						if($('.shop_fl ul li:first').hasClass("current") &&　$('.template_list li').size()<=0){
							$('.template_no').hide();
							$('.mytemplate_no').show();
						}else{
							$('.mytemplate_no').hide();
							$('.template_no').css('display','block');
						}
						$("#pager").html('');
					}
				}
	     });
	}