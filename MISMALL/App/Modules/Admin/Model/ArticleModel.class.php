<?php
// +----------------------------------------------------------------------
// | OneThink [ WE CAN DO IT JUST THINK IT ]
// +----------------------------------------------------------------------
// | Copyright (c) 2013 http://www.onethink.cn All rights reserved.
// +----------------------------------------------------------------------
// | Author: huajie <banhuajie@163.com>
// +----------------------------------------------------------------------

/**
 * 内容模型
 */
class ArticleModel extends Model{

    /* 自动验证规则 */
    protected $_validate = array(
        array('name', '/^[a-zA-Z]\w{0,39}$/', '文档标识不合法', self::VALUE_VALIDATE, 'regex', self::MODEL_BOTH),
        array('name', 'checkName', '标识已经存在', self::VALUE_VALIDATE, 'callback', self::MODEL_BOTH),
        array('title', 'require', '标题不能为空', self::MUST_VALIDATE, 'regex', self::MODEL_BOTH),
        array('title', '1,80', '标题长度不能超过80个字符', self::MUST_VALIDATE, 'length', self::MODEL_BOTH),
    	array('sort', '/^[\d]+$/', '优先级只能填正整数', self::VALUE_VALIDATE, 'regex', self::MODEL_BOTH),
        //TODO: 外链编辑验证
        //array('link_id', 'url', '外链格式不正确', self::VALUE_VALIDATE, 'regex', self::MODEL_BOTH),
        //array('summary', '1,140', '简介长度不能超过140个字符', self::VALUE_VALIDATE, 'length', self::MODEL_BOTH),
        array('category_id', 'require', '分类不能为空', self::MUST_VALIDATE , 'regex', self::MODEL_INSERT),
        array('category_id', 'require', '分类不能为空', self::EXISTS_VALIDATE , 'regex', self::MODEL_UPDATE),
        array('deadline', '/^\d{4,4}-\d{1,2}-\d{1,2}(\s\d{1,2}:\d{1,2}(:\d{1,2})?)?$/', '日期格式不合法,请使用"年-月-日 时:分"格式,全部为数字', self::VALUE_VALIDATE  , 'regex', self::MODEL_BOTH),
        array('create_time', '/^\d{4,4}-\d{1,2}-\d{1,2}(\s\d{1,2}:\d{1,2}(:\d{1,2})?)?$/', '日期格式不合法,请使用"年-月-日 时:分"格式,全部为数字', self::VALUE_VALIDATE  , 'regex', self::MODEL_BOTH),
    );

    /* 自动完成规则 */
    protected $_auto = array(
        array('uid', 'is_login', self::MODEL_INSERT, 'function'),
        array('title', 'htmlspecialchars', self::MODEL_BOTH, 'function'),
        array('summary', 'htmlspecialchars', self::MODEL_BOTH, 'function'),
    	array('root', 'getRoot', self::MODEL_BOTH, 'callback'),
        array('link_id', 'getLink', self::MODEL_BOTH, 'callback'),
        array('attach', 0, self::MODEL_INSERT),
        array('view', 0, self::MODEL_INSERT),
        array('comment', 0, self::MODEL_INSERT),
        array('extend', 0, self::MODEL_INSERT),
        array('create_time', 'getCreateTime', self::MODEL_BOTH,'callback'),
		array('reply_time', 'getCreateTime', self::MODEL_INSERT,'callback'),
        array('update_time', NOW_TIME, self::MODEL_BOTH),
        array('status', 'getStatus', self::MODEL_BOTH, 'callback'),
        array('position', 'getPosition', self::MODEL_BOTH, 'callback'),
        array('deadline', 'strtotime', self::MODEL_BOTH, 'function'),
    );

    /**
     * 获取文档列表
     * @param  integer  $category 分类ID
     * @param  string   $order    排序规则
     * @param  integer  $status   状态
     * @param  boolean  $count    是否返回总数
     * @param  string   $field    字段 true-所有字段
     * @param  string   $limit    分页参数
     * @param  array    $map      查询条件参数
     * @return array              文档列表
     * @author huajie <banhuajie@163.com>
     */
    public function lists($category, $order = '`id` DESC', $status = 1, $field = true, $limit = '10', $map = array()){
        $map = array_merge($this->listMap($category, $status), $map);
        return $this->field($field)->where($map)->order($order)->limit($limit)->select();
    }

