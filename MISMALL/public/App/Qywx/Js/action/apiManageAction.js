/**
 * @author tanglj  外部Api动作统一管理
 */
define(function(require,exports,module){
	var apiManageAction= {
		action:function(actionIndex){
			//生成外部api动作设置所需的HTML
			var htmlStr='<div class="inputParamSet" style="border:1px solid #cccccc;margin:0px 0px 4px 0px;padding-bottom:4px;">'
                        +'<div style="margin:0px 0px 6px 0px;background-color:#cccccc;">输入参数</div>';
			var apiName="";
			//可以接收返回值,也可以调用方法后直接访问全局变量
			ezCommon.getApiManageJson(actionIndex); 
			$.each(ezCommon.apiManageJsonCache.data,function(k,v){
				if(actionIndex == v.id){
					apiName = v.apiName;
					var params = JSON.parse(v.params);
					$.each(params,function(kp,vp){
						if(vp.isSet == "true")
						{
							htmlStr += '<div class="row inputParam" paramName="'+kp+'">'+
							              '<div class="col-md-1"></div>'+
					                      '<div class="col-md-2"><span style="line-height:25px;">'+kp+'</span></div>'+
					                       '<div class="col-md-9">'+
					                         '<input type="text" class="form-control apiInputParam fillVal" datatype="constant" value="'+vp.val+'"></div>'+
					                   '</div>'; 
				        }
					});
				}
			});
			htmlStr += '</div>';		
			/***************处理api返回结果**********************/
			var $apiResultSet = $('<div class="apiResultSet" style="border:1px solid #cccccc;margin:10px 0px 4px 0px;">'
                                  +'<div style="margin:0px 0px 6px 0px;background-color:#cccccc;">结果设置</div>'
                                  +'<div class="addResultSet">'
                                  +'<button class="btn btn-default input-sm addNewCtrl" style="width:80px;margin:0px 0 0 12px;background:#00ccff;border:0px;border-radius:0px;color:#ffffff">'
                                  +'添加</button></div>'
                                  +'<div style="margin:10px 0px" class="row resultRow">'
                                     +'<div class="col-md-2" style="margin: 6px 0px 0px; padding: 0px; text-align: center;">控件</div>'
                                     +'<div style="margin:0px 0px 0px;padding: 0px 10px 0px 0px;" class="col-md-4">'
                                        +'<select class="form-control  input-sm ctrlArray"></select>'
                                     +'<div class="action-caret formCtrl-caret"></div></div>'
                                  +'<div class="col-md-1" style="margin: 8px 0px 0px; padding: 0px; text-align: center;">等于</div>'
                                  +'<div style="padding: 0px 0px 0px 10px" class="col-md-4">'
                                  +'<input type="text" datatype="constant" class="form-control input-sm fillVal"></div>'
                                  +'<div class="col-md-1" style="padding:0px"><span class="resultSet-del">-</span></div></div>'
                                  +'</div>');
			var ctrlLists = ezCommon.controlLists[ezCommon.formId];
			if (!ctrlLists)
				return false;
			//将控件添加到下拉框
			$.each(ctrlLists, function(key, value) {
				var ctrlType = value["ctrlType"];
				if (ctrlType == "TEXTBOX" || ctrlType == "DROPDOWN" || ctrlType == "TEXTAREA" ) {
					var ctrlTitle = value["attrs"]["general"]["ctrlTitle"];
					$apiResultSet.find(".ctrlArray").append('<option value="' + key + '">' + ctrlTitle + '</option>');
				}
			});
			
		   var actionId = actionIndex ? actionIndex : "apiManageAction" + ezCommon.actionNameNum[ezCommon.formId];
		   var $actionHtml = ezCommon.getActionSetHtml(htmlStr);
		   //apiManageAction.bindEvent($apiResultSet);
		   
           $actionHtml.find(".apiInputParam").hover(function(){
           	    //alert($("#defaultList:visible").size());
           	    if($("#defaultList:visible").size() == 0){
           	    	var $rowThis = $(this);
				    addPananl($rowThis,"APIINPUTPARAM");
           	    }
           },function(){
           	   //$('span[aria-hidden="true"]', $(this)).hide();
           	   //alert("y");
           	   //$("#defaultList").hide();
           });
           
           $actionHtml.find(".actionWarp").append($apiResultSet);
		   $("#ctrlActionList").append($actionHtml);
		   
		   apiManageAction.bindEvent($actionHtml);
		  // $("#ctrlActionList").append();
		   ezCommon.actionClose($actionHtml);//删除整个动作
		   $actionHtml.attr({
			 "actionId" : actionId,
			// "actionId" : "apiManageAction",  
			 "actionType" : "apiManageAction"
		   }); 
		   $actionHtml.find(".actionTitle").text(apiName); //动作标题
		},
		json:function($actionObj) //根据动作对象生成动作Json
		{
			var actionId = $actionObj.attr("actionId"), ctrlJson = '',apiResultJson = [], 
			    ctrlName = '', dataType = 'constant', dataPath = '',desc = "", valueType = "";
			
			$actionObj.find(".row").each(function() {
				//api结果设置
				if($(this).hasClass("resultRow")){
					$this = $(this);
					ctrlName = $this.find(".ctrlArray").val();            //控件名称
                    dataType = $this.find(".fillVal").attr("datatype");	//数据来源方式
                    if(dataType == "apiResult"){
                    	dataPath = $this.find(".fillVal").attr("nodepath");	//如果来源方式为apiResult
                    	desc = $this.find(".fillVal").attr("desc");         //用于还原时用
                        apiResultJson.push('"'+ctrlName+'":{"dataType":"apiResult","value":"'+dataPath+'","desc":"'+desc+'"}');
                    }else{  //其它类型处理
                    	
                    }
				}
				else{ //输入参数
					var paramName = $(this).attr("paramName"), //获取参数名称
					$fill = $(this).find(".fillVal"), fillVal = $fill.val(); //获取参数值
					dataType = $fill.attr("datatype");  //如:form systemParam  
					valueType = $fill.attr("valuetype");  //比如:表单控件ID
					//判断控件值类型
					if (dataType != "constant") {
							ctrlJson += '"' + paramName + '":{"dataType":"' + dataType + '", "valueType" :"' + valueType + '", "value":"' + fillVal + '"},';
					} else {
						ctrlJson += '"' + paramName + '":{"dataType":"' + dataType + '","value":"' + fillVal + '"},';
					}
				}
				
			});
			ctrlJson = ctrlJson.substr(0, ctrlJson.length - 1);
            apiResultJson = apiResultJson.join(",");
            //alert("apiResultJson"+apiResultJson);
			if (ctrlJson == "")
				return ctrlJson;
			var ctrlActionJson = '"' + actionId + '":{"type":"apiManageAction","ctrl":{' + ctrlJson + '},"apiResultSet":{'+apiResultJson+'}}';
			//alert(ctrlActionJson);
			return ctrlActionJson;
		},
		restore:function(actionJson, actionName){
		  apiManageAction.action(actionName); //动作还原的结构,结构数据来自cc_api_Manage
		  /*******还原输入参数***********/
		 //初始化与还原输入参数个数是相同的,只要改变每个参数的属性即可.
		 $.each(actionJson.ctrl,function(k,v){
		 	var $fillVal = $(".inputParam[paramName='"+k+"']").find(".fillVal");
		 	$fillVal.attr({
		 		"datatype":v.dataType,
		 		"valuetype":v.valueType,
		 		"value":v.value
		 	});
		 });
		  
		  /****还原结果设置*****/
		 var $resultRow = $(".actionPanel[actionId='"+actionName+"']");
		 var $tmpRow;
		 $.each(actionJson.apiResultSet,function(k,v){
		   	  $tmpRow = $resultRow.find(".resultRow:first").clone(true);
		      $tmpRow.find(".ctrlArray").val(k); //设置下拉框值
		      $tmpRow.find(".fillVal").val(v.desc).attr({"datatype":v.dataType,"nodePath":v.value,"desc":v.desc}); //设置文本框值与属性 
		      $resultRow.find(".apiResultSet").append($tmpRow); //添加到父容器
		   }); 
		 $resultRow.find(".resultRow:first").remove();
		},
		//绑定api返回结果事件
		bindEvent:function($obj){
			$obj.find(".addNewCtrl").unbind("click").on("click", function(){
				var $cloneRow = $obj.find(".resultRow:first").clone(true);
				$obj.find(".resultRow:last").after($cloneRow);
				//apiManageAction.bindEvent($obj);//这一行如果不加,则新添加行事件无效
			});
			
			$obj.find(".resultSet-del").on("click",function(){
				if( $(".resultRow").size()>1 ){
					$(this).closest(".resultRow").remove();
				}
				else{
					alert("至少保留一行!");
				}
				
			});
			
			/* */
			$obj.find(".resultRow").hover(function() {
				var $rowThis = $(this);
				var value = $rowThis.find("select option:selected").attr("value");
				if(value != undefined)
				  value = value.replace(/\d/g, "");
				$('span[aria-hidden="true"]', $obj.find(".actionWarp>.row")).hide();
				$('span[aria-hidden="true"]', $rowThis).show();
				addPananl($rowThis.find("input"),value);
			}, function() {
				$('span[aria-hidden="true"]', $(this)).hide();
			}); 
		},
	};
	/**
	 * 当输入参数文本框获取焦点后
     * @param {Object} $obj  当前获取焦点的输入参数框
     * @param {Object} array 类型,如:APIINPUTPARAM
	 */
	function addPananl($obj, array) {
		require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/attribute/dataBase.js", function(e) {
			e.init(array, $obj, false);
		});
	}
	
	module.exports = apiManageAction;
});
