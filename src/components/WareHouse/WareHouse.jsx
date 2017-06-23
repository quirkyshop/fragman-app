import React, { Component } from 'react';
import { Input, Button, Icon } from 'antd';
import moment from 'moment';
import './WareHouse.css';
import { Editor, EditorState, convertToRaw, convertFromRaw } from 'draft-js';
import { isValidArray } from '../../utils/common';
import Code from '../Code/Code';
import FolderList from '../FolderList/FolderList';
import { syncFileData, getFileData, generateRandomKey } from '../../helper/stateHelper';
import { change2Fav } from '../../helper/toggleHelper';
import { importData, exportData } from '../../helper/remoteHelper';
import { NEW_FOLDER_KEY, SPLIT_KEY, EMPTY_KEY } from '../../constants.js';

import emptyLogo from '../../assets/fragman-empty.png';

class WareHouse extends Component {
	constructor(props) {
		super(props);
		
		this.state = {
			currentCode: null, // 
			currentFolder: null,
			focusFile: null,
			focusCateGory: 'common',
			fileList: [],
			hideFileList: false,
			isTotalyEmpty: false,
			cateGory: {
				'fav': [],
				'common': []
			}
		};

		this.renderFolderList = this.renderFolderList.bind(this);
		this.renderCodeContent = this.renderCodeContent.bind(this);
		this.handleFolderChange = this.handleFolderChange.bind(this);
		this.handleFileChange = this.handleFileChange.bind(this);
		this.handleCodeChange = this.handleCodeChange.bind(this);
		this.getFormatContent = this.getFormatContent.bind(this);
		this.handleToggleView = this.handleToggleView.bind(this);
		this.serializeContent = this.serializeContent.bind(this);
		this.modifyCatgeGoryByAction = this.modifyCatgeGoryByAction.bind(this);
		this.renderNav = this.renderNav.bind(this);
		this.getIfEmptyCateGory = this.getIfEmptyCateGory.bind(this);
		this.handleNavAddFile = this.handleNavAddFile.bind(this);
		this.handleFileOper = this.handleFileOper.bind(this);
		this.handleFolderOper = this.handleFolderOper.bind(this);
		this.handleImportData = this.handleImportData.bind(this);
		this.handleExportData = this.handleExportData.bind(this);
		this.handleCateGoryChange = this.handleCateGoryChange.bind(this);
	}

	componentDidMount() { // 启动第一件事情就是同步状态数据		
		const that = this;
		getFileData(cateGory => {
			const isTotalyEmpty = that.getIfEmptyCateGory(cateGory);
			this.setState({ 
				cateGory,
				isTotalyEmpty
			});
		});
	}

	getIfEmptyCateGory(cateGory = {}) {
		let isTotalyEmpty = false;
		let emptySum = 0;

		let formatCateGory = cateGory || {};
		const cateKeysArr = Object.keys(formatCateGory);
		cateKeysArr.forEach((cateKey) => {
			if (cateKey !== 'fav') {
				const folderList = formatCateGory[cateKey];
				if (!folderList || folderList.length === 0) emptySum = emptySum + 1;
			}			
		});

		isTotalyEmpty = (cateKeysArr.length - 1) === emptySum;
		return isTotalyEmpty;
	}

	getNewFileId() {
		return 'file-item-' + generateRandomKey();
	}

	renderCodeContent() {
		let { currentCode, focusCateGory, focusFile, isTotalyEmpty } = this.state;
		const codeContentCls = 'eku-code-content-wrapper';

		if (isTotalyEmpty) { // 全新的状态
			return <div className={`${codeContentCls} brand-new-code-wrapper flex-center-middle`}>
				<div className="empty-code-wrapper">
					<img className="empty-code-img" src={emptyLogo} />
					<div className="empty-code-title">Start Adding Fragment</div>
					<div className="empty-code-desc">fragman made effiency.</div>
				</div>
			</div>
		}

		const { content, fileId } = currentCode || {};
		const formatContent = this.getFormatContent(content);
		const formatCode = {
			...currentCode,
			content: formatContent
		};

		const formatFocusFile = fileId || focusFile || this.getNewFileId();

		return (
			<div className={codeContentCls}>
				<Code code={formatCode} id={formatFocusFile} onChange={this.handleCodeChange}/>
			</div>
		);
	}

