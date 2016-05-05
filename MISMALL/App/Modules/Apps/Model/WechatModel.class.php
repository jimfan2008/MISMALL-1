<?php
/**
 * 微信账号管理
 *
 * @author cjli
 *
 */

class WechatModel extends Model {
	/**
	 * 根据hash获取账号信息
	 *
	 * @param string $hash hash值
	 *
	 * @return array
	 */
	public function getInfoByHash($hash) {
		$weid = $this->where(array('hash' => $hash))->getField('id');
		$info = $this->getInfoById($weid);
		return $info;
	}

	/**
	 * get wechat infomation by wechat id
	 *
	 * @param int $id wechat id
	 *
	 * @return array
	 */
	public function getInfoById($id, $field = NULL) {
		$cache_id = 'wechat-info-' . $id;
		S($cache_id, NULL);
		if (!$info = S($cache_id)) {
			$info = $this->where(array('id' => $id))->find();
			S($cache_id, $info);
		}

		return $field ? $info[$field] : $info;
	}

	/**
	 * 创建公众号信息
	 *
	 */
	public function addAccount($type = 0) {
		$data = array(
			'hash' => random(5),
			'token' => random(32),
			'encodingAESKey' => random(43),
			'wechatType' => intval($type),
		);
		$weid = $this->data($data)->add();
		return $weid;
	}

	/**
	 * 更新账号信息
	 *
	 * @param array $post POST数据
	 *
	 * @return boolean
	 */
	public function editAccount($weid, $post) {
		$weInfo = $this->getInfoById($weid);
		if (!$weInfo) {
			return false;
		}
		$affect = $this->where(array('id' => $weid))->save($post);
		if ($affect) {
			$cache_id = 'wechat-info-' . $weid;
			S($cache_id, NULL);
		}

		return $affect;
	}

	/**
	 * auto bind wechat interface
	 *
	 * @param  int $weid
	 * @param  string $user
	 * @param  string $password
	 * @param  string $verify
	 *
	 * @return int
	 */
	public function autoBind($weid, $user, $password, $verify) {
		$wechat = $this->getInfoById($weid);
		if (!$wechat) {
			return '-2';
		}

		importORG('Wechat.WechatBase');
		importORG('Wechat.Account');
		$account = new Account();
		//login
		$loginstatus = $account->login($user, $password, $verify);
		if ($loginstatus) {
			//bind interface
			$interface_status = $account->account_interface($user, $wechat['hash'], $wechat['token'], $wechat['encodingAESKey']);
			if (!$interface_status) {
				return '-2';
			} else {
				$data['isBind'] = 1;
			}
		} else {
			//login error
			return '-2';
		}
		//get wechat account basic infomation
		$basicinfo = $account->basic();
		if (!$basicinfo) {
			return '-2';
		}

		//$data['username'] = $user;
		//$data['password'] = md5($password);
		$data['name'] = $basicinfo['name'];
		$data['account'] = $basicinfo['account'];
		$data['original'] = $basicinfo['original'];
		$data['signature'] = $basicinfo['signature'];
		$data['country'] = $basicinfo['country'];
		$data['province'] = $basicinfo['province'];
		$data['city'] = $basicinfo['city'];
		$data['app_id'] = $basicinfo['key'];
		$data['app_secret'] = $basicinfo['secret'];

		//直接获取二维码和头像
		$qrcode_img = 'Wechat/qrcode_' . $wechat['hash'] . '.jpg';
		if ($basicinfo['qrcode']) {
			if (file_write(C('UPLOAD_PATH') . $qrcode_img, $basicinfo['qrcode'])) {
				$data['qrcode'] = $qrcode_img;
			}
		}
		$headimg_img = 'Wechat/headimg_' . $wechat['hash'] . '.jpg';
		if ($basicinfo['headimg']) {
			if (file_write(C('UPLOAD_PATH') . $headimg_img, $basicinfo['headimg'])) {
				$data['headimg'] = $headimg_img;
			}
		}
		if ($status = $this->editAccount($weid, $data)) {
			return '1';
		} else {
			return '2';
		}
	}

