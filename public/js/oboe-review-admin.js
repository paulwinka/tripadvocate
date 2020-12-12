$(() => {
  const outputSeen = $('#stream-data-seen')[0];
  const outputSpinner = $('#stream-data-spinner')[0];
  const output = $('#stream-data')[0];
  let seen = 0;
  // CALLS THE streamData() WHICH ADDS ALL THE ITEMS TO THE PAGE.
  // window.onload = () => {
  //   setTimeout(streamData, 1000);
  // };
  // FUNCTION DECLARATION; THIS PUTS ALL THE ITEMS ON THE PAGE.
  // #1 set the initial variables and find elements to use
  let chunk = [];
  // #2 actual function to put items on the page
  const showChunk = () => {
    for (const item of chunk) {
      console.log(item);

      $('#search-results').append(`
        
<div class="col">
  <div class="card mb-1 d-flex flex-column justify-content-around">
    <div class="d-flex flex-row justify-content-start">
      <div class="card-body d-flex flex-row">
        ${
          item.places && item.places[0] && item.places[0].image
            ? `<img class="card-img-top thumbnail"
          src="/uploads/` +
              item.places[0].image.filename +
              `" alt=""></img>`
            : `<img class="card-img-top thumbnail"
          src="/uploads/black.jpg" alt=""></img>`
        }
      </div>
      <div class="d-flex align-items-center justify-content-center">
        ${item.places && item.places[0] && item.places[0].name ? item.places[0].name : ''}
      </div>
      <div class="card-body d-flex flex-row justify-content-end align-items-center">
        <a href="/review/edit/${item._id}/admin" id="btnEditReview" class="btn btn-primary btn-sm" title="Edit User"> <i
            class="fas fa-edit"></i> <span class="sr-only">Edit User</span> </a>
        <button title="Delete Place" class="delete-place-list btn btn-sm btn-danger" data-id="${item._id}"
          data-name="${item.name}"> <i class="fas fa-trash"></i> <span class="sr-only">Delete User</span>
        </button>
      </div>
    </div>
    <div class="d-flex flex-column">
      <div class="card-body d-flex flex-row align-items-center">
        ${item.title}
      </div>
      <div class="card-body d-flex flex-row align-items-center">
       Score: ${item.score}
      </div>
      <div class="card-body d-flex flex-row align-items-center">
        ${item.description}
      </div>
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
});
