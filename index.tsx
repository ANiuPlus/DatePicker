import { ComponentClass } from 'react';
import Taro, { Component, Config } from '@tarojs/taro';
import { AtFloatLayout } from 'taro-ui';
import {
  View,
  Text,
  Button,
  PickerView,
  PickerViewColumn
} from '@tarojs/components';
// import request from '@lib/js/request';
// 组件里读取taro-ui样式 how？？
// import 'taro-ui/dist/style/components/float-layout.scss';
// import './index.less';
import './index.less';

// #region 书写注意
//
// 目前 typescript 版本还无法在装饰器模式下将 Props 注入到 Taro.Component 中的 props 属性
// 需要显示声明 connect 的参数类型并通过 interface 的方式指定 Taro.Component 子类的 props
// 这样才能完成类型检查和 IDE 的自动提示
// 使用函数模式则无此限制
// ref: https://github.com/DefinitelyTyped/DefinitelyTyped/issues/20796
//
// #endregion

/**
 * @desc redux的state，类型约束
 */
type PageStateProps = {};

/**
 * @desc redux的props，类型约束
 */
type PageDispatchProps = {};

/**
 * @desc 当前页面的默认props，类型约束  不加？不是必选页面引用会标红 Function不能带？
 */
type PageOwnProps = {
  format?: any;
  min?: any;
  max?: any;
  title?: string;
  currentDate: number;
  setDate: Function;
};
/**
 * @desc 当前页面的state，类型约束
 */
type PageState = {
  showFlag: boolean;
  selectFlag: boolean;
  years: number[];
  // list: Array<{ i: number }>;
  months: number[];
  days: number[];
  hours: number[];
  seconds: number[];
  minutes: number[];

  date: string;

  value: number[];
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;

  [key: number]: any;

  // formatSuffix: object[];
};

type IProps = PageStateProps & PageDispatchProps & PageOwnProps;

interface picker {
  props: IProps;
}

const defaultMap = {
  'Y+': {
    dateMap: 'years',
    FnMap: 'getFullYear',
    minMap: 1900
  },
  'M+': {
    dateMap: 'months',
    FnMap: 'getMonth',
    minMap: 1
  },
  'd+': {
    dateMap: 'days',
    FnMap: 'getDate',
    minMap: 1
  },
  'h+': {
    dateMap: 'hours',
    FnMap: 'getHours',
    minMap: 0
  },
  'm+': {
    dateMap: 'minutes',
    FnMap: 'getMinutes',
    minMap: 0
  },
  's+': {
    dateMap: 'seconds',
    FnMap: 'getSeconds',
    minMap: 0
  }
};

/**
 * @desc 接口路径定义
 */

// const defaultFormat = [];

class picker extends Component<IProps, PageState> {
  /**
   * 指定config的类型声明为: Taro.Config
   *
   * 由于 typescript 对于 object 类型推导只能推出 Key 的基本类型
   * 对于像 navigationBarTextStyle: 'black' 这样的推导出的类型是 string
   * 提示和声明 navigationBarTextStyle: 'black' | 'white' 类型冲突, 需要显示声明类型
   */
  config: Config = {
    navigationBarTitleText: '时间组件'
  };

  /**
   * @desc 页面默认的props
   */
  static defaultProps = {
    format: 'YYYY-MM-dd hh:mm:ss',
    min: new Date(1900, 0, 1, 0, 0, 0),
    max: new Date(2050, 11, 31, 23, 59, 59),
    title: '',
    currentDate: +new Date(),
    setDate() {}
  };

  constructor(props: any) {
    super(props);
    // 匹配pros的规则

    // debugger;
    this.state = {
      years: [],
      months: [],
      days: [],
      hours: [],
      minutes: [],
      seconds: [],
      value: [],
      year: 0,
      month: 0,
      day: 0,
      hour: 0,
      minute: 0,
      second: 0,
      // formatSuffix,
      showFlag: false,
      selectFlag: false,
      date: ''
    };
    this.onChange.bind(this);
    this.handleInit.call(this);
    // console.log('this', this.handleInit);
    // debugger;
  }

