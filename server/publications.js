Meteor.publish('dreams', function() {
    return Dreams.find();
});