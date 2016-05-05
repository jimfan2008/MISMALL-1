<?php
/**
 * 微信企业号管理模型
 *
 * @author cjli developerlcj@gmail.com
 * @time 2014/11/11 17:38
 */
class WechatQyModel extends Model {
	/**
	 * qy wechat admin user login
	 *
	 * @param  int $weId     wechat id
	 * @param  string $user_email user email
	 * @param  string $password  password
	 *
	 * @return int
	 */
	public function login($weId, $user_email, $password) {
		$where = array(
			'WeId' => $weId,
			'userEmail' => $user_email,
			'status' => 1,
		);
		$model = M('WechatQyMemberAdmin');
		$info = $model->field('userId,userPwd,groupId')->where($where)->find();

		if (!$info) {
			return -1;
		}
		if ($info['userPwd'] != $this->password($password)) {
			return -2;
		}
		$set = array(
			'lastLoginTime' => time(),
			'lastLoginIp' => get_client_ip(),
		);
		$model->where($where)->save($set);
		return $info;
	}

	/**
	 * check has qy wechat admin member
	 *
	 * @param int $weId     wechat id
	 * @param array $condition 翻译查询条件
	 *
	 * @return boolean
	 */
	public function checkAdminMember($weId, $condition = array()) {
		$where = array(
			'WeId' => $weId,
		);
		$where = array_merge($where, $condition);
		$model = M('WechatQyMemberAdmin');
		$num = $model->where($where)->count();
		return $num;
	}

	/**
	 * get qy wechat manager member group id
	 *
	 * @param  int $weId     wechat id
	 * @param int $relation_user_id 平台用户ID
	 *
	 * @return int group id
	 */
	public function getAdminMemberGroupId($weId, $relationUserId) {
		$where = array(
			'WeId' => $weId,
			'relationUserId' => $relationUserId,
		);
		$model = M('WechatQyMemberAdmin');
		$group_id = $model->where($where)->getField('groupId');
		return $group_id;
	}

	/**
	 * get qy wechat manager list
	 *
	 * @param   int $weId     wechat id
	 * @param  int $group_id member group id
	 *
	 * @return array
	 */
	public function getAdminMemberList($weId, $group_id = 0) {
		$where = array(
			'WeId' => $weId,
		);
		if ($group_id) {
			$where['groupId'] = $group_id;
		}
		$model = M('WechatQyMemberAdmin');
		$list = $model->where($where)->select();
		return $list;
	}

	/**
	 * get Admin Member Info
	 * @param int $weId     wechat id
	 * @param string $field_value   admin member field value
	 * @param string $field   admin member field
	 *
	 * @return array
	 */
	public function getAdminMemberInfo($weId, $field_value, $field = 'userId') {
		$where = array(
			'WeId' => $weId,
		);
		$where[$field] = $field_value;

		$model = M('WechatQyMemberAdmin');
		$info = $model->where($where)->find();
		return $info;
	}

	/**
	 * add qy wechat member account
	 *
	 * @param int $weId     wechat id
	 * @param string $userId   wechat userID
	 * @param  string $user_email user email
	 * @param  string $password  password
	 * @param integer $groupId  user group id
	 * @param int $relation_user_id 平台用户ID
	 *
	 * @return  boolean
	 */
	public function addAdminMember($weId, $post) {
		$password = trim($post['userPwd']);
		if (empty($password)) {
			$password = '123456';
		}
		$set = array(
			'WeId' => $weId,
			'userId' => isset($post['userId']) ? $post['userId'] : 0,
			'relationUserId' => isset($post['relationUserId']) ? intval($post['relationUserId']) : 0,
			'userName' => isset($post['userName']) ? $post['userName'] : '',
			'userEmail' => $post['userEmail'],
			'userPwd' => strlen($password) == 32 ? $password : $this->password($password),
			'addTime' => time(),
			'status' => 1,
			'lastLoginTime' => time(),
			'lastLoginIp' => get_client_ip(),
			'groupId' => isset($post['groupId']) ? intval($post['groupId']) : 0,
			'isCreator' => isset($post['isCreator']) && $post['isCreator'] ? 1 : 0,
		);
		$model = M('WechatQyMemberAdmin');
		$affect = $model->add($set);

		if ($affect) {
			//同步到平台用户表
			$user_model = M('Users');
			$user_id = $user_model->where(array('userEmail' => $set['userEmail']))->getField('ID');

			if (!$user_id) {
				//平台用户不存在直接注册
				$user_id = D('User')->userRegister($set['userEmail'], $password, $set['userName']);
			}
			//平台用户与管理员关联
			$where = array(
				'WeId' => $weId,
				'userId' => $set['userId'],
			);
			$model->where($where)->save(array('relationUserId' => $user_id));
			//平台用户关联企业号
			$user_model->where(array('ID' => $user_id))->save(array('qyWechatId' => $weId));
		}
		return $affect;
	}

