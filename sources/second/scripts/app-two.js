function App() {
    who = {
        name: 'second app'
    };

    this.hello = function() {
        return 'hello ' + who.name;
    }
}