    /**
     * 计算列表总数
     * @param  number  $category 分类ID
     * @param  integer $status   状态
     * @return integer           总数
     */
    public function listCount($category, $status = 1, $map = array()){
        $map = array_merge($this->listMap($category, $status), $map);
        return $this->where($map)->count('id');
    }

    /**
     * 获取详情页数据
     * @param  integer $id 文档ID
     * @return array       详细数据
     */
    public function detail($id){
        /* 获取基础数据 */
        $info = $this->field(true)->find($id);
        if(!(is_array($info) || 1 !== $info['status'])){
            $this->error = '文档被禁用或已删除！';
            return false;
        }
        return $info;
    }

    /**
     * 返回前一篇文档信息
     * @param  array $info 当前文档信息
     * @return array
     */
    public function prev($info){
        $map = array(
            'id'          => array('lt', $info['id']),
            'category_id' => $info['category_id'],
            'status'      => 1,
        );

        /* 返回前一条数据 */
        return $this->field(true)->where($map)->order('id DESC')->find();
    }

    /**
     * 获取下一篇文档基本信息
     * @param  array    $info 当前文档信息
     * @return array
     */
    public function next($info){
        $map = array(
            'id'          => array('gt', $info['id']),
            'category_id' => $info['category_id'],
            'status'      => 1,
        );

        /* 返回下一条数据 */
        return $this->field(true)->where($map)->order('id')->find();
    }

    /**
     * 获取推荐位数据列表
     * @param  number  $pos      推荐位 1-列表推荐，2-频道页推荐，3-首页推荐
     * @param  number  $category 分类ID
     * @param  number  $limit    列表行数
     * @param  boolean $filed    查询字段
     * @return array             数据列表
     */
    public function position($pos, $category = null, $limit = null, $field = true){
        $map = $this->listMap($category, 1, $pos);

        /* 设置列表数量 */
        is_numeric($limit) && $this->limit($limit);

        /* 读取数据 */
        return $this->field($field)->where($map)->select();
    }

    /**
     * 获取数据状态
     * @return integer 数据状态
     */
    protected function getStatus(){
    	$id = I('post.id');
        $cate = I('post.category_id');
        if(empty($id)){	//新增
        	$status = 1;
        }else{				//更新
			$status = $this->getFieldById($id, 'status');
			//编辑草稿改变状态
			if($status == 3){
				$status = 1;
			}
        }
        return $status;
    }

    /**
     * 获取根节点id
     * @return integer 数据id
     * @author huajie <banhuajie@163.com>
     */
    protected function getRoot(){
    	$pid = I('post.pid');
    	if($pid == 0){
    		return 0;
    	}
    	$p_root = $this->getFieldById($pid, 'root');
    	return $p_root == 0 ? $pid : $p_root;
    }

    /**
     * 创建时间不写则取当前时间
     * @return int 时间戳
     * @author huajie <banhuajie@163.com>
     */
    protected function getCreateTime(){
        $create_time    =   I('post.create_time');
        return $create_time?strtotime($create_time):NOW_TIME;
    }

    /**
     * 设置where查询条件
     * @param  number  $category 分类ID
     * @param  number  $pos      推荐位
     * @param  integer $status   状态
     * @return array             查询条件
     */
    private function listMap($category, $status = 1, $pos = null){
        /* 设置状态 */
        $map = array('status' => $status);

        /* 设置分类 */
        if(!is_null($category)){
            if(is_numeric($category)){
                $map['category_id'] = $category;
            } else {
                $map['category_id'] = array('in', str2arr($category));
            }
        }

        /* 设置推荐位 */
        if(is_numeric($pos)){
            $map[] = "position & {$pos} = {$pos}";
        }

        return $map;
    }

    /**
     * 检查标识是否已存在(只需在同一根节点下不重复)
     * @param string $name
     * @return true无重复，false已存在
     * @author huajie <banhuajie@163.com>
     */
    protected function checkName(){
        $name = I('post.name');
        $pid = I('post.pid', 0);
        $id = I('post.id', 0);

        //获取根节点
        if($pid == 0){
        	$root = 0;
        }else{
        	$root = $this->getFieldById($pid, 'root');
        	$root = $root == 0 ? $pid : $root;
        }

        $map = array('root'=>$root, 'name'=>$name, 'id'=>array('neq',$id));
        $res = $this->where($map)->getField('id');
        if($res){
        	return false;
        }
        return true;
    }

