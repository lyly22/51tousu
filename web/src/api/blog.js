import { Service } from "../js/request.js";
export function getBlogs(params) {
  return Service({
    url: "/blogs",
    method: "get",
    params
  });
}
export function getBlog(params) {
  return Service({
    url: "/blog",
    method: "get",
    params
  });
}
export function delBlog(params) {
  return Service({
    url: "/delBlog",
    data: params
  });
}
export function addBlog(params) {
  return Service({
    url: "/addBlog",
    data: params
  });
}
export function toTop(params) {
  return Service({
    url: "/toTop",
    method: "get",
    params
  });
}
export function upload(params) {
  return Service({
    url: "/upload",
    data: params
  });
}
