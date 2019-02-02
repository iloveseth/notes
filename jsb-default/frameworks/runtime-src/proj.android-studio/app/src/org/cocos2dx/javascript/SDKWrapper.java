/****************************************************************************
 * by seth@2019-01-22
 ***************************************************************************/

package org.cocos2dx.javascript;

import android.content.Context;
import android.content.Intent;
import android.content.res.Configuration;
import android.opengl.GLSurfaceView;
import android.os.Bundle;
import android.util.Log;
import android.widget.Toast;

import com.quicksdk.Payment;
import com.quicksdk.QuickSDK;
import com.quicksdk.Sdk;
import com.quicksdk.User;
import com.quicksdk.entity.GameRoleInfo;
import com.quicksdk.entity.OrderInfo;
import com.quicksdk.entity.UserInfo;
import com.quicksdk.notifier.ExitNotifier;
import com.quicksdk.notifier.InitNotifier;
import com.quicksdk.notifier.LoginNotifier;
import com.quicksdk.notifier.LogoutNotifier;
import com.quicksdk.notifier.PayNotifier;
import com.quicksdk.notifier.SwitchAccountNotifier;
import com.tendcloud.tenddata.TDGAAccount;
import com.tendcloud.tenddata.TDGAVirtualCurrency;

import org.cocos2dx.lib.Cocos2dxJavascriptJavaBridge;
import org.json.JSONException;
import org.json.JSONObject;

public class SDKWrapper {
    private static SDKWrapper mInstace = null;
    public static GameRoleInfo roleInfo;

    public static SDKWrapper getInstance() {
        if (null == mInstace){
            mInstace = new SDKWrapper();
        }
        return mInstace;
    }

    public void init(Context context){
        initQkNotifiers();
        Sdk.getInstance().init(AppActivity.getInstance(), "52015778332103570784029958938904", "11578352");
        Sdk.getInstance().onCreate(AppActivity.getInstance());
    }

    public void onStart(){
        Sdk.getInstance().onStart(AppActivity.getInstance());
    }

    public void onResume(){
        Sdk.getInstance().onResume(AppActivity.getInstance());
    }

    public void onRestart(){
        Sdk.getInstance().onRestart(AppActivity.getInstance());
    }

    public void onPause(){
        Sdk.getInstance().onPause(AppActivity.getInstance());
    }

    public void onStop(){
        Sdk.getInstance().onStop(AppActivity.getInstance());
    }

    public void onDestroy(){
        Sdk.getInstance().onDestroy(AppActivity.getInstance());
    }

    public void onActivityResult(int requestCode, int resultCode, Intent data){
        Sdk.getInstance().onActivityResult(AppActivity.getInstance(), requestCode, resultCode, data);
    }

    protected void onNewIntent(Intent intent) {
        Sdk.getInstance().onNewIntent(intent);
    }

    public void onBackPressed() {}

    public void onConfigurationChanged(Configuration newConfig) {}

    public void onRestoreInstanceState(Bundle savedInstanceState) {}

    public void onSaveInstanceState(Bundle outState) {}

    public void setGLSurfaceView(GLSurfaceView view) {}


