<template>
  <div>
    <!--面包屑导航-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row :gutter="20">
        <el-col :span="7">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUesrList">
            <el-button slot="append" icon="el-icon-search" @click="getUesrList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>

      <el-table :data="userlist" border stripc>
        <el-table-column type="index" label="#" width="50"></el-table-column>
        <el-table-column prop="username" label="用户"></el-table-column>
        <el-table-column prop="mobile" label="号码"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="role_name" label="角色"></el-table-column>
        <el-table-column label="状态">
          <template v-slot="scope">
            <el-switch @change="userStateChange(scope.row)" v-model="scope.row.mg_state"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="210">
          <template>
            <!--v-slot="scope" 没成功 待处理-->
            <el-tooltip effect="dark" content="修改用户" placement="top">
              <el-button type="primary" icon="el-icon-edit"></el-button>
            </el-tooltip>
            <el-tooltip effect="dark" content="删除用户" placement="top">
              <el-button type="danger" icon="el-icon-delete"></el-button>
            </el-tooltip>
            <el-tooltip effect="dark" content="修改权限" placement="top">
              <el-button type="warning" icon="el-icon-paperclip"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!--分页-->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>

    <!--添加用户对话框-->
    <el-dialog title="新增用户" :visible.sync="addDialogVisible" width="30%" @close="addDialogClosed">
      <!--内容主题区域-->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
        <el-form-item label="用户" prop="username">
          <el-input v-model="addForm.username" placeholder="请输入用户名"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password" placeholder="请输入密码"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email" placeholder="请输入电子邮箱"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile" placeholder="请输入手机号码"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addUser = false">确 定</el-button>
        </el-form-item>
      </el-form>
      <!--底部区域-->
      <!--span slot="footer" class="dialog-footer">

      </span-->
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    // 验证邮箱的规则
    var checkEmail = (rule, value, callback) => {
      // 验证邮箱的正则表达式
      const regEmail = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/
      if (!regEmail.test(value)) {
        // 不合法的邮箱
        callback(new Error('请输入合法的电子邮箱'))
      } else {
        return callback()
      }
    }
    // 验证手机号的规则
    var checkMobile = (rule, value, callback) => {
      // 验证手机号的正则表达式
      const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
      if (!regMobile.test(value)) {
        // 不合法的手机号码
        callback(new Error('请输入合法的手机号码'))
      } else {
        return callback()
      }
    }

    return {
      // 获取用户列表的参数对象
      queryInfo: {
        query: '',
        // 当前页数
        pagenum: 1,
        // 当前每页显示多少条数据
        pagesize: 10
      },
      userlist: [],
      total: 0,
      // 控制对话框的显示与隐藏
      addDialogVisible: false,
      // 添加用户的表单数据
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 添加表单的验证规则对象
      addFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入电子邮箱', trigger: 'blur' },
          { validator: checkEmail, triggr: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkMobile, triggr: 'blur' }
        ]
      }
    }
  },
  created () {
    this.getUesrList()
  },
  methods: {
    async getUesrList () {
      const { data: res } = await this.$http.get('users', { params: this.queryInfo })

      if (res.meta.status !== 200) {
        return this.$message.error('获取用户列表失败')
      }
      this.userlist = res.data.users
      this.total = res.data.total
    //   console.log(res)
    },
    // 监听pagesize改变的事件
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getUesrList()
    },
    // 监听页码值改变的事件
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getUesrList()
    },
    // 监听switch开关状态的改版
    async userStateChange (userinfo) {
      const { data: res } = await this.$http.put(`users/${userinfo.id}/state/${userinfo.mg_state}`)
      if (res.meta.status !== 200) {
        userinfo.mg_state = !userinfo.mg_state
        return this.$message.error('更新用户状态失败！')
      }
      this.$message.success('更新用户状态成功！')
    },
    // 监听添加用户对话框的关闭事件
    addDialogClosed () {
      // addFormRef如果不为undefined则重置
      if (this.$refs.addFormRef !== undefined) {
        this.$refs.addFormRef.resetFields()
      }
    },
    // 添加新用户
    addUser () {
      this.$refs.addFormRef.validate(async valid => {
        console.log(valid)

        if (!valid) return this.$message.success('校验失败')
        // 可以发起添加用户的网络请求
        const { data: res } = await this.$http.post('users', this.addForm)
        if (res.meta.statys !== 201) {
          this.$message.error('添加用户失败')
        }
        this.$message.success('添加用户成功')
        this.addDialogVisible = false
        this.getUesrList()
      })
    }
  }

}
</script>

<style lang="less" scoped>
</style>
