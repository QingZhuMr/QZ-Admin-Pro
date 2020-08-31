<template>
  <div>
    <!--面包屑导航-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialogVisible">添加分类</el-button>
        </el-col>
      </el-row>

      <el-table
        :data="catelist"
        style="width: 100%"
        row-key="cat_id"
        border
        :tree-props="{children: 'children', hasChildren: ''}"
      >
        <!-- <el-table-column type="index" label="ID"></el-table-column> -->
        <el-table-column prop="cat_name" label="分类名称"></el-table-column>
        <el-table-column label="分类状态">
          <template v-slot="scope">
            <i
              class="el-icon-success"
              style="color:#67C23A;"
              v-if="scope.row.cat_deleted === false"
            ></i>
            <i class="el-icon-error" style="color:#F56C6C;" v-else></i>
          </template>
        </el-table-column>
        <el-table-column label="分类等级">
          <template v-slot="scope">
            <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
            <el-tag type="success" size="mini" v-else-if="scope.row.cat_level === 1">二级</el-tag>
            <el-tag type="warning" size="mini" v-else>三级</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template v-slot="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditCateDialogVisible(scope.row.cat_id)"
            >编辑</el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="showDeleteCate(scope.row.cat_id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="querInfo.pagenum"
        :page-sizes="[5, 10, 15]"
        :page-size="querInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>

    <!--新增分类弹框-->
    <el-dialog title="新增分类" :visible.sync="addCateDialogVisible" width="30%" @close="dialogClosed">
      <el-form :model="addCateForm" ref="addCateRef" label-width="100px" :rules="rules">
        <el-form-item label="分类名称" prop="cat_name" required>
          <el-input
            type="text"
            name="cat_name"
            v-model="addCateForm.cat_name"
            placeholder="请输入分类的名称"
          ></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <el-cascader
            placeholder="不选则为顶级分类"
            v-model="selectedKeys"
            :options="parentCateList"
            :props="parentCateListProps"
            @change="parentCateChanged"
            :clearable="true"
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>

    <!--编辑分类弹框-->
    <el-dialog title="编辑分类" :visible.sync="editCateDialogVisible" width="30%" @close="dialogClosed">
      <el-form :model="editCateForm" ref="editCateRef" label-width="100px" :rules="rules">
        <el-form-item label="分类名称" prop="cat_name" required>
          <el-input
            v-model="editCateForm.cat_name"
            placeholder="请输入分类的名称"
          ></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 查询条件
      querInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 商品分类的数据列表
      catelist: [],
      // 总数据条数
      total: 0,
      // 新增分类的弹框
      addCateDialogVisible: false,
      rules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' },
          { min: 2, max: 7, message: '长度在 2 到 7 个字符', trigger: 'blur' }
        ]
      },
      addCateForm: {
        cat_name: '',
        // 分级的父类ID
        cat_pid: 0,
        // 默认一级分类
        cat_level: 0
      },
      // 父级分类的列表
      parentCateList: [],
      parentCateListProps: {
        expandTrigger: 'hover',
        label: 'cat_name',
        children: 'children',
        value: 'cat_id',
        checkStrictly: 'true'
      },
      // 选中的父级分类的id数组
      selectedKeys: [],
      // 编辑分类的弹框
      editCateDialogVisible: false,
      editCateForm: {}
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    // 获取商品分类数据
    async getCateList () {
      const { data: res } = await this.$http.get('categories', { params: this.querInfo })
      if (res.meta.status !== 200) {
        return this.$message.error('获取分类数据失败')
      }
      // 把数据列表赋值给catelist

      this.catelist = res.data.result

      this.total = res.data.total

    //   console.log(this.catelist)
    },
    // 监听添加用户对话框的关闭事件
    dialogClosed () {
      // 如果不为undefined则重置
      if (this.$refs.addCateRef !== undefined) {
        this.$refs.addCateRef.resetFields()
        this.selectedKeys = []
        this.addCateForm.cat_level = 0
        this.addCateForm.cat_pid = 0
      }
      if (this.$refs.editCateRef !== undefined) {
        this.$refs.editCateRef.resetFields()
      }
    },
    // 监听pagesize改变
    handleSizeChange (newSize) {
      this.querInfo.pagesize = newSize
      this.getCateList()
    },
    handleCurrentChange (newPage) {
      this.querInfo.pagenum = newPage
      this.getCateList()
    },
    showAddCateDialogVisible () {
      this.getParentCateList()
      this.addCateDialogVisible = true
    },
    // 获取父级分类的数据列表
    async getParentCateList () {
      const { data: res } = await this.$http.get('categories', { params: { type: 2 } })
      if (res.meta.status !== 200) {
        return this.$message.error('获取分类数据失败')
      }
      //   console.log(res.data)
      this.parentCateList = res.data
    },
    // 选择项发生变化触发事件
    parentCateChanged () {
      console.log(this.selectedKeys)
      // 如果selectedKeys中的length大于0，证明选中了父级分类
      // 反正，则没有选中任何父类
      if (this.selectedKeys.length > 0) {
        // 父级分类的ID，选中数组中最后一个id
        this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        // 为当前分类的等级赋值
        this.addCateForm.cat_level = this.selectedKeys.length
      } else {
        // 父级分类的ID
        this.addCateForm.cat_pid = 0
        // 为当前分类的等级赋值
        this.addCateForm.cat_level = 0
      }
    },
    addCate () {
      // 预校验
      this.$refs.addCateRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('categories', this.addCateForm)

        if (res.meta.status !== 201) {
          return this.$message.error('添加分类失败！')
        }
        this.$message.success('添加分类成功！')
        this.getCateList()
        this.addCateDialogVisible = false
      })
    },
    // 编辑分类弹框事件
    async showEditCateDialogVisible (id) {
    //   console.log(id)
      const { data: res } = await this.$http.get('categories/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('查询用户失败')
      }
      this.editCateForm = res.data

      this.editCateDialogVisible = true
    },
    editCate () {
    // 先走一波预校验
      this.$refs.editCateRef.validate(async valid => {
        if (!valid) return null
        // 把改的东西送后端那去，我居然憨批的把cat_id后的逗号打成加号了，找了一个小时错误，我真是个憨批
        const { data: res } = await this.$http.put('categories/' + this.editCateForm.cat_id, {
          cat_name: this.editCateForm.cat_name
        })
        // 判断一下状态，不行就弹下窗
        if (res.meta.status !== 200) {
          return this.$message.error('编辑分类失败！')
        }

        this.$message.success('编辑分类成功！')
        // 更新下页面
        this.getCateList()
        // 关闭当前编辑分类的弹窗
        this.editCateDialogVisible = false
      })
    },
    // 删除分类事件
    async showDeleteCate (id) {
      const confirmResult = await this.$confirm('是否删除该分类, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') return null
      const { data: res } = await this.$http.delete('categories/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('删除分类失败！')
      }
      this.$message.success('删除分类成功！')
      this.getCateList()
    }
  }
}
</script>

<style>
</style>
