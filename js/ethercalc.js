window.EC = {
  get: (id, callback) => {
    $.get('https://ethercalc.org/' + id + '.csv.json', callback);
  }
};

EC.get('q3knnr6tfkqw', data => console.log(data));
EC.get('q3knnr6tfkqw.1', data => console.log(data));
