/**
 * 新建项目一定是单标签项目
 */
/*
var List_App_tag = [ui.asxxl,ui.kxddx,ui.hbddx,ui.dxcj,ui.xxjsdb];
这样定义全局变量,直接调用,程序会崩溃;
须先建立一个全局变量,用ui.resetUIVar()将tag转换成ui可调用的view对象后,再将view对象放入数组;
List_App_tag = [ui.asxxl,ui.kxddx,ui.hbddx,ui.dxcj,ui.xxjsdb];
另外,少用全局变量,全局变量是最后才释放内存;
* */

//[main]里的:
importPackage(android.text);
importPackage(android.view);//导入 view 包
importPackage(android.widget); // 导入 widget 包
//[UI 中获取三方APP 包名 APP名]
importPackage(android.graphics); //
importPackage(android.app);// //[动态排版]里的
//[getAppPkg]里的:
importPackage(android.content);
importPackage(android.content.pm);
// context.getPackageName();
importPackage(android.graphics.drawable);//这个是变背景色的;
//----APP


var List_App_All = [];
var List_App_tag = [];
var List_App_time = [];
var List_App_icon = [];
var List_App_pkg = [];
//----养机APP
var List_yangji_All = [];
var List_yangji_tag = [];
var List_yangji_time = [];
var List_yangji_icon = [];
var List_yangji_pkg = [];
//----广告标签
let yj_bq_nv1_arr = [];
let yj_bq_nv2_arr = [];
let yj_bq_nan1_arr = [];
let yj_bq_nan2_arr = [];

let bq_objectList = {};/*存储标签对象,三级,下分 女1 女2..等,再通过函数转化成二级对象BqSelectObject*/

/*UI中,传入main中的变量,除了ui.之外,还有BqSelectObject(标签勾选状态),Bq_totals_list(标签词语的最终汇合状态)
* */
let 已安装_已勾选 = [];
let 已安装_已勾选_养机 = [];

let 刷金APP_未选 = false;
let 养机APP_未选 = false;

let 标签模式_智能 = false;
let 标签模式_精准 = false;
let 标签模式_混合 = false;

let 含_养 = false;
let 含_刷 = false;

let 脚本模式_专注养机 = false;
let 脚本模式_养刷异步 = false;
let 脚本模式_养刷同步 = false;


let yj_开始计时 = null;
let yj_计时_t = 0,yj_计时_t_last = 0;

let 开始计时 = null;
let 计时_t = 0,计时_t_last = 0;

let 已安装应用列表数据 = []; //[appPkgArr, appNameArr]
var 多线程 = "                                   []";
// thread.execAsync(function () {
//     for (let i = 0; i < 10; i++) {
//         toast("11111")
//         sleep(1000);
//     }
// });
// sleep(3000)

ui.removeAllUIConfig();

function main() {
    console.time("1");
    console.time("9");
    logd("------------------------- 开始主程序 -------------------------");

    ui.layout("参数设置", "main.xml");//耗时10秒;

    logd(console.timeEnd("9"));

    ui.resetUIVar();

    logd("------------------------- 开始主程序1 -------------------------");
    console.time("2");
    //------------------------ ------------------------ 设置页 监听 ------------------------ ------------------------

    当前运行模式检测();
    if (ui.isAccMode()){
        logd("当前是:无障碍模式");
    }
    if (ui.isAgentMode()){
        logd("当前是:代理模式");
    }

    ui.setEvent(ui.Pgm_Btn_模式检测, "click", function (view) { //model 是 那个蓝色巨大[检测]按钮;

        当前运行模式检测();
        ui.saveAllConfig();
    });

    ui.setEvent(ui.Pgm_Rdo_无障碍模式, "checkedChange", function (view, isChecked) {
        logd("[无障碍模式]是否选中 " + isChecked);
        if (isChecked) {
            ui.setRunningMode(2);
        }
        ui.saveAllConfig();

        当前运行模式检测();
    });

    ui.setEvent(ui.Pgm_Rdo_代理模式, "checkedChange", function (view, isChecked) {
        logd("[代理模式]是否选中 " + isChecked);
        if (isChecked) {
            ui.setRunningMode(1);
        }
        ui.saveAllConfig();
        logd("333")
        当前运行模式检测();
    });

    //------------------------ 脚本 自动化服务 检测与监听  ------------------

    AutoServices服务状态检测();
    ui.setEvent(ui.Pgm_Swt_自动化服务_开关, "checkedChange", function (view, isChecked) {
        if (isChecked) {
            toast("打开[自动化服务],请稍等:");
            let ok = ui.isServiceOk();
            if (!ok) {
                ui.startEnvAsync(function (r) {
                    logd("启动环境结果: " + r);
                    //startEnv()
                    if (ui.isServiceOk()) {
                        toast("[自动化服务]启动成功");
                    } else {
                        logd("咋不成功")
                    }
                });
            }
            // ui.saveAllConfig();
        } else {
            toast("关闭[自动化服务]:");
            thread.execAsync(function () {
                closeEnv(false);
            });
            // ui.saveAllConfig();
        }
        AutoServices服务状态检测();
    });

    //------------------------ 脚本 后台弹窗权限 检测与监听  ------------------
    ui.setEvent(ui.Pgm_Swt_后台弹窗权限_开关, "checkedChange", function (view, isChecked) {

        if (isChecked) {
            logd("请求展示浮窗权限[函数]....");
            thread.execAsync(function () {
                requestFloatViewPermission(10000) //请求展示浮窗的权限
            });
        }
        ui.saveAllConfig();
    });
    if (hasFloatViewPermission()) { //检查是否含有浮窗权限
        logd("有[浮窗]权限");
        // ui.Pgm_Swt_后台弹窗权限_开关.setChecked(true); //////
        // ui.saveAllConfig();
        //这个不是监听,而后面又有众多saveAllConfig命令,因此,应该是可以注销该命令,在后面,一次性保存;
        //所有监听,都需要有saveAllConfig命令,而主程序部分,在后面,一次性保存;
    } else {
        logd("无[浮窗]权限");
        ui.Pgm_Swt_后台弹窗权限_开关.setChecked(false);
        // ui.saveAllConfig();
    }

    //------------------------ 脚本 通知栏权限 检测与监听  ------------------
    ui.setEvent(ui.Pgm_Swt_监听通知栏_开关, "checkedChange", function (view, isChecked) {
        logd("Pgm_Swt_监听通知栏_开关 " + isChecked);
        if (isChecked) {
            thread.execAsync(function () {
                requestNotificationPermission(10000)
            });
        }
        ui.saveAllConfig();
    });
    //这个,测试后,挪到上面去;
    if (hasNotificationPermission()) {
        logd("有[通知栏监听]权限");
        ui.Pgm_Swt_监听通知栏_开关.setChecked(true);
        ui.saveAllConfig();
    } else {
        logd("无[通知栏监听]权限");
        ui.Pgm_Swt_监听通知栏_开关.setChecked(false);
        ui.saveAllConfig();
    }
    //启动 toast显示
    ui.setEvent(ui.Pgm_Swt_启动预览摘要_开关, "checkedChange", function (view, isChecked) {
        logd("tag为 Pgm_Swt_启动预览摘要_开关 isChecked " + isChecked);
        if (isChecked) {
            toast("已开启[启动时显示任务摘要]");
        }else{
            toast("已关闭[启动时显示任务摘要]");
        }
        ui.saveAllConfig();
    });
    logd(console.timeEnd("2"))
    logd("------------------------- 开始主程序1 -------------------------");
    console.time("3");

    各APP数值初始化();

    logd(console.timeEnd("3"));//
    logd("------------------------- 开始主程序2 -------------------------");
    console.time("4");
    //-----------------------   设置背景图  -----------------------
    // 获取res 目录下的 png图 转为Android 资源
    let JBshezhi = ui.resResAsDrawable("shezhi.png");
    let bgSettings = ui.resResAsDrawable("more.png");
    let Setyangji = ui.resResAsDrawable("cI1.png");

    ui.脚本设置页面.setBackgroundDrawable(JBshezhi);
    ui.系统设置页面.setBackgroundDrawable(bgSettings);
    ui.养机设置页面.setBackgroundDrawable(Setyangji);

    已安装应用列表数据 = getAppPkg();
    /*系统自带浏览器[com.android.browser]在[getAppPkg]中被过滤掉了,这里,再补充上;
    * */
    已安装应用列表数据[0].push("com.android.browser");//这是包名
    已安装应用列表数据[1].push("浏览器");  //这是应用名;

    ui.putShareData("hasInstalled_list", 已安装应用列表数据);//局部变量;

    //---------------------[UI 中获取三方APP 包名 APP名]----------------------------
    //getAppPkg(),与[ll.app.getInstalledPkgName()]结果相同;
    // importPackage(android.graphics); //
    // importPackage(android.app);// //[动态排版]里的
    thread.execAsync(function () {
        shezhi_tubiao(已安装应用列表数据[0]);
        shezhi_yangji_tubiao(已安装应用列表数据[0]);
    });

    thread.execAsync(function () {
        多线程监听();//监听所有APP的时长;
    });

    thread.execAsync(function () {
        多线程监听_yj();//监听所有APP的时长;
    });

    logd(console.timeEnd("4"));//111
    logd("------------------------- 开始主程序3 -------------------------");
    console.time("5");
    //------------------------ 脚本 页面切换 监听------------------top
    //  养机页按钮
    ui.setEvent(ui.养机设置页面, "click", function (view) {
        setvis(2)
    });
    //  设置页按钮 //右上角的[设置]
    ui.setEvent(ui.脚本设置页面, "click", function (view) {
        setvis(1)
    });
    //  EC设置按钮 //这是竖着的那三个黑点;
    ui.setEvent(ui.系统设置页面, "click", function (view) {
        openECSystemSetting();
        //这个用法跟[游戏合集]用法不一样!
    });

    //------------------------ 脚本 页面切换 监听------------------bottom
    //这个,是"已勾选的APP,总耗时,汇总描述",是利用多线程,实时追踪的;此处,是预执行一遍;
    刷新_已勾选已安装_APP数量();
    刷新_已勾选已安装_APP数量_养机(); //放主程序,先执行一遍;

    //  首页按钮
    ui.setEvent(ui.回到首页, "click", function (view) {
        setvis(0)
    });
    //  保存按钮
    ui.setEvent(ui.保存配置, "click", function (view) {

        if (字段检查非法()){
            logi("开启了在线支付,但密码填写不规范");
            toast("开启了在线支付,但密码填写不规范");
        }else{
            toast("保存数据");
            saveSelApps();
            yj_saveSelApps(); //这个,本身就触发了监听的多线程;//false,表示,不触发监听多线程;

            let 汇总数据 = 汇总当前标签数据并存储(BqSelectObject);
            logd("获取所有标签参数：" + JSON.stringify(汇总数据));
            /*这里,存储了[已安装][未安装],传递给了main.js
            * */
        }

    });
    //  启动脚本 并切换
    ui.setEvent(ui.启动脚本, "click", function (view) {

        if (字段检查非法()){
            logi("开启了在线支付,但密码填写不规范");
            toast("开启了在线支付,但密码填写不规范");
        }else{
            saveSelApps();
            yj_saveSelApps();//这是把[保存]里的命令复制到这里了,看对不对;
            let 异常说明 = 脚本主模式配置错误();//这里赋值[含_养];
            if (!异常说明){

                let 汇总数据 = 汇总当前标签数据并存储(BqSelectObject);
                if (汇总数据 == null && 含_养){

                    logi("脚本勾选了养机,但标签为空");
                    toast("脚本勾选了养机,但标签为空");

                }else{

                    ui.run(100, function (view) {

                        logd("获取所有标签参数：" + JSON.stringify(汇总数据));
                        let stopView = ui.停止脚本;
                        stopView.setVisibility(View.VISIBLE);
                        let statView = ui.启动脚本;
                        statView.setVisibility(View.GONE);
                    });
                    sleep(1000);
                    ui.start();
                }

            }else{
                logi(异常说明);
                toast(异常说明);
                // sleep(5000); //说明:这个地儿不能延时,toast命令,会在本监听结束后才会开始执行,不会在监听里执行;
            }
        }
    });
    //  停止脚本 并切换
    ui.setEvent(ui.停止脚本, "click", function (view) {

        ui.run(100, function (view) {
            let stopView = ui.停止脚本;
            stopView.setVisibility(View.GONE);
            let statView = ui.启动脚本;
            statView.setVisibility(View.VISIBLE);
        });
        sleep(1000);
        ui.stopTask();
    });

    //------------------------ ------------------------ 刷金APP 监听 ------------------------ ------------------------
    //------------------------ 按钮 事件监听  ------------------
    //全选
    ui.setEvent(ui.Sj_Rdo_全选, "checkedChange", function (view, isChecked) {
        logd("[全选]当前为:" + isChecked);
        if (isChecked) {
            刷金_全选过滤()
        }
    });
    //全否
    ui.setEvent(ui.Sj_Rdo_全否, "checkedChange", function (view, isChecked) {
        logd("[全否]当前为:" + isChecked);
        if (isChecked) {
            刷金_全否过滤()
        }
    });
    //反选
    ui.setEvent(ui.Sj_Rdo_反选, "checkedChange", function (view, isChecked) {
        logd("[反选]当前为:" + isChecked);
        if (isChecked) {
            刷金_反选过滤()
        }
    });
    //一键设置分钟
    ui.setEvent(ui.Sj_Btn_一键总时长, "click", function (view) {
        刷金_一键设置总时长()
    });


    logd(console.timeEnd("5"));
    logd("------------------------- 开始主程序4 -------------------------");
    console.time("6");
    //------------------------ ------------------------ 养机界面 设置 监听 ------------------------ ------------------------

    thread.execAsync(function () {
        养机界面各控件监听();//新增加的;
    });
    //这里,有的开关有用,有的开关,没用!
    //ui.一级栏目_1_开关, ui.一级栏目_2_开关, ui.一级栏目_3_开关,ui.一级栏目_4_开关,ui.一级栏目_5_开关,
    /*
    一级内容_1_栏目_3_开关 直播间通用设置
    一级内容_1_栏目_1_开关 直播任务模块
    一级内容_1_栏目_2_开关 直播间任务选择
    一级内容_1_栏目_4_开关 真实购物设置
    一级内容_1_栏目_5_开关 在线支付设置

    一级内容_2_栏目_1_开关_标签模式1 智能标签模式 开关有效
    一级内容_2_栏目_1_开关_标签模式2 精准标签模式 开关有效

    一级内容_3_栏目_1_开关 养广告类型

    一级内容_4_栏目_1_开关_主模式1 专注养机 开关有效
    一级内容_4_栏目_2_开关_主模式2 先养后刷 开关有效
    一级内容_4_栏目_3_开关_主模式3 边刷边养 开关有效
    * */
    //let swArr = [
        // ui.一级内容_1_栏目_3_开关, ui.一级内容_1_栏目_1_开关, ui.一级内容_1_栏目_2_开关,ui.一级内容_1_栏目_4_开关,ui.一级内容_1_栏目_5_开关,
        // ui.一级内容_2_栏目_1_开关_标签模式1, ui.一级内容_2_栏目_1_开关_标签模式2,
        // ui.一级内容_3_栏目_1_开关,
        // ui.一级内容_4_栏目_1_开关_主模式1, ui.一级内容_4_栏目_2_开关_主模式2, ui.一级内容_4_栏目_3_开关_主模式3,
    //];
    // for (let i = 0; i < swArr.length; i++) {
    //     let sw = swArr[i];
    //     ui.setEvent(sw, "checkedChange", function (view, isChecked) {
    //         ui.saveAllConfig();
    //     })
    // }
    ui.setEvent(ui.一级内容_3_栏目_1_开关, "checkedChange", function (view, isChecked) {
        ui.一级内容_3_栏目_1_开关.setChecked(true); //这个是[养广告类型]
        //特殊;
    });
    //------------------------ 养机模式开关  ------------------

    ui.setEvent(ui.一级内容_4_栏目_1_开关_主模式1, "checkedChange", function (view, isChecked) {
        if (isChecked) {
            logd("当前选择了[脚本模式_专注养机]:" + isChecked);
            脚本模式_专注养机 = true;

            if (ui.getViewValue(ui.一级内容_4_栏目_2_开关_主模式2)) {
                ui.一级内容_4_栏目_2_开关_主模式2.setChecked(false);
            }
            if (ui.getViewValue(ui.一级内容_4_栏目_3_开关_主模式3)) {
                ui.一级内容_4_栏目_3_开关_主模式3.setChecked(false);
            }
        }else{
            脚本模式_专注养机 = false;
        }
        ui.saveAllConfig();
    });
    ui.setEvent(ui.一级内容_4_栏目_2_开关_主模式2, "checkedChange", function (view, isChecked) {
        if (isChecked) {
            logd("当前选择了[脚本模式_养刷异步]:" + isChecked);
            脚本模式_养刷异步 = true;
            if (ui.getViewValue(ui.一级内容_4_栏目_1_开关_主模式1)) {
                ui.一级内容_4_栏目_1_开关_主模式1.setChecked(false);
            }
            if (!ui.getViewValue(ui.一级内容_4_栏目_3_开关_主模式3)) {
                ui.一级内容_4_栏目_3_开关_主模式3.setChecked(true);
            }
        }else{
            脚本模式_养刷异步 = false;
        }
        ui.saveAllConfig();
    });
    ui.setEvent(ui.一级内容_4_栏目_3_开关_主模式3, "checkedChange", function (view, isChecked) {
        if (isChecked) {
            logd("当前选择了[脚本模式_养刷同步]:" + isChecked);
            脚本模式_养刷同步 = true;
            if (ui.getViewValue(ui.一级内容_4_栏目_1_开关_主模式1)) {
                ui.一级内容_4_栏目_1_开关_主模式1.setChecked(false);
            }
        }else{
            脚本模式_养刷同步 = false;
        }
        ui.saveAllConfig();
    });
    // ui.setEvent(ui.一级内容_4_栏目_4_开关_主模式4, "checkedChange", function (view, isChecked) {
    //     if (isChecked) {
    //         logd("当前选择了[脚本模式_只刷不养]:" + isChecked);
    //         脚本模式_只刷不养 = true;
    //     }else{
    //         脚本模式_只刷不养 = false;
    //     }
    //     ui.saveAllConfig();
    // });
    //
    ui.setEvent(ui.Yj_直播间任务_Chk_抖币充值, "checkedChange", function (view, isChecked) {
        if (isChecked) {
            ui.一级内容_1_栏目_5_开关.setChecked(true); //在线充值
            // if (ui.getViewValue(ui.一级内容_4_栏目_1_开关_主模式1)) {
            //     ui.一级内容_4_栏目_1_开关_主模式1.setChecked(false);
            // }
        }else{
            ui.一级内容_1_栏目_5_开关.setChecked(false);
        }
        ui.saveAllConfig();
    });

    ui.setEvent(ui.Yj_直播间任务_Chk_真实购物, "checkedChange", function (view, isChecked) {
        if (isChecked) {
            ui.一级内容_1_栏目_4_开关.setChecked(true); //真实购物;
            ui.一级内容_1_栏目_5_开关.setChecked(true); //在线充值
        }else{
            ui.一级内容_1_栏目_4_开关.setChecked(false);
            ui.一级内容_1_栏目_5_开关.setChecked(false);
        }
        ui.saveAllConfig();
    });

    ui.setEvent(ui.一级内容_1_栏目_1_开关, "checkedChange", function (view, isChecked) {
        ui.一级内容_1_栏目_1_开关.setChecked(true);
       //特殊;
    });
    ui.setEvent(ui.一级内容_1_栏目_2_开关, "checkedChange", function (view, isChecked) {
        // ui.一级内容_1_栏目_2_开关.setChecked(true);//直播间任务选择
        if (isChecked){
            ui.Yj_直播间任务_Chk_关注.setChecked(true);
            ui.Yj_直播间任务_Chk_点赞.setChecked(true);
            ui.Yj_直播间任务_Chk_评论.setChecked(true);
            ui.Yj_直播间任务_Chk_抢福袋.setChecked(true);
            ui.Yj_直播间任务_Chk_赠礼物.setChecked(true);
            ui.Yj_直播间任务_Chk_购物车.setChecked(true);
            ui.Yj_直播间任务_Chk_转发.setChecked(true);
            ui.Yj_直播间任务_Chk_转发_sj.setChecked(true);
        }else{
            ui.Yj_直播间任务_Chk_关注.setChecked(false);
            ui.Yj_直播间任务_Chk_点赞.setChecked(false);
            ui.Yj_直播间任务_Chk_评论.setChecked(false);
            ui.Yj_直播间任务_Chk_抢福袋.setChecked(false);
            ui.Yj_直播间任务_Chk_赠礼物.setChecked(false);
            ui.Yj_直播间任务_Chk_购物车.setChecked(false);
            ui.Yj_直播间任务_Chk_转发.setChecked(false);
            ui.Yj_直播间任务_Chk_转发_sj.setChecked(false);
        }
        //特殊;
    });
    ui.setEvent(ui.一级内容_1_栏目_3_开关, "checkedChange", function (view, isChecked) {
        ui.一级内容_1_栏目_3_开关.setChecked(true);
        //特殊;
    });
    ui.setEvent(ui.一级内容_1_栏目_4_开关, "checkedChange", function (view, isChecked) {
        if (isChecked){
            ui.一级内容_1_栏目_5_开关.setChecked(true);
        }
        //特殊;
    });

    if (ui.getViewValue(ui.一级内容_4_栏目_1_开关_主模式1)){
        logd("当前是[脚本模式_专注养机]");
        脚本模式_专注养机 = true;
    }
    if (ui.getViewValue(ui.一级内容_4_栏目_2_开关_主模式2)){
        logd("当前是[脚本模式_养刷异步]");
        脚本模式_养刷异步 = true;
    }
    if (ui.getViewValue(ui.一级内容_4_栏目_3_开关_主模式3)){
        logd("当前是[脚本模式_养刷同步]");
        脚本模式_养刷同步 = true;
    }
    // if (ui.getViewValue(ui.一级内容_4_栏目_4_开关_主模式4)){
    //     logd("当前是[脚本模式_只刷不养]");
    //     脚本模式_只刷不养 = true;
    // }
    //上述三者,不同同时为false;
    //------------------------ 标签模式开关 ------------------
    标签模式_智能 = ui.getViewValue(ui.一级内容_2_栏目_1_开关_标签模式1);
    if (标签模式_智能){
        logd("当前是[智能_标签模式]");
    }
    标签模式_精准 = ui.getViewValue(ui.一级内容_2_栏目_1_开关_标签模式2);
    if (标签模式_精准){
        logd("当前是[精准_标签模式]");
    }
    标签模式_混合 = ui.getViewValue(ui.Yj_标签模式_混合_开关_标签模式3);
    if (标签模式_混合){
        logd("当前是[标签模式_混合]");
    }

    ui.setEvent(ui.一级内容_2_栏目_1_开关_标签模式1, "checkedChange", function (view, isChecked) {
        ui.saveAllConfig();
        if (isChecked){
            logd("开启[标签模式_智能]");
            标签模式_智能 = true;
        }else{
            logd("关闭[标签模式_智能]");
            标签模式_智能 = false;
        }
    });
    ui.setEvent(ui.一级内容_2_栏目_1_开关_标签模式2, "checkedChange", function (view, isChecked) {
        ui.saveAllConfig();
        if (isChecked){
            logd("开启[标签模式_精准]");
            标签模式_精准 = true;
        }else{
            logd("关闭[标签模式_精准]");
            标签模式_精准 = false;
        }
    });
    ui.setEvent(ui.Yj_标签模式_混合_开关_标签模式3, "checkedChange", function (view, isChecked) {
        ui.saveAllConfig();
        if (isChecked){
            logd("开启[标签模式_混合]");
            标签模式_混合 = true;
            ui.一级内容_2_栏目_1_开关_标签模式1.setChecked(true);
            ui.一级内容_2_栏目_1_开关_标签模式2.setChecked(true);
        }else{
            logd("关闭[标签模式_混合]");
            标签模式_混合 = false;
            ui.一级内容_2_栏目_1_开关_标签模式1.setChecked(false);
            ui.一级内容_2_栏目_1_开关_标签模式2.setChecked(false);
        }
    });

    let 标签_编辑模式 = ui.getViewValue(ui.Yj_标签编辑_Swt_编辑模式);
    if (标签_编辑模式) {
        绘制矩形背景(ui.Yj_标签编辑_编辑区域, "#cc8899");//变色
        ui.Yj_标签编辑_Txt_模式说明.setText("编辑模式");
    } else {
        绘制矩形背景(ui.Yj_标签编辑_编辑区域, "#f6f5ec");//恢复背景色
        ui.Yj_标签编辑_Txt_模式说明.setText("勾选模式");
    }

    ui.setEvent(ui.Yj_标签编辑_Swt_编辑模式, "checkedChange", function (view, isChecked) {
        if (isChecked) {
            logd("设置为[编辑模式]");
            绘制矩形背景(ui.Yj_标签编辑_编辑区域, "#cc8899");
            ui.Yj_标签编辑_Txt_模式说明.setText("编辑模式");
            标签_编辑模式 = true;
        } else {
            logd("设置为[不可编辑模式]");
            绘制矩形背景(ui.Yj_标签编辑_编辑区域, "#f6f5ec");
            ui.Yj_标签编辑_Txt_模式说明.setText("勾选模式");
            标签_编辑模式 = false;
        }
        ui.saveAllConfig();
    });
    logd("标签_编辑模式:"+标签_编辑模式);

    logd(console.timeEnd("6"));
    logd("------------------------- 开始主程序5 -------------------------");
    console.time("7");

    //------------------------- 批量建立几十个标签--监听 -------------------------
    /*标签,凡是[多选],先关闭其编辑状态,否则,一次性弹出几十个窗口
    标签对象,三级转二级;
    * */
    let BqSelectObject = {};
    let 标签_一级_对象 = Object.keys(bq_objectList);
    for (let i = 0; i < 标签_一级_对象.length; i++) {
        let 标签_二级_对象 = bq_objectList[标签_一级_对象[i]];
        let 标签_二级 = Object.keys(标签_二级_对象);
        for (let j = 0; j < 标签_二级.length; j++) {
            let 名 = 标签_二级[j];                //名称:"化妆品"
            let 值 = 标签_二级_对象[标签_二级[j]]; //tag :ui.标签_化妆品
            let 真值 = ui.getViewValue(值);//
            if (真值) {
                BqSelectObject[名] = true;
            } else {
                BqSelectObject[名] = false;
            }
            //logd("名:" + 名 + " : " + 真值);
            //显示该值,可以显示该部分,是否正常;先取消显示吧!!!
            if (真值 === null) {
                logd("UI对象获取出错了");
            }
            ui.setEvent(值, "checkedChange", function (view, isChecked) {
                //建监听时,这里面是不执行的;
                BqSelectObject[名] = isChecked;
                logd("将[" + 名 + "]改成了" + isChecked);
                精准标签刷新存储();

                if (isChecked) {
                    if (标签_编辑模式) {
                        logd("[" + 名 + "]编辑模式,启动对话框");
                        // dialogHs();
                        标签编辑_弹窗(名);
                    } else {
                        logd("[" + 名 + "]勾选模式");
                    }
                }
                ui.saveAllConfig();
            });
        }
    }

    let 标签_自定义 = ui.标签_自定义;
    //[自定义]标签,单独建一个监听
    ui.setEvent(标签_自定义, "checkedChange", function (view, isChecked) {
        BqSelectObject["自定义"] = isChecked; //赋值!!
        logd("将[自定义]改成了" + isChecked);
        精准标签刷新存储();
        // ui.putShareData("Bq_Select_list", BqSelectObject);
        if (isChecked) {
            if (标签_编辑模式) {
                logd("[自定义]编辑模式,启动对话框");
                // dialogHs();
                标签编辑_弹窗("自定义");
            } else {
                logd("[自定义]勾选模式");
            }
        }
        ui.saveAllConfig();
    });


    //下面这部分,是不点击[自定义]时,也把该值读进去;需要在主程序运行一遍;
    let 自定义值 = ui.getViewValue(标签_自定义);//
    if (自定义值) {
        BqSelectObject["自定义"] = true;
    } else {
        BqSelectObject["自定义"] = false;
    }
    // logd("名:自定义 : " + 自定义值);

    //下面这个要放在[自定义]监听后面,放在[Yj_智能标签_Btn_浏览]监听前面;
    精准标签刷新存储();
    // ui.putShareData("Bq_Select_list", BqSelectObject);//这个是将二级对象转换成一级对象后的对象;名称+布尔;
    logd("标签对象初始状态: "+JSON.stringify(BqSelectObject));
    //截止此,上面是 : 标签对象,三级转二级;

    ui.setEvent(ui.Yj_智能标签_Btn_浏览, "click", function (view) {
        logd("启动[智能模式_弹窗]");
        智能模式_弹窗(BqSelectObject);
    });

    ui.setEvent(ui.Yj_最终标签_Btn_预览, "click", function (view) {
        logd("启动[智能模式_弹窗]");
        let 汇总数据 = 汇总当前标签数据并存储(BqSelectObject);
        最终标签预览_弹窗(汇总数据);
    });

    logd(console.timeEnd("7"))
    logd("------------------------- 开始主程序6 -------------------------");


    //------------------------ ------------------------ 养机APP 监听 ------------------------ ------------------------
    //------------------------ 养机 按钮 事件监听  ------------------
    
    //养机 app全选
    ui.setEvent(ui.Yj_Rdo_全选, "checkedChange", function (view, isChecked) {
        logd("[养机全选]当前设置为:" + isChecked);
        if (isChecked) {
            关闭编辑状态();
            养机_全选设置()
        }
    });
    //养机 app全否
    ui.setEvent(ui.Yj_Rdo_全否, "checkedChange", function (view, isChecked) {
        logd("[养机全否]当前设置为:" + isChecked);
        if (isChecked) {
            关闭编辑状态();
            养机_全否设置()
        }
    });
    //养机 app反选
    ui.setEvent(ui.Yj_Rdo_反选, "checkedChange", function (view, isChecked) {
        logd("[养机反选]当前设置为:" + isChecked);
        if (isChecked) {
            关闭编辑状态();
            养机_反选设置()
        }
    });
    //养机 一键设置分钟
    ui.setEvent(ui.Yj_Btn_一键总时长, "click", function (view) {
        养机_一键设置总时长()
    });

    //必须先关闭[编辑状态]
    ui.setEvent(ui.Yj_Btn_精准标签重置, "click", function (view) {
        关闭编辑状态();
        yj_xuan_nv1(false);
        yj_xuan_nv2(false);
        yj_xuan_nan1(false);
        yj_xuan_nan2(false);
        关闭自定义();
    });
    //养机 标签 女1
    ui.setEvent(ui.Yj_Rdo_nv1, "checkedChange", function (view, isChecked) {
        关闭编辑状态();
        if (isChecked) {
            yj_xuan_nv1(true);
            yj_xuan_nv2(false);
            yj_xuan_nan1(false);
            yj_xuan_nan2(false);
        }
    });
    //养机 标签 女2
    ui.setEvent(ui.Yj_Rdo_nv2, "checkedChange", function (view, isChecked) {
        关闭编辑状态();
        if (isChecked) {
            yj_xuan_nv1(false);
            yj_xuan_nv2(true);
            yj_xuan_nan1(false);
            yj_xuan_nan2(false);
        }
    });
    //养机 标签 男1
    ui.setEvent(ui.Yj_Rdo_nan1, "checkedChange", function (view, isChecked) {
        关闭编辑状态();
        if (isChecked) {
            yj_xuan_nv1(false);
            yj_xuan_nv2(false);
            yj_xuan_nan1(true);
            yj_xuan_nan2(false);
        }
    });
    //养机 标签 男2
    ui.setEvent(ui.Yj_Rdo_nan2, "checkedChange", function (view, isChecked) {
        关闭编辑状态();
        if (isChecked) {
            yj_xuan_nv1(false);
            yj_xuan_nv2(false);
            yj_xuan_nan1(false);
            yj_xuan_nan2(true);
        }
    });

    //------------------------ EC 日志浮窗 样式调整  ------------------
    // floatWindow();
    跑马灯();
    // showLogWindow();//展示日志浮窗
    // setLogText("开始运行...","#FFFFFF",18);// 参数说明：参数一 日志消息，参数二字体颜色，参数三字体大小
    // setLogText("开始运行...","#AABBCC",18);

    所有_复选框_下载按钮_监听();
    logd(console.timeEnd("1"))


    function 精准标签刷新存储(){
        ui.putShareData("Bq_Select_list", BqSelectObject);//局部变量;
    }


}

