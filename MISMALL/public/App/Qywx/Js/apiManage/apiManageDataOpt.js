/**
 * @author tanglj api数据增,删,改,查
*/
define(function(require,exports,module){
	var api_manageId = 0; //0-新增 大于0则代表修改,如果是修改则保存apiManage对应的ID
	var currentStep = 0;  //当前api操作进度,0-第一步 1-第二步 2-第三步
	var api_json = {};//api 获取的Json结构
	var apiManageDataOpt = {
		init:function(){
			apiManageDataOpt.initEvent();
			apiManageDataOpt.apiListNameEvent();
			apiManageDataOpt.apiListAddEvent();
			//apiManageClick(); //api管理面板
			
		},
		//初始化api相关的所有事件
		initEvent:function()
		{
			
			$("#apiUploadFile").click(function(){
				apiManageDataOpt.ajaxFileUpload();
			});
			
			//保存Api设置
			$("#api_save").click(function(){
				apiManageDataOpt.apiSave();
			});
			
			//添加参数
			$("#api_addParam").click(function(){
			     var plen = $(".api_param_item").length+1; //已经存在的P行数 
			     /*
	       	     $('<div class="api_param_item" rowId="' + plen + '">'+
					    '<span class="api_param_num"><nobr>参数'+ plen + ': 参数名</nobr></span><input type="text" class="api_param_key" placeholder="请输入键" />'+
						'值<input type="text" class="api_param_value" paramType="string" placeholder="请输入值" />'+
						'<input type="checkbox"  disabled="disabled" class="api_isBase64">Base64'+
						'<input type="checkbox" class="api_isGroup">参数组'+
						'<input type="checkbox" class="api_isSet" />设置否'+
						'<input type="checkbox" class="api_isHeader" />Header'+
						'<span class="api_delete" title="删除"></span>'+
    			  '</div>').appendTo("#api_param_list"); */
    			 
    			 $('<div class="api_param_item" rowId="'+plen+'">'+
			      '<div class="api_param_num"><nobr>参数'+ plen +': 参数名</nobr></div>'+
				  '<div class="api_param_content">'+   
					  '<input type="text" class="api_param_key" placeholder="请输入键" />'+
					  ' 值 <input type="text" class="api_param_value" paramType="string" placeholder="请输入值" />'+
					  '<input type="checkbox"  disabled="disabled" class="api_isBase64">'+
					  ' Base64 <input type="checkbox" class="api_isGroup">'+
					  ' 参数组 <input type="checkbox" class="api_isSet" />'+
					  ' 设置否 <input type="checkbox" class="api_isHeader" />'+
					  ' Header <span class="api_delete" title="删除"></span>'+
				  '</div>'+
			   '</div>').appendTo("#api_param_list");
    			  $("#api_paramTypeSet").hide();
			});
			
			//所有参数值文本框单击事件
			$("#api_param_list").on("click",".api_param_value",function(){
				$("#api_paramTypeSet").remove();
				var $this = $(this);
				//alert($this.css("left"));
				var $paramItem = $this.closest(".api_param_item");
				//css('height')与height()的区别:前者是css定义的高度,后者是实际高度(会刨出padding,border)
				//var itemHeight = $paramItem.height();
				var prowId = $paramItem.attr("rowid");
			   // var $offset = $this.offset(); var top = $offset.top + $this.height() + 10; var left = $offset.left; var width = $this.css("width");
			    //alert(top);
			    //var $paramtypeSet = $("#api_paramTypeSet");
			    $paramtypeSet = $('<div id="api_paramTypeSet">'+
					                     '<ul><li class="api_paramtype">'+
					                            '<input type="file" id="imgFile" name="imgFile" parentRow="'+prowId+'"/>'+
					                            '<a href="#">选择文件</a>'+
					                      '</li></ul></div>');
					                      
			   // if($paramtypeSet.size() > 0 ){
			      /*	$paramtypeSet.css({
			    		"top":itemHeight*prowId-1,
			    	});
			    	//$("#imgFile").attr("parentRow",prowId);*/
			    	//$paramtypeSet.toggle("show"); 
			    //	$paramItem.append($paramtypeSet);
			    	
			  //  }
			  //  else{
			    	/*
			    	$paramtypeSet = $('<div id="api_paramTypeSet" style="top:'+(top+1)+'px;left:'+left+'px;width:'+width+'px;">'+
					                     '<ul><li class="api_paramtype">'+
					                            '<input type="file" id="imgFile" name="imgFile" parentRow="'+prowId+'"/>'+
					                            '<a href="#">选择文件</a>'+
					                      '</li></ul></div>'); */
					
					/*$paramtypeSet = $('<div id="api_paramTypeSet">'+
					                     '<ul><li class="api_paramtype">'+
					                            '<input type="file" id="imgFile" name="imgFile" parentRow="'+prowId+'"/>'+
					                            '<a href="#">选择文件</a>'+
					                      '</li></ul></div>'); */
					                      
					//$paramtypeSet.css({"top":"36","left":"173"});                      
					//文件上传
					$paramtypeSet.on("change","[name='imgFile']",function(){
					     $.ajaxFileUpload({
							type : "POST",
							url : SITECONFIG.ROOTPATH + "/Apps/WechatPublic/ajaxUpload",
							secureuri : false,
							fileElementId : 'imgFile',
							dataType : 'JSON',
							async : false,
							success : function(data) {
								$("#api_paramTypeSet").css("display","none");
								var fileJson = JSON.parse(data);
								var tmpArr = fileJson.image.split("/");
								var fileName = tmpArr[tmpArr.length-1];
								
								$cp = $($("#api_param_list .api_param_item")[prowId-1]); //获取当前参数行
								$cp.find(".api_param_value").val(fileName).attr({"paramType":"file","dataVal":fileJson.image});
								$cp.find('.api_isBase64').attr("disabled",false);
							}
					     });
				     });
			         $paramItem.append($paramtypeSet);
				  //}
		    });

            //动态删除参数+别名
			$("#api_param_list,#api_alias_list").on("click",".api_delete",function(){
				$(this).closest(".api_param_item").remove();
				$(this).closest(".api_alias_item").remove();
			});
			
			//api测试
			$("#api_getJson").click(function(){
				apiManageDataOpt.apiParseTest();
			});

			//api结果节点单击事件
			$("#api_result").on("click",".apiNode",function(e){
				apiManageDataOpt.jsonNodeClick($(this));
			});
			
			//apiUrl值改变事件,自动识别参数
			/*
			$(".api_param_value")[0].oninput = function(){
				alert("oninput");
			};
			*/
			
			//apiUrl值改变事件,自动识别参数
			$("#api_param_list").on("input",".api_param_value",function(){
				$this = $(this);
				$this.attr("paramtype","string");
				$this.siblings(".api_isBase64").attr("disabled","disabled");
				$("#api_paramTypeSet").hide();
			});
			
			//IE下效果,待测试
			$("#api_param_list").on("propertychange",".api_param_value",function(){
				$this = $(this);
				$this.attr("paramtype","string");
				$this.siblings(".api_isBase64").attr("disabled","disabled");
				$("#api_paramTypeSet").hide(); 
			});
			
			
			//api_url键盘按下+失去焦点
			$("#api_url").keydown(function(e){
				if(e.keyCode === 13){
					api_autoFill();
				}
			}).blur(function(){
				//api_autoFill();
			});
			
			
			//IE文本框值改变事件
			/*
			$("#api_url")[0].onpropertychange = function(){
				alert("onpropertychange");
			};
			*/
			/**
			 *  新增Api
			 */
			$("#api_add").click(function(){
				apiManageDataOpt.apiAdd();
			});
			
			/* */
			$("#apiManage").on("focus","input[type='text']",function(){
				$(this).css("background-color","#FFFFE0");
			}).on("blur","input",function(){
				$(this).css("background-color","");
			});
			
			//api列表鼠标移入事件
			$("#api_list").on("mouseover",".api_item",function(){
				$this = $(this).find(".api_delete");
				$("#api_list").find(".api_delete,.api_item_submit").css("display","none");
				$(this).find(".api_item_submit").css("display","inline-block");
				$this.css("display","inline-block");
				$this.css({"left":"170px","top":"5px"});
			}).on("mouseout",".api_item",function(){
				$(this).find(".api_delete,.api_item_submit").css("display","none");
			}); 
			
			//删除Api
			$("#api_list").on("click",".api_delete",function(event){
				//删除时阻止事件冒泡 1.event.stopPropagation(); 2.return false; 后者会阻止自身事件
				event.stopPropagation(); 
				if(confirm("确定要删除吗?")){
					var id = $(this).closest("li").attr("id");
					$.ajax({
						type:"post",
						url:SITECONFIG.APPPATH+"/ApiManage/deleteApiById",
						data:{"id":id,"siteId":SITECONFIG.SITEID},
						async:false,
						success:function(data){
							if(data){
								$("#api_list").find("li[id='"+id+"']").remove();
								ezCommon.apiManageJsonCache = {};
                                api_manageId = 0; //删除后自动置为新增状态
                                apiManageDataOpt.clearApiSet(); //清空旧设置								
							}
						}
				    });
				}
			}); 
			
			/**
			 * 提交api进行审核
			 */
			$("#api_list").on("click",".api_item_submit",function(event){
				//删除时阻止事件冒泡 1.event.stopPropagation(); 2.return false; 后者会阻止自身事件
				event.stopPropagation(); 
				if(confirm("确定要提交吗?")){
					var id = $(this).closest("li").attr("id");
					$.ajax({
						type:"post",
						url:SITECONFIG.APPPATH+"/ApiManage/ciAuditApiById",
						data:{"id":id,"siteId":SITECONFIG.SITEID},
						async:false,
						success:function(data){
							if(data === "1"){
								$item = $("#api_list").find("li[id='"+id+"']");
								$item.removeClass("api_item_editor").addClass("api_item_auditing");
								$item.find(".api_item_submit").remove();
								//避免点击了某个可编辑的api且正在编辑,然后再去点击某个api提交
								if(api_manageId === id){
									$apiSave = $("#api_save");
									$apiSave.attr("disabled","disabled");
								    $apiSave.css({"background":"#cccccc"});
								}
								
								ezCommon.apiManageJsonCache = {};
                                //api_manageId = 0; //删除后自动置为新增状态
                                //apiManageDataOpt.clearApiSet(); //清空旧设置
                                $(".tipWrap_img").html("提交成功");								
							}
							else{
								$(".tipWrap_img").html("提交失败");
							}
						}
				    });
				}
			}); 
			
			/**
			 * api参数-鼠标移入移出事件
			 */
			$("#api_param_list").on("mouseover",".api_param_item",function(){
				$(this).find(".api_delete").css("display","inline-block");
			}).on("mouseout",".api_param_item,.api_alias_box",function(){
				$(this).find(".api_delete").css("display","none");
			});
			
			/**
			 * api_alias参数-鼠标移入移出事件
			 */
			$("#api_alias_list").on("mouseover",".api_alias_item",function(){
				$this = $(this).find(".api_delete");
				$this.css({"left":"250px","top":"10px"});
				$this.css("display","inline-block");
				
			}).on("mouseout",".api_alias_item",function(){
				$(this).find(".api_delete").css("display","none");
			});
		
		    /**
		     * API 列表单击
		     */
		    $("#api_list").on("click",".api_item",function(){
		    	var $this = $(this);
		    	$(".api_item").css("background-color","");
		    	$this.css("background-color","#ffffff"); 
		    	api_manageId = $this.attr("id");
		    	
		    	$apiSave = $("#api_save");
		    	if($this.hasClass("api_item_editor")){
		    		$apiSave.css({"background":"#FF9900"}).removeAttr("disabled");
		    	}
		    	else{
		    		$apiSave.css({"background":"#cccccc"}).attr("disabled", "disabled");
		    	}
		    	
		    	var apiJson = ezCommon.getApiManageJson();
		    	if(!$.isEmptyObject(apiJson.data)){
		    		$.each(ezCommon.apiManageJsonCache.data,function(k,v){
		    			if(v.id === api_manageId){	
		    				
		    			   //还原基本信息
		    			   $("#api_name").val(v.apiName);
		    			   $("#api_url").val(v.apiUrl);
		    			   $("#api_method").val(v.method);
		    			   
		    			   //还原参数
		    			   var paramsJson = v.params;
		    			   var i = 1;
		    			   if(paramsJson !== "null"){
		    			   	   paramsJson = JSON.parse(paramsJson);
		    			   	   var paramsHtml = [];
		    			   	   $("#api_param_list").empty();
		    			       $.each(paramsJson,function(kp,vp){
			    			   	  var isSet = vp.isSet === "false" ? "" : 'checked="true"';
			    			   	  var paramType = vp.paramType;  //参数类型,如file,string
			    			   	  var isBase64 = vp.dataType === "base64" ? 'checked="true"' : "";    //数据格式,如果等于true则为Base64
			    			   	  var disabled = 'disabled = "disabled"';
			    			   	  var dataval = "";
			    			   	  var val = vp.val; //如果是file类型则不同
			    			   	  if(paramType === "file"){
			    			   	  	 disabled = "";
			    			   	  	 dataval = 'dataval = "'+vp.val+'"';
			    			   	  	 var tmpFile = val.split("/");
			    			   	  	 val = tmpFile[tmpFile.length-1];
			    			   	  }
			    			   	  	
			    			   	  var isGroup = vp.isGroup === "false" ? "" : 'checked="true"';      //是否为参数子数组
			    			   	  var isHeader = vp.isHeader === "false" ? "" : 'checked="true"';    //是否为百度Header参数

		            			  paramsHtml.push('<div class="api_param_item" rowId="'+ i +'">'+
								      '<div class="api_param_num"><nobr>参数'+ i +': 参数名</nobr></div>'+
									  '<div class="api_param_content">'+   
										  '<input type="text" class="api_param_key" placeholder="请输入键" value="'+ kp +'" />'+
										  ' 值 <input type="text" class="api_param_value" paramType="'+ paramType +'" placeholder="请输入值" '+
										  ' value="'+ val +'" '+ dataval +' />'+
										  '<input type="checkbox" class="api_isBase64" '+ isBase64 + disabled +'>'+
										  ' Base64 <input type="checkbox" class="api_isGroup" '+ isGroup +'>'+
										  ' 参数组 <input type="checkbox" class="api_isSet" '+ isSet +' />'+
										  ' 设置否 <input type="checkbox" class="api_isHeader" '+ isHeader +' />'+
										  ' Header <span class="api_delete" title="删除"></span>'+
									  '</div>'+
								   '</div>');
	                              i++;
			    			   });	
			    			   $("#api_param_list").append(paramsHtml.join(""));
		    			   }
		    			   
		    			   //还原json结果
		    			   var rJson = v.apiResultJson;
		    			   if(rJson !== "null"){
		    			   	 api_json = JSON.parse(rJson);
		    			     str = ""; //重置空
		    			     document.getElementById("api_result").innerHTML = forTree(api_json);
		    			     formatTree();//格式化json树
		    			   }
		    			   
		    			   
		    			   //还原别名设置
		    			   var aJson = v.alias;
		    			   if(aJson !== "null"){
		    			   	   var api_alias = JSON.parse(aJson);
		    			   	   $("#api_alias_list").empty(); //清空别名设置
			    			   var aliasArr = [];
			    			   $.each(api_alias,function(ka,va){
			    			   	   $.each(va,function(kas,vas){
				    			   	   	//添加节点的别名设置
									    aliasArr.push('<div class="api_alias_item"><span class="api_alias_item_nodeName">'+ kas +
									                  '</span>  <input type="text" jsonNodePath="'
			                                           + vas.nodePath +'" placeholder="取个别名吧" value="'+ vas.aliasName +
			                                           '"><span class="api_delete" title="删除"></span></div>');
			    			   	   });
			    			   }); 
			    			   $("#api_alias_list").append(aliasArr.join(""));
		    			   }
		    			   
		    			   return false; //结束所有循环 return true;表示当前循环 apiResultJson
		    			}
		    		});
		    	}
		    });

	   	    $("#api_btn_box").on("click","button",function(){
	   	      	  var cOpt = $(this).attr("class");
	   	      	  switch(cOpt){
	   	      	  	case 'api_btn_pre':
	   	      	  		if(currentStep){
	   	      	  			if(currentStep === 1){
	   	      	  				//显示第一步
	   	      	  			    $("#first").show();
	   	      	  			    $("#second").hide();
	   	      	  			    $("#api_progress_2,#api_progress_3").removeClass("api_active_progress");
	   	      	  			}
	   	      	  			else if(currentStep === 2){
	   	      	  				//显示第二步
	   	      	  				$("#third").hide();
	   	      	  				$("#second").show();
	   	      	  				$("#api_progress_4,#api_progress_5").removeClass("api_active_progress");
	   	      	  			}
	   	      	  			currentStep--;
	   	      	  		}
	   	      	  	break;
	   	      	  	case 'api_btn_next':
	   	      	  		if(currentStep < 2){
	   	      	  			if(currentStep === 0){
	   	      	  				//显示第二步
	   	      	  				$("#second").show();
	   	      	  				$("#first").hide();
	   	      	  				$("#api_progress_2,#api_progress_3").addClass("api_active_progress");
	   	      	  			}
	   	      	  			else if(currentStep === 1){
	   	      	  				//根据设置获取apiJson信息
	   	      	  				//apiManageDataOpt.apiParseTest();
	   	      	  				//显示第三步
	   	      	  				$("#second").hide();
	   	      	  				$("#third").show();
	   	      	  				$("#api_progress_4,#api_progress_5").addClass("api_active_progress");
	   	      	  			}
	   	      	  			currentStep++;
	   	      	  		}
	   	      	  	break;
	   	      	  	case 'api_btn_save':
	   	      	  	break;
	   	      	  }
	   	    });
	   	    
	   	    /**
	   	     * 获取apiJson 
	   	    */
	   	    $("#api_result_json").click(function(){
	   	    	apiManageDataOpt.apiParseTest();
	   	    	$("#api_alias_list").empty(); //清空别名设置
	   	    });
	   	    
	   	    /* 暂时不做
	   	    $("#api_progress").on("click",".api_progress_odd",function(){
	   	    	var pageNo = $(this).text();
	   	    	switch(pageNo){
	   	    		case "1":
	   	    			$("#first").show();
	   	    			$("#second").hide();
	   	    			$("#third").hide();
	   	    		break;
	   	    		case "2":
	   	    			$("#second").show();
	   	    			$("#third").hide();
	   	    			$("#first").hide();
	   	    		break;
	   	    		case "3":
	   	    			$("#third").show();
	   	    			$("#second").hide();
	   	    			$("#first").hide();
	   	    		break;
	   	    	}
	   	    });
	   	    */
		},
		clearApiSet:function(){
			//公共清空api设置
			$first = $("#first");
			$first.find("input").val("");  //清空api基本信息
			$first.find("select").val("GET");           //默认api提交方式
			$("#api_result").empty();    //清空结果
			$("#api_param_list").empty(); //清空参数
			$("#api_alias_list").empty(); //清空别名设置
		},
		apiSave:function(){
			//收集api基本信息
			var apiName = $("#api_name").val().trim();
			var apiUrl = $("#api_url").val().trim();
			var method = $("#api_method").val();
			if(!apiName && !apiUrl){
				alert("API名称或API地址不能为空!");
				return;
			}
			var gFlag = false;
			//收集api参数
			var params = [];
			$.each($(".api_param_item"),function(k,v){
				var $v = $(v);
				var isSet = $v.find(".api_isSet").is(":checked");
				var isHeader = $v.find(".api_isHeader").is(":checked");
				var isGroup = $v.find(".api_isGroup").is(":checked");
				if(!gFlag)
				   gFlag = isGroup;
				var key = $v.find(".api_param_key").val().trim();
				var paramType = $v.find(".api_param_value").attr("paramtype");
				var value,dataType = "fileName";
				
				if(paramType === "file"){
					value = $v.find(".api_param_value").attr("dataVal");
					dataType = $v.find(".api_isBase64").is(":checked") === true ? "base64" : "fileName";
				}
				else{
					value = $v.find(".api_param_value").val().trim();
				}
				  
				params.push('"' + key + '":{"isSet":"' + isSet + '","val":"' + value +'","isHeader":"'+isHeader
				            +'","paramType":"'+paramType+'","dataType":"'+dataType+'","isGroup":"'+isGroup+'"}'); 
			});
			params = JSON.parse( "{" + params.join(",") + "}" );
			//收集节点别名设置
			var alias = []; 
			$.each($("#api_alias_list .api_alias_item"),function(k,v){
				var $obj = $(v);
				var key = $obj.find(".api_alias_item_nodeName").html();
				var nodePath = $obj.find("input").attr("jsonNodePath");
				var aliasName = $obj.find("input").val(); 
				alias.push('{"'+key+'":{"aliasName":"'+aliasName+'","nodePath":"'+nodePath+'"}}');
			});
			alias = JSON.parse( "[" + alias.join(",") + "]" ); //同一级别的key要求唯一,所以用[]
			var data ={
				"apiId":api_manageId,
				"isGroup":gFlag,
				"apiName":apiName,
				"apiUrl":apiUrl,
				"method":method,
				"siteId":SITECONFIG.SITEID,
				"params":params,
				"apiResultJson":api_json,
				"alias": alias,      
			};
			
			$.ajax({
				type:"post",
				url:SITECONFIG.APPPATH+"/ApiManage/apiSave",
				data:data,
				success:function(data){
					$(".tipWrap_img ,.tipWrap").css("display","inline");
					//新增时api_manageId=0
					if(!api_manageId){
						api_manageId = data;
						$("#api_list").append('<li id="'+data+'" class="api_item api_item_editor">'+ apiName +
						                      '<span class="api_item_submit" title="提交审核"></span><span class="api_delete" title="删除"></span></li>');
						ezCommon.apiManageJsonCache = {};
						$(".tipWrap_img").html("保存成功");
					}
					else{
						if(data === "1"){
							$("#api_list").find('li[id = "'+ api_manageId +'"]').html(apiName + 
							'<span class="api_item_submit" title="提交审核"></span><span class="api_delete" title="删除"></span>');
							//$("#api_list").find("li[id='"+ api_manageId +"']").remove();
							ezCommon.apiManageJsonCache = {};
							$(".tipWrap_img").html("修改成功");
						}
						else{
							$(".tipWrap_img").html("修改失败");
						}
						
					}
					//$("#api_list").append('<li id="'+data+'" class="api_item api_item_editor">'+apiName+'<span class="api_delete" title="删除"></span></li>');
					$(".tipWrap").fadeOut(3000);
					
				}
			});
		},
		//api测试并获取返回的json
		apiParseTest:function(){
			var apiUrl = $("#api_url").val().trim();
			var method = $("#api_method").val().trim();
			if(!apiUrl){
				alert("API地址不能为空!");
				$("#api_url").focus();
				return;
			}
			var params = [];
			var gFlag = false; //分组标识
		    $paramItems = $(".api_param_item");
			$.each($paramItems,function(k,v){
				$v = $(v);
				var key = $v.find(".api_param_key").val().trim();
				var value;
				var paramType = $v.find(".api_param_value").attr("paramType"); //参数类型 string file两种
				var dataType = "fileName";  //默认文件名
               
				if(paramType === "file"){
					dataType = $v.find(".api_isBase64").is(":checked") === true ? "base64" : "fileName";
					value = $v.find(".api_param_value").attr("dataVal");
				}
				else{
					value = $v.find(".api_param_value").val().trim();
				}
				//var dataType = $v.find(".api_base64").is(":checked"); //如果参数类型为File才可能将它设置为base64
				var isGroup = $v.find(".api_isGroup").is(":checked"); //是否参数分组
				if(!gFlag)
				  gFlag = isGroup;
				  
				//百度Store会将某些参数加入到CURLOPT_HTTPHEADER中
				var isHeader = $v.find(".api_isHeader").is(":checked");
				params.push('"'+key+'":{"value":"'+value+'","isHeader":"'+isHeader+'","isGroup":"'+isGroup+'","paramType":"'
				            +paramType+'","dataType":"'+dataType+'"}'); 
			});
			
			params = "{"+params.join(",")+"}";
			params = JSON.parse(params);
			
			var data ={
				"apiUrl":apiUrl,
				"method":method,
				"isGroup":gFlag,  //分组标识
				"siteId":SITECONFIG.SITEID,
				"params":params        
			};
			
			$.ajax({
				type:'post',
				url:SITECONFIG.APPPATH+"/ApiManage/apiParseTest",
				data:data,
				dataType:'json',
				async:false,
				success:function(result){
					api_json = result;
					str = ""; //重置空 该参数用于forTree()方法
					$("#api_result").empty().append(forTree(result));
					formatTree(); //格式化json树
				}
			});
		},
	    //api返回结果的节点单击事件
	    jsonNodeClick:function($this){
	    	$(".apiNode").css("background-color","");
	    	$this.css("color","red");
	    	var thisVal = $this.find("span").html();
			thisVal = thisVal.substring(0,thisVal.indexOf("="));
            var path = [];
			path.push(thisVal);
			var parents = $this.parents("div .apiParentNode");
			$.each(parents,function(k,v){
			    var tmp = $(v).find("span").html();
				tmp = tmp.substring(3,tmp.length).trim(); //去掉前面的 [-]
				path.push(tmp); 
			});
			//添加节点的别名设置
			var aliasStr = '<div class="api_alias_item"><span class="api_alias_item_nodeName">'+thisVal+'</span>  <input type="text" jsonNodePath="'
			               +path.join(',')+'" placeholder="取个别名吧"><span class="api_delete" title="删除"></span></div>';
			$("#api_alias_list").append(aliasStr);
	    },
	    
		apiListNameEvent:function(){
			$(".apiListName").click(function(){
				$(".apiList").fadeIn(300);
				$(".addApiPnl").fadeOut(300);
			});
		},
		
		apiListAddEvent:function()
		{
			$(".apiListAdd").click(function(){
				$(".apiList").fadeOut(300);
		        $(".addApiPnl").fadeIn(300);
			});
		},
		
		/**
		 * 获取已创建的API
		 */
		getApiList : function()
		{
            apiManageDataOpt.clearApiSet();//清空	
            api_manageId = 0;		
			var apiJson = ezCommon.getApiManageJson();
			apiList = [];
			if(!$.isEmptyObject(apiJson.data)){
				var statusClass = "", title = "", submitHtml, deleteHtml = '<span class="api_delete" title="删除"></span>';
				$.each(apiJson.data,function(k,v){
					submitHtml = "";
					deleteHtml = '<span class="api_delete" title="删除"></span>';
					switch(v.status){
						case "-1":
						   //审核失败
						   statusClass = "api_item_audit_fail";
						   title = 'title = "审核失败"';
						break;
						case "0":
						   //编辑状态
						   statusClass = "api_item_editor";
						   title = 'title = "编辑状态"';
						   submitHtml = '<span class="api_item_submit" title="提交审核"></span>';
						break;
						case "1":
						   //审核中
						   statusClass = "api_item_auditing";
						   title = 'title = "审核中..."';
						break;
						case "2":
						   //审核通过
						   statusClass = "api_item_audited";
						   title = 'title = "审核通过"';
						   deleteHtml = "";
						break;
					}
					liHtml = '<li id="'+v.id+'" class="api_item '+ statusClass +'" '+ title +'>'+ v.apiName + submitHtml + deleteHtml + '</li>';
				    apiList.push(liHtml);
			    });
			}
			return apiList.join("");
		},
		
		/**
		 * 获取所有apiManage信息
		 */
		getApiListForActionSetNew:function(){
			var actionOption = [];
			actionOption.push("<option value='_bank' type='api'>--请选择--</option>");
			ezCommon.getApiManageJson();
			if(!$.isEmptyObject(ezCommon.apiManageJsonCache.data)){
				$.each(ezCommon.apiManageJsonCache.data,function(key,value){
					actionOption.push("<option type='api'  value='"+value.id+"'>"+value.apiName+"</option>");
				});
			}
			return actionOption.join("");
		},
		
		/**
		 * 新增API
		 */
		apiAdd:function(){
			api_manageId = 0; //新增
			$("#api_save").removeAttr("disabled").css({"background":"#FF9900"});
			apiManageDataOpt.clearApiSet();
		},
		//上传api文件
		ajaxFileUpload:function()
		{
			//apiManageDataOpt.loading();//动态加载小图标 
			require.async(SITECONFIG.PUBLICPATH+"/Js/ajaxfileupload.js" + SITECONFIG.VERSION,function(e){
				$.ajaxFileUpload ({ 
				url:SITECONFIG.APPPATH+"/ApiManage/uploadFile", 
				secureuri :false, 
				fileElementId :'apiFile', 
				dataType : 'text', 
				data:{"apiName":$("#apiName").val()},
				success : function (data, status)
				{ 
					alert("success"+data);
					/*
					if(typeof(data.error) != 'undefined')
					{ 
						if(data.error != '')
						{ 
						  alert(data.error); 
						}
						else
						{ 
						  alert(data.msg); 
						} 
					} */
				}, 
				error: function (data, status, e)
				{ 
					alert(e); 
					//alert(data);
				} 
			}); 
			return false; 
			});
		},
		loading:function(){
			$("#loading ").ajaxStart(function(){ 
				$(this).show(); 
				}).ajaxComplete(function(){ 
				$(this).hide(); 
				}); 
		}
	};
	

	
	var str = "";
	function forTree(o){
		var urlstr = "";
			var keys = new Array();
		    /* for (var key in o) { 会对元素属性进行循环,超出预期循环次数
				keys.push(key);
				//alert("for=="+key);
			} */
			
			$.each(o,function(kk,vv){
				keys.push(kk);
			});
			
			for (var j = 0; j < keys.length; j++) {
				k = keys[j];
				if ( typeof o[k] == "object") {
					urlstr = "<div class='apiParentNode'><span>" + k + "</span><ul>";
				} else {
					urlstr = "<div class='apiNode'><span>" + k + "=" + o[k] + "</span><ul>";
				}
				str += urlstr;
				var kcn = 0;
				if ( typeof o[k] == "object") {
					for (var kc in o[k]) {
						kcn++;
					}
				}
				if (kcn > 0) {
					forTree(o[k]);
				}
				str += "</ul></div>";
			}
			return str;
	}
	
	/**
	 * 格式化json树
	 */
	function formatTree(){
		$(".menuTree ul").each(function(index, element) {
						var ulContent = $(element).html();
						var spanContent = $(element).siblings("span").html();
						if (ulContent) {
							$(element).siblings("span").html("[+] " + spanContent);
						}
					}); 

					$(".menuTree").find("div span").click(function() {
						var ul = $(this).siblings("ul");
						var spanStr = $(this).html();
						var spanContent = spanStr.substr(3, spanStr.length);
						if (ul.find("div").html() != null) {
							if (ul.css("display") == "none") {
								ul.show(300);
								$(this).html("[-] " + spanContent);
							} else {
								ul.hide(300);
								$(this).html("[+] " + spanContent);
							}
						}
					});
	}
	
	/**
	 * 根据apiUrl自动填充参数
	 */
	function api_autoFill(){
        var apiUrl = $("#api_url").val().trim();
        if(!apiUrl){
        	return;
        }
		var urls = apiUrl.split("?");
		$("#api_params").empty();
		//针对百度api做特殊处理
		if(apiUrl.indexOf('apis.baidu.com')>-1){
			$("#api_params").append('<p>参数1:  <span>键</span><input type="text" class="api_key" placeholder="请输入键" value="apikey">'+ 
				       	  	   '<span>值</span><input type="text" class="api_value" placeholder="请输入值">'+
				       	  	   '<input type="checkbox" class="api_isSet" title="勾选后在动作设置时显示">是否设置'+
				       	  	   '<input type="checkbox" class="api_isHeader" checked="true" title="百度store请求方式">加入Header'+
				       	  	   '<span class="api_delete" title="删除"></span></p>');
		}
	
		if(urls.length > 1){
			var params = urls[1].split("&");
			//alert(params.length);
			var pLen = params.length;
			if(pLen > 0){
				$index = $("#api_params p").length;
				var paramStr = [];
				for(var i = 0;i < pLen; i++ ){
					if(params[i].length > 0){
						var tmps = params[i].split("=");
					    var pTitle = "参数"+($index+i+1);
					    var val = tmps[1] == undefined ? "" : tmps[1];
					    paramStr.push('<p>'+pTitle+':  <span>键</span><input type="text" class="api_key" placeholder="请输入键" value="'+tmps[0]+'">'+ 
				       	  	   '<span>值</span><input type="text" class="api_value" placeholder="请输入值" value="'+val+'">'+
				       	  	   '<input type="checkbox" class="api_isSet" title="勾选后在动作设置时显示">是否设置'+
				       	  	   '<input type="checkbox" class="api_isHeader" title="百度store请求方式">加入Header'+
				       	  	   '<span class="api_delete" title="删除"></span></p>');
					}
					
				} 
				$("#api_params").append(paramStr.join(""));
				$("#api_url").val(urls[0]);
			}
		}
	}
	/**
	 * 根据当前操作进度控制按钮状态 
     * @param {Object} cStep 当前进度 0-第一步  1-第二步 2-第三步
	 */
	function controlBtn(cStep){
		switch(cStep){
			case 0:
				$("#api_btn_pre").attr("disabled",true).css("background-color","#CCCCCC");
				
			break;
			case 1:
				$("#api_btn_pre").attr("disabled",false).css("background-color","#FF9900");
			break;
			case 2:
			break;
		}
	}
	
	
	apiManageDataOpt.init();
	module.exports = apiManageDataOpt;
});