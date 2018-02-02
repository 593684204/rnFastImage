/**
 * Created by qiaozm on 2016/6/29.
 * 提供公用方法
 */
import React from 'react-native';
import Dimensions from 'Dimensions';
import {
    PixelRatio,
    Platform,
    NativeModules,
    Image,
    Linking,
    ToastAndroid
} from 'react-native';
var pako = require('./pako');
var base64 = require('./base64');
export default {
    /*最小线宽*/
    pixel:1/PixelRatio.get(),

    /*实际像素*/
    getPixelSizeForLayoutSize(param){
        return PixelRatio.getPixelSizeForLayoutSize(param);
    },
    /**
    * param:实际PX的值
    * return:实际展示dp值
   **/
    getDpSize(param){
        return param/PixelRatio.get();
    },
    /*屏幕尺寸*/
    size:{
        width:Dimensions.get('window').width,
        height:Dimensions.get('window').height
    },
    /**
     *
     * @param datumSize 基准屏幕下的尺寸
     * @param datumDimenSize 基准屏幕下的屏幕尺寸
     * @param datum 以基准屏幕下的高（h）宽（w）那个为基准点
     * @return 实际屏幕下的尺寸
     */
    getSize(datumSize,datumDimenSize,datum){
        let size=0;
        if(datum=='h'){
            size=datumSize/datumDimenSize * this.size.height;
        }else if(datum=='w'){
            size=datumSize/datumDimenSize * this.size.width;
        }
        return size;
    },

    /**
     * 获取远程图片宽高的方法
     * @method getImageSize
     * @param {string} uri 远程图片地址
     * @param {function} FuncGetSizeSuccess 图片获取成功调用方法
     * @param {function} FuncGetSizeFailure 图片获取失败调用方法
     */
    getImageSize(uri,FuncGetSizeSuccess,FuncGetSizeFailure){
        Image.getSize(uri,(width, height) => { FuncGetSizeSuccess(width,height) },(err)=>{FuncGetSizeFailure(err)});
    },

    /**
     * fetch的get方法
     * @method get
     * @param {string} url
     * @param {function} callback请求成功回调
     */
    get(url,successCallback,failCallback){
        fetch(url).then((response)=>response.text())
        .then((_responseText)=>{
            successCallback(JSON.parse(_responseText));
        }).catch((err)=>{
            failCallback(err);
        });
    },

    /**
     * fetch的post方法
     * fromData
     * @method post
     * @param {string} url
     * @param {function} callback请求成功回调
     */
    post(url,fromData,successCallback,failCallback){
        fetch(url, {
           method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: fromData})
         .then((response) => response.json())
        .then((responseJson)=>{
            successCallback(responseJson);
        }).catch((err)=>{
            failCallback(err);
        });
    },

    _toQueryString(obj) {
        return obj ? Object.keys(obj).sort().map( (key)=> {
            let val = obj[key];
            if (Array.isArray(val)) {
                return val.sort().map( (val2) =>{
                    return encodeURIComponent(key) + '=' + encodeURIComponent(val2);
                }).join('&');
            }

            return encodeURIComponent(key) + '=' + encodeURIComponent(val);
        }).join('&') : '';
    },

    /**
    *判断请求数据是否超时
    *@param {string} s
    **/
    FuncTimeOut(){
        return new Promise( (resolve, reject) =>{
            let _data={
                data:{},
                message:'timeout'
            };
           setTimeout(resolve, 10000, _data);
       });
    },

    /**
    *人民币格式化
    *@param {string} s
    **/
    FuncRmbFormat(s){
        if(/[^0-9\.]/.test(s)) return "invalid value";
        	s=s+'';
            s=s.replace(/^(\d*)$/,"$1.");
            s=(s+"00").replace(/(\d*\.\d\d)\d*/,"$1");
            s=s.replace(".",",");
            let re=/(\d)(\d{3},)/;
            while(re.test(s))
                    s=s.replace(re,"$1,$2");
            s=s.replace(/,(\d\d)$/,".$1");
            if(s.indexOf('.')>0){
            	let temp=s.substring(s.indexOf('.'));
            	/*if(temp=='.00'){
            		s=s.substring(0,s.indexOf('.'));
            	}*/
            }
            return "￥" + s.replace(/^\./,"0.");
    },

    /**
    *删除字符串左右的空格
    *@param {string} str
    **/
    FuncStrFormateSpace1(str){
    	return str.replace(/(^\s*)|(\s*$)/g,'');
    },

    /**
    *删除字符串左右的空格保留中间一个空格
    *@param {string} str
    **/
    FuncStrFormateSpace2(str){
    	let _str=str.replace(/(^\s*)|(\s*$)/g,'');  //删除左右的空格
    	_str=_str.replace(/\s+/g,' ');  //保留中间一个空格
    	return _str;
    },

    /**
     * 删除字符串所有的空格
     *@param {string} str
     */
    FuncStrFormateSpace3(str){
    	return str.replace(/\s/g, "");
    },

    /**
     * 判断是否为非负整数字
     *@param {string} str
     */
    FuncStrFormateSpace4(str){
        return /^[0-9]*[1-9][0-9]*$/.test(this.FuncStrFormateSpace3(str));
    },

    /**
     * 判断是否为非负浮点数
     *@param {string} str
     */
    FuncStrFormateSpace5(str){
        return /^(([0-9]*[1-9][0-9]*\.[0-9])|([0-9]*[1-9][0-9]*))$/.test(this.FuncStrFormateSpace3(str));
    },

    /**
     * 获取字符串的字符长度
     */
    FuncGetTextLength(str){// 获取字符串的长度 一个汉字为2个字符
    	return str.replace(/[^\x00-\xff]/g,"xx").length;
    },

    fixedFont(size) {
        // NOTE: Font Scale should always be the same as the Pixel Ratio on iOS, making this
        // a no-op.
        return size * React.PixelRatio.get() / React.PixelRatio.getFontScale();
    },

      /**
      *替换所有str字符为repStr
      */
    _FuncReplaceAll(str,repStr){
        if(str!=null){
            str = str.replace(/,/g,repStr)
        }
        return str;
    },

    /**
    *去除所有的html标签
    */
    _FuncRemoveHTMLTag(str){
        //str=str.replace
        str = str.replace(/&lt;\/?[^&gt;]*&gt;/g,''); //去除HTML tag 去除转义以后的html标签
        str = str.replace(/<\/?[^>]*</g,''); //去除HTML tag
        str = str.replace(/[ | ]*\n/g,'\n'); //去除行尾空白
        //str = str.replace(/\n[\s| | ]*\r/g,'\n'); //去除多余空行
        str=str.replace(/ /ig,'');//去掉
        return str;
    },
    /**
    *格式化日期字符串YYYY-MM-dd HH:mm:ss为YYYY年MM月dd日
    */
    _FuncFormateDate(date){
        if(date!=null && date!=''){
            let _year=date.substring(0,4);
            let _month=date.substring(5,7);
            let _day=date.substring(8,10);
            return _year+'年'+_month+'月'+_day+'日';
        }else{
            return 'error';
        }
    },

    // 自定义返回按钮事件
    customHandleBack(navigator, handleBack) {
        if (navigator) {
            let routes = navigator.getCurrentRoutes(); //nav是导航器对象
            let lastRoute = routes[routes.length - 1]; // 当前页面对应的route对象
            lastRoute.handleBack = handleBack;
        }
    },
    //初始化省市区列表数据
    FuncInitPickerData(data){
        let regionDTOList=eval(data);
        let ProvinceNewList='{"全部":[{"全部":["全部"]}]}'+',';  //最终显示的省市区列表text
        let ProvinceIdNewList='{"全部":[{"全部":["全部"]}]}'+',';  //最终显示的省市区列表id
        selectedPickerValue=['全部','全部','全部'];//选中的省市区text
        selectedPickerId=['','',''];  //选中的省市区id
        if(regionDTOList==null || regionDTOList=='' || regionDTOList.length==0){
            selectedPickerValue=['全部','全部','全部'];
            selectedPickerId=['','',''];
        }else{
            if(regionDTOList.length==1){
                selectedPickerValue[0]=regionDTOList[0].text;
                selectedPickerId[0]=regionDTOList[0].reserve1;
                let cityRegionList=regionDTOList[0].children;//市列表
                if(cityRegionList.length==1){
                    selectedPickerValue[1]=cityRegionList[0].text;
                    selectedPickerId[1]=cityRegionList[0].reserve1;
                    let districtList=cityRegionList[0].children;//区列表
                    if(districtList.length==1){
                        selectedPickerValue[2]=districtList[0].text;
                        selectedPickerId[2]=districtList[0].reserve1;
                    }
                }
            }
            regionDTOList.forEach( (item,index) =>{
                let provinceRegionId=item.reserve1;
                let provinceRegion=item.text;
                let cityRegionList=item.children;//市列表
                let cityNewList='{"全部":["全部"]},';  //最终显示的市区列表text
                let cityIdNewList='{"全部":["全部"]},';  //最终显示的市区列表id
                if(cityRegionList!=null && cityRegionList.length>0){
                    cityRegionList.forEach((cityItem,i)=>{
                        let cityId=cityItem.reserve1;
                        let cityName=cityItem.text;
                        let districtList=cityItem.children;//区列表
                        let districtNewList='"全部",';  //最终显示的县区列表text
                        let districtIdNewList='"全部",';  //最终显示的县区列表id
                        if(districtList!=null && districtList.length>0){
                            districtList.forEach((districtItem,j)=>{
                                let districtId=districtItem.reserve1;
                                let districtName=districtItem.text;
                                //districtNewList[j]=districtName;
                                if(j==districtList.length-1){
                                    districtNewList+='"'+districtName+'"';
                                    districtIdNewList+='"'+districtId+'"';
                                }else{
                                    districtNewList+='"'+districtName+'",';
                                    districtIdNewList+='"'+districtId+'",';
                                }
                            });
                        }else{
                            districtNewList+='"全部"';
                            districtIdNewList+='"全部"';
                        }
                        if(i==cityRegionList.length-1){
                            cityNewList+='{"'+cityName+'":['+districtNewList+']}';
                            cityIdNewList+='{"'+cityId+'":['+districtIdNewList+']}';

                        }else{
                            cityNewList+='{"'+cityName+'":['+districtNewList+']}'+',';
                            cityIdNewList+='{"'+cityId+'":['+districtIdNewList+']}'+',';
                        }
                    });
                }else{
                    cityNewList='{"全部":["全部"]}';
                    cityIdNewList='{"全部":["全部"]}';
                }
                if(index==regionDTOList.length-1){
                    ProvinceNewList+='{"'+provinceRegion+'":['+cityNewList+']}';
                    ProvinceIdNewList+='{"'+provinceRegionId+'":['+cityIdNewList+']}';

                }else{
                    ProvinceNewList+='{"'+provinceRegion+'":['+cityNewList+']}'+',';
                    ProvinceIdNewList+='{"'+provinceRegionId+'":['+cityIdNewList+']}'+',';
                }
            });
        }
        let resultDTO={
             regionList:eval('([' + ProvinceNewList + '])'),
             regionIdList:eval('([' + ProvinceIdNewList + '])'),
             regionDTOList:regionDTOList,
             selectedPickerValue:selectedPickerValue,
             selectedPickerId:selectedPickerId,
        }
        return resultDTO;
    },
    //根据选中的省市区name获取选中的省市区Id
    FuncSelectPickerId(pickedValue,regionDTOList){
        // let regionDTOList=this.state.regionDTOList;//省市区json数据
         let selectedPickerId=['','',''];
         if(pickedValue[0]=='全部' && pickedValue[1]=='全部' && pickedValue[2]=='全部'){
            selectedPickerId=['','',''];
         }else{
            for(let index=0;index<regionDTOList.length;index++){
                let provinceRegion=regionDTOList[index].text;
                if(provinceRegion==pickedValue[0]){
                    selectedPickerId[0]=regionDTOList[index].reserve1;
                    let cityRegionList=regionDTOList[index].children;//市列表
                    if(cityRegionList!=null && cityRegionList.length>0){
                        for(let i=0;i<cityRegionList.length;i++){
                            let city=cityRegionList[i].text;
                            if(city==pickedValue[1]){
                                selectedPickerId[1]=cityRegionList[i].reserve1;
                                let districtList=cityRegionList[i].children;  //县区列表
                                if(districtList!=null && districtList.length>0){
                                    for(let j=0;j<districtList.length;j++){
                                        let distric=districtList[j].text;
                                        if(distric==pickedValue[2]){
                                            selectedPickerId[2]=districtList[j].reserve1;
                                            break;
                                        }
                                    }
                                }else{
                                    selectedPickerId[2]='';
                                }
                            }
                        }
                    }else{
                        selectedPickerId[1]='';
                        selectedPickerId[2]='';
                    }
                }
            }
         }
        debugger// alert(selectedPickerId[1]);
         let resultDTO={
            selectedPickerValue:pickedValue,
            selectedPickerId:selectedPickerId
         }
         return resultDTO;
    },
    //初始化数据统计学年列表数据
    FuncInitPickerYearData(data){
        let yearDataList=[];//学年列表
        let timeDataList=[];//开始时间，结束时间对象列表
        let i=0;
        for(let index=data.length-1;index>=0;index--){
            let item=data[index];
             yearDataList[i]=item.value;
            timeDataList[i]={
                startTime:item.startTime,
                endTime:item.endTime
            }
            i++;
        }
        let resultDTO={
            yearDataList:yearDataList,
            timeDataList:timeDataList
        }
        return resultDTO;
    },
    //根据选中的学年name获取选中的学年的开始时间，结束时间对象
    FuncSelectYearDataPickerId(pickedValue,yearAndTimeDataList){
        let timeData={};//开始时间，结束时间对象列表
         for(let index=0;index<yearAndTimeDataList.length;index++){
            let item=yearAndTimeDataList[index];
            if(item.value==pickedValue){
                timeData={
                    startTime:item.startTime,
                    endTime:item.endTime
                }
                break;
             }
         }
         let resultDTO={
             selectedSticPickerValue:pickedValue,
             selectedSticTiemData:timeData
         }
         return resultDTO;
    },

    //拨打电话功能
    FuncCallPhone(phone,message){
        Linking.openURL("tel:"+phone).catch(()=>{
           if(Platform.OS=='ios'){
            }else{
            }
        });
    },
    //获取时间段内的所有年份数组
    FuncGetYears(starYear,endYear){
        let yearList=[];
        if(endYear-starYear>0){
            let diff=parseInt(endYear)-parseInt(starYear);
            for(let i=0;i<diff;i++){
                let temp=parseInt(starYear)+i;
                yearList[i]=temp;
            }
        }
        yearList[yearList.length]=endYear;
        return yearList;
    },
    //获取当前年的月份数组
    FuncGetMonths(year){
        let monthList=['01','02','03','04','05','06','07','08','09','10','11','12'];
        return monthList;
    },
    //获取当前月份的天数数组
    FuncGetDays(year,month){
        let days=['01','02','03','04','05','06','07','08','09','10','11','12','13','14','15','16','17','18','19','20','21','22','23','24','25','26','27','28','29','30','31'];
        let resultList=[];
        //构造一个日期对象：
        let  day = new Date(year,month,0);
        //获取天数：
        let daycount = day.getDate();
        for(let i=0;i<days.length;i++){
            if(parseInt(days[i])<=daycount){
                resultList[i]=days[i];
            }else{
                break;
            }
        }
        return resultList;
    },

    //获取指定年份指定月份的最大天数
    FuncGetMaxDay(year,month){
        //构造一个日期对象：
        let  day = new Date(year,month,0);
        //获取天数：
        let daycount = day.getDate();
        return daycount;
    },

    //把yyyy-mm-dd转换为yyyyMMdd
    FunFormatDate1(datestr){
        if(datestr.indexOf('-')>0){
            return datestr.substring(0,4)+datestr.substring(5,7)+datestr.substring(8,datestr.length);
        }else{
            return datestr;
        }
    },
    //把yyyyMMdd转换为yyyy-MM-dd
    FunFormatDate2(datestr){
        return datestr.substring(0,4)+'-'+datestr.substring(4,6)+'-'+datestr.substring(6,datestr.length);
    },
    //把yyyy-MM-dd转换为yyyy年MM月dd日
    FunFormatDate3(datestr){
        return datestr.substring(0,4)+'年'+datestr.substring(5,7)+'月'+datestr.substring(8,datestr.length)+'日';
    },

    /**
    *计算两个时间差
    *startTime,endTime格式为YYYY-MM-dd HH:mm:ss
    *return arr['天数','小时数','分钟数','秒数',开始时间时间戳，结束时间时间戳]
    **/
    FuncTimeDiff(startTime,endTime){
        startTime=startTime.replace(/\-/g, "/");
        endTime=endTime.replace(/\-/g, "/");
      //  let endTime=endTime.replace(/\-/g, "/");
         let millisecondDiff= parseInt(new Date(endTime).getTime()) - parseInt(new Date(startTime).getTime());   //时间差的毫秒数
         //计算出相差天数
         let days=Math.floor(millisecondDiff/(24*3600*1000));
         //计算出小时数
         let  hoursMsec=millisecondDiff%(24*3600*1000);    //计算天数后剩余的毫秒数
         let hours=Math.floor(hoursMsec/(3600*1000));
         //计算相差分钟数
         let minuteMsec=hoursMsec%(3600*1000);//计算小时数后剩余的毫秒数
         let minutes=Math.floor(minuteMsec/(60*1000));
            //计算相差秒数
         let secondsMsec=minuteMsec%(60*1000);      //计算分钟数后剩余的毫秒数
         let seconds=Math.round(secondsMsec/1000);
         //alert(" 相差 "+days+"天 "+hours+"小时 "+minutes+" 分钟"+seconds+" 秒");
         return [days,hours,minutes,seconds,parseInt(new Date(startTime).getTime()),parseInt(new Date(endTime).getTime())];
    },

    //根据时间戳计算相距的时间
    FuncTimeDiffByTimeStamp(startStamp,endStamp){
         let millisecondDiff= endStamp - startStamp;   //时间差的毫秒数
         //计算出小时数
          let  hoursMsec=millisecondDiff%(24*3600*1000);    //计算天数后剩余的毫秒数
          let hours=Math.floor(hoursMsec/(3600*1000));
          if(hours<10){
            hours='0'+hours;
          }
          //计算相差分钟数
          let minuteMsec=hoursMsec%(3600*1000);//计算小时数后剩余的毫秒数
          let minutes=Math.floor(minuteMsec/(60*1000));
          if(minutes<10){
            minutes='0'+minutes;
          }
             //计算相差秒数
          let secondsMsec=minuteMsec%(60*1000);      //计算分钟数后剩余的毫秒数
          let seconds=Math.round(secondsMsec/1000);
          if(seconds<10){
            seconds="0"+seconds;
          }
          if(hours==0 && minutes==0 && seconds==0){
            return 0;
          }else{
            return hours+':'+minutes+':'+seconds;
          }
    },

    //倒计时 如果为00：00：00则返回0
    FuncCountDown(startTime,endTime){
        let diffTime=this.FuncTimeDiff(startTime,endTime);
        let countDown=[diffTime[0]+'天',diffTime[4],diffTime[5]];
        if(diffTime[0]<1){
            if(diffTime[1]=='00' && diffTime[2]=='00' && diffTime[3]=='00'){
                countDown=[0,0,0];
            }else{
                countDown=[diffTime[1]+': '+diffTime[2]+': '+diffTime[3],diffTime[4],diffTime[5]];
            }
        }
        return countDown;
    },
    //截取图片的格式 return 格式化过的url
    //url图片地址 thumbnail缩略图处理规格(!t166x166)
    FuncGetPicFormat(url,thumbnail){
        if(url==null){
            url='';
        }
        let picFormat=url.substring(url.lastIndexOf('.'));
        let reusltUrl=url;
        if(picFormat.toLowerCase()=='.jpg' || picFormat.toLowerCase()=='.png'){
            if(thumbnail!=null && thumbnail!=''){
                reusltUrl= url+thumbnail+picFormat;
            }
        }
        return reusltUrl;
    },

    //解压缩gzip数据(pako)
    FuncUnzip(b64Data){
        let strData=base64.atob(b64Data);
        let charData=strData.split('').map(function(x){return x.charCodeAt(0);});
        let binData=new Uint8Array(charData);
        let data =pako.inflate(binData,{to:'string' });
        strData=JSON.parse(data);
        return strData;
    },
    //压缩gzip数据(pako)
    FuncZip(str){
        //let binaryString = pako.gzip(str, { to: 'string' });
        let binaryString = pako.deflate(str, { to: 'string' });
        return base64.btoa(binaryString);
    }
};