	/**
	 * change admin member status
	 *
	 * @param int $weId     wechat id
	 * @param  string $userId   wechat userID
	 * @param  int $status status
	 *
	 * @return 1or 0
	 */
	public function changeAdminMemberStatus($weId, $userId, $status) {
		$where = array(
			'WeId' => $weId,
			'userId' => $userId,
		);
		$model = M('WechatQyMemberAdmin');
		if ($status == -1) {
			//取消平台用户关联企业号
			$user_id = $model->where($where)->getField('relationUserId');
			M('Users')->where(array('ID' => $user_id))->save(array('qyWechatId' => 0));

			$affect = $model->where($where)->delete();
		} else {
			$set['status'] = intval(1 - $status);
			$affect = $model->where($where)->save($set);
		}
		return $affect ? 1 : 0;
	}

	/**
	 * change Admin Member Password
	 *
	 * @param  nt $weId     wechat id
	 * @param  string $userId   wechat userID
	 * @param  string $password password
	 *
	 * @return 1 or 0
	 */
	public function changeAdminMemberPassword($weId, $userId, $password) {
		$where = array(
			'WeId' => $weId,
			'userId' => $userId,
		);
		$model = M('WechatQyMemberAdmin');
		$set['userPwd'] = $this->password($password);
		$affect = $model->where($where)->save($set);
		return $affect ? 1 : 0;
	}

	/**
	 * 加密 md5
	 * @param $password
	 * @return md5
	 */
	public function password($password) {
		return md5(trim($password));
	}

	/**
	 * 获取用户权限列表
	 *
	 * @param int $weId 微信ID
	 *
	 * @return array
	 */
	public function getGroupList($weId) {
		$cache_id = 'wechat-qy-user-group-' . $weId;
		//S($cache_id, NULL);
		if (!$list = S($cache_id)) {
			$model = M('WechatQyMemberGroup');
			$list = $model->where('WeId=' . $weId)->order('id ASC')->select();
			S($cache_id, $list);
		}

		return $list;
	}

	/**
	 * 检查权限名称是否重复
	 *
	 * @param int $weId 微信ID
	 * @param string $name 权限名称
	 * @param int $id 权限ID
	 *
	 * @return boolean
	 */
	public function checkGroupName($weId, $name, $id) {
		$model = M('WechatQyMemberGroup');
		$where = array(
			'name' => $name,
			'WeId' => $weId,
		);
		$old_id = $model->where($where)->getField('id');
		if ($old_id && $old_id != $id) {
			return true;
		}
		return false;
	}

	/**
	 * 编辑权限
	 *
	 * @param int $weId 微信ID
	 * @param array $post 权限名称
	 *
	 * @return boolean
	 */
	public function groupEdit($weId, $post) {
		$cache_id = 'wechat-qy-user-group-' . $weId;

		$model = M('WechatQyMemberGroup');
		$set = array(
			'name' => $post['name'],
			'secret' => isset($post['secret']) && $post['secret'] ? $post['secret'] : '',
			'WeId' => $weId,
		);
		if (empty($set['secret'])) {
			return false;
		}

		$id = isset($post['id']) && $post['id'] ? intval($post['id']) : 0;

		if ($id) {
			$affect = $model->where('id=' . $id)->save($set);
		} else {
			unset($post['id']);
			$affect = $model->add($set);
			if ($affect) {
				//第一次添加管理组时同步
				$num = $model->where(array('WeId' => $weId))->count();
				if ($num == 1) {
					//第一个管理组为企业号创建者组
					M('WechatQyMemberAdmin')->where(array('WeId' => $weId, 'relationUserId' => session('uid')))->save(array('groupId' => $affect));
					session('qy_wechat_app_secret', $set['secret']);
					session('qy_wechat_group_id', $affect);
					//同步部门
					$this->syncDepartmentList($weId, $set['secret']);
					//同步成员
					$this->syncMemberList($weId, $set['secret']);
				}
			}
		}

		S($cache_id, NULL);

		return $affect;
	}

