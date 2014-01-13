/*To-Dos
 * 
 * 1) Router for individual dreams page and waiting for collection to load
 * 2) Security to insertCollection (p.92/93)
 * 
 */

////////// Data & Stores //////////
Meteor.subscribe('dreams');

////////// Session setters //////////

// Sort options
Session.set('sort_options', {done: 1, rating: -1});

// When editing todo text, ID of the todo
Session.set('editing_itemname', null);

// When editing todo text, ID of the todo
Session.set('editing_itemtype', null);

////////// Helpers for in-place editing //////////

// Returns an event map that handles the "escape" and "return" keys and
// "blur" events on a text input (given by selector) and interprets them
// as "ok" or "cancel".
var okCancelEvents = function (selector, callbacks) {
  var ok = callbacks.ok || function () {};
  var cancel = callbacks.cancel || function () {};

  var events = {};
  events['keyup '+selector+', keydown '+selector+', focusout '+selector] =
    function (evt) {
      if (evt.type === "keydown" && evt.which === 27) {
        // escape = cancel
        cancel.call(this, evt);

      } else if (evt.type === "keyup" && evt.which === 13 ||
                 evt.type === "focusout") {
        // blur/return/enter = ok/submit if non-empty
        var value = String(evt.target.value || "");
        if (value)
          ok.call(this, value, evt);
        else
          cancel.call(this, evt);
      }
    };
  return events;
};

var activateInput = function (input) {
  input.focus();
  input.select();
};

//////////////////// Helpers ////////////////////////////

Template.dreamItem.editing = function (itemtype) {
  return Session.equals('editing_itemname', this._id) && Session.equals('editing_itemtype', itemtype);
};

Template.dreamItem.done_class = function () {
  return this.done ? 'done' : '';
};

Template.dreamItem.done_checkbox = function () {
  return this.done ? 'checked' : '';
};

Template.dreamItem.dateToTable = function (date) {
    if(date && date.getMonth){
        var month = parseInt(date.getMonth())+1;
        if(month < 10){
            return ("0" + month.toString() + "/" + date.getFullYear());
        }
        else{
            return (month.toString() + "/" + date.getFullYear());  
        }
    }
    else {
        return '';
    }
};

Template.dreamItem.starImg = function () {
    var dream = this;
    if (dream.rating == 1) {  return "'star1.gif'";   }
    else if (dream.rating == 2) {  return "star2.gif";   }
    else if (dream.rating == 3) {  return "star3.gif";   }
    else {  return "star0.gif"; }   
};

Template.dreamItem.hasLocation = function () {
    var dream = this;
    var locProperty = (dream.location && dream.location != '');
    return locProperty;
    
};

Template.dreamItem.events({
    'click .glyphicon-ok-sign': function (e) {
      e.preventDefault();
      Dreams.update(this._id, {$set: {done: !this.done, doneDate: new Date()}});
  },

  'click .glyphicon-remove-circle': function (e) {
      e.preventDefault();
      Dreams.remove(this._id);
      Template.maps.resetMarkers();
  },
    
  'change .star-rating': function (e) {
    var rating = e.srcElement.defaultValue;
    //e.target.parentElement.className = "star-rating rating" + rating;
    Dreams.update(this._id, {$set: {rating: rating}});
  },
    'dblclick .display .activity-text': function (evt, tmpl) {
        Session.set('editing_itemname', this._id);
        Session.set('editing_itemtype', "#activity-input");
        Meteor.flush(); // update DOM before focus
        activateInput(tmpl.find("#activity-input"));
  },
    'dblclick .location .display.location-text': function (evt, tmpl) {
        Session.set('editing_itemname', this._id);
        Session.set('editing_itemtype', "#location-input");
        Meteor.flush(); // update DOM before focus
        activateInput(tmpl.find("#location-input"));
  },
    'click .glyphicon.glyphicon-map-marker': function (evt, tmpl) {
        Session.set('editing_itemname', this._id);
        Session.set('editing_itemtype', "#location-input");
        Meteor.flush(); // update DOM before focus
        activateInput(tmpl.find("#location-input"));
  },
});

Template.dreamItem.events(okCancelEvents(
  '#activity-input',
  {
    ok: function (value) {
      Dreams.update(this._id, {$set: {activity: value}});
      Session.set('editing_itemname', null);
      Session.set('editing_itemtype', null);
    },
    cancel: function () {
      Session.set('editing_itemname', null);
      Session.set('editing_itemtype', null);
    }
  }));

Template.dreamItem.events(okCancelEvents(
  '#location-input',
  {
    ok: function (value) { 
      Dreams.update(this._id, {$set: {location: value}});
      Template.maps.setMarkers(Dreams.find(this._id));
      Session.set('editing_itemname', null);
        Session.set('editing_itemtype', null);
    },
    cancel: function () {
      Session.set('editing_itemname', null);
        Session.set('editing_itemtype', null);
    }
  }));



Template.dreamList.dream = function() {
        /*var sort_by = AmplifiedSession.get('sort_by');
        var sort_options = sort_by === 1 ? {rating: 1, done: -1} : {rating: -1, done: -1};*/
        return Dreams.find({}, {sort: Session.get('sort_options')});
    }

Template.navbar.events({
    'submit form': function(e, tmpl) {
        e.preventDefault();
        if ($(e.target).find('[name=newDreamInputActivity]').val() != '' ){
            var dream = {
                activity: $(e.target).find('[name=newDreamInputActivity]').val(),
                location: '',
                created: new Date(),
                rating: 0
            }
            Dreams.insert(dream);
        }
        
    },
    
});