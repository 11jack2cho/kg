/*
 * 
 */

const VIP_FIELDS = {
    // 基础VIP状态
    is_vip: 1,
    vip_type: 6,
    y_type: 1,
    user_type: 29,
    m_type: 1,
    
    // Token相关
    vip_token: "1234567890abcdef",
    auth_token: "1234567890abcdef",
    
    // 时间相关 (有效期到2099年)
    vip_end_time: "2099-09-09 09:09:09",
    vip_begin_time: "2024-01-01 00:00:00",
    m_end_time: "2099-09-09 09:09:09",
    m_begin_time: "2024-01-01 00:00:00",
    su_vip_end_time: "2099-09-09 09:09:09",
    su_vip_begin_time: "2024-01-01 00:00:00",
    roam_end_time: "2099-09-09 09:09:09",
    listen_end_time: "2099-09-09 09:09:09",
    bookvip_end_time: "2099-09-09 09:09:09",
    
    // VIP等级
    svip_level: 9,
    svip_score: 9999,
    
    // 权限标志
    bookvip_valid: 1,
    roam_type: 1,
    is_first: 0
};

const AD_FIELDS_TO_REMOVE = [
    'ads', 'ad_info', 'mobile_link', 'blindbox_list', 'task',
    'boot_ads', 'front_ads', 'least_ads', 'popup'
];

const AD_FIELDS_TO_ZERO = [
    'ad_value', 'audioad', 'video_max_times',
    'expire_prompt', 'already_expire', 'fail_process'
];

// 主处理函数
function processKugouResponse() {
    const url = $request.url;
    let body = $response.body;
    
    if (!body) return $done({});
    
    try {
        // 特殊页面处理 (SSR首页)
        if (url.includes('/ssr/decocenter/home')) {
            return processSSRHomePage(body);
        }
        
        let data = JSON.parse(body);
        
        // 根据URL路由到不同的处理函数
        const handlers = [
            // 任务中心
            { pattern: /task_center_entrance/, handler: processTaskCenter },
            // 皮肤权限
            { pattern: /theme\/get_res_privilege/, handler: processThemePrivilege },
            // 唱片架
            { pattern: /record_rack/, handler: processRecordRack },
            // 主题相关
            { pattern: /theme\/(category|info)/, handler: processThemes },
            // VIP等级详情
            { pattern: /vip_level\/detail/, handler: processVipLevelDetail },
            // 资源权限
            { pattern: /get_res_privilege\/lite/, handler: processResPrivilege },
            // 价格提示
            { pattern: /price\/get_tips/, handler: processPriceTips },
            // 融合用户信息
            { pattern: /fusion\/userinfo/, handler: processFusionUserInfo },
            // 超级VIP福利
            { pattern: /super\/welfarelist/, handler: processSuperWelfare },
            // 音频信息
            { pattern: /union\/audio_info/, handler: processUnionAudioInfo },
            // 批量响应
            { pattern: /\/responses/, handler: processBatchResponses },
            // AB测试
            { pattern: /tmeab/, handler: processTmeabConfigs },
            // 登录相关
            { pattern: /(login|vipinfo|vip_config|dev_user)/, handler: processLoginVipInfo },
            // 搜索无焦点词
            { pattern: /search_no_focus_word/, handler: processSearchNoFocus },
            // 星光活动
            { pattern: /starlight/, handler: processStarlight },
            // 用户等级
            { pattern: /get_level_config/, handler: processUserLevel },
            // 播放页面
            { pattern: /play_page_index/, handler: processPlayPage },
            // 广告相关
            { pattern: /(adp\/ad|ads\.gateway|mine_top_banner)/, handler: processAds },
            // 默认处理
            { pattern: /.*/, handler: processDefault }
        ];
        
        for (const { pattern, handler } of handlers) {
            if (pattern.test(url)) {
                data = handler(data, url);
                break;
            }
        }
        
        // 应用全局修改
        data = applyGlobalModifications(data, url);
        
        return $done({ body: JSON.stringify(data) });
        
    } catch (error) {
        console.log(`[酷狗脚本错误] ${error.message}`);
        return $done({});
    }
}

