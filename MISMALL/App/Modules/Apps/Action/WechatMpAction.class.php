<?php
/**
 * 微信公众号管理
 */
class WechatMpAction extends BaseAction {
	/**
	 * 帐号信息
	 *
	 * @var array
	 */
	protected $wechat;

	/**
	 * 账号ID
	 *
	 * @var int
	 */
	protected $weId;

	protected $model;

	protected $supper_wechat_id;

	protected $appInfo;

	/**
	 * 初始化帐户信息
	 */
	protected function _initialize() {
		parent::_initialize();

		//获取用户信息
		if (!session('uid')) {
			$this->redirect("/Index/index?relogin=1");
		}

		$user_id = session('uid');
		$wechatId = I('get.wid', 0, 'intval');
		if (!$wechatId) {
			$wechatId = session('wechatId');
		} else {
			session('wechatId', $wechatId);
		}

		$this->model = D('WechatMp');
		$weiInfo = D('Wechat')->getInfoById($wechatId);
		if (!$weiInfo) {
			//throw new Exception('公众号不存在');
			redirect(U('/MyCenter/buy_wq'), '公众号不存在');
		}

		$this->wechat = $weiInfo;
		$this->weId = $weiInfo['id'];
		$this->assign('wechat', $this->wechat);

		//app info
		$site_id = session('ez_site_id');
		$this->appInfo = D('Wechat')->getAppInfoBySiteId($this->weId, $site_id);

		//虚拟公众号
		$this->supper_wechat_id = C('SUPPER_WECHAT_ID');
		if ($this->supper_wechat_id == $this->weId && $this->appInfo['agentId'] > 0) {
			$this->assign('is_supper_wechat', 1);
		} else {
			$this->assign('is_supper_wechat', 0);
		}

		if (!$this->appInfo) {
			redirect(U('/MyCenter/buy_wq'), '应用绑定微信号错误');
		}

		importORG('Wechat.WechatBase');
	}

	/**
	 * 账号设置
	 */
	public function setting() {

		$this->assign('menu_id', 'mp_setting');
		$this->display('setting');
	}

	public function appSetting() {
		$this->assign('app', $this->appInfo);
		$this->assign('menu_id', 'mp_app_setting');
		$this->display('app_setting');
	}

	/*
	 * 首页设置
	 *
	 * */
	public function appHomeInfo() {
		$siteId = session("ez_site_id");
		$info = M("index_set")->where("siteId='$siteId'")->find();
		$this->assign("info", $info);
		$this->display("appHomeInfo");
	}

	/**
	 * ajax获取应用详细
	 */
	public function ajaxGetAppInfo() {
		$aid = I('get.aid', 0, 'intval');
		$info = $this->model->getAppInfo($aid);
		echo json_encode_cn($info);
	}

	/**
	 * ajax保存应用
	 */
	public function editAppInfo() {
		$affect = D('Wechat')->editWechatApp($this->weId, $_POST);
		echo $affect ? 1 : 0;
	}

	public function autoBind() {
		$wxusername = I('post.user');
		$wxpassword = I('post.pwd');
		$verify = I('post.verify');

		//一键获取账号
		if ($wxusername && $wxpassword && $verify) {
			echo D('Wechat')->autoBind($this->weId, $wxusername, $wxpassword, $verify);
		} else {
			echo '-1';exit;
		}
	}

	//首次关注回复
	public function subscribe() {

		$ruleInfo = $this->model->getMessageSettingInfo($this->weId, $this->appInfo['agentId'], 'subscribe');
		if ($ruleInfo) {
			$message = $ruleInfo['data'];
		} else {
			$ruleInfo['ruleName'] = 'subscribe';
		}
		//print_r($message);exit;
		$this->assign('message', isset($message) ? json_encode($message) : '-1');
		$this->assign('wechat', $this->wechat);
		$this->assign('ruleInfo', $ruleInfo);
		$this->assign('menu_id', 'mp_subscribe');
		$this->assign('page_title', '首次关注回复');
		$this->display('message_setting');
	}