	/**
	 * 删除权限
	 *
	 * @param int $id	权限ID
	 *
	 * @return boolean
	 */
	public function groupDelete($id) {
		M('WechatQyMemberGroup')->delete($id);
		//TODO no sync
		$cache_id = 'wechat-qy-user-group-' . $weId;
		S($cache_id, NULL);

		return true;
	}

	/**
	 * 获取用户权限
	 *
	 * @param  权限ID
	 *
	 * @return array
	 */
	public function getGroupInfo($weId, $id) {
		//$info = M('WechatQyMemberGroup')->find($id);
		$groupList = $this->getGroupList($weId);
		if (!$groupList) {
			return false;
		}
		foreach ($groupList as $group) {
			if ($group['id'] == $id) {
				return $group;
			}
		}
		return false;
	}

	/**
	 * 获取部门列表
	 *
	 * @param int $weId	 微信ID
	 *
	 * @return array
	 */
	public function getDepartmentList($weId) {
		$cache_id = 'wechat-qy-user-department-' . $weId;
		//TODO
		S($cache_id, NULL);
		if (!$list = S($cache_id)) {
			$model = M('WechatQyMemberDepartment');
			$map = array('WeId' => $weId);
			$list = $model->where($map)->order('depId ASC')->select();

			S($cache_id, $list);
		}

		return $list;
	}

	/**
	 * 获取部门列表键值对
	 *
	 * @param int $weId	 微信ID
	 *
	 * @return array
	 */
	public function getDepartmentArray($weId) {
		$arr = array();
		$list = $this->getDepartmentList($weId);
		if ($list) {
			foreach ($list as $dep) {
				$arr[$dep['depId']] = $dep['name'];
			}
		}
		return $arr;
	}

	/**
	 * 获取分类树，指定分类则返回指定分类极其子分类，不指定则返回所有分类树
	 *
	 * @param  integer $weId  微信ID
	 * @param  integer $id    分类ID
	 *
	 * @return array          分类树
	 */
	public function getDepartmentTree($weId, $id = 0) {
		$model = M('WechatQyMemberDepartment');

		if ($id) {
			$info = $model->find($id);
			$id = $info['id'];
		}

		$list = $this->getDepartmentList($weId);

		$list = list_to_tree($list, $pk = 'depId', $pid = 'parentid', $child = '_', $root = $id);

		/* 获取返回数据 */
		if (isset($info)) {
			//指定分类则返回当前分类极其子分类
			$info['_'] = $list;
		} else {
			//否则返回所有分类
			$info = $list;
		}

		return $info;
	}

	/**
	 * 同步企业号部门到本地
	 *
	 * @param int $weId	微信ID
	 * @param string $app_secret 开发者凭据
	 *
	 * @return boolean
	 */
	public function syncDepartmentList($weId, $app_secret) {
		$app_id = D('Wechat')->getInfoById($weId, 'app_id');
		importORG('Wechat.qy.Qyapi');
		$qyapi = new Qyapi($app_id, $app_secret);

		$list = $qyapi->departmentList();
		if ($list == false) {
			$this->error = $qyapi->getErrorInfo(true);
			return false;
		}

		//循环如果不存在就入库
		foreach ($list as $dep) {
			$dep['depId'] = $dep['id'];
			$this->addLocationDepartment($weId, $dep);
		}

		return true;
	}

	/**
	 * 部门信息入库
	 *
	 * @param int $weId	微信ID
	 * @param array $post 部门信息
	 * @param int $id 部门ID
	 *
	 * @return boolean|int
	 */
	public function addLocationDepartment($weId, $post, $id = 0) {
		if ($this->checkDepartmentName($weId, $post['name'], $id)) {
			return false;
		}

		$model = M('WechatQyMemberDepartment');
		$set = array(
			'WeId' => $weId,
			'parentid' => $post['parentid'],
			'depId' => $post['depId'],
			'name' => $post['name'],
		);

		if ($id) {
			$affect = $model->where('id=' . $id)->save($set);
		} else {
			unset($post['id']);
			$affect = $model->add($set);
		}

		$cache_id = 'wechat-qy-user-department-' . $weId;
		S($cache_id, NULL);
		return $affect;
	}

	/**
	 * 检查权限名称是否重复
	 *
	 * @param int $weId 微信ID
	 * @param string $name 权限名称
	 * @param int $id 权限ID
	 *
	 * @return boolean
	 */
	public function checkDepartmentName($weId, $name, $id) {
		$model = M('WechatQyMemberDepartment');
		$where = array(
			'name' => $name,
			'WeId' => $weId,
		);
		$old_id = $model->where($where)->getField('id');
		if ($old_id && $old_id != $id) {
			return true;
		}
		return false;
	}

