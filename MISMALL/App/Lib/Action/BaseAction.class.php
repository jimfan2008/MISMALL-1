<?php
/**
 * 项目控制器基类
 *
 * @author cjli
 *
 */
class BaseAction extends Action {
	/**
	 * 初始化基类
	 */
	protected function _initialize() {
		header("Content-Type:text/html; charset=utf-8");

		//消除所有的magic_quotes_gpc转义
		import('ORG.Util.Input');
		Input::noGPC();

		/* 读取数据库中的配置 */
		$config = F('DB_CONFIG_DATA');
		if (!$config) {
			$config_model = D('Config');
			$config = $config_model->lists();
			F('DB_CONFIG_DATA', $config);
		}
		C($config); //添加配置
	}

	/**
	 * 不存在的页面默认为404错误
	 */
	/* public function _empty()
	{
	$this->_404();
	}*/

	/**
	 * 404错误
	 * @param $url　跳转URL
	 * @return void
	 */
	protected function _404($url = '') {
		if ($url) {
			redirect($url);
		} else {
			send_http_status(404);
			$this->display('Public/404');
			exit;
		}
	}

	/**
	 * 文件上传统一方法
	 * @param array $setting 上传配置信息, 在App/Conf/upload.php
	 * @return array
	 */
	protected function _upload($setting = '', $is_check = '',$isOss=0) {
		if (empty($setting)) {
			$setting = C('PICTURE_UPLOAD');
		}
		switch ($_SERVER["SERVER_NAME"]) {
			case 'localhost':
			//本地数据库
			case '10.28.0.12':
			case '10.28.5.12':
			case '10.28.5.11':
			case 'cycc.cli':
			case 'pzh':
			case '10.28.5.49':
			case '10.28.30.9':
			case '192.168.0.101':
			case '10.28.30.220':
			case '192.168.0.110':
			case '10.28.30.223':
			case '10.28.30.218':
			case '10.28.30.225':
			case '10.28.30.231':
			case '10.28.30.221':
			case '10.28.30.229':
			case '10.28.5.14':
			case '10.28.5.92':
			case '10.28.30.217':
			case '10.28.5.52':
			case '10.28.5.80':
				$uploadType="UploadFile";
				break;
			
			default:
				$uploadType="";
				break;
		}
		if($uploadType=="UploadFile"){
			importORG('UploadFile');
			$upload = new UploadFile(C('PICTURE_UPLOAD'));
		}else{
			$uploadType=="";
			importORG('Upload');
			//$upload = new Upload($setting, $uploadType, '', $is_check);
			$upload = new Upload($setting, $uploadType, '', false);
		}
		/* 上传文件 */
		$info = $upload->upload();
		if (!$info) {
			return array('error' => 1, 'info' => $upload->getError());
		}
		//print_r($info);
		if($uploadType=="UploadFile"){
			foreach ($info as &$img) {
				$img['path'] = $img['savepath'] . $img['savename'];
				$img['url'] = "http://".$_SERVER["SERVER_NAME"].__ROOT__ . "/uploads/" . $img['savename'];
			}
		}else{
			foreach ($info as &$img) {
				$img['path'] = $img['savepath'] . $img['savename'];
				$img['url'] = C('UPLOAD_URL') . $img['savepath'] . $img['savename'];
			}
		}
		
		unset($img);
		return array('error' => 0, 'info' => $info);
	}

	/**
	 * 编辑器上传
	 */
	public function editorUpload() {
		$upload = $this->_upload(C('EDITOR_UPLOAD'));
		if ($upload['error']) {
			$return = array('error' => 1, 'message' => $upload['info']);
		} else {
			$infoList = $upload['info'];
			$return = array('error' => 0, 'url' => $infoList[0]['url']);
		}

		echo json_encode($return);
	}

	/**
	 * ajax上传图片
	 */
	public function ajaxUpload() {
		$info = $this->_upload(
			C('WECHAT_UPLOAD')
		);
		$result = array();
		/* 记录图片信息 */
		if ($info['error']) {
			$result['status'] = false;
			$result['info'] = $info['info'];
		} else {
			$result['status'] = ture;
			$result['info'] = '上传成功';
			$result['image'] = $info['info'][0]['url'];
		}

		//生成返回信息
		$result['error_code'] = 0;
		echo json_encode($result);
		exit;
	}
	
	/**
	 * kindeditor ajax上传图片
	 */
	public function kindEditorAjaxUpload() {
		$info = $this->_upload(
			C('WECHAT_UPLOAD')
		);
		$result = array();
		/* 记录图片信息 */
		if ($info['error']) {
			$result['status'] = false;
			$result['info'] = $info['info'];
		} else {
			$result['status'] = ture;
			$result['info'] = '上传成功';
			$result['image'] = $info['info'][0]['url'];
		}

		//生成返回信息
		$result['error_code'] = 0;
		//print_r($result);
		$re['error']  =0;
		$re['url'] =  $result['image'];
		echo json_encode($re);
		exit;
	}

