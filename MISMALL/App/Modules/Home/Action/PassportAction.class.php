<?php
/**
 * 用户帐户信息操作
 *
 * @author cjli
 *
 */
class PassportAction extends HomeAction {

	/**
	 * 修改密码
	 */
	public function editInfo($id, $me) {

		$email = trim(base64_decode(I('id')));
		$subTime = intval(base64_decode(I('me')));

		$expireTime = 20 * 60;

		$interval = time() - $subTime;
		$flag = ($interval < $expireTime) ? 1 : 0;
		if ($flag) {
			$post['email'] = trim($email);
			importORG('User.UserBase');
			$userBase = new UserBase();
			$userInfo = $userBase->getUserInfo($post);

			if ($userInfo) {
				$isActive = 2;
				$this->assign('findemail', $email);
				$this->assign('isActive', $isActive);
				$this->display('Index:index');
			}
		} else {
			echo "链接已经失效，请重新找回密码";
		}
	}

	/**
	 * 找回密码
	 */
	public function findPassword() {
		$result['status'] = 0;
		$email = I('post.email', '', 'trim');
		$time = base64_encode(time());
		$mail = base64_encode($email);
		$link = DOMAIN_NAME . "/Passport/editInfo/id/" . $mail . "/me/" . $time . "/";
		$subject = "巧捷万端用户密码找回邮件";
		$body = '<div style = "width:700px;height:300px;border:1px solid #ccc;">
			<div style = "width:700px;height:70px;background:#7BB1BE;">
				<img src = ' . DOMAIN_NAME . '"/public/App/Home/Home/images/logo.jpg">
			</div>
			<p style = "padding:2px 10px">
				尊敬的<a href="mailto:' . $email . '" style="margin:0 5px; text-decoration:underline; color:#1D6778;" target="_blank">' . $email . '</a>用户,您好!
			</p>
			<p style = "text-indent: 35px;line-height:25px;padding:2px 5px">
				您正在使用巧捷万端(<a href = "' . DOMAIN_NAME . '">' . SERVER_NAME . '</a>)找回密码功能。您可以点击以下链接,重置您的密码:
			</p>
			<p style = "text-indent: 35px;line-height:25px;padding:2px 10px">
				<a href = "' . $link . '" style="margin:0 5px; text-decoration:underline; color:#1D6778;" target="_blank">' . $link . '</a>
			</p>
			<div style = "border-bottom:1px dashed #aaa"></div>
			<p style = "text-indent: 35px;line-height:25px;padding:2px 10px">
				本链接20分钟内有效果。如果有任何疑问,请拨打我们的客服电话:18002599238
			</p>
		</div>';

		$flag = sendEmail($email, $subject, $body);

		if ($flag) {
			$result['status'] = 1;
		}

		echo json_encode($result);

	}

	/**
	 * ajax检测邮箱激活状态
	 *
	 */
	public function ajaxIsActived() {

		$result = array(
			'status' => 2,
			'message' => "",
		);
		$post['email'] = trim(I('email'));
		importORG('User.UserBase');
		$userBase = new UserBase();

		$userInfo = $userBase->getUserInfo($post);

		if ($userInfo) {
			$result['status'] = $userInfo['isActivated'];
			if ($result['status'] == 0) {

			}
		} else {
			$result['message'] = $userBase->getError();
		}

		echo json_encode($result);

	}
	/**
	 * ajax用户登录验证
	 */
	public function ajaxLogin() {

		$user_email = trim($_POST['email']); //用户名或者用户邮箱
		$password = trim($_POST['password']);
		$rememberLogin = intval($_POST['checked']);

		$result = array(
			'status' => 0,
			'message' => '',
		);

		import('ORG.Util.Validate');
		if (!Validate::check($user_email, 'email'))
		//if( ! Validate::check($user_email, 'email') && ! Validate::check($user_email, 'username'))   //验证邮箱格式
		{
			$result['message'] = L('email_format_error');
		} elseif (!Validate::check($password, 'password')) //验证密码格式
		{
			$result['message'] = L('password_format_error');
		} else {
			importORG('User.UserBase');
			$userBase = new UserBase();
			//用户登录验证
			if ($userInfo = $userBase->login($user_email, $password)) {

				//设置session
				$this->_setSession($userInfo['ID'], $rememberLogin);

				//验证用户是否创建过站点
				$userSite = D("user_site_list");
				$map = array(
					'userId' => $userInfo['ID'],
					'modelId' => array('gt', 0),
				);
				$site_count = $userSite->where($map)->count();
				
				//print_r($userInfo);
				$result['status'] = $site_count ? 2 : 1;
				$result['message'] = $userInfo['userName'];
				$result['lastStatus']  = $userInfo['lastStatus'];//上次登录的状态
			} else {
				$result['message'] = $userBase->getError();
			}
		}
		echo json_encode($result);
	}

