<?php
/**
 * 微信企业号管理后台
 *
 * @author cjli developerlcj@gmail.com
 * @time 2014/11/11 17:38
 */
class WechatQyAction extends BaseAction {
	/**
	 * 帐号信息
	 *
	 * @var array
	 */
	protected $wechat;

	/**
	 * 账号ID
	 * @var int
	 */
	protected $weId;

	//模块
	private $model;
	//权限组ID
	private $groupId;

	private $app_secret;

	private $back_check_access = array('login', 'setting', 'group', 'groupEdit', 'manger_password');

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
		$qyWechatId = I('get.wid', 0, 'intval');
		if (!$qyWechatId) {
			$qyWechatId = session('qyWechatId');
		} else {
			session('qyWechatId', $qyWechatId);
		}

		$this->model = D('WechatQy');

		if (!$qyWechatId) {
			//企业号创建者-平台用户
			if ($user_id) {
				$userInfo = M('Users')->where(array('ID' => $user_id))->field('userEmail, userPwd, userName, qyWechatId')->find();
				$qyWechatId = $userInfo['qyWechatId'];
				//添加平台用户与企业号关联
				if (!$qyWechatId) {
					redirect(U('/Index/index'), '非法操作');
				}
				// wechat creaetor
				if (!$this->model->checkAdminMember($qyWechatId)) {
					//添加企业号管理员
					$set = array(
						'userName' => $userInfo['userName'],
						'userEmail' => $userInfo['userEmail'],
						//'userPwd' => $userInfo['userPwd'],
						'relationUserId' => $user_id,
						'isCreator' => 1,
					);
					$this->model->addAdminMember($qyWechatId, $set);
					//添加默认企业应用
					$this->model->editQyWechatApp($qyWechatId);
					//session('wechat-hash', $hash);
					session('qyWechatId', $qyWechatId);
					redirect(U('setting?first_login=1'));
				} else if (!$this->model->checkAdminMember($qyWechatId, array('relationUserId' => $user_id, 'status' => 1))) {
					redirect(U('/MyCenter/web_wx'), '您不是管理员或者已经禁用，请联系系统管理员');
				}
			} else {
				//跳转到会员中心
				redirect(U('/MyCenter/web_wx'));
			}
		}

		$weiInfo = D('Wechat')->getInfoById($qyWechatId);
		if (!$weiInfo) {
			//throw new Exception('公众号不存在');
			redirect(U('/MyCenter/web_wx'), '公众号不存在');
		}

		$this->wechat = $weiInfo;
		$this->weId = $weiInfo['id'];
		$this->assign('wechat', $this->wechat);

		importORG('Wechat.WechatBase');