	/**
	 * 关键字列表
	 */
	public function keywordList() {
		$keywordsList = $this->model->getKeywordsList($this->weId, $this->appInfo['agentId']);

		$this->assign('keywordsList', $keywordsList);
		$this->assign('menu_id', 'mp_keyword');
		$this->display('keyword_list');
	}

	/**
	 * 关键字设置
	 */
	public function keyword() {
		$rule_id = I('id', 0, 'intval');
		if ($rule_id) {
			$ruleInfo = $this->model->getMessageSettingInfo($this->weId, $this->appInfo['agentId'], $rule_id);
			if ($ruleInfo) {
				$ruleInfo['keywords'] = $this->model->getKeywordsByRuleId($rule_id);
			}
		}

		$this->assign('ruleInfo', isset($ruleInfo) ? $ruleInfo : array());
		$this->assign('message', isset($ruleInfo) ? json_encode($ruleInfo['data']) : '-1');
		$this->assign('menu_id', 'mp_keyword');
		$this->assign('page_title', '关键词回复');
		$this->display('message_setting');
	}

	/**
	 * 更改关键字规则状态
	 */
	public function keywordStatus() {
		$id = I('id', 0, 'intval');
		$rule = $this->model->getMessageSettingInfo($this->weId, $this->appInfo['agentId'], $id);

		if (!$rule) {
			echo '-1';exit;
		}
		$status = abs(1 - $rule['status']);
		$model = M('WechatMessageSetting');
		$model->where(array('id' => $id))->save(array('status' => $status));
		echo $status;exit;
	}

