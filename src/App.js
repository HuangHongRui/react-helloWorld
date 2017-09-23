
import React, { Component } from 'react';
import 'normalize.css';
import './reset.css';
import './App.css';
import './iconfont/iconfont.css';
import TodoInput from './TodoInput';
import TodoItem from './TodoItem';
import UserDialog from './UserDialog';
import {getCurrentUser} from './leancloud';
import {signOut} from './leancloud';
import {loadList} from './leancloud';
import {saveListTable} from './leancloud';
import {updateListTable} from './leancloud';
import copyByJSON from './copyByJSON';
import TodoGroup from './TodoGroup';

class App extends Component {
    constructor(props){
        super(props);
        this.state = {
            user: getCurrentUser()||{},
            newTodo: '',        // TODO 输入栏实时内容
            newGroup: '',       // 分组input输入内容
            groups: [],         // 菜单分组
            currentGroup: '',   // 获取焦点组的名称
            asideOpend: true,   // 默认侧边栏打开
            todoList: []        // todo组
        }
    }

    // 初始化加载列表
    componentWillMount(){
        //判断当前用户是否为空，为空就跳转到登录页面让用户登录，如果不为空就跳转到首页
        if(this.state.user.id){
            this.initTodoList.call(this);
        }
    }
 
    initTodoList(){
        function success(list){
            //解析为Js字符串
            let stateCopy = copyByJSON(this.state);
            //todo列表
            stateCopy.todoList = list;
            //遍历列表
            list.forEach(function(element) {
                if(element.group && stateCopy.groups.indexOf(element.group) === -1){
                    //如果列表里木有，那么添加到头部.
                    stateCopy.groups.unshift(element.group);
                }
            }, list);

            stateCopy.currentGroup = stateCopy.groups[0];
            this.setState(stateCopy);
        }

        function error(){
            this.addTodo('null', true);
            let stateCopy = copyByJSON(this.state);
            stateCopy.currentGroup = '我的待办';
            this.addGroup.call(this, '我的待办');
            this.setState(stateCopy);
            this.initTodoList.call(this);
        }
        // 读取
        loadList(this.state.user.id, success.bind(this), error.bind(this));
    }

    render(){
        let todos = this.state.todoList
            //先筛选出 选择 的组别
            .filter((item)=>item.group===this.state.currentGroup)
            //再筛选出 非删除的元素
            .filter((item)=>!item.deleted)
            //最后新的map对象迭代键值
            .map((item,index)=>{
                return (
                    <li key={index}>
                      <TodoItem todo={item} onToggle={this.toggle.bind(this)}
                                onDelete={this.delete.bind(this)}  id={item.id}/>
                    </li>
                )
            });

        return (
            <div className="App">
              <div className="iconfont icon-caidan" onClick={this.hideAside.bind(this)}></div>
                {this.state.asideOpend ?
                    <div className="aside-opened">
                      <div className="header">
                        <p>{this.state.user.username||'我'}的待办
                        </p>
                          {this.state.user.id ? <button onClick={this.signOut.bind(this)}>退出</button> : null}
                      </div>
                      <TodoInput content={this.state.newGroup}//内容
                                 onChange={this.changeGroupTitile.bind(this)} //会同步刷新到newGroup
                                 onSubmit={this.addGroup.bind(this)}
                                 placeHolder={"新建分组"}/>
                      <TodoGroup groups={this.state.groups}
                                 onSwitch={this.switchGroup.bind(this)}
                                 onDelete={this.deleteGroup.bind(this)}/>
                    </div> :
                    <div className="aside-closed">
                      <div className="header"></div>
                      <div className="first-letter">{this.state.user.username[0]}</div>
                    </div>
                }

              <div className="main">
                <h1 className="header">{this.state.currentGroup}</h1>
                <div className='todos'>
                  <TodoInput content={this.state.newTodo}
                             onChange={this.changeTitile.bind(this)}
                             onSubmit={this.addTodo.bind(this)}
                             placeHolder={"添加待办事项"}/>
                  <ol className="todoList">
                      {todos}
                  </ol>
                </div>
                  {this.state.user.id ? null : <UserDialog
                      onSignUp={this.onSignUpOrSignIn.bind(this)}
                      onSignIn={this.onSignUpOrSignIn.bind(this)}/>
                  }
              </div>

            </div>
        );
    }