	modifyCatgeGoryByAction(action) {
		const that = this;
		const { type: modifySource, item: modifyItem, operType } = action || {};
		const { cateGory, focusFolder, focusFile, currentCode } = this.state;

		let preCateGory = Object.assign({}, cateGory);
		let formatCateGory = {};
		let formatList = [];
		let currentFile = focusFile;
		let currentFolder = focusFolder;

		let favList = [];
		let isTotalyEmpty = false;
		let emptySum = 0;


		if (modifySource === 'cateGory') {
			if (operType === 'add') { // 插入都是新建一个可删除的cateGory
				preCateGory = {
					...preCateGory,
					...modifyItem
				};
			} else if (operType === 'delete') {
				const deleteKey = modifyItem.id;
				if (deleteKey) delete preCateGory[deleteKey];
			} else if (operType === 'rename') {

			}
		} else if (modifySource === 'folder') {

		} else if (modifySource === 'file') {

		}

		const cateKeysArr = Object.keys(preCateGory);
		let formatCurrentCode = currentCode;
		cateKeysArr.forEach((currentCateKey) => {

			// 常规目录操作
			if (currentCateKey !== 'fav') {
				let folderList = preCateGory[currentCateKey];
				if (!folderList || folderList.length === 0) emptySum = emptySum + 1;

				let formatFolderList = [];
				folderList.forEach((folderItem) => {
					const { fileList = [], id: folderId, name: folderName } = folderItem;
					const isFocusFolder = folderId === focusFolder; // 是否为当前folder

					let handledFolder = Object.assign({}, folderItem);

					let needEditCurrentFolder = true; // 需要判断是否需要继续操作folder
					if (modifySource === 'folder') {						
						const { id: operFolderId, name: operFolderName } = modifyItem || {};
						if (operFolderId === folderId) {
							if (operType === 'delete') {
								needEditCurrentFolder = false;
								if (operFolderId === focusFolder) {
									currentFolder = null;
									currentFile = null;
									formatList = [];
									formatCurrentCode = {
										name: '',
										content: null,
										fileId: null
									};
									emptySum = emptySum + 1;
								}
							} else if (operType === 'rename') {
								handledFolder.activeRename = true;
							} else if (operType === 'rename-done') {
								handledFolder.name = operFolderName;
								handledFolder.activeRename = false;
							}						
						}
					}

					if (needEditCurrentFolder) {
						let handledFileList = [];					
						if (fileList && Array.isArray(fileList)) {						
							fileList.forEach((fileItem) => {
								let handledFile = fileItem;
								const { id: fileId, code: fileCode } = handledFile;
								let shouldAppendFile = true;
								let shouldFavCode = false;

								if (fileCode && fileCode.isFav !== undefined) {
									shouldFavCode = fileCode.isFav;								
								}
								
								// 修改文件
								if (modifySource === 'file') {
									const { id: operId, code: modifyCode } = modifyItem || {};
									const { content: modifyCodeContent } = modifyCode || {}
									console.log('modifySource:', modifySource, ', operType:', operType, ', modifyCode:', modifyCode);

									if (operType === 'change') {
										if (fileId === operId) { // 名字修改，则更改日期
											handledFile = {
												...modifyItem,
												code: {
													...modifyCode,
													content: that.serializeContent(modifyCodeContent)
												},
												modifyTime: moment().format('YYYY-MM-DD HH:mm:ss')
											};

											currentFile = fileId;

											if (modifyCode) {
												formatCurrentCode = modifyCode;
												if (modifyCode.isFav !== undefined) shouldFavCode = modifyCode.isFav;
											}
										}								
									} else if (operType === 'delete') {
										if (fileId === operId) { // 不允许添加										
											shouldAppendFile = false;
											shouldFavCode = false;
										}

										if (focusFile === operId) { // 如果删除的文件和焦点一致，则清空代码
											currentFile = null;
											formatCurrentCode = null;
										}
									}
								}

								shouldFavCode && favList.push(handledFile); // 收集fav信息
								shouldAppendFile && handledFileList.push(handledFile);							
							});

							if (isFocusFolder) { // 新增文件
								// 判断条件为: 操作类型是文件 并且 （新增 或者 没有焦点文档的时候，直接编辑文档区）
								if (modifySource === 'file' && 
									(operType === 'add' || !focusFile && operType === 'change')
								) {									
									console.log('是否处于焦点文档', isFocusFolder, ', modifySource:', modifySource, ', operType:', operType, ', focusFile:', focusFile, ', formatNewCode', formatNewCode);
									const { code: formatNewCode, id: formatNewId } = modifyItem || {};
									const { name: newCodeName, content: newCodeContent } = formatNewCode || {};
									let formatNewCodeContent = EditorState.createEmpty();
									if (newCodeContent) formatNewCodeContent = that.getFormatContent(newCodeContent);
									const newFileId = that.getNewFileId();
									let finalNewId = formatNewId || newFileId;

									const formatFileList = fileList || [];
									const newCode = { // 使用的是状态量
										name: newCodeName || '',
										content: formatNewCodeContent,
										fileId: finalNewId
									};

									const storeNewCode = { // 存储的是字符串量
										...newCode,
										content: that.serializeContent(formatNewCodeContent)
									};

									handledFileList = formatFileList.concat({
										name: newCodeName || '',
										createTime: moment().format('YYYY-MM-DD HH:mm:ss'),
										code: storeNewCode,
										id: finalNewId
									});

									formatCurrentCode = newCode;
									
									console.log('formatList has modified by new file action:', formatList);						
									currentFile = finalNewId;
								}

								formatList = handledFileList;
							}
						}
						
						handledFolder.fileList = handledFileList;

						console.log('eachFolder fileList:', handledFolder, folderName, formatList);

						
						formatFolderList.push(handledFolder);
					}
				});

				formatCateGory[currentCateKey] = formatFolderList;
			}	
		});

		if (emptySum === cateKeysArr.length - 1) isTotalyEmpty = true;

		formatCateGory.fav = favList;

		const calResult = {
			cateGory: formatCateGory,
			fileList: formatList,
			currentCode: formatCurrentCode,
			focusFile: currentFile,
			focusFolder: currentFolder,
			isTotalyEmpty
		};

		console.log('result', calResult);

		return calResult;
	}