	public function message_setting() {
		$query = I('post.query', '', 'trim');
		$rule_name = I('post.rule_name', 'subscribe');
		$rule_id = I('post.rule_id', 0, 'intval');
		$msgType = I('post.msgType', 'text');
		$keywords = I('post.keywords');
		$action_name = I('post.action_name');
		$FromUserName = I('post.FromUserName');
		$WeId = $this->weId;

		switch ($msgType) {
			//图片
			case 'image':
				$cover_id = I('post.cover_image_id', '0', 'intval');
				$cover_path = I('post.cover_image_path', '', 'trim');
				$file = $cover_path;
				//上传媒体到企业号
				$media_id = $this->model->uploadMedia($this->weId, $this->app_secret, $file);
				if ($media_id === false) {
					$this->error($this->model->getError());
				}
				$send_content = $media_id;
				//保存素材
				$save_content = array(
					'cover_image_id' => $cover_id,
					'cover_image_path' => $cover_path,
				);
				break;
			//语音
			case 'voice':
				$cover_id = I('post.cover_voice_id', '0', 'intval');
				$cover_path = I('post.cover_voice_path', '', 'trim');
				$file = $cover_path;
				//上传媒体到企业号
				$media_id = $this->model->uploadMedia($this->weId, $this->app_secret, $file);
				if ($media_id === false) {
					$this->error($this->model->getError());
				}
				$send_content = $media_id;
				//保存素材
				$save_content = array(
					'cover_voice_id' => $cover_id,
					'cover_voice_path' => $cover_path,
				);
				break;
			//视频
			case 'video':
				$cover_id = I('post.cover_video_id', '0', 'intval');
				$cover_path = I('post.cover_video_path', '', 'trim');
				$file = $cover_path;
				$title = I('post.video_title');
				$content = I('post.video_content');
				//上传媒体到企业号
				$media_id = $this->model->uploadMedia($this->weId, $this->app_secret, $file);
				if ($media_id === false) {
					$this->error($this->model->getError());
				}

				$send_content = array(
					$media_id,
					$title,
					$content,
				);
				//保存素材
				$save_content = array(
					'cover_video_id' => $cover_id,
					'cover_video_path' => $cover_path,
					'video_title' => $title,
					'video_content' => $content,
				);
				break;
			//单图文
			case 'mpnews':
				$cover_id = I('post.cover_mpnews_id', '0', 'intval');
				$cover_path = I('post.cover_mpnews_path', '', 'trim');
				$pic_url = getImageUrl($cover_path, 360, 200);

				$title = I('post.mpnews_title', '', 'trim');
				$content = I('post.mpnews_content', '', 'trim');
				$author = I('post.mpnews_author', '', 'trim');
				$url = I('post.mpnews_url', '', 'trim');
				$description = I('post.mpnews_description', '', 'trim');

				$send_content = array(
					$title,
					$content,
					$pic_url,
					$url,
				);
				//保存素材
				$save_content = array(
					'cover_mpnews_id' => $cover_id,
					'cover_mpnews_path' => $cover_path,
					'mpnews_title' => $title,
					'mpnews_content' => $content,
					'author' => $author,
					'url' => $url,
					'mpnews_description' => $description,
					'mpnews_pic' => $show_pic,
				);
				break;
			//多图文
			case 'news':
				$query = I('post.query', '', 'trim');
				if ($query == '-1') {
					$this->error('图文内容不能为空');
				}
				$list = json_decode($query);

				$send_content = array();

				foreach ($list as $key => $value) {
					if (empty($value->title) || intval($value->cover_news_id) == 0) {
						continue;
					}
					$send_content[] = array(
						$value->title,
						$value->description,
						$value->url,
						U($value->cover_news_path, false, false, false, true),
					);
					//保存
					$save_content[] = (array) $value;
				}
				break;
			//文字类型
			case 'text':
			default:
				$msgType = 'text';
				$send_content = I('post.text_content', '', 'trim');
				$save_content = $send_content;
				break;
		}

		//主动发客户消息
		if ($action_name == 'memberSend' && $FromUserName) {
			//发送消息
			importORG('Wechat.Message');
			$message = new Message($this->wechat['app_id'], $this->wechat['app_secret']);
			$result = $message->sendMessage($send_content, $FromUserName, $msgType);
			if ($result === FALSE) {
				$this->error($message->getErrorInfo());
			} else {
				$this->success('发送成功！', U('memberList'));
			}
		}

		//保存素材
		//$longSave = I('post.longSave', 0, 'intval');
		//if ($longSave) {
		$status = $this->model->editMessageSetting($this->weId, $this->appInfo['agentId'], $msgType, $save_content, $rule_id, $rule_name);
		//}

		if ($status) {
			//设置关键字
			if (isset($keywords) && $keywords) {
				$this->model->addKeywords($WeId, $rule_id ? $rule_id : $status, $keywords);
			}
			switch ($action_name) {
				case 'subscribe':
					$url = U('subscribe');
					break;
				case 'keyword':
					$url = U('keywordList');
					break;
				default:
					$url = '';
					break;
			}
			$this->success('操作成功', $url);
		} else {
			$this->error('操作失败');
		}
	}

	/**
	 * 菜单列表
	 */
	public function menuList() {
		$menulist = $this->model->getMenuList($this->weId);
		$menulist = list_to_tree($menulist);

		$this->assign('menulist', $menulist);
		$this->assign('menu_id', 'mp_menu');
		$this->display('menu_list');
	}

	/**
	 * 编辑菜单
	 */
	public function menuEdit() {
		$id = I('get.id', 0, 'intval');

		if (IS_POST) {
			$post = I('post.', '', 'trim');
			if (empty($post['name'])) {
				$this->error('菜单标题不能为空');
			}
			if (empty($post['url'])) {
				$this->error('菜单链接不能为空');
			}

			$pid = $post['pid'];

			if ($pid == $id && $pid != 0) {
				$this->error('上级分类不能为本分类');
			}
			//一级菜单最多4个汉字，二级菜单最多7个汉字
			if ($pid) {
				$post['name'] = sub_str($post['name'], 0, 14);
			} else {
				$post['name'] = sub_str($post['name'], 0, 8);
			}

			if (!$this->model->checkMenuCount($this->weId, $pid, $id)) {
				$this->error('超过限制，一级最多3个，子级最多5个');
			}
			$post['WeId'] = $this->weId;
			$post['status'] = $post['status'] == 'off' ? 0 : 1;
			$status = $this->model->editMenu($post, $id);

			if ($status) {
				$return = array(
					'info' => '操作成功',
					'status' => 'success',
					'url' => U('menuList'),
				);
				echo $this->ajaxReturn($return);
			} else {
				$this->error('编辑失败');
			}
		}
		if ($id) {
			$menu = $this->model->getMenu($id);
		}
		if (empty($menu)) {
			$menu['status'] = 1;
			$menu['type'] = 'view';
		}
		$menulist = $this->model->getMenuList($this->weId, 0);

		$this->assign('menulist', $menulist);
		$this->assign('menu_id', 'mp_menu');
		$this->assign('menu', $menu);
		$this->display('menu_edit');
	}

