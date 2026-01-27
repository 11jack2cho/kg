/*

最后更新：2024-01-10
优化版本
*/

const url = $request.url;
let body = $response.body;

// 常量定义
const VIP_DATE = "2099-09-09 09:09:09";
const BEGIN_DATE = "2024-01-01 00:00:00";
const VIP_TOKEN = "1234567890abcdef";

// VIP字段配置
const VIP_FIELDS = {
    is_vip: 1,
    vip_type: 6,
    y_type: 1,
    user_type: 29,
    m_type: 1,
    vip_token: VIP_TOKEN,
    auth_token: VIP_TOKEN,
    vip_end_time: VIP_DATE,
    vip_begin_time: BEGIN_DATE,
    m_end_time: VIP_DATE,
    m_begin_time: BEGIN_DATE,
    su_vip_end_time: VIP_DATE,
    su_vip_begin_time: BEGIN_DATE,
    su_vip_y_endtime: VIP_DATE,
    roam_end_time: VIP_DATE,
    listen_end_time: VIP_DATE,
    bookvip_end_time: VIP_DATE,
    su_vip_clearday: VIP_DATE,
    roam_type: 1,
    is_first: 0,
    svip_level: 9,
    svip_score: 9999,
    bookvip_valid: 1,
    m_reset_time: VIP_DATE,
    vip_clearday: BEGIN_DATE,
    m_clearday: BEGIN_DATE,
    upgrade_time: BEGIN_DATE,
    annual_fee_begin_time: BEGIN_DATE,
    annual_fee_end_time: VIP_DATE,
    svip_begin_time: BEGIN_DATE,
    svip_end_time: VIP_DATE,
    dual_su_vip_begin_time: BEGIN_DATE,
    dual_su_vip_end_time: VIP_DATE,
    roam_begin_time: BEGIN_DATE,
    h_begin_time: BEGIN_DATE,
    h_end_time: VIP_DATE,
    listen_begin_time: BEGIN_DATE,
    m_is_old: 0,
    h_type: 0,
    listen_type: 0,
    user_y_type: 0,
    autotype: 0,
    autoChargeType: 0,
    producttype: 0,
    autostatus: 0,
    autoVipType: 0,
    lottery_status: 0,
    first_svip: 0,
    signed_svip_before: 0,
    promotion_tag: 0,
    ios_products_sub_tag: 0,
    promotion_offer_tag: 0,
    su_vip_upgrade_days: 999,
    super_vip_upgrade_month: 999
};

// URL匹配模式
const URL_PATTERNS = {
    SSR_HOME: /ssr\/decocenter\/home/,
    TASK_CENTER: /task_center_entrance/,
    THEME_PRIVILEGE: /theme\/get_res_privilege/,
    RECORD_RACK: /record_rack/,
    THEME_CATEGORY: /theme\/category/,
    THEME_INFO: /theme\/info/,
    VIP_LEVEL_DETAIL: /promotionvip\/v3\/vip_level\/detail/,
    RES_PRIVILEGE: /v1\/get_res_privilege\/lite/,
    PRICE_TIPS: /v4\/price\/get_tips/,
    FUSION_USERINFO: /v1\/fusion\/userinfo/,
    WELFARE_LIST: /v2\/super\/welfarelist/,
    AUDIO_INFO: /union\/audio_info/,
    LOGIN: /(login_by_token|get_login_extend_info|get_dev_user|login_by_quick_token)/,
    MOBILE_VIPINFO: /mobile\/vipinfoV2/,
    GET_VIP_CONFIG: /get_vip_config/,
    SEARCH_NO_FOCUS: /searchnofocus\/v1\/search_no_focus_word/,
    STARLIGHT: /starlight\/get_campaign_infos/,
    USER_CONFIG: /flow\/user_config\/get_level_config_ios/,
    COMBO_PLAY: /playerpxy\/v1\/combo\/play_page_index/,
    AD_COMBINE: /adp\/ad\/v1\/playpage_combine/,
    VIP_CENTER: /v3\/vip_center/,
    SEARCH_BANNER: /ads\.gateway\/v4\/search_banner/,
    MINE_TOP_BANNER: /mine_top_banner/,
    CARD_LISTEN: /card\/v1\/pxy\/listen/
};

/**
 * 递归遍历对象并修改VIP相关字段
 */
