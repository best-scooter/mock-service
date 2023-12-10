"use strict";
var _a, _b, _c, _d, _e, _f, _g, _h, _j;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    NodeEnv: ((_a = process.env.NODE_ENV) !== null && _a !== void 0 ? _a : ''),
    Port: ((_b = process.env.PORT) !== null && _b !== void 0 ? _b : "0"),
    JwtSecret: ((_c = process.env.JWT_SECRET) !== null && _c !== void 0 ? _c : ""),
    ApiHost: ((_d = process.env.API_HOST) !== null && _d !== void 0 ? _d : ""),
    AdminUsername: ((_e = process.env.ADMIN_USERNAME) !== null && _e !== void 0 ? _e : ""),
    AdminPassword: ((_f = process.env.ADMIN_PASSWORD) !== null && _f !== void 0 ? _f : ""),
    PriceInitial: ((_g = process.env.PRICE_INITIAL) !== null && _g !== void 0 ? _g : 10),
    PriceTime: ((_h = process.env.PRICE_TIME) !== null && _h !== void 0 ? _h : 10),
    PriceDistance: ((_j = process.env.PRICE_DISTANCE) !== null && _j !== void 0 ? _j : 10)
};
