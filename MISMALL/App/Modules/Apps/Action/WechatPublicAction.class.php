<?php
/**
 * 微信公共信息管理
 */
class WechatPublicAction extends BaseAction {
	public function editAccount() {
		$weId = I('get.weid', 0, 'intval');
		$type = I('get.type', '', 'trim');
		$wxname = I('post.wxname', '', 'trim');
		$app_id = I('post.app_id', '', 'trim');
		$app_secret = I('post.app_secret', '', 'trim');
		$pay_id = I('post.pay_id', '', 'trim');
		$pay_key = I('post.pay_key', '', 'trim');
		if ($type == 'modifyname') {
			$data = array(
				'name' => $wxname,
			);
		} else if ($type == 'modifysecret') {
			$data = array(
				'app_id' => $app_id,
				'app_secret' => $app_secret,
			);
		} else if ($type == 'modifycrop') {
			$data = array(
				'app_id' => $app_id,
			);
		} else if ($type == 'modifypay') {
			$data = array(
				'pay_id' => $pay_id,
				'pay_key' => $pay_key,
			);
		}

		if ($status = D('Wechat')->editAccount($weId, $data)) {
			$return = array(
				'success' => 1,
			);
		} else {
			$return = array(
				'message' => '操作失败',
			);
		}
		echo json_encode($return);
	}

	/**
	 * 重设微信Token 或者 encodingAESKey
	 */
	public function ajaxResetToken() {
		$post = array();
		$weId = I('get.weid', 0, 'intval');
		$aes = I('aes');
		if ($aes) {
			$post['encodingAESKey'] = random(43);
		} else {
			$post['token'] = random(32);
		}
		D('Wechat')->editAccount($weId, $post);
	}
}