	/**
	 * 删除菜单
	 */
	public function menuDelete() {
		importORG('Wechat.Menu');
		$weMenu = new Menu($this->wechat['app_id'], $this->wechat['app_secret']);
		$res = $weMenu->menuDelete();
		echo $weMenu->getErrorInfo();
		print_r($res);exit;
		$id = I('post.id', 0, 'intval');
		if ($id == 0) {
			echo '-1';exit;
		}

		$this->model->menuDelete($id);
		echo 'success';exit;
	}

	public function menuAdd() {
		$data[] = array(
			'type' => 'view',
			'name' => '进入',
			'url' => U("/Site/Wechat/applist", false, false, false, true),
		);

		importORG('Wechat.Menu');
		$weMenu = new Menu($this->wechat['app_id'], $this->wechat['app_secret']);
		$res = $weMenu->menuCreate($data);
		if ($res) {
			$this->success('菜单同步到微信成功！');
		} else {
			$this->error('同步失败:' . $weMenu->getErrorInfo());
		}

	}

	/**
	 * 设置菜单状态
	 */
	public function menuStatus() {
		$id = I('post.id', 0, 'intval');
		$status = I('post.status', 0, 'intval');
		$pid = I('post.pid', 0, 'intval');
		if ($id == 0) {
			echo '-1';exit;
		}

		if (!$this->model->checkMenuCount($this->weId, $pid, $id)) {
			echo '-2';exit;
		}

		$status = abs(1 - $status);
		$affcet = $this->model->editMenu(array('status' => $status), $id);
		if ($affcet) {
			echo 'success';exit;
		} else {
			echo '0';exit;
		}
	}

	/**
	 * 同步更新到微信
	 */
	public function syncMenu() {
		$WeId = $this->weId;
		$menulist = $this->model->setSyncWechatMenu($WeId);

		if (!$menulist) {
			$this->error('菜单为空，请先设置菜单！');
		}

		$data = array();
		foreach ($menulist as $key => $menu) {
			$data[$key] = array(
				'name' => $menu['name'],
			);
			if (isset($menu['_child']) && is_array($menu['_child'])) {
				foreach ($menu['_child'] as $m => $child) {
					if ($m > 5) {
						break;
					}

					$data[$key]["sub_button"][] = array(
						'type' => $child['type'],
						'name' => $child['name'],
						'url' => substr($child['url'], 0, 7) == 'http://' ? $child['url'] : U($child['url'], false, false, false, true),
						'key' => $child['key'],
					);
				}
			} else {
				$data[$key]['type'] = $menu['type'];
				$data[$key]['url'] = substr($menu['url'], 0, 7) == 'http://' ? $menu['url'] : U($menu['url'], false, false, false, true);
				$data[$key]['key'] = $menu['key'];
			}
		}

		importORG('Wechat.Menu');
		$weMenu = new Menu($this->wechat['app_id'], $this->wechat['app_secret']);
		$res = $weMenu->menuCreate($data);
		if ($res) {
			$this->success('菜单同步到微信成功！');
		} else {
			$this->error('同步失败:' . $weMenu->getErrorInfo());
		}
	}

