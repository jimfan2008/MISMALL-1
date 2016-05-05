<?php

/**
 * 自定义用户模型，封装对用户的数据操作
 * @author 胡志强
 */

importORG('User.Company');
importORG('User.UserBase');

class UserModel extends CommonModel {

	/**
	 * 获取单个用户信息
	 * @param	array    $condition 条件数组
	 * @return	array 	 $user_info 用户信息
	 */
	public function getAUser($condition) {
		$ubObj = new UserBase();

		$user_info = $ubObj->getUserInfo($condition);
		unset($ubObj);

		$user_info['userPhoto'] = getImageUrl($user_info['userPhoto']);
		return $user_info;
	}

	/**
	 * 获取单个用户信息
	 *
	 * @return	array 	 $userLists 用户信息
	 */
	public function loadUserList($flowId) {
		$pid = $_SESSION['pid'];

		/*
		 * 多表查询
		 * */

		$model = new Model();
		$members = $model->table('cc_app_users a,cc_users u')
		                 ->where("a.userID=u.ID AND a.appID ='$pid' AND a.isActive=1")
		                 ->field('a.appID ,a.isAdmin, u.ID, u.userName, u.UserType, u.userEmail,u.userPhoto')
		                 ->order('a.isAdmin desc,a.setAdmin desc,a.ID')
		                 ->select();
		return $members;
		return $model->getLastSql();

		$reObj = D("AppUserView");
		$re = $reObj->field('ID,userName,userType,userEmail,appID,isAdmin')->where("appID ='$pid'")->select();
		print_r($re);
		return $reObj->getLastSql();
		//$usObj =new UserBase();
	}

	/**
	 * 添加一个用户
	 * @param	string	$email 注册邮箱
	 * @param	string	$password 注册的密码信息
	 * @return	int		$uid 用户ID
	 */
	public function userRegister($email, $password, $username = '') {
		$ubObj = new UserBase();

		$uid = $ubObj->register($email, $password, $username);
		unset($ubObj);

		return $uid ? $uid : 0;
	}

	/**
	 * 用户登录
	 * @param	string	$user_name 用户名
	 * @param	string	$user_pwd　用户密码
	 * @return	bool
	 */
	public function userLogin($user_name, $user_pwd) {
		$ubObj = new UserBase();
		$user_info = $ubObj->login($user_name, $user_pwd);
		unset($ubObj);

		return $user_info ? $this->setSession($user_info) : false;
	}

	/**
	 * 设置登录用户session
	 * @param	array 	$user_info 用户信息
	 * @return	bool
	 */
	public function setSession($user_info = null) {
		if (!$user_info) {
			return false;
		}

		session(array('name' => 'session_id', 'expire' => 360000));
		session('uid', $user_info['ID']);
		session('uname', $user_info['userName']);
		session('qyWechatId', $user_info['qyWechatId']);
		session('wechatId', $user_info['wechatId']);

		return true;
	}

	/**
	 * 登出系统，销毁session会话
	 */
	public function userLogout() {
		session(null);
		session_destroy();

		return session('?uid') ? false : true;
	}

	/**
	 * 修改用户信息
	 * @param	int	$user_id 用户ID
	 * @param	array 	$user_info 用户信息
	 * @return	bool	返回修改成功标识
	 */
	public function updAUser($user_id, $user_info) {
		$ubObj = new UserBase();
		$res = $ubObj->edit($user_id, $user_info);
		unset($ubObj);

		return $res ? true : false;
	}
	
	/**
	 * 更新用户信息 
	 * 
	 */
	 public function updateUserInfo($uid,$userInfo){
	 	$ubObj = new UserBase();
	 	$res = $ubObj->updateUserInfo($uid,$userInfo);
		
	 }

	/**
	 * 删除一个用户
	 * @param	int	$user_id 用户ID
	 * @return	bool 返回删除成功标识
	 */
	public function delAUser($user_id) {
		if (!$user_id) {
			return false;
		}

		$ubObj = new UserBase();
		$res = $ubObj->deleteAUser($user_id);
		unset($ubObj);

		return $res;
	}