	handleCodeChange(code) {
		const that = this;
		const { content, fileId, name } = code;

		const newFile = {
			name,
			id: fileId,
			code
		};

		const { cateGory, fileList, focusFile, isTotalyEmpty, currentCode } = this.modifyCatgeGoryByAction({
			type: 'file',
			operType: 'change',
			item: newFile
		});

		syncFileData(cateGory, () => {
			that.setState({
				currentCode,
				cateGory,
				focusFile,
				fileList,
				isTotalyEmpty
			});
		});
	}

	handleFolderChange(folder, cateKey) {
		// 将变更的folder存入本地，执行成功后改变state
		const that = this;
		const { cateGory } = this.state;
		const { id, fileList } = folder;
		const targetFolderList = cateGory[cateKey] || [];

		let formatId = id;

		const isFav = cateKey === 'fav';
		let hideFileList = false;
		if (isFav && !isValidArray(fileList)) {
			hideFileList = true;
		}

		// 处理新建的folder或者已有的folder
		let formatFolderList = [].concat(targetFolderList);
		let formatFileList = [];
		if (id === NEW_FOLDER_KEY) { // 新建
			formatId = generateRandomKey(); // 这里需要让store层去保存，确保唯一
			formatFolderList = targetFolderList.concat({
				...folder,
				id: formatId
			});
		} else {
			formatFolderList = targetFolderList.map((folderItem) => {
				if (folderItem.id === id) {
					formatFileList = folderItem.fileList || [];
					return folder;
				} else {
					return folderItem;
				}
			});
		}

		let fileCodeProps = {};		
		if (formatFileList.length > 0) {
			const firstFile = formatFileList[0];
			// console.log('firstFile:', formatFileList);
			const { id, code: codeItem, name } = firstFile;
			fileCodeProps.focusFile = id;

			const { content } = codeItem || {};			
			const formatContent = that.getFormatContent(content);
			fileCodeProps.currentCode = {
				...codeItem,
				content: formatContent
			};
		} else {
			fileCodeProps.currentCode = null;
			fileCodeProps.focusFile = null;
		}

		if (folder.code !== undefined && folder.code.isFav) { // 文件模式
			fileCodeProps.currentCode = folder.code;
		}

		const formatCateGory = {
			...cateGory,
			[cateKey]: formatFolderList
		};

		const isTotalyEmpty = that.getIfEmptyCateGory(formatCateGory);

		syncFileData(formatCateGory, () => {
			that.setState({
				cateGory: formatCateGory,
				focusCateGory: cateKey,
				focusFolder: formatId,
				hideFileList,
				fileList: formatFileList,
				isTotalyEmpty,
				...fileCodeProps
			});
		});
	}

	serializeContent (content) {
		if (content && content.getCurrentContent) {
			return JSON.stringify(convertToRaw(content.getCurrentContent()));
		} else {
			return '';
		}
	}

	getFormatContent(content) {
		let formatContent = EditorState.createEmpty();

		if (content) {
			if (typeof content === 'string') {
				const rawContent = convertFromRaw( JSON.parse( content) );
				formatContent = EditorState.createWithContent(rawContent);
				formatContent = EditorState.moveFocusToEnd(formatContent);
			} else {
				formatContent = EditorState.moveFocusToEnd(content);
			}
		}
		
		return formatContent;
	}

