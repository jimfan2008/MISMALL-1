<?php

import('@.Builder.AdminBuilder');
class AdminConfigBuilder extends AdminBuilder {
    private $_title;
    private $_keyList = array();
    private $_data = array();
    private $_buttonList = array();
    private $_savePostUrl = array();
    private $_groupList = array(1 => '');
    private $_highlight;

    public function title($title) {
        $this->_title = $title;
        return $this;
    }
    
    //导航高亮
    public function highlight($highlight) {
    	$this->_highlight = $highlight;
    	return $this;
    }

    public function key($name, $title, $subtitle=null, $type, $opt=null, $group=1) {
        $key = array('name'=>$name, 'title'=>$title, 'subtitle'=>$subtitle, 'type'=>$type, 'opt'=>$opt,'group'=>$group);
        $this->_keyList[] = $key;
        return $this;
    }

    public function keyHidden($name, $title=null, $subtitle=null) {
        return $this->key($name, $title, $subtitle, 'hidden');
    }

    public function keyReadOnly($name, $title, $subtitle=null, $group=1) {
        return $this->key($name, $title, $subtitle, 'readonly', null, $group);
    }

    public function keyText($name, $title, $subtitle=null, $group=1) {
        return $this->key($name, $title, $subtitle, 'text', null, $group);
    }

    public function keyTextArea($name, $title, $subtitle=null, $group=1) {
        return $this->key($name, $title, $subtitle, 'textarea', null, $group);
    }

    public function keyNumber($name, $title, $subtitle=null, $group=1) {
        return $this->key($name, $title, $subtitle, 'number', null, $group);
    }
    
	public function keyImage($name,$title,$subtitle=null, $group=1){

        return $this->key($name, $title,$subtitle, 'image', null, $group);
    }
    
	public function keyImageUnion($name,$title,$subtitle=null, $group=1){

        return $this->key($name, $title,$subtitle, 'image_union', null, $group);
    }
    
 	public function keyFile($name,$title,$subtitle=null, $group=1){

        return $this->key($name, $title,$subtitle, 'file', null, $group);
    }

    public function keySelect($name, $title, $subtitle=null, $options, $group=1) {
        return $this->key($name, $title, $subtitle, 'select', $options, $group);
    }

    public function keyRadio($name, $title, $subtitle=null, $options, $group=1) {
        return $this->key($name, $title, $subtitle, 'radio', $options, $group);
    }

    public function keyCheckBox($name, $title, $subtitle=null, $options, $group=1) {
        return $this->key($name, $title, $subtitle, 'checkbox', $options, $group);
    }

    public function keyEditor($name, $title, $subtitle=null, $group=1) {
        return $this->key($name, $title, $subtitle, 'editor', null, $group);
    }

    public function keyTime($name, $title, $subtitle=null, $group=1) {
        return $this->key($name, $title, $subtitle, 'time', null, $group);
    }

    public function keyCreateTime($name='create_time', $title='创建时间', $subtitle=null, $group=1) {
        return $this->keyTime($name, $title, $subtitle, $group);
    }

    public function keyUpdateTime($name='update_time', $title='修改时间', $subtitle=null, $group=1) {
        return $this->keyTime($name, $title, $subtitle, $group);
    }
    
	public function keyBool($name, $title, $subtitle=null, $group=1) {
        $map = array(1=>'是',0=>'否');
        return $this->keyRadio($name, $title, $subtitle, $map, $group);
    }
    
	public function keyUid($name, $title, $subtitle=null, $group=1) {
        return $this->keyNumber($name, $title, $subtitle, $group);
    }

    public function keyStatus($name='status', $title='状态', $subtitle=null, $group=1) {
        $map = array(-1=>'删除', 0=>'禁用', 1=>'启用', 2=>'未审核');
        return $this->keySelect($name, $title, $subtitle, $map, $group);
    }

    public function keyTitle($name='title', $title='标题', $subtitle=null, $group=1) {
        return $this->keyText($name, $title, $subtitle, $group);
    }

    public function keyId($name='id', $title='编号', $subtitle=null, $group=1) {
        return $this->keyReadOnly($name, $title, $subtitle, $group);
    }

    public function keyMultiUserGroup($name, $title, $subtitle=null, $group=1) {
        $options = $this->readUserGroups();
        return $this->keyCheckBox($name, $title, $subtitle, $options, $group);
    }
    
    public function keySingleUserGroup($name, $title, $subtitle=null, $group=1) {
        $options = $this->readUserGroups();
        return $this->keySelect($name, $title, $subtitle, $options, $group);
    }
    
    public function keyTree($name, $title, $subtitle=null, $options, $group=1) {
        return $this->key($name, $title, $subtitle, 'tree', $options, $group);
    }

    public function button($title, $attr=array()) {
        $this->_buttonList[] = array('title'=>$title, 'attr'=>$attr);
        return $this;
    }
    
    public function keyGroup($attr = array()){
    	$this->_groupList = $attr;
    	return $this;
    }

    public function buttonSubmit($url, $title='确定') {
        $this->savePostUrl($url);

        $attr = array();
        $attr['class'] = "btn submit-btn ajax-post";
        $attr['id'] = 'submit';
        $attr['type'] = 'submit';
        $attr['target-form'] = 'form-horizontal';
        return $this->button($title, $attr);
    }

    public function buttonBack($title='返回') {
        $attr = array();
        $attr['onclick'] = 'javascript:history.back(-1);return false;';
        $attr['class'] = 'btn btn-return';
        return $this->button($title, $attr);
    }

    public function data($list) {
        $this->_data = $list;
        return $this;
    }

    public function savePostUrl($url) {
        if($url) {
            $this->_savePostUrl = $url;
        }
    }

    public function display() {
        //将数据融入到key中
        foreach($this->_keyList as &$e) {
            $e['value'] = $this->_data[$e['name']];
        }
        unset($e);
//    dump($this->_keyList);exit;    
        //分组显示
        if($this->_groupList){
        	$keyList = array();
        	foreach($this->_groupList as $group_id => $group_name){
        		foreach($this->_keyList as $key => $val){
        			if($val['group'] == $group_id){
        				$keyList[$group_id][] = $val;
        				unset($this->_keyList[$key]);
        			}
        		}
        	}
        	$this->_keyList = $keyList;
        	unset($keyList);
        }

        //编译按钮的html属性
        foreach($this->_buttonList as &$button) {
            $button['attr'] = $this->compileHtmlAttr($button['attr']);
        }
        unset($button);
        
        //导航高亮
        if(empty($this->_highlight)){
        	$this->_highlight = 'index';
        }

        //显示页面
        $this->assign('title', $this->_title);
        $this->assign('keyList', $this->_keyList);
        $this->assign('buttonList', $this->_buttonList);
        $this->assign('savePostUrl', $this->_savePostUrl);
        $this->assign('groupList', $this->_groupList);
        $this->assign('highlight', $this->_highlight);
        parent::display('admin_config');
    }

    private function readUserGroups() {
        $list = M('AuthGroup')->where(array('status'=>1))->order('id asc')->select();
        $result = array();
        foreach($list as $group) {
            $result[$group['id']] = $group['title'];
        }
        return $result;
    }
}