	/**
	 * 添加用户模板
	 * @param	array 	$data	数据数组
	 * @return	int		返回添加用户模板ID
	 */
	public function addUserTemp($data) {
		$frmtmpObj = M("form_user_templete_type");
		$tmp_id = $frmtmpObj->add($data);
		unset($data, $frmtmpObj);

		return $tmp_id ? $tmp_id : 0;
	}

	/**
	 * 检查用户注册的email地址
	 * @param	string	$email 用户注册的email地址
	 * @return	string	返回地址是否已经存在标识
	 */
	public function checkUserEmailAt($email) {
		if (!validEmail($email)) {
			return 'false';
		}

		$ubObj = new UserBase();
		$res = $ubObj->checkUserEmail($email);
		unset($ubObj);

		return $res ? 'false' : 'true';
	}

	/**
	 * 检查用户名
	 * @param string $userName 用户名
	 * @return string 返回地址是否已经存在标识
	 */
	public function checkUserNameAt($userName) {

		$ubObj = new UserBase();
		$res = $ubObj->checkUserName($userName);
		unset($ubObj);

		return $res ? 'false' : 'true';
	}

	/**
	 * 发送用户密码邮件
	 * @param	string	$email 用户注册邮箱
	 * @return	boolen	返回邮件发送成功标识
	 */
	public function sendUserPwd($email) {
		if ($email == '') {
			return 0;
		}

		$userid = M('users')->where("userEmail='$email'")->getField('ID');
		$subject = '忘记密码提示 -- 巧捷万端平台';
		$resetLink = 'http://localhost/cycc/Public/setpwd?id=' . $userid;
		$body = '<div style = "width:700px;height:300px;border:1px solid #ccc;">
			<div style = "width:700px;height:70px;background:#7BB1BE;">
				<img src = "http://ezsite-images.stor.sinaapp.com/logo.png">
				<p style = "padding:2px 10px">
					尊敬的<a href="mailto:627829480@qq.com" style="margin:0 5px; text-decoration:underline; color:#1D6778;" target="_blank">627829480@qq.com</a>用户,您好!
				</p>
				<p style = "text-indent: 35px;line-height:25px;padding:2px 5px">
					您正在使用巧捷万端(<a href = "http://www.wclouds.net">http://www.wclouds.net</a>)找回密码功能。您可以点击以下链接,重置您的密码ddda:
				</p>
				<p style = "text-indent: 35px;line-height:25px;padding:2px 10px">

				</p>
				<div style = "border-bottom:1px dashed #aaa"></div>
				<p style = "text-indent: 35px;line-height:25px;padding:2px 10px">
					本链接20分钟内有效果。如果有任何疑问,请拨打我们的客服热线:8808800
				</p>
			</div>
		</div>';

		return sendEmail($email, $subject, $body);
	}

	/**
	 * 修改用户密码信息
	 * @param	int		$userid 用户ID
	 * @param	string	$oldpwd 用户旧密码
	 * @param	string	$newpwd 用户新密码
	 * @return	boolen	返回密码修改成功标识
	 */
	public function updUserPwd($userid, $oldpwd, $newpwd) {
		if ($userid == 0 || $oldpwd == '' || $newpwd == '') {
			return 0;
		}

		$ubObj = new UserBase();
		$res = $ubObj->editPassword($userid, $oldpwd, $newpwd);
		unset($ubObj);

		return $res ? 1 : 0;
	}

	/**
	 * 重设用户密码信息
	 * @param	int		$userid 用户ID
	 * @param	string	$userpwd 用户密码
	 * @return	boolen	返回密码修改成功标识
	 */
	public function setUserPwd($userid, $newpwd) {
		if ($userid == 0 || $newpwd == '') {
			return 0;
		}

		$data['userPwd'] = md5($newpwd);
		$res = M('users')->where("ID=" . $userid)->data($data)->save();
		unset($data);

		return $res ? 1 : 0;
	}

	/**
	 * 修改用户邮箱
	 * @param	int		$user_id 当前用户ID
	 * @param	string	$email 用户注册邮箱
	 * @return	boolean	修改成功返回1，失败返回0
	 */
	public function updUserEmail($user_id, $email = '') {
		if ($user_id == 0 || $email == '') {
			return 0;
		}

		$data['userEmail'] = $email;
		$res = M('users')->where("ID=" . $user_id)->data($data)->save();

		if ($res) {
			$subject = '注册邮箱修改提示 -- 巧捷万端平台';
			$link = 'http://localhost/cycc/Public/?d=' . $email;

			$body = '<div style = "width:700px;height:300px;border:1px solid #ccc;">
				<div style = "width:700px;height:70px;background:#7BB1BE;">
					<img src = "http://ezsite-images.stor.sinaapp.com/logo.png">
				</div>
				<p style = "padding:2px 10px">
					尊敬的<a href="mailto:' . $email . '" style="margin:0 5px; text-decoration:underline; color:#1D6778;" target="_blank">' . $email . '</a>,您好!
				</p>
				<p style = "text-indent: 35px;line-height:25px;padding:2px 5px">
					您刚才在巧捷万端(<a href = "http://www.wclouds.net">http://www.wclouds.net</a>)修改了注册邮箱，请点击下面的链接激活新邮箱:
				</p>
				<p style = "text-indent: 35px;line-height:25px;padding:2px 10px">
					<a href = "' . $link . '" style="margin:0 5px; text-decoration:underline; color:#1D6778;" target="_blank">' . $link . '</a>
				</p>
				<div style = "border-bottom:1px dashed #aaa"></div>
				<p style = "text-indent: 35px;line-height:25px;padding:2px 10px">
					本链接20分钟内有效果。如果有任何疑问,请拨打我们的客服热线:8808800
				</p>
			</div>';

			return sendEmail($email, $subject, $body);
		} else {
			return 0;
		}
	}

	/**
	 * 修改用户名
	 * @param int $user_id 当前用户名ID
	 * @param string $userName 用户名
	 * @return boolean 修改成功返回1，失败返回0
	 */
	public function updUserName($user_id, $userName = '') {
		if ($user_id == 0 || $userName == '') {
			return 0;
		}

		$data['userName'] = $userName;
		//$res = M('users') -> where("ID=" . $user_id) -> data($data) -> save();
		$ubObj = new UserBase();
		$res = $ubObj->edit($user_id, $data);
		unset($ubObj);

		if ($res) {
			return 1;
		} else {
			return 0;
		}
	}

	/*
	 * 检查角色名是否重复
	 *
	 * */
	public function checkRoleName($roleName, $level) {
		$db = M("user_role");
		$projectID = $_SESSION['pid'];
		if (isset($_SESSION['pid'])) {
			$result = $db->where("roleName = '$roleName' AND level ='$level' AND projectID ='$projectID'")->select();
		} else {
			return 2;
		}

		if ($result) {
			unset($db);
			return 0;
			//role 已经存在
		} else {
			$projectID = $_SESSION['pid'];
			$data = array("roleName" => $roleName, "level" => $level, "projectID" => $projectID);
			$re = $db->add($data);
			if ($re) {
				return 1;
				//插入成功
			} else {
				return 2;
				//插入失败
			}
		}

	}

	//加载当前项目的所有角色列表信息
	public function loadRoleList($pid) {

		$db = M("user_role");

		$result = $db->where("projectID = '$pid'")->select();
		//return $db->getLastSql();
		unset($db);

		return $result;
	}

	//删除角色
	public function delRole($roleID) {
		$db = M("user_role");

		$result = $db->where("ID = '$roleID'")->delete();
		unset($db);

		return $result;
	}

	//保存权限
	public function savePower($updata, $mainID, $type) {
		if (empty($updata)) {
			return 0;
			//如果为空返回0
		}
		$pid = $_SESSION['pid'];
		$updata = explode("=", $updata);
		array_pop($updata);
		$data = array();
		$j = count($updata);
		if ($type == "user") {
			$db = M('team_form_user_permission');
			$ishave = $db->where("userID='$mainID' AND proID='$pid'")->select();
		} else {
			$db = M('team_form_permission');
			$ishave = $db->where("roleID='$mainID' AND proID='$pid'")->select();
		}

		for ($i = 0; $i < $j; $i++) {
			//"M140424163017364028||flow201404241630267246#468|0|0|0|0"
			//$data[$i]['userID']=$mainID;
			if ($type == "user") {
				$data[$i]['userID'] = $mainID;
			} else {
				$data[$i]['roleID'] = $mainID;
			}
			$data[$i]['proID'] = $pid;

			$modArr = explode("||", $updata[$i]);
			$data[$i]['modelID'] = $modArr[0];

			$flowArr = explode("#", $modArr[1]);
			$data[$i]['flowID'] = $flowArr[0];

			$powerArr = explode("|", $flowArr[1]);
			$data[$i]['formID'] = $powerArr[0];
			$data[$i]['addOpt'] = $powerArr[1];
			$data[$i]['delOpt'] = $powerArr[2];
			$data[$i]['editOpt'] = $powerArr[3];
			$data[$i]['viewOpt'] = $powerArr[4];
			$data[$i]['type'] = 4;
			if ($ishave && $type == "user") {
				$result = $db->where("userID ='$mainID' AND formID='$powerArr[0]' AND flowID='$flowArr[0]' AND type='4'")->save($data[$i]);
			} else if ($ishave && $type == "role") {
				$result = $db->where("roleID ='$mainID' AND formID='$powerArr[0]' AND flowID='$flowArr[0]' AND type='4'")->save($data[$i]);
			}

		}
		//$db = M('team_form_permission');

		if ($ishave) {

		} else {
			$result = $db->addAll($data);
		}
		if (result) {
			return 1;
		} else {
			return 0;
		}

	}

	//加载权限
	public function loadPower($muduleID, $flowID, $mainID, $type) {
		if (empty($mainID)) {
			return 0;
			//如果为空返回0
		}
		$pid = $_SESSION['pid'];
		if ($type == "user") {
			$db = M('team_form_user_permission');
			$result = $db->where("userID='$mainID' AND proID ='$pid' AND modelID ='$muduleID' AND flowID='$flowID' AND type=4")->select();

		} else {
			$db = M('team_form_permission');
			$result = $db->where("roleID='$mainID' AND proID ='$pid' AND modelID ='$muduleID' AND flowID='$flowID' ")->select();

		}

		//$result = $db->where("userID='$userID' AND proID ='$pid' AND modelID ='$muduleID' AND flowID='$flowID' AND type=4")->select();
		//return $result;
		if ($result) {
			return $result;
		} else {
			return null;
		}

	}

	public function loadRoleInfo($roleID) {
		if (empty($roleID)) {
			return 0; //如果为空返回0
		}

		$db = M('user_role');
		$result = $db->where("ID='$roleID'")->select();

		if ($result) {
			return $result;
		} else {
			return null;
		}
	}
	//是否是管理员  管理员才加载用户管理和角色管理
	public function getUserRoleManage($uid, $pid) {
		//print_r($uid."---".$pid);
		if ($pid == "") {
			return;
		}

		$db = M('app_users');
		$re = $db->where("userID='$uid' AND appID = '$pid'")->field("isAdmin,setAdmin")->find();
		//	print_r($db->getLastSql());

		unset($db);
		if ($re['isAdmin'] == 1 || $re['setAdmin'] == 1) {
			return 1; //是管理员
		} else {
			return 0;
		}
	}
	
	/**
	 * 获取邀请的人
	 * @param $userId
	 */
	public function getMyFriends($userId){
		$info = M("users")->where("parent='$userId'")->field("userName,userEmail,from_unixtime(regTime) as regTime,isActivated")->select();
		return $info;
	}
}
?>