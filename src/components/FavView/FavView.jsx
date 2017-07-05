import React, { Component } from 'react';
import { Input, Button, Icon } from 'antd';
import { hashHistory } from 'react-router';
import './FavView.css';
import Code from '../Code/Code';
import Toast from '../Toast/Toast';
import FolderList from '../FolderList/FolderList';
import { syncFileData, getFileData, generateRandomKey } from '../../helper/stateHelper';
import { change2WareHouse } from '../../helper/toggleHelper';
import clipboardHelper from '../../helper/clipboardHelper.js';
import { electron } from '../../helper/common.js';
import { getFullContent, getBriefContent } from '../../utils/common.js';
import { NEW_FOLDER_KEY, SPLIT_KEY, EMPTY_KEY } from '../../constants.js';

class FavView extends Component {
	constructor(props) {
		super(props);
		
		this.state = {
			favList: [],
			commonList: [],
			searchKey: '',
			offTips: false, // 关闭提醒
			shrinkLayout: false, // 伸长UI界面
			gridLayout: false // 单元格模式或列表模式
		};

		this.renderFavList = this.renderFavList.bind(this);
		this.handleToggleView = this.handleToggleView.bind(this);
		this.hanldeSearchFav = this.hanldeSearchFav.bind(this);
		this.renderTips = this.renderTips.bind(this);
		this.handleCopyContent = this.handleCopyContent.bind(this);
	}

	componentDidMount() { // 启动第一件事情就是同步状态数据		
		const that = this;
		getFileData(cateGory => {
			console.log('cateGory', cateGory);
			const { fav, common } = cateGory;
			that.setState({
				favList: fav || [],
				commonList: common || []
			}); 
		});

		electron.ipcRenderer.on('change-to-ware-house-view-reply', (e) => {	
			hashHistory.push({ pathname: '/wareHouse' });
		});
	}

	handleCopyContent(code) {
		const codeStr = getFullContent(code);
		clipboardHelper.saveCode(codeStr, () => {
			Toast.show({
				msg: "copied!",
				icon: <Icon type="check-circle-o" />,
				duration: 1
			});
		}); // 保存至剪切板
	}

	renderFavList() {
		const that = this;
		const { favList, shrinkLayout } = this.state;
		const shrinkCls = `fav-list-item-wrapper-${shrinkLayout ? 'shrink' : 'expand'}`

		const componentList = [];
		favList.forEach((favItem) => {
			const { name, code } = favItem;
			const briefContent = getBriefContent(code);
			const favListItem = (
				<div
					className={`fav-list-item-wrapper ${shrinkCls}`} 
					onDoubleClick={that.handleCopyContent.bind(that, code)}
				>
					<div className="fav-list-item">
						<div className="fav-list-item-name">{name ? name : <div className="fav-list-empty-name">Untitled</div>}</div>
						<div className="fav-list-item-content">{briefContent}</div>
					</div>
					<div className="fav-list-item-oper"><Icon type="copy" /></div>
				</div>
			);

			componentList.push(favListItem);
		});

		return (<div className="fav-list-wrapper">
			{componentList}
		</div>);
	}

	hanldeSearchFav(val) {
		this.setState({
			searchKey: val
		});
	}

	handleToggleView() {
		const that = this;
		electron.ipcRenderer.send('change-to-ware-house-view');
		// change2WareHouse(() => {
		// 	hashHistory.push({ pathname: '/wareHouse' });
		// });
	}

	renderNav() {
		return (
			<div className="eku-fav-view-nav">
				<div className="eku-fav-nav-title">Eku</div>
				<a className="fav-nav-toggle-btn" onClick={this.handleToggleView} href="javascript:void(0)"><Icon type="bars" /></a>
				<Input className="fav-nav-search" onChange={this.hanldeSearchFav}/>
			</div>
		);
	}

	renderTips() {
		if (this.state.offTips) return null;
		const handleOffTips = () => {
			this.setState({ offTips: true });
		}

		return (
			<div className="eku-fav-tips-wrapper">
				<Icon className="eku-fav-tips-icon" type="info-circle" />
				<div className="eku-fav-tips-content">双击复制内容</div>
				<Icon className="eku-fav-tips-off" onClick={handleOffTips} type="close" />
			</div>
		);
	}

	renderBottomOper() {
		const that = this;
		const { gridLayout, shrinkLayout } = this.state;
		const changeLayout = () => that.setState({ gridLayout: !gridLayout });
		const changeShink = () => that.setState({ shrinkLayout: !shrinkLayout });

		const layoutBtn = (<span className="eku-fav-btm-icon" onClick={changeLayout}>
			{gridLayout ? <Icon type="layout" /> : <Icon type="appstore-o" />}
		</span>);

		const shrinkBtn = (<span className="eku-fav-btm-icon" onClick={changeShink}>
			{shrinkLayout ? <Icon type="arrows-alt" /> : <Icon type="shrink" />}
		</span>);

		return (
			<div className="eku-fav-btm-wrapper">
				{layoutBtn}
				{shrinkBtn}
			</div>
		);
	}

	render() {
		return (
			<div className="eku-fav-view-wrapper">			
				{this.renderNav()}
				{this.renderTips()}
				{this.renderFavList()}
				{this.renderBottomOper()}
			</div>
		);
	}
};

export default FavView;