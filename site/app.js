// Client-side filter for the notes list on the home page.
(function () {
  var input = document.getElementById('search');
  if (!input) return;
  var cards = document.querySelectorAll('.note-card');
  var modules = document.querySelectorAll('.module');
  var none = document.getElementById('no-results');

  input.addEventListener('input', function () {
    var q = input.value.trim().toLowerCase();
    var shown = 0;
    cards.forEach(function (card) {
      var match = !q || card.dataset.search.indexOf(q) !== -1;
      card.hidden = !match;
      if (match) shown++;
    });
    modules.forEach(function (m) {
      m.hidden = !m.querySelector('.note-card:not([hidden])');
    });
    none.hidden = shown !== 0;
  });
})();