//下面2个按钮暂时取消了
//金币阈值
// ui.setEvent(ui.btn_linjie_jinbizhi, "click", function (view) {
//     刷金_金币值设置()
// });
// //金币阈值_阅读
// ui.setEvent(ui.btn_linjie_jinbizhi_yd, "click", function (view) {
//     刷金_金币值设置_阅读()
// });

main();

function 养机界面各控件监听(){

    let 更多非选中 = ui.resResAsDrawable("更多非选中.png");
    let 更多选中 = ui.resResAsDrawable("更多选中.png");

    let 一级内容_1 = ui.一级内容_1;//一级栏目,下面的是"二级内容";以此类推;
    let 一级内容_2 = ui.一级内容_2;//"一级栏目_1"在本文件中,不用变量,直接用的字符串;
    let 一级内容_3 = ui.一级内容_3;
    let 一级内容_4 = ui.一级内容_4;
    let 一级内容_5 = ui.一级内容_5;

    //上面是main里的;

    let 一级内容_1_栏目_3 = ui.一级内容_1_栏目_3;
    let 一级内容_1_栏目_1 = ui.一级内容_1_栏目_1;
    let 一级内容_1_栏目_2 = ui.一级内容_1_栏目_2;
    let 一级内容_1_栏目_4 = ui.一级内容_1_栏目_4;
    let 一级内容_1_栏目_5 = ui.一级内容_1_栏目_5;

    let 一级内容_2_栏目_1 = ui.一级内容_2_栏目_1;
    let 一级内容_2_栏目_2 = ui.一级内容_2_栏目_2;

    let 一级内容_3_栏目_1 = ui.一级内容_3_栏目_1;

    let 一级内容_4_栏目_1 = ui.一级内容_4_栏目_1;
    let 一级内容_4_栏目_2 = ui.一级内容_4_栏目_2;
    let 一级内容_4_栏目_3 = ui.一级内容_4_栏目_3;
    // let 一级内容_4_栏目_4 = ui.一级内容_4_栏目_4;

    let 一级内容_1_栏目_3_内容 = ui.一级内容_1_栏目_3_内容;
    let 一级内容_1_栏目_1_内容 = ui.一级内容_1_栏目_1_内容;
    let 一级内容_1_栏目_2_内容 = ui.一级内容_1_栏目_2_内容;
    let 一级内容_1_栏目_4_内容 = ui.一级内容_1_栏目_4_内容;
    let 一级内容_1_栏目_5_内容 = ui.一级内容_1_栏目_5_内容;

    let 一级内容_2_栏目_1_内容 = ui.一级内容_2_栏目_1_内容;
    let 一级内容_2_栏目_2_内容 = ui.一级内容_2_栏目_2_内容;
    let 一级内容_3_栏目_1_内容 = ui.一级内容_3_栏目_1_内容;
    let 一级内容_4_栏目_1_内容 = ui.一级内容_4_栏目_1_内容;
    let 一级内容_4_栏目_2_内容 = ui.一级内容_4_栏目_2_内容;
    let 一级内容_4_栏目_3_内容 = ui.一级内容_4_栏目_3_内容;
    // let 一级内容_4_栏目_4_内容 = ui.一级内容_4_栏目_4_内容;
    //这里的[一级栏目_1]等,在main里,可能main里的,可直接用"一级栏目_1"形式的吧;
    ui.setEvent("一级栏目_1", "click", function (view) {
        if (一级内容_1.getVisibility() === View.VISIBLE) {
            一级内容_1.setVisibility(View.GONE);
            ui.pic_一级栏目_1.setImageDrawable(更多非选中);
        } else {
            一级内容_1.setVisibility(View.VISIBLE);
            ui.pic_一级栏目_1.setImageDrawable(更多选中);
        }
    });
    ui.setEvent("一级栏目_2", "click", function (view) {
        if (一级内容_2.getVisibility() === View.VISIBLE) {
            一级内容_2.setVisibility(View.GONE);
            ui.pic_一级栏目_2.setImageDrawable(更多非选中);
        } else {
            一级内容_2.setVisibility(View.VISIBLE);
            ui.pic_一级栏目_2.setImageDrawable(更多选中);
        }
    });
    ui.setEvent("一级栏目_3", "click", function (view) {
        if (一级内容_3.getVisibility() === View.VISIBLE) {
            一级内容_3.setVisibility(View.GONE);
            ui.pic_一级栏目_3.setImageDrawable(更多非选中);
        } else {
            一级内容_3.setVisibility(View.VISIBLE);
            ui.pic_一级栏目_3.setImageDrawable(更多选中);
        }
    });
    ui.setEvent("一级栏目_4", "click", function (view) {
        if (一级内容_4.getVisibility() === View.VISIBLE) {
            一级内容_4.setVisibility(View.GONE);
            ui.pic_一级栏目_4.setImageDrawable(更多非选中);
        } else {
            一级内容_4.setVisibility(View.VISIBLE);
            ui.pic_一级栏目_4.setImageDrawable(更多选中);
        }
    });
    ui.setEvent("一级栏目_5", "click", function (view) {
        if (一级内容_5.getVisibility() === View.VISIBLE) {
            一级内容_5.setVisibility(View.GONE);
            ui.pic_一级栏目_5.setImageDrawable(更多非选中);
        } else {
            一级内容_5.setVisibility(View.VISIBLE);
            ui.pic_一级栏目_5.setImageDrawable(更多选中);
        }
    });

    ui.setEvent(一级内容_1_栏目_3, "click", function (view) {
        if (一级内容_1_栏目_3_内容.getVisibility() === View.VISIBLE) {
            一级内容_1_栏目_3_内容.setVisibility(View.GONE);
            ui.pic_一级内容_1_栏目_3.setImageDrawable(更多非选中);
        } else {
            一级内容_1_栏目_3_内容.setVisibility(View.VISIBLE);
            ui.pic_一级内容_1_栏目_3.setImageDrawable(更多选中);
        }
    });
    ui.setEvent(一级内容_1_栏目_1, "click", function (view) {
        if (一级内容_1_栏目_1_内容.getVisibility() === View.VISIBLE) {
            一级内容_1_栏目_1_内容.setVisibility(View.GONE);
            ui.pic_一级内容_1_栏目_1.setImageDrawable(更多非选中);
        } else {
            一级内容_1_栏目_1_内容.setVisibility(View.VISIBLE);
            ui.pic_一级内容_1_栏目_1.setImageDrawable(更多选中);
        }
    });
    ui.setEvent(一级内容_1_栏目_2, "click", function (view) {
        if (一级内容_1_栏目_2_内容.getVisibility() === View.VISIBLE) {
            一级内容_1_栏目_2_内容.setVisibility(View.GONE);
            ui.pic_一级内容_1_栏目_2.setImageDrawable(更多非选中);
        } else {
            一级内容_1_栏目_2_内容.setVisibility(View.VISIBLE);
            ui.pic_一级内容_1_栏目_2.setImageDrawable(更多选中);
        }
    });
    ui.setEvent(一级内容_1_栏目_4, "click", function (view) {
        if (一级内容_1_栏目_4_内容.getVisibility() === View.VISIBLE) {
            一级内容_1_栏目_4_内容.setVisibility(View.GONE);
            ui.pic_一级内容_1_栏目_4.setImageDrawable(更多非选中);
        } else {
            一级内容_1_栏目_4_内容.setVisibility(View.VISIBLE);
            ui.pic_一级内容_1_栏目_4.setImageDrawable(更多选中);
        }
    });
    ui.setEvent(一级内容_1_栏目_5, "click", function (view) {
        if (一级内容_1_栏目_5_内容.getVisibility() === View.VISIBLE) {
            一级内容_1_栏目_5_内容.setVisibility(View.GONE);
            ui.pic_一级内容_1_栏目_5.setImageDrawable(更多非选中);
        } else {
            一级内容_1_栏目_5_内容.setVisibility(View.VISIBLE);
            ui.pic_一级内容_1_栏目_5.setImageDrawable(更多选中);
        }
    });

    ui.setEvent(一级内容_2_栏目_1, "click", function (view) {
        if (一级内容_2_栏目_1_内容.getVisibility() === View.VISIBLE) {
            一级内容_2_栏目_1_内容.setVisibility(View.GONE);
            ui.pic_一级内容_2_栏目_1.setImageDrawable(更多非选中);
        } else {
            一级内容_2_栏目_1_内容.setVisibility(View.VISIBLE);
            ui.pic_一级内容_2_栏目_1.setImageDrawable(更多选中);
        }
    });
    ui.setEvent(一级内容_2_栏目_2, "click", function (view) {
        if (一级内容_2_栏目_2_内容.getVisibility() === View.VISIBLE) {
            一级内容_2_栏目_2_内容.setVisibility(View.GONE);
            ui.pic_一级内容_2_栏目_2.setImageDrawable(更多非选中);
        } else {
            一级内容_2_栏目_2_内容.setVisibility(View.VISIBLE);
            ui.pic_一级内容_2_栏目_2.setImageDrawable(更多选中);
        }
    });
    ui.setEvent(一级内容_3_栏目_1, "click", function (view) {
        if (一级内容_3_栏目_1_内容.getVisibility() === View.VISIBLE) {
            一级内容_3_栏目_1_内容.setVisibility(View.GONE);
            ui.pic_一级内容_3_栏目_1.setImageDrawable(更多非选中);
        } else {
            一级内容_3_栏目_1_内容.setVisibility(View.VISIBLE);
            ui.pic_一级内容_3_栏目_1.setImageDrawable(更多选中);
        }
    });
    ui.setEvent(一级内容_4_栏目_1, "click", function (view) {
        if (一级内容_4_栏目_1_内容.getVisibility() === View.VISIBLE) {
            一级内容_4_栏目_1_内容.setVisibility(View.GONE);
            ui.pic_一级内容_4_栏目_1.setImageDrawable(更多非选中);
        } else {
            一级内容_4_栏目_1_内容.setVisibility(View.VISIBLE);
            ui.pic_一级内容_4_栏目_1.setImageDrawable(更多选中);
        }
    });
    ui.setEvent(一级内容_4_栏目_2, "click", function (view) {
        if (一级内容_4_栏目_2_内容.getVisibility() === View.VISIBLE) {
            一级内容_4_栏目_2_内容.setVisibility(View.GONE);
            ui.pic_一级内容_4_栏目_2.setImageDrawable(更多非选中);
        } else {
            一级内容_4_栏目_2_内容.setVisibility(View.VISIBLE);
            ui.pic_一级内容_4_栏目_2.setImageDrawable(更多选中);
        }
    });
    ui.setEvent(一级内容_4_栏目_3, "click", function (view) {
        if (一级内容_4_栏目_3_内容.getVisibility() === View.VISIBLE) {
            一级内容_4_栏目_3_内容.setVisibility(View.GONE);
            ui.pic_一级内容_4_栏目_3.setImageDrawable(更多非选中);
        } else {
            一级内容_4_栏目_3_内容.setVisibility(View.VISIBLE);
            ui.pic_一级内容_4_栏目_3.setImageDrawable(更多选中);
        }
    });
    // ui.setEvent(一级内容_4_栏目_4, "click", function (view) {
    //     if (一级内容_4_栏目_4_内容.getVisibility() === View.VISIBLE) {
    //         一级内容_4_栏目_4_内容.setVisibility(View.GONE);
    //         ui.pic_一级内容_4_栏目_4.setImageDrawable(更多非选中);
    //     } else {
    //         一级内容_4_栏目_4_内容.setVisibility(View.VISIBLE);
    //         ui.pic_一级内容_4_栏目_4.setImageDrawable(更多选中);
    //     }
    // });
}

function shezhi_tubiao(arr) {
    ui.run(10, function (view) {
        for (let i = 0; i < List_App_pkg.length; i++) {
            let installpkg = List_App_pkg[i];
            let m = i;
            for (let j = 0; j < arr.length; j++) {
                if (installpkg == arr[j]) {
                    let drawable = context.getPackageManager().getApplicationIcon(installpkg);//获取三方应用图标
                    //logd("设置一次")
                    //ui.setViewValue(ui.List_App_p[m],drawable);
                    //let tv3 = new TextView(context);
                    let iv = List_App_icon[m];
                    //iv.setForeground(drawable)
                    if (iv === undefined){
                        logd("错误:"+iv+arr[j]);
                        exit();
                    }
                    iv.setImageDrawable(drawable); //ui.resResAsDrawable
                    //ui.asxxl_p.setBackgroundDrawable(drawable)
                    //List_App_p[m].setBackgroundDrawable(drawable);
                    break;
                }
            }
        }
    })

}

function shezhi_yangji_tubiao(arr) {
    ui.run(10, function (view) {
        for (let i = 0; i < List_yangji_pkg.length; i++) {
            let installpkg = List_yangji_pkg[i];
            let m = i;
            for (let j = 0; j < arr.length; j++) {
                if (installpkg == arr[j]) {
                    let drawable = context.getPackageManager().getApplicationIcon(installpkg);//获取三方应用图标
                    //logd("设置一次")
                    //ui.setViewValue(ui.List_App_p[m],drawable);
                    //let tv3 = new TextView(context);
                    let iv = List_yangji_icon[m];
                    //iv.setForeground(drawable)
                    if (iv === undefined){
                        logd("错误:"+iv+arr[j]);
                        exit();
                    }
                    iv.setImageDrawable(drawable); //ui.resResAsDrawable
                    //ui.asxxl_p.setBackgroundDrawable(drawable)
                    //List_App_p[m].setBackgroundDrawable(drawable);
                    break;
                }
            }
        }
    })

}

function 跑马灯() {
//-----------------------   跑马灯 动态文本  -----------------------
    let tv = ui.paomadeng;                           //  xml里的tag
    tv.setSingleLine(true);                          // 单行显示
    tv.setFocusableInTouchMode(true);                // 可以通过触摸获取焦点
    tv.setText("如需更多功能点击右上角按钮进行设置 | 如需更多功能点击右上角按钮进行设置 | 如需更多功能点击右上角按钮进行设置 | 如需更多功能点击右上角按钮进行设置 | 如需更多功能点击右上角按钮进行设置 | 如需更多功能点击右上角按钮进行设置 | 如需更多功能点击右上角按钮进行设置 |")
    tv.setFocusable(true);                           // 可以获取焦点
    tv.setEllipsize(TextUtils.TruncateAt.MARQUEE);   // 设置跑马灯显示效果
    tv.setHorizontallyScrolling(true);               // 设置文本水平滚动
    tv.setMarqueeRepeatLimit(-1);                    // 无限循环滚动
    tv.requestFocus();                               // textview 强制获得焦点
    tv.setSelected(true);                            // 与编辑框同时存在时设置该属性 不会受到编辑框影响
}

