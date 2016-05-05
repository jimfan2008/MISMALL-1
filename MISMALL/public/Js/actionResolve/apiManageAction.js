/**
 * @author tanglj api动作执行统一管理
 */
define(function(require,exports,module){
	var apiManageAction = {
		init:function(){
		},
		apiManageAction:function($ctrlObj, cJson,apiId){
			var data = {"siteId":SITECONFIG.SITEID,"apiId":apiId};
			
		//	"{"type":"apiManageAction","ctrl":{"url":{"dataType":"form","valueType":"IMAGE8","value":"上传图片8"}},
		//	"apiResultSet":{"TEXTBOX1":{"dataType":"apiResult","value":"value,age,attribute,0,face","desc":"api结果.年龄"}}}"
			//解析输入参数
			var flag = 0;//标识api参数是否存在空值
			$.each(cJson.ctrl,function(k,v){
				var dtype = v.dataType;
				//如果是非常量
				if(dtype.toLowerCase() !== "constant"){
					switch(dtype){
						case "form" :
						    //如果image类型
					    	if(v.valueType.toLowerCase().indexOf("image") > -1){
					    		data[k] = $('[name="'+v.valueType+'"]').attr("src");
					    	}
					    	else{
					    		data[k] = $('[name="'+v.valueType+'"]').val().trim();
					    	}
						break;
						case "systemParam":
							data[k] = ezCommon.getSysParam(v.valueType);
						break;
					}
				}else{
					data[k] = v.value; //如果是常量则直接获取
				}
				//如果api输入参数为空
				if(!data[k]){
					flag = 1;
					return false;
				}
				    
			});
			
			//如果api传入的参数为空则停止解析
			if(flag){
				alert("api输入参数不能为空!!!");
				return;
			}
			
			var apiResult = {};
			$.ajax({
				url:SITECONFIG.APPPATH+"/Qywx/ApiManage/apiParse",
				type:"post",
				data:data,
				async:false,
				datatype:"json",
				success:function(data){
					apiResult = JSON.parse(data);
					
					/*try{
						apiResult = JSON.parse(data);
						alert(apiResult);
						console.log(apiResult);
					}catch(err){
						alert("api解析错误 "+err);
						return false;
					}*/
				}
			});
			var isError = 0;
		    $.each(cJson.apiResultSet,function(k,v){
		    	if(v.dataType === "apiResult"){
		    		var nodePath = v.value.split(',').reverse();
		    		var result = apiResult;
		    		$.each(nodePath,function(k1,v1){
		    			if(result[v1] != undefined){
		    				result = result[v1];
		    			}
		    			else{
		    				alert("对不起!api无返回结果,请重试!!!");
		    				isError = 1;
		    				return false;
		    			}
		    			
		    		});
		    		if(isError)
		    			return false;
		    		$("[name='"+k+"']").val(result);
		    	}
		    });
		    return true;
		},
	};
	module.exports = apiManageAction;
});