    /**
     * 生成不重复的name标识
     * @author huajie <banhuajie@163.com>
     */
    private function generateName(){
        $str = 'abcdefghijklmnopqrstuvwxyz0123456789';	//源字符串
        $min = 10;
        $max = 39;
        $name = false;
        while (true){
            $length = rand($min, $max);	//生成的标识长度
            $name = substr(str_shuffle(substr($str,0,26)), 0, 1);	//第一个字母
            $name .= substr(str_shuffle($str), 0, $length);
            //检查是否已存在
            $res = $this->getFieldByName($name, 'id');
            if(!$res){
                break;
            }
        }
        return $name;
    }

    /**
     * 生成推荐位的值
     * @return number 推荐位
     * @author huajie <banhuajie@163.com>
     */
    protected function getPosition(){
        $position = I('post.position');
        if(!is_array($position)){
            return 0;
        }else{
            $pos = 0;
            foreach ($position as $key=>$value){
                $pos += $value;		//将各个推荐位的值相加
            }
            return $pos;
        }
    }

    /**
     * 获取链接id
     * @return int 链接对应的id
     * @author huajie <banhuajie@163.com>
     */
    protected function getLink(){
        $link = I('post.link_id');
        if(empty($link)){
            return 0;
        } else if(is_numeric($link)){
            return $link;
        }
        $res = D('Url')->update(array('url'=>$link));
        return $res['id'];
    }

    /**
     * 保存为草稿
     * @return array 完整的数据， false 保存出错
     * @author huajie <banhuajie@163.com>
     */
    public function autoSave(){
        $post = I('post.');

        $post['category_id'] = isset($post['category_id3']) && intval($post['category_id3']) ? intval($post['category_id3']) : (
        						isset($post['category_id2']) && intval($post['category_id2']) ? intval($post['category_id2']) :(
        						isset($post['category_id1']) && intval($post['category_id1']) ? intval($post['category_id1']) : (
        						isset($post['category_id0']) && intval($post['category_id0']) ? intval($post['category_id0']) : 0)));
        						
        unset($post['category_id0'], $post['category_id1'],$post['category_id2'], $post['category_id3']);

        //触发自动保存的字段
        $save_list = array('name','title','category_id','summary','description','position','link_id','cover_id','deadline','create_time');
        foreach ($save_list as $value){
            if(!empty($post[$value])){
                $if_save = true;
                break;
            }
        }

        if(!$if_save){
            $this->error = '您未填写任何内容';
            return false;
        }

        //重置自动验证
        $this->_validate = array(
            array('name', '/^[a-zA-Z]\w{0,39}$/', '文档标识不合法', self::VALUE_VALIDATE, 'regex', self::MODEL_BOTH),
            array('name', '', '标识已经存在', self::VALUE_VALIDATE, 'unique', self::MODEL_BOTH),
            array('title', '1,80', '标题长度不能超过80个字符', self::VALUE_VALIDATE, 'length', self::MODEL_BOTH),
            array('category_id', 'require', '分类不能为空', self::MUST_VALIDATE , 'regex', self::MODEL_BOTH),
            array('deadline', '/^\d{4,4}-\d{1,2}-\d{1,2}(\s\d{1,2}:\d{1,2}(:\d{1,2})?)?$/', '日期格式不合法,请使用"年-月-日 时:分"格式,全部为数字', self::VALUE_VALIDATE  , 'regex', self::MODEL_BOTH),
            array('create_time', '/^\d{4,4}-\d{1,2}-\d{1,2}(\s\d{1,2}:\d{1,2}(:\d{1,2})?)?$/', '日期格式不合法,请使用"年-月-日 时:分"格式,全部为数字', self::VALUE_VALIDATE  , 'regex', self::MODEL_BOTH),
        );
        $this->_auto[] = array('status', '3', self::MODEL_BOTH);

        if(!($data = $this->create())){
            return false;
        }

        /* 添加或新增基础内容 */
        if(empty($data['id'])){ //新增数据
            $id = $this->add(); //添加基础内容
            if(!$id){
    			$this->error = '新增基础内容出错！';
                return false;
            }
            $data['id'] = $id;
        } else { //更新数据
            $status = $this->save(); //更新基础内容
            if(false === $status){
    			$this->error = '更新基础内容出错！';
                return false;
            }
        }

        //内容添加或更新完成
        return $data;
    }
}
