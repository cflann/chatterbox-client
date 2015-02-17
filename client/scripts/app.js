// YOUR CODE HERE:
var app = {};

app.autoRefresh = true;
app.hugBottom = true;
app.lastMessageDate;
app.server = 'https://api.parse.com/1/classes/chatterbox';
app.roomname = 'lobby';

app.init = function() {
  this.addRoom('lobby');
  this.fetch();
};

app.getUrlVars = function() {
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
};

app.fetch = function() {
  $.ajax( {
    url: this.server,
    type: 'GET',
    data: {
      limit:1,
      order:"-createdAt",
      where: {
        createdAt: {
          "$gt": this.lastMessageDate
        }
      }
    },
    success: function(data) {
      this.displayMessages(data.results);
      this.update();
    }.bind(this),
    error: function() {
      console.log("ERROR");
    }.bind(this)
  });
};

app.send = function(message) {
  message = message || {
    username: this.getUrlVars()["username"],
    text: $('#message').val(),
    roomname: this.roomname
  };

  $.ajax( {
    url: this.server,
    type: 'POST',
    data: JSON.stringify(message),
    contentType: 'application/json',
    success: function(data) {
      console.log('chatterbox: Message sent');
    }.bind(this),
    error: function() {
      console.error('chatterbox: Failed to send message');
    }.bind(this)
  });
};

app.addMessage = function(message) {
  this.send(message);
};

app.addRoom = function(room) {
  $('#roomSelect').append('<button id='+room+' class="btn btn-default">' + room + '</button>');
  $('#'+room).on('click', function(e) {
    $(this).addClass('btn-active')
    e.preventDefault();
    app.roomname = room;
  });
};

app.displayMessages = function (messages) {
  _.each(messages, function(message, i) {
    if (i === 0) {
      this.lastMessageDate = message.createdAt;
    }
    var div = $('<p></p>').addClass('chat').text('@' + message.username + ': ' + message.text);
    $('#chats').append(div);
  }.bind(this));
  this.updateScroll();
};

app.update = function() {
  if (this.autoRefresh) {
    setTimeout(this.fetch.bind(this), 500);
  }
};

app.updateScroll = function() {
  var element = $('#chats');
  if (this.hugBottom) {
    element.scrollTop(element[0].scrollHeight);
  }
};

app.clearMessages = function() {
  $('#chats').html('');
};

$(document).ready(function() {
  $('#new-message').on('submit', function(e) {
    e.preventDefault();
  });

  $('#send-message').on('click', function() {
    app.send.call(app);
    $('#message').val('');
  }.bind(this));

  app.init();
});
