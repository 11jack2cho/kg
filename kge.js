/**
 * 
 */

const url = $request.url;
let body = $response.body;

// === 常量定义 ===
const VIP_DATE = "2099-09-09 09:09:09";
const BEGIN_DATE = "2024-01-01 00:00:00";
const EXPIRY_TIMESTAMP = 4092599349000;
const VIP_TYPE = 29; // SVIP用户类型
const VIP_LEVEL = 9; // SVIP等级
const ENERGY_TOTAL = 999999;

// 接口加密数据（固定值）
const FX_SING_DATA = "Uxw0FTAhi9RwGpk0CaH3g8Dtsl3GjfyX5J6WYSSu5h0YAazP7i8wKfozLshiE5sDz023bGftjrSv2kdUhkNKwSV9t2J3VRLnFAh1UzS+MzA=";

// URL匹配模式
const URL_PATTERNS = {
    USER_LOGIN: /sing7\/json\/v2\/user\/login/,
    ROOM_CONFIG: /ktv_room\/room\/room_config/,
    MEMBER_INFO: /fxsing\/vip\/member\/info/,
    VIP_TIP: /sing7\/homepage\/json\/v3\/vip\/tip/,
    PRICE_TIPS: /v4\/price\/get_tips/,
    VIP_CENTER: /vipenergy\/v2\/entrance\/vip_center_user_info/,
    USER_INFO: /fxsing\/vip\/user\/info/,
    KROOM_TAB_ENTER: /sing7\/homepage\/json\/v3\/cdn\/kroom_tab_enter/,
    MEMBER_GAME: /v1\/home\/member_game/,
    KROOM_BANNERS: /sing7\/homepage\/json\/v3\/cdn\/kroom_tab\/banners/
};

/**
 * 日志输出函数
 */
function log(message) {
    console.log(`[K歌脚本] ${message}`);
}

/**
 * 递归遍历对象并修改VIP相关字段
 */
function traverseVipFields(obj) {
    if (typeof obj !== "object" || obj === null) return;
    
    for (const key in obj) {
        if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;
        
        const value = obj[key];
        
        if (key === 'vipType' || key === 'isVip' || key === 'is_vip') {
            obj[key] = 1;
        } else if (key === 'svipLevel') {
            obj[key] = VIP_LEVEL;
        } else if (key === 'auth') {
            obj[key] = 1;
        }
        
        if (typeof value === "object" && value !== null) {
            traverseVipFields(value);
        }
    }
}

/**
 * 处理用户登录信息
 */
function processUserLogin(data) {
    if (data.data?.playerBase) {
        const playerBase = data.data.playerBase;
        playerBase.yearType = 1;
        playerBase.userYType = 1;
        playerBase.userType = VIP_TYPE;
        playerBase.svipScore = 999999;
        playerBase.vipType = 6;
        playerBase.svipLevel = VIP_LEVEL;
        playerBase.musicpackType = 1;
        playerBase.isStar = 1;
        playerBase.isFx = 1;
        log("用户登录信息处理完成");
    }
    return data;
}

/**
 * 处理KTV房间配置
 */
function processRoomConfig(data) {
    traverseVipFields(data);
    log("KTV房间配置处理完成");
    return data;
}

/**
 * 处理会员信息（加密数据）
 */
function processMemberInfo(data) {
    data.code = 0;
    data.data = FX_SING_DATA;
    data.timestamp = Date.now();
    data.msg = "";
    log("会员信息处理完成");
    return data;
}

/**
 * 处理VIP提示信息
 */
function processVipTip(data) {
    if (data.data) {
        data.data.status = 1;
        data.data.vipLevel = VIP_LEVEL;
        data.data.svip = 1;
        data.data.vipExpTime = EXPIRY_TIMESTAMP;
        
        if (data.data.vipTips && Array.isArray(data.data.vipTips)) {
            data.data.vipTips.forEach(tip => {
                tip.btnText = "SVIP已激活";
                tip.singVipTips = "尊贵SVIP 畅享所有特权";
            });
        }
        log("VIP提示信息处理完成");
    }
    return data;
}

