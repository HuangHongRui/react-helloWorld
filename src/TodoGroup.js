import React, {Component} from 'react';
import './TodoGroup.css';
import './iconfont/iconfont.css';

export default class TodoGroup extends Component{
    constructor(props){
        super(props)
        this.state = {
            desGroup: ''
        }
    }
    render(){
        //map
        let groups = this.props.groups.map((item, index)=>{
            return(
                <li key={index} onClick={this.deleteGroup.bind(this)}>
                    <i className="iconfont icon-caidan"></i>
                        {item}
                    <div className="iconfont icon-delete delete-group"></div>
                </li>
            )
        })

        return(
            <ul className="TodoGroup" onClick={this.switchGroup.bind(this)}>
                {groups}
            </ul>
        )
    }

    switchGroup(e){
        //如果点击 触发事件的元素 === 是监听事件的元素
        if(e.target === e.currentTarget){
            return;
        }
        this.props.onSwitch(e.target.innerText);
        // 监听class为active的元素
        let node = e.currentTarget.querySelector('.active')
        if(node!==null){
            //如果  存在  那么删除Class
            node.removeAttribute('class');
        }
        // 点击触发事件目标  加上 active class
        e.target.setAttribute('class', 'active');
        this.setState({
            // setState 更新渲染
            desGroup: e.target.innerText
        })
    }

    deleteGroup(e){
        let classes = e.target.getAttribute('class');
        if(classes === null){
            return;
        }
        if(classes.match(/delete-group/g) !== null){
            e.stopPropagation();
            if(this.props.groups.length <= 1){
                alert('至少要保留一个分组')
                return;
            }
            let isConfirm = window.confirm('您的操作将删除该分组下的所有待办事项，是否继续？')
            if(isConfirm){
                this.setState({
                    desGroup: e.currentTarget.innerText  //  获取text内容
                })
                this.props.onDelete.call(null, e.currentTarget.innerText)  //执行 props 的 onDelete
                document.querySelector('li').setAttribute('class', 'active')
            }
            else{
                return;
            }
        }
    }
}

/*
groups={this.state.groups}
onSwitch={this.switchGroup.bind(this)}
onDelete={this.deleteGroup.bind(this)}
*/