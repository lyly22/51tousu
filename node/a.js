const Koa = require("koa");
const Router = require("koa-router");
const mysql = require("mysql");
const co = require("co-mysql");
const fs = require("fs");
const path = require("path");
const koaBody = require("koa-body");
const cors = require("koa2-cors");

let server = new Koa();

// 处理跨域，放到中间件的最前面
server.use(cors());
const router = new Router();
server.use(koaBody({ multipart: true }));
server.use(require("koa-static")(__dirname + "/public"));

let conn = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "password",
  database: "blog",
});
server.context.db = co(conn);
const multer = require("koa-multer");
//文件上传
//配置
var storage = multer.diskStorage({
  //文件保存路径
  destination: function (req, file, cb) {
    cb(null, "public/upload");
  },
  //修改文件名称
  filename: function (req, file, cb) {
    var fileFormat = file.name.split("."); //以点分割成数组，数组的最后一项就是后缀名
    cb(null, file.name + "." + fileFormat[fileFormat.length - 1]);
  },
});
//加载配置
var upload = multer({ storage: storage });
router.post("/upload", upload.single("file"), async (ctx, next) => {
  const file = ctx.request.body.file;
  ctx.body = {
    code: 0,
    msg: "",
    fileUrl: "http://localhost:5000/upload/" + file.name, //返回文件名
  };
});

router.post("/addBlog", async (ctx, next) => {
  let { title, content, userId, fileUrl } = ctx.request.body;
  // fileUrl = fileUrl ? fileUrl.join(",") : "";
  try {
    ctx.db.query(
      "insert into blog (title, content, fileUrl, user_id) values (?, ?, ?,?)",
      [title, content, fileUrl, userId]
    );
    ctx.body = {
      code: 0,
      msg: "创建成功",
    };
  } catch (e) {
    ctx.body = {
      code: -1,
      msg: e + "",
    };
  }
});

router.get("/", async (ctx, next) => {
  ctx.response.body = "index";
});

function checkRegister(ctx) {
  let { name } = ctx.request.body;
  return new Promise((resolve, reject) => {
    let list = ctx.db.query("select * from user where name = ?", [name]);
    resolve(list);
  });
}
router.post("/register", async (ctx, next) => {
  let list = await checkRegister(ctx);
  if (list.length) {
    ctx.body = {
      code: -1,
      msg: "用户已存在",
    };
    return;
  }
  let { name, pwd } = ctx.request.body;
  try {
    ctx.db.query("insert into user (name, pwd) values (?, ?)", [name, pwd]);
    ctx.body = {
      code: 0,
      msg: "注册成功",
    };
  } catch (e) {
    ctx.body = {
      code: -1,
      msg: e + "",
    };
  }
});

router.post("/login", async (ctx, next) => {
  let { name, pwd } = ctx.request.body;
  try {
    let data = null;
    let list = await ctx.db.query("select * from user where ? = name", [name]);
    if (!list.length) {
      data = {
        code: -1,
        msg: "查无此人",
      };
    } else {
      let list = await ctx.db.query(
        "select * from user where ? = name and pwd = ?",
        [name, pwd]
      );
      if (list.length) {
        data = {
          code: 0,
          msg: "登录成功",
          userId: list[0].id,
          userName: list[0].name,
        };
      } else {
        data = {
          code: -1,
          msg: "密码错误",
        };
      }
    }
    ctx.body = data;
  } catch (e) {
    ctx.body = {
      code: -1,
      msg: e + "",
    };
  }
});


router.post("/delBlog", async (ctx, next) => {
  let { id } = ctx.request.body;
  try {
    ctx.db.query("delete from blog where id = ?", [id]);
    ctx.body = {
      code: 0,
      msg: "删除成功",
    };
  } catch (e) {
    ctx.body = {
      code: -1,
      msg: e + "",
    };
  }
});

function getBlogs(ctx) {
  return new Promise((resolve, reject) => {
    let { pageNo } = ctx.query;
    let start = (pageNo - 1) * 10;
    let list = ctx.db.query(
      "select blog.*,user.name as userName from blog,user where blog.user_id=user.id order by is_top desc,cast(create_time as datetime) desc limit ?, 10",
      [start]
    );
    resolve(list);
  });
}
function getBlogsCount(ctx) {
  return new Promise((resolve, reject) => {
    let total = ctx.db.query("SELECT COUNT(*) as count FROM blog");
    resolve(total);
  });
}
router.get("/blogs", async (ctx, next) => {
  let list = await getBlogs(ctx);
  let total = await getBlogsCount(ctx);
  ctx.body = {
    code: 0,
    result: {
      list: list,
      total: total[0].count,
    },
  };
});

function getBlog(ctx) {
  return new Promise((resolve, reject) => {
    let { id } = ctx.query;
    let list = ctx.db.query(
      "select blog.*, user.name as userName from blog inner join user on blog.user_id=user.id where blog.id = ?",
      [id]
    );
    resolve(list);
  });
}
router.get("/blog", async (ctx, next) => {
  list = await getBlog(ctx);
  ctx.body = {
    code: 0,
    data: list[0],
  };
});

router.get("/toTop", async (ctx, next) => {
  let { id } = ctx.query;
  ctx.db.query("update blog set is_top='1' where id=?", [id]);
  ctx.body = {
    code: 0,
    msg: "置顶成功",
  };
});

server.use(router.routes());
server.listen(5000, () => {
  console.log("is listening");
});
