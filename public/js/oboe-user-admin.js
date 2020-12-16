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
        $('#search-results').append(`
<div class="col">
  <div class="card mb-1 d-flex flex-column flex-md-row justify-content-around">
    <div class="d-flex flex-row justify-content-start">
      <div class="d-flex flex-column flex-md-row">
        <div class="card-body d-flex flex-row">
        </div>
        <div class="card-body d-flex flex-row align-items-center">
          ${item.username}: ${item.email} ${item.role}
        </div>
      </div>
    </div>
    <div class="card-body d-flex flex-row justify-content-end align-items-center">
      <a href="/user/${item._id}" id="btnViewPlace" class="btn btn-sm btn-info" title="View User">
        <i class="fas fa-eye"></i>
        <span class="sr-only">View User</span>
      </a>
      <button title="Edit User" id="btnEditPlace" class="btn btn-primary btn-sm" 
      data-toggle="modal"
      data-target="#edit_user"
      data-id="${item._id}"
      data-first="${item.first_name}"
      data-last="${item.last_name}"
      data-username="${item.username}"
      data-role="${item.role}"
      data-city="${item.city}"
      data-state="${item.state}"
      data-country="${item.country}"
      
      >
        <i class="fas fa-edit"></i>
        <span class="sr-only">Edit User</span>
      </button>
      <button title="Delete User" class="delete-user-from-list btn btn-sm btn-danger" data-id="${item._id}"
        data-email="${item.email}">
        <i class="fas fa-trash"></i>
        <span class="sr-only">Delete User</span>
      </button>
    </div>
  </div>
</div>
        `);
        ++seen;
      }
      outputSeen.textContent = `${seen == 1 ? `1 user found` : seen + ` users found`}.`;
      // outputSeen.textContent = `${seen} items seen`;
      chunk = [];
    };

    // FUNCTION DECLARATION THAT IS ACTIVATED WITH CLICK EVENT.
    const performSearch = () => {
      seen = 0;
      $('stream-data-spinner').removeClass('d-none');
      $('#search-results').html('');
      const formData = $('#search-user-form').serialize();

      oboe('/api/user?' + formData)
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
    $('#search-user-form').on('submit', (evt) => {
      evt.preventDefault();
      performSearch();
    });
    // drop downs have submit event in main.js
});
