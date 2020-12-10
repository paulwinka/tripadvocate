const bcrypt = require('bcrypt');
const password = 'password';
const hash = '$2b$10$cvRM/1RqNyY.Aldxd.ehvOMFI2ai/1BqDZVs1dBPtjW15Uym6cvy.';

bcrypt.compare(password, hash, (err, result) => {
  if (err) {
    console.error(err);
  } else {
    console.log(password);
    console.log(hash);
    console.log(result);
  }
});

// (async () => {
//   try {
//     const result = await bcrypt.compare(password, hash);
//     console.log(password);
//     console.log(hash);
//     console.log(result);
//   } catch (err) {
//     console.error(err);
//   }
// })();
