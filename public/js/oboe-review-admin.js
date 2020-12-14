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
        




<div class="col-12">
  <div class="card mb-1 d-flex flex-column justify-content-around">
    <div class="d-flex flex-row justify-content-start">
      <div class="card-body d-flex flex-row py-0">
        <div class="d-flex align-items-center justify-content-center">
          ${item.places && item.places[0] && item.places[0].name ? item.places[0].name : ''}
        </div>
        <div class="d-flex flex-row">
          <div class="card-body d-flex flex-row align-items-center py-0">
            <a href="/review/${item._id}">"${item.title}"</a>
          </div>
          <div class="card-body d-flex flex-row align-items-center py-0">
            Score: ${item.score}
          </div>
        </div>
        <div class="card-body d-flex flex-row justify-content-end align-items-center py-0">
          <a href="/review/edit/${
            item._id
          }/admin" id="btnEditReview" class="btn btn-primary btn-sm" title="Edit Review">
            <i class="fas fa-edit"></i> <span class="sr-only">Edit Review</span> </a>
          <button title="Delete Review" class="delete-review-list btn btn-sm btn-danger" data-id="${item._id}"
            data-name="${item.places && item.places[0] && item.places[0].name ? item.places[0].name : ''}"><i
              class="fas fa-trash"></i><span class="sr-only">Delete Review</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</div>




          `);
      ++seen;
    }
    outputSeen.textContent = `${seen == 1 ? `1 review found` : seen + ` reviews found`}.`;
    // outputSeen.textContent = `${seen} items seen`;
    chunk = [];
  };

  // FUNCTION DECLARATION THAT IS ACTIVATED WITH CLICK EVENT.
  const performSearch = () => {
    seen = 0;
    $('stream-data-spinner').removeClass('d-none');
    $('#search-results').html('');
    const formData = $('#search-review-form').serialize();

    oboe('/api/review/admin?' + formData)
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
