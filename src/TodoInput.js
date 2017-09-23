import React from 'react';
import './TodoInput.css';
import './iconfont/iconfont.css'

export default function(props){
    return (
        <form className="TodoInput" onSubmit={addItem.bind(null, props)}>
            <input type="text" className="InputBar"
                placeholder={props.placeHolder}
                value={props.content}
                //回车触发submit
                onKeyPress={submit.bind(null, props)}
                //更改触发Props的onChange
            onChange={changeTitle.bind(null, props)}/>
            <button type="submit"><i className="iconfont icon-tianjia"></i></button>
        </form>
    );
}

function addItem(props, e){
    e.preventDefault();
    if(props.content !== ''){
        props.onSubmit(props.content);
    }
}

function submit(props, e){
    if(e.key === 'Enter' && e.target.value !== ''){
    e.preventDefault();
        props.onSubmit(e.target.value);
    }
}

function changeTitle(props, e){
    props.onChange(e);
}

