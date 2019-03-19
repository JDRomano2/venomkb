import React from 'react';
import { createDevTools } from 'redux-devtools';
import LogMonitor from 'redux-devtools-log-monitor';
import DockMonitor from 'redux-devtools-dock-monitor';
import MultipleMonitors from 'redux-devtools-multiple-monitors';

export default createDevTools(
	<DockMonitor
		toggleVisibilityKey="ctrl-h"
	    changePositionKey="ctrl-w"
		defaultSize={0.25}
		defaultIsVisible={false}>
		<LogMonitor />
	</DockMonitor>
);