	/**
	 * 编辑部门信息并同步
	 *
	 * @param int	$weId	微信ID
	 * @param string $app_secret 开发者凭据
	 * @param array $post	提交信息
	 * @param int	$id	部门ID
	 *
	 * @return boolean
	 */
	public function syncdepartment($weId, $app_secret, $post, $id = 0) {
		$app_id = D('Wechat')->getInfoById($weId, 'app_id');
		importORG('Wechat.qy.Qyapi');
		$qyapi = new Qyapi($app_id, $app_secret);

		//同步更新部门
		if (isset($post['depId']) && $post['depId']) {
			$api_status = $qyapi->departmentUpdate($post['depId'], $post['name']);
		} else {
			$api_status = $qyapi->departmentCreate($post['parentid'], $post['name']);
			if ($api_status) {
				$post['depId'] = $api_status;
			}
		}

		//同步更新失败
		if (!$api_status) {
			//$this->error = '同步企业号信息失败';
			$this->error = $qyapi->getErrorInfo(true);
			return false;
		}
		//部门信息入库
		$affect = $this->addLocationDepartment($weId, $post, $id = 0);

		return $affect;
	}

	/**
	 * 同步删除部门信息
	 *
	 * @param int	$id 	部门ID
	 * @param string $app_secret 开发者凭据
	 *
	 * @return boolean
	 */
	public function departmentDelete($id, $app_secret) {
		$model = M('WechatQyMemberDepartment');
		$depInfo = $model->find($id);
		if (!$depInfo) {
			$this->error = '部门信息';
			return false;
		}

		$sub_deps = $model->where(array('parentid' => $depInfo['depId']))->count('0');
		if ($sub_deps) {
			$this->error = '不允许删除有子部门的部门';
			return false;
		}

		$weId = $depInfo['WeId'];

		$DRmodel = M('WechatQyMemberDepartmentRelation');
		$where = array(
			'WeId' => $weId,
			'depId' => $depInfo['depId'],
		);
		$sub_user_count = $DRmodel->where($where)->count('0');
		if ($sub_user_count) {
			$this->error = '不允许删除有成员的部门';
			return false;
		}

		$app_id = D('Wechat')->getInfoById($weId, 'app_id');
		importORG('Wechat.qy.Qyapi');
		$qyapi = new Qyapi($app_id, $app_secret);

		//同步删除部门
		$api_status = $qyapi->departmentDelete($depInfo['depId']);

		//同步更新失败
		if (!$api_status) {
			//$this->error = '同步企业号信息失败';
			$this->error = $qyapi->getErrorInfo(true);
			return false;
		}

		$cache_id = 'wechat-qy-user-department-' . $weId;
		S($cache_id, NULL);
		return $model->delete($id);
	}

	/**
	 * 获取成员列表
	 *
	 * @param $weId
	 */
	public function getMemberList($weId) {
		$model = M('WechatQyMember');
		$list = $model->where('WeId=' . $weId)->select();
		/*if(empty($list)){
		if($this->getSyncMemberList($weId)){
		$list = $model->where('WeId='.$weId)->select();
		}
		}*/

		if ($list) {
			foreach ($list as &$user) {
				$user['department'] = $this->getRelationDepartmentList($weId, $user['userid']);
			}
			unset($user);
		}

		return $list;
	}

	/**
	 * 部门获取成员列表
	 * @param int $weId 微信ID
	 * @param  int $depId	部门ID
	 *
	 * @return array
	 */
	public function getMemberListByDepartment($weId, $depId) {
		$model = M('WechatQyMemberDepartmentRelation wr');
		$model->join(C('DB_PREFIX') . 'wechat_qy_member wm ON wr.userid = wm.userid');
		$model->where(array('wr.depId' => $depId, 'wr.WeId' => $weId, 'wm.WeId' => $weId));
		$model->field('wm.userid,wm.name,wm.email');
		$list = $model->select();
		return $list;
	}