	/**
	 * 上传图片存储到数据库
	 */
	public function uploadPicture() {
		$type = I('get.type', '');
		$picture = D('Admin/Picture');
		$info = $picture->upload(
			C('WECHAT_UPLOAD')
		);
		/* 记录图片信息 */
		if ($info) {
			$return['status'] = 1;
			$return['type'] = $type;
			$return['image'] = $info[0]['url'];
			$return = array_merge($info[0], $return);
		} else {
			$return['status'] = 0;
			$return['info'] = $picture->getError();
		}
		if ($type == 'ajax') {
			$return['status'] = (boolean) $return['status'];
			echo json_encode($return);
			exit;
		}
		/* 返回JSON数据 */
		$this->ajaxReturn($return);
	}

	/**
	 * Ajax请求成功返回数据到客户端
	 * @access protected
	 * @param mixed $data 要返回的数据
	 * @param String $info 提示信息
	 * @param String $type ajax返回类型 JSON XML JSONCN,默认为JSONCN不转义中文
	 * @return void
	 */
	protected function ajaxSuccess($data = '', $info = '', $type = 'JSONCN') {
		$return = array(
			'status' => 'success',
			'info' => $info,
			'data' => $data,
		);
		echo $this->ajaxReturn($return, $type);
	}

	/**
	 * Ajax请求失败返回数据到客户端
	 * @access protected
	 * @param mixed $data 要返回的数据
	 * @param String $info 提示信息
	 * @param String $type ajax返回类型 JSON XML,默认为JSON
	 * @return void
	 */
	protected function ajaxError($info = '', $type = 'JSONCN') {
		$return = array(
			'status' => 'error',
			'info' => $info,
		);
		echo $this->ajaxReturn($return, $type);
	}

	/**
	 * Ajax方式返回数据到客户端
	 * @access protected
	 * @param mixed $data 要返回的数据
	 * @param String $type AJAX返回数据格式
	 * @return void
	 */
	protected function ajaxReturn($data, $type = '') {
		if (func_num_args() > 2) {
			// 兼容3.0之前用法
			$args = func_get_args();
			array_shift($args);
			$info = array();
			$info['data'] = $data;
			$info['info'] = array_shift($args);
			$info['status'] = array_shift($args);
			$data = $info;
			$type = $args ? array_shift($args) : '';
		}
		if (empty($type)) {
			$type = C('DEFAULT_AJAX_RETURN');
		}

		switch (strtoupper($type)) {
			case 'JSON':
				// 返回JSON数据格式到客户端 包含状态信息
				header('Content-Type:application/json; charset=utf-8');
				exit(json_encode($data));
			case 'JSONCN':
				// 返回JSON数据格式到客户端 包含状态信息
				header('Content-Type:application/json; charset=utf-8');
				exit(json_encode_cn($data));
			case 'XML':
				// 返回xml格式数据
				header('Content-Type:text/xml; charset=utf-8');
				exit(xml_encode($data));
			case 'JSONP':
				// 返回JSON数据格式到客户端 包含状态信息
				header('Content-Type:application/json; charset=utf-8');
				$handler = isset($_GET[C('VAR_JSONP_HANDLER')]) ? $_GET[C('VAR_JSONP_HANDLER')] : C('DEFAULT_JSONP_HANDLER');
				exit($handler . '(' . json_encode($data) . ');');
			case 'EVAL':
				// 返回可执行的js脚本
				header('Content-Type:text/html; charset=utf-8');
				exit($data);
			default:
				// 用于扩展其他返回格式数据
				tag('ajax_return', $data);
		}
	}

	/**
	 * 获取当前页面完整URL地址
	 */
	 public function get_url() {
	    $sys_protocal = isset($_SERVER['SERVER_PORT']) && $_SERVER['SERVER_PORT'] == '443' ? 'https://' : 'http://';
	    $php_self = $_SERVER['PHP_SELF'] ? $_SERVER['PHP_SELF'] : $_SERVER['SCRIPT_NAME'];
	    $path_info = isset($_SERVER['PATH_INFO']) ? $_SERVER['PATH_INFO'] : '';
	    //$relate_url = isset($_SERVER['REQUEST_URI']) ? $_SERVER['REQUEST_URI'] : $php_self.(isset($_SERVER['QUERY_STRING']) ? '?'.$_SERVER['QUERY_STRING'] : $path_info);
	    $relate_url = isset($_SERVER['REQUEST_URI']) ? $_SERVER['REQUEST_URI'] : $php_self.(isset($_SERVER['QUERY_STRING']) ? '?'.$_SERVER['QUERY_STRING'] : $path_info);
	    //return $sys_protocal.(isset($_SERVER['HTTP_HOST']) ? $_SERVER['HTTP_HOST'] : '').$relate_url;
	    $relate_url =$sys_protocal.$_SERVER['HTTP_HOST'].$relate_url;
		//session("aa",$relate_url);
	    return $relate_url;
	 }
}