    deleteGroup(groupName){
        let stateCopy = copyByJSON(this.state);
        //当按下菜单分组元素时获取该元素名（innertext）
        stateCopy.todoList.filter((item) => item.group === groupName)
            //然后筛选 并 向LeanCloud发送更新，删除元素
            .map((item, index)=>{
                updateListTable(this.state.user, item.id, 'deleted', true);
                updateListTable(this.state.user, item.id, 'group', '');
            })
        //获取位于 分组 中的下标位置
        let index = stateCopy.groups.indexOf(groupName);
        //删除-（start DeleteNum）
        stateCopy.groups.splice(index,1);
        //目标 元素
        stateCopy.currentGroup = stateCopy.groups[index % stateCopy.groups.length];
        this.setState(stateCopy);
    }

    hideAside(e){
        let stateCopy = copyByJSON(this.state);
        stateCopy.asideOpend = !this.state.asideOpend;
        this.setState(stateCopy);
    }

    addGroup(newGroup){
        if(this.state.groups.indexOf(newGroup) !== -1){
            alert('该分组已经存在，请重新输入分组名');
            return;
            //如已有，return
        }
        //否则 push 新组，清空 input 里的内容
        let stateCopy = copyByJSON(this.state);
        stateCopy.groups.push(newGroup);
        stateCopy.currentGroup = newGroup;
        stateCopy.newGroup = '';
        this.setState(stateCopy);

        //在新分组下添加一个不可见的新事项，以保证在新的分组添加到远程数据库
        this.addTodo('test', true);
    }

    switchGroup(desGroup){
        let stateCopy = copyByJSON(this.state);
        //点击焦点会 赋值于 焦点目标
        stateCopy.currentGroup = desGroup;
        this.setState(stateCopy);
    }

    //退出
    signOut(e){
        signOut();
        let stateCopy = copyByJSON(this.state);
        stateCopy.user = {};
        stateCopy.todoList = [];
        stateCopy.groups = [];
        stateCopy.currentGroup = '';
        this.setState(stateCopy);
    }

    //登录与否
    onSignUpOrSignIn(user){
        let stateCopy = copyByJSON(this.state);
        stateCopy.user = user;
        this.setState(stateCopy);
        this.initTodoList.call(this);
    }

    //载入之后，监听窗口做出响应
    componentDidMount(){
        window.addEventListener('resize', (function(e){
            let width = window.innerWidth;
            if(width<480 && this.state.asideOpend){
                let stateCopy = copyByJSON(this.state);
                stateCopy.asideOpend = false;
                this.setState(stateCopy)
            }
            else if(width>=480 && !this.state.asideOpend){
                let stateCopy = copyByJSON(this.state);
                stateCopy.asideOpend = true;
                this.setState(stateCopy)
            }
        }).bind(this))
    }

    //添加todo元素
    addTodo(value, isDeleted){
        var newItem = {
            id: null,
            title: value,
            status: '',
            timer: new Date().toLocaleString(),
            deleted: isDeleted||false,
            group: this.state.currentGroup
        };

        function success(num){
            newItem.id = num;
            this.state.todoList.unshift(
                newItem
            );
            this.setState({
                newTodo: '',
                todoList: this.state.todoList
            });
        }

        function error(){}
        //保存导leanCloud
        saveListTable(newItem,this.state.user,success.bind(this),error);

    }

    delete(e, todo){
        todo.deleted = true;
        this.setState(this.state);
        updateListTable(this.state.user, todo.id, 'deleted', true);
    }

    toggle(e,todo){
        todo.status = todo.status === 'completed' ? '' : 'completed';
        this.setState(this.state);
        updateListTable(this.state.user, todo.id, 'status', todo.status);
    }

    changeTitile(event){
        this.setState({
            // onChang触发渲染实时更改
            newTodo: event.target.value,
            todoList: this.state.todoList
        });
    }

    changeGroupTitile(event){
        this.setState({
            // onChang触发渲染实时更改
            newGroup: event.target.value,
            currentGroup: event.target.value
        });
    }
}

export default App;