function 各APP数值初始化() {
    //添加APP需改定的地方:1,本处;2,saveSelApps();3,[变量.js]中;4,[main.js][循环任务()][222]处!
    List_App_All = [
        {name: "爱上消消乐", tag: ui.asxxl, time: ui.asxxl_time, icon: ui.asxxl_icon, pkg: "com.disappear.leyuangame"},
        {name: "消消三国得宝", tag: ui.xxsgdb, time: ui.xxsgdb_time, icon: ui.xxsgdb_icon, pkg: "com.liyan.xxsgdb"},
        {name: "消消僵尸得宝", tag: ui.xxjsdb, time: ui.xxjsdb_time, icon: ui.xxjsdb_icon, pkg: "com.liyan.xxjsdb"},
        {name: "全民消除寻宝", tag: ui.qmxcxb, time: ui.qmxcxb_time, icon: ui.qmxcxb_icon, pkg: "com.liyan.qmxcxb"},
        {name: "对对碰宝", tag: ui.ddpb, time: ui.ddpb_time, icon: ui.ddpb_icon, pkg: "com.liyan.ddpb"},
        {name: "天天全民金币大消除",tag: ui.ttqmjbdxc,time: ui.ttqmjbdxc_time,icon: ui.ttqmjbdxc_icon,pkg: "com.liyan.ttqmjbdxc"},
        {name: "金币后宫消消乐", tag: ui.jbhgxxl, time: ui.jbhgxxl_time, icon: ui.jbhgxxl_icon, pkg: "com.onewave.hgjbxxl"},
        {name: "彩蛋消消乐", tag: ui.cdxxl, time: ui.cdxxl_time, icon: ui.cdxxl_icon, pkg: "com.onewave.cdxxl"},
        {name: "宝藏消消消", tag: ui.bzxxx, time: ui.bzxxx_time, icon: ui.bzxxx_icon, pkg: "com.xianggu.bzxxx"},
        {name: "萌宠乐消消", tag: ui.mclxx, time: ui.mclxx_time, icon: ui.mclxx_icon, pkg: "com.xianggu.mclxx"},
        {name: "梦幻点点消", tag: ui.mhddx, time: ui.mhddx_time, icon: ui.mhddx_icon, pkg: "com.onewave.mhddx"},

        {name: "欢乐猪猪消", tag: ui.hlzzx, time: ui.hlzzx_time, icon: ui.hlzzx_icon, pkg: "net.guangying.hlzzx"},
        {name: "点点消消消", tag: ui.ddxxx, time: ui.ddxxx_time, icon: ui.ddxxx_icon, pkg: "net.guangying.ddxxx"},
        {name: "消除小方块", tag: ui.xcxfk, time: ui.xcxfk_time, icon: ui.xcxfk_icon, pkg: "net.guangying.xcxfk"},
        {name: "魔法爱消除", tag: ui.mfaxc, time: ui.mfaxc_time, icon: ui.mfaxc_icon, pkg: "com.android.ctsmfaxc"},

        {name: "爱上消消消", tag: ui.asxxx, time: ui.asxxx_time, icon: ui.asxxx_icon, pkg: "love.match.set"},
        {name: "红包点点消", tag: ui.hbddx, time: ui.hbddx_time, icon: ui.hbddx_icon, pkg: "com.match.redpacket.cn.one"},
        {name: "贝壳消消乐", tag: ui.bkxxl, time: ui.bkxxl_time, icon: ui.bkxxl_icon, pkg: "com.match.bkxxl.cn"},
        {name: "开心消消消", tag: ui.kxxxx, time: ui.kxxxx_time, icon: ui.kxxxx_icon, pkg: "com.youtimetech.happy"},

        {name: "分红世界", tag: ui.fhsj, time: ui.fhsj_time, icon: ui.fhsj_icon, pkg: "com.zhenzuan.fhsj"},
        {name: "百万红包", tag: ui.zqbb, time: ui.zqbb_time, icon: ui.zqbb_icon, pkg: "com.pkwws.bwhb"},
        {name: "赚赚记账", tag: ui.jjzq, time: ui.jjzq_time, icon: ui.jjzq_icon, pkg: "com.bbitlong.zzjz"},
        //自阅A
        {name: "东方头条极速版", tag: ui.dfttjsb, time: ui.dfttjsb_time, icon: ui.dfttjsb_icon, pkg: "com.songheng.fasteastnews"}, // // //com.immomo.momo
        {name: "乐乐看", tag: ui.lelekan, time: ui.lelekan_time, icon: ui.lelekan_icon, pkg: "com.news.llk"},

        {name: "刷刷乐", tag: ui.shuashuale, time: ui.shuashuale_time, icon: ui.shuashuale_icon, pkg: "com.qxnew.ssl"},
        {name: "人人看", tag: ui.renrenkan, time: ui.renrenkan_time, icon: ui.renrenkan_icon, pkg: "com.kaka.rrvideo"},
        //自阅B
        {name: "悦看点", tag: ui.yuekandian, time: ui.yuekandian_time, icon: ui.yuekandian_icon, pkg: "com.meituo.ykd"},
        {name: "阅多多", tag: ui.yueduoduo, time: ui.yueduoduo_time, icon: ui.yueduoduo_icon, pkg: "com.meituo.ydd"},
        {name: "看点宝", tag: ui.kandianbao, time: ui.kandianbao_time, icon: ui.kandianbao_icon, pkg: "com.meituo.kdb"},
        //自阅C
        {name: "好看点极速版", tag: ui.haokandianjisuban, time: ui.haokandianjisuban_time, icon: ui.haokandianjisuban_icon, pkg: "com.meituo.hkdjsb"},
        {name: "阅看点极速版", tag: ui.yuekandianjisuban, time: ui.yuekandianjisuban_time, icon: ui.yuekandianjisuban_icon, pkg: "com.meituo.ykdjsb"},
        //自阅D

        {name: "好看点", tag: ui.haokandian, time: ui.haokandian_time, icon: ui.haokandian_icon, pkg: "com.meituo.hkd"},
        {name: "悦热点", tag: ui.yueredian, time: ui.yueredian_time, icon: ui.yueredian_icon, pkg: "com.yc.yrd"},
        {name: "趣看365", tag: ui.qukan365, time: ui.qukan365_time, icon: ui.qukan365_icon, pkg: "com.yc.qk"},
        {name: "看点宝极速版", tag: ui.kandianbaojisuban, time: ui.kandianbaojisuban_time, icon: ui.kandianbaojisuban_icon, pkg: "com.meituo.kdbjsb"},
        {name: "幸福看点", tag: ui.xingfukandian, time: ui.xingfukandian_time, icon: ui.xingfukandian_icon, pkg: "com.yc.xfkd"},

        {name: "爱看点", tag: ui.aikandian, time: ui.aikandian_time, icon: ui.aikandian_icon, pkg: "com.gxq.lovetowatch.ltw"},
        {name: "乐乐刷", tag: ui.leleshua, time: ui.leleshua_time, icon: ui.leleshua_icon, pkg: "com.zy.lls"},
        {name: "秒提看点", tag: ui.miaotikandian, time: ui.miaotikandian_time, icon: ui.miaotikandian_icon, pkg: "com.ljy.mtkd"},

        {name: "趣好看软件", tag: ui.quhaokanruanjian, time: ui.quhaokanruanjian_time, icon: ui.quhaokanruanjian_icon, pkg: "com.ylkj.qhktt"},
        {name: "趣好看极速版", tag: ui.quhaokanjsb, time: ui.quhaokanjsb_time, icon: ui.quhaokanjsb_icon, pkg: "com.ylkj.qhkjsb"},
        {name: "赢看点极速版", tag: ui.yingkandianjsb, time: ui.yingkandianjsb_time, icon: ui.yingkandianjsb_icon, pkg: "com.ylkj.ykdjsb"},

        //自阅E
        {name: "娱玩看点", tag: ui.yuwankandian, time: ui.yuwankandian_time, icon: ui.yuwankandian_icon, pkg: "com.liyan.ywkandian"},
        {name: "悦赚看点", tag: ui.yuezhuankandian, time: ui.yuezhuankandian_time, icon: ui.yuezhuankandian_icon, pkg: "com.zijian.yuezhuankandian"},
        //自阅F
        {name: "惠看点极速版", tag: ui.huikandianjsb, time: ui.huikandianjsb_time, icon: ui.huikandianjsb_icon, pkg: "com.zx.huikdjsb"},
        {name: "龙龙趣看极速版", tag: ui.longlongqukanjsb, time: ui.longlongqukanjsb_time, icon: ui.longlongqukanjsb_icon, pkg: "com.zx.llqkjsb"},
        {name: "365看点", tag: ui.kandian365, time: ui.kandian365_time, icon: ui.kandian365_icon, pkg: "com.zx.slwkd"},//
        {name: "天天秒提", tag: ui.tiantianmiaoti, time: ui.tiantianmiaoti_time, icon: ui.tiantianmiaoti_icon, pkg: "com.ljy.ttmtnewer"},
        {name: "秒提看看", tag: ui.miaotikankan, time: ui.miaotikankan_time, icon: ui.miaotikankan_icon, pkg: "com.zx.mtkk"},
        {name: "秒提看看PRO", tag: ui.miaotikankanpro, time: ui.miaotikankanpro_time, icon: ui.miaotikankanpro_icon, pkg: "com.zx.mtkkpro"},
        {name: "真滴能提", tag: ui.zhendinengti, time: ui.zhendinengti_time, icon: ui.zhendinengti_icon, pkg: "com.ljy.zdnt"},
        {name: "真滴能提极速版", tag: ui.zhendinengtijsb, time: ui.zhendinengtijsb_time, icon: ui.zhendinengtijsb_icon, pkg: "com.ljy.zdntjsb"},

        //自阅G
        {name: "悦趣看点", tag: ui.yuequkandian, time: ui.yuequkandian_time, icon: ui.yuequkandian_icon, pkg: "com.my.yykd"},
        {name: "赚金看点", tag: ui.zhuanjinkandian, time: ui.zhuanjinkandian_time, icon: ui.zhuanjinkandian_icon, pkg: "com.xq.zjkd"},
        {name: "头条赚金", tag: ui.toutiaozhuanjin, time: ui.toutiaozhuanjin_time, icon: ui.toutiaozhuanjin_icon, pkg: "com.xq.ttzj"},

        {name: "趣赚资讯", tag: ui.quzhuanzixun, time: ui.quzhuanzixun_time, icon: ui.quzhuanzixun_icon, pkg: "com.xq.qzzx"},
        {name: "51趣赚", tag: ui.quzhuan51, time: ui.quzhuan51_time, icon: ui.quzhuan51_icon, pkg: "com.xy.foqz"},
        {name: "米读趣赚", tag: ui.miduquzhuan, time: ui.miduquzhuan_time, icon: ui.miduquzhuan_icon, pkg: "com.xy.mdqz"},

        {name: "阳光趣看看", tag: ui.yangguangqukankan, time: ui.yangguangqukankan_time, icon: ui.yangguangqukankan_icon, pkg: "com.maotu.sunhappy"},
        {name: "每日趣看看", tag: ui.meiriqukankan, time: ui.meiriqukankan_time, icon: ui.meiriqukankan_icon, pkg: "com.yinhu.everydaykan"},
        {name: "生肖看看", tag: ui.shengxiaokankan, time: ui.shengxiaokankan_time, icon: ui.shengxiaokankan_icon, pkg: "com.tm.sxkk"},
        {name: "生肖看看极速版", tag: ui.shengxiaokankanjsb, time: ui.shengxiaokankanjsb_time, icon: ui.shengxiaokankanjsb_icon, pkg: "com.tm.sxkkjs"},
        // {name: "趣赚钱", tag: ui.quzhuanqian, time: ui.quzhuanqian_time, icon: ui.quzhuanqian_icon, pkg: "com.coin.qzq"},


        {name: "雏鱼", tag: ui.chuyu, time: ui.chuyu_time, icon: ui.chuyu_icon, pkg: "com.kelai.chuyu.ves"},
        {name: "猫豚", tag: ui.maotun, time: ui.maotun_time, icon: ui.maotun_icon, pkg: "com.kelai.maotun.ves"},
        {name: "撸猫短视频", tag: ui.lumaodsp, time: ui.lumaodsp_time, icon: ui.lumaodsp_icon, pkg: "com.kelai.lmsp.tt"},

        {name: "喜鹊短视频", tag: ui.xiquedsp, time: ui.xiquedsp_time, icon: ui.xiquedsp_icon, pkg: "com.xjyc.xqsp"},
        {name: "番鱼短视频1", tag: ui.fanyudsp1, time: ui.fanyudsp1_time, icon: ui.fanyudsp1_icon, pkg: "com.kelai.fanyu.tt"},
        {name: "番鱼短视频2", tag: ui.fanyudsp2, time: ui.fanyudsp2_time, icon: ui.fanyudsp2_icon, pkg: "com.kelai.fanyu.dec"},

        {name: "鹈鹕短视频1", tag: ui.tihudsp1, time: ui.tihudsp1_time, icon: ui.tihudsp1_icon, pkg: "com.xjyc.tihu"},//这个包名换成能用的版本了;
        {name: "鹈鹕短视频2", tag: ui.tihudsp2, time: ui.tihudsp2_time, icon: ui.tihudsp2_icon, pkg: "com.xjyc.tihu.dec"},
        {name: "鹈鹕短视频3", tag: ui.tihudsp3, time: ui.tihudsp3_time, icon: ui.tihudsp3_icon, pkg: "com.xjyc.tihu.aug"},

        {name: "金鸡短视频1", tag: ui.jinjidsp1, time: ui.jinjidsp1_time, icon: ui.jinjidsp1_icon, pkg: "com.xjyc.jjsp"},
        {name: "金鸡短视频2", tag: ui.jinjidsp2, time: ui.jinjidsp2_time, icon: ui.jinjidsp2_icon, pkg: "com.xjyc.jjsp.tt"},//只有1个提现

        {name: "吃鸡极速版1", tag: ui.chijijsb1, time: ui.chijijsb1_time, icon: ui.chijijsb1_icon, pkg: "com.xjyc.chiji.mm"},//4个提现
        {name: "吃鸡极速版2", tag: ui.chijijsb2, time: ui.chijijsb2_time, icon: ui.chijijsb2_icon, pkg: "com.xjyc.cjjs.mar"},//3个提现

        {name: "田鸡短视频", tag: ui.tianjidsp, time: ui.tianjidsp_time, icon: ui.tianjidsp_icon, pkg: "com.xjyc.tianji"},
        {name: "发财树视频", tag: ui.fcssp, time: ui.fcssp_time, icon: ui.fcssp_icon, pkg: "com.xjyc.facaishu"},
        {name: "兔子赚钱", tag: ui.tuzizq, time: ui.tuzizq_time, icon: ui.tuzizq_icon, pkg: "com.xjyc.tzzq"},
        {name: "微看点", tag: ui.weikandian, time: ui.weikandian_time, icon: ui.weikandian_icon, pkg: "com.dydl.zailai"},
        {name: "聚看点", tag: ui.jukandian, time: ui.jukandian_time, icon: ui.jukandian_icon, pkg: "com.xinfu.weikandian"},

        {name: "再来短视频", tag: ui.zailaidsp, time: ui.zailaidsp_time, icon: ui.zailaidsp_icon, pkg: "com.dydl.zailai"},
        {name: "再来极速版", tag: ui.zailaijsb, time: ui.zailaijsb_time, icon: ui.zailaijsb_icon, pkg: "com.dydl.zljs"},
        {name: "长猿短视频", tag: ui.changyuandsp, time: ui.changyuandsp_time, icon: ui.changyuandsp_icon, pkg: "com.danyan.changyuan"},
        {name: "北猴短视频", tag: ui.beihoudsp, time: ui.beihoudsp_time, icon: ui.beihoudsp_icon, pkg: "com.danyan.beihou"},
        {name: "悦刷", tag: ui.yueshua, time: ui.yueshua_time, icon: ui.yueshua_icon, pkg: "com.danyan.yueshua"},
        {name: "风鹭短视频", tag: ui.fengludsp, time: ui.fengludsp_time, icon: ui.fengludsp_icon, pkg: "com.jiandan.fenglu"},

        {name: "花梨短视频", tag: ui.hualidsp, time: ui.hualidsp_time, icon: ui.hualidsp_icon, pkg: "com.xmbl.huali"},
        {name: "鸦风短视频", tag: ui.yafengdsp, time: ui.yafengdsp_time, icon: ui.yafengdsp_icon, pkg: "com.xingyuan.yafeng"},
        {name: "茶豚短视频", tag: ui.chatundsp, time: ui.chatundsp_time, icon: ui.chatundsp_icon, pkg: "com.icos.chatun"},
        {name: "千柚短视频", tag: ui.qianyoudsp, time: ui.qianyoudsp_time, icon: ui.qianyoudsp_icon, pkg: "com.xmyq.qianyou"},
        {name: "萌虎短视频", tag: ui.menghudsp, time: ui.menghudsp_time, icon: ui.menghudsp_icon, pkg: "com.youqian.menghu"},
        {name: "月兔短视频", tag: ui.yuetudsp, time: ui.yuetudsp_time, icon: ui.yuetudsp_icon, pkg: "com.duoku.yuetu"},
        {name: "弹梨短视频", tag: ui.tanlidsp, time: ui.tanlidsp_time, icon: ui.tanlidsp_icon, pkg: "com.cyhd.tanli"},
        {name: "火爆短视频", tag: ui.huobaodsp, time: ui.huobaodsp_time, icon: ui.huobaodsp_icon, pkg: "com.cyhd.huobao"},
        {name: "虎猫短视频", tag: ui.humaodsp, time: ui.humaodsp_time, icon: ui.humaodsp_icon, pkg: "com.shcd.maohu"},
        {name: "弯豆短视频", tag: ui.wandoudsp, time: ui.wandoudsp_time, icon: ui.wandoudsp_icon, pkg: "com.jinsha.wandou"},

        {name: "乐茶", tag: ui.lechadsp, time: ui.lechadsp_time, icon: ui.lechadsp_icon, pkg: "com.shcd.lecha.lc"},
        {name: "欣隆", tag: ui.xinlongdsp, time: ui.xinlongdsp_time, icon: ui.xinlongdsp_icon, pkg: "com.cyhd.xinlong.xl"},
        {name: "玩赚", tag: ui.wanzhuandsp, time: ui.wanzhuandsp_time, icon: ui.wanzhuandsp_icon, pkg: "com.youqian.wanzhuan"},
        {name: "勤赚", tag: ui.qinzhuandsp, time: ui.qinzhuandsp_time, icon: ui.qinzhuandsp_icon, pkg: "com.mihao.qinzhuan"},
        {name: "看点", tag: ui.kandiandsp, time: ui.kandiandsp_time, icon: ui.kandiandsp_icon, pkg: "com.blcx.kandian"},

        {name: "闪鸭短视频", tag: ui.shanyadsp, time: ui.shanyadsp_time, icon: ui.shanyadsp_icon, pkg: "com.qiansheng.syjs"},
        {name: "鲨宝短视频", tag: ui.shabaodsp, time: ui.shabaodsp_time, icon: ui.shabaodsp_icon, pkg: "com.qs.shabaojs"},
        {name: "通宝", tag: ui.tongbao, time: ui.tongbao_time, icon: ui.tongbao_icon, pkg: "com.qinglan.tobao"},
        {name: "亨优", tag: ui.hengyou, time: ui.hengyou_time, icon: ui.hengyou_icon, pkg: "com.chaoyu.hengyou"},
        {name: "弹梨", tag: ui.tanli, time: ui.tanli_time, icon: ui.tanli_icon, pkg: "com.cyhd.tanli.tl"},
        {name: "火参", tag: ui.huocan, time: ui.huocan_time, icon: ui.huocan_icon, pkg: "com.syh.huocan"},

    ];

    for (let i = 0; i < List_App_All.length; i++) {
        List_App_tag.push(List_App_All[i].tag);
        List_App_time.push(List_App_All[i].time);
        List_App_icon.push(List_App_All[i].icon);
        List_App_pkg.push(List_App_All[i].pkg);
    }

    List_yangji_All = [
        {name: "抖音", tag: ui.douyin, time: ui.douyin_time, icon: ui.douyin_icon, pkg: "com.ss.android.ugc.aweme"},
        {name: "抖音极速版", tag: ui.douyinjsb, time: ui.douyinjsb_time, icon: ui.douyinjsb_icon, pkg: "com.ss.android.ugc.aweme.lite"},
        {name: "快手", tag: ui.kuaishou, time: ui.kuaishou_time, icon: ui.kuaishou_icon, pkg: "com.smile.gifmaker"},
        {name: "快手极速版", tag: ui.kuaishoujsb, time: ui.kuaishoujsb_time, icon: ui.kuaishoujsb_icon, pkg: "com.kuaishou.nebula"},
        {name: "今日头条", tag: ui.jrtt, time: ui.jrtt_time, icon: ui.jrtt_icon, pkg: "com.ss.android.article.news"},
        {name: "今日头条极速版",tag: ui.jrttjsb,time: ui.jrttjsb_time,icon: ui.jrttjsb_icon,pkg: "com.ss.android.article.lite"},
        {name: "百度极速版", tag: ui.bdjsb, time: ui.bdjsb_time, icon: ui.bdjsb_icon, pkg: "com.baidu.searchbox.lite"},
        {name: "QQ浏览器", tag: ui.qqllq, time: ui.qqllq_time, icon: ui.qqllq_icon, pkg: "com.tencent.mtt"},
        {name: "浏览器", tag: ui.llq, time: ui.llq_time, icon: ui.llq_icon, pkg: "com.android.browser"},

        {name: "懂车帝", tag: ui.dcd, time: ui.dcd_time, icon: ui.dcd_icon, pkg: "com.ss.android.auto"},
        {name: "易车", tag: ui.yiche, time: ui.yiche_time, icon: ui.yiche_icon, pkg: "com.yiche.autoeasy"},
        {name: "汽车之家", tag: ui.qczj, time: ui.qczj_time, icon: ui.qczj_icon, pkg: "com.cubic.autohome"},
        {name: "拼多多", tag: ui.pdd, time: ui.pdd_time, icon: ui.pdd_icon, pkg: "com.xunmeng.pinduoduo"},
        {name: "京东", tag: ui.jingdong, time: ui.jingdong_time, icon: ui.jingdong_icon, pkg: "com.jingdong.app.mall"},
        {name: "淘宝", tag: ui.taobao, time: ui.taobao_time, icon: ui.taobao_icon, pkg: "com.taobao.taobao"},
        {name: "天猫", tag: ui.tianmao, time: ui.tianmao_time, icon: ui.tianmao_icon, pkg: "com.tmall.wireless"},
    ];

    for (let i = 0; i < List_yangji_All.length; i++) {
        List_yangji_tag.push(List_yangji_All[i].tag);
        List_yangji_time.push(List_yangji_All[i].time);
        List_yangji_icon.push(List_yangji_All[i].icon);
        List_yangji_pkg.push(List_yangji_All[i].pkg);
    }

    //-------------------- 下面是标签相关 --------------------
    bq_objectList = {
        nv1: {"化妆品": ui.标签_化妆品,"零食": ui.标签_零食, "服装": ui.标签_服装, "饰品": ui.标签_饰品, "假发": ui.标签_假发},
        nan1: {"培训": ui.标签_培训, "贷款": ui.标签_贷款, "电子": ui.标签_电子, "游戏": ui.标签_游戏, "交友": ui.标签_交友,"脱发": ui.标签_脱发},
        nv2: { "美容": ui.标签_美容, "瘦身": ui.标签_瘦身, "小家电": ui.标签_小家电, "家居": ui.标签_家居, "婴幼": ui.标签_婴幼},
        nan2: {"股票": ui.标签_股票,"理财": ui.标签_理财,"黄金": ui.标签_黄金,"外汇": ui.标签_外汇,"金融": ui.标签_金融,"茶叶": ui.标签_茶叶,"酒": ui.标签_酒,"保健品": ui.标签_保健品},
    };

    let bq_nv1_key = Object.keys(bq_objectList.nv1);
    for (let i = 0; i < bq_nv1_key.length; i++) {
        yj_bq_nv1_arr.push(bq_objectList["nv1"][bq_nv1_key[i]]); //二级对象中,不对Object.keys(bq_objectList.nv1)中对象进行过渡赋值,直接引用的写法,省去了一个变量;
    }
    let bq_nv2_key = Object.keys(bq_objectList.nv2);
    for (let i = 0; i < bq_nv2_key.length; i++) {
        yj_bq_nv2_arr.push(bq_objectList["nv2"][bq_nv2_key[i]]);
    }
    let bq_nan1_key = Object.keys(bq_objectList.nan1);
    for (let i = 0; i < bq_nan1_key.length; i++) {
        yj_bq_nan1_arr.push(bq_objectList["nan1"][bq_nan1_key[i]]);
    }
    let bq_nan2_key = Object.keys(bq_objectList.nan2);
    for (let i = 0; i < bq_nan2_key.length; i++) {
        yj_bq_nan2_arr.push(bq_objectList["nan2"][bq_nan2_key[i]]);
    }

}

function 多线程监听() {
    //200毫秒内,若值不增加,则启动[汇总]函数;
    //开始-计时
    do {
        if (开始计时){
            if (计时_t_last !== 计时_t){
                计时_t_last = 计时_t;
                logd(多线程+"[刷金APP勾选]监听_计时_t:"+计时_t);
                logd(多线程+"[刷金APP勾选]监听_计时_t_last:"+计时_t_last);
                TimeSign_start91 = null;
            }else{
                //相等了,说明不再变化了;
                logd(多线程+"23");
                if (心跳控制_毫秒(1,200)){ //监听-复选框不再变化了...
                    //设置文本;
                    logd(多线程+"[刷金APP勾选]监听:刷新记录");
                    ui.run(100, function (view) {
                        刷新_已勾选已安装_APP数量();
                    });
                    开始计时 = null;
                    计时_t = 0;
                }
            }
        }
        sleep(50);
    }while (1)
}

function 多线程监听_yj() {
    //200毫秒内,若值不增加,则启动[汇总]函数;
    //yj_开始计时
    do {
        if (yj_开始计时){
            if (yj_计时_t_last !== yj_计时_t){
                yj_计时_t_last = yj_计时_t;
                logd(多线程+"[养机APP勾选]监听_计时_t:"+yj_计时_t);
                logd(多线程+"[养机APP勾选]监听_计时_t_last:"+yj_计时_t_last);
                TimeSign_start92 = null;
            }else{
                //相等了,说明不再变化了;
                logd(多线程+"24");
                if (心跳控制_毫秒(2,200)){
                    //设置文本;
                    logd(多线程+"[养机APP勾选]监听:刷新记录");
                    ui.run(100, function (view) {
                        刷新_已勾选已安装_APP数量_养机();
                    });
                    yj_开始计时 = null;
                    yj_计时_t = 0;
                }
            }
        }
        sleep(50);
    }while (1)
}

function setvis(svtag) { //这个,是在"3个"页面之间切换;
    let sv = ui.sv1;
    switch (svtag) {
        case 0://回[首页]
            sv.setVisibility(View.VISIBLE);
            sv = ui.sv2;
            sv.setVisibility(View.GONE);
            sv = ui.sv3;
            sv.setVisibility(View.GONE); //这里面要添加一个,必须在main.xml中[include]添加;
            break;
        case 1://[设置]页
            sv.setVisibility(View.GONE);
            sv = ui.sv2;
            sv.setVisibility(View.VISIBLE);
            sv = ui.sv3;
            sv.setVisibility(View.GONE);
            break;
        case 2://[养机]页
            sv.setVisibility(View.GONE);
            sv = ui.sv2;
            sv.setVisibility(View.GONE);
            sv = ui.sv3;
            sv.setVisibility(View.VISIBLE);
            break;

    }

}

//------------------------ 所有APP复选框|下载按钮 监听  ------------------

