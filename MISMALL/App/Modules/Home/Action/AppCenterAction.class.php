<?php
class AppCenterAction extends HomeAction
{
	public function index()
	{
		$this->uname = session('uname');
		$this->display();
	}
	
	/**
	 * 初始化应用工厂方法
	 * @return	bool
	 */
	public function initFactory() {
		$proNum = D('Project') -> getUserProjects();

		$pro_name = '初始项目';

		if (!$proNum) {
			echo D('Project') -> addAProject($pro_name);
		}
	}
	
	
}