// ========== 特殊页面处理函数 ==========

function processSSRHomePage(body) {
    const regex = /<script id="__NEXT_DATA__" type="application\/json">(.+?)<\/script>/;
    const match = body.match(regex);
    
    if (!match) return $done({});
    
    try {
        const data = JSON.parse(match[1]);
        
        if (data.props?.pageProps?.state?.vipInfo) {
            Object.assign(data.props.pageProps.state.vipInfo, {
                isVip: 1,
                isSvip: 1,
                level: 9,
                user_type: 29
            });
        }
        
        if (data.props?.pageProps?.funsionData?.vipInfo) {
            Object.assign(data.props.pageProps.funsionData.vipInfo, VIP_FIELDS);
        }
        
        const newData = JSON.stringify(data);
        const newBody = body.replace(regex, `<script id="__NEXT_DATA__" type="application/json">${newData}</script>`);
        
        return $done({ body: newBody });
    } catch (error) {
        console.log(`[SSR页面处理错误] ${error.message}`);
        return $done({});
    }
}

// ========== 业务处理函数 ==========

function processTaskCenter(data, url) {
    const customTitle = "联合国儿童基金会";
    const customLink = "https://t.me/Jsforbaby";
    
    if (data?.data?.ads) {
        data.data.ads.forEach(ad => {
            if (ad.title) ad.title = customTitle;
            if (ad.main_heading) ad.main_heading = customTitle;
            if (ad.entrance_name) ad.entrance_name = customTitle;
            if (ad.desc) ad.desc = "立即查看";
            if (ad.jumpLink) ad.jumpLink = customLink;
        });
    }
    return data;
}

function processThemePrivilege(data, url) {
    if (data.data) {
        data.data.is_privilege = 1;
        data.data.forbid_type = 0;
    }
    data.errcode = 0;
    data.status = 1;
    data.errmsg = "";
    return data;
}

function processRecordRack(data, url) {
    data.errcode = 0;
    data.status = 1;
    data.errmsg = "";
    
    if (data.data) {
        data.data.can_use = 1;
        data.data.is_set = 1;
        data.data.record_rack_status = 1;
        data.data.need_popup = 0;
        
        if (data.data.end_time) {
            data.data.end_time = VIP_FIELDS.vip_end_time;
        }
        
        // 清除弹窗
        ['popup', 'popup_Info', 'popup_info'].forEach(key => {
            if (data.data[key]) {
                data.data[key] = {
                    popup_type: 0,
                    popup_button: "",
                    popup_content: "",
                    jump_url: ""
                };
            }
        });
        
        // 处理列表
        if (Array.isArray(data.data.list)) {
            data.data.list.forEach(item => {
                item.can_use = 1;
                item.end_time = VIP_FIELDS.vip_end_time;
            });
        }
    }
    return data;
}

function processThemes(data, url) {
    const processTheme = (theme) => {
        theme.vip_level = 0;
        theme.privilege = 5;
        theme.privileges = [5];
        
        if (theme.limit_free_info) {
            theme.limit_free_info.limit_free_status = 1;
            theme.limit_free_info.free_end_time = 4092599349;
            theme.limit_free_info.toast_content = "已解锁 SVIP 9 尊享皮肤";
        }
        
        if (theme.price) theme.price = 0;
        if (theme.themes) theme.themes.forEach(processTheme);
    };
    
    if (data?.data) {
        if (data.data.info) {
            data.data.info.forEach(item => {
                if (item.themes) item.themes.forEach(processTheme);
            });
        }
        if (data.data.themes) {
            data.data.themes.forEach(processTheme);
        }
        if (url.includes('theme/info')) {
            processTheme(data.data);
        }
    }
    return data;
}

