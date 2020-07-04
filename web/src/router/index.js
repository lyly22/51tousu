import Vue from "vue";
import Router from "vue-router";
import register from "@/components/register";
import login from "@/components/login";
import blogs from "@/components/blogs";

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: "/",
      name: "/",
      redirect: "/blogs"
    },
    {
      path: "/register",
      name: "register",
      component: register
    },
    {
      path: "/login",
      name: "login",
      component: login
    },
    {
      path: "/blogs",
      name: "blogs",
      component: blogs
    }
  ]
});
