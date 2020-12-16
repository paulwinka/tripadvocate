$(() => {
  // alert($('.delete-place-list').length);
  // alert($('.delete-place-lisst').length);
  //BEGIN
  // WHEN SEARCH BOX SUBMITTED, CHANGES PAGE USING PARTIALS TO SHOW THE RESULTS WITHIN THEN "SEARCH RESULTS'"
  //this is for the login form.
  $('form.needs-validation').on('submit', (evt) => {
    if (!evt.target.checkValidity()) {
      evt.preventDefault();
      evt.stopPropagation();
    }
    $(evt.target).addClass('was-validated');
  });

  $(document).on('click', '.delete-place-list', (evt) => {
    const button = $(evt.currentTarget);
    const id = button.data('id');
    const name = button.data('name');

    // const id = $(evt.target).data('id');
    // const name = $(evt.target).data('name');
    // bootbox.alert("This is the default alert!");
    bootbox.confirm({
      title: 'Delete place',
      message: `Are you sure you want to delete place with id of ${id} and title of ${name}?`,
      buttons: {
        cancel: {
          label: '<i class="fa fa-times"></i> Cancel',
        },
        confirm: {
          label: '<i class="fa fa-check"></i> Confirm',
        },
      },
      callback: (result) => {
        console.log('This was logged in the callback: ' + result);
        if (result) {
          $.ajax({
            method: 'DELETE',
            url: `/api/place/${id}`,
            dataType: 'json',
          })
            .done((res) => {
              if (res.error) {
                alert(res.error);
              } else {
                button.parents('.col').remove();
              }
              // alert(res);
              // window.location.reload();
              //send to list instead since item will not be there;
            })
            .fail((xhr, textStatus, err) => {
              alert(`${textStatus}\n${err}`);
            });
        }
      },
    });
  });

  $(document).on('click', '.delete-review-list', (evt) => {
    const button = $(evt.currentTarget);
    const id = button.data('id');
    const name = button.data('name');

    // const id = $(evt.target).data('id');
    // const name = $(evt.target).data('name');
    // bootbox.alert("This is the default alert!");
    bootbox.confirm({
      title: 'Delete review',
      message: `Delete review for ${name}?`,
      buttons: {
        cancel: {
          label: '<i class="fa fa-times"></i> Cancel',
        },
        confirm: {
          label: '<i class="fa fa-check"></i> Confirm',
        },
      },
      callback: (result) => {
        console.log('This was logged in the callback: ' + result);
        if (result) {
          $.ajax({
            method: 'DELETE',
            url: `/api/review/${id}/admin`,
            dataType: 'json',
          })
            .done((res) => {
              if (res.error) {
                alert(res.error);
              } else {
                button.parents('.col-12').remove();
              }
              // alert(res);
              // window.location.reload();
              //send to list instead since item will not be there;
            })
            .fail((xhr, textStatus, err) => {
              alert(`${textStatus}\n${err}`);
            });
        }
      },
    });
  });
  // DELETE FROM LIST
  // $('.delete-place-from-list').on('click', (evt) => {
  //   const id = $(evt.target).data('id');
  //   const name = $(evt.target).data('name');
  //   // bootbox.alert("This is the default alert!");
  //   bootbox.confirm({
  //     title: 'Delete place',
  //     message: `Are you sure you want to delete place with id of ${id} and title of ${name}?`,
  //     buttons: {
  //       cancel: {
  //         label: '<i class="fa fa-times"></i> Cancel',
  //       },
  //       confirm: {
  //         label: '<i class="fa fa-check"></i> Confirm',
  //       },
  //     },
  //     callback: (result) => {
  //       console.log('This was logged in the callback: ' + result);
  //       if (result) {
  //         $.ajax({
  //           method: 'DELETE',
  //           url: `/api/place/${id}`,
  //           dataType: 'json',
  //         })
  //           .done((res) => {
  //             // alert(res);
  //             window.location.reload();
  //             //send to list instead since item will not be there;
  //           })
  //           .fail((xhr, textStatus, err) => {
  //             alert(`${textStatus}\n${err}`);
  //           });
  //       }
  //     },
  //   });
  // });

  // OLD ADD PLACE FORM MODAL HERE
  // $('#add-place-form-modal').on('submit', (evt) => {
  //   evt.preventDefault();
  //   const formData = $('#add-place-form-modal').serialize();
  //   console.log(formData);
  //   $.ajax({
  //     method: 'POST',
  //     url: '/api/place',
  //     data: formData,
  //     dataType: 'json',
  //   })
  //     .done((res) => {
  //       if (res.error) {
  //         $('#add-place-form-modal output').html(res.error);
  //       } else {
  //         window.location = new URL(`/place/${res.value._id}`, window.location.href);
  //       }
  //     })
  //     .fail((xhr, textStatus, err) => {
  //       $('#add-place-form-modal output').html(`${textStatus}\n{err}`);
  //     });
  // });
  // NEW ADD PLACE FORM MODAL HERE
  $('#add-review-form').on('submit', (evt) => {
    evt.preventDefault();
    const id = $('#place_id').val();
    const formData = $('#add-review-form').serialize();
    $.ajax({
      method: 'POST',
      url: `/api/review/${id}/add`,
      data: formData,
    })
      .done((res) => {
        if (res.error) {
          $('#add-review-form output').html(
            `${res.error}\n<a class="text-danger text-decoration-underline" href="/review/${res.reviewMade}">Click here to edit the review!</a>`
          );
        } else {
          window.location = new URL(`/place/${id}`, window.location.href);
        }
      })
      .fail((xhr, textStatus, err) => {
        $('#add-review-form output').html(`${textStatus}\n{err}`);
      });
  });

  $('#add-place-form-modal').on('submit', (evt) => {
    evt.preventDefault();
    const form = $('form')[0];
    const formData = new FormData(form);
    console.log(formData);
    // const formData = $('#add-pet-form').serialize();
    $.ajax({
      method: 'POST',
      url: '/api/place',
      data: formData,
      dataType: 'json',
      processData: false,
      contentType: false,
    })
      .done((res) => {
        if (res.error) {
          $('#mainError').html(res.error);
        } else {
          window.location = new URL(`/place/admin`, window.location.href);
        }
      })
      .fail((xhr, textStatus, err) => {
        $('#add-pet-form output').html(`${textStatus}\n{err}`);
      });
  });

  $('#uploaded_file').on('change', () => {
    preview();
    $('#image_preview').removeClass('d-none').addClass('d-flex').addClass('flex-column');
  });

  function preview() {
    pet_image.src = URL.createObjectURL(event.target.files[0]);
  }

  // $('#search-place-form').on('submit', (evt) => {
  //   evt.preventDefault();
  //   const formData = $('#search-place-form').serialize();
  //   $.ajax({
  //     method: 'GET',
  //     url: 'api/place',
  //     data: formData,
  //     // dataType: 'json',
  //   })
  //     .done((res) => {
  //       $('#searchResults').html(res);
  //     })
  //     .fail((xhr, textStatus, err) => {
  //       alert('fail');
  //     });
  // });

  // $('#search-place-form').on('submit', (evt) => {
  //   evt.preventDefault();
  //   const formData = $('#search-place-form').serialize();
  //   $.ajax({
  //     method: 'GET',
  //     url: 'api/place',
  //     data: formData,
  //     // dataType: 'json',
  //   })
  //     .done((res) => {
  //       $('#searchResults').html(res);
  //     })
  //     .fail((xhr, textStatus, err) => {
  //       alert('fail');
  //     });
  // });

  $('#search-review-form').on('submit', (evt) => {
    evt.preventDefault();
    const formData = $('#search-review-form').serialize();
    $.ajax({
      method: 'GET',
      url: '/review',
      data: formData,
      // dataType: 'json',
    })
      .done((res) => {
        $('#searchResults').html(res);
      })
      .fail((xhr, textStatus, err) => {
        alert('fail');
      });
  });
  // $('#search-user-form').on('submit', (evt) => {
  //   evt.preventDefault();
  //   const formData = $('#search-user-form').serialize();
  //   $.ajax({
  //     method: 'GET',
  //     url: '/user',
  //     data: formData,
  //     // dataType: 'json',
  //   })
  //     .done((res) => {
  //       $('#searchResults').html(res);
  //     })
  //     .fail((xhr, textStatus, err) => {
  //       alert('fail');
  //       $('#add-product-form output').html(`${textStatus}\n${err}`);
  //     });
  // });
  // CHANGE CATEGORY OF THE PLACE AFTER DROPDOWN CHANGED IN PLACES LIST VIEW.
  $('#category-drop').on('change', (evt) => {
    $('#search-place-form').trigger('submit');
  });
  $('#sortBy').on('change', (evt) => {
    $('#search-place-form').trigger('submit');
  });
  // CHANGE PAGINATION AFTER DROP DOWN CHANGED IN LIST VIEW.
  $('#pageSize').on('change', (evt) => {
    $('#search-place-form').trigger('submit');
  });
  $('#pageSize').on('change', (evt) => {
    $('#search-user-form').trigger('submit');
  });
  $('#pageSize').on('change', (evt) => {
    $('#search-review-form').trigger('submit');
  });

  $('.delete-review-from-list').on('click', (evt) => {
    const id = $(evt.target).data('id');
    const title = $(evt.target).data('title');
    evt.preventDefault();
    bootbox.confirm({
      title: 'Delete review',
      message: `Are you sure you want to delete review with id of ${id} and title of ${title}?`,
      buttons: {
        cancel: {
          label: '<i class="fa fa-times"></i> Cancel',
        },
        confirm: {
          label: '<i class="fa fa-check"></i> Confirm',
        },
      },
      callback: (result) => {
        console.log('This was logged in the callback: ' + result);
        if (result) {
          $.ajax({
            method: 'DELETE',
            url: `/api/review/${id}`,
            dataType: 'json',
          })
            .done((res) => {
              // alert(res);
              window.location.reload();
            })
            .fail((xhr, textStatus, err) => {
              alert(`${textStatus}\n${err}`);
            });
        }
      },
    });
  });
  $(document).on('click', '.delete-user-from-list', (evt) => {
    const button = $(evt.currentTarget);
    const id = button.data('id');
    const email = button.data('email');
    evt.preventDefault();
    bootbox.confirm({
      title: 'Delete user',
      message: `Delete user (id: ${id}, ${email}?`,
      buttons: {
        cancel: {
          label: '<i class="fa fa-times"></i> Cancel',
        },
        confirm: {
          label: '<i class="fa fa-check"></i> Confirm',
        },
      },
      callback: (result) => {
        console.log('This was logged in the callback: ' + result);
        if (result) {
          $.ajax({
            method: 'DELETE',
            url: `/api/user/${id}`,
            dataType: 'json',
          })
            .done((res) => {
              if (res.error) {
                alert(res.error);
              } else {
                button.parents('.col').remove();
              }
            })
            .fail((xhr, textStatus, err) => {
              alert(`${textStatus}\n${err}`);
            });
        }
      },
    });
  });

  // DELETE FROM VIEWS BEGIN
  $('#delete-place-from-view').on('click', (evt) => {
    const id = $(evt.target).data('id');
    const title = $(evt.target).data('title');
    bootbox.confirm({
      title: 'Delete place',
      message: `Delete place with id of ${id} and name of ${title}?`,
      buttons: {
        cancel: {
          label: '<i class="fa fa-times"></i> Cancel',
        },
        confirm: {
          label: '<i class="fa fa-check"></i> Confirm',
        },
      },
      callback: (result) => {
        console.log('This was logged in the callback: ' + result);
        if (result) {
          $.ajax({
            method: 'DELETE',
            url: `/api/place/${id}`,
            dataType: 'json',
          })
            .done((res) => {
              window.location = new URL(`/place/`, window.location.href);
            })
            .fail((xhr, textStatus, err) => {
              alert(`${textStatus}\n${err}`);
            });
        }
      },
    });
  });

  $('#delete-review-from-view').on('click', (evt) => {
    const id = $(evt.target).data('id');
    const place_id = $(evt.target).data('place');
    const title = $(evt.target).data('title');
    bootbox.confirm({
      title: 'Delete review',
      message: `Delete review with id of ${id} and name of ${title}?`,
      buttons: {
        cancel: {
          label: '<i class="fa fa-times"></i> Cancel',
        },
        confirm: {
          label: '<i class="fa fa-check"></i> Confirm',
        },
      },
      callback: (result) => {
        console.log('This was logged in the callback: ' + result);
        if (result) {
          $.ajax({
            method: 'DELETE',
            url: `/api/review/${id}`,
            dataType: 'json',
          })
            .done((res) => {
              window.location = new URL(`/place/${place_id}`, window.location.href);
            })
            .fail((xhr, textStatus, err) => {
              alert(`${textStatus}\n${err}`);
            });
        }
      },
    });
  });
  $('#delete-user-from-view').on('click', (evt) => {
    const id = $(evt.target).data('id');
    const email = $(evt.target).data('email');
    bootbox.confirm({
      title: 'Delete user',
      message: `Delete user ${id},  ${email}?`,
      buttons: {
        cancel: {
          label: '<i class="fa fa-times"></i> Cancel',
        },
        confirm: {
          label: '<i class="fa fa-check"></i> Confirm',
        },
      },
      callback: (result) => {
        console.log('This was logged in the callback: ' + result);
        if (result) {
          $.ajax({
            method: 'DELETE',
            url: `/api/user/${id}`,
            dataType: 'json',
          })
            .done((res) => {
              window.location = new URL(`/user/admin`, window.location.href);
            })
            .fail((xhr, textStatus, err) => {
              alert(`${textStatus}\n${err}`);
            });
        }
      },
    });
  });

  // ADD
  $('#add-place-form').on('submit', (evt) => {
    evt.preventDefault();
    const formData = $('#add-place-form').serialize();
    console.log(formData);
    $.ajax({
      method: 'POST',
      url: '/api/place',
      data: formData,
      dataType: 'json',
    })
      .done((res) => {
        window.location = new URL(`/place/${res[0]}`, window.location.href);
      })
      .fail((xhr, textStatus, err) => {
        $('#add-place-form output').html(`${textStatus}\n{err}`);
      });
  });

  $('#edit-review-form').on('submit', (evt) => {
    evt.preventDefault();
    const id = $('#_id').val();
    const place_id = $('#place_id').val();

    const formData = $('#edit-review-form').serialize();
    console.log(formData);
    $.ajax({
      method: 'POST',
      url: `/api/review/${id}`,
      data: formData,
      dataType: 'json',
    })
      .done((res) => {
        if (res.error) {
          $('#edit-review-form output').html(res.error);
          // alert('edit');
        } else {
          window.location = new URL(`/place/${place_id}`, window.location.href);
        }
      })
      .fail((xhr, textStatus, err) => {
        $('#edit-review-form output').html(`${textStatus}\n{err.stack}`);
      });
  });

  $('#edit-review-form-admin').on('submit', (evt) => {
    evt.preventDefault();
    const id = $('#_id').val();
    const place_id = $('#place_id').val();

    const formData = $('#edit-review-form-admin').serialize();
    console.log(formData);
    $.ajax({
      method: 'POST',
      url: `/api/review/${id}/admin`,
      data: formData,
      dataType: 'json',
    })
      .done((res) => {
        if (res.error) {
          $('#edit-review-form-admin output').html(res.error);
          // alert('edit');
        } else {
          window.location = new URL(`/place/${place_id}`, window.location.href);
        }
      })
      .fail((xhr, textStatus, err) => {
        $('#edit-review-form output').html(`${textStatus}\n{err.stack}`);
      });
  });
  // $('#edit-review-form').on('submit', (evt) => {
  //   evt.preventDefault();
  //   const id = $('#review_id').val();
  //   const formData = $(evt.target).serialize();
  //   $.ajax({
  //     method: 'PUT',
  //     url: `/api/review/${id}`,
  //     data: formData,
  //     dataType: 'json',
  //   })
  //     .done((res) => {
  //       // alert(res);
  //       window.location = new URL(`/review/${id}`, window.location.href);
  //     })
  //     .fail((xhr, textStatus, err) => {
  //       $('edit-review-form output').html(`${textStatus}\n{err}`);
  //     });
  // });

  // $('#add-review-form').on('submit', (evt) => {
  //   evt.preventDefault();
  //   const formData = $(evt.target).serialize();
  //   $.ajax({
  //     method: 'POST',
  //     url: `/api/review`,
  //     dataType: 'json',
  //     data: formData,
  //   })
  //     .done((res) => {
  //       window.location = new URL(`/review/${res[0]}`, window.location.href);
  //     })
  //     .fail((xhr, textStatus, err) => {
  //       alert('fail');
  //       alert(xhr.responseText);
  //       $('#add-review-form output').html(`${textStatus}\n{err}`);
  //     });
  // });

  $('#add-user-form').on('submit', (evt) => {
    evt.preventDefault();
    const formData = $(evt.target).serialize();
    $.ajax({
      method: 'POST',
      url: `/api/user`,
      dataType: 'json',
      data: formData,
    })
      .done((res) => {
        window.location = new URL(`/user/${res[0]}`, window.location.href);
      })
      .fail((xhr, textStatus, err) => {
        $('#add-user-form output').html(`${textStatus}\n{err}`);
      });
  });

  // EDIT
  $('#edit-place-form').on('submit', (evt) => {
    evt.preventDefault();
    const id = $('#place_id').val();
    const formData = $(evt.target).serialize();
    console.log(formData);
    $.ajax({
      method: 'PUT',
      url: `/api/place/${id}`,
      dataType: 'json',
      data: formData,
    })
      .done((res) => {
        window.location = new URL(`/place/${id}`, window.location.href);
      })
      .fail((xhr, textStatus, err) => {
        $('#edit-place-form output').html(`${textStatus}\n{err}`);
      });
  });

  $('#edit-user-form').on('submit', (evt) => {
    evt.preventDefault();
    const id = $('#user_id').val();
    const formData = $(evt.target).serialize();
    $.ajax({
      method: 'PUT',
      url: `/api/user/${id}`,
      data: formData,
      dataType: 'json',
    })
      .done((res) => {
        window.location = new URL(`/user/${id}`, window.location.href);
      })
      .fail((xhr, textStatus, err) => {
        $('#edit-user-form output').html(`${textStatus}\n{err}`);
      });
  });
  // EDIT ITEMS POPUP
  // $('#add-crazy-place').on('click', (e) => {
  //   e.preventDefault();
  //   const formData = $(e.target).serialize();
  //   $('#message').dialog('open');
  //   $.ajax({ method: 'POST', url: `/api/place`, data: formData, dataType: 'json' });
  // });
  // $('#message').dialog({
  //   title: 'Add Place',
  //   autoOpen: false,
  //   modal: true,
  //   height: 500,
  //   width: 500,
  //   closeOnEscape: true,
  //   show: { effect: 'fade', duration: 1000 },
  //   // dialogClass: 'no-close',
  //   buttons: [
  //     {
  //       text: 'OK',
  //       click: () => {
  //         $('#message').dialog('close');
  //       },
  //     },
  //   ],
  // });

  $('#add-crazy-place').on('click', (e) => {
    e.preventDefault();
    $('#message').modal();
  });
  $('#edit-review-button-modal').on('click', (e) => {
    e.preventDefault();
    $('#message').modal();
  });

  $('#edit-review-form-modal').on('submit', (evt) => {
    evt.preventDefault();
    const formData = $('#edit-review-form-modal').serialize();
    console.log(formData);
    $.ajax({
      method: 'PUT',
      url: `/api/review/${id}`,
      data: formData,
      dataType: 'json',
    })
      .done((res) => {
        if (res.error) {
          $('#edit-review-form-modal output').html(res.error);
        } else {
          window.location = new URL(`/review/${id}`, window.location.href);
        }
      })
      .fail((xhr, textStatus, err) => {
        $('#edit-review-form-modal output').html(`${textStatus}\n{err}`);
      });
  });
  // view user -- step 1 of 1, show view modal;
  $('#view_user').on('show.bs.modal', (e) => {
    const id = e.relatedTarget.dataset.id;
    const first_name = e.relatedTarget.dataset.first;
    // const last_name = e.relatedTarget.dataset.last;
    // const username = e.relatedTarget.dataset.username;
    // const role = e.relatedTarget.dataset.role;
    // const city = e.relatedTarget.dataset.city;
    // const state = e.relatedTarget.dataset.state;
    // const country = e.relatedTarget.dataset.country;
    // $('[name=_id]').val(id);
    $('#stuff').html(first_name);
    // $('[name=last_name]').val(last_name);
    // $('[name=username]').val(username);
    // $('[name=role]').val(role);
    // $('[name=city]').val(city);
    // $('[name=state]').val(state);
    // $('[name=country]').val(country);
    // Do some stuff w/ it.
  });
  // add user -- step 1 of 2, show add modal;
  $('#edit_user').on('show.bs.modal', (e) => {
    const id = e.relatedTarget.dataset.id;
    const first_name = e.relatedTarget.dataset.first;
    const last_name = e.relatedTarget.dataset.last;
    const username = e.relatedTarget.dataset.username;
    const role = e.relatedTarget.dataset.role;
    const city = e.relatedTarget.dataset.city;
    const state = e.relatedTarget.dataset.state;
    const country = e.relatedTarget.dataset.country;
    $('[name=_id]').val(id);
    $('[name=first_name]').val(first_name);
    $('[name=last_name]').val(last_name);
    $('[name=username]').val(username);
    $('[name=role]').val(role);
    $('[name=city]').val(city);
    $('[name=state]').val(state);
    $('[name=country]').val(country);
  });
  // edit user -- step 1 of 2, show edit modal;
  // $('#edit_user').on('show.bs.modal', (e) => {
  //   const id = e.relatedTarget.dataset.id;
  //   const first_name = e.relatedTarget.dataset.first;
  //   const last_name = e.relatedTarget.dataset.last;
  //   const username = e.relatedTarget.dataset.username;
  //   const role = e.relatedTarget.dataset.role;
  //   const city = e.relatedTarget.dataset.city;
  //   const state = e.relatedTarget.dataset.state;
  //   const country = e.relatedTarget.dataset.country;
  //   $('[name=_id]').val(id);
  //   $('[name=first_name]').val(first_name);
  //   $('[name=last_name]').val(last_name);
  //   $('[name=username]').val(username);
  //   $('[name=role]').val(role);
  //   $('[name=city]').val(city);
  //   $('[name=state]').val(state);
  //   $('[name=country]').val(country);
  // });
  // edit user -- step 2 of 2, submit form with PUT;
  $('#edit-user-form-modal').on('submit', (e) => {
    e.preventDefault();
    const _id = $('#_id').val();
    const formData = $('#edit-user-form-modal').serialize();
    console.log(formData);
    $.ajax({
      method: 'PUT',
      url: `/api/user/${_id}`,
      data: formData,
      // dataType: 'json',
    })
      .done((res) => {
        if (res.error) {
          $('#edit-user-form-modal output').html(res.error);
        } else {
          bootbox.alert(res.message);
          window.location = new URL(`/user/admin`, window.location.href);
        }
      })
      .fail((xhr, textStatus, err) => {
        $('#edit-user-form-modal output').html(`${textStatus}\n{err}`);
      });
  });
  $('#add-place-photo-modal').on('show.bs.modal', (e) => {});
  $('#add-photo-form-modal').on('submit', (e) => {
    e.preventDefault();
    // const _id = e.relatedTarget.dataset.id;
    // const _id = $(e.target).data('id');
    const _id = $(photoBtn).data('id');
    alert(_id);
    // const id = $(evt.target).data('id');

    // const _id = $('#_id').val();
    const form = $('form')[1];
    const formData = new FormData(form);
    // const formData = new FormData($("form").get(1));
    // const formData = $("#add-photo-form-modal").serialize();
    console.log(formData);
    $.ajax({
      type: 'POST',
      url: `/api/place/upload`,
      data: formData,
      processData: false,
      contentType: false,
      success: function (r) {
        console.log('result', r);
      },
      error: function (e) {
        console.log('some error', e);
      },
    });
  });

  //END
});
