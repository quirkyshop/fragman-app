import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import './Toast.css';

function show (config) {
	const { msg, icon, duration = 2 } = config;

	let container = document.createElement('div');
    document.body.appendChild(container);

    let unMount = () => {
        ReactDOM.unmountComponentAtNode(container);
        container.parentNode.removeChild(container);
    };

    setTimeout(() => {
        unMount();
    }, duration * 1000 );

    ReactDOM.render(
        (<div className="eku-toast-mask">
            <div className="eku-toast-wrapper">
                <div className="eku-toast-content">
                    <div className="eku-toast-icon">{icon}</div>
                    <div className="eku-toast-msg">{msg}</div>
                </div>
            </div>
        </div>
    ), container);

    return container;
}


export default {
	show
};
