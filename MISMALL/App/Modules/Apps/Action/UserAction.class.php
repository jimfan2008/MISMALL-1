<?php

/**
 *
 */
class UserAction extends BaseAction {
	//protected $pid = Session.uid;		//print_r("expression");
	//protected $uid = $_SESSION['uid'];

	/**
	 * 初始化方法
	 */
	function _initialize() {
//
		// 检查是否有管理员的权限 防止直接输入地址进行操作
		if (!I('session.uid', 0)) {
			redirect(__APP__ . '/Index');
		}
		$uid = I('session.uid', 0);
		$pid = I('session.pid', 0);
		$db = M('app_users');
		$re = $db->where("userID = '$uid' AND appID='$pid' ")->field('setAdmin,isAdmin')->find();

		unset($db, $uid, $pid);

		if ($re['setAdmin'] == 0 && $re['isAdmin'] == 0) {
			$this->error('不要复制地址进来，你还是没有权限的！', __GROUP__ . '/FormMobile/index');
			//redirect(__GROUP__ . '/FormMobile/index');
		}

	}
	public function checkAdmin() {
		$pid = $_SESSION['pid']; //print_r("expression");
		$uid = $_SESSION['uid'];
		$db = M('app_users');
		$re = $db->where("UserID = '$uid' AND appID ='$pid'")->field("setAdmin,isAdmin") . find();
		if ($re['setAdmin'] == 0 && $re['isAdmin'] == 0) {
			$this->redirect('Home/MyCenter/buy_apply.html', '', 3, '页面跳转中...');
		}

	}
	public function index() {

		$pid = $_SESSION['pid'];
		if (empty($pid)) {
			$this->error("没有选择项目！");
			//echo U('/Index/index');Home/Index/designer.html
			$this->redirect('Home/MyCenter/buy_apply.html', '', 3, '页面跳转中...');
			//return;
		}
		$uid = $_SESSION['uid'];
		$this->display();
	}
	/*
	 * 获取当前项目的所有用户列表
	 */
	public function loadUserList() {
		$pid = $_SESSION['pid'];
		$flowID = I('post.flowId', '', 'trim');

		echo json_encode_cn(D('User')->loadUserList($flowID));
	}

	/*
	 * 检查email是否存在
	 *
	 * */
	public function checkEmail() {
		$email = I('post.email', '', 'trim');

		echo json_encode_cn(D('User')->checkUserEmailAt($email));

	}

	/*
	 * 新增用户
	 * */
	public function addUser() {
		// print_r($_POST);

		$user_email = trim($_POST['email']); //用户邮箱

		if (isset($_POST['username'])) {
			if (I('post.username', '', trim) == "") {
				$emailObj = explode("@", $user_email); //用户名
				$username = $emailObj[0];
			} else {
				$username = I('post.username', '', trim);
			}
		} else {
			$emailObj = explode("@", $user_email); //用户名
			$username = $emailObj[0];

		}

		$password = trim($_POST['password']);
		$password_confirm = trim($_POST['password_confirm']);
		$role = I('role', '', 'trim');
		$setadmin = I('setadmin', '', 'trim');

		$postUid = trim($_POST['uid']);
		$result = array(
			'status' => 0,
			'message' => '',
			'verification' => '',
		);
		//echo $username;

		//echo json_encode_cn(D('User')->userRegister($email,$password,$username));
		// 远程调用Home项目的PassportAction控制器的edit操作方法

		//import("@.Action.Home.PassportAction");   //Home就是组的名字   跨模块调用控制器
		//$passport = new PassportAction();

		importORG('User.UserBase');
		$userBase = new UserBase();
		//用户注册验证
		if ($user_id = $userBase->register($user_email, $password, $username)) {
			$pid = $_SESSION['pid'];

			//$uObj = M("users")->where("ID='$user_id'")->save($da);
			$userAppObj = M('app_users');
			if ($postUid == "") {
//新增
				$data = array(
					"userID" => $user_id,
					"appID" => $pid,
					"isActive" => 0,
					"isAdmin" => 0,
					"role" => $role,
					"setAdmin" => $setadmin,
				);
				$addUser = $userAppObj->data($data)->add();
				unset($userAppObj);
			} else {
//修改

				$data = array(
					"userID" => $user_id,

					"isActive" => 0,
					"isAdmin" => 0,
					"role" => $role,
					"setAdmin" => $setadmin,
				);
				$modUser = $userAppObj->where("userID = '$postUid' AND appID ='$pid'")->save($data);

			}

			unset($data, $userAppObj);
			//设置session
			//$this->_setSession($user_id, $cookie);
			//发送激活邮件
			// 远程调用Home项目的PassportAction控制器的sendActiveMsg操作方法
			$flag = $this->sendInviteEmail($user_email);
			//$flag=R('Home/Passport/ajaxSendActive',$user_email);
			//$flag=$passport->sendActiveMsg($user_email);
			if ($flag == 1) {
				$result['status'] = 1;
			}

			// $flag=json_decode($flag);
			//if($flag["status"]==1){$result['status'] = 1;}
			//$result['message']=$flag;

		} else {
			$result['message'] = $userBase->getError();
		}

		echo json_encode_cn($result);

	}

