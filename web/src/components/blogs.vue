<template>
  <div class="blogs">
    <el-row class="mt-10">
      <el-col :span="22">
        <img src="../assets/logo.png" width="150" />
      </el-col>
      <el-col :span="2" class="mt20">
        <el-button round size="medium" @click="toLogin" v-if="!userName">登录</el-button>
        <el-dropdown @command="logOut" placement="bottom" v-else>
          <div class="avatar">
            <el-avatar src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"></el-avatar>
            <span>{{userName}}</span>
          </div>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="logOut">退出</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </el-col>
    </el-row>
    <el-row class="top-50">
      <el-col :span="22" :offset="1">
        <el-button type="primary" round size="medium" @click="add" class="createBtn">我要投诉</el-button>
        <el-table :data="list" style="width: 100%">
          <el-table-column prop="title" label="标题" width="280"></el-table-column>
          <el-table-column prop="content" label="内容" width="520"></el-table-column>
          <el-table-column prop="create_time" label="时间" width="160"></el-table-column>
          <el-table-column prop="userName" label="用户"></el-table-column>
          <el-table-column label="操作" width="180">
            <template slot-scope="scope">
              <el-button @click="detail(scope.row)" type="text" size="small">查看</el-button>
              <el-popconfirm
                title="确定删除吗？"
                @onConfirm="del(scope.row)"
                v-show="scope.row.user_id==userId"
              >
                <el-button slot="reference" type="text">删除</el-button>
              </el-popconfirm>
              <el-button class="flag" type="text" v-show="scope.row.is_top=='1'">
                已置顶
                <i class="el-icon-s-flag"></i>
              </el-button>
              <el-popconfirm
                title="确定置顶吗？"
                @onConfirm="toTop(scope.row)"
                v-show="scope.row.user_id==userId && scope.row.is_top=='0'"
              >
                <el-button slot="reference" type="text">
                  置顶
                  <i class="el-icon-top"></i>
                </el-button>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          background
          layout="prev, pager, next"
          :total="total"
          @current-change="currentChange"
        ></el-pagination>
      </el-col>
    </el-row>
    <addBlog v-show="isShowAdd" @close="close" @getList="getList"></addBlog>
    <blog v-if="isShowBlog" @close="closeBlog" :id="id"></blog>
  </div>
</template>

<script>
import addBlog from "./addBlog";
import blog from "./blog";
import { getBlogs, delBlog, toTop } from "@/api/blog.js";
import { dateFormat } from "../js/util";
export default {
  name: "blogs",
  components: {
    addBlog,
    blog
  },
  data() {
    return {
      list: [],
      isShowAdd: false,
      isShowBlog: false,
      id: null,
      currentPage: 1,
      total: 0
    };
  },
  computed: {
    userName() {
      return localStorage.getItem("userName");
    },
    userId() {
      return localStorage.getItem("userId");
    }
  },
  mounted() {
    this.getList();
  },
  methods: {
    currentChange(page) {
      this.currentPage = page;
      this.getList();
    },
    detail(v) {
      this.id = v.id;
      this.isShowBlog = true;
    },
    del(v) {
      let that = this;
      delBlog({
        id: v.id
      })
        .then(function(res) {
          if (res.code === 0) {
            that.getList();
          }
        })
        .catch(function(err) {
          console.log(err);
        });
    },
    toTop(v) {
      let that = this;
      toTop({
        id: v.id
      })
        .then(function(res) {
          if (res.code === 0) {
            that.getList();
          }
        })
        .catch(function(err) {
          console.log(err);
        });
    },
    getList() {
      let that = this;
      getBlogs({
        pageNo: this.currentPage
      })
        .then(function(res) {
          if (res.code === 0) {
            that.list = res.result.list;
            that.total = res.result.total;
            that.list.forEach(v => {
              v.create_time = dateFormat(
                "YYYY-mm-dd HH:MM",
                new Date(v.create_time + "")
              );
              v.content =
                v.content.length > 36
                  ? v.content.substr(0, 36) + "……"
                  : v.content;
            });
          }
        })
        .catch(function(err) {
          console.log(err);
        });
    },
    add() {
      if (!this.userName) {
        this.$message({
          message: "请先登录",
          type: "error"
        });
      } else {
        this.isShowAdd = true;
      }
    },
    close() {
      this.isShowAdd = false;
    },
    closeBlog() {
      this.isShowBlog = false;
    },
    toLogin() {
      this.$router.push({ path: "/login" });
    },
    logOut(v) {
      if (v === "logOut") {
        localStorage.setItem("userName", "");
        localStorage.setItem("userId", "");
        this.$router.push({ path: "/login" });
      }
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang='less'>
.blogs {
  position: relative;
  .right {
    position: fixed;
    right: 20px;
    z-index: 9;
  }
  img {
    border-radius: 50%;
  }
  .createBtn {
    margin-bottom: 30px;
    float: right;
  }
  .el-pagination {
    float: right;
    margin-top: 20px;
  }
  .avatar {
    display: flex;
    align-items: center;
    cursor: pointer;
    span {
      margin-left: 10px;
    }
  }
  .flag {
    color: red;
    font-weight: bold;
  }
}
</style>
