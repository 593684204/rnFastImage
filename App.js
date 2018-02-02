/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import Util from './src/common/tool/Util';
import FastImage from 'react-native-fast-image'
import {
  Platform,
  StyleSheet,
  Text,
  View,
    TextInput,
    Button,
    FlatList,
    TouchableHighlight,
    Image
} from 'react-native';

export default class App extends Component<{}> {
    constructor(props) {
        super(props);
        /*this._sourceData = [
            {name: '大护法'},
            {name: '绣春刀II：修罗战场'},
            {name: '神偷奶爸3'},
            {name: '神奇女侠'},
            {name: '摔跤吧，爸爸'},
            {name: '悟空传'},
            {name: '闪光少女'},
            {name: '攻壳机动队'},
            {name: '速度与激情8'},
            {name: '蝙蝠侠大战超人'},
            {name: '攻壳机动队'},
            {name: '速度与激情8'},
            {name: '蝙蝠侠大战超人'}
        ]

        this._newData = [{name: '我是新添加的数据1'},
            {name: '我是新添加的数据2'},
            {name: '我是新添加的数据3'}]*/
        this.state = {
            loading:false,
            data: [],
            results:0,
            pageNo:1,
            pageSize:10,
            refreshing: false, //初始化不刷新
            text: '',//跳转的行
            opacityLoading:false, //false时不显示true显示
        };
    };
    componentDidMount() {
        console.log('componentDidMount');
        this.fetchData();
    };
    componentWillMount(){
    }
    componentWillUnmount(){
    };
    _header = ()=> {
        return (
            <Text style={{fontWeight: 'bold', fontSize: 20,textAlign:'center'}}>---------轮播图展示---------</Text>
        );
    }

    _footer = () => (
        <View>
            {
                this.state.pageNo<Math.ceil(this.state.results/this.state.pageSize)?
                    null
                :
                <Text style={{fontSize: 14, alignSelf: 'center'}}>到底啦，没有啦！</Text>
            }
        </View>
    )

    createEmptyView=()=> {
        return (
            <Text style={{fontSize: 40, alignSelf: 'center'}}>还没有数据哦！</Text>
        );
    }
    //此函数用于为给定的item生成一个不重复的key
    //若不指定此函数，则默认抽取item.key作为key值。若item.key也不存在，则使用数组下标index。
    _keyExtractor = (item, index) => index;
    itemClick=(item, index)=> {
        alert('点击了第' + index + '项，学校名称为：' + item.schoolName);
    }

    _renderItem = ({item, index}) => {
        return (
            <TouchableHighlight
                activeOpacity={0.5}
                underlayColor={'#fff'}
                onPress={()=>{this.itemClick(item, index)}}>
                <View style={{height:100,flexDirection:'row',justifyContent:'flex-start',alignItems:'center',}}>
                    <View style={{height:100,width:100}}>
                        <FastImage
                            style={{height:100,width:100}}
                            source={{
                                uri: item.schoolLogoUrl,
                                headers:{ Authorization: 'someAuthToken' },
                                priority: FastImage.priority.normal,
                            }}
                            resizeMode={FastImage.resizeMode.contain}/>
                    </View>
                    <View style={{height:100,width:Util.size.width-100,flexDirection:'row',justifyContent:'flex-start',alignItems:'center',}}>
                        <Text style={styles.instructions}>{item.schoolName}</Text>
                    </View>
                </View>
            </TouchableHighlight>
        );
    }

    //点击按钮跳转
    onButtonPress=()=> {
        //viewPosition参数：0表示顶部，0.5表示中部，1表示底部
        this._flatList.scrollToIndex({viewPosition: 0, index: parseInt(this.state.text)});
        //this._flatList.scrollToOffset({ animated: true, offset: 2000 });
    };