function traverse(obj) {
    if (typeof obj !== "object" || obj === null) return;
    
    for (const key in obj) {
        if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;
        
        const value = obj[key];
        const lowerKey = key.toLowerCase();
        
        // VIP状态相关字段
        if (["is_vip", "vip_type", "m_type", "y_type", "user_type", "is_special_vip", "vip_switch", "bookvip_valid"].includes(lowerKey)) {
            if (lowerKey === "vip_type") obj[key] = 6;
            else if (lowerKey === "user_type") obj[key] = 29;
            else obj[key] = 1;
        }
        // Token相关字段
        else if (["vip_token", "auth_token"].includes(lowerKey)) {
            obj[key] = VIP_TOKEN;
        }
        // 时间相关字段
        else if (lowerKey.endsWith("_end_time") || lowerKey.endsWith("_endtime") || ["su_vip_clearday", "m_reset_time"].includes(lowerKey)) {
            obj[key] = VIP_DATE;
        }
        else if (lowerKey.endsWith("_begin_time") || ["reg_time", "vip_clearday", "m_clearday", "upgrade_time", 
                 "annual_fee_begin_time", "svip_begin_time", "dual_su_vip_begin_time", 
                 "roam_begin_time", "h_begin_time", "listen_begin_time"].includes(lowerKey)) {
            obj[key] = BEGIN_DATE;
        }
        // 布尔值字段
        else if (["valid", "is_original"].includes(lowerKey)) {
            obj[key] = true;
        }
        // 权限相关字段
        else if (lowerKey === "privilege") {
            obj[key] = 1;
        }
        else if (lowerKey === "pay_type") {
            obj[key] = 0;
        }
        else if (lowerKey === "roam_list") {
            obj[key] = { gd: 1 };
        }
        else if (lowerKey === "svip_level") {
            obj[key] = 9;
        }
        else if (lowerKey === "svip_score") {
            obj[key] = 9999;
        }
        // 数值型字段设为0
        else if (["m_is_old", "h_type", "listen_type", "user_y_type", "autotype", "autochargetype", 
                 "producttype", "autostatus", "autoviptype", "lottery_status", "first_svip", 
                 "signed_svip_before", "promotion_tag", "ios_products_sub_tag", "promotion_offer_tag"].includes(lowerKey)) {
            obj[key] = 0;
        }
        // 升级天数设为999
        else if (["su_vip_upgrade_days", "super_vip_upgrade_month"].includes(lowerKey)) {
            obj[key] = 999;
        }
        // 广告相关字段处理
        else if ((lowerKey === "ads" && !URL_PATTERNS.SEARCH_NO_FOCUS.test(url) && !URL_PATTERNS.TASK_CENTER.test(url)) || 
                 ["ad_info", "mobile_link", "blindbox_list", "task"].includes(lowerKey) ||
                 (lowerKey === "info" && Array.isArray(value) && URL_PATTERNS.TASK_CENTER.test(url))) {
            obj[key] = [];
        }
        else if (lowerKey.includes("ad_value") || lowerKey.includes("audioad") || lowerKey.includes("video_max_times") || 
                 lowerKey.includes("expire_prompt") || lowerKey.includes("already_expire")) {
            obj[key] = 0;
        }
        else if (lowerKey === "global" && url.includes("profile")) {
            if (value) {
                value.open = 0;
                value.shortplay_entrance_open = 0;
            }
        }
        else if (["pendant_id", "flicker_pendant_id"].includes(lowerKey)) {
            obj[key] = 0;
        }
        else if (["boot_ads", "front_ads", "least_ads"].includes(lowerKey)) {
            obj[key] = [];
        }
        else if (lowerKey === "popup") {
            obj[key] = null;
        }
        else if (lowerKey === "fail_process") {
            obj[key] = 0;
        }
        
        // 递归处理
        if (typeof value === "object" && value !== null) {
            traverse(value);
        }
    }
}

/**
 * 处理主题数据
 */
function processThemes(themes) {
    if (!Array.isArray(themes)) return;
    
    for (const theme of themes) {
        theme.vip_level = 0;
        theme.privilege = 5;
        theme.privileges = [5];
        
        if (theme.limit_free_info) {
            theme.limit_free_info.limit_free_status = 1;
            theme.limit_free_info.free_end_time = 4092599349;
            theme.limit_free_info.toast_content = "已解锁 SVIP 9 尊享皮肤";
        }
        
        if (theme.price) {
            theme.price = 0;
        }
        
        if (theme.themes && Array.isArray(theme.themes)) {
            processThemes(theme.themes);
        }
    }
}

