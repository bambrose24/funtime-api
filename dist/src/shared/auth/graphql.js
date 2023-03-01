"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.customAuthChecker = exports.Role = void 0;
const user_1 = require("./user");
var Role;
(function (Role) {
    Role["User"] = "user";
    Role["LeagueAdmin"] = "league_admin";
    Role["SysAdmin"] = "sys_admin";
})(Role = exports.Role || (exports.Role = {}));
const customAuthChecker = async ({ args, context, info, root }, roles) => {
    const user = (0, user_1.getUser)();
    console.log("all the args", user, Object.keys(info));
    return true;
};
exports.customAuthChecker = customAuthChecker;