	handleFileChange(file, fileId, cateKey) {
		const that = this;
		const { code: currentCode, name } = file;

		this.setState({
			focusFile: fileId,
			currentCode
		});
	}

	handleFolderOper(operType, folderItem) {
		// folder的改变引起全局刷新
		const that = this;
		const { cateGory, fileList, focusFile, focusFolder, isTotalyEmpty, currentCode } = this.modifyCatgeGoryByAction({
			type: 'folder',
			operType,
			item: folderItem
		});

		syncFileData(cateGory, () => {
			that.setState({
				currentCode,
				focusFile,
				focusFolder,
				cateGory,
				fileList,
				isTotalyEmpty
			});
		});
	}

	handleFileOper(operType, id) {
		const that = this;
		const { cateGory, fileList, focusFile, isTotalyEmpty, currentCode } = this.modifyCatgeGoryByAction({
			type: 'file',
			operType,
			item: {
				id
			}
		});

		syncFileData(cateGory, () => {
			that.setState({
				currentCode,
				focusFile,
				cateGory,
				fileList,
				isTotalyEmpty
			});
		});
	}

	handleCateGoryChange(operType, cateKey) {
		const that = this;
		const { cateGory, fileList, focusFile, isTotalyEmpty, currentCode } = this.modifyCatgeGoryByAction({
			type: 'cateGory',
			operType,
			item: {
				id: cateKey
			}
		});

		syncFileData(cateGory, () => {
			that.setState({
				currentCode,
				focusFile,
				cateGory,
				fileList,
				isTotalyEmpty
			});
		});
	}

	renderFolderList() {
		const { cateGory, fileList, focusFile, focusFolder, focusCateGory, isTotalyEmpty, hideFileList } = this.state;

		return (
			<FolderList
			  hideFileList={hideFileList}
			  focusFolder={focusFolder}
			  focusFile={focusFile}
			  focusCateGory={focusCateGory}
			  onCateGoryChange={this.handleCateGoryChange}
			  onFolderChange={this.handleFolderChange}
			  onFolderOper={this.handleFolderOper}
			  onFileOper={this.handleFileOper}
			  onFileChange={this.handleFileChange}			  
			  cateGory={cateGory}
			  fileList={fileList}
			/>
		);
	}

	handleNavAddFile() {
		const that = this;
		const { focusFolder } = this.state;		

		if (focusFolder) {
			const { cateGory, fileList, focusFile, isTotalyEmpty, currentCode } = this.modifyCatgeGoryByAction({				
				type: 'file',
				operType: 'add'
			});

			syncFileData(cateGory, () => {
				console.log('syncData====>', fileList.length);
				that.setState({
					cateGory,
					focusFile,
					fileList,
					currentCode,
					isTotalyEmpty
				});
			});	
		}
	}

	handleToggleView() {
		const that = this;
		change2Fav(() => {
			if (that.props.history) {
				this.props.history.push('/favView');
			}
		});
	}

	handleImportData() {
		const that = this;
		importData((data) => {
			const { cateGory, fileList, focusFile, isTotalyEmpty, currentCode } = this.modifyCatgeGoryByAction({
				type: 'cateGory',
				operType: 'add', // 都是增加
				item: data
			});

			syncFileData(cateGory, () => {
				that.setState({
					currentCode,
					focusFile,
					cateGory,
					fileList,
					isTotalyEmpty
				});
			});
		});
	}

	handleExportData() {
		exportData();
	}

	renderNav() {
		const { focusFolder } = this.state;
		let disabledProps = {};
		if (!focusFolder) disabledProps.disabled = true;

		return <div className="eku-warehouse-nav-wrapper">
			<Button className="nav-operate-btn" {...disabledProps} onClick={this.handleNavAddFile}>
				<Icon type="plus" className="nav-add-btn-icon"/>
			</Button>
			<Button className="nav-operate-btn" onClick={this.handleImportData}>Import</Button>
			<Button className="nav-operate-btn" onClick={this.handleExportData}>Export</Button>
			<a className="toggle-nav-view" onClick={this.handleToggleView} href="javascript:void(0)"><Icon type="bars" /></a>
		</div>
	}

	render() {

		return (
			<div className="eku-warehouse-wrapper">
				{this.renderNav()}
				<div className="eku-warehouse-folder-code-wrapper">				
					{this.renderFolderList()}
					{this.renderCodeContent()}
				</div>
			</div>
		);
	}
};

export default WareHouse;