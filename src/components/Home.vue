<template>
  <el-container class="index_container">
    <el-header style="height:60px">
      <span>
        <div class="index_logo">
          <img src="../assets/logo.png" />
        </div>管理后台
      </span>
      <el-button class="btn" @click="logout" round size="mini">退出</el-button>
    </el-header>
    <el-container>
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <div class="toggle-button" @click="toggleCollapse">
          <i :class="isCollapse ? 'el-icon-open' : 'el-icon-turn-off'"></i>
        </div>
        <el-menu
          unique-opened
          :collapse="isCollapse"
          :collapse-transition="false"
          router
          :default-active="$route.path"
        >
          <!--一级菜单-->
          <el-menu-item index="/index">
            <i class="el-icon-s-platform"></i>
            <span slot="title">控制台</span>
          </el-menu-item>
          <el-submenu :index="item.id+''" v-for="item in menulist" :key="item.id">
            <template slot="title">
              <i :class="iconsObj[item.id]"></i>
              <span>{{item.authName}}</span>
            </template>
            <!--二级菜单-->
            <el-menu-item
              :index="'/'+subItem.path"
              v-for="subItem in item.children"
              :key="subItem.id"
            >
              <!--i class="el-icon-menu"></i-->
              <span>{{subItem.authName}}</span>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <el-container>
        <el-main>
          <router-view></router-view>
        </el-main>
        <el-footer style="height:30px">
          ©小竹菌 Qingzhumr@163.com
          <a href="https://element.eleme.cn/" target="_blank">Element</a>
        </el-footer>
      </el-container>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data () {
    return {
      // 左侧菜单数据
      menulist: [],
      iconsObj: {
        125: 'el-icon-s-custom',
        103: 'el-icon-s-tools',
        101: 'el-icon-s-shop',
        102: 'el-icon-s-finance',
        145: 'el-icon-s-claim'
      },
      isCollapse: false
    }
  },
  created () {
    this.getMenuList()
  },
  methods: {
    logout () {
      // 清空token
      this.$confirm('是否删除该角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        localStorage.removeItem('token')
        // this.sessionStorage.clear()
        this.$router.push('/login')
      }).catch(err => err)
    },
    async getMenuList () {
      // 左侧菜单接口获取
      const { data: res } = await this.$http.get('menus')
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.menulist = res.data
      // console.log(res)
    },

    // 点击按钮切换菜单折叠与展开
    toggleCollapse () {
      this.isCollapse = !this.isCollapse
    }

  }
}
</script>

<style lang="less" scoped>
.index_container {
  height: 100%;
}

.el-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #13a5f0;
  color: #fff;
  -webkit-touch-callout: none;
  /*系统默认菜单被禁用*/
  -webkit-user-select: none;
  /*webkit浏览器*/
  -khtml-user-select: none;
  /*早期浏览器*/
  -moz-user-select: none;
  /*火狐*/
  -ms-user-select: none;
  /*IE10*/
  user-select: none;
  line-height: 40px;
  span {
    font-size: 1.366rem;
    margin-left: 10px;
    .index_logo {
      width: 40px;
      height: 40px;
      float: left;
      background-color: #fff;
      border-radius: 50%;
      text-align: center;
      margin-right: 10px;
      img {
        width: 70%;
        height: 70%;
        margin-top: 8px;
      }
    }
  }
}

.el-aside {
  overflow: hidden;
  background-color: #fff;
  border-right: 1px solid #f0f0f0;
  -webkit-touch-callout: none;
  /*系统默认菜单被禁用*/
  -webkit-user-select: none;
  /*webkit浏览器*/
  -khtml-user-select: none;
  /*早期浏览器*/
  -moz-user-select: none;
  /*火狐*/
  -ms-user-select: none;
  /*IE10*/
  user-select: none;
  .el-menu {
    border-right: none;
    .el-menu-item {
      font-size: 0.851rem;
    }
  }
}
.el-footer {
  line-height: 30px;
  border-top: 1px solid #f0f0f0;
  background-color: #fefefe;
  font-size: 0.888rem;
  a {
    color: #255778;
  }
}
.el-main {
  background-color: #f8fbfc;
}
.toggle-button {
  height: 30px;
  background-color: #50b7fb;
  color: #fff;
  font-size: 1.22rem;
  line-height: 30px;
  text-align: center;
  cursor: pointer;
}
</style>
