import { Service } from "../js/request.js";
import qs from "qs";
export function login(params) {
  return Service({
    url: "/login",
    data: params
  });
}
export function register(params) {
  return Service({
    url: "/register",
    data: params
  });
}