/**
 * 处理价格提示信息
 */
function processPriceTips(data) {
    if (!data.data) {
        data.data = {};
    }
    
    if (!data.data.vip_info) {
        data.data.vip_info = {
            vip_begin_time: BEGIN_DATE,
            vip_end_time: VIP_DATE,
            su_vip_begin_time: BEGIN_DATE,
            su_vip_end_time: VIP_DATE
        };
    } else {
        data.data.vip_info.vip_begin_time = BEGIN_DATE;
        data.data.vip_info.vip_end_time = VIP_DATE;
        data.data.vip_info.su_vip_begin_time = BEGIN_DATE;
        data.data.vip_info.su_vip_end_time = VIP_DATE;
    }
    log("价格提示信息处理完成");
    return data;
}

/**
 * 处理VIP中心用户信息
 */
function processVipCenter(data) {
    if (data.data) {
        data.data.energy_total = ENERGY_TOTAL;
        data.data.user_type = VIP_TYPE;
        log("VIP中心用户信息处理完成");
    }
    return data;
}

/**
 * 处理繁星/唱唱用户信息
 */
function processUserInfo(data) {
    if (data.data) {
        data.data.status = 1;
        data.data.vipLevel = VIP_LEVEL;
        data.data.svip = 1;
        data.data.expireTime = EXPIRY_TIMESTAMP;
        log("用户信息处理完成");
    }
    return data;
}

/**
 * 移除唱VIP入口
 */
function processKroomTabEnter(data) {
    if (data.data?.entranceList && Array.isArray(data.data.entranceList)) {
        const originalLength = data.data.entranceList.length;
        data.data.entranceList = data.data.entranceList.filter(item => item.id !== 14);
        
        if (data.data.entranceList.length < originalLength) {
            log(`已移除唱VIP入口，剩余入口数: ${data.data.entranceList.length}`);
        }
    }
    return data;
}

/**
 * 屏蔽广告（游戏中心和唱将招募）
 */
function processAdvertisement(data) {
    data.data = [];
    log("广告屏蔽处理完成");
    return data;
}

/**
 * 主处理函数
 */
function main() {
    if (!body) {
        log("响应体为空");
        return null;
    }
    
    try {
        let data = JSON.parse(body);
        
        // 根据URL匹配对应的处理函数
        if (URL_PATTERNS.USER_LOGIN.test(url)) {
            data = processUserLogin(data);
        } else if (URL_PATTERNS.ROOM_CONFIG.test(url)) {
            data = processRoomConfig(data);
        } else if (URL_PATTERNS.MEMBER_INFO.test(url)) {
            data = processMemberInfo(data);
        } else if (URL_PATTERNS.VIP_TIP.test(url)) {
            data = processVipTip(data);
        } else if (URL_PATTERNS.PRICE_TIPS.test(url)) {
            data = processPriceTips(data);
        } else if (URL_PATTERNS.VIP_CENTER.test(url)) {
            data = processVipCenter(data);
        } else if (URL_PATTERNS.USER_INFO.test(url)) {
            data = processUserInfo(data);
        } else if (URL_PATTERNS.KROOM_TAB_ENTER.test(url)) {
            data = processKroomTabEnter(data);
        } else if (URL_PATTERNS.MEMBER_GAME.test(url) || URL_PATTERNS.KROOM_BANNERS.test(url)) {
            data = processAdvertisement(data);
        } else {
            log(`未匹配到处理规则的URL: ${url}`);
            return null;
        }
        
        return { body: JSON.stringify(data) };
        
    } catch (error) {
        log(`处理过程中发生错误: ${error.message}`);
        log(`URL: ${url}`);
        log(`原始响应体: ${body}`);
        return null;
    }
}

// 执行主函数
const result = main();
if (result) {
    $done(result);
} else {
    $done({});
}