	/**
	 * ajax用户注册
	 */
	public function ajaxRegister() {
		$username = trim($_POST['username']); //用户名
		$user_email = trim($_POST['email']); //用户邮箱
		$password = trim($_POST['password']);
		$password_confirm = trim($_POST['password_confirm']);
		
		//处理邀请码
		$shareCode = I("post.sharecode","", "trim");
		$parentId="";
		
		if(isset($shareCode)){
			//if(is_numeric($shareCode)){
				$parentId = $shareCode/C("shareCode");
			
		}
		
		$result = array(
			'status' => 0,
			'message' => '',
			'verification' => '',
		);

		import('ORG.Util.Validate');

		/* if( ! Validate::check($username, 'username') ) //验证用户名格式
		{
		$result['message'] = L('account_format_error');
		$result['verification'] = 'username';
		}
		else*/
		if (!Validate::check($user_email, 'email')) //验证邮箱格式
		{
			$result['message'] = L('email_format_error');
			$result['verification'] = 'email';
		} elseif (!Validate::check($password, 'password')) //验证密码格式
		{
			$result['message'] = L('password_format_error');
			$result['verification'] = 'password';
		}
		
		elseif( ! Validate::check($password, $password_confirm, 'equal')) //验证密码是否相等
		{
		$result['message'] = L('password_equal_error');
		$result['verification'] = 'equal';
		}

		else {
			importORG('User.UserBase');
			$userBase = new UserBase();
			//用户注册验证
			if ($user_id = $userBase->register($user_email, $password,"",$parentId)) {

				//设置session
				//$this->_setSession($user_id, $cookie);
				//发送激活邮件
				$flag = $this->sendActiveMsg($user_email);
				if ($flag) {$result['status'] = 1;}

			} else {
				$result['message'] = $userBase->getError();
			}
		}
		echo json_encode($result);
	}

	/**
	 * 验证是否登录
	 */
	public function isLogin() {
		echo (boolean) $this->getUserInfo();
	}

