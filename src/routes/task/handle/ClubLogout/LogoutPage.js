import React, {PureComponent} from 'react';
import {connect} from 'dva';
import {
  message, Form, Input, DatePicker, Select, Button, Card, InputNumber, Radio, Icon, Upload,
} from 'antd';
import PageHeaderLayout from '../../../../layouts/PageHeaderLayout';
// import styles from './style.less';
import {Link} from 'dva/router';
const FormItem = Form.Item;
const {Option} = Select;
const {RangePicker} = DatePicker;
const {TextArea} = Input;

@connect(state => ({
  clubLogout: state.clubLogout,
  info: state.info
}))
@Form.create()
export default class LogoutPage extends PureComponent {
  state = {
    confirmLoading: false,
    uploadLoading: false,
    formData: {
      "sysAssCancel": "",
      "commentVoList": {
        time: new Date(),
        userId: '',
        fullMessage: ''
      },
      outcomeList: '',
      taskId: ''
    },
    logoutData: {
      "id": "",
      "assId": "",
      "cancelReasons": "",
      "assSituation": "",
      recheckNum: 0,
      status: 0
    },
    clubList: []
  }
  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        if (this.props.location.data != undefined && this.props.location.data.id != null) {
          this.props.dispatch({
            type: 'clubLogout/update',
            payload: values,
          });
        } else {
          this.props.dispatch({
            type: 'clubLogout/add',
            payload: values,
          });
        }
      }
    });
  }

  componentDidMount() {
    this.getData({})
  }

  getData() {
    this.props.dispatch({
      type: 'info/getAll',
      payload: {},
      callback: (res) => {
        this.setState({
          clubList: res.data
        });
      }
    });
    if (this.props.location.data != undefined) {
      const id = this.props.location.data.id;
      if (id != null) {
        this.props.dispatch({
          type: 'clubLogout/getOne',
          payload: {
            id: this.props.location.data.id
          },
          callback: (res) => {
            if (res.ret) {
              this.setState({
                logoutData: {
                  ...res.data
                }
              });
            } else if (res.msg) {
              message.error(res.msg);
            }
          }
        });
      }
    }
  }

  render() {
    const {clubLogout} = this.props;
    const {getFieldDecorator, getFieldValue} = this.props.form;
    //const formData = clubLogout.oneData == undefined ? {} : clubLogout.oneData;
    const {formData, clubList, logoutData} = this.state;
    let clubName = clubList.find(item => {
      return logoutData.assId == item.id
    })
    clubName = clubName && clubName.name
    const uploadSetting = {
      name: 'file',
      action: '//jsonplaceholder.typicode.com/posts/',
      headers: {
        authorization: 'authorization-text',
      },
      /* onChange(info) {
       console.log(info)
       if (info.file.status !== 'uploading') {
       console.log(info.file, info.fileList);
       }
       if (info.file.status === 'done') {
       message.success(`${info.file.name} file uploaded successfully`);
       } else if (info.file.status === 'error') {
       message.error(`${info.file.name} file upload failed.`);
       }
       },*/
    }
    const formItemLayout = {
      labelCol: {
        xs: {span: 24},
        sm: {span: 7},
      },
      wrapperCol: {
        xs: {span: 24},
        sm: {span: 12},
        md: {span: 10},
      },
    };
    const submitFormLayout = {
      wrapperCol: {
        xs: {span: 24, offset: 0},
        sm: {span: 10, offset: 7},
      },
    };
    /*const uploadButton = (
     <div>
     <Icon type={this.state.uploadLoading ? 'loading' : 'plus'}/>
     <div className="ant-upload-text">上传logo</div>
     </div>
     );*/
    return (
      <PageHeaderLayout title="社团注销审批" content="">
        <Card bordered={false}>
          <Form
            onSubmit={this.handleSubmit}
            hideRequiredMark
            style={{marginTop: 8}}
          >

            <FormItem
              {...formItemLayout}
              label="社团名称"
            > {clubName}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="注销理由"
            > {logoutData.cancelReasons}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="社团情况"
            >  {logoutData.assSituation}
            </FormItem>
            <FormItem {...submitFormLayout} style={{marginTop: 32}}>
              <Button type="primary" htmlType="submit" loading={this.state.confirmLoading}>
                提交审批意见
              </Button>
              <Button>
                <Link to={{
                  pathname: '/task/tHClubLogout',
                }
                }> 返回列表</Link> </Button>
            </FormItem>
          </Form>
        </Card>
      </PageHeaderLayout>
    );
  }
}
