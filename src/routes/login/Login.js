import React from 'react'
import './Login.scss'
import {
    ButtonArea,
    Button,
    Cell,
    CellHeader,
    CellBody,
    Dialog,
    Form,
    FormCell,
    Input,
    Toast,
    Footer,
    FooterText
} from 'react-weui/build/packages';
import {Redirect} from 'react-router-dom'
import Page from '../../components/common/page'
import Auth from '../../models/Auth'
import Query from 'query-string'

class Login extends React.Component {

    constructor(props) {
        super(props);

        document.title = "登录";

        this.state = {
            username: '',
            password: '',
            loading: false,
            isLoginSuccess: Auth.getId().length,
            showAlert: false,
            alert: {
                content: '',
                buttons: [
                    {
                        label: '确定',
                        onClick: this.hideAlert.bind(this)
                    }
                ]
            },
        };
    }

    /**
     * 登录
     */
    login() {
        let {username, password} = this.state;

        if (!username) {
            this.showAlert('请输入账号');
            return;
        }
        if (!password) {
            this.showAlert('请输入密码');
            return;
        }

        // 验证
        this.setState({
            loading: true,
        });
        Auth.login(username, password, ((message) => {
            if (Auth.getOpenId()) {
                Auth.modify('create');
            }
            this.setState({loading: false});
            this.redirect();
        }), ((message) => {
            this.setState({loading: false});
            this.showAlert(message);
        }));
    }


    showAlert(msg) {
        this.setState({
            showAlert: true,
            alert: Object.assign(this.state.alert, {content: msg}),
        });
    }

    hideAlert() {
        this.setState({showAlert: false});
    }

    redirect() {
        let pathname = '';
        if (Auth.getUserType() === "0") {
            pathname = '/user'
        }else if (Auth.getUserType() === "1") {
            pathname = '/engineer'
        }else {
            return
        }
        let search = this.props.location.search;
        let params = Query.parse(decodeURIComponent(search));
        if (params.prePathname && params.prePathname != "/" && params.prePathname != "/login") {
            pathname = params.prePathname
        }
        this.props.history.replace({
            pathname: pathname
        })
    }

    handleFormSubmit(e) {
        e.preventDefault();
        this.login();
    }

    /**
     * 登录成功后，根据用户类型跳转
     * @returns {XML}
     */
    redirectAfterLogin() {
        let type = Auth.getUserType();
        switch (type) {
            case "0":
                return <Redirect to="/user"/>;
            case "1":
                return <Redirect to="/engineer/utilization"/>;
        }
    }

    /**
     * 登录页面
     * @returns {XML}
     */
    renderLoginPage() {
        return (
            <div className="Login">
                <div className="page-logo">
                    <img src={require('../../../asset/login/logo.svg')}/>
                </div>
                <form onSubmit={this.handleFormSubmit.bind(this)}>
                    <Form>
                        <FormCell>
                            <CellHeader>
                                <img src={require('../../../asset/login/ico_account@2x.png')} className="icon-img"/>
                            </CellHeader>
                            <CellBody>
                                <Input
                                    value={this.state.username}
                                    onChange={(e) => {
                                        this.setState({username: e.target.value})
                                    }}
                                    placeholder="用户名"/>
                            </CellBody>
                        </FormCell>
                        <FormCell>
                            <CellHeader>
                                <img src={require('../../../asset/login/ico_password@2x.png')} className="icon-img"/>
                            </CellHeader>
                            <CellBody>
                                <Input
                                    type="password"
                                    value={this.state.password}
                                    onChange={(e) => {
                                        this.setState({password: e.target.value})
                                    }}
                                    placeholder="密码"/>
                            </CellBody>
                        </FormCell>
                        <FormCell className="lastFormCell">
                        </FormCell>
                    </Form>
                    <ButtonArea>
                        <Button type="submit" className="weui_btn_primary">登录</Button>
                    </ButtonArea>
                </form>

                <br/>

                <Footer>
                    <FooterText>Relax V1.1.129</FooterText>
                </Footer>

                <Toast icon="loading" show={this.state.loading}>登录中...</Toast>
                <Dialog buttons={this.state.alert.buttons} show={this.state.showAlert}>
                    {this.state.alert.content}
                </Dialog>
            </div>
        );
    }

    render() {
        return this.renderLoginPage()
    }
}

export default Login;
