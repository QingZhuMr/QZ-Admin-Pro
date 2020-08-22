<template>
  <div>
    <!--面包屑导航-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
      <!--后面要打包成组件-->
    </el-breadcrumb>
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="addDialogVisible = true">添加角色</el-button>
        </el-col>
      </el-row>
      <el-table :data="roleslist" border stripe>
        <!--展开列-->
        <el-table-column type="expand" width="50">
          <template v-slot="scope">
            <el-row
              :class="['borderBottom', index1===0 ?'borderTop':'', 'vcenter']"
              v-for="(item1,index1) in scope.row.children"
              :key="item1.id"
            >
              <!--渲染一级权限-->
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row,item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!--渲染二级权限-->
              <el-col :span="19">
                <el-row
                  v-for="(item2,index2) in item1.children"
                  :key="item2.id"
                  :class="{borderTop:index2!=0}"
                  class="vcenter"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRightById(scope.row,item2.id)"
                    >{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag
                      v-for="item3 in item2.children"
                      :key="item3.id"
                      type="warning"
                      closable
                      @close="removeRightById(scope.row,item3.id)"
                    >{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!--索引列-->
        <el-table-column label="#" type="index" width="50"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="350">
          <template v-slot="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(scope.row.id)"
            >编辑</el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeRolesByid(scope.row.id)"
            >删除</el-button>
            <el-button
              type="warning"
              icon="el-icon-paperclip"
              size="mini"
              @click="showSetRightDialog(scope.row)"
            >分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!--添加角色对话框-->
    <el-dialog title="新增角色" :visible.sync="addDialogVisible" width="30%" @close="dialogClosed">
      <!--内容主题区域-->
      <el-form :model="addForm" :rules="rules" ref="addFormRef" label-width="100px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addForm.roleName" placeholder="请输入用户名"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addForm.roleDesc" placeholder="请输入密码"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRoles">确 定</el-button>
      </span>
    </el-dialog>

    <!--修改角色对话框-->
    <el-dialog title="修改角色" :visible.sync="editDialogVisible" width="30%" @close="dialogClosed">
      <el-form :model="editForm" :rules="rules" ref="editFormRef" label-width="100px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRolesInfo">确 定</el-button>
      </span>
    </el-dialog>

    <!--分配权限对话框-->
    <el-dialog title="分配权限" :visible.sync="setRightDialogVisible" width="40%">
      <el-tree
        :data="rightslist"
        :props="treeProps"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="defKeys"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button @click="setRightDialogVisible = false" type="primary">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data () {
    return {
      roleslist: [],
      // 控制对话框的显示与隐藏
      addDialogVisible: false,
      setRightDialogVisible: false,
      editDialogVisible: false,
      // 表单数据
      addForm: {
        roleName: '',
        roleDesc: ''
      },
      // 表单的验证规则对象
      rules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' },
          { min: 6, max: 30, message: '长度在 6 到 30 个字符', trigger: 'blur' }
        ]
      },
      editForm: {},
      rightslist: [],
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      // 分配权限中默认选中的id值数组
      defKeys: []
    }
  },
  created () {
    this.getRolesList()
  },
  methods: {
    // 获取所有角色列表
    async getRolesList () {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        this.$message.error(res.meta.msg)
      }
      this.roleslist = res.data
      console.log(this.roleslist)
    },
    dialogClosed () {
      // XXXFormRef如果不为undefined则重置
      if (this.$refs.addFormRef !== undefined) {
        this.$refs.addFormRef.resetFields()
      }
      if (this.$refs.editFormRef !== undefined) {
        this.$refs.editFormRef.resetFields()
      }
    },
    // 添加新角色
    addRoles () {
      this.$refs.addFormRef.validate(async valid => {
        // console.log(valid)
        if (!valid) return

        // 可以发起添加用户的网络请求
        const { data: res } = await this.$http.post('roles', this.addForm)
        if (res.meta.status !== 201) {
          this.$message.error(res.meta.msg)
        }
        this.$message.success(res.meta.msg)
        this.addDialogVisible = false
        this.getRolesList()
      })
    },
    // 展示修改角色的对话框
    async showEditDialog (id) {
      // console.log(id)
      const { data: res } = await this.$http.get('roles/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('查询用户失败')
      }
      this.editForm = res.data
      this.editDialogVisible = true
    },
    // 修改角色信息提交
    editRolesInfo () {
      this.$refs.editFormRef.validate(async valid => {
        // console.log(valid)
        if (!valid) return null

        const { data: res } = await this.$http.put('roles/' + this.editForm.roleId, {
          roleName: this.editForm.roleName,
          roleDesc: this.editForm.roleDesc
        })
        if (res.meta.status !== 200) {
          return this.$message.error('修改失败')
        }
        this.$message.success('修改成功')
        this.editDialogVisible = false
        this.getRolesList()
      })
    },
    // 根据id删除角色信息
    async removeRolesByid (id) {
      // 弹框询问是否删除
      const confirmResult = await this.$confirm('是否删除该角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)

      // 如果用户确认操作则返回confirm，取消操作则返回cancel
      // console.log(confirmResult)
      if (confirmResult !== 'confirm') return null
      const { data: res } = await this.$http.delete('roles/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('删除失败')
      }
      this.$message.success('删除成功')
      this.getRolesList()
    },
    // 根据id删除对应的权限
    async removeRightById (role, rightId) {
      const confirmResult = await this.$confirm('是否取消该权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') return null
      const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
      if (res.meta.status !== 200) {
        return this.$message.error('取消失败')
      }
      this.$message.success('取消成功')

      // 把服务器传回的最新data属性重新赋值children,避免更新整个页面
      role.children = res.data
    },
    // 获取分配权限的数据列表
    async showSetRightDialog (role) {
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) {
        this.$message.error('获取数据失败')
      }

      this.rightslist = res.data
      console.log(this.rightslist)
      // 获取三级节点的id
      this.getLeafKeys(role, this.defKeys)
      this.setRightDialogVisible = true
    },
    // 通过递归的形式，获取角色下所有三级权限的id，并保存到defkeys数组中
    getLeafKeys (node, arr) {
      if (!node.children) {
        // 如果当前node节点不包含children属性，则是三级节点
        return arr.push(node.id)
      }
      node.children.forEach(item =>
        this.getLeafKeys(item, arr))
    }
  }
}
</script>
<style lang="less" scoped>
.el-tag {
  margin: 7px;
}
.borderTop {
  border-top: 1px solid #f3f3f3;
}
.borderBottom {
  border-bottom: 1px solid #f3f3f3;
}
.vcenter {
  display: flex;
  align-items: center; //纵向对齐
}
</style>
