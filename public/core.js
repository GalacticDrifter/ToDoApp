var ToDoApp = angular.module('ToDoApp', ['ui.bootstrap']);
angular.module('ToDoApp').controller('MainCtrl', function ($scope, $http) {
    
    $scope.oneAtATime = true;
    $scope.isEditable = [];
    
	$scope.formData = {};
    $scope.itemData = {};

	// get all the todos
	$http.get('/todos')
		.success(function(data) {
			$scope.todos = data;
            
		})
		.error(function(data) {
			console.log('Error: ' + data);
		}); 
    
   // get all the items for a selected todo 
   $scope.getItems = function(id) {
    
      $http.get('/todos/'+ id +'/items')
		  .success(function(data) {
            
          $scope.items = data;
			
		  })
		  .error(function(data) {
			console.log('Error: ' + data);
	  }); 
    }; 

	// function for creating a new todo
	$scope.createTodo = function() {
		$http.post('/todos', $scope.formData)
			.success(function(data) {
				$scope.formData = {}; // clear the todo form
				$scope.todos = data;
				console.log(data);
			})
			.error(function(data) {
				console.log('Error: ' + data);
			});
	};
    
    
    // create an item on a particular todo
    $scope.createItem = function(id) {
		$http.post('/todos/' + id + '/items', $scope.itemData)
			.success(function(data) {
				$scope.itemData = {}; // clear the item form
			})
			.error(function(data) {
				console.log('Error: ' + data);
			});
	};
    
    //delete a todo
	$scope.deleteTodo = function(id) {
		$http.delete('/todos/' + id)
			.success(function(data) {
				$scope.todos = data;
			})
			.error(function(data) {
				console.log('Error: ' + data);
			});
	};
    
    //delete a item from a todo
	$scope.deleteItem = function(id) {
		$http.delete('/todos/' + id + '/items')
			.success(function(data) {
				$scope.items = data;
			})
			.error(function(data) {
				console.log('Error: ' + data);
			});
	};
    
});