    private void initQkNotifiers() {
        QuickSDK.getInstance()
                // 1.设置初始化通知(必接)
                .setInitNotifier(new InitNotifier() {

                    @Override
                    public void onSuccess() {
//                        Toast toast = Toast.makeText(AppActivity.getInstance(),"初始化成功",Toast.LENGTH_SHORT);
//                        toast.show();
                    }

                    @Override
                    public void onFailed(String message, String trace) {
//                        Toast toast = Toast.makeText(AppActivity.getInstance(),"初始化失败" + message,Toast.LENGTH_SHORT);
//                        toast.show();
                    }
                })
                // 2.设置登录通知(必接)
                .setLoginNotifier(new LoginNotifier() {

                    @Override
                    public void onSuccess(UserInfo userInfo) {
                        if (userInfo != null) {
                            String userId = userInfo.getUID();
                            String token = userInfo.getToken();
                            Log.i("bridgeLog",userId);
                            Log.i("bridgeLog",token);
                            String jsonStr = "";
                            try{
                                JSONObject jsonObject = new JSONObject();
                                jsonObject.put("userId",userId);
                                jsonObject.put("token",token);
                                jsonStr = jsonObject.toString();
                            }
                            catch (JSONException e){e.printStackTrace();}
                            final String params = "NativeController.TokenLogin1(" + "`" + jsonStr + "`);";

                            //向服务器发送token
                            Log.i("bridgeLog",params);
                            AppActivity.getInstance().runOnGLThread(new Runnable() {
                                @Override
                                public void run() {
                                    Cocos2dxJavascriptJavaBridge.evalString(params);
                                }
                            });
                        }
                    }

                    @Override
                    public void onCancel() {
//                        Toast toast = Toast.makeText(AppActivity.getInstance(),"取消登录",Toast.LENGTH_SHORT);
//                        toast.show();
                    }

                    @Override
                    public void onFailed(final String message, String trace) {
//                        Toast toast = Toast.makeText(AppActivity.getInstance(),"登录失败"+message,Toast.LENGTH_SHORT);
//                        toast.show();
                    }

                })
                // 3.设置注销通知(必接)
                .setLogoutNotifier(new LogoutNotifier() {

                    @Override
                    public void onSuccess() {

                        final String params = "NativeController.Logout();";

                        AppActivity.getInstance().runOnGLThread(new Runnable() {
                            @Override
                            public void run() {
                                Cocos2dxJavascriptJavaBridge.evalString(params);
                            }
                        });

//                        Toast toast = Toast.makeText(AppActivity.getInstance(),"注销成功",Toast.LENGTH_SHORT);
//                        toast.show();
                    }

                    @Override
                    public void onFailed(String message, String trace) {
//                        Toast toast = Toast.makeText(AppActivity.getInstance(),"注销失败" + message,Toast.LENGTH_SHORT);
//                        toast.show();
                    }
                })
                // 4.设置切换账号通知(必接)
                .setSwitchAccountNotifier(new SwitchAccountNotifier() {

                    @Override
                    public void onSuccess(UserInfo userInfo) {
//                        if (userInfo != null) {
//                            Log.i("quicksdk","切换账号成功" + "\n\r" + "UserID:  " + userInfo.getUID() + "\n\r" + "UserName:  " + userInfo.getUserName()
//                                    + "\n\r" + "Token:  " + userInfo.getToken());
////                            infoTv.setText("切换账号成功" + "\n\r" + "UserID:  " + userInfo.getUID() + "\n\r" + "UserName:  " + userInfo.getUserName()
////                                    + "\n\r" + "Token:  " + userInfo.getToken());
//                        }
                    }

                    @Override
                    public void onFailed(String message, String trace) {
//                        Log.i("quicksdk","切换账号失败" + message);
                    }

                    @Override
                    public void onCancel() {
//                        Log.i("quicksdk","取消切换账号");
                    }
                })
                // 5.设置支付通知(必接)
                .setPayNotifier(new PayNotifier() {

                    @Override
                    public void onSuccess(String sdkOrderID, String cpOrderID, String extrasParams) {

                        int status = 1;
                        String extInfo = cpOrderID;
                        String jsonStr = "";
                        try{
                            JSONObject jsonObject = new JSONObject();
                            jsonObject.put("status",status);
                            jsonObject.put("extInfo",extInfo);
                            jsonStr = jsonObject.toString();
                        }
                        catch (JSONException e){e.printStackTrace();}
                        final String params = "NativeController.PayResult1(" + "`" + jsonStr + "`);";

                        AppActivity.getInstance().runOnGLThread(new Runnable() {
                            @Override
                            public void run() {
                                Cocos2dxJavascriptJavaBridge.evalString(params);
                            }
                        });

                        TDGAVirtualCurrency.onChargeSuccess(cpOrderID);
                        Log.i("quicksdk","支付成功，sdkOrderID:" + sdkOrderID + ",cpOrderID:" + cpOrderID);
                    }

                    @Override
                    public void onCancel(String cpOrderID) {
                        int status = 2;
                        String extInfo = cpOrderID;
                        String jsonStr = "";
                        try{
                            JSONObject jsonObject = new JSONObject();
                            jsonObject.put("status",status);
                            jsonObject.put("extInfo",extInfo);
                            jsonStr = jsonObject.toString();
                        }
                        catch (JSONException e){e.printStackTrace();}
                        final String params = "NativeController.PayResult1(" + "`" + jsonStr + "`)";
                        AppActivity.getInstance().runOnGLThread(new Runnable() {
                            @Override
                            public void run() {
                                Cocos2dxJavascriptJavaBridge.evalString(params);
                            }
                        });
                        Log.i("quicksdk","支付取消，cpOrderID:" + cpOrderID);
                    }

                    @Override
                    public void onFailed(String cpOrderID, String message, String trace) {
                        int status = 3;
                        String extInfo = cpOrderID;
                        String jsonStr = "";
                        try{
                            JSONObject jsonObject = new JSONObject();
                            jsonObject.put("status",status);
                            jsonObject.put("extInfo",extInfo);
                            jsonStr = jsonObject.toString();
                        }
                        catch (JSONException e){e.printStackTrace();}
                        final String params = "NativeController.PayResult1(" + "`" + jsonStr + "`)";
                        AppActivity.getInstance().runOnGLThread(new Runnable() {
                            @Override
                            public void run() {
                                Cocos2dxJavascriptJavaBridge.evalString(params);
                            }
                        });
                        Log.i("quicksdk","支付失败:" + "pay failed,cpOrderID:" + cpOrderID + ",message:" + message);
                    }
                })
                // 6.设置退出通知(必接)
                .setExitNotifier(new ExitNotifier() {

                    @Override
                    public void onSuccess() {
                        // 进行游戏本身的退出操作，下面的finish()只是示例
                        AppActivity.getInstance().finish();
                    }

                    @Override
                    public void onFailed(String message, String trace) {
//                        infoTv.setText("退出失败：" + message);
                    }
                });
    }

