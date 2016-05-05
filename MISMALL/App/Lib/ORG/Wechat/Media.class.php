<?php
/**
 * 微信多媒体文件 - 上传下载类
 * 
 * @author cjli
 *
 */
class Media extends WechatBase
{
	public function __construct( $appid, $secret)
	{
		$this->appid  = $appid;
		$this->secret = $secret;
	}
	
	/**
	 * 上传多媒体文件
	 * 
	 * @param string $type 类型
	 * @param string $file 媒体文件
	 * 
	 * @return array
	 */
	public function upload($type, $file)
	{
		$param = array(
			'media' => '@'.$file	//文件上传必须带@符号
		);
		
		$access_token = $this->getToken();
		if(!$access_token){
			return false;
		}
		$url = "http://file.api.weixin.qq.com/cgi-bin/media/upload?access_token={$access_token}&type={$type}";
		$result = $this->http($url, $param, 'POST', '', true);
		if($result !== false) {
			return $result['media_id'];
		}
		return false;
	}
	
	/**
	 * 下载多媒体文件
	 * 
	 * @param string $media_id 媒体文件ID
	 */
	public function get($media_id)
	{
		$access_token = $this->getToken();
		if(!$access_token){
			return false;
		}
		$url="http://file.api.weixin.qq.com/cgi-bin/media/get?access_token={$access_token}&media_id={$media_id}";
		$response = $this->http_request($url, '', array ( "Content-type: text/html; charset=utf-8" ));
		
		preg_match('/"errcode":([0-9]+)/', $response['content'], $match);
		
		if ( isset($match[1]) ) {
			$this->error = $match[1];
			return false;
		}
		$result = array(
			'type' => $response['headers']['Content-Type'],
			'name' => substr($response['headers']['Content-disposition'], 22, -1),
			'length' => $response['headers']['Content-Length'],
			'content' => $response['content']
		);
		return $result;
	}
	
}