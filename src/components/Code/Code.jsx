import React, { Component } from 'react';
import { Input, Button, Icon } from 'antd';
import immutable from 'immutable';
import { EditorState, convertToRaw, convertFromRaw, RichUtils } from 'draft-js';
import './Code.css';
import DraftPrismEditor from './DraftPrismEditor';
import PrismDraftDecorator from 'draft-js-prism';

class Code extends Component {
	constructor(props) {
		super(props);

		const { code, id } = this.props;
		const { name, content, isFav } = code || {};

		this.state = {
			codeName: name || '',
			editorState: content,
			isFav: isFav || false
		};

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
			if (!nextId) {
				alert('no next id');
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

	popupCode () {

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
			<div className="code-zoom-btn" onClick={this.popupCode.bind(this)}>View Code<Icon className="code-zoom-btn-icon" type="eye-o" /></div>
			<div className="code-item-content-root">
				<div className="code-item-content">
					<DraftPrismEditor {...disabledProps} className={`code-item-content`} editorState={editorState} onChange={this.handleChangeContent} />
				</div>
			</div>
		</div>
	}
};

export default Code;