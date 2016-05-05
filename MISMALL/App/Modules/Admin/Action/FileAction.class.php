<?php
// +----------------------------------------------------------------------
// | OneThink [ WE CAN DO IT JUST THINK IT ]
// +----------------------------------------------------------------------
// | Copyright (c) 2013 http://www.onethink.cn All rights reserved.
// +----------------------------------------------------------------------
// | Author: 麦当苗儿 <zuojiazi@vip.qq.com> <http://www.zjzit.cn>
// +----------------------------------------------------------------------
/**
 * 文件控制器
 * 主要用于下载模型的文件上传和下载
 */
class FileAction extends AdminAction {

	/* 文件上传 */
	public function upload() {
		$return = array('status' => 1, 'info' => '上传成功');
		/* 调用文件上传组件上传文件 */
		$File = D('File');
		$info = $File->upload(
			C('DOWNLOAD_UPLOAD')
		);

		/* 记录附件信息 */
		if ($info) {
			$return['path'] = $info[0]['path'];
			$return['info'] = $info[0]['name'];
			$return['id'] = $info[0]['id'];
		} else {
			$return['status'] = 0;
			$return['info'] = $File->getError();
		}

		/* 返回JSON数据 */
		echo json_encode($return);
	}

	/* 下载文件 */
	public function download($id = null) {
		if (empty($id) || !is_numeric($id)) {
			$this->error('参数错误！');
		}

		//TODO 无
		/*$logic = D('Download', 'Logic');
	if(!$logic->download($id)){
	$this->error($logic->getError());
	}*/

	}

	/**
	 * 上传图片
	 * @author huajie <banhuajie@163.com>
	 */
	public function uploadPicture() {
		//TODO: 用户登录检测

		/* 返回标准数据 */
		$return = array('status' => 1, 'info' => '上传成功', 'data' => '');

		$dir = I('get.dir', '');

		switch ($dir) {
			case 'Tpl_Image':
				$setting = C('TEMPLATE_IMAGE_UPLOAD');
				break;
			default:
				$setting = C('PICTURE_UPLOAD');
		}

		/* 调用文件上传组件上传文件 */
		$Picture = D('Picture');
		$info = $Picture->upload($setting); //TODO:上传到远程服务器

		/* 记录图片信息 */
		if ($info) {
			$return['status'] = 1;
			$return = array_merge($info[0], $return);
		} else {
			$return['status'] = 0;
			$return['info'] = $Picture->getError();
		}

		/* 返回JSON数据 */
		$this->ajaxReturn($return);
	}
}
