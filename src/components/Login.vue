<template>
  <div class="login_container">
    <div class="login_box">
      <!--LOGO-->
      <div class="login_img">
        <img src="../assets/logo.png" />
      </div>

      <!--登录表单-->
      <el-form ref="loginFormRef" class="login_form" :model="loginForm" :rules="loginFormRules">
        <!--用户名-->
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            prefix-icon="el-icon-user-solid"
            placeholder="请输入用户名"
          ></el-input>
        </el-form-item>
        <!--密码-->
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            prefix-icon="el-icon-s-custom"
            placeholder="请输入密码"
            type="password"
          ></el-input>
        </el-form-item>
        <!--按钮-->
        <el-form-item class="btns">
          <el-button
            icon="el-icon-s-promotion"
            @click="login"
            type="primary"
          >登录</el-button>
          <el-button icon="el-icon-refresh-left" type="info" @click="resetLoginForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="footer">
      ©小竹菌 Qingzhumr@163.com
      <a href="https://element.eleme.cn/" target="_blank">Element</a>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 登录表单数据绑定对象
      loginForm: {},
      loginFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    // 点击重置按钮，重置实例
    resetLoginForm () {
      this.$refs.loginFormRef.resetFields()
    },
    login () {
      this.$refs.loginFormRef.validate(async valid => {
        // console.log(valid)
        // 判断valid是否为true
        if (!valid) return
        const { data: res } = await this.$http.post('login', this.loginForm)

        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        this.$message.success(res.meta.msg)

        // console.log(res)
        // 保存token到客户端的sessionStirage
        window.sessionStorage.setItem('token', res.data.token)

        this.$router.push('/home')
      })
    }
  }
}
</script>

<style lang="less" scoped>
.login_container {
  background-image: linear-gradient(to bottom right, #176aa2, #8dcffb);
  height: 100%;
}
.login_box {
  width: 450px;
  height: 300px;
  background-color: #fff;
  border-radius: 10px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 0px 2px 5px #135079;
}
.login_img {
  width: 130px;
  height: 130px;
  border: 5px solid #7ec7f7;
  border-radius: 50%;
  text-align: center;
  box-shadow: 0px 2px 5px #135079;
  position: absolute;
  left: 50%;
  right: 50%;
  transform: translate(-50%);
  margin-top: -70px;
  background-color: #fff;
  img {
    width: 70%;
    height: 70%;
    margin-top: 20%;
  }
}
.btns {
  display: flex;
  justify-content: center;
}
.login_form {
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 0 20px;
  box-sizing: border-box;
}
.footer {
  width: 100%;
  height: 30px;
  text-align: center;
  position: absolute;
  bottom: 0;
  line-height: 30px;
  font-size: 0.895rem;
  color: #fff;
  a {
    color: #255778;
  }
}
</style>
