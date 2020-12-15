$(() => {
  const outputSeen = $('#stream-data-seen')[0];
  const outputSpinner = $('#stream-data-spinner')[0];
  const output = $('#stream-data')[0];
  let seen = 0;
  // CALLS THE streamData() WHICH ADDS ALL THE ITEMS TO THE PAGE.
  window.onload = () => {
    setTimeout(streamData, 1000);
  };
  // FUNCTION DECLARATION; THIS PUTS ALL THE ITEMS ON THE PAGE.
  const streamData = () => {
    // #1 set the initial variables and find elements to use
    let chunk = [];
    // #2 actual function to put items on the page
    const showChunk = () => {
      for (const item of chunk) {
        $('#search-results').append(`
        
        <div class="col col-md-6 col-lg-4 col-xl-3 rounding-edge">
          <div class="card mb-2 rounding-edge">
            <div class="card-body m-0 p-0 d-flex flex-row justify-content-center">
              <div class="badge ${item.category == `hotel` ? `badge-light` : ``} ${
          item.category == `activity` ? `badge-info` : ``
        }${item.category == `restaurant` ? `badge-success` : ``}">${item.category}</div> 
            </div>
            <a href="/place/${item._id}"><img class="card-img-top" src="/uploads/${
          item.image ? item.image.filename : `slam.jpg`
        }" alt=""></img></a>
            <div class="card-body py-0">
              <ul class="list-group list-group-flush">
                <li class="list-group-item p-0"><a href="/place/${item._id}">${item.title}</a></li>
                <li class="list-group-item p-0">${item._id}</li>
                <li class="list-group-item p-0">${item.place.city}</li>
              </ul>
              </div>
            </div>
          </div>
          `);
        ++seen;
      }
      outputSeen.textContent = `${seen == 1 ? `1 place found` : seen + ` places found`}.`;
      // outputSeen.textContent = `${seen} items seen`;
      chunk = [];
    };

    // FUNCTION DECLARATION THAT IS ACTIVATED WITH CLICK EVENT.
    const performSearch = () => {
      seen = 0;
      $('stream-data-spinner').removeClass('d-none');
      $('#search-results').html('');
      const formData = $('#search-place-form').serialize();

      oboe('/api/review?' + formData)
        .node('![*]', (item) => {
          if (item) {
            chunk.push(item);
            if (chunk.length >= 1000) {
              showChunk(chunk);
            }
          }
          return oboe.drop;
        })
        .done((_) => {
          // show the last chunk
          showChunk(chunk);
          // hide the spinner
          outputSpinner.classList.add('d-none');
        })
        .fail((res) => {
          // show the error
          outputSeen.textContent = `ERROR: network error`;
          outputSeen.classList.add('text-danger');
          outputSpinner.classList.add('text-danger');
        });
    };
    // TO EXECUTE THE SEARCH AND CATEGORY DROP DOWN.
    performSearch();
    $('#search-review-form').on('submit', (evt) => {
      evt.preventDefault();
      performSearch();
    });
    // $('#category-drop').on('change', (evt) => {
    //   $('#search-form').trigger('submit');
    // });
    $('#sortBy').on('change', (evt) => {
      $('#search-form').trigger('submit');
    });
  };
});