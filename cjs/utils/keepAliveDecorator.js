"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var React = __importStar(require("react"));
var hoist_non_react_statics_1 = __importDefault(require("hoist-non-react-statics"));
var IdentificationContext_1 = __importDefault(require("../contexts/IdentificationContext"));
var Consumer_1 = __importDefault(require("../components/Consumer"));
var Provider_1 = require("../components/Provider");
var md5_1 = __importDefault(require("./md5"));
var debug_1 = require("./debug");
var getKeyByFiberNode_1 = __importDefault(require("./getKeyByFiberNode"));
var withIdentificationContextConsumer_1 = __importDefault(require("./withIdentificationContextConsumer"));
var withKeepAliveContextConsumer_1 = __importDefault(require("./withKeepAliveContextConsumer"));
var shallowEqual_1 = __importDefault(require("./shallowEqual"));
var getKeepAlive_1 = __importDefault(require("./getKeepAlive"));
var COMMAND;
(function (COMMAND) {
    COMMAND["UNACTIVATE"] = "unactivate";
    COMMAND["UNMOUNT"] = "unmount";
    COMMAND["ACTIVATE"] = "activate";
    COMMAND["CURRENT_UNMOUNT"] = "current_unmount";
    COMMAND["CURRENT_UNACTIVATE"] = "current_unactivate";
})(COMMAND = exports.COMMAND || (exports.COMMAND = {}));
/**
 * Decorating the <KeepAlive> component, the main function is to listen to events emitted by the upper <KeepAlive> component, triggering events of the current <KeepAlive> component.
 *
 * @export
 * @template P
 * @param {React.ComponentType<any>} Component
 * @returns {React.ComponentType<P>}
 */
