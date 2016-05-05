<?php
/**
 * 项目公共方法－无权限验证
 */
class PublicAction extends HomeAction {

	public function _initialize() {
		parent::_initialize();
	}

	public function index() {
		exit();
	}

	public function base64() {
		$img_data = I('param.image-data');

		preg_match('/^(data:\s*image\/(\w+);base64,)/', $img_data, $result);
		//print_r($result);exit;
		$filename = uniqid() . "." . $result[2];
		$new_file = './test/uploads/' . $filename;
		$new_file =".". __ROOT__.'/uploads/' . $filename;
		if(C("UPLOAD_URL")=="/uploads/"){
			$new_file = './uploads/' . $filename;
		}
		file_write($new_file, base64_decode(str_replace($result[1], '', $img_data)));
		if (!is_file($new_file)) {
			$this->ajaxError('上传失败');
		} else {
			if(C("UPLOAD_URL")=="/uploads/"){
				$this->ajaxSuccess(array("url" =>__ROOT__."/uploads/".$filename));
				exit;
			}
			$tmp = ROOT_PATH . '/' . ltrim($new_file, './');
			//$tmp = ROOT_PATH . rtrim('\uploads\ ').$filename;
			$_FILES['img'] = array(
				'name' => $filename,
				'type' => 'image/' . $result[2],
				'tmp_name' => $tmp,
				'error' => 0,
				'size' => filesize($tmp),
			);
			$info = $this->_upload('', false, 1);
			//dump($info);exit;
			if ($info['error']) {
				$this->ajaxError($info['info']);
			} else {
				@unlink($tmp);
				$this->ajaxSuccess($info['info'][0]);
			}
		}
	}
}