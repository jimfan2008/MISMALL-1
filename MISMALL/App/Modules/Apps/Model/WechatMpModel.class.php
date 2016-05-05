<?php
/**
 * 微信公众号模型
 */
class WechatMpModel extends Model {

	/**
	 * 删除消息设置
	 *
	 * @param int $rid ID
	 *
	 * @return boolean
	 */
	public function deleteMessageSetting($id) {
		if (is_numeric($id)) {
			$map['id'] = $id;
		} else {
			$map['ruleName'] = $id;
		}
		return M('WechatMessageSetting')->where($map)->delete();
	}

	/**
	 * 消息素材库
	 *
	 * @param int $weId	微信ID
	 * @param int $agentid 应用ID
	 * @param string $msgType 消息类型
	 * @param string|array $content 消息
	 * @param int $id 消息ID
	 *
	 * @return boolean
	 */
	public function editMessageSetting($weId, $agentid, $msgType, $content, $id = 0, $ruleName = '') {
		$model = M('WechatMessageSetting');
		$set = array(
			'WeId' => $weId,
			'agentId' => intval($agentid),
			'msgType' => $msgType,
			'data' => serialize($content),
			'ruleName' => $ruleName,
			'updateTime' => time(),
		);

		if ($id) {
			$affect = $model->where(array('id' => $id))->save($set);
		} else {
			$set['createTime'] = time();
			$affect = $model->add($set);
		}

		return $affect;
	}