/**
 * 处理SSR页面
 */
function processSSRPage() {
    const regex = /<script id="__NEXT_DATA__" type="application\/json">(.+?)<\/script>/;
    const match = body.match(regex);
    
    if (!match?.[1]) return null;
    
    try {
        const data = JSON.parse(match[1]);
        
        if (data.props?.pageProps?.state?.vipInfo) {
            const vipInfo = data.props.pageProps.state.vipInfo;
            vipInfo.isVip = 1;
            vipInfo.isSvip = 1;
            vipInfo.level = 9;
            vipInfo.user_type = 29;
        }
        
        if (data.props?.pageProps?.funsionData?.vipInfo) {
            Object.assign(data.props.pageProps.funsionData.vipInfo, VIP_FIELDS);
            data.props.pageProps.funsionData.vipInfo.is_vip = 1;
            data.props.pageProps.funsionData.vipInfo.vip_type = 6;
            data.props.pageProps.funsionData.vipInfo.user_type = 29;
            data.props.pageProps.funsionData.vipInfo.svip_level = 9;
        }
        
        const newData = JSON.stringify(data);
        const newBody = body.replace(regex, `<script id="__NEXT_DATA__" type="application/json">${newData}</script>`);
        return { body: newBody };
    } catch (error) {
        console.log(`[Kugou_SSR_Error] ${error.message}`);
        return null;
    }
}

/**
 * 处理任务中心入口
 */
function processTaskCenter(data) {
    const customTitle = "联合国儿童基金会";
    const customLink = "https://t.me/Jsforbaby";
    
    if (data?.data?.ads) {
        for (const ad of data.data.ads) {
            if (ad.title) ad.title = customTitle;
            if (ad.main_heading) ad.main_heading = customTitle;
            if (ad.entrance_name) ad.entrance_name = customTitle;
            if (ad.desc) ad.desc = "立即查看";
            if (ad.jumpLink) ad.jumpLink = customLink;
        }
    }
    
    return data;
}

/**
 * 处理唱片功能
 */
function processRecordRack(data) {
    data.errcode = 0;
    data.status = 1;
    data.errmsg = "";
    
    const clearPopup = (target) => {
        if (target) {
            target.popup_type = 0;
            target.popup_button = "";
            target.popup_content = "";
            target.jump_url = "";
        }
    };
    
    if (URL_PATTERNS.RECORD_RACK.test(url)) {
        if (url.includes('get_user_record_rack') && data.data) {
            data.data.record_rack_status = 1;
            data.data.can_use = 1;
            data.data.is_set = 1;
            
            if (Array.isArray(data.data.list)) {
                for (const item of data.data.list) {
                    item.can_use = 1;
                    item.end_time = VIP_DATE;
                }
            }
        }
        
        if (data.data) {
            data.data.can_use = 1;
            data.data.is_set = 1;
            data.data.record_rack_status = 1;
            data.data.need_popup = 0;
            
            if (data.data.end_time) {
                data.data.end_time = VIP_DATE;
            }
            
            clearPopup(data.data);
            clearPopup(data.data.popup_Info);
            clearPopup(data.data.popup_info);
        }
    }
    
    return data;
}

/**
 * 处理资源权限
 */
