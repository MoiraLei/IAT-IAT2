import React, { PureComponent } from 'react';
import {
  List, Tree, Select, Icon, Popconfirm, message, Input, Card, Divider, TimePicker, Button, Switch, Spin
} from 'antd';
import { connect } from 'dva';
import moment from 'moment';

import { PageHeaderWrapper } from '@ant-design/pro-layout';
import styles from './index.less'

const { Option } = Select;

@connect(({ iatSystem, iatTask, loading }) => ({
  iatSystem,
  iatTask,
  loading: loading.effects['task/queryTaskList']
}))
class Timing extends PureComponent {
  state={
    taskList: {
      taskContent: []
    },
  };

  componentWillMount() {
    this.queryTaskList()
  }

  queryTaskList=() => {
    const { dispatch } = this.props;
    dispatch({
      type: 'iatTask/queryTaskList',
      payload: {
        taskType: 2,
      }
    })
      .then(() => {
        const { taskList } = this.props.iatTask;
        this.setState({ taskList })
      })
  };

  handleAddTask=() => {
    const { dispatch } = this.props;
    dispatch({
      type: 'iatTask/goTimAddPage'
    })
  };

  handleStateChange=(checked, id) => {
    if (checked) {
      this.handleRunTask(id)
    } else {
      this.querySetTaskStatus(id, 4)
    }
  };

  handleRunTask=id => {
    const { dispatch } = this.props;
    dispatch({
      type: 'iatTask/queryTaskExcute',
      payload: {
        id,
      }
    })
      .then(() => {
        this.queryTaskList()
      })
  };

  handleTimeChange=(id, e) => {
    const runTime = moment(e).format('HH:mm')
    const { dispatch } = this.props;
    dispatch({
      type: 'iatTask/queryUpdateRunTime',
      payload: {
        id,
        runTime,
      }
    })
      .then(() => {
        this.queryTaskList()
      })
  }

  querySetTaskStatus=(id, status) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'iatTask/querySetTaskStatus',
      payload: {
        id,
        status,
      }
    })
      .then(() => {
        this.queryTaskList()
      })
  };

  handleGoReport= id => {
    const { dispatch } = this.props;
    dispatch({
      type: 'iatTask/goTimReportPage',
      payload: { id },
    });
  };

  handleDelTask=id => {
    const { dispatch } = this.props;
    dispatch({
      type: 'iatTask/queryTaskDelete',
      payload: {
        id,
      },
    })
      .then(() => {
        this.queryTaskList();
      });
  };

  render() {
    const { loading } = this.props;
    const content = (
      <div className={styles.pageHeaderContent}>
        <p>
          ?????????????????????????????????????????? ???????????????????????????????????????????????????
        </p>
      </div>
    );
    const description = item => (
      <div className={styles.descriptionContainer}>
        <div className={styles.item_container}>
          <span>???????????????</span>
          <TimePicker
            format="HH:mm"
            size="small"
            value={moment(item.runTime, 'HH:mm')}
            style={{
              margin: '8px 0',
            }}
            onChange={e => this.handleTimeChange(item.id, e)}
          />
        </div>
        <div className={styles.item_container}>
          <span>???????????????</span>
          <div>{item.taskDesc}</div>
        </div>
      </div>
    );
    const cardTitle = item => (
        <div className={styles.switchContainer}>
          <a target="_blank" rel="noopener noreferrer" href={`/task/api/timing/detail?${item.id}`} style={{ color: '#40a9ff', fontWeight: 'bold' }}>
            {item.name}
          </a>
          <div className={styles.switchButton}>
            <Switch
              checkedChildren="???"
              unCheckedChildren="???"
              checked={!(item.status === 0 || item.status === 4)}
              onChange={checked => this.handleStateChange(checked, item.id)}
            />
          </div>
        </div>
      );
    const reportLink = item => {
      if (item.status === 3) {
        return (
          <Button type="link" onClick={() => this.handleGoReport(item.id)}>????????????</Button>
        );
      }
      return (
        <span>????????????</span>
      );
    };
    return (
      <PageHeaderWrapper title="??????????????????" content={content}>
        <div className={styles.cardList}>
          <List
            loading={loading}
            rowKey="id"
            grid={{ gutter: 24, lg: 3, md: 2, sm: 1, xs: 1 }}
            dataSource={[...this.state.taskList.taskContent, '']}
            renderItem={item =>
              (item ? (
                <List.Item key={item.id}>
                  <Card
                    hoverable
                    className={styles.card}
                    actions={[
                      <Popconfirm
                        title="????????????????????????"
                        onConfirm={() => this.handleDelTask(item.id)}
                        okText="??????"
                        cancelText="??????"
                      >
                        <Icon className={styles.deleteIcon} type="delete" />
                      </Popconfirm>,
                      reportLink(item),
                    ]}
                  >
                    <Card.Meta title={cardTitle(item)} description={description(item)} />
                  </Card>
                </List.Item>
              ) : (
                <List.Item>
                  <Button
                    type="dashed"
                    className={styles.newButton}
                    onClick={() => this.handleAddTask()}
                  >
                    <Icon type="plus" /> ????????????
                  </Button>
                </List.Item>
              ))
            }
          />
        </div>
      </PageHeaderWrapper>
    );
  }
}
export default Timing