function saveSelApps() {
    开始计时 = true;
    计时_t++;
    //********************************************
    let selApps = [];
    let add;
    // 爱上消消乐
    let asxxl = ui.getViewValue(ui.asxxl);
    if (asxxl) {
        let selApp_asxxl = new Object();
        selApp_asxxl.appname = "爱上消消乐";
        selApp_asxxl.tag = "asxxl";
        selApps.push(selApp_asxxl);
    }
    let xxsgdb = ui.getViewValue(ui.xxsgdb);
    if (xxsgdb) {
        let selApp_xxsgdb = new Object();
        selApp_xxsgdb.appname = "消消三国得宝";
        selApp_xxsgdb.tag = "xxsgdb";
        selApps.push(selApp_xxsgdb);
    }
    let xxjsdb = ui.getViewValue(ui.xxjsdb);
    if (xxjsdb) {
        let selApp_xxjsdb = new Object();
        selApp_xxjsdb.appname = "消消僵尸得宝";
        selApp_xxjsdb.tag = "xxjsdb";
        selApps.push(selApp_xxjsdb);
    }
    let qmxcxb = ui.getViewValue(ui.qmxcxb);
    if (qmxcxb) {
        let selApp_qmxcxb = new Object();
        selApp_qmxcxb.appname = "全民消除寻宝";
        selApp_qmxcxb.tag = "qmxcxb";
        selApps.push(selApp_qmxcxb);
    }
    let ddpb = ui.getViewValue(ui.ddpb);
    if (ddpb) {
        let selApp_ddpb = new Object();
        selApp_ddpb.appname = "对对碰宝";
        selApp_ddpb.tag = "ddpb";
        selApps.push(selApp_ddpb);
    }
    let ttqmjbdxc = ui.getViewValue(ui.ttqmjbdxc);
    if (ttqmjbdxc) {
        let selApp_ttqmjbdxc = new Object();
        selApp_ttqmjbdxc.appname = "天天全民金币大消除";
        selApp_ttqmjbdxc.tag = "ttqmjbdxc";
        selApps.push(selApp_ttqmjbdxc);
    }
    let hgjbxxl = ui.getViewValue(ui.hgjbxxl);
    if (hgjbxxl) {
        let selApp_hgjbxxl = new Object();
        selApp_hgjbxxl.appname = "金币后宫消消乐";
        selApp_hgjbxxl.tag = "jbhgxxl";
        selApps.push(selApp_hgjbxxl);
    }
    let cdxxl = ui.getViewValue(ui.cdxxl);
    if (cdxxl) {
        let selApp_cdxxl = new Object();
        selApp_cdxxl.appname = "彩蛋消消乐";
        selApp_cdxxl.tag = "cdxxl";
        selApps.push(selApp_cdxxl);
    }
    let bzxxx = ui.getViewValue(ui.bzxxx);
    if (bzxxx) {
        let selApp_bzxxx = new Object();
        selApp_bzxxx.appname = "宝藏消消消";
        selApp_bzxxx.tag = "bzxxx";
        selApps.push(selApp_bzxxx);
    }
    let mclxx = ui.getViewValue(ui.mclxx);
    if (mclxx) {
        let selApp_mclxx = new Object();
        selApp_mclxx.appname = "萌宠乐消消";
        selApp_mclxx.tag = "mclxx";
        selApps.push(selApp_mclxx);
    }
    let mhddx = ui.getViewValue(ui.mhddx);
    if (mhddx) {
        let selApp_mhddx = new Object();
        selApp_mhddx.appname = "梦幻点点消";
        selApp_mhddx.tag = "mhddx";
        selApps.push(selApp_mhddx);
    }
    ////
    let hlzzx = ui.getViewValue(ui.hlzzx);
    if (hlzzx) {
        let selApp_hlzzx = new Object();
        selApp_hlzzx.appname = "欢乐猪猪消";
        selApp_hlzzx.tag = "hlzzx";
        selApps.push(selApp_hlzzx);
    }
    let ddxxx = ui.getViewValue(ui.ddxxx);
    if (ddxxx) {
        let selApp_ddxxx = new Object();
        selApp_ddxxx.appname = "点点消消消";
        selApp_ddxxx.tag = "ddxxx";
        selApps.push(selApp_ddxxx);
    }
    let xcxfk = ui.getViewValue(ui.xcxfk);
    if (xcxfk) {
        let selApp_xcxfk = new Object();
        selApp_xcxfk.appname = "消除小方块";
        selApp_xcxfk.tag = "xcxfk";
        selApps.push(selApp_xcxfk);
    }
    let mfaxc = ui.getViewValue(ui.mfaxc);
    if (mfaxc) {
        let selApp_mfaxc = new Object();
        selApp_mfaxc.appname = "魔法爱消除";
        selApp_mfaxc.tag = "mfaxc";
        selApps.push(selApp_mfaxc);
    }

    let asxxx = ui.getViewValue(ui.asxxx);
    if (asxxx) {
        let selApp_asxxx = new Object();
        selApp_asxxx.appname = "爱上消消消";
        selApp_asxxx.tag = "asxxx";
        selApps.push(selApp_asxxx);
    }
    let hbddx = ui.getViewValue(ui.hbddx);
    if (hbddx) {
        let selApp_hbddx = new Object();
        selApp_hbddx.appname = "红包点点消";
        selApp_hbddx.tag = "hbddx";
        selApps.push(selApp_hbddx);
    }
    let bkxxl = ui.getViewValue(ui.bkxxl);
    if (bkxxl) {
        let selApp_bkxxl = new Object();
        selApp_bkxxl.appname = "贝壳消消乐";
        selApp_bkxxl.tag = "bkxxl";
        selApps.push(selApp_bkxxl);
    }
    let kxxxx = ui.getViewValue(ui.kxxxx);
    if (kxxxx) {
        let selApp_kxxxx = new Object();
        selApp_kxxxx.appname = "开心消消消";
        selApp_kxxxx.tag = "kxxxx";
        selApps.push(selApp_kxxxx);
    }
    let fhsj = ui.getViewValue(ui.fhsj);
    if (fhsj) {
        let selApp_fhsj = new Object();
        selApp_fhsj.appname = "分红世界";
        selApp_fhsj.tag = "fhsj";
        selApps.push(selApp_fhsj);
    }
    let zqbb = ui.getViewValue(ui.zqbb);
    if (zqbb) {
        let selApp_zqbb = new Object();
        selApp_zqbb.appname = "百万红包";
        selApp_zqbb.tag = "zqbb";
        selApps.push(selApp_zqbb);
    }
    let jjzq = ui.getViewValue(ui.jjzq);
    if (jjzq) {
        let selApp_jjzq = new Object();
        selApp_jjzq.appname = "赚赚记账";
        selApp_jjzq.tag = "jjzq";
        selApps.push(selApp_jjzq);
    }

    let dfttjsb = ui.getViewValue(ui.dfttjsb);
    if (dfttjsb) {
        let selApp_dfttjsb = new Object();
        selApp_dfttjsb.appname = "东方头条极速版";
        selApp_dfttjsb.tag = "dfttjsb";
        selApps.push(selApp_dfttjsb);
    }
    let lelekan = ui.getViewValue(ui.lelekan);
    if (lelekan) {
        let selApp_lelekan = new Object();
        selApp_lelekan.appname = "乐乐看";
        selApp_lelekan.tag = "lelekan";
        selApps.push(selApp_lelekan);
    }

    let shuashuale = ui.getViewValue(ui.shuashuale);
    if (shuashuale) {
        let selApp_shuashuale = new Object();
        selApp_shuashuale.appname = "刷刷乐";
        selApp_shuashuale.tag = "shuashuale";
        selApps.push(selApp_shuashuale);
    }

    let renrenkan = ui.getViewValue(ui.renrenkan);
    if (renrenkan) {
        let selApp_renrenkan = new Object();
        selApp_renrenkan.appname = "人人看";
        selApp_renrenkan.tag = "renrenkan";
        selApps.push(selApp_renrenkan);
    }
    let kandianbao = ui.getViewValue(ui.kandianbao);
    if (kandianbao) {
        let selApp_kandianbao = new Object();
        selApp_kandianbao.appname = "看点宝";
        selApp_kandianbao.tag = "kandianbao";
        selApps.push(selApp_kandianbao);
    }
    let yuekandian = ui.getViewValue(ui.yuekandian);
    if (yuekandian) {
        let selApp_yuekandian = new Object();
        selApp_yuekandian.appname = "悦看点";
        selApp_yuekandian.tag = "yuekandian";
        selApps.push(selApp_yuekandian);
    }

    let yueduoduo = ui.getViewValue(ui.yueduoduo);
    if (yueduoduo) {
        let selApp_yueduoduo = new Object();
        selApp_yueduoduo.appname = "阅多多";
        selApp_yueduoduo.tag = "yueduoduo";
        selApps.push(selApp_yueduoduo);
    }

    let haokandianjisuban = ui.getViewValue(ui.haokandianjisuban);
    if (haokandianjisuban) {
        let selApp_haokandianjisuban = new Object();
        selApp_haokandianjisuban.appname = "好看点极速版";
        selApp_haokandianjisuban.tag = "haokandianjisuban";
        selApps.push(selApp_haokandianjisuban);
    }
    let yuekandianjisuban = ui.getViewValue(ui.yuekandianjisuban);
    if (yuekandianjisuban) {
        let selApp_yuekandianjisuban = new Object();
        selApp_yuekandianjisuban.appname = "阅看点极速版";
        selApp_yuekandianjisuban.tag = "yuekandianjisuban";
        selApps.push(selApp_yuekandianjisuban);
    }
    let haokandian = ui.getViewValue(ui.haokandian);
    if (haokandian) {
        let selApp_haokandian = new Object();
        selApp_haokandian.appname = "好看点";
        selApp_haokandian.tag = "haokandian";
        selApps.push(selApp_haokandian);
    }

    let yueredian = ui.getViewValue(ui.yueredian);
    if (yueredian) {
        let selApp_yueredian = new Object();
        selApp_yueredian.appname = "悦热点";
        selApp_yueredian.tag = "yueredian";
        selApps.push(selApp_yueredian);
    }
    let qukan365 = ui.getViewValue(ui.qukan365);
    if (qukan365) {
        let selApp_qukan365 = new Object();
        selApp_qukan365.appname = "趣看365";
        selApp_qukan365.tag = "qukan365";
        selApps.push(selApp_qukan365);
    }

    let kandianbaojisuban = ui.getViewValue(ui.kandianbaojisuban);
    if (kandianbaojisuban) {
        let selApp_kandianbaojisuban = new Object();
        selApp_kandianbaojisuban.appname = "看点宝极速版";
        selApp_kandianbaojisuban.tag = "kandianbaojisuban";
        selApps.push(selApp_kandianbaojisuban);
    }
    let xingfukankan = ui.getViewValue(ui.xingfukankan);
    if (xingfukankan) {
        let selApp_xingfukankan = new Object();
        selApp_xingfukankan.appname = "幸福看看";
        selApp_xingfukankan.tag = "xingfukankan";
        selApps.push(selApp_xingfukankan);
    }

    let leleshua = ui.getViewValue(ui.leleshua);
    if (leleshua) {
        let selApp_leleshua = new Object();
        selApp_leleshua.appname = "乐乐刷";
        selApp_leleshua.tag = "leleshua";
        selApps.push(selApp_leleshua);
    }
    let aikandian = ui.getViewValue(ui.aikandian);
    if (aikandian) {
        let selApp_aikandian = new Object();
        selApp_aikandian.appname = "爱看点";
        selApp_aikandian.tag = "aikandian";
        selApps.push(selApp_aikandian);
    }

    let miaotikandian = ui.getViewValue(ui.miaotikandian);
    if (miaotikandian) {
        let selApp_miaotikandian = new Object();
        selApp_miaotikandian.appname = "秒提看点";
        selApp_miaotikandian.tag = "miaotikandian";
        selApps.push(selApp_miaotikandian);
    }

    let quhaokanruanjian = ui.getViewValue(ui.quhaokanruanjian);
    if (quhaokanruanjian) {
        let selApp_quhaokanruanjian = new Object();
        selApp_quhaokanruanjian.appname = "趣好看软件";
        selApp_quhaokanruanjian.tag = "quhaokanruanjian";
        selApps.push(selApp_quhaokanruanjian);
    }
    let quhaokanjsb = ui.getViewValue(ui.quhaokanjsb);
    if (quhaokanjsb) {
        let selApp_quhaokanjsb = new Object();
        selApp_quhaokanjsb.appname = "趣好看极速版";
        selApp_quhaokanjsb.tag = "quhaokanjsb";
        selApps.push(selApp_quhaokanjsb);
    }
    let yingkandianjsb = ui.getViewValue(ui.yingkandianjsb);
    if (yingkandianjsb) {
        let selApp_yingkandianjsb = new Object();
        selApp_yingkandianjsb.appname = "赢看点极速版";
        selApp_yingkandianjsb.tag = "yingkandianjsb";
        selApps.push(selApp_yingkandianjsb);
    }

    let yuwankandian = ui.getViewValue(ui.yuwankandian);
    if (yuwankandian) {
        let selApp_yuwankandian = new Object();
        selApp_yuwankandian.appname = "娱玩看点";
        selApp_yuwankandian.tag = "yuwankandian";
        selApps.push(selApp_yuwankandian);
    }
    let yuezhuankandian = ui.getViewValue(ui.yuezhuankandian);
    if (yuezhuankandian) {
        let selApp_yuezhuankandian = new Object();
        selApp_yuezhuankandian.appname = "悦赚看点";
        selApp_yuezhuankandian.tag = "yuezhuankandian";
        selApps.push(selApp_yuezhuankandian);
    }

    let huikandianjsb = ui.getViewValue(ui.huikandianjsb);
    if (huikandianjsb) {
        let selApp_huikandianjsb = new Object();
        selApp_huikandianjsb.appname = "惠看点极速版";
        selApp_huikandianjsb.tag = "huikandianjsb";
        selApps.push(selApp_huikandianjsb);
    }
    let longlongqukanjsb = ui.getViewValue(ui.longlongqukanjsb);
    if (longlongqukanjsb) {
        let selApp_longlongqukanjsb = new Object();
        selApp_longlongqukanjsb.appname = "龙龙趣看极速版";
        selApp_longlongqukanjsb.tag = "longlongqukanjsb";
        selApps.push(selApp_longlongqukanjsb);
    }

    let kandian365 = ui.getViewValue(ui.kandian365);
    if (kandian365) {
        let selApp_kandian365 = new Object();
        selApp_kandian365.appname = "365看点";
        selApp_kandian365.tag = "kandian365";
        selApps.push(selApp_kandian365);
    }
    let tiantianmiaoti = ui.getViewValue(ui.tiantianmiaoti);
    if (tiantianmiaoti) {
        let selApp_tiantianmiaoti = new Object();
        selApp_tiantianmiaoti.appname = "天天秒提";
        selApp_tiantianmiaoti.tag = "tiantianmiaoti";
        selApps.push(selApp_tiantianmiaoti);
    }

    let miaotikankan = ui.getViewValue(ui.miaotikankan);
    if (miaotikankan) {
        let selApp_miaotikankan = new Object();
        selApp_miaotikankan.appname = "秒提看看";
        selApp_miaotikankan.tag = "miaotikankan";
        selApps.push(selApp_miaotikankan);
    }
    let miaotikankanpro = ui.getViewValue(ui.miaotikankanpro);
    if (miaotikankanpro) {
        let selApp_miaotikankanpro = new Object();
        selApp_miaotikankanpro.appname = "秒提看看PRO";
        selApp_miaotikankanpro.tag = "miaotikankanpro";
        selApps.push(selApp_miaotikankanpro);
    }
    let zhendinengti = ui.getViewValue(ui.zhendinengti);
    if (zhendinengti) {
        let selApp_zhendinengti = new Object();
        selApp_zhendinengti.appname = "真滴能提";
        selApp_zhendinengti.tag = "zhendinengti";
        selApps.push(selApp_zhendinengti);
    }
    let zhendinengtijsb = ui.getViewValue(ui.zhendinengtijsb);
    if (zhendinengtijsb) {
        let selApp_zhendinengtijsb = new Object();
        selApp_zhendinengtijsb.appname = "真滴能提极速版";
        selApp_zhendinengtijsb.tag = "zhendinengtijsb";
        selApps.push(selApp_zhendinengtijsb);
    }

    let yuequkandian = ui.getViewValue(ui.yuequkandian);
    if (yuequkandian) {
        let selApp_yuequkandian = new Object();
        selApp_yuequkandian.appname = "悦趣看点";
        selApp_yuequkandian.tag = "yuequkandian";
        selApps.push(selApp_yuequkandian);
    }
    let zhuanjinkandian = ui.getViewValue(ui.zhuanjinkandian);
    if (zhuanjinkandian) {
        let selApp_zhuanjinkandian = new Object();
        selApp_zhuanjinkandian.appname = "赚金看点";
        selApp_zhuanjinkandian.tag = "zhuanjinkandian";
        selApps.push(selApp_zhuanjinkandian);
    }
    let toutiaozhuanjin = ui.getViewValue(ui.toutiaozhuanjin);
    if (toutiaozhuanjin) {
        let selApp_toutiaozhuanjin = new Object();
        selApp_toutiaozhuanjin.appname = "头条赚金";
        selApp_toutiaozhuanjin.tag = "toutiaozhuanjin";
        selApps.push(selApp_toutiaozhuanjin);
    }

    let quzhuanzixun = ui.getViewValue(ui.quzhuanzixun);
    if (quzhuanzixun) {
        let selApp_quzhuanzixun = new Object();
        selApp_quzhuanzixun.appname = "趣赚资讯";
        selApp_quzhuanzixun.tag = "quzhuanzixun";
        selApps.push(selApp_quzhuanzixun);
    }

    let quzhuan51 = ui.getViewValue(ui.quzhuan51);
    if (quzhuan51) {
        let selApp_quzhuan51 = new Object();
        selApp_quzhuan51.appname = "51趣赚";
        selApp_quzhuan51.tag = "quzhuan51";
        selApps.push(selApp_quzhuan51);
    }

    let miduquzhuan = ui.getViewValue(ui.miduquzhuan);
    if (miduquzhuan) {
        let selApp_miduquzhuan = new Object();
        selApp_miduquzhuan.appname = "米读趣赚";
        selApp_miduquzhuan.tag = "miduquzhuan";
        selApps.push(selApp_miduquzhuan);
    }

    let yangguangqukankan = ui.getViewValue(ui.yangguangqukankan);
    if (yangguangqukankan) {
        let selApp_yangguangqukankan = new Object();
        selApp_yangguangqukankan.appname = "阳光趣看看";
        selApp_yangguangqukankan.tag = "yangguangqukankan";
        selApps.push(selApp_yangguangqukankan);
    }
    let meiriqukankan = ui.getViewValue(ui.meiriqukankan);
    if (meiriqukankan) {
        let selApp_meiriqukankan = new Object();
        selApp_meiriqukankan.appname = "每日趣看看";
        selApp_meiriqukankan.tag = "meiriqukankan";
        selApps.push(selApp_meiriqukankan);
    }
    let shengxiaokankan = ui.getViewValue(ui.shengxiaokankan);
    if (shengxiaokankan) {
        let selApp_shengxiaokankan = new Object();
        selApp_shengxiaokankan.appname = "生肖看看";
        selApp_shengxiaokankan.tag = "shengxiaokankan";
        selApps.push(selApp_shengxiaokankan);
    }
    let shengxiaokankanjsb = ui.getViewValue(ui.shengxiaokankanjsb);
    if (shengxiaokankanjsb) {
        let selApp_shengxiaokankanjsb = new Object();
        selApp_shengxiaokankanjsb.appname = "生肖看看极速版";
        selApp_shengxiaokankanjsb.tag = "shengxiaokankanjsb";
        selApps.push(selApp_shengxiaokankanjsb);
    }


    let chuyu = ui.getViewValue(ui.chuyu);
    if (chuyu) {
        let selApp_chuyu = new Object();
        selApp_chuyu.appname = "雏鱼";
        selApp_chuyu.tag = "chuyu";
        selApps.push(selApp_chuyu);
    }
    let maotun = ui.getViewValue(ui.maotun);
    if (maotun) {
        let selApp_maotun = new Object();
        selApp_maotun.appname = "猫豚";
        selApp_maotun.tag = "maotun";
        selApps.push(selApp_maotun);
    }

    let lumaodsp = ui.getViewValue(ui.lumaodsp);
    if (lumaodsp) {
        let selApp_lumaodsp = new Object();
        selApp_lumaodsp.appname = "撸猫短视频";
        selApp_lumaodsp.tag = "lumaodsp";
        selApps.push(selApp_lumaodsp);
    }
    let xiquedsp = ui.getViewValue(ui.xiquedsp);
    if (xiquedsp) {
        let selApp_xiquedsp = new Object();
        selApp_xiquedsp.appname = "喜鹊短视频";
        selApp_xiquedsp.tag = "xiquedsp";
        selApps.push(selApp_xiquedsp);
    }
    let fanyudsp1 = ui.getViewValue(ui.fanyudsp1);
    if (fanyudsp1) {
        let selApp_fanyudsp1 = new Object();
        selApp_fanyudsp1.appname = "番鱼短视频1";
        selApp_fanyudsp1.tag = "fanyudsp1";
        selApps.push(selApp_fanyudsp1);
    }
    let fanyudsp2 = ui.getViewValue(ui.fanyudsp2);
    if (fanyudsp2) {
        let selApp_fanyudsp2 = new Object();
        selApp_fanyudsp2.appname = "番鱼短视频2";
        selApp_fanyudsp2.tag = "fanyudsp2";
        selApps.push(selApp_fanyudsp2);
    }

    let tihudsp1 = ui.getViewValue(ui.tihudsp1);
    if (tihudsp1) {
        let selApp_tihudsp1 = new Object();
        selApp_tihudsp1.appname = "鹈鹕短视频1";
        selApp_tihudsp1.tag = "tihudsp1";
        selApps.push(selApp_tihudsp1);
    }

    let tihudsp2 = ui.getViewValue(ui.tihudsp2);
    if (tihudsp2) {
        let selApp_tihudsp2 = new Object();
        selApp_tihudsp2.appname = "鹈鹕短视频2";
        selApp_tihudsp2.tag = "tihudsp2";
        selApps.push(selApp_tihudsp2);
    }

    let tihudsp3 = ui.getViewValue(ui.tihudsp3);
    if (tihudsp3) {
        let selApp_tihudsp3 = new Object();
        selApp_tihudsp3.appname = "鹈鹕短视频3";
        selApp_tihudsp3.tag = "tihudsp3";
        selApps.push(selApp_tihudsp3);
    }

    let jinjidsp1 = ui.getViewValue(ui.jinjidsp1);
    if (jinjidsp1) {
        let selApp_jinjidsp1 = new Object();
        selApp_jinjidsp1.appname = "金鸡短视频1";
        selApp_jinjidsp1.tag = "jinjidsp1";
        selApps.push(selApp_jinjidsp1);
    }

    let jinjidsp2 = ui.getViewValue(ui.jinjidsp2);
    if (jinjidsp2) {
        let selApp_jinjidsp2 = new Object();
        selApp_jinjidsp2.appname = "金鸡短视频2";
        selApp_jinjidsp2.tag = "jinjidsp2";
        selApps.push(selApp_jinjidsp2);
    }

    let chijijsb1 = ui.getViewValue(ui.chijijsb1);
    if (chijijsb1) {
        let selApp_chijijsb1 = new Object();
        selApp_chijijsb1.appname = "吃鸡极速版1";
        selApp_chijijsb1.tag = "chijijsb1";
        selApps.push(selApp_chijijsb1);
    }
    let chijijsb2 = ui.getViewValue(ui.chijijsb2);
    if (chijijsb2) {
        let selApp_chijijsb2 = new Object();
        selApp_chijijsb2.appname = "吃鸡极速版2";
        selApp_chijijsb2.tag = "chijijsb2";
        selApps.push(selApp_chijijsb2);
    }

    let tianjidsp = ui.getViewValue(ui.tianjidsp);
    if (tianjidsp) {
        let selApp_tianjidsp = new Object();
        selApp_tianjidsp.appname = "田鸡短视频";
        selApp_tianjidsp.tag = "tianjidsp";
        selApps.push(selApp_tianjidsp);
    }
    let fcssp = ui.getViewValue(ui.fcssp);
    if (fcssp) {
        let selApp_fcssp = new Object();
        selApp_fcssp.appname = "发财树视频";
        selApp_fcssp.tag = "fcssp";
        selApps.push(selApp_fcssp);
    }
    let tuzizq = ui.getViewValue(ui.tuzizq);
    if (tuzizq) {
        let selApp_tuzizq = new Object();
        selApp_tuzizq.appname = "兔子赚钱";
        selApp_tuzizq.tag = "tuzizq";
        selApps.push(selApp_tuzizq);
    }
    let weikandian = ui.getViewValue(ui.weikandian);
    if (weikandian) {
        let selApp_weikandian = new Object();
        selApp_weikandian.appname = "微看点";
        selApp_weikandian.tag = "weikandian";
        selApps.push(selApp_weikandian);
    }
    let jukandian = ui.getViewValue(ui.jukandian);
    if (jukandian) {
        let selApp_jukandian = new Object();
        selApp_jukandian.appname = "聚看点";
        selApp_jukandian.tag = "jukandian";
        selApps.push(selApp_jukandian);
    }

    let zailaidsp = ui.getViewValue(ui.zailaidsp);
    if (zailaidsp) {
        let selApp_zailaidsp = new Object();
        selApp_zailaidsp.appname = "再来短视频";
        selApp_zailaidsp.tag = "zailaidsp";
        selApps.push(selApp_zailaidsp);
    }
    let zailaijsb = ui.getViewValue(ui.zailaijsb);
    if (zailaijsb) {
        let selApp_zailaijsb = new Object();
        selApp_zailaijsb.appname = "再来极速版";
        selApp_zailaijsb.tag = "zailaijsb";
        selApps.push(selApp_zailaijsb);
    }
    let changyuandsp = ui.getViewValue(ui.changyuandsp);
    if (changyuandsp) {
        let selApp_changyuandsp = new Object();
        selApp_changyuandsp.appname = "长猿短视频";
        selApp_changyuandsp.tag = "changyuandsp";
        selApps.push(selApp_changyuandsp);
    }
    let beihoudsp = ui.getViewValue(ui.beihoudsp);
    if (beihoudsp) {
        let selApp_beihoudsp = new Object();
        selApp_beihoudsp.appname = "北猴短视频";
        selApp_beihoudsp.tag = "beihoudsp";
        selApps.push(selApp_beihoudsp);
    }
    let yueshua = ui.getViewValue(ui.yueshua);
    if (yueshua) {
        let selApp_yueshua = new Object();
        selApp_yueshua.appname = "悦刷";
        selApp_yueshua.tag = "yueshua";
        selApps.push(selApp_yueshua);
    }
    let fengludsp = ui.getViewValue(ui.fengludsp);
    if (fengludsp) {
        let selApp_fengludsp = new Object();
        selApp_fengludsp.appname = "风鹭短视频";
        selApp_fengludsp.tag = "fengludsp";
        selApps.push(selApp_fengludsp);
    }

    let hualidsp = ui.getViewValue(ui.hualidsp);
    if (hualidsp) {
        let selApp_hualidsp = new Object();
        selApp_hualidsp.appname = "花梨短视频";
        selApp_hualidsp.tag = "hualidsp";
        selApps.push(selApp_hualidsp);
    }
    let yafengdsp = ui.getViewValue(ui.yafengdsp);
    if (yafengdsp) {
        let selApp_yafengdsp = new Object();
        selApp_yafengdsp.appname = "鸦风短视频";
        selApp_yafengdsp.tag = "yafengdsp";
        selApps.push(selApp_yafengdsp);
    }

    let chatundsp = ui.getViewValue(ui.chatundsp);
    if (chatundsp) {
        let selApp_chatundsp = new Object();
        selApp_chatundsp.appname = "茶豚短视频";
        selApp_chatundsp.tag = "chatundsp";
        selApps.push(selApp_chatundsp);
    }

    let qianyoudsp = ui.getViewValue(ui.qianyoudsp);
    if (qianyoudsp) {
        let selApp_qianyoudsp = new Object();
        selApp_qianyoudsp.appname = "千柚短视频";
        selApp_qianyoudsp.tag = "qianyoudsp";
        selApps.push(selApp_qianyoudsp);
    }

    let menghudsp = ui.getViewValue(ui.menghudsp);
    if (menghudsp) {
        let selApp_menghudsp = new Object();
        selApp_menghudsp.appname = "萌虎短视频";
        selApp_menghudsp.tag = "menghudsp";
        selApps.push(selApp_menghudsp);
    }

    let yuetudsp = ui.getViewValue(ui.yuetudsp);
    if (yuetudsp) {
        let selApp_yuetudsp = new Object();
        selApp_yuetudsp.appname = "月兔短视频";
        selApp_yuetudsp.tag = "yuetudsp";
        selApps.push(selApp_yuetudsp);
    }

    let tanlidsp = ui.getViewValue(ui.tanlidsp);
    if (tanlidsp) {
        let selApp_tanlidsp = new Object();
        selApp_tanlidsp.appname = "弹梨短视频";
        selApp_tanlidsp.tag = "tanlidsp";
        selApps.push(selApp_tanlidsp);
    }

    let huobaodsp = ui.getViewValue(ui.huobaodsp);
    if (huobaodsp) {
        let selApp_huobaodsp = new Object();
        selApp_huobaodsp.appname = "火爆短视频";
        selApp_huobaodsp.tag = "huobaodsp";
        selApps.push(selApp_huobaodsp);
    }

    let humaodsp = ui.getViewValue(ui.humaodsp);
    if (humaodsp) {
        let selApp_humaodsp = new Object();
        selApp_humaodsp.appname = "虎猫短视频";
        selApp_humaodsp.tag = "humaodsp";
        selApps.push(selApp_humaodsp);
    }

    let wandoudsp = ui.getViewValue(ui.wandoudsp);
    if (wandoudsp) {
        let selApp_wandoudsp = new Object();
        selApp_wandoudsp.appname = "弯豆短视频";
        selApp_wandoudsp.tag = "wandoudsp";
        selApps.push(selApp_wandoudsp);
    }

    let lechadsp = ui.getViewValue(ui.lechadsp);
    if (lechadsp) {
        let selApp_lechadsp = new Object();
        selApp_lechadsp.appname = "乐茶";
        selApp_lechadsp.tag = "lechadsp";
        selApps.push(selApp_lechadsp);
    }

    let xinlongdsp = ui.getViewValue(ui.xinlongdsp);
    if (xinlongdsp) {
        let selApp_xinlongdsp = new Object();
        selApp_xinlongdsp.appname = "欣隆";
        selApp_xinlongdsp.tag = "xinlongdsp";
        selApps.push(selApp_xinlongdsp);
    }

    let wanzhuandsp = ui.getViewValue(ui.wanzhuandsp);
    if (wanzhuandsp) {
        let selApp_wanzhuandsp = new Object();
        selApp_wanzhuandsp.appname = "玩赚";
        selApp_wanzhuandsp.tag = "wanzhuandsp";
        selApps.push(selApp_wanzhuandsp);
    }

    let qinzhuandsp = ui.getViewValue(ui.qinzhuandsp);
    if (qinzhuandsp) {
        let selApp_qinzhuandsp = new Object();
        selApp_qinzhuandsp.appname = "勤赚";
        selApp_qinzhuandsp.tag = "qinzhuandsp";
        selApps.push(selApp_qinzhuandsp);
    }

    let kandiandsp = ui.getViewValue(ui.kandiandsp);
    if (kandiandsp) {
        let selApp_kandiandsp = new Object();
        selApp_kandiandsp.appname = "看点";
        selApp_kandiandsp.tag = "kandiandsp";
        selApps.push(selApp_kandiandsp);
    }

    let shanyadsp = ui.getViewValue(ui.shanyadsp);
    if (shanyadsp) {
        let selApp_shanyadsp = new Object();
        selApp_shanyadsp.appname = "闪鸭短视频";
        selApp_shanyadsp.tag = "shanyadsp";
        selApps.push(selApp_shanyadsp);
    }

    let shabaodsp = ui.getViewValue(ui.shabaodsp);
    if (shabaodsp) {
        let selApp_shabaodsp = new Object();
        selApp_shabaodsp.appname = "鲨宝短视频";
        selApp_shabaodsp.tag = "shabaodsp";
        selApps.push(selApp_shabaodsp);
    }

    let tongbao = ui.getViewValue(ui.tongbao);
    if (tongbao) {
        let selApp_tongbao = new Object();
        selApp_tongbao.appname = "通宝";
        selApp_tongbao.tag = "tongbao";
        selApps.push(selApp_tongbao);
    }

    let hengyou = ui.getViewValue(ui.hengyou);
    if (hengyou) {
        let selApp_hengyou = new Object();
        selApp_hengyou.appname = "亨优";
        selApp_hengyou.tag = "hengyou";
        selApps.push(selApp_hengyou);
    }
    let tanli = ui.getViewValue(ui.tanli);
    if (tanli) {
        let selApp_tanli = new Object();
        selApp_tanli.appname = "弹梨";
        selApp_tanli.tag = "tanli";
        selApps.push(selApp_tanli);
    }

    let huocan = ui.getViewValue(ui.huocan);
    if (huocan) {
        let selApp_huocan = new Object();
        selApp_huocan.appname = "火参";
        selApp_huocan.tag = "huocan";
        selApps.push(selApp_huocan);
    }

    //********************************************
    logd("刷金APP_存储中...");
    if (selApps.length < 1) {
        ui.saveAllConfig();
        刷金APP_未选 = true;
        // toast1("请选择app");
        return;
    }else{
        刷金APP_未选 = false;
    }
    // 单独完整保存();
    补充保存剩余值();
    /*说明:这里用[单独完整保存][补充保存剩余值]都可以.目的用途不同吧;
    [补充保存剩余值]是只保存勾选的参数;
    [单独完整保存]是保存所有参数;
    * */
    ui.saveConfig("selApps", JSON.stringify(selApps));
    ui.saveAllConfig();

    function 补充保存剩余值() { //
        logd("11");
        for (let i = 0; i < selApps.length; i++) {
            for (let j = 0; j <List_App_All.length ; j++) {
                if (selApps[i].appname == List_App_All[j].name){
                    //logd("补充保存一下"+selApps[i].appname +"的时间");
                    let time值 = ui.getViewValue(List_App_All[j].time);
                    selApps[i].time = time值 || 30;
                    //下面再把包名加进去;
                    selApps[i].pkg = List_App_All[j].pkg;//没什么问题
                }
            }
        }
    }
}