function processResPrivilege(data) {
    data.status = 1;
    data.error_code = 0;
    data.message = "";
    data.appid_group = 1;
    data.should_cache = 1;
    data.vip_user_type = 3;
    
    if (!data.userinfo) {
        data.userinfo = {
            vip_type: 6,
            m_type: 1,
            vip_user_type: 3,
            quota_remain: 999
        };
    } else {
        data.userinfo.vip_type = 6;
        data.userinfo.m_type = 1;
        data.userinfo.vip_user_type = 3;
        data.userinfo.quota_remain = 999;
    }
    
    if (data.data && Array.isArray(data.data)) {
        for (const audioItem of data.data) {
            // 基础权限设置
            audioItem.privilege = 10;
            audioItem.status = 1;
            audioItem.fail_process = 0;
            audioItem.pay_type = 0;
            audioItem.price = 0;
            audioItem.pkg_price = 0;
            audioItem.buy_count = 1;
            audioItem.buy_count_vip = 1;
            audioItem.buy_count_kubi = 1;
            audioItem.buy_count_audios = 1;
            audioItem.is_publish = 1;
            audioItem.publish = 1;
            
            delete audioItem.popup;
            
            audioItem._msg = "Allow: the audio is free(copyright).";
            audioItem._errno = 0;
            
            if (audioItem.trans_param) {
                audioItem.trans_param.musicpack_advance = 0;
                audioItem.trans_param.pay_block_tpl = 1;
                audioItem.trans_param.display = 0;
                audioItem.trans_param.display_rate = 0;
                audioItem.trans_param.free_limited = 0;
                audioItem.trans_param.all_quality_free = 1;
                audioItem.trans_param.download_privilege = 8;
                
                if (!audioItem.trans_param.classmap || audioItem.trans_param.classmap.attr0 === 0) {
                    audioItem.trans_param.classmap = { attr0: 234881032 };
                }
                
                if (!audioItem.trans_param.appid_block) {
                    audioItem.trans_param.appid_block = "3124";
                }
            }
            
            // 处理关联商品
            if (audioItem.relate_goods && Array.isArray(audioItem.relate_goods)) {
                for (const goods of audioItem.relate_goods) {
                    goods.privilege = 10;
                    goods.status = 1;
                    goods.fail_process = 0;
                    goods.pay_type = 0;
                    goods.price = 0;
                    goods.pkg_price = 0;
                    goods.buy_count = 1;
                    goods.buy_count_vip = 1;
                    goods.buy_count_kubi = 1;
                    goods.buy_count_audios = 1;
                    goods.is_publish = 1;
                    goods.publish = 1;
                    
                    delete goods.popup;
                    
                    goods._msg = "Allow: the audio is free(copyright).";
                    goods._errno = 0;
                    
                    if (goods.trans_param) {
                        goods.trans_param.musicpack_advance = 0;
                        goods.trans_param.pay_block_tpl = 1;
                        goods.trans_param.display = 0;
                        goods.trans_param.display_rate = 0;
                        goods.trans_param.free_limited = 0;
                        goods.trans_param.all_quality_free = 1;
                        goods.trans_param.download_privilege = 8;
                        
                        if (!goods.trans_param.classmap || goods.trans_param.classmap.attr0 === 0) {
                            goods.trans_param.classmap = { attr0: 234881032 };
                        }
                        
                        if (!goods.trans_param.appid_block) {
                            goods.trans_param.appid_block = "3124";
                        }
                    }
                }
            }
        }
    }
    
    return data;
}

/**
 * 处理TME AB测试配置
 */
function processTmeabConfig(data) {
    if (data.data?.TmeabConfigs && typeof data.data.TmeabConfigs === "string") {
        try {
            const tmeabData = JSON.parse(data.data.TmeabConfigs);
            traverse(tmeabData);
            
            const adConfigs = {
                "TMEAB0MyFavorite0adbanner": { else_ad_show: "0" },
                "TMEAB0playpage0admanagement": { add: "0" },
                "TMEAB0huiyuan0wangzhuancard": { card: "0" },
                "TMEAB0huiyuan0wangzhuanzidong": { shouye_is_open: "0" }
            };
            
            for (const [configKey, configValue] of Object.entries(adConfigs)) {
                if (tmeabData[configKey]?.mapParams) {
                    Object.assign(tmeabData[configKey].mapParams, configValue);
                }
            }
            
            data.data.TmeabConfigs = JSON.stringify(tmeabData);
        } catch (error) {
            console.log(`[Kugou_Tmeab_Error] ${error.message}`);
        }
    }
    
    return data;
}

/**
 * 批量响应处理
 */