	/**
	 * 同步APP应用菜单
	 */
	public function menusyncApp() {

		$site_id = M('UserSite')->where(array('wechatId' => $this->weId, 'userId' => session('uid')))->getField('id');
		if (!$site_id) {
			$this->error('无应用');
		}
		$qyAppId = 0;

		//微企应用添加菜单URL到微信菜单表
		$action = A('Qywx/Editor');
		$content = $action->getTempaltePageContent('qyConfig', $site_id);
		if ($content) {
			//清空现有菜单
			$model = M('WechatMenu');
			$model->where(array('WeId' => $this->weId, 'qyAppId' => $qyAppId))->delete();
			//初始化APP应用菜单
			$menuList = json_decode(urldecode($content));
			foreach ($menuList as $pageId => $menu) {
				$set = array(
					'url' => U('/Site/Wechat/checkUser', array('pageId' => $pageId, 'siteId' => $site_id)),
					'name' => $menu->menuName,
					'type' => isset($menu->type) ? $menu->type : 'view',
					'key' => isset($menu->key) ? $menu->key : '',
					'pid' => 0,
					'qyAppId' => $qyAppId,
					'WeId' => $this->weId,
				);
				$pid = $this->model->editMenu($set);
				if (isset($menu->subMenu) && $menu->subMenu) {
					foreach ($menu->subMenu as $subPage => $subMenu) {
						$set = array(
							'url' => U('/Site/Wechat/checkUser', array('pageId' => $subPage, 'siteId' => $site_id)),
							'name' => $subMenu->menuName,
							'type' => isset($subMenu->type) ? $subMenu->type : 'view',
							'key' => isset($subMenu->key) ? $subMenu->key : '',
							'pid' => $pid,
							'qyAppId' => $qyAppId,
							'WeId' => $this->weId,
						);
						$this->model->editMenu($set);
					}
				}
			}
			$return = array(
				'info' => '初始化菜单成功',
				'status' => 'success',
				'url' => U('menulist', array('aid' => $appInfo['id'])),
			);
			echo $this->ajaxReturn($return);
		}
		$this->error('应用无菜单');
	}

	/**
	 * 用户分组管理
	 */
	public function groupList() {
		$grouplist = $this->model->getGroupList($this->weId);
		$this->assign('grouplist', $grouplist);
		$this->assign('menu_id', 'mp_group');
		$this->display('member_group');
	}

	/**
	 * 编辑分组
	 */
	public function groupEdit() {
		$title = I('post.title');
		$id = I('post.id', 0, 'intval');

		if (empty($title)) {
			echo '-1';exit;
		}
		//检查名称是否重复
		if ($this->model->checkGroupName($this->weId, $title, $id)) {
			echo '-2';exit;
		}

		$status = $this->model->groupEdit($this->weId, $title, $id);

		if ($status) {
			echo 'success';exit;
		} else {
			echo $this->model->getError();exit;
		}
	}

	/**
	 * 删除分组
	 * TODO微信不能删除分组，暂不启用
	 */
	public function groupDelete() {
		$id = I('post.id', 0, 'intval');
		$this->model->groupDelete($id);
		echo 'success';exit;
	}

	public function syncGroup() {
		$status = $this->model->syncGroup($this->weId);
		if ($status) {
			$return = array(
				'info' => ' 同步成功',
				'status' => 'success',
				'url' => U('group'),
			);
		} else {
			$return = array(
				'info' => $this->model->getError(),
			);
		}
		echo $this->ajaxReturn($return);
	}

	/**
	 * 粉丝列表
	 */
	public function memberList() {
		//同步粉丝列表
		$this->model->getSyncMemberList($this->weId, $this->appInfo['agentId']);
		$page = I('get.page', 1, 'intval');
		$pageRow = 15;
		$memberList = $this->model->getAppMemberList($this->weId, $this->appInfo['agentId'], $page, $pageRow);
		$totalCount = $this->model->getAppMemberCount($this->weId, $this->appInfo['agentId']);
		//$memberGroups = $this->model->getWechatGroups($this->weId);

		$this->assign('memberlist', $memberList);
		//$this->assign('memberGroups', $memberGroups);
		$this->assign('menu_id', 'mp_member');
		$this->assign('pageRow', $pageRow);
		$this->assign('totalCount', $totalCount);
		$this->display('member_list');
	}

