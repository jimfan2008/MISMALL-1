<?php
/**
 * 主要用于系统程序更新，数据库更新请使用Admin\Action\UpdateAction.class.php
 *
 * @author cjli jerlisen@gmail.com
 */

class UpdateAction extends BaseAction {
	public function index() {
		$this->_404();
	}

	/**
	 * 更新QYWX项目模板到对应的数据库
	 */
	public function wxsite() {
		$dir = ROOT_PATH . '/wxsite/';

		//创建了项目的应用
		$where = array(
			'userProjectId' => array('gt', 0),
			'userId' => array('gt', 0),
		);
		$siteList = M('UserSite')->field('id,sitePath,userProjectId,userId')->where($where)->select();
		//dump($siteList);exit;
		foreach ($siteList as $key => $site) {
			session('pid', $site['userProjectId']);
			$site_path = $dir . 'user_' . $site['userId'] . DS . $site['sitePath'];
			echo '<br/>####################项目目录#################<br/>';
			echo $site_path . '<br/>';
			//菜单配置，文件不存在直接跳过
			$qy_config_file = $site_path . DS . 'qyConfig';
			//echo $qy_config_file;exit;
			if (!is_file($qy_config_file)) {
				continue;
			}
			$qyConfig = file_get($qy_config_file);
			$qyConfig = objectToArray(json_decode(urldecode($qyConfig)));
			//dump($qyConfig);

			//所有页面数组
			$page_arr = array();
			foreach ($qyConfig as $pageId => $menu) {
				$page_arr[] = $pageId;
				if (isset($menu['subMenu']) && $menu['subMenu']) {
					foreach ($menu['subMenu'] as $subPage => $subMenu) {
						$page_arr[] = $subPage;
					}
				}
			}
			//dump($page_arr);exit;

			//获取内面配置
			$config_file = $site_path . DS . 'config';
			$config = array();
			//echo $config_file;exit;
			if (is_file($config_file)) {
				$config = file_get($config_file);
				//config有内容
				if ($config) {
					$config = objectToArray(json_decode(urldecode($config)));
					$pageMgr = $config['pageMgr'];
					//dump($pageMgr);
					if (isset($pageMgr) && is_array($pageMgr) && $pageMgr) {
						foreach ($pageMgr as $page) {
							$page_arr[] = $page['page'];
						}
					}
				}
			}
			//dump($page_arr);
			//页面循环入库
			if (is_array($page_arr) && $page_arr) {
				echo '####################页面循环入库#################<br/>';
				foreach ($page_arr as $page) {
					$page_file = $site_path . DS . $page;
					if (!is_file($page_file)) {
						continue;
					}
					echo $page_file . '<br/>';
					$page_content = file_get($page_file);
					if (empty($page_content)) {
						continue;
					}
					//echo $page_content;exit;
					D('Project')->savePageTemplate($page, $page_content, $site['id']);
				}
			}

			//'合并配置文件信息'并入库
			//dump($config['pageMgr']);
			//dump($qyConfig);exit;
			$site_config = array(
				'pageMenu' => $qyConfig,
				'pageMgr' => isset($config['pageMgr']) ? $config['pageMgr'] : '',
				'pageManage' => isset($config['pageManage']) ? $config['pageManage'] : '',
			);
			echo '合并配置文件信息\n<pre>' . json_encode($site_config) . '<pre>\n';
			//echo  json_encode($site_config);exit;
			D('UserSite')->editSite($site['id'], array('config' => json_encode($site_config)));
			//exit;
		}
	}

	//整合公众号应用
	public function wechat() {
		$user_site_model = M('UserSite');
		$siteList = $user_site_model->where('wechatId>0')->select();

		//网站关联生成微信应用
		echo '####################网站关联生成微信应用#################<br/>';
		$applist_model = M('WechatApplist');
		foreach ($siteList as $site) {
			$set = array(
				'name' => $site['siteName'],
				'icon' => '/uploads/' . $site['thumbPath'],
				'siteId' => $site['id'],
				'description' => $site['siteDescription'],
			);
			//dump($set);exit;
			D('Apps/Wechat')->editWechatApp($site['wechatId'], $set);
		}

		//关注用户于应用关联
		echo '####################关注用户于应用关联#################<br/>';
		$member_model = M('WechatMember');
		$userList = $member_model->field('WeId,openid')->select();
		$wechat_app_member = M('WechatAppMember');
		foreach ($userList as $user) {
			$user['agentId'] = 0;
			$user['isServer'] = 0;
			$wechat_app_member->add($user);
		}

		//消息设置
		echo '####################消息设置#################<br/>';
		$wechat_rule = M('WechatRule');
		$wechat_message_set = M('WechatMessageSetting');
		$wechat_message_set2 = M('WechatMessageSetting2');
		$ruleList = $wechat_rule->select();
		foreach ($ruleList as $rule) {
			$messageList = $wechat_message_set2->where('rule_id=' . $rule['id'])->select();

			if (!$messageList) {
				continue;
			}
			$data = array();
			if ($rule['msgType'] == 'mpnews') {
				$message = reset($messageList);
				$data = array(
					'cover_mpnews_id' => $message['cover_id'],
					'cover_mpnews_path' => get_cover($message['cover_id'], 'url'),
					'mpnews_title' => $message['title'],
					'mpnews_content' => $message['summary'],
					'author' => $message['author'],
					'url' => $message['url'],
					'mpnews_description' => $message['description'],
					'mpnews_pic' => 0,
				);
			} elseif ($rule['msgType'] == 'news') {
				foreach ($messageList as $message) {
					$data[] = array(
						'cover_news_id' => $message['cover_id'],
						'cover_news_path' => get_cover($message['cover_id'], 'url'),
						'title' => $message['title'],
						'url' => $message['url'],
						'description' => $message['description'],
					);
				}
			} else {
				$data = $messageList[0]['summary'];
			}

			$set = array(
				'WeId' => $rule['WeId'],
				'agentId' => 0,
				'msgType' => $rule['msgType'],
				'data' => serialize($data),
				'ruleName' => $rule['name'],
				'status' => $rule['status'],
				'createTime' => $rule['update_time'],
				'updateTime' => $rule['update_time'],
			);
			$wechat_message_set->add($set);
		}
		echo '####################end#################<br/>';
	}

	public function wechatMember() {
		$wm = M('WechatMember');
		$us = M('Users');
		$list = $wm->select();
		foreach ($list as $member) {
			$data['openid'] = $member['openid'];
			$data["userName"] = $member['nickname'];
			$data["unionid"] = $member['unionid'];
			$data['userPhoto'] = $member["headimgurl"];
			$data['sex'] = $member["sex"];
			$data['country'] = $member["country"];
			$data['province'] = $member["province"];
			$data['city'] = $member["city"];
			$data['regTime'] = $member['subscribe_time'];
			$data["userEmail"] = '';
			$data["userPwd"] = '';
			$data['isActivated'] = 1;
			$data["userType"] = 5;
			$data["roleID"] = $member['groupid'];
			$data["extendField"] = " ";
			$data["qyWechatId"] = 0;
			$data["wechatId"] = 0;
			$data["address"] = '';
			$data["userPhone"] = '';
			$uid = $us->add($data);
			//echo $us->getLastSql();
			//echo $uid;
			//exit;
		}
	}
}