function yj_saveSelApps() {
    //yj_开始计时;计数++;
    // 启动监听 = 启动监听 || true;
    yj_开始计时 = true;
    yj_计时_t++;
    //********************************************
    let selApps = [];
    let add;

    let douyin = ui.getViewValue(ui.douyin);
    if (douyin) {
        let selApp_douyin = new Object();
        selApp_douyin.appname = "抖音";
        selApp_douyin.tag = "douyin";
        selApps.push(selApp_douyin);
    }
    let douyinjsb = ui.getViewValue(ui.douyinjsb);
    if (douyinjsb) {
        let selApp_douyinjsb = new Object();
        selApp_douyinjsb.appname = "抖音极速版";
        selApp_douyinjsb.tag = "douyinjsb";
        selApps.push(selApp_douyinjsb);
    }
    let kuaishou = ui.getViewValue(ui.kuaishou);
    if (kuaishou) {
        let selApp_kuaishou = new Object();
        selApp_kuaishou.appname = "快手";
        selApp_kuaishou.tag = "kuaishou";
        selApps.push(selApp_kuaishou);
    }
    let kuaishoujsb = ui.getViewValue(ui.kuaishoujsb);
    if (kuaishoujsb) {
        let selApp_kuaishoujsb = new Object();
        selApp_kuaishoujsb.appname = "快手极速版";
        selApp_kuaishoujsb.tag = "kuaishoujsb";
        selApps.push(selApp_kuaishoujsb);
    }
    let jrtt = ui.getViewValue(ui.jrtt);
    if (jrtt) {
        let selApp_jrtt = new Object();
        selApp_jrtt.appname = "今日头条";
        selApp_jrtt.tag = "jrtt";
        selApps.push(selApp_jrtt);
    }
    let jrttjsb = ui.getViewValue(ui.jrttjsb);
    if (jrttjsb) {
        let selApp_jrttjsb = new Object();
        selApp_jrttjsb.appname = "今日头条极速版";
        selApp_jrttjsb.tag = "jrttjsb";
        selApps.push(selApp_jrttjsb);
    }
    let bdjsb = ui.getViewValue(ui.bdjsb);
    if (bdjsb) {
        let selApp_bdjsb = new Object();
        selApp_bdjsb.appname = "百度极速版";
        selApp_bdjsb.tag = "bdjsb";
        selApps.push(selApp_bdjsb);
    }
    let qqllq = ui.getViewValue(ui.qqllq);
    if (qqllq) {
        let selApp_qqllq = new Object();
        selApp_qqllq.appname = "QQ浏览器";
        selApp_qqllq.tag = "qqllq";
        selApps.push(selApp_qqllq);
    }
//----------------------------
    let llq = ui.getViewValue(ui.llq);
    if (llq) {
        let selApp_llq = new Object();
        selApp_llq.appname = "浏览器";
        selApp_llq.tag = "llq";
        selApps.push(selApp_llq);
    }
    let dcd = ui.getViewValue(ui.dcd);
    if (dcd) {
        let selApp_dcd = new Object();
        selApp_dcd.appname = "懂车帝";
        selApp_dcd.tag = "dcd";
        selApps.push(selApp_dcd);
    }
    let yiche = ui.getViewValue(ui.yiche);
    if (yiche) {
        let selApp_yiche = new Object();
        selApp_yiche.appname = "易车";
        selApp_yiche.tag = "yiche";
        selApps.push(selApp_yiche);
    }
    let qczj = ui.getViewValue(ui.qczj);
    if (qczj) {
        let selApp_qczj = new Object();
        selApp_qczj.appname = "汽车之家";
        selApp_qczj.tag = "qczj";
        selApps.push(selApp_qczj);
    }
    let pdd = ui.getViewValue(ui.pdd);
    if (pdd) {
        let selApp_pdd = new Object();
        selApp_pdd.appname = "拼多多";
        selApp_pdd.tag = "pdd";
        selApps.push(selApp_pdd);
    }
    let jingdong = ui.getViewValue(ui.jingdong);
    if (jingdong) {
        let selApp_jingdong = new Object();
        selApp_jingdong.appname = "京东";
        selApp_jingdong.tag = "jingdong";
        selApps.push(selApp_jingdong);
    }
    let taobao = ui.getViewValue(ui.taobao);
    if (taobao) {
        let selApp_taobao = new Object();
        selApp_taobao.appname = "淘宝";
        selApp_taobao.tag = "taobao";
        selApps.push(selApp_taobao);
    }
    let tianmao = ui.getViewValue(ui.tianmao);
    if (tianmao) {
        let selApp_tianmao = new Object();
        selApp_tianmao.appname = "天猫";
        selApp_tianmao.tag = "tianmao";
        selApps.push(selApp_tianmao);
    }

    //********************************************
    logd("养机APP_存储中...");
    if (selApps.length < 1) {
        ui.saveAllConfig();
        养机APP_未选 = true;
        // toast1("请选择养机app");
        return;
    }else{
        养机APP_未选 = false;
    }
    // 单独完整保存();
    补充保存剩余值();
    /*说明:这里用[单独完整保存][补充保存剩余值]都可以.目的用途不同吧;
    [补充保存剩余值]是只保存勾选的参数;
    [单独完整保存]是保存所有参数;
    * */
    ui.saveConfig("yj_selApps", JSON.stringify(selApps)); //这个地方注意;
    ui.saveAllConfig();

    function 补充保存剩余值() { //
        logd("11")
        for (let i = 0; i < selApps.length; i++) {
            for (let j = 0; j <List_yangji_All.length ; j++) {
                if (selApps[i].appname == List_yangji_All[j].name){
                    //logd("补充保存一下"+selApps[i].appname +"的时间");
                    let time值 = ui.getViewValue(List_yangji_All[j].time);
                    selApps[i].time = time值 || 30;
                    //下面再把包名加进去;
                    selApps[i].pkg = List_yangji_All[j].pkg;//没什么问题
                }
            }
        }
    }
}

//下面3个函数,本身自带了刷新功能
function 刷金_全选过滤() {
    已安装_已勾选 = [];
    for (let i = 0; i <List_App_All.length ; i++) {
        for (let j = 0; j < 已安装应用列表数据[0].length; j++) {
            if (List_App_All[i].pkg == 已安装应用列表数据[0][j]){ //这个地方,不能用"==="!!
                //logd(List_App_All[i].tag);
                let fuxuankang = List_App_All[i].tag;
                fuxuankang.setChecked(true);
                已安装_已勾选.push(List_App_All[i])
            }
        }
    }
    已勾选已安装_更新时长描述();
    ui.saveAllConfig();
}

function 刷金_反选过滤() {
    已安装_已勾选 = [];
    for (let i = 0; i <List_App_All.length ; i++) {
        for (let j = 0; j < 已安装应用列表数据[0].length; j++) {
            if (List_App_All[i].pkg == 已安装应用列表数据[0][j]){ //这个地方,不能用"==="!!
                //logd(List_App_All[i].tag);
                let fuxuankang = List_App_All[i].tag;
                if (ui.getViewValue(fuxuankang)) {
                    fuxuankang.setChecked(false);
                } else {
                    fuxuankang.setChecked(true);
                    已安装_已勾选.push(List_App_All[i]);
                }
            }
        }
    }
    已勾选已安装_更新时长描述();
    ui.saveAllConfig();
}

function 刷金_全否过滤() {
    已安装_已勾选 = [];
    for (let i = 0; i < List_App_tag.length; i++) {
        let fuxuankang = List_App_tag[i];
        fuxuankang.setChecked(false);
    }
    已勾选已安装_更新时长描述();
    ui.saveAllConfig();
}

//下面这个,还没有过滤"已安装"
function 刷金_一键设置总时长() {
    /*这个地方,特意未过滤"已安装",即:未安装的,也可以在这里设置,这里留这么一个位置,对未安装的复选框进行批量操作;
    * */
    let fenzhong = ui.getViewValue(ui.Sj_Edt_一键总时长);
    logd("获取时间:" + fenzhong);
    for (let i = 0; i < List_App_tag.length; i++) {
        let fuxuankang = List_App_tag[i];
        if (ui.getViewValue(fuxuankang)) {
            let shijian = List_App_time[i];
            ui.setViewValue(shijian, fenzhong); //这里面,[shijian]是变量,是包含[ui.]的!
        }
    }
    已勾选已安装_更新时长描述();
    ui.saveAllConfig();
}

//多线程监听,主要是针对,单独点击某个复选框,时候的数据刷新;
function 刷新_已勾选已安装_APP数量() {
    /*这个其实就是[刷金_全选过滤]*/
    已安装_已勾选 = [];
    for (let i = 0; i <List_App_All.length ; i++) {
        for (let j = 0; j < 已安装应用列表数据[0].length; j++) {
            if (List_App_All[i].pkg == 已安装应用列表数据[0][j]){ //这个地方,不能用"==="!!
                if (ui.getViewValue(List_App_All[i].tag)){
                    已安装_已勾选.push(List_App_All[i])
                }
            }
        }
    }
    已勾选已安装_更新时长描述();
    ui.saveAllConfig();
}

function 已勾选已安装_更新时长描述() {
    /*注意这里面的写法和数据格式*/
    let 时长 = 0;
    let sum = 已安装_已勾选.length;
    let t = 0;
    for (let i = 0; i < 已安装_已勾选.length; i++) {
        //logd(已安装_已勾选[i].name);
        if (!ui.getViewValue(已安装_已勾选[1].time)){
            //logd("t为默认值");
            t = 30;
        }else{
            t = Number(ui.getViewValue(已安装_已勾选[1].time));
        }
        时长 = 时长 + t;
    }
    /*各数据类型:
    // let a = ui.getViewValue(已安装_已勾选[1].tag);
    // let b = 已安装_已勾选[1].name;
    // let c = 已安装_已勾选[1].pkg;
    // let t = ui.getViewValue(已安装_已勾选[1].time);
    默认时,time值:
    if (!t){
        logd("false");
    }
    if (t === ""){
        logd("空");
    }
    * */
    // // logd(JSON.stringify(已安装_已勾选[0].time));
    // var gouxuan_s = ui.getViewValue(ui.Sj_Sum_勾选APP数量描述);
    // // var gouxuan_t = ui.getViewValue(ui.huizong_t);
    // var gouxuan_d = ui.getViewValue(ui.Sj_Txt_勾选APP耗时描述);
    // //logd("原值: " + gouxuan_s);
    let 描述;
    ui.Sj_Sum_勾选APP数量描述.setText(" " + sum + " ");
    描述 = 时间转换描述_分钟(时长);
    ui.Sj_Txt_勾选APP耗时描述.setText(" "+ 描述+ " ");
    logd("[刷金APP]已勾选"+sum+"个,耗时 "+描述);
}

//下面3个函数,本身自带了刷新功能
function 养机_全选设置() {
    已安装_已勾选_养机 = [];
    for (let i = 0; i <List_yangji_All.length ; i++) {
        for (let j = 0; j < 已安装应用列表数据[0].length; j++) {
            if (List_yangji_All[i].pkg == 已安装应用列表数据[0][j]){ //这个地方,不能用"==="!!
                //logd(List_yangji_All[i].tag);
                let fuxuankang = List_yangji_All[i].tag;
                fuxuankang.setChecked(true);
                已安装_已勾选_养机.push(List_yangji_All[i])
            }
        }
    }
    已勾选已安装_更新时长描述_养机();
    ui.saveAllConfig();
}

function 养机_反选设置() {
    已安装_已勾选_养机 = [];
    for (let i = 0; i <List_yangji_All.length ; i++) {
        for (let j = 0; j < 已安装应用列表数据[0].length; j++) {
            if (List_yangji_All[i].pkg == 已安装应用列表数据[0][j]){ //这个地方,不能用"==="!!
                //logd(List_App_All[i].tag);
                let fuxuankang = List_yangji_All[i].tag;
                if (ui.getViewValue(fuxuankang)) {
                    fuxuankang.setChecked(false);
                } else {
                    fuxuankang.setChecked(true);
                    已安装_已勾选_养机.push(List_yangji_All[i])
                }
            }
        }
    }
    已勾选已安装_更新时长描述_养机();
    ui.saveAllConfig();
}

function 养机_全否设置() {
    已安装_已勾选_养机 = [];
    for (let i = 0; i < List_yangji_tag.length; i++) {
        let fuxuankang = List_yangji_tag[i];
        fuxuankang.setChecked(false);
    }
    已勾选已安装_更新时长描述_养机();
    ui.saveAllConfig();
}

//下面这个,还没有过滤"已安装"
function 养机_一键设置总时长() {
    let fenzhong = ui.getViewValue(ui.Yj_Edt_一键总时长);
    logd("获取时间:" + fenzhong);
    for (let i = 0; i < List_yangji_tag.length; i++) {
        let fuxuankang = List_yangji_tag[i];
        if (ui.getViewValue(fuxuankang)) {
            let shijian = List_yangji_time[i];
            ui.setViewValue(shijian, fenzhong); //这里面,[shijian]是变量,是包含[ui.]的!
        }
    }
    已勾选已安装_更新时长描述_养机();
    ui.saveAllConfig();
}

//多线程监听,主要是针对,单独点击某个复选框,时候的数据刷新;
function 刷新_已勾选已安装_APP数量_养机() {
    /*这个其实就是[刷金_全选过滤]    * */
    已安装_已勾选_养机 = [];
    for (let i = 0; i <List_yangji_All.length ; i++) {
        for (let j = 0; j < 已安装应用列表数据[0].length; j++) {
            if (List_yangji_All[i].pkg == 已安装应用列表数据[0][j]){ //这个地方,不能用"==="!!
                if (ui.getViewValue(List_yangji_All[i].tag)){
                    已安装_已勾选_养机.push(List_yangji_All[i])
                }
            }
        }
    }
    已勾选已安装_更新时长描述_养机();
    ui.saveAllConfig();
}

function 已勾选已安装_更新时长描述_养机() {
    /*注意这里面的写法和数据格式*/
    let 时长 = 0;
    let sum = 已安装_已勾选_养机.length;
    let t = 0;
    for (let i = 0; i < 已安装_已勾选_养机.length; i++) {
        //logd(已安装_已勾选[i].name);
        if (!ui.getViewValue(已安装_已勾选_养机[i].time)){
            t = 30;
        }else{
            t = Number(ui.getViewValue(已安装_已勾选_养机[i].time));
        }
        时长 = 时长 + t;
        //logd(时长)
    }

    let 描述;
    ui.Yj_Sum_勾选APP数量描述.setText(" " + sum + " ");
    描述 = 时间转换描述_分钟(时长);
    ui.Yj_Txt_勾选APP耗时描述.setText(" "+ 描述+ " "); //这种描述类的,默认值是2个空格:"  "
    logd("[养机APP]已勾选"+sum+"个,耗时 "+描述);
}

function yj_xuan_nv1(真) {
    for (let i = 0; i < yj_bq_nv1_arr.length; i++) {
        let fuxuankang = yj_bq_nv1_arr[i];
        if (真) {
            fuxuankang.setChecked(true);
        } else {
            fuxuankang.setChecked(false);
        }
    }
    ui.saveAllConfig();
    logd("[女1]保存了111")
}

function yj_xuan_nv2(真) {
    for (let i = 0; i < yj_bq_nv2_arr.length; i++) {
        let fuxuankang = yj_bq_nv2_arr[i];
        if (真) {
            fuxuankang.setChecked(true);
        } else {
            fuxuankang.setChecked(false);
        }
    }
    ui.saveAllConfig();
    logd("[女2]保存了111")
}

function yj_xuan_nan1(真) {
    for (let i = 0; i < yj_bq_nan1_arr.length; i++) {
        let fuxuankang = yj_bq_nan1_arr[i];
        if (真) {
            fuxuankang.setChecked(true);
        } else {
            fuxuankang.setChecked(false);
        }
    }
    ui.saveAllConfig();
    logd("[男1]保存了111")
}

function yj_xuan_nan2(真) {
    for (let i = 0; i < yj_bq_nan2_arr.length; i++) {
        let fuxuankang = yj_bq_nan2_arr[i];
        if (真) {
            fuxuankang.setChecked(true);
        } else {
            fuxuankang.setChecked(false);
        }
    }
    ui.saveAllConfig();
    logd("[男2]保存了111")
}

function 刷金_金币值设置() {
    /*其实这个应该没啥用,就是数据转换用的*/
    let ljjb = ui.getViewValue(ui.Yj_边刷边养_Edt_阈值);
    ljjb = ljjb?ljjb:110;
    if (ljjb == 110){
        ui.setViewValue(ui.Yj_边刷边养_Edt_阈值, "110");//注意这个110数据类型;直接设置成110的话,输入框会出现小数点110.0;
    }
    ui.saveAllConfig();
    logd("[金币值]设置为"+ljjb);
}

function 刷金_金币值设置_阅读() {
    let ljjb = ui.getViewValue(ui.Yj_边刷边养_Edt_阈值_阅读);
    ljjb = ljjb?ljjb:50;
    if (ljjb == 50){
        ui.setViewValue(ui.Yj_边刷边养_Edt_阈值_阅读, "50");//注意这个110数据类型;直接设置成110的话,输入框会出现小数点110.0;
    }
    ui.saveAllConfig();
    logd("[阅读金币值]设置为"+ljjb);
}

/**
 * 获取三方AP跑包名 应用名
 * @return {*[][]}
 */

function getAppPkg() {
    // importPackage(android.content);
    // importPackage(android.content.pm);
    let pm = context.getPackageManager();
    let mPacks = pm.getInstalledPackages(0);
    let pak
    let appPkgArr = [];
    let appNameArr = [];
    for (let i = 0; i < mPacks.length; i++) {
        //logd(mPacks[i]);
        pak = mPacks.get(i);
        //判断是否为系统预装的应用

        if ((pak.applicationInfo.flags & pak.applicationInfo.FLAG_SYSTEM) <= 0) {
            // 第三方应用 包名
            appPkgArr.push(pak.packageName);
            //logd(pak.packageName); //APP包名
            // 第三方应用APP名
            try {
                let info = pm.getPackageInfo(pak.packageName, PackageManager.GET_ACTIVITIES);
                let appName = info.applicationInfo.loadLabel(pm);
                //logd(appName); //APP名称
                appNameArr.push(appName);
            } catch (e) {
                loge(e);
            }
        }else{

        }
    }

    return [appPkgArr, appNameArr];
}

function 时间转换描述_分钟(value){

    var time=[];
    var day =parseInt(value/60/24);
    var hour=parseInt(value/60%24);
    var min=parseInt(value%60);
    time[0]=day>0?day:0;
    time[1]=hour>0?hour:0;
    time[2]=min>0?parseFloat(min):0;
    let 描述 = "";
    if (time[0]>0){
        描述 = time[0] + "天"
    }
    if (time[1]>0){
        描述 = 描述 + time[1] + "小时"
    }
    if (time[2]>0){
        描述 = 描述 + time[2] + "分钟"
    }
    return 描述;
}

function 心跳控制_毫秒(序号,间隔毫秒) {
    switch (序号) {
        case 1:
            Timer_end91 = time();
            try {
                if (!TimeSign_start91) {
                    //return false;
                }
                if (Math.floor(Timer_end91 - TimeSign_start91) >= 间隔毫秒) {
                    return true;
                }
            } catch (err) {
                logd("初始化时间");
                TimeSign_start91 = time();
                return false;
            }
            break;
        case 2:
            Timer_end92 = time();
            try {
                if (!TimeSign_start92) {
                    //return false;
                }
                if (Math.floor(Timer_end92 - TimeSign_start92) >= 间隔毫秒) {
                    return true;
                }
            } catch (err) {
                logd("[养机]初始化时间");
                TimeSign_start92 = time();
                return false;
            }
            break;
        default:
            logi("[心跳控制_毫秒]错误");

    }
}

//----------------------------------------------------------------

function 标签编辑_弹窗(fileName) {
    let save = false;
    let reset = false;
    let dialog = ui.parseView("fuChuang_jingzhun.xml");
    let Edit_tagWord, Edit_Modifier;
    let E_direction;
    let sel = "";
    ui.customDialog({
            "fullScreen": false,
            "cancelable": false
        },
        dialog,
        function (dialog, v) {
            //这里面可以拿到视图对象，然后进行设置各种事件
            let titleDialog = v.findViewWithTag("jzbq_bjk_title");
            let saveConfiguration = v.findViewWithTag("saveConfiguration");
            let unconfigure = v.findViewWithTag("unconfigure");
            let resetconfigure = v.findViewWithTag("resetconfigure");

            Edit_tagWord = v.findViewWithTag("Edit_tagWord");
            //下面这个是下拉框的部分
            Edit_Modifier = v.findViewWithTag("Edit_Modifier");
            E_direction = v.findViewWithTag("E_direction");

            ui.setEvent(E_direction, "itemSelected", function (position, value) {
                logd("E_direction 选择为: " + value + " : " + position);
                sel = value;
                ui.saveAllConfig();// 这个注销
            });

            titleDialog.setText(fileName);//对话框标题
            Edit_Modifier.setText(readConfiguration(fileName,"Edit_Modifier","") + "");//readConfiguration(fileName, "Edit_Modifier", "") + "");//前缀|后缀
            Edit_tagWord.setText(readConfiguration(fileName, "Edit_tagWord", "") + "");//打开对话框后设置之前保存得值

            // 复选框 监听事件 自动保存

            saveConfiguration.setOnClickListener(function (view) {
                save = true;
                dialog.doDismiss();
                dialog = null; // 释放对话框对象
            });
            unconfigure.setOnClickListener(function (v) {
                dialog.doDismiss();
                dialog = null; // 释放对话框对象
            });
            resetconfigure.setOnClickListener(function (view) {
                reset = true;
                Edit_tagWord.setText(""); // 清空Edit_tagWord文本
            })
        }, function () {
            ui.saveAllConfig();
            if (save) {
                logd("[标签编辑_弹窗]保存");
                readConfiguration(fileName, "Edit_tagWord", Edit_tagWord.getText(), true);
                readConfiguration(fileName, "Edit_Modifier", Edit_Modifier.getText(), true);
                readConfiguration(fileName, "E_direction", sel, true);
                // 读取Storage所有key名和值("化妆品");
            } else {
                logd("[标签编辑_弹窗]不保存")
            }
            if (reset) {
                logd("[标签编辑_弹窗]重置");
                readConfiguration(fileName, "Edit_tagWord", "", true);
                Edit_tagWord.setText("");
            }
            dialog = null;
        })
}

function 智能模式_弹窗(newObjectS) {

    let dialog = ui.parseView("fuChuang_zhineng.xml");
    let lyAdd = dialog.findViewWithTag("lyAdd");

    let 检索表 = {};
    let newObjectS1 = {};
    let newObjectS2 = {};
    for (let key in newObjectS) { //先区分[已勾选][未勾选]
        if (key !== "自定义"){
            if (newObjectS[key]){
                newObjectS1[key] = newObjectS[key];
            }else{
                newObjectS2[key] = newObjectS[key];
            }
        }else{
            logd("自定义值,不收录进智能模式:"+newObjectS[key]);
        }
    }
    logi("已勾选的:"+JSON.stringify(newObjectS1));
    logi("未勾选的:"+JSON.stringify(newObjectS2));
    for (let key in newObjectS1) {  //已勾选 存入数据;

        let item = ui.parseView("fuChuang_zhineng_1.xml");
        // 在tag 为lyAdd的 视图添加解析的布局view对象
        lyAdd.addView(item);
        // 通过转化的item 对象获取 xml定义的 tag 对应的view对象
        let item_title = item.findViewWithTag("znbq_bjk_title");
        let item_content = item.findViewWithTag("znbq_bjk_content");
        检索表[key] = item_content;

        item_title.setText(key);
        let fileName = key;
        let defaultValue = "";
        let content = readConfiguration(fileName, key, defaultValue);

        logd("fileName: " + fileName + " key: "+ key +" 值: " + content);

        item_content.setText(content);
    }
    //[已勾选][未勾选]都要存储,仅仅是显示时的位置不同,字体颜色不同
    for (let key in newObjectS2) {

        let item = ui.parseView("fuChuang_zhineng_1.xml");
        // 在tag 为lyAdd的 视图添加解析的布局view对象
        lyAdd.addView(item);
        // 通过转化的item 对象获取 xml定义的 tag 对应的view对象
        let item_title = item.findViewWithTag("znbq_bjk_title");
        let item_content = item.findViewWithTag("znbq_bjk_content");
        检索表[key] = item_content;

        item_title.setText(key);
        item_title.setTextColor(Color.parseColor("#444341"));

        let fileName = key;
        let defaultValue = "";
        let content = readConfiguration(fileName, key, defaultValue);

        logd("fileName: " + fileName + " key: "+ key +" 值: " + content);

        item_content.setText(content);
    }

    let save = false;

    ui.customDialog({
            "fullScreen": false,
            "cancelable": false
        },
        dialog,
        function (dialog, v) {
            //这里面可以拿到视图对象，然后进行设置各种事件
            logd("111");

            let edtokBtn = v.findViewWithTag("edtokBtn");
            let edtcloseBtn = v.findViewWithTag("edtcloseBtn");

            //Edit_tagWord.setText(readConfiguration("智能模式_标签", "znbq_bjk", 数值) + "");//打开对话框后设置之前保存得值

            edtokBtn.setOnClickListener(function (view) {
                save = true;
                dialog.doDismiss();
                dialog = null;
            });
            edtcloseBtn.setOnClickListener(function (v) {
                dialog.doDismiss();
                dialog = null;
            });

        }, function () {

            if (save) {
                logd("[智能模式_弹窗]保存");
                for (let key in newObjectS) {

                    let fileName = key;
                    let content = 检索表[key].getText(); //这里我把握不准,重点是这里,确保不能A的数据存到B文件中去;
                    //关键是上面这行,如何确保,getText()获取的是"这个"控件的文本,而不是"别的"控件的文本;
                    logd(key + " : " + content);
                    let jieguo = readConfiguration(fileName, key, content, true);

                    logd("fileName: " + fileName + " key: "+ key +" 值: " + jieguo);

                    let jieguo11 = readConfiguration(fileName, key, "仍为空") + "";
                    logd(jieguo11);
                }
                logd("---- [智能模式_弹窗]存储完毕 ----");
                //下面是保存完后,再读一遍;
                for (let key in newObjectS) {

                    let fileName = key;
                    let defaultValue = "";
                    let content = readConfiguration(fileName, key, defaultValue);
                    logd(key + " : " + content);
                }

            } else {
                logd("不保存")
            }
            dialog = null;
        })

}

function 最终标签预览_弹窗(汇总数据) {
    // 汇总数据格式:{"化妆品":["化妆品 旗舰店 直播 下载","兰蔻 形象店","雅诗兰黛 形象店"],"美容":["美容 旗舰店 直播 下载"],"瘦身":["瘦身 旗舰店 直播 下载"]}

    let dia = ui.parseView("fuChuang_zuizhong.xml");
    let Edittextview;

    let content = "";
    logd(JSON.stringify(汇总数据));

    for (let key in 汇总数据) {
        if (key !== "说明") {
            content = content + "            [" + key + "]标签:\n";
            let 数组 = 汇总数据[key];
            for (let i = 0; i < 数组.length; i++) {
                content = content + 数组[i] + "\n";
            }
        }
    }
    let resume = 汇总数据["说明"];
    logd(resume);

    ui.customDialog({
            "fullScreen": false,
            "cancelable": false
        },
        dia,
        function (dialog, view) {
            // 这里面可以拿到视图对象，然后进行设置各种事件

            let saveConfiguration = view.findViewWithTag("fOk1");

            let txtResume = view.findViewWithTag("final_resume");
            txtResume.setText(resume);

            Edittextview = view.findViewWithTag("final_content");
            Edittextview.setText(content); // 打开对话框后设置之前保存得值

            // 复选框监听事件自动保存

            saveConfiguration.setOnClickListener(function (v) {
                dialog.doDismiss();
                dialog = null; // 释放对话框对象
            });

        }, function () {
            dia = null; // 释放对话框对象
        });
}

