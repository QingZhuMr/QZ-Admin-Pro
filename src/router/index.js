import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import Index from '../components/Index.vue'
import Users from '../components/user/Users.vue'
import Rights from '../components/power/Rights.vue'
import Roles from '../components/power/Roles.vue'
import Cate from '../components/goods/Cate.vue'

Vue.use(VueRouter)
const routes = [
  // redirct是重新导向的意思
  {
    path: '/',
    redirct: '/login',
    meta: {
      title: '登录 - 后台管理系统'
    }
  },
  {
    path: '/login',
    component: Login,
    meta: {
      title: '登录 - 后台管理系统'
    }
  },
  {
    path: '/home',
    component: Home,
    redirect: '/index',
    meta: {
      title: '后台管理系统'
    },
    children: [
      {
        path: '/index',
        component: Index,
        meta: {
          title: '首页 - 后台管理系统'
        }
      },
      {
        path: '/users',
        component: Users,
        meta: {
          title: '用户列表 - 后台管理系统'
        }
      },
      {
        path: '/rights',
        component: Rights,
        meta: {
          title: '权限列表 - 后台管理系统'
        }
      }, {
        path: '/roles',
        component: Roles,
        meta: {
          title: '角色列表 - 后台管理系统'
        }
      },
      {
        path: '/categories',
        component: Cate,
        meta: {
          title: '商品分类 - 后台管理系统'
        }
      }

    ]
  }
]

const router = new VueRouter({
  routes
})

// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
  if (to.path === '/login') return next()
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')
  next()
})

export default router
