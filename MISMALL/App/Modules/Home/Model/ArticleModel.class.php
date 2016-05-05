<?php
/**
 * 内容管理
 *
 * @author cjli
 *
 */
Class ArticleModel extends Model {

	/**
	 * 文章分类模型
	 * @var model
	 */
	private $_categoryModel;

	/**
	 * 初始化
	 */
	public function _initialize() {
		$this->_categoryModel = M('Category');
	}

	/**
	 * 获取分类详细信息
	 *
	 * @param  milit   $id 分类ID或标识
	 * @param  boolean $field 查询字段
	 *
	 * @return array     分类信息
	 */
	public function getCategoryInfo($id, $field = true) {
		/* 获取分类信息 */
		$map = array();
		if (is_numeric($id)) {
			//通过ID查询
			$map['id'] = $id;
		} else {
			//通过标识查询
			$map['name'] = $id;
		}
		return $this->_categoryModel->field($field)->where($map)->find();
	}

	/**
	 * 获取分类树，指定分类则返回指定分类极其子分类，不指定则返回所有分类树
	 *
	 * @param  integer $id    分类ID
	 * @param  boolean $field 查询字段
	 *
	 * @return array          分类树
	 */
	public function getCategoryTree($id = 0, $field = true) {
		/* 获取当前分类信息 */
		if ($id) {
			$info = $this->getCategoryInfo($id);
			$id = $info['id'];
		}

		/* 获取所有分类 */
		$map = array('status' => array('gt', -1));
		$list = $this->_categoryModel->field($field)->where($map)->order('sort')->select();
		$list = list_to_tree($list, $pk = 'id', $pid = 'pid', $child = 'child', $root = $id);

		/* 获取返回数据 */
		if (isset($info)) {
			//指定分类则返回当前分类极其子分类
			$info['child'] = $list;
		} else {
			//否则返回所有分类
			$info = $list;
		}

		return $info;
	}

	/**
	 * 生成分类Tree
	 *
	 * @param int $pid 分类ID
	 */
	public function makeTree($pid) {
		if ($cache = S('Cache_News_Cate_' . $pid)) {
			return $cache;
		}

		if ($c = $this->_categoryModel->order('sort ASC')->where("pid='$pid'")->select()) {
			if ($pid == 0) {
				foreach ($c as $v) {
					$cTree['t'] = $v['title'];
					$cTree['a'] = $v['id'];
					$cTree['o'] = $v['sort'];
					$cTree['d'] = $this->_makeTree($v['id']);
					$cTree['name'] = $v['name'];
					$cTrees[] = $cTree;
				}
			} else {
				foreach ($c as $v) {
					$cTree['t'] = $v['title'];
					$cTree['a'] = $v['id'];
					$cTree['o'] = $v['sort'];
					$cTree['d'] = $this->_makeTree($v['id']); //$v['id'];
					$cTree['name'] = $v['name'];
					$cTrees[] = $cTree;
				}
			}
		}
		S('Cache_News_Cate_' . $pid, $cTrees);
		return $cTrees;
	}

	/**
	 * 获取指定分类的同级分类
	 *
	 * @param  integer $id    分类ID
	 * @param  boolean $field 查询字段
	 * @return array
	 */
	public function getSameLevel($id, $field = true) {
		$info = $this->getCategoryInfo($id, 'pid');
		$map = array('pid' => $info['pid'], 'status' => 1);
		return $this->_categoryModel->field($field)->where($map)->order('sort')->select();
	}

	/**
	 * 获取所有子类的ID集
	 */
	public function getCategorySubIds($id = 0, $list = NULL) {
		static $subArray;
		if (is_null($list)) {
			$list = $this->getCategoryTree($id);
			$subArray[] = $list['id'];
			if (isset($list['child']) && $list['child']) {
				$this->getCategorySubIds($list['id'], $list['child']);
			}
		} else {
			foreach ($list as $cat) {
				$subArray[] = $cat['id'];
				if (isset($cat['child']) && $cat['child']) {
					$this->getCategorySubIds($cat['id'], $cat['child']);
				}
			}
		}
		return $subArray;
	}

	/**
	 * 获取链接id
	 *
	 * @return int 链接对应的id
	 */
	protected function getLink($link_id) {
		if (empty($link_id)) {
			return 0;
		} else if (is_numeric($link_id)) {
			return $link_id;
		}
		$res = D('Url')->update(array('url' => $link_id));
		return $res['id'];
	}

	/**
	 * 获取文章列表
	 *
	 * @param array $post文章条件
	 * @param int||null $page 从第几页开始, 默认查全部
	 * @param int $pageRows 每页的个数
	 * @param string $field 查询字段
	 * @return array
	 */
	public function getArticleList($post = array(), $page = NULL, $pageRows = 20, $field = true) {
		$where = array(
			'id' => isset($post['id']) ? intval($post['id']) : NULL,
			'uid' => isset($post['uid']) ? intval($post['uid']) : NULL,
			'title' => isset($post['title']) && $post['title'] ? array('like', '%' . $post['title'] . '%') : NULL,
			'status' => isset($post['status']) ? $post['status'] : 1,
			'position' => isset($post['position']) ? intval($post['position']) : NULL,
		);

		foreach ($where as $key => $val) {
			if (is_null($val)) {
				unset($where[$key]);
			}
		}
		//分类ＩＤ
		if (isset($post['category_id']) && intval($post['category_id'])) {
			$typeIds = $this->getCategorySubIds($post['category_id']);
			$where['category_id'] = array('in', $typeIds);
		}

		$this->field($field);
		$this->where($where);

		//排序
		if (isset($post['order'])) {
			$this->order($post['order']);
		} else {
			$this->order('sort DESC, id DESC');
		}
		//分页
		if ($page) {
			$this->page($page, $pageRows);
		}
		$list = $this->select();
//		echo $this->getLastSql();
		if ($list) {
			foreach ($list as &$cat) {
				$cat['cover'] = get_cover($cat['cover_id'], 'url');
			}
			unset($cat);
		}

		return $list ? $list : array();
	}

	/**
	 * 获取文章总数
	 *
	 * @param array $post 文章条件
	 * @return int
	 */
	public function getArticleCount($post) {
		$where = array(
			'id' => isset($post['id']) ? intval($post['id']) : NULL,
			'uid' => isset($post['uid']) ? intval($post['uid']) : NULL,
			'title' => isset($post['title']) && $post['title'] ? array('like', '%' . $post['title'] . '%') : NULL,
			'status' => isset($post['status']) ? $post['status'] : 1,
			'position' => isset($post['position']) ? intval($post['position']) : NULL,
		);

		foreach ($where as $key => $val) {
			if (is_null($val)) {
				unset($where[$key]);
			}
		}
		//分类ＩＤ
		if (isset($post['category_id']) && intval($post['category_id'])) {
			$typeIds = $this->getCategorySubIds($post['category_id']);
			$where['category_id'] = array('in', $typeIds);
		}

		$this->where($where);
		$count = $this->count();
		return $count;
	}

	/**
	 * 获取详情页数据
	 *
	 * @param  integer $id 文档ID
	 *
	 * @return array       详细数据
	 */
	public function detail($id) {
		/* 获取基础数据 */
		$info = $this->find($id);
		if (!(is_array($info) || 1 !== $info['status'])) {
			$this->error = '文档被禁用或已删除！';
			return false;
		}
		return $info;
	}

	/**
	 * 返回前一篇文档信息
	 *
	 * @param  array $info 当前文档信息
	 *
	 * @return array
	 */
	public function prev($info) {
		$map = array(
			'id' => array('lt', $info['id']),
			'category_id' => $info['category_id'],
			'status' => 1,
		);

		/* 返回前一条数据 */
		return $this->field(true)->where($map)->order('id DESC')->find();
	}

	/**
	 * 获取下一篇文档基本信息
	 *
	 * @param  array    $info 当前文档信息
	 *
	 * @return array
	 */
	public function next($info) {
		$map = array(
			'id' => array('gt', $info['id']),
			'category_id' => $info['category_id'],
			'status' => 1,
		);

		/* 返回下一条数据 */
		return $this->field(true)->where($map)->order('id')->find();
	}
}