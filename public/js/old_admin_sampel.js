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
          <tr class="table-row">
            <td>${item.name}</td>
            <td>${item.city}</td>
            <td>${item.state || ''}</td>
            <td>${item.country}</td>
            <td></td>
            <td class="text-center">
              <a href="/user/{{user_id}}" id="btnEditPlace" class="btn btn-sm btn-info" title="View User">
                <i class="fas fa-eye"></i>
                <span class="sr-only">View User</span>
              </a>
              <a href="/user/edit/{{user_id}}" id="btnEditPlace" class="btn btn-primary btn-sm" title="Edit User">
                <i class="fas fa-edit"></i>
                <span class="sr-only">Edit User</span>
              </a>
              <button title="Delete User" class="delete-user-from-list btn btn-sm btn-danger" data-user="{{user_id}}" data-emoji="{{emoji_id}}">
                <i class="fas fa-trash"></i>
                <span class="sr-only">Delete User</span>
              </button>
            </td>
          </tr>
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

      oboe('/api/place?' + formData)
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
    $('#search-place-form').on('submit', (evt) => {
      evt.preventDefault();
      performSearch();
    });
    // drop downs have submit event in main.js
  };
});