	/*
	 * 激活应用和用户
	 * */
	public function userAppActive($mail, $time, $pid) {

		$email = trim(base64_decode(I('mail')));
		$subTime = intval(base64_decode(I('time')));
		$pid = intval(base64_decode(I('pid')));

		$expireTime = 24 * 3600;

		$interval = time() - $subTime;
		$flag = ($interval < $expireTime) ? 1 : 0;
		if ($flag) {

			$post['email'] = trim($email);
			importORG('User.UserBase');
			$userBase = new UserBase();
			$userInfo = $userBase->getUserInfo($post);

			if ($userInfo) {

				if ($userInfo['isActivated'] == 0) {
					$data['isActivated'] = 1;
					$activeFlag = $userBase->edit($userInfo['ID'], $data);

					if (count($activeFlag)) {
						$userAppObj = M("app_users");
						$uCondition = array(
							'appID' => $pid,
							'userID' => $userInfo["ID"],
						);
						$udata = array(

							'isActive' => 1,
						);
						$userAppObj->where($uCondition)->save($udata);
						$userInfo = $userBase->getUserInfo($post);
						if ($userInfo['isActivated'] == 1) {
							$isActive = 1;
							$this->assign('isActive', $isActive);
							$this->display('Index:index');
						}
					} else {
						echo $email . "激活失败，请重新激活。";
					}
				} else {
					$userAppObj = M("app_users");
					$uCondition = array(
						'appID' => $pid,
						'userID' => $userInfo["ID"],
					);
					$udata = array(

						'isActive' => 1,
					);
					$userAppObj->where($uCondition)->save($udata);
					echo $email . "已经激活，请登录";
					$link = L('site_address');
					$content = "<a href=" . $link . ">" . "巧捷万端" . "</a>";
					echo $content;
				}

			} else {
				echo $email . "帐号不存在。";
			}
		} else {
			R('Apps/User/sendInviteEmail', $email);

			$mailAddress = "http://mail.";
			$mailAddress .= substr(strstr($email, '@'), 1);
			$link = "<a href=" . $mailAddress . " target='_blank'>" . $email . "</a>";
			$message = "该链接已失效，已发送新链接到" . $link;
			$message .= ",请点击新链接重新激活。";
			echo $message;
		}
		//  $this->display("Index/index");
	}
	/**
	 * 激活用户
	 */
	public function userActive($mail, $time) {

		$email = trim(base64_decode(I('mail')));
		$subTime = intval(base64_decode(I('time')));

		$expireTime = 24 * 3600;

		$interval = time() - $subTime;
		$flag = ($interval < $expireTime) ? 1 : 0;
		if ($flag) {
			$post['email'] = trim($email);
			importORG('User.UserBase');
			$userBase = new UserBase();
			$userInfo = $userBase->getUserInfo($post);

			if ($userInfo) {
				if ($userInfo['isActivated'] == 0) {
					$data['isActivated'] = 1;
					$activeFlag = $userBase->edit($userInfo['ID'], $data);

					if ($activeFlag) {
						$userInfo = $userBase->getUserInfo($post);
						if ($userInfo['isActivated'] == 1) {
							$isActive = 1;
							$this->assign('isActive', $isActive);
							$this->display('Index:index');
						}
					} else {
						echo $email . "激活失败，请重新激活。";
					}
				} else {
					echo $email . "已经激活，请登录";
					$link = L('site_address');
					$content = "<a href=" . $link . ">" . "巧捷万端" . "</a>";
					echo $content;
				}

			} else {
				echo $email . "帐号不存在。";
			}
		} else {
			$this->sendActiveMsg($email);
			$mailAddress = "http://mail.";
			$mailAddress .= substr(strstr($email, '@'), 1);
			$link = "<a href=" . $mailAddress . " target='_blank'>" . $email . "</a>";
			$message = "该链接已失效，已发送新链接到" . $link;
			$message .= ",请点击新链接重新激活。";
			echo $message;
		}

	}
	/**
	 *
	 * 发送激活邮件
	 */
	public function sendActiveMsg($email) {

		$time = time();
		$time = base64_encode($time);
		$mail = base64_encode($email);
		$link = L('site_address') . "/Passport/userActive/mail/" . $mail . "/time/" . $time . "/";
		$subject = "感谢您选择";

		$body = '<div style = "width:700px;height:300px;border:1px solid #ccc;">
			<div style = "width:700px;height:70px;background:#7BB1BE;">
				<img src = "' . C('PUBLIC_URL') . '/App/Home/Home/images/logo.jpg">
			</div>
			<p style = "padding:2px 10px">
				尊敬的<a href="mailto:' . $email . '" style="margin:0 5px; text-decoration:underline; color:#1D6778;" target="_blank">' . $email . '</a>,您好!
			</p>
			<p style = "text-indent: 35px;line-height:25px;padding:2px 5px">
				您已加入(<a href = "' . DOMAIN_NAME . '">' . DOMAIN_NAME . '</a>),请点击下面的链接激活您的帐户:
			</p>
			<p style = "text-indent: 35px;line-height:25px;padding:2px 10px">
				<a href = "' . $link . '" style="margin:0 5px; text-decoration:underline; color:#1D6778;" target="_blank">' . $link . '</a>
			</p>
			<div style = "border-bottom:1px dashed #aaa"></div>
			<p style = "text-indent: 35px;line-height:25px;padding:2px 10px">
				本链接24小时内有效。如果有任何疑问,请拨打我们的客服电话:18002599238
			</p>
		</div>';

		$flag = sendEmail($email, $subject, $body);
		return $flag;
	}

	/**
	 *
	 * 发送激活邮件
	 */
	public function ajaxSendActive() {
		$email = trim(I('email'));
		$flag = $this->sendActiveMsg($email);

		if ($flag) {
			$result['status'] = 1;
			echo json_encode($result);

		}
	}

	/**
	 * 重置密码
	 */
	public function resetPwd() {

		$result = array(
			'status' => 0,
			'message' => "",
		);

		$email = trim(I('email'));
		$newpwd = trim(I('newpwd'));

		$post['email'] = trim($email);
		importORG('User.UserBase');
		$userBase = new UserBase();
		$userInfo = $userBase->getUserInfo($post);
		if ($userInfo) {

			$flag = D('User')->setUserPwd($userInfo['ID'], $newpwd);
			if ($flag) {
				$result['status'] = 1;
				$result['message'] = "密码重置成功";
			} else {
				$result['message'] = "密码重置失败,换个密码试试";
			}

		} else {
			$result['message'] = "用户不存在";
		}

		echo json_encode($result);
	}

