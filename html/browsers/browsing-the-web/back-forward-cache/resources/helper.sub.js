// This Document is opened using `window.open()` with 'noopener' option by
// the main testharness Window and
// writes the result back to the main Window via `localStorage`.
// This is because the current test runners expect the top-level testharness
// Document is never unloaded in the middle of a test.

window.prefixedLocalStorage = new PrefixedLocalStorageResource({
  close_on_cleanup: true
});

function startRecordingEvents(eventNames) {
  window.testObservedEvents = [];
  for (const eventName of eventNames) {
    window.addEventListener(eventName, event => {
      let result = eventName;
      if (event.persisted) {
        result += '.persisted';
      }
      if (eventName === 'visibilitychange') {
        result += '.' + document.visibilityState;
      }
      prefixedLocalStorage.pushItem('observedEvents', 'window.' + result);
    });
    document.addEventListener(eventName, () => {
      let result = eventName;
      if (eventName === 'visibilitychange') {
        result += '.' + document.visibilityState;
      }
      prefixedLocalStorage.pushItem('observedEvents', 'document.' + result);
    });
  }
}

function runTest(onStart, onBackNavigated) {
  window.addEventListener('load', () => {
    if (prefixedLocalStorage.getItem('state') === null) {
      prefixedLocalStorage.setItem('state', 'started');

      // Navigate after this document is fully loaded.
      // Calling
      // location.href = 'resources/back.html';
      // synchronously here seems to cause `history.back()` on `back.html` to go
      // back to the previous page of this page, not this page, on Firefox.
      setTimeout(() => {
        window.addEventListener('pageshow', (() => {
          onBackNavigated(
            true,
            prefixedLocalStorage.getPushedItems('observedEvents'));
        }));
        onStart();
      }, 100);
    } else {
      onBackNavigated(
        false,
        prefixedLocalStorage.getPushedItems('observedEvents'));
    }
  });
}

const originParam = new URL(location.href).searchParams.get('origin');

const origin =
  originParam === 'same-origin' ? 'http://{{host}}:{{ports[http][0]}}' :
  originParam === 'same-site' ? 'http://{{host}}:{{ports[http][1]}}' :
  'http://{{hosts[alt][www]}}:{{ports[http][0]}}'; // cross-site

const backUrl =
  origin +
  '/html/browsers/browsing-the-web/back-forward-cache/resources/back.html';
