<template>
  <div class="addBlog">
    <i class="el-icon-close" @click="cancelVisible = true"></i>
    <el-row>
      <el-col :span="12" :offset="6">
        <el-form label-width="80px" :model="formLabelAlign" ref="form" :rules="rules">
          <el-form-item label="标题" prop="title">
            <el-input v-model="formLabelAlign.title" maxlength="50"></el-input>
          </el-form-item>
          <el-form-item label="内容" prop="content">
            <el-input type="textarea" :rows="10" v-model="formLabelAlign.content" maxlength="500"></el-input>
          </el-form-item>
          <el-form-item label="上传文件">
            <el-upload
              action="http://127.0.0.1:5000/upload"
              list-type="picture-card"
              :file-list="fileList"
              :on-preview="handlePictureCardPreview"
              :on-remove="handleRemove"
              :auto-upload="false"
              :on-change="fileChange"
              :accept="'image/*'"
              :multiple="true"
            >
              <i class="el-icon-plus"></i>
            </el-upload>
          </el-form-item>
          <div class="btn">
            <el-button type="primary" round @click="submit">提交</el-button>
            <el-button round @click="cancelVisible = true">取消</el-button>
          </div>
        </el-form>
        <el-dialog :visible.sync="dialogVisible" :modal-append-to-body="false">
          <img width="100%" :src="dialogImageUrl" alt />
        </el-dialog>
        <el-dialog
          title="提示"
          :modal-append-to-body="false"
          :visible.sync="cancelVisible"
          width="30%"
          :close="close"
        >
          <span>确认关闭？</span>
          <span slot="footer" class="dialog-footer">
            <el-button @click="cancelVisible = false">取 消</el-button>
            <el-button type="primary" @click="close">确 定</el-button>
          </span>
        </el-dialog>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { upload, addBlog } from "@/api/blog.js";

export default {
  name: "addBlog",
  data() {
    return {
      formLabelAlign: {},
      dialogImageUrl: "",
      dialogVisible: false,
      cancelVisible: false,
      fileList: [],
      rules: {
        title: [{ required: true, message: "请输入标题", trigger: "blur" }],
        content: [{ required: true, message: "请输入内容", trigger: "blur" }]
      }
    };
  },
  methods: {
    handleRemove(file, fileList) {
      console.log(file, fileList);
    },
    handlePictureCardPreview(file) {
      this.dialogImageUrl = file.url;
      this.dialogVisible = true;
    },
    upload() {
      let that = this;
      let formData = new FormData();
      formData.append("file", this.fileList[0]);
      return upload(formData, {
        headers: { "Content-Type": "multipart/form-data" }
      })
        .then(res => {
          if (res.code === 0) {
            that.formLabelAlign.fileUrl = res.fileUrl;
          }
        })
        .catch(function(err) {
          console.log(err);
          return;
        });
    },
    async submit() {
      if (this.fileList.length > 0) {
        await this.upload();
      }
      let that = this;
      this.$refs["form"].validate(valid => {
        if (valid) {
          addBlog(
            Object.assign(this.formLabelAlign, {
              userId: localStorage.getItem("userId")
            })
          )
            .then(function(res) {
              if (res.code === 0) {
                that.close();
                that.$emit("getList");
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
    },
    close() {
      this.cancelVisible = false;
      this.$refs.form.resetFields();
      this.fileList = [];
      this.formLabelAlign = {};
      this.$emit("close");
    },
    fileChange(file, fileList) {
      this.fileList = fileList;
      const isLt2M = file.size / 1024 / 1024 < 5;
      if (!isLt2M) {
        this.$message.error("上传图片大小不能超过 5MB!");
        return false;
      }
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang='less'>
.addBlog {
  position: absolute;
  top: 0;
  width: 100%;
  height: 100%;
  background: #fff;
  padding-top: 50px;
  z-index: 99;
  .btn {
    text-align: center;
    margin-top: 50px;
  }
  .el-icon-close {
    position: fixed;
    top: 20px;
    right: 20px;
    cursor: pointer;
    z-index: 9;
  }
}
</style>
