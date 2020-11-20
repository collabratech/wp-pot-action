const core = require('@actions/core');
const exec = require('@actions/exec');
const wpPot = require('wp-pot');


// most @actions toolkit packages have async methods
async function run() {
  try {
    const source = core.getInput('source');
    const destination = core.getInput('destination');
    const text_domain = core.getInput('text-domain');

    core.info(`Starting generation of POT file ...`);

    const pot = wpPot({
      src: source,
      destFile: destination,
      domain: text_domain,
    });

    core.info(`${pot}`);

    // Commit the generated POT file.
    await exec.exec(`git add ${destination}`);
    await exec.exec(`git commit -m "Automatically generated POT file"`);
    await exec.exec(`git push`);

    core.info(`The POT file was successfully generated.`);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