function processBatchResponses(data) {
    if (data.data?.responses && Array.isArray(data.data.responses)) {
        for (const response of data.data.responses) {
            if (response.body && typeof response.body === "string" && 
                (response.body.startsWith("{") || response.body.startsWith("["))) {
                try {
                    const responseData = JSON.parse(response.body);
                    traverse(responseData);
                    
                    if (responseData.data?.song_list) {
                        for (const song of responseData.data.song_list) {
                            song.privilege = 1;
                            song.pay_type = 0;
                            song.popup = null;
                            
                            if (song.trans_param) {
                                song.trans_param.musicpack_advance = 0;
                                song.trans_param.all_quality_free = 1;
                                song.trans_param.free_limited = 0;
                            }
                        }
                    }
                    
                    response.body = JSON.stringify(responseData);
                } catch (error) {
                    console.log(`[Kugou_Response_Error] ${error.message}`);
                }
            }
        }
    }
    
    return data;
}

/**
 * 应用全局字符串替换
 */
function applyGlobalReplacements(result) {
    let newResult = result
        .replace(/"is_vip"\s*:\s*0/g, '"is_vip":1')
        .replace(/"vip_type"\s*:\s*0/g, '"vip_type":6')
        .replace(/"user_type"\s*:\s*0/g, '"user_type":29')
        .replace(/"m_type"\s*:\s*0/g, '"m_type":1')
        .replace(/"y_type"\s*:\s*0/g, '"y_type":1')
        .replace(/"valid"\s*:\s*false/g, '"valid":true')
        .replace(/"vip_begin_time"\s*:\s*""/g, `"vip_begin_time":"${BEGIN_DATE}"`)
        .replace(/"su_vip_begin_time"\s*:\s*""/g, `"su_vip_begin_time":"${BEGIN_DATE}"`)
        .replace(/"m_begin_time"\s*:\s*""/g, `"m_begin_time":"${BEGIN_DATE}"`)
        .replace(/"pay_type"\s*:\s*3/g, '"pay_type":0')
        .replace(/"fail_process"\s*:\s*4/g, '"fail_process":0')
        .replace(/"popup"\s*:\s*{[^}]+}/g, '"popup":null');
    
    if (!URL_PATTERNS.THEME_CATEGORY.test(url) && !URL_PATTERNS.THEME_INFO.test(url)) {
        newResult = newResult.replace(/"svip_level"\s*:\s*\d+/g, '"svip_level":9');
    }
    
    if (!URL_PATTERNS.RES_PRIVILEGE.test(url)) {
        newResult = newResult.replace(/"privilege"\s*:\s*(0|8)/g, '"privilege":1');
    }
    
    return newResult;
}

/**
 * 主处理函数
 */