function 汇总当前标签数据并存储(BqSelectObjectS){

    智能模式中的标签Storage数据初始化(BqSelectObjectS); //这个变量定义在后面呢;

    let 汇总数据 = 汇总当前标签数据(BqSelectObjectS);
    ui.putShareData("Bq_totals_list", 汇总数据);
    return 汇总数据;

    function 汇总当前标签数据(BqSelectObjectS) {
        logw("﹉▽﹉ ﹉▽﹉ ﹉▽﹉ ﹉▽﹉ ﹉▽﹉ ﹉▽﹉ ﹉▽﹉ ﹉▽﹉");
        logd(JSON.stringify(BqSelectObjectS));
        let 对象_标签查找队列 = {};
        let Object_已勾选存储数据 = {}; //结构 = 存储的标签storage数据结构:{"化妆品":{"化妆品":"111\n222"},"美容":{"美容":"333\n444"},"瘦身":{"瘦身":""},"服装":{"服装":""},"饰品":{"饰品":""}}
        let 索引表 = BqSelectObjectS;
        logw("▽▽▽▽▽▽▽▽▽▽▽▽[已 勾 选]▽▽▽▽▽▽▽▽▽▽▽▽");
        for (let key in 索引表) {
            if (索引表.hasOwnProperty(key)) { //替代keys|

                if (索引表[key]){ //只有被选择的,才会将其"标签用语"提取出来;
                    logd(key + " : " + 索引表[key]); //美容 : 美容
                    Object_已勾选存储数据[key] = 读取Storage所有key名和值(key);
                }
            }
        }
        logw("△△△△△△△△△△△△[已 勾 选]△△△△△△△△△△△△");

        if (Object.keys(Object_已勾选存储数据).length > 0){
            logd("[已勾选]标签类别: "+JSON.stringify(Object_已勾选存储数据));
        }else{
            对象_标签查找队列["说明"] = "未勾选任何标签";
            logw("﹍△﹍ ﹍△﹍ ﹍△﹍ ﹍△﹍ ﹍△﹍ ﹍△﹍ ﹍△﹍ ﹍△﹍");
            return 对象_标签查找队列;
        }

        /*对象_标签查找队列:数据结构:
        对象 = {
        "化妆品":[],
        "美容":[],
        }
        * */
        /*下面是个调整,目前这么定义吧:[智能标签模式][精准标签模式]右侧的开关,作为[开关]吧;
        若两个同时开,就是[混合模式]了;
        另:若关闭了[精准模式],但在[智能模式]中勾选了[混合模式],也是混合模式,算是两种方式,都是打开混合模式的方式吧;
        * */
        let 模式 = "";//这个是仅用作汇总说明用的;

        // 标签模式_智能 = ui.getViewValue(ui.一级内容_2_栏目_1_开关_标签模式1);
        // 标签模式_精准 = ui.getViewValue(ui.一级内容_2_栏目_1_开关_标签模式2);
        // 标签模式_混合 = ui.getViewValue(ui.Yj_标签模式_混合_开关_标签模式3);

        if (标签模式_智能 && 标签模式_精准){
            if (!标签模式_混合){
                标签模式_混合 = true;
            }
            模式 = "混合模式"
        }else if (标签模式_混合){
            标签模式_智能 = true;
            标签模式_精准 = true;
            模式 = "混合模式";
        }else if (标签模式_智能){
            模式 = "智能模式";
        }else if (标签模式_精准){
            模式 = "精准模式";
        }else{
            // 模式 = "当前未选择标签查找模式";
            对象_标签查找队列["说明"] = "当前未选择任何模式";
            logw("﹍△﹍ ﹍△﹍ ﹍△﹍ ﹍△﹍ ﹍△﹍ ﹍△﹍ ﹍△﹍ ﹍△﹍");
            return 对象_标签查找队列;
        }
        logd("当前是"+模式);
        let 为空位置 = 0;

        if (标签模式_智能){
            logw("▽▽▽▽▽▽▽▽▽▽▽▽[智能模式]▽▽▽▽▽▽▽▽▽▽▽▽");
            //
            let Yj_智能标签_Chk_只搜旗舰店 = ui.getViewValue(ui.Yj_智能标签_Chk_只搜旗舰店);
            let Yj_智能标签_Chk_只搜直播 = ui.getViewValue(ui.Yj_智能标签_Chk_只搜直播);
            let Yj_智能标签_Chk_只搜下载 = ui.getViewValue(ui.Yj_智能标签_Chk_只搜下载);

            for (let key in Object_已勾选存储数据) {
                if (Object_已勾选存储数据.hasOwnProperty(key)) {
                    if (key === "自定义"){
                        // logd("智能模式中,[自定义]不予处理");
                        continue;
                    }
                    logd(key);
                    logd(JSON.stringify(Object_已勾选存储数据[key]));

                    let 队列数组 = 汇总_智能模式_提取标签词语(key,Object_已勾选存储数据[key][key]);
                    if (队列数组){
                        for (let key in 队列数组) {
                            if (Yj_智能标签_Chk_只搜旗舰店){
                                队列数组[key] = 队列数组[key]+ ' ' + "旗舰店";
                            }
                            if (Yj_智能标签_Chk_只搜直播){
                                队列数组[key] = 队列数组[key]+ ' ' + "直播";
                            }
                            if (Yj_智能标签_Chk_只搜下载){
                                队列数组[key] = 队列数组[key]+ ' ' + "下载";
                            }
                        }
                        对象_标签查找队列[key] = 队列数组;
                    }
                }
            }
            if (Object.keys(对象_标签查找队列).length > 0){
                logd("智能模式添加的标签:"+JSON.stringify(对象_标签查找队列));
            }else{
                logw("未勾选任何标签,请在[精准模式]中勾选要查找的标签,然后再次点击[智能模式]");
                // 对象_标签查找队列["说明"] = "智能模式,未勾选标签";
                为空位置 = 1;
            }
            logw("△△△△△△△△△△△△[智能模式]△△△△△△△△△△△△");
        }
        ////
        sleep(10);
        if (标签模式_精准){
            logw("▽▽▽▽▽▽▽▽▽▽▽▽[精准模式]▽▽▽▽▽▽▽▽▽▽▽▽");
            let 添加过 = false;
            for (let key in Object_已勾选存储数据) {
                if (Object_已勾选存储数据.hasOwnProperty(key)) {

                    logd(JSON.stringify(Object_已勾选存储数据[key]));
                    let 队列数组 = 汇总_精准模式_标签组合(Object_已勾选存储数据[key]);   //把[化妆品]下所有设置读出来,组成"标签队列"去组合成大数组;
                    if (队列数组){
                        添加过 = true;
                        logd("["+key+"]中追加数组:"+队列数组);
                        if (对象_标签查找队列[key]){
                            //若key已存在,则拼接
                            对象_标签查找队列[key] = 对象_标签查找队列[key].concat(队列数组)
                        }else{
                            //若key不存在,则建立;
                            对象_标签查找队列[key] = 队列数组;
                        }
                    }else{
                        logd("["+key+"]中无追加");
                    }
                }
            }
            //到这里,理论上不会有:对象_标签查找队列["说明"] !== undefined的情况;
            if (Object.keys(对象_标签查找队列).length > 0 ){ //&& 对象_标签查找队列["说明"] === undefined
                if (添加过){
                    logd("精准模式添加标签:"+JSON.stringify(对象_标签查找队列)); //这个,是最终的组合!
                }else{
                    logd("精准模式中无符合条件的");
                    为空位置 = 3;
                }
            }else{
                logw("未勾选任何标签,请在[精准模式]中勾选要查找的标签,然后再次点击[智能模式]");
                // 对象_标签查找队列["说明"] = "智能模式,未勾选标签";
                为空位置 = 2;
            }
            logw("△△△△△△△△△△△△[精准模式]△△△△△△△△△△△△");
        }
        if (为空位置 === 3){
            if (标签模式_智能){
                对象_标签查找队列["说明"] = "混合模式,但精准标签内容未填写";
            }else{
                对象_标签查找队列["说明"] = "精准模式,但精准标签内容未填写";
            }
        }else if (为空位置 === 2){
            if (标签模式_智能){
                对象_标签查找队列["说明"] = "混合模式,未勾选具体标签";//未勾选标签的情况,按说不该出现在这里了;
            }else{
                对象_标签查找队列["说明"] = "精准模式,但精准标签内容未填写";
            }
        }else if (为空位置 === 1){
            //这里只有一种情况,即:未勾选任何标签;
            对象_标签查找队列["说明"] = "智能模式,未勾选具体标签"; //未勾选标签的情况,按说不该出现在这里了;
        }else{
            对象_标签查找队列["说明"] = "当前是"+模式+"";
        }
        // logi("当前是"+模式+"模式");
        logd(对象_标签查找队列["说明"]);
        logw("﹍△﹍ ﹍△﹍ ﹍△﹍ ﹍△﹍ ﹍△﹍ ﹍△﹍ ﹍△﹍ ﹍△﹍");
        return 对象_标签查找队列;
    }

    function 智能模式中的标签Storage数据初始化(BqSelectObjectS) {
        /* [智能模式]中的初始化部分,提取出来了;
        覆盖数据就是storage的:没有就建立,有就存入;
        打开ui,直接点击[最终预览]或[保存]时会出错,因为:"化妆品"对象里,没有"化妆品"这个key;
        1,当前已选;
        2,当前未选;
        对已选的,进行初始化;
        * */

        for (let key in BqSelectObjectS) { //先区分[已勾选][未勾选]
            if (key !== "自定义") {
                let fileName = key;
                let defaultValue = "";

                if (BqSelectObjectS[key]) {
                    let content = readConfiguration(fileName, key, defaultValue);
                    logi("[已勾选]fileName: [" + fileName + "] key: "+ key +" 值: " + content);
                    // let jieguo = readConfiguration(fileName, key, content);
                    // logd("fileName: " + fileName + " key: "+ key +" 值: " + jieguo);
                } else {
                    let content1 = "";
                    let content = readConfiguration(fileName, key, defaultValue);
                    logw("[未勾选]fileName: [" + fileName + "] key: "+ key +" 值: " + content);
                }
            } else {
                logd("自定义值,不收录进智能模式:" + BqSelectObjectS[key]);
            }
        }
    }

}

function 读取Storage所有key名和值(filename) {
    /*
    查看[化妆品]所有key名和值:返回的是JSON字符串:
    {"E_direction":"后缀","化妆品":"1111111111","Edit_Modifier":"","Edit_tagWord":"兰蔻，迪奥"}
    目前的命名是:storage名:化妆品;
    key:
    "化妆品": 这个,是[智能标签]里的,结果暂时弄到这里来了,那就这里吧;
    "Edit_tagWord": 标签
    "Edit_Modifier":修饰词
    "E_direction":  位置|方向
    * */
    /*[storages]专用
    存储的是storages对象,这里读取;
    返回的是真实的对象;
    * */
    let storage = storages.create(filename);
    let keys = storage.all();
    //返回的是JSON字符串,不是一个真实的对象;需要JSON.parse转换;**********
    logd("查看["+filename+"]所有key名和值:返回的是JSON字符串:"+keys);

    // if (typeof keys === 'object'){
    //     logd("是对象");//不是真正的对象,是JSON字符串
    // }else{
    //     logd("不是对象");
    // }

    //object{"E_direction":"后缀","Edit_Modifier":"旗舰店","Edit_tagWord":"兰蔻，雅诗兰黛"}
    // logd(keys["Edit_tagWord"]);用这个测试,是对象,还是JSON字符串

    keys = JSON.parse(keys); //转换为真正的对象;
    // logd(keys["Edit_tagWord"]);
    return keys;
}

function 汇总_智能模式_提取标签词语(key,val){
    /*该[val]为key的值;
    * */
    if (val === null){
        logd("数据为空,出错");
        return false;
    }
    if (typeOf(val) !== "String"){
        logi("val["+val+"]不为字符类型,出错");
        return false;
    }
    let 数组 = [];
    if (val === ""){
        数组[0] = key;
        return 数组;
    }else{
        数组 = 字符串_分割(val,'\n');
        return 数组;
    }
}

function 汇总_精准模式_标签组合(Object) {
    /*这个,是Edit_Modifier有多个词语的情况,对其进行分割;
    //官方店 兰蔻,雅诗兰黛 旗舰店,迪奥 旗舰店
    //官方店 兰蔻,官方店 雅诗兰黛,官方店 迪奥
    * */
    if (!Object.Edit_tagWord) {

        return false;
    }
//Edit_tagWord Edit_Modifier E_direction
    var 修饰词Arr = [];
    if (Object.Edit_Modifier.includes(',') || Object.Edit_Modifier.includes('，') || Object.Edit_Modifier.includes('|')) {
        修饰词Arr = Object.Edit_Modifier.split(/[，,|]/);

    } else {

        修饰词Arr = [Object.Edit_Modifier];
    }

    var 标签词Arr = [];
    if (Object.Edit_tagWord.includes(',') || Object.Edit_tagWord.includes('，') || Object.Edit_tagWord.includes('|')) {
        标签词Arr = Object.Edit_tagWord.split(/[，,|]/);
    } else {
        标签词Arr = [Object.Edit_tagWord];
    }

    // logd(typeOf(修饰词Arr) + 修饰词Arr);//修饰词为空时,也是个数组;
    // logd(修饰词Arr.length + " : " + 修饰词Arr[0]);
    var result = [];
    let n ;
    if (Object.E_direction === '前缀') {
        for (var i = 0; i < 标签词Arr.length; i++) {

            var str = "";
            n = random(0,修饰词Arr.length-1);
            if (修饰词Arr[n] !== "" && 修饰词Arr[n] !== ' '){
                str = 修饰词Arr[n] + ' ' + 标签词Arr[i];
            }else{
                str = 标签词Arr[i];
            }
            result.push(str);

        }
    } else if (Object.E_direction === '后缀') {
        for (var i = 0; i < 标签词Arr.length; i++) {

            var str = "";
            n = random(0,修饰词Arr.length-1);

            if (修饰词Arr[n] !== "" && 修饰词Arr[n] !== ' '){

                str = 标签词Arr[i] + ' ' + 修饰词Arr[n];
            }else{
                str = 标签词Arr[i];
            }
            result.push(str);

        }
    } else if (Object.E_direction === '随机') {
        for (var i = 0; i < 标签词Arr.length; i++) {

            var str = "";
            n = random(0,修饰词Arr.length-1);

            if (修饰词Arr[n] !== "" && 修饰词Arr[n] !== ' '){
                var rand = Math.random();
                str = rand < 0.5 ? 修饰词Arr[n] + ' ' + 标签词Arr[i] : 标签词Arr[i] + ' ' + 修饰词Arr[n];
            }else{
                str = 标签词Arr[i];
            }
            result.push(str);

            // for (var j = 0; j < 修饰词Arr.length; j++) {
            //     var rand = Math.random();
            //     var str = rand < 0.5 ? 修饰词Arr[j] + ' ' + 标签词Arr[i] : 标签词Arr[i] + ' ' + 修饰词Arr[j];
            //     result.push(str);
            // }
        }
    }

    return result;
}

function 关闭编辑状态() {
    let 当前状态 = ui.getViewValue(ui.Yj_标签编辑_Swt_编辑模式);
    if (当前状态) { //当前为编辑状态
        logd("当前为[编辑状态],设置为[勾选状态]");
        ui.Yj_标签编辑_Swt_编辑模式.setChecked(false);
    } else {
        logd("当前为[勾选状态]");
    }
}

function 关闭自定义() {
    let zdy = ui.getViewValue(ui.标签_自定义);
    if (zdy) {
        ui.标签_自定义.setChecked(false);
    }
}

function 绘制矩形背景(view, 色值) {
    let background = new GradientDrawable();// 默认矩形
    background.setColor(Color.parseColor(色值));//"#cc8899"
    view.setBackgroundDrawable(background);
}

//----------------------------  通知栏权限 检测函数  ------------------------------

/**
 * @作者 Mr_老鬼 QQ:1156346325
 * @函数用途   编辑框自动保存
 * @创建时间 16:43 2021-11-8
 * @参数
 * @return
 **/
function saveEdit(view, key) {
    view.addTextChangedListener(new TextWatcher({
        beforeTextChanged: function (text, start, count, after) {
        },
        onTextChanged: function (text, start, before, count) {
        },
        afterTextChanged: function (edit) {
            // ui.saveConfig(key,edit+"");
            logd(edit + "");
            if (edit.length() === 0) {
                toast("输入信息为空，请确认（所有备选时间除外）");
            }
            logd(edit.length());
            ui.saveConfig(key, edit + "");
        }
    }));
}

function editListener(edit) {
    edit.addTextChangedListener(new TextWatcher({
        beforeTextChanged: function (text, start, count, after) {
        },
        onTextChanged: function (text, start, before, count) {

        },
        afterTextChanged: function (edit) {
            logd(edit + "");
            if (edit.length() === 0) {
                toast("输入信息为空，请确认（所有备选时间除外）");
            }
            logd(edit.length());
            ui.saveAllConfig()
        }
    }));
}


//读配置 string类型
function readConfiguration(fileName, key, defaults, save) {
    let storage = storages.create(fileName);
    if (storage.contains(key)) {
        if (save) {

            logd("storage写入:["+fileName+"]:[key]:"+key+" [值]:"+defaults+"");
            writeConfiguration(storage, key, defaults);
            return storage.getString(key, "");

        }else{

            let val =  storage.getString(key, "");
            logd("storage读取:["+fileName+"]:[key]:"+key+" [值]:"+val+"");
            return val;
        }

    } else {
        logd("storage写入:["+fileName+"]:[key]:"+key+" [值]:"+defaults+""); //这里的"key"不对,这是key名,应该是key值吧?
        writeConfiguration(storage, key, defaults);
        return storage.getString(key, defaults);
    }
}


//写配置 string类型
// function writeConfiguration(fileName, key, value) {
//     const storage = fileName
//     storage.putString(key, value)
//     logd(storage.getString(key, ""));
// }

//下面是GPT给的:
/*
在原写法中，问题出现在以下这一行代码：

const storage = fileName

* 这行代码将参数fileName赋值给了变量storage，但是没有使用storages.create()函数创建一个存储对象，而是直接将fileName赋值给storage。这将导致在后续的代码中使用storage对象时出现问题。

具体来说，如果使用原写法，在writeConfiguration()函数内部的storage对象将是一个字符串（文件名），而不是一个有效的存储对象。因此，当调用storage.putString(key, value)时，会引发错误，因为字符串没有putString()方法。

举个例子，假设fileName的值是"config.txt"，在原写法中，storage将被赋值为"config.txt"，然后在调用storage.putString(key, value)时会出现错误，因为字符串没有putString()方法。

而在修改后的写法中，我们将storages.create()函数作为参数传递给writeConfiguration()函数，确保在函数内部获得有效的存储对象。这样，storage.putString(key, value)可以正常工作，因为storage是一个有效的存储对象。

所以，修改后的写法是正确的，并且可以避免在使用writeConfiguration()函数时发生错误。
* */
function writeConfiguration(storage, key, value) {
    storage.putString(key, value);
    // logd(storage.getString(key, ""));
}

//读配置 布尔类型
function readBooleanConfiguration(fileName, key, defaults, save) {
    const storage = storages.create(fileName);
    if (storage.contains(key)) {
        if (save) {
            writeBooleanConfiguration(storage, key, defaults)
        }
        logd("ssss");
        return storage.getBoolean(key, false);
    } else {
        writeBooleanConfiguration(storage, key, defaults);
        return storage.getBoolean(key, defaults);
    }
}

//写配置 布尔类型
// function writeBooleanConfiguration(fileName, key, value) {
//     const storage = fileName
//     storage.putBoolean(key, value)
//     logd(storage.getBoolean(key, false));
// }
//下面是GPT给的:
function writeBooleanConfiguration(storage, key, value) {
    storage.putBoolean(key, value);
    logd(storage.getBoolean(key, false));
}

