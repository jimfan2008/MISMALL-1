<?php
/**
 * 公共操作控制器
 *
 * @author cjli
 *
 */
class PublicAction extends BaseAction {
	/**
	 * 登录页面
	 */
	public function login() {
		$this->display();
	}

	public function ajaxLogin() {
		$user_name = trim($_POST['user_name']); //用户名或者用户邮箱
		$password = trim($_POST['password']);

		$result = array(
			'status' => 0,
			'message' => '',
		);

		import('ORG.Util.Validate');

		if (!Validate::check($user_name, 'username')) //验证用户名
		{
			$result['message'] = L('account_format_error');
		} elseif (!Validate::check($password, 'password')) //验证密码格式
		{
			$result['message'] = L('password_format_error');
		} else {
			$admin_user_model = D('AdminUser');
			//用户登录验证
			if ($userInfo = $admin_user_model->login($user_name, $password)) {
				//设置session
				session('admin_user_auth', array('username' => $userInfo['username'], 'uid' => $userInfo['uid'], 'nickname' => $userInfo['nickname']));
				$result['status'] = 1;
			} else {
				$result['message'] = $admin_user_model->getError();
			}
		}
		echo json_encode($result);
	}

	/**
	 * 登出
	 */
	public function logout() {
		session('admin_user_auth', NULL);
		redirect(U('Home/Index/index'));
	}

	/**
	 * 验证码
	 */
	public function verify() {

	}

	public function clearcache() {
		$dirname = RUNTIME_PATH;
		$this->rmdirr($dirname);
		@mkdir($dirname, 0777, true);
		echo "<div style='border:2px solid green; background:#f1f1f1; padding:20px;margin:20px;width:800px;font-weight:bold;color:green;text-align:center;'>\"" . $value . "\" have been cleaned clear! </div> <br /><br />";
	}

	public function rmdirr($dirname) {
		if (!file_exists($dirname)) {
			return false;
		}
		if (is_file($dirname) || is_link($dirname)) {
			return unlink($dirname);
		}
		$dir = dir($dirname);
		if ($dir) {
			while (false !== $entry = $dir->read()) {
				if ($entry == '.' || $entry == '..') {
					continue;
				}
				$this->rmdirr($dirname . DIRECTORY_SEPARATOR . $entry);
			}
		}
		$dir->close();
		return rmdir($dirname);
	}
}