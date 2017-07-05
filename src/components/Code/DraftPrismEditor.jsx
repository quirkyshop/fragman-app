import React from 'react';
import CodeUtils from 'draft-js-code';

import { 
    getDefaultKeyBinding, 
    Editor,
    RichUtils
} from 'draft-js';

import './draftPrismEditor.css';
import './prism.css';
import 'draft-js/dist/Draft.css';    

class DraftPrismEditor extends React.Component {
    constructor(props) {
        super(props);

        this.focus = () => this.refs.editor.focus();
        this.onChange = (editorState) => {
            this.props.onChange && this.props.onChange(editorState);
        };
        
        this.handleKeyCommand = (command) => this._handleKeyCommand(command);
        this.keyBindingFn = (e) => this._keyBindingFn(e);
        this.onTab = (e) => this._onTab(e);
        this.onReturn = (e) => this._onReturn(e);
    }

    _handleKeyCommand(command) {
        const {editorState} = this.props;
        let newState;

        if (CodeUtils.hasSelectionInBlock(editorState)) {
            newState = CodeUtils.handleKeyCommand(editorState, command);
        }

        if (!newState) {
            newState = RichUtils.handleKeyCommand(editorState, command);
        }

        if (newState) {
            this.onChange(newState);
            return true;
        }
        return false;
    }

    _keyBindingFn(e) {
        let editorState = this.props.editorState;
        let command;

        if (CodeUtils.hasSelectionInBlock(editorState)) {
            command = CodeUtils.getKeyBinding(e);
        }
        if (command) {
            return command;
        }

        return getDefaultKeyBinding(e);
    }

    _onTab(e) {
        let editorState = this.props.editorState;

        if (!CodeUtils.hasSelectionInBlock(editorState)) {
            return;
        }

        this.onChange(
            CodeUtils.handleTab(e, editorState)
        )
    }

    _onReturn(e) {
        let editorState = this.props.editorState;

        if (!CodeUtils.hasSelectionInBlock(editorState)) {
            return;
        }

        this.onChange(
            CodeUtils.handleReturn(e, editorState)
        )
        return true;
    }

    render() {
        let className = 'RichEditor-editor';

        return (
            <div className="RichEditor-root" onClick={this.focus}>
                <div className={className}>
                    <Editor
                        blockStyleFn={getBlockStyle}
                        editorState={this.props.editorState}
                        handleKeyCommand={this.handleKeyCommand}
                        keyBindingFn={this.keyBindingFn}
                        onChange={this.onChange}
                        ref="editor"
                        spellCheck={true}
                        handleReturn={this.onReturn}
                        onTab={this.onTab}
                    />
                </div>
            </div>
        );
    }
}

// Custom overrides for "code" style.
// const styleMap = {
//     CODE: {
//         backgroundColor: 'rgba(0, 0, 0, 0.05)',
//         fontFamily: '"Inconsolata", "Menlo", "Consolas", monospace',
//         fontSize: 16,
//         padding: 2,
//     },
// };

function getBlockStyle(block) {
    switch (block.getType()) {
        case 'blockquote': return 'RichEditor-blockquote';
        default: return null;
    }
}

export default DraftPrismEditor;