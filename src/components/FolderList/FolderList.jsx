import React, { Component } from 'react';
import { Input, Button, Icon } from 'antd';
import moment from 'moment';
import { isValidArray, getBriefContent } from '../../utils/common';
import remotreHelper from '../../helper/remoteHelper.js';
import './FolderList.css';

const Search = Input.Search;
let addRepoDialog = null;

import { NEW_FOLDER_KEY, SPLIT_KEY, EMPTY_KEY } from '../../constants.js';

class FolderList extends Component {

	constructor(props) {
		super(props);
		
		this.renderCateGory = this.renderCateGory.bind(this);
		this.renderFileList = this.renderFileList.bind(this);
		this.renderAddFolderBtn = this.renderAddFolderBtn.bind(this);
		this.handleAddFolder = this.handleAddFolder.bind(this);
		this.handleNewFolderBlur = this.handleNewFolderBlur.bind(this);
		this.handleRenameFolderBlur = this.handleRenameFolderBlur.bind(this);
		this.handleFileChange = this.handleFileChange.bind(this);

		this.handleFileRightClick = this.handleFileRightClick.bind(this);
		this.handleFolderRightClick = this.handleFolderRightClick.bind(this);

		this.handleDeleteFile = this.handleDeleteFile.bind(this);
		this.handleDeleteFolder = this.handleDeleteFolder.bind(this);
		this.handleRenameFolder = this.handleRenameFolder.bind(this);

		this.handleRenameCate = this.handleRenameCate.bind(this);
		this.handleDeleteCate = this.handleDeleteCate.bind(this);

		this.handleCateRightClick = this.handleCateRightClick.bind(this);
	}

	componentDidUpdate(nextProps, nextState) {		
		if (this.refs && this.refs['rename-folder-input']) {
			this.refs['rename-folder-input'].focus();
		}
	}

	handleAllSelect(e) {
		e.target.select();
	}

	handleChangeFolder(folder, cateKey) {
		const { onFolderChange } = this.props; // 通知内容区域切换
		onFolderChange && onFolderChange(folder, cateKey);
	}

	handleAddFolder() { // 新建文件夹交互
		const { onFolderChange, focusCateGory } = this.props;
		const formatKey = focusCateGory ? focusCateGory : EMPTY_KEY;
		const newFolderId = `${formatKey}${SPLIT_KEY}${NEW_FOLDER_KEY}`;

		onFolderChange && onFolderChange({ id: newFolderId }, focusCateGory);
	}

	handleNewFolderBlur(cateKey, e) { // input失去焦点后新建文件夹
		const folderName = e.target.value;
		const folder = {
			id: NEW_FOLDER_KEY,
			name: folderName,
			fileList: []
		};

		const { onFolderChange } = this.props; // 通知内容区域切换
		onFolderChange && onFolderChange(folder, cateKey);		
	}

	handleRenameFolderBlur(id, e) { // input失去焦点后修改文件夹
		const folderName = e.target.value;
		const folder = {
			id,
			name: folderName
		};

		const { onFolderOper } = this.props;
		onFolderOper && onFolderOper('rename-done', folder);
	}

	handleDeleteCate(cateKey) {
		const { onCateGoryChange } = this.props;
		onCateGoryChange && onCateGoryChange('delete', cateKey);
	}

	handleRenameCate(cateKey) {
		const { onCateGoryChange } = this.props;
		onCateGoryChange && onCateGoryChange('rename', cateKey);	
	}

	renderCateGory() {
		const that = this;
		const { cateGory = {}, focusFolder, focusCateGory } = this.props;
		
		let cateKeys = [];
		Object.keys(cateGory).forEach((cateKeyName) => {
			if (cateKeyName === 'fav') {
				cateKeys.unshift(cateKeyName);
			} else {
				cateKeys.push(cateKeyName);
			}
		});;

		const cateGoryComponent = cateKeys.map((cateKey, cateIndex) => {
			let currentList = cateGory[cateKey];
			let childs = null;
			
			let newFolderEnable = false;

			// 如果包含分割符，则是新建状态，切割分隔符得到[当前大类，当前焦点文件夹]
			// 如果当前大类为空，并且焦点为新建，则在最后大类增加输入
			if (focusFolder && focusFolder.indexOf(SPLIT_KEY) !== -1) {
				const [ catePrefix, cateSuffix ] = focusFolder.split(SPLIT_KEY);
				if (cateSuffix === NEW_FOLDER_KEY) {
					if (catePrefix === cateKey) {
						newFolderEnable = true;
					} else if (catePrefix === EMPTY_KEY && cateIndex === cateKeys.length - 1) {
						newFolderEnable = true;
					}
				}
			}

			if (isValidArray(currentList)) {
				childs = currentList.map((folderItem) => {
					const { name, id, activeRename = false } = folderItem;
					const focusCls = focusFolder === id ? 'category-item-name-focus' : '';

					if (activeRename) {
						return (
							<div className="rename-folder-wrapper">
								<Input ref="rename-folder-input"
								  onFocus={that.handleAllSelect} 
								  className="rename-folder-input"
								  defaultValue={name}
								  onBlur={that.handleRenameFolderBlur.bind(that, id)}
								  onPressEnter={that.handleRenameFolderBlur.bind(that, id)}
								/>
							</div>
						);
					} else {
						const folderRightClick = this.handleFolderRightClick.bind(this, id);
						const fileRightClick = this.handleFileRightClick.bind(this, id);
						const formatRightClick = cateKey === 'fav' ? fileRightClick : folderRightClick;

						return <div
						  className={`category-item-name ${focusCls}`}
						  key={id}
						  onClick={that.handleChangeFolder.bind(that, folderItem, cateKey)}
						  onMouseDown={formatRightClick}
						>
						  	{name}
						</div>
					}					
				})
			} else {
				if (cateKey === 'fav') childs = <div className="fav-empty-contens">empty</div>;
			}

			let newFolderComponent = null;
			if (newFolderEnable) {
				let formatCateKey = focusCateGory || 'common';
				newFolderComponent = <div className="rename-folder-wrapper">
					<Input ref="rename-folder-input"
					  onFocus={that.handleAllSelect} 
					  className="rename-folder-input"
					  defaultValue="new folder" 
					  onBlur={that.handleNewFolderBlur.bind(that, formatCateKey)}
					  onPressEnter={that.handleNewFolderBlur.bind(that, formatCateKey)}
					/>
				</div>
			}

			const isLocalCate = ['common', 'fav'].indexOf(cateKey) !== -1;
			const cateLabelCls = isLocalCate ? '' : 'category-item-ext-label';
			let rightClickProps = {};
			if (!isLocalCate) rightClickProps.onMouseDown = that.handleCateRightClick.bind(that, cateKey);			

			return (<div className="category-item-wrapper" key={cateKey}>
				<div className={`category-item-label ${cateLabelCls}`} {...rightClickProps}>
					{cateKey}					
				</div>
				<div className="category-item-value">{childs}</div>
				{newFolderComponent}
			</div>);
		});

		return <div className="category-block-wrapper">
			{cateGoryComponent}
			{this.renderAddFolderBtn()}
		</div>;
	}

