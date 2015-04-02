function App() {
    who = {
        name: 'y app'
    };

    this.hello = function() {
        return 'hello ' + who.name;
    }

    this.goodbye = function() {
        return 'goodbye ' + who.name;

    }
}

