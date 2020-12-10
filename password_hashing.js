 const bcrypt = require('bcrypt');
const password = 'password';
const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) {
    console.error(err);
  } else {
    console.log(password);
    console.log(hash);
  }
});

// (async () => {
//   try {
//     const hash = await bcrypt.hash(password, saltRounds);
//     console.log(password);
//     console.log(hash);
//   } catch (err) {
//     console.error(err);
//   }
// })();