    public void sdkLogin(){
        User.getInstance().login(AppActivity.getInstance());
    }

    public void sdkLogout(){
        User.getInstance().logout(AppActivity.getInstance());
    }

    public void sdkSetUserInfo(String roleInfoStr){
        try{
            JSONObject roleInfoJson = new JSONObject(roleInfoStr);
            roleInfo = new GameRoleInfo();
            String serverId = roleInfoJson.optString("serverId");
            String serverName = roleInfoJson.optString("serverName");
            String gameRoleName = roleInfoJson.optString("gameRoleName");
            String gameRoleId = roleInfoJson.optString("gameRoleId");
            String gameUserLevel = roleInfoJson.optString("gameUserLevel");
            String vipLevel = roleInfoJson.optString("vipLevel");
            String gameBalance = roleInfoJson.optString("gameBalance");
            String partyName = roleInfoJson.optString("partyName");
            String roleCreateTime = roleInfoJson.optString("roleCreateTime");
            String partyId = roleInfoJson.optString("partyId");
            String gameRoleGender = roleInfoJson.optString("roleGender");
            String gameRolePower = roleInfoJson.optString("rolePower");
            String partyRoleId = roleInfoJson.optString("partyRoleId");
            String partyRoleName = roleInfoJson.optString("partyRoleName");
            String professionId = roleInfoJson.optString("professionId");
            String profession = roleInfoJson.optString("profession");
            String friendList = roleInfoJson.optString("friendList");
            boolean isCreateRole = roleInfoJson.optBoolean("isCreateRole");

            roleInfo.setServerID(serverId);
            roleInfo.setServerName(serverName);
            roleInfo.setGameRoleName(gameRoleName);
            roleInfo.setGameRoleID(gameRoleId);// 角色ID
            roleInfo.setGameUserLevel(gameUserLevel);// 等级
            roleInfo.setVipLevel(vipLevel); // 设置当前用户vip等级，必须为整型字符串
            roleInfo.setGameBalance(gameBalance); // 角色现有金额
            roleInfo.setPartyName(partyName); // 设置帮派，公会名称
            roleInfo.setRoleCreateTime(roleCreateTime); // UC与1881渠道必传，值为10位数时间戳
            roleInfo.setPartyId(partyId); // 360渠道参数，设置帮派id，必须为整型字符串
            roleInfo.setGameRoleGender(gameRoleGender); // 360渠道参数
            roleInfo.setGameRolePower(gameRolePower); // 360渠道参数，设置角色战力，必须为整型字符串
            roleInfo.setPartyRoleId(partyRoleId); // 360渠道参数，设置角色在帮派中的id
            roleInfo.setPartyRoleName(partyRoleName); // 360渠道参数，设置角色在帮派中的名称
            roleInfo.setProfessionId(professionId); // 360渠道参数，设置角色职业id，必须为整型字符串
            roleInfo.setProfession(profession); // 360渠道参数，设置角色职业名称
            roleInfo.setFriendlist(friendList); // 360渠道参数，设置好友关系列表，格式请参考：http://open.quicksdk.net/help/detail/aid/190
            User.getInstance().setGameRoleInfo(AppActivity.getInstance(), roleInfo, isCreateRole);
            TDGAAccount.setAccount(gameRoleId);
            Log.i("TDGA",gameRoleId);
        }
        catch (JSONException e){e.printStackTrace();}
        Log.i("bridgeLog",roleInfoStr);
    }

    public void sdkPay(String payStr){
        try{
            JSONObject payJson = new JSONObject(payStr);

            String cpOrderId = payJson.optString("cpOrderId");
            String goodsId = payJson.optString("goodsId");
            String goodsName = payJson.optString("goodsName");
            int count = payJson.optInt("count");
            double amount = payJson.optDouble("amount")/100;
            String extrasParams = payJson.optString("extrasParams");


            OrderInfo orderInfo = new OrderInfo();
            orderInfo.setCpOrderID(cpOrderId);
            orderInfo.setGoodsID(goodsId);
            orderInfo.setGoodsName(goodsName);//商品名称，不带数量
            orderInfo.setCount(count);//游戏币数量
            orderInfo.setAmount(amount);

            orderInfo.setExtrasParams(extrasParams);
            Payment.getInstance().pay(AppActivity.getInstance(), orderInfo, roleInfo);
            TDGAVirtualCurrency.onChargeRequest(cpOrderId,goodsName,amount,"CNY",1.00,"quick支付sdk");
        }
        catch (JSONException e){e.printStackTrace();}
    }

    public void sdkExit(){
        if (QuickSDK.getInstance().isShowExitDialog()) {
            Sdk.getInstance().exit(AppActivity.getInstance());
        }
        else{
            Sdk.getInstance().exit(AppActivity.getInstance());
        }
    }

    public void sdkSetAccount(String accountStr){
        TDGAAccount.setAccount(accountStr);
    }
}
