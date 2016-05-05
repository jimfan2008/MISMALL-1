<?php
/**
 * api interface calls the base class, the other api interface must be inherited
 * @author cjli
 */

class ApiBaseAction extends Action
{
	protected $api;
    protected $isInternalCall;

	public function _initialize()
	{
		//消除所有的magic_quotes_gpc转义
    	import('ORG.Util.Input');
        Input::noGPC();
        
        /* 读取数据库中的配置 */
        $config =   F('DB_CONFIG_DATA');
        if(!$config){
        	$config_model = D('Config');
            $config =   $config_model->lists();
            F('DB_CONFIG_DATA',$config);
        }
        C($config); //添加配置

        $this->isInternalCall = false;
    }

    public function setInternalCallApi($value=true)
    {
        $this->isInternalCall = $value ? true : false;
    }
    
    /**
     * 找不到接口时调用该函数
     */
    public function _empty()
    {
        $this->apiError(404, "找不到该接口");
    }

    protected function apiReturn($success, $error_code=0, $message=null, $redirect=null, $extra=null)
    {
        //生成返回信息
        $result = array();
        //$result['success'] = $success;
        $result['errorCode'] = $error_code;

        if(is_null($message)) {
            $result['message'] = $this->getError($error_code);
        } else {
            $result['message'] = $message;
        }
        if($redirect !== null) {
            $result['redirect'] = $redirect;
        }
        foreach($extra as $key=>$value) {
            $result[$key] = $value;
        }
        //将返回信息进行编码
        $format = $_REQUEST['format'] ? $_REQUEST['format'] : 'json';//返回值格式，默认json
        if($this->isInternalCall) {
            throw_exception($result);
        } else if($format == 'json') {
            echo $this->jsencode($result);
            exit;
        } else if($format == 'xml') {
            echo xml_encode($result);
            exit;
        } else {
            $_GET['format'] = 'json';
            $_REQUEST['format'] = 'json';
            return $this->apiError(400, "format参数错误");
        }
    }

    protected function apiSuccess($message, $redirect=null, $extra=null)
    {
        return $this->apiReturn(true, 0, $message, $redirect, $extra);
    }

    protected function apiError($error_code, $message, $redirect=null, $extra=null)
    {
        return $this->apiReturn(false, $error_code, $message, $redirect, $extra);
    }

    protected function getError($code)
    {
        $errcode = $this->getErrorCode();
        return $errcode[$code];
    }

    public function getErrorCode()
    {
        $errcode = array(
            '-1'    =>  "系统繁忙",
            '0'     =>  'OK',
            '40001' =>  'API接口调用TOKEN错误',
            '40002' =>  'API接口不存在',
            '40003' =>  '调用接口错误',
            "40004" =>  "api功能未授权",
            "40005" =>  "用户未授权该api",
            "41001" =>  "记录ID不能为空",
            "41002" =>  "记录不存在",
            "41003" =>  "暂无内容记录",
            "41004" =>  "字段内容为空",
            "41005" =>  "无更新内容",
            "43001" =>   "需要GET请求",
            "43002" =>   "需要POST请求",
            "43003" =>   "需要HTTPS请求",
            "44001" =>   "多媒体文件为空",
            "44002" =>   "POST的数据包为空",
            "44003" =>   "图文内容为空",
            "44004" =>   "文本内容为空",
            "45001" =>   "多媒体文件大小超过限制",
            "47001" =>   "解析JSON/XML内容错误",
        );
        return $errcode;
    }

    /**
     * 不转义中文字符和\/的 json 编码方法
     * @param array $arr 待编码数组
     * @return string
     */
    protected function jsencode($arr)
    {
        $str = str_replace ( "\\/", "/", json_encode ( $arr ) );
        $search = "#\\\u([0-9a-f]+)#ie";
        
        if (strpos ( strtoupper(PHP_OS), 'WIN' ) === false) {
            $replace = "iconv('UCS-2BE', 'UTF-8', pack('H4', '\\1'))";//LINUX
        } else {
            $replace = "iconv('UCS-2', 'UTF-8', pack('H4', '\\1'))";//WINDOWS
        }
        
        return preg_replace ( $search, $replace, $str );
    }
}