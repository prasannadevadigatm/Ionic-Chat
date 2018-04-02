angular.module('starter.services', [])


.factory('ChatMsg', function($http,$window) {


  var chatFactory = {};

  chatFactory.allStories = function() {
    return $http.get('http://192.168.2.62:3000/api/all_stories');
  }

  chatFactory.all = function(id) {
    console.log(id);
    return $http.get('http://192.168.2.62:3000/api/?created_to='+id+'&token='+$window.localStorage.getItem('token'));
  }

  chatFactory.create = function(chatData) {
    console.log(chatData);
    return $http.post('http://192.168.2.62:3000/api/?token='+$window.localStorage.getItem('token'), chatData);
  }


  

  return chatFactory;


})

.factory('socketio', function($rootScope) {

  var socket = io.connect('http://192.168.2.62:3000');

  return {

    on: function(eventName, callback) {
      socket.on(eventName, function() {
        var args = arguments;
        $rootScope.$apply(function() {
          localStorage.socketID = socket.id;
          callback.apply(socket, args);
        });
      });
    },

    emit: function(eventName, data, callback) {
      socket.emit(eventName, data, function() {
        var args = arguments;
        $rootScope.apply(function() {
          if(callback) {
            localStorage.socketID = socket.id;
            callback.apply(socket, args);
          }
        });
      });
    }

  };

})
.factory('User', function($http) {

  var userFactory = {};

  userFactory.create = function(userData) {
    return $http.post('http://192.168.2.62:3000/api/signup', userData);
    // return $http({
    //         method: 'post',
    //         //url: base+url+"?access_token="+localStorage.accesstoken,
    //         url:'http://192.168.2.62:3000/api/signup',
    //         data:userData,
    //         headers: {
    //             'Content-Type': 'application/json'
    //         }
    //     });
    // .then(function(data) {
    //         //callback(data);
    //          console.log("success");
    //     })
  }

  userFactory.all = function(data) {
    return $http.post('http://192.168.2.62:3000/api/users',data);
  }



  return userFactory;

})
.factory('Auth', function($http, $q, AuthToken) {


  var authFactory = {};


  authFactory.login = function(username, password) {

    return $http.post('http://192.168.2.62:3000/api/login', {
      username: username,
      password: password
    })
    .success(function(data) {
      AuthToken.setToken(data.token);
      return data;
    })
   /*return $http({
            method: 'post',
            //url: base+url+"?access_token="+localStorage.accesstoken,
            url:'http://192.168.2.62:3000/api/login',
            data: {
      username: username,
      password: password
    },
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(function(data) {
            //callback(data);
             AuthToken.setToken(data.token);
      return data;
        })*/
  }
 
  authFactory.logout = function() {
    AuthToken.setToken();
  }

  authFactory.isLoggedIn = function() {
    if(AuthToken.getToken())
        return true;
    else
      return false;
  }

  authFactory.getUser = function() {
    if(AuthToken.getToken())
      return $http.get('http://192.168.2.62:3000/api/me');
    else
      return $q.reject({ message: "User has no token"});

  }


  return authFactory;

})


.factory('AuthToken', function($window) {

  var authTokenFactory = {};

  authTokenFactory.getToken = function() {
    return $window.localStorage.getItem('token');
  }

  authTokenFactory.setToken = function(token) {

    if(token)
      $window.localStorage.setItem('token', token);
    else
      $window.localStorage.removeItem('token');

  }

  return authTokenFactory;

})

.factory('AuthInterceptor', function($q, $location, AuthToken) {

  var interceptorFactory = {};


  interceptorFactory.request = function(config) {

    var token = AuthToken.getToken();
    console.log(token);

    if(token) {

      config.headers['x-access-token'] = token;

    }

    return config;

  };

  


  return interceptorFactory;
});