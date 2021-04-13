
import executeCmds from './execute';
import findCmds from './find';
import generalCmds from './general';
import elementCmds from './element';
import actionCmds from './action';
import appMagnamentCmds from './app-management';
import contextCmds from './context';

let commands = {};
Object.assign(
    commands,
    appMagnamentCmds,
    executeCmds,
    findCmds,
    generalCmds,
    elementCmds,
    actionCmds,
    contextCmds
);

export {commands};
export default commands;
