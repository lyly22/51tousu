<template>
  <div class="login">
    <img src="../assets/logo.png" width="200" />
    <el-row>
      <el-col :span="12" :offset="6">
        <el-form ref="ruleForm" label-width="80px" :model="ruleForm" :rules="rules">
          <el-form-item label="用户名" prop="name">
            <el-input v-model="ruleForm.name"></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="pwd">
            <el-input v-model="ruleForm.pwd"></el-input>
          </el-form-item>
          <el-button type="primary" round @click="submit">登录</el-button>
          <router-link to="/register"><el-button type="text">注册</el-button></router-link>
        </el-form>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import axios from "axios";
import qs from "qs";
export default {
  name: "login",
  data() {
    return {
      ruleForm: {
        name: "",
        pwd: ""
      },
      rules: {
        name: [{ required: true, message: "请输入用户名", trigger: "blur" }],
        pwd: [{ required: true, message: "请输入密码", trigger: "blur" }]
      }
    };
  },
  methods: {
    submit() {
      let that = this;
      this.$refs["ruleForm"].validate(valid => {
        if (valid) {
          axios
            .post("http://127.0.0.1:5000/login", qs.stringify(this.ruleForm))
            .then(function(res) {
              if (res.data.code === 0) {
                that.$message({
                  message: res.data.msg,
                  type: "success"
                });
                localStorage.setItem("userId", res.data.userId);
                localStorage.setItem("userName", res.data.userName);
                that.$router.push({ path: "/blogs" });
              } else {
                that.$message({
                  message: res.data.msg,
                  type: "error"
                });
              }
            })
            .catch(function(err) {
              console.log(err);
            });
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang='less'>
.login {
  img {
    margin-bottom: 50px;
  }
  text-align: center;
}
</style>
