<?php
/**
 * 前端默认模块控制器，继承自通用控制器
 */
class IndexAction extends BaseAction {

	/**
	 * 首页
	 */
	public function index() {
		$pageId = I('get.pageId', '', 'trim');
		// 读取微信管理菜单
		if (session('wechatId')) {
			$wechat = D('Wechat')->getInfoById(session('wechatId'));
		} elseif ($siteInfo['wechatId']) {
			$siteInfo = D('UserSite')->getSiteInfo(session('ez_site_id'));
			$wechat = D('Wechat')->getInfoById($siteInfo['wechatId']);
			if ($wechat) {
				if ($Wechat['wechatType']) {
					session('qyWechatId', $siteInfo['wechatId']);
				} else {
					$appInfo = D('Wechat')->getAppInfoBySiteId($siteInfo['wechatId'], session('ez_site_id'));
					if (C('SUPPER_WECHAT_ID') == $siteInfo['wechatId'] && $appInfo['agentId'] > 0) {
						session('is_supper_wechat', 1);
					} else {
						session('is_supper_wechat', 0);
					}
					session('wechatId', $siteInfo['wechatId']);
				}
			}
		}
		$this->assign('is_supper_wechat', intval(session('is_supper_wechat')));
		$this->assign('wechat', $wechat);
		$this->assign('pageId', $pageId);
		$this->display('index');
	}

	/**
	 * 初始化
	 * @param	int		$siteId
	 * @return boolean
	 */
	public function initApps() {
		$site_id = I('post.siteId', 0, 'intval');
		if (!$site_id) {
			echo 0;
			exit();
		}

		session('ez_site_id', $site_id ? $site_id : 0);
		$app_id = M('UserProjects')->where(array('siteID' => $site_id))->getField('ID');
		if ($app_id) {
			session('pid', $app_id);
			session('front_view', 'site_app');

			$siteInfo = D('UserSite')->getSiteInfo($site_id);
			// 读取微信管理菜单
			if ($siteInfo['wechatId']) {
				$wechat = D('Wechat')->getInfoById($siteInfo['wechatId']);
				if ($wechat) {
					if ($Wechat['wechatType']) {
						session('qyWechatId', $siteInfo['wechatId']);
					} else {
						$appInfo = D('Wechat')->getAppInfoBySiteId($siteInfo['wechatId'], $site_id);
						if (!$appInfo) {
							$set = array(
								'name' => $siteInfo['siteName'],
								'icon' => $siteInfo['thumbPath'],
								'siteId' => $site_id,
								'description' => $siteInfo['siteDescription'],
							);
							D('Apps/Wechat')->editWechatApp($siteInfo['wechatId'], $set);
							$appInfo = D('Wechat')->getAppInfoBySiteId($siteInfo['wechatId'], $site_id);
						}
						if (C('SUPPER_WECHAT_ID') == $siteInfo['wechatId'] && $appInfo['agentId'] > 0) {
							session('is_supper_wechat', 1);
						} else {
							session('is_supper_wechat', 0);
						}
						session('wechatId', $siteInfo['wechatId']);
					}
				}
			}
			echo 1;
		} else {
			echo 0;
		}
	}

	/**
	 * 获取页面内容
	 * @param	int		$site_id
	 * @param	string	$page_id
	 * @return	string
	 */
	public function getPageContent() {
		$site_id = I('post.siteId', 0, 'intval');

		$site_info = D('UserSite')->getSiteInfo($site_id);
		if (!empty($site_info)) {
			echo $site_info["config"];
		}
		exit;
		
		
		
		print_r($site_info);
		$user_site_path = get_user_dir($site_info['sitePath'], $site_info['userId'], 1);
		unset($site_info);
		$tpl = $user_site_path . '/config';

		$file_content = '';
		//判断站点模板是否存在
		if (!file_exist($tpl)) {
			$file_content = "页面不存在";
		}
		
		$file_content = file_get($tpl);

		echo $file_content;
	}



	/**
	 * 登出系统
	 */
	public function logout() {
		$pid = session('pid');

		D('User')->userLogout();
		cookie('user_id', NULL);
		cookie('pageFrom', NULL);

		echo $pid ? $pid : 0;
	}

}