	/**
	 * 编辑粉丝信息
	 */
	public function editMember() {
		$group_id = I('post.groupid', 0, 'intval');
		$remark = I('post.remark');
		$id = I('post.id', 0, 'intval');
		if (!$id) {
			echo 0;exit;
		}
		$userInfo = $this->model->getMemberInfo($id);
		if (!$userInfo) {
			echo -1;exit;
		}
		if ($userInfo['roleID'] == $group_id) {
			echo 0;exit;
		}
		$set = array();
		if ($group_id) {
			$set['roleID'] = $group_id;
		}
		if ($remark) {
			$set['remark'] = $remark;
		}
		if (!$set) {
			echo -2;exit;
		}
		$affect = $this->model->updateMember($this->weId, $this->appInfo['agentId'], $id, $set);
		if (!$affect) {
			echo $this->model->getError();exit;
		}
		echo 'success';exit;
	}

	public function syncMember() {
		$status = $this->model->getSyncMemberList($this->weId, $this->appInfo['agentId']);
		if ($status) {
			$return = array(
				'info' => ' 同步成功',
				'status' => 'success',
				'url' => U('memberList'),
			);
		} else {
			$return = array(
				'info' => $this->model->getError(),
			);
		}
		echo $this->ajaxReturn($return);
	}

	/**
	 * 与用户聊天发送消息
	 * 主动发信息给粉丝
	 */
	public function memberSend() {
		$id = I('get.id', 0, 'intval');
		$userInfo = $this->model->getMemberInfo($id);
		if (!$userInfo) {
			$this->error('用户不存在', U('memberList'));
		}
		$this->assign('userName', $userInfo['userName']);
		$this->assign('FromUserName', $userInfo['openid']);
		$this->assign('ruleInfo', array());
		$this->assign('message', '-1');
		$this->assign('menu_id', 'mp_member');
		$this->display('message_setting');
	}

	/**
	 * 消息中心
	 */
	public function messageList() {
		$this->assign('menu_id', 'mp_message');
		$this->display('message_list');
	}

	/**
	 * get user info
	 * @return echo json data
	 */
	public function getUserCart() {
		$openid = I('get.uid');
		$info = $this->model->getMemberInfo($openid);
		$groupArray = $this->model->getWechatGroups($this->weId);
		$info['group'] = $groupArray[$info['roleID']];
		echo json_encode_cn($info);
	}

	/**
	 * action get wechat message list
	 */
	public function getMessageList() {
		$agentid = I('post.agentId', $this->appInfo['agentId'], 'intval');
		$list = $this->model->getMessageList($this->weId, $agentid);
		echo json_encode_cn($list);
	}

	/**
	 * action get wechat user message list and message replay
	 */
	public function getUserMessageList() {
		$openid = I('post.uid');
		$mid = I('post.mid', 0, 'intval');

		$list = $this->model->getUserMessageList($this->weId, $this->appInfo['agentId'], $openid, $mid);
		echo json_encode($list);
	}

	/**
	 * replay user message
	 */
	public function ajaxMessageReplay() {
		$FromUserName = I('post.userid', '', 'trim');
		$send_content = I('post.content', '', 'trim');
		$msgId = I('post.msgId');
		$agentid = I('post.agentId', $this->appInfo['agentId'], 'intval');

		//发送消息
		importORG('Wechat.Message');
		$message = new Message($this->wechat['app_id'], $this->wechat['app_secret']);
		$result = $message->sendMessage($send_content, $FromUserName, 'text');
		if ($result === FALSE) {
			echo $message->getErrorInfo();exit;
		}
		//消息入库
		$data = array(
			'MsgType' => 'text',
			'FromUserName' => $FromUserName,
			'CreateTime' => time(),
			'MsgId' => 0,
			'parentId' => $msgId,
			'isRead' => 1,
			'Content' => $send_content,
		);
		$this->model->addMessage($this->weId, $data, $agentid);
		echo 'success';
	}

	//ajax push message
	public function ajaxMessagePush() {
		$agentid = I('post.agentId', $this->appInfo['agentId'], 'intval');
		$res = $this->model->getMessageNotRead($this->weId, $agentid);
		echo json_encode($res);
	}