function keepAliveDecorator(Component) {
    var TriggerLifecycleContainer = /** @class */ (function (_super) {
        __extends(TriggerLifecycleContainer, _super);
        function TriggerLifecycleContainer(props) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            var _this = _super.apply(this, [props].concat(args)) || this;
            _this.activated = false;
            _this.ifStillActivate = false;
            // Let the lifecycle of the cached component be called normally.
            _this.needActivate = true;
            _this.lifecycle = Provider_1.LIFECYCLE.MOUNTED;
            _this.activate = function () {
                _this.activated = true;
            };
            _this.reactivate = function () {
                _this.ifStillActivate = false;
                _this.forceUpdate();
            };
            _this.isNeedActivate = function () {
                return _this.needActivate;
            };
            _this.notNeedActivate = function () {
                _this.needActivate = false;
            };
            _this.getLifecycle = function () {
                return _this.lifecycle;
            };
            _this.setLifecycle = function (lifecycle) {
                _this.lifecycle = lifecycle;
            };
            var cache = props._keepAliveContextProps.cache;
            if (!cache) {
                debug_1.warn('[React Keep Alive] You should not use <KeepAlive> outside a <Provider>.');
            }
            return _this;
        }
        TriggerLifecycleContainer.prototype.componentDidMount = function () {
            if (!this.ifStillActivate) {
                this.activate();
            }
            var _a = this.props, keepAlive = _a.keepAlive, eventEmitter = _a._keepAliveContextProps.eventEmitter;
            if (keepAlive) {
                this.needActivate = true;
                eventEmitter.emit([this.identification, COMMAND.ACTIVATE]);
            }
        };
        TriggerLifecycleContainer.prototype.componentDidCatch = function () {
            if (!this.activated) {
                this.activate();
            }
        };
        TriggerLifecycleContainer.prototype.componentWillUnmount = function () {
            var _a = this.props, getCombinedKeepAlive = _a.getCombinedKeepAlive, _b = _a._keepAliveContextProps, eventEmitter = _b.eventEmitter, isExisted = _b.isExisted;
            var keepAlive = getCombinedKeepAlive();
            if (!keepAlive || !isExisted()) {
                eventEmitter.emit([this.identification, COMMAND.CURRENT_UNMOUNT]);
                eventEmitter.emit([this.identification, COMMAND.UNMOUNT]);
            }
            // When the Provider components are unmounted, the cache is not needed,
            // so you don't have to execute the componentWillUnactivate lifecycle.
            if (keepAlive && isExisted()) {
                eventEmitter.emit([this.identification, COMMAND.CURRENT_UNACTIVATE]);
                eventEmitter.emit([this.identification, COMMAND.UNACTIVATE]);
            }
        };
        TriggerLifecycleContainer.prototype.render = function () {
            var _a = this.props, propKey = _a.propKey, keepAlive = _a.keepAlive, extra = _a.extra, getCombinedKeepAlive = _a.getCombinedKeepAlive, _b = _a._keepAliveContextProps, isExisted = _b.isExisted, storeElement = _b.storeElement, cache = _b.cache, eventEmitter = _b.eventEmitter, setCache = _b.setCache, unactivate = _b.unactivate, providerIdentification = _b.providerIdentification, wrapperProps = __rest(_a, ["propKey", "keepAlive", "extra", "getCombinedKeepAlive", "_keepAliveContextProps"]);
            if (!this.identification) {
                // We need to generate a corresponding unique identifier based on the information of the component.
                this.identification = md5_1.default("" + providerIdentification + propKey);
                // The last activated component must be unactivated before it can be activated again.
                var currentCache = cache[this.identification];
                if (currentCache) {
                    this.ifStillActivate = currentCache.activated;
                    currentCache.ifStillActivate = this.ifStillActivate;
                    currentCache.reactivate = this.reactivate;
                }
            }
            var _c = this, isNeedActivate = _c.isNeedActivate, notNeedActivate = _c.notNeedActivate, activated = _c.activated, getLifecycle = _c.getLifecycle, setLifecycle = _c.setLifecycle, identification = _c.identification, ifStillActivate = _c.ifStillActivate;
            return !ifStillActivate
                ? (React.createElement(Consumer_1.default, { identification: identification, keepAlive: keepAlive, cache: cache, setCache: setCache, unactivate: unactivate },
                    React.createElement(IdentificationContext_1.default.Provider, { value: {
                            identification: identification,
                            eventEmitter: eventEmitter,
                            keepAlive: keepAlive,
                            activated: activated,
                            getLifecycle: getLifecycle,
                            isExisted: isExisted,
                            extra: extra,
                        } },
                        React.createElement(Component, __assign({}, wrapperProps, { _container: {
                                isNeedActivate: isNeedActivate,
                                notNeedActivate: notNeedActivate,
                                setLifecycle: setLifecycle,
                                eventEmitter: eventEmitter,
                                identification: identification,
                                storeElement: storeElement,
                                keepAlive: keepAlive,
                                cache: cache,
                            } })))))
                : null;
        };
        return TriggerLifecycleContainer;
    }(React.PureComponent));
    var ListenUpperKeepAliveContainer = /** @class */ (function (_super) {
        __extends(ListenUpperKeepAliveContainer, _super);
        function ListenUpperKeepAliveContainer() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.state = {
                activated: true,
            };
            _this.getCombinedKeepAlive = function () {
                return _this.combinedKeepAlive;
            };
            return _this;
        }
        ListenUpperKeepAliveContainer.prototype.shouldComponentUpdate = function (nextProps, nextState) {
            if (this.state.activated !== nextState.activated) {
                return true;
            }
            var _a = this.props, _keepAliveContextProps = _a._keepAliveContextProps, _identificationContextProps = _a._identificationContextProps, rest = __rest(_a, ["_keepAliveContextProps", "_identificationContextProps"]);
            var nextKeepAliveContextProps = nextProps._keepAliveContextProps, nextIdentificationContextProps = nextProps._identificationContextProps, nextRest = __rest(nextProps, ["_keepAliveContextProps", "_identificationContextProps"]);
            if (!shallowEqual_1.default(rest, nextRest)) {
                return true;
            }
            if (!shallowEqual_1.default(_keepAliveContextProps, nextKeepAliveContextProps) ||
                !shallowEqual_1.default(_identificationContextProps, nextIdentificationContextProps)) {
                return true;
            }
            return false;
        };
        ListenUpperKeepAliveContainer.prototype.componentDidMount = function () {
            this.listenUpperKeepAlive();
        };
        ListenUpperKeepAliveContainer.prototype.componentWillUnmount = function () {
            this.unlistenUpperKeepAlive();
        };
        ListenUpperKeepAliveContainer.prototype.listenUpperKeepAlive = function () {
            var _this = this;
            var _a = this.props._identificationContextProps, identification = _a.identification, eventEmitter = _a.eventEmitter;
            if (!identification) {
                return;
            }
            eventEmitter.on([identification, COMMAND.ACTIVATE], this.activate = function () { return _this.setState({ activated: true }); }, true);
            eventEmitter.on([identification, COMMAND.UNACTIVATE], this.unactivate = function () { return _this.setState({ activated: false }); }, true);
            eventEmitter.on([identification, COMMAND.UNMOUNT], this.unmount = function () { return _this.setState({ activated: false }); }, true);
        };
        ListenUpperKeepAliveContainer.prototype.unlistenUpperKeepAlive = function () {
            var _a = this.props._identificationContextProps, identification = _a.identification, eventEmitter = _a.eventEmitter;
            if (!identification) {
                return;
            }
            eventEmitter.off([identification, COMMAND.ACTIVATE], this.activate);
            eventEmitter.off([identification, COMMAND.UNACTIVATE], this.unactivate);
            eventEmitter.off([identification, COMMAND.UNMOUNT], this.unmount);
        };
        ListenUpperKeepAliveContainer.prototype.render = function () {
            var _a = this.props, _b = _a._identificationContextProps, identification = _b.identification, upperKeepAlive = _b.keepAlive, getLifecycle = _b.getLifecycle, disabled = _a.disabled, name = _a.name, wrapperProps = __rest(_a, ["_identificationContextProps", "disabled", "name"]);
            var activated = this.state.activated;
            var _c = wrapperProps._keepAliveContextProps, include = _c.include, exclude = _c.exclude;
            // When the parent KeepAlive component is mounted or unmounted,
            // use the keepAlive prop of the parent KeepAlive component.
            var propKey = name || getKeyByFiberNode_1.default(this._reactInternalFiber);
            if (!propKey) {
                debug_1.warn('[React Keep Alive] <KeepAlive> components must have key or name.');
                return null;
            }
            var newKeepAlive = getKeepAlive_1.default(propKey, include, exclude, disabled);
            this.combinedKeepAlive = getLifecycle === undefined || getLifecycle() === Provider_1.LIFECYCLE.UPDATING
                ? newKeepAlive
                : identification
                    ? upperKeepAlive && newKeepAlive
                    : newKeepAlive;
            return activated
                ? (React.createElement(TriggerLifecycleContainer, __assign({}, wrapperProps, { key: propKey, propKey: propKey, keepAlive: this.combinedKeepAlive, getCombinedKeepAlive: this.getCombinedKeepAlive })))
                : null;
        };
        return ListenUpperKeepAliveContainer;
    }(React.Component));
    var KeepAlive = withKeepAliveContextConsumer_1.default(withIdentificationContextConsumer_1.default(ListenUpperKeepAliveContainer));
    return hoist_non_react_statics_1.default(KeepAlive, Component);
}
exports.default = keepAliveDecorator;
