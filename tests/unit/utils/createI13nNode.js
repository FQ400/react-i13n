/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
/* globals describe,it,document,beforeEach,afterEach */
'use strict';

var expect = require('expect.js');
var jsdom = require('jsdom');
var mockery = require('mockery');
var I13nNode;
var rootI13nNode = null;
var React;
var ReactTestUtils;
var createI13nNode;
var I13nUtils;
var mockData = {
    options: {},
    reactI13n: {},
    plugin: {
        name: 'test'
    },
    isViewportEnabled: false
};
var MockReactI13n = {};
var mockViewport = {}
var mockClickHandler = function () {};
MockReactI13n.getInstance = function () {
    return mockData.reactI13n;
};
describe('createI13nNode', function () {
    beforeEach(function (done) {
        jsdom.env('<html><body></body></html>', [], function (err, window) {
            global.window = window;
            global.document = window.document;
            global.navigator = window.navigator;
            global.location = window.location;

            mockery.enable({
                warnOnReplace: false,
                warnOnUnregistered: false,
                useCleanCache: true
            });

            React = require('react/addons');
            ReactTestUtils = require('react/lib/ReactTestUtils');
            
            mockery.registerMock('../libs/ReactI13n', MockReactI13n);
            mockery.registerMock('./viewport/ViewportMixin', mockViewport);
            mockery.registerMock('../utils/clickHandler', mockClickHandler);

            createI13nNode = require('../../../../dist/utils/createI13nNode');
            I13nNode = require('../../../../dist/libs/I13nNode');
            I13nUtils = require('../../../../dist/mixins/I13nUtils');
            
            rootI13nNode = new I13nNode(null, {});
            mockData.reactI13n = {
                getI13nNodeClass: function () {
                    return I13nNode;
                },
                getRootI13nNode: function () {
                    return rootI13nNode;
                },
                isViewportEnabled: function () {
                    return mockData.isViewportEnabled;
                }
            };
            
            mockViewport = {
                _detectViewport: function () {},
                _detectHidden: function () {},
                onEnterViewport: function (handler) {
                    mockViewport._handleEnterViewport = handler;
                },
                subscribeViewportEvents: function () {},
                unsubscribeViewportEvents: function () {}
            };

            done();
        });
    });

    afterEach(function () {
        delete global.window;
        delete global.document;
        delete global.navigator;
        mockery.disable();
    });

    it('should generate a component with createI13nNode', function (done) {
        var TestComponent = React.createClass({
            displayName: 'TestComponent',
            render: function() {
                return React.createElement('div');
            }
        });

        // check the initial state is correct after render
        var I13nTestComponent = createI13nNode(TestComponent);
        mockData.reactI13n.execute = function (eventName) {
            // should get a created event
            expect(eventName).to.eql('created');
            done();
        };
        expect(I13nTestComponent.displayName).to.eql('I13nTestComponent');
        var container = document.createElement('div');
        var component = React.render(React.createElement(I13nTestComponent, {i13nModel: {sec: 'foo'}}), container);
        expect(rootI13nNode.getChildrenNodes()[0].getModel()).to.eql({sec: 'foo'});
    });
    
    it('should generate a component with createI13nNode and BC for users passing data as model', function (done) {
        var TestComponent = React.createClass({
            displayName: 'TestComponent',
            render: function() {
                return React.createElement('div');
            }
        });

        // check the initial state is correct after render
        var I13nTestComponent = createI13nNode(TestComponent);
        mockData.reactI13n.execute = function (eventName) {
            // should get a created event
            expect(eventName).to.eql('created');
            done();
        };
        expect(I13nTestComponent.displayName).to.eql('I13nTestComponent');
        var container = document.createElement('div');
        var component = React.render(React.createElement(I13nTestComponent, {model: {sec: 'foo'}}), container);
        expect(rootI13nNode.getChildrenNodes()[0].getModel()).to.eql({sec: 'foo'});
    });

    it('should generate a component with createI13nNode with statics', function (done) {
        var TestComponent = React.createClass({
            displayName: 'TestComponent',
            statics: {
                foo: 'bar'
            },
            render: function() {
                return React.createElement('div');
            }
        });

        // check the initial state is correct after render
        var I13nTestComponent = createI13nNode(TestComponent);
        expect(I13nTestComponent.foo).to.eql('bar');
        done();
    });
    
    
    it('should handle the case if reactI13n doesn\'t inititalized', function () {
        var TestComponent = React.createClass({
            displayName: 'TestComponent',
            render: function() {
                return React.createElement('div');
            }
        });
        var I13nTestComponent = createI13nNode(TestComponent);
        mockData.reactI13n = null;
        var container = document.createElement('div');
        var component = React.render(React.createElement(I13nTestComponent, {}), container);
        expect(component).to.be.an('object');
    });
    
    it('should handle the case of unmount', function (done) {
        var TestComponent = React.createClass({
            displayName: 'TestComponent',
            render: function() {
                return React.createElement('div');
            }
        });
        var I13nTestComponent = createI13nNode(TestComponent);
        mockData.reactI13n.execute = function (eventName) {
            // should get a created event
            expect(eventName).to.eql('created');
            done();
        };
        var container = document.createElement('div');
        var component = React.render(React.createElement(I13nTestComponent, {}), container);
        expect(rootI13nNode.getChildrenNodes()[0]).to.be.an('object');
        React.unmountComponentAtNode(container); // unmount should remove the child from root
        expect(rootI13nNode.getChildrenNodes()[0]).to.eql(undefined);
    });
    
    it('should be able to bind click handler', function (done) {
        var TestComponent = React.createClass({
            displayName: 'TestComponent',
            render: function() {
                return React.createElement('div');
            }
        });
        mockClickHandler = function (e) {
        }
        // check the initial state is correct after render
        var I13nTestComponent = createI13nNode(TestComponent);
        mockData.reactI13n.execute = function (eventName) {
            // should get a created event
            expect(eventName).to.eql('created');
            done();
        }
        var container = document.createElement('div');
        var component = React.render(React.createElement(I13nTestComponent, {bindClickEvent: true}), container);
        expect(component).to.be.an('object');
    });
    
    it('should handle scan the links inside if autoScanLinks is enable', function (done) {
        var TestComponent = React.createClass({
            displayName: 'TestComponent',
            render: function() {
                return React.createElement("div", null, 
                    React.createElement("a", {href: "/foo"}, "foo"), 
                    React.createElement("button", null, "bar")
                );
            }
        });
        var I13nTestComponent = createI13nNode(TestComponent);
        var container = document.createElement('div');
        var executeCount = 0;
        // should get three created events
        mockData.reactI13n.execute = function (eventName, payload) {
            expect(eventName).to.eql('created');
            executeCount = executeCount + 1;
            if (executeCount === 2) {
                expect(payload.i13nNode.getText()).to.eql('foo');
            }
            if (executeCount === 3) {
                expect(payload.i13nNode.getText()).to.eql('bar');
                done();
            }
        };
        var component = React.render(React.createElement(I13nTestComponent, {scanLinks: {enable: true}}), container);
    });
    
    it('should able to use props.getI13nNode to get the nearest i13n node', function () {
        var TestComponent = React.createClass({
            displayName: 'TestComponent',
            render: function() {
                // should able to get the I13nNode we just create by createI13nNode
                // check the i13nModel here, should equal to what we pass into
                expect(this.props.i13n.getI13nNode().getModel()).to.eql({foo: 'bar'});
                return React.createElement('div');
            }
        });
        mockData.reactI13n.execute = function (eventName) {
        };
        mockData.isViewportEnabled = false;
        var I13nTestComponent = createI13nNode(TestComponent);
        var container = document.createElement('div');
        var component = React.render(React.createElement(I13nTestComponent, {i13nModel: {foo: 'bar'}}), container);
    });
    
    it('should able to use props.executeEvent to execute i13n event', function (done) {
        var TestComponent = React.createClass({
            displayName: 'TestComponent',
            render: function() {
                this.props.i13n.executeEvent('foo', {});
                return React.createElement('div');
            }
        });
        var executeCount = 0;
        mockData.reactI13n.execute = function (eventName) {
            executeCount = executeCount + 1;
            if (executeCount === 1) {
                expect(eventName).to.eql('foo');
                done();
            }
        };
        mockData.isViewportEnabled = false;
        var I13nTestComponent = createI13nNode(TestComponent);
        var container = document.createElement('div');
        var component = React.render(React.createElement(I13nTestComponent, {i13nModel: {foo: 'bar'}}), container);
    });
    
    it('should update the i13n model when component updates', function () {
        var i13nModel = {sec: 'foo'};
        var TestComponent = React.createClass({
            displayName: 'TestComponent',
            contextTypes: {
                i13n: React.PropTypes.object
            },
            render: function() {
                return React.createElement('div');
            }
        });

        // check the initial state is correct after render
        var I13nTestComponent = createI13nNode(TestComponent);
        mockData.reactI13n.execute = function (eventName) {
            // should get a created event
            expect(eventName).to.eql('created');
        };
        var container = document.createElement('div');
        var component = React.render(React.createElement(I13nTestComponent, {i13nModel: i13nModel}), container);
        i13nModel.sec = 'bar';
        component.componentWillUpdate({i13nModel: i13nModel}, null);
        expect(component._i13nNode.getModel()).to.eql(i13nModel);
    });

    it('should handle the case if we enable viewport checking', function (done) {
        var TestComponent = React.createClass({
            displayName: 'TestComponent',
            render: function() {
                return React.createElement('div');
            }
        });
        mockData.isViewportEnabled = true;
        var I13nTestComponent = createI13nNode(TestComponent);
        mockData.reactI13n.execute = function (eventName) {
            // should get a created event
            expect(eventName).to.eql('created');
        };
        var container = document.createElement('div');
        var component = React.render(React.createElement(I13nTestComponent, {}), container);
        expect(rootI13nNode.getChildrenNodes()[0].isInViewport()).to.eql(false);
        expect(component).to.be.an('object');
        mockData.reactI13n.execute = function (eventName) {
            // should get a created event
            expect(eventName).to.eql('enterViewport');
            done();
        };
        mockViewport._handleEnterViewport(); // enter the viewport
        expect(rootI13nNode.getChildrenNodes()[0].isInViewport()).to.eql(true);
    });

    it('should not cause error if we pass a undefined to createI13nNode', function () {
        var I13nTestComponent = createI13nNode(undefined);
        expect(I13nTestComponent).to.eql(undefined);
    });
    
    it('should get i13n util functions via both props and context', function (done) {
        var TestComponent = React.createClass({
            displayName: 'TestComponent',
            contextTypes: {
                i13n: React.PropTypes.object
            },
            render: function() {
                expect(this.props.i13n).to.be.an('object');
                expect(this.props.i13n.executeEvent).to.be.a('function');
                expect(this.props.i13n.getI13nNode).to.be.a('function');
                expect(this.context.i13n).to.be.an('object');
                expect(this.context.i13n.executeEvent).to.be.a('function');
                expect(this.context.i13n.getI13nNode).to.be.a('function');
                done();
                return React.createElement('div');
            }
        });

        // check the initial state is correct after render
        var I13nTestComponent = createI13nNode(TestComponent);
        mockData.reactI13n.execute = function (eventName) {
            // should get a created event
            expect(eventName).to.eql('created');
        }
        expect(I13nTestComponent.displayName).to.eql('I13nTestComponent');
        var container = document.createElement('div');
        var component = React.render(React.createElement(I13nTestComponent, {i13nModel: {sec: 'foo'}}), container);
    });
});