	/**
	 * 获取部门成员列表
	 *
	 * @param int $weId 微信ID
	 * @param string $app_secret 开发者凭据
	 *
	 * @return boolean
	 */
	public function syncMemberList($weId, $app_secret) {
		$app_id = D('Wechat')->getInfoById($weId, 'app_id');
		importORG('Wechat.qy.Qyapi');
		$qyapi = new Qyapi($app_id, $app_secret);

		//部门列表
		$deplist = $this->getDepartmentList($weId);
		if (!$deplist) {
			return false;
		}

		foreach ($deplist as $dep) {
			/*if($dep['depId'] == 1) {
			continue;
			}*/
			//根据部门ID获取成员列表
			$userList = $qyapi->userListByDepartment($dep['depId']);

			if (!$userList) {
				continue;
			}

			foreach ($userList as $user) {
				//根据成员ID获取成员信息
				$info = $qyapi->userGet($user['userid']);
				if (!$info) {
					continue;
				}
				//更新成员信息
				$this->editLocationMember($weId, $info);
			}
		}

		return true;
	}

	/**
	 * 同步成员信息到企业号
	 *
	 * @param int $weId 微信ID
	 * @param string $app_secret 开发者凭据
	 * @param array $post 成员信息
	 *
	 * @return boolean
	 */
	public function sysMemberInfo($weId, $app_secret, $post) {
		//信息入库
		$set = array(
			"userid" => $post['userid'] ? $post['userid'] : '',
			"name" => $post['name'] ? $post['name'] : '',
			"position" => $post['position'] ? $post['position'] : '',
			"department" => $post['department'] ? $post['department'] : '',
			"mobile" => $post['mobile'] ? $post['mobile'] : '',
			"gender" => $post['gender'] ? $post['gender'] : '',
			"tel" => $post['tel'] ? $post['tel'] : '',
			"email" => isset($post['email']) ? $post['email'] : '',
			"weixinid" => isset($post['weixinid']) ? $post['weixinid'] : '',
			//启用/禁用成员。1表示启用成员，0表示禁用成员, -1表示删除
			"enable" => isset($post['enable']) ? $post['enable'] : '',
		);

		if (empty($set['userid'])) {
			$this->error = '60111';
			return false;
		}
		//清除无效参数
		foreach ($set as $key => $val) {
			if (empty($val) && !is_numeric($val)) {
				unset($set[$key]);
			}
		}

		$app_id = D('Wechat')->getInfoById($weId, 'app_id');
		importORG('Wechat.qy.Qyapi');
		$qyapi = new Qyapi($app_id, $app_secret);

		if ($info = $this->getMemberInfo($weId, $set['userid'])) {
			$api_status = $qyapi->userUpdate($set);
		} else {
			$api_status = $qyapi->userCreate($set);
		}

		//同步更新失败
		if (!$api_status) {
			$this->error = $qyapi->getErrorInfo(true);
			return false;
		}
		//通讯录状态
		if (isset($set['enable'])) {
			$set['status'] = $set['enable'];
		}
		return $this->editLocationMember($weId, $set);
	}

	/**
	 * 更新成员信息
	 *
	 * @param int $weId	微信ID
	 * @param array $post 成员信息
	 *
	 * @return boolean
	 */
	public function editLocationMember($weId, $post) {
		$model = M('WechatQyMember');
		//信息入库
		$set = array(
			'WeId' => $weId,
			"userid" => $post['userid'] ? $post['userid'] : '',
			"name" => $post['name'] ? $post['name'] : '',
			"position" => $post['position'] ? $post['position'] : '',
			"mobile" => $post['mobile'] ? $post['mobile'] : '',
			"gender" => $post['gender'] ? $post['gender'] : '',
			"tel" => $post['tel'] ? $post['tel'] : '',
			"email" => isset($post['email']) ? $post['email'] : '',
			"weixinid" => isset($post['weixinid']) ? $post['weixinid'] : '',
			'avatar' => isset($post['avatar']) ? $post['avatar'] : '',
			'status' => isset($post['status']) ? $post['status'] : '',
		);

		//清除无效参数
		foreach ($set as $key => $val) {
			if (empty($val) && !is_numeric($val)) {
				unset($set[$key]);
			}
		}

		$userid = $set['userid'];

		if ($info = $this->getMemberInfo($weId, $userid)) {

			$where = array(
				'WeId' => $weId,
				'userid' => $userid,
			);
			//为-1时删除通讯录信息
			if (isset($set['status']) && $set['status'] == -1) {
				$model->where($where)->delete();
				//删除和部门关联
				M('WechatQyMemberDepartmentRelation')->where($where)->delete();

				return true;
			}

			$affect = $model->where($where)->save($set);
		} else {
			$affect = $model->add($set);
		}

		//添加部门与成员关联
		$this->addRelationDepartment($weId, $post['department'], $userid);

		return true;
	}

