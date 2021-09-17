/* eslint-disable no-param-reassign,react/destructuring-assignment,consistent-return,array-callback-return */
import React, { PureComponent } from 'react';
import {
  Form, Tree, Select, Icon, Transfer, message, Input, Card, Divider, TimePicker, Button, Radio, Spin
} from 'antd';
import moment from 'moment';
import { connect } from 'dva';

import { PageHeaderWrapper } from '@ant-design/pro-layout';
import KeyValueInput from '@/components/KeyValueInput'
import styles from './index.less'

const FormItem = Form.Item;
const { TextArea } = Input;
const { Option } = Select;
const RadioGroup = Radio.Group;

let headerId = 0;
let paramId = 0;

@connect(({ iatSystem, iatTask }) => ({
  iatSystem,
  iatTask,
}))
@Form.create({
  onValuesChange(props, changedValues, allValues) {
    // 表单项变化时请求数据
    // eslint-disable-next-line
    if(changedValues){
      for (const changeKey in changedValues) {
        if (changeKey === 'project') {
          const projectId = allValues.project
          const { dispatch } = props;
          dispatch({
            type: 'iatTask/queryProjectCaseList',
            payload: {
              id: projectId,
            }
          })
        }
      }
    }
  },
})
class immDetail extends PureComponent {
  state={
    taskId: '',
    projectList: [],
    headerKeys: [],
    paramkeys: [],
    params: [],
    headers: [],
    taskInfo: {},
  }

  componentWillMount() {
    const params = this.props.location.search;
    if (params.indexOf('?') !== -1) {
      const detailId = params.substr(1);
        this.queryProjectList(detailId)
    }
  }

  queryTaskInfo=id => {
    this.props.dispatch({
      type: 'iatTask/queryTaskInfo',
      payload: { id }
    })
      .then(() => {
        const { iatTask } = this.props
        const headerKeys = []
        const paramkeys = []
        const headers = []
        const params = []
        headerId = (iatTask.taskInfo.headers.length > 0) && (iatTask.taskInfo.headers.length - 1)
        paramId = (iatTask.taskInfo.params.length > 0) && (iatTask.taskInfo.params.length - 1)

        iatTask.taskInfo.headers.forEach((item, index) => {
          headerKeys.push(index)
          headers.push(item)
        })
        iatTask.taskInfo.params.forEach((item, index) => {
          paramkeys.push(index)
          params.push(item)
        })

        this.setState({
          taskId: id,
          taskInfo: iatTask.taskInfo,
          headerKeys,
          paramkeys,
          headers,
          params,
        }, () => {
          const { dispatch } = this.props;
          dispatch({
            type: 'iatTask/queryProjectCaseList',
            payload: {
              id: iatTask.taskInfo.project,
            }
          })
        })
      })
  }

  queryProjectList=detailId => {
    const { dispatch } = this.props
    dispatch({
      type: 'iatSystem/queryProjectList',
      payload: {
        status: '1',
      }
    })
      .then(() => {
        const { projectList } = this.props.iatSystem;
        this.setState({
          projectList,
        }, () => { this.queryTaskInfo(detailId) })
      })
  };

  handleBack=() => {
    const { dispatch } = this.props;
    dispatch({
      type: 'iatTask/goListPage',
    })
  }

