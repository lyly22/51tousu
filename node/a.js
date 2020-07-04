const Koa = require("koa");
const Router = require("koa-router");
const mysql = require("mysql");
const co = require("co-mysql");
const fs = require("fs");
const path = require("path");
const koaBody = require("koa-body");

let server = new Koa();
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

server.use(async (ctx, next) => {
  ctx.set("Access-Control-Allow-Origin", "*");
  ctx.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Content-Length, Authorization, Accept, X-Requested-With, Current-Page"
  );
  ctx.set("Access-Control-Allow-Methods", "PUT, POST, GET, DELETE, OPTIONS");
  await next();
});

router.post("/upload", async (ctx, next) => {
  const file = ctx.request.body.file;
  let result = [];
  file.forEach((v) => {
    result.push("http://localhost:5000/upload/" + v.name);
  });
  console.log(file);
  // const reader = fs.createReadStream(file.url);
  // const reader = fs.createReadStream('avatar.jepg');
  // const upStream = fs.createWriteStream(
  //   path.join(__dirname, "public/upload" + `/${file.name}`),
  //   {
  //     flags: "w", // 默认读取
  //     encoding: "utf8", // 默认utf8
  //   }
  // );
  // reader.pipe(upStream);
  ctx.body = {
    code: 0,
    msg: "上传成功",
    fileUrl: result, //返回文件名
  };
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

router.post("/addBlog", async (ctx, next) => {
  let { title, content, userId, fileUrl } = ctx.request.body;
  fileUrl = fileUrl.join(",");
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

function getBlogs(ctx) {
  return new Promise((resolve, reject) => {
    let { pageNo } = ctx.query;
    let start = (pageNo - 1) * 10;
    let list = ctx.db.query(
      "select blog.*,user.name as userName from blog,user where blog.user_id=user.id order by cast(create_time as datetime) desc limit ?, 10",
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

server.use(router.routes());
server.listen(5000, () => {
  console.log("is listening");
});
