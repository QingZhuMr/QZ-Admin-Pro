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

      <el-table :data="userlist" border stripe>
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
          <template v-slot="scope">
            <el-tooltip effect="dark" content="修改用户" placement="top">
              <!--打开对话框并把id值传过去-->
              <el-button
                type="primary"
                icon="el-icon-edit"
                size="mini"
                @click="showEditDialog(scope.row.id)"
              ></el-button>
            </el-tooltip>
            <el-tooltip effect="dark" content="删除用户" placement="top">
              <el-button
                type="danger"
                icon="el-icon-delete"
                size="mini"
                @click="removeUserByid(scope.row.id)"
              ></el-button>
            </el-tooltip>
            <el-tooltip effect="dark" content="分配角色" placement="top">
              <el-button
                type="warning"
                icon="el-icon-paperclip"
                size="mini"
                @click="setRole(scope.row)"
              ></el-button>
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
    <el-dialog title="新增用户" :visible.sync="addDialogVisible" width="30%" @close="dialogClosed">
      <!--内容主题区域-->
      <el-form :model="addForm" :rules="rules" ref="addFormRef" label-width="70px">
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
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>

    <!--修改用户对话框-->
    <el-dialog title="修改用户" :visible.sync="editDialogVisible" width="30%" @close="dialogClosed">
      <el-form :model="editForm" :rules="rules" ref="editFormRef" label-width="70px">
        <el-form-item label="用户" prop="username">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo">确 定</el-button>
      </span>
    </el-dialog>

    <!--分配角色对话框-->
    <el-dialog title="分配角色" :visible.sync="setRoleDialogVisible" width="30%" @close="dialogClosed">
      <el-form label-width="70px">
        <el-form-item label="用户" prop="username">
          <el-input v-model="userInfo.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="当前角色" prop="role_name">
          <el-input v-model="userInfo.role_name" disabled></el-input>
        </el-form-item>
        <el-form-item label="分配角色">
          <el-select v-model="selectedRoleId"  placeholder="请选择角色">
            <el-option
            v-for="item in rolesList"
            :key="item.id"
            :label="item.roleName"
            :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
      </span>
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
      const regMobile = /^1[3|4|5|7|8]\d{9}$/
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
      // 用户的表单数据
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 添加表单的验证规则对象
      rules: {
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
      },
      // 控制修改用户对话框的显示与隐藏
      editDialogVisible: false,
      editForm: {},
      // 控制角色对话框的显示隐藏
      setRoleDialogVisible: false,
      // 需要被分配角色的用户信息
      userInfo: {},
      // 所有角色列表
      rolesList: [],
      // 已选中的角色
      selectedRoleId: ''
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
      // console.log(res)
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
        return this.$message.error(res.meta.msg)
      }
      this.$message.success(res.meta.msg)
    },
    // 监听添加用户对话框的关闭事件
    dialogClosed () {
      // 如果不为undefined则重置
      if (this.$refs.addFormRef !== undefined) {
        this.$refs.addFormRef.resetFields()
      }
      if (this.$refs.editFormRef !== undefined) {
        this.$refs.editFormRef.resetFields()
      }
      if (this.selectedRoleId !== undefined) {
        this.selectedRoleId = ''
        this.userInfo = ''
      }
    },
    // 添加新用户
    addUser () {
      this.$refs.addFormRef.validate(async valid => {
        // console.log(valid)
        if (!valid) return

        // 可以发起添加用户的网络请求
        const { data: res } = await this.$http.post('users', this.addForm)
        if (res.meta.status !== 201) {
          this.$message.error(res.meta.msg)
        }
        this.$message.success(res.meta.msg)
        this.addDialogVisible = false
        this.getUesrList()
      })
    },
    // 展示编辑用户的对话框
    async showEditDialog (id) {
      // console.log(id)
      const { data: res } = await this.$http.get('users/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('查询用户失败')
      }
      this.editForm = res.data
      this.editDialogVisible = true
    },
    // 修改用户信息提交
    editUserInfo () {
      this.$refs.editFormRef.validate(async valid => {
        // console.log(valid)
        if (!valid) return null

        // 发起修改用户信息的数据请求
        const { data: res } = await this.$http.put('users/' + this.editForm.id, {
          email: this.editForm.email,
          mobile: this.editForm.mobile
        })

        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg)
        }
        this.$message.success(res.meta.msg)
        this.editDialogVisible = false
        this.getUesrList()
      })
    },
    // 根据id删除用户信息
    async removeUserByid (id) {
      // 弹框询问是否删除
      const confirmResult = await this.$confirm('是否删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)

      // 如果用户确认操作则返回confirm，取消操作则返回cancel
      // console.log(confirmResult)
      if (confirmResult !== 'confirm') return null
      const { data: res } = await this.$http.delete('users/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.$message.success(res.meta.msg)
      this.getUesrList()
    },

    // 展示分配角色的对话框
    async setRole (userInfo) {
      this.userInfo = userInfo

      // 在展示之前获取角色列表
      const { data: res } = await this.$http.get('roles')

      if (res.meta.status !== 200) {
        return this.$message.error('获取角色数据失败')
      }

      this.rolesList = res.data

      this.setRoleDialogVisible = true
    },
    // 保存角色分配事件
    async saveRoleInfo () {
      if (!this.selectedRoleId) {
        return this.$message.error('请选择角色')
      }
      const { data: res } = await this.$http.put(`users/${this.userInfo.id}/role`, {
        rid: this.selectedRoleId
      })
      if (res.meta.status !== 200) {
        return this.$message.error('分配角色失败')
      }
      this.$message.success('分配角色成功')
      this.getUesrList()
      this.setRoleDialogVisible = false
    }
  }

}
</script>

<style lang="less" scoped>
</style>
