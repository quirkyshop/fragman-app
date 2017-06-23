import React, { Component } from 'react';
import { Input, Button, Icon } from 'antd';
import immutable from 'immutable';
import { Editor, EditorState, convertToRaw, convertFromRaw } from 'draft-js';
import './Code.css';

class Code extends Component {
	constructor(props) {
		super(props);

		const { code, id } = this.props;
		const { name, content, isFav } = code || {};

		this.state = {
			codeName: name || '',
			editorState: content || EditorState.createEmpty(),
			isFav: isFav || false
		};

		this.focusEditor = this.focusEditor.bind(this);
		this.handleChangeContent = this.handleChangeContent.bind(this);
		this.handleNameChange = this.handleNameChange.bind(this);
		this.handleToggleFav = this.handleToggleFav.bind(this);	
	}

	componentWillReceiveProps(nextProps) {
		const that = this;
		const { id } = this.props;
		const { id: nextId, code } = nextProps;
		const { name, content, isFav } = code || {};

		if (id !== nextId) {
			console.log('new Props 改变！id:', id, 'nextId:', nextId);
			if (!nextId) {
				that.setState({
					codeName: '',
					editorState: EditorState.createEmpty(),
					isFav: false
				});
			} else {
				that.setState({
					codeName: name || '',
					editorState: content || EditorState.createEmpty(),
					isFav: isFav || false
				});
			}
		}
	}

	// shouldComponentUpdate(nextProps, nextState) {
	// 	const { code } = this.props;
	// 	const { code: nextCode } = nextProps;

	// 	const { name, content } = code || {};
	// 	const { name: nextName, content: nextContent } = nextCode || {};

	// 	let flag = false;
	// 	if (name !== nextName || content !== nextContent) {
	// 		console.log('name===', name, nextName);
	// 		console.log('content===', content, nextContent);
	// 		console.log(content === nextContent);
	// 		flag = true;
	// 	}

	// 	return flag;
	// }

	componentDidMount() {
		window.rrr = this.refs.editor;
	}

	handleNameChange(e) {
		let changeVal = e.target.value;

		const { onChange, code, id } = this.props;
		const result = {
			...code,
			fileId: id,
			name: changeVal
		};

		this.setState({
			codeName: changeVal
		});

		onChange && onChange(result);		
	}

	handleChangeContent(nextEditorState) {
		const { editorState } = this.state;
		const nextContent = nextEditorState.getCurrentContent();
		const currentContent = editorState.getCurrentContent();		
		const contentUnchange = immutable.is(nextContent, currentContent);

		const { onChange, code, id } = this.props;
		const { content } = code || {};
		
		const result = {
			...code,
			fileId: id,
			content: nextEditorState
		};

		this.setState({
			editorState: nextEditorState
		});

		if (!contentUnchange) { // 仅改变光标位置等，不进入外部同步
			onChange && onChange(result);
		}		
	}

	focusEditor() {
		this.refs.editor.focus();
	}

	handleToggleFav(isFav) {
		const { onChange, code, id } = this.props;

		this.setState({
			isFav: !isFav
		});

		onChange && onChange({
			...code,
			fileId: id,
			isFav: !isFav
		});
	}

	render() {
		const { status = 'preview' } = this.props;
		const { codeName, editorState, isFav } = this.state;

		// 控制预览态
		let disabledProps = {};
		if (status === 'preview') disabledProps.disabled = false;

		return <div className={`code-item-wrapper code-item-wrapper-${status}`}>
			<Input placeholder="title" {...disabledProps} className={`code-item-name`} value={codeName} onChange={this.handleNameChange} />
			<div className="code-item-fav-btn" onClick={this.handleToggleFav.bind(this, isFav)}>
				{ isFav ? <Icon type="heart" /> : <Icon type="heart-o" /> }
			</div>
			<div className="code-item-content-root">
				<div className="code-item-content" onClick={this.focusEditor}>
					<Editor ref="editor" {...disabledProps} className={`code-item-content`} editorState={editorState} onChange={this.handleChangeContent} />
				</div>
			</div>
		</div>
	}
};

export default Code;