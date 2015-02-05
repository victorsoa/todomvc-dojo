/*global angular */

/**
 * The main controller for the app. The controller:
 * - retrieves and persists the model via the todoStorage service
 * - exposes the model to the template and provides event handlers
 */
angular.module('todomvc')
	.controller('TodoCtrl', function TodoCtrl($scope, $routeParams, $filter, todoStorage, $http) {
		'use strict';

		var todos = $scope.todos = todoStorage.get();

		$scope.newTodo = '';
		$scope.editedTodo = null;

		$scope.$watch('todos', function (newValue, oldValue) {
			$scope.remainingCount = $filter('filter')(todos, { completed: false }).length;
			$scope.completedCount = todos.length - $scope.remainingCount;
			$scope.allChecked = !$scope.remainingCount;
			if (newValue !== oldValue) { // This prevents unneeded calls to the local storage
				todoStorage.put(todos);
			}
		}, true);

		// Monitor the current route for changes and adjust the filter accordingly.
		$scope.$on('$routeChangeSuccess', function () {
			var status = $scope.status = $routeParams.status || '';

			$scope.statusFilter = (status === 'active') ?
				{ completed: false } : (status === 'completed') ?
				{ completed: true } : null;
		});

		$scope.addTodo = function () {
			var newTodo = $scope.newTodo.trim();
			if (!newTodo.length) {
				return;
			}

			todos.push({
				title: newTodo,
				completed: false
			});

			$scope.newTodo = '';
		};

		$scope.editTodo = function (todo) {
			$scope.editedTodo = todo;
			// Clone the original todo to restore it on demand.
			$scope.originalTodo = angular.extend({}, todo);
		};

		$scope.doneEditing = function (todo) {
			$scope.editedTodo = null;
			todo.title = todo.title.trim();

			if (!todo.title) {
				$scope.removeTodo(todo);
			}
		};

		$scope.revertEditing = function (todo) {
			todos[todos.indexOf(todo)] = $scope.originalTodo;
			$scope.doneEditing($scope.originalTodo);
		};

		$scope.removeTodo = function (todo) {
			todos.splice(todos.indexOf(todo), 1);
		};

		$scope.clearCompletedTodos = function () {
			$scope.todos = todos = todos.filter(function (val) {
				return !val.completed;
			});
		};

		$scope.markAll = function (completed) {
			todos.forEach(function (todo) {
				todo.completed = !completed;
			});
		};

		/**
		*	Import notes Mock API - Apiary
		*/
		$scope.importNotes = function(){
			// Init loading feedback
			$scope.loading = true;
			// Set API url
			var apiUrl = 'http://private-b1cc7-todomvc1.apiary-mock.com/notes';
			// Req data with $http dependence injection 
			$http.get(apiUrl)
				.success(function(data,success){
					$scope.importedTodos = data;
					if($scope.todos.length == 0){
						$scope.applyNotes(true);
						$scope.loading = false;
					}else{
						$scope.loading = false;
						$scope.actionSetNotes = true;
					}
				})
				.error(function(data){
					$scope.loading = false;
					$scope.actionSetNotes = false;
					console.log(data);
				});
		};

		/**
		*	ApplyNotes
		*/
		$scope.applyNotes = function(overwrite){
			// Set overwrite flag
			var overwrite = overwrite;

			if(overwrite){
				/**
				*	Apply and subscribe data
				*	Clear all itens in localStorage
				*/
				$scope.todos = $scope.importedTodos;
				localStorage.clear('todos-abgularjs');

			}else{
				/**
				*	Copy data imported
				*	Add itens in current todos
				*/
				var arrTodos = $scope.importedTodos;
				for(var key in arrTodos){
					$scope.todos.push(arrTodos[key]);
				}
			}
			// Hide options buttons
			$scope.actionSetNotes = false;
			// Set imported itens in localStorage
			todoStorage.put($scope.importedTodos);
			// Set todos
			todos = $scope.todos;
			$scope.newTodo = '';
		};

		/**
		*	Clear All todos in object and localStorage
		*/
		$scope.clearAllTodos = function(){
			localStorage.clear('todos-abgularjs');
			$scope.todos = [];
			// Update var todos
			todos = $scope.todos;
		};

	});
