/**
 * @author pzh 2014-3-3
 * ezQ设计器页文件加载器
 * 所有模块都通过 define 来定义
 * @param require 引入依赖其他js
 * @parma exports 对外提供接口
 * @param module 模块  提供整个接口
 */
define(function(require, exports, module) {
	require("bootstrap");
	require.async("jquery-ui-bootstrap-v0.5/assets/js/jquery-ui-1.10.0.custom.min.js", function() {
		require.async("./events/editorEvent.js");
		require.async("./events/ctrlEvent.js");
		require.async("./events/compEvent.js");
	});
	
});
