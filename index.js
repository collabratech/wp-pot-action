const core = require('@actions/core');
const wpPot = require('wp-pot');


// most @actions toolkit packages have async methods
async function run() {
  try {
    const source = core.getInput('source');
    const destination = core.getInput('destination');
    const text_domain = core.getInput('text-domain');

    core.info(`Starting generation of POT file ...`);

    wpPot({
      src: source,
      destFile: destination,
      domain: text_domain,
    });

    core.info(`The POT file was successfully generated.`);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
