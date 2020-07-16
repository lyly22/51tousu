<template>
  <div class="register">
    <img src="../assets/logo.png" width="300" />
    <el-row>
      <el-col :span="12" :offset="6">
        <el-form ref="ruleForm" label-width="80px" :model="ruleForm" :rules="rules">
          <el-form-item label="用户名" prop="name">
            <el-input v-model="ruleForm.name"></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="pwd">
            <el-input type="password" v-model="ruleForm.pwd"></el-input>
          </el-form-item>
          <el-form-item label="确认密码" prop="checkPass">
            <el-input type="password" v-model="ruleForm.checkPass" autocomplete="off"></el-input>
          </el-form-item>
          <el-button type="primary" round @click="submit">注册</el-button><br>
          <router-link to="/login">
            <el-button type="text">登录</el-button>
          </router-link>
        </el-form>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import axios from "axios";
import qs from "qs";
import { register } from "@/api/user.js";
export default {
  name: "register",
  data() {
    var validatePass = (rule, value, callback) => {
      if (!value) {
        callback(new Error("请再次输入密码"));
      } else if (value !== this.ruleForm.pwd) {
        callback(new Error("两次输入密码不一致!"));
      } else {
        callback();
      }
    };
    return {
      ruleForm: {},
      rules: {
        name: [{ required: true, message: "请输入用户名", trigger: "blur" }],
        pwd: [{ required: true, message: "请输入密码", trigger: "blur" }],
        checkPass: [
          { validator: validatePass, required: true, trigger: "blur" }
        ]
      }
    };
  },
  methods: {
    submit() {
      let that = this;
      this.$refs["ruleForm"].validate(valid => {
        if (valid) {
          register(this.ruleForm)
            .then(function(res) {
              if (res.code === 0) {
                that.$router.push({ path: "/login" });
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
.register {
  img {
    margin-bottom: 10px;
  }
  text-align: center;
}
</style>
