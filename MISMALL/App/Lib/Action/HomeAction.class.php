<?php
/**
 * 前端总控制器
 *
 * @author cjli
 *
 */
class HomeAction extends BaseAction {
	/**
	 * 前端初始化
	 */
	protected function _initialize() {
		parent::_initialize();

		//如果session丢失用户cookie重建
		if (cookie("user_id") && !(session('uid') && session('uname'))) {
			$user_id = intval(cookie("user_id"));
			if ($user_id) {
				//获取用户信息
				importORG('User.UserBase');
				$userBase = new UserBase();
				$userInfo = $userBase->getUserInfo(array('user_id' => $user_id));
				if ($userInfo) {
					D('User')->setSession($userInfo);
				}
			}
		}
	}

	/**
	 * 获取session用户信息
	 * @return array
	 */
	protected function getUserInfo() {
		$user_id = session('uid');
		if ($user_id) {
			$userInfo = D('User')->getAUser(array('user_id' => $user_id));
		}

		return isset($userInfo) ? $userInfo : 0;
	}

}