function processVipLevelDetail(data, url) {
    if (data.data) {
        data.data.growth = 999999;
        data.data.grade = 9;
        data.data.level_start_growth = 300000;
        data.data.next_level_growth = 1000000;
    }
    return data;
}

function processResPrivilege(data, url) {
    // 顶层字段
    data.status = 1;
    data.error_code = 0;
    data.message = "";
    data.appid_group = 1;
    data.should_cache = 1;
    data.vip_user_type = 3;
    
    // 用户信息
    data.userinfo = {
        vip_type: 6,
        m_type: 1,
        vip_user_type: 3,
        quota_remain: 999,
        ...data.userinfo
    };
    
    // 音频数据处理
    if (data.data && Array.isArray(data.data)) {
        data.data.forEach(audioItem => {
            // 基础权限
            Object.assign(audioItem, {
                privilege: 10,
                status: 1,
                fail_process: 0,
                pay_type: 0,
                price: 0,
                pkg_price: 0,
                buy_count: 1,
                buy_count_vip: 1,
                buy_count_kubi: 1,
                buy_count_audios: 1,
                is_publish: 1,
                publish: 1,
                _msg: "Allow: the audio is free(copyright).",
                _errno: 0
            });
            
            delete audioItem.popup;
            
            // trans_param
            if (audioItem.trans_param) {
                Object.assign(audioItem.trans_param, {
                    musicpack_advance: 0,
                    pay_block_tpl: 1,
                    display: 0,
                    display_rate: 0,
                    free_limited: 0,
                    all_quality_free: 1,
                    download_privilege: 8,
                    classmap: { attr0: 234881032 },
                    appid_block: "3124"
                });
            }
            
            // 关联商品
            if (audioItem.relate_goods) {
                audioItem.relate_goods.forEach(goods => {
                    Object.assign(goods, {
                        privilege: 10,
                        status: 1,
                        fail_process: 0,
                        pay_type: 0,
                        price: 0,
                        pkg_price: 0,
                        buy_count: 1,
                        buy_count_vip: 1,
                        buy_count_kubi: 1,
                        buy_count_audios: 1,
                        is_publish: 1,
                        publish: 1,
                        _msg: "Allow: the audio is free(copyright).",
                        _errno: 0
                    });
                    
                    delete goods.popup;
                    
                    if (goods.trans_param) {
                        Object.assign(goods.trans_param, {
                            musicpack_advance: 0,
                            pay_block_tpl: 1,
                            display: 0,
                            display_rate: 0,
                            free_limited: 0,
                            all_quality_free: 1,
                            download_privilege: 8,
                            classmap: { attr0: 234881032 },
                            appid_block: "3124"
                        });
                    }
                });
            }
        });
    }
    return data;
}

function processPriceTips(data, url) {
    if (data.data?.get_tips) {
        data.data.get_tips.forEach(tip => {
            tip.user_type = 29;
            tip.price = 0;
            tip.next_price = 0;
            tip.price_text = "0";
            
            if (tip.tips) {
                tip.tips.forEach(tipItem => {
                    tipItem.originalPrice = "0";
                    tipItem.discount = "10";
                    tipItem.discountText = "免费享受";
                });
            }
        });
    }
    
    if (data.data?.vip_info) {
        Object.assign(data.data.vip_info, VIP_FIELDS);
    }
    return data;
}

function processFusionUserInfo(data, url) {
    if (data.data?.get_vip_info_v3?.data) {
        Object.assign(data.data.get_vip_info_v3.data, VIP_FIELDS);
    }
    
    if (data.data?.price_product_list?.data?.goods?.super_vip) {
        data.data.price_product_list.data.goods.super_vip.forEach(product => {
            product.price = 0;
            product.next_price = 0;
            product.origin_price = 0;
            product.tag = "免费享受";
        });
    }
    return data;
}

