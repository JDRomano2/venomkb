import React from 'react';
import { createDevTools } from 'redux-devtools';
import LogMonitor from 'redux-devtools-log-monitor';
import DockMonitor from 'redux-devtools-dock-monitor';
// import Dispatcher from 'redux-devtools-dispatch';
import MultipleMonitors from 'redux-devtools-multiple-monitors';

export default createDevTools(
	<DockMonitor
		toggleVisibilityKey="ctrl-h"
	    changePositionKey="ctrl-w"
		defaultSize={0.25}
		defaultIsVisible={false}>
		{/* <MultipleMonitors>
			<LogMonitor />
			<Dispatcher />
		</MultipleMonitors> */}
		<LogMonitor />
	</DockMonitor>
);