	/**
	 * 获取用户信息
	 *
	 * @param string $userid 成员ID
	 * @param string $field	 字段
	 *
	 * @return array
	 */
	public function getMemberInfo($weId, $userid, $field = 'userid') {
		$model = M('WechatQyMember');
		$where = array(
			'WeId' => $weId,
			$field => $userid,
		);

		$info = $model->where($where)->find();

		if ($info) {
			$info['department'] = $this->getRelationDepartmentList($weId, $info['userid']);
		}
		return $info;
	}

	/**
	 * 验证成员表唯一性
	 *
	 * @param  int	   $weId	微信ID
	 * @param  string  $field_name  验证字段
	 * @param  string  $field_value 字段值
	 * @param  string  $id	 成员ID
	 *
	 * @return boolean
	 */
	public function checkMember($weId, $field_name, $field_value, $id = 0) {
		$model = M('WechatQyMember');
		$where = array(
			'WeId' => $weId,
		);
		$where[$field_name] = $field_value;

		$old_id = $model->where($where)->getField('id');
		if ($old_id && $old_id != $id) {
			return true;
		}
		return false;
	}

	/**
	 * 部门与成员关联
	 *
	 * @param int $weId	微信ID
	 * @param string $userid 成员ID
	 *
	 * @return array [1,2]
	 */
	public function getRelationDepartmentList($weId, $userid) {
		$model = M('WechatQyMemberDepartmentRelation');
		$where = array(
			'WeId' => $weId,
			'userid' => $userid,
		);
		$result = $model->field('depId')->where($where)->select();

		return array_value_recursive('depId', $result);
	}

	/**
	 * 添加部门与成员关联
	 *
	 * @param int $weId	微信ID
	 * @param array $depIds	部门ID列表
	 * @param string $userid 成员ID
	 *
	 * @return mixed
	 */
	public function addRelationDepartment($weId, $depIds, $userid) {
		$model = M('WechatQyMemberDepartmentRelation');

		if (!is_array($depIds) || empty($depIds)) {
			return false;
		}
		foreach ($depIds as $id) {
			$set = array(
				'WeId' => $weId,
				'userid' => $userid,
				'depId' => $id,
			);

			if (!$model->where($set)->find()) {
				$model->add($set);
			}
		}
	}

	/**
	 * 群发消息素材库
	 *
	 * @param int $weId	微信ID
	 * @param int $agentid 应用ID
	 * @param string $msgType 消息类型
	 * @param string|array $content 消息
	 * @param int $id 消息ID
	 *
	 * @return boolean
	 */
	public function editMessageSetting($weId, $agentid, $msgType, $content, $id = 0) {
		$model = M('WechatQyMessageSetting');
		$set = array(
			'WeId' => $weId,
			'agentid' => intval($agentid),
			'msgType' => $msgType,
			'data' => serialize($content),
		);

		if ($id) {
			$affect = $model->where(array('id' => $id))->save($set);
		} else {
			$affect = $model->add($set);
		}

		return $affect;
	}

	/**
	 * 群发消息素材库
	 *
	 * @param int $weId	微信ID
	 * @param int $agentid 应用ID
	 * @param string $msgType 消息类型
	 *
	 * @return boolean
	 */
	public function getMessageSettingList($weId, $agentid, $msgType) {
		$model = M('WechatQyMessageSetting');
		$where = array(
			'WeId' => $weId,
			'agentid' => intval($agentid),
			'msgType' => $msgType,
		);
		$list = $model->field('id, data')->where($where)->select();
		if ($list) {
			foreach ($list as &$value) {
				$value['data'] = unserialize($value['data']);
			}
			unset($value);
		}

		return $list;
	}

	public function getMessageSettingInfo($id) {
		$model = M('WechatQyMessageSetting');
		$info = $model->find($id);

		if ($info) {
			$info['data'] = unserialize($info['data']);
		}

		switch ($info['msgType']) {
			case 'voice':
				$cover_id = $info['data']['cover_voice_id'];
				break;
			case 'file':
				$cover_id = $info['data']['cover_file_id'];
			default:
				break;
		}

		if ($cover_id) {
			$file = D('Admin/Picture')->field('name,size')->find($cover_id);
			$info['data'] = array_merge($info['data'], $file);
		}

		return $info;
	}