	/**
	 * 登出
	 */
	public function logout() {
		$this->_desSession(session('uid'));
		redirect(U('/Index/index'));
	}

	/**
	 * ajax验证用户名
	 * @return json
	 */
	public function checkUserName() {
		$userName = trim($_POST['userName']);

		$result = array(
			'status' => 0,
			'message' => '',
		);

		import('ORG.Util.Validate');
		//验证用户名
		if (!Validate::check($userName, 'username')) {
			$result['message'] = L('account_format_error');
		} else {

			importORG('User.UserBase');
			$userBase = new UserBase();
			if ($userBase->checkUserName($userName)) {
				$result['message'] = L('username_exists');
			} else {
				$result['status'] = 1;
			}
		}
		echo json_encode($result);
	}

	/**
	 * ajax验证用户邮箱
	 * @return json
	 */
	public function checkUserEmail() {
		$user_email = trim($_POST['email']);

		$result = array(
			'status' => 0,
			'message' => '',
		);

		import('ORG.Util.Validate');
		//验证用户名
		if (!Validate::check($user_email, 'email')) {
			$result['message'] = L('email_format_error');
		} else {

			importORG('User.UserBase');
			$userBase = new UserBase();
			if ($userBase->checkUserEmail($user_email)) {
				$result['message'] = L('email_exists');
			} else {
				$result['status'] = 1;
			}
		}
		echo json_encode($result);
	}

	/**
	 * 同步登陆/退出
	 * @param int $user_id 用户ID
	 * @param enum $type login:登陆,loginout:退出
	 * ＠return boolean
	 */
	public function synlogin() {
		$user_id = isset($_REQUEST['uid']) ? intval($_REQUEST['uid']) : 0;
		$type = isset($_REQUEST['type']) ? trim($_REQUEST['type']) : 'login';
		if (!$user_id) {
			echo 0;exit;
		}

		//获取用户信息
		importORG('User.UserBase');
		$userBase = new UserBase();
		$userInfo = $userBase->getUserInfo(array('user_id' => $user_id));
		if (!$userInfo) {
			echo 0;exit;
		}
		if ($type == 'login') {
			//设置session
			$this->_setSession($user_id, true);
		} else {
			$this->_desSession($user_id);
		}
		echo 1;exit;
	}

	/**
	 * 统一设置session
	 * @param int $user_id 用户ID
	 * @param boolean $is_cookie 是否设置cookie
	 * @return void
	 */
	private function _setSession($user_id, $is_cookie = false) {
		importORG('User.UserBase');
		$userBase = new UserBase();
		//用户信息
		$userInfo = $userBase->getUserInfo(array('user_id' => $user_id));
		D('User')->setSession($userInfo);
		if ($is_cookie == 'true') {
			cookie('user_id', $userInfo['ID'], 3600 * 24 * 30);
		}
	}

	/**
	 * 统一销毁session
	 *  @param int $user_id 用户ID
	 *  @return void
	 */
	private function _desSession($user_id, $is_cookie = false) {
		importORG('User.UserBase');
		$userBase = new UserBase();
		//用户信息
		$userInfo = $userBase->getUserInfo(array('user_id' => $user_id));

		if ($userInfo) {
			D('User')->userLogout();
		}
		cookie('user_id', NULL);
	}

	/**
	 * 验证邮箱是否存在
	 * @param   string  $user_email 用户注册邮箱
	 * @return  string  存在返回false,不存在返回true
	 */
	public function checkUserEmailAt() {
		$user_email = I('post.val', '', 'trim');

		echo D('User')->checkUserEmailAt($user_email);
	}

	/**
	 * 验证用户名是否可用
	 * @param   string  $user_name 用户名
	 * @return  string  可用返回true，不可用返回false
	 */
	public function checkUserNameAt() {
		$user_name = I('post.user_name', '', 'trim');

		echo D('User')->checkUserNameAt($user_name);
	}

	/**
	 * 生成验证码
	 */
	public function verifyCode() {
		import("ORG.Util.Image");
		ob_end_clean();
		Image::buildImageVerify(4, 5);
	}

