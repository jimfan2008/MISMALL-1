/**
 * MISMALL平台开发
 * 处理控件开发过程步骤效果
 * 保存表单数据，表单验证
 * @author 皮振华
 */
$(function() {
             var formDataSubmit ="";
             //上一步下一步操作事件
            $(".btn-operation").click(function() {
                           var $that = $(this);
                           var layer = $that.attr("layer");
                           if(layer) {
                                        var isNext = $that.attr("next") == "next" ? true : false;
                                        var isJump = true;
                                        if(isNext) {
                                                     var $box = $that.parents(".setArea");
                                                     isJump = formDataSubmit.ajaxSubmit($box);
                                       }
                                        if(isJump) {
                                                     $(".setArea").removeClass("selectedSetting");
                                                     var $selected = $("#"+layer);
                                                     if($selected.length) {
                                                                  $("#"+layer).addClass("selectedSetting");
                                                                  var index = $selected.index();
                                                                  index = 2*index  - 1;
                                                                  $(".steps").find("p").removeClass("complete");
                                                                  $(".steps").find("p:lt("+index+")").addClass("complete");
                                                     }
                                        }
                        }
             });
            //控件列表事件
            $("#ctrlList").find(".conItem").click(function() {
                         var $that = $(this);
                         $("#ctrlList").find(".conItem").removeClass("conSelectItem");
                         $that.addClass("conSelectItem");
                         var id = $that.attr("value");
                         var formId = $("#main").attr("formId");
                         if(id != "" && formId != id) {
                                     var data = {"id":  id};
                                      _commonAjax({
                                                    type : "POST",
                                                    url : ROOTPATH+"/Qywx/Develop/getCtrlInfo",
                                                    data : data,
                                                    success : function(result) {
                                                                if(result) {
                                                                            ctrlDataFillForm(result);
                                                                }
                                                    },
                                                    error : function(result) {
                                                        alert(result);
                                                    }
                                        });
                         }
                        
            });
            //数据填充表单
            function ctrlDataFillForm(ctrlData) {
                        $.each(ctrlData,  function(name, val) {
                                    var $ctrl = $("#"+name);
                                    if(name == "id") {
                                                $("#main").attr("formId",ctrlData["id"]);
                                    } else if(name == "imgUpload") {
                                                $ctrl.attr("src", val).show();
                                    } else if(name == "dataField") {
                                                val == 1 ? $ctrl.prop("checked", true) : $ctrl.prop("checked",false)
                                    } else if(name == "ctrlSteps") {
                                                var eq = parseInt(val);
                                                var index = (eq + 1) * 2 - 1;
                                                 $(".setArea").removeClass("selectedSetting");
                                                 $("#main").find(".setArea:eq("+eq+")").addClass("selectedSetting");
                                                 $(".steps").find("p").removeClass("complete");
                                                 $(".steps").find("p:lt("+index+")").addClass("complete");
                                    }else {
                                                $ctrl.val(val);
                                    }
                        })
            }
              //图标上传
              $("#imgFile").bind("change",function() {
                           ajaxFileUpload();
              });
              function ajaxFileUpload() {
                            $(".upLoadIcon").ajaxStart(function() {
                                        $(this).hide();
                            // 文件上传完成将图片隐藏起来
                            }).ajaxComplete(function() {
                                        $(this).show();
                            });
                            var elementIds=["imgFile"]; //flag为id、name属性名
                            $.ajaxFileUpload({
                                        url: ROOTPATH + "/Apps/WechatPublic/ajaxUpload", 
                                        type: 'post',
                                        secureuri: false, //一般设置为false
                                        fileElementId: 'imgFile', // 上传文件的id、name属性名
                                        dataType: 'json', //返回值类型，一般设置为json、application/json
                                        elementIds: elementIds, //传递参数到服务器
                                        success: function(data, status){  
                                                     var img = data["image"];
                                                     $("#imgUpload").attr("src",img).show();
                                        },
                                        error: function(data, status, e){ 
                                                     console.log(e);
                                        }
                            });
             }
              //数据提交
              formDataSubmit = {

              ajaxSubmit : function($box) {
                           var isJump = true, jsonData = "";
                           if($box.length > 0) {
                                        var $controls = $box.find(".f-con");
                                        var isValidation = formDataSubmit.validationControlVal($controls);
                                        if(isValidation) {
                                                    var  jsonData = formDataSubmit.getFormJSON($controls);
                                                    console.log(JSON.stringify(jsonData));
                                                    return false;
                                                    if(jsonData["isBool"]) {
                                                                var formData = jsonData["formData"];
                                                                var formId = $("#main").attr("formId");
                                                                var boxId = $box.attr("id"), funName = "addCtrlData";
                                                                formData["state"] = 1;
                                                                formData["operation"] = boxId;
                                                                formData["formId"] = formId ? formId : 0;
                                                                formData["ctrlSteps"] = $("#main").find(".selectedSetting").index();
                                                                if(formId > 0) {
                                                                        funName = "updateCtrlData"
                                                                }
                                                                _commonAjax({
                                                                        type : "POST",
                                                                        url : ROOTPATH+"/Qywx/Develop/" + funName,
                                                                        data : formData,
                                                                        async : false,
                                                                        success : function(result) {
                                                                                    if(result) {
                                                                                            if(funName == "addCtrlData") {
                                                                                                        $("#main").attr("formId", result);
                                                                                            }
                                                                                    } else {
                                                                                            isJump = false;
                                                                                    }
                                                                                    
                                                                        },
                                                                        error : function(result) {
                                                                                     isJump = false;
                                                                                    alert(result);
                                                                        }
                                                                })
                                                    }
                                        }
                           }
                           return isJump;
              },
              //获取表单JSON数据
              getFormJSON : function($controls) {
                            var jsonData = "", isBool = true, val = "", len = $controls.length;
                            $.each($controls, function(index) {
                                        var $ctrl = $(this);
                                        var ctrlName = $ctrl.attr("id");
                                        if(ctrlName && ctrlName != "") {
                                                    var ctrlTagName = $ctrl[0].tagName;
                                                    var ctrlType = $ctrl[0].type;
                                                    console.log(ctrlTagName);
                                                    if(ctrlTagName == "INPUT") {
                                                                if(ctrlType == "checkbox") {
                                                                        val = $ctrl.is(":checked") ? 1 : 0;
                                                                } else {
                                                                        val = $.trim($ctrl.val());
                                                                }
                                                    } else if(ctrlTagName == "IMG") {
                                                            val = $ctrl.attr("src");
                                                    } else if(ctrlTagName == "TEXTAREA") {
                                                            val = $ctrl.val();
                                                            val = html_encode(val);
                                                    }
                                        } else{
                                            console.log("控件没有设置ID");return false;
                                        }
                                        isBool = formDataSubmit.validationControlVal(val, ctrlTagName, ctrlName);
                                        jsonData += '"' + ctrlName+'":"' + val + '"';
                                        if (!isBool) return false;
                                        if(index + 1 < len)  jsonData += ',';
                          });
                            if(jsonData != "") {
                                    jsonData = "{" + jsonData + "}";
                                    jsonData = JSON.parse(jsonData);
                            }
                           jsonData = {"isBool" : '"' + isBool + '"', "formData" : jsonData};
                           return jsonData;

            },
            //验证控件
            validationControlVal : function(val, ctrlType, ctrlName) {
                        var isBool = true;
                        if(ctrlName != "ctrlCSS") {

                        }
                        switch(val) {
                                    case "":
                                    case null:
                                                isBool = false;
                                                alert(formDataSubmit.controlError[ctrlName]);
                                        break;
                        }
                         return isBool;
                        
            },
            //错误提示
            controlError : {
                            "ctrlName" : "控件名不能为空",
                            "imgUpload" : "请上传图片",
                            "ctrlHTML" : "控件结构不能为空",
            }
        }
});