  handleSubmit = e => {
    const { dispatch, form } = this.props;
    e.preventDefault();
    form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const formatTime = moment(values.runTime).format('HH:mm')
        values.runTime = formatTime
        dispatch({
          type: 'iatTask/queryUpdateTaskInfo',
          payload: {
            info: values,
            id: this.state.taskId,
          }
        })
      }
    });
  };

  addHeader = () => {
    const { form } = this.props;
    // can use data-binding to get
    const keys = form.getFieldValue('headerkeys');
    const nextKeys = keys.concat(++headerId);
    // important! notify form to detect changes
    const { headers } = this.state
    headers.push({
      id: new Date().getTime(),
      key: '',
      value: '',
    })
    this.setState({ headers })
    form.setFieldsValue({
      headerkeys: nextKeys,
    });
  }

  addParam = () => {
    const { form } = this.props;
    // can use data-binding to get
    const keys = form.getFieldValue('paramkeys');
    const nextKeys = keys.concat(++paramId);
    // important! notify form to detect changes
    const { params } = this.state
    params.push({
      id: new Date().getTime(),
      key: '',
      value: '',
    })
    this.setState({ params })
    form.setFieldsValue({
      paramkeys: nextKeys,
    });
  }

  removeHeader = k => {
    const { form } = this.props;
    // can use data-binding to get
    const keys = form.getFieldValue('headerkeys');
    // can use data-binding to set
    form.setFieldsValue({
      headerkeys: keys.filter(key => key !== k),
    });
  }

  removeParam = k => {
    const { form } = this.props;
    // can use data-binding to get
    const keys = form.getFieldValue('paramkeys');
    // can use data-binding to set
    form.setFieldsValue({
      paramkeys: keys.filter(key => key !== k),
    });
  }

  render() {
    const {
      form: { getFieldDecorator, getFieldValue },
      iatTask,
    } = this.props;
    const { projectList, taskInfo, headerKeys, headers, params, paramkeys } = this.state;
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 7 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 12 },
        md: { span: 10 },
      },
    };
    const submitFormLayout = {
      wrapperCol: {
        xs: { span: 24, offset: 0 },
        sm: { span: 10, offset: 7 },
      },
    };
    getFieldDecorator('headerkeys', { initialValue: headerKeys });
    const headerkeys = getFieldValue('headerkeys');
    const headerItems = headerkeys.map((k, index) => {
        console.log(headers[k])

        if (headers[k]) {
          return (
            <Form.Item
              {...(index === 0 ? formItemLayout : submitFormLayout)}
              label={index === 0 ? '请求头参数' : ''}
              required={false}
              key={k}
            >
              {getFieldDecorator(`headers[${k}]`, {
                validateTrigger: ['onChange', 'onBlur'],
                initialValue: headers[k],
              })(
                <KeyValueInput />
              )}
              {headerkeys.length > 0 ? (
                <Icon
                  className={styles.dynamic_delete_button}
                  type="minus-circle-o"
                  onClick={() => this.removeHeader(k)}
                />
              ) : null}
            </Form.Item>
          )
        }
    }
    );
    getFieldDecorator('paramkeys', { initialValue: paramkeys });
    const paramkeys1 = getFieldValue('paramkeys');
    const paramItems = paramkeys1.map((k, index) => {
      if (params[k]) {
        return (
          <Form.Item
            {...(index === 0 ? formItemLayout : submitFormLayout)}
            label={index === 0 ? '全局参数' : ''}
            required={false}
            key={k}
          >
            {getFieldDecorator(`params[${k}]`, {
              validateTrigger: ['onChange', 'onBlur'],
              initialValue: params[k],
            })(
              <KeyValueInput />
            )}
            {paramkeys.length > 0 ? (
              <Icon
                className={styles.dynamic_delete_button}
                type="minus-circle-o"
                onClick={() => this.removeParam(k)}
              />
            ) : null}
          </Form.Item>
        )
      }
    });
    return (
      <PageHeaderWrapper>
        <Card bordered={false}>
          <Form onSubmit={this.handleSubmit} hideRequiredMark style={{ marginTop: 8 }}>
            <FormItem {...formItemLayout} label="项目名称">
              {getFieldDecorator('project', {
                rules: [
                  {
                    required: true,
                    message: '项目名称不可为空',
                  },
                ],
                initialValue: taskInfo.project,
              })(
                <Select placeholder="请先选择项目" style={{ width: 220 }}>
                  {projectList && projectList.map(item => (
                      <Option value={item.id} key={item.id} title={item.name}>{item.name}</Option>
                    ))}
                </Select>
              )}
            </FormItem>
            <FormItem {...formItemLayout} label="任务类型">
              <div>
                {getFieldDecorator('taskType', {
                  rules: [
                    {
                      required: true,
                      message: '任务类型不可为空',
                    },
                  ],
                  initialValue: taskInfo.taskType && taskInfo.taskType.toString(),
                })(
                  <Radio.Group>
                    <Radio value="1">即时任务</Radio>
                    <Radio value="2">定时任务</Radio>
                  </Radio.Group>
                )}
                <FormItem style={{ marginBottom: 0 }}>
                  {getFieldDecorator('runTime', {
                    initialValue: moment(taskInfo.runTime, 'HH:mm'),
                  })(
                    <TimePicker
                      format="HH:mm"
                      style={{
                        margin: '8px 0',
                        display: getFieldValue('taskType') === '2' ? 'block' : 'none',
                      }}
                    />
                  )}
                </FormItem>
              </div>
            </FormItem>
            <FormItem {...formItemLayout} label="任务名称">
              {getFieldDecorator('name', {
                rules: [
                  {
                    required: true,
                    message: '任务名称不可为空',
                  },
                ],
                initialValue: taskInfo.testname,
              })(<Input placeholder="请输入任务名称" />)}
            </FormItem>
            <FormItem {...formItemLayout} label="任务描述">
              {getFieldDecorator('taskDesc', {
                rules: [
                  {
                    required: false,
                  },
                ],
                initialValue: taskInfo.taskDesc
              })(
                <TextArea
                  style={{ minHeight: 32 }}
                  placeholder="请输入任务描述"
                  rows={4}
                />
              )}
            </FormItem>
            <FormItem {...formItemLayout} label="参数类型">
              {getFieldDecorator('valueType', {
                rules: [
                  {
                    required: true,
                  },
                ],
                initialValue: taskInfo.valueType,
              })(
                <Radio.Group>
                  <Radio value={1}>正式版</Radio>
                  <Radio value={2} disabled>测试版</Radio>
                </Radio.Group>,
              )}
            </FormItem>
            <FormItem {...formItemLayout} label="测试域名">
              {getFieldDecorator('domain', {
                rules: [
                  {
                    required: true,
                    message: '测试域名不可为空',
                  },
                ],
                initialValue: taskInfo.domain
              })(<Input placeholder="请输入测试域名 .eg: https://app.xxx.com:8080" />)}
            </FormItem>
            <FormItem {...formItemLayout} label="代理设置">
              {getFieldDecorator('proxy', {
                initialValue: taskInfo.proxy
              })(
                <Input placeholder="格式: user:password@server:port" />
              )}
            </FormItem>
            <Form.Item
              className={styles.listForm}
            >
              {headerItems}
              <Form.Item {...submitFormLayout}>
                <Button type="dashed" onClick={this.addHeader} style={{ width: '100%' }}>
                  <Icon type="plus" /> 设置请求头参数
                </Button>
              </Form.Item>
            </Form.Item>
            <Form.Item
              className={styles.listForm}
            >
              {paramItems}
              <Form.Item {...submitFormLayout}>
                <Button type="dashed" onClick={this.addParam} style={{ width: '100%' }}>
                  <Icon type="plus" /> 添加全局默认参数
                </Button>
              </Form.Item>
            </Form.Item>
            <FormItem {...formItemLayout} label="用例设置">
              {getFieldDecorator('case', {
                rules: [
                  {
                    required: true,
                    message: '任务用例不可为空',
                  },
                ],
                initialValue: taskInfo.caseIds
              })(
                <Transfer
                  dataSource={iatTask.caseData}
                  titles={['项目用例', '任务用例']}
                  targetKeys={getFieldValue('case')}
                  // selectedKeys={selectedKeys}
                  // onChange={this.handleChange}
                  // onSelectChange={this.handleSelectChange}
                  // onScroll={this.handleScroll}
                  render={item => item.name}
                />
              )}
            </FormItem>
            <FormItem {...submitFormLayout} style={{ marginTop: 32 }}>
              <Button onClick={() => this.handleBack()}>
                取消
              </Button>
              <Button type="primary" htmlType="submit" style={{ marginLeft: 8 }}>
                保存
              </Button>
            </FormItem>
          </Form>
        </Card>
      </PageHeaderWrapper>
    );
  }
}
export default immDetail