function main() {
    if (!body) return null;
    
    try {
        // 处理SSR页面
        if (URL_PATTERNS.SSR_HOME.test(url)) {
            const result = processSSRPage();
            if (result) return result;
        }
        
        const data = JSON.parse(body);
        
        // 特定URL处理
        if (URL_PATTERNS.TASK_CENTER.test(url)) {
            processTaskCenter(data);
        } else if (URL_PATTERNS.THEME_PRIVILEGE.test(url)) {
            if (data.data) {
                data.data.is_privilege = 1;
                data.data.forbid_type = 0;
            }
            data.errcode = 0;
            data.status = 1;
            data.errmsg = "";
        } else if (URL_PATTERNS.RECORD_RACK.test(url)) {
            processRecordRack(data);
        } else if (URL_PATTERNS.THEME_CATEGORY.test(url) || URL_PATTERNS.THEME_INFO.test(url)) {
            if (data.data) {
                if (data.data.info) {
                    processThemes(data.data.info);
                }
                if (data.data.themes) {
                    processThemes(data.data.themes);
                }
                if (URL_PATTERNS.THEME_INFO.test(url)) {
                    processThemes([data.data]);
                }
            }
        } else if (URL_PATTERNS.VIP_LEVEL_DETAIL.test(url) && data.data) {
            data.data.growth = 999999;
            data.data.grade = 9;
            data.data.level_start_growth = 300000;
            data.data.next_level_growth = 1000000;
        } else if (URL_PATTERNS.RES_PRIVILEGE.test(url)) {
            processResPrivilege(data);
        } else if (URL_PATTERNS.PRICE_TIPS.test(url) && data.data) {
            if (data.data.get_tips) {
                for (const tip of data.data.get_tips) {
                    tip.user_type = 29;
                    tip.price = 0;
                    tip.next_price = 0;
                    tip.price_text = "0";
                    
                    if (tip.tips) {
                        for (const tipItem of tip.tips) {
                            tipItem.originalPrice = "0";
                            tipItem.discount = "10";
                            tipItem.discountText = "免费享受";
                        }
                    }
                }
            }
            if (data.data.vip_info) {
                Object.assign(data.data.vip_info, VIP_FIELDS);
            }
        } else if (URL_PATTERNS.FUSION_USERINFO.test(url) && data.data) {
            if (data.data.get_vip_info_v3?.data) {
                Object.assign(data.data.get_vip_info_v3.data, VIP_FIELDS);
            }
            if (data.data.price_product_list?.data?.goods?.super_vip) {
                for (const product of data.data.price_product_list.data.goods.super_vip) {
                    product.price = 0;
                    product.next_price = 0;
                    product.origin_price = 0;
                    product.tag = "免费享受";
                }
            }
        } else if (URL_PATTERNS.WELFARE_LIST.test(url) && data.data) {
            data.data.close_time = VIP_DATE;
            
            const setStatusAndMonth = (obj) => {
                if (obj) {
                    obj.status = 1;
                    obj.month = 999;
                }
            };
            
            setStatusAndMonth(data.data.qqksong);
            setStatusAndMonth(data.data.book);
            setStatusAndMonth(data.data.ring);
            
            if (data.data.iot) {
                data.data.iot.status = 1;
                data.data.iot.month = 999;
                data.data.iot.iot_status = 1;
                data.data.iot.tv_rec_status = 1;
                data.data.iot.box_rec_status = 1;
                data.data.iot.car_rec_status = 1;
                
                if (data.data.iot.iot_info) {
                    for (const info of data.data.iot.iot_info) {
                        info.end_time = VIP_DATE;
                        info.month = 999;
                    }
                }
            }
        } else if (URL_PATTERNS.AUDIO_INFO.test(url) && data.data) {
            traverse(data.data);
        } else if (data.data?.responses) {
            processBatchResponses(data);
        } else if (data.data?.TmeabConfigs) {
            processTmeabConfig(data);
        } else if (URL_PATTERNS.LOGIN.test(url) || URL_PATTERNS.MOBILE_VIPINFO.test(url) || 
                   URL_PATTERNS.GET_VIP_CONFIG.test(url)) {
            if (data.data) {
                Object.assign(data.data, VIP_FIELDS);
                if (data.data.vipinfo) {
                    Object.assign(data.data.vipinfo, VIP_FIELDS);
                }
            }
        } else if (URL_PATTERNS.SEARCH_NO_FOCUS.test(url) && data.data?.ads) {
            data.data.ads = data.data.ads.filter(ad => ad.id === 0 && ad.is_preview === 0 && ad.type !== 103);
            if (data.data.fallback) {
                data.data.fallback = data.data.fallback.filter(item => item.id === 0);
            }
        } else if (URL_PATTERNS.STARLIGHT.test(url) && data.data) {
            data.data = [];
        } else if (URL_PATTERNS.USER_CONFIG.test(url) && data.data) {
            if (data.data.user) {
                for (const user of data.data.user) {
                    if (user.userLevelId === 0) {
                        user.userLevelName = "自定义神";
                        if (user.kg) user.kg.iconType = 1;
                        if (user.fx) user.fx.iconType = 1;
                    }
                }
            }
            if (data.data.star) {
                for (const star of data.data.star) {
                    if (star.starLevelId === 0) {
                        star.starLevelName = "神话5级";
                        if (star.kg) star.kg.iconType = 1;
                        if (star.fx) star.fx.iconType = 1;
                    }
                }
            }
        } else if (URL_PATTERNS.COMBO_PLAY.test(url) && data.data?.modules) {
            traverse(data.data);
        } else if (URL_PATTERNS.AD_COMBINE.test(url)) {
            data.data = {};
        } else if (URL_PATTERNS.VIP_CENTER.test(url) || URL_PATTERNS.SEARCH_BANNER.test(url) || 
                   URL_PATTERNS.MINE_TOP_BANNER.test(url) || URL_PATTERNS.CARD_LISTEN.test(url)) {
            data.data = [];
        } else {
            traverse(data);
        }
        
        let result = JSON.stringify(data);
        result = applyGlobalReplacements(result);
        
        return { body: result };
        
    } catch (error) {
        console.log(`[Kugou_Error] ${error.message}`);
        return null;
    }
}

// 执行主函数
const response = main();
response ? $done(response) : $done({});
