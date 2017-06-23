import { convertToRaw } from 'draft-js';

const isValidArray = (arr) => {
	let flag = false;
	if (arr && Array.isArray(arr) && arr.length > 0) flag = true;

	return flag;
};

const getBriefContent = (code) => {
	const blocks = getContentBlocks(code);
	const { text } = blocks[0] || {};

	return (text || '');
};

const getContentBlocks = (code) => {
	let blocks = [];
	if (code && code.content) {
		let strArr = [];

		let formatContent = code.content;
		if (typeof code.content === 'string') {
			formatContent = JSON.parse(code.content);
		}

		blocks = formatContent.blocks || [];
	}

	return blocks;
};

const getFullContent = (code) => {
	const blocks = getContentBlocks(code);
	const strArr = blocks.map((blockItem) => {
		const { text = '' } = blockItem || {};
		return text;
	});

	const result = strArr.join('\n');

	return result;
};

export {
	isValidArray,
	getBriefContent,
	getFullContent
};