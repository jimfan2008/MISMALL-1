/**
 * @author pzh 2014-11-6
 * ezQ文件加载器(在微信端使用)
 * 所有模块都通过 define 来定义
 * @param require 引入依赖其他js
 * @parma exports 对外提供接口
 * @param module 模块  提供整个接口
 */

define(function(require, exports, module) {
	//加载jquery包--先引入jquery包
	//加载编辑页面
	/*require.async("bootstrap-switch");
    require.async("bootstrap",function() {
    	require("datetimepicker");
    	require("datetimelang");
    });*/
  //  require.async("validator");
 //require.async("ImagePreview");
	//require.async("jqueryUI");
	//require.async("formResolve.base",function(){
	//	require("formResolve.apply");
		
	//});
	require("./index.js?h=7");
});