function 所有_复选框_下载按钮_监听() {
    //注意这个写法
    let m = {
        "action": "android.intent.action.VIEW",
        "uri": "http://www.baidu.com",
    };
    //消消三国得宝
    ui.setEvent(ui.xxsgdb, "checkedChange", function (view, isChecked) {
        saveSelApps();
    });
    ui.setEvent(ui.xxsgdb_down, "click", function (view) {
        m.uri = "http://klkd.aiktang.cn/klkd/share/html/download_share.html?invitation=5567912";
        ui.openActivity(m);
    });
    //消消僵尸得宝
    ui.setEvent(ui.xxjsdb, "checkedChange", function (view, isChecked) {
        saveSelApps();
    });
    ui.setEvent(ui.xxjsdb_down, "click", function (view) {
        m.uri = "http://klkd.aiktang.cn/klkd/share/html/download_share.html?invitation=5567912";
        ui.openActivity(m);
    });
    //全民消除寻宝
    ui.setEvent(ui.qmxcxb, "checkedChange", function (view, isChecked) {
        saveSelApps();
    });
    ui.setEvent(ui.qmxcxb_down, "click", function (view) {
        m.uri = "http://klkd.aiktang.cn/klkd/share/html/download_share.html?invitation=5567912";
        ui.openActivity(m);
    });
    //对对碰宝
    ui.setEvent(ui.ddpb, "checkedChange", function (view, isChecked) {
        saveSelApps();
    });
    ui.setEvent(ui.ddpb_down, "click", function (view) {
        m.uri = "http://klkd.aiktang.cn/klkd/share/html/download_share.html?invitation=5567912";
        ui.openActivity(m);
    });
    //天天全民金币大消除
    ui.setEvent(ui.ttqmjbdxc, "checkedChange", function (view, isChecked) {
        saveSelApps();
    });
    ui.setEvent(ui.ttqmjbdxc_down, "click", function (view) {
        m.uri = "http://klkd.aiktang.cn/klkd/share/html/download_share.html?invitation=5567912";
        ui.openActivity(m);
    });
    //金币后宫消消乐
    ui.setEvent(ui.jbhgxxl, "checkedChange", function (view, isChecked) {
        saveSelApps();
    });
    ui.setEvent(ui.jbhgxxl_down, "click", function (view) {
        m.uri = "http://klkd.aiktang.cn/klkd/share/html/download_share.html?invitation=5567912";
        ui.openActivity(m);
    });
    //彩蛋消消乐
    ui.setEvent(ui.cdxxl, "checkedChange", function (view, isChecked) {
        saveSelApps();
    });
    ui.setEvent(ui.cdxxl_down, "click", function (view) {
        m.uri = "http://klkd.aiktang.cn/klkd/share/html/download_share.html?invitation=5567912";
        ui.openActivity(m);
    });
    //宝藏消消消
    ui.setEvent(ui.bzxxx, "checkedChange", function (view, isChecked) {
        saveSelApps();
    });
    ui.setEvent(ui.bzxxx_down, "click", function (view) {
        m.uri = "http://klkd.aiktang.cn/klkd/share/html/download_share.html?invitation=5567912";
        ui.openActivity(m);
    });
    //萌宠乐消消
    ui.setEvent(ui.mclxx, "checkedChange", function (view, isChecked) {
        saveSelApps();
    });
    ui.setEvent(ui.mclxx_down, "click", function (view) {
        m.uri = "http://klkd.aiktang.cn/klkd/share/html/download_share.html?invitation=5567912";
        ui.openActivity(m);
    });
    //梦幻点点消
    ui.setEvent(ui.mhddx, "checkedChange", function (view, isChecked) {
        saveSelApps();
    });
    ui.setEvent(ui.mhddx_down, "click", function (view) {
        m.uri = "http://klkd.aiktang.cn/klkd/share/html/download_share.html?invitation=5567912";
        ui.openActivity(m);
    });
    //--------------------
    //欢乐猪猪消
    ui.setEvent(ui.hlzzx, "checkedChange", function (view, isChecked) {
        saveSelApps();
    });
    ui.setEvent(ui.hlzzx_down, "click", function (view) {
        m.uri = "http://klkd.aiktang.cn/klkd/share/html/download_share.html?invitation=5567912";
        ui.openActivity(m);
    });
    //点点消消消
    ui.setEvent(ui.ddxxx, "checkedChange", function (view, isChecked) {
        saveSelApps();
    });
    ui.setEvent(ui.ddxxx_down, "click", function (view) {
        m.uri = "http://klkd.aiktang.cn/klkd/share/html/download_share.html?invitation=5567912";
        ui.openActivity(m);
    });
    //消除小方块
    ui.setEvent(ui.xcxfk, "checkedChange", function (view, isChecked) {
        saveSelApps();
    });
    ui.setEvent(ui.xcxfk_down, "click", function (view) {
        m.uri = "http://klkd.aiktang.cn/klkd/share/html/download_share.html?invitation=5567912";
        ui.openActivity(m);
    });
    //魔法爱消除
    ui.setEvent(ui.mfaxc, "checkedChange", function (view, isChecked) {
        saveSelApps();
    });
    ui.setEvent(ui.mfaxc_down, "click", function (view) {
        m.uri = "http://klkd.aiktang.cn/klkd/share/html/download_share.html?invitation=5567912";
        ui.openActivity(m);
    });

    //爱上消消消
    ui.setEvent(ui.asxxx, "checkedChange", function (view, isChecked) {
        saveSelApps();
    });
    ui.setEvent(ui.asxxx_down, "click", function (view) {
        m.uri = "http://klkd.aiktang.cn/klkd/share/html/download_share.html?invitation=5567912";
        ui.openActivity(m);
    });
    //红包点点消
    ui.setEvent(ui.hbddx, "checkedChange", function (view, isChecked) {
        saveSelApps();
        logd("[复选框]存储一次[只有前3个写了log语句,后面的没写]");
    });
    ui.setEvent(ui.hbddx_down, "click", function (view) {
        m.uri = "http://klkd.aiktang.cn/klkd/share/html/download_share.html?invitation=5567912";
        ui.openActivity(m);
    });
    //贝壳消消乐
    ui.setEvent(ui.bkxxl, "checkedChange", function (view, isChecked) {
        saveSelApps();
    });
    ui.setEvent(ui.bkxxl_down, "click", function (view) {
        m.uri = "http://klkd.aiktang.cn/klkd/share/html/download_share.html?invitation=5567912";
        ui.openActivity(m);
    });
    //开心消消消
    ui.setEvent(ui.kxxxx, "checkedChange", function (view, isChecked) {
        saveSelApps();
    });
    ui.setEvent(ui.kxxxx_down, "click", function (view) {
        m.uri = "http://klkd.aiktang.cn/klkd/share/html/download_share.html?invitation=5567912";
        ui.openActivity(m);
    });

    //分红世界
    ui.setEvent(ui.fhsj, "checkedChange", function (view, isChecked) {
        saveSelApps();
    });
    ui.setEvent(ui.fhsj_down, "click", function (view) {
        m.uri = "http://klkd.aiktang.cn/klkd/share/html/download_share.html?invitation=5567912";
        ui.openActivity(m);
    });
    //赚钱宝贝
    ui.setEvent(ui.zqbb, "checkedChange", function (view, isChecked) {
        saveSelApps();
    });
    ui.setEvent(ui.zqbb_down, "click", function (view) {
        m.uri = "http://klkd.aiktang.cn/klkd/share/html/download_share.html?invitation=5567912";
        ui.openActivity(m);
    });
    //加减赚钱
    ui.setEvent(ui.jjzq, "checkedChange", function (view, isChecked) {
        saveSelApps();
    });
    ui.setEvent(ui.jjzq_down, "click", function (view) {
        m.uri = "http://klkd.aiktang.cn/klkd/share/html/download_share.html?invitation=5567912";
        ui.openActivity(m);
    });

    //东方头条极速版
    ui.setEvent(ui.dfttjsb, "checkedChange", function (view, isChecked) {
        saveSelApps();
    });
    ui.setEvent(ui.dfttjsb_down, "click", function (view) {
        m.uri = "http://klkd.aiktang.cn/klkd/share/html/download_share.html?invitation=5567912";
        ui.openActivity(m);
    });
    //乐乐看
    ui.setEvent(ui.lelekan, "checkedChange", function (view, isChecked) {
        saveSelApps();
    });
    ui.setEvent(ui.lelekan_down, "click", function (view) {
        m.uri = "http://klkd.aiktang.cn/klkd/share/html/download_share.html?invitation=5567912";
        ui.openActivity(m);
    });

    //刷刷乐
    ui.setEvent(ui.shuashuale, "checkedChange", function (view, isChecked) {
        saveSelApps();
    });
    ui.setEvent(ui.shuashuale_down, "click", function (view) {
        m.uri = "http://klkd.aiktang.cn/klkd/share/html/download_share.html?invitation=5567912";
        ui.openActivity(m);
    });
    //人人看
    ui.setEvent(ui.renrenkan, "checkedChange", function (view, isChecked) {
        saveSelApps();
    });
    ui.setEvent(ui.renrenkan_down, "click", function (view) {
        m.uri = "http://klkd.aiktang.cn/klkd/share/html/download_share.html?invitation=5567912";
        ui.openActivity(m);
    });

    //悦看点
    ui.setEvent(ui.yuekandian, "checkedChange", function (view, isChecked) {
        saveSelApps();
    });
    ui.setEvent(ui.yuekandian_down, "click", function (view) {
        m.uri = "http://klkd.aiktang.cn/klkd/share/html/download_share.html?invitation=5567912";
        ui.openActivity(m);
    });
    //阅多多
    ui.setEvent(ui.yueduoduo, "checkedChange", function (view, isChecked) {
        saveSelApps();
    });
    ui.setEvent(ui.yueduoduo_down, "click", function (view) {
        m.uri = "http://klkd.aiktang.cn/klkd/share/html/download_share.html?invitation=5567912";
        ui.openActivity(m);
    });

    //看点宝
    ui.setEvent(ui.kandianbao, "checkedChange", function (view, isChecked) {
        saveSelApps();
    });
    ui.setEvent(ui.kandianbao_down, "click", function (view) {
        m.uri = "http://klkd.aiktang.cn/klkd/share/html/download_share.html?invitation=5567912";
        ui.openActivity(m);
    });

    //好看点极速版
    ui.setEvent(ui.haokandianjisuban, "checkedChange", function (view, isChecked) {
        saveSelApps();
    });
    ui.setEvent(ui.haokandianjisuban_down, "click", function (view) {
        m.uri = "http://klkd.aiktang.cn/klkd/share/html/download_share.html?invitation=5567912";
        ui.openActivity(m);
    });
    //阅看点极速版
    ui.setEvent(ui.yuekandianjisuban, "checkedChange", function (view, isChecked) {
        saveSelApps();
    });
    ui.setEvent(ui.yuekandianjisuban_down, "click", function (view) {
        m.uri = "http://klkd.aiktang.cn/klkd/share/html/download_share.html?invitation=5567912";
        ui.openActivity(m);
    });

    //好看点
    ui.setEvent(ui.haokandian, "checkedChange", function (view, isChecked) {
        saveSelApps();
    });
    ui.setEvent(ui.haokandian_down, "click", function (view) {
        m.uri = "http://klkd.aiktang.cn/klkd/share/html/download_share.html?invitation=5567912";
        ui.openActivity(m);
    });

    //悦热点
    ui.setEvent(ui.yueredian, "checkedChange", function (view, isChecked) {
        saveSelApps();
    });
    ui.setEvent(ui.yueredian_down, "click", function (view) {
        m.uri = "http://klkd.aiktang.cn/klkd/share/html/download_share.html?invitation=5567912";
        ui.openActivity(m);
    });

    //趣看365
    ui.setEvent(ui.qukan365, "checkedChange", function (view, isChecked) {
        saveSelApps();
    });
    ui.setEvent(ui.qukan365_down, "click", function (view) {
        m.uri = "http://klkd.aiktang.cn/klkd/share/html/download_share.html?invitation=5567912";
        ui.openActivity(m);
    });

    //看点宝极速版
    ui.setEvent(ui.kandianbaojisuban, "checkedChange", function (view, isChecked) {
        saveSelApps();
    });
    ui.setEvent(ui.kandianbaojisuban_down, "click", function (view) {
        m.uri = "http://klkd.aiktang.cn/klkd/share/html/download_share.html?invitation=5567912";
        ui.openActivity(m);
    });

    //幸福看点
    ui.setEvent(ui.xingfukandian, "checkedChange", function (view, isChecked) {
        saveSelApps();
    });
    ui.setEvent(ui.xingfukandian_down, "click", function (view) {
        m.uri = "http://klkd.aiktang.cn/klkd/share/html/download_share.html?invitation=5567912";
        ui.openActivity(m);
    });

    //乐乐刷
    ui.setEvent(ui.leleshua, "checkedChange", function (view, isChecked) {
        saveSelApps();
    });
    ui.setEvent(ui.leleshua_down, "click", function (view) {
        m.uri = "http://klkd.aiktang.cn/klkd/share/html/download_share.html?invitation=5567912";
        ui.openActivity(m);
    });
    //爱看点
    ui.setEvent(ui.aikandian, "checkedChange", function (view, isChecked) {
        saveSelApps();
    });
    ui.setEvent(ui.aikandian_down, "click", function (view) {
        m.uri = "http://klkd.aiktang.cn/klkd/share/html/download_share.html?invitation=5567912";
        ui.openActivity(m);
    });

    //秒提看点
    ui.setEvent(ui.miaotikandian, "checkedChange", function (view, isChecked) {
        saveSelApps();
    });
    ui.setEvent(ui.miaotikandian_down, "click", function (view) {
        m.uri = "http://klkd.aiktang.cn/klkd/share/html/download_share.html?invitation=5567912";
        ui.openActivity(m);
    });

    //趣好看软件
    ui.setEvent(ui.quhaokanruanjian, "checkedChange", function (view, isChecked) {
        saveSelApps();
    });
    ui.setEvent(ui.quhaokanruanjian_down, "click", function (view) {
        m.uri = "http://klkd.aiktang.cn/klkd/share/html/download_share.html?invitation=5567912";
        ui.openActivity(m);
    });

    //趣好看极速版
    ui.setEvent(ui.quhaokanjsb, "checkedChange", function (view, isChecked) {
        saveSelApps();
    });
    ui.setEvent(ui.quhaokanjsb_down, "click", function (view) {
        m.uri = "http://klkd.aiktang.cn/klkd/share/html/download_share.html?invitation=5567912";
        ui.openActivity(m);
    });
    //赢看点极速版
    ui.setEvent(ui.yingkandianjsb, "checkedChange", function (view, isChecked) {
        saveSelApps();
    });
    ui.setEvent(ui.yingkandianjsb_down, "click", function (view) {
        m.uri = "http://klkd.aiktang.cn/klkd/share/html/download_share.html?invitation=5567912";
        ui.openActivity(m);
    });

    //------------
    //娱玩看点
    ui.setEvent(ui.yuwankandian, "checkedChange", function (view, isChecked) {
        saveSelApps();
    });
    ui.setEvent(ui.yuwankandian_down, "click", function (view) {
        m.uri = "http://klkd.aiktang.cn/klkd/share/html/download_share.html?invitation=5567912";
        ui.openActivity(m);
    });
    //悦赚看点
    ui.setEvent(ui.yuezhuankandian, "checkedChange", function (view, isChecked) {
        saveSelApps();
    });
    ui.setEvent(ui.yuezhuankandian_down, "click", function (view) {
        m.uri = "http://klkd.aiktang.cn/klkd/share/html/download_share.html?invitation=5567912";
        ui.openActivity(m);
    });

    //惠看点极速版
    ui.setEvent(ui.huikandianjsb, "checkedChange", function (view, isChecked) {
        saveSelApps();
    });
    ui.setEvent(ui.huikandianjsb_down, "click", function (view) {
        m.uri = "http://klkd.aiktang.cn/klkd/share/html/download_share.html?invitation=5567912";
        ui.openActivity(m);
    });
    //龙龙趣看极速版
    ui.setEvent(ui.longlongqukanjsb, "checkedChange", function (view, isChecked) {
        saveSelApps();
    });
    ui.setEvent(ui.longlongqukanjsb_down, "click", function (view) {
        m.uri = "http://klkd.aiktang.cn/klkd/share/html/download_share.html?invitation=5567912";
        ui.openActivity(m);
    });

    //365看点
    ui.setEvent(ui.kandian365, "checkedChange", function (view, isChecked) {
        saveSelApps();
    });
    ui.setEvent(ui.kandian365_down, "click", function (view) {
        m.uri = "http://klkd.aiktang.cn/klkd/share/html/download_share.html?invitation=5567912";
        ui.openActivity(m);
    });

    //天天秒提
    ui.setEvent(ui.tiantianmiaoti, "checkedChange", function (view, isChecked) {
        saveSelApps();
    });
    ui.setEvent(ui.tiantianmiaoti_down, "click", function (view) {
        m.uri = "http://klkd.aiktang.cn/klkd/share/html/download_share.html?invitation=5567912";
        ui.openActivity(m);
    });

    //秒提看看
    ui.setEvent(ui.miaotikankan, "checkedChange", function (view, isChecked) {
        saveSelApps();
    });
    ui.setEvent(ui.miaotikankan_down, "click", function (view) {
        m.uri = "http://klkd.aiktang.cn/klkd/share/html/download_share.html?invitation=5567912";
        ui.openActivity(m);
    });
    //秒提看看PRO
    ui.setEvent(ui.miaotikankanpro, "checkedChange", function (view, isChecked) {
        saveSelApps();
    });
    ui.setEvent(ui.miaotikankanpro_down, "click", function (view) {
        m.uri = "http://klkd.aiktang.cn/klkd/share/html/download_share.html?invitation=5567912";
        ui.openActivity(m);
    });
    //真滴能提
    ui.setEvent(ui.zhendinengti, "checkedChange", function (view, isChecked) {
        saveSelApps();
    });
    ui.setEvent(ui.zhendinengti_down, "click", function (view) {
        m.uri = "http://klkd.aiktang.cn/klkd/share/html/download_share.html?invitation=5567912";
        ui.openActivity(m);
    });
    //真滴能提极速版
    ui.setEvent(ui.zhendinengtijsb, "checkedChange", function (view, isChecked) {
        saveSelApps();
    });
    ui.setEvent(ui.zhendinengtijsb_down, "click", function (view) {
        m.uri = "http://klkd.aiktang.cn/klkd/share/html/download_share.html?invitation=5567912";
        ui.openActivity(m);
    });

    //悦趣看点
    ui.setEvent(ui.yuequkandian, "checkedChange", function (view, isChecked) {
        saveSelApps();
    });
    ui.setEvent(ui.yuequkandian_down, "click", function (view) {
        m.uri = "http://klkd.aiktang.cn/klkd/share/html/download_share.html?invitation=5567912";
        ui.openActivity(m);
    });
    //赚金看点
    ui.setEvent(ui.zhuanjinkandian, "checkedChange", function (view, isChecked) {
        saveSelApps();
    });
    ui.setEvent(ui.zhuanjinkandian_down, "click", function (view) {
        m.uri = "http://klkd.aiktang.cn/klkd/share/html/download_share.html?invitation=5567912";
        ui.openActivity(m);
    });
    //头条赚金
    ui.setEvent(ui.toutiaozhuanjin, "checkedChange", function (view, isChecked) {
        saveSelApps();
    });
    ui.setEvent(ui.toutiaozhuanjin_down, "click", function (view) {
        m.uri = "http://klkd.aiktang.cn/klkd/share/html/download_share.html?invitation=5567912";
        ui.openActivity(m);
    });

    //趣赚资讯
    ui.setEvent(ui.quzhuanzixun, "checkedChange", function (view, isChecked) {
        saveSelApps();
    });
    ui.setEvent(ui.quzhuanzixun_down, "click", function (view) {
        m.uri = "http://klkd.aiktang.cn/klkd/share/html/download_share.html?invitation=5567912";
        ui.openActivity(m);
    });

    //51趣赚
    ui.setEvent(ui.quzhuan51, "checkedChange", function (view, isChecked) {
        saveSelApps();
    });
    ui.setEvent(ui.quzhuan51_down, "click", function (view) {
        m.uri = "http://klkd.aiktang.cn/klkd/share/html/download_share.html?invitation=5567912";
        ui.openActivity(m);
    });

    //米读趣赚
    ui.setEvent(ui.miduquzhuan, "checkedChange", function (view, isChecked) {
        saveSelApps();
    });
    ui.setEvent(ui.miduquzhuan_down, "click", function (view) {
        m.uri = "http://klkd.aiktang.cn/klkd/share/html/download_share.html?invitation=5567912";
        ui.openActivity(m);
    });

    //阳光趣看看
    ui.setEvent(ui.yangguangqukankan, "checkedChange", function (view, isChecked) {
        saveSelApps();
    });
    ui.setEvent(ui.yangguangqukankan_down, "click", function (view) {
        m.uri = "http://klkd.aiktang.cn/klkd/share/html/download_share.html?invitation=5567912";
        ui.openActivity(m);
    });
    //每日趣看看
    ui.setEvent(ui.meiriqukankan, "checkedChange", function (view, isChecked) {
        saveSelApps();
    });
    ui.setEvent(ui.meiriqukankan_down, "click", function (view) {
        m.uri = "http://klkd.aiktang.cn/klkd/share/html/download_share.html?invitation=5567912";
        ui.openActivity(m);
    });

    //生肖看看
    ui.setEvent(ui.shengxiaokankan, "checkedChange", function (view, isChecked) {
        saveSelApps();
    });
    ui.setEvent(ui.shengxiaokankan_down, "click", function (view) {
        m.uri = "http://klkd.aiktang.cn/klkd/share/html/download_share.html?invitation=5567912";
        ui.openActivity(m);
    });
    //生肖看看极速版
    ui.setEvent(ui.shengxiaokankanjsb, "checkedChange", function (view, isChecked) {
        saveSelApps();
    });
    ui.setEvent(ui.shengxiaokankanjsb_down, "click", function (view) {
        m.uri = "http://klkd.aiktang.cn/klkd/share/html/download_share.html?invitation=5567912";
        ui.openActivity(m);
    });

    //--------------------
    //雏鱼
    ui.setEvent(ui.chuyu, "checkedChange", function (view, isChecked) {
        saveSelApps();
    });
    ui.setEvent(ui.chuyu_down, "click", function (view) {
        m.uri = "http://klkd.aiktang.cn/klkd/share/html/download_share.html?invitation=5567912";
        ui.openActivity(m);
    });

    //猫豚
    ui.setEvent(ui.maotun, "checkedChange", function (view, isChecked) {
        saveSelApps();
    });
    ui.setEvent(ui.maotun_down, "click", function (view) {
        m.uri = "http://klkd.aiktang.cn/klkd/share/html/download_share.html?invitation=5567912";
        ui.openActivity(m);
    });

    //撸猫短视频
    ui.setEvent(ui.lumaodsp, "checkedChange", function (view, isChecked) {
        saveSelApps();
    });
    ui.setEvent(ui.lumaodsp_down, "click", function (view) {
        m.uri = "http://klkd.aiktang.cn/klkd/share/html/download_share.html?invitation=5567912";
        ui.openActivity(m);
    });

    //喜鹊短视频
    ui.setEvent(ui.xiquedsp, "checkedChange", function (view, isChecked) {
        saveSelApps();
    });
    ui.setEvent(ui.xiquedsp_down, "click", function (view) {
        m.uri = "http://klkd.aiktang.cn/klkd/share/html/download_share.html?invitation=5567912";
        ui.openActivity(m);
    });

    //番鱼短视频1
    ui.setEvent(ui.fanyudsp1, "checkedChange", function (view, isChecked) {
        saveSelApps();
    });
    ui.setEvent(ui.fanyudsp1_down, "click", function (view) {
        m.uri = "http://klkd.aiktang.cn/klkd/share/html/download_share.html?invitation=5567912";
        ui.openActivity(m);
    });
    //番鱼短视频2
    ui.setEvent(ui.fanyudsp2, "checkedChange", function (view, isChecked) {
        saveSelApps();
    });
    ui.setEvent(ui.fanyudsp2_down, "click", function (view) {
        m.uri = "http://klkd.aiktang.cn/klkd/share/html/download_share.html?invitation=5567912";
        ui.openActivity(m);
    });

    //鹈鹕短视频1
    ui.setEvent(ui.tihudsp1, "checkedChange", function (view, isChecked) {
        saveSelApps();
    });
    ui.setEvent(ui.tihudsp1_down, "click", function (view) {
        m.uri = "http://klkd.aiktang.cn/klkd/share/html/download_share.html?invitation=5567912";
        ui.openActivity(m);
    });

    //鹈鹕短视频2
    ui.setEvent(ui.tihudsp2, "checkedChange", function (view, isChecked) {
        saveSelApps();
    });
    ui.setEvent(ui.tihudsp2_down, "click", function (view) {
        m.uri = "http://klkd.aiktang.cn/klkd/share/html/download_share.html?invitation=5567912";
        ui.openActivity(m);
    });
    //鹈鹕短视频3
    ui.setEvent(ui.tihudsp3, "checkedChange", function (view, isChecked) {
        saveSelApps();
    });
    ui.setEvent(ui.tihudsp3_down, "click", function (view) {
        m.uri = "http://klkd.aiktang.cn/klkd/share/html/download_share.html?invitation=5567912";
        ui.openActivity(m);
    });

    //金鸡短视频1
    ui.setEvent(ui.jinjidsp1, "checkedChange", function (view, isChecked) {
        saveSelApps();
    });
    ui.setEvent(ui.jinjidsp1_down, "click", function (view) {
        m.uri = "http://klkd.aiktang.cn/klkd/share/html/download_share.html?invitation=5567912";
        ui.openActivity(m);
    });

    //金鸡短视频2
    ui.setEvent(ui.jinjidsp2, "checkedChange", function (view, isChecked) {
        saveSelApps();
    });
    ui.setEvent(ui.jinjidsp2_down, "click", function (view) {
        m.uri = "http://klkd.aiktang.cn/klkd/share/html/download_share.html?invitation=5567912";
        ui.openActivity(m);
    });

    //吃鸡极速版1
    ui.setEvent(ui.chijijsb1, "checkedChange", function (view, isChecked) {
        saveSelApps();
    });
    ui.setEvent(ui.chijijsb1_down, "click", function (view) {
        m.uri = "http://klkd.aiktang.cn/klkd/share/html/download_share.html?invitation=5567912";
        ui.openActivity(m);
    });
    //吃鸡极速版2
    ui.setEvent(ui.chijijsb2, "checkedChange", function (view, isChecked) {
        saveSelApps();
    });
    ui.setEvent(ui.chijijsb2_down, "click", function (view) {
        m.uri = "http://klkd.aiktang.cn/klkd/share/html/download_share.html?invitation=5567912";
        ui.openActivity(m);
    });
    //田鸡短视频
    ui.setEvent(ui.tianjidsp, "checkedChange", function (view, isChecked) {
        saveSelApps();
    });
    ui.setEvent(ui.tianjidsp_down, "click", function (view) {
        m.uri = "http://klkd.aiktang.cn/klkd/share/html/download_share.html?invitation=5567912";
        ui.openActivity(m);
    });
    //发财树视频
    ui.setEvent(ui.fcssp, "checkedChange", function (view, isChecked) {
        saveSelApps();
    });
    ui.setEvent(ui.fcssp_down, "click", function (view) {
        m.uri = "http://klkd.aiktang.cn/klkd/share/html/download_share.html?invitation=5567912";
        ui.openActivity(m);
    });
    //兔子赚钱
    ui.setEvent(ui.tuzizq, "checkedChange", function (view, isChecked) {
        saveSelApps();
    });
    ui.setEvent(ui.tuzizq_down, "click", function (view) {
        m.uri = "http://klkd.aiktang.cn/klkd/share/html/download_share.html?invitation=5567912";
        ui.openActivity(m);
    });
    //微看点
    ui.setEvent(ui.weikandian, "checkedChange", function (view, isChecked) {
        saveSelApps();
    });
    ui.setEvent(ui.weikandian_down, "click", function (view) {
        m.uri = "http://klkd.aiktang.cn/klkd/share/html/download_share.html?invitation=5567912";
        ui.openActivity(m);
    });
    //聚看点
    ui.setEvent(ui.jukandian, "checkedChange", function (view, isChecked) {
        saveSelApps();
    });
    ui.setEvent(ui.jukandian_down, "click", function (view) {
        m.uri = "http://klkd.aiktang.cn/klkd/share/html/download_share.html?invitation=5567912";
        ui.openActivity(m);
    });

    //再来短视频
    ui.setEvent(ui.zailaidsp, "checkedChange", function (view, isChecked) {
        saveSelApps();
    });
    ui.setEvent(ui.zailaidsp_down, "click", function (view) {
        m.uri = "http://klkd.aiktang.cn/klkd/share/html/download_share.html?invitation=5567912";
        ui.openActivity(m);
    });
    //再来极速版
    ui.setEvent(ui.zailaijsb, "checkedChange", function (view, isChecked) {
        saveSelApps();
    });
    ui.setEvent(ui.zailaijsb_down, "click", function (view) {
        m.uri = "http://klkd.aiktang.cn/klkd/share/html/download_share.html?invitation=5567912";
        ui.openActivity(m);
    });
    //长猿短视频
    ui.setEvent(ui.changyuandsp, "checkedChange", function (view, isChecked) {
        saveSelApps();
    });
    ui.setEvent(ui.changyuandsp_down, "click", function (view) {
        m.uri = "http://klkd.aiktang.cn/klkd/share/html/download_share.html?invitation=5567912";
        ui.openActivity(m);
    });
    //北猴短视频
    ui.setEvent(ui.beihoudsp, "checkedChange", function (view, isChecked) {
        saveSelApps();
    });
    ui.setEvent(ui.beihoudsp_down, "click", function (view) {
        m.uri = "http://klkd.aiktang.cn/klkd/share/html/download_share.html?invitation=5567912";
        ui.openActivity(m);
    });
    //悦刷
    ui.setEvent(ui.yueshua, "checkedChange", function (view, isChecked) {
        saveSelApps();
    });
    ui.setEvent(ui.yueshua_down, "click", function (view) {
        m.uri = "http://klkd.aiktang.cn/klkd/share/html/download_share.html?invitation=5567912";
        ui.openActivity(m);
    });
    //风鹭短视频
    ui.setEvent(ui.fengludsp, "checkedChange", function (view, isChecked) {
        saveSelApps();
    });
    ui.setEvent(ui.fengludsp_down, "click", function (view) {
        m.uri = "http://klkd.aiktang.cn/klkd/share/html/download_share.html?invitation=5567912";
        ui.openActivity(m);
    });
    //花梨短视频
    ui.setEvent(ui.hualidsp, "checkedChange", function (view, isChecked) {
        saveSelApps();
    });
    ui.setEvent(ui.hualidsp_down, "click", function (view) {
        m.uri = "http://klkd.aiktang.cn/klkd/share/html/download_share.html?invitation=5567912";
        ui.openActivity(m);
    });

    //鸦风短视频
    ui.setEvent(ui.yafengdsp, "checkedChange", function (view, isChecked) {
        saveSelApps();
    });
    ui.setEvent(ui.yafengdsp_down, "click", function (view) {
        m.uri = "http://klkd.aiktang.cn/klkd/share/html/download_share.html?invitation=5567912";
        ui.openActivity(m);
    });

    //茶豚短视频
    ui.setEvent(ui.chatundsp, "checkedChange", function (view, isChecked) {
        saveSelApps();
    });
    ui.setEvent(ui.chatundsp_down, "click", function (view) {
        m.uri = "http://klkd.aiktang.cn/klkd/share/html/download_share.html?invitation=5567912";
        ui.openActivity(m);
    });

    //千柚短视频
    ui.setEvent(ui.qianyoudsp, "checkedChange", function (view, isChecked) {
        saveSelApps();
    });
    ui.setEvent(ui.qianyoudsp_down, "click", function (view) {
        m.uri = "http://klkd.aiktang.cn/klkd/share/html/download_share.html?invitation=5567912";
        ui.openActivity(m);
    });

    //萌虎短视频
    ui.setEvent(ui.menghudsp, "checkedChange", function (view, isChecked) {
        saveSelApps();
    });
    ui.setEvent(ui.menghudsp_down, "click", function (view) {
        m.uri = "http://klkd.aiktang.cn/klkd/share/html/download_share.html?invitation=5567912";
        ui.openActivity(m);
    });

    //月兔短视频
    ui.setEvent(ui.yuetudsp, "checkedChange", function (view, isChecked) {
        saveSelApps();
    });
    ui.setEvent(ui.yuetudsp_down, "click", function (view) {
        m.uri = "http://klkd.aiktang.cn/klkd/share/html/download_share.html?invitation=5567912";
        ui.openActivity(m);
    });

    //弹梨短视频
    ui.setEvent(ui.tanlidsp, "checkedChange", function (view, isChecked) {
        saveSelApps();
    });
    ui.setEvent(ui.tanlidsp_down, "click", function (view) {
        m.uri = "http://klkd.aiktang.cn/klkd/share/html/download_share.html?invitation=5567912";
        ui.openActivity(m);
    });

    //火爆短视频
    ui.setEvent(ui.huobaodsp, "checkedChange", function (view, isChecked) {
        saveSelApps();
    });
    ui.setEvent(ui.huobaodsp_down, "click", function (view) {
        m.uri = "http://klkd.aiktang.cn/klkd/share/html/download_share.html?invitation=5567912";
        ui.openActivity(m);
    });

    //虎猫短视频
    ui.setEvent(ui.humaodsp, "checkedChange", function (view, isChecked) {
        saveSelApps();
    });
    ui.setEvent(ui.humaodsp_down, "click", function (view) {
        m.uri = "http://klkd.aiktang.cn/klkd/share/html/download_share.html?invitation=5567912";
        ui.openActivity(m);
    });

    //弯豆短视频
    ui.setEvent(ui.wandoudsp, "checkedChange", function (view, isChecked) {
        saveSelApps();
    });
    ui.setEvent(ui.wandoudsp_down, "click", function (view) {
        m.uri = "http://klkd.aiktang.cn/klkd/share/html/download_share.html?invitation=5567912";
        ui.openActivity(m);
    });

    //乐茶
    ui.setEvent(ui.lechadsp, "checkedChange", function (view, isChecked) {
        saveSelApps();
    });
    ui.setEvent(ui.lechadsp_down, "click", function (view) {
        m.uri = "http://klkd.aiktang.cn/klkd/share/html/download_share.html?invitation=5567912";
        ui.openActivity(m);
    });

    //欣隆
    ui.setEvent(ui.xinlongdsp, "checkedChange", function (view, isChecked) {
        saveSelApps();
    });
    ui.setEvent(ui.xinlongdsp_down, "click", function (view) {
        m.uri = "http://klkd.aiktang.cn/klkd/share/html/download_share.html?invitation=5567912";
        ui.openActivity(m);
    });

    //玩赚
    ui.setEvent(ui.wanzhuandsp, "checkedChange", function (view, isChecked) {
        saveSelApps();
    });
    ui.setEvent(ui.wanzhuandsp_down, "click", function (view) {
        m.uri = "http://klkd.aiktang.cn/klkd/share/html/download_share.html?invitation=5567912";
        ui.openActivity(m);
    });

    //勤赚
    ui.setEvent(ui.qinzhuandsp, "checkedChange", function (view, isChecked) {
        saveSelApps();
    });
    ui.setEvent(ui.qinzhuandsp_down, "click", function (view) {
        m.uri = "http://klkd.aiktang.cn/klkd/share/html/download_share.html?invitation=5567912";
        ui.openActivity(m);
    });

    //看点
    ui.setEvent(ui.kandiandsp, "checkedChange", function (view, isChecked) {
        saveSelApps();
    });
    ui.setEvent(ui.kandiandsp_down, "click", function (view) {
        m.uri = "http://klkd.aiktang.cn/klkd/share/html/download_share.html?invitation=5567912";
        ui.openActivity(m);
    });

    //闪鸭短视频
    ui.setEvent(ui.shanyadsp, "checkedChange", function (view, isChecked) {
        saveSelApps();
    });
    ui.setEvent(ui.shanyadsp_down, "click", function (view) {
        m.uri = "http://klkd.aiktang.cn/klkd/share/html/download_share.html?invitation=5567912";
        ui.openActivity(m);
    });

    //鲨宝短视频
    ui.setEvent(ui.shabaodsp, "checkedChange", function (view, isChecked) {
        saveSelApps();
    });
    ui.setEvent(ui.shabaodsp_down, "click", function (view) {
        m.uri = "http://klkd.aiktang.cn/klkd/share/html/download_share.html?invitation=5567912";
        ui.openActivity(m);
    });

    //火参
    ui.setEvent(ui.huocandsp, "checkedChange", function (view, isChecked) {
        saveSelApps();
    });
    ui.setEvent(ui.huocandsp_down, "click", function (view) {
        m.uri = "http://klkd.aiktang.cn/klkd/share/html/download_share.html?invitation=5567912";
        ui.openActivity(m);
    });

    //通宝
    ui.setEvent(ui.tongbao, "checkedChange", function (view, isChecked) {
        saveSelApps();
    });
    ui.setEvent(ui.tongbao_down, "click", function (view) {
        m.uri = "http://klkd.aiktang.cn/klkd/share/html/download_share.html?invitation=5567912";
        ui.openActivity(m);
    });

    //亨优
    ui.setEvent(ui.hengyou, "checkedChange", function (view, isChecked) {
        saveSelApps();
    });
    ui.setEvent(ui.hengyou_down, "click", function (view) {
        m.uri = "http://klkd.aiktang.cn/klkd/share/html/download_share.html?invitation=5567912";
        ui.openActivity(m);
    });

    //弹梨
    ui.setEvent(ui.tanli, "checkedChange", function (view, isChecked) {
        saveSelApps();
    });
    ui.setEvent(ui.tanli_down, "click", function (view) {
        m.uri = "http://klkd.aiktang.cn/klkd/share/html/download_share.html?invitation=5567912";
        ui.openActivity(m);
    });

    // //查猪
    // ui.setEvent(ui.chazhu, "checkedChange", function (view, isChecked) {
    //     saveSelApps();
    // });
    // ui.setEvent(ui.chazhu_down, "click", function (view) {
    //     m.uri = "http://klkd.aiktang.cn/klkd/share/html/download_share.html?invitation=5567912";
    //     ui.openActivity(m);
    // });

    //--------------------
    //抖音
    ui.setEvent(ui.douyin, "checkedChange", function (view, isChecked) {
        yj_saveSelApps();
    });
    ui.setEvent(ui.douyin_down, "click", function (view) {
        m.uri = "http://klkd.aiktang.cn/klkd/share/html/download_share.html?invitation=5567912";
        ui.openActivity(m);
    });
    //抖音极速版
    ui.setEvent(ui.douyinjsb, "checkedChange", function (view, isChecked) {
        yj_saveSelApps();
    });
    ui.setEvent(ui.douyinjsb_down, "click", function (view) {
        m.uri = "http://klkd.aiktang.cn/klkd/share/html/download_share.html?invitation=5567912";
        ui.openActivity(m);
    });
    //快手
    ui.setEvent(ui.kuaishou, "checkedChange", function (view, isChecked) {
        yj_saveSelApps();
    });
    ui.setEvent(ui.kuaishou_down, "click", function (view) {
        m.uri = "http://klkd.aiktang.cn/klkd/share/html/download_share.html?invitation=5567912";
        ui.openActivity(m);
    });
    //快手极速版
    ui.setEvent(ui.kuaishoujsb, "checkedChange", function (view, isChecked) {
        yj_saveSelApps();
    });
    ui.setEvent(ui.kuaishoujsb_down, "click", function (view) {
        m.uri = "http://klkd.aiktang.cn/klkd/share/html/download_share.html?invitation=5567912";
        ui.openActivity(m);
    });
    //今日头条
    ui.setEvent(ui.jrtt, "checkedChange", function (view, isChecked) {
        yj_saveSelApps();
    });
    ui.setEvent(ui.jrtt_down, "click", function (view) {
        m.uri = "http://klkd.aiktang.cn/klkd/share/html/download_share.html?invitation=5567912";
        ui.openActivity(m);
    });
    //今日头条极速版
    ui.setEvent(ui.jrttjsb, "checkedChange", function (view, isChecked) {
        yj_saveSelApps();
    });
    ui.setEvent(ui.jrttjsb_down, "click", function (view) {
        m.uri = "http://klkd.aiktang.cn/klkd/share/html/download_share.html?invitation=5567912";
        ui.openActivity(m);
    });
    //百度极速版
    ui.setEvent(ui.bdjsb, "checkedChange", function (view, isChecked) {
        yj_saveSelApps();
    });
    ui.setEvent(ui.bdjsb_down, "click", function (view) {
        m.uri = "http://klkd.aiktang.cn/klkd/share/html/download_share.html?invitation=5567912";
        ui.openActivity(m);
    });
    //QQ浏览器
    ui.setEvent(ui.qqllq, "checkedChange", function (view, isChecked) {
        yj_saveSelApps();
    });
    ui.setEvent(ui.qqllq_down, "click", function (view) {
        m.uri = "http://klkd.aiktang.cn/klkd/share/html/download_share.html?invitation=5567912";
        ui.openActivity(m);
    });

    //系统浏览器
    ui.setEvent(ui.llq, "checkedChange", function (view, isChecked) {
        yj_saveSelApps();
    });
    ui.setEvent(ui.llq_down, "click", function (view) {
        m.uri = "http://klkd.aiktang.cn/klkd/share/html/download_share.html?invitation=5567912";
        ui.openActivity(m);
    });
    //懂车帝
    ui.setEvent(ui.dcd, "checkedChange", function (view, isChecked) {
        yj_saveSelApps();
    });
    ui.setEvent(ui.dcd_down, "click", function (view) {
        m.uri = "http://klkd.aiktang.cn/klkd/share/html/download_share.html?invitation=5567912";
        ui.openActivity(m);
    });
    //易车
    ui.setEvent(ui.yiche, "checkedChange", function (view, isChecked) {
        yj_saveSelApps();
    });
    ui.setEvent(ui.yiche_down, "click", function (view) {
        m.uri = "http://klkd.aiktang.cn/klkd/share/html/download_share.html?invitation=5567912";
        ui.openActivity(m);
    });
    //汽车之家
    ui.setEvent(ui.qczj, "checkedChange", function (view, isChecked) {
        yj_saveSelApps();
    });
    ui.setEvent(ui.qczj_down, "click", function (view) {
        m.uri = "http://klkd.aiktang.cn/klkd/share/html/download_share.html?invitation=5567912";
        ui.openActivity(m);
    });
    //拼多多
    ui.setEvent(ui.pdd, "checkedChange", function (view, isChecked) {
        yj_saveSelApps();
    });
    ui.setEvent(ui.pdd_down, "click", function (view) {
        m.uri = "http://klkd.aiktang.cn/klkd/share/html/download_share.html?invitation=5567912";
        ui.openActivity(m);
    });
    //京东
    ui.setEvent(ui.jingdong, "checkedChange", function (view, isChecked) {
        yj_saveSelApps();
    });
    ui.setEvent(ui.jingdong_down, "click", function (view) {
        m.uri = "http://klkd.aiktang.cn/klkd/share/html/download_share.html?invitation=5567912";
        ui.openActivity(m);
    });
    //淘宝
    ui.setEvent(ui.taobao, "checkedChange", function (view, isChecked) {
        yj_saveSelApps();
    });
    ui.setEvent(ui.taobao_down, "click", function (view) {
        m.uri = "http://klkd.aiktang.cn/klkd/share/html/download_share.html?invitation=5567912";
        ui.openActivity(m);
    });
    //天猫
    ui.setEvent(ui.tianmao, "checkedChange", function (view, isChecked) {
        yj_saveSelApps();
    });
    ui.setEvent(ui.tianmao_down, "click", function (view) {
        m.uri = "http://klkd.aiktang.cn/klkd/share/html/download_share.html?invitation=5567912";
        ui.openActivity(m);
    });

}