	/**
	 * 创建应用
	 *
	 * @param int $weId wechat id
	 * @param array  $post app post data
	 *
	 * @return int
	 */
	public function editWechatApp($weId, $post = array()) {
		if (!is_numeric($weId)) {
			return false;
		}
		$set = array(
			'WeId' => $weId,
			'agentId' => isset($post['agentId']) && $post['agentId'] ? intval($post['agentId']) : 0,
			'name' => isset($post['name']) && $post['name'] ? trim($post['name']) : '公众号',
			'icon' => isset($post['icon']) && $post['icon'] ? trim($post['icon']) : C('PUBLIC_URL') . '/App/Wechat/images/logo/qy.png',
			'siteId' => isset($post['siteId']) && $post['siteId'] ? intval($post['siteId']) : 0,
			'description' => isset($post['description']) && $post['description'] ? trim($post['description']) : '',
			'status' => isset($post['status']) && $post['status'] ? intval($post['status']) : 1,
			'addTime' => time(),
		);

		$id = isset($post['id']) && $post['id'] ? intval($post['id']) : 0;

		$model = M('WechatApplist');

		$info = $model->where(array('WeId' => $weId, 'siteId' => $set['siteId']))->find();
		if ($info) {
			$id = $info['id'];
		}

		if ($id) {
			$affect = $model->where(array('id' => $id))->save($set);
			return $affect ? $id : $affect;
		} else {
			//生成新的应用ID
			$agentId = $model->where(array('WeId' => $weId))->order('id desc')->getField('agentId');
			if ($agentId === NULL) {
				$set['agentId'] = 0;
			} else {
				$set['agentId'] = $agentId + 1;
			}

			$affect = $model->add($set);
		}

		return $affect;
	}

	/**
	 * get weichat app list
	 *
	 * @param int $weId weichat id
	 * @param int $status app status
	 *
	 * @return array
	 */
	public function getAppList($weId, $status = 'all') {
		$where = array(
			'WeId' => $weId,
		);
		if (is_numeric($status)) {
			$where['status'] = $status;
		}

		$model = M('WechatApplist');
		$list = $model->where($where)->select();
		return $list;
	}

	/**
	 * get weichat app infomation
	 *
	 * @param int $aid database record id
	 *
	 * @return array
	 */
	public function getAppInfo($aid) {
		$aid = intval($aid);
		$model = M('WechatApplist');
		$info = $model->find($aid);
		return $info;
	}

	public function getAppInfoBySiteId($weid, $site_id) {
		$where = array(
			'WeId' => $weid,
			'siteId' => $site_id,
		);
		$model = M('WechatApplist');
		$info = $model->where($where)->order('id desc')->find();
		
		if(substr($info['icon'], 0,4)!="http"){
			$thumb = D('UserSite')->getASitethumb($site_id);
			if($thumb){
				$info['icon'] = $thumb;
			}
		}
		return $info;
	}

	/**
	 * 虚拟号推荐应用信息本身
	 */
	public function getVirtualPushMessage($weid, $agentid) {
		Log::write("VirtualPushMessage\n", Log::DEBUG);
		$where = array(
			'WeId' => $weid,
			'agentId' => $agentid,
		);
		$model = M('WechatApplist');
		$appInfo = $model->where($where)->order('id desc')->find();
		Log::write("Virtual push SQL : " . $model->getLastSql() . "\n", Log::DEBUG);
		if ($appInfo) {
			$info = array(
				'msgType' => 'mpnews',
				'data' => array(
					'mpnews_title' => $appInfo['name'],
					'mpnews_content' => $appInfo['description'],
					'cover_mpnews_path' => $appInfo['icon'] ? $appInfo['icon'] : U(C('__PUBLIC__') . '/App/Wechat/images/appstore_avatar_default.png', false, false, false, true),
					'mpnews_url' => U('/Site/Wechat/app', array('siteId' => $appInfo['siteId']), false, false, true),
				),
			);
		}
		return $info ? $info : array();
	}
}