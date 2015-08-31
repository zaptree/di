'use strict';

var Di = require('../index');
var assert = require('chai').assert;
var Promise = require('bluebird');

describe('Di', function(){

	it('should create an instance of the injector', function(){

		var injector = new Di();
		assert.isObject(injector, 'it should create an instance of di');

	});

	it('should create a simple value and get the value in async mode', function(){
		var injector = new Di();
		injector.set('simpleValue', 'hello');

		return injector.get('simpleValue')
			.then(function(val){
				assert.equal(val,'hello', 'it should return the value of simpleValue when resolving the promise');
			})
	});

	it('should create a object value and get the value in async mode', function(){
		var injector = new Di();
		var obj = {'hello':'world'};
		injector.set('objectValue', obj);

		return injector.get('objectValue')
			.then(function(val){
				assert.deepEqual(val, obj, 'it should return the value of objectValue when resolving the promise');
			})
	});

	it('should create a array value and get the value in async mode', function(){
		var injector = new Di();
		var arr = ['one', 'two', 'three'];
		injector.set('arrayValue', arr);

		return injector.get('arrayValue')
			.then(function(val){
				assert.deepEqual(val, arr, 'it should return the value of arrayValue when resolving the promise');
			})
	});

	it('should create a array value when a func is in the array but isValue=true and get the value in async mode', function(){
		var injector = new Di();
		var arr = [function(){ return 'world' }];
		injector.set('arrayValue', arr, true);

		return injector.get('arrayValue')
			.then(function(val){
				assert.deepEqual(val, arr, 'it should return the value of arrayValue when resolving the promise');
			})
	});

	it('should create a value with provided constructor in the array and get the value in async mode', function(){
		var injector = new Di();
		var arr = [function(){ return 'world' }];
		injector.set('arrayConstructor', arr);

		return injector.get('arrayConstructor')
			.then(function(val){
				assert.deepEqual(val, 'world', 'it should return the value of arrayConstructor when resolving the promise');
			})
	});

	it('should create a value with provided constructor with no array and get the value in async mode', function(){
		var injector = new Di();
		var arr = [function(){ return 'world' }];
		injector.set('plainConstructor', arr);

		return injector.get('plainConstructor')
			.then(function(val){
				assert.deepEqual(val, 'world', 'it should return the value of plainConstructor when resolving the promise');
			})
	});

	it('should create a async value with provided constructor get the resolved value in async mode', function(){
		var injector = new Di();
		injector.set('asyncValue', function(){
			return new Promise(function(resolve){
				setTimeout(function(){
					resolve('hello async');
				},10);
			});
		});

		return injector.get('asyncValue')
			.then(function(val){
				assert.deepEqual(val, 'hello async', 'it should return the value of asyncValue when resolving the promise');
			})
	});

	it('should create a value with provided array constructor, resolve the dependencies and get the value in async mode', function(){
		var injector = new Di();
		injector.set('simpleValue', 'hello');
		injector.set('withDependencies', [
			'simpleValue',
			function(simpleValue){
				return simpleValue +' world';
			}
		]);

		return injector.get('withDependencies')
			.then(function(val){
				assert.deepEqual(val, 'hello world', 'it should return the value of withDependencies when resolving the promise');
			})
	});

	it('should create a value with provided array constructor, resolve the async dependencies and get the value in async mode', function(){
		var injector = new Di();
		injector.set('asyncValue', function(){
			return new Promise(function(resolve){
				setTimeout(function(){
					resolve('hello async');
				},10);
			});
		});
		injector.set('withAsyncDependencies', [
			'asyncValue',
			function(asyncValue){
				return asyncValue +' world';
			}
		]);

		return injector.get('withAsyncDependencies')
			.then(function(val){
				assert.deepEqual(val, 'hello async world', 'it should return the value of withAsyncDependencies when resolving the promise');
			})
	});


	describe('createChild', function(){

		it('should create child injector and be able to get/set modules',function(){
			var injector = new Di();
			// we need to make sure it can get a module from its parent
			injector.set('simpleValue', 'hello');

			var childInjector = injector.createChild();
			childInjector.set('simpleValue2','hello2');

			var grandchildInjector = childInjector.createChild();
			grandchildInjector.set('simpleValue3','hello3');

			return Promise.all([
				grandchildInjector.get('simpleValue'),
				grandchildInjector.get('simpleValue2'),
				grandchildInjector.get('simpleValue3'),
			])
				.spread(function(simpleValue, simpleValue2, simpleValue3){
					assert.equal(simpleValue, 'hello', 'it should return the value of simpleValue');
					assert.equal(simpleValue2, 'hello2', 'it should return the value of simpleValue2');
					assert.equal(simpleValue3, 'hello3', 'it should return the value of simpleValue3');
				});


		});

	});
	describe('types', function(){


		it('should create a value specifying type and get the typed value in async mode', function(){
			var injector = new Di({
				types: {
					testType:{
						instantiate: 'static',
						factory: function(){
							return function(instance){
								instance.newProperty = 'new property';
								return instance;
							}
						}
					}
				}
			});
			injector.set('testType','typedValue', {'hello':'world'});

			return injector.get('typedValue')
				.then(function(val){
					assert.equal(val.hello,'world', 'it should have property hello with value world');
					assert.equal(val.newProperty,'new property', 'it should have property newProperty with value "new property"');
				})
		});
		describe('static',function(){
			it.only('should create a static type only once', function(){
				var injector = new Di();
				injector.set('static','random', function(){
					return Math.random();
				});

				return Promise.all([
					injector.get('random'),
					injector.get('random')
				])
					.spread(function(timestamp1, timestamp2){
						assert.equal(timestamp1, timestamp2, 'it should always return the same value for timestamps');
					});

			});
		});

	});

});