  /**
   * @desc 开启组件可用于全局样式
   */
  static options = {
    addGlobalClass: true
  };

  /**
   * @desc componentWillReceiveProps() 在已经装载的组件接收到新属性前调用。
   * 若你需要更新状态响应属性改变，你可能需对比 this.props 和 nextProps 并在该方法中使用 this.setState() 处理状态改变。
   * 注意即使属性未有任何改变，Taro 可能也会调用该方法，因此若你想要处理改变，请确保比较当前和之后的值。
   * 在装载期间，Taro 并不会调用带有初始属性的 componentWillReceiveProps方法。
   * 调用 this.setState 通常不会触发 componentWillReceiveProps。
   */
  componentWillReceiveProps(nextProps: any) {
    // console.log(this.props, nextProps);
    // const {updateFlag}=nextProps;
    // if(updateFlag){
    //   this.handleInit();
    // }
  }
  /**
   * @desc 在微信小程序中这一生命周期方法对应页面的onLoad或入口文件app中的onLaunch，一般在这里发起请求
   */
  componentWillMount() {
    // console.log('this.props :', this.props);
    // console.log('componentWillMount');
  }

  /**
   * @desc 在微信小程序中这一生命周期方法对应页面的onReady或入口文件app中的onLaunch，在 componentWillMount后执行
   */
  componentDidMount() {
    console.log('componentDidMount');
  }

  initColumn(key, min, max) {
    // console.log('initColumn', key, min, max);
    // debugger;
    if (key === 'months') {
      min++;
      max++;
    }
    let column = this.state[key];
    // 清空当前数组
    column = [];
    for (let i = min; i <= max; i++) {
      let j = key === 'h+' || key === 'm+' ? this.zeroFix(i) : i;
      column.push(j);
    }
    // debugger;
    return {
      [key]: column
    };
  }

  handleInit(updateDate: number) {
    // console.log('handleInit');
    const { currentDate, format, min, max } = this.props;
    console.log('handleInit', currentDate);
    const date =
      (updateDate && new Date(updateDate)) ||
      (currentDate && new Date(currentDate)) ||
      new Date();

    let value: number[] = [];

    const o = {
      'Y+': date.getFullYear(),
      'M+': date.getMonth() + 1, // 月份
      'd+': date.getDate(), // 日
      'h+': date.getHours(), // 小时
      'm+': date.getMinutes(), // 分
      's+': date.getSeconds() // 秒
      // 'q+': Math.floor((date.getMonth() + 3) / 3), // 季度
      // S: date.getMilliseconds() // 毫秒
    };
    // 年
    // if (/(y+)/.test(format)) {
    // }
    const state = {};
    // k=> Y+
    for (var k in o) {
      if (new RegExp('(' + k + ')').test(format)) {
        let t = defaultMap[k]['FnMap']; //defaultMap[k]['FnMap'] === getFullYear
        let column = this.initColumn(defaultMap[k].dateMap, min[t](), max[t]());
        Object.assign(state, column);

        // 取years-s=year
        const dateIndex = defaultMap[k].dateMap.substr(
          0,
          defaultMap[k].dateMap.length - 1
        );
        // debugger;

        // index处理 年待处理
        state[dateIndex] = k === 'M+' ? date[t]() + 1 : date[t]();
        if (k === 'Y+') {
          value.push(
            column[defaultMap[k].dateMap].findIndex(item => item === date[t]())
          );
          // debugger;
        } else if (k === 'd+') {
          value.push(date[t]() - 1);
          // debugger;
        } else {
          value.push(date[t]());
          // debugger;
        }
      }
    }
    Object.assign(state, { value });
    this.setState(state);
    // debugger;
  }

  onChange(e) {
    // console.log('onChange', e, e.detail);
    const val = e.detail.value;
    const year = this.state.years[val[0]];
    const month = this.state.months[val[1]];
    let days: number[] = [];
    let day = 0;
    const maxDays = new Date(year, month, 0).getDate();
    // debugger;
    // 获取天数
    for (let i = 1; i <= maxDays; i++) {
      days.push(i);
    }
    if (day <= maxDays) {
      day = this.state.days[val[2]];
    }
    // console.log(day, maxDays);
    this.setState({
      year,
      month,
      day,
      hour: this.state.minutes[val[3]],
      minute: this.state.seconds[val[4]],
      // second: this.state.seconds[val[5]],
      days,
      value: val
    });
    // console.log('value', this.state.value);
    // debugger;
  }

