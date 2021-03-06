import React, {PureComponent} from 'react';
import {connect} from 'dva';
import {
  Card,
  Button,
  message,
  Divider,
  Switch,
  Dropdown,
  Menu,
  Icon
} from 'antd';
import StandardTable from '../../../components/StandardTable/index';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import ArticleForm from './ArticleForm';
import ArticleModal from './ArticleModal';

@connect(state => ({
  article: state.article,
}))
export default class ArticleTable extends PureComponent {
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
    const {dispatch} = this.props;
    dispatch({
      type: 'article/queryList',
      payload: {
        keyword: '',
        pageNo: 1,
        pageSize: 10
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
    dispatch({
      type: 'article/queryList',
      payload: params,
    });
  }

  handelModal(key, id) {
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
          type: 'article/getOne',
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
    dispatch({
      type: 'article/queryList',
      payload: {
        keyword: value.keyword,
        pageNo: 1,
        pageSize: 10
      }
    });
  }

  handleFormReset() {
    this.setState({
      formValues: {}
    });
  }

  handleChangeStatus(val, id) {
    const {dispatch} = this.props;
    let type = val == 0 ? 'article/enable' : 'article/disable';
    this.setState({
      SwitchLoadingId: id,
      selectedRows: [],
    });
    dispatch({
      type: type,
      payload: {
        ids: [id]
      },
      callback: () => {
        this.setState({
          SwitchLoadingId: '',
        });
      }
    });
  }

  handleMenuClick(e) {
    const {dispatch} = this.props;
    const {selectedRows} = this.state;
    if (!selectedRows) return;
    let type = '';
    let newSelectedRows = [];
    let ids = [];
    switch (e.key) {
      case 'enable':
        type = 'article/enable';
        newSelectedRows = selectedRows.filter((item) => (item.status == 0));
        ids = newSelectedRows.map((item) => (item.id));
        break;
      case 'disable':
        type = 'article/disable';
        newSelectedRows = selectedRows.filter((item) => (item.status == 1));
        ids = newSelectedRows.map((item) => (item.id));
        break;
      default:
        break;
    }
    if (ids.length == 0) {
      return;
    }
    dispatch({
      type: 'article/changeLoading',
      payload: {
        bool: true,
      },
    });
    dispatch({
      type: type,
      payload: {
        ids: ids
      },
      callback: () => {
        this.setState({
          selectedRows: [],
        });
        dispatch({
          type: 'article/changeLoading',
          payload: {
            bool: false,
          },
        });
      }
    });
  }

  handleDelete() {
    const {dispatch, article: {data: {pagination}}} = this.props;
    const {selectedRows, formValues} = this.state;
    if (!selectedRows) return;
    dispatch({
      type: 'article/changeLoading',
      payload: {
        bool: true,
      },
    });
    dispatch({
      type: 'article/dels',
      payload: {
        ids: selectedRows.map((item) => (item.id))
      },
      callback: () => {
        dispatch({
          type: 'article/queryList',
          payload: {
            ...formValues,
            pageNo: pagination.currentPage,
            pageSize: pagination.pageSize,
          },
        });
        this.setState({
          selectedRows: [],
        });
      }
    });
  }


  render() {
    const {article: {loading: userLoading, data}} = this.props;
    const {selectedRows} = this.state;
    const columns = [
      {
        title: '姓名',
        dataIndex: 'name',
      },
      {
        title: '任职状态',
        dataIndex: 'status',
        render: (val, record) => {
          return (
            <Switch
              loading={record.id === this.state.SwitchLoadingId}
              checked={val == 1}
              checkedChildren="在职"
              unCheckedChildren="离职"
              onChange={this.handleChangeStatus.bind(this, val, record.id)}
            />
          );
        },
      },
      {
        title: '部门',
        dataIndex: 'dept',
      },
      {
        title: '现任职位',
        dataIndex: 'position',
      },
      {
        title: '学号',
        dataIndex: 'stuNum',
      },
      {
        title: '所属专业',
        dataIndex: 'major',
      },
      {
        title: '操作',
        dataIndex: 'id',
        render: (val) => (
          <div>
            <a href="javascript:;" onClick={this.handelModal.bind(this, 'read', val)}>查看详细</a>
            <Divider type="vertical"/>
            <a href="javascript:;" onClick={this.handelModal.bind(this, 'edit', val)}>修改</a>
          </div>
        ),
      },
    ];
    const menu = (
      <Menu onClick={this.handleMenuClick.bind(this)} selectedKeys={[]}>
        <Menu.Item key="enable">在职</Menu.Item>
        <Menu.Item key="disable">离职</Menu.Item>
      </Menu>
    );
    return (
      <PageHeaderLayout>
        <Card bordered={false}>
          <div className="tableList">
            <div className="tableListForm">
              <ArticleForm
                handleSearch={this.handleSearch.bind(this)}
                formReset={this.handleFormReset.bind(this)}
                dispatch={this.props.dispatch}
              />
            </div>
            <div className="tableListOperator">
              <Button icon="plus" type="primary" onClick={this.handelModal.bind(this, 'add')}>新建</Button>
              {
                selectedRows.length > 0 && (
                  <span>
                    <Button onClick={this.handleDelete.bind(this)}>删除</Button>
                     <Dropdown overlay={menu}>
                      <Button>
                        批量设置任职状态 <Icon type="down"/>
                      </Button>
                    </Dropdown>
                  </span>
                )
              }
            </div>
            <StandardTable
              selectedRows={selectedRows}
              loading={userLoading}
              columns={columns}
              data={data}
              isSelect={true}
              onSelectRow={this.handleSelectRows}
              onChange={this.handleStandardTableChange}
            />
          </div>
        </Card>
        <ArticleModal modalVisible={this.state.modalVisible}
                       modalLoading={this.state.modalLoading}
                       data={this.state.modalData}
                       dispatch={this.props.dispatch}
                       handleModalVisible={this.handleModalVisible.bind(this)}
        />

      </PageHeaderLayout>
    );
  }
}
