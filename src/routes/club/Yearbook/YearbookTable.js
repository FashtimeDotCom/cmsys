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
import YearbookForm from './YearbookForm';
import YearbookModal from './YearbookModal';

@connect(state => ({
  yearbook: state.yearbook,
}))
export default class YearbookTable extends PureComponent {
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
      type: 'yearbook/queryList',
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
      type: 'yearbook/queryList',
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
          type: 'yearbook/getOne',
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
      type: 'yearbook/queryList',
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

  handleDelete(delOneId) {
    /*
     * delOneId：删除单个时的传参
     * */
    const {dispatch, yearbook: {data: {pagination}}} = this.props;
    let {selectedRows, formValues} = this.state;
    if (arguments.length > 1) {//删除单个
      selectedRows.push({
        id: delOneId
      });
    }
    if (!selectedRows) return;

    dispatch({
      type: 'yearbook/changeLoading',
      payload: {
        bool: true,
      },
    });
    dispatch({
      type: 'yearbook/dels',
      payload: {
        ids: selectedRows.map((item) => (item.id))
      },
      callback: () => {
        dispatch({
          type: 'yearbook/queryList',
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
    const {yearbook: {loading: userLoading, data}} = this.props;

    const {selectedRows} = this.state;
    const columns = [
      {
        title: '姓名',
        dataIndex: 'name',
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
              <YearbookForm
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
        <YearbookModal modalVisible={this.state.modalVisible}
                       modalLoading={this.state.modalLoading}
                       data={this.state.modalData}
                       dispatch={this.props.dispatch}
                       handleModalVisible={this.handleModalVisible.bind(this)}/>

      </PageHeaderLayout>
    );
  }
}
