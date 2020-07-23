var promiseCount = 0;
function testPromise() {
  var thisPromiseCount = ++promiseCount;

  var log = document.getElementById('log');
  log.insertAdjacentHTML('beforeend', thisPromiseCount + 
      ') Started (<small>Sync code started</small>)<br/>');

  // Wir erstellen einen neuen Promise: wir versprechen den String 'result' (Wartezeit max. 3s)
  var p1 = new Promise(
    // Resolver-Funktion kann den Promise sowohl auflösen als auch verwerfen
    // reject the promise
    function(resolve, reject) {       
      log.insertAdjacentHTML('beforeend', thisPromiseCount + 
          ') Promise started (<small>Async code started</small>)<br/>');
      // nur ein Beispiel, wie Asynchronität erstellt werden kann
      window.setTimeout(
        function() {
          // We fulfill the promise !
          resolve(thisPromiseCount)
        }, Math.random() * 2000 + 1000);
    });

  // wir bestimmen, was zu tun ist, wenn der Promise fulfilled
  p1.then(
    // Loggen der Nachricht und des Wertes
    function(val) {
      log.insertAdjacentHTML('beforeend', val +
          ') Promise fulfilled (<small>Async code terminated</small>)<br/>');
    });

  log.insertAdjacentHTML('beforeend', thisPromiseCount + 
      ') Promise made (<small>Sync code terminated</small>)<br/>');
}