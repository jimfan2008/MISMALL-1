/**
 * 数据筛选器
 * 后台数据交接，请求数据，接收数据
 * @author   皮振华
 */
var  filterDataOperation = {
        //获取数据源列表
        getAllQueryDataSources : function() {
                var data = {"siteId" : SITECONFIG.SITEID}, dataSources = "";
                _commonAjax({
                        type : "POST",
                        url : SITECONFIG.ROOTPATH+"/Qywx/Query/getAllQueryDataSources",
                        data : data,
                        async : false,
                        success : function(result) {
                                   dataSources = result;
                                   console.log(JSON.stringify(dataSources),"成功");
                        },
                        error : function(result) {
                                console.log(result,"失败");
                        }
                });
                return dataSources;
        },
        //获取表单列表
        getAllFormList : function() {
                var data = {"siteId" : SITECONFIG.SITEID}, formList = "";
                _commonAjax({
                        type : "POST",
                        url : SITECONFIG.ROOTPATH+"/Qywx/Query/getAllTables",
                        data : data,
                        async : false,
                        success : function(result) {
                                formList = result;
                        },
                        error : function(result) {
                                console.log(result);
                        }
                });
                return formList;
        },        
        //查询表单对应的所有字段--检测多表是否有关联性
        getFormAllField : function(formJson) {
                    var jsonData = [];
                     //var data = {"siteId" : SITECONFIG.SITEID,"tables": formJson,"isQueryData":1}, formList = "";
                    var data = {"siteId" : SITECONFIG.SITEID,"tables": formJson}, formList = "";
                    _commonAjax({
                                type : "POST",
                                url : SITECONFIG.ROOTPATH+"/Qywx/Query/queryMultiTableData",
                                data : data,
                                async : false,
                                success : function(result) {
                                            var data = result["fieldsTile"];
                                            $.each(formJson, function(formK,val) {
                                                    var formId = val["formId"], formName = val["formName"],tableName = val["tableName"];
                                                    jsonData.push({"formId":formId,"tableName":tableName,"formName":formName});
                                                    jsonData[formK]["fields"] = [];
                                                    $.each(data, function(key, val) {
                                                             var id = val["id"], fieldId = val["fieldAlias"], fieldName = val["fieldTitle"];
                                                             var fieldJson = [];
                                                            if(formId == id) {
                                                                     jsonData[formK]["fields"].push({"fieldId":fieldId,"fieldName":fieldName});
                                                            }
                                                    });
                                            });
                                },
                                error : function(result) {
                                        alert(result);
                                }
                    });
                  
                    return jsonData;
        },
        //获取数据源结果
        getDataSourcesResult : function(formJson) {
                    var jsonData = [];
                    var data = {"siteId" : SITECONFIG.SITEID,"tables": formJson,"isQueryData":1}, formList = "";
                    _commonAjax({
                                type : "POST",
                                url : SITECONFIG.ROOTPATH+"/Qywx/Query/queryMultiTableData",
                                data : data,
                                async : false,
                                success : function(result) {
                                           jsonData = result["queryData"];
                                },
                                error : function(result) {
                                        alert(result);
                                }
                    });
                    return jsonData;
        },
        //保存数据源
        saveQuerier : function(querierName, querierConfig,$selectDataId) {
                var jsonData = [];
                var data = {"siteId" : SITECONFIG.SITEID,"querierConfig": querierConfig,"querierName":querierName,"querierId":$selectDataId};
                console.log(JSON.stringify(data));
                _commonAjax({
                            type : "POST",
                            url : SITECONFIG.ROOTPATH+"/Qywx/Query/saveQuerier",
                            data : data,
                            async : false,
                            success : function(result) {
                                      console.log(result);
                            },
                            error : function(result) {
                                    alert(result);
                            }
                });
        
        }
}