	handleFileChange(fileItem, id, focusCateGory) {
		console.log('触发fileChange---------->', id);
		const { onFileChange, focusFile } = this.props;
		if (id !== focusFile) {
			onFileChange && onFileChange(fileItem, id, focusCateGory);	
		}
	}

	handleFileRightClick(id, e) {
		const that = this;
		if (e.button === 2) { // 右键点击
			const posX = e.clientX;
			const posY = e.clientY;
			remotreHelper.popupFileMenu(id, posX, posY, {
				deleteHandler: that.handleDeleteFile.bind(that, id)
			});
		}
	}

	handleCateRightClick(cateKey, e) {
		const that = this;
		if (e.button === 2) { // 右键点击
			const posX = e.clientX;
			const posY = e.clientY;
			remotreHelper.popupCateMenu(cateKey, posX, posY, {
				deleteHandler: that.handleDeleteCate.bind(that, cateKey),
				renameHandler: that.handleRenameCate.bind(that, cateKey)
			});
		}
	}

	handleFolderRightClick(id, e) {
		const that = this;
		if (e.button === 2) { // 右键点击
			const posX = e.clientX;
			const posY = e.clientY;
			remotreHelper.popupFolderMenu(id, posX, posY, {
				deleteHandler: that.handleDeleteFolder.bind(that, id),
				renameHandler: that.handleRenameFolder.bind(that, id)
			});
		}
	}	

	handleDeleteFolder(folderId) {
		const { onFolderOper } = this.props;
		onFolderOper && onFolderOper('delete', {
			id: folderId
		});
	}

	handleRenameFolder(folderId) {
		const { onFolderOper } = this.props;
		onFolderOper && onFolderOper('rename', {
			id: folderId
		});
	}

	handleDeleteFile(fileId) {
		const { onFileOper } = this.props;
		onFileOper && onFileOper('delete', fileId);
	}

	renderFileList() {
		const that = this;
		const { fileList = [], focusFile, focusCateGory, focusFolder, hideFileList } = this.props;		

		if (hideFileList) return null;

		console.log('=================> inner:', fileList.length);
		const componentList = fileList.map((fileItem) => {
			const { name, modifyTime, createTime , code, id } = fileItem;
			let lastModifyTime = modifyTime || createTime;
			lastModifyTime = moment(lastModifyTime).format('YY/MM/DD');
			const contentBrief = getBriefContent(code);
			const focusCls = focusFile === id ? 'filelist-item-focus' : '';
			return (
				<div
				  className={`filelist-item-wrapper ${focusCls}`}
				  key={id}
				  onClick={that.handleFileChange.bind(that, fileItem, id, focusCateGory)}
				  onMouseDown={this.handleFileRightClick.bind(this, id)}
				>
					{ 
						name ? <div className="filelist-item-name">{name}</div>:
						<div className="filelist-item-name filelist-item-name-placeholder">NEW FRAGMENT</div>
					}
					<div className="filelist-item-desc">{lastModifyTime} {contentBrief}</div>
				</div>
			)
		});

		return <div className="filelist-wrapper">
			{componentList}
		</div>;
	}

	renderAddFolderBtn() {
		return <div className="add-folder-btn" onClick={this.handleAddFolder}>
			<Icon className="add-folder-btn-icon" type="plus-square" />
			new folder
		</div>
	}

	render() {
		return (
			<div className="folder-wrapper">
		  		{this.renderCateGory()}
		  		{this.renderFileList()}
			</div>
		);
	}
}

export default FolderList;
