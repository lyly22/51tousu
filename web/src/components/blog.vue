<template>
  <div class="blog">
    <i class="el-icon-close" @click="close"></i>
    <el-row>
      <el-col :span="20" :offset="2">
        <el-container>
          <el-header>
            <h2 class="mt40">{{info.title}}</h2>
            <p>
              <span class="userName">{{info.userName}}</span> 发布于
              <span class="time">{{info.create_time}}</span>
            </p>
            <p class="mt20 content">{{info.content}}</p>
            <p v-for="(v,i) in info.fileUrl" :key="i">
              <img :src="v" width="300" />
            </p>
          </el-header>
          <el-main></el-main>
        </el-container>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import axios from "axios";
import { dateFormat } from "../js/util";
export default {
  name: "blog",
  props: ["id"],
  data() {
    return {
      info: {}
    };
  },
  mounted() {
    this.getDetail();
  },
  methods: {
    getDetail() {
      let that = this;
      axios
        .get("http://127.0.0.1:5000/blog", {
          params: {
            id: this.id
          }
        })
        .then(function(res) {
          if (res.data.code === 0) {
            that.info = res.data.data;
            that.info.create_time = dateFormat(
              "YYYY-mm-dd HH:MM",
              new Date(that.info.create_time + "")
            );
            that.info.fileUrl = that.info.fileUrl.split(",");
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
    },
    close() {
      this.$emit("close");
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang='less'>
.blog {
  position: absolute;
  top: 0;
  width: 100%;
  height: 100%;
  background: #fff;
  z-index: 99;
  text-align: center;
  .userName {
    color: #141b23;
  }
  .time {
    color: #888;
  }
  .el-icon-close {
    position: fixed;
    top: 20px;
    right: 20px;
    cursor: pointer;
    z-index: 9;
  }
  .content {
    line-height: 36px;
  }
}
</style>