	/*
	 * 获取单个用户信息
	 * @param uid
	 * */
	public function loadUserInfo() {
		//$uid = I('get.uid', '', 'trim');
		$post = array(
			"user_id" => I('post.uid', '', 'trim'),
		);
		echo json_encode_cn(D("User")->getAUser($post));

	}
	public function sendEmail() {

		$user_email = I('email', '', 'trim');

		$flag = R('Home/Passport/ajaxSendActive', $user_email);
		//$flag=$passport->sendActiveMsg($user_email);

		$result["message"] = 0;
		if ($flag) {
			$result["message"] = 1;

		}
		//echo json_encode_cn($result);

	}
	public function delUser() {
		$uid = I("post.uid", "", "trim");
		$pid = $_SESSION['pid'];

		$data = array(
			'userID' => $uid,
			'appID' => $pid,
		);
		$aa = M("app_users");
		$bb = $aa->where("userID ='$uid' AND appID ='$pid'")->delete();
		//print_r($aa->getLastSql());

		if ($bb) {
			echo 1;
		} else {
			echo 0;
		}

	}
	/**
	 * 激活用户
	 */
	public function userActive($mail, $time, $pid) {

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
	 * 发送邀请邮件
	 */
	public function sendInviteEmail($email) {
		$pid = base64_encode(session('pid'));
		$adminUsername = session('uname');
		$time = time();
		$time = base64_encode($time);
		$mail = base64_encode($email);
		$link = L('site_address') . "/Passport/userAppActive/mail/" . $mail . "/time/" . $time . "/pid/" . $pid . "/";
		$subject = "来自好友" . $adminUsername . "的巧捷万端邀请";

		$body = '<div style = "width:700px;height:300px;border:1px solid #ccc;">
			<div style = "width:700px;height:70px;background:#7BB1BE;">
				<img src = "http://ezsite-images.stor.sinaapp.com/logo.png">
			</div>
			<span style = "padding:2px 10px">
				尊敬的<a href="mailto:' . $email . '" style="margin:0 5px; text-decoration:underline; color:#1D6778;" target="_blank">' . $email . '</a>,您好!
			</span>
			<span style = "text-indent: 35px;line-height:25px;padding:2px 5px">
				您' . $adminUsername . '邀请你加入他的巧捷万端(<a href = "http://www.wclouds.net">http://www.wclouds.net</a>)项目,请点击下面的链接激活您的帐户:
			</span>
			<span style = "text-indent: 35px;line-height:25px;padding:2px 10px">
				<a href = "' . $link . '" style="margin:0 5px; text-decoration:underline; color:#1D6778;" target="_blank">' . $link . '</a>
			</span>
			<div style = "border-bottom:1px dashed #aaa"></div>
			<span style = "text-indent: 35px;line-height:25px;padding:2px 10px">
			    <a style="color:red">如果不知道这是什么，请忽略此邮件!<a><br />
				本链接24小时内有效。如果有任何疑问,请拨打我们的客服电话:18002599238
			</span>
		</div>';

		$flag = sendEmail($email, $subject, $body);
		return $flag;
	}

	/**
	 *
	 * 发送激活邮件
	 */
	public function ajaxSendActiveEmail() {

		$email = trim(I('email'));
		$edit = trim(I('email'));
		importORG('User.UserBase');

		$userBase = new UserBase();
		$userInfo = $userBase->getUserInfo($_POST);

		$data = array(
			'userID' => $userInfo['ID'],
			'appID' => $_SESSION['pid'],
			'isActive' => 0,
			'isAdmin' => 0,
		);
		$uobj = M("app_users");
		$userID = $userInfo["ID"];
		$pid = $_SESSION['pid'];
		$searchUser = $uobj->where("userID = '$userID' AND appID  = '$pid'")->select();
		if (count($searchUser) > 0) {
			$result['re'] = $userInfo;
			$result['status'] = "用户已存在项目中，请检查邮件信息";
			echo json_encode_cn($result);
		} else {
			$uobj->add($data);
			$flag = $this->sendInviteEmail($email);

			if ($flag) {
				$result['status'] = 1;

			} else {
				$result['status'] = 0;
			}
			echo json_encode($result);
		}

	}
	//检查角色名是否重复
	public function checkRoleName() {
		$roleName = I("rolename", '', 'trim');
		$level = I('level', '', 'trim');

		echo json_encode(D("User")->checkRoleName($roleName, $level));
	}

	//加载角色列表
	public function loadRoleList() {
		$pid = $_SESSION['pid'];

		echo json_encode_cn(D("User")->loadRoleList($pid));
	}
	//加载用户的roleID，根据用户ID
	public function loadRoleID() {
		$pid = $_SESSION['pid'];
		$userID = I('userID', '', 'trim');

		$result = M('app_users')->where("userID='$userID' AND appID='$pid'")->select();
		echo json_encode($result);
	}

	public function delRole() {
		$roleID = I("post.roleID", '', 'trim');

		echo json_decode(D("User")->delRole($roleID));
	}

	public function savePower() {
		$updata = I("post.updata", "", "trim");
		$mainID = I("post.mainID", "", "trim");
		$type = I("post.type", "", "trim");
		echo json_encode(D("User")->savePower($updata, $mainID, $type));

	}

	public function loadPower() {
		$muduleID = I("post.muduleID", "", "trim");
		$flowID = I("post.flowID", "", "trim");
		$mainID = I("post.mainID", "", "trim");
		$type = I("post.type", "", "trim");

		echo json_encode(D("User")->loadPower($muduleID, $flowID, $mainID, $type));

	}
	//加载单个角色的信息
	public function loadRoleInfo() {
		$roleID = I("post.roleID", "", "trim");

		echo json_encode_cn(D("User")->loadRoleInfo($roleID));

	}
}

?>