function processSuperWelfare(data, url) {
    if (data.data) {
        data.data.close_time = VIP_FIELDS.vip_end_time;
        
        const setStatus = (obj) => {
            if (obj) {
                obj.status = 1;
                obj.month = 999;
            }
        };
        
        setStatus(data.data.qqksong);
        setStatus(data.data.book);
        setStatus(data.data.ring);
        
        if (data.data.iot) {
            data.data.iot.status = 1;
            data.data.iot.month = 999;
            data.data.iot.iot_status = 1;
            data.data.iot.tv_rec_status = 1;
            data.data.iot.box_rec_status = 1;
            data.data.iot.car_rec_status = 1;
            
            if (data.data.iot.iot_info) {
                data.data.iot.iot_info.forEach(info => {
                    info.end_time = VIP_FIELDS.vip_end_time;
                    info.month = 999;
                });
            }
        }
    }
    return data;
}

function processUnionAudioInfo(data, url) {
    traverse(data.data, url);
    return data;
}

function processBatchResponses(data, url) {
    if (data.data?.responses) {
        data.data.responses.forEach(response => {
            if (response.body && typeof response.body === 'string') {
                try {
                    const responseData = JSON.parse(response.body);
                    traverse(responseData, url);
                    
                    if (responseData.data?.song_list) {
                        responseData.data.song_list.forEach(song => {
                            song.privilege = 1;
                            song.pay_type = 0;
                            song.popup = null;
                            
                            if (song.trans_param) {
                                song.trans_param.musicpack_advance = 0;
                                song.trans_param.all_quality_free = 1;
                                song.trans_param.free_limited = 0;
                            }
                        });
                    }
                    
                    response.body = JSON.stringify(responseData);
                } catch (error) {
                    console.log(`[批量响应解析错误] ${error.message}`);
                }
            }
        });
    }
    return data;
}

function processTmeabConfigs(data, url) {
    if (data.data?.TmeabConfigs) {
        try {
            const tmeabData = JSON.parse(data.data.TmeabConfigs);
            traverse(tmeabData, url);
            
            const adConfigs = {
                "TMEAB0MyFavorite0adbanner": { else_ad_show: "0" },
                "TMEAB0playpage0admanagement": { add: "0" },
                "TMEAB0huiyuan0wangzhuancard": { card: "0" },
                "TMEAB0huiyuan0wangzhuanzidong": { shouye_is_open: "0" }
            };
            
            Object.entries(adConfigs).forEach(([key, config]) => {
                if (tmeabData[key]?.mapParams) {
                    Object.assign(tmeabData[key].mapParams, config);
                }
            });
            
            data.data.TmeabConfigs = JSON.stringify(tmeabData);
        } catch (error) {
            console.log(`[Tmeab配置错误] ${error.message}`);
        }
    }
    return data;
}

function processLoginVipInfo(data, url) {
    if (data.data) {
        Object.assign(data.data, VIP_FIELDS);
        if (data.data.vipinfo) {
            Object.assign(data.data.vipinfo, VIP_FIELDS);
        }
    }
    return data;
}

function processSearchNoFocus(data, url) {
    if (data.data?.ads) {
        data.data.ads = data.data.ads.filter(ad => 
            ad.id === 0 && ad.is_preview === 0 && ad.type !== 103
        );
        
        if (data.data.fallback) {
            data.data.fallback = data.data.fallback.filter(item => item.id === 0);
        }
    }
    return data;
}

function processStarlight(data, url) {
    if (data.data) data.data = [];
    return data;
}

function processUserLevel(data, url) {
    const updateItem = (item, nameField, kgName, fxName) => {
        if (item[kgName] === 0) {
            item[nameField] = "自定义神";
            item.kg = { iconType: 1 };
            item.fx = { iconType: 1 };
        }
    };
    
    if (data.data?.user) {
        data.data.user.forEach(user => updateItem(user, 'userLevelName', 'userLevelId'));
    }
    
    if (data.data?.star) {
        data.data.star.forEach(star => {
            if (star.starLevelId === 0) {
                star.starLevelName = "神话5级";
                star.kg = { iconType: 1 };
                star.fx = { iconType: 1 };
            }
        });
    }
    return data;
}

