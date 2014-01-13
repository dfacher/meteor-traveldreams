if (Dreams.find().count() === 0) {
   var date = new Date(2012, 9, 8, 12, 0, 0, 0);
    
   Dreams.insert({
       activity: 'Sky diving',
       location: 'München',
       rating: 3,
       created: date,
       done: false,
   });
    
    Dreams.insert({
        activity: 'Ice diving',
        location: 'Nordics',
        rating: 1,
        created: date,
        done: false,
    });
    
}