		// if aciton is't login check
		if (!in_array(ACTION_NAME, $this->back_check_access)) {
			$this->app_secret = session('qy_wechat_app_secret');
			$this->groupId = session('qy_wechat_group_id');
			if (!$this->app_secret) {
				if ($this->wechat['app_id']) {
					//如果已经设置了管理组
					if ($group_id = $this->model->getAdminMemberGroupId($this->weId, $user_id)) {
						$group = $this->model->getGroupInfo($this->weId, $group_id);
						session('qy_wechat_app_secret', $group['secret']);
						session('qy_wechat_group_id', $group['id']);
						$this->app_secret = $group['secret'];
						$this->groupId = $group['id'];
					} else {
						redirect(U('group'));
					}
				}
				$this->setting();
			}
		}
		//TODO user group id
		//$this->groupId = 1;
		//$this->app_secret = 'mntte7CvGiJorrTPVtKuENXCNUk3gD7onetM6IurbhPlWmUQZpmPSSD8dANwndn1';

	}

	public function index() {
		//redirect(U('Admin/setting'));
		$this->setting();
	}

	/**
	 * 微信企业号设置
	 */
	public function setting() {
		$this->assign('menu_id', 'qy_setting');
		$this->display('setting');
	}

	/**
	 * 用户分组管理
	 */
	public function group() {
		$grouplist = $this->model->getGroupList($this->weId);
		$this->assign('grouplist', $grouplist);
		$this->assign('menu_id', 'qy_group');
		$this->display('group');
	}

	/**
	 * 编辑分组
	 */
	public function groupEdit() {
		$title = I('post.title');
		$secret = I('post.secret');
		$id = I('post.id', 0, 'intval');

		if (empty($title)) {
			echo '-1';exit;
		}
		if (empty($secret)) {
			echo '-2';exit;
		}
		//检查名称是否重复
		if ($this->model->checkGroupName($this->weId, $title, $id)) {
			echo '-3';exit;
		}

		$set = array(
			'name' => $title,
			'secret' => $secret,
			'id' => $id,
		);

		$status = $this->model->groupEdit($this->weId, $set);

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

	/**
	 * 部门管理
	 */
	public function department() {
		//树型数组
		$tree = $this->model->getDepartmentTree($this->weId);

		$this->assign('tree', $tree);
		$this->assign('menu_id', 'qy_department');
		$this->display('department');
	}

	//部门列表
	public function department_tree($tree = null) {
		$this->assign('tree', $tree);
		$this->display('department_tree');
	}

	/**
	 * TODO 作废
	 * 同步企业号部门
	 */
	public function departmentSync() {
		$affect = $this->model->syncDepartmentList($this->weId, $this->app_secret);
		if (!$affect) {
			echo $this->model->getError();
		} else {
			echo 'success';
		}
	}

	/**
	 * 编辑部门
	 */
	public function departmentEdit() {
		$title = I('post.title');
		$pid = I('post.pid', 0, 'intval');
		$id = I('post.id', 0, 'intval');

		if (empty($title)) {
			echo '-1';exit;
		}

		//检查名称是否重复
		if ($this->model->checkDepartmentName($this->weId, $title, $id)) {
			echo '-3';exit;
		}

		$set = array(
			'name' => $title,
			'parentid' => $pid,
		);

		$status = $this->model->syncdepartment($this->weId, $this->app_secret, $set, $id);

		if ($status) {
			echo 'success';exit;
		} else {
			echo $this->model->getError();exit;
		}
	}

	/**
	 * 删除部门
	 */
	public function departmentDelete() {
		$id = I('post.id', 0, 'intval');
		$status = $this->model->departmentDelete($id, $this->app_secret);
		if ($status) {
			echo 'success';exit;
		} else {
			echo $this->model->getError();exit;
		}
	}

	/**
	 * 成员列表
	 */
	public function memberList() {
		$memberList = $this->model->getMemberList($this->weId);
		$groups = $this->model->getDepartmentArray($this->weId);

		$this->assign('memberlist', $memberList);
		$this->assign('groups', $groups);
		$this->assign('menu_id', 'qy_member');
		$this->display('member_list');
	}

	public function editMember() {
		$id = I('get.id');

		if (IS_POST) {

			$user_id = I('post.userid');
			$user_name = I('post.name');
			$weixinid = I('post.weixinid');
			$mobile = I('post.mobile');
			$email = I('post.email');
			$department = $_POST['department'];
			$position = I('post.position');

			if (empty($user_name)) {
				echo '-3';exit;
			}

			if (empty($user_id)) {
				echo '-1';exit;
			}

			if ($this->model->checkMember($this->weId, 'userid', $user_id, $id)) {
				echo '-2';exit;
			}

			//if(! $this->model->checkMember($this->weId, 'name', $user_name, $id) ){
			//	echo '-4';exit;
			//}

			if (empty($weixinid) && empty($mobile) && empty($email)) {
				echo '-5';exit;
			}

			if ($weixinid && $this->model->checkMember($this->weId, 'weixinid', $weixinid, $id)) {
				echo '-6';exit;
			}

			import('ORG.Util.Validate');
			if ($mobile) {
				if (!Validate::check($mobile, 'mobile')) {
					echo '-7';exit;
				} elseif ($this->model->checkMember($this->weId, 'mobile', $mobile, $id)) {
					echo '-8';exit;
				}
			}

			if ($email) {
				if (!Validate::check($email, 'email')) {
					echo '-9';exit;
				} elseif ($this->model->checkMember($this->weId, 'email', $email, $id)) {
					echo '-10';exit;
				}
			}

			if (!is_array($department) || empty($department)) {
				echo '-11';exit;
			}

			//同步信息
			$affect = $this->model->sysMemberInfo($this->weId, $this->app_secret, $_POST);
			if (!$affect) {
				echo $this->model->getError();exit;
			}
			echo 'success';exit;
		}
		if ($id) {
			$userInfo = $this->model->getMemberInfo($this->weId, $id, 'id');
		}

		$departmentList = $this->model->getDepartmentList($this->weId);

		$this->assign('info', $userInfo);
		$this->assign('departmentList', $departmentList);
		$this->assign('menu_id', 'qy_member');
		$this->display('member_form');
	}

	/**
	 * 编辑通讯录状态
	 */
	public function editMemberStatus() {
		$id = I('get.id', 0, 'intval');
		$status = I('get.status', '');
		$statusArr = array(1, 0, -1); //1表示启用成员，0表示禁用成员, -1表示删除

		if (!in_array($status, $statusArr)) {
			echo '-1';exit;
		}

		$userInfo = $this->model->getMemberInfo($this->weId, $id, 'id');
		if (!$userInfo) {
			echo '-2';exit;
		}

		$post = array(
			'userid' => $userInfo['userid'],
			'enable' => $status,
		);
		//同步信息
		$affect = $this->model->sysMemberInfo($this->weId, $this->app_secret, $post);
		if (!$affect) {
			echo $this->model->getError();exit;
		}
		echo 'success';exit;
	}

	/**
	 * TODO 作废
	 * 同步成员列表
	 */
	public function memberSync() {
		$affect = $this->model->syncMemberList($this->weId, $this->app_secret);
		if (!$affect) {
			echo $this->model->getError();
		} else {
			echo 'success';
		}
	}

	/**
	 * TODO 作废
	 * 全部信息同步
	 */
	public function qySync() {
		//初始化部门
		/*$dep = array(
		'parentid'	=> 0,
		'depId'		=> 1,
		'name'		=> $this->wechat['name'],
		);
		$this->model->addLocationDepartment($this->weId, $dep);
		 */
		//判断权限是否存在
		$groupInfo = $this->model->getGroupInfo($this->weId, $this->groupId);
		if (!$groupInfo) {
			$this->error('你无权同步');
		}

		//add app
		//$this->model->editQyWechatApp($this->weId);

		//同步部门
		$this->model->syncDepartmentList($this->weId, $this->app_secret);
		//同步成员
		$this->model->syncMemberList($this->weId, $this->app_secret);
		$this->success('同步成功', U('setting'));
	}

	/**
	 * 群发消息-应用列表
	 */
	public function messageAppList() {
		$applist = $this->model->getQyAppList($this->weId, 1);

		$this->assign('applist', $applist);
		$this->assign('menu_id', 'send');
		$this->display('message_app_list');
	}

	/**
	 * 群发消息
	 *
	 * @param int $aid 应用ID
	 *
	 */
	public function sendMessage() {
		/*$aid = I('get.aid', 0, 'intval');

		if (!$aid) {
		$this->error('请选择发消息的应用');
		}
		//获取应用详细内容
		$agent = $this->model->getAppInfo($aid);
		if (! $agent) {
		$this->error('请选择发消息的应用');
		}*/

		$model = M('WechatQyApplist');
		$where = array(
			'WeId' => $this->weId,
			'appId' => session('ez_site_id'),
		);
		$agent = $model->where($where)->find();
		if (!$agent) {
			$this->error('请选择发消息的应用');
		}

		if (empty($agent) || $agent['agentId'] == 0) {
			$this->error('请先在应用配置中设置应用ID', U('appSetting'));
		}

		if (IS_POST) {
			//消息类型
			$msgType = I('post.msgType', 'text');
			switch ($msgType) {
				//图片
				case 'image':
					$cover_id = I('post.cover_image_id', '0', 'intval');
					$cover_path = I('post.cover_image_path', '', 'trim');
					$file = ROOT_PATH . $cover_path;
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
					$file = ROOT_PATH . $cover_path;
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
					$file = ROOT_PATH . $cover_path;
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
				//文件类型
				case 'file':
					$cover_id = I('post.cover_file_id', '0', 'intval');
					$cover_path = I('post.cover_file_path', '', 'trim');
					$file = ROOT_PATH . $cover_path;
					//上传媒体到企业号
					$media_id = $this->model->uploadMedia($this->weId, $this->app_secret, $file);
					if ($media_id === false) {
						$this->error($this->model->getError());
					}
					$send_content = $media_id;
					//保存素材
					$save_content = array(
						'cover_file_id' => $cover_id,
						'cover_file_path' => $cover_path,
					);
					break;
				//单图文
				case 'mpnews':
					$cover_id = I('post.cover_mpnews_id', '0', 'intval');
					$cover_path = I('post.cover_mpnews_path', '', 'trim');
					$file = ROOT_PATH . $cover_path;
					//上传媒体到企业号
					$media_id = $this->model->uploadMedia($this->weId, $this->app_secret, $file);
					if ($media_id === false) {
						$this->error($this->model->getError());
					}

					$title = I('post.mpnews_title', '', 'trim');
					$content = I('post.mpnews_content', '', 'trim');
					$author = I('post.mpnews_author', '', 'trim');
					$url = I('post.mpnews_url', '', 'trim');
					$description = I('post.mpnews_description', '', 'trim');
					$show_pic = I('post.mpnews_pic', 0, 'intval');

					$send_content = array(
						$title,
						$media_id,
						$author,
						$url,
						$content,
						$description,
						$show_pic,
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
					$list = json_decode($query);

					$send_content = array();

					foreach ($list as $value) {
						if (empty($value->title) || intval($value->cover_news_id) == 0) {
							continue;
						}
						$send_content[] = array(
							$value->title,
							$value->description,
							$value->url,
							U($value->cover_news_path, false, false, false, true),
						);
						//保存素材
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

			//保存素材
			$longSave = I('post.longSave', 0, 'intval');
			if ($longSave) {
				$this->model->editMessageSetting($this->weId, $agent['agentId'], $msgType, $save_content);
			}

			//是否保密
			$safe = I('post.safe', 0, 'intval');
			//接收者类型及数据
			$user_type = I('post.user_type', 'touser', 'trim');
			$send_user = I('post.send_user', '', 'trim');
			$touser = $toparty = '';
			if ($user_type == 'touser') {
				$touser = $send_user ? $send_user : '@all';
			} else if ($user_type == 'toparty') {
				$toparty = $send_user ? $send_user : '@all';
			}
			//$touser = '10031|10011';
			//$touser = '@all';
			//群发消息

			$res = $this->model->sendMessage($this->weId, $this->app_secret, $agent['agentId'], $msgType, $send_content, $touser, $toparty, '', $safe);
			if ($res === false) {
				$this->error($this->model->getError());
			}

			$this->success('发送成功！');

		} else {

			/*if($aid === 0) {
			$agent = array(
			'agentId'   => '0',
			'name' => '企业小助手',
			'icon' => C('PUBLIC_URL').'/App/Wechat/images/qy_logo.png',
			);
			}*/

			$this->assign('agent', $agent);
			$this->assign('menu_id', 'qy_send');
			$this->display('message_send');
		}
	}

	/**
	 * ajax获取消息素材列表
	 *
	 * @param int $agentid 应用ID
	 * @param string $msgType 消息类型
	 *
	 */
	public function ajaxGetMessageSetting() {
		$agentid = I('get.agentid', 0, 'intval');
		$msgType = I('get.msgType', 'text');

		$list = $this->model->getMessageSettingList($this->weId, $agentid, $msgType);

		$this->assign('list', $list);
		$this->assign('msgType', $msgType);

		$this->display('message_setting');
	}

	/**
	 * ajax获取消息素材列表
	 */
	public function ajaxGetMessageSettingInfo() {
		$mid = I('get.id', 0, 'intval');
		$info = $this->model->getMessageSettingInfo($mid);
		if (!$info) {
			echo '-1';
		} else {
			echo json_encode_cn($info['data']);
		}
	}

	/**
	 * ajax选择群发用户
	 */
	public function ajaxGetUsers() {
		//$agentid = I('get.agentid', 0, 'intval');
		$admin = I('get.admin', 0, 'intval');

		$groups = $this->model->getDepartmentArray($this->weId);
		if ($groups) {
			foreach ($groups as $group_id => $group_value) {
				$memberlist[] = array(
					'id' => $group_id,
					'list' => $this->model->getMemberListByDepartment($this->weId, $group_id),
				);
			}
		}
		if ($admin) {
			$groupList = $this->model->getGroupList($this->weId);
			$this->assign('groupList', $groupList);
		}

		$this->assign('memberlist', $memberlist);
		$this->assign('admin', $admin);
		$this->assign('groups', $groups);
		$this->display('group_member');
	}

	/**
	 * 消息中心
	 */
	public function messageList() {
		/*$data = array(
		'Content' => '-:)',
		'MsgId' => '56562323sdfq3e234221d'
		);
		echo serialize($data);exit;*/
		//$applist = $this->model->getQyAppList($this->weId, 1);

		//$this->assign('applist', $applist);

		$model = M('WechatQyApplist');
		$where = array(
			'WeId' => $this->weId,
			'appId' => session('ez_site_id'),
		);
		$appInfo = $model->where($where)->find();

		if (empty($appInfo) || $appInfo['agentId'] == 0) {
			$this->error('请先在应用配置中设置应用ID', U('appSetting'));
		}

		$this->assign('app', $appInfo);
		$this->assign('menu_id', 'qy_message');
		//$this->assign('agentId', I('get.aid', 0, 'intval'));
		$this->display('message_list');
	}

	/**
	 * 应用中心
	 */
	public function applist() {
		$applist = $this->model->getQyAppList($this->weId);

		$this->assign('applist', $applist);
		$this->assign('menu_id', 'app');
		$this->display('app_list');
	}

	public function appSetting() {
		$model = M('WechatQyApplist');
		$where = array(
			'WeId' => $this->weId,
			'appId' => session('ez_site_id'),
		);
		$info = $model->where($where)->find();
		$this->assign('app', $info);
		$this->assign('menu_id', 'qy_app');
		$this->display('app_setting');
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
		$affect = $this->model->editQyWechatApp($this->weId, $_POST);
		echo $affect ? 1 : 0;
	}

	/**
	 * get user info
	 * @return echo json data
	 */
	public function getUserCart() {
		$uid = I('get.uid', 0, 'intval');
		$info = $this->model->getMemberInfo($this->weId, $uid);
		$departmentArray = $this->model->getDepartmentArray($this->weId);
		if ($info['department']) {
			$dep_arr = explode(',', $info['department']);
			foreach ($dep_arr as &$d) {
				$d = $departmentArray[$d];
			}
			unset($d);
			$info['department'] = join(',', $dep_arr);
		}
		echo json_encode_cn($info);
	}

	/**
	 * action get wechat message list
	 */
	public function getMessageList() {
		$agentid = I('post.agentId', 0, 'intval');
		$list = $this->model->getMessageList($this->weId, $agentid);
		echo json_encode_cn($list);
	}

	/**
	 * action get wechat user message list and message replay
	 */
	public function getUserMessageList() {
		$uid = I('post.uid', 0, 'intval');
		$mid = I('post.mid', 0, 'intval');
		$agentid = I('post.agentId', 0, 'intval');

		$list = $this->model->getUserMessageList($this->weId, $agentid, $uid, $mid);
		echo json_encode($list);
	}

	/**
	 * replay user message
	 */
	public function ajaxMessageReplay() {
		$agentId = I('post.agentid', 0, 'intval');
		$userid = I('post.userid', '', 'trim');
		$send_content = I('post.content', '', 'trim');
		$msgId = I('post.msgId', 0, 'intval');

		$res = $this->model->sendMessage($this->weId, $this->app_secret, $agentId, 'text', $send_content, $userid);
		if ($res === false) {
			echo $this->model->getError();exit;
		}

		$adminInfo = $this->model->getAdminMemberInfo($this->weId, session('uid'), 'relationUserId');

		$data = array(
			'Content' => $send_content,
			'CreateTime' => time(),
			'formUserId' => isset($adminInfo) && $adminInfo ? $adminInfo['userId'] : '',
			'isRead' => 1,
			'parentId' => $msgId,
		);
		$this->model->addLocationMessage($this->weId, $agentId, $userid, 'text', $data);
		echo 'success';
	}

	//ajax push message
	public function ajaxMessagePush() {
		$agentId = I('post.agentid', 0, 'intval');
		$res = $this->model->getMessageNotRead($this->weId, $agentId);
		echo json_encode($res);
	}

	//qy wechat manage login
	public function login() {
		if (session('qy_wechat_app_secret') && session('qy_wechat_group_id')) {
			redirect(U('setting'));
		}
		if (IS_POST) {
			$user_name = I('post.user', '', 'trim');
			$password = I('post.password', '', 'trim');
			import('ORG.Util.Validate');
			if (!Validate::check($user_name, 'email')) {
				echo L('email_format_error');exit;
			} elseif (!Validate::check($password, 'password')) //验证密码格式
			{
				echo L('password_format_error');exit;
			}

			$userInfo = $this->model->login($this->weId, $user_name, $password);
			if ($userInfo < 0) {
				echo $userInfo;exit;
			}
			$group = $this->model->getGroupInfo($this->weId, $userInfo['groupId']);

			session('qy_wechat_app_secret', $group['secret']);
			session('qy_wechat_group_id', $group['id']);
			session('qy_wechat_user_id', $userInfo['userId']);
			echo 'success';exit;
		}

		if (session('uid')) {
			$userInfo = D('User')->getAUser(array('user_id' => session('uid')));
		}

		$this->assign('user', $userInfo ? $userInfo : array());
		$this->display('login');
	}

	// qy wechat user logout
	public function logout() {
		session('qy_wechat_app_secret', NULL);
		session('qy_wechat_group_id', NULL);
		session('qy_wechat_user_id', NULL);
		redirect(U('/MyCenter/web_wx'));
	}

	public function managerList() {
		$group_id = I('get.groupid', 0, 'intval');

		$err = '';

		if (IS_POST) {
			$status = I('post.s', '');
			$uid = I('post.uid', '');
			//更改状态
			if ($status !== '') {
				$affect = $this->model->changeAdminMemberStatus($this->weId, $uid, $status);
				echo $affect;exit;
			}
			$users = I('post.users', '', 'trim');
			$group_id = I('post.groupid', 0, 'intval');

			$users = explode(';', $users);
			foreach ($users as $user) {
				$user_arr = explode(':', $user);
				$userId = $user_arr[0];
				$count = $this->model->checkAdminMember($this->weId, array('userId' => $userId));
				if ($count) {
					$err .= '用户<strong> ' . $user_arr[1] . ' </strong> 已经是管理员';
				} else {
					$userInfo = $this->model->getMemberInfo($this->weId, $userId);
					if (!$userInfo) {
						$err .= '用户<strong> ' . $user_arr[1] . ' </strong> 不存在';
					} else {
						$set = array(
							'userEmail' => $userInfo['email'],
							'userId' => $userInfo['userid'],
							'userName' => $userInfo['name'],
							'groupId' => $group_id,
						);
						$this->model->addAdminMember($this->weId, $set);
					}
				}
			}
			echo $err;exit;
		}

		$managerList = $this->model->getAdminMemberList($this->weId, $group_id);
		$groupList = $this->model->getGroupList($this->weId);
		$groupArr = array();
		foreach ($groupList as $group) {
			$groupArr[$group['id']] = $group['name'];
		}

		$this->assign('managerList', $managerList);
		$this->assign('groupArr', $groupArr);
		$this->assign('menu_id', 'qy_manager');
		$this->display('manager_list');
	}

	public function manger_password() {
		if (IS_POST) {
			$oldPwd = I('post.oldPwd');
			$newPwd = I('post.newPwd');
			$user_id = I('post.user_id');
			$info = $this->model->getAdminMemberInfo($this->weId, $user_id);
			if (!$info) {
				echo '-6';exit;
			}
			if ($user_id == 0 && $info['relationUserId'] != session('uid')) {
				echo '-7';exit;
			}
			if ($info['userPwd'] != $this->model->password($oldPwd)) {
				echo '-5';exit;
			}
			$affect = $this->model->changeAdminMemberPassword($this->weId, $user_id, $newPwd);
			echo $affect ? 'success' : 'error';
			exit;
		}
		$this->assign('menu_id', 'password');
		$this->display('manger_password');
	}

	//get wechat media infomation
	public function getMediaInfo() {
		$msg_id = I('get.id', 0, 'intval');
		$result = array(
			'error' => 1,
			'info' => '',
		);

		$msgInfo = $this->model->getMessageInfo($msg_id);
		if (!($msgInfo && in_array($msgInfo['msgType'], array('image', 'voice', 'video')))) {
			$result['info'] = '消息不存在';
			echo json_encode($result);exit;
		}
		//image voice video
		if (isset($msgInfo['data']['MediaUrl']) && $msgInfo['data']['MediaUrl']) {
			$result = array(
				'error' => 0,
				'type' => $msgInfo['msgType'],
				'MediaUrl' => getImageUrl($msgInfo['data']['MediaUrl']),
			);
			//get video thumb image
			if ($msgInfo['msgType'] == 'video') {
				$result['ThumbMediaUrl'] = getImageUrl($msgInfo['data']['ThumbMediaUrl']);
			}
			echo json_encode($result);exit;
		}

		$media_id = $msgInfo['data']['MediaId'];

		importORG('Wechat.qy.Qyapi');

		$qyapi = new Qyapi($this->wechat['app_id'], $this->app_secret);

		$res = $qyapi->getMediaInfo($media_id);
		if ($res === false) {
			$result['info'] = $qyapi->getErrorInfo();
			echo json_encode($result);exit;
		}

		$filepath = ROOT_PATH . '/uploads/Wechat/';
		$file_name = $filepath . $res['name'];
		$file_url = '/uploads/Wechat/' . $res['name'];

		file_write($file_name, $res['content']);

		$post = array(
			'MediaUrl' => $file_url,
		);
		$file_thumb_url = '';
		//video get thumb image url
		if ($msgInfo['msgType'] == 'video') {
			$res = $qyapi->getMediaInfo($msgInfo['data']['ThumbMediaId']);
			if ($res) {
				$file_name = $filepath . $res['name'];
				$file_thumb_url = '/uploads/Wechat/' . $res['name'];

				file_write($file_name, $res['content']);

				$post['ThumbMediaUrl'] = $file_thumb_url;
			}
		}
		$set['data'] = array_merge($post, $msgInfo['data']);

		$this->model->updateMessage($msg_id, $set);

		$result = array(
			'error' => 0,
			'type' => $msgInfo['msgType'],
			'MediaUrl' => getImageUrl($file_url),
		);
		if ($msgInfo['msgType'] == 'video' && $file_thumb_url) {
			$result['ThumbMediaUrl'] = getImageUrl($file_thumb_url);
		}
		echo json_encode($result);exit;

	}

	public function menuList() {
		$model = M('WechatQyApplist');
		$where = array(
			'WeId' => $this->weId,
			'appId' => session('ez_site_id'),
		);
		$appInfo = $model->where($where)->find();

		if (empty($appInfo) || $appInfo['agentId'] == 0) {
			$this->error('请先在应用配置中设置应用ID', U('appSetting'));
		}
		$model = D('WechatMp');
		/*$where= array(
		'WeId' => $this->weId,
		'status' => array('neq', -1),
		'qyAppId' => $appInfo['id'],
		);*/

		//$menulist = $model->where($where)->order('sort DESC ,id ASC')->select();
		$menulist = $model->getMenuList($this->weId);
		$menulist = list_to_tree($menulist);

		$this->assign('menulist', $menulist);
		$this->assign('appInfo', $appInfo);
		$this->assign('menu_id', 'qy_menu');
		$this->display('menu_list');
	}

	public function menuEdit() {
		$model = M('WechatQyApplist');
		$where = array(
			'WeId' => $this->weId,
			'appId' => session('ez_site_id'),
		);
		$appInfo = $model->where($where)->find();

		$id = I('get.id', 0, 'intval');

		$model = D('WechatMp');

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

			if (!$model->checkMenuCount($this->weId, $pid, $id)) {
				$this->error('超过限制，一级最多3个，子级最多5个');
			}
			$post['WeId'] = $this->weId;
			$status = $model->editMenu($post, $id);

			if ($status) {
				$return = array(
					'info' => '操作成功',
					'status' => 'success',
					'url' => U('menuList', array('aid' => $appInfo['id'])),
				);
				echo $this->ajaxReturn($return);
			} else {
				$this->error('编辑失败');
			}
		}
		if ($id) {
			$menu = $model->getMenu($id);
		}
		if (empty($menu)) {
			$menu['status'] = 1;
			$menu['type'] = 'view';
		}
		/*
		$where= array(
		'WeId' => $this->weId,
		'status' => 1,
		'qyAppId' => $appInfo['id'],
		'pid' => 0
		);*/

		//$menulist = $model->where($where)->order('sort DESC ,id ASC')->select();
		$menulist = $model->getMenuList($this->weId, 0);
		$menulist = list_to_tree($menulist);

		$this->assign('menulist', $menulist);
		$this->assign('appInfo', $appInfo);
		$this->assign('menu_id', 'qy_menu');
		$this->assign('menu', $menu);
		$this->display('menu_edit');
	}

	/**
	 * 删除
	 */
	public function menuDelete() {
		$id = I('post.id', 0, 'intval');
		if ($id == 0) {
			echo '-1';exit;
		}

		$model = D('WechatMp');
		$model->menuDelete($id);
		echo 'success';exit;
	}

	/**
	 * 设置状态
	 */
	public function menuStatus() {
		$id = I('post.id', 0, 'intval');
		$status = I('post.status', 0, 'intval');
		$pid = I('post.pid', 0, 'intval');
		if ($id == 0) {
			echo '-1';exit;
		}

		$model = D('WechatMp');

		if (!$model->checkMenuCount($this->weId, $pid, $id)) {
			echo '-2';exit;
		}

		$where = array(
			'id' => $id,
		);
		$status = abs(1 - $status);
		$affcet = $model->editMenu(array('status' => $status), $id);
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
		/*$aid = I('get.aid', 0, 'intval');
		$appInfo = $this->model->getAppInfo($aid);*/
		$model = M('WechatQyApplist');
		$where = array(
			'WeId' => $this->weId,
			'appId' => session('ez_site_id'),
		);
		$appInfo = $model->where($where)->find();
		if (empty($appInfo) || $appInfo['agentId'] == 0) {
			$this->error('请先在应用配置中设置应用ID', U('appSetting'));
		}

		$model = D('WechatMp');
		$WeId = $this->weId;
		$menulist = $model->setSyncWechatMenu($WeId);

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
		importORG('Wechat.qy.Qyapi');
		$qyapi = new Qyapi($this->wechat['app_id'], $this->app_secret);
		$res = $qyapi->menuCreate($appInfo['agentId'], $data);
		if ($res) {
			$this->success('菜单同步到微信成功！');
		} else {
			$this->error('同步失败:' . $qyapi->getErrorInfo(true));
		}
	}

	//初始化APP应用菜单
	public function menusyncApp() {
		/*$qyAppId = I('get.aid', 0, 'intval');
		$appInfo = $this->model->getAppInfo($qyAppId);*/
		$model = M('WechatQyApplist');
		$where = array(
			'WeId' => $this->weId,
			'appId' => session('ez_site_id'),
		);
		$appInfo = $model->where($where)->find();
		if (empty($appInfo) || $appInfo['agentId'] == 0) {
			$this->error('请先在应用配置中设置应用ID', U('appSetting'));
		}

		$model = D('WechatMP');

		$site_id = $appInfo['appId'];

		//微企应用添加菜单URL到微信菜单表
		$action = A('Qywx/Editor');
		$content = $action->getTempaltePageContent('qyConfig', $site_id);
		if ($content) {
			//清空现有菜单
			M('WechatMenu')->where(array('WeId' => $this->weId, 'qyAppId' => $qyAppId))->delete();
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
				$pid = $model->editMenu($set);
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
						$model->editMenu($set);
					}
				}
			}
			$return = array(
				'info' => '初始化菜单成功',
				'status' => 'success',
				'url' => U('menuList', array('aid' => $appInfo['id'])),
			);
			echo $this->ajaxReturn($return);
		}
		$this->error('应用无菜单');
	}
}