function processPlayPage(data, url) {
    if (data.data?.modules) {
        traverse(data.data, url);
    }
    return data;
}

function processAds(data, url) {
    if (url.includes('adp/ad/v1/playpage_combine') || 
        url.includes('v3/vip_center') ||
        url.includes('ads.gateway/v4/search_banner') ||
        url.includes('mine_top_banner') ||
        url.includes('card/v1/pxy/listen')) {
        data.data = [];
    }
    return data;
}

function processDefault(data, url) {
    traverse(data, url);
    return data;
}

// ========== 工具函数 ==========

function traverse(obj, url) {
    if (typeof obj !== 'object' || obj === null) return;
    
    Object.keys(obj).forEach(key => {
        const value = obj[key];
        
        // VIP字段处理
        if (VIP_FIELD_MAP[key]) {
            obj[key] = VIP_FIELD_MAP[key];
        }
        // Token字段
        else if (['vip_token', 'auth_token'].includes(key)) {
            obj[key] = VIP_FIELDS.vip_token;
        }
        // 时间字段
        else if (key.endsWith('_end_time') || key.endsWith('_endtime')) {
            obj[key] = VIP_FIELDS.vip_end_time;
        }
        else if (key.endsWith('_begin_time')) {
            obj[key] = VIP_FIELDS.vip_begin_time;
        }
        // 广告字段清理
        else if (AD_FIELDS_TO_REMOVE.includes(key) && !url.includes('search_no_focus_word')) {
            if (Array.isArray(value)) {
                obj[key] = [];
            } else {
                obj[key] = null;
            }
        }
        // 广告数值字段清零
        else if (AD_FIELDS_TO_ZERO.includes(key)) {
            obj[key] = 0;
        }
        // 全局配置
        else if (key === 'global' && url.includes('profile')) {
            if (value) {
                value.open = 0;
                value.shortplay_entrance_open = 0;
            }
        }
        // 挂件ID
        else if (['pendant_id', 'flicker_pendant_id'].includes(key)) {
            obj[key] = 0;
        }
        // 递归处理
        else if (typeof value === 'object') {
            traverse(value, url);
        }
    });
}

const VIP_FIELD_MAP = {
    is_vip: 1,
    vip_type: 6,
    user_type: 29,
    y_type: 1,
    m_type: 1,
    is_special_vip: 1,
    vip_switch: 1,
    bookvip_valid: 1,
    valid: true,
    is_original: true,
    privilege: 1,
    pay_type: 0,
    svip_level: 9,
    svip_score: 9999,
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

function applyGlobalModifications(data, url) {
    let jsonString = JSON.stringify(data);
    
    // 全局字段替换
    const replacements = [
        [/"is_vip"\s*:\s*0/g, '"is_vip":1'],
        [/"vip_type"\s*:\s*0/g, '"vip_type":6'],
        [/"user_type"\s*:\s*0/g, '"user_type":29'],
        [/"m_type"\s*:\s*0/g, '"m_type":1'],
        [/"y_type"\s*:\s*0/g, '"y_type":1'],
        [/"valid"\s*:\s*false/g, '"valid":true'],
        [/"pay_type"\s*:\s*3/g, '"pay_type":0'],
        [/"fail_process"\s*:\s*4/g, '"fail_process":0'],
        [/"popup"\s*:\s*{[^}]+}/g, '"popup":null']
    ];
    
    replacements.forEach(([pattern, replacement]) => {
        jsonString = jsonString.replace(pattern, replacement);
    });
    
    // 特殊处理
    if (!url.includes('theme/') && !url.includes('get_res_privilege/lite')) {
        jsonString = jsonString.replace(/"svip_level"\s*:\s*\d+/g, '"svip_level":9');
        jsonString = jsonString.replace(/"privilege"\s*:\s*(0|8)/g, '"privilege":1');
    }
    
    return JSON.parse(jsonString);
}

// 执行主函数
processKugouResponse();