	/**
	 *上传多媒体文件
	 *
	 * @param int $weId	微信ID
	 * @param string $app_secret 开发者凭据
	 *
	 * @return 上传接口返回的media_id
	 */
	public function uploadMedia($weId, $app_secret, $file) {
		$app_id = D('Wechat')->getInfoById($weId, 'app_id');
		importORG('Wechat.qy.Qyapi');
		$qyapi = new Qyapi($app_id, $app_secret);

		$res = $qyapi->uploadMedia($file);
		if (isset($res['media_id']) && $res['media_id']) {
			return $res['media_id'];
		}

		$this->error = $qyapi->getErrorInfo(true);
		return false;
	}

	/**
	 * 企业号群发消息
	 *
	 * @param  integer $weId	微信ID
	 * @param  string $app_secret 开发者凭据
	 * @param  integer $agentid 企业应用ID
	 * @param  string  $type    消息类型
	 * @param  string|array  $content 消息的内容
	 * @param  string  $touser  UserID列表（消息接收者，多个接收者用‘|’分隔）。特殊情况：指定为@all
	 * @param  string  $toparty PartyID列表
	 * @param  string  $totag   TagID列表
	 * @param  integer $safe    表示是否是保密消息，0表示否，1表示是，默认0
	 *
	 * @return boolean
	 */
	public function sendMessage($weId, $app_secret, $agentid = 0, $type = 'text', $content = '', $touser = '', $toparty = '', $totag = '', $safe = 0) {
		$app_id = D('Wechat')->getInfoById($weId, 'app_id');
		importORG('Wechat.qy.Qyapi');
		$qyapi = new Qyapi($app_id, $app_secret);

		$res = $qyapi->sendMessage($agentid, $type, $content, $safe, $touser, $toparty, $totag);
		if ($res !== false) {
			return true;
		}

		$this->error = $qyapi->getErrorInfo(true);
		return false;
	}

	/**
	 * 微信企业号本地消息入库
	 *
	 * @param integer $weId	微信ID
	 * @param integer $agentid 企业应用ID
	 * @param string  $userid  员工UserID
	 * @param string  $msgType 消息类型
	 * @param array   $data	消息主体
	 *
	 * @return boolean
	 */
	public function addLocationMessage($weId, $agentId, $userid, $msgType, $data) {
		if (empty($data)) {
			return false;
		}

		$set = array(
			'WeId' => intval($weId),
			'agentId' => intval($agentId),
			'userid' => trim($userid),
			'formUserId' => isset($data['formUserId']) && $data['formUserId'] ? trim($data['formUserId']) : '',
			'msgType' => trim($msgType),
			'isRead' => isset($data['isRead']) && $data['isRead'] ? intval($data['isRead']) : 0,
			'parentId' => isset($data['parentId']) && $data['parentId'] ? intval($data['parentId']) : 0,
			'addTime' => time(),
		);

		unset($data['isRead'], $data['parentId'], $data['formUserId']);
		$set['data'] = serialize($data);

		$model = M('WechatQyMessage');
		$affect = $model->add($set);
		return $affect;
	}

	/**
	 * get wechat user send message list
	 *
	 * @param  int $weId   wechat id
	 * @param int $agentId wechat application id
	 *
	 * @return array
	 */
	public function getMessageList($weId, $agentId) {
		$model = M('WechatQyMessage m');
		$where = array(
			'm.WeId' => intval($weId),
			'm.agentId' => intval($agentId),
			//'parentId'=> 0
		);

		$model->field('m.userid, u.name userName');
		$model->join(C('DB_PREFIX') . 'wechat_qy_member as u ON m.userid = u.userid');
		$list = $model->where($where)->group('m.userid')->select();
		foreach ($list as &$m) {
			$model->field('m.id,m.msgType,m.data,m.isRead');
			$info = $model->where(array('userid' => $m['userid']))->order('m.id DESC')->find();
			$m = array_merge($m, $info);
			$m['data'] = unserialize($m['data']);
			$m['friend_time'] = friendlyDate($m['data']['CreateTime']);
			/*if($m['msgType'] == 'text') {
		$m['data']['Content'] = emoji($m['data']['Content']);
		}*/
		}
		unset($m);
		return $list;
	}

