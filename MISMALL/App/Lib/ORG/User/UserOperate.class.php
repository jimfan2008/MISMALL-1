<?php
/*
 * function : 用户扩展类，对应用户数据库基础信息，注册一个用户
 * time : 201306280910
 *
 * */

importORG("User.Company");

class UserOperate {
	//添加用户登录信息
	public function addLoginInfo($user) {
		$data['userId'] = $user;
		$data['loginTime'] = date('Y-m-d H:i:s', time());
		$data['loginIP'] = gethostbyname($_ENV['COMPUTERNAME']); //当前登录用户IP

		$logininfoObj = D("logininfo");
		$log_id = $logininfoObj->add($data);
		unset($data, $logininfoObj);

		return $log_id;
	}

	//添加用户模板
	public function addUserTemp($user) {
		$data['user_Id'] = $user;
		$data['templete_Type'] = "modelType" . date('YnjGis', time());
		$data['templete_Name'] = "默认模版";
		$frmtmpObj = D("form_usertemplete_type");
		$md_id = $frmtmpObj->add($data);
		unset($data, $frmtmpObj);

		return $md_id;
	}

	//判断注册用户名是否已经存在
	public function checkUserName($name) {
		$userObj = D("users");
		$user = $userObj->where("userName='$name'")->field("userName")->find();
		unset($userObj);

		return $user ? true : false;
	}

	//判断注册邮箱是否已经存在
	public function checkUserEmail($email) {
		$userObj = D("users");
		$user = $userObj->where("userEmail='$email'")->field("userName")->find();
		unset($userObj);

		return $user ? true : false;
	}

	//激活用户邮箱
	public function activeUserEmail($userName) {
		$userObj = D("users");
		$data['IsActivated'] = 1;
		$res = $userObj->where("userName='$userName'")->save($data);
		unset($data, $userObj);

		return $res;
	}

	//修改忘记密码
	public function updataPassword($updatapwd, $userId) {
		$userObj = D("users");
		$data['userPwd'] = $updatapwd;
		$userData = $userObj->where("ID='$userId'")->save($data);
		unset($data, $userObj);
		return $userData;
	}

	/**
	 * 用户登录
	 * @param string $user_name 用户名
	 * @param string $user_pwd　用户密码
	 * @return array
	 */
	public function userLogin($user_name, $user_pwd) {
		$userObj = D("User");
		$condition = "userName='$user_name' and userPwd='" . md5($user_pwd) . "'";
		$userInfo = $userObj->getUser($condition);

		if ($userInfo) {
			//如果用户使用二级域名登录,则还要验证用户是否有权登录二级域名
			if (defined('SUB_DOMAIN')) {
				$companyInfo = Company::getInfoBySubDomain(SUB_DOMAIN);
				//用户ID不等公司创建者ID，则可能是邀请用户
				if ($companyInfo['userId'] != $userInfo['ID']) {
					$companyUsers = Company::getUsersBysubDomain(SUB_DOMAIN);
					//不能使用二级域名登录
					if (!$companyUsers || !in_array($userInfo['ID'], $companyUsers)) {
						return false;
					}
				}
			} else {
				$companyInfo = Company::getInfoByUserId($userInfo['ID']);

				//用户没有部署过应用,则可能是邀请用户,查邀请的域名
				if (!$companyInfo) {
					$companyInfo = Company::getInfoByAppUserId($userInfo['ID']);
				}
			}

			//如果返回的数组有值
			$this->addLoginInfo($userInfo['ID']);
			$sess_data = array(
				'uid' => $userInfo['ID'],
				'uname' => $userInfo['userName'],
				'uemail' => $userInfo['userEmail'],
				'company' => $companyInfo,
			);

			$this->setSession($sess_data);

			unset($userInfo['userPwd']);
			return $userInfo;
		} else {
			return false;
		}

	}

	/**
	 * 设置用户登录session
	 * @param array|string $session_data
	 */
	public function setSession($session_data) {
		//获取cookie中的session_id
		$sess_id = $_COOKIE[C('SESSION_COOKIE_NAME')];

		//子域名
		if (isset($session_data['company']) && isset($session_data['company']['domain']) && $session_data['company']['domain']) {
			$domainArr = explode('.', HTTP_HOST);
			if ($domainArr[0] == 'www') {
				$domainArr[0] = $session_data['company']['domain'];
			} elseif (!defined('SUB_DOMAIN')) {
				array_unshift($domainArr, $session_data['company']['domain']);
			}
			$session_data['company']['sub_domain'] = 'http://' . join('.', $domainArr);
		}
		//TODO全部保存session
		foreach ($session_data as $sess_key => $sess_val) {
			$_SESSION[$sess_key] = $sess_val;
		}
	}

	/**
	 * 获取用户SESSION
	 */
	public function getSessionInfo() {
		if (isset($_SESSION['uid']) && $_SESSION['uid'] != '') {
			$userInfo = array(
				'uid' => $_SESSION['uid'],
				'uname' => isset($_SESSION['uname']) && $_SESSION['uname'] ? $_SESSION['uname'] : null,
				'company' => isset($_SESSION['company']) && $_SESSION['company'] ? $_SESSION['company'] : null,
			);
			return $userInfo;
		} else {
			return false;
		}
	}

	/**
	 * 检验是否登录
	 */
	public function isLogind() {
		$userInfo = $this->getSessionInfo();
		if ($userInfo && $userInfo['uid']) {
			return true;
		}
		return false;
	}

	/**
	 * 登出
	 */
	public function logout() {
		unset($_SESSION);
		session_destroy();

		$sess_id = $_COOKIE[C('SESSION_COOKIE_NAME')];
		$sessObj = D('session');
		$sessObj->where(array('session_id' => $sess_id))->delete();

		//设置统一cookie
		setcookie(C('SESSION_COOKIE_NAME'), '', time() - 1, "/", Company::getCookieDomain());
		//TODO server http_host获取不到域名，暂时设置双cookie
		if (HTTP_HOST == '10.28.5.37') {
			setcookie(C('SESSION_COOKIE_NAME'), '', time() - 1, "/", '.cycc.biz');
		}
	}

}
?>