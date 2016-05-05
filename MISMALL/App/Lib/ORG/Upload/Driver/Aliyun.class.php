<?php
require_once 'Oss/sdk.class.php';
require_once 'Oss/util/oss_util.class.php';
   class  Aliyun{
   
   	const endpoint = 'oss-cn-shenzhen.aliyuncs.com';
    const accessKeyId = '5i4QfVSrnQkUHdKP';
    const accesKeySecret = '9KOVM8eybDmxxFAq7GYLkKluVV3iRs';
    const bucket = 'qjwd';
   	/**
	 * 上传文件根目录
	 * @var string
	 */
	private $rootPath;
	/**
	 * 上传错误信息
	 * @var string
	 */
	private $error = '';
	private $config = array(
		'access_id' => '', //阿里云Access Key ID
		'access_key' => '', //阿里云Access Key Secret
		'bucket' => '', //空间名称
		'endpoint' => '', //OSS域名节点网地址
		'timeout' => 90, //超时时间
	);

	/**
	 * 构造函数，用于设置上传根路径
	 * @param string $root   根目录
	 * @param array  $config FTP配置
	 */
	public function __construct($root, $config) {
		/* 默认FTP配置 */
		$this->config = array_merge($this->config, $config);
		/* 设置根目录 */
		//$this->rootPath = str_replace('./', '/', $root);
		$this->rootPath = '/';
	}
	
	public static function get_oss_client() {
		$upconfig  = C('UPLOAD_TYPE_CONFIG');
        $oss = new ALIOSS($upconfig['access_id'], $upconfig['access_key'], $upconfig['endpoint']);
        return $oss;
    }
	
	public function deleteObject($file, $replace = true){
		$oss = $this->get_oss_client();
		
	}

 
    public static function my_echo($msg) {
        $new_line = " \n";
        echo $msg . $new_line;
    }

    public static function get_bucket_name() {
        return self::bucket;
    }

    public static function create_bucket() {
        $oss = self::get_oss_client();
        $bucket = self::get_bucket_name();
        $acl = ALIOSS::OSS_ACL_TYPE_PUBLIC_READ;
        $res = $oss->create_bucket($bucket, $acl);
        $msg = "创建bucket " . $bucket;
        OSSUtil::print_res($res, $msg);
    }
	
	public function delete_buckets($bucket, $object){
		$oss = $this->get_oss_client();
		$res = $oss->delete_object($bucket, $object);
		return $res;
	}
	
	
   } 
?>