	/**
	 * get wechat don't read message count and last msgId
	 *
	 * @param  int $weId   wechat id
	 * @param int $agentId wechat application id
	 *
	 * @return array
	 */
	public function getMessageNotRead($weId, $agentId) {
		$model = M('WechatQyMessage');
		$where = array(
			'WeId' => intval($weId),
			'agentId' => intval($agentId),
			'isRead' => 0,
		);
		$count = $model->where($where)->count('0');
		$last_id = 0;
		if ($count) {
			$last_id = $model->where($where)->getField('id');
		}
		$res = array(
			'count' => $count,
			'lastmsgid' => $last_id,
		);
		return $res;
	}

	/**
	 * get Message Info
	 *
	 * @param int $msgid message id
	 *
	 * @return array
	 */
	public function getMessageInfo($msgid) {
		$model = M('WechatQyMessage');
		$info = $model->find($msgid);
		if ($info) {
			$info['data'] = unserialize($info['data']);
		}
		return $info;
	}

	public function updateMessage($msgid, $post) {
		$model = M('WechatQyMessage');
		if (isset($post['data']) && $post['data']) {
			$post['data'] = serialize($post['data']);
		}
		$model->where(array('id' => $msgid))->save($post);
	}

	/**
	 * get user wechat send message list
	 *
	 * @param  int $weId   wechat id
	 * @param int $agentId wechat application id
	 * @param  string $userid wechat userID
	 * @param  int $msgid  local message infomation id
	 *
	 * @return array
	 */
	public function getUserMessageList($weId, $agentId, $userid, $msgid) {
		$where = array(
			'WeId' => $weId,
			'agentId' => $agentId,
			'userid' => $userid,
		);
		$model = M('WechatQyMessage');
		$list = $model->field('id,userid,formUserId,msgType,data')->where($where)->order('id ASC')->select();
		if ($list) {
			foreach ($list as &$msg) {
				if ($msg['formUserId']) {
					$user = $this->getMemberInfo($weId, $msg['formUserId']);
				} else {
					$user = $this->getMemberInfo($weId, $msg['userid']);
				}
				$msg['user_avatar'] = get_headimg($user['avatar']);
				$msg['user_name'] = $user['name'];
				$msg['data'] = unserialize($msg['data']);
				/*if($m['msgType'] == 'text') {
				$m['data']['Content'] = emoji($m['data']['Content']);
				}*/
				$msg['friend_time'] = friendlyDate($msg['data']['CreateTime']);
			}
			unset($msg);
			//update set message is read
			$model->where($where)->save(array('isRead' => 1));
		}
		return $list;
	}

	/**
	 * 创建应用
	 *
	 * @param int $weId wechat id
	 * @param array  $post app post data
	 *
	 * @return int
	 */
	public function editQyWechatApp($weId, $post = array()) {
		$set = array(
			'WeId' => $weId,
			'agentId' => isset($post['agentId']) && $post['agentId'] ? intval($post['agentId']) : 0,
			'name' => isset($post['name']) && $post['name'] ? trim($post['name']) : '企业小助手',
			'icon' => isset($post['icon']) && $post['icon'] ? trim($post['icon']) : C('PUBLIC_URL') . '/App/Wechat/images/logo/qy.png',
			'appId' => isset($post['appId']) && $post['appId'] ? intval($post['appId']) : 0,
			'description' => isset($post['description']) && $post['description'] ? trim($post['description']) : '',
			'status' => isset($post['status']) && $post['status'] ? intval($post['status']) : 1,
			'addTime' => time(),
		);

		$id = isset($post['id']) && $post['id'] ? intval($post['id']) : 0;

		$model = M('WechatQyApplist');

		$info = $model->where(array('WeId' => $weId, 'appId' => $set['appId']))->find();
		if ($info) {
			$id = $info['id'];
		}

		if ($id) {
			$affect = $model->where(array('id' => $id))->save($set);
			return $affect ? $id : $affect;
		} else {
			$affect = $model->add($set);
		}

		return $affect;
	}

	/**
	 * get qy weichat app list
	 *
	 * @param int $weId weichat id
	 * @param int $status app status
	 *
	 * @return array
	 */
	public function getQyAppList($weId, $status = 'all') {
		$where = array(
			'WeId' => $weId,
		);
		if (is_numeric($status)) {
			$where['status'] = $status;
		}

		$model = M('WechatQyApplist');
		$list = $model->where($where)->select();
		return $list;
	}

	/**
	 * get qy weichat app infomation
	 *
	 * @param int $aid database record id
	 *
	 * @return array
	 */
	public function getAppInfo($aid) {
		$aid = intval($aid);
		$model = M('WechatQyApplist');
		$info = $model->find($aid);
		return $info;
	}

}