	/**
	 * 获取消息设置列表
	 *
	 * @param int $weId	微信ID
	 * @param int $agentid 应用ID
	 * @param string $msgType 消息类型
	 * @param boolean $api 微信调用，默认为PC调用
	 *
	 * @return boolean
	 */
	public function getMessageSettingList($weId, $agentid, $msgType = 'text') {
		$model = M('WechatQyMessageSetting');
		$where = array(
			'WeId' => $weId,
			'agentId' => intval($agentid),
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

	/**
	 * 获取单条信息
	 *
	 * @param int $id
	 *
	 * @return array
	 */
	public function getMessageSettingInfo($weId, $agentid, $id) {
		$map = array(
			'WeId' => $weId,
			'agentId' => intval($agentid),
		);
		if (is_numeric($id)) {
			$map['id'] = $id;
		} else {
			$map['ruleName'] = $id;
		}
		$model = M('WechatMessageSetting');
		$info = $model->where($map)->find();
		if ($info) {
			$info['data'] = unserialize($info['data']);
			$info['rule_id'] = $info['id'];
			$info['data']['mpnews_url'] = isset($info['data']['mpnews_url']) ? $info['data']['mpnews_url'] : $info['data']['url'];
		}
		return $info;
	}

	/**
	 * 关键字规则列表
	 *
	 * @param int $weId 微信号ID
	 *
	 * @return array
	 */
	public function getKeywordsList($weId, $agentid) {
		$where = array(
			'WeId' => $weId,
			'agentId' => intval($agentid),
			'ruleName' => array(array('neq', 'subscribe'), array('neq', 'autoReply'), 'AND'),
		);
		$model = M('WechatMessageSetting');
		$ruleList = $model->field('ruleName,id,msgType,agentId,updateTime,status')->where($where)->select();
		if ($ruleList) {
			foreach ($ruleList as &$rule) {
				$rule['keywords'] = join(',', $this->getKeywordsByRuleId($rule['id']));
			}
			unset($rule);
		}
		return $ruleList;
	}

	/**
	 * 根据规则ID获取关键字
	 *
	 * @param	int	$rule_id 规则ID
	 *
	 * @return array
	 */
	public function getKeywordsByRuleId($rule_id) {
		$keywordsList = M('WechatKeywords')->where(array('rule_id' => $rule_id))->field('title')->select();
		return array_column($keywordsList, 'title');
	}

	/**
	 * 添加关键字
	 *
	 * @param int	$weId 微信号ID
	 * @param int	$rule_id 规则ID
	 * @param array $keywords 关键字数组
	 *
	 */
	public function addKeywords($weId, $rule_id, $keywords) {
		$model = M('WechatKeywords');
		$model->where(array('WeId' => $weId, 'rule_id' => $rule_id))->delete();
		$keywords = is_string($keywords) ? explode(';', $keywords) : $keywords;
		if ($keywords && is_array($keywords)) {
			foreach ($keywords as $keyword) {
				$old_id = $model->where(array('WeId' => $weId, 'title' => $keyword))->getField('id');
				if ($old_id) {
					$model->where(array('id' => $old_id))->save(array('rule_id' => $rule_id));
				} else {
					$set = array(
						'WeId' => $weId,
						'rule_id' => $rule_id,
						'title' => $keyword,
					);
					$model->add($set);
				}
			}
		}
	}

	/**
	 * 根据关键字获取规则
	 *
	 * @param int	$weId 微信号ID
	 * @param string $keyword 关键字
	 *
	 * @return array
	 */
	public function getRuleByKeyword($weId, $keyword) {
		$where = array(
			'wk.WeId' => $weId,
			'wk.title' => $keyword,
			'wr.status' => 1,
		);
		$model = M('WechatMessage wr');
		$model->join(C('DB_PREFIX') . 'wechat_keywords wk ON wr.id = wk.rule_id');
		$model->where($where);
		$rule = $model->field('wr.id,wr.agentId,wr.MsgType')->find();
		return $rule;
	}

	/**
	 * 检查当前一级菜单个数
	 * 一级最多3个，子级最多5个
	 *
	 * @param int $weId 微信ID
	 * @param int $pid
	 * @param int $id
	 *
	 * @return boolean
	 */
	public function checkMenuCount($weId, $pid, $id) {
		$where = array(
			'WeId' => $weId,
			'pid' => $pid,
			'status' => 1,
		);
		$model = D('WechatMenu');
		$count = $model->where($where)->count('0');
		if ($pid == 0) {
			if ($id) {
				if ($count > 3) {
					return false;
				}
			} elseif ($count > 2) {
				return false;
			}
		} else {
			if ($id) {
				if ($count > 5) {
					return false;
				}
			} elseif ($count > 4) {
				return false;
			}
		}
		return true;
	}

	/**
	 * 编辑菜单
	 *
	 * @param array $post
	 * @param int $id
	 *
	 * @return mixed
	 */
	public function editMenu($post, $id) {
		$model = M('WechatMenu');
		if ($id) {
			$res = $model->where(array('id' => $id))->save($post);
		} else {
			$res = $model->add($post);
		}
		return $res;
	}

	/**
	 *删除菜单
	 */
	public function menuDelete($id) {
		$model = M('WechatMenu');
		return $model->delete($id);
	}

	/**
	 * 获取菜单列表
	 *
	 * @param int $weId 微信ID
	 * @param int $pid 上级ID
	 *
	 * @return array
	 */
	public function getMenuList($weId, $pid = NULL) {
		$where = array(
			'WeId' => $weId,
		);
		$model = M('WechatMenu');
		// if no menu is sync wechat menu
		$count = $model->where($where)->count('0');
		if (!$count) {
			importORG('Wechat.Menu');
			$wechat = D('Wechat')->getInfoById($weId);
			$weMenu = new Menu($wechat['app_id'], $wechat['app_secret']);
			if ($menus = $weMenu->menuGet()) {
				foreach ($menus as $menu) {
					$set = array(
						'WeId' => $weId,
						'pid' => 0,
						'type' => isset($menu['type']) ? $menu['type'] : '',
						'name' => $menu['name'],
						'url' => isset($menu['url']) ? $menu['url'] : '',
						'key' => isset($menu['key']) ? $menu['key'] : '',
						'status' => 1,
						'sort' => 0,
					);
					$parent_id = $this->editMenu($set);
					if (isset($menu['sub_button']) && $menu['sub_button']) {
						foreach ($menu['sub_button'] as $sub) {
							$sub_set = array(
								'WeId' => $weId,
								'pid' => $parent_id,
								'type' => $sub['type'],
								'name' => $sub['name'],
								'url' => $sub['url'],
								'key' => $sub['key'],
								'status' => 1,
								'sort' => 0,
							);
							$this->editMenu($sub_set);
						}
					}
				}
			}
		}

		if (is_numeric($pid)) {
			$where['pid'] = $pid;
			$where['status'] = 1;
		}
		$list = $model->where($where)->order('sort DESC ,id ASC')->select();
		return $list;
	}

	/**
	 * 获取菜单信息
	 *
	 * @param int $id 菜单ID
	 *
	 * @return array
	 */
	public function getMenu($id) {
		$model = D('WechatMenu');
		return $model->find($id);
	}

	/**
	 * 获取同步到微信的菜单
	 *
	 * @param int $weId 微信ID
	 *
	 * @return array
	 */
	public function setSyncWechatMenu($weId) {
		$where = array(
			'WeId' => $weId,
			'status' => 1,
		);
		$model = D('WechatMenu');
		$list = $model->field('id,pid,name,url,type,key')->where($where)->order('sort DESC, id ASC')->select();
		if (!$list) {
			return false;
		}

		return list_to_tree($list);
	}

	/**
	 * 获取用户分组
	 *
	 * @param int $weId 微信ID
	 */
	public function getGroupList($weId) {
		$model = M('WechatMemberGroup');
		$cache_id = 'wechat-user-group-' . $weId;

		if (!$list = S($cache_id)) {

			$count = $model->where('WeId=' . $weId . ' AND groupid > 0')->count('0');
			//同步分组到本地
			if (!$count) {
				$this->syncGroup($weId);
			}

			$list = $model->where('WeId=' . $weId)->select();
			S($cache_id, $list);
		}

		return $list;
	}

	/**
	 * 同步会员分组
	 * @param int $weId 微信ID
	 * @return NULL
	 */
	public function syncGroup($weId) {
		$model = M('WechatMemberGroup');

		importORG('Wechat.User');
		$wechat = D('Wechat')->getInfoById($weId);
		$weUser = new User($wechat['app_id'], $wechat['app_secret']);

		if ($groups = $weUser->groupGet()) {
			$model->where(array('WeId' => $weId))->delete();
			foreach ($groups as $g) {
				$set = array(
					'WeId' => $weId,
					'name' => $g['name'],
					'groupid' => $g['id'],
				);
				$model->add($set);
			}
			S('wechat-user-group-' . $weId, NULL);
			return true;
		}
		$this->error = $weUser->getErrorInfo();
		return false;
	}

	/**
	 * 获取微信上用户的ID分组
	 */
	public function getWechatGroups($weId) {
		//获取用户分组
		$groups = $this->getGroupList($weId);
		if (!$groups) {
			return false;
		}
		$groupArr = array();
		foreach ($groups as $g) {
			$groupArr[$g['groupid']] = $g['name'];
		}
		ksort($groupArr);
		return $groupArr;
	}

	/**
	 * 检查分组名称是否重复
	 *
	 * @param int $weId 微信ID
	 * @param string $name 分组名称
	 * @param int $id 分组ID
	 *
	 * @return boolean
	 */
	public function checkGroupName($weId, $name, $id) {
		$model = M('WechatMemberGroup');
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
	 * 编辑分组
	 *
	 * @param int $weId 微信ID
	 * @param string $name 分组名称
	 * @param int $id 分组ID
	 *
	 * @return boolean
	 */
	public function groupEdit($weId, $name, $id) {
		$cache_id = 'wechat-user-group-' . $weId;

		$model = M('WechatMemberGroup');
		$where = array(
			'name' => $name,
			'WeId' => $weId,
		);
		importORG('Wechat.User');
		$wechat = D('Wechat')->getInfoById($weId);
		$weUser = new User($wechat['app_id'], $wechat['app_secret']);

		$group_id = 0;

		if ($id) {
			$group_id = $model->where('id=' . $id)->getField('groupid');
		}
		//同步分组到微信
		if ($name == '未分组') {
			return array(
				'id' => 0,
				'name' => '未分组',
			);
		}
		$weGroup = $group_id ? $weUser->groupUpdate($group_id, $name) : $weUser->groupCreate($name);

		if (!$weGroup) {
			$this->error = $weUser->getErrorInfo();
		} else if (is_array($weGroup)) {
			$where['groupid'] = $weGroup['id'];
			if ($id) {
				$model->where('id=' . $id)->save($where);
			} else {
				$model->add($where);

			}
		}
		S($cache_id, NULL);
		return (boolean) $weGroup;
	}

	/**
	 *  删除分组
	 */
	public function groupDelete($weId, $id) {
		$cache_id = 'wechat-user-group-' . $weId;
		$model = M('WechatMemberGroup');
		$model->delete($id);
		S($cache_id, NULL);
	}

	/**
	 * 获取粉丝列表
	 *
	 * @param $weId
	 */
	public function getAppMemberList($weId, $agentid, $page = 0, $pageRow = 10) {
		$model = M('WechatAppMember wam');
		$where = array(
			'wam.WeId' => $weId,
			'wam.agentId' => intval($agentid),
			'm.subscribe' => 1,
		);
		$model->join(C('DB_PREFIX') . 'Users as m ON wam.openid = m.openid');
		$model->where($where);
		if ($page) {
			$model->page($page, $pageRow);
		}
		$model->field('m.*,wam.isServer');
		$list = $model->order('subscribe_time DESC, id DESC')->select();
		if (empty($list) && $weId != C('SUPPER_WECHAT_ID')) {
			if ($this->getSyncMemberList($weId, $agentid)) {
				$list = $model->order('subscribe_time DESC, id DESC')->select();
			}
		}

		return $list;
	}

	/**
	 * 获取粉丝总数
	 */
	public function getAppMemberCount($weId, $agentid) {
		$model = M('WechatAppMember wam');
		$where = array(
			'wam.WeId' => $weId,
			'wam.agentId' => intval($agentid),
			'm.subscribe' => 1,
		);
		$model->join(C('DB_PREFIX') . 'Users as m ON wam.openid = m.openid');
		$model->where($where);
		$count = $model->count();
		return $count;
	}

	public function getAppListByOpenId($weId, $openid) {
		$model = M('WechatAppMember wam');
		$where = array(
			'wam.WeId' => $weId,
			'a.WeId' => $weId,
			'wam.openid' => $openid,
		);
		$model->join(C('DB_PREFIX') . 'wechat_applist as a ON wam.agentId = a.agentId');
		$model->where($where);
		$list = $model->field('a.*')->order('a.id DESC')->select();
		//echo $model->getLastSql();
		return $list;
	}

	/**
	 * 获取关注者列表
	 *
	 * @param int $weId 微信ID
	 * @param int $agentid 应用ID
	 * @param string $next_openid 第一个拉取的OPENID，不填默认从头开始拉取
	 *
	 * @return null
	 */
	public function getSyncMemberList($weId, $agentid, $next_openid = '') {
		//同步微信数据到本地
		importORG('Wechat.User');
		$wechat = D('Wechat')->getInfoById($weId);
		$weUser = new User($wechat['app_id'], $wechat['app_secret']);
		$userList = $weUser->getUserList($next_openid);
		/*
		array(4) {
		["total"] => int(3)
		["count"] => int(3)
		["data"] => array(1) {
		["openid"] => array(3) {
		[0] => string(28) "osGGTtxa00-wh3CISHnYpXNwZuFo"
		[1] => string(28) "osGGTt5oGs49lxeMsphmTOgeU1Ps"
		[2] => string(28) "osGGTt8a2wxyPMMZzR1rO_n7uQCo"
		}
		}
		["next_openid"] => string(28) "osGGTt8a2wxyPMMZzR1rO_n7uQCo"
		}
		 */
		//列表总数
		if ($userList['count'] == 0) {
			$this->error = $weUser->getErrorInfo();
			return false;
		}
		//dump($userList);
		//openid列表
		if ($userList['data']['openid']) {
			foreach ($userList['data']['openid'] as $openid) {
				//同步单个微信用户信息
				$info = $this->getSyncMemberInfo($weId, $openid);
				if (!$info) {
					continue;
				}

				//存在则更新
				$userInfo = $this->getMemberInfo($openid);
				$this->updateSyncMember($weId, $agentid, $info, $userInfo ? $userInfo['id'] : 0);
			}
		}
		//一次拉取调用最多拉取10000个关注者的OpenID
		if ($userList['total'] > 10000) {
			$this->getSyncMemberList($weId, $agentid, $userList['next_openid']);
		}
		return true;
	}

	/**
	 * 同步微信用户数据到本地
	 *
	 * @param int $weId 微信ID
	 * @param string $openid 公众号唯一标识
	 *
	 * @return array
	 */
	public function getSyncMemberInfo($weId, $openid) {
		importORG('Wechat.User');
		$wechat = D('Wechat')->getInfoById($weId);
		$weUser = new User($wechat['app_id'], $wechat['app_secret']);

		$info = $weUser->getUserInfo($openid);
		if (!$info) {
			$this->error = $weUser->getErrorInfo();
			return false;
		}
		$data = array(
			'userName' => $info['nickname'],
			'isActivated' => $info['subscribe'],
			'openid' => $info['openid'],
			'sex' => $info['sex'],
			'city' => $info['city'],
			'province' => $info['province'],
			'country' => $info['country'],
			'address' => '',
			'userPhone' => '',
			'userPhoto' => $info['headimgurl'] ? substr($info['headimgurl'], 0, -2) : '',
			'regTime' => $info['subscribe_time'],
			'unionid' => $info['unionid'],
			'remark' => $info['remark'],
			'roleID' => $info['groupid'],
			'userType' => 5,
			'userEmail' => '',
			'userPwd' => '',
		);

		//获取微信用户所在分组
		/*$groupid = $weUser->groupByUserOpenId($openid);
		if ($groupid) {
		$info['groupid'] = $groupid;
		}*/
		return $data;

	}

	/**
	 * 获取粉丝信息
	 *
	 * @param int $openid 用户ID或者openid
	 *
	 * @return array
	 */
	public function getMemberInfo($openid, $field = true) {
		if (empty($openid)) {
			return false;
		}

		if (is_numeric($openid)) {
			$where['ID'] = $openid;
		} else {
			$where['openid'] = $openid;
		}

		$model = M('Users');

		//获取数据库信息
		$info = $model->field($field)->where($where)->find();

		return $info;
	}

	/**
	 * 通过用户唯一标识获取粉丝信息
	 *
	 * @param int $weId 微信ID
	 * @param string $openid 公众号唯一标识
	 *
	 * @return mixed boolen|array
	 */
	public function getMemberInfoByOpenId($weId, $agentid, $openid) {
		if (!is_numeric($weId) || empty($openid)) {
			return false;
		}
		//获取数据库信息
		$info = $this->getMemberInfo($openid);
		Log::write("getMemberInfoByOpenId\n" . var_export($info, TRUE) . "\n", Log::DEBUG);
		if ($info) {
			$this->updateAppMember($weId, $agentid, $openid);
			return $info;
		}
		//同步单个微信用户信息
		$info = $this->getSyncMemberInfo($weId, $openid);
		Log::write("getSyncMemberInfo\n" . var_export($info, TRUE) . "\n", Log::DEBUG);
		if (!$info) {
			return false;
		}
		//添加用户
		$uid = $this->updateSyncMember($weId, $agentid, $info);
		if (!$uid) {
			return false;
		}

		return $this->getMemberInfo($uid);
	}

	/**
	 * 更新同步微信用户信息
	 *
	 * @param int $weId 微信ID
	 * @param array $info 用户信息集
	 * @param int $uid 用户ID
	 *
	 * @return boolean
	 */
	public function updateSyncMember($weId, $agentid, $info, $uid = 0) {
		if (empty($info['openid'])) {
			return false;
		}
		$model = M('Users');
		$data = $model->create($info);
		if ($uid) {
			$affect = $model->where(array('ID' => $uid))->save($data);
		} else {
			$old_info = $this->getMemberInfo($info['openid']);
			if ($old_info) {
				$affect = $model->where(array('openid' => $info['openid']))->save($data);
			} else {
				$affect = $model->add($data);
			}
		}
		if ($affect) {
			$this->updateAppMember($weId, $agentid, $info['openid']);
		}

		return $affect;
	}

	/**
	 * 更新用户信息
	 *
	 * @param int $weId 微信ID
	 * @param int $uid 用户ID
	 * @param array $info 用户信息集
	 *
	 * @return boolean
	 */
	public function updateMember($weId, $uid, $info) {
		if (!is_numeric($uid)) {
			return false;
		}
		//更新同步微信用户分组
		/*if (isset($info['groupid']) && $info['groupid']) {
		importORG('Wechat.User');
		$wechat = D('Wechat')->getInfoById($weId);
		$weUser = new User($wechat['app_id'], $wechat['app_secret']);
		$user = $this->getMemberInfo($uid, 'openid');
		if (!$user || !$user['openid']) {
		return false;
		}
		if (!$weUser->groupMove($user['openid'], $info['groupid'])) {
		$this->error = $weUser->getErrorInfo();
		return false;
		}
		}*/
		$model = M('Users');
		$data = $model->create($info);
		$affect = $model->where(array('ID' => $uid))->save($data);
		return $affect;
	}

	/**
	 * 应用与粉丝关联
	 * @return true
	 */
	public function updateAppMember($weId, $agentid, $openid) {
		$model = M('WechatAppMember');
		$set = array(
			'WeId' => $weId,
			'agentId' => intval($agentid),
			'openid' => $openid,
		);
		$count = $model->where($set)->count();
		if (!$count) {
			$model->add($set);
		}
		Log::write("updateAppMember\n" . var_export($model->getLastSql(), TRUE) . "\n", Log::DEBUG);
		return true;
	}
	/**
	 * 取消关注，删除应用关联
	 * @return true
	 */
	public function unsubscribe($weId, $agentid, $openid) {
		$model = M('WechatAppMember');
		$set = array(
			'WeId' => $weId,
			'agentId' => intval($agentid),
			'openid' => $openid,
		);
		$model->where($set)->delete();
		return true;
	}
	/**
	 * 设置用户是否为客服
	 */
	public function setCoustomerService($weId, $agentid, $openid) {
		$model = M('WechatAppMember');
		$where = array(
			'WeId' => $weId,
			'agentId' => intval($agentid),
			'openid' => $openid,
		);
		$info = $model->where($where)->find();
		if (!$info) {
			return false;
		}
		$set = array(
			'isServer' => abs(1 - $info['isServer']),
		);
		$model->where($where)->save($set);
		return true;
	}

	/**
	 * 获取客服列表
	 */
	public function getcoustomerService($weId, $agentid) {
		$model = M('WechatAppMember');
		$where = array(
			'WeId' => $weId,
			'agentId' => intval($agentid),
			'isServer' => 1,
		);
		$list = $model->field('openid')->where($where)->select();
		if ($list) {
			$list = array_value_recursive('openid', $list);
		}
		return $list;
	}

	/**
	 * 推送消息入库
	 *
	 * @param int $weId
	 * @param array $data
	 *
	 * @return int 消息ID
	 */
	public function addMessage($weId, $data, $agentid = 0) {
		//消息入库
		$set = array(
			'MsgType' => $data['MsgType'],
			'FromUserName' => $data['FromUserName'],
			'CreateTime' => $data['CreateTime'],
			'MsgId' => isset($data['MsgId']) ? $data['MsgId'] : 0,
			'parentId' => isset($data['parentId']) ? $data['parentId'] : 0,
			'isRead' => isset($data['isRead']) ? $data['isRead'] : 0,
			'WeId' => $weId,
			'agentId' => intval($agentid),
		);
		//TODO 虚拟公众号，多个应用时，推送信息会错误，不能定位具体应用，统一加到第一个应用
		if ($agentid == 0) {
			$agents = M('WechatAppMember')->field('agentId')->where(array('WeId' => $weId, 'openid' => $set['FromUserName']))->select();
			if ($agents) {
				$set['agentId'] = $agents[0]['agentId'];
			} else {
				$set['agentId'] = 1;
			}
		}

		//TODO 多媒体文件
		if (isset($data['MediaId']) && $data['MediaId']) {

		}
		//收集消息中的图片
		if ($data['MsgType'] == 'image' && $data['PicUrl']) {
			$img_set = array(
				'WeId' => $weId,
				'FromUserName' => $data['FromUserName'],
				'CreateTime' => $data['CreateTime'],
				'PicUrl' => $data['PicUrl'],
				'LocalPicUrl' => '',
			);

			$image_id = $this->table(C('DB_PREFIX') . 'wechat_message_image')->where("PicUrl='" . $img_set['PicUrl'] . "'")->getField('id');
			if (!$image_id) {
				$imgId = $this->table(C('DB_PREFIX') . 'wechat_message_image')->data($img_set)->add();
			}
			unset($img_set);
		}

		unset($data['MsgType'], $data['FromUserName'], $data['CreateTime'], $data['MsgId'], $data['WeId'], $data['ToUserName'], $data['parentid'], $data['isRead']);
		$set['data'] = serialize($data);
		$record_id = $this->table(C('DB_PREFIX') . 'wechat_message')->where("MsgType='image' and MsgId='" . $set['MsgId'] . "'")->getField('id');
		if (!$record_id) {
			$message_save_result = $this->table(C('DB_PREFIX') . 'wechat_message')->data($set)->add();
		}
		unset($set);

		return $message_save_result;
	}

	/**
	 * 获取推送信息总数
	 *
	 * @param int $weId
	 * @param array $post
	 *
	 * @return mix int|false
	 */
	public function getMessageCount($weId, $agentid, $post = array()) {
		$where = array(
			'MsgType' => isset($post['MsgType']) ? $post['MsgType'] : NULL,
			'FromUserName' => isset($post['FromUserName']) ? $post['FromUserName'] : NULL,
			'WeId' => $weId,
			'agentId' => intval($agentid),
		);

		$where = array_filter($where);
		$model = M('WechatMessage');
		return $model->where($where)->count();
	}

	/**
	 * 获取推送信息列表
	 *
	 * @param int $weId
	 * @param array $post
	 * @param int $page
	 * @param int $pageRows
	 *
	 * @return array
	 */
	public function getMessageList($weId, $agentid, $post = array(), $page = 0, $pageRows = 10) {
		$where = array(
			'm.WeId' => intval($weId),
			'm.agentId' => intval($agentid),
			//'parentId'=> 0
		);

		$model = M('WechatMessage m');

		$model->field('m.FromUserName, u.nickname userName');
		$model->join(C('DB_PREFIX') . 'Users as u ON m.FromUserName = u.openid');
		$list = $model->where($where)->group('m.FromUserName')->order('m.isRead')->select();
		foreach ($list as &$m) {
			$model->field('m.id,m.MsgType,m.data,m.isRead,m.CreateTime');
			$info = $model->where(array('FromUserName' => $m['FromUserName'], 'm.WeId' => $weId))->order('m.id DESC')->find();
			$m = array_merge($m, $info);
			$m['data'] = unserialize($m['data']);
			$m['friend_time'] = friendlyDate($m['CreateTime']);
		}
		unset($m);
		return $list;

		$model = M('WechatMessage');

		$model->where($where);

		if ($page) {
			$model->page($page, $pageRows);
		}
		$list = $model->field('id')->order('id DESC')->select();
		if ($list) {
			foreach ($list as &$m) {
				$m = $this->getMessageInfo($m['id']);
				$m['replay_diff_time'] = time() - $m['CreateTime'] < 172800 ? 1 : 0;
			}
		}
		return $list;
	}

	/**
	 * get user wechat send message list
	 *
	 * @param  int $weId   wechat id
	 * @param  string $openid wechat openid
	 * @param  int $msgid  local message infomation id
	 *
	 * @return array
	 */
	public function getUserMessageList($weId, $agentid, $openid, $msgid) {
		$where = array(
			'WeId' => $weId,
			'agentId' => intval($agentid),
			'FromUserName' => $openid,
		);
		$model = M('WechatMessage');
		$list = $model->field('id,FromUserName,parentId,MsgType,data,CreateTime')->where($where)->order('id ASC')->select();
		if ($list) {
			foreach ($list as &$msg) {
				$user = $this->getMemberInfo($msg['FromUserName']);
				$msg['user_avatar'] = get_headimg($user['userPhoto']);
				$msg['user_name'] = $user['userName'];
				$msg['data'] = unserialize($msg['data']);
				if (isset($msg['data']['MediaUrl']) && $msg['data']['MediaUrl']) {
					$msg['data']['MediaUrl'] = getImageUrl($msg['data']['MediaUrl']);
				}
				$msg['friend_time'] = friendlyDate($msg['CreateTime']);
				$msg['parentId'] = $msg['parentId'] ? $msg['parentId'] : NULL;
			}
			unset($msg);
			//update set message is read
			$model->where(array('id' => $msgid))->save(array('isRead' => 1));
		}
		return $list;
	}

	/**
	 * 获取消息内容
	 *
	 * @param int $id 消息ID
	 *
	 * @return array
	 */
	public function getMessageInfo($id) {
		$cache_id = 'wechat-message-' . $id;
		if (!$message = S($cache_id)) {
			$model = M('WechatMessage');
			$message = $model->where('id=' . $id)->find();
			if ($message) {
				if ($message['data']) {
					$message['data'] = unserialize($message['data']);
				}
				$userInfo = $this->getMemberInfo($message['FromUserName'], 'userName');
				$message['userName'] = $userInfo ? $userInfo['userName'] : $message['FromUserName'];
				$message['user_avatar'] = get_headimg($userInfo['userPhoto']);
				$message['user_name'] = $userInfo['userName'];
				$message['friend_time'] = friendlyDate($message['CreateTime']);
				$message['parentId'] = $message['parentId'] ? $message['parentId'] : NULL;
				S($cache_id, $message);
			}
		}
		return $message;
	}

	public function updateMessage($msgid, $post) {
		$model = M('WechatMessage');
		if (isset($post['data']) && $post['data']) {
			$post['data'] = serialize($post['data']);
		}
		$model->where(array('id' => $msgid))->save($post);
	}

	/**
	 * get wechat don't read message count and last msgId
	 *
	 * @param  int $weId   wechat id
	 *
	 * @return array
	 */
	public function getMessageNotRead($weId, $agentid) {
		$model = M('WechatMessage');
		$where = array(
			'WeId' => intval($weId),
			'agentId' => intval($agentid),
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
	 * 下载多媒体文件
	 *
	 * @param  int $weId     wechat id
	 * @param  string $media_id MEDIAID
	 *
	 * @return 媒体文件URL
	 */
	public function getMediaInfo($weId, $media_id) {
		$wechat = D('Wechat')->getInfoById($weId);
		if (!$wechat) {
			return false;
		}
		importORG('Wechat.Media');
		$weMedia = new Media($wechat['app_id'], $wechat['app_secret']);
		$res = $weMedia->get($media_id);

		if ($res === false) {
			$this->error = $weMedia->getErrorInfo();
			return false;
		}

		$info = D('Admin/File')->upload(C('WECHAT_UPLOAD'));
		if ($info) {
			$file_url = $info[0]['url'];
		}

		/*$filepath = ROOT_PATH . '/uploads/Wechat/';
		$file_name = $filepath . $res['name'];
		$file_url = '/uploads/Wechat/' . $res['name'];

		file_write($file_name, $res['content']);*/

		return $file_url;
	}
}