function 字符串_分割(str,分割符) {
    if (str.includes(分割符)) { //'\n'
        return str.split(分割符);
    } else {
        return [str];
    }
}

function typeOf(arg) {
    if (arg === null) return null
    if (arg === undefined) return undefined
    return arg.constructor.name
}

function AutoServices服务状态检测(){
    ui.run(1000,function (view) {
        let startEnv1 = ui.getViewValue(ui.Pgm_Swt_自动化服务_开关);
        logd("[自动化服务]的当前值: " + startEnv1);//Pgm_Swt_自动化服务_开关 是 [自动化服务]切换开关tag;
        if (ui.isServiceOk()) { //[自动化服务是否正常]
            logd("[自动化服务]已打开");
            ui.Pgm_Swt_自动化服务_开关.setChecked(true);//设置为[已打开]状态
            ui.saveAllConfig();
        } else {
            logd("[自动化服务]未打开");//设置为[未打开]状态
            ui.Pgm_Swt_自动化服务_开关.setChecked(false);
            ui.saveAllConfig();
        }
    });
}

function 当前运行模式检测() {
    ui.run(10, function (view) {
        if (ui.isAccMode()) {
            logd("无障碍模式")
            toast("无障碍模式");
            ui.Pgm_Rdo_代理模式.setChecked(false);
            ui.Pgm_Rdo_无障碍模式.setChecked(true);
            // ui.setViewValue(ui.modelSwitch, "无障碍模式");
            // logd("无障碍：" + ui.getViewValue(ui.Pgm_Rdo_无障碍模式));
        }
        if (ui.isAgentMode()) {
            logd("代理模式");
            toast("代理模式");
            ui.Pgm_Rdo_代理模式.setChecked(true);
            ui.Pgm_Rdo_无障碍模式.setChecked(false);
            // ui.setViewValue(ui.modelSwitch, "代理模式");
            // logd("代理：" + ui.getViewValue(ui.Pgm_Rdo_代理模式));
        }
        ui.saveAllConfig();
    })
}

function 脚本主模式配置错误() {
    //模式合理时,返回false;
    //模式不合理时,返回"说明"
    let 说明 = "";
    if (脚本模式_专注养机 === 脚本模式_养刷异步 && !脚本模式_专注养机){
        /*根据ui.js里的设置,脚本模式_专注养机 === 脚本模式_养刷异步 只可能为false,不可能为true;
        即:此时同时为false的情况
        * * */
        if (!脚本模式_养刷同步){ //三种情况,不同同时为false;

            if (刷金APP_未选){
                说明 = "[养机模式开关]中三项不同同时关闭";
                return 说明;
            }else{
                说明 = "已勾选[刷金]APP,需开启[边养边刷]并设置";
                return 说明;
            }
        }
        if (刷金APP_未选){
            说明 = "当前为[刷金],但未选择任何刷金APP";
            return 说明;
        }else{
            //此情况为[正确]情况;
        }

    }
    if ((脚本模式_专注养机) && 养机APP_未选){
        说明 = "当前为[专注养机],但未选择任何养机APP";
        return 说明;
    }
    if ((脚本模式_养刷异步) && 养机APP_未选){ //含:(脚本模式_养刷同步 && 脚本模式_养刷异步) && 养机APP_未选 的情况
        说明 = "当前为[先养后刷],但未选择任何养机APP";
        return 说明;
    }
    if ((脚本模式_养刷异步) && 刷金APP_未选){  //新加的;
        说明 = "当前为[先养后刷],但未选择任何刷金APP";
        return 说明;
    }
    if ((脚本模式_养刷同步 && ui.getViewValue(ui.Yj_Rdo_低于阈值_养机)) && 养机APP_未选){
        说明 = "已选[切换至养机程序],但未勾选养机APP";
        return 说明;
    }
    let 任务分支;
    if (脚本模式_专注养机){
        任务分支 = 1;
    }else if (脚本模式_养刷异步){
        任务分支 = 2;
    }else{
        if (脚本模式_养刷同步) {
            if (ui.getViewValue(ui.Yj_Rdo_低于阈值_养机)) { //养机 Yj_Rdo_低于阈值_养机
                任务分支 = 4;
            } else { //不养机
                任务分支 = 3;
            }
        }else{

        }
    }
    if (任务分支 !== 3){
        含_养 = true;
    }
    if (任务分支 !== 1){
        含_刷 = true;
    }
    return false;
}

function 字段检查非法() {

    if (ui.getViewValue(ui.一级内容_1_栏目_5_开关)){ //在线支付设置
        let 支付密码 = ui.getViewValue(ui.Yj_在线支付_Edt_密码);
        if (!符合密码规范(支付密码)){
            return true;//此时不符合密码规范;
        }
    }
    function 符合密码规范(str) {
        logd(str);
        return /^\d{6}$/.test(str);
    }
}

function floatWindow() {
    showLogWindow();
    requestFloatViewPermission(1000);
    closeLogWindow();
    sleep(1000);
    var m = {
        "x": 0,//X 坐标
        "y": 0, //Y坐标 XY坐标定位位置
        "w": 1080,
        "h": 1000, // w h 宽 高
        "textSize": 12,  // 日志打印字体大小
        //"backgroundColor": "0x00404040", //自定义背景颜色值
        "backgroundColor": "#FFFAFA", //自定义背景颜色值
        "title": "",
        "showTitle": false
    };
    //setLogText("开始运行...","#FFFFFF",18)

    // var m = {
    //     "x": 30,//X 坐标
    //     "y": 100, //Y坐标 XY坐标定位位置
    //     "w": 800,
    //     "h": 1000, // w h 宽 高
    //     "textSize": 12,  // 日志打印字体大小
    //     //"backgroundColor": "0x00404040", //自定义背景颜色值
    //     "backgroundColor": "#FFFAFA", //自定义背景颜色值
    //     "title": "",
    //     "showTitle": false
    // }
    setLogViewSizeEx(m);
    sleep(300);
    closeLogWindow();

    //下面这个是新合并进来的
    showLogWindow();//展示日志浮窗
}

function ProgressRDialog() {
    let dialog = new ProgressDialog(ui.getActivity());
    dialog.setMessage("正在加载中");
    dialog.show();
    return dialog;
    //dialog.dismiss();  关闭对话框 按需触发
}

function 组合标签时的覆盖数据_我的原写法(newObjectS) {
    /* 覆盖数据就是storage的:没有就建立,有就存入;
    打开ui,直接点击[最终预览]或[保存]时会出错,因为:"化妆品"对象里,没有"化妆品"这个key;
    1,当前已选;
    2,当前未选;
    对已选的,进行初始化;
    * */
    let dialog = ui.parseView("fuChuang_zhineng.xml");
    let lyAdd = dialog.findViewWithTag("lyAdd");

    let 检索表 = {};
    let newObjectS1 = {};
    let newObjectS2 = {};
    for (let key in newObjectS) { //先区分[已勾选][未勾选]
        if (key !== "自定义"){
            if (newObjectS[key]){
                newObjectS1[key] = newObjectS[key];
            }else{
                newObjectS2[key] = newObjectS[key];
            }
        }else{
            logd("自定义值,不收录进智能模式:"+newObjectS[key]);
        }
    }
    logi("已勾选的:"+JSON.stringify(newObjectS1));
    logi("未勾选的:"+JSON.stringify(newObjectS2));
    for (let key in newObjectS1) {  //已勾选 存入数据;

        let item = ui.parseView("fuChuang_zhineng_1.xml");
        // 在tag 为lyAdd的 视图添加解析的布局view对象
        lyAdd.addView(item);
        // 通过转化的item 对象获取 xml定义的 tag 对应的view对象
        let item_title = item.findViewWithTag("znbq_bjk_title");
        let item_content = item.findViewWithTag("znbq_bjk_content");
        // 检索表[key] = item_content;

        // item_title.setText(key);
        let fileName = key;

        let defaultValue = "";
        let content = readConfiguration(fileName, key, defaultValue);
        logd("fileName: " + fileName + " key: "+ key +" 值: " + content);
        item_content.setText(content);

        let content1 = item_content.getText(); //这里我把握不准,重点是这里,确保不能A的数据存到B文件中去;
        //关键是上面这行,如何确保,getText()获取的是"这个"控件的文本,而不是"别的"控件的文本;
        logd(key + " : " + content1);
        let jieguo = readConfiguration(fileName, key, content1, true);

        logd("fileName: " + fileName + " key: "+ key +" 值: " + jieguo);
    }
    //[已勾选][未勾选]都要存储,仅仅是显示时的位置不同,字体颜色不同
    for (let key in newObjectS2) {

        let item = ui.parseView("fuChuang_zhineng_1.xml");
        // 在tag 为lyAdd的 视图添加解析的布局view对象
        lyAdd.addView(item);
        // 通过转化的item 对象获取 xml定义的 tag 对应的view对象
        let item_title = item.findViewWithTag("znbq_bjk_title");
        let item_content = item.findViewWithTag("znbq_bjk_content");
        // 检索表[key] = item_content;

        let fileName = key;

        let defaultValue = "";
        let content = readConfiguration(fileName, key, defaultValue);

        let content1 = item_content.getText(); //这里我把握不准,重点是这里,确保不能A的数据存到B文件中去;
        //关键是上面这行,如何确保,getText()获取的是"这个"控件的文本,而不是"别的"控件的文本;
        logd(key + " : " + content1);
        let jieguo = readConfiguration(fileName, key, content1, true);

        logd("fileName: " + fileName + " key: "+ key +" 值: " + jieguo);
    }
}

function 智能模式_弹窗_未分勾选未勾选(newObjectS) {

    let dialog = ui.parseView("fuChuang_zhineng.xml");
    let lyAdd = dialog.findViewWithTag("lyAdd");

    let 检索表 = {};
    for (let key in newObjectS) {

        let item = ui.parseView("fuChuang_zhineng_1.xml");
        // 在tag 为lyAdd的 视图添加解析的布局view对象
        lyAdd.addView(item);
        // 通过转化的item 对象获取 xml定义的 tag 对应的view对象
        let item_title = item.findViewWithTag("znbq_bjk_title");
        let item_content = item.findViewWithTag("znbq_bjk_content");
        检索表[key] = item_content;

        item_title.setText(key);
        let fileName = key;
        let defaultValue = "";
        let content = readConfiguration(fileName, key, defaultValue);

        logd("fileName: " + fileName + " key: "+ key +" 值: " + content);

        item_content.setText(content);
    }

    let save = false;

    ui.customDialog({
            "fullScreen": false,
            "cancelable": false
        },
        dialog,
        function (dialog, v) {
            //这里面可以拿到视图对象，然后进行设置各种事件
            logd("111");

            let edtokBtn = v.findViewWithTag("edtokBtn");
            let edtcloseBtn = v.findViewWithTag("edtcloseBtn");

            //Edit_tagWord.setText(readConfiguration("智能模式_标签", "znbq_bjk", 数值) + "");//打开对话框后设置之前保存得值

            edtokBtn.setOnClickListener(function (view) {
                save = true;
                dialog.doDismiss();
            });
            edtcloseBtn.setOnClickListener(function (v) {
                dialog.doDismiss();
            });

        }, function () {

            if (save) {
                logd("[智能模式_弹窗]保存");
                for (let key in newObjectS) {

                    let fileName = key;
                    let content = 检索表[key].getText(); //这里我把握不准,重点是这里,确保不能A的数据存到B文件中去;
                    //关键是上面这行,如何确保,getText()获取的是"这个"控件的文本,而不是"别的"控件的文本;
                    logd(key + " : " + content);
                    let jieguo = readConfiguration(fileName, key, content, true);

                    logd("fileName: " + fileName + " key: "+ key +" 值: " + jieguo);

                    let jieguo11 = readConfiguration(fileName, key, "仍为空") + "";
                    logd(jieguo11);
                }
                logd("---- [智能模式_弹窗]存储完毕 ----");
                //下面是保存完后,再读一遍;
                for (let key in newObjectS) {

                    let fileName = key;
                    let defaultValue = "";
                    let content = readConfiguration(fileName, key, defaultValue);
                    logd(key + " : " + content);
                }

            } else {
                logd("不保存")
            }
            dialog = null;
        })

}

function 最终标签预览111(汇总数据) {
    //汇总数据格式:{"化妆品":["化妆品 旗舰店 直播 下载","兰蔻 形象店","雅诗兰黛 形象店"],"美容":["美容 旗舰店 直播 下载"],"瘦身":["瘦身 旗舰店 直播 下载"]}

    let dia = ui.parseView("fuChuang_zuizhong.xml");
    let Edittextview;

    let content = "";
    logd(JSON.stringify(汇总数据));

    for (let key in 汇总数据) {
        if (key !== "说明"){
            content = content + "   [" + key + "]\n";
            let 数组 =  汇总数据[key];
            for (let i = 0; i <数组.length; i++) {
                content = content + 数组[i] + "\n";
            }
        }

    }
    let resume = 汇总数据["说明"];
    logd(resume);

    // logd(content);
    ui.customDialog({
            "fullScreen": false,
            "cancelable": false
        },
        dia,
        function (dia, v) {
            //这里面可以拿到视图对象，然后进行设置各种事件

            let saveConfiguration = v.findViewWithTag("fOk1");

            let txtResume = v.findViewWithTag("final_resume");
            // txtResume.setText("");
            txtResume.setText(resume);

            Edittextview = v.findViewWithTag("final_content");
            Edittextview.setText(content);//打开对话框后设置之前保存得值

            // 复选框 监听事件 自动保存

            saveConfiguration.setOnClickListener(function (v) {
                dia.doDismiss();
                // dialog = null; //放这个!
            });

        }, function () {

            dia = null;
        })
}

/**
 * @作者 Mr_老鬼 QQ:1156346325
 * @函数用途   对话框 话术设置
 * @创建时间 16:49 2021-11-8
 * @参数
 * @return
 **/
function dialogHs() {
    //  解析对话框 xml布局
    let dialogView = ui.parseView("fuChuang_zhineng.xml");
    let detTV;
    // 加载对话框并显示
    logd("111");
    ui.customDialog({
            "fullScreen": false, //  设置为非全屏
            "cancelable": false   //  可以取消
        },
        //  这是解析的对话框对象
        dialogView,
        // 这里是各种事件操作
        function (dialog, v) {
            //设置各种事件 省略。。。
            //  这里是获取对话框布局的所有要控制的view对象。根据定义的 tag 获取
            let edtokBtn = v.findViewWithTag("edtokBtn");
            let edtcloseBtn = v.findViewWithTag("edtcloseBtn")
            detTV = v.findViewWithTag("界面编辑框话术内容")
            let myDialog = dialog;
            //  确定按钮， 获取编辑框内容并保存配置
            saveEdit(detTV, "界面编辑框话术内容");
            edtokBtn.setOnClickListener(function (v) {
                myDialog.doDismiss();// 关闭对话框
            })
            //  取消按钮，关闭对话框
            edtcloseBtn.setOnClickListener(function (v) {
                myDialog.doDismiss();
            })
        }, function () {
        })
}

function 智能标签编辑框内容(newObject) {
    let 结果 = "";
    logd(JSON.stringify(newObject));
    for (let key in newObject) {
        // 读取或创建对应的存储文件
        let fileName = key;
        let defaultValue = "-- " + key + " --\n";
        //这是写了几十个fileName名字的storage文件;
        let 文件内容 = readConfiguration(fileName, key, defaultValue, true);
        logd(文件内容);
        // 拼接结果字符串
        结果 += 文件内容;
    }
    return 结果;
}

function 标签组合(data) {
    /*这个,是Edit_Modifier只有1个词语的情况,未对其进行分割;
    * */
    if (!data.Edit_tagWord) {
        return false;
    }

    if (data.Edit_tagWord.includes(',') || data.Edit_tagWord.includes('，') || data.Edit_tagWord.includes('|')) {
        var arr = data.Edit_tagWord.split(/[，,|]/);
    } else {
        var arr = [data.Edit_tagWord];
    }

    if (!data.Edit_Modifier) {
        return arr;
    }

    var result = [];
    for (var i = 0; i < arr.length; i++) {
        var str = '';
        if (data.E_direction === '前缀') {
            str = data.Edit_Modifier + ' ' + arr[i];
        } else if (data.E_direction === '后缀') {
            str = arr[i] + ' ' + data.Edit_Modifier;
        } else if (data.E_direction === '随机') {
            var rand = Math.random();
            str = rand < 0.5 ? data.Edit_Modifier + ' ' + arr[i] : arr[i] + ' ' + data.Edit_Modifier;
        }
        result.push(str);
    }

    return result;
}

/* 对象遍历用法参考:
           let keys = Object.keys(对象);
for (let i = 0; i <keys.length; i++) {
    //logd("对象名:"+keys[i] + "| 对象值:" + 对象[keys[i]]);
    let obj = new Object();
    obj.id = keys[i];
    obj.val = 对象[keys[i]];
    数组.push(obj)
    这里面,id val 是我规定的固定名称,若改变,记得在引用函数也需要改变;否则引用obj.val为空了
}
* */

//先将二级对象转换成一级对象;
// let newObject = {};
// for (let key in bq_objectList) {
//     //newObject[key] = {};
//     for (let subKey in bq_objectList[key]) {
//         if (bq_objectList[key][subKey] !== undefined) {
//             newObject[subKey] = subKey;
//         }
//     }
// }
//上面是原写法:这是storages存储的;[标签编辑_弹窗]内部的所有信息;
//下面是继续补充:这是ui.saveAllConfig()存储的;是否勾选;
// for (let key in bq_objectList) {
//     //newObject[key] = {};
//     for (let subKey in bq_objectList[key]) {
//         if (bq_objectList[key][subKey] !== undefined) {
//             //logd(getuiJSON["标签_"+ subKey]);
//             if (getuiJSON["标签_"+ subKey] === true){
//                 newObject[subKey] = true;  //目的:化妆品 : true
//             }else{
//                 newObject[subKey] = false; //化妆品 : false
//             }
//         }
//     }
// }


//let editArr = [
// ui.线上随机follow最少, ui.线上随机follow最多, ui.线上随机换下一个直播间,
// ui.线上随机延迟最少, ui.线上随机延迟最多, ui.线上随机点赞最少, ui.线上随机点赞最多, ui.线上随机换下一个直播间, ui.线上随机回复内容,
// ui.线上指定指定用户ID, ui.线上指定点赞最少, ui.线上指定点赞最多, ui.线上指定间隔最最少, ui.线上指定间隔最最多, ui.线上指定回复内容,
// ui.线下指定指定互动ID, ui.线下指定视频最少, ui.线下指定视频最多, ui.线下指定观看最少, ui.线下指定观看最多, ui.线下指定回复内容,
// ui.线下随机私信最少, ui.线下随机私信最多, ui.线下随机延迟最少, ui.线下随机延迟最多, ui.线下随机视频最少, ui.线下随机视频最多,
// ui.线下随机观看最少, ui.线下随机观看最多, ui.线下随机回复内容
//];
// for (let i = 0; i < editArr.length; i++) {
//     let edit = editArr[i];
//     editListener(edit)
// }

// ui.setEvent(ui.start_job, "click", function (view) {
//     let editArrStr = ["账号", "密码", "线上随机follow最少", "线上随机follow最多", "线上随机换下一个直播间",
//         "线上随机延迟最少", "线上随机延迟最多", "线上随机点赞最少", "线上随机点赞最多", "线上随机换下一个直播间", "线上随机回复内容",
//         "线上指定指定用户ID", "线上指定点赞最少", "线上指定点赞最多", "线上指定间隔最最少", "线上指定间隔最最多", "线上指定回复内容",
//         "线下指定指定互动ID", "线下指定视频最少", "线下指定视频最多", "线下指定观看最少", "线下指定观看最多", "线下指定回复内容",
//         "线下随机私信最少", "线下随机私信最多", "线下随机延迟最少", "线下随机延迟最多", "线下随机视频最少", "线下随机视频最多",
//         "线下随机观看最少", "线下随机观看最多", "线下随机回复内容"];
//     for (let i = 0; i < editArrStr.length; i++) {
//         logw("检查参数中" + editArrStr[i] + " :  " + readConfigString(editArrStr[i]));
//         if (readConfigString(editArrStr[i]) === "" || readConfigString(editArrStr[i]) === undefined
//             || readConfigString(editArrStr[i]) === null || readConfigString(editArrStr[i]) === "undefined") {
//             toast(editArrStr[i] + "配置有误");
//         }
//     }
//
//     ui.start();
// })

/*通过 "key:yj_new_guanjianci_btn值:  新增 "可知,通过[ui.saveAllConfig]存入的数据,[清空缓存][清除全部数据]都无法删除
* */
/* 应该是删除通过putShareData()存储的数据:
ui.clearAllShareData()
* */
/*storage方式保存的数据
let storage= storages.create("123");
// 清空所有存储
storage.clear()；
// 清除某个key 的值
storage.remove("key")
*** SAGE 解释 ***
storage.clear() 命令是用于删除存储对象中的所有键值对，而不是用于删除存储文件本身。
如果你想要删除存储文件本身，应该使用 storages.remove() 方法。
* */

/*
logd("获取所有的UI参数：" + ui.getConfigJSON());
logd("共"+Object.keys(ui.getConfigJSON()).length+"条");
let getuiJSON = ui.getConfigJSON();
for (let key in getuiJSON) {
    if (getuiJSON.hasOwnProperty(key)) {
        logw("key:" + key + " 值:" + getuiJSON[key]);
    }else{
        //这条是不计数的;
        // logw("该值未非法值:key:" + key + "值: " + getuiJSON[key])
    }
}
经测试,ui.js中,ui.getConfigJSON()输出44条信息,其key为函数名,key值为函数,用法我不理解,
也不是我要用的"存储ui控件tag值",所以ui.js中就不用这种用法了,直接在main.js中用吧.
* */



// function main() {
//     // 加载布局文件
//     var layout;
//     //1,先判断一个对象layout,若不为空,则解析该对象layout:layout = ui.layout("参数设置", "layout");
//     //2,若为空,则解析:layout = ui.layout("参数设置", "main.xml"),同时,将结果复制给layout;
//     //这个逻辑是否可实现缓存的目的?
//     //
//     if (layoutCache["main.xml"] ==="空"){
//
//     }
//     // 将布局文件缓存起来
//
//
//     // 在后续操作中可以直接使用缓存的布局文件
//     // ...
// }

// ui.run(100, function (view) {
//     // let 模式2 = ui.getViewValue(ui.一级内容_4_栏目_2_开关_主模式2);
//     if (ui.getViewValue(ui.一级内容_4_栏目_2_开关_主模式2)) {
//         ui.一级内容_4_栏目_2_开关_主模式2.setChecked(false);
//     }
//     ui.saveAllConfig();
// });

// let arr =  getAppPkg();
// logd(arr);
// shezhi_tubiao();
// ui.run(10,function () {
//     保存();
// })

