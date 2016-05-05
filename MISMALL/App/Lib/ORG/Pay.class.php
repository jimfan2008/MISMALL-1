<?php

/**
 * 通用支付接口类
 * @author yunwuxin<448901948@qq.com>
 * @author jerlisen <developerlcj@gmail.com>
 * @time( 2015.1.7) change
 */

require_once('Pay/PayBase.class.php');
require_once('Pay/PayVo.class.php');
class Pay {

    /**
     * 支付驱动实例
     * @var Object
     */
    private $payer;

    /**
     * 配置参数
     * @var type 
     */
    private $config;

    /**
     * 构造方法，用于构造上传实例
     * @param string $driver 要使用的支付驱动
     * @param array  $config 配置
     */
    public function __construct($driver, $config = array()) {
        /* 配置 */
        $pos = strrpos($driver, '\\');
        
        $pos = $pos === false ? 0 : $pos + 1;
        $apitype = strtolower(substr($driver, $pos));

        $this->config['notify_url'] = U("Home/Payment/notify", array('apitype' => $apitype, 'method' => 'notify'), false, false, true);
        $this->config['return_url'] = U("Home/Payment/notify", array('apitype' => $apitype, 'method' => 'return'), false, false, true);

        $config = array_merge($this->config, $config);

        /* 设置支付驱动 */
        $class = ucfirst(strtolower($driver));
        include('Pay/Driver/'.$class.'.class.php');

        //$class = strpos($driver, '\\') ? $driver : 'Think\\Pay\\Driver\\' . ucfirst(strtolower($driver));
        $this->setDriver($class, $config);
    }

    public function buildRequestForm(PayVo $vo) {
        $this->payer->check();
        //生成本地记录数据
        return $this->payer->buildRequestForm($vo);
    }

    /**
     * 设置支付驱动
     * @param string $class 驱动类名称
     */
    private function setDriver($class, $config) {
        $this->payer = new $class($config);
        if (!$this->payer) {
            E("不存在支付驱动：{$class}");
        }
    }

    public function __call($method, $arguments) {
        if (method_exists($this, $method)) {
            return call_user_func_array(array(&$this, $method), $arguments);
        } elseif (!empty($this->payer) && $this->payer instanceof PayBase && method_exists($this->payer, $method)) {
            return call_user_func_array(array(&$this->payer, $method), $arguments);
        }
    }

}