    onBtnPressBottomBotton=()=> {
        this._flatList.scrollToEnd();
    }
    onBtnPressTopBotton=()=>{
        this._flatList.scrollToIndex({viewPosition: 0, index: 0});
    }
    render() {
        return (
            <View style={styles.container}>
                {
                    this.state.loading?
                        <View>
                            <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                                <TextInput
                                    style={{flex: 1}}
                                    placeholder="请输入要跳转的行号"
                                    onChangeText={(text) => this.setState({text})}
                                />
                                <Button title="跳转到行" onPress={()=>this.onButtonPress()} color={'skyblue'}/>
                                <Button title="跳转到底部" onPress={()=>this.onBtnPressBottomBotton()} color={'green'}/>
                                <Button title="跳转到顶部" onPress={()=>this.onBtnPressTopBotton()} color={'blue'}/>
                            </View>
                            <FlatList
                                data={this.state.data}
                                //使用 ref 可以获取到相应的组件
                                ref={(flatList) => this._flatList = flatList}
                                ListHeaderComponent={this._header}//header头部组件
                                ListFooterComponent={this._footer}//footer尾部组件
                                ItemSeparatorComponent={ItemDivideComponent}//分割线组件
                                //空数据视图,可以是React Component,也可以是一个render函数，或者渲染好的element。
                                ListEmptyComponent={this.createEmptyView()}
                                keyExtractor={this._keyExtractor}
                                //是一个可选的优化，用于避免动态测量内容尺寸的开销，不过前提是你可以提前知道内容的高度。
                                //如果你的行高是固定的，getItemLayout用起来就既高效又简单.
                                //注意如果你指定了SeparatorComponent，请把分隔线的尺寸也考虑到offset的计算之中
                                getItemLayout={(data, index) => ( {length: 100, offset: (100 + 1) * index, index} )}
                                //决定当距离内容最底部还有多远时触发onEndReached回调。
                                //注意此参数是一个比值而非像素单位。比如，0.5表示距离内容最底部的距离为当前列表可见长度的一半时触发。
                                onEndReachedThreshold={0.1}
                                //当列表被滚动到距离内容最底部不足onEndReachedThreshold的距离时调用
                                onEndReached={this.getMoreData}
                                refreshing={this.state.refreshing}
                                onRefresh={() => {
                                    this.setState({refreshing: true})//开始刷新
                                    this.fetchData();
                                }}
                                renderItem={this._renderItem}
                            />
                        </View>
                    :
                        <Text style={styles.welcome}>正在加载中。。。</Text>
                }
                {
                    this.state.opacityLoading?
                        <View style={{width:Util.size.width,height:Util.size.height,position:'absolute',top:0,left:0,justifyContent:'center',alignItems:'center'}}>
                            <Image source={require('./src/img/common/loading.gif')} resizeMode='contain' style={{width: 25, height:25} }  />
                        </View>
                    :
                        null
                }
            </View>
        );
    }
    fetchData=()=> {
        let baseUrl=' https://ssl.ygzykj.com:8480/sunsoft-supplier-app/school/selectSchoolIdAndSchoolInfo.json?token=ede28437d08995573ef74e1136391df0&versionCode=101.1.3&upPwsNum=0&versionType=10' +
            '&provinceRegionId=&cityRegionId=&districtRegionId=&schoolName=&pageNo=1&pageSize='+this.state.pageSize+'&status=00'
        let _q='';
        console.log(baseUrl);
        Util.post(baseUrl,_q,(data)=>{
            let _title=data.obj.title;
            let _msgCode=data.msgCode;
            if(_msgCode==1){
            }else if(_msgCode==99){
            }else if(_msgCode==4){

            }else{
                let _data=data.obj.body;
                console.log(_data);
                this.setState({
                    data:_data.rows,
                    results:_data.results,
                    loading:true,
                    pageNo:1,
                    refreshing:false
                })
            }
        },(err)=>{
            this.setState({loading:true});
        });
    };
    //获取更多数据
    getMoreData=()=> {
        this.setState({opacityLoading:true});
        let baseUrl=' https://ssl.ygzykj.com:8480/sunsoft-supplier-app/school/selectSchoolIdAndSchoolInfo.json?token=ede28437d08995573ef74e1136391df0&versionCode=101.1.3&upPwsNum=0&versionType=10' +
            '&provinceRegionId=&cityRegionId=&districtRegionId=&schoolName=&pageNo='+(this.state.pageNo+1)+'&pageSize='+this.state.pageSize+'&status=00'
        let _q='';
        console.log(baseUrl);
        Util.post(baseUrl,_q,(data)=>{
            let _title=data.obj.title;
            let _msgCode=data.msgCode;
            if(_msgCode==1){
            }else if(_msgCode==99){
            }else if(_msgCode==4){

            }else{
                let _data=data.obj.body;
                console.log(_data);
                this.setState((state)=>({
                    data:state.data.concat(_data.rows),
                    opacityLoading:false,
                    pageNo:state.pageNo+1
                }));
            }
        },(err)=>{
            this.setState({loading:true});
        });
    }
}
class ItemDivideComponent
    extends Component {
    render() {
        return (
            <View style={{height: 1, backgroundColor: 'skyblue'}}/>
        );
    }
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});