	//get wechat media infomation
	public function getMediaInfo() {
		$msg_id = I('get.id', 0, 'intval');
		$result = array(
			'error' => 1,
			'info' => '',
		);

		$msgInfo = $this->model->getMessageInfo($msg_id);
		if (!($msgInfo && in_array($msgInfo['MsgType'], array('image', 'voice', 'video')))) {
			$result['info'] = '消息不存在';
			echo json_encode($result);exit;
		}
		//image voice video
		if (isset($msgInfo['data']['MediaUrl']) && $msgInfo['data']['MediaUrl']) {
			$result = array(
				'error' => 0,
				'type' => $msgInfo['MsgType'],
				'MediaUrl' => $msgInfo['data']['MediaUrl'],
			);
			//get video thumb image
			if ($msgInfo['MsgType'] == 'video') {
				$result['ThumbMediaUrl'] = $msgInfo['data']['ThumbMediaUrl'];
			}
			echo json_encode($result);exit;
		}

		$media_id = $msgInfo['data']['MediaId'];

		$file_url = $this->model->getMediaInfo($this->weId, $media_id);
		if (!($file_url && is_file(ROOT_PATH . $file_url))) {
			echo json_encode($result);exit;
		}

		$post = array(
			'MediaUrl' => $file_url,
		);
		$file_thumb_url = '';
		//video get thumb image url
		if ($msgInfo['MsgType'] == 'video') {

			$file_thumb_url = $this->model->getMediaInfo($this->WeId, $msgInfo['data']['ThumbMediaId']);
			if (!($file_thumb_url && is_file(ROOT_PATH . $file_thumb_url))) {
				$post['ThumbMediaUrl'] = $file_thumb_url;
			}
		}
		$set['data'] = array_merge($post, $msgInfo['data']);

		$this->model->updateMessage($msg_id, $set);

		$result = array(
			'error' => 0,
			'type' => $msgInfo['MsgType'],
			'MediaUrl' => getImageUrl($file_url),
		);
		if ($msgInfo['MsgType'] == 'video' && $file_thumb_url) {
			$result['ThumbMediaUrl'] = $file_thumb_url;
		}
		echo json_encode($result);exit;

	}

	public function qrcode() {
		$agentid = intval($this->appInfo['agentId']);
		if ($agentid == 0) {
			exit;
		}

		importORG('Wechat.Qrcode');
		$qrcode = new Qrcode($this->wechat['app_id'], $this->wechat['app_secret']);
		//Array ( [ticket] => gQFf8ToAAAAAAAAAASxodHRwOi8vd2VpeGluLnFxLmNvbS9xLzRVd1JPR0RtZTkwQ2g0YTJUbURPAAIEUrSnVAMEAAAAAA== [url] => http://weixin.qq.com/q/4UwROGDme90Ch4a2TmDO )
		$response = $qrcode->create($agentid);
		if ($response === FALSE) {
			echo $qrcode->getErrorInfo();
			exit;
		}

		$res = $qrcode->show($response['ticket']);
		if ($res === FALSE) {
			echo $res->getErrorInfo();
			exit;
		}

		Header("Content-type: image/jpeg");
		exit($res['content']);
	}

	public function setCustomerService() {
		$id = I('param.id', 0, 'intval');
		if ($id == 0) {
			echo -1;exit;
		}

		$memberinfo = $this->model->getMemberInfo($id);
		if (!$memberinfo) {
			echo -1;exit;
		}
		$affect = $this->model->setCoustomerService($this->weId, $this->appInfo['agentId'], $memberinfo['openid']);
		echo $affect ? 'success' : '-2';exit;
	}

	/*
	 * 保存首页设置  后台管理那里的
	 * */
	public function saveIndexSeting() {
		$title = I("post.title", "", "trim");
		$img_data = I("post.img_data", "", "trim");
		$info_content = I("post.info_content", "");
		$url = I("post.url", "", "trim");
		if (empty($title) && empty($img_data) && empty($info_content)) {
			echo "0";
		}

		echo D("UserSite")->saveIndexSeting($title, $img_data, $info_content, $url);

	}
}