	/**
	 * 验证用户输入验证码
	 * @param	string	$code_value 用户输入验证码
	 * @return	string	返回输入正确标识
	 */
	public function checkVerifyCode() {
		$code_value = I('post.val', '', 'trim');
		//echo 'ok';
		if (is_null($_SESSION['verify']) || empty($_SESSION['verify'])) {
			echo 'false';
			return;
		}

		echo md5(strtolower($code_value)) === $_SESSION['verify'] ? 'true' : 'false';
	}

	/**
	 * 找回获取用户密码
	 * @param	string	$email 用户注册邮箱
	 * @return	int		返回邮件发送成功标识
	 */
	public function sendUserPwd() {
		$email = I('post.email', '', 'trim');

		echo D('User')->sendUserPwd($email);
	}

	/**
	 * 重设用户密码
	 * @param	int		$userid 用户ID
	 * @return	bool	更新成功返回1，失败返回0
	 */
	public function setUserPwd() {
		$userid = I('post.userid', 0, 'intval');
		$userpwd = I('post.userpwd', '', 'trim');
		$userpwd2 = I('post.userpwd2', '', 'trim');

		if ($userpwd !== $userpwd2) {
			echo 0;
		}

		echo D('User')->setUserPwd($userid, $userpwd) ? 1 : 0;
	}

	public function wechatLogin() {
		//ouTdAs05YSBjua1UbdNhuAuyun8o
		//ouTdAs05YSBjua1UbdNhuAuyun8o
		$code = $_REQUEST['code'];
		if ($code != '') {
			//获取用户的token和openid
			$open_url = "https://api.weixin.qq.com/sns/oauth2/access_token?appid=wxe1d40ff22b2a5303&secret=3a86b012335ba7aca731c72600500c2c&code={$code}&grant_type=authorization_code";
			importORG('Curl');
			$openJSON = Curl::get($open_url);
			$openJsonObj = objectToArray(json_decode($openJSON));
			$open_id = $openJsonObj['openid'];
			$access_token = $openJsonObj['access_token'];
			//获取用户的基本信息
			$getUserInfo_url = "https://api.weixin.qq.com/sns/userinfo?access_token={$access_token}&openid={$open_id}";
			$userJSON = Curl::get($getUserInfo_url);
			$userObj = objectToArray(json_decode($userJSON));
			$openid = $userObj['openid'];
			$data = array(
				"openid" => $openid,
			);
			$onlycheck = M("Users")->where("openid = '$openid'")->find();

			session('wechat_openid', $open_id);

			//print_r($onlycheck);
			if ($onlycheck) {
				session("uname", $onlycheck['userName']);
				session("uid", $onlycheck["ID"]);
				session("openid", $openid);
			} else {
				$data["userName"] = $userObj['nickname'];
				$data["unionid"] = $userObj['unionid'];
				$data['userPhoto'] = $userObj["headimgurl"];
				$data['sex'] = $userObj["sex"];
				$data['country'] = $userObj["country"];
				$data['province'] = $userObj["province"];
				$data['city'] = $userObj["city"];
				$data['regTime'] = time();
				$data["userEmail"] = '';
				$data["userPwd"] = '';
				$data['isActivated'] = 1;
				$data["userType"] = 4;
				$data["roleID"] = "WeChat";
				$data["extendField"] = " ";
				$data["qyWechatId"] = 0;
				$data["wechatId"] = 0;
				$data["address"] = '';
				$data["userPhone"] = '';
				$addUser = M("Users")->add($data);
				if ($addUser) {
					session("uname", $userObj['nickname']);
					session("uid", $addUser);
					session("openid", $openid);
				}
				//$this->display("wechat_login");
			}

			/*if ($open_id) {
			$appList = D('Apps/WechatMp')->getAppListByOpenId($supper_wechat_id, $open_id);
			}
			$this->assign('appList', $appList ? $appList : '');*/
			//print_r($userJSON);
			redirect(U('Index/index'));

			//$this->display("index");
			//$this->display('app_list');
		} else {
			//$redirect_uri = "https://open.weixin.qq.com/connect/oauth2/authorize?appid={$wechat['app_id']}&redirect_uri={$redirect_uri}&response_type=code&scope=snsapi_base&state=1#wechat_redirect";
			//header("location:" . $redirect_uri);
		}
	}
}