  handleOpen = () => {
    console.log('handleOpen', this.state.showFlag);
    this.setState({
      showFlag: true
    });
  };

  handleCancel = () => {
    console.log('handleCancel');
    this.setState({
      showFlag: false
    });
  };

  zeroFix(key) {
    // debugger;
    return (key + '').length === 1 ? '0' + key : key;
  }

  handleConfirm = () => {
    console.log('handleConfirm');
    const { year, month, day, hour, minute } = this.state;
    const timestamp = +new Date(year, month - 1, day, hour, minute);
    const date = { year, month, day, hour, minute, timestamp };
    // console.log(new Date(year, month, day, hour, minute));
    this.props.setDate(date);
    // debugger;
    this.setState({
      date:
        year +
        '-' +
        this.zeroFix(month) +
        '-' +
        this.zeroFix(day) +
        ' ' +
        this.zeroFix(hour) +
        ':' +
        this.zeroFix(minute),
      selectFlag: true,
      showFlag: false
    });
    // debugger;
  };

  render() {
    const { title } = this.props;
    const {
      showFlag,
      selectFlag,
      date,
      years,
      months,
      days,
      hours,
      minutes,
      seconds
    } = this.state;
    // console.log('render datepicker');
    // debugger;
    return (
      <View>
        <View
          onClick={this.handleOpen}
          className={`picker__date ${selectFlag ? '' : 'picker__date--gray'}`}
        >
          {selectFlag ? date : title}
          {/* {year + '-' + month + '-' + day + ' ' + hour + ':' + minute} */}
        </View>
        <AtFloatLayout isOpened={showFlag} onClose={this.handleCancel}>
          <View className="picker__btn-group">
            <Button className="picker__cancel" onClick={this.handleCancel}>
              取消
            </Button>
            <Text className="picker__title">{title}</Text>
            <Button className="picker__confirm" onClick={this.handleConfirm}>
              确定
            </Button>
          </View>
          <PickerView
            // indicatorStyle="height: 50px;"
            indicatorClass="picker"
            // maskClass="picker__mask"加类名会重置样式
            style="width: 100%; height: 210px;"
            value={this.state.value}
            onChange={this.onChange}
          >
            <PickerViewColumn className="picker__column--lg">
              {years.map((item, i) => {
                return (
                  <View key={i} className="picker__block">
                    {item}年
                  </View>
                );
              })}
            </PickerViewColumn>
            <PickerViewColumn className="picker__column">
              {months.map((item, i) => {
                return (
                  <View key={i} className="picker__block">
                    {item}月
                  </View>
                );
              })}
            </PickerViewColumn>
            <PickerViewColumn className="picker__column">
              {days.map((item, i) => {
                return (
                  <View key={i} className="picker__block">
                    {item}日
                  </View>
                );
              })}
            </PickerViewColumn>
            <PickerViewColumn className="picker__column">
              {hours.map((item, i) => {
                return (
                  <View key={i} className="picker__block">
                    {item}
                  </View>
                );
              })}
            </PickerViewColumn>
            <PickerViewColumn className="picker__column">
              {minutes.map((item, i) => {
                return (
                  <View key={i} className="picker__block">
                    {item}
                  </View>
                );
              })}
            </PickerViewColumn>
            {/* <PickerViewColumn className="picker__column">
              {this.state.seconds.map(item => {
                return <View className="picker__block">{item}</View>;
              })}
            </PickerViewColumn> */}
          </PickerView>
        </AtFloatLayout>
      </View>
    );
  }
}

// #region 导出注意
//
// 经过上面的声明后需要将导出的 Taro.Component 子类修改为子类本身的 props 属性
// 这样在使用这个子类时 Ts 才不会提示缺少 JSX 类型参数错误
//
// #endregion

export default picker as ComponentClass<IProps, PageState>;
