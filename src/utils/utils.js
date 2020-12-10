const ora = require('ora');

async function spinner(options, cb) {
  let opts = options;
  if (typeof options === 'string') {
    opts = { text: options, discardStdin: false };
  } else {
    opts.discardStdin = false;
  }
  const s = ora(opts).start();
  try {
    const result = await cb();
    s.succeed();
    return result;
  } catch (error) {
    s.fail();
    throw error;
  }
}

module.exports = {
  spinner
}
