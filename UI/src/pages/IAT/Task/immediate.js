/* eslint-disable react/sort-comp,react/no-typos */
import React, { PureComponent } from 'react';
import { Table, Badge, Icon, Popconfirm, Card, Divider, Button } from 'antd';
import { connect } from 'dva';
import io from 'socket.io-client';

import { PageHeaderWrapper } from '@ant-design/pro-layout';

@connect(({ iatTask, loading }) => ({
  iatTask,
  loading: loading.effects['iatTask/queryTaskList'],
}))
class Immediate extends PureComponent {
  // 构造
  constructor(props) {
    super(props);
    // 初始状态
    this.state = {
      taskList: {},
      currentPage: 1,
    };
    this.socket = null;
  }

  componentWillMount() {
    const hostname = window.location.host;
    console.log('hostname:', hostname);
    this.setState({ hostname });
    this.socket = io(`ws://${hostname}/wstask`);
    this.socket.on('connect', () => {
      console.log('<= 连接调试服务器成功！');
    });
    this.queryTaskList();
    this.getTaskList();
  }

  componentDidMount() {
    this.socket.on('setTaskStatus', status => {
      console.log('<= 收到任务状态', status);
    });
  }

  componentWillUnMount() {
    this.socket.disconnect();
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.socket.on('disconnect', () => {
      console.log('关闭连接');
    });
  }

  getTaskList = () => {
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.timer = setInterval(() => {
      this.socket.emit(
        'iatTaskList',
        { taskType: 1, pageNum: this.state.currentPage },
        taskList => {
          this.setState({ taskList });
        },
      );
    }, 2000);
  };

  queryTaskList = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'iatTask/queryTaskList',
      payload: {
        taskType: 1,
        pageNum: this.state.currentPage,
      },
    }).then(() => {
      const { taskList } = this.props.iatTask;
      this.setState({ taskList });
    });
  };

  handleGoAdd = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'iatTask/goAddPage',
    });
  };

  handleRunTask = id => {
    const { dispatch } = this.props;
    dispatch({
      type: 'iatTask/queryTaskExcute',
      payload: {
        id,
      },
    }).then(() => {
      this.queryTaskList();
      // this.timer = setInterval(() => this.queryTaskList(), 10000);
    });
  };

  handleDelTask = id => {
    const { dispatch } = this.props;
    dispatch({
      type: 'iatTask/queryTaskDelete',
      payload: {
        id,
      },
    }).then(() => {
      this.queryTaskList();
    });
  };

  renderStatus = status => {
    let result;
    switch (status) {
      case 1:
        result = <Badge status="processing" text="获取任务信息" />;
        break;
      case 2:
        result = <Badge status="processing" text="生成测试脚本" />;
        break;
      case 3:
        result = <Badge status="success" text="执行完成" />;
        break;
      case 4:
        result = <Badge status="error" text="获取任务信息失败" />;
        break;
      case 5:
        result = <Badge status="error" text="执行任务失败" />;
        break;
      default:
        result = <Badge status="default" text="新任务" />;
    }
    return result;
  };

  handlePageChange = e => {
    this.setState(
      {
        currentPage: e.current,
      },
      () => {
        this.queryTaskList();
      },
    );
  };

  render() {
    const { taskList, currentPage } = this.state;
    const { loading } = this.props;
    const columns = [
      {
        title: '任务名称',
        dataIndex: 'name',
        key: 'name',
        render: (text, record) => (
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={`/task/api/immediate/detail?${record.id}`}
            style={{ color: '#2e86de', fontWeight: 'bold' }}
          >
            {text}
          </a>
        ),
      },
      {
        title: '任务描述',
        dataIndex: 'taskDesc',
        key: 'taskDesc',
      },
      {
        title: '新建人',
        dataIndex: 'add_user',
        key: 'add_user',
      },
      {
        title: '新建时间',
        dataIndex: 'add_time',
        key: 'add_time',
      },
      {
        title: '任务状态',
        dataIndex: 'status',
        key: 'status',
        render: (text, record) => this.renderStatus(record.status),
      },
      {
        title: '操作',
        dataIndex: 'action',
        key: 'action',
        render: (text, record) => (
          <div>
            {record.status === 0 && <a onClick={() => this.handleRunTask(record.id)}>开始执行</a>}
            {record.status === 3 && (
              <a
                style={{ color: '#2e86de', fontWeight: 'bold' }}
                href={`/task/api/immediate/report?${record.id}`}
              >
                查看报告
              </a>
            )}
            {[0, 3].indexOf(record.status) > -1 && <Divider type="vertical" />}
            {!([1, 2].indexOf(record.status) > -1) && (
              <Popconfirm title="是否要删除此行？" onConfirm={() => this.handleDelTask(record.id)}>
                <a style={{ color: '#eb2f06' }}>删除</a>
              </Popconfirm>
            )}
          </div>
        ),
      },
    ];
    return (
      <PageHeaderWrapper>
        <Card bordered={false}>
          <div style={{ marginBottom: 16 }}>
            <Button type="primary" onClick={() => this.handleGoAdd()}>
              <Icon type="plus" />
              新建任务
            </Button>
          </div>
          <Table
            dataSource={taskList.taskContent}
            columns={columns}
            loading={loading}
            pagination={{
              pageSize: 20,
              current: currentPage,
              total: taskList.total,
            }}
            onChange={this.handlePageChange}
          />
        </Card>
      </PageHeaderWrapper>
    );
  }
}
export default Immediate;
