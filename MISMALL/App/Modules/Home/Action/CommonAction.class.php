<?php

/**
 * 通用控制器，直接继承控制器
 * 封装各控制器通用方法
 */
class CommonAction extends Action {

	/**
	 * 初始化方法
	 */
	function _initialize() {
		// 检查认证识别号，判断用户登录
		/*
		if ('login' != strtolower(ACTION_NAME) && 'userlogin' != strtolower(ACTION_NAME)) {
					if (!I('session.uid', 0)) {
						redirect(__GROUP__ . '/Public/login');
					}
				}*/
		
	}
	
	/**
	 * 模块首页
	 */
	function index() {
		$this -> display();
	}

}
?>