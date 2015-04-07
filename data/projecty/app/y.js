function App() {
    who = {
        name: 'y app'
    };

    this.hello = function() {
        return 'hello ' + who.name;
    };

    this.goodbye = function() {
        return 'goodbye ' + who.name;
    };

    this.seeYouLater = function() {
        return 'see you later ' + who.name;
    };
    
}

