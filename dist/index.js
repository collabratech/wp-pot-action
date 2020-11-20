require('./sourcemap-register.js');module.exports =
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 2932:
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

const core = __webpack_require__(2186);
const exec = __webpack_require__(1514);
const wpPot = __webpack_require__(4077);


// most @actions toolkit packages have async methods
async function run() {
  try {
    const source = core.getInput('source');
    const destination = core.getInput('destination');
    const text_domain = core.getInput('text-domain');

    core.info(`Starting generation of POT file ...`);

    wpPot({
      src: source,
      destFile: destination,
      domain: text_domain,
    });

    const options = {
      ignoreReturnCode: true,
    };

    // Commit the generated POT file.
    await exec.exec('git', ['config', '--global user.email "wp-pot@wp-pot.test"'], options);
    await exec.exec('git', ['config', '--global user.name "WP Pot Bot"'], options);
    await exec.exec('git', ['add', destination], options);
    await exec.exec('git', ['commit', '--message "Automatically generated POT file"'], options);
    await exec.exec('git', ['push'], options);

    core.info(`The POT file was successfully generated.`);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();


/***/ }),

/***/ 7351:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const os = __importStar(__webpack_require__(2087));
const utils_1 = __webpack_require__(5278);
/**
 * Commands
 *
 * Command Format:
 *   ::name key=value,key=value::message
 *
 * Examples:
 *   ::warning::This is the message
 *   ::set-env name=MY_VAR::some value
 */
function issueCommand(command, properties, message) {
    const cmd = new Command(command, properties, message);
    process.stdout.write(cmd.toString() + os.EOL);
}
exports.issueCommand = issueCommand;
function issue(name, message = '') {
    issueCommand(name, {}, message);
}
exports.issue = issue;
const CMD_STRING = '::';
class Command {
    constructor(command, properties, message) {
        if (!command) {
            command = 'missing.command';
        }
        this.command = command;
        this.properties = properties;
        this.message = message;
    }
    toString() {
        let cmdStr = CMD_STRING + this.command;
        if (this.properties && Object.keys(this.properties).length > 0) {
            cmdStr += ' ';
            let first = true;
            for (const key in this.properties) {
                if (this.properties.hasOwnProperty(key)) {
                    const val = this.properties[key];
                    if (val) {
                        if (first) {
                            first = false;
                        }
                        else {
                            cmdStr += ',';
                        }
                        cmdStr += `${key}=${escapeProperty(val)}`;
                    }
                }
            }
        }
        cmdStr += `${CMD_STRING}${escapeData(this.message)}`;
        return cmdStr;
    }
}
function escapeData(s) {
    return utils_1.toCommandValue(s)
        .replace(/%/g, '%25')
        .replace(/\r/g, '%0D')
        .replace(/\n/g, '%0A');
}
function escapeProperty(s) {
    return utils_1.toCommandValue(s)
        .replace(/%/g, '%25')
        .replace(/\r/g, '%0D')
        .replace(/\n/g, '%0A')
        .replace(/:/g, '%3A')
        .replace(/,/g, '%2C');
}
//# sourceMappingURL=command.js.map

/***/ }),

/***/ 2186:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const command_1 = __webpack_require__(7351);
const file_command_1 = __webpack_require__(717);
const utils_1 = __webpack_require__(5278);
const os = __importStar(__webpack_require__(2087));
const path = __importStar(__webpack_require__(5622));
/**
 * The code to exit an action
 */
var ExitCode;
(function (ExitCode) {
    /**
     * A code indicating that the action was successful
     */
    ExitCode[ExitCode["Success"] = 0] = "Success";
    /**
     * A code indicating that the action was a failure
     */
    ExitCode[ExitCode["Failure"] = 1] = "Failure";
})(ExitCode = exports.ExitCode || (exports.ExitCode = {}));
//-----------------------------------------------------------------------
// Variables
//-----------------------------------------------------------------------
/**
 * Sets env variable for this action and future actions in the job
 * @param name the name of the variable to set
 * @param val the value of the variable. Non-string values will be converted to a string via JSON.stringify
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function exportVariable(name, val) {
    const convertedVal = utils_1.toCommandValue(val);
    process.env[name] = convertedVal;
    const filePath = process.env['GITHUB_ENV'] || '';
    if (filePath) {
        const delimiter = '_GitHubActionsFileCommandDelimeter_';
        const commandValue = `${name}<<${delimiter}${os.EOL}${convertedVal}${os.EOL}${delimiter}`;
        file_command_1.issueCommand('ENV', commandValue);
    }
    else {
        command_1.issueCommand('set-env', { name }, convertedVal);
    }
}
exports.exportVariable = exportVariable;
/**
 * Registers a secret which will get masked from logs
 * @param secret value of the secret
 */
function setSecret(secret) {
    command_1.issueCommand('add-mask', {}, secret);
}
exports.setSecret = setSecret;
/**
 * Prepends inputPath to the PATH (for this action and future actions)
 * @param inputPath
 */
function addPath(inputPath) {
    const filePath = process.env['GITHUB_PATH'] || '';
    if (filePath) {
        file_command_1.issueCommand('PATH', inputPath);
    }
    else {
        command_1.issueCommand('add-path', {}, inputPath);
    }
    process.env['PATH'] = `${inputPath}${path.delimiter}${process.env['PATH']}`;
}
exports.addPath = addPath;
/**
 * Gets the value of an input.  The value is also trimmed.
 *
 * @param     name     name of the input to get
 * @param     options  optional. See InputOptions.
 * @returns   string
 */
function getInput(name, options) {
    const val = process.env[`INPUT_${name.replace(/ /g, '_').toUpperCase()}`] || '';
    if (options && options.required && !val) {
        throw new Error(`Input required and not supplied: ${name}`);
    }
    return val.trim();
}
exports.getInput = getInput;
/**
 * Sets the value of an output.
 *
 * @param     name     name of the output to set
 * @param     value    value to store. Non-string values will be converted to a string via JSON.stringify
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function setOutput(name, value) {
    command_1.issueCommand('set-output', { name }, value);
}
exports.setOutput = setOutput;
/**
 * Enables or disables the echoing of commands into stdout for the rest of the step.
 * Echoing is disabled by default if ACTIONS_STEP_DEBUG is not set.
 *
 */
function setCommandEcho(enabled) {
    command_1.issue('echo', enabled ? 'on' : 'off');
}
exports.setCommandEcho = setCommandEcho;
//-----------------------------------------------------------------------
// Results
//-----------------------------------------------------------------------
/**
 * Sets the action status to failed.
 * When the action exits it will be with an exit code of 1
 * @param message add error issue message
 */
function setFailed(message) {
    process.exitCode = ExitCode.Failure;
    error(message);
}
exports.setFailed = setFailed;
//-----------------------------------------------------------------------
// Logging Commands
//-----------------------------------------------------------------------
/**
 * Gets whether Actions Step Debug is on or not
 */
function isDebug() {
    return process.env['RUNNER_DEBUG'] === '1';
}
exports.isDebug = isDebug;
/**
 * Writes debug message to user log
 * @param message debug message
 */
function debug(message) {
    command_1.issueCommand('debug', {}, message);
}
exports.debug = debug;
/**
 * Adds an error issue
 * @param message error issue message. Errors will be converted to string via toString()
 */
function error(message) {
    command_1.issue('error', message instanceof Error ? message.toString() : message);
}
exports.error = error;
/**
 * Adds an warning issue
 * @param message warning issue message. Errors will be converted to string via toString()
 */
function warning(message) {
    command_1.issue('warning', message instanceof Error ? message.toString() : message);
}
exports.warning = warning;
/**
 * Writes info to log with console.log.
 * @param message info message
 */
function info(message) {
    process.stdout.write(message + os.EOL);
}
exports.info = info;
/**
 * Begin an output group.
 *
 * Output until the next `groupEnd` will be foldable in this group
 *
 * @param name The name of the output group
 */
function startGroup(name) {
    command_1.issue('group', name);
}
exports.startGroup = startGroup;
/**
 * End an output group.
 */
function endGroup() {
    command_1.issue('endgroup');
}
exports.endGroup = endGroup;
/**
 * Wrap an asynchronous function call in a group.
 *
 * Returns the same type as the function itself.
 *
 * @param name The name of the group
 * @param fn The function to wrap in the group
 */
function group(name, fn) {
    return __awaiter(this, void 0, void 0, function* () {
        startGroup(name);
        let result;
        try {
            result = yield fn();
        }
        finally {
            endGroup();
        }
        return result;
    });
}
exports.group = group;
//-----------------------------------------------------------------------
// Wrapper action state
//-----------------------------------------------------------------------
/**
 * Saves state for current action, the state can only be retrieved by this action's post job execution.
 *
 * @param     name     name of the state to store
 * @param     value    value to store. Non-string values will be converted to a string via JSON.stringify
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function saveState(name, value) {
    command_1.issueCommand('save-state', { name }, value);
}
exports.saveState = saveState;
/**
 * Gets the value of an state set by this action's main execution.
 *
 * @param     name     name of the state to get
 * @returns   string
 */
function getState(name) {
    return process.env[`STATE_${name}`] || '';
}
exports.getState = getState;
//# sourceMappingURL=core.js.map

/***/ }),

/***/ 717:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

// For internal use, subject to change.
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
// We use any as a valid input type
/* eslint-disable @typescript-eslint/no-explicit-any */
const fs = __importStar(__webpack_require__(5747));
const os = __importStar(__webpack_require__(2087));
const utils_1 = __webpack_require__(5278);
function issueCommand(command, message) {
    const filePath = process.env[`GITHUB_${command}`];
    if (!filePath) {
        throw new Error(`Unable to find environment variable for file command ${command}`);
    }
    if (!fs.existsSync(filePath)) {
        throw new Error(`Missing file at path: ${filePath}`);
    }
    fs.appendFileSync(filePath, `${utils_1.toCommandValue(message)}${os.EOL}`, {
        encoding: 'utf8'
    });
}
exports.issueCommand = issueCommand;
//# sourceMappingURL=file-command.js.map

/***/ }),

/***/ 5278:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

// We use any as a valid input type
/* eslint-disable @typescript-eslint/no-explicit-any */
Object.defineProperty(exports, "__esModule", ({ value: true }));
/**
 * Sanitizes an input into a string so it can be passed into issueCommand safely
 * @param input input to sanitize into a string
 */
function toCommandValue(input) {
    if (input === null || input === undefined) {
        return '';
    }
    else if (typeof input === 'string' || input instanceof String) {
        return input;
    }
    return JSON.stringify(input);
}
exports.toCommandValue = toCommandValue;
//# sourceMappingURL=utils.js.map

/***/ }),

/***/ 1514:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const tr = __importStar(__webpack_require__(8159));
/**
 * Exec a command.
 * Output will be streamed to the live console.
 * Returns promise with return code
 *
 * @param     commandLine        command to execute (can include additional args). Must be correctly escaped.
 * @param     args               optional arguments for tool. Escaping is handled by the lib.
 * @param     options            optional exec options.  See ExecOptions
 * @returns   Promise<number>    exit code
 */
function exec(commandLine, args, options) {
    return __awaiter(this, void 0, void 0, function* () {
        const commandArgs = tr.argStringToArray(commandLine);
        if (commandArgs.length === 0) {
            throw new Error(`Parameter 'commandLine' cannot be null or empty.`);
        }
        // Path to tool to execute should be first arg
        const toolPath = commandArgs[0];
        args = commandArgs.slice(1).concat(args || []);
        const runner = new tr.ToolRunner(toolPath, args, options);
        return runner.exec();
    });
}
exports.exec = exec;
//# sourceMappingURL=exec.js.map

/***/ }),

/***/ 8159:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const os = __importStar(__webpack_require__(2087));
const events = __importStar(__webpack_require__(8614));
const child = __importStar(__webpack_require__(3129));
const path = __importStar(__webpack_require__(5622));
const io = __importStar(__webpack_require__(7436));
const ioUtil = __importStar(__webpack_require__(1962));
/* eslint-disable @typescript-eslint/unbound-method */
const IS_WINDOWS = process.platform === 'win32';
/*
 * Class for running command line tools. Handles quoting and arg parsing in a platform agnostic way.
 */
class ToolRunner extends events.EventEmitter {
    constructor(toolPath, args, options) {
        super();
        if (!toolPath) {
            throw new Error("Parameter 'toolPath' cannot be null or empty.");
        }
        this.toolPath = toolPath;
        this.args = args || [];
        this.options = options || {};
    }
    _debug(message) {
        if (this.options.listeners && this.options.listeners.debug) {
            this.options.listeners.debug(message);
        }
    }
    _getCommandString(options, noPrefix) {
        const toolPath = this._getSpawnFileName();
        const args = this._getSpawnArgs(options);
        let cmd = noPrefix ? '' : '[command]'; // omit prefix when piped to a second tool
        if (IS_WINDOWS) {
            // Windows + cmd file
            if (this._isCmdFile()) {
                cmd += toolPath;
                for (const a of args) {
                    cmd += ` ${a}`;
                }
            }
            // Windows + verbatim
            else if (options.windowsVerbatimArguments) {
                cmd += `"${toolPath}"`;
                for (const a of args) {
                    cmd += ` ${a}`;
                }
            }
            // Windows (regular)
            else {
                cmd += this._windowsQuoteCmdArg(toolPath);
                for (const a of args) {
                    cmd += ` ${this._windowsQuoteCmdArg(a)}`;
                }
            }
        }
        else {
            // OSX/Linux - this can likely be improved with some form of quoting.
            // creating processes on Unix is fundamentally different than Windows.
            // on Unix, execvp() takes an arg array.
            cmd += toolPath;
            for (const a of args) {
                cmd += ` ${a}`;
            }
        }
        return cmd;
    }
    _processLineBuffer(data, strBuffer, onLine) {
        try {
            let s = strBuffer + data.toString();
            let n = s.indexOf(os.EOL);
            while (n > -1) {
                const line = s.substring(0, n);
                onLine(line);
                // the rest of the string ...
                s = s.substring(n + os.EOL.length);
                n = s.indexOf(os.EOL);
            }
            strBuffer = s;
        }
        catch (err) {
            // streaming lines to console is best effort.  Don't fail a build.
            this._debug(`error processing line. Failed with error ${err}`);
        }
    }
    _getSpawnFileName() {
        if (IS_WINDOWS) {
            if (this._isCmdFile()) {
                return process.env['COMSPEC'] || 'cmd.exe';
            }
        }
        return this.toolPath;
    }
    _getSpawnArgs(options) {
        if (IS_WINDOWS) {
            if (this._isCmdFile()) {
                let argline = `/D /S /C "${this._windowsQuoteCmdArg(this.toolPath)}`;
                for (const a of this.args) {
                    argline += ' ';
                    argline += options.windowsVerbatimArguments
                        ? a
                        : this._windowsQuoteCmdArg(a);
                }
                argline += '"';
                return [argline];
            }
        }
        return this.args;
    }
    _endsWith(str, end) {
        return str.endsWith(end);
    }
    _isCmdFile() {
        const upperToolPath = this.toolPath.toUpperCase();
        return (this._endsWith(upperToolPath, '.CMD') ||
            this._endsWith(upperToolPath, '.BAT'));
    }
    _windowsQuoteCmdArg(arg) {
        // for .exe, apply the normal quoting rules that libuv applies
        if (!this._isCmdFile()) {
            return this._uvQuoteCmdArg(arg);
        }
        // otherwise apply quoting rules specific to the cmd.exe command line parser.
        // the libuv rules are generic and are not designed specifically for cmd.exe
        // command line parser.
        //
        // for a detailed description of the cmd.exe command line parser, refer to
        // http://stackoverflow.com/questions/4094699/how-does-the-windows-command-interpreter-cmd-exe-parse-scripts/7970912#7970912
        // need quotes for empty arg
        if (!arg) {
            return '""';
        }
        // determine whether the arg needs to be quoted
        const cmdSpecialChars = [
            ' ',
            '\t',
            '&',
            '(',
            ')',
            '[',
            ']',
            '{',
            '}',
            '^',
            '=',
            ';',
            '!',
            "'",
            '+',
            ',',
            '`',
            '~',
            '|',
            '<',
            '>',
            '"'
        ];
        let needsQuotes = false;
        for (const char of arg) {
            if (cmdSpecialChars.some(x => x === char)) {
                needsQuotes = true;
                break;
            }
        }
        // short-circuit if quotes not needed
        if (!needsQuotes) {
            return arg;
        }
        // the following quoting rules are very similar to the rules that by libuv applies.
        //
        // 1) wrap the string in quotes
        //
        // 2) double-up quotes - i.e. " => ""
        //
        //    this is different from the libuv quoting rules. libuv replaces " with \", which unfortunately
        //    doesn't work well with a cmd.exe command line.
        //
        //    note, replacing " with "" also works well if the arg is passed to a downstream .NET console app.
        //    for example, the command line:
        //          foo.exe "myarg:""my val"""
        //    is parsed by a .NET console app into an arg array:
        //          [ "myarg:\"my val\"" ]
        //    which is the same end result when applying libuv quoting rules. although the actual
        //    command line from libuv quoting rules would look like:
        //          foo.exe "myarg:\"my val\""
        //
        // 3) double-up slashes that precede a quote,
        //    e.g.  hello \world    => "hello \world"
        //          hello\"world    => "hello\\""world"
        //          hello\\"world   => "hello\\\\""world"
        //          hello world\    => "hello world\\"
        //
        //    technically this is not required for a cmd.exe command line, or the batch argument parser.
        //    the reasons for including this as a .cmd quoting rule are:
        //
        //    a) this is optimized for the scenario where the argument is passed from the .cmd file to an
        //       external program. many programs (e.g. .NET console apps) rely on the slash-doubling rule.
        //
        //    b) it's what we've been doing previously (by deferring to node default behavior) and we
        //       haven't heard any complaints about that aspect.
        //
        // note, a weakness of the quoting rules chosen here, is that % is not escaped. in fact, % cannot be
        // escaped when used on the command line directly - even though within a .cmd file % can be escaped
        // by using %%.
        //
        // the saving grace is, on the command line, %var% is left as-is if var is not defined. this contrasts
        // the line parsing rules within a .cmd file, where if var is not defined it is replaced with nothing.
        //
        // one option that was explored was replacing % with ^% - i.e. %var% => ^%var^%. this hack would
        // often work, since it is unlikely that var^ would exist, and the ^ character is removed when the
        // variable is used. the problem, however, is that ^ is not removed when %* is used to pass the args
        // to an external program.
        //
        // an unexplored potential solution for the % escaping problem, is to create a wrapper .cmd file.
        // % can be escaped within a .cmd file.
        let reverse = '"';
        let quoteHit = true;
        for (let i = arg.length; i > 0; i--) {
            // walk the string in reverse
            reverse += arg[i - 1];
            if (quoteHit && arg[i - 1] === '\\') {
                reverse += '\\'; // double the slash
            }
            else if (arg[i - 1] === '"') {
                quoteHit = true;
                reverse += '"'; // double the quote
            }
            else {
                quoteHit = false;
            }
        }
        reverse += '"';
        return reverse
            .split('')
            .reverse()
            .join('');
    }
    _uvQuoteCmdArg(arg) {
        // Tool runner wraps child_process.spawn() and needs to apply the same quoting as
        // Node in certain cases where the undocumented spawn option windowsVerbatimArguments
        // is used.
        //
        // Since this function is a port of quote_cmd_arg from Node 4.x (technically, lib UV,
        // see https://github.com/nodejs/node/blob/v4.x/deps/uv/src/win/process.c for details),
        // pasting copyright notice from Node within this function:
        //
        //      Copyright Joyent, Inc. and other Node contributors. All rights reserved.
        //
        //      Permission is hereby granted, free of charge, to any person obtaining a copy
        //      of this software and associated documentation files (the "Software"), to
        //      deal in the Software without restriction, including without limitation the
        //      rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
        //      sell copies of the Software, and to permit persons to whom the Software is
        //      furnished to do so, subject to the following conditions:
        //
        //      The above copyright notice and this permission notice shall be included in
        //      all copies or substantial portions of the Software.
        //
        //      THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
        //      IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
        //      FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
        //      AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
        //      LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
        //      FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
        //      IN THE SOFTWARE.
        if (!arg) {
            // Need double quotation for empty argument
            return '""';
        }
        if (!arg.includes(' ') && !arg.includes('\t') && !arg.includes('"')) {
            // No quotation needed
            return arg;
        }
        if (!arg.includes('"') && !arg.includes('\\')) {
            // No embedded double quotes or backslashes, so I can just wrap
            // quote marks around the whole thing.
            return `"${arg}"`;
        }
        // Expected input/output:
        //   input : hello"world
        //   output: "hello\"world"
        //   input : hello""world
        //   output: "hello\"\"world"
        //   input : hello\world
        //   output: hello\world
        //   input : hello\\world
        //   output: hello\\world
        //   input : hello\"world
        //   output: "hello\\\"world"
        //   input : hello\\"world
        //   output: "hello\\\\\"world"
        //   input : hello world\
        //   output: "hello world\\" - note the comment in libuv actually reads "hello world\"
        //                             but it appears the comment is wrong, it should be "hello world\\"
        let reverse = '"';
        let quoteHit = true;
        for (let i = arg.length; i > 0; i--) {
            // walk the string in reverse
            reverse += arg[i - 1];
            if (quoteHit && arg[i - 1] === '\\') {
                reverse += '\\';
            }
            else if (arg[i - 1] === '"') {
                quoteHit = true;
                reverse += '\\';
            }
            else {
                quoteHit = false;
            }
        }
        reverse += '"';
        return reverse
            .split('')
            .reverse()
            .join('');
    }
    _cloneExecOptions(options) {
        options = options || {};
        const result = {
            cwd: options.cwd || process.cwd(),
            env: options.env || process.env,
            silent: options.silent || false,
            windowsVerbatimArguments: options.windowsVerbatimArguments || false,
            failOnStdErr: options.failOnStdErr || false,
            ignoreReturnCode: options.ignoreReturnCode || false,
            delay: options.delay || 10000
        };
        result.outStream = options.outStream || process.stdout;
        result.errStream = options.errStream || process.stderr;
        return result;
    }
    _getSpawnOptions(options, toolPath) {
        options = options || {};
        const result = {};
        result.cwd = options.cwd;
        result.env = options.env;
        result['windowsVerbatimArguments'] =
            options.windowsVerbatimArguments || this._isCmdFile();
        if (options.windowsVerbatimArguments) {
            result.argv0 = `"${toolPath}"`;
        }
        return result;
    }
    /**
     * Exec a tool.
     * Output will be streamed to the live console.
     * Returns promise with return code
     *
     * @param     tool     path to tool to exec
     * @param     options  optional exec options.  See ExecOptions
     * @returns   number
     */
    exec() {
        return __awaiter(this, void 0, void 0, function* () {
            // root the tool path if it is unrooted and contains relative pathing
            if (!ioUtil.isRooted(this.toolPath) &&
                (this.toolPath.includes('/') ||
                    (IS_WINDOWS && this.toolPath.includes('\\')))) {
                // prefer options.cwd if it is specified, however options.cwd may also need to be rooted
                this.toolPath = path.resolve(process.cwd(), this.options.cwd || process.cwd(), this.toolPath);
            }
            // if the tool is only a file name, then resolve it from the PATH
            // otherwise verify it exists (add extension on Windows if necessary)
            this.toolPath = yield io.which(this.toolPath, true);
            return new Promise((resolve, reject) => {
                this._debug(`exec tool: ${this.toolPath}`);
                this._debug('arguments:');
                for (const arg of this.args) {
                    this._debug(`   ${arg}`);
                }
                const optionsNonNull = this._cloneExecOptions(this.options);
                if (!optionsNonNull.silent && optionsNonNull.outStream) {
                    optionsNonNull.outStream.write(this._getCommandString(optionsNonNull) + os.EOL);
                }
                const state = new ExecState(optionsNonNull, this.toolPath);
                state.on('debug', (message) => {
                    this._debug(message);
                });
                const fileName = this._getSpawnFileName();
                const cp = child.spawn(fileName, this._getSpawnArgs(optionsNonNull), this._getSpawnOptions(this.options, fileName));
                const stdbuffer = '';
                if (cp.stdout) {
                    cp.stdout.on('data', (data) => {
                        if (this.options.listeners && this.options.listeners.stdout) {
                            this.options.listeners.stdout(data);
                        }
                        if (!optionsNonNull.silent && optionsNonNull.outStream) {
                            optionsNonNull.outStream.write(data);
                        }
                        this._processLineBuffer(data, stdbuffer, (line) => {
                            if (this.options.listeners && this.options.listeners.stdline) {
                                this.options.listeners.stdline(line);
                            }
                        });
                    });
                }
                const errbuffer = '';
                if (cp.stderr) {
                    cp.stderr.on('data', (data) => {
                        state.processStderr = true;
                        if (this.options.listeners && this.options.listeners.stderr) {
                            this.options.listeners.stderr(data);
                        }
                        if (!optionsNonNull.silent &&
                            optionsNonNull.errStream &&
                            optionsNonNull.outStream) {
                            const s = optionsNonNull.failOnStdErr
                                ? optionsNonNull.errStream
                                : optionsNonNull.outStream;
                            s.write(data);
                        }
                        this._processLineBuffer(data, errbuffer, (line) => {
                            if (this.options.listeners && this.options.listeners.errline) {
                                this.options.listeners.errline(line);
                            }
                        });
                    });
                }
                cp.on('error', (err) => {
                    state.processError = err.message;
                    state.processExited = true;
                    state.processClosed = true;
                    state.CheckComplete();
                });
                cp.on('exit', (code) => {
                    state.processExitCode = code;
                    state.processExited = true;
                    this._debug(`Exit code ${code} received from tool '${this.toolPath}'`);
                    state.CheckComplete();
                });
                cp.on('close', (code) => {
                    state.processExitCode = code;
                    state.processExited = true;
                    state.processClosed = true;
                    this._debug(`STDIO streams have closed for tool '${this.toolPath}'`);
                    state.CheckComplete();
                });
                state.on('done', (error, exitCode) => {
                    if (stdbuffer.length > 0) {
                        this.emit('stdline', stdbuffer);
                    }
                    if (errbuffer.length > 0) {
                        this.emit('errline', errbuffer);
                    }
                    cp.removeAllListeners();
                    if (error) {
                        reject(error);
                    }
                    else {
                        resolve(exitCode);
                    }
                });
                if (this.options.input) {
                    if (!cp.stdin) {
                        throw new Error('child process missing stdin');
                    }
                    cp.stdin.end(this.options.input);
                }
            });
        });
    }
}
exports.ToolRunner = ToolRunner;
/**
 * Convert an arg string to an array of args. Handles escaping
 *
 * @param    argString   string of arguments
 * @returns  string[]    array of arguments
 */
function argStringToArray(argString) {
    const args = [];
    let inQuotes = false;
    let escaped = false;
    let arg = '';
    function append(c) {
        // we only escape double quotes.
        if (escaped && c !== '"') {
            arg += '\\';
        }
        arg += c;
        escaped = false;
    }
    for (let i = 0; i < argString.length; i++) {
        const c = argString.charAt(i);
        if (c === '"') {
            if (!escaped) {
                inQuotes = !inQuotes;
            }
            else {
                append(c);
            }
            continue;
        }
        if (c === '\\' && escaped) {
            append(c);
            continue;
        }
        if (c === '\\' && inQuotes) {
            escaped = true;
            continue;
        }
        if (c === ' ' && !inQuotes) {
            if (arg.length > 0) {
                args.push(arg);
                arg = '';
            }
            continue;
        }
        append(c);
    }
    if (arg.length > 0) {
        args.push(arg.trim());
    }
    return args;
}
exports.argStringToArray = argStringToArray;
class ExecState extends events.EventEmitter {
    constructor(options, toolPath) {
        super();
        this.processClosed = false; // tracks whether the process has exited and stdio is closed
        this.processError = '';
        this.processExitCode = 0;
        this.processExited = false; // tracks whether the process has exited
        this.processStderr = false; // tracks whether stderr was written to
        this.delay = 10000; // 10 seconds
        this.done = false;
        this.timeout = null;
        if (!toolPath) {
            throw new Error('toolPath must not be empty');
        }
        this.options = options;
        this.toolPath = toolPath;
        if (options.delay) {
            this.delay = options.delay;
        }
    }
    CheckComplete() {
        if (this.done) {
            return;
        }
        if (this.processClosed) {
            this._setResult();
        }
        else if (this.processExited) {
            this.timeout = setTimeout(ExecState.HandleTimeout, this.delay, this);
        }
    }
    _debug(message) {
        this.emit('debug', message);
    }
    _setResult() {
        // determine whether there is an error
        let error;
        if (this.processExited) {
            if (this.processError) {
                error = new Error(`There was an error when attempting to execute the process '${this.toolPath}'. This may indicate the process failed to start. Error: ${this.processError}`);
            }
            else if (this.processExitCode !== 0 && !this.options.ignoreReturnCode) {
                error = new Error(`The process '${this.toolPath}' failed with exit code ${this.processExitCode}`);
            }
            else if (this.processStderr && this.options.failOnStdErr) {
                error = new Error(`The process '${this.toolPath}' failed because one or more lines were written to the STDERR stream`);
            }
        }
        // clear the timeout
        if (this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = null;
        }
        this.done = true;
        this.emit('done', error, this.processExitCode);
    }
    static HandleTimeout(state) {
        if (state.done) {
            return;
        }
        if (!state.processClosed && state.processExited) {
            const message = `The STDIO streams did not close within ${state.delay /
                1000} seconds of the exit event from process '${state.toolPath}'. This may indicate a child process inherited the STDIO streams and has not yet exited.`;
            state._debug(message);
        }
        state._setResult();
    }
}
//# sourceMappingURL=toolrunner.js.map

/***/ }),

/***/ 1962:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
const assert_1 = __webpack_require__(2357);
const fs = __webpack_require__(5747);
const path = __webpack_require__(5622);
_a = fs.promises, exports.chmod = _a.chmod, exports.copyFile = _a.copyFile, exports.lstat = _a.lstat, exports.mkdir = _a.mkdir, exports.readdir = _a.readdir, exports.readlink = _a.readlink, exports.rename = _a.rename, exports.rmdir = _a.rmdir, exports.stat = _a.stat, exports.symlink = _a.symlink, exports.unlink = _a.unlink;
exports.IS_WINDOWS = process.platform === 'win32';
function exists(fsPath) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield exports.stat(fsPath);
        }
        catch (err) {
            if (err.code === 'ENOENT') {
                return false;
            }
            throw err;
        }
        return true;
    });
}
exports.exists = exists;
function isDirectory(fsPath, useStat = false) {
    return __awaiter(this, void 0, void 0, function* () {
        const stats = useStat ? yield exports.stat(fsPath) : yield exports.lstat(fsPath);
        return stats.isDirectory();
    });
}
exports.isDirectory = isDirectory;
/**
 * On OSX/Linux, true if path starts with '/'. On Windows, true for paths like:
 * \, \hello, \\hello\share, C:, and C:\hello (and corresponding alternate separator cases).
 */
function isRooted(p) {
    p = normalizeSeparators(p);
    if (!p) {
        throw new Error('isRooted() parameter "p" cannot be empty');
    }
    if (exports.IS_WINDOWS) {
        return (p.startsWith('\\') || /^[A-Z]:/i.test(p) // e.g. \ or \hello or \\hello
        ); // e.g. C: or C:\hello
    }
    return p.startsWith('/');
}
exports.isRooted = isRooted;
/**
 * Recursively create a directory at `fsPath`.
 *
 * This implementation is optimistic, meaning it attempts to create the full
 * path first, and backs up the path stack from there.
 *
 * @param fsPath The path to create
 * @param maxDepth The maximum recursion depth
 * @param depth The current recursion depth
 */
function mkdirP(fsPath, maxDepth = 1000, depth = 1) {
    return __awaiter(this, void 0, void 0, function* () {
        assert_1.ok(fsPath, 'a path argument must be provided');
        fsPath = path.resolve(fsPath);
        if (depth >= maxDepth)
            return exports.mkdir(fsPath);
        try {
            yield exports.mkdir(fsPath);
            return;
        }
        catch (err) {
            switch (err.code) {
                case 'ENOENT': {
                    yield mkdirP(path.dirname(fsPath), maxDepth, depth + 1);
                    yield exports.mkdir(fsPath);
                    return;
                }
                default: {
                    let stats;
                    try {
                        stats = yield exports.stat(fsPath);
                    }
                    catch (err2) {
                        throw err;
                    }
                    if (!stats.isDirectory())
                        throw err;
                }
            }
        }
    });
}
exports.mkdirP = mkdirP;
/**
 * Best effort attempt to determine whether a file exists and is executable.
 * @param filePath    file path to check
 * @param extensions  additional file extensions to try
 * @return if file exists and is executable, returns the file path. otherwise empty string.
 */
function tryGetExecutablePath(filePath, extensions) {
    return __awaiter(this, void 0, void 0, function* () {
        let stats = undefined;
        try {
            // test file exists
            stats = yield exports.stat(filePath);
        }
        catch (err) {
            if (err.code !== 'ENOENT') {
                // eslint-disable-next-line no-console
                console.log(`Unexpected error attempting to determine if executable file exists '${filePath}': ${err}`);
            }
        }
        if (stats && stats.isFile()) {
            if (exports.IS_WINDOWS) {
                // on Windows, test for valid extension
                const upperExt = path.extname(filePath).toUpperCase();
                if (extensions.some(validExt => validExt.toUpperCase() === upperExt)) {
                    return filePath;
                }
            }
            else {
                if (isUnixExecutable(stats)) {
                    return filePath;
                }
            }
        }
        // try each extension
        const originalFilePath = filePath;
        for (const extension of extensions) {
            filePath = originalFilePath + extension;
            stats = undefined;
            try {
                stats = yield exports.stat(filePath);
            }
            catch (err) {
                if (err.code !== 'ENOENT') {
                    // eslint-disable-next-line no-console
                    console.log(`Unexpected error attempting to determine if executable file exists '${filePath}': ${err}`);
                }
            }
            if (stats && stats.isFile()) {
                if (exports.IS_WINDOWS) {
                    // preserve the case of the actual file (since an extension was appended)
                    try {
                        const directory = path.dirname(filePath);
                        const upperName = path.basename(filePath).toUpperCase();
                        for (const actualName of yield exports.readdir(directory)) {
                            if (upperName === actualName.toUpperCase()) {
                                filePath = path.join(directory, actualName);
                                break;
                            }
                        }
                    }
                    catch (err) {
                        // eslint-disable-next-line no-console
                        console.log(`Unexpected error attempting to determine the actual case of the file '${filePath}': ${err}`);
                    }
                    return filePath;
                }
                else {
                    if (isUnixExecutable(stats)) {
                        return filePath;
                    }
                }
            }
        }
        return '';
    });
}
exports.tryGetExecutablePath = tryGetExecutablePath;
function normalizeSeparators(p) {
    p = p || '';
    if (exports.IS_WINDOWS) {
        // convert slashes on Windows
        p = p.replace(/\//g, '\\');
        // remove redundant slashes
        return p.replace(/\\\\+/g, '\\');
    }
    // remove redundant slashes
    return p.replace(/\/\/+/g, '/');
}
// on Mac/Linux, test the execute bit
//     R   W  X  R  W X R W X
//   256 128 64 32 16 8 4 2 1
function isUnixExecutable(stats) {
    return ((stats.mode & 1) > 0 ||
        ((stats.mode & 8) > 0 && stats.gid === process.getgid()) ||
        ((stats.mode & 64) > 0 && stats.uid === process.getuid()));
}
//# sourceMappingURL=io-util.js.map

/***/ }),

/***/ 7436:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const childProcess = __webpack_require__(3129);
const path = __webpack_require__(5622);
const util_1 = __webpack_require__(1669);
const ioUtil = __webpack_require__(1962);
const exec = util_1.promisify(childProcess.exec);
/**
 * Copies a file or folder.
 * Based off of shelljs - https://github.com/shelljs/shelljs/blob/9237f66c52e5daa40458f94f9565e18e8132f5a6/src/cp.js
 *
 * @param     source    source path
 * @param     dest      destination path
 * @param     options   optional. See CopyOptions.
 */
function cp(source, dest, options = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        const { force, recursive } = readCopyOptions(options);
        const destStat = (yield ioUtil.exists(dest)) ? yield ioUtil.stat(dest) : null;
        // Dest is an existing file, but not forcing
        if (destStat && destStat.isFile() && !force) {
            return;
        }
        // If dest is an existing directory, should copy inside.
        const newDest = destStat && destStat.isDirectory()
            ? path.join(dest, path.basename(source))
            : dest;
        if (!(yield ioUtil.exists(source))) {
            throw new Error(`no such file or directory: ${source}`);
        }
        const sourceStat = yield ioUtil.stat(source);
        if (sourceStat.isDirectory()) {
            if (!recursive) {
                throw new Error(`Failed to copy. ${source} is a directory, but tried to copy without recursive flag.`);
            }
            else {
                yield cpDirRecursive(source, newDest, 0, force);
            }
        }
        else {
            if (path.relative(source, newDest) === '') {
                // a file cannot be copied to itself
                throw new Error(`'${newDest}' and '${source}' are the same file`);
            }
            yield copyFile(source, newDest, force);
        }
    });
}
exports.cp = cp;
/**
 * Moves a path.
 *
 * @param     source    source path
 * @param     dest      destination path
 * @param     options   optional. See MoveOptions.
 */
function mv(source, dest, options = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        if (yield ioUtil.exists(dest)) {
            let destExists = true;
            if (yield ioUtil.isDirectory(dest)) {
                // If dest is directory copy src into dest
                dest = path.join(dest, path.basename(source));
                destExists = yield ioUtil.exists(dest);
            }
            if (destExists) {
                if (options.force == null || options.force) {
                    yield rmRF(dest);
                }
                else {
                    throw new Error('Destination already exists');
                }
            }
        }
        yield mkdirP(path.dirname(dest));
        yield ioUtil.rename(source, dest);
    });
}
exports.mv = mv;
/**
 * Remove a path recursively with force
 *
 * @param inputPath path to remove
 */
function rmRF(inputPath) {
    return __awaiter(this, void 0, void 0, function* () {
        if (ioUtil.IS_WINDOWS) {
            // Node doesn't provide a delete operation, only an unlink function. This means that if the file is being used by another
            // program (e.g. antivirus), it won't be deleted. To address this, we shell out the work to rd/del.
            try {
                if (yield ioUtil.isDirectory(inputPath, true)) {
                    yield exec(`rd /s /q "${inputPath}"`);
                }
                else {
                    yield exec(`del /f /a "${inputPath}"`);
                }
            }
            catch (err) {
                // if you try to delete a file that doesn't exist, desired result is achieved
                // other errors are valid
                if (err.code !== 'ENOENT')
                    throw err;
            }
            // Shelling out fails to remove a symlink folder with missing source, this unlink catches that
            try {
                yield ioUtil.unlink(inputPath);
            }
            catch (err) {
                // if you try to delete a file that doesn't exist, desired result is achieved
                // other errors are valid
                if (err.code !== 'ENOENT')
                    throw err;
            }
        }
        else {
            let isDir = false;
            try {
                isDir = yield ioUtil.isDirectory(inputPath);
            }
            catch (err) {
                // if you try to delete a file that doesn't exist, desired result is achieved
                // other errors are valid
                if (err.code !== 'ENOENT')
                    throw err;
                return;
            }
            if (isDir) {
                yield exec(`rm -rf "${inputPath}"`);
            }
            else {
                yield ioUtil.unlink(inputPath);
            }
        }
    });
}
exports.rmRF = rmRF;
/**
 * Make a directory.  Creates the full path with folders in between
 * Will throw if it fails
 *
 * @param   fsPath        path to create
 * @returns Promise<void>
 */
function mkdirP(fsPath) {
    return __awaiter(this, void 0, void 0, function* () {
        yield ioUtil.mkdirP(fsPath);
    });
}
exports.mkdirP = mkdirP;
/**
 * Returns path of a tool had the tool actually been invoked.  Resolves via paths.
 * If you check and the tool does not exist, it will throw.
 *
 * @param     tool              name of the tool
 * @param     check             whether to check if tool exists
 * @returns   Promise<string>   path to tool
 */
function which(tool, check) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!tool) {
            throw new Error("parameter 'tool' is required");
        }
        // recursive when check=true
        if (check) {
            const result = yield which(tool, false);
            if (!result) {
                if (ioUtil.IS_WINDOWS) {
                    throw new Error(`Unable to locate executable file: ${tool}. Please verify either the file path exists or the file can be found within a directory specified by the PATH environment variable. Also verify the file has a valid extension for an executable file.`);
                }
                else {
                    throw new Error(`Unable to locate executable file: ${tool}. Please verify either the file path exists or the file can be found within a directory specified by the PATH environment variable. Also check the file mode to verify the file is executable.`);
                }
            }
        }
        try {
            // build the list of extensions to try
            const extensions = [];
            if (ioUtil.IS_WINDOWS && process.env.PATHEXT) {
                for (const extension of process.env.PATHEXT.split(path.delimiter)) {
                    if (extension) {
                        extensions.push(extension);
                    }
                }
            }
            // if it's rooted, return it if exists. otherwise return empty.
            if (ioUtil.isRooted(tool)) {
                const filePath = yield ioUtil.tryGetExecutablePath(tool, extensions);
                if (filePath) {
                    return filePath;
                }
                return '';
            }
            // if any path separators, return empty
            if (tool.includes('/') || (ioUtil.IS_WINDOWS && tool.includes('\\'))) {
                return '';
            }
            // build the list of directories
            //
            // Note, technically "where" checks the current directory on Windows. From a toolkit perspective,
            // it feels like we should not do this. Checking the current directory seems like more of a use
            // case of a shell, and the which() function exposed by the toolkit should strive for consistency
            // across platforms.
            const directories = [];
            if (process.env.PATH) {
                for (const p of process.env.PATH.split(path.delimiter)) {
                    if (p) {
                        directories.push(p);
                    }
                }
            }
            // return the first match
            for (const directory of directories) {
                const filePath = yield ioUtil.tryGetExecutablePath(directory + path.sep + tool, extensions);
                if (filePath) {
                    return filePath;
                }
            }
            return '';
        }
        catch (err) {
            throw new Error(`which failed with message ${err.message}`);
        }
    });
}
exports.which = which;
function readCopyOptions(options) {
    const force = options.force == null ? true : options.force;
    const recursive = Boolean(options.recursive);
    return { force, recursive };
}
function cpDirRecursive(sourceDir, destDir, currentDepth, force) {
    return __awaiter(this, void 0, void 0, function* () {
        // Ensure there is not a run away recursive copy
        if (currentDepth >= 255)
            return;
        currentDepth++;
        yield mkdirP(destDir);
        const files = yield ioUtil.readdir(sourceDir);
        for (const fileName of files) {
            const srcFile = `${sourceDir}/${fileName}`;
            const destFile = `${destDir}/${fileName}`;
            const srcFileStat = yield ioUtil.lstat(srcFile);
            if (srcFileStat.isDirectory()) {
                // Recurse
                yield cpDirRecursive(srcFile, destFile, currentDepth, force);
            }
            else {
                yield copyFile(srcFile, destFile, force);
            }
        }
        // Change the mode for the newly created directory
        yield ioUtil.chmod(destDir, (yield ioUtil.stat(sourceDir)).mode);
    });
}
// Buffered file copy
function copyFile(srcFile, destFile, force) {
    return __awaiter(this, void 0, void 0, function* () {
        if ((yield ioUtil.lstat(srcFile)).isSymbolicLink()) {
            // unlink/re-link it
            try {
                yield ioUtil.lstat(destFile);
                yield ioUtil.unlink(destFile);
            }
            catch (e) {
                // Try to override file permission
                if (e.code === 'EPERM') {
                    yield ioUtil.chmod(destFile, '0666');
                    yield ioUtil.unlink(destFile);
                }
                // other errors = it doesn't exist, no work to do
            }
            // Copy over symlink
            const symlinkFull = yield ioUtil.readlink(srcFile);
            yield ioUtil.symlink(symlinkFull, destFile, ioUtil.IS_WINDOWS ? 'junction' : null);
        }
        else if (!(yield ioUtil.exists(destFile)) || force) {
            yield ioUtil.copyFile(srcFile, destFile);
        }
    });
}
//# sourceMappingURL=io.js.map

/***/ }),

/***/ 9417:
/***/ ((module) => {

"use strict";

module.exports = balanced;
function balanced(a, b, str) {
  if (a instanceof RegExp) a = maybeMatch(a, str);
  if (b instanceof RegExp) b = maybeMatch(b, str);

  var r = range(a, b, str);

  return r && {
    start: r[0],
    end: r[1],
    pre: str.slice(0, r[0]),
    body: str.slice(r[0] + a.length, r[1]),
    post: str.slice(r[1] + b.length)
  };
}

function maybeMatch(reg, str) {
  var m = str.match(reg);
  return m ? m[0] : null;
}

balanced.range = range;
function range(a, b, str) {
  var begs, beg, left, right, result;
  var ai = str.indexOf(a);
  var bi = str.indexOf(b, ai + 1);
  var i = ai;

  if (ai >= 0 && bi > 0) {
    begs = [];
    left = str.length;

    while (i >= 0 && !result) {
      if (i == ai) {
        begs.push(i);
        ai = str.indexOf(a, i + 1);
      } else if (begs.length == 1) {
        result = [ begs.pop(), bi ];
      } else {
        beg = begs.pop();
        if (beg < left) {
          left = beg;
          right = bi;
        }

        bi = str.indexOf(b, i + 1);
      }

      i = ai < bi && ai >= 0 ? ai : bi;
    }

    if (begs.length) {
      result = [ left, right ];
    }
  }

  return result;
}


/***/ }),

/***/ 3717:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var concatMap = __webpack_require__(6891);
var balanced = __webpack_require__(9417);

module.exports = expandTop;

var escSlash = '\0SLASH'+Math.random()+'\0';
var escOpen = '\0OPEN'+Math.random()+'\0';
var escClose = '\0CLOSE'+Math.random()+'\0';
var escComma = '\0COMMA'+Math.random()+'\0';
var escPeriod = '\0PERIOD'+Math.random()+'\0';

function numeric(str) {
  return parseInt(str, 10) == str
    ? parseInt(str, 10)
    : str.charCodeAt(0);
}

function escapeBraces(str) {
  return str.split('\\\\').join(escSlash)
            .split('\\{').join(escOpen)
            .split('\\}').join(escClose)
            .split('\\,').join(escComma)
            .split('\\.').join(escPeriod);
}

function unescapeBraces(str) {
  return str.split(escSlash).join('\\')
            .split(escOpen).join('{')
            .split(escClose).join('}')
            .split(escComma).join(',')
            .split(escPeriod).join('.');
}


// Basically just str.split(","), but handling cases
// where we have nested braced sections, which should be
// treated as individual members, like {a,{b,c},d}
function parseCommaParts(str) {
  if (!str)
    return [''];

  var parts = [];
  var m = balanced('{', '}', str);

  if (!m)
    return str.split(',');

  var pre = m.pre;
  var body = m.body;
  var post = m.post;
  var p = pre.split(',');

  p[p.length-1] += '{' + body + '}';
  var postParts = parseCommaParts(post);
  if (post.length) {
    p[p.length-1] += postParts.shift();
    p.push.apply(p, postParts);
  }

  parts.push.apply(parts, p);

  return parts;
}

function expandTop(str) {
  if (!str)
    return [];

  // I don't know why Bash 4.3 does this, but it does.
  // Anything starting with {} will have the first two bytes preserved
  // but *only* at the top level, so {},a}b will not expand to anything,
  // but a{},b}c will be expanded to [a}c,abc].
  // One could argue that this is a bug in Bash, but since the goal of
  // this module is to match Bash's rules, we escape a leading {}
  if (str.substr(0, 2) === '{}') {
    str = '\\{\\}' + str.substr(2);
  }

  return expand(escapeBraces(str), true).map(unescapeBraces);
}

function identity(e) {
  return e;
}

function embrace(str) {
  return '{' + str + '}';
}
function isPadded(el) {
  return /^-?0\d/.test(el);
}

function lte(i, y) {
  return i <= y;
}
function gte(i, y) {
  return i >= y;
}

function expand(str, isTop) {
  var expansions = [];

  var m = balanced('{', '}', str);
  if (!m || /\$$/.test(m.pre)) return [str];

  var isNumericSequence = /^-?\d+\.\.-?\d+(?:\.\.-?\d+)?$/.test(m.body);
  var isAlphaSequence = /^[a-zA-Z]\.\.[a-zA-Z](?:\.\.-?\d+)?$/.test(m.body);
  var isSequence = isNumericSequence || isAlphaSequence;
  var isOptions = m.body.indexOf(',') >= 0;
  if (!isSequence && !isOptions) {
    // {a},b}
    if (m.post.match(/,.*\}/)) {
      str = m.pre + '{' + m.body + escClose + m.post;
      return expand(str);
    }
    return [str];
  }

  var n;
  if (isSequence) {
    n = m.body.split(/\.\./);
  } else {
    n = parseCommaParts(m.body);
    if (n.length === 1) {
      // x{{a,b}}y ==> x{a}y x{b}y
      n = expand(n[0], false).map(embrace);
      if (n.length === 1) {
        var post = m.post.length
          ? expand(m.post, false)
          : [''];
        return post.map(function(p) {
          return m.pre + n[0] + p;
        });
      }
    }
  }

  // at this point, n is the parts, and we know it's not a comma set
  // with a single entry.

  // no need to expand pre, since it is guaranteed to be free of brace-sets
  var pre = m.pre;
  var post = m.post.length
    ? expand(m.post, false)
    : [''];

  var N;

  if (isSequence) {
    var x = numeric(n[0]);
    var y = numeric(n[1]);
    var width = Math.max(n[0].length, n[1].length)
    var incr = n.length == 3
      ? Math.abs(numeric(n[2]))
      : 1;
    var test = lte;
    var reverse = y < x;
    if (reverse) {
      incr *= -1;
      test = gte;
    }
    var pad = n.some(isPadded);

    N = [];

    for (var i = x; test(i, y); i += incr) {
      var c;
      if (isAlphaSequence) {
        c = String.fromCharCode(i);
        if (c === '\\')
          c = '';
      } else {
        c = String(i);
        if (pad) {
          var need = width - c.length;
          if (need > 0) {
            var z = new Array(need + 1).join('0');
            if (i < 0)
              c = '-' + z + c.slice(1);
            else
              c = z + c;
          }
        }
      }
      N.push(c);
    }
  } else {
    N = concatMap(n, function(el) { return expand(el, false) });
  }

  for (var j = 0; j < N.length; j++) {
    for (var k = 0; k < post.length; k++) {
      var expansion = pre + N[j] + post[k];
      if (!isTop || isSequence || expansion)
        expansions.push(expansion);
    }
  }

  return expansions;
}



/***/ }),

/***/ 6891:
/***/ ((module) => {

module.exports = function (xs, fn) {
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        var x = fn(xs[i], i);
        if (isArray(x)) res.push.apply(res, x);
        else res.push(x);
    }
    return res;
};

var isArray = Array.isArray || function (xs) {
    return Object.prototype.toString.call(xs) === '[object Array]';
};


/***/ }),

/***/ 6863:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = realpath
realpath.realpath = realpath
realpath.sync = realpathSync
realpath.realpathSync = realpathSync
realpath.monkeypatch = monkeypatch
realpath.unmonkeypatch = unmonkeypatch

var fs = __webpack_require__(5747)
var origRealpath = fs.realpath
var origRealpathSync = fs.realpathSync

var version = process.version
var ok = /^v[0-5]\./.test(version)
var old = __webpack_require__(1734)

function newError (er) {
  return er && er.syscall === 'realpath' && (
    er.code === 'ELOOP' ||
    er.code === 'ENOMEM' ||
    er.code === 'ENAMETOOLONG'
  )
}

function realpath (p, cache, cb) {
  if (ok) {
    return origRealpath(p, cache, cb)
  }

  if (typeof cache === 'function') {
    cb = cache
    cache = null
  }
  origRealpath(p, cache, function (er, result) {
    if (newError(er)) {
      old.realpath(p, cache, cb)
    } else {
      cb(er, result)
    }
  })
}

function realpathSync (p, cache) {
  if (ok) {
    return origRealpathSync(p, cache)
  }

  try {
    return origRealpathSync(p, cache)
  } catch (er) {
    if (newError(er)) {
      return old.realpathSync(p, cache)
    } else {
      throw er
    }
  }
}

function monkeypatch () {
  fs.realpath = realpath
  fs.realpathSync = realpathSync
}

function unmonkeypatch () {
  fs.realpath = origRealpath
  fs.realpathSync = origRealpathSync
}


/***/ }),

/***/ 1734:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var pathModule = __webpack_require__(5622);
var isWindows = process.platform === 'win32';
var fs = __webpack_require__(5747);

// JavaScript implementation of realpath, ported from node pre-v6

var DEBUG = process.env.NODE_DEBUG && /fs/.test(process.env.NODE_DEBUG);

function rethrow() {
  // Only enable in debug mode. A backtrace uses ~1000 bytes of heap space and
  // is fairly slow to generate.
  var callback;
  if (DEBUG) {
    var backtrace = new Error;
    callback = debugCallback;
  } else
    callback = missingCallback;

  return callback;

  function debugCallback(err) {
    if (err) {
      backtrace.message = err.message;
      err = backtrace;
      missingCallback(err);
    }
  }

  function missingCallback(err) {
    if (err) {
      if (process.throwDeprecation)
        throw err;  // Forgot a callback but don't know where? Use NODE_DEBUG=fs
      else if (!process.noDeprecation) {
        var msg = 'fs: missing callback ' + (err.stack || err.message);
        if (process.traceDeprecation)
          console.trace(msg);
        else
          console.error(msg);
      }
    }
  }
}

function maybeCallback(cb) {
  return typeof cb === 'function' ? cb : rethrow();
}

var normalize = pathModule.normalize;

// Regexp that finds the next partion of a (partial) path
// result is [base_with_slash, base], e.g. ['somedir/', 'somedir']
if (isWindows) {
  var nextPartRe = /(.*?)(?:[\/\\]+|$)/g;
} else {
  var nextPartRe = /(.*?)(?:[\/]+|$)/g;
}

// Regex to find the device root, including trailing slash. E.g. 'c:\\'.
if (isWindows) {
  var splitRootRe = /^(?:[a-zA-Z]:|[\\\/]{2}[^\\\/]+[\\\/][^\\\/]+)?[\\\/]*/;
} else {
  var splitRootRe = /^[\/]*/;
}

exports.realpathSync = function realpathSync(p, cache) {
  // make p is absolute
  p = pathModule.resolve(p);

  if (cache && Object.prototype.hasOwnProperty.call(cache, p)) {
    return cache[p];
  }

  var original = p,
      seenLinks = {},
      knownHard = {};

  // current character position in p
  var pos;
  // the partial path so far, including a trailing slash if any
  var current;
  // the partial path without a trailing slash (except when pointing at a root)
  var base;
  // the partial path scanned in the previous round, with slash
  var previous;

  start();

  function start() {
    // Skip over roots
    var m = splitRootRe.exec(p);
    pos = m[0].length;
    current = m[0];
    base = m[0];
    previous = '';

    // On windows, check that the root exists. On unix there is no need.
    if (isWindows && !knownHard[base]) {
      fs.lstatSync(base);
      knownHard[base] = true;
    }
  }

  // walk down the path, swapping out linked pathparts for their real
  // values
  // NB: p.length changes.
  while (pos < p.length) {
    // find the next part
    nextPartRe.lastIndex = pos;
    var result = nextPartRe.exec(p);
    previous = current;
    current += result[0];
    base = previous + result[1];
    pos = nextPartRe.lastIndex;

    // continue if not a symlink
    if (knownHard[base] || (cache && cache[base] === base)) {
      continue;
    }

    var resolvedLink;
    if (cache && Object.prototype.hasOwnProperty.call(cache, base)) {
      // some known symbolic link.  no need to stat again.
      resolvedLink = cache[base];
    } else {
      var stat = fs.lstatSync(base);
      if (!stat.isSymbolicLink()) {
        knownHard[base] = true;
        if (cache) cache[base] = base;
        continue;
      }

      // read the link if it wasn't read before
      // dev/ino always return 0 on windows, so skip the check.
      var linkTarget = null;
      if (!isWindows) {
        var id = stat.dev.toString(32) + ':' + stat.ino.toString(32);
        if (seenLinks.hasOwnProperty(id)) {
          linkTarget = seenLinks[id];
        }
      }
      if (linkTarget === null) {
        fs.statSync(base);
        linkTarget = fs.readlinkSync(base);
      }
      resolvedLink = pathModule.resolve(previous, linkTarget);
      // track this, if given a cache.
      if (cache) cache[base] = resolvedLink;
      if (!isWindows) seenLinks[id] = linkTarget;
    }

    // resolve the link, then start over
    p = pathModule.resolve(resolvedLink, p.slice(pos));
    start();
  }

  if (cache) cache[original] = p;

  return p;
};


exports.realpath = function realpath(p, cache, cb) {
  if (typeof cb !== 'function') {
    cb = maybeCallback(cache);
    cache = null;
  }

  // make p is absolute
  p = pathModule.resolve(p);

  if (cache && Object.prototype.hasOwnProperty.call(cache, p)) {
    return process.nextTick(cb.bind(null, null, cache[p]));
  }

  var original = p,
      seenLinks = {},
      knownHard = {};

  // current character position in p
  var pos;
  // the partial path so far, including a trailing slash if any
  var current;
  // the partial path without a trailing slash (except when pointing at a root)
  var base;
  // the partial path scanned in the previous round, with slash
  var previous;

  start();

  function start() {
    // Skip over roots
    var m = splitRootRe.exec(p);
    pos = m[0].length;
    current = m[0];
    base = m[0];
    previous = '';

    // On windows, check that the root exists. On unix there is no need.
    if (isWindows && !knownHard[base]) {
      fs.lstat(base, function(err) {
        if (err) return cb(err);
        knownHard[base] = true;
        LOOP();
      });
    } else {
      process.nextTick(LOOP);
    }
  }

  // walk down the path, swapping out linked pathparts for their real
  // values
  function LOOP() {
    // stop if scanned past end of path
    if (pos >= p.length) {
      if (cache) cache[original] = p;
      return cb(null, p);
    }

    // find the next part
    nextPartRe.lastIndex = pos;
    var result = nextPartRe.exec(p);
    previous = current;
    current += result[0];
    base = previous + result[1];
    pos = nextPartRe.lastIndex;

    // continue if not a symlink
    if (knownHard[base] || (cache && cache[base] === base)) {
      return process.nextTick(LOOP);
    }

    if (cache && Object.prototype.hasOwnProperty.call(cache, base)) {
      // known symbolic link.  no need to stat again.
      return gotResolvedLink(cache[base]);
    }

    return fs.lstat(base, gotStat);
  }

  function gotStat(err, stat) {
    if (err) return cb(err);

    // if not a symlink, skip to the next path part
    if (!stat.isSymbolicLink()) {
      knownHard[base] = true;
      if (cache) cache[base] = base;
      return process.nextTick(LOOP);
    }

    // stat & read the link if not read before
    // call gotTarget as soon as the link target is known
    // dev/ino always return 0 on windows, so skip the check.
    if (!isWindows) {
      var id = stat.dev.toString(32) + ':' + stat.ino.toString(32);
      if (seenLinks.hasOwnProperty(id)) {
        return gotTarget(null, seenLinks[id], base);
      }
    }
    fs.stat(base, function(err) {
      if (err) return cb(err);

      fs.readlink(base, function(err, target) {
        if (!isWindows) seenLinks[id] = target;
        gotTarget(err, target);
      });
    });
  }

  function gotTarget(err, target, base) {
    if (err) return cb(err);

    var resolvedLink = pathModule.resolve(previous, target);
    if (cache) cache[base] = resolvedLink;
    gotResolvedLink(resolvedLink);
  }

  function gotResolvedLink(resolvedLink) {
    // resolve the link, then start over
    p = pathModule.resolve(resolvedLink, p.slice(pos));
    start();
  }
};


/***/ }),

/***/ 7625:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

exports.alphasort = alphasort
exports.alphasorti = alphasorti
exports.setopts = setopts
exports.ownProp = ownProp
exports.makeAbs = makeAbs
exports.finish = finish
exports.mark = mark
exports.isIgnored = isIgnored
exports.childrenIgnored = childrenIgnored

function ownProp (obj, field) {
  return Object.prototype.hasOwnProperty.call(obj, field)
}

var path = __webpack_require__(5622)
var minimatch = __webpack_require__(3973)
var isAbsolute = __webpack_require__(8714)
var Minimatch = minimatch.Minimatch

function alphasorti (a, b) {
  return a.toLowerCase().localeCompare(b.toLowerCase())
}

function alphasort (a, b) {
  return a.localeCompare(b)
}

function setupIgnores (self, options) {
  self.ignore = options.ignore || []

  if (!Array.isArray(self.ignore))
    self.ignore = [self.ignore]

  if (self.ignore.length) {
    self.ignore = self.ignore.map(ignoreMap)
  }
}

// ignore patterns are always in dot:true mode.
function ignoreMap (pattern) {
  var gmatcher = null
  if (pattern.slice(-3) === '/**') {
    var gpattern = pattern.replace(/(\/\*\*)+$/, '')
    gmatcher = new Minimatch(gpattern, { dot: true })
  }

  return {
    matcher: new Minimatch(pattern, { dot: true }),
    gmatcher: gmatcher
  }
}

function setopts (self, pattern, options) {
  if (!options)
    options = {}

  // base-matching: just use globstar for that.
  if (options.matchBase && -1 === pattern.indexOf("/")) {
    if (options.noglobstar) {
      throw new Error("base matching requires globstar")
    }
    pattern = "**/" + pattern
  }

  self.silent = !!options.silent
  self.pattern = pattern
  self.strict = options.strict !== false
  self.realpath = !!options.realpath
  self.realpathCache = options.realpathCache || Object.create(null)
  self.follow = !!options.follow
  self.dot = !!options.dot
  self.mark = !!options.mark
  self.nodir = !!options.nodir
  if (self.nodir)
    self.mark = true
  self.sync = !!options.sync
  self.nounique = !!options.nounique
  self.nonull = !!options.nonull
  self.nosort = !!options.nosort
  self.nocase = !!options.nocase
  self.stat = !!options.stat
  self.noprocess = !!options.noprocess
  self.absolute = !!options.absolute

  self.maxLength = options.maxLength || Infinity
  self.cache = options.cache || Object.create(null)
  self.statCache = options.statCache || Object.create(null)
  self.symlinks = options.symlinks || Object.create(null)

  setupIgnores(self, options)

  self.changedCwd = false
  var cwd = process.cwd()
  if (!ownProp(options, "cwd"))
    self.cwd = cwd
  else {
    self.cwd = path.resolve(options.cwd)
    self.changedCwd = self.cwd !== cwd
  }

  self.root = options.root || path.resolve(self.cwd, "/")
  self.root = path.resolve(self.root)
  if (process.platform === "win32")
    self.root = self.root.replace(/\\/g, "/")

  // TODO: is an absolute `cwd` supposed to be resolved against `root`?
  // e.g. { cwd: '/test', root: __dirname } === path.join(__dirname, '/test')
  self.cwdAbs = isAbsolute(self.cwd) ? self.cwd : makeAbs(self, self.cwd)
  if (process.platform === "win32")
    self.cwdAbs = self.cwdAbs.replace(/\\/g, "/")
  self.nomount = !!options.nomount

  // disable comments and negation in Minimatch.
  // Note that they are not supported in Glob itself anyway.
  options.nonegate = true
  options.nocomment = true

  self.minimatch = new Minimatch(pattern, options)
  self.options = self.minimatch.options
}

function finish (self) {
  var nou = self.nounique
  var all = nou ? [] : Object.create(null)

  for (var i = 0, l = self.matches.length; i < l; i ++) {
    var matches = self.matches[i]
    if (!matches || Object.keys(matches).length === 0) {
      if (self.nonull) {
        // do like the shell, and spit out the literal glob
        var literal = self.minimatch.globSet[i]
        if (nou)
          all.push(literal)
        else
          all[literal] = true
      }
    } else {
      // had matches
      var m = Object.keys(matches)
      if (nou)
        all.push.apply(all, m)
      else
        m.forEach(function (m) {
          all[m] = true
        })
    }
  }

  if (!nou)
    all = Object.keys(all)

  if (!self.nosort)
    all = all.sort(self.nocase ? alphasorti : alphasort)

  // at *some* point we statted all of these
  if (self.mark) {
    for (var i = 0; i < all.length; i++) {
      all[i] = self._mark(all[i])
    }
    if (self.nodir) {
      all = all.filter(function (e) {
        var notDir = !(/\/$/.test(e))
        var c = self.cache[e] || self.cache[makeAbs(self, e)]
        if (notDir && c)
          notDir = c !== 'DIR' && !Array.isArray(c)
        return notDir
      })
    }
  }

  if (self.ignore.length)
    all = all.filter(function(m) {
      return !isIgnored(self, m)
    })

  self.found = all
}

function mark (self, p) {
  var abs = makeAbs(self, p)
  var c = self.cache[abs]
  var m = p
  if (c) {
    var isDir = c === 'DIR' || Array.isArray(c)
    var slash = p.slice(-1) === '/'

    if (isDir && !slash)
      m += '/'
    else if (!isDir && slash)
      m = m.slice(0, -1)

    if (m !== p) {
      var mabs = makeAbs(self, m)
      self.statCache[mabs] = self.statCache[abs]
      self.cache[mabs] = self.cache[abs]
    }
  }

  return m
}

// lotta situps...
function makeAbs (self, f) {
  var abs = f
  if (f.charAt(0) === '/') {
    abs = path.join(self.root, f)
  } else if (isAbsolute(f) || f === '') {
    abs = f
  } else if (self.changedCwd) {
    abs = path.resolve(self.cwd, f)
  } else {
    abs = path.resolve(f)
  }

  if (process.platform === 'win32')
    abs = abs.replace(/\\/g, '/')

  return abs
}


// Return true, if pattern ends with globstar '**', for the accompanying parent directory.
// Ex:- If node_modules/** is the pattern, add 'node_modules' to ignore list along with it's contents
function isIgnored (self, path) {
  if (!self.ignore.length)
    return false

  return self.ignore.some(function(item) {
    return item.matcher.match(path) || !!(item.gmatcher && item.gmatcher.match(path))
  })
}

function childrenIgnored (self, path) {
  if (!self.ignore.length)
    return false

  return self.ignore.some(function(item) {
    return !!(item.gmatcher && item.gmatcher.match(path))
  })
}


/***/ }),

/***/ 1957:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// Approach:
//
// 1. Get the minimatch set
// 2. For each pattern in the set, PROCESS(pattern, false)
// 3. Store matches per-set, then uniq them
//
// PROCESS(pattern, inGlobStar)
// Get the first [n] items from pattern that are all strings
// Join these together.  This is PREFIX.
//   If there is no more remaining, then stat(PREFIX) and
//   add to matches if it succeeds.  END.
//
// If inGlobStar and PREFIX is symlink and points to dir
//   set ENTRIES = []
// else readdir(PREFIX) as ENTRIES
//   If fail, END
//
// with ENTRIES
//   If pattern[n] is GLOBSTAR
//     // handle the case where the globstar match is empty
//     // by pruning it out, and testing the resulting pattern
//     PROCESS(pattern[0..n] + pattern[n+1 .. $], false)
//     // handle other cases.
//     for ENTRY in ENTRIES (not dotfiles)
//       // attach globstar + tail onto the entry
//       // Mark that this entry is a globstar match
//       PROCESS(pattern[0..n] + ENTRY + pattern[n .. $], true)
//
//   else // not globstar
//     for ENTRY in ENTRIES (not dotfiles, unless pattern[n] is dot)
//       Test ENTRY against pattern[n]
//       If fails, continue
//       If passes, PROCESS(pattern[0..n] + item + pattern[n+1 .. $])
//
// Caveat:
//   Cache all stats and readdirs results to minimize syscall.  Since all
//   we ever care about is existence and directory-ness, we can just keep
//   `true` for files, and [children,...] for directories, or `false` for
//   things that don't exist.

module.exports = glob

var fs = __webpack_require__(5747)
var rp = __webpack_require__(6863)
var minimatch = __webpack_require__(3973)
var Minimatch = minimatch.Minimatch
var inherits = __webpack_require__(4124)
var EE = __webpack_require__(8614).EventEmitter
var path = __webpack_require__(5622)
var assert = __webpack_require__(2357)
var isAbsolute = __webpack_require__(8714)
var globSync = __webpack_require__(9010)
var common = __webpack_require__(7625)
var alphasort = common.alphasort
var alphasorti = common.alphasorti
var setopts = common.setopts
var ownProp = common.ownProp
var inflight = __webpack_require__(2492)
var util = __webpack_require__(1669)
var childrenIgnored = common.childrenIgnored
var isIgnored = common.isIgnored

var once = __webpack_require__(1223)

function glob (pattern, options, cb) {
  if (typeof options === 'function') cb = options, options = {}
  if (!options) options = {}

  if (options.sync) {
    if (cb)
      throw new TypeError('callback provided to sync glob')
    return globSync(pattern, options)
  }

  return new Glob(pattern, options, cb)
}

glob.sync = globSync
var GlobSync = glob.GlobSync = globSync.GlobSync

// old api surface
glob.glob = glob

function extend (origin, add) {
  if (add === null || typeof add !== 'object') {
    return origin
  }

  var keys = Object.keys(add)
  var i = keys.length
  while (i--) {
    origin[keys[i]] = add[keys[i]]
  }
  return origin
}

glob.hasMagic = function (pattern, options_) {
  var options = extend({}, options_)
  options.noprocess = true

  var g = new Glob(pattern, options)
  var set = g.minimatch.set

  if (!pattern)
    return false

  if (set.length > 1)
    return true

  for (var j = 0; j < set[0].length; j++) {
    if (typeof set[0][j] !== 'string')
      return true
  }

  return false
}

glob.Glob = Glob
inherits(Glob, EE)
function Glob (pattern, options, cb) {
  if (typeof options === 'function') {
    cb = options
    options = null
  }

  if (options && options.sync) {
    if (cb)
      throw new TypeError('callback provided to sync glob')
    return new GlobSync(pattern, options)
  }

  if (!(this instanceof Glob))
    return new Glob(pattern, options, cb)

  setopts(this, pattern, options)
  this._didRealPath = false

  // process each pattern in the minimatch set
  var n = this.minimatch.set.length

  // The matches are stored as {<filename>: true,...} so that
  // duplicates are automagically pruned.
  // Later, we do an Object.keys() on these.
  // Keep them as a list so we can fill in when nonull is set.
  this.matches = new Array(n)

  if (typeof cb === 'function') {
    cb = once(cb)
    this.on('error', cb)
    this.on('end', function (matches) {
      cb(null, matches)
    })
  }

  var self = this
  this._processing = 0

  this._emitQueue = []
  this._processQueue = []
  this.paused = false

  if (this.noprocess)
    return this

  if (n === 0)
    return done()

  var sync = true
  for (var i = 0; i < n; i ++) {
    this._process(this.minimatch.set[i], i, false, done)
  }
  sync = false

  function done () {
    --self._processing
    if (self._processing <= 0) {
      if (sync) {
        process.nextTick(function () {
          self._finish()
        })
      } else {
        self._finish()
      }
    }
  }
}

Glob.prototype._finish = function () {
  assert(this instanceof Glob)
  if (this.aborted)
    return

  if (this.realpath && !this._didRealpath)
    return this._realpath()

  common.finish(this)
  this.emit('end', this.found)
}

Glob.prototype._realpath = function () {
  if (this._didRealpath)
    return

  this._didRealpath = true

  var n = this.matches.length
  if (n === 0)
    return this._finish()

  var self = this
  for (var i = 0; i < this.matches.length; i++)
    this._realpathSet(i, next)

  function next () {
    if (--n === 0)
      self._finish()
  }
}

Glob.prototype._realpathSet = function (index, cb) {
  var matchset = this.matches[index]
  if (!matchset)
    return cb()

  var found = Object.keys(matchset)
  var self = this
  var n = found.length

  if (n === 0)
    return cb()

  var set = this.matches[index] = Object.create(null)
  found.forEach(function (p, i) {
    // If there's a problem with the stat, then it means that
    // one or more of the links in the realpath couldn't be
    // resolved.  just return the abs value in that case.
    p = self._makeAbs(p)
    rp.realpath(p, self.realpathCache, function (er, real) {
      if (!er)
        set[real] = true
      else if (er.syscall === 'stat')
        set[p] = true
      else
        self.emit('error', er) // srsly wtf right here

      if (--n === 0) {
        self.matches[index] = set
        cb()
      }
    })
  })
}

Glob.prototype._mark = function (p) {
  return common.mark(this, p)
}

Glob.prototype._makeAbs = function (f) {
  return common.makeAbs(this, f)
}

Glob.prototype.abort = function () {
  this.aborted = true
  this.emit('abort')
}

Glob.prototype.pause = function () {
  if (!this.paused) {
    this.paused = true
    this.emit('pause')
  }
}

Glob.prototype.resume = function () {
  if (this.paused) {
    this.emit('resume')
    this.paused = false
    if (this._emitQueue.length) {
      var eq = this._emitQueue.slice(0)
      this._emitQueue.length = 0
      for (var i = 0; i < eq.length; i ++) {
        var e = eq[i]
        this._emitMatch(e[0], e[1])
      }
    }
    if (this._processQueue.length) {
      var pq = this._processQueue.slice(0)
      this._processQueue.length = 0
      for (var i = 0; i < pq.length; i ++) {
        var p = pq[i]
        this._processing--
        this._process(p[0], p[1], p[2], p[3])
      }
    }
  }
}

Glob.prototype._process = function (pattern, index, inGlobStar, cb) {
  assert(this instanceof Glob)
  assert(typeof cb === 'function')

  if (this.aborted)
    return

  this._processing++
  if (this.paused) {
    this._processQueue.push([pattern, index, inGlobStar, cb])
    return
  }

  //console.error('PROCESS %d', this._processing, pattern)

  // Get the first [n] parts of pattern that are all strings.
  var n = 0
  while (typeof pattern[n] === 'string') {
    n ++
  }
  // now n is the index of the first one that is *not* a string.

  // see if there's anything else
  var prefix
  switch (n) {
    // if not, then this is rather simple
    case pattern.length:
      this._processSimple(pattern.join('/'), index, cb)
      return

    case 0:
      // pattern *starts* with some non-trivial item.
      // going to readdir(cwd), but not include the prefix in matches.
      prefix = null
      break

    default:
      // pattern has some string bits in the front.
      // whatever it starts with, whether that's 'absolute' like /foo/bar,
      // or 'relative' like '../baz'
      prefix = pattern.slice(0, n).join('/')
      break
  }

  var remain = pattern.slice(n)

  // get the list of entries.
  var read
  if (prefix === null)
    read = '.'
  else if (isAbsolute(prefix) || isAbsolute(pattern.join('/'))) {
    if (!prefix || !isAbsolute(prefix))
      prefix = '/' + prefix
    read = prefix
  } else
    read = prefix

  var abs = this._makeAbs(read)

  //if ignored, skip _processing
  if (childrenIgnored(this, read))
    return cb()

  var isGlobStar = remain[0] === minimatch.GLOBSTAR
  if (isGlobStar)
    this._processGlobStar(prefix, read, abs, remain, index, inGlobStar, cb)
  else
    this._processReaddir(prefix, read, abs, remain, index, inGlobStar, cb)
}

Glob.prototype._processReaddir = function (prefix, read, abs, remain, index, inGlobStar, cb) {
  var self = this
  this._readdir(abs, inGlobStar, function (er, entries) {
    return self._processReaddir2(prefix, read, abs, remain, index, inGlobStar, entries, cb)
  })
}

Glob.prototype._processReaddir2 = function (prefix, read, abs, remain, index, inGlobStar, entries, cb) {

  // if the abs isn't a dir, then nothing can match!
  if (!entries)
    return cb()

  // It will only match dot entries if it starts with a dot, or if
  // dot is set.  Stuff like @(.foo|.bar) isn't allowed.
  var pn = remain[0]
  var negate = !!this.minimatch.negate
  var rawGlob = pn._glob
  var dotOk = this.dot || rawGlob.charAt(0) === '.'

  var matchedEntries = []
  for (var i = 0; i < entries.length; i++) {
    var e = entries[i]
    if (e.charAt(0) !== '.' || dotOk) {
      var m
      if (negate && !prefix) {
        m = !e.match(pn)
      } else {
        m = e.match(pn)
      }
      if (m)
        matchedEntries.push(e)
    }
  }

  //console.error('prd2', prefix, entries, remain[0]._glob, matchedEntries)

  var len = matchedEntries.length
  // If there are no matched entries, then nothing matches.
  if (len === 0)
    return cb()

  // if this is the last remaining pattern bit, then no need for
  // an additional stat *unless* the user has specified mark or
  // stat explicitly.  We know they exist, since readdir returned
  // them.

  if (remain.length === 1 && !this.mark && !this.stat) {
    if (!this.matches[index])
      this.matches[index] = Object.create(null)

    for (var i = 0; i < len; i ++) {
      var e = matchedEntries[i]
      if (prefix) {
        if (prefix !== '/')
          e = prefix + '/' + e
        else
          e = prefix + e
      }

      if (e.charAt(0) === '/' && !this.nomount) {
        e = path.join(this.root, e)
      }
      this._emitMatch(index, e)
    }
    // This was the last one, and no stats were needed
    return cb()
  }

  // now test all matched entries as stand-ins for that part
  // of the pattern.
  remain.shift()
  for (var i = 0; i < len; i ++) {
    var e = matchedEntries[i]
    var newPattern
    if (prefix) {
      if (prefix !== '/')
        e = prefix + '/' + e
      else
        e = prefix + e
    }
    this._process([e].concat(remain), index, inGlobStar, cb)
  }
  cb()
}

Glob.prototype._emitMatch = function (index, e) {
  if (this.aborted)
    return

  if (isIgnored(this, e))
    return

  if (this.paused) {
    this._emitQueue.push([index, e])
    return
  }

  var abs = isAbsolute(e) ? e : this._makeAbs(e)

  if (this.mark)
    e = this._mark(e)

  if (this.absolute)
    e = abs

  if (this.matches[index][e])
    return

  if (this.nodir) {
    var c = this.cache[abs]
    if (c === 'DIR' || Array.isArray(c))
      return
  }

  this.matches[index][e] = true

  var st = this.statCache[abs]
  if (st)
    this.emit('stat', e, st)

  this.emit('match', e)
}

Glob.prototype._readdirInGlobStar = function (abs, cb) {
  if (this.aborted)
    return

  // follow all symlinked directories forever
  // just proceed as if this is a non-globstar situation
  if (this.follow)
    return this._readdir(abs, false, cb)

  var lstatkey = 'lstat\0' + abs
  var self = this
  var lstatcb = inflight(lstatkey, lstatcb_)

  if (lstatcb)
    fs.lstat(abs, lstatcb)

  function lstatcb_ (er, lstat) {
    if (er && er.code === 'ENOENT')
      return cb()

    var isSym = lstat && lstat.isSymbolicLink()
    self.symlinks[abs] = isSym

    // If it's not a symlink or a dir, then it's definitely a regular file.
    // don't bother doing a readdir in that case.
    if (!isSym && lstat && !lstat.isDirectory()) {
      self.cache[abs] = 'FILE'
      cb()
    } else
      self._readdir(abs, false, cb)
  }
}

Glob.prototype._readdir = function (abs, inGlobStar, cb) {
  if (this.aborted)
    return

  cb = inflight('readdir\0'+abs+'\0'+inGlobStar, cb)
  if (!cb)
    return

  //console.error('RD %j %j', +inGlobStar, abs)
  if (inGlobStar && !ownProp(this.symlinks, abs))
    return this._readdirInGlobStar(abs, cb)

  if (ownProp(this.cache, abs)) {
    var c = this.cache[abs]
    if (!c || c === 'FILE')
      return cb()

    if (Array.isArray(c))
      return cb(null, c)
  }

  var self = this
  fs.readdir(abs, readdirCb(this, abs, cb))
}

function readdirCb (self, abs, cb) {
  return function (er, entries) {
    if (er)
      self._readdirError(abs, er, cb)
    else
      self._readdirEntries(abs, entries, cb)
  }
}

Glob.prototype._readdirEntries = function (abs, entries, cb) {
  if (this.aborted)
    return

  // if we haven't asked to stat everything, then just
  // assume that everything in there exists, so we can avoid
  // having to stat it a second time.
  if (!this.mark && !this.stat) {
    for (var i = 0; i < entries.length; i ++) {
      var e = entries[i]
      if (abs === '/')
        e = abs + e
      else
        e = abs + '/' + e
      this.cache[e] = true
    }
  }

  this.cache[abs] = entries
  return cb(null, entries)
}

Glob.prototype._readdirError = function (f, er, cb) {
  if (this.aborted)
    return

  // handle errors, and cache the information
  switch (er.code) {
    case 'ENOTSUP': // https://github.com/isaacs/node-glob/issues/205
    case 'ENOTDIR': // totally normal. means it *does* exist.
      var abs = this._makeAbs(f)
      this.cache[abs] = 'FILE'
      if (abs === this.cwdAbs) {
        var error = new Error(er.code + ' invalid cwd ' + this.cwd)
        error.path = this.cwd
        error.code = er.code
        this.emit('error', error)
        this.abort()
      }
      break

    case 'ENOENT': // not terribly unusual
    case 'ELOOP':
    case 'ENAMETOOLONG':
    case 'UNKNOWN':
      this.cache[this._makeAbs(f)] = false
      break

    default: // some unusual error.  Treat as failure.
      this.cache[this._makeAbs(f)] = false
      if (this.strict) {
        this.emit('error', er)
        // If the error is handled, then we abort
        // if not, we threw out of here
        this.abort()
      }
      if (!this.silent)
        console.error('glob error', er)
      break
  }

  return cb()
}

Glob.prototype._processGlobStar = function (prefix, read, abs, remain, index, inGlobStar, cb) {
  var self = this
  this._readdir(abs, inGlobStar, function (er, entries) {
    self._processGlobStar2(prefix, read, abs, remain, index, inGlobStar, entries, cb)
  })
}


Glob.prototype._processGlobStar2 = function (prefix, read, abs, remain, index, inGlobStar, entries, cb) {
  //console.error('pgs2', prefix, remain[0], entries)

  // no entries means not a dir, so it can never have matches
  // foo.txt/** doesn't match foo.txt
  if (!entries)
    return cb()

  // test without the globstar, and with every child both below
  // and replacing the globstar.
  var remainWithoutGlobStar = remain.slice(1)
  var gspref = prefix ? [ prefix ] : []
  var noGlobStar = gspref.concat(remainWithoutGlobStar)

  // the noGlobStar pattern exits the inGlobStar state
  this._process(noGlobStar, index, false, cb)

  var isSym = this.symlinks[abs]
  var len = entries.length

  // If it's a symlink, and we're in a globstar, then stop
  if (isSym && inGlobStar)
    return cb()

  for (var i = 0; i < len; i++) {
    var e = entries[i]
    if (e.charAt(0) === '.' && !this.dot)
      continue

    // these two cases enter the inGlobStar state
    var instead = gspref.concat(entries[i], remainWithoutGlobStar)
    this._process(instead, index, true, cb)

    var below = gspref.concat(entries[i], remain)
    this._process(below, index, true, cb)
  }

  cb()
}

Glob.prototype._processSimple = function (prefix, index, cb) {
  // XXX review this.  Shouldn't it be doing the mounting etc
  // before doing stat?  kinda weird?
  var self = this
  this._stat(prefix, function (er, exists) {
    self._processSimple2(prefix, index, er, exists, cb)
  })
}
Glob.prototype._processSimple2 = function (prefix, index, er, exists, cb) {

  //console.error('ps2', prefix, exists)

  if (!this.matches[index])
    this.matches[index] = Object.create(null)

  // If it doesn't exist, then just mark the lack of results
  if (!exists)
    return cb()

  if (prefix && isAbsolute(prefix) && !this.nomount) {
    var trail = /[\/\\]$/.test(prefix)
    if (prefix.charAt(0) === '/') {
      prefix = path.join(this.root, prefix)
    } else {
      prefix = path.resolve(this.root, prefix)
      if (trail)
        prefix += '/'
    }
  }

  if (process.platform === 'win32')
    prefix = prefix.replace(/\\/g, '/')

  // Mark this as a match
  this._emitMatch(index, prefix)
  cb()
}

// Returns either 'DIR', 'FILE', or false
Glob.prototype._stat = function (f, cb) {
  var abs = this._makeAbs(f)
  var needDir = f.slice(-1) === '/'

  if (f.length > this.maxLength)
    return cb()

  if (!this.stat && ownProp(this.cache, abs)) {
    var c = this.cache[abs]

    if (Array.isArray(c))
      c = 'DIR'

    // It exists, but maybe not how we need it
    if (!needDir || c === 'DIR')
      return cb(null, c)

    if (needDir && c === 'FILE')
      return cb()

    // otherwise we have to stat, because maybe c=true
    // if we know it exists, but not what it is.
  }

  var exists
  var stat = this.statCache[abs]
  if (stat !== undefined) {
    if (stat === false)
      return cb(null, stat)
    else {
      var type = stat.isDirectory() ? 'DIR' : 'FILE'
      if (needDir && type === 'FILE')
        return cb()
      else
        return cb(null, type, stat)
    }
  }

  var self = this
  var statcb = inflight('stat\0' + abs, lstatcb_)
  if (statcb)
    fs.lstat(abs, statcb)

  function lstatcb_ (er, lstat) {
    if (lstat && lstat.isSymbolicLink()) {
      // If it's a symlink, then treat it as the target, unless
      // the target does not exist, then treat it as a file.
      return fs.stat(abs, function (er, stat) {
        if (er)
          self._stat2(f, abs, null, lstat, cb)
        else
          self._stat2(f, abs, er, stat, cb)
      })
    } else {
      self._stat2(f, abs, er, lstat, cb)
    }
  }
}

Glob.prototype._stat2 = function (f, abs, er, stat, cb) {
  if (er && (er.code === 'ENOENT' || er.code === 'ENOTDIR')) {
    this.statCache[abs] = false
    return cb()
  }

  var needDir = f.slice(-1) === '/'
  this.statCache[abs] = stat

  if (abs.slice(-1) === '/' && stat && !stat.isDirectory())
    return cb(null, false, stat)

  var c = true
  if (stat)
    c = stat.isDirectory() ? 'DIR' : 'FILE'
  this.cache[abs] = this.cache[abs] || c

  if (needDir && c === 'FILE')
    return cb()

  return cb(null, c, stat)
}


/***/ }),

/***/ 9010:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = globSync
globSync.GlobSync = GlobSync

var fs = __webpack_require__(5747)
var rp = __webpack_require__(6863)
var minimatch = __webpack_require__(3973)
var Minimatch = minimatch.Minimatch
var Glob = __webpack_require__(1957).Glob
var util = __webpack_require__(1669)
var path = __webpack_require__(5622)
var assert = __webpack_require__(2357)
var isAbsolute = __webpack_require__(8714)
var common = __webpack_require__(7625)
var alphasort = common.alphasort
var alphasorti = common.alphasorti
var setopts = common.setopts
var ownProp = common.ownProp
var childrenIgnored = common.childrenIgnored
var isIgnored = common.isIgnored

function globSync (pattern, options) {
  if (typeof options === 'function' || arguments.length === 3)
    throw new TypeError('callback provided to sync glob\n'+
                        'See: https://github.com/isaacs/node-glob/issues/167')

  return new GlobSync(pattern, options).found
}

function GlobSync (pattern, options) {
  if (!pattern)
    throw new Error('must provide pattern')

  if (typeof options === 'function' || arguments.length === 3)
    throw new TypeError('callback provided to sync glob\n'+
                        'See: https://github.com/isaacs/node-glob/issues/167')

  if (!(this instanceof GlobSync))
    return new GlobSync(pattern, options)

  setopts(this, pattern, options)

  if (this.noprocess)
    return this

  var n = this.minimatch.set.length
  this.matches = new Array(n)
  for (var i = 0; i < n; i ++) {
    this._process(this.minimatch.set[i], i, false)
  }
  this._finish()
}

GlobSync.prototype._finish = function () {
  assert(this instanceof GlobSync)
  if (this.realpath) {
    var self = this
    this.matches.forEach(function (matchset, index) {
      var set = self.matches[index] = Object.create(null)
      for (var p in matchset) {
        try {
          p = self._makeAbs(p)
          var real = rp.realpathSync(p, self.realpathCache)
          set[real] = true
        } catch (er) {
          if (er.syscall === 'stat')
            set[self._makeAbs(p)] = true
          else
            throw er
        }
      }
    })
  }
  common.finish(this)
}


GlobSync.prototype._process = function (pattern, index, inGlobStar) {
  assert(this instanceof GlobSync)

  // Get the first [n] parts of pattern that are all strings.
  var n = 0
  while (typeof pattern[n] === 'string') {
    n ++
  }
  // now n is the index of the first one that is *not* a string.

  // See if there's anything else
  var prefix
  switch (n) {
    // if not, then this is rather simple
    case pattern.length:
      this._processSimple(pattern.join('/'), index)
      return

    case 0:
      // pattern *starts* with some non-trivial item.
      // going to readdir(cwd), but not include the prefix in matches.
      prefix = null
      break

    default:
      // pattern has some string bits in the front.
      // whatever it starts with, whether that's 'absolute' like /foo/bar,
      // or 'relative' like '../baz'
      prefix = pattern.slice(0, n).join('/')
      break
  }

  var remain = pattern.slice(n)

  // get the list of entries.
  var read
  if (prefix === null)
    read = '.'
  else if (isAbsolute(prefix) || isAbsolute(pattern.join('/'))) {
    if (!prefix || !isAbsolute(prefix))
      prefix = '/' + prefix
    read = prefix
  } else
    read = prefix

  var abs = this._makeAbs(read)

  //if ignored, skip processing
  if (childrenIgnored(this, read))
    return

  var isGlobStar = remain[0] === minimatch.GLOBSTAR
  if (isGlobStar)
    this._processGlobStar(prefix, read, abs, remain, index, inGlobStar)
  else
    this._processReaddir(prefix, read, abs, remain, index, inGlobStar)
}


GlobSync.prototype._processReaddir = function (prefix, read, abs, remain, index, inGlobStar) {
  var entries = this._readdir(abs, inGlobStar)

  // if the abs isn't a dir, then nothing can match!
  if (!entries)
    return

  // It will only match dot entries if it starts with a dot, or if
  // dot is set.  Stuff like @(.foo|.bar) isn't allowed.
  var pn = remain[0]
  var negate = !!this.minimatch.negate
  var rawGlob = pn._glob
  var dotOk = this.dot || rawGlob.charAt(0) === '.'

  var matchedEntries = []
  for (var i = 0; i < entries.length; i++) {
    var e = entries[i]
    if (e.charAt(0) !== '.' || dotOk) {
      var m
      if (negate && !prefix) {
        m = !e.match(pn)
      } else {
        m = e.match(pn)
      }
      if (m)
        matchedEntries.push(e)
    }
  }

  var len = matchedEntries.length
  // If there are no matched entries, then nothing matches.
  if (len === 0)
    return

  // if this is the last remaining pattern bit, then no need for
  // an additional stat *unless* the user has specified mark or
  // stat explicitly.  We know they exist, since readdir returned
  // them.

  if (remain.length === 1 && !this.mark && !this.stat) {
    if (!this.matches[index])
      this.matches[index] = Object.create(null)

    for (var i = 0; i < len; i ++) {
      var e = matchedEntries[i]
      if (prefix) {
        if (prefix.slice(-1) !== '/')
          e = prefix + '/' + e
        else
          e = prefix + e
      }

      if (e.charAt(0) === '/' && !this.nomount) {
        e = path.join(this.root, e)
      }
      this._emitMatch(index, e)
    }
    // This was the last one, and no stats were needed
    return
  }

  // now test all matched entries as stand-ins for that part
  // of the pattern.
  remain.shift()
  for (var i = 0; i < len; i ++) {
    var e = matchedEntries[i]
    var newPattern
    if (prefix)
      newPattern = [prefix, e]
    else
      newPattern = [e]
    this._process(newPattern.concat(remain), index, inGlobStar)
  }
}


GlobSync.prototype._emitMatch = function (index, e) {
  if (isIgnored(this, e))
    return

  var abs = this._makeAbs(e)

  if (this.mark)
    e = this._mark(e)

  if (this.absolute) {
    e = abs
  }

  if (this.matches[index][e])
    return

  if (this.nodir) {
    var c = this.cache[abs]
    if (c === 'DIR' || Array.isArray(c))
      return
  }

  this.matches[index][e] = true

  if (this.stat)
    this._stat(e)
}


GlobSync.prototype._readdirInGlobStar = function (abs) {
  // follow all symlinked directories forever
  // just proceed as if this is a non-globstar situation
  if (this.follow)
    return this._readdir(abs, false)

  var entries
  var lstat
  var stat
  try {
    lstat = fs.lstatSync(abs)
  } catch (er) {
    if (er.code === 'ENOENT') {
      // lstat failed, doesn't exist
      return null
    }
  }

  var isSym = lstat && lstat.isSymbolicLink()
  this.symlinks[abs] = isSym

  // If it's not a symlink or a dir, then it's definitely a regular file.
  // don't bother doing a readdir in that case.
  if (!isSym && lstat && !lstat.isDirectory())
    this.cache[abs] = 'FILE'
  else
    entries = this._readdir(abs, false)

  return entries
}

GlobSync.prototype._readdir = function (abs, inGlobStar) {
  var entries

  if (inGlobStar && !ownProp(this.symlinks, abs))
    return this._readdirInGlobStar(abs)

  if (ownProp(this.cache, abs)) {
    var c = this.cache[abs]
    if (!c || c === 'FILE')
      return null

    if (Array.isArray(c))
      return c
  }

  try {
    return this._readdirEntries(abs, fs.readdirSync(abs))
  } catch (er) {
    this._readdirError(abs, er)
    return null
  }
}

GlobSync.prototype._readdirEntries = function (abs, entries) {
  // if we haven't asked to stat everything, then just
  // assume that everything in there exists, so we can avoid
  // having to stat it a second time.
  if (!this.mark && !this.stat) {
    for (var i = 0; i < entries.length; i ++) {
      var e = entries[i]
      if (abs === '/')
        e = abs + e
      else
        e = abs + '/' + e
      this.cache[e] = true
    }
  }

  this.cache[abs] = entries

  // mark and cache dir-ness
  return entries
}

GlobSync.prototype._readdirError = function (f, er) {
  // handle errors, and cache the information
  switch (er.code) {
    case 'ENOTSUP': // https://github.com/isaacs/node-glob/issues/205
    case 'ENOTDIR': // totally normal. means it *does* exist.
      var abs = this._makeAbs(f)
      this.cache[abs] = 'FILE'
      if (abs === this.cwdAbs) {
        var error = new Error(er.code + ' invalid cwd ' + this.cwd)
        error.path = this.cwd
        error.code = er.code
        throw error
      }
      break

    case 'ENOENT': // not terribly unusual
    case 'ELOOP':
    case 'ENAMETOOLONG':
    case 'UNKNOWN':
      this.cache[this._makeAbs(f)] = false
      break

    default: // some unusual error.  Treat as failure.
      this.cache[this._makeAbs(f)] = false
      if (this.strict)
        throw er
      if (!this.silent)
        console.error('glob error', er)
      break
  }
}

GlobSync.prototype._processGlobStar = function (prefix, read, abs, remain, index, inGlobStar) {

  var entries = this._readdir(abs, inGlobStar)

  // no entries means not a dir, so it can never have matches
  // foo.txt/** doesn't match foo.txt
  if (!entries)
    return

  // test without the globstar, and with every child both below
  // and replacing the globstar.
  var remainWithoutGlobStar = remain.slice(1)
  var gspref = prefix ? [ prefix ] : []
  var noGlobStar = gspref.concat(remainWithoutGlobStar)

  // the noGlobStar pattern exits the inGlobStar state
  this._process(noGlobStar, index, false)

  var len = entries.length
  var isSym = this.symlinks[abs]

  // If it's a symlink, and we're in a globstar, then stop
  if (isSym && inGlobStar)
    return

  for (var i = 0; i < len; i++) {
    var e = entries[i]
    if (e.charAt(0) === '.' && !this.dot)
      continue

    // these two cases enter the inGlobStar state
    var instead = gspref.concat(entries[i], remainWithoutGlobStar)
    this._process(instead, index, true)

    var below = gspref.concat(entries[i], remain)
    this._process(below, index, true)
  }
}

GlobSync.prototype._processSimple = function (prefix, index) {
  // XXX review this.  Shouldn't it be doing the mounting etc
  // before doing stat?  kinda weird?
  var exists = this._stat(prefix)

  if (!this.matches[index])
    this.matches[index] = Object.create(null)

  // If it doesn't exist, then just mark the lack of results
  if (!exists)
    return

  if (prefix && isAbsolute(prefix) && !this.nomount) {
    var trail = /[\/\\]$/.test(prefix)
    if (prefix.charAt(0) === '/') {
      prefix = path.join(this.root, prefix)
    } else {
      prefix = path.resolve(this.root, prefix)
      if (trail)
        prefix += '/'
    }
  }

  if (process.platform === 'win32')
    prefix = prefix.replace(/\\/g, '/')

  // Mark this as a match
  this._emitMatch(index, prefix)
}

// Returns either 'DIR', 'FILE', or false
GlobSync.prototype._stat = function (f) {
  var abs = this._makeAbs(f)
  var needDir = f.slice(-1) === '/'

  if (f.length > this.maxLength)
    return false

  if (!this.stat && ownProp(this.cache, abs)) {
    var c = this.cache[abs]

    if (Array.isArray(c))
      c = 'DIR'

    // It exists, but maybe not how we need it
    if (!needDir || c === 'DIR')
      return c

    if (needDir && c === 'FILE')
      return false

    // otherwise we have to stat, because maybe c=true
    // if we know it exists, but not what it is.
  }

  var exists
  var stat = this.statCache[abs]
  if (!stat) {
    var lstat
    try {
      lstat = fs.lstatSync(abs)
    } catch (er) {
      if (er && (er.code === 'ENOENT' || er.code === 'ENOTDIR')) {
        this.statCache[abs] = false
        return false
      }
    }

    if (lstat && lstat.isSymbolicLink()) {
      try {
        stat = fs.statSync(abs)
      } catch (er) {
        stat = lstat
      }
    } else {
      stat = lstat
    }
  }

  this.statCache[abs] = stat

  var c = true
  if (stat)
    c = stat.isDirectory() ? 'DIR' : 'FILE'

  this.cache[abs] = this.cache[abs] || c

  if (needDir && c === 'FILE')
    return false

  return c
}

GlobSync.prototype._mark = function (p) {
  return common.mark(this, p)
}

GlobSync.prototype._makeAbs = function (f) {
  return common.makeAbs(this, f)
}


/***/ }),

/***/ 2492:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var wrappy = __webpack_require__(2940)
var reqs = Object.create(null)
var once = __webpack_require__(1223)

module.exports = wrappy(inflight)

function inflight (key, cb) {
  if (reqs[key]) {
    reqs[key].push(cb)
    return null
  } else {
    reqs[key] = [cb]
    return makeres(key)
  }
}

function makeres (key) {
  return once(function RES () {
    var cbs = reqs[key]
    var len = cbs.length
    var args = slice(arguments)

    // XXX It's somewhat ambiguous whether a new callback added in this
    // pass should be queued for later execution if something in the
    // list of callbacks throws, or if it should just be discarded.
    // However, it's such an edge case that it hardly matters, and either
    // choice is likely as surprising as the other.
    // As it happens, we do go ahead and schedule it for later execution.
    try {
      for (var i = 0; i < len; i++) {
        cbs[i].apply(null, args)
      }
    } finally {
      if (cbs.length > len) {
        // added more in the interim.
        // de-zalgo, just in case, but don't call again.
        cbs.splice(0, len)
        process.nextTick(function () {
          RES.apply(null, args)
        })
      } else {
        delete reqs[key]
      }
    }
  })
}

function slice (args) {
  var length = args.length
  var array = []

  for (var i = 0; i < length; i++) array[i] = args[i]
  return array
}


/***/ }),

/***/ 4124:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

try {
  var util = __webpack_require__(1669);
  /* istanbul ignore next */
  if (typeof util.inherits !== 'function') throw '';
  module.exports = util.inherits;
} catch (e) {
  /* istanbul ignore next */
  module.exports = __webpack_require__(8544);
}


/***/ }),

/***/ 8544:
/***/ ((module) => {

if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    if (superCtor) {
      ctor.super_ = superCtor
      ctor.prototype = Object.create(superCtor.prototype, {
        constructor: {
          value: ctor,
          enumerable: false,
          writable: true,
          configurable: true
        }
      })
    }
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    if (superCtor) {
      ctor.super_ = superCtor
      var TempCtor = function () {}
      TempCtor.prototype = superCtor.prototype
      ctor.prototype = new TempCtor()
      ctor.prototype.constructor = ctor
    }
  }
}


/***/ }),

/***/ 9568:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


module.exports = __webpack_require__(8494);
module.exports.sync = __webpack_require__(1960);
module.exports.promise = __webpack_require__(9963);


/***/ }),

/***/ 8494:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


const glob = __webpack_require__(9963);

module.exports = (patterns, options, callback) => {
  if (typeof options === 'function') {
    callback = options;
    options = void 0;
  }

  const promise = glob(patterns, options);

  if (typeof callback === 'function') {
    promise.then(files => callback(null, files)).catch(callback);
    return;
  }

  return promise;
};


/***/ }),

/***/ 9963:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


const path = __webpack_require__(5622);
const utils = __webpack_require__(820);
const { Glob } = __webpack_require__(1957);

const glob = (pattern, options) => {
  const onMatch = utils.onMatch(pattern, options);

  return new Promise((resolve, reject) => {
    const globber = new Glob(pattern, options, (err, files) => {
      globber.off('match', onMatch);

      if (err) {
        reject(err);
      } else {
        resolve(files);
      }
    });

    globber.on('match', onMatch);
  });
};

module.exports = async (patterns, options) => {
  const { expand, getPaths, sift, setIgnores } = utils;
  patterns = [].concat(patterns || []);

  const opts = { cwd: '.', nosort: true, ...options };
  opts.cwd = path.resolve(expand(opts.cwd));

  const sifted = sift(patterns, opts);
  if (sifted === null) {
    return Promise.reject(new Error('invalid glob pattern: ' + patterns));
  }

  if (sifted.globs === 0) {
    return Promise.resolve(getPaths(patterns, opts));
  }

  const { excludes, includes } = sifted;
  const config = include => setIgnores(opts, excludes, include.index);
  const pending = [];
  const files = [];

  const onFiles = options => {
    return dirents => {
      files.push(...dirents);

      if (options.onFiles) {
        return options.onFiles(dirents, options);
      }
    };
  };

  for (const include of includes) {
    const opt = config(include);
    pending.push(glob(include.pattern, opt).then(onFiles(opt)));
  }

  return Promise.all(pending).then(() => files);
};


/***/ }),

/***/ 1960:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


const path = __webpack_require__(5622);
const glob = __webpack_require__(1957);
const utils = __webpack_require__(820);

module.exports = (patterns, options) => {
  const { expand, getPaths, sift, setIgnores } = utils;
  patterns = [].concat(patterns || []);

  // shallow clone options
  const opts = { cwd: '.', nosort: true, ...options };
  opts.cwd = path.resolve(expand(opts.cwd));

  const sifted = sift(patterns, opts);
  if (sifted === null) {
    throw new Error('invalid glob pattern: ' + patterns);
  }

  if (sifted.globs === 0) {
    return getPaths(patterns, opts);
  }

  const { excludes, includes } = sifted;
  const config = include => setIgnores(opts, excludes, include.index);
  const files = [];

  for (const include of includes) {
    const dirOpts = config(include);

    // simulate onMatch, for parity with async
    const dirents = glob.sync(include.pattern, dirOpts);
    const onMatch = utils.onMatch(include.pattern, options);
    dirents.forEach(dirent => {
      files.push(dirent);
      onMatch(dirent);
    });

    if (dirOpts.onFiles) {
      dirOpts.onFiles(dirents, dirOpts);
    }
  }
  return files;
};


/***/ }),

/***/ 820:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


const fs = __webpack_require__(5747);
const os = __webpack_require__(2087);
const path = __webpack_require__(5622);
const picomatch = __webpack_require__(8569);
const union = (...args) => [...new Set([].concat.apply([], args).filter(Boolean))];

/**
 * Expand tilde
 */

exports.expand = str => str.replace(/^~/, os.homedir());

/**
 * Sift glob patterns into inclusive and exclusive patterns.
 *
 * @param {String|Array} `patterns`
 * @param {Object} opts
 * @return {Object}
 */

exports.sift = (patterns, options = {}) => {
  const results = { includes: [], excludes: [], globs: 0 };
  let index = 0;

  for (const pattern of [].concat(patterns || [])) {
    if (typeof pattern !== 'string') return null;
    const res = picomatch.scan(pattern);
    res.pattern = path.posix.join(res.base, res.glob);
    res.index = index++;

    if (res.isGlob) results.globs++;
    if (options.relative) {
      res.pattern = exports.toRelative(res.pattern, options);
      delete options.cwd;
    }

    if (res.negated) {
      results.excludes.push(res);
    } else {
      results.includes.push(res);
    }
  }
  return results;
};

/**
 * Set the index of ignore patterns based on their position
 * in an array of globs.
 *
 * @param {Object} `options`
 * @param {Array} `excludes`
 * @param {Number} `inclusiveIndex`
 */

exports.setIgnores = (options, excludes, inclusiveIndex) => {
  const opts = Object.assign({}, options);
  const negations = [];

  for (const exclusive of excludes) {
    if (exclusive.index > inclusiveIndex) {
      negations.push(exclusive.pattern);
    }
  }

  opts.ignore = union([], opts.ignore, negations);
  return opts;
};

/**
 * Make a glob pattern relative.
 *
 * @param {String} `pattern`
 * @param {Object} `opts`
 * @return {String}
 */

exports.toRelative = (pattern, opts) => {
  return path.relative(process.cwd(), path.resolve(exports.expand(opts.cwd), pattern));
};

/**
 * Create an event listener for .on('match', ...).
 *
 * @param {String} pattern
 * @param {Object} options
 * @return {Function}
 */

exports.onMatch = (pattern, options) => {
  return filepath => {
    if (options && typeof options.onMatch === 'function') {
      options.onMatch({ pattern, options, path: filepath });
    }
  };
};

/**
 * Get paths from non-glob patterns
 *
 * @param {Array} `paths`
 * @param {Object} `opts`
 * @return {Array}
 */

exports.getPaths = (paths, options = {}) => {
  const resolve = fp => path.resolve(exports.expand(options.cwd), fp);
  const result = [];

  for (const filepath of paths) {
    const onMatch = exports.onMatch(filepath, options);
    const absolute = resolve(filepath);
    let resolved = filepath;

    if (options.absolute) {
      resolved = absolute;
    }

    if (options.realpath) {
      try {
        resolved = fs.realpathSync(absolute);
      } catch (err) {
        continue;
      }
    }

    if (!fs.existsSync(absolute)) {
      continue;
    }

    if (options.onMatch) {
      onMatch(resolved);
    }

    result.push(resolved);
  }

  if (options.onFiles) {
    options.onFiles(result, options);
  }

  return result;
};


/***/ }),

/***/ 3973:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = minimatch
minimatch.Minimatch = Minimatch

var path = { sep: '/' }
try {
  path = __webpack_require__(5622)
} catch (er) {}

var GLOBSTAR = minimatch.GLOBSTAR = Minimatch.GLOBSTAR = {}
var expand = __webpack_require__(3717)

var plTypes = {
  '!': { open: '(?:(?!(?:', close: '))[^/]*?)'},
  '?': { open: '(?:', close: ')?' },
  '+': { open: '(?:', close: ')+' },
  '*': { open: '(?:', close: ')*' },
  '@': { open: '(?:', close: ')' }
}

// any single thing other than /
// don't need to escape / when using new RegExp()
var qmark = '[^/]'

// * => any number of characters
var star = qmark + '*?'

// ** when dots are allowed.  Anything goes, except .. and .
// not (^ or / followed by one or two dots followed by $ or /),
// followed by anything, any number of times.
var twoStarDot = '(?:(?!(?:\\\/|^)(?:\\.{1,2})($|\\\/)).)*?'

// not a ^ or / followed by a dot,
// followed by anything, any number of times.
var twoStarNoDot = '(?:(?!(?:\\\/|^)\\.).)*?'

// characters that need to be escaped in RegExp.
var reSpecials = charSet('().*{}+?[]^$\\!')

// "abc" -> { a:true, b:true, c:true }
function charSet (s) {
  return s.split('').reduce(function (set, c) {
    set[c] = true
    return set
  }, {})
}

// normalizes slashes.
var slashSplit = /\/+/

minimatch.filter = filter
function filter (pattern, options) {
  options = options || {}
  return function (p, i, list) {
    return minimatch(p, pattern, options)
  }
}

function ext (a, b) {
  a = a || {}
  b = b || {}
  var t = {}
  Object.keys(b).forEach(function (k) {
    t[k] = b[k]
  })
  Object.keys(a).forEach(function (k) {
    t[k] = a[k]
  })
  return t
}

minimatch.defaults = function (def) {
  if (!def || !Object.keys(def).length) return minimatch

  var orig = minimatch

  var m = function minimatch (p, pattern, options) {
    return orig.minimatch(p, pattern, ext(def, options))
  }

  m.Minimatch = function Minimatch (pattern, options) {
    return new orig.Minimatch(pattern, ext(def, options))
  }

  return m
}

Minimatch.defaults = function (def) {
  if (!def || !Object.keys(def).length) return Minimatch
  return minimatch.defaults(def).Minimatch
}

function minimatch (p, pattern, options) {
  if (typeof pattern !== 'string') {
    throw new TypeError('glob pattern string required')
  }

  if (!options) options = {}

  // shortcut: comments match nothing.
  if (!options.nocomment && pattern.charAt(0) === '#') {
    return false
  }

  // "" only matches ""
  if (pattern.trim() === '') return p === ''

  return new Minimatch(pattern, options).match(p)
}

function Minimatch (pattern, options) {
  if (!(this instanceof Minimatch)) {
    return new Minimatch(pattern, options)
  }

  if (typeof pattern !== 'string') {
    throw new TypeError('glob pattern string required')
  }

  if (!options) options = {}
  pattern = pattern.trim()

  // windows support: need to use /, not \
  if (path.sep !== '/') {
    pattern = pattern.split(path.sep).join('/')
  }

  this.options = options
  this.set = []
  this.pattern = pattern
  this.regexp = null
  this.negate = false
  this.comment = false
  this.empty = false

  // make the set of regexps etc.
  this.make()
}

Minimatch.prototype.debug = function () {}

Minimatch.prototype.make = make
function make () {
  // don't do it more than once.
  if (this._made) return

  var pattern = this.pattern
  var options = this.options

  // empty patterns and comments match nothing.
  if (!options.nocomment && pattern.charAt(0) === '#') {
    this.comment = true
    return
  }
  if (!pattern) {
    this.empty = true
    return
  }

  // step 1: figure out negation, etc.
  this.parseNegate()

  // step 2: expand braces
  var set = this.globSet = this.braceExpand()

  if (options.debug) this.debug = console.error

  this.debug(this.pattern, set)

  // step 3: now we have a set, so turn each one into a series of path-portion
  // matching patterns.
  // These will be regexps, except in the case of "**", which is
  // set to the GLOBSTAR object for globstar behavior,
  // and will not contain any / characters
  set = this.globParts = set.map(function (s) {
    return s.split(slashSplit)
  })

  this.debug(this.pattern, set)

  // glob --> regexps
  set = set.map(function (s, si, set) {
    return s.map(this.parse, this)
  }, this)

  this.debug(this.pattern, set)

  // filter out everything that didn't compile properly.
  set = set.filter(function (s) {
    return s.indexOf(false) === -1
  })

  this.debug(this.pattern, set)

  this.set = set
}

Minimatch.prototype.parseNegate = parseNegate
function parseNegate () {
  var pattern = this.pattern
  var negate = false
  var options = this.options
  var negateOffset = 0

  if (options.nonegate) return

  for (var i = 0, l = pattern.length
    ; i < l && pattern.charAt(i) === '!'
    ; i++) {
    negate = !negate
    negateOffset++
  }

  if (negateOffset) this.pattern = pattern.substr(negateOffset)
  this.negate = negate
}

// Brace expansion:
// a{b,c}d -> abd acd
// a{b,}c -> abc ac
// a{0..3}d -> a0d a1d a2d a3d
// a{b,c{d,e}f}g -> abg acdfg acefg
// a{b,c}d{e,f}g -> abdeg acdeg abdeg abdfg
//
// Invalid sets are not expanded.
// a{2..}b -> a{2..}b
// a{b}c -> a{b}c
minimatch.braceExpand = function (pattern, options) {
  return braceExpand(pattern, options)
}

Minimatch.prototype.braceExpand = braceExpand

function braceExpand (pattern, options) {
  if (!options) {
    if (this instanceof Minimatch) {
      options = this.options
    } else {
      options = {}
    }
  }

  pattern = typeof pattern === 'undefined'
    ? this.pattern : pattern

  if (typeof pattern === 'undefined') {
    throw new TypeError('undefined pattern')
  }

  if (options.nobrace ||
    !pattern.match(/\{.*\}/)) {
    // shortcut. no need to expand.
    return [pattern]
  }

  return expand(pattern)
}

// parse a component of the expanded set.
// At this point, no pattern may contain "/" in it
// so we're going to return a 2d array, where each entry is the full
// pattern, split on '/', and then turned into a regular expression.
// A regexp is made at the end which joins each array with an
// escaped /, and another full one which joins each regexp with |.
//
// Following the lead of Bash 4.1, note that "**" only has special meaning
// when it is the *only* thing in a path portion.  Otherwise, any series
// of * is equivalent to a single *.  Globstar behavior is enabled by
// default, and can be disabled by setting options.noglobstar.
Minimatch.prototype.parse = parse
var SUBPARSE = {}
function parse (pattern, isSub) {
  if (pattern.length > 1024 * 64) {
    throw new TypeError('pattern is too long')
  }

  var options = this.options

  // shortcuts
  if (!options.noglobstar && pattern === '**') return GLOBSTAR
  if (pattern === '') return ''

  var re = ''
  var hasMagic = !!options.nocase
  var escaping = false
  // ? => one single character
  var patternListStack = []
  var negativeLists = []
  var stateChar
  var inClass = false
  var reClassStart = -1
  var classStart = -1
  // . and .. never match anything that doesn't start with .,
  // even when options.dot is set.
  var patternStart = pattern.charAt(0) === '.' ? '' // anything
  // not (start or / followed by . or .. followed by / or end)
  : options.dot ? '(?!(?:^|\\\/)\\.{1,2}(?:$|\\\/))'
  : '(?!\\.)'
  var self = this

  function clearStateChar () {
    if (stateChar) {
      // we had some state-tracking character
      // that wasn't consumed by this pass.
      switch (stateChar) {
        case '*':
          re += star
          hasMagic = true
        break
        case '?':
          re += qmark
          hasMagic = true
        break
        default:
          re += '\\' + stateChar
        break
      }
      self.debug('clearStateChar %j %j', stateChar, re)
      stateChar = false
    }
  }

  for (var i = 0, len = pattern.length, c
    ; (i < len) && (c = pattern.charAt(i))
    ; i++) {
    this.debug('%s\t%s %s %j', pattern, i, re, c)

    // skip over any that are escaped.
    if (escaping && reSpecials[c]) {
      re += '\\' + c
      escaping = false
      continue
    }

    switch (c) {
      case '/':
        // completely not allowed, even escaped.
        // Should already be path-split by now.
        return false

      case '\\':
        clearStateChar()
        escaping = true
      continue

      // the various stateChar values
      // for the "extglob" stuff.
      case '?':
      case '*':
      case '+':
      case '@':
      case '!':
        this.debug('%s\t%s %s %j <-- stateChar', pattern, i, re, c)

        // all of those are literals inside a class, except that
        // the glob [!a] means [^a] in regexp
        if (inClass) {
          this.debug('  in class')
          if (c === '!' && i === classStart + 1) c = '^'
          re += c
          continue
        }

        // if we already have a stateChar, then it means
        // that there was something like ** or +? in there.
        // Handle the stateChar, then proceed with this one.
        self.debug('call clearStateChar %j', stateChar)
        clearStateChar()
        stateChar = c
        // if extglob is disabled, then +(asdf|foo) isn't a thing.
        // just clear the statechar *now*, rather than even diving into
        // the patternList stuff.
        if (options.noext) clearStateChar()
      continue

      case '(':
        if (inClass) {
          re += '('
          continue
        }

        if (!stateChar) {
          re += '\\('
          continue
        }

        patternListStack.push({
          type: stateChar,
          start: i - 1,
          reStart: re.length,
          open: plTypes[stateChar].open,
          close: plTypes[stateChar].close
        })
        // negation is (?:(?!js)[^/]*)
        re += stateChar === '!' ? '(?:(?!(?:' : '(?:'
        this.debug('plType %j %j', stateChar, re)
        stateChar = false
      continue

      case ')':
        if (inClass || !patternListStack.length) {
          re += '\\)'
          continue
        }

        clearStateChar()
        hasMagic = true
        var pl = patternListStack.pop()
        // negation is (?:(?!js)[^/]*)
        // The others are (?:<pattern>)<type>
        re += pl.close
        if (pl.type === '!') {
          negativeLists.push(pl)
        }
        pl.reEnd = re.length
      continue

      case '|':
        if (inClass || !patternListStack.length || escaping) {
          re += '\\|'
          escaping = false
          continue
        }

        clearStateChar()
        re += '|'
      continue

      // these are mostly the same in regexp and glob
      case '[':
        // swallow any state-tracking char before the [
        clearStateChar()

        if (inClass) {
          re += '\\' + c
          continue
        }

        inClass = true
        classStart = i
        reClassStart = re.length
        re += c
      continue

      case ']':
        //  a right bracket shall lose its special
        //  meaning and represent itself in
        //  a bracket expression if it occurs
        //  first in the list.  -- POSIX.2 2.8.3.2
        if (i === classStart + 1 || !inClass) {
          re += '\\' + c
          escaping = false
          continue
        }

        // handle the case where we left a class open.
        // "[z-a]" is valid, equivalent to "\[z-a\]"
        if (inClass) {
          // split where the last [ was, make sure we don't have
          // an invalid re. if so, re-walk the contents of the
          // would-be class to re-translate any characters that
          // were passed through as-is
          // TODO: It would probably be faster to determine this
          // without a try/catch and a new RegExp, but it's tricky
          // to do safely.  For now, this is safe and works.
          var cs = pattern.substring(classStart + 1, i)
          try {
            RegExp('[' + cs + ']')
          } catch (er) {
            // not a valid class!
            var sp = this.parse(cs, SUBPARSE)
            re = re.substr(0, reClassStart) + '\\[' + sp[0] + '\\]'
            hasMagic = hasMagic || sp[1]
            inClass = false
            continue
          }
        }

        // finish up the class.
        hasMagic = true
        inClass = false
        re += c
      continue

      default:
        // swallow any state char that wasn't consumed
        clearStateChar()

        if (escaping) {
          // no need
          escaping = false
        } else if (reSpecials[c]
          && !(c === '^' && inClass)) {
          re += '\\'
        }

        re += c

    } // switch
  } // for

  // handle the case where we left a class open.
  // "[abc" is valid, equivalent to "\[abc"
  if (inClass) {
    // split where the last [ was, and escape it
    // this is a huge pita.  We now have to re-walk
    // the contents of the would-be class to re-translate
    // any characters that were passed through as-is
    cs = pattern.substr(classStart + 1)
    sp = this.parse(cs, SUBPARSE)
    re = re.substr(0, reClassStart) + '\\[' + sp[0]
    hasMagic = hasMagic || sp[1]
  }

  // handle the case where we had a +( thing at the *end*
  // of the pattern.
  // each pattern list stack adds 3 chars, and we need to go through
  // and escape any | chars that were passed through as-is for the regexp.
  // Go through and escape them, taking care not to double-escape any
  // | chars that were already escaped.
  for (pl = patternListStack.pop(); pl; pl = patternListStack.pop()) {
    var tail = re.slice(pl.reStart + pl.open.length)
    this.debug('setting tail', re, pl)
    // maybe some even number of \, then maybe 1 \, followed by a |
    tail = tail.replace(/((?:\\{2}){0,64})(\\?)\|/g, function (_, $1, $2) {
      if (!$2) {
        // the | isn't already escaped, so escape it.
        $2 = '\\'
      }

      // need to escape all those slashes *again*, without escaping the
      // one that we need for escaping the | character.  As it works out,
      // escaping an even number of slashes can be done by simply repeating
      // it exactly after itself.  That's why this trick works.
      //
      // I am sorry that you have to see this.
      return $1 + $1 + $2 + '|'
    })

    this.debug('tail=%j\n   %s', tail, tail, pl, re)
    var t = pl.type === '*' ? star
      : pl.type === '?' ? qmark
      : '\\' + pl.type

    hasMagic = true
    re = re.slice(0, pl.reStart) + t + '\\(' + tail
  }

  // handle trailing things that only matter at the very end.
  clearStateChar()
  if (escaping) {
    // trailing \\
    re += '\\\\'
  }

  // only need to apply the nodot start if the re starts with
  // something that could conceivably capture a dot
  var addPatternStart = false
  switch (re.charAt(0)) {
    case '.':
    case '[':
    case '(': addPatternStart = true
  }

  // Hack to work around lack of negative lookbehind in JS
  // A pattern like: *.!(x).!(y|z) needs to ensure that a name
  // like 'a.xyz.yz' doesn't match.  So, the first negative
  // lookahead, has to look ALL the way ahead, to the end of
  // the pattern.
  for (var n = negativeLists.length - 1; n > -1; n--) {
    var nl = negativeLists[n]

    var nlBefore = re.slice(0, nl.reStart)
    var nlFirst = re.slice(nl.reStart, nl.reEnd - 8)
    var nlLast = re.slice(nl.reEnd - 8, nl.reEnd)
    var nlAfter = re.slice(nl.reEnd)

    nlLast += nlAfter

    // Handle nested stuff like *(*.js|!(*.json)), where open parens
    // mean that we should *not* include the ) in the bit that is considered
    // "after" the negated section.
    var openParensBefore = nlBefore.split('(').length - 1
    var cleanAfter = nlAfter
    for (i = 0; i < openParensBefore; i++) {
      cleanAfter = cleanAfter.replace(/\)[+*?]?/, '')
    }
    nlAfter = cleanAfter

    var dollar = ''
    if (nlAfter === '' && isSub !== SUBPARSE) {
      dollar = '$'
    }
    var newRe = nlBefore + nlFirst + nlAfter + dollar + nlLast
    re = newRe
  }

  // if the re is not "" at this point, then we need to make sure
  // it doesn't match against an empty path part.
  // Otherwise a/* will match a/, which it should not.
  if (re !== '' && hasMagic) {
    re = '(?=.)' + re
  }

  if (addPatternStart) {
    re = patternStart + re
  }

  // parsing just a piece of a larger pattern.
  if (isSub === SUBPARSE) {
    return [re, hasMagic]
  }

  // skip the regexp for non-magical patterns
  // unescape anything in it, though, so that it'll be
  // an exact match against a file etc.
  if (!hasMagic) {
    return globUnescape(pattern)
  }

  var flags = options.nocase ? 'i' : ''
  try {
    var regExp = new RegExp('^' + re + '$', flags)
  } catch (er) {
    // If it was an invalid regular expression, then it can't match
    // anything.  This trick looks for a character after the end of
    // the string, which is of course impossible, except in multi-line
    // mode, but it's not a /m regex.
    return new RegExp('$.')
  }

  regExp._glob = pattern
  regExp._src = re

  return regExp
}

minimatch.makeRe = function (pattern, options) {
  return new Minimatch(pattern, options || {}).makeRe()
}

Minimatch.prototype.makeRe = makeRe
function makeRe () {
  if (this.regexp || this.regexp === false) return this.regexp

  // at this point, this.set is a 2d array of partial
  // pattern strings, or "**".
  //
  // It's better to use .match().  This function shouldn't
  // be used, really, but it's pretty convenient sometimes,
  // when you just want to work with a regex.
  var set = this.set

  if (!set.length) {
    this.regexp = false
    return this.regexp
  }
  var options = this.options

  var twoStar = options.noglobstar ? star
    : options.dot ? twoStarDot
    : twoStarNoDot
  var flags = options.nocase ? 'i' : ''

  var re = set.map(function (pattern) {
    return pattern.map(function (p) {
      return (p === GLOBSTAR) ? twoStar
      : (typeof p === 'string') ? regExpEscape(p)
      : p._src
    }).join('\\\/')
  }).join('|')

  // must match entire pattern
  // ending in a * or ** will make it less strict.
  re = '^(?:' + re + ')$'

  // can match anything, as long as it's not this.
  if (this.negate) re = '^(?!' + re + ').*$'

  try {
    this.regexp = new RegExp(re, flags)
  } catch (ex) {
    this.regexp = false
  }
  return this.regexp
}

minimatch.match = function (list, pattern, options) {
  options = options || {}
  var mm = new Minimatch(pattern, options)
  list = list.filter(function (f) {
    return mm.match(f)
  })
  if (mm.options.nonull && !list.length) {
    list.push(pattern)
  }
  return list
}

Minimatch.prototype.match = match
function match (f, partial) {
  this.debug('match', f, this.pattern)
  // short-circuit in the case of busted things.
  // comments, etc.
  if (this.comment) return false
  if (this.empty) return f === ''

  if (f === '/' && partial) return true

  var options = this.options

  // windows: need to use /, not \
  if (path.sep !== '/') {
    f = f.split(path.sep).join('/')
  }

  // treat the test path as a set of pathparts.
  f = f.split(slashSplit)
  this.debug(this.pattern, 'split', f)

  // just ONE of the pattern sets in this.set needs to match
  // in order for it to be valid.  If negating, then just one
  // match means that we have failed.
  // Either way, return on the first hit.

  var set = this.set
  this.debug(this.pattern, 'set', set)

  // Find the basename of the path by looking for the last non-empty segment
  var filename
  var i
  for (i = f.length - 1; i >= 0; i--) {
    filename = f[i]
    if (filename) break
  }

  for (i = 0; i < set.length; i++) {
    var pattern = set[i]
    var file = f
    if (options.matchBase && pattern.length === 1) {
      file = [filename]
    }
    var hit = this.matchOne(file, pattern, partial)
    if (hit) {
      if (options.flipNegate) return true
      return !this.negate
    }
  }

  // didn't get any hits.  this is success if it's a negative
  // pattern, failure otherwise.
  if (options.flipNegate) return false
  return this.negate
}

// set partial to true to test if, for example,
// "/a/b" matches the start of "/*/b/*/d"
// Partial means, if you run out of file before you run
// out of pattern, then that's fine, as long as all
// the parts match.
Minimatch.prototype.matchOne = function (file, pattern, partial) {
  var options = this.options

  this.debug('matchOne',
    { 'this': this, file: file, pattern: pattern })

  this.debug('matchOne', file.length, pattern.length)

  for (var fi = 0,
      pi = 0,
      fl = file.length,
      pl = pattern.length
      ; (fi < fl) && (pi < pl)
      ; fi++, pi++) {
    this.debug('matchOne loop')
    var p = pattern[pi]
    var f = file[fi]

    this.debug(pattern, p, f)

    // should be impossible.
    // some invalid regexp stuff in the set.
    if (p === false) return false

    if (p === GLOBSTAR) {
      this.debug('GLOBSTAR', [pattern, p, f])

      // "**"
      // a/**/b/**/c would match the following:
      // a/b/x/y/z/c
      // a/x/y/z/b/c
      // a/b/x/b/x/c
      // a/b/c
      // To do this, take the rest of the pattern after
      // the **, and see if it would match the file remainder.
      // If so, return success.
      // If not, the ** "swallows" a segment, and try again.
      // This is recursively awful.
      //
      // a/**/b/**/c matching a/b/x/y/z/c
      // - a matches a
      // - doublestar
      //   - matchOne(b/x/y/z/c, b/**/c)
      //     - b matches b
      //     - doublestar
      //       - matchOne(x/y/z/c, c) -> no
      //       - matchOne(y/z/c, c) -> no
      //       - matchOne(z/c, c) -> no
      //       - matchOne(c, c) yes, hit
      var fr = fi
      var pr = pi + 1
      if (pr === pl) {
        this.debug('** at the end')
        // a ** at the end will just swallow the rest.
        // We have found a match.
        // however, it will not swallow /.x, unless
        // options.dot is set.
        // . and .. are *never* matched by **, for explosively
        // exponential reasons.
        for (; fi < fl; fi++) {
          if (file[fi] === '.' || file[fi] === '..' ||
            (!options.dot && file[fi].charAt(0) === '.')) return false
        }
        return true
      }

      // ok, let's see if we can swallow whatever we can.
      while (fr < fl) {
        var swallowee = file[fr]

        this.debug('\nglobstar while', file, fr, pattern, pr, swallowee)

        // XXX remove this slice.  Just pass the start index.
        if (this.matchOne(file.slice(fr), pattern.slice(pr), partial)) {
          this.debug('globstar found match!', fr, fl, swallowee)
          // found a match.
          return true
        } else {
          // can't swallow "." or ".." ever.
          // can only swallow ".foo" when explicitly asked.
          if (swallowee === '.' || swallowee === '..' ||
            (!options.dot && swallowee.charAt(0) === '.')) {
            this.debug('dot detected!', file, fr, pattern, pr)
            break
          }

          // ** swallows a segment, and continue.
          this.debug('globstar swallow a segment, and continue')
          fr++
        }
      }

      // no match was found.
      // However, in partial mode, we can't say this is necessarily over.
      // If there's more *pattern* left, then
      if (partial) {
        // ran out of file
        this.debug('\n>>> no match, partial?', file, fr, pattern, pr)
        if (fr === fl) return true
      }
      return false
    }

    // something other than **
    // non-magic patterns just have to match exactly
    // patterns with magic have been turned into regexps.
    var hit
    if (typeof p === 'string') {
      if (options.nocase) {
        hit = f.toLowerCase() === p.toLowerCase()
      } else {
        hit = f === p
      }
      this.debug('string match', p, f, hit)
    } else {
      hit = f.match(p)
      this.debug('pattern match', p, f, hit)
    }

    if (!hit) return false
  }

  // Note: ending in / means that we'll get a final ""
  // at the end of the pattern.  This can only match a
  // corresponding "" at the end of the file.
  // If the file ends in /, then it can only match a
  // a pattern that ends in /, unless the pattern just
  // doesn't have any more for it. But, a/b/ should *not*
  // match "a/b/*", even though "" matches against the
  // [^/]*? pattern, except in partial mode, where it might
  // simply not be reached yet.
  // However, a/b/ should still satisfy a/*

  // now either we fell off the end of the pattern, or we're done.
  if (fi === fl && pi === pl) {
    // ran out of pattern and filename at the same time.
    // an exact hit!
    return true
  } else if (fi === fl) {
    // ran out of file, but still had pattern left.
    // this is ok if we're doing the match as part of
    // a glob fs traversal.
    return partial
  } else if (pi === pl) {
    // ran out of pattern, still have file left.
    // this is only acceptable if we're on the very last
    // empty segment of a file with a trailing slash.
    // a/* should match a/b/
    var emptyFileEnd = (fi === fl - 1) && (file[fi] === '')
    return emptyFileEnd
  }

  // should be unreachable.
  throw new Error('wtf?')
}

// replace stuff like \* with *
function globUnescape (s) {
  return s.replace(/\\(.)/g, '$1')
}

function regExpEscape (s) {
  return s.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')
}


/***/ }),

/***/ 1223:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var wrappy = __webpack_require__(2940)
module.exports = wrappy(once)
module.exports.strict = wrappy(onceStrict)

once.proto = once(function () {
  Object.defineProperty(Function.prototype, 'once', {
    value: function () {
      return once(this)
    },
    configurable: true
  })

  Object.defineProperty(Function.prototype, 'onceStrict', {
    value: function () {
      return onceStrict(this)
    },
    configurable: true
  })
})

function once (fn) {
  var f = function () {
    if (f.called) return f.value
    f.called = true
    return f.value = fn.apply(this, arguments)
  }
  f.called = false
  return f
}

function onceStrict (fn) {
  var f = function () {
    if (f.called)
      throw new Error(f.onceError)
    f.called = true
    return f.value = fn.apply(this, arguments)
  }
  var name = fn.name || 'Function wrapped with `once`'
  f.onceError = name + " shouldn't be called more than once"
  f.called = false
  return f
}


/***/ }),

/***/ 8714:
/***/ ((module) => {

"use strict";


function posix(path) {
	return path.charAt(0) === '/';
}

function win32(path) {
	// https://github.com/nodejs/node/blob/b3fcc245fb25539909ef1d5eaa01dbf92e168633/lib/path.js#L56
	var splitDeviceRe = /^([a-zA-Z]:|[\\\/]{2}[^\\\/]+[\\\/]+[^\\\/]+)?([\\\/])?([\s\S]*?)$/;
	var result = splitDeviceRe.exec(path);
	var device = result[1] || '';
	var isUnc = Boolean(device && device.charAt(1) !== ':');

	// UNC paths are always absolute
	return Boolean(result[2] || isUnc);
}

module.exports = process.platform === 'win32' ? win32 : posix;
module.exports.posix = posix;
module.exports.win32 = win32;


/***/ }),

/***/ 1910:
/***/ ((module) => {

module.exports = pathsort
module.exports.standalone = standalone

function pathsort(paths, sep) {
  sep = sep || '/'

  return paths.map(function(el) {
    return el.split(sep)
  }).sort(sorter).map(function(el) {
    return el.join(sep)
  })
}

function sorter(a, b) {
  var l = Math.max(a.length, b.length)
  for (var i = 0; i < l; i += 1) {
    if (!(i in a)) return -1
    if (!(i in b)) return +1
    if (a[i].toUpperCase() > b[i].toUpperCase()) return +1
    if (a[i].toUpperCase() < b[i].toUpperCase()) return -1
    if (a.length < b.length) return -1
    if (a.length > b.length) return +1
  }
}

function standalone(sep) {
  sep = sep || '/'
  return function pathsort(a, b) {
    return sorter(a.split(sep), b.split(sep))
  }
}


/***/ }),

/***/ 5353:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Location = __webpack_require__(6295);
const Position = __webpack_require__(4413);

/**
 * ## Class hierarchy
 *
 * - [Location](#location)
 * - [Position](#position)
 * - [Node](#node)
 *   - [Noop](#noop)
 *   - [NullKeyword](#nullkeyword)
 *   - [StaticVariable](#staticvariable)
 *   - [EncapsedPart](#encapsedpart)
 *   - [Constant](#constant)
 *   - [Identifier](#identifier)
 *   - [Reference](#reference)
 *     - [TypeReference](#typereference)
 *     - [ParentReference](#parentreference)
 *     - [StaticReference](#staticreference)
 *     - [SelfReference](#selfreference)
 *     - [Name](#name)
 *   - [TraitUse](#traituse)
 *   - [TraitAlias](#traitalias)
 *   - [TraitPrecedence](#traitprecedence)
 *   - [Comment](#comment)
 *     - [CommentLine](#commentline)
 *     - [CommentBlock](#commentblock)
 *   - [Error](#error)
 *   - [Expression](#expression)
 *     - [Entry](#entry)
 *     - [ArrowFunc](#arrowfunc)
 *     - [Closure](#closure)
 *     - [ByRef](#byref)
 *     - [Silent](#silent)
 *     - [RetIf](#retif)
 *     - [New](#new)
 *     - [Include](#include)
 *     - [Call](#call)
 *     - [Eval](#eval)
 *     - [Exit](#exit)
 *     - [Clone](#clone)
 *     - [Assign](#assign)
 *     - [AssignRef](#assignref)
 *     - [Array](#array)
 *     - [List](#list)
 *     - [Variable](#variable)
 *     - [Variadic](#variadic)
 *     - [Yield](#yield)
 *     - [YieldFrom](#yieldfrom)
 *     - [Print](#print)
 *     - [Isset](#isset)
 *     - [Empty](#empty)
 *     - [Lookup](#lookup)
 *       - [PropertyLookup](#propertylookup)
 *       - [StaticLookup](#staticlookup)
 *       - [OffsetLookup](#offsetlookup)
 *     - [Operation](#operation)
 *       - [Pre](#pre)
 *       - [Post](#post)
 *       - [Bin](#bin)
 *       - [Unary](#unary)
 *       - [Cast](#cast)
 *     - [Literal](#literal)
 *       - [Boolean](#boolean)
 *       - [String](#string)
 *       - [Number](#number)
 *       - [Inline](#inline)
 *       - [Magic](#magic)
 *       - [Nowdoc](#nowdoc)
 *       - [Encapsed](#encapsed)
 *   - [Statement](#statement)
 *     - [ConstantStatement](#constantstatement)
 *       - [ClassConstant](#classconstant)
 *     - [Return](#return)
 *     - [Label](#label)
 *     - [Continue](#continue)
 *     - [Case](#case)
 *     - [Break](#break)
 *     - [Echo](#echo)
 *     - [Unset](#unset)
 *     - [Halt](#halt)
 *     - [Declare](#declare)
 *     - [Global](#global)
 *     - [Static](#static)
 *     - [If](#if)
 *     - [Do](#do)
 *     - [While](#while)
 *     - [For](#for)
 *     - [Foreach](#foreach)
 *     - [Switch](#switch)
 *     - [Goto](#goto)
 *     - [Try](#try)
 *     - [Catch](#catch)
 *     - [Throw](#throw)
 *     - [UseGroup](#usegroup)
 *     - [UseItem](#useitem)
 *     - [Block](#block)
 *       - [Program](#program)
 *       - [Namespace](#namespace)
 *     - [PropertyStatement](#propertystatement)
 *     - [Property](#property)
 *     - [Declaration](#declaration)
 *       - [Class](#class)
 *       - [Interface](#interface)
 *       - [Trait](#trait)
 *       - [Function](#function)
 *         - [Method](#method)
 *       - [Parameter](#parameter)
 * ---
 */

/**
 * The AST builder class
 * @constructor AST
 * @tutorial AST
 * @property {Boolean} withPositions - Should locate any node (by default false)
 * @property {Boolean} withSource - Should extract the node original code (by default false)
 */
const AST = function (withPositions, withSource) {
  this.withPositions = withPositions;
  this.withSource = withSource;
};

/**
 * Create a position node from specified parser
 * including it's lexer current state
 * @param {Parser}
 * @return {Position}
 * @private
 */
AST.prototype.position = function (parser) {
  return new Position(
    parser.lexer.yylloc.first_line,
    parser.lexer.yylloc.first_column,
    parser.lexer.yylloc.first_offset
  );
};

// operators in ascending order of precedence
AST.precedence = {};
[
  ["or"],
  ["xor"],
  ["and"],
  ["="],
  ["?"],
  ["??"],
  ["||"],
  ["&&"],
  ["|"],
  ["^"],
  ["&"],
  ["==", "!=", "===", "!==", /* '<>', */ "<=>"],
  ["<", "<=", ">", ">="],
  ["<<", ">>"],
  ["+", "-", "."],
  ["*", "/", "%"],
  ["!"],
  ["instanceof"],
  ["cast", "silent"],
  ["**"],
  // TODO: [ (array)
  // TODO: clone, new
].forEach(function (list, index) {
  list.forEach(function (operator) {
    AST.precedence[operator] = index + 1;
  });
});

AST.prototype.isRightAssociative = function (operator) {
  return operator === "**" || operator === "??";
};

/**
 * Change parent node informations after swapping childs
 */
AST.prototype.swapLocations = function (target, first, last, parser) {
  if (this.withPositions) {
    target.loc.start = first.loc.start;
    target.loc.end = last.loc.end;
    if (this.withSource) {
      target.loc.source = parser.lexer._input.substring(
        target.loc.start.offset,
        target.loc.end.offset
      );
    }
  }
};

/**
 * Includes locations from first & last into the target
 */
AST.prototype.resolveLocations = function (target, first, last, parser) {
  if (this.withPositions) {
    if (target.loc.start.offset > first.loc.start.offset) {
      target.loc.start = first.loc.start;
    }
    if (target.loc.end.offset < last.loc.end.offset) {
      target.loc.end = last.loc.end;
    }
    if (this.withSource) {
      target.loc.source = parser.lexer._input.substring(
        target.loc.start.offset,
        target.loc.end.offset
      );
    }
  }
};

/**
 * Check and fix precence, by default using right
 */
AST.prototype.resolvePrecedence = function (result, parser) {
  let buffer, lLevel, rLevel;
  // handling precendence
  if (result.kind === "call") {
    // including what argument into location
    this.resolveLocations(result, result.what, result, parser);
  } else if (
    result.kind === "propertylookup" ||
    result.kind === "staticlookup" ||
    (result.kind === "offsetlookup" && result.offset)
  ) {
    // including what argument into location
    this.resolveLocations(result, result.what, result.offset, parser);
  } else if (result.kind === "bin") {
    if (result.right && !result.right.parenthesizedExpression) {
      if (result.right.kind === "bin") {
        lLevel = AST.precedence[result.type];
        rLevel = AST.precedence[result.right.type];
        if (
          lLevel &&
          rLevel &&
          rLevel <= lLevel &&
          (result.type !== result.right.type ||
            !this.isRightAssociative(result.type))
        ) {
          // https://github.com/glayzzle/php-parser/issues/79
          // shift precedence
          buffer = result.right;
          result.right = result.right.left;
          this.swapLocations(result, result.left, result.right, parser);
          buffer.left = this.resolvePrecedence(result, parser);
          this.swapLocations(buffer, buffer.left, buffer.right, parser);
          result = buffer;
        }
      } else if (result.right.kind === "retif") {
        lLevel = AST.precedence[result.type];
        rLevel = AST.precedence["?"];
        if (lLevel && rLevel && rLevel <= lLevel) {
          buffer = result.right;
          result.right = result.right.test;
          this.swapLocations(result, result.left, result.right, parser);
          buffer.test = this.resolvePrecedence(result, parser);
          this.swapLocations(buffer, buffer.test, buffer.falseExpr, parser);
          result = buffer;
        }
      }
    }
  } else if (
    (result.kind === "silent" || result.kind === "cast") &&
    result.expr &&
    !result.expr.parenthesizedExpression
  ) {
    // https://github.com/glayzzle/php-parser/issues/172
    if (result.expr.kind === "bin") {
      buffer = result.expr;
      result.expr = result.expr.left;
      this.swapLocations(result, result, result.expr, parser);
      buffer.left = this.resolvePrecedence(result, parser);
      this.swapLocations(buffer, buffer.left, buffer.right, parser);
      result = buffer;
    } else if (result.expr.kind === "retif") {
      buffer = result.expr;
      result.expr = result.expr.test;
      this.swapLocations(result, result, result.expr, parser);
      buffer.test = this.resolvePrecedence(result, parser);
      this.swapLocations(buffer, buffer.test, buffer.falseExpr, parser);
      result = buffer;
    }
  } else if (result.kind === "unary") {
    // https://github.com/glayzzle/php-parser/issues/75
    if (result.what && !result.what.parenthesizedExpression) {
      // unary precedence is allways lower
      if (result.what.kind === "bin") {
        buffer = result.what;
        result.what = result.what.left;
        this.swapLocations(result, result, result.what, parser);
        buffer.left = this.resolvePrecedence(result, parser);
        this.swapLocations(buffer, buffer.left, buffer.right, parser);
        result = buffer;
      } else if (result.what.kind === "retif") {
        buffer = result.what;
        result.what = result.what.test;
        this.swapLocations(result, result, result.what, parser);
        buffer.test = this.resolvePrecedence(result, parser);
        this.swapLocations(buffer, buffer.test, buffer.falseExpr, parser);
        result = buffer;
      }
    }
  } else if (result.kind === "retif") {
    // https://github.com/glayzzle/php-parser/issues/77
    if (
      result.falseExpr &&
      result.falseExpr.kind === "retif" &&
      !result.falseExpr.parenthesizedExpression
    ) {
      buffer = result.falseExpr;
      result.falseExpr = buffer.test;
      this.swapLocations(result, result.test, result.falseExpr, parser);
      buffer.test = this.resolvePrecedence(result, parser);
      this.swapLocations(buffer, buffer.test, buffer.falseExpr, parser);
      result = buffer;
    }
  } else if (result.kind === "assign") {
    // https://github.com/glayzzle/php-parser/issues/81
    if (
      result.right &&
      result.right.kind === "bin" &&
      !result.right.parenthesizedExpression
    ) {
      lLevel = AST.precedence["="];
      rLevel = AST.precedence[result.right.type];
      // only shifts with and, xor, or
      if (lLevel && rLevel && rLevel < lLevel) {
        buffer = result.right;
        result.right = result.right.left;
        buffer.left = result;
        this.swapLocations(buffer, buffer.left, result.right, parser);
        result = buffer;
      }
    }
  } else if (result.kind === "expressionstatement") {
    this.swapLocations(result, result.expression, result, parser);
  }
  return result;
};

/**
 * Prepares an AST node
 * @param {String|null} kind - Defines the node type
 * (if null, the kind must be passed at the function call)
 * @param {Parser} parser - The parser instance (use for extracting locations)
 * @return {Function}
 */
AST.prototype.prepare = function (kind, docs, parser) {
  let start = null;
  if (this.withPositions || this.withSource) {
    start = this.position(parser);
  }
  const self = this;
  // returns the node
  const result = function () {
    let location = null;
    const args = Array.prototype.slice.call(arguments);
    args.push(docs);
    if (self.withPositions || self.withSource) {
      let src = null;
      if (self.withSource) {
        src = parser.lexer._input.substring(start.offset, parser.prev[2]);
      }
      // if with source, need location on swapLocations function
      location = new Location(
        src,
        start,
        new Position(parser.prev[0], parser.prev[1], parser.prev[2])
      );
      // last argument is allways the location
      args.push(location);
    }
    // handle lazy kind definitions
    if (!kind) {
      kind = args.shift();
    }
    // build the object
    const node = self[kind];
    if (typeof node !== "function") {
      throw new Error('Undefined node "' + kind + '"');
    }
    const astNode = Object.create(node.prototype);
    node.apply(astNode, args);
    result.instance = astNode;
    if (result.trailingComments) {
      // buffer of trailingComments
      astNode.trailingComments = result.trailingComments;
    }
    if (typeof result.postBuild === "function") {
      result.postBuild(astNode);
    }
    if (parser.debug) {
      delete AST.stack[result.stackUid];
    }
    return self.resolvePrecedence(astNode, parser);
  };
  if (parser.debug) {
    if (!AST.stack) {
      AST.stack = {};
      AST.stackUid = 1;
    }
    AST.stack[++AST.stackUid] = {
      position: start,
      stack: new Error().stack.split("\n").slice(3, 5),
    };
    result.stackUid = AST.stackUid;
  }

  /**
   * Sets a list of trailing comments
   * @param {*} docs
   */
  result.setTrailingComments = function (docs) {
    if (result.instance) {
      // already created
      result.instance.setTrailingComments(docs);
    } else {
      result.trailingComments = docs;
    }
  };

  /**
   * Release a node without using it on the AST
   */
  result.destroy = function (target) {
    if (docs) {
      // release current docs stack
      if (target) {
        if (!target.leadingComments) {
          target.leadingComments = docs;
        } else {
          target.leadingComments = docs.concat(target.leadingComments);
        }
      } else {
        parser._docIndex = parser._docs.length - docs.length;
      }
    }
    if (parser.debug) {
      delete AST.stack[result.stackUid];
    }
  };
  return result;
};

AST.prototype.checkNodes = function () {
  const errors = [];
  for (const k in AST.stack) {
    if (AST.stack.hasOwnProperty(k)) {
      errors.push(AST.stack[k]);
    }
  }
  AST.stack = {};
  return errors;
};

// Define all AST nodes
[
  __webpack_require__(9697),
  __webpack_require__(1723),
  __webpack_require__(6179),
  __webpack_require__(7986),
  __webpack_require__(3745),
  __webpack_require__(1434),
  __webpack_require__(3558),
  __webpack_require__(4515),
  __webpack_require__(1625),
  __webpack_require__(5976),
  __webpack_require__(6183),
  __webpack_require__(8735),
  __webpack_require__(8376),
  __webpack_require__(9468),
  __webpack_require__(4458),
  __webpack_require__(1592),
  __webpack_require__(8029),
  __webpack_require__(7613),
  __webpack_require__(1912),
  __webpack_require__(108),
  __webpack_require__(4499),
  __webpack_require__(4338),
  __webpack_require__(4122),
  __webpack_require__(7508),
  __webpack_require__(3412),
  __webpack_require__(7122),
  __webpack_require__(8685),
  __webpack_require__(6614),
  __webpack_require__(528),
  __webpack_require__(3243),
  __webpack_require__(8641),
  __webpack_require__(837),
  __webpack_require__(1491),
  __webpack_require__(6075),
  __webpack_require__(8463),
  __webpack_require__(8586),
  __webpack_require__(2216),
  __webpack_require__(5285),
  __webpack_require__(366),
  __webpack_require__(7396),
  __webpack_require__(6625),
  __webpack_require__(5166),
  __webpack_require__(2465),
  __webpack_require__(981),
  __webpack_require__(6950),
  __webpack_require__(670),
  __webpack_require__(6410),
  __webpack_require__(6560),
  __webpack_require__(7796),
  __webpack_require__(788),
  __webpack_require__(4265),
  __webpack_require__(5768),
  __webpack_require__(9102),
  __webpack_require__(9727),
  __webpack_require__(7387),
  __webpack_require__(3898),
  __webpack_require__(6497),
  __webpack_require__(8834),
  __webpack_require__(9675),
  __webpack_require__(2664),
  __webpack_require__(629),
  __webpack_require__(8261),
  __webpack_require__(5962),
  __webpack_require__(925),
  __webpack_require__(1155),
  __webpack_require__(1255),
  __webpack_require__(3637),
  __webpack_require__(3477),
  __webpack_require__(5854),
  __webpack_require__(3001),
  __webpack_require__(5567),
  __webpack_require__(8010),
  __webpack_require__(5846),
  __webpack_require__(4021),
  __webpack_require__(8065),
  __webpack_require__(2182),
  __webpack_require__(2051),
  __webpack_require__(6541),
  __webpack_require__(7338),
  __webpack_require__(7198),
  __webpack_require__(6837),
  __webpack_require__(37),
  __webpack_require__(3591),
  __webpack_require__(532),
  __webpack_require__(1914),
  __webpack_require__(3179),
  __webpack_require__(7142),
  __webpack_require__(1354),
  __webpack_require__(3949),
  __webpack_require__(8816),
  __webpack_require__(1874),
  __webpack_require__(2109),
  __webpack_require__(4460),
  __webpack_require__(3937),
  __webpack_require__(2993),
  __webpack_require__(4492),
  __webpack_require__(7081),
  __webpack_require__(5290),
  __webpack_require__(489),
  __webpack_require__(7942),
  __webpack_require__(9712),
  __webpack_require__(7791),
].forEach(function (ctor) {
  AST.prototype[ctor.kind] = ctor;
});

module.exports = AST;


/***/ }),

/***/ 9697:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Expr = __webpack_require__(8586);
const KIND = "array";

/**
 * Defines an array structure
 * @constructor Array
 * @example
 * // PHP code :
 * [1, 'foo' => 'bar', 3]
 *
 * // AST structure :
 * {
 *  "kind": "array",
 *  "shortForm": true
 *  "items": [
 *    {"kind": "number", "value": "1"},
 *    {
 *      "kind": "entry",
 *      "key": {"kind": "string", "value": "foo", "isDoubleQuote": false},
 *      "value": {"kind": "string", "value": "bar", "isDoubleQuote": false}
 *    },
 *    {"kind": "number", "value": "3"}
 *  ]
 * }
 * @extends {Expression}
 * @property {Entry|Expr|Variable} items List of array items
 * @property {boolean} shortForm Indicate if the short array syntax is used, ex `[]` instead `array()`
 */
module.exports = Expr.extends(KIND, function Array(
  shortForm,
  items,
  docs,
  location
) {
  Expr.apply(this, [KIND, docs, location]);
  this.items = items;
  this.shortForm = shortForm;
});


/***/ }),

/***/ 1723:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Expression = __webpack_require__(8586);
const KIND = "arrowfunc";

/**
 * Defines an arrow function (it's like a closure)
 * @constructor ArrowFunc
 * @extends {Expression}
 * @property {Parameter[]} arguments
 * @property {Identifier} type
 * @property {Expression} body
 * @property {boolean} byref
 * @property {boolean} nullable
 * @property {boolean} isStatic
 */
module.exports = Expression.extends(KIND, function Closure(
  args,
  byref,
  body,
  type,
  nullable,
  isStatic,
  docs,
  location
) {
  Expression.apply(this, [KIND, docs, location]);
  this.arguments = args;
  this.byref = byref;
  this.body = body;
  this.type = type;
  this.nullable = nullable;
  this.isStatic = isStatic || false;
});


/***/ }),

/***/ 6179:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Expression = __webpack_require__(8586);
const KIND = "assign";

/**
 * Assigns a value to the specified target
 * @constructor Assign
 * @extends {Expression}
 * @property {Expression} left
 * @property {Expression} right
 * @property {String} operator
 */
module.exports = Expression.extends(KIND, function Assign(
  left,
  right,
  operator,
  docs,
  location
) {
  Expression.apply(this, [KIND, docs, location]);
  this.left = left;
  this.right = right;
  this.operator = operator;
});


/***/ }),

/***/ 7986:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Expression = __webpack_require__(8586);
const KIND = "assignref";

/**
 * Assigns a value to the specified target
 * @constructor Assign
 * @extends {Expression}
 * @property {Expression} left
 * @property {Expression} right
 * @property {String} operator
 */
module.exports = Expression.extends(KIND, function AssignRef(
  left,
  right,
  docs,
  location
) {
  Expression.apply(this, [KIND, docs, location]);
  this.left = left;
  this.right = right;
});


/***/ }),

/***/ 3745:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Operation = __webpack_require__(1155);
const KIND = "bin";
/**
 * Binary operations
 * @constructor Bin
 * @extends {Operation}
 * @property {String} type
 * @property {Expression} left
 * @property {Expression} right
 */
module.exports = Operation.extends(KIND, function Bin(
  type,
  left,
  right,
  docs,
  location
) {
  Operation.apply(this, [KIND, docs, location]);
  this.type = type;
  this.left = left;
  this.right = right;
});


/***/ }),

/***/ 1434:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Statement = __webpack_require__(7198);
const KIND = "block";

/**
 * A block statement, i.e., a sequence of statements surrounded by braces.
 * @constructor Block
 * @extends {Statement}
 * @property {Node[]} children
 */
module.exports = Statement.extends(KIND, function Block(
  kind,
  children,
  docs,
  location
) {
  Statement.apply(this, [kind || KIND, docs, location]);
  this.children = children.filter(Boolean);
});


/***/ }),

/***/ 3558:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Literal = __webpack_require__(5768);
const KIND = "boolean";

/**
 * Defines a boolean value (true/false)
 * @constructor Boolean
 * @extends {Literal}
 */
module.exports = Literal.extends(KIND, function Boolean(
  value,
  raw,
  docs,
  location
) {
  Literal.apply(this, [KIND, value, raw, docs, location]);
});


/***/ }),

/***/ 4515:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Statement = __webpack_require__(7198);
const KIND = "break";

/**
 * A break statement
 * @constructor Break
 * @extends {Statement}
 * @property {Number|Null} level
 */
module.exports = Statement.extends(KIND, function Break(level, docs, location) {
  Statement.apply(this, [KIND, docs, location]);
  this.level = level;
});


/***/ }),

/***/ 1625:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Expression = __webpack_require__(8586);
const KIND = "byref";

/**
 * Passing by Reference - so the function can modify the variable
 * @constructor ByRef
 * @extends {Expression}
 * @property {expr} what
 */
module.exports = Expression.extends(KIND, function ByRef(what, docs, location) {
  Expression.apply(this, [KIND, docs, location]);
  this.what = what;
});


/***/ }),

/***/ 5976:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Expression = __webpack_require__(8586);
const KIND = "call";

/**
 * Executes a call statement
 * @constructor Call
 * @extends {Expression}
 * @property {Identifier|Variable|??} what
 * @property {Arguments[]} arguments
 */
module.exports = Expression.extends(KIND, function Call(
  what,
  args,
  docs,
  location
) {
  Expression.apply(this, [KIND, docs, location]);
  this.what = what;
  this.arguments = args;
});


/***/ }),

/***/ 6183:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Statement = __webpack_require__(7198);
const KIND = "case";

/**
 * A switch case statement
 * @constructor Case
 * @extends {Statement}
 * @property {Expression|null} test - if null, means that the default case
 * @property {Block|null} body
 */
module.exports = Statement.extends(KIND, function Case(
  test,
  body,
  docs,
  location
) {
  Statement.apply(this, [KIND, docs, location]);
  this.test = test;
  this.body = body;
});


/***/ }),

/***/ 8735:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Operation = __webpack_require__(1155);
const KIND = "cast";

/**
 * Binary operations
 * @constructor Cast
 * @extends {Operation}
 * @property {String} type
 * @property {String} raw
 * @property {Expression} expr
 */
module.exports = Operation.extends(KIND, function Cast(
  type,
  raw,
  expr,
  docs,
  location
) {
  Operation.apply(this, [KIND, docs, location]);
  this.type = type;
  this.raw = raw;
  this.expr = expr;
});


/***/ }),

/***/ 8376:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Statement = __webpack_require__(7198);
const KIND = "catch";

/**
 * Defines a catch statement
 * @constructor Catch
 * @extends {Statement}
 * @property {Identifier[]} what
 * @property {Variable} variable
 * @property {Statement} body
 * @see http://php.net/manual/en/language.exceptions.php
 */
module.exports = Statement.extends(KIND, function Catch(
  body,
  what,
  variable,
  docs,
  location
) {
  Statement.apply(this, [KIND, docs, location]);
  this.body = body;
  this.what = what;
  this.variable = variable;
});


/***/ }),

/***/ 9468:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Declaration = __webpack_require__(7508);
const KIND = "class";

/**
 * A class definition
 * @constructor Class
 * @extends {Declaration}
 * @property {Identifier|null} extends
 * @property {Identifier[]} implements
 * @property {Declaration[]} body
 * @property {boolean} isAnonymous
 * @property {boolean} isAbstract
 * @property {boolean} isFinal
 */
module.exports = Declaration.extends(KIND, function Class(
  name,
  ext,
  impl,
  body,
  flags,
  docs,
  location
) {
  Declaration.apply(this, [KIND, name, docs, location]);
  this.isAnonymous = name ? false : true;
  this.extends = ext;
  this.implements = impl;
  this.body = body;
  this.parseFlags(flags);
});


/***/ }),

/***/ 4458:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const ConstantStatement = __webpack_require__(4338);
const KIND = "classconstant";

const IS_UNDEFINED = "";
const IS_PUBLIC = "public";
const IS_PROTECTED = "protected";
const IS_PRIVATE = "private";

/**
 * Defines a class/interface/trait constant
 * @constructor ClassConstant
 * @extends {ConstantStatement}
 * @property {string} visibility
 */
const ClassConstant = ConstantStatement.extends(KIND, function ClassConstant(
  kind,
  constants,
  flags,
  docs,
  location
) {
  ConstantStatement.apply(this, [kind || KIND, constants, docs, location]);
  this.parseFlags(flags);
});

/**
 * Generic flags parser
 * @param {Integer[]} flags
 * @return {void}
 */
ClassConstant.prototype.parseFlags = function (flags) {
  if (flags[0] === -1) {
    this.visibility = IS_UNDEFINED;
  } else if (flags[0] === null) {
    this.visibility = null;
  } else if (flags[0] === 0) {
    this.visibility = IS_PUBLIC;
  } else if (flags[0] === 1) {
    this.visibility = IS_PROTECTED;
  } else if (flags[0] === 2) {
    this.visibility = IS_PRIVATE;
  }
};

module.exports = ClassConstant;


/***/ }),

/***/ 1592:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Expression = __webpack_require__(8586);
const KIND = "clone";

/**
 * Defines a clone call
 * @constructor Clone
 * @extends {Expression}
 * @property {Expression} what
 */
module.exports = Expression.extends(KIND, function Clone(what, docs, location) {
  Expression.apply(this, [KIND, docs, location]);
  this.what = what;
});


/***/ }),

/***/ 8029:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Expression = __webpack_require__(8586);
const KIND = "closure";

/**
 * Defines a closure
 * @constructor Closure
 * @extends {Expression}
 * @property {Parameter[]} arguments
 * @property {Variable[]} uses
 * @property {Identifier} type
 * @property {boolean} byref
 * @property {boolean} nullable
 * @property {Block|null} body
 * @property {boolean} isStatic
 */
module.exports = Expression.extends(KIND, function Closure(
  args,
  byref,
  uses,
  type,
  nullable,
  isStatic,
  docs,
  location
) {
  Expression.apply(this, [KIND, docs, location]);
  this.uses = uses;
  this.arguments = args;
  this.byref = byref;
  this.type = type;
  this.nullable = nullable;
  this.isStatic = isStatic || false;
  this.body = null;
});


/***/ }),

/***/ 7613:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Node = __webpack_require__(9675);

/**
 * Abstract documentation node (ComentLine or CommentBlock)
 * @constructor Comment
 * @extends {Node}
 * @property {String} value
 */
module.exports = Node.extends("comment", function Comment(
  kind,
  value,
  docs,
  location
) {
  Node.apply(this, [kind, docs, location]);
  this.value = value;
});


/***/ }),

/***/ 1912:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Comment = __webpack_require__(7613);
const KIND = "commentblock";

/**
 * A comment block (multiline)
 * @constructor CommentBlock
 * @extends {Comment}
 */
module.exports = Comment.extends(KIND, function CommentBlock(
  value,
  docs,
  location
) {
  Comment.apply(this, [KIND, value, docs, location]);
});


/***/ }),

/***/ 108:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Comment = __webpack_require__(7613);
const KIND = "commentline";

/**
 * A single line comment
 * @constructor CommentLine
 * @extends {Comment}
 */
module.exports = Comment.extends(KIND, function CommentLine(
  value,
  docs,
  location
) {
  Comment.apply(this, [KIND, value, docs, location]);
});


/***/ }),

/***/ 4499:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Node = __webpack_require__(9675);
const KIND = "constant";

/**
 * Defines a constant
 * @constructor Constant
 * @extends {Node}
 * @property {string} name
 * @property {Node|string|number|boolean|null} value
 */
module.exports = Node.extends(KIND, function Constant(
  name,
  value,
  docs,
  location
) {
  Node.apply(this, [KIND, docs, location]);
  this.name = name;
  this.value = value;
});


/***/ }),

/***/ 4338:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Statement = __webpack_require__(7198);
const KIND = "constantstatement";

/**
 * Declares a constants into the current scope
 * @constructor ConstantStatement
 * @extends {Statement}
 * @property {Constant[]} constants
 */
module.exports = Statement.extends(KIND, function ConstantStatement(
  kind,
  constants,
  docs,
  location
) {
  Statement.apply(this, [kind || KIND, docs, location]);
  this.constants = constants;
});


/***/ }),

/***/ 4122:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Statement = __webpack_require__(7198);
const KIND = "continue";

/**
 * A continue statement
 * @constructor Continue
 * @extends {Statement}
 * @property {Number|Null} level
 */
module.exports = Statement.extends(KIND, function Continue(
  level,
  docs,
  location
) {
  Statement.apply(this, [KIND, docs, location]);
  this.level = level;
});


/***/ }),

/***/ 7508:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Statement = __webpack_require__(7198);
const KIND = "declaration";

const IS_UNDEFINED = "";
const IS_PUBLIC = "public";
const IS_PROTECTED = "protected";
const IS_PRIVATE = "private";

/**
 * A declaration statement (function, class, interface...)
 * @constructor Declaration
 * @extends {Statement}
 * @property {Identifier|string} name
 */
const Declaration = Statement.extends(KIND, function Declaration(
  kind,
  name,
  docs,
  location
) {
  Statement.apply(this, [kind || KIND, docs, location]);
  this.name = name;
});

/**
 * Generic flags parser
 * @param {Integer[]} flags
 * @return {void}
 */
Declaration.prototype.parseFlags = function (flags) {
  this.isAbstract = flags[2] === 1;
  this.isFinal = flags[2] === 2;
  if (this.kind !== "class") {
    if (flags[0] === -1) {
      this.visibility = IS_UNDEFINED;
    } else if (flags[0] === null) {
      this.visibility = null;
    } else if (flags[0] === 0) {
      this.visibility = IS_PUBLIC;
    } else if (flags[0] === 1) {
      this.visibility = IS_PROTECTED;
    } else if (flags[0] === 2) {
      this.visibility = IS_PRIVATE;
    }
    this.isStatic = flags[1] === 1;
  }
};

module.exports = Declaration;


/***/ }),

/***/ 3412:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Block = __webpack_require__(1434);
const KIND = "declare";

/**
 * The declare construct is used to set execution directives for a block of code
 * @constructor Declare
 * @extends {Block}
 * @property {Array[]} directives
 * @property {String} mode
 * @see http://php.net/manual/en/control-structures.declare.php
 */
const Declare = Block.extends(KIND, function Declare(
  directives,
  body,
  mode,
  docs,
  location
) {
  Block.apply(this, [KIND, body, docs, location]);
  this.directives = directives;
  this.mode = mode;
});

/**
 * The node is declared as a short tag syntax :
 * ```php
 * <?php
 * declare(ticks=1):
 * // some statements
 * enddeclare;
 * ```
 * @constant {String} MODE_SHORT
 */
Declare.MODE_SHORT = "short";

/**
 * The node is declared bracket enclosed code :
 * ```php
 * <?php
 * declare(ticks=1) {
 * // some statements
 * }
 * ```
 * @constant {String} MODE_BLOCK
 */
Declare.MODE_BLOCK = "block";

/**
 * The node is declared as a simple statement. In order to make things simpler
 * children of the node are automatically collected until the next
 * declare statement.
 * ```php
 * <?php
 * declare(ticks=1);
 * // some statements
 * declare(ticks=2);
 * // some statements
 * ```
 * @constant {String} MODE_NONE
 */
Declare.MODE_NONE = "none";

module.exports = Declare;


/***/ }),

/***/ 7122:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Node = __webpack_require__(9675);
const KIND = "declaredirective";

/**
 * Defines a constant
 * @constructor DeclareDirective
 * @extends {Node}
 * @property {Identifier} name
 * @property {Node|string|number|boolean|null} value
 */
module.exports = Node.extends(KIND, function DeclareDirective(
  key,
  value,
  docs,
  location
) {
  Node.apply(this, [KIND, docs, location]);
  this.key = key;
  this.value = value;
});


/***/ }),

/***/ 8685:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Statement = __webpack_require__(7198);
const KIND = "do";

/**
 * Defines a do/while statement
 * @constructor Do
 * @extends {Statement}
 * @property {Expression} test
 * @property {Statement} body
 */
module.exports = Statement.extends(KIND, function Do(
  test,
  body,
  docs,
  location
) {
  Statement.apply(this, [KIND, docs, location]);
  this.test = test;
  this.body = body;
});


/***/ }),

/***/ 6614:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Statement = __webpack_require__(7198);
const KIND = "echo";

/**
 * Defines system based call
 * @constructor Echo
 * @property {boolean} shortForm
 * @extends {Statement}
 */
module.exports = Statement.extends(KIND, function Echo(
  expressions,
  shortForm,
  docs,
  location
) {
  Statement.apply(this, [KIND, docs, location]);
  this.shortForm = shortForm;
  this.expressions = expressions;
});


/***/ }),

/***/ 528:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Expression = __webpack_require__(8586);
const KIND = "empty";

/**
 * Defines an empty check call
 * @constructor Empty
 * @extends {Expression}
 */
module.exports = Expression.extends(KIND, function Empty(
  expression,
  docs,
  location
) {
  Expression.apply(this, [KIND, docs, location]);
  this.expression = expression;
});


/***/ }),

/***/ 3243:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Literal = __webpack_require__(5768);
const KIND = "encapsed";

/**
 * Defines an encapsed string (contains expressions)
 * @constructor Encapsed
 * @extends {Literal}
 * @property {String} type - Defines the type of encapsed string (shell, heredoc, string)
 * @property {String|Null} label - The heredoc label, defined only when the type is heredoc
 */
const Encapsed = Literal.extends(KIND, function Encapsed(
  value,
  raw,
  type,
  docs,
  location
) {
  Literal.apply(this, [KIND, value, raw, docs, location]);
  this.type = type;
});

/**
 * The node is a double quote string :
 * ```php
 * <?php
 * echo "hello $world";
 * ```
 * @constant {String} TYPE_STRING - `string`
 */
Encapsed.TYPE_STRING = "string";

/**
 * The node is a shell execute string :
 * ```php
 * <?php
 * echo `ls -larth $path`;
 * ```
 * @constant {String} TYPE_SHELL - `shell`
 */
Encapsed.TYPE_SHELL = "shell";

/**
 * The node is a shell execute string :
 * ```php
 * <?php
 * echo <<<STR
 *  Hello $world
 * STR
 * ;
 * ```
 * @constant {String} TYPE_HEREDOC - `heredoc`
 */
Encapsed.TYPE_HEREDOC = "heredoc";

/**
 * The node contains a list of constref / variables / expr :
 * ```php
 * <?php
 * echo $foo->bar_$baz;
 * ```
 * @constant {String} TYPE_OFFSET - `offset`
 */
Encapsed.TYPE_OFFSET = "offset";

module.exports = Encapsed;


/***/ }),

/***/ 8641:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Expression = __webpack_require__(8586);
const KIND = "encapsedpart";

/**
 * Part of `Encapsed` node
 * @constructor EncapsedPart
 * @extends {Expression}
 * @property {Expression} expression
 * @property {String} syntax
 * @property {Boolean} curly
 */
module.exports = Expression.extends(KIND, function EncapsedPart(
  expression,
  syntax,
  curly,
  docs,
  location
) {
  Expression.apply(this, [KIND, docs, location]);
  this.expression = expression;
  this.syntax = syntax;
  this.curly = curly;
});


/***/ }),

/***/ 837:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Expression = __webpack_require__(8586);
const KIND = "entry";

/**
 * An array entry - see [Array](#array)
 * @constructor Entry
 * @extends {Expression}
 * @property {Node|null} key The entry key/offset
 * @property {Node} value The entry value
 * @property {Boolean} byRef By reference
 * @property {Boolean} unpack Argument unpacking
 */
module.exports = Expression.extends(KIND, function Entry(
  key,
  value,
  byRef,
  unpack,
  docs,
  location
) {
  Expression.apply(this, [KIND, docs, location]);
  this.key = key;
  this.value = value;
  this.byRef = byRef;
  this.unpack = unpack;
});


/***/ }),

/***/ 1491:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Node = __webpack_require__(9675);
const KIND = "error";

/**
 * Defines an error node (used only on silentMode)
 * @constructor Error
 * @extends {Node}
 * @property {string} message
 * @property {number} line
 * @property {number|string} token
 * @property {string|array} expected
 */
module.exports = Node.extends(KIND, function Error(
  message,
  token,
  line,
  expected,
  docs,
  location
) {
  Node.apply(this, [KIND, docs, location]);
  this.message = message;
  this.token = token;
  this.line = line;
  this.expected = expected;
});


/***/ }),

/***/ 6075:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Expression = __webpack_require__(8586);
const KIND = "eval";

/**
 * Defines an eval statement
 * @constructor Eval
 * @extends {Expression}
 * @property {Node} source
 */
module.exports = Expression.extends(KIND, function Eval(
  source,
  docs,
  location
) {
  Expression.apply(this, [KIND, docs, location]);
  this.source = source;
});


/***/ }),

/***/ 8463:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Expression = __webpack_require__(8586);
const KIND = "exit";

/**
 * Defines an exit / die call
 * @constructor Exit
 * @extends {Expression}
 * @property {Node|null} expression
 * @property {Boolean} useDie
 */
module.exports = Expression.extends(KIND, function Exit(
  expression,
  useDie,
  docs,
  location
) {
  Expression.apply(this, [KIND, docs, location]);
  this.expression = expression;
  this.useDie = useDie;
});


/***/ }),

/***/ 8586:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Node = __webpack_require__(9675);
const KIND = "expression";

/**
 * Any expression node. Since the left-hand side of an assignment may
 * be any expression in general, an expression can also be a pattern.
 * @constructor Expression
 * @extends {Node}
 */
module.exports = Node.extends(KIND, function Expression(kind, docs, location) {
  Node.apply(this, [kind || KIND, docs, location]);
});


/***/ }),

/***/ 2216:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Statement = __webpack_require__(7198);
const KIND = "expressionstatement";

/**
 * Defines an expression based statement
 * @constructor ExpressionStatement
 * @extends {Statement}
 * @property {Expression} expression
 */
module.exports = Statement.extends(KIND, function ExpressionStatement(
  expr,
  docs,
  location
) {
  Statement.apply(this, [KIND, docs, location]);
  this.expression = expr;
});


/***/ }),

/***/ 5285:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Statement = __webpack_require__(7198);
const KIND = "for";

/**
 * Defines a for iterator
 * @constructor For
 * @extends {Statement}
 * @property {Expression[]} init
 * @property {Expression[]} test
 * @property {Expression[]} increment
 * @property {Statement} body
 * @property {boolean} shortForm
 * @see http://php.net/manual/en/control-structures.for.php
 */
module.exports = Statement.extends(KIND, function For(
  init,
  test,
  increment,
  body,
  shortForm,
  docs,
  location
) {
  Statement.apply(this, [KIND, docs, location]);
  this.init = init;
  this.test = test;
  this.increment = increment;
  this.shortForm = shortForm;
  this.body = body;
});


/***/ }),

/***/ 366:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Statement = __webpack_require__(7198);
const KIND = "foreach";

/**
 * Defines a foreach iterator
 * @constructor Foreach
 * @extends {Statement}
 * @property {Expression} source
 * @property {Expression|null} key
 * @property {Expression} value
 * @property {Statement} body
 * @property {boolean} shortForm
 * @see http://php.net/manual/en/control-structures.foreach.php
 */
module.exports = Statement.extends(KIND, function Foreach(
  source,
  key,
  value,
  body,
  shortForm,
  docs,
  location
) {
  Statement.apply(this, [KIND, docs, location]);
  this.source = source;
  this.key = key;
  this.value = value;
  this.shortForm = shortForm;
  this.body = body;
});


/***/ }),

/***/ 7396:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Declaration = __webpack_require__(7508);
const KIND = "function";

/**
 * Defines a classic function
 * @constructor Function
 * @extends {Declaration}
 * @property {Parameter[]} arguments
 * @property {Identifier} type
 * @property {boolean} byref
 * @property {boolean} nullable
 * @property {Block|null} body
 */
module.exports = Declaration.extends(KIND, function _Function(
  name,
  args,
  byref,
  type,
  nullable,
  docs,
  location
) {
  Declaration.apply(this, [KIND, name, docs, location]);
  this.arguments = args;
  this.byref = byref;
  this.type = type;
  this.nullable = nullable;
  this.body = null;
});


/***/ }),

/***/ 6625:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Statement = __webpack_require__(7198);
const KIND = "global";

/**
 * Imports a variable from the global scope
 * @constructor Global
 * @extends {Statement}
 * @property {Variable[]} items
 */
module.exports = Statement.extends(KIND, function Global(
  items,
  docs,
  location
) {
  Statement.apply(this, [KIND, docs, location]);
  this.items = items;
});


/***/ }),

/***/ 5166:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Statement = __webpack_require__(7198);
const KIND = "goto";

/**
 * Defines goto statement
 * @constructor Goto
 * @extends {Statement}
 * @property {String} label
 * @see {Label}
 */
module.exports = Statement.extends(KIND, function Goto(label, docs, location) {
  Statement.apply(this, [KIND, docs, location]);
  this.label = label;
});


/***/ }),

/***/ 2465:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Statement = __webpack_require__(7198);
const KIND = "halt";

/**
 * Halts the compiler execution
 * @constructor Halt
 * @extends {Statement}
 * @property {String} after - String after the halt statement
 * @see http://php.net/manual/en/function.halt-compiler.php
 */
module.exports = Statement.extends(KIND, function Halt(after, docs, location) {
  Statement.apply(this, [KIND, docs, location]);
  this.after = after;
});


/***/ }),

/***/ 981:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Node = __webpack_require__(9675);
const KIND = "identifier";

/**
 * Defines an identifier node
 * @constructor Identifier
 * @extends {Node}
 * @property {string} name
 */
const Identifier = Node.extends(KIND, function Identifier(
  name,
  docs,
  location
) {
  Node.apply(this, [KIND, docs, location]);
  this.name = name;
});

module.exports = Identifier;


/***/ }),

/***/ 6950:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Statement = __webpack_require__(7198);
const KIND = "if";

/**
 * Defines a if statement
 * @constructor If
 * @extends {Statement}
 * @property {Expression} test
 * @property {Block} body
 * @property {Block|If|null} alternate
 * @property {boolean} shortForm
 */
module.exports = Statement.extends(KIND, function If(
  test,
  body,
  alternate,
  shortForm,
  docs,
  location
) {
  Statement.apply(this, [KIND, docs, location]);
  this.test = test;
  this.body = body;
  this.alternate = alternate;
  this.shortForm = shortForm;
});


/***/ }),

/***/ 670:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Expression = __webpack_require__(8586);
const KIND = "include";

/**
 * Defines system include call
 * @constructor Include
 * @extends {Expression}
 * @property {Node} target
 * @property {boolean} once
 * @property {boolean} require
 */
module.exports = Expression.extends(KIND, function Include(
  once,
  require,
  target,
  docs,
  location
) {
  Expression.apply(this, [KIND, docs, location]);
  this.once = once;
  this.require = require;
  this.target = target;
});


/***/ }),

/***/ 6410:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Literal = __webpack_require__(5768);
const KIND = "inline";

/**
 * Defines inline html output (treated as echo output)
 * @constructor Inline
 * @extends {Literal}
 */
module.exports = Literal.extends(KIND, function Inline(
  value,
  raw,
  docs,
  location
) {
  Literal.apply(this, [KIND, value, raw, docs, location]);
});


/***/ }),

/***/ 6560:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Declaration = __webpack_require__(7508);
const KIND = "interface";

/**
 * An interface definition
 * @constructor Interface
 * @extends {Declaration}
 * @property {Identifier[]} extends
 * @property {Declaration[]} body
 */
module.exports = Declaration.extends(KIND, function Interface(
  name,
  ext,
  body,
  docs,
  location
) {
  Declaration.apply(this, [KIND, name, docs, location]);
  this.extends = ext;
  this.body = body;
});


/***/ }),

/***/ 7796:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Expression = __webpack_require__(8586);
const KIND = "isset";

/**
 * Defines an isset call
 * @constructor Isset
 * @extends {Expression}
 */
module.exports = Expression.extends(KIND, function Isset(
  variables,
  docs,
  location
) {
  Expression.apply(this, [KIND, docs, location]);
  this.variables = variables;
});


/***/ }),

/***/ 788:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Statement = __webpack_require__(7198);
const KIND = "label";

/**
 * A label statement (referenced by goto)
 * @constructor Label
 * @extends {Statement}
 * @property {String} name
 */
module.exports = Statement.extends(KIND, function Label(name, docs, location) {
  Statement.apply(this, [KIND, docs, location]);
  this.name = name;
});


/***/ }),

/***/ 4265:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Expression = __webpack_require__(8586);
const KIND = "list";

/**
 * Defines list assignment
 * @constructor List
 * @extends {Expression}
 * @property {boolean} shortForm
 */
module.exports = Expression.extends(KIND, function List(
  items,
  shortForm,
  docs,
  location
) {
  Expression.apply(this, [KIND, docs, location]);
  this.items = items;
  this.shortForm = shortForm;
});


/***/ }),

/***/ 5768:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Expression = __webpack_require__(8586);
const KIND = "literal";

/**
 * Defines an array structure
 * @constructor Literal
 * @extends {Expression}
 * @property {string} raw
 * @property {Node|string|number|boolean|null} value
 */
module.exports = Expression.extends(KIND, function Literal(
  kind,
  value,
  raw,
  docs,
  location
) {
  Expression.apply(this, [kind || KIND, docs, location]);
  this.value = value;
  if (raw) {
    this.raw = raw;
  }
});


/***/ }),

/***/ 6295:
/***/ ((module) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


/**
 * Defines the location of the node (with it's source contents as string)
 * @constructor Location
 * @property {String|null} source
 * @property {Position} start
 * @property {Position} end
 */
const Location = function (source, start, end) {
  this.source = source;
  this.start = start;
  this.end = end;
};

module.exports = Location;


/***/ }),

/***/ 9102:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Expr = __webpack_require__(8586);
const KIND = "lookup";

/**
 * Lookup on an offset in the specified object
 * @constructor Lookup
 * @extends {Expression}
 * @property {Expression} what
 * @property {Expression} offset
 */
module.exports = Expr.extends(KIND, function Lookup(
  kind,
  what,
  offset,
  docs,
  location
) {
  Expr.apply(this, [kind || KIND, docs, location]);
  this.what = what;
  this.offset = offset;
});


/***/ }),

/***/ 9727:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Literal = __webpack_require__(5768);
const KIND = "magic";

/**
 * Defines magic constant
 * @constructor Magic
 * @extends {Literal}
 */
module.exports = Literal.extends(KIND, function Magic(
  value,
  raw,
  docs,
  location
) {
  Literal.apply(this, [KIND, value, raw, docs, location]);
});


/***/ }),

/***/ 7387:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const _Function = __webpack_require__(7396);
const KIND = "method";

/**
 * Defines a class/interface/trait method
 * @constructor Method
 * @extends {_Function}
 * @property {boolean} isAbstract
 * @property {boolean} isFinal
 * @property {boolean} isStatic
 * @property {string} visibility
 */
module.exports = _Function.extends(KIND, function Method() {
  _Function.apply(this, arguments);
  this.kind = KIND;
});


/***/ }),

/***/ 3898:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Reference = __webpack_require__(8065);
const KIND = "name";

/**
 * Defines a class reference node
 * @constructor Name
 * @extends {Reference}
 * @property {string} name
 * @property {string} resolution
 */
const Name = Reference.extends(KIND, function Name(
  name,
  isRelative,
  docs,
  location
) {
  Reference.apply(this, [KIND, docs, location]);
  if (isRelative) {
    this.resolution = Name.RELATIVE_NAME;
  } else if (name.length === 1) {
    this.resolution = Name.UNQUALIFIED_NAME;
  } else if (!name[0]) {
    this.resolution = Name.FULL_QUALIFIED_NAME;
  } else {
    this.resolution = Name.QUALIFIED_NAME;
  }
  this.name = name.join("\\");
});

/**
 * This is an identifier without a namespace separator, such as Foo
 * @constant {String} UNQUALIFIED_NAME
 */
Name.UNQUALIFIED_NAME = "uqn";
/**
 * This is an identifier with a namespace separator, such as Foo\Bar
 * @constant {String} QUALIFIED_NAME
 */
Name.QUALIFIED_NAME = "qn";
/**
 * This is an identifier with a namespace separator that begins with
 * a namespace separator, such as \Foo\Bar. The namespace \Foo is also
 * a fully qualified name.
 * @constant {String} FULL_QUALIFIED_NAME
 */
Name.FULL_QUALIFIED_NAME = "fqn";
/**
 * This is an identifier starting with namespace, such as namespace\Foo\Bar.
 * @constant {String} RELATIVE_NAME
 */
Name.RELATIVE_NAME = "rn";

module.exports = Name;


/***/ }),

/***/ 6497:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Block = __webpack_require__(1434);
const KIND = "namespace";

/**
 * The main program node
 * @constructor Namespace
 * @extends {Block}
 * @property {String} name
 * @property {Boolean} withBrackets
 */
module.exports = Block.extends(KIND, function Namespace(
  name,
  children,
  withBrackets,
  docs,
  location
) {
  Block.apply(this, [KIND, children, docs, location]);
  this.name = name;
  this.withBrackets = withBrackets || false;
});


/***/ }),

/***/ 8834:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Expression = __webpack_require__(8586);
const KIND = "new";

/**
 * Creates a new instance of the specified class
 * @constructor New
 * @extends {Expression}
 * @property {Identifier|Variable|Class} what
 * @property {Arguments[]} arguments
 */
module.exports = Expression.extends(KIND, function New(
  what,
  args,
  docs,
  location
) {
  Expression.apply(this, [KIND, docs, location]);
  this.what = what;
  this.arguments = args;
});


/***/ }),

/***/ 9675:
/***/ ((module) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


/**
 * A generic AST node
 * @constructor Node
 * @property {Location|null} loc
 * @property {Comment[]} leadingComments
 * @property {Comment[]?} trailingComments
 * @property {String} kind
 */
const Node = function Node(kind, docs, location) {
  this.kind = kind;
  if (docs) {
    this.leadingComments = docs;
  }
  if (location) {
    this.loc = location;
  }
};

/**
 * Attach comments to current node
 * @param {*} docs
 */
Node.prototype.setTrailingComments = function (docs) {
  this.trailingComments = docs;
};

/**
 * Destroying an unused node
 */
Node.prototype.destroy = function (node) {
  if (!node) {
    throw new Error(
      "Node already initialized, you must swap with another node"
    );
  }
  if (this.leadingComments) {
    if (node.leadingComments) {
      node.leadingComments = Array.concat(
        this.leadingComments,
        node.leadingComments
      );
    } else {
      node.leadingComments = this.leadingComments;
    }
  }
  if (this.trailingComments) {
    if (node.trailingComments) {
      node.trailingComments = Array.concat(
        this.trailingComments,
        node.trailingComments
      );
    } else {
      node.trailingComments = this.trailingComments;
    }
  }
  return node;
};

/**
 * Includes current token position of the parser
 * @param {*} parser
 */
Node.prototype.includeToken = function (parser) {
  if (this.loc) {
    if (this.loc.end) {
      this.loc.end.line = parser.lexer.yylloc.last_line;
      this.loc.end.column = parser.lexer.yylloc.last_column;
      this.loc.end.offset = parser.lexer.offset;
    }
    if (parser.ast.withSource) {
      this.loc.source = parser.lexer._input.substring(
        this.loc.start.offset,
        parser.lexer.offset
      );
    }
  }
  return this;
};

/**
 * Helper for extending the Node class
 * @param {String} type
 * @param {Function} constructor
 * @return {Function}
 */
Node.extends = function (type, constructor) {
  constructor.prototype = Object.create(this.prototype);
  constructor.extends = this.extends;
  constructor.prototype.constructor = constructor;
  constructor.kind = type;
  return constructor;
};

module.exports = Node;


/***/ }),

/***/ 2664:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Node = __webpack_require__(9675);
const KIND = "noop";

/**
 * Ignore this node, it implies a no operation block, for example :
 * [$foo, $bar, /* here a noop node * /]
 * @constructor Noop
 * @extends {Node}
 */
module.exports = Node.extends(KIND, function Noop(docs, location) {
  Node.apply(this, [KIND, docs, location]);
});


/***/ }),

/***/ 629:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Literal = __webpack_require__(5768);
const KIND = "nowdoc";

/**
 * Defines a nowdoc string
 * @constructor NowDoc
 * @extends {Literal}
 * @property {String} label
 * @property {String} raw
 */
module.exports = Literal.extends(KIND, function Nowdoc(
  value,
  raw,
  label,
  docs,
  location
) {
  Literal.apply(this, [KIND, value, raw, docs, location]);
  this.label = label;
});


/***/ }),

/***/ 8261:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Node = __webpack_require__(9675);
const KIND = "nullkeyword";

/**
 * Represents the null keyword
 * @constructor NullKeyword
 * @extends {Node}
 */
module.exports = Node.extends(KIND, function NullKeyword(raw, docs, location) {
  Node.apply(this, [KIND, docs, location]);
  this.raw = raw;
});


/***/ }),

/***/ 5962:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Literal = __webpack_require__(5768);
const KIND = "number";

/**
 * Defines a numeric value
 * @constructor Number
 * @extends {Literal}
 */
module.exports = Literal.extends(KIND, function Number(
  value,
  raw,
  docs,
  location
) {
  Literal.apply(this, [KIND, value, raw, docs, location]);
});


/***/ }),

/***/ 925:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Lookup = __webpack_require__(9102);
const KIND = "offsetlookup";

/**
 * Lookup on an offset in an array
 * @constructor OffsetLookup
 * @extends {Lookup}
 */
module.exports = Lookup.extends(KIND, function OffsetLookup(
  what,
  offset,
  docs,
  location
) {
  Lookup.apply(this, [KIND, what, offset, docs, location]);
});


/***/ }),

/***/ 1155:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Expr = __webpack_require__(8586);
const KIND = "operation";

/**
 * Defines binary operations
 * @constructor Operation
 * @extends {Expression}
 */
module.exports = Expr.extends(KIND, function Operation(kind, docs, location) {
  Expr.apply(this, [kind || KIND, docs, location]);
});


/***/ }),

/***/ 1255:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Declaration = __webpack_require__(7508);
const KIND = "parameter";

/**
 * Defines a function parameter
 * @constructor Parameter
 * @extends {Declaration}
 * @property {Identifier|null} type
 * @property {Node|null} value
 * @property {boolean} byref
 * @property {boolean} variadic
 * @property {boolean} nullable
 */
module.exports = Declaration.extends(KIND, function Parameter(
  name,
  type,
  value,
  isRef,
  isVariadic,
  nullable,
  docs,
  location
) {
  Declaration.apply(this, [KIND, name, docs, location]);
  this.value = value;
  this.type = type;
  this.byref = isRef;
  this.variadic = isVariadic;
  this.nullable = nullable;
});


/***/ }),

/***/ 3637:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Reference = __webpack_require__(8065);
const KIND = "parentreference";

/**
 * Defines a class reference node
 * @constructor ParentReference
 * @extends {Reference}
 */
const ParentReference = Reference.extends(KIND, function ParentReference(
  raw,
  docs,
  location
) {
  Reference.apply(this, [KIND, docs, location]);
  this.raw = raw;
});
module.exports = ParentReference;


/***/ }),

/***/ 4413:
/***/ ((module) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


/**
 * Each Position object consists of a line number (1-indexed) and a column number (0-indexed):
 * @constructor Position
 * @property {Number} line
 * @property {Number} column
 * @property {Number} offset
 */
const Position = function (line, column, offset) {
  this.line = line;
  this.column = column;
  this.offset = offset;
};

module.exports = Position;


/***/ }),

/***/ 3477:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Operation = __webpack_require__(1155);
const KIND = "post";

/**
 * Defines a post operation `$i++` or `$i--`
 * @constructor Post
 * @extends {Operation}
 * @property {String} type
 * @property {Variable} what
 */
module.exports = Operation.extends(KIND, function Post(
  type,
  what,
  docs,
  location
) {
  Operation.apply(this, [KIND, docs, location]);
  this.type = type;
  this.what = what;
});


/***/ }),

/***/ 5854:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Operation = __webpack_require__(1155);
const KIND = "pre";

/**
 * Defines a pre operation `++$i` or `--$i`
 * @constructor Pre
 * @extends {Operation}
 * @property {String} type
 * @property {Variable} what
 */
module.exports = Operation.extends(KIND, function Pre(
  type,
  what,
  docs,
  location
) {
  Operation.apply(this, [KIND, docs, location]);
  this.type = type;
  this.what = what;
});


/***/ }),

/***/ 3001:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Expression = __webpack_require__(8586);
const KIND = "print";

/**
 * Outputs
 * @constructor Print
 * @extends {Expression}
 */
module.exports = Expression.extends(KIND, function Print(
  expression,
  docs,
  location
) {
  Expression.apply(this, [KIND, docs, location]);
  this.expression = expression;
});


/***/ }),

/***/ 5567:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Block = __webpack_require__(1434);
const KIND = "program";

/**
 * The main program node
 * @constructor Program
 * @extends {Block}
 * @property {Error[]} errors
 * @property {Doc[]?} comments
 * @property {String[]?} tokens
 */
module.exports = Block.extends(KIND, function Program(
  children,
  errors,
  comments,
  tokens,
  docs,
  location
) {
  Block.apply(this, [KIND, children, docs, location]);
  this.errors = errors;
  if (comments) {
    this.comments = comments;
  }
  if (tokens) {
    this.tokens = tokens;
  }
});


/***/ }),

/***/ 8010:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Statement = __webpack_require__(7198);
const KIND = "property";

/**
 * Defines a class property
 * @constructor Property
 * @extends {Statement}
 * @property {string} name
 * @property {Node|null} value
 * @property {boolean} nullable
 * @property {Identifier|Array<Identifier>|null} type
 */
module.exports = Statement.extends(KIND, function Property(
  name,
  value,
  nullable,
  type,
  docs,
  location
) {
  Statement.apply(this, [KIND, docs, location]);
  this.name = name;
  this.value = value;
  this.nullable = nullable;
  this.type = type;
});


/***/ }),

/***/ 5846:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Lookup = __webpack_require__(9102);
const KIND = "propertylookup";

/**
 * Lookup to an object property
 * @constructor PropertyLookup
 * @extends {Lookup}
 */
module.exports = Lookup.extends(KIND, function PropertyLookup(
  what,
  offset,
  docs,
  location
) {
  Lookup.apply(this, [KIND, what, offset, docs, location]);
});


/***/ }),

/***/ 4021:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Statement = __webpack_require__(7198);
const KIND = "propertystatement";

const IS_UNDEFINED = "";
const IS_PUBLIC = "public";
const IS_PROTECTED = "protected";
const IS_PRIVATE = "private";

/**
 * Declares a properties into the current scope
 * @constructor PropertyStatement
 * @extends {Statement}
 * @property {Property[]} properties
 */
const PropertyStatement = Statement.extends(KIND, function PropertyStatement(
  kind,
  properties,
  flags,
  docs,
  location
) {
  Statement.apply(this, [KIND, docs, location]);
  this.properties = properties;
  this.parseFlags(flags);
});

/**
 * Generic flags parser
 * @param {Integer[]} flags
 * @return {void}
 */
PropertyStatement.prototype.parseFlags = function (flags) {
  if (flags[0] === -1) {
    this.visibility = IS_UNDEFINED;
  } else if (flags[0] === null) {
    this.visibility = null;
  } else if (flags[0] === 0) {
    this.visibility = IS_PUBLIC;
  } else if (flags[0] === 1) {
    this.visibility = IS_PROTECTED;
  } else if (flags[0] === 2) {
    this.visibility = IS_PRIVATE;
  }

  this.isStatic = flags[1] === 1;
};

module.exports = PropertyStatement;


/***/ }),

/***/ 8065:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Node = __webpack_require__(9675);
const KIND = "reference";

/**
 * Defines a reference node
 * @constructor Reference
 * @extends {Node}
 */
const Reference = Node.extends(KIND, function Reference(kind, docs, location) {
  Node.apply(this, [kind || KIND, docs, location]);
});

module.exports = Reference;


/***/ }),

/***/ 2182:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Expression = __webpack_require__(8586);
const KIND = "retif";

/**
 * Defines a short if statement that returns a value
 * @constructor RetIf
 * @extends {Expression}
 * @property {Expression} test
 * @property {Expression} trueExpr
 * @property {Expression} falseExpr
 */
module.exports = Expression.extends(KIND, function RetIf(
  test,
  trueExpr,
  falseExpr,
  docs,
  location
) {
  Expression.apply(this, [KIND, docs, location]);
  this.test = test;
  this.trueExpr = trueExpr;
  this.falseExpr = falseExpr;
});


/***/ }),

/***/ 2051:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Statement = __webpack_require__(7198);
const KIND = "return";

/**
 * A continue statement
 * @constructor Return
 * @extends {Statement}
 * @property {Expression|null} expr
 */
module.exports = Statement.extends(KIND, function Return(expr, docs, location) {
  Statement.apply(this, [KIND, docs, location]);
  this.expr = expr;
});


/***/ }),

/***/ 6541:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Reference = __webpack_require__(8065);
const KIND = "selfreference";

/**
 * Defines a class reference node
 * @constructor SelfReference
 * @extends {Reference}
 */
const SelfReference = Reference.extends(KIND, function SelfReference(
  raw,
  docs,
  location
) {
  Reference.apply(this, [KIND, docs, location]);
  this.raw = raw;
});
module.exports = SelfReference;


/***/ }),

/***/ 7338:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Expression = __webpack_require__(8586);
const KIND = "silent";

/**
 * Avoids to show/log warnings & notices from the inner expression
 * @constructor Silent
 * @extends {Expression}
 * @property {Expression} expr
 */
module.exports = Expression.extends(KIND, function Silent(
  expr,
  docs,
  location
) {
  Expression.apply(this, [KIND, docs, location]);
  this.expr = expr;
});


/***/ }),

/***/ 7198:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Node = __webpack_require__(9675);
const KIND = "statement";

/**
 * Any statement.
 * @constructor Statement
 * @extends {Node}
 */
module.exports = Node.extends(KIND, function Statement(kind, docs, location) {
  Node.apply(this, [kind || KIND, docs, location]);
});


/***/ }),

/***/ 6837:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Statement = __webpack_require__(7198);
const KIND = "static";

/**
 * Declares a static variable into the current scope
 * @constructor Static
 * @extends {Statement}
 * @property {StaticVariable[]} variables
 */
module.exports = Statement.extends(KIND, function Static(
  variables,
  docs,
  location
) {
  Statement.apply(this, [KIND, docs, location]);
  this.variables = variables;
});


/***/ }),

/***/ 3591:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Lookup = __webpack_require__(9102);
const KIND = "staticlookup";

/**
 * Lookup to a static property
 * @constructor StaticLookup
 * @extends {Lookup}
 */
module.exports = Lookup.extends(KIND, function StaticLookup(
  what,
  offset,
  docs,
  location
) {
  Lookup.apply(this, [KIND, what, offset, docs, location]);
});


/***/ }),

/***/ 532:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Reference = __webpack_require__(8065);
const KIND = "staticreference";

/**
 * Defines a class reference node
 * @constructor StaticReference
 * @extends {Reference}
 */
const StaticReference = Reference.extends(KIND, function StaticReference(
  raw,
  docs,
  location
) {
  Reference.apply(this, [KIND, docs, location]);
  this.raw = raw;
});
module.exports = StaticReference;


/***/ }),

/***/ 37:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Node = __webpack_require__(9675);
const KIND = "staticvariable";

/**
 * Defines a constant
 * @constructor StaticVariable
 * @extends {Node}
 * @property {Variable} variable
 * @property {Node|string|number|boolean|null} defaultValue
 */
module.exports = Node.extends(KIND, function StaticVariable(
  variable,
  defaultValue,
  docs,
  location
) {
  Node.apply(this, [KIND, docs, location]);
  this.variable = variable;
  this.defaultValue = defaultValue;
});


/***/ }),

/***/ 1914:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Literal = __webpack_require__(5768);
const KIND = "string";

/**
 * Defines a string (simple ou double quoted) - chars are already escaped
 * @constructor String
 * @extends {Literal}
 * @property {boolean} unicode
 * @property {boolean} isDoubleQuote
 * @see {Encapsed}
 */
module.exports = Literal.extends(KIND, function String(
  isDoubleQuote,
  value,
  unicode,
  raw,
  docs,
  location
) {
  Literal.apply(this, [KIND, value, raw, docs, location]);
  this.unicode = unicode;
  this.isDoubleQuote = isDoubleQuote;
});


/***/ }),

/***/ 3179:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Statement = __webpack_require__(7198);
const KIND = "switch";

/**
 * Defines a switch statement
 * @constructor Switch
 * @extends {Statement}
 * @property {Expression} test
 * @property {Block} body
 * @property {boolean} shortForm
 */
module.exports = Statement.extends(KIND, function Switch(
  test,
  body,
  shortForm,
  docs,
  location
) {
  Statement.apply(this, [KIND, docs, location]);
  this.test = test;
  this.body = body;
  this.shortForm = shortForm;
});


/***/ }),

/***/ 7142:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Statement = __webpack_require__(7198);
const KIND = "throw";

/**
 * Defines a throw statement
 * @constructor Throw
 * @extends {Statement}
 * @property {Expression} what
 */
module.exports = Statement.extends(KIND, function Throw(what, docs, location) {
  Statement.apply(this, [KIND, docs, location]);
  this.what = what;
});


/***/ }),

/***/ 1354:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Declaration = __webpack_require__(7508);
const KIND = "trait";

/**
 * A trait definition
 * @constructor Trait
 * @extends {Declaration}
 * @property {Declaration[]} body
 */
module.exports = Declaration.extends(KIND, function Trait(
  name,
  body,
  docs,
  location
) {
  Declaration.apply(this, [KIND, name, docs, location]);
  this.body = body;
});


/***/ }),

/***/ 3949:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Node = __webpack_require__(9675);
const KIND = "traitalias";

const IS_UNDEFINED = "";
const IS_PUBLIC = "public";
const IS_PROTECTED = "protected";
const IS_PRIVATE = "private";

/**
 * Defines a trait alias
 * @constructor TraitAlias
 * @extends {Node}
 * @property {Identifier|null} trait
 * @property {Identifier} method
 * @property {Identifier|null} as
 * @property {string|null} visibility
 */
module.exports = Node.extends(KIND, function TraitAlias(
  trait,
  method,
  as,
  flags,
  docs,
  location
) {
  Node.apply(this, [KIND, docs, location]);
  this.trait = trait;
  this.method = method;
  this.as = as;
  this.visibility = IS_UNDEFINED;
  if (flags) {
    if (flags[0] === 0) {
      this.visibility = IS_PUBLIC;
    } else if (flags[0] === 1) {
      this.visibility = IS_PROTECTED;
    } else if (flags[0] === 2) {
      this.visibility = IS_PRIVATE;
    }
  }
});


/***/ }),

/***/ 8816:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Node = __webpack_require__(9675);
const KIND = "traitprecedence";

/**
 * Defines a trait alias
 * @constructor TraitPrecedence
 * @extends {Node}
 * @property {Identifier|null} trait
 * @property {Identifier} method
 * @property {Identifier[]} instead
 */
module.exports = Node.extends(KIND, function TraitPrecedence(
  trait,
  method,
  instead,
  docs,
  location
) {
  Node.apply(this, [KIND, docs, location]);
  this.trait = trait;
  this.method = method;
  this.instead = instead;
});


/***/ }),

/***/ 1874:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Node = __webpack_require__(9675);
const KIND = "traituse";

/**
 * Defines a trait usage
 * @constructor TraitUse
 * @extends {Node}
 * @property {Identifier[]} traits
 * @property {Node[]|null} adaptations
 */
module.exports = Node.extends(KIND, function TraitUse(
  traits,
  adaptations,
  docs,
  location
) {
  Node.apply(this, [KIND, docs, location]);
  this.traits = traits;
  this.adaptations = adaptations;
});


/***/ }),

/***/ 2109:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Statement = __webpack_require__(7198);
const KIND = "try";

/**
 * Defines a try statement
 * @constructor Try
 * @extends {Statement}
 * @property {Block} body
 * @property {Catch[]} catches
 * @property {Block} allways
 */
module.exports = Statement.extends(KIND, function Try(
  body,
  catches,
  always,
  docs,
  location
) {
  Statement.apply(this, [KIND, docs, location]);
  this.body = body;
  this.catches = catches;
  this.always = always;
});


/***/ }),

/***/ 4460:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Reference = __webpack_require__(8065);
const KIND = "typereference";

/**
 * Defines a class reference node
 * @constructor TypeReference
 * @extends {Reference}
 * @property {string} name
 */
const TypeReference = Reference.extends(KIND, function TypeReference(
  name,
  raw,
  docs,
  location
) {
  Reference.apply(this, [KIND, docs, location]);
  this.name = name;
  this.raw = raw;
});

TypeReference.types = [
  "int",
  "float",
  "string",
  "bool",
  "object",
  "array",
  "callable",
  "iterable",
  "void",
];

module.exports = TypeReference;


/***/ }),

/***/ 3937:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Operation = __webpack_require__(1155);
const KIND = "unary";

/**
 * Unary operations
 * @constructor Unary
 * @extends {Operation}
 * @property {String} type
 * @property {Expression} what
 */
module.exports = Operation.extends(KIND, function Unary(
  type,
  what,
  docs,
  location
) {
  Operation.apply(this, [KIND, docs, location]);
  this.type = type;
  this.what = what;
});


/***/ }),

/***/ 2993:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Statement = __webpack_require__(7198);
const KIND = "unset";

/**
 * Deletes references to a list of variables
 * @constructor Unset
 * @extends {Statement}
 */
module.exports = Statement.extends(KIND, function Unset(
  variables,
  docs,
  location
) {
  Statement.apply(this, [KIND, docs, location]);
  this.variables = variables;
});


/***/ }),

/***/ 4492:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Statement = __webpack_require__(7198);
const KIND = "usegroup";

/**
 * Defines a use statement (with a list of use items)
 * @constructor UseGroup
 * @extends {Statement}
 * @property {String|null} name
 * @property {String|null} type - Possible value : function, const
 * @property {UseItem[]} item
 * @see {Namespace}
 * @see http://php.net/manual/en/language.namespaces.importing.php
 */
module.exports = Statement.extends(KIND, function UseGroup(
  name,
  type,
  items,
  docs,
  location
) {
  Statement.apply(this, [KIND, docs, location]);
  this.name = name;
  this.type = type;
  this.items = items;
});


/***/ }),

/***/ 7081:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Statement = __webpack_require__(7198);
const KIND = "useitem";

/**
 * Defines a use statement (from namespace)
 * @constructor UseItem
 * @extends {Statement}
 * @property {String} name
 * @property {String|null} type - Possible value : function, const
 * @property {Identifier|null} alias
 * @see {Namespace}
 * @see http://php.net/manual/en/language.namespaces.importing.php
 */
const UseItem = Statement.extends(KIND, function UseItem(
  name,
  alias,
  type,
  docs,
  location
) {
  Statement.apply(this, [KIND, docs, location]);
  this.name = name;
  this.alias = alias;
  this.type = type;
});

/**
 * Importing a constant
 * @constant {String} TYPE_CONST
 */
UseItem.TYPE_CONST = "const";
/**
 * Importing a function
 * @constant {String} TYPE_FUNC
 */
UseItem.TYPE_FUNCTION = "function";

module.exports = UseItem;


/***/ }),

/***/ 5290:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Expression = __webpack_require__(8586);
const KIND = "variable";

/**
 * Any expression node. Since the left-hand side of an assignment may
 * be any expression in general, an expression can also be a pattern.
 * @constructor Variable
 * @extends {Expression}
 * @example
 * // PHP code :
 * $foo
 * // AST output
 * {
 *  "kind": "variable",
 *  "name": "foo",
 *  "curly": false
 * }
 * @property {String|Node} name The variable name (can be a complex expression when the name is resolved dynamically)
 * @property {boolean} curly Indicate if the name is defined between curlies, ex `${foo}`
 */
module.exports = Expression.extends(KIND, function Variable(
  name,
  curly,
  docs,
  location
) {
  Expression.apply(this, [KIND, docs, location]);
  this.name = name;
  this.curly = curly || false;
});


/***/ }),

/***/ 489:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Expression = __webpack_require__(8586);
const KIND = "variadic";

/**
 * Introduce a list of items into the arguments of the call
 * @constructor variadic
 * @extends {Expression}
 * @property {Array|Expression} what
 * @see https://wiki.php.net/rfc/argument_unpacking
 */
module.exports = Expression.extends(KIND, function variadic(
  what,
  docs,
  location
) {
  Expression.apply(this, [KIND, docs, location]);
  this.what = what;
});


/***/ }),

/***/ 7942:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Statement = __webpack_require__(7198);
const KIND = "while";

/**
 * Defines a while statement
 * @constructor While
 * @extends {Statement}
 * @property {Expression} test
 * @property {Statement} body
 * @property {boolean} shortForm
 */
module.exports = Statement.extends(KIND, function While(
  test,
  body,
  shortForm,
  docs,
  location
) {
  Statement.apply(this, [KIND, docs, location]);
  this.test = test;
  this.body = body;
  this.shortForm = shortForm;
});


/***/ }),

/***/ 9712:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Expression = __webpack_require__(8586);
const KIND = "yield";

/**
 * Defines a yield generator statement
 * @constructor Yield
 * @extends {Expression}
 * @property {Expression|Null} value
 * @property {Expression|Null} key
 * @see http://php.net/manual/en/language.generators.syntax.php
 */
module.exports = Expression.extends(KIND, function Yield(
  value,
  key,
  docs,
  location
) {
  Expression.apply(this, [KIND, docs, location]);
  this.value = value;
  this.key = key;
});


/***/ }),

/***/ 7791:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const Expression = __webpack_require__(8586);
const KIND = "yieldfrom";

/**
 * Defines a yield from generator statement
 * @constructor YieldFrom
 * @extends {Expression}
 * @property {Expression} value
 * @see http://php.net/manual/en/language.generators.syntax.php
 */
module.exports = Expression.extends(KIND, function YieldFrom(
  value,
  docs,
  location
) {
  Expression.apply(this, [KIND, docs, location]);
  this.value = value;
});


/***/ }),

/***/ 2742:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/**
 * Copyright (C) 2020 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const lexer = __webpack_require__(103);
const parser = __webpack_require__(7949);
const tokens = __webpack_require__(9025);
const AST = __webpack_require__(5353);

/**
 * @private
 */
function combine(src, to) {
  const keys = Object.keys(src);
  let i = keys.length;
  while (i--) {
    const k = keys[i];
    const val = src[k];
    if (val === null) {
      delete to[k];
    } else if (typeof val === "function") {
      to[k] = val.bind(to);
    } else if (Array.isArray(val)) {
      to[k] = Array.isArray(to[k]) ? to[k].concat(val) : val;
    } else if (typeof val === "object") {
      to[k] = typeof to[k] === "object" ? combine(val, to[k]) : val;
    } else {
      to[k] = val;
    }
  }
  return to;
}

/**
 * Initialise a new parser instance with the specified options
 *
 * @class
 * @tutorial Engine
 * @example
 * var parser = require('php-parser');
 * var instance = new parser({
 *   parser: {
 *     extractDoc: true,
 *     suppressErrors: true,
 *     version: 704 // or '7.4'
 *   },
 *   ast: {
 *     withPositions: true
 *   },
 *   lexer: {
 *     short_tags: true,
 *     asp_tags: true
 *   }
 * });
 *
 * var evalAST = instance.parseEval('some php code');
 * var codeAST = instance.parseCode('<?php some php code', 'foo.php');
 * var tokens = instance.tokenGetAll('<?php some php code');
 *
 * @param {Object} options - List of options
 * @property {Lexer} lexer
 * @property {Parser} parser
 * @property {AST} ast
 * @property {Object} tokens
 */
const engine = function (options) {
  if (typeof this === "function") {
    return new this(options);
  }
  this.tokens = tokens;
  this.lexer = new lexer(this);
  this.ast = new AST();
  this.parser = new parser(this.lexer, this.ast);
  if (options && typeof options === "object") {
    // disable php7 from lexer if already disabled from parser
    if (options.parser) {
      if (!options.lexer) {
        options.lexer = {};
      }
      if (options.parser.version) {
        if (typeof options.parser.version === "string") {
          let version = options.parser.version.split(".");
          version = parseInt(version[0]) * 100 + parseInt(version[1]);
          if (isNaN(version)) {
            throw new Error("Bad version number : " + options.parser.version);
          } else {
            options.parser.version = version;
          }
        } else if (typeof options.parser.version !== "number") {
          throw new Error("Expecting a number for version");
        }
        if (options.parser.version < 500 || options.parser.version > 704) {
          throw new Error("Can only handle versions between 5.x to 7.x");
        }
      }
    }
    combine(options, this);

    // same version flags based on parser options
    this.lexer.version = this.parser.version;
  }
};

/**
 * Check if the inpyt is a buffer or a string
 * @param  {Buffer|String} buffer Input value that can be either a buffer or a string
 * @return {String}   Returns the string from input
 */
const getStringBuffer = function (buffer) {
  return typeof buffer.write === "function" ? buffer.toString() : buffer;
};

/**
 * Creates a new instance (Helper)
 * @param {Object} options
 * @return {Engine}
 * @private
 */
engine.create = function (options) {
  return new engine(options);
};

/**
 * Evaluate the buffer
 * @private
 */
engine.parseEval = function (buffer, options) {
  const self = new engine(options);
  return self.parseEval(buffer);
};

/**
 * Parse an evaluating mode string (no need to open php tags)
 * @param {String} buffer
 * @return {Program}
 */
engine.prototype.parseEval = function (buffer) {
  this.lexer.mode_eval = true;
  this.lexer.all_tokens = false;
  buffer = getStringBuffer(buffer);
  return this.parser.parse(buffer, "eval");
};

/**
 * Static function that parse a php code with open/close tags
 * @private
 */
engine.parseCode = function (buffer, filename, options) {
  if (typeof filename === "object" && !options) {
    // retro-compatibility
    options = filename;
    filename = "unknown";
  }
  const self = new engine(options);
  return self.parseCode(buffer, filename);
};

/**
 * Function that parse a php code with open/close tags
 *
 * Sample code :
 * ```php
 * <?php $x = 1;
 * ```
 *
 * Usage :
 * ```js
 * var parser = require('php-parser');
 * var phpParser = new parser({
 *   // some options
 * });
 * var ast = phpParser.parseCode('...php code...', 'foo.php');
 * ```
 * @param {String} buffer - The code to be parsed
 * @param {String} filename - Filename
 * @return {Program}
 */
engine.prototype.parseCode = function (buffer, filename) {
  this.lexer.mode_eval = false;
  this.lexer.all_tokens = false;
  buffer = getStringBuffer(buffer);
  return this.parser.parse(buffer, filename);
};

/**
 * Split the buffer into tokens
 * @private
 */
engine.tokenGetAll = function (buffer, options) {
  const self = new engine(options);
  return self.tokenGetAll(buffer);
};

/**
 * Extract tokens from the specified buffer.
 * > Note that the output tokens are *STRICLY* similar to PHP function `token_get_all`
 * @param {String} buffer
 * @return {String[]} - Each item can be a string or an array with following informations [token_name, text, line_number]
 */
engine.prototype.tokenGetAll = function (buffer) {
  this.lexer.mode_eval = false;
  this.lexer.all_tokens = true;
  buffer = getStringBuffer(buffer);
  const EOF = this.lexer.EOF;
  const names = this.tokens.values;
  this.lexer.setInput(buffer);
  let token = this.lexer.lex() || EOF;
  const result = [];
  while (token != EOF) {
    let entry = this.lexer.yytext;
    if (names.hasOwnProperty(token)) {
      entry = [names[token], entry, this.lexer.yylloc.first_line];
    }
    result.push(entry);
    token = this.lexer.lex() || EOF;
  }
  return result;
};

// exports the function
module.exports = engine;

// makes libraries public
module.exports.tokens = tokens;
module.exports.lexer = lexer;
module.exports.AST = AST;
module.exports.parser = parser;
module.exports.combine = combine;

// allow the default export in index.d.ts
module.exports.default = engine;


/***/ }),

/***/ 103:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


/**
 * This is the php lexer. It will tokenize the string for helping the
 * parser to build the AST from its grammar.
 *
 * @class
 * @property {Integer} EOF
 * @property {Boolean} all_tokens defines if all tokens must be retrieved (used by token_get_all only)
 * @property {Boolean} comment_tokens extracts comments tokens
 * @property {Boolean} mode_eval enables the evald mode (ignore opening tags)
 * @property {Boolean} asp_tags disables by default asp tags mode
 * @property {Boolean} short_tags enables by default short tags mode
 * @property {Object} keywords List of php keyword
 * @property {Object} castKeywords List of php keywords for type casting
 */
const lexer = function (engine) {
  this.engine = engine;
  this.tok = this.engine.tokens.names;
  this.EOF = 1;
  this.debug = false;
  this.all_tokens = true;
  this.comment_tokens = false;
  this.mode_eval = false;
  this.asp_tags = false;
  this.short_tags = false;
  this.version = 704;
  this.yyprevcol = 0;
  this.keywords = {
    __class__: this.tok.T_CLASS_C,
    __trait__: this.tok.T_TRAIT_C,
    __function__: this.tok.T_FUNC_C,
    __method__: this.tok.T_METHOD_C,
    __line__: this.tok.T_LINE,
    __file__: this.tok.T_FILE,
    __dir__: this.tok.T_DIR,
    __namespace__: this.tok.T_NS_C,
    exit: this.tok.T_EXIT,
    die: this.tok.T_EXIT,
    function: this.tok.T_FUNCTION,
    const: this.tok.T_CONST,
    return: this.tok.T_RETURN,
    try: this.tok.T_TRY,
    catch: this.tok.T_CATCH,
    finally: this.tok.T_FINALLY,
    throw: this.tok.T_THROW,
    if: this.tok.T_IF,
    elseif: this.tok.T_ELSEIF,
    endif: this.tok.T_ENDIF,
    else: this.tok.T_ELSE,
    while: this.tok.T_WHILE,
    endwhile: this.tok.T_ENDWHILE,
    do: this.tok.T_DO,
    for: this.tok.T_FOR,
    endfor: this.tok.T_ENDFOR,
    foreach: this.tok.T_FOREACH,
    endforeach: this.tok.T_ENDFOREACH,
    declare: this.tok.T_DECLARE,
    enddeclare: this.tok.T_ENDDECLARE,
    instanceof: this.tok.T_INSTANCEOF,
    as: this.tok.T_AS,
    switch: this.tok.T_SWITCH,
    endswitch: this.tok.T_ENDSWITCH,
    case: this.tok.T_CASE,
    default: this.tok.T_DEFAULT,
    break: this.tok.T_BREAK,
    continue: this.tok.T_CONTINUE,
    goto: this.tok.T_GOTO,
    echo: this.tok.T_ECHO,
    print: this.tok.T_PRINT,
    class: this.tok.T_CLASS,
    interface: this.tok.T_INTERFACE,
    trait: this.tok.T_TRAIT,
    extends: this.tok.T_EXTENDS,
    implements: this.tok.T_IMPLEMENTS,
    new: this.tok.T_NEW,
    clone: this.tok.T_CLONE,
    var: this.tok.T_VAR,
    eval: this.tok.T_EVAL,
    include: this.tok.T_INCLUDE,
    include_once: this.tok.T_INCLUDE_ONCE,
    require: this.tok.T_REQUIRE,
    require_once: this.tok.T_REQUIRE_ONCE,
    namespace: this.tok.T_NAMESPACE,
    use: this.tok.T_USE,
    insteadof: this.tok.T_INSTEADOF,
    global: this.tok.T_GLOBAL,
    isset: this.tok.T_ISSET,
    empty: this.tok.T_EMPTY,
    __halt_compiler: this.tok.T_HALT_COMPILER,
    static: this.tok.T_STATIC,
    abstract: this.tok.T_ABSTRACT,
    final: this.tok.T_FINAL,
    private: this.tok.T_PRIVATE,
    protected: this.tok.T_PROTECTED,
    public: this.tok.T_PUBLIC,
    unset: this.tok.T_UNSET,
    list: this.tok.T_LIST,
    array: this.tok.T_ARRAY,
    callable: this.tok.T_CALLABLE,
    or: this.tok.T_LOGICAL_OR,
    and: this.tok.T_LOGICAL_AND,
    xor: this.tok.T_LOGICAL_XOR,
  };
  this.castKeywords = {
    int: this.tok.T_INT_CAST,
    integer: this.tok.T_INT_CAST,
    real: this.tok.T_DOUBLE_CAST,
    double: this.tok.T_DOUBLE_CAST,
    float: this.tok.T_DOUBLE_CAST,
    string: this.tok.T_STRING_CAST,
    binary: this.tok.T_STRING_CAST,
    array: this.tok.T_ARRAY_CAST,
    object: this.tok.T_OBJECT_CAST,
    bool: this.tok.T_BOOL_CAST,
    boolean: this.tok.T_BOOL_CAST,
    unset: this.tok.T_UNSET_CAST,
  };
};

/**
 * Initialize the lexer with the specified input
 */
lexer.prototype.setInput = function (input) {
  this._input = input;
  this.size = input.length;
  this.yylineno = 1;
  this.offset = 0;
  this.yyprevcol = 0;
  this.yytext = "";
  this.yylloc = {
    first_offset: 0,
    first_line: 1,
    first_column: 0,
    prev_offset: 0,
    prev_line: 1,
    prev_column: 0,
    last_line: 1,
    last_column: 0,
  };
  this.tokens = [];
  if (this.version > 703) {
    this.keywords.fn = this.tok.T_FN;
  } else {
    delete this.keywords.fn;
  }
  this.done = this.offset >= this.size;
  if (!this.all_tokens && this.mode_eval) {
    this.conditionStack = ["INITIAL"];
    this.begin("ST_IN_SCRIPTING");
  } else {
    this.conditionStack = [];
    this.begin("INITIAL");
  }
  // https://github.com/php/php-src/blob/999e32b65a8a4bb59e27e538fa68ffae4b99d863/Zend/zend_language_scanner.h#L59
  // Used for heredoc and nowdoc
  this.heredoc_label = {
    label: "",
    length: 0,
    indentation: 0,
    indentation_uses_spaces: false,
    finished: false,
    /**
     * this used for parser to detemine the if current node segment is first encaps node.
     * if ture, the indentation will remove from the begining. and if false, the prev node
     * might be a variable '}' ,and the leading spaces should not be removed util meet the
     * first \n
     */
    first_encaps_node: false,
    // for backward compatible
    toString: function () {
      this.label;
    },
  };
  return this;
};

/**
 * consumes and returns one char from the input
 */
lexer.prototype.input = function () {
  const ch = this._input[this.offset];
  if (!ch) return "";
  this.yytext += ch;
  this.offset++;
  if (ch === "\r" && this._input[this.offset] === "\n") {
    this.yytext += "\n";
    this.offset++;
  }
  if (ch === "\n" || ch === "\r") {
    this.yylloc.last_line = ++this.yylineno;
    this.yyprevcol = this.yylloc.last_column;
    this.yylloc.last_column = 0;
  } else {
    this.yylloc.last_column++;
  }
  return ch;
};

/**
 * revert eating specified size
 */
lexer.prototype.unput = function (size) {
  if (size === 1) {
    // 1 char unput (most cases)
    this.offset--;
    if (
      this._input[this.offset] === "\n" &&
      this._input[this.offset - 1] === "\r"
    ) {
      this.offset--;
      size++;
    }
    if (
      this._input[this.offset] === "\r" ||
      this._input[this.offset] === "\n"
    ) {
      this.yylloc.last_line--;
      this.yylineno--;
      this.yylloc.last_column = this.yyprevcol;
    } else {
      this.yylloc.last_column--;
    }
    this.yytext = this.yytext.substring(0, this.yytext.length - size);
  } else if (size > 0) {
    this.offset -= size;
    if (size < this.yytext.length) {
      this.yytext = this.yytext.substring(0, this.yytext.length - size);
      // re-calculate position
      this.yylloc.last_line = this.yylloc.first_line;
      this.yylloc.last_column = this.yyprevcol = this.yylloc.first_column;
      for (let i = 0; i < this.yytext.length; i++) {
        let c = this.yytext[i];
        if (c === "\r") {
          c = this.yytext[++i];
          this.yyprevcol = this.yylloc.last_column;
          this.yylloc.last_line++;
          this.yylloc.last_column = 0;
          if (c !== "\n") {
            if (c === "\r") {
              this.yylloc.last_line++;
            } else {
              this.yylloc.last_column++;
            }
          }
        } else if (c === "\n") {
          this.yyprevcol = this.yylloc.last_column;
          this.yylloc.last_line++;
          this.yylloc.last_column = 0;
        } else {
          this.yylloc.last_column++;
        }
      }
      this.yylineno = this.yylloc.last_line;
    } else {
      // reset full text
      this.yytext = "";
      this.yylloc.last_line = this.yylineno = this.yylloc.first_line;
      this.yylloc.last_column = this.yylloc.first_column;
    }
  }

  return this;
};

// check if the text matches
lexer.prototype.tryMatch = function (text) {
  return text === this.ahead(text.length);
};

// check if the text matches
lexer.prototype.tryMatchCaseless = function (text) {
  return text === this.ahead(text.length).toLowerCase();
};

// look ahead
lexer.prototype.ahead = function (size) {
  let text = this._input.substring(this.offset, this.offset + size);
  if (
    text[text.length - 1] === "\r" &&
    this._input[this.offset + size + 1] === "\n"
  ) {
    text += "\n";
  }
  return text;
};

// consume the specified size
lexer.prototype.consume = function (size) {
  for (let i = 0; i < size; i++) {
    const ch = this._input[this.offset];
    if (!ch) break;
    this.yytext += ch;
    this.offset++;
    if (ch === "\r" && this._input[this.offset] === "\n") {
      this.yytext += "\n";
      this.offset++;
      i++;
    }
    if (ch === "\n" || ch === "\r") {
      this.yylloc.last_line = ++this.yylineno;
      this.yyprevcol = this.yylloc.last_column;
      this.yylloc.last_column = 0;
    } else {
      this.yylloc.last_column++;
    }
  }
  return this;
};

/**
 * Gets the current state
 */
lexer.prototype.getState = function () {
  return {
    yytext: this.yytext,
    offset: this.offset,
    yylineno: this.yylineno,
    yyprevcol: this.yyprevcol,
    yylloc: {
      first_offset: this.yylloc.first_offset,
      first_line: this.yylloc.first_line,
      first_column: this.yylloc.first_column,
      last_line: this.yylloc.last_line,
      last_column: this.yylloc.last_column,
    },
    heredoc_label: this.heredoc_label,
  };
};

/**
 * Sets the current lexer state
 */
lexer.prototype.setState = function (state) {
  this.yytext = state.yytext;
  this.offset = state.offset;
  this.yylineno = state.yylineno;
  this.yyprevcol = state.yyprevcol;
  this.yylloc = state.yylloc;
  if (state.heredoc_label) {
    this.heredoc_label = state.heredoc_label;
  }
  return this;
};

// prepend next token
lexer.prototype.appendToken = function (value, ahead) {
  this.tokens.push([value, ahead]);
  return this;
};

// return next match that has a token
lexer.prototype.lex = function () {
  this.yylloc.prev_offset = this.offset;
  this.yylloc.prev_line = this.yylloc.last_line;
  this.yylloc.prev_column = this.yylloc.last_column;
  let token = this.next() || this.lex();
  if (!this.all_tokens) {
    while (
      token === this.tok.T_WHITESPACE || // ignore white space
      (!this.comment_tokens &&
        (token === this.tok.T_COMMENT || // ignore single lines comments
          token === this.tok.T_DOC_COMMENT)) || // ignore doc comments
      // ignore open tags
      token === this.tok.T_OPEN_TAG
    ) {
      token = this.next() || this.lex();
    }
    if (token == this.tok.T_OPEN_TAG_WITH_ECHO) {
      // https://github.com/php/php-src/blob/7ff186434e82ee7be7c59d0db9a976641cf7b09c/Zend/zend_compile.c#L1683
      // open tag with echo statement
      return this.tok.T_ECHO;
    } else if (token === this.tok.T_CLOSE_TAG) {
      // https://github.com/php/php-src/blob/7ff186434e82ee7be7c59d0db9a976641cf7b09c/Zend/zend_compile.c#L1680
      return ";"; /* implicit ; */
    }
  }
  if (!this.yylloc.prev_offset) {
    this.yylloc.prev_offset = this.yylloc.first_offset;
    this.yylloc.prev_line = this.yylloc.first_line;
    this.yylloc.prev_column = this.yylloc.first_column;
  }
  /*else if (this.yylloc.prev_offset === this.offset && this.offset !== this.size) {
    throw new Error('Infinite loop @ ' + this.offset + ' / ' + this.size);
  }*/
  return token;
};

// activates a new lexer condition state (pushes the new lexer condition state onto the condition stack)
lexer.prototype.begin = function (condition) {
  this.conditionStack.push(condition);
  this.curCondition = condition;
  this.stateCb = this["match" + condition];
  if (typeof this.stateCb !== "function") {
    throw new Error('Undefined condition state "' + condition + '"');
  }
  return this;
};

// pop the previously active lexer condition state off the condition stack
lexer.prototype.popState = function () {
  const n = this.conditionStack.length - 1;
  const condition = n > 0 ? this.conditionStack.pop() : this.conditionStack[0];
  this.curCondition = this.conditionStack[this.conditionStack.length - 1];
  this.stateCb = this["match" + this.curCondition];
  if (typeof this.stateCb !== "function") {
    throw new Error('Undefined condition state "' + this.curCondition + '"');
  }
  return condition;
};

// return next match in input
lexer.prototype.next = function () {
  let token;
  if (!this._input) {
    this.done = true;
  }
  this.yylloc.first_offset = this.offset;
  this.yylloc.first_line = this.yylloc.last_line;
  this.yylloc.first_column = this.yylloc.last_column;
  this.yytext = "";
  if (this.done) {
    this.yylloc.prev_offset = this.yylloc.first_offset;
    this.yylloc.prev_line = this.yylloc.first_line;
    this.yylloc.prev_column = this.yylloc.first_column;
    return this.EOF;
  }
  if (this.tokens.length > 0) {
    token = this.tokens.shift();
    if (typeof token[1] === "object") {
      this.setState(token[1]);
    } else {
      this.consume(token[1]);
    }
    token = token[0];
  } else {
    token = this.stateCb.apply(this, []);
  }
  if (this.offset >= this.size && this.tokens.length === 0) {
    this.done = true;
  }
  if (this.debug) {
    let tName = token;
    if (typeof tName === "number") {
      tName = this.engine.tokens.values[tName];
    } else {
      tName = '"' + tName + '"';
    }
    const e = new Error(
      tName +
        "\tfrom " +
        this.yylloc.first_line +
        "," +
        this.yylloc.first_column +
        "\t - to " +
        this.yylloc.last_line +
        "," +
        this.yylloc.last_column +
        '\t"' +
        this.yytext +
        '"'
    );
    // eslint-disable-next-line no-console
    console.error(e.stack);
  }
  return token;
};

// extends the lexer with states
[
  __webpack_require__(3955),
  __webpack_require__(9074),
  __webpack_require__(9100),
  __webpack_require__(1026),
  __webpack_require__(2014),
  __webpack_require__(4913),
  __webpack_require__(9479),
  __webpack_require__(1138),
].forEach(function (ext) {
  for (const k in ext) {
    lexer.prototype[k] = ext[k];
  }
});

module.exports = lexer;


/***/ }),

/***/ 3955:
/***/ ((module) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


module.exports = {
  /**
   * Reads a single line comment
   */
  T_COMMENT: function () {
    while (this.offset < this.size) {
      const ch = this.input();
      if (ch === "\n" || ch === "\r") {
        return this.tok.T_COMMENT;
      } else if (
        ch === "?" &&
        !this.aspTagMode &&
        this._input[this.offset] === ">"
      ) {
        this.unput(1);
        return this.tok.T_COMMENT;
      } else if (
        ch === "%" &&
        this.aspTagMode &&
        this._input[this.offset] === ">"
      ) {
        this.unput(1);
        return this.tok.T_COMMENT;
      }
    }
    return this.tok.T_COMMENT;
  },
  /**
   * Behaviour : https://github.com/php/php-src/blob/master/Zend/zend_language_scanner.l#L1927
   */
  T_DOC_COMMENT: function () {
    let ch = this.input();
    let token = this.tok.T_COMMENT;
    if (ch === "*") {
      // started with '/*' , check is next is '*'
      ch = this.input();
      if (this.is_WHITESPACE()) {
        // check if next is WHITESPACE
        token = this.tok.T_DOC_COMMENT;
      }
      if (ch === "/") {
        return token;
      } else {
        this.unput(1); // reset
      }
    }
    while (this.offset < this.size) {
      ch = this.input();
      if (ch === "*" && this._input[this.offset] === "/") {
        this.input();
        break;
      }
    }
    return token;
  },
};


/***/ }),

/***/ 9074:
/***/ ((module) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


module.exports = {
  nextINITIAL: function () {
    if (
      this.conditionStack.length > 1 &&
      this.conditionStack[this.conditionStack.length - 1] === "INITIAL"
    ) {
      // Return to HEREDOC/ST_DOUBLE_QUOTES mode
      this.popState();
    } else {
      this.begin("ST_IN_SCRIPTING");
    }
    return this;
  },
  matchINITIAL: function () {
    while (this.offset < this.size) {
      let ch = this.input();
      if (ch == "<") {
        ch = this.ahead(1);
        if (ch == "?") {
          if (this.tryMatch("?=")) {
            this.unput(1)
              .appendToken(this.tok.T_OPEN_TAG_WITH_ECHO, 3)
              .nextINITIAL();
            break;
          } else if (this.tryMatchCaseless("?php")) {
            ch = this._input[this.offset + 4];
            if (ch === " " || ch === "\t" || ch === "\n" || ch === "\r") {
              this.unput(1).appendToken(this.tok.T_OPEN_TAG, 6).nextINITIAL();
              break;
            }
          }
          if (this.short_tags) {
            this.unput(1).appendToken(this.tok.T_OPEN_TAG, 2).nextINITIAL();
            break;
          }
        } else if (this.asp_tags && ch == "%") {
          if (this.tryMatch("%=")) {
            this.aspTagMode = true;
            this.unput(1)
              .appendToken(this.tok.T_OPEN_TAG_WITH_ECHO, 3)
              .nextINITIAL();
            break;
          } else {
            this.aspTagMode = true;
            this.unput(1).appendToken(this.tok.T_OPEN_TAG, 2).nextINITIAL();
            break;
          }
        }
      }
    }
    if (this.yytext.length > 0) {
      return this.tok.T_INLINE_HTML;
    } else {
      return false;
    }
  },
};


/***/ }),

/***/ 9100:
/***/ ((module) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


/* istanbul ignore else  */
let MAX_LENGTH_OF_LONG = 10;
let long_min_digits = "2147483648";
if (process.arch == "x64") {
  MAX_LENGTH_OF_LONG = 19;
  long_min_digits = "9223372036854775808";
}

module.exports = {
  consume_NUM: function () {
    let ch = this.yytext[0];
    let hasPoint = ch === ".";
    if (ch === "0") {
      ch = this.input();
      // check if hexa
      if (ch === "x" || ch === "X") {
        ch = this.input();
        if (ch !== "_" && this.is_HEX()) {
          return this.consume_HNUM();
        } else {
          this.unput(ch ? 2 : 1);
        }
        // check binary notation
      } else if (ch === "b" || ch === "B") {
        ch = this.input();
        if ((ch !== "_" && ch === "0") || ch === "1") {
          return this.consume_BNUM();
        } else {
          this.unput(ch ? 2 : 1);
        }
        // @fixme check octal notation ? not usefull
      } else if (!this.is_NUM()) {
        if (ch) this.unput(1);
      }
    }

    while (this.offset < this.size) {
      const prev = ch;
      ch = this.input();

      if (ch === "_") {
        if (prev === "_") {
          // restriction : next to underscore / 1__1;
          this.unput(2); // keep 1
          break;
        }
        if (prev === ".") {
          // next to decimal point  "1._0"
          this.unput(1); // keep 1.
          break;
        }
        if (prev === "e" || prev === "E") {
          // next to e "1e_10"
          this.unput(2); // keep 1
          break;
        }
      } else if (ch === ".") {
        if (hasPoint) {
          // no multiple points "1.0.5"
          this.unput(1); // keep 1.0
          break;
        }
        if (prev === "_") {
          // next to decimal point  "1_.0"
          this.unput(2); // keep 1
          break;
        }
        hasPoint = true;
        continue;
      } else if (ch === "e" || ch === "E") {
        if (prev === "_") {
          // next to e "1_e10"
          this.unput(1);
          break;
        }
        let undo = 2;
        ch = this.input();
        if (ch === "+" || ch === "-") {
          // 1e-5
          undo = 3;
          ch = this.input();
        }
        if (this.is_NUM_START()) {
          this.consume_LNUM();
          return this.tok.T_DNUMBER;
        }
        this.unput(ch ? undo : undo - 1); // keep only 1
        break;
      }

      if (!this.is_NUM()) {
        // example : 10.0a
        if (ch) this.unput(1); // keep 10.0
        break;
      }
    }

    if (hasPoint) {
      return this.tok.T_DNUMBER;
    } else if (this.yytext.length < MAX_LENGTH_OF_LONG - 1) {
      return this.tok.T_LNUMBER;
    } else {
      if (
        this.yytext.length < MAX_LENGTH_OF_LONG ||
        (this.yytext.length == MAX_LENGTH_OF_LONG &&
          this.yytext < long_min_digits)
      ) {
        return this.tok.T_LNUMBER;
      }
      return this.tok.T_DNUMBER;
    }
  },
  // read hexa
  consume_HNUM: function () {
    while (this.offset < this.size) {
      const ch = this.input();
      if (!this.is_HEX()) {
        if (ch) this.unput(1);
        break;
      }
    }
    return this.tok.T_LNUMBER;
  },
  // read a generic number
  consume_LNUM: function () {
    while (this.offset < this.size) {
      const ch = this.input();
      if (!this.is_NUM()) {
        if (ch) this.unput(1);
        break;
      }
    }
    return this.tok.T_LNUMBER;
  },
  // read binary
  consume_BNUM: function () {
    let ch;
    while (this.offset < this.size) {
      ch = this.input();
      if (ch !== "0" && ch !== "1" && ch !== "_") {
        if (ch) this.unput(1);
        break;
      }
    }
    return this.tok.T_LNUMBER;
  },
};


/***/ }),

/***/ 1026:
/***/ ((module) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


module.exports = {
  matchST_LOOKING_FOR_PROPERTY: function () {
    let ch = this.input();
    if (ch === "-") {
      ch = this.input();
      if (ch === ">") {
        // https://github.com/php/php-src/blob/master/Zend/zend_language_scanner.l#L1296
        return this.tok.T_OBJECT_OPERATOR;
      }
      if (ch) this.unput(1);
    } else if (this.is_WHITESPACE()) {
      return this.tok.T_WHITESPACE;
    } else if (this.is_LABEL_START()) {
      // https://github.com/php/php-src/blob/master/Zend/zend_language_scanner.l#L1300
      this.consume_LABEL();
      this.popState();
      return this.tok.T_STRING;
    }
    // https://github.com/php/php-src/blob/master/Zend/zend_language_scanner.l#L1306
    this.popState();
    if (ch) this.unput(1);
    return false;
  },
  matchST_LOOKING_FOR_VARNAME: function () {
    let ch = this.input();

    // SHIFT STATE
    this.popState();
    this.begin("ST_IN_SCRIPTING");

    if (this.is_LABEL_START()) {
      this.consume_LABEL();
      ch = this.input();
      if (ch === "[" || ch === "}") {
        this.unput(1);
        return this.tok.T_STRING_VARNAME;
      } else {
        // any char (that's started with a label sequence)
        this.unput(this.yytext.length);
      }
    } else {
      // any char (thats not a label start sequence)
      if (ch) this.unput(1);
    }
    // stops looking for a varname and starts the scripting mode
    return false;
  },
  matchST_VAR_OFFSET: function () {
    const ch = this.input();
    if (this.is_NUM_START()) {
      this.consume_NUM();
      return this.tok.T_NUM_STRING;
    } else if (ch === "]") {
      this.popState();
      return "]";
    } else if (ch === "$") {
      this.input();
      if (this.is_LABEL_START()) {
        this.consume_LABEL();
        return this.tok.T_VARIABLE;
      } else {
        throw new Error("Unexpected terminal");
      }
    } else if (this.is_LABEL_START()) {
      this.consume_LABEL();
      return this.tok.T_STRING;
    } else if (
      this.is_WHITESPACE() ||
      ch === "\\" ||
      ch === "'" ||
      ch === "#"
    ) {
      return this.tok.T_ENCAPSED_AND_WHITESPACE;
    } else if (
      ch === "[" ||
      ch === "{" ||
      ch === "}" ||
      ch === '"' ||
      ch === "`" ||
      this.is_TOKEN()
    ) {
      return ch;
    } else {
      throw new Error("Unexpected terminal");
    }
  },
};


/***/ }),

/***/ 2014:
/***/ ((module) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


module.exports = {
  matchST_IN_SCRIPTING: function () {
    let ch = this.input();
    switch (ch) {
      case " ":
      case "\t":
      case "\n":
      case "\r":
      case "\r\n":
        return this.T_WHITESPACE();
      case "#":
        return this.T_COMMENT();
      case "/":
        if (this._input[this.offset] === "/") {
          return this.T_COMMENT();
        } else if (this._input[this.offset] === "*") {
          this.input();
          return this.T_DOC_COMMENT();
        }
        return this.consume_TOKEN();
      case "'":
        return this.T_CONSTANT_ENCAPSED_STRING();
      case '"':
        return this.ST_DOUBLE_QUOTES();
      case "`":
        this.begin("ST_BACKQUOTE");
        return "`";
      case "?":
        if (!this.aspTagMode && this.tryMatch(">")) {
          this.input();
          const nextCH = this._input[this.offset];
          if (nextCH === "\n" || nextCH === "\r") this.input();
          if (this.conditionStack.length > 1) {
            this.begin("INITIAL");
          }
          return this.tok.T_CLOSE_TAG;
        }
        return this.consume_TOKEN();
      case "%":
        if (this.aspTagMode && this._input[this.offset] === ">") {
          this.input(); // consume the '>'
          ch = this._input[this.offset]; // read next
          if (ch === "\n" || ch === "\r") {
            this.input(); // consume the newline
          }
          this.aspTagMode = false;
          if (this.conditionStack.length > 1) {
            this.begin("INITIAL");
          }
          return this.tok.T_CLOSE_TAG;
        }
        return this.consume_TOKEN();
      case "{":
        this.begin("ST_IN_SCRIPTING");
        return "{";
      case "}":
        if (this.conditionStack.length > 2) {
          // Return to HEREDOC/ST_DOUBLE_QUOTES mode
          this.popState();
        }
        return "}";
      default:
        if (ch === ".") {
          ch = this.input();
          if (this.is_NUM_START()) {
            return this.consume_NUM();
          } else {
            if (ch) this.unput(1);
          }
        }
        if (this.is_NUM_START()) {
          return this.consume_NUM();
        } else if (this.is_LABEL_START()) {
          return this.consume_LABEL().T_STRING();
        } else if (this.is_TOKEN()) {
          return this.consume_TOKEN();
        }
    }
    throw new Error(
      'Bad terminal sequence "' +
        ch +
        '" at line ' +
        this.yylineno +
        " (offset " +
        this.offset +
        ")"
    );
  },

  T_WHITESPACE: function () {
    while (this.offset < this.size) {
      const ch = this.input();
      if (ch === " " || ch === "\t" || ch === "\n" || ch === "\r") {
        continue;
      }
      if (ch) this.unput(1);
      break;
    }
    return this.tok.T_WHITESPACE;
  },
};


/***/ }),

/***/ 4913:
/***/ ((module) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const newline = ["\n", "\r"];
const valid_after_heredoc = ["\n", "\r", ";"];
const valid_after_heredoc_73 = valid_after_heredoc.concat([
  "\t",
  " ",
  ",",
  "]",
  ")",
  "/",
  "=",
  "!",
]);

module.exports = {
  T_CONSTANT_ENCAPSED_STRING: function () {
    let ch;
    while (this.offset < this.size) {
      ch = this.input();
      if (ch == "\\") {
        this.input();
      } else if (ch == "'") {
        break;
      }
    }
    return this.tok.T_CONSTANT_ENCAPSED_STRING;
  },
  // check if matching a HEREDOC state
  is_HEREDOC: function () {
    const revert = this.offset;
    if (
      this._input[this.offset - 1] === "<" &&
      this._input[this.offset] === "<" &&
      this._input[this.offset + 1] === "<"
    ) {
      this.offset += 3;

      // optional tabs / spaces
      if (this.is_TABSPACE()) {
        while (this.offset < this.size) {
          this.offset++;
          if (!this.is_TABSPACE()) {
            break;
          }
        }
      }

      // optional quotes
      let tChar = this._input[this.offset - 1];
      if (tChar === "'" || tChar === '"') {
        this.offset++;
      } else {
        tChar = null;
      }

      // required label
      if (this.is_LABEL_START()) {
        let yyoffset = this.offset - 1;
        while (this.offset < this.size) {
          this.offset++;
          if (!this.is_LABEL()) {
            break;
          }
        }
        const yylabel = this._input.substring(yyoffset, this.offset - 1);
        if (!tChar || tChar === this._input[this.offset - 1]) {
          // required ending quote
          if (tChar) this.offset++;
          // require newline
          if (newline.includes(this._input[this.offset - 1])) {
            // go go go
            this.heredoc_label.label = yylabel;
            this.heredoc_label.length = yylabel.length;
            this.heredoc_label.finished = false;
            yyoffset = this.offset - revert;
            this.offset = revert;
            this.consume(yyoffset);
            if (tChar === "'") {
              this.begin("ST_NOWDOC");
            } else {
              this.begin("ST_HEREDOC");
            }
            // prematch to get the indentation information from end of doc
            this.prematch_ENDOFDOC();
            return this.tok.T_START_HEREDOC;
          }
        }
      }
    }
    this.offset = revert;
    return false;
  },
  ST_DOUBLE_QUOTES: function () {
    let ch;
    while (this.offset < this.size) {
      ch = this.input();
      if (ch == "\\") {
        this.input();
      } else if (ch == '"') {
        break;
      } else if (ch == "$") {
        ch = this.input();
        if (ch == "{" || this.is_LABEL_START()) {
          this.unput(2);
          break;
        }
        if (ch) this.unput(1);
      } else if (ch == "{") {
        ch = this.input();
        if (ch == "$") {
          this.unput(2);
          break;
        }
        if (ch) this.unput(1);
      }
    }
    if (ch == '"') {
      return this.tok.T_CONSTANT_ENCAPSED_STRING;
    } else {
      let prefix = 1;
      if (this.yytext[0] === "b" || this.yytext[0] === "B") {
        prefix = 2;
      }
      if (this.yytext.length > 2) {
        this.appendToken(
          this.tok.T_ENCAPSED_AND_WHITESPACE,
          this.yytext.length - prefix
        );
      }
      this.unput(this.yytext.length - prefix);
      this.begin("ST_DOUBLE_QUOTES");
      return this.yytext;
    }
  },

  // check if its a DOC end sequence
  isDOC_MATCH: function (offset, consumeLeadingSpaces) {
    // @fixme : check if out of text limits

    // consumeLeadingSpaces is false happen DOC prematch END HEREDOC stage.

    // Ensure current state is really after a new line break, not after a such as ${variables}
    const prev_ch = this._input[offset - 2];
    if (!newline.includes(prev_ch)) {
      return false;
    }

    // skip leading spaces or tabs
    let indentation_uses_spaces = false;
    let indentation_uses_tabs = false;
    // reset heredoc_label structure
    let indentation = 0;
    let leading_ch = this._input[offset - 1];

    if (this.version >= 703) {
      while (leading_ch === "\t" || leading_ch === " ") {
        if (leading_ch === " ") {
          indentation_uses_spaces = true;
        } else if (leading_ch === "\t") {
          indentation_uses_tabs = true;
        }

        leading_ch = this._input[offset + indentation];
        indentation++;
      }

      // Move offset to skip leading whitespace
      offset = offset + indentation;

      // return out if there was only whitespace on this line
      if (newline.includes(this._input[offset - 1])) {
        return false;
      }
    }

    if (
      this._input.substring(
        offset - 1,
        offset - 1 + this.heredoc_label.length
      ) === this.heredoc_label.label
    ) {
      const ch = this._input[offset - 1 + this.heredoc_label.length];
      if (
        (this.version >= 703
          ? valid_after_heredoc_73
          : valid_after_heredoc
        ).includes(ch)
      ) {
        if (consumeLeadingSpaces) {
          this.consume(indentation);
          // https://wiki.php.net/rfc/flexible_heredoc_nowdoc_syntaxes
          if (indentation_uses_spaces && indentation_uses_tabs) {
            throw new Error(
              "Parse error:  mixing spaces and tabs in ending marker at line " +
                this.yylineno +
                " (offset " +
                this.offset +
                ")"
            );
          }
        } else {
          // Called in prematch_ENDOFDOC
          this.heredoc_label.indentation = indentation;
          this.heredoc_label.indentation_uses_spaces = indentation_uses_spaces;
          this.heredoc_label.first_encaps_node = true;
        }
        return true;
      }
    }

    return false;
  },

  /**
   * Prematch the end of HEREDOC/NOWDOC end tag to preset the
   * context of this.heredoc_label
   */
  prematch_ENDOFDOC: function () {
    // reset heredoc
    this.heredoc_label.indentation_uses_spaces = false;
    this.heredoc_label.indentation = 0;
    this.heredoc_label.first_encaps_node = true;
    let offset = this.offset + 1;

    while (offset < this._input.length) {
      // if match heredoc_label structrue will be set
      if (this.isDOC_MATCH(offset, false)) {
        return;
      }

      if (!newline.includes(this._input[offset - 1])) {
        // skip one line
        while (
          !newline.includes(this._input[offset++]) &&
          offset < this._input.length
        ) {
          // skip
        }
      }

      offset++;
    }
  },

  matchST_NOWDOC: function () {
    /** edge case : empty now doc **/
    if (this.isDOC_MATCH(this.offset, true)) {
      // @fixme : never reached (may be caused by quotes)
      this.consume(this.heredoc_label.length);
      this.popState();
      return this.tok.T_END_HEREDOC;
    }
    /** SCANNING CONTENTS **/
    let ch = this._input[this.offset - 1];
    while (this.offset < this.size) {
      if (newline.includes(ch)) {
        ch = this.input();
        if (this.isDOC_MATCH(this.offset, true)) {
          this.unput(1).popState();
          this.appendToken(this.tok.T_END_HEREDOC, this.heredoc_label.length);
          return this.tok.T_ENCAPSED_AND_WHITESPACE;
        }
      } else {
        ch = this.input();
      }
    }
    // too bad ! reached end of document (will get a parse error)
    return this.tok.T_ENCAPSED_AND_WHITESPACE;
  },

  matchST_HEREDOC: function () {
    /** edge case : empty here doc **/
    let ch = this.input();
    if (this.isDOC_MATCH(this.offset, true)) {
      this.consume(this.heredoc_label.length - 1);
      this.popState();
      return this.tok.T_END_HEREDOC;
    }
    /** SCANNING CONTENTS **/
    while (this.offset < this.size) {
      if (ch === "\\") {
        ch = this.input(); // ignore next
        if (!newline.includes(ch)) {
          ch = this.input();
        }
      }

      if (newline.includes(ch)) {
        ch = this.input();
        if (this.isDOC_MATCH(this.offset, true)) {
          this.unput(1).popState();
          this.appendToken(this.tok.T_END_HEREDOC, this.heredoc_label.length);
          return this.tok.T_ENCAPSED_AND_WHITESPACE;
        }
      } else if (ch === "$") {
        ch = this.input();
        if (ch === "{") {
          // start of ${
          this.begin("ST_LOOKING_FOR_VARNAME");
          if (this.yytext.length > 2) {
            this.appendToken(this.tok.T_DOLLAR_OPEN_CURLY_BRACES, 2);
            this.unput(2);
            return this.tok.T_ENCAPSED_AND_WHITESPACE;
          } else {
            return this.tok.T_DOLLAR_OPEN_CURLY_BRACES;
          }
        } else if (this.is_LABEL_START()) {
          // start of $var...
          const yyoffset = this.offset;
          const next = this.consume_VARIABLE();
          if (this.yytext.length > this.offset - yyoffset + 2) {
            this.appendToken(next, this.offset - yyoffset + 2);
            this.unput(this.offset - yyoffset + 2);
            return this.tok.T_ENCAPSED_AND_WHITESPACE;
          } else {
            return next;
          }
          //console.log(this.yytext);
        }
      } else if (ch === "{") {
        ch = this.input();
        if (ch === "$") {
          // start of {$...
          this.begin("ST_IN_SCRIPTING");
          if (this.yytext.length > 2) {
            this.appendToken(this.tok.T_CURLY_OPEN, 1);
            this.unput(2);
            return this.tok.T_ENCAPSED_AND_WHITESPACE;
          } else {
            this.unput(1);
            return this.tok.T_CURLY_OPEN;
          }
        }
      } else {
        ch = this.input();
      }
    }

    // too bad ! reached end of document (will get a parse error)
    return this.tok.T_ENCAPSED_AND_WHITESPACE;
  },

  consume_VARIABLE: function () {
    this.consume_LABEL();
    const ch = this.input();
    if (ch == "[") {
      this.unput(1);
      this.begin("ST_VAR_OFFSET");
      return this.tok.T_VARIABLE;
    } else if (ch === "-") {
      if (this.input() === ">") {
        this.input();
        if (this.is_LABEL_START()) {
          this.begin("ST_LOOKING_FOR_PROPERTY");
        }
        this.unput(3);
        return this.tok.T_VARIABLE;
      } else {
        this.unput(2);
      }
    } else {
      if (ch) this.unput(1);
    }
    return this.tok.T_VARIABLE;
  },
  // HANDLES BACKQUOTES
  matchST_BACKQUOTE: function () {
    let ch = this.input();
    if (ch === "$") {
      ch = this.input();
      if (ch === "{") {
        this.begin("ST_LOOKING_FOR_VARNAME");
        return this.tok.T_DOLLAR_OPEN_CURLY_BRACES;
      } else if (this.is_LABEL_START()) {
        const tok = this.consume_VARIABLE();
        return tok;
      }
    } else if (ch === "{") {
      if (this._input[this.offset] === "$") {
        this.begin("ST_IN_SCRIPTING");
        return this.tok.T_CURLY_OPEN;
      }
    } else if (ch === "`") {
      this.popState();
      return "`";
    }

    // any char
    while (this.offset < this.size) {
      if (ch === "\\") {
        this.input();
      } else if (ch === "`") {
        this.unput(1);
        this.popState();
        this.appendToken("`", 1);
        break;
      } else if (ch === "$") {
        ch = this.input();
        if (ch === "{") {
          this.begin("ST_LOOKING_FOR_VARNAME");
          if (this.yytext.length > 2) {
            this.appendToken(this.tok.T_DOLLAR_OPEN_CURLY_BRACES, 2);
            this.unput(2);
            return this.tok.T_ENCAPSED_AND_WHITESPACE;
          } else {
            return this.tok.T_DOLLAR_OPEN_CURLY_BRACES;
          }
        } else if (this.is_LABEL_START()) {
          // start of $var...
          const yyoffset = this.offset;
          const next = this.consume_VARIABLE();
          if (this.yytext.length > this.offset - yyoffset + 2) {
            this.appendToken(next, this.offset - yyoffset + 2);
            this.unput(this.offset - yyoffset + 2);
            return this.tok.T_ENCAPSED_AND_WHITESPACE;
          } else {
            return next;
          }
        }
        continue;
      } else if (ch === "{") {
        ch = this.input();
        if (ch === "$") {
          // start of {$...
          this.begin("ST_IN_SCRIPTING");
          if (this.yytext.length > 2) {
            this.appendToken(this.tok.T_CURLY_OPEN, 1);
            this.unput(2);
            return this.tok.T_ENCAPSED_AND_WHITESPACE;
          } else {
            this.unput(1);
            return this.tok.T_CURLY_OPEN;
          }
        }
        continue;
      }
      ch = this.input();
    }
    return this.tok.T_ENCAPSED_AND_WHITESPACE;
  },

  matchST_DOUBLE_QUOTES: function () {
    let ch = this.input();
    if (ch === "$") {
      ch = this.input();
      if (ch === "{") {
        this.begin("ST_LOOKING_FOR_VARNAME");
        return this.tok.T_DOLLAR_OPEN_CURLY_BRACES;
      } else if (this.is_LABEL_START()) {
        const tok = this.consume_VARIABLE();
        return tok;
      }
    } else if (ch === "{") {
      if (this._input[this.offset] === "$") {
        this.begin("ST_IN_SCRIPTING");
        return this.tok.T_CURLY_OPEN;
      }
    } else if (ch === '"') {
      this.popState();
      return '"';
    }

    // any char
    while (this.offset < this.size) {
      if (ch === "\\") {
        this.input();
      } else if (ch === '"') {
        this.unput(1);
        this.popState();
        this.appendToken('"', 1);
        break;
      } else if (ch === "$") {
        ch = this.input();
        if (ch === "{") {
          this.begin("ST_LOOKING_FOR_VARNAME");
          if (this.yytext.length > 2) {
            this.appendToken(this.tok.T_DOLLAR_OPEN_CURLY_BRACES, 2);
            this.unput(2);
            return this.tok.T_ENCAPSED_AND_WHITESPACE;
          } else {
            return this.tok.T_DOLLAR_OPEN_CURLY_BRACES;
          }
        } else if (this.is_LABEL_START()) {
          // start of $var...
          const yyoffset = this.offset;
          const next = this.consume_VARIABLE();
          if (this.yytext.length > this.offset - yyoffset + 2) {
            this.appendToken(next, this.offset - yyoffset + 2);
            this.unput(this.offset - yyoffset + 2);
            return this.tok.T_ENCAPSED_AND_WHITESPACE;
          } else {
            return next;
          }
        }
        if (ch) this.unput(1);
      } else if (ch === "{") {
        ch = this.input();
        if (ch === "$") {
          // start of {$...
          this.begin("ST_IN_SCRIPTING");
          if (this.yytext.length > 2) {
            this.appendToken(this.tok.T_CURLY_OPEN, 1);
            this.unput(2);
            return this.tok.T_ENCAPSED_AND_WHITESPACE;
          } else {
            // @fixme : yytext = '"{$' (this.yytext.length > 3)
            this.unput(1);
            return this.tok.T_CURLY_OPEN;
          }
        }
        if (ch) this.unput(1);
      }
      ch = this.input();
    }
    return this.tok.T_ENCAPSED_AND_WHITESPACE;
  },
};


/***/ }),

/***/ 9479:
/***/ ((module) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


module.exports = {
  T_STRING: function () {
    const token = this.yytext.toLowerCase();
    let id = this.keywords[token];
    if (typeof id !== "number") {
      if (token === "yield") {
        if (this.version >= 700 && this.tryMatch(" from")) {
          this.consume(5);
          id = this.tok.T_YIELD_FROM;
        } else {
          id = this.tok.T_YIELD;
        }
      } else {
        id = this.tok.T_STRING;
        if (token === "b" || token === "B") {
          const ch = this.input(1);
          if (ch === '"') {
            return this.ST_DOUBLE_QUOTES();
          } else if (ch === "'") {
            return this.T_CONSTANT_ENCAPSED_STRING();
          } else if (ch) {
            this.unput(1);
          }
        }
      }
    }
    return id;
  },
  // reads a custom token
  consume_TOKEN: function () {
    const ch = this._input[this.offset - 1];
    const fn = this.tokenTerminals[ch];
    if (fn) {
      return fn.apply(this, []);
    } else {
      return this.yytext;
    }
  },
  // list of special char tokens
  tokenTerminals: {
    $: function () {
      this.offset++;
      if (this.is_LABEL_START()) {
        this.offset--;
        this.consume_LABEL();
        return this.tok.T_VARIABLE;
      } else {
        this.offset--;
        return "$";
      }
    },
    "-": function () {
      const nchar = this._input[this.offset];
      if (nchar === ">") {
        this.begin("ST_LOOKING_FOR_PROPERTY").input();
        return this.tok.T_OBJECT_OPERATOR;
      } else if (nchar === "-") {
        this.input();
        return this.tok.T_DEC;
      } else if (nchar === "=") {
        this.input();
        return this.tok.T_MINUS_EQUAL;
      }
      return "-";
    },
    "\\": function () {
      return this.tok.T_NS_SEPARATOR;
    },
    "/": function () {
      if (this._input[this.offset] === "=") {
        this.input();
        return this.tok.T_DIV_EQUAL;
      }
      return "/";
    },
    ":": function () {
      if (this._input[this.offset] === ":") {
        this.input();
        return this.tok.T_DOUBLE_COLON;
      } else {
        return ":";
      }
    },
    "(": function () {
      const initial = this.offset;
      this.input();
      if (this.is_TABSPACE()) {
        this.consume_TABSPACE().input();
      }
      if (this.is_LABEL_START()) {
        const yylen = this.yytext.length;
        this.consume_LABEL();
        const castToken = this.yytext.substring(yylen - 1).toLowerCase();
        const castId = this.castKeywords[castToken];
        if (typeof castId === "number") {
          this.input();
          if (this.is_TABSPACE()) {
            this.consume_TABSPACE().input();
          }
          if (this._input[this.offset - 1] === ")") {
            return castId;
          }
        }
      }
      // revert the check
      this.unput(this.offset - initial);
      return "(";
    },
    "=": function () {
      const nchar = this._input[this.offset];
      if (nchar === ">") {
        this.input();
        return this.tok.T_DOUBLE_ARROW;
      } else if (nchar === "=") {
        if (this._input[this.offset + 1] === "=") {
          this.consume(2);
          return this.tok.T_IS_IDENTICAL;
        } else {
          this.input();
          return this.tok.T_IS_EQUAL;
        }
      }
      return "=";
    },
    "+": function () {
      const nchar = this._input[this.offset];
      if (nchar === "+") {
        this.input();
        return this.tok.T_INC;
      } else if (nchar === "=") {
        this.input();
        return this.tok.T_PLUS_EQUAL;
      }
      return "+";
    },
    "!": function () {
      if (this._input[this.offset] === "=") {
        if (this._input[this.offset + 1] === "=") {
          this.consume(2);
          return this.tok.T_IS_NOT_IDENTICAL;
        } else {
          this.input();
          return this.tok.T_IS_NOT_EQUAL;
        }
      }
      return "!";
    },
    "?": function () {
      if (this.version >= 700 && this._input[this.offset] === "?") {
        if (this.version >= 704 && this._input[this.offset + 1] === "=") {
          this.consume(2);
          return this.tok.T_COALESCE_EQUAL;
        } else {
          this.input();
          return this.tok.T_COALESCE;
        }
      }
      return "?";
    },
    "<": function () {
      let nchar = this._input[this.offset];
      if (nchar === "<") {
        nchar = this._input[this.offset + 1];
        if (nchar === "=") {
          this.consume(2);
          return this.tok.T_SL_EQUAL;
        } else if (nchar === "<") {
          if (this.is_HEREDOC()) {
            return this.tok.T_START_HEREDOC;
          }
        }
        this.input();
        return this.tok.T_SL;
      } else if (nchar === "=") {
        this.input();
        if (this.version >= 700 && this._input[this.offset] === ">") {
          this.input();
          return this.tok.T_SPACESHIP;
        } else {
          return this.tok.T_IS_SMALLER_OR_EQUAL;
        }
      } else if (nchar === ">") {
        this.input();
        return this.tok.T_IS_NOT_EQUAL;
      }
      return "<";
    },
    ">": function () {
      let nchar = this._input[this.offset];
      if (nchar === "=") {
        this.input();
        return this.tok.T_IS_GREATER_OR_EQUAL;
      } else if (nchar === ">") {
        nchar = this._input[this.offset + 1];
        if (nchar === "=") {
          this.consume(2);
          return this.tok.T_SR_EQUAL;
        } else {
          this.input();
          return this.tok.T_SR;
        }
      }
      return ">";
    },
    "*": function () {
      const nchar = this._input[this.offset];
      if (nchar === "=") {
        this.input();
        return this.tok.T_MUL_EQUAL;
      } else if (nchar === "*") {
        this.input();
        if (this._input[this.offset] === "=") {
          this.input();
          return this.tok.T_POW_EQUAL;
        } else {
          return this.tok.T_POW;
        }
      }
      return "*";
    },
    ".": function () {
      const nchar = this._input[this.offset];
      if (nchar === "=") {
        this.input();
        return this.tok.T_CONCAT_EQUAL;
      } else if (nchar === "." && this._input[this.offset + 1] === ".") {
        this.consume(2);
        return this.tok.T_ELLIPSIS;
      }
      return ".";
    },
    "%": function () {
      if (this._input[this.offset] === "=") {
        this.input();
        return this.tok.T_MOD_EQUAL;
      }
      return "%";
    },
    "&": function () {
      const nchar = this._input[this.offset];
      if (nchar === "=") {
        this.input();
        return this.tok.T_AND_EQUAL;
      } else if (nchar === "&") {
        this.input();
        return this.tok.T_BOOLEAN_AND;
      }
      return "&";
    },
    "|": function () {
      const nchar = this._input[this.offset];
      if (nchar === "=") {
        this.input();
        return this.tok.T_OR_EQUAL;
      } else if (nchar === "|") {
        this.input();
        return this.tok.T_BOOLEAN_OR;
      }
      return "|";
    },
    "^": function () {
      if (this._input[this.offset] === "=") {
        this.input();
        return this.tok.T_XOR_EQUAL;
      }
      return "^";
    },
  },
};


/***/ }),

/***/ 1138:
/***/ ((module) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const tokens = ";:,.\\[]()|^&+-/*=%!~$<>?@";

module.exports = {
  // check if the char can be a numeric
  is_NUM: function () {
    const ch = this._input.charCodeAt(this.offset - 1);
    return (ch > 47 && ch < 58) || ch === 95;
  },

  // check if the char can be a numeric
  is_NUM_START: function () {
    const ch = this._input.charCodeAt(this.offset - 1);
    return ch > 47 && ch < 58;
  },

  // check if current char can be a label
  is_LABEL: function () {
    const ch = this._input.charCodeAt(this.offset - 1);
    return (
      (ch > 96 && ch < 123) ||
      (ch > 64 && ch < 91) ||
      ch === 95 ||
      (ch > 47 && ch < 58) ||
      ch > 126
    );
  },

  // check if current char can be a label
  is_LABEL_START: function () {
    const ch = this._input.charCodeAt(this.offset - 1);
    // A - Z
    if (ch > 64 && ch < 91) return true;
    // a - z
    if (ch > 96 && ch < 123) return true;
    // _ (95)
    if (ch === 95) return true;
    // utf8 / extended
    if (ch > 126) return true;
    // else
    return false;
  },

  // reads each char of the label
  consume_LABEL: function () {
    while (this.offset < this.size) {
      const ch = this.input();
      if (!this.is_LABEL()) {
        if (ch) this.unput(1);
        break;
      }
    }
    return this;
  },

  // check if current char is a token char
  is_TOKEN: function () {
    const ch = this._input[this.offset - 1];
    return tokens.indexOf(ch) !== -1;
  },
  // check if current char is a whitespace
  is_WHITESPACE: function () {
    const ch = this._input[this.offset - 1];
    return ch === " " || ch === "\t" || ch === "\n" || ch === "\r";
  },
  // check if current char is a whitespace (without newlines)
  is_TABSPACE: function () {
    const ch = this._input[this.offset - 1];
    return ch === " " || ch === "\t";
  },
  // consume all whitespaces (excluding newlines)
  consume_TABSPACE: function () {
    while (this.offset < this.size) {
      const ch = this.input();
      if (!this.is_TABSPACE()) {
        if (ch) this.unput(1);
        break;
      }
    }
    return this;
  },
  // check if current char can be a hexadecimal number
  is_HEX: function () {
    const ch = this._input.charCodeAt(this.offset - 1);
    // 0 - 9
    if (ch > 47 && ch < 58) return true;
    // A - F
    if (ch > 64 && ch < 71) return true;
    // a - f
    if (ch > 96 && ch < 103) return true;
    // _ (code 95)
    if (ch === 95) return true;
    // else
    return false;
  },
};


/***/ }),

/***/ 7949:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


/**
 * @private
 */
function isNumber(n) {
  return n != "." && n != "," && !isNaN(parseFloat(n)) && isFinite(n);
}

/**
 * The PHP Parser class that build the AST tree from the lexer
 *
 * @class
 * @tutorial Parser
 * @property {Lexer} lexer - current lexer instance
 * @property {AST} ast - the AST factory instance
 * @property {Integer|String} token - current token
 * @property {Boolean} extractDoc - should extract documentation as AST node
 * @property {Boolean} extractTokens - should extract each token
 * @property {Boolean} suppressErrors - should ignore parsing errors and continue
 * @property {Boolean} debug - should output debug informations
 */
const parser = function (lexer, ast) {
  this.lexer = lexer;
  this.ast = ast;
  this.tok = lexer.tok;
  this.EOF = lexer.EOF;
  this.token = null;
  this.prev = null;
  this.debug = false;
  this.version = 704;
  this.extractDoc = false;
  this.extractTokens = false;
  this.suppressErrors = false;
  const mapIt = function (item) {
    return [item, null];
  };
  this.entries = {
    // reserved_non_modifiers
    IDENTIFIER: new Map(
      [
        this.tok.T_ABSTRACT,
        this.tok.T_ARRAY,
        this.tok.T_AS,
        this.tok.T_BREAK,
        this.tok.T_CALLABLE,
        this.tok.T_CASE,
        this.tok.T_CATCH,
        this.tok.T_CLASS,
        this.tok.T_CLASS_C,
        this.tok.T_CLONE,
        this.tok.T_CONST,
        this.tok.T_CONTINUE,
        this.tok.T_DECLARE,
        this.tok.T_DEFAULT,
        this.tok.T_DIR,
        this.tok.T_DO,
        this.tok.T_ECHO,
        this.tok.T_ELSE,
        this.tok.T_ELSEIF,
        this.tok.T_EMPTY,
        this.tok.T_ENDDECLARE,
        this.tok.T_ENDFOR,
        this.tok.T_ENDFOREACH,
        this.tok.T_ENDIF,
        this.tok.T_ENDSWITCH,
        this.tok.T_ENDWHILE,
        this.tok.T_EVAL,
        this.tok.T_EXIT,
        this.tok.T_EXTENDS,
        this.tok.T_FILE,
        this.tok.T_FINAL,
        this.tok.T_FINALLY,
        this.tok.T_FN,
        this.tok.T_FOR,
        this.tok.T_FOREACH,
        this.tok.T_FUNC_C,
        this.tok.T_FUNCTION,
        this.tok.T_GLOBAL,
        this.tok.T_GOTO,
        this.tok.T_IF,
        this.tok.T_IMPLEMENTS,
        this.tok.T_INCLUDE,
        this.tok.T_INCLUDE_ONCE,
        this.tok.T_INSTANCEOF,
        this.tok.T_INSTEADOF,
        this.tok.T_INTERFACE,
        this.tok.T_ISSET,
        this.tok.T_LINE,
        this.tok.T_LIST,
        this.tok.T_LOGICAL_AND,
        this.tok.T_LOGICAL_OR,
        this.tok.T_LOGICAL_XOR,
        this.tok.T_METHOD_C,
        this.tok.T_NAMESPACE,
        this.tok.T_NEW,
        this.tok.T_NS_C,
        this.tok.T_PRINT,
        this.tok.T_PRIVATE,
        this.tok.T_PROTECTED,
        this.tok.T_PUBLIC,
        this.tok.T_REQUIRE,
        this.tok.T_REQUIRE_ONCE,
        this.tok.T_RETURN,
        this.tok.T_STATIC,
        this.tok.T_SWITCH,
        this.tok.T_THROW,
        this.tok.T_TRAIT,
        this.tok.T_TRY,
        this.tok.T_UNSET,
        this.tok.T_USE,
        this.tok.T_VAR,
        this.tok.T_WHILE,
        this.tok.T_YIELD,
      ].map(mapIt)
    ),
    VARIABLE: new Map(
      [
        this.tok.T_VARIABLE,
        "$",
        "&",
        this.tok.T_NS_SEPARATOR,
        this.tok.T_STRING,
        this.tok.T_NAMESPACE,
        this.tok.T_STATIC,
      ].map(mapIt)
    ),
    SCALAR: new Map(
      [
        this.tok.T_CONSTANT_ENCAPSED_STRING,
        this.tok.T_START_HEREDOC,
        this.tok.T_LNUMBER,
        this.tok.T_DNUMBER,
        this.tok.T_ARRAY,
        "[",
        this.tok.T_CLASS_C,
        this.tok.T_TRAIT_C,
        this.tok.T_FUNC_C,
        this.tok.T_METHOD_C,
        this.tok.T_LINE,
        this.tok.T_FILE,
        this.tok.T_DIR,
        this.tok.T_NS_C,
        '"',
        'b"',
        'B"',
        "-",
        this.tok.T_NS_SEPARATOR,
      ].map(mapIt)
    ),
    T_MAGIC_CONST: new Map(
      [
        this.tok.T_CLASS_C,
        this.tok.T_TRAIT_C,
        this.tok.T_FUNC_C,
        this.tok.T_METHOD_C,
        this.tok.T_LINE,
        this.tok.T_FILE,
        this.tok.T_DIR,
        this.tok.T_NS_C,
      ].map(mapIt)
    ),
    T_MEMBER_FLAGS: new Map(
      [
        this.tok.T_PUBLIC,
        this.tok.T_PRIVATE,
        this.tok.T_PROTECTED,
        this.tok.T_STATIC,
        this.tok.T_ABSTRACT,
        this.tok.T_FINAL,
      ].map(mapIt)
    ),
    EOS: new Map([";", this.EOF, this.tok.T_INLINE_HTML].map(mapIt)),
    EXPR: new Map(
      [
        "@",
        "-",
        "+",
        "!",
        "~",
        "(",
        "`",
        this.tok.T_LIST,
        this.tok.T_CLONE,
        this.tok.T_INC,
        this.tok.T_DEC,
        this.tok.T_NEW,
        this.tok.T_ISSET,
        this.tok.T_EMPTY,
        this.tok.T_INCLUDE,
        this.tok.T_INCLUDE_ONCE,
        this.tok.T_REQUIRE,
        this.tok.T_REQUIRE_ONCE,
        this.tok.T_EVAL,
        this.tok.T_INT_CAST,
        this.tok.T_DOUBLE_CAST,
        this.tok.T_STRING_CAST,
        this.tok.T_ARRAY_CAST,
        this.tok.T_OBJECT_CAST,
        this.tok.T_BOOL_CAST,
        this.tok.T_UNSET_CAST,
        this.tok.T_EXIT,
        this.tok.T_PRINT,
        this.tok.T_YIELD,
        this.tok.T_STATIC,
        this.tok.T_FUNCTION,
        this.tok.T_FN,
        // using VARIABLES :
        this.tok.T_VARIABLE,
        "$",
        this.tok.T_NS_SEPARATOR,
        this.tok.T_STRING,
        // using SCALAR :
        this.tok.T_STRING, // @see variable.js line 45 > conflict with variable = shift/reduce :)
        this.tok.T_CONSTANT_ENCAPSED_STRING,
        this.tok.T_START_HEREDOC,
        this.tok.T_LNUMBER,
        this.tok.T_DNUMBER,
        this.tok.T_ARRAY,
        "[",
        this.tok.T_CLASS_C,
        this.tok.T_TRAIT_C,
        this.tok.T_FUNC_C,
        this.tok.T_METHOD_C,
        this.tok.T_LINE,
        this.tok.T_FILE,
        this.tok.T_DIR,
        this.tok.T_NS_C,
        '"',
        'b"',
        'B"',
        "-",
        this.tok.T_NS_SEPARATOR,
      ].map(mapIt)
    ),
  };
};

/**
 * helper : gets a token name
 */
parser.prototype.getTokenName = function (token) {
  if (!isNumber(token)) {
    return "'" + token + "'";
  } else {
    if (token == this.EOF) return "the end of file (EOF)";
    return this.lexer.engine.tokens.values[token];
  }
};

/**
 * main entry point : converts a source code to AST
 */
parser.prototype.parse = function (code, filename) {
  this._errors = [];
  this.filename = filename || "eval";
  this.currentNamespace = [""];
  if (this.extractDoc) {
    this._docs = [];
  } else {
    this._docs = null;
  }
  if (this.extractTokens) {
    this._tokens = [];
  } else {
    this._tokens = null;
  }
  this._docIndex = 0;
  this._lastNode = null;
  this.lexer.setInput(code);
  this.lexer.all_tokens = this.extractTokens;
  this.lexer.comment_tokens = this.extractDoc;
  this.length = this.lexer._input.length;
  this.innerList = false;
  this.innerListForm = false;
  const program = this.node("program");
  const childs = [];
  this.next();
  while (this.token != this.EOF) {
    childs.push(this.read_start());
  }
  // append last comment
  if (
    childs.length === 0 &&
    this.extractDoc &&
    this._docs.length > this._docIndex
  ) {
    childs.push(this.node("noop")());
  }
  // #176 : register latest position
  this.prev = [
    this.lexer.yylloc.last_line,
    this.lexer.yylloc.last_column,
    this.lexer.offset,
  ];
  const result = program(childs, this._errors, this._docs, this._tokens);
  if (this.debug) {
    const errors = this.ast.checkNodes();
    if (errors.length > 0) {
      errors.forEach(function (error) {
        if (error.position) {
          // eslint-disable-next-line no-console
          console.log(
            "Node at line " +
              error.position.line +
              ", column " +
              error.position.column
          );
        }
        // eslint-disable-next-line no-console
        console.log(error.stack.join("\n"));
      });
      throw new Error("Some nodes are not closed");
    }
  }
  return result;
};

/**
 * Raise an error
 */
parser.prototype.raiseError = function (message, msgExpect, expect, token) {
  message += " on line " + this.lexer.yylloc.first_line;
  if (!this.suppressErrors) {
    const err = new SyntaxError(
      message,
      this.filename,
      this.lexer.yylloc.first_line
    );
    err.lineNumber = this.lexer.yylloc.first_line;
    err.fileName = this.filename;
    err.columnNumber = this.lexer.yylloc.first_column;
    throw err;
  }
  // Error node :
  const node = this.ast.prepare("error", null, this)(
    message,
    token,
    this.lexer.yylloc.first_line,
    expect
  );
  this._errors.push(node);
  return node;
};

/**
 * handling errors
 */
parser.prototype.error = function (expect) {
  let msg = "Parse Error : syntax error";
  let token = this.getTokenName(this.token);
  let msgExpect = "";

  if (this.token !== this.EOF) {
    if (isNumber(this.token)) {
      let symbol = this.text();
      if (symbol.length > 10) {
        symbol = symbol.substring(0, 7) + "...";
      }
      token = "'" + symbol + "' (" + token + ")";
    }
    msg += ", unexpected " + token;
  }
  if (expect && !Array.isArray(expect)) {
    if (isNumber(expect) || expect.length === 1) {
      msgExpect = ", expecting " + this.getTokenName(expect);
    }
    msg += msgExpect;
  }
  return this.raiseError(msg, msgExpect, expect, token);
};

/**
 * Creates a new AST node
 */
parser.prototype.node = function (name) {
  if (this.extractDoc) {
    let docs = null;
    if (this._docIndex < this._docs.length) {
      docs = this._docs.slice(this._docIndex);
      this._docIndex = this._docs.length;
      if (this.debug) {
        // eslint-disable-next-line no-console
        console.log(new Error("Append docs on " + name));
        // eslint-disable-next-line no-console
        console.log(docs);
      }
    }
    const node = this.ast.prepare(name, docs, this);
    /**
     * TOKENS :
     * node1 commentA token commmentB node2 commentC token commentD node3 commentE token
     *
     * AST :
     * structure:S1 [
     *    left: node1 ( trail: commentA ),
     *    right: structure:S2 [
     *       node2 (lead: commentB, trail: commentC),
     *       node3 (lead: commentD)
     *    ],
     *    trail: commentE
     * ]
     *
     * Algorithm :
     *
     * Attach the last comments on parent of current node
     * If a new node is started and the parent has a trailing comment
     * the move it on previous node
     *
     * start S2
     * start node1
     * consume node1 & set commentA as trailingComment on S2
     * start S2
     * S1 has a trailingComment, attach it on node1
     * ...
     * NOTE : As the trailingComment Behavior depends on AST, it will be build on
     * the AST layer - last child node will keep it's trailingComment nodes
     */
    node.postBuild = function (self) {
      if (this._docIndex < this._docs.length) {
        if (this._lastNode) {
          const offset = this.prev[2];
          let max = this._docIndex;
          for (; max < this._docs.length; max++) {
            if (this._docs[max].offset > offset) {
              break;
            }
          }
          if (max > this._docIndex) {
            // inject trailing comment on child node
            this._lastNode.setTrailingComments(
              this._docs.slice(this._docIndex, max)
            );
            this._docIndex = max;
          }
        } else if (this.token === this.EOF) {
          // end of content
          self.setTrailingComments(this._docs.slice(this._docIndex));
          this._docIndex = this._docs.length;
        }
      }
      this._lastNode = self;
    }.bind(this);
    return node;
  }
  return this.ast.prepare(name, null, this);
};

/**
 * expects an end of statement or end of file
 * @return {boolean}
 */
parser.prototype.expectEndOfStatement = function (node) {
  if (this.token === ";") {
    // include only real ';' statements
    // https://github.com/glayzzle/php-parser/issues/164
    if (node && this.lexer.yytext === ";") {
      node.includeToken(this);
    }
  } else if (this.token !== this.tok.T_INLINE_HTML && this.token !== this.EOF) {
    this.error(";");
    return false;
  }
  this.next();
  return true;
};

/** outputs some debug information on current token **/
const ignoreStack = ["parser.next", "parser.node", "parser.showlog"];
parser.prototype.showlog = function () {
  const stack = new Error().stack.split("\n");
  let line;
  for (let offset = 2; offset < stack.length; offset++) {
    line = stack[offset].trim();
    let found = false;
    for (let i = 0; i < ignoreStack.length; i++) {
      if (line.substring(3, 3 + ignoreStack[i].length) === ignoreStack[i]) {
        found = true;
        break;
      }
    }
    if (!found) {
      break;
    }
  }
  // eslint-disable-next-line no-console
  console.log(
    "Line " +
      this.lexer.yylloc.first_line +
      " : " +
      this.getTokenName(this.token) +
      ">" +
      this.lexer.yytext +
      "<" +
      " @-->" +
      line
  );
  return this;
};

/**
 * Force the parser to check the current token.
 *
 * If the current token does not match to expected token,
 * the an error will be raised.
 *
 * If the suppressError mode is activated, then the error will
 * be added to the program error stack and this function will return `false`.
 *
 * @param {String|Number} token
 * @return {boolean}
 * @throws Error
 */
parser.prototype.expect = function (token) {
  if (Array.isArray(token)) {
    if (token.indexOf(this.token) === -1) {
      this.error(token);
      return false;
    }
  } else if (this.token != token) {
    this.error(token);
    return false;
  }
  return true;
};

/**
 * Returns the current token contents
 * @return {String}
 */
parser.prototype.text = function () {
  return this.lexer.yytext;
};

/** consume the next token **/
parser.prototype.next = function () {
  // prepare the back command
  if (this.token !== ";" || this.lexer.yytext === ";") {
    // ignore '?>' from automated resolution
    // https://github.com/glayzzle/php-parser/issues/168
    this.prev = [
      this.lexer.yylloc.last_line,
      this.lexer.yylloc.last_column,
      this.lexer.offset,
    ];
  }

  // eating the token
  this.lex();

  // showing the debug
  if (this.debug) {
    this.showlog();
  }

  // handling comments
  if (this.extractDoc) {
    while (
      this.token === this.tok.T_COMMENT ||
      this.token === this.tok.T_DOC_COMMENT
    ) {
      // APPEND COMMENTS
      if (this.token === this.tok.T_COMMENT) {
        this._docs.push(this.read_comment());
      } else {
        this._docs.push(this.read_doc_comment());
      }
    }
  }

  return this;
};

/**
 * Eating a token
 */
parser.prototype.lex = function () {
  // append on token stack
  if (this.extractTokens) {
    do {
      // the token
      this.token = this.lexer.lex() || this.EOF;
      if (this.token === this.EOF) return this;
      let entry = this.lexer.yytext;
      if (this.lexer.engine.tokens.values.hasOwnProperty(this.token)) {
        entry = [
          this.lexer.engine.tokens.values[this.token],
          entry,
          this.lexer.yylloc.first_line,
          this.lexer.yylloc.first_offset,
          this.lexer.offset,
        ];
      } else {
        entry = [
          null,
          entry,
          this.lexer.yylloc.first_line,
          this.lexer.yylloc.first_offset,
          this.lexer.offset,
        ];
      }
      this._tokens.push(entry);
      if (this.token === this.tok.T_CLOSE_TAG) {
        // https://github.com/php/php-src/blob/7ff186434e82ee7be7c59d0db9a976641cf7b09c/Zend/zend_compile.c#L1680
        this.token = ";";
        return this;
      } else if (this.token === this.tok.T_OPEN_TAG_WITH_ECHO) {
        this.token = this.tok.T_ECHO;
        return this;
      }
    } while (
      this.token === this.tok.T_WHITESPACE || // ignore white space
      (!this.extractDoc &&
        (this.token === this.tok.T_COMMENT || // ignore single lines comments
          this.token === this.tok.T_DOC_COMMENT)) || // ignore doc comments
      // ignore open tags
      this.token === this.tok.T_OPEN_TAG
    );
  } else {
    this.token = this.lexer.lex() || this.EOF;
  }
  return this;
};

/**
 * Check if token is of specified type
 */
parser.prototype.is = function (type) {
  if (Array.isArray(type)) {
    return type.indexOf(this.token) !== -1;
  }
  return this.entries[type].has(this.token);
};

// extends the parser with syntax files
[
  __webpack_require__(7838),
  __webpack_require__(3521),
  __webpack_require__(1841),
  __webpack_require__(1348),
  __webpack_require__(2275),
  __webpack_require__(2648),
  __webpack_require__(4099),
  __webpack_require__(7652),
  __webpack_require__(5663),
  __webpack_require__(4551),
  __webpack_require__(8011),
  __webpack_require__(8255),
  __webpack_require__(5250),
  __webpack_require__(814),
  __webpack_require__(3406),
].forEach(function (ext) {
  for (const k in ext) {
    if (parser.prototype.hasOwnProperty(k)) {
      // @see https://github.com/glayzzle/php-parser/issues/234
      throw new Error("Function " + k + " is already defined - collision");
    }
    parser.prototype[k] = ext[k];
  }
});

module.exports = parser;


/***/ }),

/***/ 7838:
/***/ ((module) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


module.exports = {
  /**
   * Parse an array
   * ```ebnf
   * array ::= T_ARRAY '(' array_pair_list ')' |
   *   '[' array_pair_list ']'
   * ```
   */
  read_array: function () {
    let expect = null;
    let shortForm = false;
    const result = this.node("array");

    if (this.token === this.tok.T_ARRAY) {
      this.next().expect("(");
      expect = ")";
    } else {
      shortForm = true;
      expect = "]";
    }
    let items = [];
    if (this.next().token !== expect) {
      items = this.read_array_pair_list(shortForm);
    }
    this.expect(expect);
    this.next();
    return result(shortForm, items);
  },
  /**
   * Reads an array of items
   * ```ebnf
   * array_pair_list ::= array_pair (',' array_pair?)*
   * ```
   */
  read_array_pair_list: function (shortForm) {
    const self = this;
    return this.read_list(
      function () {
        return self.read_array_pair(shortForm);
      },
      ",",
      true
    );
  },
  /**
   * Reads an entry
   * array_pair:
   *  expr T_DOUBLE_ARROW expr
   *  | expr
   *  | expr T_DOUBLE_ARROW '&' variable
   *  | '&' variable
   *  | expr T_DOUBLE_ARROW T_LIST '(' array_pair_list ')'
   *  | T_LIST '(' array_pair_list ')'
   */
  read_array_pair: function (shortForm) {
    if (
      (!shortForm && this.token === ")") ||
      (shortForm && this.token === "]")
    ) {
      return;
    }

    if (this.token === ",") {
      return this.node("noop")();
    }

    const entry = this.node("entry");

    let key = null;
    let value = null;
    let byRef = false;
    let unpack = false;

    if (this.token === "&") {
      this.next();
      byRef = true;
      value = this.read_variable(true, false);
    } else if (this.token === this.tok.T_ELLIPSIS && this.version >= 704) {
      this.next();
      if (this.token === "&") {
        this.error();
      }
      unpack = true;
      value = this.read_expr();
    } else {
      const expr = this.read_expr();

      if (this.token === this.tok.T_DOUBLE_ARROW) {
        this.next();
        key = expr;

        if (this.token === "&") {
          this.next();
          byRef = true;
          value = this.read_variable(true, false);
        } else {
          value = this.read_expr();
        }
      } else {
        value = expr;
      }
    }

    return entry(key, value, byRef, unpack);
  },
};


/***/ }),

/***/ 3521:
/***/ ((module) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


module.exports = {
  /**
   * reading a class
   * ```ebnf
   * class ::= class_scope? T_CLASS T_STRING (T_EXTENDS NAMESPACE_NAME)? (T_IMPLEMENTS (NAMESPACE_NAME ',')* NAMESPACE_NAME)? '{' CLASS_BODY '}'
   * ```
   */
  read_class_declaration_statement: function () {
    const result = this.node("class");
    const flag = this.read_class_modifiers();
    // graceful mode : ignore token & go next
    if (this.token !== this.tok.T_CLASS) {
      this.error(this.tok.T_CLASS);
      this.next();
      return null;
    }
    this.next().expect(this.tok.T_STRING);
    let propName = this.node("identifier");
    const name = this.text();
    this.next();
    propName = propName(name);
    const propExtends = this.read_extends_from();
    const propImplements = this.read_implements_list();
    this.expect("{");
    const body = this.next().read_class_body();
    return result(propName, propExtends, propImplements, body, flag);
  },

  read_class_modifiers: function () {
    return [0, 0, this.read_class_modifier()];
  },

  read_class_modifier: function () {
    const result = 0;

    if (this.token === this.tok.T_ABSTRACT) {
      this.next();
      return 1;
    } else if (this.token === this.tok.T_FINAL) {
      this.next();
      return 2;
    }

    return result;
  },

  /**
   * Reads a class body
   * ```ebnf
   *   class_body ::= (member_flags? (T_VAR | T_STRING | T_FUNCTION))*
   * ```
   */
  read_class_body: function () {
    let result = [];

    while (this.token !== this.EOF && this.token !== "}") {
      if (this.token === this.tok.T_COMMENT) {
        result.push(this.read_comment());
        continue;
      }

      if (this.token === this.tok.T_DOC_COMMENT) {
        result.push(this.read_doc_comment());
        continue;
      }

      // check T_USE trait
      if (this.token === this.tok.T_USE) {
        result = result.concat(this.read_trait_use_statement());
        continue;
      }

      // read member flags
      const flags = this.read_member_flags(false);

      // check constant
      if (this.token === this.tok.T_CONST) {
        const constants = this.read_constant_list(flags);
        if (this.expect(";")) {
          this.next();
        }
        result = result.concat(constants);
        continue;
      }

      // jump over T_VAR then land on T_VARIABLE
      if (this.token === this.tok.T_VAR) {
        this.next().expect(this.tok.T_VARIABLE);
        flags[0] = null; // public (as null)
        flags[1] = 0; // non static var
      }

      if (this.token === this.tok.T_FUNCTION) {
        // reads a function
        result.push(this.read_function(false, flags));
      } else if (
        this.token === this.tok.T_VARIABLE ||
        // support https://wiki.php.net/rfc/typed_properties_v2
        (this.version >= 704 &&
          (this.token === "?" ||
            this.token === this.tok.T_CALLABLE ||
            this.token === this.tok.T_ARRAY ||
            this.token === this.tok.T_NS_SEPARATOR ||
            this.token === this.tok.T_STRING ||
            this.token === this.tok.T_NAMESPACE))
      ) {
        // reads a variable
        const variables = this.read_variable_list(flags);
        this.expect(";");
        this.next();
        result = result.concat(variables);
      } else {
        // raise an error
        this.error([
          this.tok.T_CONST,
          this.tok.T_VARIABLE,
          this.tok.T_FUNCTION,
        ]);
        // ignore token
        this.next();
      }
    }
    this.expect("}");
    this.next();
    return result;
  },
  /**
   * Reads variable list
   * ```ebnf
   *  variable_list ::= (variable_declaration ',')* variable_declaration
   * ```
   */
  read_variable_list: function (flags) {
    const result = this.node("propertystatement");

    const properties = this.read_list(
      /**
       * Reads a variable declaration
       *
       * ```ebnf
       *  variable_declaration ::= T_VARIABLE '=' scalar
       * ```
       */
      function read_variable_declaration() {
        const result = this.node("property");
        const [nullable, type] = this.read_optional_type();
        this.expect(this.tok.T_VARIABLE);
        let propName = this.node("identifier");
        const name = this.text().substring(1); // ignore $
        this.next();
        propName = propName(name);
        if (this.token === ";" || this.token === ",") {
          return result(propName, null, nullable, type);
        } else if (this.token === "=") {
          // https://github.com/php/php-src/blob/master/Zend/zend_language_parser.y#L815
          return result(propName, this.next().read_expr(), nullable, type);
        } else {
          this.expect([",", ";", "="]);
          return result(propName, null, nullable, type);
        }
      },
      ","
    );

    return result(null, properties, flags);
  },
  /**
   * Reads constant list
   * ```ebnf
   *  constant_list ::= T_CONST (constant_declaration ',')* constant_declaration
   * ```
   */
  read_constant_list: function (flags) {
    if (this.expect(this.tok.T_CONST)) {
      this.next();
    }
    const result = this.node("classconstant");
    const items = this.read_list(
      /**
       * Reads a constant declaration
       *
       * ```ebnf
       *  constant_declaration ::= (T_STRING | IDENTIFIER) '=' expr
       * ```
       * @return {Constant} [:link:](AST.md#constant)
       */
      function read_constant_declaration() {
        const result = this.node("constant");
        let constName = null;
        let value = null;
        if (
          this.token === this.tok.T_STRING ||
          (this.version >= 700 && this.is("IDENTIFIER"))
        ) {
          constName = this.node("identifier");
          const name = this.text();
          this.next();
          constName = constName(name);
        } else {
          this.expect("IDENTIFIER");
        }
        if (this.expect("=")) {
          value = this.next().read_expr();
        }
        return result(constName, value);
      },
      ","
    );

    return result(null, items, flags);
  },
  /**
   * Read member flags
   * @return array
   *  1st index : 0 => public, 1 => protected, 2 => private
   *  2nd index : 0 => instance member, 1 => static member
   *  3rd index : 0 => normal, 1 => abstract member, 2 => final member
   */
  read_member_flags: function (asInterface) {
    const result = [-1, -1, -1];
    if (this.is("T_MEMBER_FLAGS")) {
      let idx = 0,
        val = 0;
      do {
        switch (this.token) {
          case this.tok.T_PUBLIC:
            idx = 0;
            val = 0;
            break;
          case this.tok.T_PROTECTED:
            idx = 0;
            val = 1;
            break;
          case this.tok.T_PRIVATE:
            idx = 0;
            val = 2;
            break;
          case this.tok.T_STATIC:
            idx = 1;
            val = 1;
            break;
          case this.tok.T_ABSTRACT:
            idx = 2;
            val = 1;
            break;
          case this.tok.T_FINAL:
            idx = 2;
            val = 2;
            break;
        }
        if (asInterface) {
          if (idx == 0 && val == 2) {
            // an interface can't be private
            this.expect([this.tok.T_PUBLIC, this.tok.T_PROTECTED]);
            val = -1;
          } else if (idx == 2 && val == 1) {
            // an interface cant be abstract
            this.error();
            val = -1;
          }
        }
        if (result[idx] !== -1) {
          // already defined flag
          this.error();
        } else if (val !== -1) {
          result[idx] = val;
        }
      } while (this.next().is("T_MEMBER_FLAGS"));
    }

    if (result[1] == -1) result[1] = 0;
    if (result[2] == -1) result[2] = 0;
    return result;
  },

  /**
   * optional_type:
   *	  /- empty -/	{ $$ = NULL; }
   *   |	type_expr	{ $$ = $1; }
   * ;
   *
   * type_expr:
   *		type		{ $$ = $1; }
   *	|	'?' type	{ $$ = $2; $$->attr |= ZEND_TYPE_NULLABLE; }
   *	|	union_type	{ $$ = $1; }
   * ;
   *
   * type:
   * 		T_ARRAY		{ $$ = zend_ast_create_ex(ZEND_AST_TYPE, IS_ARRAY); }
   * 	|	T_CALLABLE	{ $$ = zend_ast_create_ex(ZEND_AST_TYPE, IS_CALLABLE); }
   * 	|	name		{ $$ = $1; }
   * ;
   *
   * union_type:
   * 		type '|' type       { $$ = zend_ast_create_list(2, ZEND_AST_TYPE_UNION, $1, $3); }
   * 	|	union_type '|' type { $$ = zend_ast_list_add($1, $3); }
   * ;
   */
  read_optional_type: function () {
    let nullable = false;
    if (this.token === "?") {
      nullable = true;
      this.next();
    }
    let type = this.read_type();
    if (nullable && !type) {
      this.raiseError(
        "Expecting a type definition combined with nullable operator"
      );
    }
    if (!nullable && !type) {
      return [false, null];
    }
    if (this.token === "|") {
      type = [type];
      do {
        this.next();
        const variant = this.read_type();
        if (!variant) {
          this.raiseError("Expecting a type definition");
          break;
        }
        type.push(variant);
      } while (this.token === "|");
    }
    return [nullable, type];
  },

  /**
   * reading an interface
   * ```ebnf
   * interface ::= T_INTERFACE T_STRING (T_EXTENDS (NAMESPACE_NAME ',')* NAMESPACE_NAME)? '{' INTERFACE_BODY '}'
   * ```
   */
  read_interface_declaration_statement: function () {
    const result = this.node("interface");
    if (this.token !== this.tok.T_INTERFACE) {
      this.error(this.tok.T_INTERFACE);
      this.next();
      return null;
    }
    this.next().expect(this.tok.T_STRING);
    let propName = this.node("identifier");
    const name = this.text();
    this.next();
    propName = propName(name);
    const propExtends = this.read_interface_extends_list();
    this.expect("{");
    const body = this.next().read_interface_body();
    return result(propName, propExtends, body);
  },
  /**
   * Reads an interface body
   * ```ebnf
   *   interface_body ::= (member_flags? (T_CONST | T_FUNCTION))*
   * ```
   */
  read_interface_body: function () {
    let result = [];

    while (this.token !== this.EOF && this.token !== "}") {
      if (this.token === this.tok.T_COMMENT) {
        result.push(this.read_comment());
        continue;
      }

      if (this.token === this.tok.T_DOC_COMMENT) {
        result.push(this.read_doc_comment());
        continue;
      }

      // read member flags
      const flags = this.read_member_flags(true);

      // check constant
      if (this.token == this.tok.T_CONST) {
        const constants = this.read_constant_list(flags);
        if (this.expect(";")) {
          this.next();
        }
        result = result.concat(constants);
      } else if (this.token === this.tok.T_FUNCTION) {
        // reads a function
        const method = this.read_function_declaration(2, flags);
        method.parseFlags(flags);
        result.push(method);
        if (this.expect(";")) {
          this.next();
        }
      } else {
        // raise an error
        this.error([this.tok.T_CONST, this.tok.T_FUNCTION]);
        this.next();
      }
    }
    if (this.expect("}")) {
      this.next();
    }
    return result;
  },
  /**
   * reading a trait
   * ```ebnf
   * trait ::= T_TRAIT T_STRING (T_EXTENDS (NAMESPACE_NAME ',')* NAMESPACE_NAME)? '{' FUNCTION* '}'
   * ```
   */
  read_trait_declaration_statement: function () {
    const result = this.node("trait");
    // graceful mode : ignore token & go next
    if (this.token !== this.tok.T_TRAIT) {
      this.error(this.tok.T_TRAIT);
      this.next();
      return null;
    }
    this.next().expect(this.tok.T_STRING);
    let propName = this.node("identifier");
    const name = this.text();
    this.next();
    propName = propName(name);
    this.expect("{");
    const body = this.next().read_class_body();
    return result(propName, body);
  },
  /**
   * reading a use statement
   * ```ebnf
   * trait_use_statement ::= namespace_name (',' namespace_name)* ('{' trait_use_alias '}')?
   * ```
   */
  read_trait_use_statement: function () {
    // defines use statements
    const node = this.node("traituse");
    this.expect(this.tok.T_USE) && this.next();
    const traits = [this.read_namespace_name()];
    let adaptations = null;
    while (this.token === ",") {
      traits.push(this.next().read_namespace_name());
    }
    if (this.token === "{") {
      adaptations = [];
      // defines alias statements
      while (this.next().token !== this.EOF) {
        if (this.token === "}") break;
        adaptations.push(this.read_trait_use_alias());
        this.expect(";");
      }
      if (this.expect("}")) {
        this.next();
      }
    } else {
      if (this.expect(";")) {
        this.next();
      }
    }
    return node(traits, adaptations);
  },
  /**
   * Reading trait alias
   * ```ebnf
   * trait_use_alias ::= namespace_name ( T_DOUBLE_COLON T_STRING )? (T_INSTEADOF namespace_name) | (T_AS member_flags? T_STRING)
   * ```
   * name list : https://github.com/php/php-src/blob/master/Zend/zend_language_parser.y#L303
   * trait adaptation : https://github.com/php/php-src/blob/master/Zend/zend_language_parser.y#L742
   */
  read_trait_use_alias: function () {
    const node = this.node();
    let trait = null;
    let method;

    if (this.is("IDENTIFIER")) {
      method = this.node("identifier");
      const methodName = this.text();
      this.next();
      method = method(methodName);
    } else {
      method = this.read_namespace_name();

      if (this.token === this.tok.T_DOUBLE_COLON) {
        this.next();
        if (
          this.token === this.tok.T_STRING ||
          (this.version >= 700 && this.is("IDENTIFIER"))
        ) {
          trait = method;
          method = this.node("identifier");
          const methodName = this.text();
          this.next();
          method = method(methodName);
        } else {
          this.expect(this.tok.T_STRING);
        }
      } else {
        // convert identifier as string
        method = method.name;
      }
    }

    // handle trait precedence
    if (this.token === this.tok.T_INSTEADOF) {
      return node(
        "traitprecedence",
        trait,
        method,
        this.next().read_name_list()
      );
    } else if (this.token === this.tok.T_AS) {
      // handle trait alias
      let flags = null;
      let alias = null;
      if (this.next().is("T_MEMBER_FLAGS")) {
        flags = this.read_member_flags();
      }

      if (
        this.token === this.tok.T_STRING ||
        (this.version >= 700 && this.is("IDENTIFIER"))
      ) {
        alias = this.node("identifier");
        const name = this.text();
        this.next();
        alias = alias(name);
      } else if (flags === false) {
        // no visibility flags and no name => too bad
        this.expect(this.tok.T_STRING);
      }

      return node("traitalias", trait, method, alias, flags);
    }

    // handle errors
    this.expect([this.tok.T_AS, this.tok.T_INSTEADOF]);
    return node("traitalias", trait, method, null, null);
  },
};


/***/ }),

/***/ 1841:
/***/ ((module) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


module.exports = {
  /**
   *  Comments with // or # or / * ... * /
   */
  read_comment: function () {
    const text = this.text();
    let result = this.ast.prepare(
      text.substring(0, 2) === "/*" ? "commentblock" : "commentline",
      null,
      this
    );
    const offset = this.lexer.yylloc.first_offset;
    // handle location on comment
    const prev = this.prev;
    this.prev = [
      this.lexer.yylloc.last_line,
      this.lexer.yylloc.last_column,
      this.lexer.offset,
    ];
    this.lex();
    result = result(text);
    result.offset = offset;
    this.prev = prev;
    return result;
  },
  /**
   * Comments with / ** ... * /
   */
  read_doc_comment: function () {
    let result = this.ast.prepare("commentblock", null, this);
    const offset = this.lexer.yylloc.first_offset;
    const text = this.text();
    const prev = this.prev;
    this.prev = [
      this.lexer.yylloc.last_line,
      this.lexer.yylloc.last_column,
      this.lexer.offset,
    ];
    this.lex();
    result = result(text);
    result.offset = offset;
    this.prev = prev;
    return result;
  },
};


/***/ }),

/***/ 1348:
/***/ ((module) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


module.exports = {
  read_expr: function (expr) {
    const result = this.node();
    if (this.token === "@") {
      if (!expr) {
        expr = this.next().read_expr();
      }
      return result("silent", expr);
    }
    if (!expr) {
      expr = this.read_expr_item();
    }
    // binary operations
    if (this.token === "|")
      return result("bin", "|", expr, this.next().read_expr());
    if (this.token === "&")
      return result("bin", "&", expr, this.next().read_expr());
    if (this.token === "^")
      return result("bin", "^", expr, this.next().read_expr());
    if (this.token === ".")
      return result("bin", ".", expr, this.next().read_expr());
    if (this.token === "+")
      return result("bin", "+", expr, this.next().read_expr());
    if (this.token === "-")
      return result("bin", "-", expr, this.next().read_expr());
    if (this.token === "*")
      return result("bin", "*", expr, this.next().read_expr());
    if (this.token === "/")
      return result("bin", "/", expr, this.next().read_expr());
    if (this.token === "%")
      return result("bin", "%", expr, this.next().read_expr());
    if (this.token === this.tok.T_POW)
      return result("bin", "**", expr, this.next().read_expr());
    if (this.token === this.tok.T_SL)
      return result("bin", "<<", expr, this.next().read_expr());
    if (this.token === this.tok.T_SR)
      return result("bin", ">>", expr, this.next().read_expr());
    // more binary operations (formerly bool)
    if (this.token === this.tok.T_BOOLEAN_OR)
      return result("bin", "||", expr, this.next().read_expr());
    if (this.token === this.tok.T_LOGICAL_OR)
      return result("bin", "or", expr, this.next().read_expr());
    if (this.token === this.tok.T_BOOLEAN_AND)
      return result("bin", "&&", expr, this.next().read_expr());
    if (this.token === this.tok.T_LOGICAL_AND)
      return result("bin", "and", expr, this.next().read_expr());
    if (this.token === this.tok.T_LOGICAL_XOR)
      return result("bin", "xor", expr, this.next().read_expr());
    if (this.token === this.tok.T_IS_IDENTICAL)
      return result("bin", "===", expr, this.next().read_expr());
    if (this.token === this.tok.T_IS_NOT_IDENTICAL)
      return result("bin", "!==", expr, this.next().read_expr());
    if (this.token === this.tok.T_IS_EQUAL)
      return result("bin", "==", expr, this.next().read_expr());
    if (this.token === this.tok.T_IS_NOT_EQUAL)
      return result("bin", "!=", expr, this.next().read_expr());
    if (this.token === "<")
      return result("bin", "<", expr, this.next().read_expr());
    if (this.token === ">")
      return result("bin", ">", expr, this.next().read_expr());
    if (this.token === this.tok.T_IS_SMALLER_OR_EQUAL)
      return result("bin", "<=", expr, this.next().read_expr());
    if (this.token === this.tok.T_IS_GREATER_OR_EQUAL)
      return result("bin", ">=", expr, this.next().read_expr());
    if (this.token === this.tok.T_SPACESHIP)
      return result("bin", "<=>", expr, this.next().read_expr());
    if (this.token === this.tok.T_INSTANCEOF) {
      expr = result(
        "bin",
        "instanceof",
        expr,
        this.next().read_class_name_reference()
      );
      if (
        this.token !== ";" &&
        this.token !== this.tok.T_INLINE_HTML &&
        this.token !== this.EOF
      ) {
        expr = this.read_expr(expr);
      }
    }

    // extra operations :
    // $username = $_GET['user'] ?? 'nobody';
    if (this.token === this.tok.T_COALESCE)
      return result("bin", "??", expr, this.next().read_expr());

    // extra operations :
    // $username = $_GET['user'] ? true : false;
    if (this.token === "?") {
      let trueArg = null;
      if (this.next().token !== ":") {
        trueArg = this.read_expr();
      }
      this.expect(":") && this.next();
      return result("retif", expr, trueArg, this.read_expr());
    } else {
      // see #193
      result.destroy(expr);
    }

    return expr;
  },

  /**
   * Reads a cast expression
   */
  read_expr_cast: function (type) {
    return this.node("cast")(type, this.text(), this.next().read_expr());
  },

  /**
   * Read a isset variable
   */
  read_isset_variable: function () {
    return this.read_expr();
  },

  /**
   * Reads isset variables
   */
  read_isset_variables: function () {
    return this.read_function_list(this.read_isset_variable, ",");
  },

  /*
   * Reads internal PHP functions
   */
  read_internal_functions_in_yacc: function () {
    let result = null;
    switch (this.token) {
      case this.tok.T_ISSET:
        {
          result = this.node("isset");
          if (this.next().expect("(")) {
            this.next();
          }
          const variables = this.read_isset_variables();
          if (this.expect(")")) {
            this.next();
          }
          result = result(variables);
        }
        break;
      case this.tok.T_EMPTY:
        {
          result = this.node("empty");
          if (this.next().expect("(")) {
            this.next();
          }
          const expression = this.read_expr();
          if (this.expect(")")) {
            this.next();
          }
          result = result(expression);
        }
        break;
      case this.tok.T_INCLUDE:
        result = this.node("include")(false, false, this.next().read_expr());
        break;
      case this.tok.T_INCLUDE_ONCE:
        result = this.node("include")(true, false, this.next().read_expr());
        break;
      case this.tok.T_EVAL:
        {
          result = this.node("eval");
          if (this.next().expect("(")) {
            this.next();
          }
          const expr = this.read_expr();
          if (this.expect(")")) {
            this.next();
          }
          result = result(expr);
        }
        break;
      case this.tok.T_REQUIRE:
        result = this.node("include")(false, true, this.next().read_expr());
        break;
      case this.tok.T_REQUIRE_ONCE:
        result = this.node("include")(true, true, this.next().read_expr());
        break;
    }

    return result;
  },

  /**
   * Reads optional expression
   */
  read_optional_expr: function (stopToken) {
    if (this.token !== stopToken) {
      return this.read_expr();
    }

    return null;
  },

  /**
   * Reads exit expression
   */
  read_exit_expr: function () {
    let expression = null;

    if (this.token === "(") {
      this.next();
      expression = this.read_optional_expr(")");
      this.expect(")") && this.next();
    }

    return expression;
  },

  /**
   * ```ebnf
   * Reads an expression
   *  expr ::= @todo
   * ```
   */
  read_expr_item: function () {
    let result, expr;
    if (this.token === "+")
      return this.node("unary")("+", this.next().read_expr());
    if (this.token === "-")
      return this.node("unary")("-", this.next().read_expr());
    if (this.token === "!")
      return this.node("unary")("!", this.next().read_expr());
    if (this.token === "~")
      return this.node("unary")("~", this.next().read_expr());

    if (this.token === "(") {
      expr = this.next().read_expr();
      expr.parenthesizedExpression = true;
      this.expect(")") && this.next();
      return this.handleDereferencable(expr);
    }

    if (this.token === "`") {
      // https://github.com/php/php-src/blob/master/Zend/zend_language_parser.y#L1048
      return this.read_encapsed_string("`");
    }

    if (this.token === this.tok.T_LIST) {
      let assign = null;
      const isInner = this.innerList;
      result = this.node("list");
      if (!isInner) {
        assign = this.node("assign");
      }
      if (this.next().expect("(")) {
        this.next();
      }

      if (!this.innerList) this.innerList = true;

      // reads inner items
      const assignList = this.read_array_pair_list(false);
      if (this.expect(")")) {
        this.next();
      }

      // check if contains at least one assignment statement
      let hasItem = false;
      for (let i = 0; i < assignList.length; i++) {
        if (assignList[i] !== null && assignList[i].kind !== "noop") {
          hasItem = true;
          break;
        }
      }
      if (!hasItem) {
        this.raiseError(
          "Fatal Error :  Cannot use empty list on line " +
            this.lexer.yylloc.first_line
        );
      }

      // handles the node resolution
      if (!isInner) {
        this.innerList = false;
        if (this.expect("=")) {
          return assign(
            result(assignList, false),
            this.next().read_expr(),
            "="
          );
        } else {
          // error fallback : list($a, $b);
          return result(assignList, false);
        }
      } else {
        return result(assignList, false);
      }
    }

    if (this.token === this.tok.T_CLONE)
      return this.node("clone")(this.next().read_expr());

    switch (this.token) {
      case this.tok.T_INC:
        return this.node("pre")("+", this.next().read_variable(false, false));

      case this.tok.T_DEC:
        return this.node("pre")("-", this.next().read_variable(false, false));

      case this.tok.T_NEW:
        return this.read_new_expr();

      case this.tok.T_ISSET:
      case this.tok.T_EMPTY:
      case this.tok.T_INCLUDE:
      case this.tok.T_INCLUDE_ONCE:
      case this.tok.T_EVAL:
      case this.tok.T_REQUIRE:
      case this.tok.T_REQUIRE_ONCE:
        return this.read_internal_functions_in_yacc();
      case this.tok.T_INT_CAST:
        return this.read_expr_cast("int");

      case this.tok.T_DOUBLE_CAST:
        return this.read_expr_cast("float");

      case this.tok.T_STRING_CAST:
        return this.read_expr_cast(
          this.text().indexOf("binary") !== -1 ? "binary" : "string"
        );

      case this.tok.T_ARRAY_CAST:
        return this.read_expr_cast("array");

      case this.tok.T_OBJECT_CAST:
        return this.read_expr_cast("object");

      case this.tok.T_BOOL_CAST:
        return this.read_expr_cast("bool");

      case this.tok.T_UNSET_CAST:
        return this.read_expr_cast("unset");

      case this.tok.T_EXIT: {
        const useDie = this.lexer.yytext.toLowerCase() === "die";
        result = this.node("exit");
        this.next();
        const expression = this.read_exit_expr();
        return result(expression, useDie);
      }

      case this.tok.T_PRINT:
        return this.node("print")(this.next().read_expr());

      // T_YIELD (expr (T_DOUBLE_ARROW expr)?)?
      case this.tok.T_YIELD: {
        let value = null;
        let key = null;
        result = this.node("yield");
        if (this.next().is("EXPR")) {
          // reads the yield return value
          value = this.read_expr();
          if (this.token === this.tok.T_DOUBLE_ARROW) {
            // reads the yield returned key
            key = value;
            value = this.next().read_expr();
          }
        }
        return result(value, key);
      }

      // T_YIELD_FROM expr
      case this.tok.T_YIELD_FROM:
        result = this.node("yieldfrom");
        expr = this.next().read_expr();
        return result(expr);

      case this.tok.T_FN:
      case this.tok.T_FUNCTION:
        return this.read_inline_function();

      case this.tok.T_STATIC: {
        const backup = [this.token, this.lexer.getState()];
        this.next();
        if (
          this.token === this.tok.T_FUNCTION ||
          (this.version >= 704 && this.token === this.tok.T_FN)
        ) {
          // handles static function
          return this.read_inline_function([0, 1, 0]);
        } else {
          // rollback
          this.lexer.tokens.push(backup);
          this.next();
        }
      }
    }

    // SCALAR | VARIABLE
    if (this.is("VARIABLE")) {
      result = this.node();
      expr = this.read_variable(false, false);

      // https://github.com/php/php-src/blob/master/Zend/zend_language_parser.y#L877
      // should accept only a variable
      const isConst =
        expr.kind === "identifier" ||
        (expr.kind === "staticlookup" && expr.offset.kind === "identifier");

      // VARIABLES SPECIFIC OPERATIONS
      switch (this.token) {
        case "=": {
          if (isConst) this.error("VARIABLE");
          if (this.next().token == "&") {
            return this.read_assignref(result, expr);
          }
          return result("assign", expr, this.read_expr(), "=");
        }

        // operations :
        case this.tok.T_PLUS_EQUAL:
          if (isConst) this.error("VARIABLE");
          return result("assign", expr, this.next().read_expr(), "+=");

        case this.tok.T_MINUS_EQUAL:
          if (isConst) this.error("VARIABLE");
          return result("assign", expr, this.next().read_expr(), "-=");

        case this.tok.T_MUL_EQUAL:
          if (isConst) this.error("VARIABLE");
          return result("assign", expr, this.next().read_expr(), "*=");

        case this.tok.T_POW_EQUAL:
          if (isConst) this.error("VARIABLE");
          return result("assign", expr, this.next().read_expr(), "**=");

        case this.tok.T_DIV_EQUAL:
          if (isConst) this.error("VARIABLE");
          return result("assign", expr, this.next().read_expr(), "/=");

        case this.tok.T_CONCAT_EQUAL:
          if (isConst) this.error("VARIABLE");
          return result("assign", expr, this.next().read_expr(), ".=");

        case this.tok.T_MOD_EQUAL:
          if (isConst) this.error("VARIABLE");
          return result("assign", expr, this.next().read_expr(), "%=");

        case this.tok.T_AND_EQUAL:
          if (isConst) this.error("VARIABLE");
          return result("assign", expr, this.next().read_expr(), "&=");

        case this.tok.T_OR_EQUAL:
          if (isConst) this.error("VARIABLE");
          return result("assign", expr, this.next().read_expr(), "|=");

        case this.tok.T_XOR_EQUAL:
          if (isConst) this.error("VARIABLE");
          return result("assign", expr, this.next().read_expr(), "^=");

        case this.tok.T_SL_EQUAL:
          if (isConst) this.error("VARIABLE");
          return result("assign", expr, this.next().read_expr(), "<<=");

        case this.tok.T_SR_EQUAL:
          if (isConst) this.error("VARIABLE");
          return result("assign", expr, this.next().read_expr(), ">>=");

        case this.tok.T_COALESCE_EQUAL:
          if (isConst) this.error("VARIABLE");
          return result("assign", expr, this.next().read_expr(), "??=");

        case this.tok.T_INC:
          if (isConst) this.error("VARIABLE");
          this.next();
          return result("post", "+", expr);
        case this.tok.T_DEC:
          if (isConst) this.error("VARIABLE");
          this.next();
          return result("post", "-", expr);
        default:
          // see #193
          result.destroy(expr);
      }
    } else if (this.is("SCALAR")) {
      result = this.node();
      expr = this.read_scalar();
      if (expr.kind === "array" && expr.shortForm && this.token === "=") {
        // list assign
        const list = this.convertToList(expr);
        if (expr.loc) list.loc = expr.loc;
        const right = this.next().read_expr();
        return result("assign", list, right, "=");
      } else {
        // see #189 - swap docs on nodes
        result.destroy(expr);
      }
      // classic array
      return this.handleDereferencable(expr);
    } else {
      this.error("EXPR");
      this.next();
    }

    // returns variable | scalar
    return expr;
  },

  /**
   * Recursively convert nested array to nested list.
   */
  convertToList: function (array) {
    const convertedItems = array.items.map((entry) => {
      if (
        entry.value &&
        entry.value.kind === "array" &&
        entry.value.shortForm
      ) {
        entry.value = this.convertToList(entry.value);
      }
      return entry;
    });
    const node = this.node("list")(convertedItems, true);
    if (array.loc) node.loc = array.loc;
    if (array.leadingComments) node.leadingComments = array.leadingComments;
    if (array.trailingComments) node.trailingComments = array.trailingComments;
    return node;
  },

  /**
   * Reads assignment
   * @param {*} left
   */
  read_assignref: function (result, left) {
    this.next();
    let right;
    if (this.token === this.tok.T_NEW) {
      if (this.version >= 700) {
        this.error();
      }
      right = this.read_new_expr();
    } else {
      right = this.read_variable(false, false);
    }

    return result("assignref", left, right);
  },

  /**
   *
   * inline_function:
   * 		function returns_ref backup_doc_comment '(' parameter_list ')' lexical_vars return_type
   * 		backup_fn_flags '{' inner_statement_list '}' backup_fn_flags
   * 			{ $$ = zend_ast_create_decl(ZEND_AST_CLOSURE, $2 | $13, $1, $3,
   * 				  zend_string_init("{closure}", sizeof("{closure}") - 1, 0),
   * 				  $5, $7, $11, $8); CG(extra_fn_flags) = $9; }
   * 	|	fn returns_ref '(' parameter_list ')' return_type backup_doc_comment T_DOUBLE_ARROW backup_fn_flags backup_lex_pos expr backup_fn_flags
   * 			{ $$ = zend_ast_create_decl(ZEND_AST_ARROW_FUNC, $2 | $12, $1, $7,
   * 				  zend_string_init("{closure}", sizeof("{closure}") - 1, 0), $4, NULL,
   * 				  zend_ast_create(ZEND_AST_RETURN, $11), $6);
   * 				  ((zend_ast_decl *) $$)->lex_pos = $10;
   * 				  CG(extra_fn_flags) = $9; }   *
   */
  read_inline_function: function (flags) {
    if (this.token === this.tok.T_FUNCTION) {
      return this.read_function(true, flags);
    }
    // introduced in PHP 7.4
    if (!this.version >= 704) {
      this.raiseError("Arrow Functions are not allowed");
    }
    // as an arrowfunc
    const node = this.node("arrowfunc");
    // eat T_FN
    if (this.expect(this.tok.T_FN)) this.next();
    // check the &
    const isRef = this.is_reference();
    // ...
    if (this.expect("(")) this.next();
    const params = this.read_parameter_list();
    if (this.expect(")")) this.next();
    let nullable = false;
    let returnType = null;
    if (this.token === ":") {
      if (this.next().token === "?") {
        nullable = true;
        this.next();
      }
      returnType = this.read_type();
    }
    if (this.expect(this.tok.T_DOUBLE_ARROW)) this.next();
    const body = this.read_expr();
    return node(
      params,
      isRef,
      body,
      returnType,
      nullable,
      flags ? true : false
    );
  },

  /**
   * ```ebnf
   *    new_expr ::= T_NEW (namespace_name function_argument_list) | (T_CLASS ... class declaration)
   * ```
   * https://github.com/php/php-src/blob/master/Zend/zend_language_parser.y#L850
   */
  read_new_expr: function () {
    const result = this.node("new");
    this.expect(this.tok.T_NEW) && this.next();
    let args = [];
    if (this.token === this.tok.T_CLASS) {
      const what = this.node("class");
      // Annonymous class declaration
      if (this.next().token === "(") {
        args = this.read_argument_list();
      }
      const propExtends = this.read_extends_from();
      const propImplements = this.read_implements_list();
      let body = null;
      if (this.expect("{")) {
        body = this.next().read_class_body();
      }
      return result(
        what(null, propExtends, propImplements, body, [0, 0, 0]),
        args
      );
    }
    // Already existing class
    const name = this.read_new_class_name();
    if (this.token === "(") {
      args = this.read_argument_list();
    }
    return result(name, args);
  },
  /**
   * Reads a class name
   * ```ebnf
   * read_new_class_name ::= namespace_name | variable
   * ```
   */
  read_new_class_name: function () {
    if (
      this.token === this.tok.T_NS_SEPARATOR ||
      this.token === this.tok.T_STRING ||
      this.token === this.tok.T_NAMESPACE
    ) {
      let result = this.read_namespace_name(true);
      if (this.token === this.tok.T_DOUBLE_COLON) {
        result = this.read_static_getter(result);
      }
      return result;
    } else if (this.is("VARIABLE")) {
      return this.read_variable(true, false);
    } else {
      this.expect([this.tok.T_STRING, "VARIABLE"]);
    }
  },
  handleDereferencable: function (expr) {
    while (this.token !== this.EOF) {
      if (
        this.token === this.tok.T_OBJECT_OPERATOR ||
        this.token === this.tok.T_DOUBLE_COLON
      ) {
        expr = this.recursive_variable_chain_scan(expr, false, false, true);
      } else if (this.token === this.tok.T_CURLY_OPEN || this.token === "[") {
        expr = this.read_dereferencable(expr);
      } else if (this.token === "(") {
        // https://github.com/php/php-src/blob/master/Zend/zend_language_parser.y#L1118
        expr = this.node("call")(expr, this.read_argument_list());
      } else {
        return expr;
      }
    }
    return expr;
  },
};


/***/ }),

/***/ 2275:
/***/ ((module) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


module.exports = {
  /**
   * checks if current token is a reference keyword
   */
  is_reference: function () {
    if (this.token == "&") {
      this.next();
      return true;
    }
    return false;
  },
  /**
   * checks if current token is a variadic keyword
   */
  is_variadic: function () {
    if (this.token === this.tok.T_ELLIPSIS) {
      this.next();
      return true;
    }
    return false;
  },
  /**
   * reading a function
   * ```ebnf
   * function ::= function_declaration code_block
   * ```
   */
  read_function: function (closure, flag) {
    const result = this.read_function_declaration(
      closure ? 1 : flag ? 2 : 0,
      flag && flag[1] === 1
    );
    if (flag && flag[2] == 1) {
      // abstract function :
      result.parseFlags(flag);
      if (this.expect(";")) {
        this.next();
      }
    } else {
      if (this.expect("{")) {
        result.body = this.read_code_block(false);
        if (result.loc && result.body.loc) {
          result.loc.end = result.body.loc.end;
        }
      }
      if (!closure && flag) {
        result.parseFlags(flag);
      }
    }
    return result;
  },
  /**
   * reads a function declaration (without his body)
   * ```ebnf
   * function_declaration ::= T_FUNCTION '&'?  T_STRING '(' parameter_list ')'
   * ```
   */
  read_function_declaration: function (type, isStatic) {
    let nodeName = "function";
    if (type === 1) {
      nodeName = "closure";
    } else if (type === 2) {
      nodeName = "method";
    }
    const result = this.node(nodeName);

    if (this.expect(this.tok.T_FUNCTION)) {
      this.next();
    }
    const isRef = this.is_reference();
    let name = false,
      use = [],
      returnType = null,
      nullable = false;
    if (type !== 1) {
      const nameNode = this.node("identifier");
      if (type === 2) {
        if (this.version >= 700) {
          if (this.token === this.tok.T_STRING || this.is("IDENTIFIER")) {
            name = this.text();
            this.next();
          } else if (this.version < 704) {
            this.error("IDENTIFIER");
          }
        } else if (this.token === this.tok.T_STRING) {
          name = this.text();
          this.next();
        } else {
          this.error("IDENTIFIER");
        }
      } else {
        if (this.version >= 700) {
          if (this.token === this.tok.T_STRING) {
            name = this.text();
            this.next();
          } else if (this.version >= 704) {
            if (!this.expect("(")) {
              this.next();
            }
          } else {
            this.error(this.tok.T_STRING);
            this.next();
          }
        } else {
          if (this.expect(this.tok.T_STRING)) {
            name = this.text();
          }
          this.next();
        }
      }
      name = nameNode(name);
    }
    if (this.expect("(")) this.next();
    const params = this.read_parameter_list();
    if (this.expect(")")) this.next();
    if (type === 1) {
      use = this.read_lexical_vars();
    }
    if (this.token === ":") {
      if (this.next().token === "?") {
        nullable = true;
        this.next();
      }
      returnType = this.read_type();
    }
    if (type === 1) {
      // closure
      return result(params, isRef, use, returnType, nullable, isStatic);
    }
    return result(name, params, isRef, returnType, nullable);
  },

  read_lexical_vars: function () {
    let result = [];

    if (this.token === this.tok.T_USE) {
      this.next();
      this.expect("(") && this.next();
      result = this.read_lexical_var_list();
      this.expect(")") && this.next();
    }

    return result;
  },

  read_lexical_var_list: function () {
    return this.read_list(this.read_lexical_var, ",");
  },

  /**
   * ```ebnf
   * lexical_var ::= '&'? T_VARIABLE
   * ```
   */
  read_lexical_var: function () {
    if (this.token === "&") {
      return this.read_byref(this.read_lexical_var.bind(this));
    }
    const result = this.node("variable");
    this.expect(this.tok.T_VARIABLE);
    const name = this.text().substring(1);
    this.next();
    return result(name, false);
  },
  /**
   * reads a list of parameters
   * ```ebnf
   *  parameter_list ::= (parameter ',')* parameter?
   * ```
   */
  read_parameter_list: function () {
    const result = [];
    if (this.token != ")") {
      while (this.token != this.EOF) {
        result.push(this.read_parameter());
        if (this.token == ",") {
          this.next();
        } else if (this.token == ")") {
          break;
        } else {
          this.error([",", ")"]);
          break;
        }
      }
    }
    return result;
  },
  /**
   * ```ebnf
   *  parameter ::= type? '&'? T_ELLIPSIS? T_VARIABLE ('=' expr)?
   * ```
   * @see https://github.com/php/php-src/blob/493524454d66adde84e00d249d607ecd540de99f/Zend/zend_language_parser.y#L640
   */
  read_parameter: function () {
    const node = this.node("parameter");
    let parameterName = null;
    let value = null;
    let type = null;
    let nullable = false;
    if (this.token === "?") {
      this.next();
      nullable = true;
    }
    type = this.read_type();
    if (nullable && !type) {
      this.raiseError(
        "Expecting a type definition combined with nullable operator"
      );
    }
    const isRef = this.is_reference();
    const isVariadic = this.is_variadic();
    if (this.expect(this.tok.T_VARIABLE)) {
      parameterName = this.node("identifier");
      const name = this.text().substring(1);
      this.next();
      parameterName = parameterName(name);
    }
    if (this.token == "=") {
      value = this.next().read_expr();
    }
    return node(parameterName, type, value, isRef, isVariadic, nullable);
  },
  /**
   * Reads a list of arguments
   * ```ebnf
   *  function_argument_list ::= '(' (argument_list (',' argument_list)*)? ')'
   * ```
   */
  read_argument_list: function () {
    let result = [];
    this.expect("(") && this.next();
    if (this.token !== ")") {
      result = this.read_non_empty_argument_list();
    }
    this.expect(")") && this.next();
    return result;
  },
  /**
   * Reads non empty argument list
   */
  read_non_empty_argument_list: function () {
    let wasVariadic = false;

    return this.read_function_list(
      function () {
        const argument = this.read_argument();
        if (argument) {
          if (wasVariadic) {
            this.raiseError("Unexpected argument after a variadic argument");
          }
          if (argument.kind === "variadic") {
            wasVariadic = true;
          }
        }
        return argument;
      }.bind(this),
      ","
    );
  },
  /**
   * ```ebnf
   *    argument_list ::= T_ELLIPSIS? expr
   * ```
   */
  read_argument: function () {
    if (this.token === this.tok.T_ELLIPSIS) {
      return this.node("variadic")(this.next().read_expr());
    }
    return this.read_expr();
  },
  /**
   * read type hinting
   * ```ebnf
   *  type ::= T_ARRAY | T_CALLABLE | namespace_name
   * ```
   */
  read_type: function () {
    const result = this.node();
    if (this.token === this.tok.T_ARRAY || this.token === this.tok.T_CALLABLE) {
      const type = this.text();
      this.next();
      return result("typereference", type.toLowerCase(), type);
    } else if (this.token === this.tok.T_STRING) {
      const type = this.text();
      const backup = [this.token, this.lexer.getState()];
      this.next();
      if (
        this.token !== this.tok.T_NS_SEPARATOR &&
        this.ast.typereference.types.indexOf(type.toLowerCase()) > -1
      ) {
        return result("typereference", type.toLowerCase(), type);
      } else {
        // rollback a classic namespace
        this.lexer.tokens.push(backup);
        this.next();
        // fix : destroy not consumed node (release comments)
        result.destroy();
        return this.read_namespace_name();
      }
    } else if (
      this.token === this.tok.T_NAMESPACE ||
      this.token === this.tok.T_NS_SEPARATOR
    ) {
      // fix : destroy not consumed node (release comments)
      result.destroy();
      return this.read_namespace_name();
    }
    // fix : destroy not consumed node (release comments)
    result.destroy();
    return null;
  },
};


/***/ }),

/***/ 2648:
/***/ ((module) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


module.exports = {
  /**
   * Reads an IF statement
   *
   * ```ebnf
   *  if ::= T_IF '(' expr ')' ':' ...
   * ```
   */
  read_if: function () {
    const result = this.node("if");
    const test = this.next().read_if_expr();
    let body = null;
    let alternate = null;
    let shortForm = false;

    if (this.token === ":") {
      shortForm = true;
      this.next();
      body = this.node("block");
      const items = [];
      while (this.token !== this.EOF && this.token !== this.tok.T_ENDIF) {
        if (this.token === this.tok.T_ELSEIF) {
          alternate = this.read_elseif_short();
          break;
        } else if (this.token === this.tok.T_ELSE) {
          alternate = this.read_else_short();
          break;
        }
        items.push(this.read_inner_statement());
      }
      body = body(null, items);
      this.expect(this.tok.T_ENDIF) && this.next();
      this.expectEndOfStatement();
    } else {
      body = this.read_statement();
      if (this.token === this.tok.T_ELSEIF) {
        alternate = this.read_if();
      } else if (this.token === this.tok.T_ELSE) {
        alternate = this.next().read_statement();
      }
    }
    return result(test, body, alternate, shortForm);
  },
  /**
   * reads an if expression : '(' expr ')'
   */
  read_if_expr: function () {
    this.expect("(") && this.next();
    const result = this.read_expr();
    this.expect(")") && this.next();
    return result;
  },
  /**
   * reads an elseif (expr): statements
   */
  read_elseif_short: function () {
    let alternate = null;
    const result = this.node("if");
    const test = this.next().read_if_expr();
    if (this.expect(":")) this.next();
    const body = this.node("block");
    const items = [];
    while (this.token != this.EOF && this.token !== this.tok.T_ENDIF) {
      if (this.token === this.tok.T_ELSEIF) {
        alternate = this.read_elseif_short();
        break;
      } else if (this.token === this.tok.T_ELSE) {
        alternate = this.read_else_short();
        break;
      }
      items.push(this.read_inner_statement());
    }
    return result(test, body(null, items), alternate, true);
  },
  /**
   *
   */
  read_else_short: function () {
    if (this.next().expect(":")) this.next();
    const body = this.node("block");
    const items = [];
    while (this.token != this.EOF && this.token !== this.tok.T_ENDIF) {
      items.push(this.read_inner_statement());
    }
    return body(null, items);
  },
};


/***/ }),

/***/ 4099:
/***/ ((module) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


module.exports = {
  /**
   * Reads a while statement
   * ```ebnf
   * while ::= T_WHILE (statement | ':' inner_statement_list T_ENDWHILE ';')
   * ```
   * @see https://github.com/php/php-src/blob/master/Zend/zend_language_parser.y#L587
   * @return {While}
   */
  read_while: function () {
    const result = this.node("while");
    this.expect(this.tok.T_WHILE) && this.next();
    let test = null;
    let body = null;
    let shortForm = false;
    if (this.expect("(")) this.next();
    test = this.read_expr();
    if (this.expect(")")) this.next();
    if (this.token === ":") {
      shortForm = true;
      body = this.read_short_form(this.tok.T_ENDWHILE);
    } else {
      body = this.read_statement();
    }
    return result(test, body, shortForm);
  },
  /**
   * Reads a do / while loop
   * ```ebnf
   * do ::= T_DO statement T_WHILE '(' expr ')' ';'
   * ```
   * @see https://github.com/php/php-src/blob/master/Zend/zend_language_parser.y#L423
   * @return {Do}
   */
  read_do: function () {
    const result = this.node("do");
    this.expect(this.tok.T_DO) && this.next();
    let test = null;
    let body = null;
    body = this.read_statement();
    if (this.expect(this.tok.T_WHILE)) {
      if (this.next().expect("(")) this.next();
      test = this.read_expr();
      if (this.expect(")")) this.next();
      if (this.expect(";")) this.next();
    }
    return result(test, body);
  },
  /**
   * Read a for incremental loop
   * ```ebnf
   * for ::= T_FOR '(' for_exprs ';' for_exprs ';' for_exprs ')' for_statement
   * for_statement ::= statement | ':' inner_statement_list T_ENDFOR ';'
   * for_exprs ::= expr? (',' expr)*
   * ```
   * @see https://github.com/php/php-src/blob/master/Zend/zend_language_parser.y#L425
   * @return {For}
   */
  read_for: function () {
    const result = this.node("for");
    this.expect(this.tok.T_FOR) && this.next();
    let init = [];
    let test = [];
    let increment = [];
    let body = null;
    let shortForm = false;
    if (this.expect("(")) this.next();
    if (this.token !== ";") {
      init = this.read_list(this.read_expr, ",");
      if (this.expect(";")) this.next();
    } else {
      this.next();
    }
    if (this.token !== ";") {
      test = this.read_list(this.read_expr, ",");
      if (this.expect(";")) this.next();
    } else {
      this.next();
    }
    if (this.token !== ")") {
      increment = this.read_list(this.read_expr, ",");
      if (this.expect(")")) this.next();
    } else {
      this.next();
    }
    if (this.token === ":") {
      shortForm = true;
      body = this.read_short_form(this.tok.T_ENDFOR);
    } else {
      body = this.read_statement();
    }
    return result(init, test, increment, body, shortForm);
  },
  /**
   * Reads a foreach loop
   * ```ebnf
   * foreach ::= '(' expr T_AS foreach_variable (T_DOUBLE_ARROW foreach_variable)? ')' statement
   * ```
   * @see https://github.com/php/php-src/blob/master/Zend/zend_language_parser.y#L438
   * @return {Foreach}
   */
  read_foreach: function () {
    const result = this.node("foreach");
    this.expect(this.tok.T_FOREACH) && this.next();
    let source = null;
    let key = null;
    let value = null;
    let body = null;
    let shortForm = false;
    if (this.expect("(")) this.next();
    source = this.read_expr();
    if (this.expect(this.tok.T_AS)) {
      this.next();
      value = this.read_foreach_variable();
      if (this.token === this.tok.T_DOUBLE_ARROW) {
        key = value;
        value = this.next().read_foreach_variable();
      }
    }

    // grammatically correct but not supported by PHP
    if (key && key.kind === "list") {
      this.raiseError("Fatal Error : Cannot use list as key element");
    }

    if (this.expect(")")) this.next();

    if (this.token === ":") {
      shortForm = true;
      body = this.read_short_form(this.tok.T_ENDFOREACH);
    } else {
      body = this.read_statement();
    }
    return result(source, key, value, body, shortForm);
  },
  /**
   * Reads a foreach variable statement
   * ```ebnf
   * foreach_variable =
   *    variable |
   *    '&' variable |
   *    T_LIST '(' assignment_list ')' |
   *    '[' assignment_list ']'
   * ```
   * @see https://github.com/php/php-src/blob/master/Zend/zend_language_parser.y#L544
   * @return {Expression}
   */
  read_foreach_variable: function () {
    if (this.token === this.tok.T_LIST || this.token === "[") {
      const isShort = this.token === "[";
      const result = this.node("list");
      this.next();
      if (!isShort && this.expect("(")) this.next();
      const assignList = this.read_array_pair_list(isShort);
      if (this.expect(isShort ? "]" : ")")) this.next();
      return result(assignList, isShort);
    } else {
      return this.read_variable(false, false);
    }
  },
};


/***/ }),

/***/ 7652:
/***/ ((module) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


module.exports = {
  /**
   * ```ebnf
   * start ::= (namespace | top_statement)*
   * ```
   */
  read_start: function () {
    if (this.token == this.tok.T_NAMESPACE) {
      return this.read_namespace();
    } else {
      return this.read_top_statement();
    }
  },
};


/***/ }),

/***/ 5663:
/***/ ((module) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


module.exports = {
  /**
   * Reads a namespace declaration block
   * ```ebnf
   * namespace ::= T_NAMESPACE namespace_name? '{'
   *    top_statements
   * '}'
   * | T_NAMESPACE namespace_name ';' top_statements
   * ```
   * @see http://php.net/manual/en/language.namespaces.php
   * @return {Namespace}
   */
  read_namespace: function () {
    const result = this.node("namespace");
    let body;
    this.expect(this.tok.T_NAMESPACE) && this.next();
    let name;

    if (this.token == "{") {
      name = {
        name: [""],
      };
    } else {
      name = this.read_namespace_name();
    }
    this.currentNamespace = name;

    if (this.token == ";") {
      this.currentNamespace = name;
      body = this.next().read_top_statements();
      this.expect(this.EOF);
      return result(name.name, body, false);
    } else if (this.token == "{") {
      this.currentNamespace = name;
      body = this.next().read_top_statements();
      this.expect("}") && this.next();
      if (
        body.length === 0 &&
        this.extractDoc &&
        this._docs.length > this._docIndex
      ) {
        body.push(this.node("noop")());
      }
      return result(name.name, body, true);
    } else if (this.token === "(") {
      // @fixme after merging #478
      name.resolution = this.ast.reference.RELATIVE_NAME;
      name.name = name.name.substring(1);
      result.destroy();
      return this.node("call")(name, this.read_argument_list());
    } else {
      this.error(["{", ";"]);
      // graceful mode :
      this.currentNamespace = name;
      body = this.read_top_statements();
      this.expect(this.EOF);
      return result(name, body, false);
    }
  },
  /**
   * Reads a namespace name
   * ```ebnf
   *  namespace_name ::= T_NS_SEPARATOR? (T_STRING T_NS_SEPARATOR)* T_STRING
   * ```
   * @see http://php.net/manual/en/language.namespaces.rules.php
   * @return {Reference}
   */
  read_namespace_name: function (resolveReference) {
    const result = this.node();
    let relative = false;
    if (this.token === this.tok.T_NAMESPACE) {
      this.next().expect(this.tok.T_NS_SEPARATOR) && this.next();
      relative = true;
    }
    const names = this.read_list(
      this.tok.T_STRING,
      this.tok.T_NS_SEPARATOR,
      true
    );
    if (
      !relative &&
      names.length === 1 &&
      (resolveReference || this.token !== "(")
    ) {
      if (names[0].toLowerCase() === "parent") {
        return result("parentreference", names[0]);
      } else if (names[0].toLowerCase() === "self") {
        return result("selfreference", names[0]);
      }
    }
    return result("name", names, relative);
  },
  /**
   * Reads a use statement
   * ```ebnf
   * use_statement ::= T_USE
   *   use_type? use_declarations |
   *   use_type use_statement '{' use_declarations '}' |
   *   use_statement '{' use_declarations(=>typed) '}'
   * ';'
   * ```
   * @see http://php.net/manual/en/language.namespaces.importing.php
   * @return {UseGroup}
   */
  read_use_statement: function () {
    let result = this.node("usegroup");
    let items = [];
    let name = null;
    this.expect(this.tok.T_USE) && this.next();
    const type = this.read_use_type();
    items.push(this.read_use_declaration(false));
    if (this.token === ",") {
      items = items.concat(this.next().read_use_declarations(false));
    } else if (this.token === "{") {
      name = items[0].name;
      items = this.next().read_use_declarations(type === null);
      this.expect("}") && this.next();
    }
    result = result(name, type, items);
    this.expect(";") && this.next();
    return result;
  },
  /**
   *
   * @see https://github.com/php/php-src/blob/master/Zend/zend_language_parser.y#L1045
   */
  read_class_name_reference: function () {
    // resolved as the same
    return this.read_variable(true, false);
  },
  /**
   * Reads a use declaration
   * ```ebnf
   * use_declaration ::= use_type? namespace_name use_alias
   * ```
   * @see https://github.com/php/php-src/blob/master/Zend/zend_language_parser.y#L380
   * @return {UseItem}
   */
  read_use_declaration: function (typed) {
    const result = this.node("useitem");
    let type = null;
    if (typed) type = this.read_use_type();
    const name = this.read_namespace_name();
    const alias = this.read_use_alias();
    return result(name.name, alias, type);
  },
  /**
   * Reads a list of use declarations
   * ```ebnf
   * use_declarations ::= use_declaration (',' use_declaration)*
   * ```
   * @see https://github.com/php/php-src/blob/master/Zend/zend_language_parser.y#L380
   * @return {UseItem[]}
   */
  read_use_declarations: function (typed) {
    const result = [this.read_use_declaration(typed)];
    while (this.token === ",") {
      this.next();
      if (typed) {
        if (
          this.token !== this.tok.T_FUNCTION &&
          this.token !== this.tok.T_CONST &&
          this.token !== this.tok.T_STRING
        ) {
          break;
        }
      } else if (
        this.token !== this.tok.T_STRING &&
        this.token !== this.tok.T_NS_SEPARATOR
      ) {
        break;
      }
      result.push(this.read_use_declaration(typed));
    }
    return result;
  },
  /**
   * Reads a use statement
   * ```ebnf
   * use_alias ::= (T_AS T_STRING)?
   * ```
   * @return {String|null}
   */
  read_use_alias: function () {
    let result = null;
    if (this.token === this.tok.T_AS) {
      if (this.next().expect(this.tok.T_STRING)) {
        const aliasName = this.node("identifier");
        const name = this.text();
        this.next();
        result = aliasName(name);
      }
    }
    return result;
  },
  /**
   * Reads the namespace type declaration
   * ```ebnf
   * use_type ::= (T_FUNCTION | T_CONST)?
   * ```
   * @see https://github.com/php/php-src/blob/master/Zend/zend_language_parser.y#L335
   * @return {String|null} Possible values : function, const
   */
  read_use_type: function () {
    if (this.token === this.tok.T_FUNCTION) {
      this.next();
      return this.ast.useitem.TYPE_FUNCTION;
    } else if (this.token === this.tok.T_CONST) {
      this.next();
      return this.ast.useitem.TYPE_CONST;
    }
    return null;
  },
};


/***/ }),

/***/ 4551:
/***/ ((module) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


const specialChar = {
  "\\": "\\",
  $: "$",
  n: "\n",
  r: "\r",
  t: "\t",
  f: String.fromCharCode(12),
  v: String.fromCharCode(11),
  e: String.fromCharCode(27),
};

module.exports = {
  /**
   * Unescape special chars
   */
  resolve_special_chars: function (text, doubleQuote) {
    if (!doubleQuote) {
      // single quote fix
      return text.replace(/\\\\/g, "\\").replace(/\\'/g, "'");
    }
    return text
      .replace(/\\"/, '"')
      .replace(
        /\\([\\$nrtfve]|[xX][0-9a-fA-F]{1,2}|[0-7]{1,3}|u{([0-9a-fA-F]+)})/g,
        ($match, p1, p2) => {
          if (specialChar[p1]) {
            return specialChar[p1];
          } else if ("x" === p1[0] || "X" === p1[0]) {
            return String.fromCodePoint(parseInt(p1.substr(1), 16));
          } else if ("u" === p1[0]) {
            return String.fromCodePoint(parseInt(p2, 16));
          } else {
            return String.fromCodePoint(parseInt(p1, 8));
          }
        }
      );
  },

  /**
   * Remove all leading spaces each line for heredoc text if there is a indentation
   * @param {string} text
   * @param {number} indentation
   * @param {boolean} indentation_uses_spaces
   * @param {boolean} first_encaps_node if it is behind a variable, the first N spaces should not be removed
   */
  remove_heredoc_leading_whitespace_chars: function (
    text,
    indentation,
    indentation_uses_spaces,
    first_encaps_node
  ) {
    if (indentation === 0) {
      return text;
    }

    this.check_heredoc_indentation_level(
      text,
      indentation,
      indentation_uses_spaces,
      first_encaps_node
    );

    const matchedChar = indentation_uses_spaces ? " " : "\t";
    const removementRegExp = new RegExp(
      `\\n${matchedChar}{${indentation}}`,
      "g"
    );
    const removementFirstEncapsNodeRegExp = new RegExp(
      `^${matchedChar}{${indentation}}`
    );

    // Rough replace, need more check
    if (first_encaps_node) {
      // Remove text leading whitespace
      text = text.replace(removementFirstEncapsNodeRegExp, "");
    }

    // Remove leading whitespace after \n
    return text.replace(removementRegExp, "\n");
  },

  /**
   * Check indentation level of heredoc in text, if mismatch, raiseError
   * @param {string} text
   * @param {number} indentation
   * @param {boolean} indentation_uses_spaces
   * @param {boolean} first_encaps_node if it is behind a variable, the first N spaces should not be removed
   */
  check_heredoc_indentation_level: function (
    text,
    indentation,
    indentation_uses_spaces,
    first_encaps_node
  ) {
    const textSize = text.length;
    let offset = 0;
    let leadingWhitespaceCharCount = 0;
    /**
     * @var inCoutingState {boolean} reset to true after a new line
     */
    let inCoutingState = true;
    const chToCheck = indentation_uses_spaces ? " " : "\t";
    let inCheckState = false;
    if (!first_encaps_node) {
      // start from first \n
      offset = text.indexOf("\n");
      // if no \n, just return
      if (offset === -1) {
        return;
      }
      offset++;
    }
    while (offset < textSize) {
      if (inCoutingState) {
        if (text[offset] === chToCheck) {
          leadingWhitespaceCharCount++;
        } else {
          inCheckState = true;
        }
      } else {
        inCoutingState = false;
      }

      if (
        text[offset] !== "\n" &&
        inCheckState &&
        leadingWhitespaceCharCount < indentation
      ) {
        this.raiseError(
          `Invalid body indentation level (expecting an indentation at least ${indentation})`
        );
      } else {
        inCheckState = false;
      }

      if (text[offset] === "\n") {
        // Reset counting state
        inCoutingState = true;
        leadingWhitespaceCharCount = 0;
      }
      offset++;
    }
  },

  /**
   * Reads dereferencable scalar
   */
  read_dereferencable_scalar: function () {
    let result = null;

    switch (this.token) {
      case this.tok.T_CONSTANT_ENCAPSED_STRING:
        {
          let value = this.node("string");
          const text = this.text();
          let offset = 0;
          if (text[0] === "b" || text[0] === "B") {
            offset = 1;
          }
          const isDoubleQuote = text[offset] === '"';
          this.next();
          const textValue = this.resolve_special_chars(
            text.substring(offset + 1, text.length - 1),
            isDoubleQuote
          );
          value = value(
            isDoubleQuote,
            textValue,
            offset === 1, // unicode flag
            text
          );
          if (this.token === this.tok.T_DOUBLE_COLON) {
            // https://github.com/php/php-src/blob/master/Zend/zend_language_parser.y#L1151
            result = this.read_static_getter(value);
          } else {
            // dirrect string
            result = value;
          }
        }
        break;
      case this.tok.T_ARRAY: // array parser
        result = this.read_array();
        break;
      case "[": // short array format
        result = this.read_array();
        break;
    }

    return result;
  },

  /**
   * ```ebnf
   *  scalar ::= T_MAGIC_CONST
   *       | T_LNUMBER | T_DNUMBER
   *       | T_START_HEREDOC T_ENCAPSED_AND_WHITESPACE? T_END_HEREDOC
   *       | '"' encaps_list '"'
   *       | T_START_HEREDOC encaps_list T_END_HEREDOC
   *       | namespace_name (T_DOUBLE_COLON T_STRING)?
   * ```
   */
  read_scalar: function () {
    if (this.is("T_MAGIC_CONST")) {
      return this.get_magic_constant();
    } else {
      let value, node;
      switch (this.token) {
        // NUMERIC
        case this.tok.T_LNUMBER: // long
        case this.tok.T_DNUMBER: {
          // double
          const result = this.node("number");
          value = this.text();
          this.next();
          return result(value, null);
        }
        case this.tok.T_START_HEREDOC:
          if (this.lexer.curCondition === "ST_NOWDOC") {
            const start = this.lexer.yylloc.first_offset;
            node = this.node("nowdoc");
            value = this.next().text();
            // strip the last line return char
            if (this.lexer.heredoc_label.indentation > 0) {
              value = value.substring(
                0,
                value.length - this.lexer.heredoc_label.indentation
              );
            }
            const lastCh = value[value.length - 1];
            if (lastCh === "\n") {
              if (value[value.length - 2] === "\r") {
                // windows style
                value = value.substring(0, value.length - 2);
              } else {
                // linux style
                value = value.substring(0, value.length - 1);
              }
            } else if (lastCh === "\r") {
              // mac style
              value = value.substring(0, value.length - 1);
            }
            this.expect(this.tok.T_ENCAPSED_AND_WHITESPACE) && this.next();
            this.expect(this.tok.T_END_HEREDOC) && this.next();
            const raw = this.lexer._input.substring(
              start,
              this.lexer.yylloc.first_offset
            );
            node = node(
              this.remove_heredoc_leading_whitespace_chars(
                value,
                this.lexer.heredoc_label.indentation,
                this.lexer.heredoc_label.indentation_uses_spaces,
                this.lexer.heredoc_label.first_encaps_node
              ),
              raw,
              this.lexer.heredoc_label.label
            );
            return node;
          } else {
            return this.read_encapsed_string(this.tok.T_END_HEREDOC);
          }

        case '"':
          return this.read_encapsed_string('"');

        case 'b"':
        case 'B"': {
          return this.read_encapsed_string('"', true);
        }

        // TEXTS
        case this.tok.T_CONSTANT_ENCAPSED_STRING:
        case this.tok.T_ARRAY: // array parser
        case "[": // short array format
          return this.read_dereferencable_scalar();
        default: {
          const err = this.error("SCALAR");
          // graceful mode : ignore token & return error node
          this.next();
          return err;
        }
      }
    }
  },
  /**
   * Handles the dereferencing
   */
  read_dereferencable: function (expr) {
    let result, offset;
    const node = this.node("offsetlookup");
    if (this.token === "[") {
      offset = this.next().read_expr();
      if (this.expect("]")) this.next();
      result = node(expr, offset);
    } else if (this.token === this.tok.T_DOLLAR_OPEN_CURLY_BRACES) {
      offset = this.read_encapsed_string_item(false);
      result = node(expr, offset);
    }
    return result;
  },
  /**
   * Reads and extracts an encapsed item
   * ```ebnf
   * encapsed_string_item ::= T_ENCAPSED_AND_WHITESPACE
   *  | T_DOLLAR_OPEN_CURLY_BRACES expr '}'
   *  | T_DOLLAR_OPEN_CURLY_BRACES T_STRING_VARNAME '}'
   *  | T_DOLLAR_OPEN_CURLY_BRACES T_STRING_VARNAME '[' expr ']' '}'
   *  | T_CURLY_OPEN variable '}'
   *  | variable
   *  | variable '[' expr ']'
   *  | variable T_OBJECT_OPERATOR T_STRING
   * ```
   * @return {String|Variable|Expr|Lookup}
   * @see https://github.com/php/php-src/blob/master/Zend/zend_language_parser.y#L1219
   */
  read_encapsed_string_item: function (isDoubleQuote) {
    const encapsedPart = this.node("encapsedpart");
    let syntax = null;
    let curly = false;
    let result = this.node(),
      offset,
      node,
      name;

    // plain text
    // https://github.com/php/php-src/blob/master/Zend/zend_language_parser.y#L1222
    if (this.token === this.tok.T_ENCAPSED_AND_WHITESPACE) {
      const text = this.text();
      this.next();

      // if this.lexer.heredoc_label.first_encaps_node -> remove first indents
      result = result(
        "string",
        false,
        this.version >= 703 && !this.lexer.heredoc_label.finished
          ? this.remove_heredoc_leading_whitespace_chars(
              this.resolve_special_chars(text, isDoubleQuote),
              this.lexer.heredoc_label.indentation,
              this.lexer.heredoc_label.indentation_uses_spaces,
              this.lexer.heredoc_label.first_encaps_node
            )
          : text,
        false,
        text
      );
    } else if (this.token === this.tok.T_DOLLAR_OPEN_CURLY_BRACES) {
      syntax = "simple";
      curly = true;
      // dynamic variable name
      // https://github.com/php/php-src/blob/master/Zend/zend_language_parser.y#L1239
      name = null;
      if (this.next().token === this.tok.T_STRING_VARNAME) {
        name = this.node("variable");
        const varName = this.text();
        this.next();
        // check if lookup an offset
        // https://github.com/php/php-src/blob/master/Zend/zend_language_parser.y#L1243
        if (this.token === "[") {
          name = name(varName, false);
          node = this.node("offsetlookup");
          offset = this.next().read_expr();
          this.expect("]") && this.next();
          result = node(name, offset);
        } else {
          result = name(varName, false);
        }
      } else {
        result = result("variable", this.read_expr(), false);
      }
      this.expect("}") && this.next();
    } else if (this.token === this.tok.T_CURLY_OPEN) {
      // expression
      // https://github.com/php/php-src/blob/master/Zend/zend_language_parser.y#L1246
      syntax = "complex";
      result.destroy();
      result = this.next().read_variable(false, false);
      this.expect("}") && this.next();
    } else if (this.token === this.tok.T_VARIABLE) {
      syntax = "simple";
      // plain variable
      // https://github.com/php/php-src/blob/master/Zend/zend_language_parser.y#L1231
      result.destroy();
      result = this.read_simple_variable();

      // https://github.com/php/php-src/blob/master/Zend/zend_language_parser.y#L1233
      if (this.token === "[") {
        node = this.node("offsetlookup");
        offset = this.next().read_encaps_var_offset();
        this.expect("]") && this.next();
        result = node(result, offset);
      }

      // https://github.com/php/php-src/blob/master/Zend/zend_language_parser.y#L1236
      if (this.token === this.tok.T_OBJECT_OPERATOR) {
        node = this.node("propertylookup");
        this.next().expect(this.tok.T_STRING);
        const what = this.node("identifier");
        name = this.text();
        this.next();
        result = node(result, what(name));
      }

      // error / fallback
    } else {
      this.expect(this.tok.T_ENCAPSED_AND_WHITESPACE);
      const value = this.text();
      this.next();
      // consider it as string
      result.destroy();
      result = result("string", false, value, false, value);
    }

    // reset first_encaps_node to false after access any node
    this.lexer.heredoc_label.first_encaps_node = false;
    return encapsedPart(result, syntax, curly);
  },
  /**
   * Reads an encapsed string
   */
  read_encapsed_string: function (expect, isBinary = false) {
    const labelStart = this.lexer.yylloc.first_offset;
    let node = this.node("encapsed");
    this.next();
    const start = this.lexer.yylloc.prev_offset - (isBinary ? 1 : 0);
    const value = [];
    let type = null;

    if (expect === "`") {
      type = this.ast.encapsed.TYPE_SHELL;
    } else if (expect === '"') {
      type = this.ast.encapsed.TYPE_STRING;
    } else {
      type = this.ast.encapsed.TYPE_HEREDOC;
    }

    // reading encapsed parts
    while (this.token !== expect && this.token !== this.EOF) {
      value.push(this.read_encapsed_string_item(true));
    }
    if (
      value.length > 0 &&
      value[value.length - 1].kind === "encapsedpart" &&
      value[value.length - 1].expression.kind === "string"
    ) {
      const node = value[value.length - 1].expression;
      const lastCh = node.value[node.value.length - 1];
      if (lastCh === "\n") {
        if (node.value[node.value.length - 2] === "\r") {
          // windows style
          node.value = node.value.substring(0, node.value.length - 2);
        } else {
          // linux style
          node.value = node.value.substring(0, node.value.length - 1);
        }
      } else if (lastCh === "\r") {
        // mac style
        node.value = node.value.substring(0, node.value.length - 1);
      }
    }
    this.expect(expect) && this.next();
    const raw = this.lexer._input.substring(
      type === "heredoc" ? labelStart : start - 1,
      this.lexer.yylloc.first_offset
    );
    node = node(value, raw, type);

    if (expect === this.tok.T_END_HEREDOC) {
      node.label = this.lexer.heredoc_label.label;
      this.lexer.heredoc_label.finished = true;
    }
    return node;
  },
  /**
   * Constant token
   */
  get_magic_constant: function () {
    const result = this.node("magic");
    const name = this.text();
    this.next();
    return result(name.toUpperCase(), name);
  },
};


/***/ }),

/***/ 8011:
/***/ ((module) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


module.exports = {
  /**
   * reading a list of top statements (helper for top_statement*)
   * ```ebnf
   *  top_statements ::= top_statement*
   * ```
   */
  read_top_statements: function () {
    let result = [];
    while (this.token !== this.EOF && this.token !== "}") {
      const statement = this.read_top_statement();
      if (statement) {
        if (Array.isArray(statement)) {
          result = result.concat(statement);
        } else {
          result.push(statement);
        }
      }
    }
    return result;
  },
  /**
   * reading a top statement
   * ```ebnf
   *  top_statement ::=
   *       namespace | function | class
   *       | interface | trait
   *       | use_statements | const_list
   *       | statement
   * ```
   */
  read_top_statement: function () {
    switch (this.token) {
      case this.tok.T_FUNCTION:
        return this.read_function(false, false);
      // optional flags
      case this.tok.T_ABSTRACT:
      case this.tok.T_FINAL:
      case this.tok.T_CLASS:
        return this.read_class_declaration_statement();
      case this.tok.T_INTERFACE:
        return this.read_interface_declaration_statement();
      case this.tok.T_TRAIT:
        return this.read_trait_declaration_statement();
      case this.tok.T_USE:
        return this.read_use_statement();
      case this.tok.T_CONST: {
        const result = this.node("constantstatement");
        const items = this.next().read_const_list();
        this.expectEndOfStatement();
        return result(null, items);
      }
      case this.tok.T_NAMESPACE:
        return this.read_namespace();
      case this.tok.T_HALT_COMPILER: {
        const result = this.node("halt");
        if (this.next().expect("(")) this.next();
        if (this.expect(")")) this.next();
        this.expect(";");
        this.lexer.done = true;
        return result(this.lexer._input.substring(this.lexer.offset));
      }
      default:
        return this.read_statement();
    }
  },
  /**
   * reads a list of simple inner statements (helper for inner_statement*)
   * ```ebnf
   *  inner_statements ::= inner_statement*
   * ```
   */
  read_inner_statements: function () {
    let result = [];
    while (this.token != this.EOF && this.token !== "}") {
      const statement = this.read_inner_statement();
      if (statement) {
        if (Array.isArray(statement)) {
          result = result.concat(statement);
        } else {
          result.push(statement);
        }
      }
    }
    return result;
  },
  /**
   * Reads a list of constants declaration
   * ```ebnf
   *   const_list ::= T_CONST T_STRING '=' expr (',' T_STRING '=' expr)* ';'
   * ```
   */
  read_const_list: function () {
    return this.read_list(
      function () {
        this.expect(this.tok.T_STRING);
        const result = this.node("constant");
        let constName = this.node("identifier");
        const name = this.text();
        this.next();
        constName = constName(name);
        if (this.expect("=")) {
          return result(constName, this.next().read_expr());
        } else {
          // fallback
          return result(constName, null);
        }
      },
      ",",
      false
    );
  },
  /**
   * Reads a list of constants declaration
   * ```ebnf
   *   declare_list ::= IDENTIFIER '=' expr (',' IDENTIFIER '=' expr)*
   * ```
   * @retrurn {Array}
   */
  read_declare_list: function () {
    const result = [];
    while (this.token != this.EOF && this.token !== ")") {
      this.expect(this.tok.T_STRING);
      const directive = this.node("declaredirective");
      let key = this.node("identifier");
      const name = this.text();
      this.next();
      key = key(name);
      let value = null;
      if (this.expect("=")) {
        value = this.next().read_expr();
      }
      result.push(directive(key, value));
      if (this.token !== ",") break;
      this.next();
    }
    return result;
  },
  /**
   * reads a simple inner statement
   * ```ebnf
   *  inner_statement ::= '{' inner_statements '}' | token
   * ```
   */
  read_inner_statement: function () {
    switch (this.token) {
      case this.tok.T_FUNCTION:
        return this.read_function(false, false);
      // optional flags
      case this.tok.T_ABSTRACT:
      case this.tok.T_FINAL:
      case this.tok.T_CLASS:
        return this.read_class_declaration_statement();
      case this.tok.T_INTERFACE:
        return this.read_interface_declaration_statement();
      case this.tok.T_TRAIT:
        return this.read_trait_declaration_statement();
      case this.tok.T_HALT_COMPILER: {
        this.raiseError(
          "__HALT_COMPILER() can only be used from the outermost scope"
        );
        // fallback : returns a node but does not stop the parsing
        let node = this.node("halt");
        this.next().expect("(") && this.next();
        this.expect(")") && this.next();
        node = node(this.lexer._input.substring(this.lexer.offset));
        this.expect(";") && this.next();
        return node;
      }
      default:
        return this.read_statement();
    }
  },
  /**
   * Reads statements
   */
  read_statement: function () {
    switch (this.token) {
      case "{":
        return this.read_code_block(false);

      case this.tok.T_IF:
        return this.read_if();

      case this.tok.T_SWITCH:
        return this.read_switch();

      case this.tok.T_FOR:
        return this.read_for();

      case this.tok.T_FOREACH:
        return this.read_foreach();

      case this.tok.T_WHILE:
        return this.read_while();

      case this.tok.T_DO:
        return this.read_do();

      case this.tok.T_COMMENT:
        return this.read_comment();

      case this.tok.T_DOC_COMMENT:
        return this.read_doc_comment();

      case this.tok.T_RETURN: {
        const result = this.node("return");
        this.next();
        const expr = this.read_optional_expr(";");
        this.expectEndOfStatement();
        return result(expr);
      }

      // https://github.com/php/php-src/blob/master/Zend/zend_language_parser.y#L429
      case this.tok.T_BREAK:
      case this.tok.T_CONTINUE: {
        const result = this.node(
          this.token === this.tok.T_CONTINUE ? "continue" : "break"
        );
        this.next();
        const level = this.read_optional_expr(";");
        this.expectEndOfStatement();
        return result(level);
      }

      case this.tok.T_GLOBAL: {
        const result = this.node("global");
        const items = this.next().read_list(this.read_simple_variable, ",");
        this.expectEndOfStatement();
        return result(items);
      }

      case this.tok.T_STATIC: {
        const current = [this.token, this.lexer.getState()];
        const result = this.node();
        if (this.next().token === this.tok.T_DOUBLE_COLON) {
          // static keyword for a class
          this.lexer.tokens.push(current);
          const expr = this.next().read_expr();
          this.expectEndOfStatement(expr);
          return result("expressionstatement", expr);
        }
        if (this.token === this.tok.T_FUNCTION) {
          return this.read_function(true, [0, 1, 0]);
        }
        const items = this.read_variable_declarations();
        this.expectEndOfStatement();
        return result("static", items);
      }

      case this.tok.T_ECHO: {
        const result = this.node("echo");
        const text = this.text();
        const shortForm = text === "<?=" || text === "<%=";
        const expressions = this.next().read_function_list(this.read_expr, ",");
        this.expectEndOfStatement();
        return result(expressions, shortForm);
      }

      case this.tok.T_INLINE_HTML: {
        const value = this.text();
        let prevChar =
          this.lexer.yylloc.first_offset > 0
            ? this.lexer._input[this.lexer.yylloc.first_offset - 1]
            : null;
        const fixFirstLine = prevChar === "\r" || prevChar === "\n";
        // revert back the first stripped line
        if (fixFirstLine) {
          if (
            prevChar === "\n" &&
            this.lexer.yylloc.first_offset > 1 &&
            this.lexer._input[this.lexer.yylloc.first_offset - 2] === "\r"
          ) {
            prevChar = "\r\n";
          }
        }
        const result = this.node("inline");
        this.next();
        return result(value, fixFirstLine ? prevChar + value : value);
      }

      case this.tok.T_UNSET: {
        const result = this.node("unset");
        this.next().expect("(") && this.next();
        const variables = this.read_function_list(this.read_variable, ",");
        this.expect(")") && this.next();
        this.expect(";") && this.next();
        return result(variables);
      }

      case this.tok.T_DECLARE: {
        const result = this.node("declare");
        const body = [];
        let mode;
        this.next().expect("(") && this.next();
        const directives = this.read_declare_list();
        this.expect(")") && this.next();
        if (this.token === ":") {
          this.next();
          while (
            this.token != this.EOF &&
            this.token !== this.tok.T_ENDDECLARE
          ) {
            // @todo : check declare_statement from php / not valid
            body.push(this.read_top_statement());
          }
          if (
            body.length === 0 &&
            this.extractDoc &&
            this._docs.length > this._docIndex
          ) {
            body.push(this.node("noop")());
          }
          this.expect(this.tok.T_ENDDECLARE) && this.next();
          this.expectEndOfStatement();
          mode = this.ast.declare.MODE_SHORT;
        } else if (this.token === "{") {
          this.next();
          while (this.token != this.EOF && this.token !== "}") {
            // @todo : check declare_statement from php / not valid
            body.push(this.read_top_statement());
          }
          if (
            body.length === 0 &&
            this.extractDoc &&
            this._docs.length > this._docIndex
          ) {
            body.push(this.node("noop")());
          }
          this.expect("}") && this.next();
          mode = this.ast.declare.MODE_BLOCK;
        } else {
          this.expect(";") && this.next();
          mode = this.ast.declare.MODE_NONE;
        }
        return result(directives, body, mode);
      }

      case this.tok.T_TRY:
        return this.read_try();

      case this.tok.T_THROW: {
        const result = this.node("throw");
        const expr = this.next().read_expr();
        this.expectEndOfStatement();
        return result(expr);
      }

      // ignore this (extra ponctuation)
      case ";": {
        this.next();
        return null;
      }

      case this.tok.T_STRING: {
        const result = this.node();
        const current = [this.token, this.lexer.getState()];
        const labelNameText = this.text();
        let labelName = this.node("identifier");
        // AST : https://github.com/php/php-src/blob/master/Zend/zend_language_parser.y#L457
        if (this.next().token === ":") {
          labelName = labelName(labelNameText);
          this.next();
          return result("label", labelName);
        } else {
          labelName.destroy();
        }

        // default fallback expr / T_STRING '::' (etc...)
        result.destroy();
        this.lexer.tokens.push(current);
        const statement = this.node("expressionstatement");
        const expr = this.next().read_expr();
        this.expectEndOfStatement(expr);
        return statement(expr);
      }

      case this.tok.T_GOTO: {
        const result = this.node("goto");
        let labelName = null;
        if (this.next().expect(this.tok.T_STRING)) {
          labelName = this.node("identifier");
          const name = this.text();
          this.next();
          labelName = labelName(name);
          this.expectEndOfStatement();
        }
        return result(labelName);
      }

      default: {
        // default fallback expr
        const statement = this.node("expressionstatement");
        const expr = this.read_expr();
        this.expectEndOfStatement(expr);
        return statement(expr);
      }
    }
  },
  /**
   * ```ebnf
   *  code_block ::= '{' (inner_statements | top_statements) '}'
   * ```
   */
  read_code_block: function (top) {
    const result = this.node("block");
    this.expect("{") && this.next();
    const body = top
      ? this.read_top_statements()
      : this.read_inner_statements();
    if (
      body.length === 0 &&
      this.extractDoc &&
      this._docs.length > this._docIndex
    ) {
      body.push(this.node("noop")());
    }
    this.expect("}") && this.next();
    return result(null, body);
  },
};


/***/ }),

/***/ 8255:
/***/ ((module) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


module.exports = {
  /**
   * Reads a switch statement
   * ```ebnf
   *  switch ::= T_SWITCH '(' expr ')' switch_case_list
   * ```
   * @return {Switch}
   * @see http://php.net/manual/en/control-structures.switch.php
   */
  read_switch: function () {
    const result = this.node("switch");
    this.expect(this.tok.T_SWITCH) && this.next();
    this.expect("(") && this.next();
    const test = this.read_expr();
    this.expect(")") && this.next();
    const shortForm = this.token === ":";
    const body = this.read_switch_case_list();
    return result(test, body, shortForm);
  },
  /**
   * ```ebnf
   *  switch_case_list ::= '{' ';'? case_list* '}' | ':' ';'? case_list* T_ENDSWITCH ';'
   * ```
   * @see https://github.com/php/php-src/blob/master/Zend/zend_language_parser.y#L566
   */
  read_switch_case_list: function () {
    // DETECT SWITCH MODE
    let expect = null;
    const result = this.node("block");
    const items = [];
    if (this.token === "{") {
      expect = "}";
    } else if (this.token === ":") {
      expect = this.tok.T_ENDSWITCH;
    } else {
      this.expect(["{", ":"]);
    }
    this.next();
    // OPTIONNAL ';'
    // https://github.com/php/php-src/blob/master/Zend/zend_language_parser.y#L570
    if (this.token === ";") {
      this.next();
    }
    // EXTRACTING CASES
    while (this.token !== this.EOF && this.token !== expect) {
      items.push(this.read_case_list(expect));
    }
    if (
      items.length === 0 &&
      this.extractDoc &&
      this._docs.length > this._docIndex
    ) {
      items.push(this.node("noop")());
    }
    // CHECK END TOKEN
    this.expect(expect) && this.next();
    if (expect === this.tok.T_ENDSWITCH) {
      this.expectEndOfStatement();
    }
    return result(null, items);
  },
  /**
   * ```ebnf
   *   case_list ::= ((T_CASE expr) | T_DEFAULT) (':' | ';') inner_statement*
   * ```
   */
  read_case_list: function (stopToken) {
    const result = this.node("case");
    let test = null;
    if (this.token === this.tok.T_CASE) {
      test = this.next().read_expr();
    } else if (this.token === this.tok.T_DEFAULT) {
      // the default entry - no condition
      this.next();
    } else {
      this.expect([this.tok.T_CASE, this.tok.T_DEFAULT]);
    }
    // case_separator
    this.expect([":", ";"]) && this.next();
    const body = this.node("block");
    const items = [];
    while (
      this.token !== this.EOF &&
      this.token !== stopToken &&
      this.token !== this.tok.T_CASE &&
      this.token !== this.tok.T_DEFAULT
    ) {
      items.push(this.read_inner_statement());
    }
    return result(test, body(null, items));
  },
};


/***/ }),

/***/ 5250:
/***/ ((module) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


module.exports = {
  /**
   * ```ebnf
   *  try ::= T_TRY '{' inner_statement* '}'
   *          (
   *              T_CATCH '(' namespace_name variable ')' '{'  inner_statement* '}'
   *          )*
   *          (T_FINALLY '{' inner_statement* '}')?
   * ```
   * @see https://github.com/php/php-src/blob/master/Zend/zend_language_parser.y#L448
   * @return {Try}
   */
  read_try: function () {
    this.expect(this.tok.T_TRY);
    const result = this.node("try");
    let always = null;
    const catches = [];
    const body = this.next().read_statement();
    // https://github.com/php/php-src/blob/master/Zend/zend_language_parser.y#L455
    while (this.token === this.tok.T_CATCH) {
      const item = this.node("catch");
      this.next().expect("(") && this.next();
      const what = this.read_list(this.read_namespace_name, "|", false);
      const variable = this.read_variable(true, false);
      this.expect(")");
      catches.push(item(this.next().read_statement(), what, variable));
    }
    if (this.token === this.tok.T_FINALLY) {
      always = this.next().read_statement();
    }
    return result(body, catches, always);
  },
};


/***/ }),

/***/ 814:
/***/ ((module) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


module.exports = {
  /**
   * Reads a short form of tokens
   * @param {Number} token - The ending token
   * @return {Block}
   */
  read_short_form: function (token) {
    const body = this.node("block");
    const items = [];
    if (this.expect(":")) this.next();
    while (this.token != this.EOF && this.token !== token) {
      items.push(this.read_inner_statement());
    }
    if (
      items.length === 0 &&
      this.extractDoc &&
      this._docs.length > this._docIndex
    ) {
      items.push(this.node("noop")());
    }
    if (this.expect(token)) this.next();
    this.expectEndOfStatement();
    return body(null, items);
  },

  /**
   * https://wiki.php.net/rfc/trailing-comma-function-calls
   * @param {*} item
   * @param {*} separator
   */
  read_function_list: function (item, separator) {
    const result = [];
    do {
      if (this.token == separator && this.version >= 703 && result.length > 0) {
        result.push(this.node("noop")());
        break;
      }
      result.push(item.apply(this, []));
      if (this.token != separator) {
        break;
      }
      if (this.next().token == ")" && this.version >= 703) {
        break;
      }
    } while (this.token != this.EOF);
    return result;
  },

  /**
   * Helper : reads a list of tokens / sample : T_STRING ',' T_STRING ...
   * ```ebnf
   * list ::= separator? ( item separator )* item
   * ```
   */
  read_list: function (item, separator, preserveFirstSeparator) {
    const result = [];

    if (this.token == separator) {
      if (preserveFirstSeparator) {
        result.push(typeof item === "function" ? this.node("noop")() : null);
      }
      this.next();
    }

    if (typeof item === "function") {
      do {
        const itemResult = item.apply(this, []);
        if (itemResult) {
          result.push(itemResult);
        }
        if (this.token != separator) {
          break;
        }
      } while (this.next().token != this.EOF);
    } else {
      if (this.expect(item)) {
        result.push(this.text());
      } else {
        return [];
      }
      while (this.next().token != this.EOF) {
        if (this.token != separator) break;
        // trim current separator & check item
        if (this.next().token != item) break;
        result.push(this.text());
      }
    }
    return result;
  },

  /**
   * Reads a list of names separated by a comma
   *
   * ```ebnf
   * name_list ::= namespace (',' namespace)*
   * ```
   *
   * Sample code :
   * ```php
   * <?php class foo extends bar, baz { }
   * ```
   *
   * @see https://github.com/php/php-src/blob/master/Zend/zend_language_parser.y#L726
   * @return {Reference[]}
   */
  read_name_list: function () {
    return this.read_list(this.read_namespace_name, ",", false);
  },

  /**
   * Reads the byref token and assign it to the specified node
   * @param {*} cb
   */
  read_byref: function (cb) {
    let byref = this.node("byref");
    this.next();
    byref = byref(null);
    const result = cb();
    if (result) {
      this.ast.swapLocations(result, byref, result, this);
      result.byref = true;
    }
    return result;
  },

  /**
   * Reads a list of variables declarations
   *
   * ```ebnf
   * variable_declaration ::= T_VARIABLE ('=' expr)?*
   * variable_declarations ::= variable_declaration (',' variable_declaration)*
   * ```
   *
   * Sample code :
   * ```php
   * <?php static $a = 'hello', $b = 'world';
   * ```
   * @return {StaticVariable[]} Returns an array composed by a list of variables, or
   * assign values
   */
  read_variable_declarations: function () {
    return this.read_list(function () {
      const node = this.node("staticvariable");
      let variable = this.node("variable");
      // plain variable name
      if (this.expect(this.tok.T_VARIABLE)) {
        const name = this.text().substring(1);
        this.next();
        variable = variable(name, false);
      } else {
        variable = variable("#ERR", false);
      }
      if (this.token === "=") {
        return node(variable, this.next().read_expr());
      } else {
        return variable;
      }
    }, ",");
  },

  /*
   * Reads class extends
   */
  read_extends_from: function () {
    if (this.token === this.tok.T_EXTENDS) {
      return this.next().read_namespace_name();
    }

    return null;
  },

  /*
   * Reads interface extends list
   */
  read_interface_extends_list: function () {
    if (this.token === this.tok.T_EXTENDS) {
      return this.next().read_name_list();
    }

    return null;
  },

  /*
   * Reads implements list
   */
  read_implements_list: function () {
    if (this.token === this.tok.T_IMPLEMENTS) {
      return this.next().read_name_list();
    }

    return null;
  },
};


/***/ }),

/***/ 3406:
/***/ ((module) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


module.exports = {
  /**
   * Reads a variable
   *
   * ```ebnf
   *   variable ::= &? ...complex @todo
   * ```
   *
   * Some samples of parsed code :
   * ```php
   *  &$var                      // simple var
   *  $var                      // simple var
   *  classname::CONST_NAME     // dynamic class name with const retrieval
   *  foo()                     // function call
   *  $var->func()->property    // chained calls
   * ```
   */
  read_variable: function (read_only, encapsed) {
    let result;

    // check the byref flag
    if (this.token === "&") {
      return this.read_byref(
        this.read_variable.bind(this, read_only, encapsed)
      );
    }

    // reads the entry point
    if (this.is([this.tok.T_VARIABLE, "$"])) {
      result = this.read_reference_variable(encapsed);
    } else if (
      this.is([
        this.tok.T_NS_SEPARATOR,
        this.tok.T_STRING,
        this.tok.T_NAMESPACE,
      ])
    ) {
      result = this.node();
      const name = this.read_namespace_name();
      if (
        this.token != this.tok.T_DOUBLE_COLON &&
        this.token != "(" &&
        ["parentreference", "selfreference"].indexOf(name.kind) === -1
      ) {
        // @see parser.js line 130 : resolves a conflict with scalar
        const literal = name.name.toLowerCase();
        if (literal === "true") {
          result = name.destroy(result("boolean", true, name.name));
        } else if (literal === "false") {
          result = name.destroy(result("boolean", false, name.name));
        } else if (literal === "null") {
          result = name.destroy(result("nullkeyword", name.name));
        } else {
          result.destroy(name);
          result = name;
        }
      } else {
        // @fixme possible #193 bug
        result.destroy(name);
        result = name;
      }
    } else if (this.token === this.tok.T_STATIC) {
      result = this.node("staticreference");
      const raw = this.text();
      this.next();
      result = result(raw);
    } else {
      this.expect("VARIABLE");
    }

    // static mode
    if (this.token === this.tok.T_DOUBLE_COLON) {
      result = this.read_static_getter(result, encapsed);
    }

    return this.recursive_variable_chain_scan(result, read_only, encapsed);
  },

  // resolves a static call
  read_static_getter: function (what, encapsed) {
    const result = this.node("staticlookup");
    let offset, name;
    if (this.next().is([this.tok.T_VARIABLE, "$"])) {
      offset = this.read_reference_variable(encapsed);
    } else if (
      this.token === this.tok.T_STRING ||
      this.token === this.tok.T_CLASS ||
      (this.version >= 700 && this.is("IDENTIFIER"))
    ) {
      offset = this.node("identifier");
      name = this.text();
      this.next();
      offset = offset(name);
    } else if (this.token === "{") {
      offset = this.node("literal");
      name = this.next().read_expr();
      this.expect("}") && this.next();
      offset = offset("literal", name, null);
      this.expect("(");
    } else {
      this.error([this.tok.T_VARIABLE, this.tok.T_STRING]);
      // graceful mode : set getter as error node and continue
      offset = this.node("identifier");
      name = this.text();
      this.next();
      offset = offset(name);
    }
    return result(what, offset);
  },

  read_what: function (is_static_lookup = false) {
    let what = null;
    let name = null;
    switch (this.next().token) {
      case this.tok.T_STRING:
        what = this.node("identifier");
        name = this.text();
        this.next();
        what = what(name);

        if (is_static_lookup && this.token === this.tok.T_OBJECT_OPERATOR) {
          this.error();
        }
        break;
      case this.tok.T_VARIABLE:
        what = this.node("variable");
        name = this.text().substring(1);
        this.next();
        what = what(name, false);
        break;
      case "$":
        what = this.node();
        this.next().expect(["$", "{", this.tok.T_VARIABLE]);
        if (this.token === "{") {
          // $obj->${$varname}
          name = this.next().read_expr();
          this.expect("}") && this.next();
          what = what("variable", name, true);
        } else {
          // $obj->$$varname
          name = this.read_expr();
          what = what("variable", name, false);
        }
        break;
      case "{":
        what = this.node("encapsedpart");
        name = this.next().read_expr();
        this.expect("}") && this.next();
        what = what(name, "complex", false);
        break;
      default:
        this.error([this.tok.T_STRING, this.tok.T_VARIABLE, "$", "{"]);
        // graceful mode : set what as error mode & continue
        what = this.node("identifier");
        name = this.text();
        this.next();
        what = what(name);
        break;
    }

    return what;
  },

  recursive_variable_chain_scan: function (result, read_only, encapsed) {
    let node, offset;
    recursive_scan_loop: while (this.token != this.EOF) {
      switch (this.token) {
        case "(":
          if (read_only) {
            // @fixme : add more informations & test
            return result;
          } else {
            result = this.node("call")(result, this.read_argument_list());
          }
          break;
        case "[":
        case "{": {
          const backet = this.token;
          const isSquareBracket = backet === "[";
          node = this.node("offsetlookup");
          this.next();
          offset = false;
          if (encapsed) {
            offset = this.read_encaps_var_offset();
            this.expect(isSquareBracket ? "]" : "}") && this.next();
          } else {
            const isCallableVariable = isSquareBracket
              ? this.token !== "]"
              : this.token !== "}";
            // callable_variable : https://github.com/php/php-src/blob/493524454d66adde84e00d249d607ecd540de99f/Zend/zend_language_parser.y#L1122
            if (isCallableVariable) {
              offset = this.read_expr();
              this.expect(isSquareBracket ? "]" : "}") && this.next();
            } else {
              this.next();
            }
          }
          result = node(result, offset);
          break;
        }
        case this.tok.T_DOUBLE_COLON:
          // @see https://github.com/glayzzle/php-parser/issues/107#issuecomment-354104574
          if (
            result.kind === "staticlookup" &&
            result.offset.kind === "identifier"
          ) {
            this.error();
          }

          node = this.node("staticlookup");
          result = node(result, this.read_what(true));

          // fix 185
          // static lookup dereferencables are limited to staticlookup over functions
          /*if (dereferencable && this.token !== "(") {
            this.error("(");
          }*/
          break;
        case this.tok.T_OBJECT_OPERATOR: {
          node = this.node("propertylookup");
          result = node(result, this.read_what());
          break;
        }
        default:
          break recursive_scan_loop;
      }
    }
    return result;
  },
  /**
   * https://github.com/php/php-src/blob/493524454d66adde84e00d249d607ecd540de99f/Zend/zend_language_parser.y#L1231
   */
  read_encaps_var_offset: function () {
    let offset = this.node();
    if (this.token === this.tok.T_STRING) {
      const text = this.text();
      this.next();
      offset = offset("identifier", text);
    } else if (this.token === this.tok.T_NUM_STRING) {
      const num = this.text();
      this.next();
      offset = offset("number", num, null);
    } else if (this.token === "-") {
      this.next();
      const num = -1 * this.text();
      this.expect(this.tok.T_NUM_STRING) && this.next();
      offset = offset("number", num, null);
    } else if (this.token === this.tok.T_VARIABLE) {
      const name = this.text().substring(1);
      this.next();
      offset = offset("variable", name, false);
    } else {
      this.expect([
        this.tok.T_STRING,
        this.tok.T_NUM_STRING,
        "-",
        this.tok.T_VARIABLE,
      ]);
      // fallback : consider as identifier
      const text = this.text();
      this.next();
      offset = offset("identifier", text);
    }
    return offset;
  },
  /**
   * ```ebnf
   *  reference_variable ::=  simple_variable ('[' OFFSET ']')* | '{' EXPR '}'
   * ```
   * <code>
   *  $foo[123];      // foo is an array ==> gets its entry
   *  $foo{1};        // foo is a string ==> get the 2nd char offset
   *  ${'foo'}[123];  // get the dynamic var $foo
   *  $foo[123]{1};   // gets the 2nd char from the 123 array entry
   * </code>
   */
  read_reference_variable: function (encapsed) {
    let result = this.read_simple_variable();
    let offset;
    while (this.token != this.EOF) {
      const node = this.node();
      if (this.token == "{" && !encapsed) {
        // @fixme check coverage, not sure thats working
        offset = this.next().read_expr();
        this.expect("}") && this.next();
        result = node("offsetlookup", result, offset);
      } else {
        node.destroy();
        break;
      }
    }
    return result;
  },
  /**
   * ```ebnf
   *  simple_variable ::= T_VARIABLE | '$' '{' expr '}' | '$' simple_variable
   * ```
   */
  read_simple_variable: function () {
    let result = this.node("variable");
    let name;
    if (
      this.expect([this.tok.T_VARIABLE, "$"]) &&
      this.token === this.tok.T_VARIABLE
    ) {
      // plain variable name
      name = this.text().substring(1);
      this.next();
      result = result(name, false);
    } else {
      if (this.token === "$") this.next();
      // dynamic variable name
      switch (this.token) {
        case "{": {
          const expr = this.next().read_expr();
          this.expect("}") && this.next();
          result = result(expr, true);
          break;
        }
        case "$": // $$$var
          result = result(this.read_simple_variable(), false);
          break;
        case this.tok.T_VARIABLE: {
          // $$var
          name = this.text().substring(1);
          const node = this.node("variable");
          this.next();
          result = result(node(name, false), false);
          break;
        }
        default:
          this.error(["{", "$", this.tok.T_VARIABLE]);
          // graceful mode
          name = this.text();
          this.next();
          result = result(name, false);
      }
    }
    return result;
  },
};


/***/ }),

/***/ 9025:
/***/ ((module) => {

"use strict";
/**
 * Copyright (C) 2018 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */


/**
 * PHP AST Tokens
 * @type {Object}
 */
module.exports = {
  values: {
    101: "T_HALT_COMPILER",
    102: "T_USE",
    103: "T_ENCAPSED_AND_WHITESPACE",
    104: "T_OBJECT_OPERATOR",
    105: "T_STRING",
    106: "T_DOLLAR_OPEN_CURLY_BRACES",
    107: "T_STRING_VARNAME",
    108: "T_CURLY_OPEN",
    109: "T_NUM_STRING",
    110: "T_ISSET",
    111: "T_EMPTY",
    112: "T_INCLUDE",
    113: "T_INCLUDE_ONCE",
    114: "T_EVAL",
    115: "T_REQUIRE",
    116: "T_REQUIRE_ONCE",
    117: "T_NAMESPACE",
    118: "T_NS_SEPARATOR",
    119: "T_AS",
    120: "T_IF",
    121: "T_ENDIF",
    122: "T_WHILE",
    123: "T_DO",
    124: "T_FOR",
    125: "T_SWITCH",
    126: "T_BREAK",
    127: "T_CONTINUE",
    128: "T_RETURN",
    129: "T_GLOBAL",
    130: "T_STATIC",
    131: "T_ECHO",
    132: "T_INLINE_HTML",
    133: "T_UNSET",
    134: "T_FOREACH",
    135: "T_DECLARE",
    136: "T_TRY",
    137: "T_THROW",
    138: "T_GOTO",
    139: "T_FINALLY",
    140: "T_CATCH",
    141: "T_ENDDECLARE",
    142: "T_LIST",
    143: "T_CLONE",
    144: "T_PLUS_EQUAL",
    145: "T_MINUS_EQUAL",
    146: "T_MUL_EQUAL",
    147: "T_DIV_EQUAL",
    148: "T_CONCAT_EQUAL",
    149: "T_MOD_EQUAL",
    150: "T_AND_EQUAL",
    151: "T_OR_EQUAL",
    152: "T_XOR_EQUAL",
    153: "T_SL_EQUAL",
    154: "T_SR_EQUAL",
    155: "T_INC",
    156: "T_DEC",
    157: "T_BOOLEAN_OR",
    158: "T_BOOLEAN_AND",
    159: "T_LOGICAL_OR",
    160: "T_LOGICAL_AND",
    161: "T_LOGICAL_XOR",
    162: "T_SL",
    163: "T_SR",
    164: "T_IS_IDENTICAL",
    165: "T_IS_NOT_IDENTICAL",
    166: "T_IS_EQUAL",
    167: "T_IS_NOT_EQUAL",
    168: "T_IS_SMALLER_OR_EQUAL",
    169: "T_IS_GREATER_OR_EQUAL",
    170: "T_INSTANCEOF",
    171: "T_INT_CAST",
    172: "T_DOUBLE_CAST",
    173: "T_STRING_CAST",
    174: "T_ARRAY_CAST",
    175: "T_OBJECT_CAST",
    176: "T_BOOL_CAST",
    177: "T_UNSET_CAST",
    178: "T_EXIT",
    179: "T_PRINT",
    180: "T_YIELD",
    181: "T_YIELD_FROM",
    182: "T_FUNCTION",
    183: "T_DOUBLE_ARROW",
    184: "T_DOUBLE_COLON",
    185: "T_ARRAY",
    186: "T_CALLABLE",
    187: "T_CLASS",
    188: "T_ABSTRACT",
    189: "T_TRAIT",
    190: "T_FINAL",
    191: "T_EXTENDS",
    192: "T_INTERFACE",
    193: "T_IMPLEMENTS",
    194: "T_VAR",
    195: "T_PUBLIC",
    196: "T_PROTECTED",
    197: "T_PRIVATE",
    198: "T_CONST",
    199: "T_NEW",
    200: "T_INSTEADOF",
    201: "T_ELSEIF",
    202: "T_ELSE",
    203: "T_ENDSWITCH",
    204: "T_CASE",
    205: "T_DEFAULT",
    206: "T_ENDFOR",
    207: "T_ENDFOREACH",
    208: "T_ENDWHILE",
    209: "T_CONSTANT_ENCAPSED_STRING",
    210: "T_LNUMBER",
    211: "T_DNUMBER",
    212: "T_LINE",
    213: "T_FILE",
    214: "T_DIR",
    215: "T_TRAIT_C",
    216: "T_METHOD_C",
    217: "T_FUNC_C",
    218: "T_NS_C",
    219: "T_START_HEREDOC",
    220: "T_END_HEREDOC",
    221: "T_CLASS_C",
    222: "T_VARIABLE",
    223: "T_OPEN_TAG",
    224: "T_OPEN_TAG_WITH_ECHO",
    225: "T_CLOSE_TAG",
    226: "T_WHITESPACE",
    227: "T_COMMENT",
    228: "T_DOC_COMMENT",
    229: "T_ELLIPSIS",
    230: "T_COALESCE",
    231: "T_POW",
    232: "T_POW_EQUAL",
    233: "T_SPACESHIP",
    234: "T_COALESCE_EQUAL",
    235: "T_FN",
  },
  names: {
    T_HALT_COMPILER: 101,
    T_USE: 102,
    T_ENCAPSED_AND_WHITESPACE: 103,
    T_OBJECT_OPERATOR: 104,
    T_STRING: 105,
    T_DOLLAR_OPEN_CURLY_BRACES: 106,
    T_STRING_VARNAME: 107,
    T_CURLY_OPEN: 108,
    T_NUM_STRING: 109,
    T_ISSET: 110,
    T_EMPTY: 111,
    T_INCLUDE: 112,
    T_INCLUDE_ONCE: 113,
    T_EVAL: 114,
    T_REQUIRE: 115,
    T_REQUIRE_ONCE: 116,
    T_NAMESPACE: 117,
    T_NS_SEPARATOR: 118,
    T_AS: 119,
    T_IF: 120,
    T_ENDIF: 121,
    T_WHILE: 122,
    T_DO: 123,
    T_FOR: 124,
    T_SWITCH: 125,
    T_BREAK: 126,
    T_CONTINUE: 127,
    T_RETURN: 128,
    T_GLOBAL: 129,
    T_STATIC: 130,
    T_ECHO: 131,
    T_INLINE_HTML: 132,
    T_UNSET: 133,
    T_FOREACH: 134,
    T_DECLARE: 135,
    T_TRY: 136,
    T_THROW: 137,
    T_GOTO: 138,
    T_FINALLY: 139,
    T_CATCH: 140,
    T_ENDDECLARE: 141,
    T_LIST: 142,
    T_CLONE: 143,
    T_PLUS_EQUAL: 144,
    T_MINUS_EQUAL: 145,
    T_MUL_EQUAL: 146,
    T_DIV_EQUAL: 147,
    T_CONCAT_EQUAL: 148,
    T_MOD_EQUAL: 149,
    T_AND_EQUAL: 150,
    T_OR_EQUAL: 151,
    T_XOR_EQUAL: 152,
    T_SL_EQUAL: 153,
    T_SR_EQUAL: 154,
    T_INC: 155,
    T_DEC: 156,
    T_BOOLEAN_OR: 157,
    T_BOOLEAN_AND: 158,
    T_LOGICAL_OR: 159,
    T_LOGICAL_AND: 160,
    T_LOGICAL_XOR: 161,
    T_SL: 162,
    T_SR: 163,
    T_IS_IDENTICAL: 164,
    T_IS_NOT_IDENTICAL: 165,
    T_IS_EQUAL: 166,
    T_IS_NOT_EQUAL: 167,
    T_IS_SMALLER_OR_EQUAL: 168,
    T_IS_GREATER_OR_EQUAL: 169,
    T_INSTANCEOF: 170,
    T_INT_CAST: 171,
    T_DOUBLE_CAST: 172,
    T_STRING_CAST: 173,
    T_ARRAY_CAST: 174,
    T_OBJECT_CAST: 175,
    T_BOOL_CAST: 176,
    T_UNSET_CAST: 177,
    T_EXIT: 178,
    T_PRINT: 179,
    T_YIELD: 180,
    T_YIELD_FROM: 181,
    T_FUNCTION: 182,
    T_DOUBLE_ARROW: 183,
    T_DOUBLE_COLON: 184,
    T_ARRAY: 185,
    T_CALLABLE: 186,
    T_CLASS: 187,
    T_ABSTRACT: 188,
    T_TRAIT: 189,
    T_FINAL: 190,
    T_EXTENDS: 191,
    T_INTERFACE: 192,
    T_IMPLEMENTS: 193,
    T_VAR: 194,
    T_PUBLIC: 195,
    T_PROTECTED: 196,
    T_PRIVATE: 197,
    T_CONST: 198,
    T_NEW: 199,
    T_INSTEADOF: 200,
    T_ELSEIF: 201,
    T_ELSE: 202,
    T_ENDSWITCH: 203,
    T_CASE: 204,
    T_DEFAULT: 205,
    T_ENDFOR: 206,
    T_ENDFOREACH: 207,
    T_ENDWHILE: 208,
    T_CONSTANT_ENCAPSED_STRING: 209,
    T_LNUMBER: 210,
    T_DNUMBER: 211,
    T_LINE: 212,
    T_FILE: 213,
    T_DIR: 214,
    T_TRAIT_C: 215,
    T_METHOD_C: 216,
    T_FUNC_C: 217,
    T_NS_C: 218,
    T_START_HEREDOC: 219,
    T_END_HEREDOC: 220,
    T_CLASS_C: 221,
    T_VARIABLE: 222,
    T_OPEN_TAG: 223,
    T_OPEN_TAG_WITH_ECHO: 224,
    T_CLOSE_TAG: 225,
    T_WHITESPACE: 226,
    T_COMMENT: 227,
    T_DOC_COMMENT: 228,
    T_ELLIPSIS: 229,
    T_COALESCE: 230,
    T_POW: 231,
    T_POW_EQUAL: 232,
    T_SPACESHIP: 233,
    T_COALESCE_EQUAL: 234,
    T_FN: 235,
  },
};


/***/ }),

/***/ 8569:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


module.exports = __webpack_require__(3322);


/***/ }),

/***/ 6099:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


const path = __webpack_require__(5622);
const WIN_SLASH = '\\\\/';
const WIN_NO_SLASH = `[^${WIN_SLASH}]`;

/**
 * Posix glob regex
 */

const DOT_LITERAL = '\\.';
const PLUS_LITERAL = '\\+';
const QMARK_LITERAL = '\\?';
const SLASH_LITERAL = '\\/';
const ONE_CHAR = '(?=.)';
const QMARK = '[^/]';
const END_ANCHOR = `(?:${SLASH_LITERAL}|$)`;
const START_ANCHOR = `(?:^|${SLASH_LITERAL})`;
const DOTS_SLASH = `${DOT_LITERAL}{1,2}${END_ANCHOR}`;
const NO_DOT = `(?!${DOT_LITERAL})`;
const NO_DOTS = `(?!${START_ANCHOR}${DOTS_SLASH})`;
const NO_DOT_SLASH = `(?!${DOT_LITERAL}{0,1}${END_ANCHOR})`;
const NO_DOTS_SLASH = `(?!${DOTS_SLASH})`;
const QMARK_NO_DOT = `[^.${SLASH_LITERAL}]`;
const STAR = `${QMARK}*?`;

const POSIX_CHARS = {
  DOT_LITERAL,
  PLUS_LITERAL,
  QMARK_LITERAL,
  SLASH_LITERAL,
  ONE_CHAR,
  QMARK,
  END_ANCHOR,
  DOTS_SLASH,
  NO_DOT,
  NO_DOTS,
  NO_DOT_SLASH,
  NO_DOTS_SLASH,
  QMARK_NO_DOT,
  STAR,
  START_ANCHOR
};

/**
 * Windows glob regex
 */

const WINDOWS_CHARS = {
  ...POSIX_CHARS,

  SLASH_LITERAL: `[${WIN_SLASH}]`,
  QMARK: WIN_NO_SLASH,
  STAR: `${WIN_NO_SLASH}*?`,
  DOTS_SLASH: `${DOT_LITERAL}{1,2}(?:[${WIN_SLASH}]|$)`,
  NO_DOT: `(?!${DOT_LITERAL})`,
  NO_DOTS: `(?!(?:^|[${WIN_SLASH}])${DOT_LITERAL}{1,2}(?:[${WIN_SLASH}]|$))`,
  NO_DOT_SLASH: `(?!${DOT_LITERAL}{0,1}(?:[${WIN_SLASH}]|$))`,
  NO_DOTS_SLASH: `(?!${DOT_LITERAL}{1,2}(?:[${WIN_SLASH}]|$))`,
  QMARK_NO_DOT: `[^.${WIN_SLASH}]`,
  START_ANCHOR: `(?:^|[${WIN_SLASH}])`,
  END_ANCHOR: `(?:[${WIN_SLASH}]|$)`
};

/**
 * POSIX Bracket Regex
 */

const POSIX_REGEX_SOURCE = {
  alnum: 'a-zA-Z0-9',
  alpha: 'a-zA-Z',
  ascii: '\\x00-\\x7F',
  blank: ' \\t',
  cntrl: '\\x00-\\x1F\\x7F',
  digit: '0-9',
  graph: '\\x21-\\x7E',
  lower: 'a-z',
  print: '\\x20-\\x7E ',
  punct: '\\-!"#$%&\'()\\*+,./:;<=>?@[\\]^_`{|}~',
  space: ' \\t\\r\\n\\v\\f',
  upper: 'A-Z',
  word: 'A-Za-z0-9_',
  xdigit: 'A-Fa-f0-9'
};

module.exports = {
  MAX_LENGTH: 1024 * 64,
  POSIX_REGEX_SOURCE,

  // regular expressions
  REGEX_BACKSLASH: /\\(?![*+?^${}(|)[\]])/g,
  REGEX_NON_SPECIAL_CHARS: /^[^@![\].,$*+?^{}()|\\/]+/,
  REGEX_SPECIAL_CHARS: /[-*+?.^${}(|)[\]]/,
  REGEX_SPECIAL_CHARS_BACKREF: /(\\?)((\W)(\3*))/g,
  REGEX_SPECIAL_CHARS_GLOBAL: /([-*+?.^${}(|)[\]])/g,
  REGEX_REMOVE_BACKSLASH: /(?:\[.*?[^\\]\]|\\(?=.))/g,

  // Replace globs with equivalent patterns to reduce parsing time.
  REPLACEMENTS: {
    '***': '*',
    '**/**': '**',
    '**/**/**': '**'
  },

  // Digits
  CHAR_0: 48, /* 0 */
  CHAR_9: 57, /* 9 */

  // Alphabet chars.
  CHAR_UPPERCASE_A: 65, /* A */
  CHAR_LOWERCASE_A: 97, /* a */
  CHAR_UPPERCASE_Z: 90, /* Z */
  CHAR_LOWERCASE_Z: 122, /* z */

  CHAR_LEFT_PARENTHESES: 40, /* ( */
  CHAR_RIGHT_PARENTHESES: 41, /* ) */

  CHAR_ASTERISK: 42, /* * */

  // Non-alphabetic chars.
  CHAR_AMPERSAND: 38, /* & */
  CHAR_AT: 64, /* @ */
  CHAR_BACKWARD_SLASH: 92, /* \ */
  CHAR_CARRIAGE_RETURN: 13, /* \r */
  CHAR_CIRCUMFLEX_ACCENT: 94, /* ^ */
  CHAR_COLON: 58, /* : */
  CHAR_COMMA: 44, /* , */
  CHAR_DOT: 46, /* . */
  CHAR_DOUBLE_QUOTE: 34, /* " */
  CHAR_EQUAL: 61, /* = */
  CHAR_EXCLAMATION_MARK: 33, /* ! */
  CHAR_FORM_FEED: 12, /* \f */
  CHAR_FORWARD_SLASH: 47, /* / */
  CHAR_GRAVE_ACCENT: 96, /* ` */
  CHAR_HASH: 35, /* # */
  CHAR_HYPHEN_MINUS: 45, /* - */
  CHAR_LEFT_ANGLE_BRACKET: 60, /* < */
  CHAR_LEFT_CURLY_BRACE: 123, /* { */
  CHAR_LEFT_SQUARE_BRACKET: 91, /* [ */
  CHAR_LINE_FEED: 10, /* \n */
  CHAR_NO_BREAK_SPACE: 160, /* \u00A0 */
  CHAR_PERCENT: 37, /* % */
  CHAR_PLUS: 43, /* + */
  CHAR_QUESTION_MARK: 63, /* ? */
  CHAR_RIGHT_ANGLE_BRACKET: 62, /* > */
  CHAR_RIGHT_CURLY_BRACE: 125, /* } */
  CHAR_RIGHT_SQUARE_BRACKET: 93, /* ] */
  CHAR_SEMICOLON: 59, /* ; */
  CHAR_SINGLE_QUOTE: 39, /* ' */
  CHAR_SPACE: 32, /*   */
  CHAR_TAB: 9, /* \t */
  CHAR_UNDERSCORE: 95, /* _ */
  CHAR_VERTICAL_LINE: 124, /* | */
  CHAR_ZERO_WIDTH_NOBREAK_SPACE: 65279, /* \uFEFF */

  SEP: path.sep,

  /**
   * Create EXTGLOB_CHARS
   */

  extglobChars(chars) {
    return {
      '!': { type: 'negate', open: '(?:(?!(?:', close: `))${chars.STAR})` },
      '?': { type: 'qmark', open: '(?:', close: ')?' },
      '+': { type: 'plus', open: '(?:', close: ')+' },
      '*': { type: 'star', open: '(?:', close: ')*' },
      '@': { type: 'at', open: '(?:', close: ')' }
    };
  },

  /**
   * Create GLOB_CHARS
   */

  globChars(win32) {
    return win32 === true ? WINDOWS_CHARS : POSIX_CHARS;
  }
};


/***/ }),

/***/ 2139:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


const constants = __webpack_require__(6099);
const utils = __webpack_require__(479);

/**
 * Constants
 */

const {
  MAX_LENGTH,
  POSIX_REGEX_SOURCE,
  REGEX_NON_SPECIAL_CHARS,
  REGEX_SPECIAL_CHARS_BACKREF,
  REPLACEMENTS
} = constants;

/**
 * Helpers
 */

const expandRange = (args, options) => {
  if (typeof options.expandRange === 'function') {
    return options.expandRange(...args, options);
  }

  args.sort();
  const value = `[${args.join('-')}]`;

  try {
    /* eslint-disable-next-line no-new */
    new RegExp(value);
  } catch (ex) {
    return args.map(v => utils.escapeRegex(v)).join('..');
  }

  return value;
};

/**
 * Create the message for a syntax error
 */

const syntaxError = (type, char) => {
  return `Missing ${type}: "${char}" - use "\\\\${char}" to match literal characters`;
};

/**
 * Parse the given input string.
 * @param {String} input
 * @param {Object} options
 * @return {Object}
 */

const parse = (input, options) => {
  if (typeof input !== 'string') {
    throw new TypeError('Expected a string');
  }

  input = REPLACEMENTS[input] || input;

  const opts = { ...options };
  const max = typeof opts.maxLength === 'number' ? Math.min(MAX_LENGTH, opts.maxLength) : MAX_LENGTH;

  let len = input.length;
  if (len > max) {
    throw new SyntaxError(`Input length: ${len}, exceeds maximum allowed length: ${max}`);
  }

  const bos = { type: 'bos', value: '', output: opts.prepend || '' };
  const tokens = [bos];

  const capture = opts.capture ? '' : '?:';
  const win32 = utils.isWindows(options);

  // create constants based on platform, for windows or posix
  const PLATFORM_CHARS = constants.globChars(win32);
  const EXTGLOB_CHARS = constants.extglobChars(PLATFORM_CHARS);

  const {
    DOT_LITERAL,
    PLUS_LITERAL,
    SLASH_LITERAL,
    ONE_CHAR,
    DOTS_SLASH,
    NO_DOT,
    NO_DOT_SLASH,
    NO_DOTS_SLASH,
    QMARK,
    QMARK_NO_DOT,
    STAR,
    START_ANCHOR
  } = PLATFORM_CHARS;

  const globstar = (opts) => {
    return `(${capture}(?:(?!${START_ANCHOR}${opts.dot ? DOTS_SLASH : DOT_LITERAL}).)*?)`;
  };

  const nodot = opts.dot ? '' : NO_DOT;
  const qmarkNoDot = opts.dot ? QMARK : QMARK_NO_DOT;
  let star = opts.bash === true ? globstar(opts) : STAR;

  if (opts.capture) {
    star = `(${star})`;
  }

  // minimatch options support
  if (typeof opts.noext === 'boolean') {
    opts.noextglob = opts.noext;
  }

  const state = {
    input,
    index: -1,
    start: 0,
    dot: opts.dot === true,
    consumed: '',
    output: '',
    prefix: '',
    backtrack: false,
    negated: false,
    brackets: 0,
    braces: 0,
    parens: 0,
    quotes: 0,
    globstar: false,
    tokens
  };

  input = utils.removePrefix(input, state);
  len = input.length;

  const extglobs = [];
  const braces = [];
  const stack = [];
  let prev = bos;
  let value;

  /**
   * Tokenizing helpers
   */

  const eos = () => state.index === len - 1;
  const peek = state.peek = (n = 1) => input[state.index + n];
  const advance = state.advance = () => input[++state.index];
  const remaining = () => input.slice(state.index + 1);
  const consume = (value = '', num = 0) => {
    state.consumed += value;
    state.index += num;
  };
  const append = token => {
    state.output += token.output != null ? token.output : token.value;
    consume(token.value);
  };

  const negate = () => {
    let count = 1;

    while (peek() === '!' && (peek(2) !== '(' || peek(3) === '?')) {
      advance();
      state.start++;
      count++;
    }

    if (count % 2 === 0) {
      return false;
    }

    state.negated = true;
    state.start++;
    return true;
  };

  const increment = type => {
    state[type]++;
    stack.push(type);
  };

  const decrement = type => {
    state[type]--;
    stack.pop();
  };

  /**
   * Push tokens onto the tokens array. This helper speeds up
   * tokenizing by 1) helping us avoid backtracking as much as possible,
   * and 2) helping us avoid creating extra tokens when consecutive
   * characters are plain text. This improves performance and simplifies
   * lookbehinds.
   */

  const push = tok => {
    if (prev.type === 'globstar') {
      const isBrace = state.braces > 0 && (tok.type === 'comma' || tok.type === 'brace');
      const isExtglob = tok.extglob === true || (extglobs.length && (tok.type === 'pipe' || tok.type === 'paren'));

      if (tok.type !== 'slash' && tok.type !== 'paren' && !isBrace && !isExtglob) {
        state.output = state.output.slice(0, -prev.output.length);
        prev.type = 'star';
        prev.value = '*';
        prev.output = star;
        state.output += prev.output;
      }
    }

    if (extglobs.length && tok.type !== 'paren' && !EXTGLOB_CHARS[tok.value]) {
      extglobs[extglobs.length - 1].inner += tok.value;
    }

    if (tok.value || tok.output) append(tok);
    if (prev && prev.type === 'text' && tok.type === 'text') {
      prev.value += tok.value;
      prev.output = (prev.output || '') + tok.value;
      return;
    }

    tok.prev = prev;
    tokens.push(tok);
    prev = tok;
  };

  const extglobOpen = (type, value) => {
    const token = { ...EXTGLOB_CHARS[value], conditions: 1, inner: '' };

    token.prev = prev;
    token.parens = state.parens;
    token.output = state.output;
    const output = (opts.capture ? '(' : '') + token.open;

    increment('parens');
    push({ type, value, output: state.output ? '' : ONE_CHAR });
    push({ type: 'paren', extglob: true, value: advance(), output });
    extglobs.push(token);
  };

  const extglobClose = token => {
    let output = token.close + (opts.capture ? ')' : '');

    if (token.type === 'negate') {
      let extglobStar = star;

      if (token.inner && token.inner.length > 1 && token.inner.includes('/')) {
        extglobStar = globstar(opts);
      }

      if (extglobStar !== star || eos() || /^\)+$/.test(remaining())) {
        output = token.close = `)$))${extglobStar}`;
      }

      if (token.prev.type === 'bos' && eos()) {
        state.negatedExtglob = true;
      }
    }

    push({ type: 'paren', extglob: true, value, output });
    decrement('parens');
  };

  /**
   * Fast paths
   */

  if (opts.fastpaths !== false && !/(^[*!]|[/()[\]{}"])/.test(input)) {
    let backslashes = false;

    let output = input.replace(REGEX_SPECIAL_CHARS_BACKREF, (m, esc, chars, first, rest, index) => {
      if (first === '\\') {
        backslashes = true;
        return m;
      }

      if (first === '?') {
        if (esc) {
          return esc + first + (rest ? QMARK.repeat(rest.length) : '');
        }
        if (index === 0) {
          return qmarkNoDot + (rest ? QMARK.repeat(rest.length) : '');
        }
        return QMARK.repeat(chars.length);
      }

      if (first === '.') {
        return DOT_LITERAL.repeat(chars.length);
      }

      if (first === '*') {
        if (esc) {
          return esc + first + (rest ? star : '');
        }
        return star;
      }
      return esc ? m : `\\${m}`;
    });

    if (backslashes === true) {
      if (opts.unescape === true) {
        output = output.replace(/\\/g, '');
      } else {
        output = output.replace(/\\+/g, m => {
          return m.length % 2 === 0 ? '\\\\' : (m ? '\\' : '');
        });
      }
    }

    if (output === input && opts.contains === true) {
      state.output = input;
      return state;
    }

    state.output = utils.wrapOutput(output, state, options);
    return state;
  }

  /**
   * Tokenize input until we reach end-of-string
   */

  while (!eos()) {
    value = advance();

    if (value === '\u0000') {
      continue;
    }

    /**
     * Escaped characters
     */

    if (value === '\\') {
      const next = peek();

      if (next === '/' && opts.bash !== true) {
        continue;
      }

      if (next === '.' || next === ';') {
        continue;
      }

      if (!next) {
        value += '\\';
        push({ type: 'text', value });
        continue;
      }

      // collapse slashes to reduce potential for exploits
      const match = /^\\+/.exec(remaining());
      let slashes = 0;

      if (match && match[0].length > 2) {
        slashes = match[0].length;
        state.index += slashes;
        if (slashes % 2 !== 0) {
          value += '\\';
        }
      }

      if (opts.unescape === true) {
        value = advance() || '';
      } else {
        value += advance() || '';
      }

      if (state.brackets === 0) {
        push({ type: 'text', value });
        continue;
      }
    }

    /**
     * If we're inside a regex character class, continue
     * until we reach the closing bracket.
     */

    if (state.brackets > 0 && (value !== ']' || prev.value === '[' || prev.value === '[^')) {
      if (opts.posix !== false && value === ':') {
        const inner = prev.value.slice(1);
        if (inner.includes('[')) {
          prev.posix = true;

          if (inner.includes(':')) {
            const idx = prev.value.lastIndexOf('[');
            const pre = prev.value.slice(0, idx);
            const rest = prev.value.slice(idx + 2);
            const posix = POSIX_REGEX_SOURCE[rest];
            if (posix) {
              prev.value = pre + posix;
              state.backtrack = true;
              advance();

              if (!bos.output && tokens.indexOf(prev) === 1) {
                bos.output = ONE_CHAR;
              }
              continue;
            }
          }
        }
      }

      if ((value === '[' && peek() !== ':') || (value === '-' && peek() === ']')) {
        value = `\\${value}`;
      }

      if (value === ']' && (prev.value === '[' || prev.value === '[^')) {
        value = `\\${value}`;
      }

      if (opts.posix === true && value === '!' && prev.value === '[') {
        value = '^';
      }

      prev.value += value;
      append({ value });
      continue;
    }

    /**
     * If we're inside a quoted string, continue
     * until we reach the closing double quote.
     */

    if (state.quotes === 1 && value !== '"') {
      value = utils.escapeRegex(value);
      prev.value += value;
      append({ value });
      continue;
    }

    /**
     * Double quotes
     */

    if (value === '"') {
      state.quotes = state.quotes === 1 ? 0 : 1;
      if (opts.keepQuotes === true) {
        push({ type: 'text', value });
      }
      continue;
    }

    /**
     * Parentheses
     */

    if (value === '(') {
      increment('parens');
      push({ type: 'paren', value });
      continue;
    }

    if (value === ')') {
      if (state.parens === 0 && opts.strictBrackets === true) {
        throw new SyntaxError(syntaxError('opening', '('));
      }

      const extglob = extglobs[extglobs.length - 1];
      if (extglob && state.parens === extglob.parens + 1) {
        extglobClose(extglobs.pop());
        continue;
      }

      push({ type: 'paren', value, output: state.parens ? ')' : '\\)' });
      decrement('parens');
      continue;
    }

    /**
     * Square brackets
     */

    if (value === '[') {
      if (opts.nobracket === true || !remaining().includes(']')) {
        if (opts.nobracket !== true && opts.strictBrackets === true) {
          throw new SyntaxError(syntaxError('closing', ']'));
        }

        value = `\\${value}`;
      } else {
        increment('brackets');
      }

      push({ type: 'bracket', value });
      continue;
    }

    if (value === ']') {
      if (opts.nobracket === true || (prev && prev.type === 'bracket' && prev.value.length === 1)) {
        push({ type: 'text', value, output: `\\${value}` });
        continue;
      }

      if (state.brackets === 0) {
        if (opts.strictBrackets === true) {
          throw new SyntaxError(syntaxError('opening', '['));
        }

        push({ type: 'text', value, output: `\\${value}` });
        continue;
      }

      decrement('brackets');

      const prevValue = prev.value.slice(1);
      if (prev.posix !== true && prevValue[0] === '^' && !prevValue.includes('/')) {
        value = `/${value}`;
      }

      prev.value += value;
      append({ value });

      // when literal brackets are explicitly disabled
      // assume we should match with a regex character class
      if (opts.literalBrackets === false || utils.hasRegexChars(prevValue)) {
        continue;
      }

      const escaped = utils.escapeRegex(prev.value);
      state.output = state.output.slice(0, -prev.value.length);

      // when literal brackets are explicitly enabled
      // assume we should escape the brackets to match literal characters
      if (opts.literalBrackets === true) {
        state.output += escaped;
        prev.value = escaped;
        continue;
      }

      // when the user specifies nothing, try to match both
      prev.value = `(${capture}${escaped}|${prev.value})`;
      state.output += prev.value;
      continue;
    }

    /**
     * Braces
     */

    if (value === '{' && opts.nobrace !== true) {
      increment('braces');

      const open = {
        type: 'brace',
        value,
        output: '(',
        outputIndex: state.output.length,
        tokensIndex: state.tokens.length
      };

      braces.push(open);
      push(open);
      continue;
    }

    if (value === '}') {
      const brace = braces[braces.length - 1];

      if (opts.nobrace === true || !brace) {
        push({ type: 'text', value, output: value });
        continue;
      }

      let output = ')';

      if (brace.dots === true) {
        const arr = tokens.slice();
        const range = [];

        for (let i = arr.length - 1; i >= 0; i--) {
          tokens.pop();
          if (arr[i].type === 'brace') {
            break;
          }
          if (arr[i].type !== 'dots') {
            range.unshift(arr[i].value);
          }
        }

        output = expandRange(range, opts);
        state.backtrack = true;
      }

      if (brace.comma !== true && brace.dots !== true) {
        const out = state.output.slice(0, brace.outputIndex);
        const toks = state.tokens.slice(brace.tokensIndex);
        brace.value = brace.output = '\\{';
        value = output = '\\}';
        state.output = out;
        for (const t of toks) {
          state.output += (t.output || t.value);
        }
      }

      push({ type: 'brace', value, output });
      decrement('braces');
      braces.pop();
      continue;
    }

    /**
     * Pipes
     */

    if (value === '|') {
      if (extglobs.length > 0) {
        extglobs[extglobs.length - 1].conditions++;
      }
      push({ type: 'text', value });
      continue;
    }

    /**
     * Commas
     */

    if (value === ',') {
      let output = value;

      const brace = braces[braces.length - 1];
      if (brace && stack[stack.length - 1] === 'braces') {
        brace.comma = true;
        output = '|';
      }

      push({ type: 'comma', value, output });
      continue;
    }

    /**
     * Slashes
     */

    if (value === '/') {
      // if the beginning of the glob is "./", advance the start
      // to the current index, and don't add the "./" characters
      // to the state. This greatly simplifies lookbehinds when
      // checking for BOS characters like "!" and "." (not "./")
      if (prev.type === 'dot' && state.index === state.start + 1) {
        state.start = state.index + 1;
        state.consumed = '';
        state.output = '';
        tokens.pop();
        prev = bos; // reset "prev" to the first token
        continue;
      }

      push({ type: 'slash', value, output: SLASH_LITERAL });
      continue;
    }

    /**
     * Dots
     */

    if (value === '.') {
      if (state.braces > 0 && prev.type === 'dot') {
        if (prev.value === '.') prev.output = DOT_LITERAL;
        const brace = braces[braces.length - 1];
        prev.type = 'dots';
        prev.output += value;
        prev.value += value;
        brace.dots = true;
        continue;
      }

      if ((state.braces + state.parens) === 0 && prev.type !== 'bos' && prev.type !== 'slash') {
        push({ type: 'text', value, output: DOT_LITERAL });
        continue;
      }

      push({ type: 'dot', value, output: DOT_LITERAL });
      continue;
    }

    /**
     * Question marks
     */

    if (value === '?') {
      const isGroup = prev && prev.value === '(';
      if (!isGroup && opts.noextglob !== true && peek() === '(' && peek(2) !== '?') {
        extglobOpen('qmark', value);
        continue;
      }

      if (prev && prev.type === 'paren') {
        const next = peek();
        let output = value;

        if (next === '<' && !utils.supportsLookbehinds()) {
          throw new Error('Node.js v10 or higher is required for regex lookbehinds');
        }

        if ((prev.value === '(' && !/[!=<:]/.test(next)) || (next === '<' && !/<([!=]|\w+>)/.test(remaining()))) {
          output = `\\${value}`;
        }

        push({ type: 'text', value, output });
        continue;
      }

      if (opts.dot !== true && (prev.type === 'slash' || prev.type === 'bos')) {
        push({ type: 'qmark', value, output: QMARK_NO_DOT });
        continue;
      }

      push({ type: 'qmark', value, output: QMARK });
      continue;
    }

    /**
     * Exclamation
     */

    if (value === '!') {
      if (opts.noextglob !== true && peek() === '(') {
        if (peek(2) !== '?' || !/[!=<:]/.test(peek(3))) {
          extglobOpen('negate', value);
          continue;
        }
      }

      if (opts.nonegate !== true && state.index === 0) {
        negate();
        continue;
      }
    }

    /**
     * Plus
     */

    if (value === '+') {
      if (opts.noextglob !== true && peek() === '(' && peek(2) !== '?') {
        extglobOpen('plus', value);
        continue;
      }

      if ((prev && prev.value === '(') || opts.regex === false) {
        push({ type: 'plus', value, output: PLUS_LITERAL });
        continue;
      }

      if ((prev && (prev.type === 'bracket' || prev.type === 'paren' || prev.type === 'brace')) || state.parens > 0) {
        push({ type: 'plus', value });
        continue;
      }

      push({ type: 'plus', value: PLUS_LITERAL });
      continue;
    }

    /**
     * Plain text
     */

    if (value === '@') {
      if (opts.noextglob !== true && peek() === '(' && peek(2) !== '?') {
        push({ type: 'at', extglob: true, value, output: '' });
        continue;
      }

      push({ type: 'text', value });
      continue;
    }

    /**
     * Plain text
     */

    if (value !== '*') {
      if (value === '$' || value === '^') {
        value = `\\${value}`;
      }

      const match = REGEX_NON_SPECIAL_CHARS.exec(remaining());
      if (match) {
        value += match[0];
        state.index += match[0].length;
      }

      push({ type: 'text', value });
      continue;
    }

    /**
     * Stars
     */

    if (prev && (prev.type === 'globstar' || prev.star === true)) {
      prev.type = 'star';
      prev.star = true;
      prev.value += value;
      prev.output = star;
      state.backtrack = true;
      state.globstar = true;
      consume(value);
      continue;
    }

    let rest = remaining();
    if (opts.noextglob !== true && /^\([^?]/.test(rest)) {
      extglobOpen('star', value);
      continue;
    }

    if (prev.type === 'star') {
      if (opts.noglobstar === true) {
        consume(value);
        continue;
      }

      const prior = prev.prev;
      const before = prior.prev;
      const isStart = prior.type === 'slash' || prior.type === 'bos';
      const afterStar = before && (before.type === 'star' || before.type === 'globstar');

      if (opts.bash === true && (!isStart || (rest[0] && rest[0] !== '/'))) {
        push({ type: 'star', value, output: '' });
        continue;
      }

      const isBrace = state.braces > 0 && (prior.type === 'comma' || prior.type === 'brace');
      const isExtglob = extglobs.length && (prior.type === 'pipe' || prior.type === 'paren');
      if (!isStart && prior.type !== 'paren' && !isBrace && !isExtglob) {
        push({ type: 'star', value, output: '' });
        continue;
      }

      // strip consecutive `/**/`
      while (rest.slice(0, 3) === '/**') {
        const after = input[state.index + 4];
        if (after && after !== '/') {
          break;
        }
        rest = rest.slice(3);
        consume('/**', 3);
      }

      if (prior.type === 'bos' && eos()) {
        prev.type = 'globstar';
        prev.value += value;
        prev.output = globstar(opts);
        state.output = prev.output;
        state.globstar = true;
        consume(value);
        continue;
      }

      if (prior.type === 'slash' && prior.prev.type !== 'bos' && !afterStar && eos()) {
        state.output = state.output.slice(0, -(prior.output + prev.output).length);
        prior.output = `(?:${prior.output}`;

        prev.type = 'globstar';
        prev.output = globstar(opts) + (opts.strictSlashes ? ')' : '|$)');
        prev.value += value;
        state.globstar = true;
        state.output += prior.output + prev.output;
        consume(value);
        continue;
      }

      if (prior.type === 'slash' && prior.prev.type !== 'bos' && rest[0] === '/') {
        const end = rest[1] !== void 0 ? '|$' : '';

        state.output = state.output.slice(0, -(prior.output + prev.output).length);
        prior.output = `(?:${prior.output}`;

        prev.type = 'globstar';
        prev.output = `${globstar(opts)}${SLASH_LITERAL}|${SLASH_LITERAL}${end})`;
        prev.value += value;

        state.output += prior.output + prev.output;
        state.globstar = true;

        consume(value + advance());

        push({ type: 'slash', value: '/', output: '' });
        continue;
      }

      if (prior.type === 'bos' && rest[0] === '/') {
        prev.type = 'globstar';
        prev.value += value;
        prev.output = `(?:^|${SLASH_LITERAL}|${globstar(opts)}${SLASH_LITERAL})`;
        state.output = prev.output;
        state.globstar = true;
        consume(value + advance());
        push({ type: 'slash', value: '/', output: '' });
        continue;
      }

      // remove single star from output
      state.output = state.output.slice(0, -prev.output.length);

      // reset previous token to globstar
      prev.type = 'globstar';
      prev.output = globstar(opts);
      prev.value += value;

      // reset output with globstar
      state.output += prev.output;
      state.globstar = true;
      consume(value);
      continue;
    }

    const token = { type: 'star', value, output: star };

    if (opts.bash === true) {
      token.output = '.*?';
      if (prev.type === 'bos' || prev.type === 'slash') {
        token.output = nodot + token.output;
      }
      push(token);
      continue;
    }

    if (prev && (prev.type === 'bracket' || prev.type === 'paren') && opts.regex === true) {
      token.output = value;
      push(token);
      continue;
    }

    if (state.index === state.start || prev.type === 'slash' || prev.type === 'dot') {
      if (prev.type === 'dot') {
        state.output += NO_DOT_SLASH;
        prev.output += NO_DOT_SLASH;

      } else if (opts.dot === true) {
        state.output += NO_DOTS_SLASH;
        prev.output += NO_DOTS_SLASH;

      } else {
        state.output += nodot;
        prev.output += nodot;
      }

      if (peek() !== '*') {
        state.output += ONE_CHAR;
        prev.output += ONE_CHAR;
      }
    }

    push(token);
  }

  while (state.brackets > 0) {
    if (opts.strictBrackets === true) throw new SyntaxError(syntaxError('closing', ']'));
    state.output = utils.escapeLast(state.output, '[');
    decrement('brackets');
  }

  while (state.parens > 0) {
    if (opts.strictBrackets === true) throw new SyntaxError(syntaxError('closing', ')'));
    state.output = utils.escapeLast(state.output, '(');
    decrement('parens');
  }

  while (state.braces > 0) {
    if (opts.strictBrackets === true) throw new SyntaxError(syntaxError('closing', '}'));
    state.output = utils.escapeLast(state.output, '{');
    decrement('braces');
  }

  if (opts.strictSlashes !== true && (prev.type === 'star' || prev.type === 'bracket')) {
    push({ type: 'maybe_slash', value: '', output: `${SLASH_LITERAL}?` });
  }

  // rebuild the output if we had to backtrack at any point
  if (state.backtrack === true) {
    state.output = '';

    for (const token of state.tokens) {
      state.output += token.output != null ? token.output : token.value;

      if (token.suffix) {
        state.output += token.suffix;
      }
    }
  }

  return state;
};

/**
 * Fast paths for creating regular expressions for common glob patterns.
 * This can significantly speed up processing and has very little downside
 * impact when none of the fast paths match.
 */

parse.fastpaths = (input, options) => {
  const opts = { ...options };
  const max = typeof opts.maxLength === 'number' ? Math.min(MAX_LENGTH, opts.maxLength) : MAX_LENGTH;
  const len = input.length;
  if (len > max) {
    throw new SyntaxError(`Input length: ${len}, exceeds maximum allowed length: ${max}`);
  }

  input = REPLACEMENTS[input] || input;
  const win32 = utils.isWindows(options);

  // create constants based on platform, for windows or posix
  const {
    DOT_LITERAL,
    SLASH_LITERAL,
    ONE_CHAR,
    DOTS_SLASH,
    NO_DOT,
    NO_DOTS,
    NO_DOTS_SLASH,
    STAR,
    START_ANCHOR
  } = constants.globChars(win32);

  const nodot = opts.dot ? NO_DOTS : NO_DOT;
  const slashDot = opts.dot ? NO_DOTS_SLASH : NO_DOT;
  const capture = opts.capture ? '' : '?:';
  const state = { negated: false, prefix: '' };
  let star = opts.bash === true ? '.*?' : STAR;

  if (opts.capture) {
    star = `(${star})`;
  }

  const globstar = (opts) => {
    if (opts.noglobstar === true) return star;
    return `(${capture}(?:(?!${START_ANCHOR}${opts.dot ? DOTS_SLASH : DOT_LITERAL}).)*?)`;
  };

  const create = str => {
    switch (str) {
      case '*':
        return `${nodot}${ONE_CHAR}${star}`;

      case '.*':
        return `${DOT_LITERAL}${ONE_CHAR}${star}`;

      case '*.*':
        return `${nodot}${star}${DOT_LITERAL}${ONE_CHAR}${star}`;

      case '*/*':
        return `${nodot}${star}${SLASH_LITERAL}${ONE_CHAR}${slashDot}${star}`;

      case '**':
        return nodot + globstar(opts);

      case '**/*':
        return `(?:${nodot}${globstar(opts)}${SLASH_LITERAL})?${slashDot}${ONE_CHAR}${star}`;

      case '**/*.*':
        return `(?:${nodot}${globstar(opts)}${SLASH_LITERAL})?${slashDot}${star}${DOT_LITERAL}${ONE_CHAR}${star}`;

      case '**/.*':
        return `(?:${nodot}${globstar(opts)}${SLASH_LITERAL})?${DOT_LITERAL}${ONE_CHAR}${star}`;

      default: {
        const match = /^(.*?)\.(\w+)$/.exec(str);
        if (!match) return;

        const source = create(match[1]);
        if (!source) return;

        return source + DOT_LITERAL + match[2];
      }
    }
  };

  const output = utils.removePrefix(input, state);
  let source = create(output);

  if (source && opts.strictSlashes !== true) {
    source += `${SLASH_LITERAL}?`;
  }

  return source;
};

module.exports = parse;


/***/ }),

/***/ 3322:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


const path = __webpack_require__(5622);
const scan = __webpack_require__(2429);
const parse = __webpack_require__(2139);
const utils = __webpack_require__(479);
const constants = __webpack_require__(6099);
const isObject = val => val && typeof val === 'object' && !Array.isArray(val);

/**
 * Creates a matcher function from one or more glob patterns. The
 * returned function takes a string to match as its first argument,
 * and returns true if the string is a match. The returned matcher
 * function also takes a boolean as the second argument that, when true,
 * returns an object with additional information.
 *
 * ```js
 * const picomatch = require('picomatch');
 * // picomatch(glob[, options]);
 *
 * const isMatch = picomatch('*.!(*a)');
 * console.log(isMatch('a.a')); //=> false
 * console.log(isMatch('a.b')); //=> true
 * ```
 * @name picomatch
 * @param {String|Array} `globs` One or more glob patterns.
 * @param {Object=} `options`
 * @return {Function=} Returns a matcher function.
 * @api public
 */

const picomatch = (glob, options, returnState = false) => {
  if (Array.isArray(glob)) {
    const fns = glob.map(input => picomatch(input, options, returnState));
    const arrayMatcher = str => {
      for (const isMatch of fns) {
        const state = isMatch(str);
        if (state) return state;
      }
      return false;
    };
    return arrayMatcher;
  }

  const isState = isObject(glob) && glob.tokens && glob.input;

  if (glob === '' || (typeof glob !== 'string' && !isState)) {
    throw new TypeError('Expected pattern to be a non-empty string');
  }

  const opts = options || {};
  const posix = utils.isWindows(options);
  const regex = isState
    ? picomatch.compileRe(glob, options)
    : picomatch.makeRe(glob, options, false, true);

  const state = regex.state;
  delete regex.state;

  let isIgnored = () => false;
  if (opts.ignore) {
    const ignoreOpts = { ...options, ignore: null, onMatch: null, onResult: null };
    isIgnored = picomatch(opts.ignore, ignoreOpts, returnState);
  }

  const matcher = (input, returnObject = false) => {
    const { isMatch, match, output } = picomatch.test(input, regex, options, { glob, posix });
    const result = { glob, state, regex, posix, input, output, match, isMatch };

    if (typeof opts.onResult === 'function') {
      opts.onResult(result);
    }

    if (isMatch === false) {
      result.isMatch = false;
      return returnObject ? result : false;
    }

    if (isIgnored(input)) {
      if (typeof opts.onIgnore === 'function') {
        opts.onIgnore(result);
      }
      result.isMatch = false;
      return returnObject ? result : false;
    }

    if (typeof opts.onMatch === 'function') {
      opts.onMatch(result);
    }
    return returnObject ? result : true;
  };

  if (returnState) {
    matcher.state = state;
  }

  return matcher;
};

/**
 * Test `input` with the given `regex`. This is used by the main
 * `picomatch()` function to test the input string.
 *
 * ```js
 * const picomatch = require('picomatch');
 * // picomatch.test(input, regex[, options]);
 *
 * console.log(picomatch.test('foo/bar', /^(?:([^/]*?)\/([^/]*?))$/));
 * // { isMatch: true, match: [ 'foo/', 'foo', 'bar' ], output: 'foo/bar' }
 * ```
 * @param {String} `input` String to test.
 * @param {RegExp} `regex`
 * @return {Object} Returns an object with matching info.
 * @api public
 */

picomatch.test = (input, regex, options, { glob, posix } = {}) => {
  if (typeof input !== 'string') {
    throw new TypeError('Expected input to be a string');
  }

  if (input === '') {
    return { isMatch: false, output: '' };
  }

  const opts = options || {};
  const format = opts.format || (posix ? utils.toPosixSlashes : null);
  let match = input === glob;
  let output = (match && format) ? format(input) : input;

  if (match === false) {
    output = format ? format(input) : input;
    match = output === glob;
  }

  if (match === false || opts.capture === true) {
    if (opts.matchBase === true || opts.basename === true) {
      match = picomatch.matchBase(input, regex, options, posix);
    } else {
      match = regex.exec(output);
    }
  }

  return { isMatch: Boolean(match), match, output };
};

/**
 * Match the basename of a filepath.
 *
 * ```js
 * const picomatch = require('picomatch');
 * // picomatch.matchBase(input, glob[, options]);
 * console.log(picomatch.matchBase('foo/bar.js', '*.js'); // true
 * ```
 * @param {String} `input` String to test.
 * @param {RegExp|String} `glob` Glob pattern or regex created by [.makeRe](#makeRe).
 * @return {Boolean}
 * @api public
 */

picomatch.matchBase = (input, glob, options, posix = utils.isWindows(options)) => {
  const regex = glob instanceof RegExp ? glob : picomatch.makeRe(glob, options);
  return regex.test(path.basename(input));
};

/**
 * Returns true if **any** of the given glob `patterns` match the specified `string`.
 *
 * ```js
 * const picomatch = require('picomatch');
 * // picomatch.isMatch(string, patterns[, options]);
 *
 * console.log(picomatch.isMatch('a.a', ['b.*', '*.a'])); //=> true
 * console.log(picomatch.isMatch('a.a', 'b.*')); //=> false
 * ```
 * @param {String|Array} str The string to test.
 * @param {String|Array} patterns One or more glob patterns to use for matching.
 * @param {Object} [options] See available [options](#options).
 * @return {Boolean} Returns true if any patterns match `str`
 * @api public
 */

picomatch.isMatch = (str, patterns, options) => picomatch(patterns, options)(str);

/**
 * Parse a glob pattern to create the source string for a regular
 * expression.
 *
 * ```js
 * const picomatch = require('picomatch');
 * const result = picomatch.parse(pattern[, options]);
 * ```
 * @param {String} `pattern`
 * @param {Object} `options`
 * @return {Object} Returns an object with useful properties and output to be used as a regex source string.
 * @api public
 */

picomatch.parse = (pattern, options) => {
  if (Array.isArray(pattern)) return pattern.map(p => picomatch.parse(p, options));
  return parse(pattern, { ...options, fastpaths: false });
};

/**
 * Scan a glob pattern to separate the pattern into segments.
 *
 * ```js
 * const picomatch = require('picomatch');
 * // picomatch.scan(input[, options]);
 *
 * const result = picomatch.scan('!./foo/*.js');
 * console.log(result);
 * { prefix: '!./',
 *   input: '!./foo/*.js',
 *   start: 3,
 *   base: 'foo',
 *   glob: '*.js',
 *   isBrace: false,
 *   isBracket: false,
 *   isGlob: true,
 *   isExtglob: false,
 *   isGlobstar: false,
 *   negated: true }
 * ```
 * @param {String} `input` Glob pattern to scan.
 * @param {Object} `options`
 * @return {Object} Returns an object with
 * @api public
 */

picomatch.scan = (input, options) => scan(input, options);

/**
 * Create a regular expression from a parsed glob pattern.
 *
 * ```js
 * const picomatch = require('picomatch');
 * const state = picomatch.parse('*.js');
 * // picomatch.compileRe(state[, options]);
 *
 * console.log(picomatch.compileRe(state));
 * //=> /^(?:(?!\.)(?=.)[^/]*?\.js)$/
 * ```
 * @param {String} `state` The object returned from the `.parse` method.
 * @param {Object} `options`
 * @return {RegExp} Returns a regex created from the given pattern.
 * @api public
 */

picomatch.compileRe = (parsed, options, returnOutput = false, returnState = false) => {
  if (returnOutput === true) {
    return parsed.output;
  }

  const opts = options || {};
  const prepend = opts.contains ? '' : '^';
  const append = opts.contains ? '' : '$';

  let source = `${prepend}(?:${parsed.output})${append}`;
  if (parsed && parsed.negated === true) {
    source = `^(?!${source}).*$`;
  }

  const regex = picomatch.toRegex(source, options);
  if (returnState === true) {
    regex.state = parsed;
  }

  return regex;
};

picomatch.makeRe = (input, options, returnOutput = false, returnState = false) => {
  if (!input || typeof input !== 'string') {
    throw new TypeError('Expected a non-empty string');
  }

  const opts = options || {};
  let parsed = { negated: false, fastpaths: true };
  let prefix = '';
  let output;

  if (input.startsWith('./')) {
    input = input.slice(2);
    prefix = parsed.prefix = './';
  }

  if (opts.fastpaths !== false && (input[0] === '.' || input[0] === '*')) {
    output = parse.fastpaths(input, options);
  }

  if (output === undefined) {
    parsed = parse(input, options);
    parsed.prefix = prefix + (parsed.prefix || '');
  } else {
    parsed.output = output;
  }

  return picomatch.compileRe(parsed, options, returnOutput, returnState);
};

/**
 * Create a regular expression from the given regex source string.
 *
 * ```js
 * const picomatch = require('picomatch');
 * // picomatch.toRegex(source[, options]);
 *
 * const { output } = picomatch.parse('*.js');
 * console.log(picomatch.toRegex(output));
 * //=> /^(?:(?!\.)(?=.)[^/]*?\.js)$/
 * ```
 * @param {String} `source` Regular expression source string.
 * @param {Object} `options`
 * @return {RegExp}
 * @api public
 */

picomatch.toRegex = (source, options) => {
  try {
    const opts = options || {};
    return new RegExp(source, opts.flags || (opts.nocase ? 'i' : ''));
  } catch (err) {
    if (options && options.debug === true) throw err;
    return /$^/;
  }
};

/**
 * Picomatch constants.
 * @return {Object}
 */

picomatch.constants = constants;

/**
 * Expose "picomatch"
 */

module.exports = picomatch;


/***/ }),

/***/ 2429:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


const utils = __webpack_require__(479);
const {
  CHAR_ASTERISK,             /* * */
  CHAR_AT,                   /* @ */
  CHAR_BACKWARD_SLASH,       /* \ */
  CHAR_COMMA,                /* , */
  CHAR_DOT,                  /* . */
  CHAR_EXCLAMATION_MARK,     /* ! */
  CHAR_FORWARD_SLASH,        /* / */
  CHAR_LEFT_CURLY_BRACE,     /* { */
  CHAR_LEFT_PARENTHESES,     /* ( */
  CHAR_LEFT_SQUARE_BRACKET,  /* [ */
  CHAR_PLUS,                 /* + */
  CHAR_QUESTION_MARK,        /* ? */
  CHAR_RIGHT_CURLY_BRACE,    /* } */
  CHAR_RIGHT_PARENTHESES,    /* ) */
  CHAR_RIGHT_SQUARE_BRACKET  /* ] */
} = __webpack_require__(6099);

const isPathSeparator = code => {
  return code === CHAR_FORWARD_SLASH || code === CHAR_BACKWARD_SLASH;
};

const depth = token => {
  if (token.isPrefix !== true) {
    token.depth = token.isGlobstar ? Infinity : 1;
  }
};

/**
 * Quickly scans a glob pattern and returns an object with a handful of
 * useful properties, like `isGlob`, `path` (the leading non-glob, if it exists),
 * `glob` (the actual pattern), and `negated` (true if the path starts with `!`).
 *
 * ```js
 * const pm = require('picomatch');
 * console.log(pm.scan('foo/bar/*.js'));
 * { isGlob: true, input: 'foo/bar/*.js', base: 'foo/bar', glob: '*.js' }
 * ```
 * @param {String} `str`
 * @param {Object} `options`
 * @return {Object} Returns an object with tokens and regex source string.
 * @api public
 */

const scan = (input, options) => {
  const opts = options || {};

  const length = input.length - 1;
  const scanToEnd = opts.parts === true || opts.scanToEnd === true;
  const slashes = [];
  const tokens = [];
  const parts = [];

  let str = input;
  let index = -1;
  let start = 0;
  let lastIndex = 0;
  let isBrace = false;
  let isBracket = false;
  let isGlob = false;
  let isExtglob = false;
  let isGlobstar = false;
  let braceEscaped = false;
  let backslashes = false;
  let negated = false;
  let finished = false;
  let braces = 0;
  let prev;
  let code;
  let token = { value: '', depth: 0, isGlob: false };

  const eos = () => index >= length;
  const peek = () => str.charCodeAt(index + 1);
  const advance = () => {
    prev = code;
    return str.charCodeAt(++index);
  };

  while (index < length) {
    code = advance();
    let next;

    if (code === CHAR_BACKWARD_SLASH) {
      backslashes = token.backslashes = true;
      code = advance();

      if (code === CHAR_LEFT_CURLY_BRACE) {
        braceEscaped = true;
      }
      continue;
    }

    if (braceEscaped === true || code === CHAR_LEFT_CURLY_BRACE) {
      braces++;

      while (eos() !== true && (code = advance())) {
        if (code === CHAR_BACKWARD_SLASH) {
          backslashes = token.backslashes = true;
          advance();
          continue;
        }

        if (code === CHAR_LEFT_CURLY_BRACE) {
          braces++;
          continue;
        }

        if (braceEscaped !== true && code === CHAR_DOT && (code = advance()) === CHAR_DOT) {
          isBrace = token.isBrace = true;
          isGlob = token.isGlob = true;
          finished = true;

          if (scanToEnd === true) {
            continue;
          }

          break;
        }

        if (braceEscaped !== true && code === CHAR_COMMA) {
          isBrace = token.isBrace = true;
          isGlob = token.isGlob = true;
          finished = true;

          if (scanToEnd === true) {
            continue;
          }

          break;
        }

        if (code === CHAR_RIGHT_CURLY_BRACE) {
          braces--;

          if (braces === 0) {
            braceEscaped = false;
            isBrace = token.isBrace = true;
            finished = true;
            break;
          }
        }
      }

      if (scanToEnd === true) {
        continue;
      }

      break;
    }

    if (code === CHAR_FORWARD_SLASH) {
      slashes.push(index);
      tokens.push(token);
      token = { value: '', depth: 0, isGlob: false };

      if (finished === true) continue;
      if (prev === CHAR_DOT && index === (start + 1)) {
        start += 2;
        continue;
      }

      lastIndex = index + 1;
      continue;
    }

    if (opts.noext !== true) {
      const isExtglobChar = code === CHAR_PLUS
        || code === CHAR_AT
        || code === CHAR_ASTERISK
        || code === CHAR_QUESTION_MARK
        || code === CHAR_EXCLAMATION_MARK;

      if (isExtglobChar === true && peek() === CHAR_LEFT_PARENTHESES) {
        isGlob = token.isGlob = true;
        isExtglob = token.isExtglob = true;
        finished = true;

        if (scanToEnd === true) {
          while (eos() !== true && (code = advance())) {
            if (code === CHAR_BACKWARD_SLASH) {
              backslashes = token.backslashes = true;
              code = advance();
              continue;
            }

            if (code === CHAR_RIGHT_PARENTHESES) {
              isGlob = token.isGlob = true;
              finished = true;
              break;
            }
          }
          continue;
        }
        break;
      }
    }

    if (code === CHAR_ASTERISK) {
      if (prev === CHAR_ASTERISK) isGlobstar = token.isGlobstar = true;
      isGlob = token.isGlob = true;
      finished = true;

      if (scanToEnd === true) {
        continue;
      }
      break;
    }

    if (code === CHAR_QUESTION_MARK) {
      isGlob = token.isGlob = true;
      finished = true;

      if (scanToEnd === true) {
        continue;
      }
      break;
    }

    if (code === CHAR_LEFT_SQUARE_BRACKET) {
      while (eos() !== true && (next = advance())) {
        if (next === CHAR_BACKWARD_SLASH) {
          backslashes = token.backslashes = true;
          advance();
          continue;
        }

        if (next === CHAR_RIGHT_SQUARE_BRACKET) {
          isBracket = token.isBracket = true;
          isGlob = token.isGlob = true;
          finished = true;

          if (scanToEnd === true) {
            continue;
          }
          break;
        }
      }
    }

    if (opts.nonegate !== true && code === CHAR_EXCLAMATION_MARK && index === start) {
      negated = token.negated = true;
      start++;
      continue;
    }

    if (opts.noparen !== true && code === CHAR_LEFT_PARENTHESES) {
      isGlob = token.isGlob = true;

      if (scanToEnd === true) {
        while (eos() !== true && (code = advance())) {
          if (code === CHAR_LEFT_PARENTHESES) {
            backslashes = token.backslashes = true;
            code = advance();
            continue;
          }

          if (code === CHAR_RIGHT_PARENTHESES) {
            finished = true;
            break;
          }
        }
        continue;
      }
      break;
    }

    if (isGlob === true) {
      finished = true;

      if (scanToEnd === true) {
        continue;
      }

      break;
    }
  }

  if (opts.noext === true) {
    isExtglob = false;
    isGlob = false;
  }

  let base = str;
  let prefix = '';
  let glob = '';

  if (start > 0) {
    prefix = str.slice(0, start);
    str = str.slice(start);
    lastIndex -= start;
  }

  if (base && isGlob === true && lastIndex > 0) {
    base = str.slice(0, lastIndex);
    glob = str.slice(lastIndex);
  } else if (isGlob === true) {
    base = '';
    glob = str;
  } else {
    base = str;
  }

  if (base && base !== '' && base !== '/' && base !== str) {
    if (isPathSeparator(base.charCodeAt(base.length - 1))) {
      base = base.slice(0, -1);
    }
  }

  if (opts.unescape === true) {
    if (glob) glob = utils.removeBackslashes(glob);

    if (base && backslashes === true) {
      base = utils.removeBackslashes(base);
    }
  }

  const state = {
    prefix,
    input,
    start,
    base,
    glob,
    isBrace,
    isBracket,
    isGlob,
    isExtglob,
    isGlobstar,
    negated
  };

  if (opts.tokens === true) {
    state.maxDepth = 0;
    if (!isPathSeparator(code)) {
      tokens.push(token);
    }
    state.tokens = tokens;
  }

  if (opts.parts === true || opts.tokens === true) {
    let prevIndex;

    for (let idx = 0; idx < slashes.length; idx++) {
      const n = prevIndex ? prevIndex + 1 : start;
      const i = slashes[idx];
      const value = input.slice(n, i);
      if (opts.tokens) {
        if (idx === 0 && start !== 0) {
          tokens[idx].isPrefix = true;
          tokens[idx].value = prefix;
        } else {
          tokens[idx].value = value;
        }
        depth(tokens[idx]);
        state.maxDepth += tokens[idx].depth;
      }
      if (idx !== 0 || value !== '') {
        parts.push(value);
      }
      prevIndex = i;
    }

    if (prevIndex && prevIndex + 1 < input.length) {
      const value = input.slice(prevIndex + 1);
      parts.push(value);

      if (opts.tokens) {
        tokens[tokens.length - 1].value = value;
        depth(tokens[tokens.length - 1]);
        state.maxDepth += tokens[tokens.length - 1].depth;
      }
    }

    state.slashes = slashes;
    state.parts = parts;
  }

  return state;
};

module.exports = scan;


/***/ }),

/***/ 479:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


const path = __webpack_require__(5622);
const win32 = process.platform === 'win32';
const {
  REGEX_BACKSLASH,
  REGEX_REMOVE_BACKSLASH,
  REGEX_SPECIAL_CHARS,
  REGEX_SPECIAL_CHARS_GLOBAL
} = __webpack_require__(6099);

exports.isObject = val => val !== null && typeof val === 'object' && !Array.isArray(val);
exports.hasRegexChars = str => REGEX_SPECIAL_CHARS.test(str);
exports.isRegexChar = str => str.length === 1 && exports.hasRegexChars(str);
exports.escapeRegex = str => str.replace(REGEX_SPECIAL_CHARS_GLOBAL, '\\$1');
exports.toPosixSlashes = str => str.replace(REGEX_BACKSLASH, '/');

exports.removeBackslashes = str => {
  return str.replace(REGEX_REMOVE_BACKSLASH, match => {
    return match === '\\' ? '' : match;
  });
};

exports.supportsLookbehinds = () => {
  const segs = process.version.slice(1).split('.').map(Number);
  if (segs.length === 3 && segs[0] >= 9 || (segs[0] === 8 && segs[1] >= 10)) {
    return true;
  }
  return false;
};

exports.isWindows = options => {
  if (options && typeof options.windows === 'boolean') {
    return options.windows;
  }
  return win32 === true || path.sep === '\\';
};

exports.escapeLast = (input, char, lastIdx) => {
  const idx = input.lastIndexOf(char, lastIdx);
  if (idx === -1) return input;
  if (input[idx - 1] === '\\') return exports.escapeLast(input, char, idx - 1);
  return `${input.slice(0, idx)}\\${input.slice(idx)}`;
};

exports.removePrefix = (input, state = {}) => {
  let output = input;
  if (output.startsWith('./')) {
    output = output.slice(2);
    state.prefix = './';
  }
  return output;
};

exports.wrapOutput = (input, state = {}, options = {}) => {
  const prepend = options.contains ? '' : '^';
  const append = options.contains ? '' : '$';

  let output = `${prepend}(?:${input})${append}`;
  if (state.negated === true) {
    output = `(?:^(?!${output}).*$)`;
  }
  return output;
};


/***/ }),

/***/ 4077:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/* eslint-env node */


const fs = __webpack_require__(5747);
const matched = __webpack_require__(9568);
const pathSort = __webpack_require__(1910);

const TranslationParser = __webpack_require__(72);
const PotMaker = __webpack_require__(6605);

/**
 * Set default options
 *
 * @param {object} options
 *
 * @return {object}
 */
function setDefaultOptions (options) {
  const defaultOptions = {
    src: '**/*.php',
    globOpts: {},
    destFile: 'translations.pot',
    commentKeyword: 'translators:',
    headers: {
      'X-Poedit-Basepath': '..',
      'X-Poedit-SourceCharset': 'UTF-8',
      'X-Poedit-SearchPath-0': '.',
      'X-Poedit-SearchPathExcluded-0': '*.js'
    },
    defaultHeaders: true,
    noFilePaths: false,
    writeFile: true,
    gettextFunctions: [
      { name: '__' },
      { name: '_e' },
      { name: '_ex', context: 2 },
      { name: '_n', plural: 2 },
      { name: '_n_noop', plural: 2 },
      { name: '_nx', plural: 2, context: 4 },
      { name: '_nx_noop', plural: 2, context: 3 },
      { name: '_x', context: 2 },
      { name: 'esc_attr__' },
      { name: 'esc_attr_e' },
      { name: 'esc_attr_x', context: 2 },
      { name: 'esc_html__' },
      { name: 'esc_html_e' },
      { name: 'esc_html_x', context: 2 }
    ],
    ignoreTemplateNameHeader: false
  };

  if (options.headers === false) {
    options.defaultHeaders = false;
  }

  options = Object.assign({}, defaultOptions, options);

  if (!options.package) {
    options.package = options.domain || 'unnamed project';
  }

  const functionCalls = {
    valid: [],
    contextPosition: {},
    pluralPosition: {}
  };

  options.gettextFunctions.forEach(function (methodObject) {
    functionCalls.valid.push(methodObject.name);

    if (methodObject.plural) {
      functionCalls.pluralPosition[methodObject.name] = methodObject.plural;
    }
    if (methodObject.context) {
      functionCalls.contextPosition[methodObject.name] = methodObject.context;
    }
  });

  options.functionCalls = functionCalls;

  return options;
}

/**
 * Generate string for header from gettext function
 *
 * @param {object} gettextFunctions
 *
 * @return {Array}
 */
function keywordsListStrings (gettextFunctions) {
  const methodStrings = [];

  for (const getTextFunction of gettextFunctions) {
    let methodString = getTextFunction.name;

    if (getTextFunction.plural || getTextFunction.context) {
      methodString += ':1';
    }
    if (getTextFunction.plural) {
      methodString += `,${getTextFunction.plural}`;
    }
    if (getTextFunction.context) {
      methodString += `,${getTextFunction.context}c`;
    }

    methodStrings.push(methodString);
  }

  return methodStrings;
}

/**
 * Set default pot headers
 *
 * @param {object} options
 *
 * @return {object}
 */
function setHeaders (options) {
  if (!options.headers) {
    options.headers = {};
  }

  if (options.bugReport) {
    options.headers['Report-Msgid-Bugs-To'] = options.bugReport;
  }

  if (options.lastTranslator) {
    options.headers['Last-Translator'] = options.lastTranslator;
  }

  if (options.team) {
    options.headers['Language-Team'] = options.team;
  }

  if (options.defaultHeaders && !Object.prototype.hasOwnProperty.call(options.headers, 'X-Poedit-KeywordsList')) {
    options.headers['X-Poedit-KeywordsList'] = keywordsListStrings(options.gettextFunctions).join(';');
  }

  return options;
}

/**
 * Write file to disk
 *
 * @param {string} potContent
 * @param {object} options
 */
function writePot (potContent, options) {
  fs.writeFileSync(options.destFile, potContent);
}

/**
 * Constructor
 * @param {object} options
 * @return {string}
 */
function wpPot (options) {
  // Reset states
  let translations = {};

  // Set options
  options = setDefaultOptions(options);

  // Find and sort file paths
  const files = pathSort(matched.sync(options.src, options.globOpts));

  // Parse files
  for (const file of files) {
    const filecontent = fs.readFileSync(file).toString();
    const translationParser = new TranslationParser(options);
    translations = translationParser.parseFile(filecontent, file, translations);
  }

  options = setHeaders(options);

  const potMaker = new PotMaker(options);
  const potContents = potMaker.generatePot(translations);

  if (options.writeFile) {
    writePot(potContents, options);
  }

  return potContents;
}

module.exports = wpPot;


/***/ }),

/***/ 6605:
/***/ ((module) => {

"use strict";
/* eslint-env node */


class PotMaker {
  constructor (options) {
    this.options = options;
  }

  /**
   * Check if variable is a empty object
   *
   * @param  {object}  obj
   *
   * @return {boolean}
   */
  static isEmptyObject (obj) {
    return Object.keys(obj).length === 0;
  }

  /**
   * Escape unescaped double quotes
   *
   * @param {string} text
   * @return string
   */
  static escapeQuotes (text) {
    text = text.replace(/\\([\s\S])|(")/g, '\\$1$2');
    return text;
  }

  /**
   * Get msgid lines in pot format
   *
   * @param {string}  msgid
   * @param {Boolean} [plural]
   *
   * @return {Array}
   */
  static getPotMsgId (msgid, plural) {
    const output = [];
    const idKey = (plural ? 'msgid_plural' : 'msgid');

    if (msgid) {
      msgid = PotMaker.escapeQuotes(msgid);

      if (/\n/.test(msgid)) {
        output.push(`${idKey} ""`);
        const rows = msgid.split(/\n/);

        for (let rowId = 0; rowId < rows.length; rowId++) {
          const lineBreak = rowId === (rows.length - 1) ? '' : '\\n';

          output.push(`"${rows[rowId] + lineBreak}"`);
        }
      } else {
        output.push(`${idKey} "${msgid}"`);
      }
    }
    return output;
  }

  /**
   * Get msgstr lines in pot format
   *
   * @param {Boolean} plural
   *
   * @return {Array}
   */
  static getPotMsgStr (plural) {
    if (!plural) {
      return ['msgstr ""\n'];
    } else {
      return ['msgstr[0] ""', 'msgstr[1] ""\n'];
    }
  }

  /**
   * Write translation to array with pot format.
   *
   * @param {object} translations
   * @param {bool}   noFilePaths
   *
   * @return {Array}
   */
  static translationToPot (translations, noFilePaths) {
    // Write translation rows.
    let output = [];

    if (translations) {
      for (const translationElement of Object.keys(translations)) {
        if (translations[translationElement].comment) {
          for (const comment of translations[translationElement].comment) {
            output.push(`#. ${comment}`);
          }
        }

        if (!noFilePaths) {
          // Unify paths for Unix and Windows
          output.push(`#: ${translations[translationElement].info.replace(/\\/g, '/')}`);
        }

        if (translations[translationElement].msgctxt) {
          output.push(`msgctxt "${PotMaker.escapeQuotes(translations[translationElement].msgctxt)}"`);
        }

        output = output.concat(PotMaker.getPotMsgId(translations[translationElement].msgid));

        output = output.concat(PotMaker.getPotMsgId(translations[translationElement].msgid_plural, true));

        output = output.concat(PotMaker.getPotMsgStr(Boolean(translations[translationElement].msgid_plural)));
      }
    }

    return output;
  }

  /**
   * Sort object by key name
   *
   * @param {object} obj
   */
  sortObject (obj) {
    return Object.keys(obj).sort().reduce(function (result, key) {
      result[key] = obj[key];
      return result;
    }, {});
  }

  /**
   * Geneate pot contents
   *
   * @param {object} translations
   *
   * @return {string}
   */
  generatePot (translations) {
    const year = new Date().getFullYear();

    let contents = (
      `# Copyright (C) ${year} ${this.options.package}
# This file is distributed under the same license as the ${this.options.package} package.
msgid ""
msgstr ""
"Project-Id-Version: ${this.options.package}\\n"
"MIME-Version: 1.0\\n"
"Content-Type: text/plain; charset=UTF-8\\n"
"Content-Transfer-Encoding: 8bit\\n"\n`);

    if (this.options.headers && !PotMaker.isEmptyObject(this.options.headers)) {
      this.options.headers = this.sortObject(this.options.headers);

      for (const key of Object.keys(this.options.headers)) {
        contents += `"${key}: ${this.options.headers[key]}\\n"\n`;
      }
    }

    contents += '"Plural-Forms: nplurals=2; plural=(n != 1);\\n"\n';
    contents += '\n';

    const translationLines = PotMaker.translationToPot(translations, this.options.noFilePaths);
    contents += translationLines.join('\n');

    return contents;
  }
}

module.exports = PotMaker;


/***/ }),

/***/ 72:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/* eslint-env node */


const path = __webpack_require__(5622);
const Engine = __webpack_require__(2742);
const parser = new Engine({
  parser: {
    extractDoc: true
  },
  ast: {
    withPositions: true
  },
  lexer: {
    short_tags: true
  }
});

function objectHas (obj, key) {
  if (!obj || typeof obj !== 'object') return false;
  return Object.prototype.hasOwnProperty.call(obj, key);
}

function replaceAll (string, search, replace) {
  return string.split(search).join(replace);
}

class TranslationParser {
  constructor (options) {
    this.options = options;
    this.translations = [];
    this.comments = {};
  }

  /**
   * Parse theme or plugin meta data from file header
   *
   * @param {Array} headers
   * @param {string} filecontent
   * @param {string} filename
   */
  parseFileHeader (headers, filecontent, filename) {
    const _this = this;
    const lines = filecontent.match(/[^\r\n]+/g);

    if (lines) {
      lines.splice(30);

      lines.forEach(function (lineContent, line) {
        headers.forEach(function (header, index) {
          const regex = new RegExp('^(?:[ \t]*<?php)?[ \t/*#@]*' + header + ':(.*)$', 'i');
          const match = regex.exec(lineContent);

          if (match) {
            headers.splice(index, 1);
            const headerValue = match[1].replace(/\s*(?:\*\/|\?>).*/, '').trim();

            const translationCall = {
              args: [headerValue],
              filename,
              line: line + 1,
              method: ''
            };

            _this.addTranslation(translationCall);
          }
        });
      });
    }
  }

  /**
   * Parse comment AST
   *
   * @param  {object} commentAst
   */
  parseComment (commentAst) {
    let commentRegexp;
    if (commentAst.kind === 'commentblock') {
      commentRegexp = new RegExp(`(?:\\/\\*)?[\\s*]*${this.options.commentKeyword}(.*)\\s*(?:\\*\\/)$`, 'im');
    } else {
      commentRegexp = new RegExp(`^\\/\\/\\s*${this.options.commentKeyword}(.*)$`, 'im');
    }
    const commentParts = commentRegexp.exec(commentAst.value);

    if (commentParts) {
      let lineNumber = commentAst.loc.end.line;
      if (commentAst.loc.end.column === 0) {
        lineNumber--;
      }

      this.comments[lineNumber] = commentParts[1];
    }
  }

  /**
   * Parse arguments in a function call
   *
   * @param {Array} args
   *
   * @return {Array}
   */
  static parseArguments (args) {
    const argsArray = [];
    for (const arg of args) {
      if (arg.kind === 'propertylookup') {
        argsArray.push(`$${arg.what.name}->${arg.offset.name}`);
      } else if (arg.kind === 'staticlookup') {
        argsArray.push(`$${arg.what.name}::${arg.offset.name}`);
      } else if (arg.kind === 'variable') {
        argsArray.push(`$${arg.name}`);
      } else if (arg.kind === 'name' && arg.resolution === 'uqn') {
        argsArray.push(arg.name);
      } else {
        argsArray.push(arg.value);
      }
    }

    return argsArray;
  }

  /**
   * Get context argument position
   *
   * @param {string} method
   *
   * @return {number}
   */
  getContextPos (method) {
    return this.options.functionCalls.contextPosition[method] - 1;
  }

  /**
   * Generate a object for a translation
   *
   * @param {object} translationCall
   * @return {object}
   */
  generateTranslationObject (translationCall) {
    const translationObject = {
      info: `${translationCall.filename}:${translationCall.line}`,
      msgid: translationCall.args[0],
      comment: []
    };

    if (translationCall.comment) {
      translationObject.comment.push(this.options.commentKeyword + translationCall.comment);
    }

    if (objectHas(this.options.functionCalls.pluralPosition, translationCall.method)) {
      translationObject.msgid_plural = translationCall.args[1];
    }

    if (objectHas(this.options.functionCalls.contextPosition, translationCall.method)) {
      const contextKey = this.getContextPos(translationCall.method);
      translationObject.msgctxt = translationCall.args[contextKey];
    }

    return translationObject;
  }

  /**
   * Generate key to match duplicate translations
   *
   * @param {object} translationObject
   * @return {string}
   */
  static generateTranslationKey (translationObject) {
    return `${translationObject.msgid}${(translationObject.msgctxt)}`;
  }

  /**
   * Add translation call to array
   *
   * @param {object} translationCall
   */
  addTranslation (translationCall) {
    if (translationCall.args) {
      const translationObject = this.generateTranslationObject(translationCall);

      const translationKey = TranslationParser.generateTranslationKey(translationObject);
      if (!this.translations[translationKey]) {
        this.translations[translationKey] = translationObject;
      } else {
        this.translations[translationKey].info += `, ${translationObject.info}`;

        if (translationObject.msgid_plural) {
          this.translations[translationKey].msgid_plural = translationObject.msgid_plural;
        }

        if (translationObject.comment[0]) {
          this.translations[translationKey].comment.push(translationObject.comment[0]);
        }
      }
    }
  }

  getComment (lineNumber) {
    const linesWithComment = Object.keys(this.comments);
    if (!linesWithComment) {
      return null;
    }

    if (linesWithComment[0] > lineNumber) {
      return null;
    }

    let comment;
    if (lineNumber - linesWithComment[0] > 2) {
      delete this.comments[linesWithComment[0]];
      comment = this.getComment(lineNumber);
    } else {
      comment = this.comments[linesWithComment[0]];
      delete this.comments[linesWithComment[0]];
    }

    if (comment) {
      comment = comment.replace(/\s+$/, '');
    }

    return comment;
  }

  /**
   * Check if ast is a valid function call
   *
   * @param {object} ast
   *
   * @return {string|null}
   */
  validFunctionCall (ast) {
    if (ast.kind === 'call') {
      let methodName = ast.what.name;

      if (ast.what.kind === 'propertylookup' && ast.what.what.kind === 'variable') {
        methodName = ['$', ast.what.what.name, '->', ast.what.offset.name].join('');
      } else if (ast.what.kind === 'name' && ast.what.resolution === 'fqn') {
        methodName = ast.what.name.replace(/^\\/, '');
      }

      if (this.options.functionCalls.valid.indexOf(methodName) !== -1) {
        return methodName;
      }
    }

    return null;
  }

  validArgs (methodName, args) {
    if (args[0] && args[0].kind !== 'string') {
      return false;
    }

    if (objectHas(this.options.functionCalls.pluralPosition, methodName) && args[1] && args[1].kind !== 'string') {
      return false;
    }

    return true;
  }

  /**
   * Parse the AST code tree
   *
   * @param {object} ast
   * @param {string} filename
   */
  parseCodeTree (ast, filename) {
    if (!ast) {
      return;
    }

    if (ast.comments) {
      for (const comment of ast.comments) {
        this.parseComment(comment);
      }
    }

    if (Array.isArray(ast)) {
      for (const child of ast) {
        this.parseCodeTree(child, filename);
      }
      return;
    }

    const methodName = this.validFunctionCall(ast);

    if (methodName) {
      const args = TranslationParser.parseArguments(ast.arguments);

      if ((!this.options.domain || this.options.domain === args[args.length - 1]) && this.validArgs(methodName, ast.arguments)) {
        const translationCall = {
          args,
          filename,
          line: ast.loc.start.line,
          method: methodName,
          comment: this.getComment(ast.loc.start.line)
        };

        this.addTranslation(translationCall);
      }
    } else {
      // List can not be in alphabetic order, otherwise it will not be ordered by occurence in code.
      const childrenContainingCalls = [
        'arguments',
        'alternate',
        'body',
        'catches',
        'children',
        'expr',
        'expression',
        'expressions',
        'trueExpr',
        'falseExpr',
        'items',
        'key',
        'left',
        'right',
        'value',
        'what'
      ];

      for (const child of childrenContainingCalls) {
        if (ast[child]) {
          this.parseCodeTree(ast[child], filename);
        }
      }
    }
  }

  /**
   * Parse PHP file
   *
   * @param {string} filecontent
   * @param {string} filePath
   * @param {object} existingTranslations
   *
   * @return {Array}
   */
  parseFile (filecontent, filePath, existingTranslations) {
    if (existingTranslations === undefined) {
      existingTranslations = {};
    }

    this.translations = existingTranslations;

    const filename = path.relative(this.options.relativeTo || path.dirname(this.options.destFile || __filename), filePath).replace(/\\/g, '/');

    if (this.options.metadataFile === filename) {
      this.parseFileHeader(['Plugin Name', 'Theme Name', 'Description', 'Author', 'Author URI', 'Plugin URI', 'Theme URI'], filecontent, filename);
    }

    if (!this.options.ignoreTemplateNameHeader) {
      this.parseFileHeader(['Template Name'], filecontent, filename);
    }

    // Skip file if no translation functions is found
    const validFunctionsInFile = new RegExp(replaceAll(this.options.functionCalls.valid.join('|'), '$', '\\$'));

    if (validFunctionsInFile.test(filecontent)) {
      try {
        const ast = parser.parseCode(filecontent, filename);
        this.parseCodeTree(ast, filename);
      } catch (e) {
        e.message += ` | Unable to parse ${filename}`;
        throw e;
      }
    }

    return this.translations;
  }
}

module.exports = TranslationParser;


/***/ }),

/***/ 2940:
/***/ ((module) => {

// Returns a wrapper function that returns a wrapped callback
// The wrapper function should do some stuff, and return a
// presumably different callback function.
// This makes sure that own properties are retained, so that
// decorations and such are not lost along the way.
module.exports = wrappy
function wrappy (fn, cb) {
  if (fn && cb) return wrappy(fn)(cb)

  if (typeof fn !== 'function')
    throw new TypeError('need wrapper function')

  Object.keys(fn).forEach(function (k) {
    wrapper[k] = fn[k]
  })

  return wrapper

  function wrapper() {
    var args = new Array(arguments.length)
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i]
    }
    var ret = fn.apply(this, args)
    var cb = args[args.length-1]
    if (typeof ret === 'function' && ret !== cb) {
      Object.keys(cb).forEach(function (k) {
        ret[k] = cb[k]
      })
    }
    return ret
  }
}


/***/ }),

/***/ 2357:
/***/ ((module) => {

"use strict";
module.exports = require("assert");

/***/ }),

/***/ 3129:
/***/ ((module) => {

"use strict";
module.exports = require("child_process");

/***/ }),

/***/ 8614:
/***/ ((module) => {

"use strict";
module.exports = require("events");

/***/ }),

/***/ 5747:
/***/ ((module) => {

"use strict";
module.exports = require("fs");

/***/ }),

/***/ 2087:
/***/ ((module) => {

"use strict";
module.exports = require("os");

/***/ }),

/***/ 5622:
/***/ ((module) => {

"use strict";
module.exports = require("path");

/***/ }),

/***/ 1669:
/***/ ((module) => {

"use strict";
module.exports = require("util");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(__webpack_module_cache__[moduleId]) {
/******/ 			return __webpack_module_cache__[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	__webpack_require__.ab = __dirname + "/";/************************************************************************/
/******/ 	// module exports must be returned from runtime so entry inlining is disabled
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(2932);
/******/ })()
;
//# sourceMappingURL=index.js.map