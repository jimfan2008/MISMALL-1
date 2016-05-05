/**
 * @description 验证属性设置
 * @author cjli
 * @date 2015-06-29
 */

define(function(require, exports, module) {

	var formJson = require("../formJson.js");

	var validate = {
		validate : function(ctrl) {
			if(!ctrl)return;
			ezCommon.deBug("加载[" + ctrl.cName + "]控件validate属性设置文件", "public/Js/Qywx/attribute/validate", 10);
			var selectObj = $("body").find(".ctrlSelected");
			var ctrlName = selectObj.attr("ctrlId"), attrType = "validate";
			setBootstrapSwitch("isQequired", function(event, state) {
				var isqequired = "isqequired";
				selectObj.find(".qequire").remove();
				formJson.update(ctrlName, attrType, isqequired, "@default@");
				if (state == true) {
					selectObj.find(".fieldTitle").append("<span class='qequire'>*</span>");
					formJson.update(ctrlName, attrType, isqequired, 1);
					$("#minLength,#maxLength").parent().show();
					//最短字符
					$("#minLength,#maxLength").numeral();
					//  只能输入数字
					onValueChange($("#minLength")[0], function() {
						var minLength = "minLength";
						var minLengthVal = $("#minLength").val();
						formJson.update(ctrlName, attrType, minLength, minLengthVal);
					});
					//最长字符
					onValueChange($("#maxLength")[0], function() {
						var maxLength = "maxLength";
						var maxLengthVal = $("#maxLength").val();
						formJson.update(ctrlName, attrType, maxLength, maxLengthVal);
					});
				} else {
					var maxLength = "maxLength";
					var minLength = "minLength";
					var maxLengthVal = $("#maxLength").val();
					var minLengthVal = $("#minLength").val();
					$("#minLength,#maxLength").parent().hide();
					$("#minLength").val("");
					$("#maxLength").val("");
					formJson.update(ctrlName, attrType, maxLength, maxLengthVal);
					formJson.update(ctrlName, attrType, minLength, minLengthVal);
				}
			});

			//唯一性
			$("[name='unIqueness']").bootstrapSwitch().on('switchChange.bootstrapSwitch', function(evet, state) {
				var uniqueness = "uniqueness";
				if (state == true) {
					selectObj.find("input").attr("uniqueness", true);
				} else {
					selectObj.find("input").attr("uniqueness", false);
				}
				formJson.update(ctrlName, attrType, uniqueness, state == true ? 1 : "@default@");
			});

			//文本格式
			$("#textFormat").change(function() {
				var textFormatValue = $(this).val();
				var textFormat = "textFormat";
				formJson.update(ctrlName, attrType, textFormat, textFormatValue);
			});
            //多表关联
            var tableFormId=null;
			$("#selectTable").change(function() {
				var $selectForm = $("#selectTable").find("option:selected"), 
				formId = $selectForm.attr("queryId");
				tableFormId=formId;
				if(tableFormId==undefined){
					$("#selectCtrl").change();
				}
			});
			$("#selectCtrl").change(function() {
				var selectTableCtrl = 'selectTableCtrl';
				var $selectField = $("#selectCtrl").find("option:selected"), 
				ctrlId=$selectField.attr("field"),
				fieldName = {"formId": tableFormId,"ctrlId": ctrlId};
			    formJson.update(ctrlName, attrType, selectTableCtrl, fieldName);
			    //ezCommon.tableRelationJson[ezCommon.formId+"-"+tableFormId] = ezCommon.formId+":" + ctrlName + "-" + tableFormId + ":" + ctrlId;
			    
			   // console.log(ezCommon.tableRelationJson);
			    if(tableFormId==undefined){
			    	var fieldStr = null;
				    fieldStr += '<option value="text">请选择字段</option>';
				    $("#selectCtrl").find("option:not(:first)").remove();
				}
			   
			});
			//根据下拉框选择的不同格式学初始化不同的时间面板 @dateFormatValue 日期格式 @status当前状态

			var getDateFormatByDDp = function(dateFormatValue, status) {
				switch(status) {
					case "1":
						minView = 1, startView = 4, maxView = 4;
						break;
					case "2":
						minView = 2, startView = 4, maxView = 4;
						break;
					case "3":
						minView = 3, startView = 4, maxView = 4;
						break;
					case "4":
						minView = 4, startView = 4, maxView = 4;
						break;
					case "5":
						minView = 0, startView = 0, maxView = 0;
						break;
					//case "0":
					//case "6":
					default:
						minView = 0, startView = 4, maxView = 4;
						break;

				}
				var timeFormat = {
					format : dateFormatValue,
					minView : minView,
					startView : startView,
					maxView : maxView,

				};
				return timeFormat;
			};
			require.async(SITECONFIG.PUBLICPATH + "/Js/datetimepicker/js/bootstrap-datetimepicker.min.js", function() {
				//日期格式
				$("#dateFormat").change(function() {
					var dateFormatValue = $(this).val(), status = $(this).find("option:selected").attr("status");
					//这里是属性框中的日期格式的值
					var timeFormat = getDateFormatByDDp(dateFormatValue, status);
					var dateFormat = "dateFormat";
					var startTime = $("#startTime").find("input").val();
					var endTime = $("#endTime").find("input").val();
					$("#endTime,#startTime").datetimepicker('remove').datetimepicker({
						language : "zh-CN", //汉化
						weekStart : 1,
						todayBtn : 1,
						autoclose : 1,
						format : timeFormat.format,
						todayHighlight : 1,
						startView : timeFormat.startView,
						minView : timeFormat.minView,
						maxView : timeFormat.maxView,
						forceParse : 0
					});
					$("[name='" + ctrlName + "']").parents(".ctrlWraper").find('.form_date').datetimepicker('remove').datetimepicker({
						language : "zh-CN", //汉化
						weekStart : 1,
						todayBtn : 1,
						autoclose : 1,
						format : timeFormat.format,
						startDate : startTime ? startTime : false,
						endDate : endTime ? endTime : false,
						todayHighlight : 1,
						startView : timeFormat.startView,
						minView : timeFormat.minView,
						maxView : timeFormat.maxView,
						forceParse : 0
					});
					require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/formJson.js", function(e) {
						//	e.writeJson(nodeMenu, $selectWxMenu, formTitle);
						e.update(ctrlName, attrType, dateFormat, timeFormat);
					});

				});

				// 起止时间，结束时间
				var dateSet = function(obj, attrType, timeType) {
					var param = {
						language : "zh-CN",
						weekStart : 1,
						todayBtn : 1,
						autoclose : 1,
						todayHighlight : 1
					};
					obj.datetimepicker(param).on("changeDate", function() {
						var timeVal = obj.find("input").val();
						var dateFormatValue = $("#dateFormat").val();
						var startTime = $("#startTime").find("input").val();
						var endTime = $("#endTime").find("input").val();
						$("[name='" + ctrlName + "']").parents(".ctrlWraper").find('.form_date').datetimepicker('remove').datetimepicker({
							language : "zh-CN", //汉化
							weekStart : 1,
							todayBtn : 1,
							autoclose : 1,
							format : dateFormatValue ? dateFormatValue : false,
							startDate : startTime ? startTime : false,
							endDate : endTime ? endTime : false,
							todayHighlight : 1,
							startView : 2,
							minView : 2,
							forceParse : 0
						});
						require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/formJson.js", function(e) {
							e.update(ctrlName, attrType, timeType, timeVal);
						});

					});
				};
				dateSet($('#startTime'), attrType, "startTime");
				dateSet($('#endTime'), attrType, "endTime");
				
			});
			
		}
		
	};
	/**
	 * @desc 设置属性滑动开关
	 * @param String name
	 * @param Function func
	 */
	function setBootstrapSwitch(name, func) {
		$("[name='" + name + "']").bootstrapSwitch().on('switchChange.bootstrapSwitch', func);
	}
	module.exports = validate;
});
