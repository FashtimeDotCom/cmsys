import React, {PureComponent} from 'react';
import {connect} from 'dva';
import {
  Card,
  Button,
  message,
  Divider,
  Modal
} from 'antd';
const confirm = Modal.confirm;
import {Link} from 'dva/router';
import StandardTable from '../../../../components/StandardTable/index';
import PageHeaderLayout from '../../../../layouts/PageHeaderLayout';
import LogoutForm from './LogoutForm';
import LogoutModal from './LogoutModal';
import moment from 'moment';
@connect(state => ({
  clubLogout: state.clubLogout,
  currentUser: state.login.currentUser
}))
export default class LogoutTable extends PureComponent {
  state = {
    addInputValue: '',
    modalVisible: false,
    modalLoading: false,
    modalData: {
      key: '',
      id: '',
      data: {}
    },
    expandForm: false,
    selectedRows: [],
    formValues: {
      keyword: ""
    },
    SwitchLoadingId: ''


  };

  componentDidMount() {
    this.getData({})
  }

  getData(params, isRefresh) {
    const {dispatch, currentUser} = this.props;
    if (isRefresh) {
      params = {
        keyword: '',
        pageNo: 1,
        pageSize: 10,
      }
    }
    dispatch({
      type: 'clubLogout/getTaskList',
      payload: {
        assId: currentUser.assId || '',
        keyword: '',
        pageNo: 1,
        pageSize: 10,
        ...params
      }
    });
  }

  handleStandardTableChange = (pagination) => {
    const {dispatch} = this.props;
    const {formValues} = this.state;

    const params = {
      keyword: formValues.keyword,
      pageNo: pagination.current,
      pageSize: pagination.pageSize,
    };
    this.getData(params);
  }

  handelModal(key, id) {
    switch (key) {
      case 'add':
        break;
      case 'edit':
        break;
    }
    switch (key) {
      case 'add':
        this.setState({
          modalVisible: true,
          modalData: {
            key,
            id: ''
          }
        });
        break;
      case 'read':
      case 'edit':
        this.setState({
          modalVisible: true,
          modalLoading: true,
          modalData: {
            key,
          }
        });
        this.props.dispatch({
          type: 'clubLogout/getOne',
          payload: {
            id
          },
          callback: (res) => {
            if (res.ret) {
              var old = this.state.modalData;
              this.setState({
                modalData: {
                  ...old,
                  data: res.data,
                },
                modalLoading: false,
              });
            } else if (res.msg) {
              message.error(res.msg);
            }
          }
        });

        break;
      default:
        return;
    }
  }

  handleModalVisible() {
    this.setState({
      modalVisible: false
    })
  }


  handleSelectRows = (rows) => {
    this.setState({
      selectedRows: rows,
    });
  }

  handleSearch(value) {
    this.setState({
      formValues: {
        ...value
      },
      selectedRows: [],
    });
    const {dispatch} = this.props;
    this.getData(({
      ...value,
    }))
  }

  handleFormReset() {
    this.setState({
      formValues: {}
    });
  }

  handleDelete(delOneId) {
    /*
     * delOneId：删除单个时的传参
     * */
    const {dispatch, clubLogout: {taskSubmit: {pagination}}} = this.props;
    let {selectedRows, formValues} = this.state;
    // let ids = selectedRows.map((item) => (item.id));
    // if (arguments.length > 1) {//删除单个
    //   ids.push(delOneId);
    // }
    // if (!ids) return;
    confirm({
      title: '你确定要删除这些信息吗?',
      content: '删除后不可恢复',
      okText: '是的',
      okType: 'danger',
      cancelText: '不，取消',
      onOk: () => {
        dispatch({
          type: 'clubLogout/changeLoading',
          payload: {
            bool: true,
          },
        });
        dispatch({
          type: 'clubLogout/del',
          payload: {
            id: delOneId
          },
          callback: () => {
            dispatch({
              type: 'clubLogout/getTaskList',
              payload: {
                ...formValues,
                pageNo: pagination.currentPage,
                pageSize: pagination.pageSize,
              },
            });
          }
        });
      },
      onCancel() {
        message.warning('您取消了操作');
      },
    });
  }

  submitTask(id) {
    this.state.modalVisible = false
    const {formValues} = this.state;
    const that = this;
    this.props.dispatch({
      type: 'clubLogout/submitTask',
      payload: {
        id: id
      },
      callback: (res) => {
        const pagination = that.props.clubLogout.taskSubmit.pagination;
        const params = {
          keyword: formValues.keyword,
          pageNo: pagination.currentPage,
          pageSize: pagination.pageSize,
        };
        that.getData(params);
      }
    })
  }

  render() {
    const {clubLogout: {loading: userLoading, taskSubmit}} = this.props;
    const {selectedRows} = this.state;
    const columns = [
      {
        title: '任务名称',
        dataIndex: 'name',
      },
      {
        title: '创建日期',
        dataIndex: 'createTime',
        render: (val) => {
          return moment(val).format('YYYY-MM-DD hh:mm')
        }
      },
      {
        title: '任务办理人',
        dataIndex: 'assignee',
      },
      {
        title: '操作',
        dataIndex: 'id',
        render: (val) => (
          <div>
            <a href="javascript:;" onClick={this.submitTask.bind(this, val)}>发起审批任务</a>
            <Divider type="vertical"/>
            <Link to={{pathname: '/task/tSClubLogoutProgress',data: {taskId: val}}}> 查看进度</Link>
            <Divider type="vertical"/>
            <a href="javascript:;" onClick={this.handelModal.bind(this, 'read', val)}>查看详细</a>
            <Divider type="vertical"/>
            <a href="javascript:;" onClick={this.handelModal.bind(this, 'edit', val)}>修改</a>
            <Divider type="vertical"/>
            <a href="javascript:;" onClick={this.handleDelete.bind(this, val)}>删除</a>
          </div>
        ),
      },
    ];
    return (
      <PageHeaderLayout>
        <Card bordered={false}>
          <div className="tableList">
            <div className="tableListForm">
              <LogoutForm
                handleSearch={this.handleSearch.bind(this)}
                formReset={this.handleFormReset.bind(this)}
                dispatch={this.props.dispatch}
              />
            </div>
            <div className="tableListOperator">
              <Button icon="plus" type="primary" onClick={this.handelModal.bind(this, 'add', null)}>
                新建
              </Button>
            </div>
            <StandardTable
              selectedRows={selectedRows}
              loading={userLoading}
              columns={columns}
              data={taskSubmit}
              isSelect={false}
              onSelectRow={this.handleSelectRows}
              onChange={this.handleStandardTableChange}
            />
          </div>
        </Card>
        <LogoutModal modalVisible={this.state.modalVisible}
                     modalLoading={this.state.modalLoading}
                     data={this.state.modalData}
                     dispatch={this.props.dispatch}
                     submitTask={this.submitTask.bind(this)}
                     handleModalVisible={this.handleModalVisible.bind(this)}
        />

      </PageHeaderLayout>
    );
  }
}
